#!/usr/bin/env node
/* CXOrbia · Verificador independiente del manifest vigente.
   GAP3 (paquete V113→V114, 20260714): antes este script tenía la ruta del
   manifest fijada a mano (MANIFEST-V111.json) — cada corrección de versión
   obligaba a editar este archivo o quedaba verificando un manifest viejo.
   Ahora lee la ruta vigente desde core/build-lock.js (CX_SOURCE_LOCK.manifestFile),
   la única fuente de verdad de qué manifest corresponde al build actual.
   Uso: node docs/verify-manifest.mjs   (ejecutar desde dentro de la carpeta app/)
   Override manual opcional: node docs/verify-manifest.mjs --manifest docs/MANIFEST-X.json
   Requiere Node 18+ (usa node:crypto). */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = process.cwd(); // ejecutar desde app/

async function resolveManifestPath() {
  const argIdx = process.argv.indexOf('--manifest');
  if (argIdx !== -1 && process.argv[argIdx + 1]) return path.join(ROOT, process.argv[argIdx + 1]);
  const lockSrc = await readFile(path.join(ROOT, 'core', 'build-lock.js'), 'utf8');
  const m = lockSrc.match(/manifestFile:\s*'([^']+)'/);
  if (!m) throw new Error('No se pudo leer manifestFile desde core/build-lock.js');
  return path.join(ROOT, m[1]);
}

const MANIFEST_PATH = await resolveManifestPath();

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

  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
  console.log(`Archivos verificados: ${manifest.files.length}`);
  console.log(`Aggregate recalculado: ${aggregate}`);
  console.log(diffs === 0 ? '0 diferencias' : `${diffs} diferencia(s) encontrada(s)`);
  process.exit(diffs === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
