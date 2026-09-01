#!/usr/bin/env node
/* Verificador independiente del manifest V7.2-P0F1 responsive.
   Uso: ejecutar desde app/ con:
   node docs/verify-manifest-v7-2-p0f1-20260804.mjs */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'docs', 'MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json');

function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  let diffs = 0;
  const entries = [];

  for (const f of manifest.files) {
    let buf;
    try {
      buf = await readFile(path.join(ROOT, f.path));
    } catch (err) {
      console.error(`DIFERENCIA: no se pudo leer ${f.path}: ${err.message}`);
      diffs++;
      continue;
    }
    const hash = sha256Hex(buf);
    if (hash !== f.sha256) {
      console.error(`DIFERENCIA: ${f.path} hash esperado ${f.sha256} != real ${hash}`);
      diffs++;
    }
    if (typeof f.size === 'number' && buf.byteLength !== f.size) {
      console.error(`DIFERENCIA: ${f.path} size esperado ${f.size} != real ${buf.byteLength}`);
      diffs++;
    }
    entries.push(`${f.path}:${hash}`);
  }

  const aggregate = sha256Hex(Buffer.from(entries.join('\n'), 'utf8'));
  if (aggregate !== manifest.aggregateSha256) {
    console.error(`DIFERENCIA: aggregateSha256 esperado ${manifest.aggregateSha256} != recalculado ${aggregate}`);
    diffs++;
  }

  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
  console.log(`Archivos verificados: ${manifest.files.length}`);
  console.log(`Aggregate recalculado: ${aggregate}`);
  console.log(diffs === 0 ? '0 diferencias' : `${diffs} diferencia(s) encontrada(s)`);
  process.exit(diffs === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
