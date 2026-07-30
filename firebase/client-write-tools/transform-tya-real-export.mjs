import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseDir = path.join(__dirname, '..');

const APPROVAL_ENV = 'CXORBIA_TYA_TRANSFORM_APPROVED';
const APPROVAL_TOKEN = 'YES_PAULA_TYA_TRANSFORM_DEV';

const inputPath = process.env.CXORBIA_TYA_EXPORT_PATH || path.join(firebaseDir, 'private-input', 'tya-export-real.json');
const outputDir = process.env.CXORBIA_TYA_OUTPUT_DIR || path.join(firebaseDir, 'private-output');
const outputPath = process.env.CXORBIA_TYA_TRANSFORMED_PATH || path.join(outputDir, 'tya-real-transformed-firestore.json');
const reportPath = path.join(outputDir, 'tya-real-transform-report.md');
const contactMode = (process.env.CXORBIA_TYA_CONTACT_MODE || 'omit').toLowerCase();

if (process.env[APPROVAL_ENV] !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorización local para transformar export real T&A.');
  process.exit(1);
}

if (contactMode === 'include' && process.env.CXORBIA_TYA_INCLUDE_CONTACTS_APPROVED !== 'YES_PAULA_INCLUDE_CONTACTS_DEV') {
  console.error('ERROR: contactMode=include requiere autorización separada para contactos reales.');
  process.exit(1);
}

function norm(value) {
  return String(value ?? '').trim();
}

function lower(value) {
  return norm(value).toLowerCase();
}

function upper(value) {
  return norm(value).toUpperCase();
}

function digits(value) {
  return norm(value).replace(/\D+/g, '');
}

function slug(value, fallback = 'item') {
  const clean = lower(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return clean || fallback;
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 12);
}

function stableId(prefix, parts) {
  const base = parts.map(norm).filter(Boolean).join('|');
  return `${prefix}-${hash(base || prefix)}`;
}

function arr(data, keys) {
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && norm(obj[key]) !== '') return obj[key];
  }
  return fallback;
}

function firstName(fullName) {
  return norm(fullName).split(/\s+/)[0] || '';
}

function lastName(fullName) {
  const parts = norm(fullName).split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
}

function dateOnly(value) {
  const text = norm(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return text;
}

function numberValue(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function contactValue(value) {
  const text = norm(value);
  if (!text) return '';
  if (contactMode === 'include') return text;
  if (contactMode === 'mask') return `masked-${hash(text)}`;
  return '';
}

function normalizeCountry(value) {
  const text = upper(value);
  if (['GUATEMALA', 'GT', 'GUA'].includes(text)) return 'GT';
  if (['HONDURAS', 'HN', 'HND'].includes(text)) return 'HN';
  return text || 'GT';
}

function normalizeCurrency(country, value) {
  const text = upper(value);
  if (text) return text;
  return country === 'HN' ? 'L' : 'Q';
}

function normalizeVisitStatus(item) {
  const raw = lower(pick(item, ['estado', 'status', 'estado_visita', 'fase']));
  if (/liquid/.test(raw)) return 'liquidada';
  if (/submit|subm/.test(raw)) return 'submitida';
  if (/cuestionario|question/.test(raw)) return 'cuestionario';
  if (/realiz|hecha|completed/.test(raw)) return 'realizada';
  if (/agend|program/.test(raw)) return 'agendada';
  if (/asign/.test(raw)) return 'asignada';
  if (/postul/.test(raw)) return 'postulada';
  if (/fuera/.test(raw)) return 'fuera_rango';
  if (/disp|open|libre/.test(raw)) return 'disponible';
  return raw || 'disponible';
}

function clientIdFrom(item) {
  const raw = pick(item, ['id', 'clientId', 'accountId', 'codigo', 'nombre', 'name', 'cliente', 'cuenta', 'marca']);
  return raw ? slug(raw, 'cliente') : 'tya-cliente-principal';
}

function projectIdFrom(item, index = 0) {
  const raw = pick(item, ['id', 'projectId', 'project_id', 'codigo', 'nombre', 'name', 'proyecto', 'programa']);
  return raw ? slug(raw, 'proyecto') : `tya-real-proyecto-${index + 1}`;
}

function shopperNatural(item) {
  const explicit = pick(item, ['id', 'shopperId', 'shopper_id', 'codigo', 'code']);
  if (explicit) return norm(explicit);
  const email = lower(pick(item, ['email', 'correo', 'mail']));
  if (email) return 'email:' + email;
  const phone = digits(pick(item, ['phone', 'telefono', 'teléfono', 'celular', 'whatsapp']));
  const country = normalizeCountry(pick(item, ['pais', 'país', 'country']));
  if (phone) return `phone:${country}:${phone}`;
  const name = norm(pick(item, ['nombre', 'name', 'shopper']));
  return name ? `name:${country}:${name}` : stableId('shopper', [JSON.stringify(item)]);
}

function shopperIdFrom(item) {
  const explicit = pick(item, ['id', 'shopperId', 'shopper_id', 'codigo', 'code']);
  if (explicit) return slug(explicit, 'shopper');
  return stableId('shopper', [shopperNatural(item)]);
}

function visitNatural(item) {
  const explicit = pick(item, ['id', 'visitaId', 'visita_id', 'id_visita']);
  if (explicit) return norm(explicit);
  return [
    pick(item, ['proyecto', 'projectId', 'project_id', 'programa']),
    pick(item, ['sucursal', 'branch', 'tienda']),
    normalizeCountry(pick(item, ['pais', 'país', 'country'])),
    pick(item, ['quincena', 'periodo', 'ronda']),
    pick(item, ['escenario', 'scenario']),
    dateOnly(pick(item, ['fecha_asignada', 'fecha', 'agendada', 'fecha_realizada', 'realizada']))
  ].map(norm).filter(Boolean).join('|');
}

function visitIdFrom(item) {
  const explicit = pick(item, ['id', 'visitaId', 'visita_id', 'id_visita']);
  if (explicit) return slug(explicit, 'visita');
  return stableId('visit', [visitNatural(item)]);
}

function mapClients(sourceClients) {
  const map = new Map();
  for (const item of sourceClients) {
    const id = clientIdFrom(item);
    map.set(id, {
      id,
      tenantId: 'tya',
      name: norm(pick(item, ['nombre', 'name', 'cliente', 'cuenta', 'marca'], 'Cliente T&A')),
      displayType: 'cuenta',
      industry: norm(pick(item, ['industria', 'industry', 'giro'], 'Mystery shopping')),
      status: 'real-dev'
    });
  }
  if (!map.size) {
    map.set('tya-cliente-principal', {
      id: 'tya-cliente-principal',
      tenantId: 'tya',
      name: 'Cliente T&A',
      displayType: 'cuenta',
      industry: 'Mystery shopping',
      status: 'real-dev'
    });
  }
  return map;
}

function mapProjects(sourceProjects, clientsMap) {
  const map = new Map();
  const fallbackClientId = clientsMap.keys().next().value || 'tya-cliente-principal';
  sourceProjects.forEach((item, index) => {
    const id = projectIdFrom(item, index);
    const clientId = clientsMap.has(clientIdFrom(item)) ? clientIdFrom(item) : fallbackClientId;
    const countriesRaw = pick(item, ['paises', 'países', 'countries']);
    const countries = Array.isArray(countriesRaw)
      ? countriesRaw.map(normalizeCountry).filter(Boolean)
      : norm(countriesRaw).split(/[,;/]+/).map(normalizeCountry).filter(Boolean);
    map.set(id, {
      id,
      tenantId: 'tya',
      accountId: clientId,
      clientId,
      accountName: clientsMap.get(clientId)?.name || 'Cliente T&A',
      client: clientsMap.get(clientId)?.name || 'Cliente T&A',
      name: norm(pick(item, ['nombre', 'name', 'proyecto', 'programa'], 'Proyecto T&A')),
      industry: norm(pick(item, ['industria', 'industry'], 'Mystery shopping')),
      countries: countries.length ? [...new Set(countries)] : ['GT', 'HN'],
      currency: { GT: 'Q', HN: 'L' },
      accent: '#2196d3',
      sucursales: numberValue(pick(item, ['sucursales', 'branches']), 0),
      honorario: { GT: numberValue(pick(item, ['honorarioGT', 'honorario_gt']), 60), HN: numberValue(pick(item, ['honorarioHN', 'honorario_hn']), 180) },
      boleto: { GT: numberValue(pick(item, ['boletoGT', 'boleto_gt']), 0), HN: numberValue(pick(item, ['boletoHN', 'boleto_hn']), 0) },
      combo: norm(pick(item, ['combo', 'reembolso'], 'Reembolso')),
      comboAmt: { GT: numberValue(pick(item, ['comboGT', 'combo_gt']), 0), HN: numberValue(pick(item, ['comboHN', 'combo_hn']), 0) },
      scenarios: Array.isArray(item.scenarios) ? item.scenarios : [],
      quincenas: ['Quincena 1', 'Quincena 2'],
      canales: ['Tienda física'],
      formato: norm(pick(item, ['formato', 'modelo'], 'Cliente incógnito')),
      ronda: norm(pick(item, ['ronda', 'periodo'], 'Migración real DEV')),
      status: 'real-dev'
    });
  });
  if (!map.size) {
    const clientId = fallbackClientId;
    map.set('tya-real-migracion', {
      id: 'tya-real-migracion',
      tenantId: 'tya',
      accountId: clientId,
      clientId,
      accountName: clientsMap.get(clientId)?.name || 'Cliente T&A',
      client: clientsMap.get(clientId)?.name || 'Cliente T&A',
      name: 'Migración real T&A',
      industry: 'Mystery shopping',
      countries: ['GT', 'HN'],
      currency: { GT: 'Q', HN: 'L' },
      accent: '#2196d3',
      sucursales: 0,
      honorario: { GT: 60, HN: 180 },
      boleto: { GT: 0, HN: 0 },
      combo: 'Reembolso',
      comboAmt: { GT: 0, HN: 0 },
      scenarios: [],
      quincenas: ['Quincena 1', 'Quincena 2'],
      canales: ['Tienda física'],
      formato: 'Cliente incógnito',
      ronda: 'Migración real DEV',
      status: 'real-dev'
    });
  }
  return map;
}

function mapShoppers(sourceShoppers) {
  const map = new Map();
  for (const item of sourceShoppers) {
    const id = shopperIdFrom(item);
    const nombre = norm(pick(item, ['nombre', 'name', 'shopper'], 'Shopper T&A'));
    const country = normalizeCountry(pick(item, ['pais', 'país', 'country']));
    map.set(id, {
      id,
      tenantId: 'tya',
      code: norm(pick(item, ['code', 'codigo', 'código'], id.toUpperCase().slice(0, 12))),
      nombre,
      firstName: norm(pick(item, ['firstName', 'nombre1'], firstName(nombre))),
      lastName: norm(pick(item, ['lastName', 'apellido'], lastName(nombre))),
      pais: country,
      ciudad: norm(pick(item, ['ciudad', 'city'])),
      estado: norm(pick(item, ['estado', 'status'], 'Activo')),
      rating: numberValue(pick(item, ['rating', 'calificacion', 'calificación']), 4.5),
      perfilCompleto: Boolean(item.perfilCompleto ?? item.perfil_completo ?? true),
      email: contactValue(pick(item, ['email', 'correo', 'mail'])),
      phone: contactValue(pick(item, ['phone', 'telefono', 'teléfono', 'celular', 'whatsapp'])),
      migratedFrom: 'tya-real-export'
    });
  }
  return map;
}

function inferProjectId(item, projectsMap) {
  const raw = pick(item, ['projectId', 'project_id', 'proyectoId', 'proyecto_id', 'proyecto', 'programa']);
  if (raw) {
    const direct = slug(raw, 'proyecto');
    if (projectsMap.has(direct)) return direct;
    const found = [...projectsMap.values()].find((project) => lower(project.name) === lower(raw));
    if (found) return found.id;
  }
  return projectsMap.keys().next().value || 'tya-real-migracion';
}

function inferShopperId(item, shoppersMap) {
  const raw = pick(item, ['shopperId', 'shopper_id', 'evaluadorId', 'evaluador_id', 'codigo_shopper', 'code']);
  if (raw) {
    const direct = slug(raw, 'shopper');
    if (shoppersMap.has(direct)) return direct;
  }
  const email = lower(pick(item, ['email', 'correo', 'mail', 'shopperEmail']));
  if (email) {
    const found = [...shoppersMap.values()].find((shopper) => lower(shopper.email) === lower(contactValue(email)) || lower(shopper.nombre) === lower(pick(item, ['shopper', 'evaluador', 'nombre'])));
    if (found) return found.id;
  }
  const name = lower(pick(item, ['shopper', 'evaluador', 'nombre']));
  if (name) {
    const found = [...shoppersMap.values()].find((shopper) => lower(shopper.nombre) === name);
    if (found) return found.id;
  }
  return null;
}

function mapVisit(item, projectsMap, clientsMap, shoppersMap) {
  const projectId = inferProjectId(item, projectsMap);
  const project = projectsMap.get(projectId) || [...projectsMap.values()][0];
  const clientId = project?.clientId || clientsMap.keys().next().value || 'tya-cliente-principal';
  const country = normalizeCountry(pick(item, ['pais', 'país', 'country']));
  const shopperId = inferShopperId(item, shoppersMap);
  const shopper = shopperId ? shoppersMap.get(shopperId) : null;
  return {
    id: visitIdFrom(item),
    tenantId: 'tya',
    accountId: clientId,
    clientId,
    projectId,
    num: numberValue(pick(item, ['num', 'numero', 'número']), 0),
    sucursal: norm(pick(item, ['sucursal', 'branch', 'tienda'], 'Sucursal sin nombre')),
    ciudad: norm(pick(item, ['ciudad', 'city'])),
    pais: country,
    currency: normalizeCurrency(country, pick(item, ['currency', 'moneda'])),
    quincena: norm(pick(item, ['quincena', 'periodo'], 'Quincena 1')),
    escenario: norm(pick(item, ['escenario', 'scenario'], 'Cliente incógnito')),
    franja: norm(pick(item, ['franja', 'dia', 'día'], 'Semana')),
    franjaCode: norm(pick(item, ['franjaCode', 'franja_code'], lower(pick(item, ['franja'])).includes('fin') ? 'WKND' : 'WK')),
    canal: norm(pick(item, ['canal', 'channel'], 'Tienda física')),
    formato: norm(pick(item, ['formato'], project?.formato || 'Cliente incógnito')),
    honorario: numberValue(pick(item, ['honorario', 'fee']), country === 'HN' ? 180 : 60),
    boleto: numberValue(pick(item, ['boleto', 'ticket']), 0),
    combo: norm(pick(item, ['combo', 'reembolso'], project?.combo || 'Reembolso')),
    comboAmt: numberValue(pick(item, ['comboAmt', 'combo_amt', 'monto_combo']), 0),
    estado: normalizeVisitStatus(item),
    shopperId,
    shopper: shopper?.nombre || norm(pick(item, ['shopper', 'evaluador'])),
    shopperCode: shopper?.code || norm(pick(item, ['shopperCode', 'codigo_shopper'])),
    rango: norm(pick(item, ['rango', 'ronda'], project?.ronda || 'Migración real DEV')),
    disponibleDesde: dateOnly(pick(item, ['disponibleDesde', 'disponible_desde', 'fecha_disponible'])),
    agendada: dateOnly(pick(item, ['agendada', 'fecha_agendada', 'fecha_asignada'])),
    realizada: dateOnly(pick(item, ['realizada', 'fecha_realizada'])),
    cuestFecha: dateOnly(pick(item, ['cuestFecha', 'fecha_cuestionario', 'fecha_submit', 'submitido'])),
    submit: Boolean(item.submit || item.submitido || item.submitted),
    migratedFrom: 'tya-real-export'
  };
}

function mapPostulation(item, visit, shoppersMap) {
  const shopperId = visit?.shopperId || inferShopperId(item, shoppersMap);
  const shopper = shopperId ? shoppersMap.get(shopperId) : null;
  return {
    id: stableId('post', [visit?.id, shopperId, pick(item, ['fechaProp', 'fecha', 'fecha_postulacion'])]),
    tenantId: 'tya',
    accountId: visit?.accountId,
    clientId: visit?.clientId,
    visitaId: visit?.id,
    projectId: visit?.projectId,
    shopperId,
    shopper: shopper?.nombre || visit?.shopper || '',
    shopperCode: shopper?.code || visit?.shopperCode || '',
    sucursal: visit?.sucursal || '',
    ciudad: visit?.ciudad || '',
    pais: visit?.pais || '',
    quincena: visit?.quincena || '',
    franjaCode: visit?.franjaCode || '',
    honorario: visit?.honorario || 0,
    boleto: visit?.boleto || 0,
    comboAmt: visit?.comboAmt || 0,
    currency: visit?.currency || '',
    fechaProp: dateOnly(pick(item, ['fechaProp', 'fecha', 'fecha_postulacion'], visit?.agendada || visit?.disponibleDesde)),
    disponibleDesde: visit?.disponibleDesde || null,
    estado: norm(pick(item, ['estado', 'status'], 'aprobada')),
    aprobadaPor: norm(pick(item, ['aprobadaPor', 'aprobada_por'], 'Migración')),
    reprog: Boolean(item.reprog || item.reprogramada),
    migratedFrom: 'tya-real-export'
  };
}

function main() {
  console.log('== Transformación local export real T&A a modelo Firestore ==');
  console.log('Alcance: escribe solo archivo local gitignored; sin Firestore, sin Hosting, sin merge, sin producción.');

  if (!fs.existsSync(inputPath)) throw new Error('No encontré export: ' + inputPath);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  fs.mkdirSync(outputDir, { recursive: true });

  const clientsMap = mapClients(arr(data, ['clientes', 'clients']));
  const projectsMap = mapProjects(arr(data, ['proyectos', 'projects']), clientsMap);
  const shoppersMap = mapShoppers(arr(data, ['shoppers', 'evaluadores']));

  const visitMap = new Map();
  for (const item of arr(data, ['visitas_asignadas', 'visitas', 'visits'])) {
    const visit = mapVisit(item, projectsMap, clientsMap, shoppersMap);
    visitMap.set(visit.id, visit);
  }
  for (const item of arr(data, ['visitas_realizadas', 'completed_visits'])) {
    const visit = mapVisit(item, projectsMap, clientsMap, shoppersMap);
    const prev = visitMap.get(visit.id) || {};
    visitMap.set(visit.id, { ...prev, ...visit, estado: visit.estado === 'disponible' ? (prev.estado || 'realizada') : visit.estado });
  }

  const visits = [...visitMap.values()];
  const postulations = arr(data, ['postulaciones', 'postulations']).map((item) => {
    const visitId = slug(pick(item, ['visitaId', 'visita_id', 'id_visita']), 'visita');
    const visit = visitMap.get(visitId) || visits.find((v) => v.id === visitId) || null;
    return mapPostulation(item, visit, shoppersMap);
  }).filter((p) => p.visitaId && p.projectId);

  const postKeys = new Set(postulations.map((p) => `${p.visitaId}|${p.shopperId}`));
  for (const visit of visits) {
    if (visit.shopperId && ['postulada', 'asignada', 'agendada', 'realizada', 'cuestionario', 'submitida', 'liquidada'].includes(visit.estado)) {
      const key = `${visit.id}|${visit.shopperId}`;
      if (!postKeys.has(key)) {
        postulations.push(mapPostulation({}, visit, shoppersMap));
        postKeys.add(key);
      }
    }
  }

  const questionnaires = arr(data, ['cuestionarios_marcados', 'questionnaires']).map((item) => {
    const visitId = slug(pick(item, ['visitaId', 'visita_id', 'id_visita']), 'visit');
    const visit = visitMap.get(visitId) || null;
    const projectId = visit?.projectId || inferProjectId(item, projectsMap);
    return {
      id: stableId('questionnaire', [visitId, pick(item, ['fecha', 'fecha_submit', 'submitido'])]),
      tenantId: 'tya',
      accountId: visit?.accountId,
      clientId: visit?.clientId,
      projectId,
      visitaId: visitId,
      shopperId: visit?.shopperId || inferShopperId(item, shoppersMap),
      fecha: dateOnly(pick(item, ['fecha', 'fecha_submit', 'submitido'])),
      score: numberValue(pick(item, ['score', 'calificacion', 'calificación']), 0),
      estado: norm(pick(item, ['estado', 'status'], 'marcado')),
      migratedFrom: 'tya-real-export'
    };
  }).filter((q) => q.projectId);

  const transformed = {
    tenant: {
      id: 'tya',
      name: 'T&A Consultores',
      type: 'consultoraTenant',
      status: 'real-dev',
      countryBase: 'GT',
      createdFrom: 'tya-real-export'
    },
    clients: [...clientsMap.values()],
    projects: [...projectsMap.values()],
    shoppers: [...shoppersMap.values()],
    visits,
    postulations,
    questionnaires,
    certifications: arr(data, ['certificaciones_aprobadas', 'certifications']),
    liquidations: arr(data, ['liquidaciones', 'liquidations']),
    lots: arr(data, ['pagos_lotes', 'payment_batches', 'lots']),
    notifications: arr(data, ['notificaciones', 'notifications']),
    users: arr(data, ['usuarios', 'users']),
    migrationMeta: {
      generatedAt: new Date().toISOString(),
      contactMode,
      source: 'tya-real-export',
      rawCounts: {
        shoppers: arr(data, ['shoppers', 'evaluadores']).length,
        clientes: arr(data, ['clientes', 'clients']).length,
        proyectos: arr(data, ['proyectos', 'projects']).length,
        visitas_asignadas: arr(data, ['visitas_asignadas', 'visitas', 'visits']).length,
        visitas_realizadas: arr(data, ['visitas_realizadas', 'completed_visits']).length,
        cuestionarios_marcados: arr(data, ['cuestionarios_marcados', 'questionnaires']).length
      }
    }
  };

  fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf8');

  const lines = [
    '# Transformación export real T&A',
    '',
    `Fecha: ${transformed.migrationMeta.generatedAt}`,
    `Contact mode: ${contactMode}`,
    '',
    '## Conteos transformados',
    '',
    `- clients: ${transformed.clients.length}`,
    `- projects: ${transformed.projects.length}`,
    `- shoppers: ${transformed.shoppers.length}`,
    `- visits: ${transformed.visits.length}`,
    `- postulations: ${transformed.postulations.length}`,
    `- questionnaires: ${transformed.questionnaires.length}`,
    `- certifications: ${transformed.certifications.length}`,
    `- liquidations: ${transformed.liquidations.length}`,
    `- lots: ${transformed.lots.length}`,
    `- notifications: ${transformed.notifications.length}`,
    '',
    'Archivo transformado local gitignored:',
    '',
    '```text',
    outputPath,
    '```',
    '',
    'No se escribió Firestore.'
  ];
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

  console.log('Archivo transformado:', outputPath);
  console.log('Reporte:', reportPath);
  console.log('Conteos transformados:', JSON.stringify({
    clients: transformed.clients.length,
    projects: transformed.projects.length,
    shoppers: transformed.shoppers.length,
    visits: transformed.visits.length,
    postulations: transformed.postulations.length,
    questionnaires: transformed.questionnaires.length
  }));
  console.log('Transformación finalizada. No se escribió Firestore.');
}

main();
