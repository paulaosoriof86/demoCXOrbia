import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {
  createLegalAcceptanceProvider,
  receiptIdFor,
  sourceOnlyStatus,
  validateWriteGate,
  LEGAL_COMMAND_TYPE
} from '../../backend/runtime/cxorbia-legal-acceptance-provider-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const jread=p=>JSON.parse(read(p));
const digest='a'.repeat(64);
const scope={tenantId:'tya',scopeMode:'tenant',projectId:null,role:'admin',authNamespace:'staff'};
const current={legalContentId:'confidentiality',legalVersion:'v1',contentDigest:digest};
const actor={uid:'uid-admin-exact',tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:['cinepolis']};

function snap(data){return data?{exists:true,data:()=>structuredClone(data)}:{exists:false,data:()=>({})};}
function fakeStore(){
  const docs=new Map();
  let writes=0,reads=0;
  const db={
    doc(p){return{path:p,async get(){reads++;return snap(docs.get(p));}};},
    async runTransaction(fn){
      const pending=[];
      const tx={async get(ref){reads++;return snap(docs.get(ref.path));},create(ref,value){if(docs.has(ref.path))throw new Error('already-exists');pending.push([ref.path,structuredClone(value)]);}};
      const out=await fn(tx);
      for(const [p,v] of pending){docs.set(p,v);writes++;}
      return out;
    }
  };
  return{db,docs,metrics:()=>({reads,writes})};
}
function seedLegal(store,{version='v1',digestValue=digest}={}){
  store.docs.set('tenants/tya/legalContents/confidentiality',{legalContentId:'confidentiality',currentVersion:version,currentDigest:digestValue,scopeMode:'tenant',roleApplicability:['admin']});
  store.docs.set(`tenants/tya/legalContents/confidentiality/versions/${version}`,{legalVersion:version,contentDigest:digestValue,scopeMode:'tenant',roleApplicability:['admin'],active:true});
}
const gate={enabled:true,consumed:false,providerWriteAuthorized:true,targetProject:'cxorbia-backend-dev',commandType:LEGAL_COMMAND_TYPE,allowedExecutions:1,legalAcceptanceWrites:1,firestoreWrites:1,authWrites:0,passwordResets:0,historicalCredentialAccess:0,historicalReconciliationWrites:0,otherIdentityWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeWrites:0,geminiCalls:0,paymentWrites:0,automaticAcceptance:false,humanAcceptanceRequired:true};
const command={commandType:'legal.acceptance.record',entityType:'legalAcceptance',tenantId:'tya',projectId:null,requireProject:false,actor:{actorId:'client-display-id-not-authority',role:'admin',projectIds:['cinepolis']},expectedVersion:'v1',idempotencyKey:'legal-test-1',payload:{scopeMode:'tenant',legalContentId:'confidentiality',legalVersion:'v1',contentDigest:digest,acceptanceMethod:'human_ui',humanConfirmed:true},authorization:{providerEnforcementRequired:true,verifiedIdTokenActorRequired:true,actorUidFromProviderToken:true,selfAcceptanceOnly:true,humanAcceptanceRequired:true,automaticAcceptanceForbidden:true}};

const required=['backend/contracts/cxorbia-legal-acceptance-durable-v1.json','backend/runtime/cxorbia-legal-acceptance-provider-v1.mjs','app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js','app/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js','app/index-backend-dev.html','app/app.js','app/modules/administrabilidad.js','app/modules/configuracion.js','.github/cxorbia-firebase-requests/cxorbia-i3-shopper-persistence-exact-write-v1.json'];
required.forEach(p=>assert.ok(fs.existsSync(path.join(ROOT,p)),`missing ${p}`));

const contract=jread('backend/contracts/cxorbia-legal-acceptance-durable-v1.json');
assert.equal(contract.invariants.humanAcceptanceOnly,true);
assert.equal(contract.invariants.automaticAcceptance,false);
assert.equal(contract.invariants.localStorageIsAuthority,false);
assert.equal(contract.command.actorUidFromClientPayloadForbidden,true);
assert.equal(contract.command.providerMustDeriveActorFromVerifiedIdToken,true);
assert.equal(contract.readModel.missingSnapshot,'pending_true_fail_closed');

const providerSource=read('backend/runtime/cxorbia-legal-acceptance-provider-v1.mjs');
assert.match(providerSource,/LEGAL_WRITE_GATE_INVALID/);
assert.match(providerSource,/LEGAL_CLIENT_ACTOR_UID_FORBIDDEN/);
assert.match(providerSource,/LEGAL_CLIENT_ACCEPTED_AT_FORBIDDEN/);
assert.match(providerSource,/serverTimestamp\(\)/);
assert.match(providerSource,/tx\.create\(receiptRef,expected\)/);
assert.match(providerSource,/passwordResets/);
assert.doesNotMatch(providerSource,/firebase-admin/);
assert.doesNotMatch(providerSource,/GOOGLE_APPLICATION_CREDENTIALS/);

const durableSource=read('app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js');
assert.doesNotMatch(durableSource,/localStorage\s*\./);
assert.match(durableSource,/commandType:'legal.acceptance.record'/);
assert.match(durableSource,/actorUidFromProviderToken:true/);
assert.match(durableSource,/automaticAcceptanceForbidden:true/);
const bridgeSource=read('app/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js');
assert.match(bridgeSource,/providerSnapshotMemoryOnly:true/);
assert.match(bridgeSource,/humanConfirmed!==true/);
assert.match(bridgeSource,/failClosedWithoutSnapshot:true/);
assert.doesNotMatch(bridgeSource,/localStorage\.setItem/);
assert.doesNotMatch(bridgeSource,/sessionStorage\.setItem/);

const entry=read('app/index-backend-dev.html');
assert.ok(!entry.includes('cxorbia-legal-acceptance-provider-bridge-v1.js'),'product entrypoint must remain unwired in source-only block');
const app=read('app/app.js');
assert.match(app,/CX\.confidencialidad/);
const config=read('app/modules/configuracion.js');
assert.match(config,/NDA \/ Acuerdo de confidencialidad/);
assert.match(config,/Al acceder a esta plataforma, confirmas que has leído y aceptas los términos de confidencialidad y uso de datos\./);
const admin=read('app/modules/administrabilidad.js');
assert.match(admin,/CX\.confidencialidad/);

const frozen=jread('.github/cxorbia-firebase-requests/cxorbia-i3-shopper-persistence-exact-write-v1.json');
assert.equal(frozen.consumed,true);
assert.equal(frozen.enabled,false);
assert.equal(frozen.passwordResets,0);
assert.equal(frozen.historicalLoginCheckpointPassed,true);

assert.equal(validateWriteGate(gate).ok,true);
assert.equal(validateWriteGate({...gate,providerWriteAuthorized:false}).ok,false);
assert.equal(validateWriteGate({...gate,passwordResets:1}).ok,false);
assert.equal(validateWriteGate({...gate,historicalCredentialAccess:1}).ok,false);

{
  const store=fakeStore();let tokenCalls=0;
  const provider=createLegalAcceptanceProvider({verifyIdToken:async()=>{tokenCalls++;return actor;},firestore:store.db,serverTimestamp:()=>({__serverTimestamp:true})});
  await assert.rejects(()=>provider.record({idToken:'token',command,gate:{...gate,enabled:false}}),e=>e.code==='LEGAL_WRITE_GATE_INVALID');
  assert.equal(tokenCalls,0);assert.deepEqual(store.metrics(),{reads:0,writes:0});
}

for(const badPayload of [{...command.payload,actorUid:'spoof'},{...command.payload,acceptedAt:'2026-01-01T00:00:00Z'}]){
  const store=fakeStore();let tokenCalls=0;
  const provider=createLegalAcceptanceProvider({verifyIdToken:async()=>{tokenCalls++;return actor;},firestore:store.db,serverTimestamp:()=>({__serverTimestamp:true})});
  await assert.rejects(()=>provider.record({idToken:'token',command:{...command,payload:badPayload},gate}),e=>e.code==='LEGAL_ACCEPTANCE_COMMAND_INVALID');
  assert.equal(tokenCalls,0);assert.deepEqual(store.metrics(),{reads:0,writes:0});
}

{
  const store=fakeStore();seedLegal(store);let tokenCalls=0;
  const provider=createLegalAcceptanceProvider({verifyIdToken:async()=>{tokenCalls++;return actor;},firestore:store.db,serverTimestamp:()=>({__serverTimestamp:true})});
  const first=await provider.record({idToken:'token',command,gate});
  assert.equal(first.ok,true);assert.equal(first.status,'committed');assert.equal(first.providerAck,true);assert.equal(first.idempotent,false);
  assert.equal(store.metrics().writes,1);
  const second=await provider.record({idToken:'token',command,gate});
  assert.equal(second.ok,true);assert.equal(second.idempotent,true);assert.equal(store.metrics().writes,1);
  const rid=receiptIdFor({scope,actorUid:actor.uid,current});
  assert.ok(store.docs.has(`tenants/tya/legalAcceptances/${rid}`));
  const readModel=await provider.readModel({idToken:'token',scope,current});
  assert.equal(readModel.pending,false);assert.equal(readModel.subjectExact,true);assert.equal(readModel.acceptance.actorUid,actor.uid);
}

{
  const store=fakeStore();seedLegal(store);
  const provider=createLegalAcceptanceProvider({verifyIdToken:async()=>({...actor,tenantId:'other'}),firestore:store.db,serverTimestamp:()=>({__serverTimestamp:true})});
  await assert.rejects(()=>provider.record({idToken:'token',command,gate}),e=>e.code==='LEGAL_ACCEPTANCE_ACTOR_SCOPE_INVALID');
  assert.deepEqual(store.metrics(),{reads:0,writes:0});
}

{
  const store=fakeStore();seedLegal(store,{version:'v2',digestValue:'b'.repeat(64)});
  const provider=createLegalAcceptanceProvider({verifyIdToken:async()=>actor,firestore:store.db,serverTimestamp:()=>({__serverTimestamp:true})});
  await assert.rejects(()=>provider.record({idToken:'token',command,gate}),e=>e.code==='LEGAL_PROVIDER_CURRENT_INVALID');
  assert.equal(store.metrics().writes,0);
}

{
  const c2={...current,legalVersion:'v2',contentDigest:'b'.repeat(64)};
  assert.notEqual(receiptIdFor({scope,actorUid:actor.uid,current}),receiptIdFor({scope,actorUid:actor.uid,current:c2}));
}

{
  const sandbox={console,CX:{backendAuth:{context:()=>({authenticated:true,tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:['cinepolis']})},commandAdapter:{build:x=>({ok:true,command:{...x,version:'cxorbia-command-adapter-v1'},errors:[]}),execute:async()=>{throw new Error('SOURCE_ONLY_EXECUTE_MUST_NOT_RUN');}}}};
  sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(durableSource,sandbox,{filename:'app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js'});
  const A=sandbox.CX.legalAcceptanceDurable;
  const accepted={authority:'provider',ready:true,subjectExact:true,ambiguous:false,tenantId:'tya',scopeMode:'tenant',projectId:null,role:'admin',authNamespace:'staff',legalContentId:'confidentiality',legalVersion:'v1',contentDigest:digest,acceptance:{status:'accepted',acceptanceMethod:'human_ui',subjectExact:true,tenantId:'tya',scopeMode:'tenant',role:'admin',authNamespace:'staff',legalContentId:'confidentiality',legalVersion:'v1',contentDigest:digest,acceptedAt:'2026-08-15T00:00:00.000Z'}};
  const exact=A.pendingFromProviderReadModel({scope,current,snapshot:accepted});assert.equal(exact.pending,false);
  const missing=A.pendingFromProviderReadModel({scope,current,snapshot:{}});assert.equal(missing.pending,true);assert.equal(missing.failClosed,true);
  const prepared=A.buildHumanAcceptanceCommand({scope,current,idempotencyKey:'legal-source-only-test',humanConfirmed:true});assert.equal(prepared.ok,true);assert.equal(prepared.command?.payload?.acceptanceMethod,'human_ui');assert.equal('acceptedAt' in (prepared.command?.payload||{}),false);
  const blocked=A.buildHumanAcceptanceCommand({scope,current,idempotencyKey:'legal-source-only-nohuman',humanConfirmed:false});assert.equal(blocked.ok,false);assert.equal(blocked.providerWrites,0);
}

const status=sourceOnlyStatus();
assert.equal(status.sourceOnly,true);
assert.equal(status.activated,false);
assert.equal(status.providerCredentialsLoaded,false);
assert.equal(status.providerWritesExecuted,0);
assert.equal(status.legalAcceptanceWritesExecuted,0);
assert.equal(status.automaticAcceptance,false);
assert.equal(status.historicalCredentialAccess,0);
assert.equal(status.passwordResets,0);
assert.equal(status.deploys,0);
assert.equal(status.merge,false);
assert.equal(status.production,false);

console.log(JSON.stringify({decision:'PASS_I3_LEGAL_ACCEPTANCE_DURABLE_ACCOUNT_SCOPED_CONTRACT_SOURCE_ONLY',providerWiringDecision:'PASS_I3_LEGAL_ACCEPTANCE_PROVIDER_WIRING_SOURCE_ONLY',commandType:LEGAL_COMMAND_TYPE,providerRuntimePrepared:true,providerWriteActivated:false,providerCredentialsLoaded:false,actualProviderReads:0,actualProviderWrites:0,authWrites:0,firestoreWrites:0,legalAcceptanceWrites:0,automaticAcceptance:false,humanAcceptanceOnly:true,exactIdentityOnly:true,fuzzyMatching:false,clientActorUidForbidden:true,clientAcceptedAtForbidden:true,providerServerTimestampRequired:true,duplicateAcceptanceIdempotent:true,priorVersionReceiptPreserved:true,productEntrypointChanged:false,uiModulesChanged:false,historicalCredentialAccess:0,passwordResets:0,historicalReconciliationWrites:0,request08Rerun:false,deployment:false,merge:false,production:false,nextGate:'PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME'},null,2));
