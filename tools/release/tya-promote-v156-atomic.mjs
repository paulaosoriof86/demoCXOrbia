import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const changed=[
  'app.js','core/automations.js','core/config.js','core/data.js','core/finanzas-core.js','core/manuales-data.js','core/pwa.js','core/router.js','core/store.js','core/topbar.js','core/ui.js','index.html','modules/academia.js','modules/administrabilidad.js','modules/automatizaciones.js','modules/cert.js','modules/cliente.js','modules/configuracion.js','modules/correo.js','modules/dashboard.js','modules/finanzas.js','modules/hr-source.js','modules/importador.js','modules/integraciones.js','modules/marketing.js','modules/midia.js','modules/misvisitas.js','modules/postulaciones.js','modules/proyecto-wizard.js','modules/proyectos.js','modules/reservas.js','modules/revision-admin.js','modules/saas-console.js','modules/shoppers.js','modules/visitas.js'
].sort();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const parentAggregate='6e833331f5aa9ba9458ef0724756e72747352add3f8c6cc1fa327c96fadec348';
const files=changed.map(p=>{const b=fs.readFileSync(path.join('app',p));return {path:p,size:b.length,sha256:sha(b)};});
const aggregate=sha(Buffer.from(parentAggregate+'\0'+files.map(f=>f.path+'\0'+f.sha256+'\n').join(''),'utf8'));

const manifest={
  schemaVersion:'1.0.0',package:'CXORBIA-V156-EMPALME-DIRECTO-R1',project:'CXOrbia',baselineVersion:'V156',generatedAt:'2026-07-16',
  sourceCandidate:'Prototype development request (7).zip',sourceCandidateSha256:'1ecfe9b05f9ed5cdd2940483db3dd76c1f515b4bdd8c545a4121d03179c01637',sourceCandidateInternalVersion:'V156',
  sourceCandidateManifestAggregateSha256:'0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305',
  parentManifest:'docs/MANIFEST-V131-R18D-HOTFIX-R1.json',parentAggregateSha256:parentAggregate,parentRuntimeFileCount:71,effectiveRuntimeFileCount:71,
  changedRuntimeFileCount:files.length,removedRuntimeFileCount:0,aggregateAlgorithm:'sha256(parentAggregate + NUL + sorted(path + NUL + sha256 + LF))',aggregateSha256:aggregate,
  changedRuntimeFiles:files,
  reconciliations:[
    {path:'core/finanzas-core.js',decision:'V156 preserves R18D project-period semantics'},
    {path:'backend/**',decision:'preserved from live branch'},
    {path:'tools/**',decision:'preserved from live branch'},
    {path:'app/core/tya-phase-a-*.js and app/data/tya-*.js',decision:'preserved explicit TyA connection overlays outside Claude delta'}
  ],
  decision:'PASS_EMPALME_DIRECTO_V156_BASELINE_ACTIVE_GATES_POST_EMPALME_PENDING',
  safeState:{merge:false,deploy:false,production:false,imports:false,writes:false,providers:false,payments:false}
};
fs.mkdirSync('app/docs',{recursive:true});
fs.writeFileSync('app/docs/MANIFEST-V156-EMPALME-DIRECTO-R1.json',JSON.stringify(manifest,null,2)+'\n');

const lockData={manifestFile:'docs/MANIFEST-V156-EMPALME-DIRECTO-R1.json',aggregateSha256:aggregate,fileCount:71,runtimeIdentity:'V156 empalmada directamente sobre V131 + R18D',generatedAt:'2026-07-16',sourceZipSha256:'1ecfe9b05f9ed5cdd2940483db3dd76c1f515b4bdd8c545a4121d03179c01637',sourceCandidateManifestAggregateSha256:'0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305',parentManifest:'docs/MANIFEST-V131-R18D-HOTFIX-R1.json',decision:'PASS_EMPALME_DIRECTO_V156',note:'35 archivos runtime V156 aplicados; 0 eliminados. Backend, contratos, tools y overlays TyA preservados. Gates y smoke post-empalme pendientes antes de DEV/producción.'};
fs.writeFileSync('app/core/build-lock.js',`/* CXOrbia source lock runtime V156 empalme directo 20260716 */\nvar CX_SOURCE_LOCK=${JSON.stringify(lockData)};\nvar CX_BUILD_ID=CX_SOURCE_LOCK.aggregateSha256.slice(0,16);\nif(typeof window!=='undefined'){window.CX=window.CX||{};window.CX.BUILD_ID=CX_BUILD_ID;window.CX.SOURCE_LOCK=CX_SOURCE_LOCK;}\n`);

fs.writeFileSync('app/docs/verify-manifest.mjs',`#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
const root=process.cwd();
const lock=fs.readFileSync(path.join(root,'core/build-lock.js'),'utf8');
const mm=lock.match(/manifestFile:\\"([^\\"]+)\\"|manifestFile:'([^']+)'/);
if(!mm) throw new Error('manifestFile no encontrado en build-lock.js');
const m=JSON.parse(fs.readFileSync(path.join(root,mm[1]||mm[2]),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
let diffs=0;const entries=[];
for(const f of [...m.changedRuntimeFiles].sort((a,b)=>a.path.localeCompare(b.path))){const p=path.join(root,f.path);if(!fs.existsSync(p)){console.error('FALTA',f.path);diffs++;continue;}const b=fs.readFileSync(p);const h=sha(b);if(h!==f.sha256){console.error('HASH',f.path);diffs++;}if(b.length!==f.size){console.error('SIZE',f.path);diffs++;}entries.push(f.path+'\\0'+h+'\\n');}
const aggregate=sha(Buffer.from(m.parentAggregateSha256+'\\0'+entries.join(''),'utf8'));
if(aggregate!==m.aggregateSha256){console.error('AGGREGATE',aggregate,m.aggregateSha256);diffs++;}
console.log(JSON.stringify({changedFiles:m.changedRuntimeFiles.length,effectiveRuntimeFileCount:m.effectiveRuntimeFileCount,aggregateSha256:aggregate,differences:diffs},null,2));
process.exit(diffs?1:0);
`);

fs.writeFileSync('app/docs/RESULTADO-EMPALME-DIRECTO-V156-20260716.md',`# Resultado — empalme directo V156

Fecha: 2026-07-16

- Decisión: **PASS_EMPALME_DIRECTO_V156**.
- Candidata V156: transporte SHA-256 \`1ecfe9b05f9ed5cdd2940483db3dd76c1f515b4bdd8c545a4121d03179c01637\`.
- Manifest candidato: 205 archivos, aggregate \`0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305\`, 0 diferencias.
- Delta aplicado: 35 archivos runtime modificados, 0 eliminados.
- V131 + R18D queda como rollback.
- Backend, contratos, adapters, tools, documentación y overlays TyA acumulados fueron preservados.
- \`core/finanzas-core.js\` proviene de V156 y conserva la semántica R18D proyecto/periodo.
- Source lock activo: \`docs/MANIFEST-V156-EMPALME-DIRECTO-R1.json\`.
- Siguiente bloque: gates post-empalme de proyecto/periodo/KPI/histórico, 14 periodos, 616 visitas, 44 por periodo, 216 shoppers, junio ejecutado/pagos pendientes y smoke Admin/Shopper/Cliente.
- Estado seguro: sin merge, deploy, producción, importaciones, writes, integraciones live ni pagos reales.
`);

const prepend=(file,marker,block)=>{const old=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';if(!old.includes(marker))fs.writeFileSync(file,block+'\n'+old);};
prepend('CAMBIOS-BACKEND.md','EMPALME_DIRECTO_V156_CERRADO',`# EMPALME_DIRECTO_V156_CERRADO — 2026-07-16

- V156 empalmada físicamente en la rama viva mediante 35 archivos runtime y 0 eliminados.
- Backend, contratos, adapters, tools, documentación y overlays TyA preservados.
- Manifest derivado, build-lock, verificador y resultado generados.
- Gates y smoke pasan al bloque post-empalme previo a DEV/producción.
- Clasificación: Reusable CXOrbia = método directo/source lock; Exclusivo cliente = gates TyA; Claude/prototipo = V156 activa; Academia = smoke de rutas/contenidos; Sin impacto Claude = manifest/verificador.
- Estado seguro: sin merge, deploy, producción, imports, writes, Make/Gemini live ni pagos.`);
prepend('RESUMEN-PARA-CLAUDE.md','EMPALME_DIRECTO_V156_CERRADO',`# EMPALME_DIRECTO_V156_CERRADO — 2026-07-16

- V156 es la baseline frontend activa y ya fue empalmada físicamente.
- No generar otra candidata ni reabrir V110/V131.
- Backend preservó contratos, tools y overlays sin reescribir módulos UI.
- Pendiente inmediato no Claude: gates y smoke post-empalme TyA.
- Cualquier falla posterior se corrige focalizadamente sobre V156.`);
prepend('PENDIENTES-PROTOTIPO.md','EMPALME_DIRECTO_V156_CERRADO',`# EMPALME_DIRECTO_V156_CERRADO — 2026-07-16

- No existe P0 nuevo que bloquee la baseline V156.
- Permanecen P1/P2 ya documentados y hallazgos futuros del smoke post-empalme.
- No pedir otra candidata por el empalme.
- Academia, rutas por rol, notificaciones y copy honesto se validan sobre V156.`);

const registryPath='backend/contracts/prototype-baseline-registry-v1.json';
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
registry.version='1.4.0';registry.updatedAt='2026-07-16';
registry.previousBaseline={...registry.activeBaseline,status:'superseded_by_v156'};
registry.activeBaseline={version:'V156',runtimeIdentity:'V156 empalme directo sobre V131 + R18D',status:'accepted_and_empalmed',sourceZipSha256:'1ecfe9b05f9ed5cdd2940483db3dd76c1f515b4bdd8c545a4121d03179c01637',sourceCandidateManifestAggregateSha256:'0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305',manifestFile:'docs/MANIFEST-V156-EMPALME-DIRECTO-R1.json',aggregateSha256:aggregate,accepted:true,empalmed:true,gatesPostEmpalme:'pending_before_dev_or_production',preservedOverlays:['TYA_PROJECT_PERIOD_CONTEXT_R15G','R18D_FINANCE_PERIOD_ADAPTER_HF1']};
registry.candidate={version:'V156',status:'accepted_and_empalmed',accepted:true,empalmed:true,gateDecision:'PASS_EMPALME_DIRECTO_V156'};
registry.promotionRule={method:'direct_delta_after_audit',preEmpalme:['zip_identity_manifest','delta','syntax_scripts_security','p0_decision'],postEmpalmeBeforeDevOrProduction:['project_period_kpi_history','source_safe_role_smoke','phase_a_operational_gates'],noParallelRoutes:true};
fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
console.log(JSON.stringify({aggregateSha256:aggregate,changedRuntimeFiles:files.length},null,2));
