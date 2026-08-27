import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseDir = path.join(__dirname, '..');

const inputPath = process.env.CXORBIA_TYA_EXPORT_PATH || path.join(firebaseDir, 'private-input', 'tya-export-real.json');
const outputDir = process.env.CXORBIA_TYA_REPORT_DIR || path.join(firebaseDir, 'private-output');

const EXPECTED_ARRAYS = [
  'shoppers',
  'visitas_asignadas',
  'visitas_realizadas',
  'cuestionarios_marcados',
  'certificaciones_aprobadas',
  'clientes',
  'proyectos',
  'liquidaciones',
  'pagos_lotes',
  'notificaciones',
  'usuarios'
];

const OPTIONAL_SECTIONS = [
  'PROBLEMAS_DETECTADOS',
  'REGISTROS_DESCARTADOS',
  'METADATA_EXPORT'
];

function sha(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function norm(value) {
  return String(value ?? '').trim();
}

function lower(value) {
  return norm(value).toLowerCase();
}

function digits(value) {
  return norm(value).replace(/\D+/g, '');
}

function arr(data, key) {
  return Array.isArray(data[key]) ? data[key] : [];
}

function compact(parts) {
  return parts.map(norm).filter(Boolean).join('|');
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && norm(obj[key]) !== '') return obj[key];
  }
  return '';
}

function naturalShopper(item) {
  const email = lower(pick(item, ['email', 'correo', 'mail']));
  if (email) return 'email:' + email;
  const phone = digits(pick(item, ['phone', 'telefono', 'teléfono', 'celular', 'whatsapp']));
  const country = upper(pick(item, ['pais', 'país', 'country']));
  if (phone) return compact(['phone', country, phone]);
  const doc = digits(pick(item, ['documento', 'dpi', 'identificacion', 'identificación', 'id_number']));
  if (doc) return compact(['doc', country, doc]);
  return '';
}

function upper(value) {
  return norm(value).toUpperCase();
}

function naturalVisit(item) {
  const id = pick(item, ['id', 'visitaId', 'visita_id', 'id_visita']);
  if (id) return 'id:' + norm(id);
  return compact([
    pick(item, ['proyecto', 'projectId', 'project_id', 'programa']),
    pick(item, ['sucursal', 'branch', 'tienda']),
    pick(item, ['pais', 'país', 'country']),
    pick(item, ['quincena', 'periodo', 'ronda']),
    pick(item, ['escenario', 'scenario']),
    pick(item, ['fecha', 'fecha_asignada', 'fecha_realizada', 'agendada', 'realizada'])
  ]);
}

function naturalProject(item) {
  const id = pick(item, ['id', 'projectId', 'project_id', 'codigo']);
  if (id) return 'id:' + norm(id);
  return compact([
    pick(item, ['nombre', 'name', 'proyecto', 'programa']),
    pick(item, ['cliente', 'clientId', 'accountId', 'cuenta'])
  ]);
}

function naturalClient(item) {
  const id = pick(item, ['id', 'clientId', 'accountId', 'codigo']);
  if (id) return 'id:' + norm(id);
  return lower(pick(item, ['nombre', 'name', 'cliente', 'cuenta', 'marca']));
}

function duplicateReport(items, keyFn) {
  const seen = new Map();
  const duplicates = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    const hash = sha(key);
    const count = seen.get(hash) || 0;
    seen.set(hash, count + 1);
    if (count === 1) duplicates.push(hash);
  }
  return { uniqueKeys: seen.size, duplicateKeys: duplicates.length, duplicateHashes: duplicates.slice(0, 25) };
}

function isDateLikeKey(key) {
  return /fecha|date|agendada|realizada|submit|aprobacion|aprobación|vigencia/i.test(key);
}

function invalidDateCount(items) {
  let total = 0;
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    for (const [key, value] of Object.entries(item)) {
      if (!isDateLikeKey(key) || value === null || value === undefined || norm(value) === '') continue;
      const text = norm(value);
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) continue;
      if (/^\d{4}-\d{2}-\d{2}T/.test(text)) continue;
      if (!Number.isNaN(Date.parse(text))) continue;
      total += 1;
    }
  }
  return total;
}

function sensitiveFieldCounts(items) {
  const flags = {
    bank: /banco|cuenta|iban|ach|swift|banc/i,
    document: /dpi|documento|identificacion|identificación|pasaporte|nit/i,
    nda: /nda|confidencial/i,
    evidence: /evidencia|foto|video|audio|archivo|file|url/i
  };
  const counts = Object.fromEntries(Object.keys(flags).map((key) => [key, 0]));
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    for (const [key, value] of Object.entries(item)) {
      if (value === null || value === undefined || norm(value) === '') continue;
      for (const [flag, regex] of Object.entries(flags)) {
        if (regex.test(key)) counts[flag] += 1;
      }
    }
  }
  return counts;
}

function summarizeArray(name, items) {
  return {
    name,
    count: items.length,
    invalidDateFields: invalidDateCount(items),
    sensitiveFieldCounts: sensitiveFieldCounts(items)
  };
}

function writeReports(report) {
  fs.mkdirSync(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, 'tya-real-export-validation-report.json');
  const mdPath = path.join(outputDir, 'tya-real-export-validation-report.md');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const lines = [];
  lines.push('# Resultado validación export real T&A');
  lines.push('');
  lines.push(`Fecha: ${report.generatedAt}`);
  lines.push(`Archivo: ${report.inputPath}`);
  lines.push('');
  lines.push('## Conteos');
  lines.push('');
  for (const [key, value] of Object.entries(report.counts)) lines.push(`- ${key}: ${value}`);
  lines.push('');
  lines.push('## Calidad');
  lines.push('');
  lines.push(`- BOM UTF-8 detectado: ${report.encoding.hasBom ? 'sí' : 'no'}`);
  lines.push(`- Arrays esperados faltantes: ${report.missingExpectedArrays.length ? report.missingExpectedArrays.join(', ') : 'ninguno'}`);
  lines.push(`- Secciones opcionales faltantes: ${report.missingOptionalSections.length ? report.missingOptionalSections.join(', ') : 'ninguna'}`);
  lines.push('');
  lines.push('## Duplicados por llave natural');
  lines.push('');
  for (const [key, value] of Object.entries(report.duplicates)) {
    lines.push(`- ${key}: ${value.duplicateKeys} duplicados; ${value.uniqueKeys} llaves únicas`);
  }
  lines.push('');
  lines.push('## Advertencias');
  lines.push('');
  if (report.warnings.length) report.warnings.forEach((warning) => lines.push(`- ${warning}`));
  else lines.push('- Ninguna advertencia bloqueante detectada.');
  lines.push('');
  lines.push('No se imprimen datos personales en este reporte.');

  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
  return { jsonPath, mdPath };
}

function main() {
  console.log('== Validación local export real T&A ==');
  console.log('Alcance: lectura local y reporte sin PII; sin escritura Firestore, sin Hosting, sin merge, sin producción.');

  if (!fs.existsSync(inputPath)) {
    throw new Error('No encontré el export. Ruta esperada: ' + inputPath);
  }

  const buffer = fs.readFileSync(inputPath);
  const hasBom = buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  if (hasBom) throw new Error('El export tiene BOM. Debe guardarse como UTF-8 sin BOM antes de migrar.');

  const text = buffer.toString('utf8');
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('El export debe ser un objeto JSON con colecciones en arrays.');

  const counts = {};
  const summaries = {};
  for (const key of EXPECTED_ARRAYS) {
    counts[key] = arr(data, key).length;
    summaries[key] = summarizeArray(key, arr(data, key));
  }

  const missingExpectedArrays = EXPECTED_ARRAYS.filter((key) => !Array.isArray(data[key]));
  const missingOptionalSections = OPTIONAL_SECTIONS.filter((key) => data[key] === undefined);
  const warnings = [];

  if (!counts.shoppers) warnings.push('No se encontraron shoppers.');
  if (!counts.proyectos) warnings.push('No se encontraron proyectos.');
  if (!counts.visitas_asignadas && !counts.visitas_realizadas) warnings.push('No se encontraron visitas asignadas ni realizadas.');
  if (missingExpectedArrays.length) warnings.push('Hay colecciones esperadas que no vienen como array.');

  const allItems = EXPECTED_ARRAYS.flatMap((key) => arr(data, key));
  const sensitiveTotals = sensitiveFieldCounts(allItems);
  if (sensitiveTotals.bank) warnings.push('El export contiene campos con apariencia bancaria. No deben cargarse en claro.');
  if (sensitiveTotals.document) warnings.push('El export contiene campos de documento/identificación. No deben cargarse en claro.');
  if (sensitiveTotals.nda) warnings.push('El export contiene campos NDA/confidenciales. No cargarlos hasta reglas y cifrado.');
  if (sensitiveTotals.evidence) warnings.push('El export contiene campos de evidencias/archivos. Storage sigue pendiente por Blaze.');

  const report = {
    generatedAt: new Date().toISOString(),
    inputPath,
    encoding: { utf8Assumed: true, hasBom },
    counts,
    missingExpectedArrays,
    missingOptionalSections,
    summaries,
    duplicates: {
      shoppers: duplicateReport(arr(data, 'shoppers'), naturalShopper),
      proyectos: duplicateReport(arr(data, 'proyectos'), naturalProject),
      clientes: duplicateReport(arr(data, 'clientes'), naturalClient),
      visitas_asignadas: duplicateReport(arr(data, 'visitas_asignadas'), naturalVisit),
      visitas_realizadas: duplicateReport(arr(data, 'visitas_realizadas'), naturalVisit)
    },
    sensitiveTotals,
    warnings
  };

  const written = writeReports(report);
  console.log('== Conteos export real T&A ==');
  for (const [key, value] of Object.entries(counts)) console.log(`${key}: ${value}`);
  console.log('Advertencias:', warnings.length);
  console.log('Reporte JSON:', written.jsonPath);
  console.log('Reporte MD:', written.mdPath);
  console.log('Validación local terminada. No se escribió Firestore.');
}

try {
  main();
} catch (error) {
  console.error('== ERROR validación export real T&A ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
