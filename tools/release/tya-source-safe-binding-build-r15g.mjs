#!/usr/bin/env node
/* CXOrbia TyA Phase A — canonical R15G/R20 overlay over the R15F build copy. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

await import('./tya-source-safe-binding-build-r15f.mjs');

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const appDir=path.resolve(valueOf('--app-dir','app'));
const adapterSrc=valueOf('--adapter-src','adapters/tya-phase-a-source-safe-dev-adapter.js');
const adapterFile=path.join(appDir,adapterSrc);
const outDir=path.resolve(valueOf('--out','.tmp/source-safe-binding-r15g'));
const fail=m=>{console.error(`R15G_BINDING_FAIL: ${m}`);process.exit(1);};
if(!fs.existsSync(adapterFile)) fail(`Generated adapter missing: ${adapterFile}`);
let code=fs.readFileSync(adapterFile,'utf8');

code=code.replace(/id:'tya',\s*clientName:'TyA'/,"id:'tya', tenantId:'tya', clientName:'TyA'");
code=code.replace(/CX\.data\.currentProjectId\s*=\s*latest\s*&&\s*latest\.id;/,"CX.data.currentProjectId = 'cinepolis';\n  CX.data.currentPeriodId = latest && latest.id;");
code=code.replace(/currentPeriodId:CX\.data\.currentProjectId,/,'currentPeriodId:CX.data.currentPeriodId,');
code=code.replace(/CX\.dataSource\.warnings\s*=\s*shoppers\.length\s*===\s*210\s*\?[^;]+;/,"CX.dataSource.warnings = shoppers.length === 216 ? [] : ['Conteo shopper source-safe distinto al snapshot aprobado: ' + shoppers.length + '/216.'];");
code=code.replace(/tenantId:'tya',\s*projectId:'cinepolis',\s*projectName:'Cinépolis',\s*sourceTitle:/,"tenantId:'tya', projectId:'cinepolis', projectName:'Cinépolis', activePeriodId:latest && latest.id, sourceTitle:");

if(!code.includes('canonicalFacets:v.canonicalFacets')){
  code=code.replace(/estado:v\.estado\s*\|\|\s*'disponible',/,"estado:v.estado || 'disponible', canonicalState:v.canonicalState || null, operationalState:v.operationalState || null, assignmentState:v.assignmentState || null, schedulingState:v.schedulingState || null, executionState:v.executionState || null, questionnaireState:v.questionnaireState || null, submissionState:v.submissionState || null, liquidationState:v.liquidationState || null, paymentState:v.paymentState || null, canonicalFacets:v.canonicalFacets || null, liquidationCandidate:v.liquidationCandidate === true, paymentControlOnly:v.paymentControlOnly === true, paymentConfirmed:v.paymentConfirmed === true, outOfRange:v.outOfRange === true, paymentSourceRef:v.paymentSourceRef || null, financialControl:v.financialControl || null, liquidationEvidence:v.liquidationEvidence || null, paymentEvidence:v.paymentEvidence || null,");
}
if(!code.includes("v.submissionState === 'confirmed_hr'")){
  code=code.replace(/submit:!!v\.submit,\s*submittedAt:v\.submittedAt\s*\|\|\s*null,\s*assignmentSource:v\.hasShopper\s*\?\s*'hr'\s*:\s*null,\s*assignmentSyncStatus:'hr_live_source_safe_preview',\s*reviewRequired:false,/,"submit:Boolean(v.submit || v.submittedAt || v.submissionState === 'confirmed_hr'), submittedAt:v.submittedAt || null, assignmentSource:v.assignmentSource || (v.hasShopper ? 'hr' : null), assignmentSyncStatus:v.assignmentSyncStatus || 'hr_live_source_safe_preview', lastSyncedAt:v.lastSyncedAt || null, reviewRequired:v.reviewRequired === true, reviewReasons:Array.isArray(v.reviewReasons) ? v.reviewReasons : [],");
}

const shopperAnchor="CX.data.currentProgramKey = function(){ return 'cinepolis'; };";
if(code.includes(shopperAnchor)&&!code.includes('CX.data.shopperDataLevel = function(shopper)')){
  code=code.replace(shopperAnchor,`${shopperAnchor}
  const baseShopperDataLevel=typeof CX.data_shopperDataLevel==='function'?CX.data_shopperDataLevel:null;
  CX.data_shopperDataLevel=function(shopper){const declared=shopper&&shopper.dataLevel;if(['protected_reference','operational_profile','full_authorized_profile'].includes(declared))return declared;return baseShopperDataLevel?baseShopperDataLevel(shopper):'protected_reference';};
  CX.data.shopperDataLevel=function(shopper){return CX.data_shopperDataLevel(shopper);};
  const baseShopperActivo=typeof CX.data.shopperActivo==='function'?CX.data.shopperActivo.bind(CX.data):null;
  CX.data.shopperActivo=function(shopper){if(CX.data_shopperDataLevel(shopper)==='protected_reference')return false;return baseShopperActivo?baseShopperActivo(shopper):false;};`);
}

if(code.includes(shopperAnchor)&&!code.includes('R20_CANONICAL_VISIT_STATE_BINDING')){
  code=code.replace(shopperAnchor,`${shopperAnchor}
  /* R20_CANONICAL_VISIT_STATE_BINDING — todos los periodos HR usan la misma verdad. */
  CX.tenantProfile=Object.assign({},CX.tenantProfile||{}, {
    tenantId:'tya', name:'TyA', countries:['GT','HN'], activeProjectIds:['cinepolis'],
    visibleLoginRoles:['admin','ops','shopper'], hiddenLoginRoles:['cliente','coordinador','aliado'],
    showCountryFlags:true, allowShopperRegistration:true, sourceSafe:true, runtimePersisted:false
  });
  CX.data.visitFacets=function(v){
    const c=v&&v.canonicalFacets||{};
    const assigned=c.assigned===true || (v&&v.assignmentState==='assigned');
    const scheduled=c.scheduled===true || (v&&v.schedulingState==='scheduled');
    const realized=c.realized===true || (v&&v.executionState==='realized');
    const questionnaire=c.questionnaire===true || (v&&v.questionnaireState==='completed');
    const submitted=c.submitted===true || (v&&v.submissionState==='confirmed_hr');
    const liquidationCandidate=c.liquidationCandidate===true || (v&&v.liquidationCandidate===true) || submitted;
    const liquidationConfirmed=c.liquidationConfirmed===true || (v&&v.liquidationState==='confirmed');
    const paymentConfirmed=c.paymentConfirmed===true || (v&&v.paymentState==='confirmed') || (v&&v.paymentConfirmed===true);
    return {assigned,scheduled,realized,questionnaire,submitted,liquidationCandidate,liquidationConfirmed,paymentConfirmed,outOfRange:c.outOfRange===true||v?.outOfRange===true,cancelled:c.cancelled===true||v?.estado==='cancelada'};
  };
  CX.data.visitBucketFns={
    total:()=>true,
    asignadas:v=>CX.data.visitFacets(v).assigned,
    sinAsignar:v=>{const f=CX.data.visitFacets(v);return !f.assigned&&!f.realized&&!f.cancelled;},
    sinAgendar:v=>{const f=CX.data.visitFacets(v);return f.assigned&&!f.scheduled&&!f.realized&&!f.cancelled;},
    agendadas:v=>{const f=CX.data.visitFacets(v);return f.scheduled&&!f.realized&&!f.cancelled;},
    pendRealizar:v=>{const f=CX.data.visitFacets(v);return f.scheduled&&!f.realized&&!f.cancelled;},
    realizadas:v=>CX.data.visitFacets(v).realized,
    cuestPend:v=>{const f=CX.data.visitFacets(v);return f.realized&&!f.questionnaire&&!f.cancelled;},
    sinSubmitir:v=>{const f=CX.data.visitFacets(v);return f.questionnaire&&!f.submitted&&!f.cancelled;},
    submitidas:v=>CX.data.visitFacets(v).submitted,
    liquidables:v=>CX.data.visitFacets(v).liquidationCandidate,
    liquidadas:v=>CX.data.visitFacets(v).liquidationConfirmed,
    pagadas:v=>CX.data.visitFacets(v).paymentConfirmed,
    fueraRango:v=>CX.data.visitFacets(v).outOfRange
  };
  CX.data.visitContract=function(v){const f=CX.data.visitFacets(v);return Object.assign({id:v&&v.id||null},f,{currentAction:v&&v.operationalState||null,reviewRequired:v&&v.reviewRequired===true,reviewReasons:Array.isArray(v&&v.reviewReasons)?v.reviewReasons:[]});};
  CX.data.periodOperationalSummary=Array.isArray(snapshot.periodOperationalSummary)?snapshot.periodOperationalSummary:[];
  CX.data.periodKpis=function(periodRef){
    const key=String(periodRef||'').replace(/^cinepolis-/,'');
    const row=this.periodOperationalSummary.find(item=>item.periodKey===key);
    return row?JSON.parse(JSON.stringify(row)):null;
  };
  CX.data.recentPeriodKpis=function(limit){return this.periodOperationalSummary.slice(-Math.max(1,Number(limit)||3)).map(item=>JSON.parse(JSON.stringify(item)));};
  function applyR20RuntimeOverrides(){
    if(CX.liq){
      const baseLabel=CX.liq.label.bind(CX.liq);
      CX.liq.estadoFromVisita=function(v){const f=CX.data.visitFacets(v);if(f.paymentConfirmed)return 'pagada';if(f.liquidationConfirmed||f.submitted)return 'pendiente_pago';if(f.questionnaire)return 'pendiente_submitir';if(f.realized)return 'pendiente_cuestionario';return null;};
      CX.liq.label=function(state){if(state==='pendiente_pago')return ['Pend. pago · cruce financiero','a'];return baseLabel(state);};
    }
    if(CX.ui&&typeof CX.ui.estadoBadge==='function'){
      const baseBadge=CX.ui.estadoBadge.bind(CX.ui);
      CX.ui.estadoBadge=function(state){if(state==='submitida')return '<span class="bdg bdg-b">Submitida</span>';if(state==='pagada')return '<span class="bdg bdg-g">Pagada</span>';return baseBadge(state);};
    }
    const allowed=new Set(CX.tenantProfile.visibleLoginRoles||[]);
    const applyLoginVisibility=()=>{
      const login=document.getElementById('login');if(!login)return;
      login.querySelectorAll('[data-role]').forEach(el=>{el.style.display=allowed.has(el.dataset.role)?'':'none';});
      const alt=login.querySelector('.role-alt[data-role="ops"]');if(alt){alt.textContent='👥 Operativo';alt.title='Acceso operativo autorizado para este tenant';}
    };
    setTimeout(applyLoginVisibility,0);
    const login=document.getElementById('login');if(login&&window.MutationObserver)new MutationObserver(applyLoginVisibility).observe(login,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyR20RuntimeOverrides);else applyR20RuntimeOverrides();`);
}

const invariants={
  tenant:code.includes("tenantId:'tya'"),
  project:code.includes("CX.data.currentProjectId = 'cinepolis';"),
  period:code.includes('CX.data.currentPeriodId = latest && latest.id;'),
  visiblePeriod:code.includes('currentPeriodId:CX.data.currentPeriodId,'),
  shopperReference:code.includes("dataLevel:'protected_reference'")&&code.includes('perfilCompleto:false')&&code.includes('visitas:undefined'),
  canonicalVisitState:code.includes('R20_CANONICAL_VISIT_STATE_BINDING')&&code.includes('CX.data.visitBucketFns'),
  tenantLoginProfile:code.includes("visibleLoginRoles:['admin','ops','shopper']"),
  financialSeparation:code.includes("return 'pendiente_pago'"),
  sourceSafe:code.includes('runtimeSyncActive:false')
};
const failures=Object.entries(invariants).filter(([,v])=>!v).map(([k])=>k);
if(failures.length) fail(`Canonical invariants missing: ${failures.join(', ')}`);
if(/CX\.data\.currentProjectId\s*=\s*latest\s*&&\s*latest\.id/.test(code)) fail('Period identity still overwrites project identity.');

fs.writeFileSync(adapterFile,code,'utf8');
fs.mkdirSync(outDir,{recursive:true});
const report={schemaVersion:'2.0.0',decision:'PASS_R20_CANONICAL_HISTORY_TENANT_LOGIN_BINDING',adapterFile:path.relative(process.cwd(),adapterFile).replaceAll('\\','/'),invariants,historyScope:'all_detected_hr_periods',shopperDataLevelPolicy:{explicitDeclarationPrecedence:true,protectedReferenceActive:false,historicalVisitCountVisibleAsOperationalFact:false,adapterRunsAfterShopperStore:true},safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false,frontendModulesModified:false,coreFilesModified:false}};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report,null,2));
