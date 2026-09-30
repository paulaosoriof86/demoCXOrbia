const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const XLSX = require("xlsx");

const xlsxPath = process.env.CXORBIA_HR_XLSX_PATH;
const outJson = process.env.CXORBIA_HR_OUT_JSON;
const reportPath = process.env.CXORBIA_HR_REPORT_PATH;

if (!xlsxPath || !fs.existsSync(xlsxPath)) {
  throw new Error("No encontré XLSX: " + xlsxPath);
}

function norm(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function slug(value) {
  return norm(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sin-dato";
}

function hash(value, len = 14) {
  return crypto.createHash("sha1").update(String(value ?? ""), "utf8").digest("hex").slice(0, len);
}

function findCol(headers, patterns) {
  const normalized = headers.map(norm);
  for (const pattern of patterns) {
    const re = new RegExp(pattern, "i");
    const idx = normalized.findIndex((h) => re.test(h));
    if (idx >= 0) return idx;
  }
  return -1;
}

function cell(row, idx) {
  if (idx < 0) return "";
  return String(row[idx] ?? "").trim();
}

function filled(value) {
  return String(value ?? "").trim() !== "";
}

function yes(value) {
  const s = norm(value).toUpperCase();
  return ["SI", "SÍ", "YES", "TRUE", "1"].includes(s);
}

function parseDate(value) {
  const s = String(value ?? "").trim();
  if (!s) return null;

  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (n > 30000 && n < 70000) {
      const d = new Date(Date.UTC(1899, 11, 30));
      d.setUTCDate(d.getUTCDate() + Math.floor(n));
      return d.toISOString().slice(0, 10);
    }
  }

  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const dd = dmy[1].padStart(2, "0");
    const mm = dmy[2].padStart(2, "0");
    return `${dmy[3]}-${mm}-${dd}`;
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);

  return null;
}

function monthKey(value) {
  const d = parseDate(value);
  return d ? d.slice(0, 7) : "__SIN_FECHA__";
}

function inc(map, key, n = 1) {
  const k = filled(key) ? String(key).trim() : "__VACIO__";
  map[k] = (map[k] || 0) + n;
}

function estadoFrom(data) {
  if (data.liquidado) return "liquidada";
  if (data.fechaSubmitido) return "submitida";
  if (data.fechaCuestionario) return "cuestionario_realizado";
  if (data.fechaRealizada) return "realizada";
  if (data.fechaProgramada) return "agendada";
  if (data.shopperName) return "asignada";
  return "disponible";
}

const workbook = XLSX.readFile(xlsxPath, { raw: false, cellDates: false });

const tenantId = "tya";
const clientId = "cinepolis";

const clients = [{
  id: clientId,
  tenantId,
  name: "Cinepolis",
  source: "hr-tya-historico-sync"
}];

const projects = [];
const shoppersMap = new Map();
const visits = [];
const questionnaires = [];
const liquidations = [];

const totals = {
  byCountry: {},
  byEstado: {},
  byMonthRealizada: {},
  byMonthCuestionario: {},
  byMonthSubmitido: {},
  bySheet: []
};

for (const sheetName of workbook.SheetNames) {
  if (/dashboard/i.test(sheetName)) continue;

  const ws = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false
  });

  if (!rows || rows.length < 2) continue;

  const headers = rows[0].map((x) => String(x ?? "").trim());

  const cols = {
    pais: findCol(headers, ["^pais$", "pais"]),
    idCinema: findCol(headers, ["id cinema", "cinema"]),
    ciudad: findCol(headers, ["ciudad"]),
    direccion: findCol(headers, ["direccion"]),
    sucursal: findCol(headers, ["shopping", "sucursal"]),
    franja: findCol(headers, ["franja"]),
    formato: findCol(headers, ["formato"]),
    combo: findCol(headers, ["tipo de combo", "combo"]),
    compra: findCol(headers, ["tipo de compra", "compra"]),
    pago: findCol(headers, ["metodo de pago", "pago"]),
    quincena: findCol(headers, ["quincena"]),
    shopper: findCol(headers, ["shopper"]),
    telefono: findCol(headers, ["telefono", "teléfono"]),
    mail: findCol(headers, ["mail", "correo", "email"]),
    programada: findCol(headers, ["fecha programada"]),
    realizada: findCol(headers, ["fecha realizada"]),
    cuestionario: findCol(headers, ["cuestionario"]),
    boleto: findCol(headers, ["precio de boleto", "boleto"]),
    comboPrecio: findCol(headers, ["precio de combo"]),
    encuesta: findCol(headers, ["encuesta"]),
    honorarios: findCol(headers, ["honorarios"]),
    revisor: findCol(headers, ["revisor"]),
    submitido: findCol(headers, ["submit"]),
    liquidado: findCol(headers, ["liquidado"]),
    disponibleDesde: findCol(headers, ["disponible"])
  };

  const sheetIsHN = /\bHN\b/i.test(sheetName);
  const sheetCountry = sheetIsHN ? "HN" : "GT";
  const projectId = `cinepolis-${slug(sheetName)}`;

  projects.push({
    id: projectId,
    tenantId,
    clientId,
    name: `Cinepolis ${sheetName}`,
    country: sheetCountry,
    source: "hr-tya-historico-sync",
    sourceSheet: sheetName,
    status: "active"
  });

  const stats = {
    sheet: sheetName,
    projectId,
    filas: 0,
    asignadas: 0,
    agendadas: 0,
    realizadas: 0,
    cuestionarios: 0,
    submitidas: 0,
    liquidadas: 0,
    hasDisponibleDesde: cols.disponibleDesde >= 0
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    const paisRaw = cell(row, cols.pais);
    const idCinema = cell(row, cols.idCinema);
    const sucursal = cell(row, cols.sucursal);

    if (!filled(paisRaw) && !filled(idCinema) && !filled(sucursal)) continue;

    const country = sheetIsHN || /honduras/i.test(paisRaw) ? "HN" : "GT";
    const pais = filled(paisRaw) ? paisRaw : (country === "HN" ? "Honduras" : "Guatemala");

    const shopperName = cell(row, cols.shopper);
    const shopperId = shopperName ? `shp-${hash(`${country}|${norm(shopperName)}`, 12)}` : "";

    if (shopperName && !shoppersMap.has(shopperId)) {
      shoppersMap.set(shopperId, {
        id: shopperId,
        tenantId,
        displayName: shopperName,
        country,
        source: "hr-tya-historico-sync",
        phoneOmitted: filled(cell(row, cols.telefono)),
        emailOmitted: filled(cell(row, cols.mail)),
        documentsOmitted: true
      });
    }

    const fechaProgramada = parseDate(cell(row, cols.programada));
    const fechaRealizada = parseDate(cell(row, cols.realizada));
    const fechaCuestionario = parseDate(cell(row, cols.cuestionario));
    const fechaSubmitido = parseDate(cell(row, cols.submitido));
    const disponibleDesde = parseDate(cell(row, cols.disponibleDesde));
    const liquidado = yes(cell(row, cols.liquidado));

    const estado = estadoFrom({
      shopperName,
      fechaProgramada,
      fechaRealizada,
      fechaCuestionario,
      fechaSubmitido,
      liquidado
    });

    const numeroEncuesta = cell(row, cols.encuesta);
    const visitId = `hr-${hash(`${sheetName}|${country}|${idCinema}|${sucursal}|${numeroEncuesta}|${i}`, 16)}`;

    const visit = {
      id: visitId,
      tenantId,
      clientId,
      projectId,
      source: "hr-tya-historico-sync",
      sourceSheet: sheetName,
      sourceRow: i + 1,
      country,
      pais,
      idCinema,
      ciudad: cell(row, cols.ciudad),
      direccion: cell(row, cols.direccion),
      sucursal,
      franja: cell(row, cols.franja),
      formato: cell(row, cols.formato),
      tipoCombo: cell(row, cols.combo),
      tipoCompra: cell(row, cols.compra),
      metodoPago: cell(row, cols.pago),
      quincena: cell(row, cols.quincena),
      shopperId,
      shopperName,
      fechaProgramada,
      fechaRealizada,
      fechaCuestionario,
      fechaSubmitido,
      disponibleDesde,
      estado,
      liquidado,
      numeroEncuesta,
      precioBoleto: cell(row, cols.boleto),
      precioCombo: cell(row, cols.comboPrecio),
      honorarios: cell(row, cols.honorarios),
      revisor: cell(row, cols.revisor),
      phoneOmitted: filled(cell(row, cols.telefono)),
      emailOmitted: filled(cell(row, cols.mail)),
      documentsOmitted: true,
      evidenceOmitted: true,
      notesOmitted: true
    };

    visits.push(visit);

    stats.filas += 1;
    if (shopperName) stats.asignadas += 1;
    if (fechaProgramada) stats.agendadas += 1;
    if (fechaRealizada) stats.realizadas += 1;
    if (fechaCuestionario) stats.cuestionarios += 1;
    if (fechaSubmitido) stats.submitidas += 1;
    if (liquidado) stats.liquidadas += 1;

    inc(totals.byCountry, country);
    inc(totals.byEstado, estado);
    inc(totals.byMonthRealizada, monthKey(cell(row, cols.realizada)));
    inc(totals.byMonthCuestionario, monthKey(cell(row, cols.cuestionario)));
    inc(totals.byMonthSubmitido, monthKey(cell(row, cols.submitido)));

    if (fechaCuestionario) {
      questionnaires.push({
        id: `q-${visitId}`,
        tenantId,
        clientId,
        projectId,
        visitId,
        shopperId,
        completedAt: fechaCuestionario,
        status: "completed",
        source: "hr-tya-historico-sync",
        sourceSheet: sheetName
      });
    }

    if (liquidado) {
      liquidations.push({
        id: `liq-${visitId}`,
        tenantId,
        clientId,
        projectId,
        visitId,
        shopperId,
        status: "paid",
        source: "hr-tya-historico-sync",
        sourceSheet: sheetName
      });
    }
  }

  totals.bySheet.push(stats);
}

const shoppers = Array.from(shoppersMap.values());

const output = {
  tenantId,
  clients,
  projects,
  shoppers,
  visits,
  questionnaires,
  liquidations,
  certifications: [],
  metadata: {
    generatedAt: new Date().toISOString(),
    sourceFile: xlsxPath,
    privacy: "phones_emails_documents_evidence_notes_omitted"
  }
};

fs.writeFileSync(outJson, JSON.stringify(output, null, 2), "utf8");

const lines = [];
lines.push("# Transformacion HR historico T&A multihoja V2");
lines.push("");
lines.push("Este reporte no imprime shoppers, telefonos, correos, documentos, evidencias ni observaciones.");
lines.push("");
lines.push("## Archivo JSON local");
lines.push("");
lines.push("```text");
lines.push(outJson);
lines.push("```");
lines.push("");
lines.push("## Totales transformados");
lines.push("");
lines.push(`- clients: ${clients.length}`);
lines.push(`- projects: ${projects.length}`);
lines.push(`- shoppers: ${shoppers.length}`);
lines.push(`- visits: ${visits.length}`);
lines.push(`- questionnaires: ${questionnaires.length}`);
lines.push(`- liquidations: ${liquidations.length}`);
lines.push(`- certifications: 0`);
lines.push("");
lines.push("## Visitas por pais");
lines.push("");
Object.entries(totals.byCountry).sort().forEach(([k, v]) => lines.push(`- ${k}: ${v}`));
lines.push("");
lines.push("## Visitas por estado");
lines.push("");
Object.entries(totals.byEstado).sort().forEach(([k, v]) => lines.push(`- ${k}: ${v}`));
lines.push("");
lines.push("## Meses por fecha realizada");
lines.push("");
Object.entries(totals.byMonthRealizada).sort().forEach(([k, v]) => lines.push(`- ${k}: ${v}`));
lines.push("");
lines.push("## Hojas transformadas");
lines.push("");
totals.bySheet.forEach((s) => {
  lines.push(`### ${s.sheet}`);
  lines.push(`- projectId: ${s.projectId}`);
  lines.push(`- filas: ${s.filas}`);
  lines.push(`- asignadas: ${s.asignadas}`);
  lines.push(`- agendadas: ${s.agendadas}`);
  lines.push(`- realizadas: ${s.realizadas}`);
  lines.push(`- cuestionarios: ${s.cuestionarios}`);
  lines.push(`- submitidas: ${s.submitidas}`);
  lines.push(`- liquidadas: ${s.liquidadas}`);
  lines.push(`- tiene disponible desde: ${s.hasDisponibleDesde}`);
  lines.push("");
});
lines.push("## Privacidad");
lines.push("");
lines.push("- Telefonos omitidos.");
lines.push("- Correos omitidos.");
lines.push("- Documentos omitidos.");
lines.push("- Evidencias omitidas.");
lines.push("- Observaciones omitidas.");
lines.push("");
lines.push("## Estado");
lines.push("");
lines.push("No se escribio Firestore. No se hizo deploy. No se hizo merge. No se toco produccion. No se modifico app/modules.");

fs.writeFileSync(reportPath, lines.join("\n"), "utf8");

console.log(lines.slice(0, 260).join("\n"));
