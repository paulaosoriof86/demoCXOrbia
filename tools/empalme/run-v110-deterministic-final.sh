#!/usr/bin/env bash
set -euo pipefail

BRANCH="docs-tya-v6-v71-audit"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

V105_CHECKS="tools/empalme/v105-v106-runtime-checksums.sha256"
V110_CHECKS="tools/empalme/v110-exact/runtime-checksums.sha256"
V110_LIQ_B64="tools/empalme/v110-exact/liquidacion.js.b64"
SOURCE_ZIP_SHA="1f9e30f711899af500683e7292eb8652e9e0bc4b888cd1252a5482795dbba227"
BASE_PACKAGE_SHA="582a8c98cdac7b46028bb720d1304657c6d678e99e4bc23a49e80ab440bc8206"
RUNTIME_PATCH_SHA="d19e42df846d4b03f9407e856cc70e1dace6166ff3a46f17d93bda035566f0bd"
ACADEMIA_PATCH_SHA="8395ca4eeb4dc5b5e459bcaf51ef538419db80535baaf319aec68688551740fd"
V110_CHECKSUM_FILE_SHA="6fd975edb2fb52060a167e1ff9797401baabc391c63315502015726820dc253f"

[[ "${GITHUB_REF_NAME:-$(git branch --show-current)}" == "$BRANCH" ]] || { echo "branch_mismatch" >&2; exit 2; }
[[ -f "$V105_CHECKS" && -f "$V110_CHECKS" && -f "$V110_LIQ_B64" ]] || { echo "transport_missing" >&2; exit 2; }
echo "$V110_CHECKSUM_FILE_SHA  $V110_CHECKS" | sha256sum -c -

mkdir -p /tmp/cxorbia-v110-protected
cp app/core/finanzas-core.js /tmp/cxorbia-v110-protected/finanzas-core.js
cp app/core/topbar.js /tmp/cxorbia-v110-protected/topbar.js
sha256sum app/core/finanzas-core.js app/core/topbar.js > /tmp/v110-protected-before.sha256
PROTECTED_FIN_SHA="$(sha256sum app/core/finanzas-core.js | awk '{print $1}')"
PROTECTED_TOP_SHA="$(sha256sum app/core/topbar.js | awk '{print $1}')"

# Reconstruye los 67 archivos recuperables de la baseline exacta V105/V106.
# El runner histórico falla cerrado por tres diferencias conocidas: dos mejoras locales
# protegidas (finanzas-core/topbar) y liquidacion, que se sustituye por el archivo V110 exacto.
set +e
CXORBIA_CONFIRM=EMPALME_V105_INTERNAL_V106_EXACTO \
  bash tools/empalme/tya-apply-v105-internal-v106-runtime.sh \
  > /tmp/v105-reconstruction.log 2>&1
V105_RC=$?
set -e
[[ "$V105_RC" == "2" ]] || { cat /tmp/v105-reconstruction.log; echo "unexpected_v105_reconstruction_rc=$V105_RC" >&2; exit 2; }
LOG=".tmp/v105-v106-runtime-empalme/checksums.log"
[[ -f "$LOG" ]] || { cat /tmp/v105-reconstruction.log; echo "missing_v105_checksum_log" >&2; exit 2; }
[[ "$(grep -c ': FAILED$' "$LOG")" == "3" ]] || { cat "$LOG"; echo "unexpected_v105_mismatch_count" >&2; exit 2; }
grep -Fxq 'app/core/finanzas-core.js: FAILED' "$LOG"
grep -Fxq 'app/core/liquidacion.js: FAILED' "$LOG"
grep -Fxq 'app/core/topbar.js: FAILED' "$LOG"
grep -vE '  app/core/(finanzas-core|liquidacion|topbar)\.js$' "$V105_CHECKS" > /tmp/v105-controlled.sha256
[[ "$(wc -l < /tmp/v105-controlled.sha256 | tr -d ' ')" == "67" ]]
sha256sum -c /tmp/v105-controlled.sha256

# Restaura las dos mejoras locales que el empalme selectivo debía proteger.
cp /tmp/cxorbia-v110-protected/finanzas-core.js app/core/finanzas-core.js
cp /tmp/cxorbia-v110-protected/topbar.js app/core/topbar.js
sha256sum -c /tmp/v110-protected-before.sha256

cat tools/empalme/v110-selective/exact/runtime-exact-*.b64 | tr -d '\r\n\t ' | base64 -d > /tmp/v110-runtime.patch
cat tools/empalme/v110-selective/parts/academia-part-*.patchpart > /tmp/v110-academia.patch
echo "$RUNTIME_PATCH_SHA  /tmp/v110-runtime.patch" | sha256sum -c -
echo "$ACADEMIA_PATCH_SHA  /tmp/v110-academia.patch" | sha256sum -c -

# liquidacion no quedó transportada en el delta V105/V106 histórico. Se retira solo esa
# sección del patch y luego se instala el archivo V110 exacto, fijado por SHA-256.
python3 - <<'PY'
from pathlib import Path
src=Path('/tmp/v110-runtime.patch').read_text(encoding='utf-8').splitlines(keepends=True)
starts=[i for i,line in enumerate(src) if line.startswith('diff --git ')]
starts.append(len(src))
out=[]; removed=0
for a,b in zip(starts,starts[1:]):
    block=src[a:b]
    header=block[0] if block else ''
    if ' a/app/core/liquidacion.js b/app/core/liquidacion.js' in header:
        removed += 1
        continue
    out.extend(block)
if removed != 1:
    raise SystemExit(f'liquidacion_patch_sections_removed:{removed}')
Path('/tmp/v110-runtime-no-liquidacion.patch').write_text(''.join(out),encoding='utf-8')
PY

git apply --check /tmp/v110-runtime-no-liquidacion.patch
git apply /tmp/v110-runtime-no-liquidacion.patch
git apply --check /tmp/v110-academia.patch
git apply /tmp/v110-academia.patch
tr -d '\r\n\t ' < "$V110_LIQ_B64" | base64 -d > app/core/liquidacion.js
echo 'd49670d640d9f78dca514d29e46e4afba2691a31a895b5cde67ce68e183a5faa  app/core/liquidacion.js' | sha256sum -c -

# 67 archivos controlados por V110 exactos; 2 overrides locales preservados;
# build-lock se regenera como lock de unión y no se compara con el lock interno del ZIP.
grep -vE '  app/core/(build-lock|finanzas-core|topbar)\.js$' "$V110_CHECKS" > /tmp/v110-controlled.sha256
[[ "$(wc -l < /tmp/v110-controlled.sha256 | tr -d ' ')" == "67" ]]
sha256sum -c /tmp/v110-controlled.sha256
sha256sum -c /tmp/v110-protected-before.sha256

while IFS= read -r -d '' f; do node --check "$f" >/dev/null; done < <(find app -type f \( -name '*.js' -o -name '*.mjs' \) -print0)
python3 - "$V110_CHECKS" <<'PY'
from pathlib import Path
import sys
paths=[]
for line in Path(sys.argv[1]).read_text(encoding='utf-8').splitlines():
    if line.strip(): paths.append(Path(line.split('  ',1)[1]))
for p in paths:
    raw=p.read_bytes()
    if raw.startswith(b'\xef\xbb\xbf'): raise SystemExit(f'utf8_bom:{p}')
    text=raw.decode('utf-8')
    for token in ('Ã','Â','â€','ï»¿','�'):
        if token in text: raise SystemExit(f'mojibake:{token}:{p}')
print(f'utf8_no_bom_no_mojibake:PASS:{len(paths)}')
PY
! grep -RInE '^(<<<<<<<|=======|>>>>>>>)' app/core app/modules app/styles

grep -Fq 'const reviewRequired=[]' app/core/data.js
grep -Fq 'const visitasValidas=[]' app/core/data.js
grep -Fq 'v.loteId=lote' app/core/data.js
grep -Fq 'reviewRequired' app/modules/finanzas.js
grep -Fq 'loteIdCombos' app/modules/finanzas.js
grep -Fq "if(rol==='shopper')" app/modules/academia.js
grep -Fq 'CX.data.getShopper' app/modules/academia.js
grep -Fq 'paises=[]' app/modules/academia.js
grep -Fq 'visibleCourses' app/modules/academia.js
grep -Fq 'createdByUserId' app/modules/academia.js
grep -Fq 'Number.isFinite' app/core/cliente-data.js
grep -Fq '.between{flex-wrap:wrap' app/styles/layout.css

node <<'NODE'
const fs=require('fs'),path=require('path');
const html=fs.readFileSync('app/index.html','utf8');
const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
const local=scripts.filter(s=>!/^https?:\/\//i.test(s));
const missing=local.filter(s=>!fs.existsSync(path.join('app',s)));
const duplicates=local.filter((s,i)=>local.indexOf(s)!==i);
if(scripts.length!==66||local.length!==64||new Set(local).size!==64||missing.length||duplicates.length){
  throw new Error(`script_graph_invalid total=${scripts.length} local=${local.length} unique=${new Set(local).size} missing=${missing.join(',')} duplicates=${duplicates.join(',')}`);
}
const regs=[];
for(const f of fs.readdirSync('app/modules').filter(f=>f.endsWith('.js'))){
  const src=fs.readFileSync(path.join('app/modules',f),'utf8');
  for(const m of src.matchAll(/CX\.module\(\s*['"]([^'"]+)/g)) regs.push(m[1]);
}
if(regs.length!==48||new Set(regs).size!==48) throw new Error(`module_graph_invalid registrations=${regs.length} unique=${new Set(regs).size}`);
console.log(JSON.stringify({scriptsTotal:scripts.length,scriptsLocal:local.length,moduleRegistrations:regs.length},null,2));
NODE

cat > app/docs/CAMBIOS-BACKEND-ADDENDUM-EMPALME-DETERMINISTICO-V110-20260712.md <<EOF
# CAMBIOS BACKEND — EMPALME DETERMINÍSTICO V110

Fecha: 2026-07-12

## Resultado comprobado

Se reconstruyó la baseline V105/build interno V106 con 67 archivos exactos y se aplicó el delta auditado V105→V110 sin reconciliación difusa. El archivo \`app/core/liquidacion.js\` se instaló desde transporte V110 exacto y quedó fijado por SHA-256.

Identidad final:

- 67 archivos controlados por V110: exactos por checksum;
- \`app/core/finanzas-core.js\`: override local protegido, SHA \`$PROTECTED_FIN_SHA\`;
- \`app/core/topbar.js\`: override local protegido, SHA \`$PROTECTED_TOP_SHA\`;
- \`app/core/build-lock.js\`: regenerado como source lock de unión repo + V110.

Los dos P0 quedan físicamente incorporados: Academia falla cerrado por país real del shopper y Finanzas valida antes de procesar pagos/lotes.

## Preservación

Se preservaron backend, contratos, HR source-safe, importadores, reviewQueue, auditEvents, R5/R6/R8/R9 y gates. No se sustituyó el árbol completo a ciegas.

## Estado seguro

Sin merge del PR, deploy, producción, importación real, Firestore/HR writes, Make/Gemini live ni pagos reales.
EOF

cat > app/docs/ACADEMIA-IMPACT-EMPALME-DETERMINISTICO-V110-20260712.md <<'EOF'
# ACADEMIA — IMPACTO EMPALME DETERMINÍSTICO V110

- El país del shopper se resuelve desde su identidad real en `CX.data.getShopper(shopperId).pais`.
- Sin país resoluble, el contenido restringido falla cerrado; el contenido global continúa visible.
- KPIs, rutas, cursos, lecciones y certificados consumen la misma colección visible.
- Módulo, nivel y paquete son filtros de clasificación, no ejes de autorización.
- Creador, revisor y aprobador usan IDs estables o muestran pendiente honesto de Auth.
- R10 debe comprobar Admin/Shopper, GT/HN, KPIs y ausencia de fuga entre países.
EOF

cat > app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-EMPALME-DETERMINISTICO-V110-20260712.md <<'EOF'
# TRACKER PHASE A — EMPALME DETERMINÍSTICO V110

- Auditoría V110: READY.
- P0 Claude V109→V110: CLOSED.
- Empalme físico V110: COMPLETED_VERIFIED.
- Identidad candidata: 67 exactos + 2 overrides locales protegidos + 1 source lock unión generado.
- Backend/source-safe protegido: PASS.
- R10 source-safe: siguiente bloque exacto.
- Firebase DEV read-only: pendiente autorización específica.
- Pagos/certificaciones: pendientes fuentes sanitizadas.
- Producción: HOLD.
EOF

if ! grep -Fq 'Empalme determinístico V110 — 2026-07-12' CAMBIOS-BACKEND.md; then
cat >> CAMBIOS-BACKEND.md <<'EOF'

## Empalme determinístico V110 — 2026-07-12

- Baseline V105/build interno V106 reconstruida y delta V105→V110 aplicado sin heurísticas.
- Identidad final: 67 archivos V110 exactos, 2 overrides locales protegidos y source lock unión regenerado.
- Backend, source-safe, HR, importadores, R5/R6/R8/R9 y gates preservados.
- Sin deploy, producción, imports, writes, providers ni pagos reales.
EOF
fi
if ! grep -Fq 'Cierre V110 empalmada — 2026-07-12' RESUMEN-PARA-CLAUDE.md; then
cat >> RESUMEN-PARA-CLAUDE.md <<'EOF'

## Cierre V110 empalmada — 2026-07-12

- Los dos P0 de Academia por país y Finanzas fail-closed quedaron cerrados, verificados y empalmados físicamente.
- No se genera otro paquete Claude.
- No reabrir scores finitos, bandas unificadas, lotes multipaís/multimoneda, IDs determinísticos, responsive, Beneficios, certificaciones, cache demo/real ni shell.
- P1/P2 restantes quedan acumulados para un futuro paquete y no bloquean R10.
EOF
fi
if ! grep -Fq 'Pendientes no bloqueantes post-V110 — 2026-07-12' PENDIENTES-PROTOTIPO.md; then
cat >> PENDIENTES-PROTOTIPO.md <<'EOF'

## Pendientes no bloqueantes post-V110 — 2026-07-12

- Normalizar espacios en país/moneda antes del backend real de pagos.
- Deduplicar IDs dentro de una llamada directa a `payVisits()`.
- Endurecer idempotencia ante llamadas repetidas.
- Ajustar copy cuando cero visitas fueron procesadas.
- Normalizar retorno futuro a `processed/reviewRequired`.
EOF
fi

node - "$SOURCE_ZIP_SHA" "$BASE_PACKAGE_SHA" "$RUNTIME_PATCH_SHA" "$ACADEMIA_PATCH_SHA" "$PROTECTED_FIN_SHA" "$PROTECTED_TOP_SHA" <<'NODE'
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const [sourceZipSha256,basePackageSha256,runtimePatchSha256,academiaPatchSha256,finSha,topSha]=process.argv.slice(2);
const root=path.resolve('app');
const manifestRel='docs/MANIFEST-V110-UNION-EMPALME-R1.json';
const verifierRel='docs/verify-manifest-v110-union-empalme.mjs';
const excluded=new Set(['core/build-lock.js',manifestRel,verifierRel]);
const rels=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.isFile())rels.push(path.relative(root,p).split(path.sep).join('/'));}}
walk(root);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=rels.filter(r=>!excluded.has(r)).sort().map(r=>{const b=fs.readFileSync(path.join(root,r));return{path:r,size:b.length,sha256:sha(b)};});
const aggregateSha256=sha(Buffer.from(files.map(f=>`${f.path}:${f.sha256}`).join('\n'),'utf8'));
const manifest={schemaVersion:'1.0.0',package:'CXORBIA-V110-UNION-EMPALME-R1',project:'CXOrbia',baseline:'V110 empalmada de forma determinística sobre rama viva',generatedAt:new Date().toISOString(),sourceZipSha256,basePackageSha256,runtimePatchSha256,academiaPatchSha256,runtimeIdentity:{v110ExactFiles:67,protectedOverrides:[{path:'core/finanzas-core.js',sha256:finSha,reason:'mejora local protegida previa al empalme'},{path:'core/topbar.js',sha256:topSha,reason:'mejora local protegida previa al empalme'}],generatedUnionLock:'core/build-lock.js'},fileCount:files.length,aggregateSha256,exclusionsDeclared:[{path:'core/build-lock.js',reason:'referencia circular y lock de unión generado'},{path:manifestRel,reason:'manifest se excluye a sí mismo'},{path:verifierRel,reason:'verificador generado junto al manifest'}],files};
fs.writeFileSync(path.join(root,manifestRel),JSON.stringify(manifest,null,2)+'\n','utf8');
const lock=`/* CXOrbia · Source lock unión V110 empalme R1\n   Fuente auditada: Prototype development request CXOrbia V110.zip\n   No implica deploy, producción, importación ni providers activos. */\nvar CX_SOURCE_LOCK={\n  manifestFile:'${manifestRel}',\n  aggregateSha256:'${aggregateSha256}',\n  fileCount:${files.length},\n  runtimeIdentity:'67 exactos V110 + 2 overrides locales protegidos + lock unión',\n  generatedAt:'${manifest.generatedAt.slice(0,10)}',\n  sourceZipSha256:'${sourceZipSha256}',\n  note:'Baseline auditada V110 empalmada de forma determinística; backend y source-safe preservados.'\n};\nvar CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);\nif(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}\n`;
fs.writeFileSync(path.join(root,'core','build-lock.js'),lock,'utf8');
const verifier=`#!/usr/bin/env node\nimport {readFile} from 'node:fs/promises';\nimport {createHash} from 'node:crypto';\nimport path from 'node:path';\nconst ROOT=process.cwd();const M=JSON.parse(await readFile(path.join(ROOT,'${manifestRel}'),'utf8'));const sha=b=>createHash('sha256').update(b).digest('hex');let diffs=0;const entries=[];for(const f of M.files){let b;try{b=await readFile(path.join(ROOT,f.path));}catch(e){console.error('DIFERENCIA faltante',f.path);diffs++;continue;}const h=sha(b);if(h!==f.sha256||b.length!==f.size){console.error('DIFERENCIA',f.path);diffs++;}entries.push(f.path+':'+h);}const agg=sha(Buffer.from(entries.join('\\n'),'utf8'));if(agg!==M.aggregateSha256){console.error('DIFERENCIA aggregate',agg);diffs++;}console.log('Archivos verificados:',M.files.length);console.log('Aggregate recalculado:',agg);console.log(diffs?'Diferencias: '+diffs:'0 diferencias');process.exit(diffs?1:0);\n`;
fs.writeFileSync(path.join(root,verifierRel),verifier,'utf8');
console.log(JSON.stringify({fileCount:files.length,aggregateSha256},null,2));
NODE
node --check app/core/build-lock.js
(cd app && node docs/verify-manifest-v110-union-empalme.mjs)

# Limpieza de transporte e intentos fallidos; la evidencia final queda en docs/manifest.
git rm -rf tools/empalme/v110-selective || true
git rm -rf tools/empalme/v110-exact || true
git rm -rf tools/empalme/export-current-11 || true
git rm -f tools/empalme/v105-baseline-last-run.txt tools/empalme/v105-baseline-checksums.log tools/empalme/v105-baseline-diagnostic.txt || true
git rm -f .github/workflows/cxorbia-v110-selective-empalme.yml || true
git rm -f .github/workflows/cxorbia-v110-runtime-empalme.yml || true
git rm -f .github/workflows/cxorbia-export-current-11.yml || true
git rm -f .github/workflows/cxorbia-v105-baseline-diagnostic.yml || true
git rm -f .github/workflows/cxorbia-v105-v106-runtime-empalme.yml || true
git rm -f tools/empalme/run-v110-deterministic-final.sh || true

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add app CAMBIOS-BACKEND.md RESUMEN-PARA-CLAUDE.md PENDIENTES-PROTOTIPO.md .github/workflows tools/empalme || true
if git diff --cached --quiet; then echo 'no_changes_to_commit' >&2; exit 2; fi
git commit -m "feat(frontend): empalme determinístico V110 preservando backend"
git pull --rebase origin "$BRANCH"
git push origin HEAD:"$BRANCH"
