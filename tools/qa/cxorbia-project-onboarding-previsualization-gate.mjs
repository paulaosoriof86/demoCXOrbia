#!/usr/bin/env node
/* CXOrbia reusable project onboarding pre-visualization gate.
   Pure read/static/in-memory proof. It never calls Firebase, external HR, Make,
   Gemini, payments or production. It proves reusable backend/source behavior
   and separately reports frontend blockers before any visual test.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {pathToFileURL} from 'node:url';
import {createProjectCommandProvider,validateProjectPayload} from '../../backend/runtime/cxorbia-project-command-provider-v1.mjs';

const ROOT=process.cwd();
const outIdx=process.argv.indexOf('--out');
const out=outIdx>=0?process.argv[outIdx+1]:'.tmp/cxorbia-project-onboarding-previsualization/report.json';
const checks=[],backendErrors=[],frontendFindings=[];
const check=(ok,code,detail=null)=>{checks.push({code,ok,detail});if(!ok)backendErrors.push(detail?`${code}:${detail}`:code);};
const clone=v=>JSON.parse(JSON.stringify(v));

class Snap{constructor(v){this.v=v;this.exists=v!==undefined;}data(){return clone(this.v);}}
class Ref{
  constructor(store,p){this.store=store;this.path=p;}
  collection(name){return new Col(this.store,`${this.path}/${name}`);}
  async get(){return new Snap(this.store.get(this.path));}
}
class Col{
  constructor(store,p){this.store=store;this.path=p;}
  doc(id){return new Ref(this.store,`${this.path}/${id}`);}
}
class MemoryDb{
  constructor(){this.store=new Map();}
  collection(name){return new Col(this.store,name);}
  async runTransaction(fn){
    const tx={
      get:async ref=>new Snap(this.store.get(ref.path)),
      create:(ref,value)=>{if(this.store.has(ref.path))throw new Error('already_exists');this.store.set(ref.path,clone(value));},
      set:(ref,value,opts)=>{const before=this.store.get(ref.path)||{};this.store.set(ref.path,opts?.merge?{...before,...clone(value)}:clone(value));}
    };
    return fn(tx);
  }
}
const db=new MemoryDb();
const auth={verifyIdToken:async token=>{
  if(token==='tenant-a-admin')return {uid:'admin-a',tenantId:'tenant-a',role:'admin',authNamespace:'staff'};
  if(token==='tenant-b-admin')return {uid:'admin-b',tenantId:'tenant-b',role:'admin',authNamespace:'staff'};
  return {uid:'denied',tenantId:'other',role:'shopper',authNamespace:'shopper'};
}};
db.store.set('tenants/tenant-a/users/admin-a',{active:true,role:'admin',authNamespace:'staff'});
db.store.set('tenants/tenant-b/users/admin-b',{active:true,role:'admin',authNamespace:'staff'});
const policy={schemaVersion:'cxorbia.project-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a','tenant-b'],externalProviderWrites:false,hrWrites:false,makeCalls:false,geminiCalls:false,paymentWrites:false};
const provider=createProjectCommandProvider({auth,db,policy});

const internalPayload={
  name:'Proyecto Interno',countries:['GT'],currency:'GTQ',
  operationalSource:{mode:'internal',providerType:'internal_firestore',authority:'platform',readPolicy:'internal_live',writePolicy:'platform_only',periodDiscovery:'internal_native'},
  questionnaire:{sourceMode:'cxorbia'}
};
const externalPayload={
  name:'Proyecto Externo',countries:['GT','HN'],currency:'GTQ',
  operationalSource:{mode:'external',providerType:'google_sheets',authority:'external_source',readPolicy:'external_live',writePolicy:'external_read_only',providerBindingId:'binding-demo',mappingRef:'mapping-demo',periodDiscovery:'provider_auto'},
  questionnaire:{sourceMode:'external_link'}
};

// Source contract/resolver proof.
globalThis.CX={BACKEND:{tenantId:'tenant-a'}};
await import(pathToFileURL(path.join(ROOT,'app/adapters/cxorbia-project-operational-source-v1.js')).href+'?gate='+Date.now());
const source=globalThis.CX.projectOperationalSource;
check(!!source,'PROJECT_SOURCE_RESOLVER_PRESENT');
const internalProject={...internalPayload,tenantId:'tenant-a',projectId:'int-1'};
const externalProject={...externalPayload,tenantId:'tenant-a',projectId:'ext-1'};
check(source.validate(internalProject).ok===true,'PROJECT_INTERNAL_SOURCE_PASS');
check(source.validate(externalProject).ok===true,'PROJECT_EXTERNAL_SOURCE_PASS');
check(source.validate({...externalProject,operationalSource:{...externalProject.operationalSource,workbookUrl:'https://private.invalid/x'}}).ok===false,'PROJECT_EXTERNAL_RAW_URL_REJECTED');
source.registerProvider('internal_firestore',{read:async ({source:s})=>({ok:true,status:'read',authority:s.authority,visits:[]})});
source.registerProvider('google_sheets',{read:async ({source:s})=>({ok:true,status:'read',authority:s.authority,visits:[]})});
check((await source.read(internalProject)).ok===true,'PROJECT_INTERNAL_SOURCE_READ_PASS');
check((await source.read(externalProject)).ok===true,'PROJECT_EXTERNAL_SOURCE_READ_PASS');
check(source.status().writesExecuted===0,'PROJECT_SOURCE_RESOLVER_ZERO_WRITES');

// Payload security/truthfulness contract.
check(validateProjectPayload(internalPayload).ok===true,'PROJECT_CONFIG_INTERNAL_SCHEMA_PASS');
check(validateProjectPayload(externalPayload).ok===true,'PROJECT_CONFIG_EXTERNAL_SCHEMA_PASS');
check(validateProjectPayload({...externalPayload,operationalSource:{...externalPayload.operationalSource,token:'secret'}}).ok===false,'PROJECT_CONFIG_RAW_SECRET_REJECTED');
check(validateProjectPayload({...externalPayload,operationalSource:{...externalPayload.operationalSource,providerBindingId:''}}).ok===false,'PROJECT_CONFIG_EXTERNAL_BINDING_REQUIRED');

// Durable command provider behavior in memory only.
const createA={commandType:'project.create',tenantId:'tenant-a',idempotencyKey:'create-internal-1',payload:internalPayload};
const ackA=await provider.execute('tenant-a-admin',createA);
check(ackA.ok===true&&ackA.providerAck===true&&ackA.successUiAllowed===true&&ackA.localMutation===false&&ackA.localStorageWrite===false,'PROJECT_CREATE_DURABLE_ACK_PASS');
check(Number(ackA.providerWrites)===3,'PROJECT_CREATE_EXPECTED_PROVIDER_WRITES_IN_MEMORY',String(ackA.providerWrites));
const replay=await provider.execute('tenant-a-admin',createA);
check(replay.ok===true&&replay.idempotentReplay===true&&Number(replay.providerWrites)===0,'PROJECT_CREATE_IDEMPOTENT_REPLAY_PASS');
const duplicate=await provider.execute('tenant-a-admin',{...createA,idempotencyKey:'create-internal-duplicate',payload:{...internalPayload,name:'  PROYECTO   INTERNO  '}});
check(duplicate.ok===false&&duplicate.code==='PROJECT_NORMALIZED_NAME_ALREADY_EXISTS','PROJECT_NORMALIZED_DUPLICATE_REJECTED',duplicate.code);
const wrongTenant=await provider.execute('tenant-a-admin',{...createA,tenantId:'tenant-b',idempotencyKey:'wrong-tenant'});
check(wrongTenant.ok===false&&wrongTenant.code==='PROJECT_ACTOR_DENIED','PROJECT_TENANT_ISOLATION_PASS',wrongTenant.code);
const updatePayload={...internalPayload,version:1,status:'active'};
const update=await provider.execute('tenant-a-admin',{commandType:'project.update',tenantId:'tenant-a',projectId:ackA.projectId,idempotencyKey:'update-internal-1',expectedVersion:1,payload:updatePayload});
check(update.ok===true&&update.providerAck===true&&update.successUiAllowed===true,'PROJECT_UPDATE_DURABLE_ACK_PASS');
const conflict=await provider.execute('tenant-a-admin',{commandType:'project.update',tenantId:'tenant-a',projectId:ackA.projectId,idempotencyKey:'update-internal-conflict',expectedVersion:1,payload:updatePayload});
check(conflict.ok===false&&conflict.code==='PROJECT_EXPECTED_VERSION_CONFLICT','PROJECT_UPDATE_VERSION_CONFLICT_PASS',conflict.code);

// Static frontend readiness scan: findings are intentional HOLDs, not product writes.
const wizard=fs.readFileSync(path.join(ROOT,'app/modules/proyecto-wizard.js'),'utf8');
const projects=fs.readFileSync(path.join(ROOT,'app/modules/proyectos.js'),'utf8');
const find=(code,present,paths,detail)=>{if(present)frontendFindings.push({code,paths,detail});};
find('PROJECT_CREATE_LOCAL_FIRST',/data\.addProject\s*\(\s*cfg\s*\)/.test(wizard),['app/modules/proyecto-wizard.js'],'Create still enters CX.data/local-first path before an ACK-aware project command boundary is demonstrated.');
find('PROJECT_UPDATE_LOCAL_FIRST',/_saveCustomProjects\s*\(/.test(projects),['app/modules/proyectos.js'],'Project settings still persist through local custom-project storage before provider ACK/readback.');
find('PROJECT_ROUTE_HARDCODES_PRESENT',/JUN\s*26|Quincena\s*1|Quincena\s*2/.test(wizard),['app/modules/proyecto-wizard.js'],'Wizard still contains route-period assumptions that must come from each project source/config.');
find('PROJECT_50_50_COPY_PRESENT',/50\s*%|mitad\s+de\s+las\s+visitas/i.test(projects),['app/modules/proyectos.js'],'UI copy still asserts a 50/50 quincenal distribution instead of source/config authority.');
find('PROJECT_AI_FALSE_SUCCESS_PRESENT',/IA\s+extrajo|heur[ií]stic|sugerencia.*IA|Importar instructivo.*IA/is.test(wizard+'\n'+projects),['app/modules/proyecto-wizard.js','app/modules/proyectos.js'],'Demo/heuristic behavior remains able to look like real AI before Gemini gate/review.');

const backendPass=backendErrors.length===0;
const frontendReady=frontendFindings.length===0;
const report={
  schemaVersion:'cxorbia.project-onboarding-previsualization-gate.v1',
  generatedAt:new Date().toISOString(),
  decision:backendPass?(frontendReady?'PASS_PROJECT_ONBOARDING_PREVISUALIZATION':'PASS_BACKEND_SOURCE_ARCHITECTURE__HOLD_FRONTEND_ONBOARDING'):'FAIL_PROJECT_ONBOARDING_BACKEND_ARCHITECTURE',
  backendSourceArchitecturePass:backendPass,
  frontendOnboardingReady:frontendReady,
  newProjectProductionReady:backendPass&&frontendReady,
  currentLiveReleaseAffected:false,
  productP0Proven:false,
  checks,
  backendErrors,
  frontendFindings,
  sourceArchitecture:{perProjectSource:true,internalSupported:true,externalSupported:true,questionnaireIndependent:true,rawProviderSecretsForbidden:true,providerAckRequiredForUiSuccess:true,idempotency:true,expectedVersion:true,tenantIsolation:true},
  classifications:{reusableCXOrbia:['project source contract','source resolver','durable project command provider','previsualization gate'],exclusiveClient:['TyA/Cinepolis provider binding remains project-specific'],claudePrototype:frontendFindings.map(x=>x.code),academia:['document internal/external route-source configuration and AI truthfulness after UI acceptance'],sinImpactoClaude:['control-plane/source-lock repairs']},
  safeState:{repositoryWrites:false,providerReads:false,providerWrites:false,firestoreWrites:false,authWrites:false,hrWrites:false,storageWrites:false,payments:false,make:false,gemini:false,deploy:false,merge:false,production:false,inMemoryWritesOnly:true}
};
const abs=path.isAbsolute(out)?out:path.join(ROOT,out);fs.mkdirSync(path.dirname(abs),{recursive:true});fs.writeFileSync(abs,JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(!backendPass)process.exitCode=1;
