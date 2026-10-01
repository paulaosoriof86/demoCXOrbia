#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd(),OUT=process.env.FINAL_FOCAL_OUT||'.tmp/prei4-final-focal';
fs.mkdirSync(OUT,{recursive:true});
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const F={
 reservas:read('app/modules/reservas.js'),post:read('app/modules/postulaciones.js'),
 visit:read('app/modules/visita-detalle.js'),mis:read('app/modules/misvisitas.js'),
 app:read('app/app.js'),cmd:read('app/adapters/cxorbia-cxdata-command-boundary-v1.js'),
 bridge:read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js'),
 auth:read('app/core/backend-browser-auth.js'),cert:read('app/modules/cert.js'),
 ui:read('app/core/ui.js'),fin:read('app/modules/finanzas.js'),
 finp:read('backend/runtime/cxorbia-finance-command-provider-v1.mjs'),
 ops:read('backend/runtime/cxorbia-operational-command-provider-v1.mjs'),
 hr:read('tools/hr-source/tya-build-live-hr-source-safe-r20.mjs'),
 tabs:read('tools/hr-source/tya-enforce-live-tab-registry.mjs')
};
const tests=[],add=(id,ok)=>tests.push({id,pass:!!ok});
add('VRM122_LIVE_HR_RESERVATION_SET',/__liveHrVisits/.test(F.reservas)&&/_futureEligible/.test(F.reservas)&&/RESERVATION_ELIGIBLE_VISIT_REQUIRED/.test(F.reservas));
add('VRM122_PROVIDER_EXACT_VISIT',/OPS_RESERVATION_VISIT_NOT_AVAILABLE/.test(F.ops)&&/OPS_RESERVATION_BRANCH_NOT_ELIGIBLE/.test(F.ops)&&/OPS_RESERVATION_FUTURE_WINDOW_REQUIRED/.test(F.ops));
add('VRM123_PAST_DATE_FAIL_CLOSED',/before_today/.test(F.visit)&&/OPS_APPLICATION_PROPOSED_DATE_IN_PAST/.test(F.ops));
add('VRM123_SINGLE_TRANSITION',/transitioned_to_assignment/.test(F.ops)&&/postulationLifecycle!=='transitioned_to_assignment'/.test(F.post));
add('VRM124_NO_FULL_RELOAD',!/location\.reload\s*\(/.test(F.reservas+F.post));
add('VRM124_ROUTE_SCROLL',/window\.scrollY/.test(F.reservas)&&/window\.scrollTo\(0,y\)/.test(F.reservas));
add('VRM125_PROPOSED_DATE',/proposedScheduleDate/.test(F.ops)&&/proposedScheduleDate/.test(F.mis));
add('VRM125_QUESTIONNAIRE_REQUEST',/<option value="cuestionario">Solicitar cuestionario<\/option>/.test(F.post));
add('VRM127_DURABLE_TARGETED_REQUEST',/pushDurable/.test(F.post)&&/shopperId:String\(post\.shopperId\)/.test(F.post)&&/idempotencyKey:\['admin-request'/.test(F.post));
add('VRM129_REASSIGN_ELIGIBILITY',/candidateAudit/.test(F.post)&&/otro país/.test(F.post)&&/otro proyecto/.test(F.post)&&/fuera de alcance autorizado/.test(F.post));
add('VRM130_TENANT_TIMEZONE',/CXORBIA_TENANT_TIMEZONE/.test(F.hr)&&/Intl\.DateTimeFormat/.test(F.hr)&&/CXORBIA_TENANT_TIMEZONE/.test(F.tabs));
add('VRM133_SELF_REG_GEO_UI',/rgCountry/.test(F.app)&&/rgMunicip/.test(F.app)&&/rgCity/.test(F.app)&&/Completa país, municipio y ciudad/.test(F.app));
add('VRM133_BOUNDARY_AND_HR_EXEMPT',/SHOPPER_SELF_REGISTRATION_GEO_REQUIRED/.test(F.cmd)&&/sourceType!=='hr_external'/.test(F.cmd));
add('VRM134_REFRESH_COALESCE',/Date\.now\(\)-appliedAt<30000/.test(F.bridge));
add('VRM135_AUTHORIZED_SHELL',/hasAuthorizedShell/.test(F.auth)&&/if\(hasAuthorizedShell\)return/.test(F.auth));
add('VRM126_CERT_POLICY',/certificationReviewPolicy/.test(F.cert)&&/distinctReviewerRequired/.test(F.cert));
add('VRM126_MODAL_TRANSACTIONAL',/dismissOnBackdrop:false/.test(F.cert)&&/dismissOnBackdrop!==false/.test(F.ui));
add('VRM132_DURABLE_FINANCE_COMMANDS',/finance\.movement\.create/.test(F.finp)&&/finance\.account\.create/.test(F.finp)&&/finance\.account\.apply/.test(F.finp));
add('VRM132_NO_DOUBLE_REVENUE',/cashCollection:isReceivable/.test(F.finp)&&/revenueRecognized:false/.test(F.finp));
add('VRM132_FINANCING_NONOPERATING',/nonOperating/.test(F.finp)&&/origin:'financiamiento'/.test(F.finp));
add('VRM132_CONNECTED_ACK_UI',/admin-financing-create/.test(F.fin)&&/admin-auto-cxp-from-liquidation/.test(F.fin)&&/applyFinanceAccount/.test(F.fin));
add('VRM132_NO_LOCAL_DURABLE_DELETE',/El movimiento durable no se elimina localmente/.test(F.fin));
const passed=tests.filter(x=>x.pass).length;
const result={schemaVersion:'cxorbia.prei4.final-focal.source.v1',decision:passed===tests.length?'PASS_PREI4_FINAL_FOCAL_SOURCE':'FAIL_PREI4_FINAL_FOCAL_SOURCE',passed,total:tests.length,tests,production:false,writes:0};
fs.writeFileSync(path.join(OUT,'source-contracts.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(passed!==tests.length)process.exit(1);
