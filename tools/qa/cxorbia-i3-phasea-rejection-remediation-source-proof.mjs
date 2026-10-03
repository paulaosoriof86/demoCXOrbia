import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const checks=[];
const pass=(name,fn)=>{fn();checks.push({name,pass:true});};

const midia=read('app/modules/midia.js');
const mis=read('app/modules/misvisitas.js');
const benefits=read('app/modules/beneficios.js');
const cert=read('app/modules/cert.js');
const router=read('app/core/router.js');
const shoppers=read('app/modules/shoppers.js');
const posts=read('app/modules/postulaciones.js');
const finance=read('app/adapters/tya-canonical-finance-read-model-v2.js');
const portal=read('app/adapters/tya-canonical-shopper-portal-v2.js');
const bridge=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
const css=read('app/styles/layout.css');
const ops=read('backend/runtime/cxorbia-operational-command-provider-v1.mjs');
const shopperProvider=read('backend/runtime/cxorbia-shopper-command-provider-v1.mjs');
const academy=read('app/modules/academia.js');

pass('canonical shopper portal is no longer preview-query gated',()=>{
  assert(!portal.includes("cxHumanFullVisual')!=='YES_PAULA_20260731_FULL_PROFILE_DEV"));
});
pass('shopper profile uses grouped hierarchy',()=>{
  assert(portal.includes('cx-profile-detail-grid'));
  assert(portal.includes('cx-profile-group-title'));
  assert(!portal.includes('setTimeout(()=>location.reload()'));
});
pass('protected HR bridge normalizes exact shopper session identity',()=>{
  assert(bridge.includes('CX.session.user.shopperId=canonicalSid'));
  assert(bridge.includes('(result.identityMap||{})[rawSid]'));
});
pass('operational provider resolves durable shopper identity crosswalk',()=>{
  assert(ops.includes("collection('shopperIdentityCrosswalk').doc(rawShopperId)"));
  assert(ops.includes('shopperId,rawShopperId'));
  assert(ops.includes('const existingStableVisitKey=str(existing.hrRowId)||sourceCoord(existing)||str(existing.visitId||existing.id||visitId)'));
});
pass('Mi Dia resolves its own visit list through canonical identity map',()=>{
  assert(midia.includes('data.__identityMap?.[_rawSid]'));
  assert(midia.includes('data.visitsForShopper?data.visitsForShopper(_mySid,false)'));
  assert(midia.includes("['Instructivo leído',!!nextVisit.instructiveReadAt]"));
  assert(midia.includes("['Certificación del proyecto',certDone]"));
});
pass('Mis Visitas uses canonical identity and exact route prerequisites',()=>{
  assert(mis.includes('data.__identityMap?.[rawSid]'));
  assert(mis.includes('const routeState=v=>'));
  assert(mis.includes("scheduleReady:!!v.instructiveReadAt&&certState.done"));
  assert(mis.includes("shopper_instructive_read_committed"));
  assert(mis.includes("shopper_visit_command_committed"));
});
pass('certification uses canonical identity and nonblocking reproject signal',()=>{
  assert(cert.includes('data.__identityMap?.[raw]'));
  assert(cert.includes("certification_attempt_committed"));
});
pass('Mis Beneficios consumes canonical finance visit projection',()=>{
  assert(finance.includes('fromVisit:(project,visit)=>derive(project,visit)'));
  assert(benefits.includes('CX_TYA_CANONICAL_FINANCE_READ_MODEL?.fromVisit'));
  assert(!benefits.includes('hoy la fuente mantiene 0 pagos confirmados'));
});
pass('Postulaciones includes HR and platform assignments',()=>{
  assert(posts.includes('Gestión de Postulaciones y Asignaciones'));
  assert(posts.includes('operationalAssignments=data.visitas()'));
  assert(posts.includes("assignmentOrigin=v=>"));
});
pass('Postulaciones rail badge resyncs after route render',()=>{
  assert(router.includes("document.querySelector('#nav-postulaciones .n-badge')"));
});
pass('Admin shopper completeness uses actual required fields',()=>{
  assert(shoppers.includes('const profileComplete=shopper=>missingProfileFields(shopper).length===0'));
  assert(shoppers.includes('Revisar / fusionar identidad'));
  assert(shoppers.includes('admin_manual_same_human_confirmation'));
  assert(shoppers.includes('id="shRequestProfile"'));
  assert(shoppers.includes('PROFILE_REQUEST_ACK_REQUIRED'));
});
pass('Academia course tones are solid and profile hierarchy styles exist',()=>{
  const toneLines=css.split(/\r?\n/).filter(l=>/cx-academy-course-card\.tone-/.test(l));
  assert(toneLines.length>=8);
  assert(toneLines.every(l=>!l.includes('linear-gradient')));
  assert(css.includes('.cx-profile-detail-grid'));
  assert(css.includes('.cx-profile-group-title'));
});
pass('Admin supports one explicit atomic multi-profile adjudication',()=>{
  assert(shoppers.includes('id="manualAliases" multiple'));
  assert(shoppers.includes('selectedRows=()=>[...aliasSel.selectedOptions]'));
  assert(shoppers.includes('aliases=allIds.filter(id=>id!==canonical)'));
  assert(shoppers.includes('todas las fichas seleccionadas corresponden a la misma persona'));
});
pass('identity provider resolves multiple strong principals only by exact canonical login',()=>{
  assert(shopperProvider.includes('const canonicalCredential=shopperCredentialRule(canonical)'));
  assert(shopperProvider.includes('canonicalLoginStrong.length!==1'));
  assert(shopperProvider.includes("throw new Error('SHOPPER_IDENTITY_MULTIPLE_PASSWORD_PROOF_PRINCIPALS')"));
});
pass('Academia assigns a distinct solid palette by visible course position',()=>{
  assert(academy.includes('filtered.map((c,courseIndex)=>'));
  assert(academy.includes("toneOrder[courseIndex%toneOrder.length]"));
  const toneLines=css.split(/\r?\n/).filter(l=>/cx-academy-course-card\.tone-/.test(l));
  const values=toneLines.map(l=>(l.match(/--acad-tone:([^}]+)/)||[])[1]).filter(Boolean);
  assert(new Set(values).size>=8);
});
pass('shopper identity provider behavioral regression suite passes',()=>{
  execFileSync(process.execPath,['--test','backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs'],{stdio:'pipe',timeout:120000});
});

const result={
  decision:'PASS_I3_PHASEA_REJECTED_CHECKPOINT_SOURCE_PROOF',
  checksPassed:checks.length,
  checksFailed:0,
  scope:[
    'shopper-canonical-identity',
    'admin-shopper-adjudication-and-instruction',
    'postulations-assignments',
    'visit-route-progression',
    'finance-benefits-projection',
    'profile-visual-hierarchy',
    'academy-solid-course-tones'
  ],
  sourceOnly:true,
  deploys:0,
  writes:0,
  production:false
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
