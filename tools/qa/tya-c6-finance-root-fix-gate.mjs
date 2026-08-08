#!/usr/bin/env node
/**
 * CXOrbia TyA — C6 finance root-fix predeploy gate.
 * Static + local runtime smoke. Read-only; no provider calls, deploys or writes.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(process.cwd());
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const must=(ok,code,detail='')=>{
  console.log(`${ok?'PASS':'FAIL'} ${code}${detail?` · ${detail}`:''}`);
  if(!ok)process.exitCode=1;
};

const model=read('app/adapters/tya-project-financial-model-contract-v1.js');
const unified=read('app/adapters/tya-c6-unified-human-runtime-v1.js');

const materializePos=model.indexOf('materializeAll(`${why}_before_normalization`)');
const normalizePos=model.indexOf('return normalizeAll(why)');
must(materializePos>=0&&normalizePos>materializePos,'C6_FINANCE_MATERIALIZES_BEFORE_NORMALIZE_ALL');
must(model.includes("tenantId:'tya',projectId:'cinepolis'")&&model.includes('source.configurationKey=key'),'C6_FINANCE_EXACT_TENANT_PROJECT_REGISTRY');
must(model.includes('project.parentProjectId||project.program||')&&model.includes("financialConfigurationSource='exact_tenant_project_registry'"),'C6_FINANCE_TECHNICAL_PROJECT_RESOLUTION');
must(!/project\.(name|nombre|clientName|programLabel)\b/.test(model),'C6_FINANCE_NO_DISPLAY_NAME_CLASSIFICATION');
must(model.includes("model:'delegado'")&&model.includes("billingModel:'delegated_coordination'")&&model.includes('localBilling:false')&&model.includes('royaltyApplicable:false')&&model.includes('royalty:0')&&model.includes('honorarium:{GT:60,HN:200}'),'C6_FINANCE_CINEPOLIS_DELEGATED_CONTRACT');
must(model.includes("window.addEventListener('cx:live-source-updated'")&&model.includes("window.addEventListener('cx:protected-auth-hr-authority-ready'")&&model.includes("CX.bus.on('backend-ready'"),'C6_FINANCE_PRENORMALIZATION_EVENT_BINDINGS');
must(unified.includes("normalizeAll?.('unified_runtime_financial_configuration')"),'C6_FINANCE_EXISTING_RUNTIME_CONSUMER_PRESERVED');
const forbidden=/(?:setDoc|addDoc|updateDoc|deleteDoc|signInWithEmailAndPassword)\s*\(|firebase\s+deploy|production\s*:\s*true|enableDataWrites\s*:\s*true|enableOperationalWrites\s*:\s*true|method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/i;
must(!forbidden.test(model),'C6_FINANCE_ROOT_FIX_READONLY_NO_PROVIDER_WRITE');

const listeners=new Map();
const on=(name,fn)=>{if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn);};
const dispatch=name=>{for(const fn of listeners.get(name)||[])fn({type:name});};
const busListeners=new Map();
const context={
  console,Date,JSON,Map,Set,Object,Array,Number,String,Boolean,RegExp,Math,setTimeout,clearTimeout,
  addEventListener:on,
  dispatchEvent:event=>dispatch(event.type),
  CX:{
    BACKEND:{tenantId:'tya'},
    data:{
      previewMeta:{tenantId:'tya',projectId:'cinepolis'},
      currentPeriodId:'cinepolis-2026-07',
      projects:[
        {id:'cinepolis-2026-06',tenantId:'tya',parentProjectId:null,program:'cinepolis',periodKey:'2026-06',modelo:'directo',billingModel:'local_invoicing',projectModel:'local_billing',localBilling:true,royaltyApplicable:true,regalias:10,honorario:{}},
        {id:'cinepolis-2026-07',tenantId:'tya',parentProjectId:null,program:'cinepolis',periodKey:'2026-07',modelo:'directo',billingModel:'local_invoicing',projectModel:'local_billing',localBilling:true,royaltyApplicable:true,regalias:10,honorario:{}}
      ]
    },
    bus:{on:(name,fn)=>{if(!busListeners.has(name))busListeners.set(name,[]);busListeners.get(name).push(fn);}}
  }
};
context.window=context;
context.globalThis=context;
vm.createContext(context);
vm.runInContext(model,context,{filename:'tya-project-financial-model-contract-v1.js'});

const assertSingleTruth=(label)=>{
  const projects=context.CX.data.projects;
  const all=projects.every(p=>
    p.financialConfigurationKey==='tya::cinepolis'&&
    p.financialConfigurationMaterialized===true&&
    p.modelo==='delegado'&&
    p.billingModel==='delegated_coordination'&&
    p.projectModel==='delegado'&&
    p.localBilling===false&&
    p.royaltyApplicable===false&&
    Number(p.regalias)===0&&
    Number(p.honorario?.GT)===60&&
    Number(p.honorario?.HN)===200&&
    p.compensationModel==='coordination_commission_shared'&&
    p.coordinationCommission?.splitRule==='project_configuration'
  );
  must(all,`C6_FINANCE_${label}_CANONICAL_PROJECTS_SINGLE_TRUTH`,`${projects.length} periods`);
  const current=projects.find(p=>p.id===context.CX.data.currentPeriodId);
  context.CX.data.period=()=>current;
  context.CX.data.project=()=>current;
  const finance={model:current.modelo,billingModel:current.billingModel,localBilling:current.localBilling,royaltyApplicable:current.royaltyApplicable,royalty:Number(current.regalias),honorarium:current.honorario};
  must(context.CX.data.period()===context.CX.data.project()&&finance.model==='delegado'&&finance.localBilling===false&&finance.royalty===0,'C6_FINANCE_PERIOD_PROJECT_OUTPUT_CONSISTENT');
};

assertSingleTruth('SCRIPT_LOAD');
for(const p of context.CX.data.projects)Object.assign(p,{modelo:'directo',billingModel:'local_invoicing',projectModel:'local_billing',localBilling:true,royaltyApplicable:true,regalias:10});
dispatch('cx:live-source-updated');
assertSingleTruth('LIVE_SOURCE_EVENT');
for(const p of context.CX.data.projects)Object.assign(p,{modelo:'directo',billingModel:'local_invoicing',projectModel:'local_billing',localBilling:true,royaltyApplicable:true,regalias:10});
dispatch('cx:protected-auth-hr-authority-ready');
assertSingleTruth('PROTECTED_AUTHORITY_EVENT');
const status=context.CX_PROJECT_FINANCIAL_CONFIGURATION_MATERIALIZATION;
must(status?.ready===true&&status.matched===2&&status.unresolved===0&&status.exactTechnicalKeysOnly===true&&status.displayNameMatching===false&&status.valuesInvented===false,'C6_FINANCE_MATERIALIZATION_DIAGNOSTICS_PASS');
const contract=context.CX_PROJECT_FINANCIAL_MODEL_CONTRACT;
must(contract?.delegated===2&&contract?.direct===0&&contract?.unconfigured===0&&contract?.royaltyViolations===0&&contract?.defaultModelAssumed===false&&contract?.splitValuesInvented===false,'C6_FINANCE_NORMALIZER_CONTRACT_PASS');

if(process.exitCode){
  console.error('DECISION FAIL_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE');
  process.exit(process.exitCode);
}
console.log('DECISION PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE');
