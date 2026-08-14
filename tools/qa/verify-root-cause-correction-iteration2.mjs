#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const assert=(v,m)=>{if(!v)throw new Error(m);};

const entry=read('app/index-backend-dev.html');
const commands=read('app/adapters/cxorbia-command-adapter-v1.js');
const boundary=read('app/adapters/cxorbia-cxdata-command-boundary-v1.js');
const shopperContract=read('app/adapters/cxorbia-shopper-admin-command-contract-v1.js');
const hr=read('app/adapters/cxorbia-hr-write-adapter-contract-v1.js');
const shoppersStore=read('app/core/shoppers-store.js');
const mis=read('app/modules/misvisitas.js');
const firewall=read('app/adapters/cxorbia-canonical-write-firewall-v1.js');
const readonly=read('app/core/backend-cxdata-readonly-corte4.js');
const firebase=read('app/core/backend-firebase.js');

for(const f of ['app/adapters/cxorbia-command-adapter-v1.js','app/adapters/cxorbia-cxdata-command-boundary-v1.js','app/adapters/cxorbia-shopper-admin-command-contract-v1.js','app/adapters/cxorbia-hr-write-adapter-contract-v1.js','app/adapters/cxorbia-canonical-write-firewall-v1.js','app/core/shoppers-store.js','app/modules/misvisitas.js']){
  assert(fs.existsSync(f),`I2_FILE_MISSING:${f}`);
}

/* Entrypoint: I1 contracts are now actually loaded; the final mutation owner installs AFTER the
   legacy read-only guard so backend-ready events cannot leave the legacy mutators restored. */
for(const token of ['adapters/cxorbia-command-adapter-v1.js','adapters/cxorbia-shopper-admin-command-contract-v1.js','adapters/cxorbia-hr-write-adapter-contract-v1.js','adapters/cxorbia-cxdata-command-boundary-v1.js','adapters/cxorbia-canonical-write-firewall-v1.js'])assert(entry.includes(token),`I2_ENTRY_MISSING:${token}`);
assert(entry.indexOf('core/backend-cxdata-readonly-corte4.js')<entry.indexOf('adapters/cxorbia-cxdata-command-boundary-v1.js'),'I2_BOUNDARY_MUST_OWN_FINAL_MUTATION_INTERFACE');
assert(entry.indexOf('adapters/cxorbia-cxdata-command-boundary-v1.js')<entry.indexOf('modules/misvisitas.js'),'I2_BOUNDARY_NOT_READY_BEFORE_UI');
assert(entry.includes("persistenceRequired:{owner:'cx.data-command-boundary',localMutation:false,localStorageTruth:false,providerAck:true}"),'I2_ENTRY_PERSISTENCE_CONTRACT_MISSING');

/* Public CX.data mutation names stay present but are owned by commands. */
for(const token of ['D.addProject=function','D.addShopper=function','D.updateShopper=function','D.setVisitState=function','D.assignVisit=function','D.payVisits=function','D.setApplicationStatus=function','D.requestVisitReschedule=function','D.requestVisitCancel=function','D.submitQuestionnaire=function'])assert(boundary.includes(token),`I2_CXDATA_COMMAND_METHOD_MISSING:${token}`);
assert(boundary.includes("D.__firebaseWrapped=true"),'I2_LEGACY_FIREBASE_WRAPPER_NOT_PREEMPTED');
assert(boundary.includes('D.__localMutationFallback=false'),'I2_LOCAL_MUTATION_FALLBACK_NOT_DISABLED');
assert(boundary.includes('D.__localStorageWriteFallback=false'),'I2_LOCALSTORAGE_FALLBACK_NOT_DISABLED');
assert(!boundary.includes('localStorage.setItem'),'I2_BOUNDARY_WRITES_LOCALSTORAGE');
assert(!boundary.includes("'cinepolis'"),'I2_BOUNDARY_HARDCODES_PROJECT');
assert(!commands.includes("'cinepolis'"),'I2_COMMAND_ADAPTER_HARDCODES_PROJECT');
assert(commands.includes('providerAuthorizationRequired:true'),'I2_PROVIDER_AUTHORIZATION_REQUIREMENT_MISSING');
assert(commands.includes('COMMAND_PROJECT_SCOPE_DENIED'),'I2_PROJECT_SCOPE_FAIL_CLOSED_MISSING');
assert(commands.includes('COMMAND_SHOPPER_SCOPE_DENIED'),'I2_SHOPPER_SCOPE_FAIL_CLOSED_MISSING');
assert(commands.includes('successRequiresProviderAck:true'),'I2_PROVIDER_ACK_CONTRACT_MISSING');

/* Shopper localStorage may survive only in explicit demo/lab, never canonical. */
assert(shoppersStore.includes('const localPersistenceAllowed=!canonical'),'I2_SHOPPER_LOCALSTORE_NOT_DEMO_ONLY');
assert(shoppersStore.includes("mode:localPersistenceAllowed?'explicit-demo-local':'canonical-provider-only'"),'I2_SHOPPER_STORE_MODE_MISSING');
assert(shopperContract.includes('protectedProfilePolicy:protectionContract()'),'I2_PROTECTED_SHOPPER_PROFILE_POLICY_MISSING');
assert(shopperContract.includes('encryptAtRestRequired:true'),'I2_PROTECTED_SHOPPER_ENCRYPTION_CONTRACT_MISSING');
assert(shopperContract.includes('browserPersistenceAllowed:false'),'I2_PROTECTED_SHOPPER_BROWSER_PERSISTENCE_NOT_BLOCKED');

/* Mis Visitas P0 is closed at source: complete arrays + canonical facets + ACK only. */
assert(mis.includes('CX_MISVISITAS_CANONICAL_V2'),'I2_MISVISITAS_CANONICAL_MARKER_MISSING');
assert(mis.includes('assigned.map(visitCard)')&&mis.includes('scheduled.map(visitCard)')&&mis.includes('realized.map(visitCard)'),'I2_MISVISITAS_COMPLETE_ARRAYS_MISSING');
assert(!mis.includes("base.find(v=>v.estado==='asignada')"),'I2_MISVISITAS_FIND_ONE_REGRESSION');
assert(mis.includes('ackAware:true'),'I2_MISVISITAS_ACK_AWARE_MISSING');
assert(!mis.includes('v.reprog=true'),'I2_MISVISITAS_DIRECT_REPROGRAM_MUTATION');
assert(!mis.includes('v.geoCheckin='),'I2_MISVISITAS_DATA_GEO_LOCAL_MUTATION');

/* Direct legacy closure/localStorage UI paths are fail-closed until their ACK-aware conversion. */
for(const token of ["#pGroups [data-edit]","#pGroups [data-reasig]",'qSubmit','rNew','aCruzar','aAsignar'])assert(firewall.includes(token),`I2_WRITE_FIREWALL_GAP:${token}`);
assert(firewall.includes('event.stopImmediatePropagation()'),'I2_WRITE_FIREWALL_NOT_HARD_STOP');
assert(firewall.includes('CX.data.setApplicationStatus'),'I2_POSTULATION_STATUS_NOT_COMMAND_ROUTED');
assert(firewall.includes('CX.data.requestVisitReschedule'),'I2_REPROGRAM_NOT_COMMAND_ROUTED');
assert(firewall.includes('CX.data.requestVisitCancel'),'I2_CANCEL_NOT_COMMAND_ROUTED');

/* Existing split-brain sources may remain for explicit demo/history, but canonical final owner is
   no longer allowed to call them: the boundary marks __firebaseWrapped and re-installs after the
   legacy readonly guard's backend events. */
assert(firebase.includes('wrapDataMethods'),'I2_HISTORICAL_FIREBASE_WRAPPER_LINEAGE_MISSING');
assert(readonly.includes('restoreCxDataInterface'),'I2_HISTORICAL_READONLY_LINEAGE_MISSING');
assert(boundary.includes("['backend-loaded','backend-ready','backend-error'"),'I2_BOUNDARY_REINSTALL_EVENTS_MISSING');

/* Execute the reusable command contract in a VM: writes disabled => no local mutation; provider
   ACK is mandatory; project scope mismatch fails closed. */
const context={console,setTimeout,clearTimeout,queueMicrotask,TextEncoder,Date,Promise,Map,Set,Object,Array,String,Number,Boolean,JSON,Math,Error,globalThis:null};
context.globalThis=context;context.window=context;context.document={readyState:'complete'};context.addEventListener=()=>{};
context.CX={BACKEND:{enabled:true,tenantId:'tenant-a',defaultProjectId:'project-a',enableCommandWrites:false},session:{role:'admin',testRole:null,user:{id:'staff-1',role:'admin',tenantId:'tenant-a',projectIds:['project-a']},effectiveRole(){return'admin';}},data:{currentPeriodId:'period-1',ctx(){return{tenantId:'tenant-a',projectId:'project-a',periodId:'period-1'};},_visitas:[{id:'v1',projectId:'period-1',estado:'asignada',updatedAt:'r1'}],_posts:[]},bus:{emit(){},on(){}},ui:{toast(){}}};
vm.createContext(context);vm.runInContext(commands,context,{filename:'command-adapter'});vm.runInContext(boundary,context,{filename:'cxdata-boundary'});
const before=JSON.stringify(context.CX.data._visitas[0]);
const blockedResult=await context.CX.data.setVisitState('v1','agendada','agendada','2026-08-20',{ackAware:true});
assert(blockedResult.ok===false&&blockedResult.status==='blocked'&&blockedResult.localMutation===false,'I2_DISABLED_WRITE_NOT_BLOCKED');
assert(JSON.stringify(context.CX.data._visitas[0])===before,'I2_DISABLED_WRITE_MUTATED_LOCAL_VISIT');
let unconvertedThrew=false;try{context.CX.data.setVisitState('v1','agendada','agendada','2026-08-20');}catch(e){unconvertedThrew=e?.cxCommandBlocked===true;}assert(unconvertedThrew,'I2_UNCONVERTED_CALLER_NOT_FAIL_CLOSED');

context.CX.BACKEND.enableCommandWrites=true;
context.CX.commandAdapter.registerTransport('mock',{async execute(command){return{ok:true,status:'committed',providerAck:true,providerRevision:'mock-r2',echo:command.commandType};}});
context.CX.commandAdapter.useTransport('mock');
const committed=await context.CX.data.setVisitState('v1','agendada','agendada','2026-08-20',{ackAware:true});
assert(committed.ok===true&&committed.providerAck===true&&committed.successUiAllowed===true,'I2_PROVIDER_ACK_SUCCESS_CONTRACT_FAILED');
assert(JSON.stringify(context.CX.data._visitas[0])===before,'I2_PROVIDER_ACK_MUST_REFRESH_NOT_MUTATE_LOCAL_FIRST');
const outScope=await context.CX.commandAdapter.execute({commandType:'visit.state.update',entityType:'visit',entityId:'v2',tenantId:'tenant-a',projectId:'project-b',actor:{actorId:'staff-1',role:'admin',projectIds:['project-a']},expectedVersion:'r1',idempotencyKey:'scope-test',payload:{visitId:'v2'},authorization:{providerEnforcementRequired:true}});
assert(outScope.code==='COMMAND_PROJECT_SCOPE_DENIED'&&outScope.ok===false,'I2_PROJECT_SCOPE_TEST_FAILED');

console.log('PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE');
console.log(JSON.stringify({iteration:2,sourceReadyForDevWriteGates:true,cxDataPublicNamesPreserved:true,localMutationFallback:false,shopperLocalStorageCanonical:false,misvisitasCompleteArrays:true,canonicalFacets:true,providerAckRequired:true,directLegacyUiWritesFailClosed:true,multiTenantProjectContract:true,providerWrites:0,deploys:0,production:false},null,2));
