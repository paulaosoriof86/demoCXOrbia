#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';

const root = process.cwd();
const command = process.argv[2] || '';
const candidateZip = path.join(root, '.candidate/v156-runtime-delta.zip');
const candidateManifestFile = path.join(root, 'app/docs/MANIFEST-V156.json');
const finalManifestRelative = 'docs/MANIFEST-V156-R15G-ATOMIC-R1.json';
const finalManifestFile = path.join(root, 'app', finalManifestRelative);
const resultFile = path.join(root, 'app/docs/RESULTADO-EMPALME-ATOMICO-V156-20260716.json');
const expected = {
  deltaZipSha256: '053af067f5ffa5f2c9244798af3d0cce28189457533a835fb5376eac5112ebf5',
  transportZipSha256: '1ecfe9b05f9ed5cdd2940483db3dd76c1f515b4bdd8c545a4121d03179c01637',
  candidateAggregateSha256: '0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305',
  candidateFileCount: 205,
  candidateRuntimeCount: 71,
  periods: 14,
  visits: 616,
  shoppers: 216,
  visitsPerPeriod: 44
};

const fail = message => { console.error(`V156_ATOMIC_FAIL: ${message}`); process.exit(1); };
const sha256Buffer = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const sha256File = file => sha256Buffer(fs.readFileSync(file));
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
};

function isCandidateRuntimePath(p) {
  return ['.gitignore','README.md','app.js','index.html','manifest.webmanifest','sw.js'].includes(p) ||
    p.startsWith('core/') || p.startsWith('modules/') || p.startsWith('styles/') || p.startsWith('demo/');
}
function verifyIndexScripts(htmlFile) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  const local = scripts.filter(src => !/^(?:https?:)?\/\//i.test(src));
  const duplicates = [...new Set(local.filter((src, i) => local.indexOf(src) !== i))];
  const missing = local.filter(src => !fs.existsSync(path.join(path.dirname(htmlFile), src.split(/[?#]/)[0])));
  if (duplicates.length) fail(`duplicate local scripts: ${duplicates.join(', ')}`);
  if (missing.length) fail(`missing local scripts: ${missing.join(', ')}`);
  return {scriptCount:scripts.length, localScriptCount:local.length, duplicates, missing};
}
function verifyCandidateRuntime() {
  if (!fs.existsSync(candidateZip)) fail(`candidate delta missing: ${candidateZip}`);
  const zipSha = sha256File(candidateZip);
  if (zipSha !== expected.deltaZipSha256) fail(`delta SHA mismatch ${zipSha}`);
  if (!fs.existsSync(candidateManifestFile)) fail('V156 candidate manifest was not materialized into app/docs');
  const manifest = readJson(candidateManifestFile);
  if (manifest.version !== 'V156') fail(`unexpected candidate version ${manifest.version}`);
  if (manifest.fileCount !== expected.candidateFileCount || manifest.files?.length !== expected.candidateFileCount) {
    fail(`candidate manifest count mismatch ${manifest.fileCount}/${manifest.files?.length}`);
  }
  if (manifest.aggregateSha256 !== expected.candidateAggregateSha256) fail('candidate aggregate mismatch');
  const runtime = manifest.files.filter(entry => isCandidateRuntimePath(entry.path));
  if (runtime.length !== expected.candidateRuntimeCount) fail(`runtime manifest count ${runtime.length}`);
  const mismatches = [];
  for (const entry of runtime) {
    const file = path.join(root, 'app', entry.path);
    if (!fs.existsSync(file)) { mismatches.push({path:entry.path, reason:'missing'}); continue; }
    const stat = fs.statSync(file);
    const actual = sha256File(file);
    if (actual !== entry.sha256 || stat.size !== entry.size) {
      mismatches.push({path:entry.path, expectedSha256:entry.sha256, actualSha256:actual, expectedSize:entry.size, actualSize:stat.size});
    }
  }
  if (mismatches.length) fail(`candidate runtime differs in ${mismatches.length} files: ${mismatches.slice(0,5).map(x=>x.path).join(', ')}`);
  const index = verifyIndexScripts(path.join(root, 'app/index.html'));
  const finance = fs.readFileSync(path.join(root, 'app/core/finanzas-core.js'), 'utf8');
  if (!/porPais\(data\)[\s\S]*?data\.project\(\)/.test(finance)) fail('V156 finance porPais does not preserve data.project()');
  if (!/serieMensual\(p,c\)[\s\S]*?project:\(\)=>p,[\s\S]*?period:\(\)=>p/.test(finance)) fail('V156 finance adapter does not preserve project+period');
  const report = {
    schemaVersion:'1.0.0', decision:'PASS_V156_COMPLETE_RUNTIME_MATERIALIZED',
    candidateVersion:'V156', candidateManifestAggregateSha256:manifest.aggregateSha256,
    candidateManifestFileCount:manifest.fileCount, candidateRuntimeFileCount:runtime.length,
    transportZipSha256:expected.transportZipSha256, deltaZipSha256:zipSha,
    runtimeMismatches:0, indexScripts:index,
    r18dAbsorbedByCandidate:true,
    safeState:{deploy:false,production:false,imports:false,writes:false,providers:false,payments:false}
  };
  writeJson(path.join(root,'.tmp/v156-atomic/materialization.json'), report);
  console.log(JSON.stringify(report,null,2));
}

function finalRuntimePaths() {
  const candidate = readJson(candidateManifestFile).files.filter(entry => isCandidateRuntimePath(entry.path)).map(entry => `app/${entry.path}`);
  const overlays = [
    'app/core/tya-phase-a-source-safe-preview.js',
    'app/core/tya-phase-a-source-safe-runtime-guard.js',
    'app/core/tya-phase-a-period-history-integrity.js',
    'app/core/tya-phase-a-liquidation-certification-integrity.js',
    'app/data/tya-hr-source-safe-periods.js',
    'app/data/tya-financial-control-source-safe.js',
    'app/data/tya-certification-carryover-source-safe.js',
    'app/adapters/tya-phase-a-source-safe-dev-adapter.js'
  ];
  return [...new Set([...candidate, ...overlays])].sort();
}
function buildFinalManifest() {
  const paths = finalRuntimePaths();
  const missing = paths.filter(p => !fs.existsSync(path.join(root,p)));
  if (missing.length) fail(`final overlay/runtime files missing: ${missing.join(', ')}`);
  const files = paths.map(p => {
    const file = path.join(root,p); const stat=fs.statSync(file);
    return {path:p.replace(/^app\//,''), size:stat.size, sha256:sha256File(file)};
  });
  const aggregateInput = files.map(f => `${f.path}\0${f.sha256}\n`).join('');
  const aggregateSha256 = sha256Buffer(Buffer.from(aggregateInput,'utf8'));
  const manifest = {
    schemaVersion:'1.0.0', package:'CXORBIA-V156-R15G-ATOMIC-R1', project:'CXOrbia',
    generatedAt:'2026-07-16', candidateVersion:'V156',
    candidateTransportSha256:expected.transportZipSha256,
    candidateManifest:'docs/MANIFEST-V156.json',
    candidateAggregateSha256:expected.candidateAggregateSha256,
    promotionMode:'complete_candidate_runtime_then_explicit_backend_overlays',
    fileCount:files.length,
    aggregateAlgorithm:'sha256(sorted(path + NUL + sha256 + LF))',
    aggregateSha256,
    overlays:[
      {id:'R15G_PROJECT_PERIOD_SOURCE_SAFE', paths:['core/tya-phase-a-source-safe-preview.js','data/tya-hr-source-safe-periods.js','adapters/tya-phase-a-source-safe-dev-adapter.js'], reason:'Separate parent project and active period; bind normalized HR source-safe data.'},
      {id:'R11D_R14C_CERTIFICATION_CONTROL', paths:['data/tya-financial-control-source-safe.js','data/tya-certification-carryover-source-safe.js','core/tya-phase-a-liquidation-certification-integrity.js'], reason:'Preserve source-level review queue, exact financial links and certification carryover.'},
      {id:'R18D_FINANCE_PERIOD', paths:['core/finanzas-core.js'], disposition:'absorbed_by_candidate_v156', reason:'V156 already contains the validated project()+period() finance combination; no old runtime file preserved.'}
    ],
    files
  };
  writeJson(finalManifestFile, manifest);
  const lock = `/* CXOrbia source lock — V156 + R15G atomic overlays — 20260716 */\n`+
    `var CX_SOURCE_LOCK=${JSON.stringify({manifestFile:finalManifestRelative,aggregateSha256,fileCount:files.length,runtimeIdentity:'V156 + R15G atomic overlays',generatedAt:'2026-07-16',sourceZipSha256:expected.transportZipSha256,candidateManifestAggregateSha256:expected.candidateAggregateSha256,promotionMode:'complete_candidate_then_explicit_overlays',decision:'PASS_PENDING_FINAL_GATES',note:'V156 completa verificada antes de overlays. R18D absorbido por la candidata. Sin deploy ni producción.'})};\n`+
    `var CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);\n`+
    `if(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}\n`;
  fs.writeFileSync(path.join(root,'app/core/build-lock.js'),lock,'utf8');
  const index = verifyIndexScripts(path.join(root,'app/index.html'));
  const prepared = {schemaVersion:'1.0.0',decision:'PASS_FINAL_MANIFEST_LOCK_PREPARED',manifestFile:finalManifestRelative,aggregateSha256,fileCount:files.length,indexScripts:index,safeState:{deploy:false,production:false,writes:false,imports:false}};
  writeJson(path.join(root,'.tmp/v156-atomic/final-manifest.json'),prepared);
  writeJson(resultFile,{...prepared,decision:'PENDING_V156_TYA_GATES'});
  console.log(JSON.stringify(prepared,null,2));
}

function prependOnce(file, marker, section) {
  const prior = fs.existsSync(file) ? fs.readFileSync(file,'utf8') : '';
  if (prior.includes(marker)) return;
  fs.writeFileSync(file, section.trimEnd() + '\n\n' + prior, 'utf8');
}
function finalizePass() {
  const reports = [
    ['source-semantics','.tmp/tya-source-semantics-r15g/report.json'],
    ['role-smoke','.tmp/phase-a-source-safe-visual-smoke/phase-a-source-safe-visual-smoke-report.json'],
    ['project-period-kpi-history','.tmp/tya-project-period-kpi-history-gate/report.json']
  ];
  const evidence = {};
  for (const [name,relative] of reports) {
    const file=path.join(root,relative); if(!fs.existsSync(file)) fail(`${name} report missing`);
    const value=readJson(file); evidence[name]=value;
    if(value.ok!==true) fail(`${name} did not pass: ${value.decision}`);
  }
  const manifest=readJson(finalManifestFile);
  const lockText=fs.readFileSync(path.join(root,'app/core/build-lock.js'),'utf8').replace('PASS_PENDING_FINAL_GATES','PASS_V156_ATOMIC_TYA_GATES');
  fs.writeFileSync(path.join(root,'app/core/build-lock.js'),lockText,'utf8');
  const registryFile=path.join(root,'backend/contracts/prototype-baseline-registry-v1.json');
  const registry=readJson(registryFile);
  const oldActive=registry.activeBaseline;
  registry.version='1.4.0'; registry.updatedAt='2026-07-16';
  registry.invariant='acceptedCandidateVersion == empalmedVersion == activeBaselineVersion';
  registry.previousBaseline={...oldActive,status:'superseded_by_v156',accepted:true,empalmed:true};
  registry.activeBaseline={
    version:'V156',runtimeIdentity:'V156 + R15G atomic overlays',status:'accepted_and_empalmed',
    sourceZipSha256:expected.transportZipSha256,candidateAggregateSha256:expected.candidateAggregateSha256,
    manifestFile:finalManifestRelative,aggregateSha256:manifest.aggregateSha256,fileCount:manifest.fileCount,
    accepted:true,empalmed:true,promotionMode:'complete_candidate_runtime_then_explicit_backend_overlays',
    promotionWorkflowRun:process.env.GITHUB_RUN_ID || null,
    gates:{candidateRuntime:'PASS',sourceSemantics:evidence['source-semantics'].decision,roleSmoke:evidence['role-smoke'].decision,projectPeriodKpiHistory:evidence['project-period-kpi-history'].decision},
    evidence:{periods:expected.periods,visits:expected.visits,shoppers:expected.shoppers,visitsPerActivePeriod:expected.visitsPerPeriod},
    warning:'DEV/source-safe snapshot validated. Live production HR synchronization remains a separate production gate.'
  };
  registry.candidate={version:'V156',sourceZipSha256:expected.transportZipSha256,declaredManifestAggregateSha256:expected.candidateAggregateSha256,status:'accepted_and_empalmed',accepted:true,empalmed:true,gateDecision:'PASS_V156_ATOMIC_TYA_GATES',nextExpectedVersion:null};
  writeJson(registryFile,registry);

  const result={schemaVersion:'1.0.0',decision:'PASS_V156_ATOMIC_TYA_GATES',candidateVersion:'V156',runtimeIdentity:registry.activeBaseline.runtimeIdentity,manifestFile:finalManifestRelative,aggregateSha256:manifest.aggregateSha256,fileCount:manifest.fileCount,workflowRun:process.env.GITHUB_RUN_ID||null,evidence:{periods:expected.periods,visits:expected.visits,shoppers:expected.shoppers,visitsPerPeriod:expected.visitsPerPeriod,sourceSemantics:evidence['source-semantics'].decision,roleSmoke:evidence['role-smoke'].decision,projectPeriodKpiHistory:evidence['project-period-kpi-history'].decision},safeState:{deploy:false,production:false,imports:false,firestoreWrites:false,authWrites:false,storageWrites:false,hrWrites:false,make:false,gemini:false,payments:false}};
  writeJson(resultFile,result);

  const marker='## 2026-07-16 — V156 empalme atómico PASS';
  prependOnce(path.join(root,'CAMBIOS-BACKEND.md'),marker,`${marker}\n\n- Se materializó y verificó primero el árbol runtime completo V156 (71/71 archivos contra el manifest interno; aggregate candidato \`${expected.candidateAggregateSha256}\`).\n- Se aplicaron después overlays explícitos R15G y controles R11D/R14C/certificaciones; no se preservó ningún archivo runtime V131 por exclusión silenciosa.\n- R18D quedó absorbido por el archivo \`core/finanzas-core.js\` de V156, que conserva \`data.project()\` y el adapter local con \`project()+period()\`.\n- Se generó un único manifest/source lock final: \`${finalManifestRelative}\`, aggregate \`${manifest.aggregateSha256}\`.\n- Gates PASS: semántica TyA, proyecto/periodo/KPI/histórico y smoke Admin/Shopper/Cliente.\n- Baseline activa única: \`V156 + R15G atomic overlays\`. V131 queda solo como rollback inmutable.\n- Sin deploy, producción, imports, writes, Make/Gemini live ni pagos reales.\n\n### Clasificación\n- **Reusable CXOrbia:** promoción atómica candidata completa → overlays explícitos → manifest/source lock único → gates fail-closed.\n- **Exclusivo cliente:** 14 periodos, 616 visitas, 216 shoppers, 44 visitas por periodo y junio ejecutado con pagos pendientes.\n- **Claude/prototipo:** V156 queda empalmada; no solicitar otra candidata por este bloque.\n- **Academia:** conservar proyecto vs periodo y submitido vs liquidado vs pagado por rol.\n- **Sin impacto Claude:** hashes, transporte, workflow, manifest, source lock y registro de baseline.`);

  prependOnce(path.join(root,'RESUMEN-PARA-CLAUDE.md'),marker,`${marker}\n\n- Fuente frontend única vigente: **V156 empalmada atómicamente**. No volver a V131 ni generar correcciones sobre V131.\n- Claude debe consumir \`CX.data\` y respetar \`{tenantId, projectId, periodId}\`; no recrear bridges HR, normalizadores, importadores, gates, Firestore, Make, Gemini o pagos.\n- Estado preservado: 14 periodos, 616 visitas, 216 shoppers, 44 por periodo; junio ejecutado y pendiente solo de liquidaciones/pagos; certificaciones históricas preservadas.\n- R18D ya está incorporado en V156.\n- No hay paquete Claude nuevo derivado de este empalme. Cualquier hallazgo posterior debe ser visual y focalizado sobre esta baseline.`);

  prependOnce(path.join(root,'PENDIENTES-PROTOTIPO.md'),marker,`${marker}\n\n- **Sin P0 Claude nuevo por el empalme.** V156 queda como baseline frontend única.\n- No reabrir proyecto/periodo, HR, histórico, KPI, shoppers, certificaciones, R11D/R14C, R18D ni junio como visitas pendientes.\n- Próximo control: revisión visual humana en Hosting DEV sobre V156 empalmada. Solo hallazgos visuales reproducibles generan correctiva focalizada.\n- Producción, HR sync live, Make/Gemini y pagos siguen separados por sus gates reales.`);

  const checkpoint=`# CHECKPOINT — V156 EMPALME ATÓMICO PASS\n\nFecha: 2026-07-16\n\n## Source lock único\n- Runtime: \`V156 + R15G atomic overlays\`.\n- Manifest: \`${finalManifestRelative}\`.\n- Aggregate: \`${manifest.aggregateSha256}\`.\n- V131: rollback histórico únicamente.\n\n## Gates\n- Runtime candidato 71/71: PASS.\n- Semántica TyA: ${evidence['source-semantics'].decision}.\n- Proyecto/periodo/KPI/histórico: ${evidence['project-period-kpi-history'].decision}.\n- Smoke Admin/Shopper/Cliente: ${evidence['role-smoke'].decision}.\n\n## Phase A\n- 14 periodos, 616 visitas, 216 shoppers y 44 visitas por periodo.\n- Junio ejecutado; pendientes de pagos/liquidaciones.\n- Certificaciones históricas preservadas.\n- Submitido no equivale a liquidado ni pagado.\n\n## Estado seguro\nSin deploy, producción, imports, writes, Make/Gemini live ni pagos reales.\n`;
  fs.writeFileSync(path.join(root,'app/docs/CHECKPOINT-V156-EMPALME-ATOMICO-PASS-20260716.md'),checkpoint,'utf8');
  const academia=`# ACADEMIA — IMPACTO V156 EMPALME ATÓMICO\n\nFecha: 2026-07-16\n\n- Mantener rutas por rol para Admin, Operativo, Shopper y Cliente sobre la baseline V156.\n- Explicar que Cinépolis es proyecto configurable dentro del tenant TyA.\n- Diferenciar proyecto padre y periodo mensual activo.\n- Enseñar cómo el cambio de periodo modifica Dashboard, Histórico, Hoja de ruta, Visitas, Postulaciones, Finanzas y Liquidaciones.\n- Reforzar que submitido, liquidado y pagado son estados diferentes.\n- Junio se explica como visitas ejecutadas con control de liquidaciones/pagos pendiente.\n- Certificaciones ya presentadas se preservan; no se solicitan nuevamente sin regla del proyecto.\n- No presentar source-safe/DEV como producción, sync HR live, Make/Gemini activo ni pago ejecutado.\n`;
  fs.writeFileSync(path.join(root,'app/docs/ACADEMIA-IMPACT-V156-EMPALME-ATOMICO-PASS-20260716.md'),academia,'utf8');
  console.log(JSON.stringify(result,null,2));
}

if (command === 'materialize') verifyCandidateRuntime();
else if (command === 'prepare-final') buildFinalManifest();
else if (command === 'finalize-pass') finalizePass();
else fail(`unknown command: ${command}`);
