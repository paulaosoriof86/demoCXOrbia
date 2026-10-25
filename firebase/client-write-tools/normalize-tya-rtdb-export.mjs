import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseDir = path.join(__dirname, '..');

const inputPath = process.env.CXORBIA_TYA_EXPORT_PATH || path.join(firebaseDir, 'private-input', 'tya-export-real.json');
const outputDir = process.env.CXORBIA_TYA_OUTPUT_DIR || path.join(firebaseDir, 'private-output');
const outputPath = process.env.CXORBIA_TYA_NORMALIZED_PATH || path.join(outputDir, 'tya-export-normalized-arrays.json');
const reportPath = path.join(outputDir, 'tya-export-normalized-arrays-report.md');

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function asArrayFromMap(value) {
  if (Array.isArray(value)) return value;
  if (!isPlainObject(value)) return [];
  return Object.entries(value).map(([key, data]) => {
    if (isPlainObject(data)) return { id: data.id || key, sourceKey: key, ...data };
    return { id: key, sourceKey: key, valueType: typeof data };
  });
}

function get(root, key) {
  return root && root[key] !== undefined ? root[key] : undefined;
}

function nestedMap(root, key, nestedKey) {
  const parent = get(root, key);
  if (!isPlainObject(parent)) return [];
  if (nestedKey && parent[nestedKey] !== undefined) return asArrayFromMap(parent[nestedKey]);
  const entries = Object.entries(parent);
  if (entries.length === 1 && isPlainObject(entries[0][1])) return asArrayFromMap(entries[0][1]);
  return asArrayFromMap(parent);
}

function rootKeys(root) {
  return isPlainObject(root) ? Object.keys(root) : [];
}

function main() {
  console.log('== Normalización export RTDB T&A a arrays esperados ==');
  console.log('Alcance: archivo local privado; sin Firestore, sin Hosting, sin merge, sin producción.');

  if (!fs.existsSync(inputPath)) throw new Error('No encontré el export: ' + inputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const root = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (!isPlainObject(root)) throw new Error('El export raíz debe ser objeto.');

  const posts = asArrayFromMap(get(root, 'tya_posts'));
  const shoppers = asArrayFromMap(get(root, 'tya_shoppers_extra'));
  const users = asArrayFromMap(get(root, 'tya_users'));
  const notifications = asArrayFromMap(get(root, 'tya_noticias'));
  const financeMovements = nestedMap(root, 'tya_finance', 'movimientos');
  const resources = asArrayFromMap(get(root, 'tya_recursos'));

  const normalized = {
    shoppers,
    visitas_asignadas: posts,
    visitas_realizadas: posts.filter((item) => {
      const text = JSON.stringify(item).toLowerCase();
      return text.includes('realizada') || text.includes('submit') || text.includes('cuestionario') || text.includes('liquid');
    }),
    cuestionarios_marcados: [],
    certificaciones_aprobadas: [],
    clientes: [],
    proyectos: resources,
    liquidaciones: [],
    pagos_lotes: [],
    notificaciones: notifications,
    usuarios: users,
    PROBLEMAS_DETECTADOS: [],
    REGISTROS_DESCARTADOS: [],
    METADATA_EXPORT: {
      normalizedFrom: 'rtdb-object-map',
      generatedAt: new Date().toISOString(),
      rootKeys: rootKeys(root),
      sourceCounts: {
        tya_posts: posts.length,
        tya_shoppers_extra: shoppers.length,
        tya_users: users.length,
        tya_noticias: notifications.length,
        tya_finance_movimientos: financeMovements.length,
        tya_recursos: resources.length
      }
    }
  };

  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2), 'utf8');

  const lines = [];
  lines.push('# Normalización export RTDB T&A');
  lines.push('');
  lines.push('Archivo normalizado local:');
  lines.push('');
  lines.push('```text');
  lines.push(outputPath);
  lines.push('```');
  lines.push('');
  lines.push('## Conteos origen detectados');
  lines.push('');
  for (const [key, value] of Object.entries(normalized.METADATA_EXPORT.sourceCounts)) {
    lines.push(`- ${key}: ${value}`);
  }
  lines.push('');
  lines.push('## Conteos normalizados');
  lines.push('');
  for (const key of ['shoppers', 'visitas_asignadas', 'visitas_realizadas', 'proyectos', 'notificaciones', 'usuarios']) {
    lines.push(`- ${key}: ${Array.isArray(normalized[key]) ? normalized[key].length : 0}`);
  }
  lines.push('');
  lines.push('No se escribió Firestore. No se hizo deploy. No se hizo merge. No se tocó producción.');

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

  console.log('Archivo normalizado:', outputPath);
  console.log('Reporte:', reportPath);
  console.log('Conteos:', JSON.stringify(normalized.METADATA_EXPORT.sourceCounts));
  console.log('Normalización finalizada. No se escribió Firestore.');
}

main();
