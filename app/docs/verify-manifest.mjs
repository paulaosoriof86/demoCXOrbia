#!/usr/bin/env node
/* CXOrbia · Verificador independiente del manifest V110 (paquete V109→V110, 20260712).
   Uso: colocar este archivo junto a app/ (o ajustar ROOT) y ejecutar:
     node docs/verify-manifest.mjs
   desde dentro de la carpeta app/. Requiere Node 18+ (usa node:crypto). */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = process.cwd(); // ejecutar desde app/
const MANIFEST_PATH = path.join(ROOT, 'docs', 'MANIFEST-V110.json');

function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function main() {
  const manifestRaw = await readFile(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  const excluded = new Set((manifest.exclusionesDeclaradas || []).map(e => e.path));
  let diffs = 0;
  const entries = [];

  for (const f of manifest.files) {
    if (excluded.has(f.path)) {
      console.error(`DIFERENCIA: ${f.path} está en files[] pero también en exclusionesDeclaradas — contradicción.`);
      diffs++;
      continue;
    }
    let buf;
    try {
      buf = await readFile(path.join(ROOT, f.path));
    } catch (e) {
      console.error(`DIFERENCIA: no se pudo leer ${f.path}: ${e.message}`);
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

  const concat = entries.join('\n');
  const aggregate = sha256Hex(Buffer.from(concat, 'utf8'));
  if (aggregate !== manifest.aggregateSha256) {
    console.error(`DIFERENCIA: aggregateSha256 esperado ${manifest.aggregateSha256} != recalculado ${aggregate}`);
    diffs++;
  }

  console.log(`Archivos verificados: ${manifest.files.length}`);
  console.log(`Aggregate recalculado: ${aggregate}`);
  console.log(diffs === 0 ? '0 diferencias' : `${diffs} diferencia(s) encontrada(s)`);
  process.exit(diffs === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
