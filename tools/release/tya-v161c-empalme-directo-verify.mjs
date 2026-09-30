import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const manifestPath = resolve(root, 'app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const failures = [];
const lines = [];

for (const entry of manifest.files) {
  const filePath = resolve(root, entry.path);
  let data;
  try {
    data = readFileSync(filePath);
  } catch (error) {
    failures.push({ path: entry.path, error: error.code || error.message });
    continue;
  }
  const actual = createHash('sha256').update(data).digest('hex');
  lines.push(`${actual}  ${entry.path}`);
  if (actual !== entry.sha256) {
    failures.push({ path: entry.path, expected: entry.sha256, actual });
  }
}

const aggregate = createHash('sha256').update(lines.join('\n'), 'utf8').digest('hex');
if (aggregate !== manifest.aggregateSha256) {
  failures.push({ path: '<aggregate>', expected: manifest.aggregateSha256, actual: aggregate });
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, manifest: manifestPath, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  version: manifest.version,
  fileCount: manifest.fileCount,
  aggregateSha256: manifest.aggregateSha256
}, null, 2));
