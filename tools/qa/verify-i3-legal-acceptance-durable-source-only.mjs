#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';

const CONTRACT='backend/contracts/cxorbia-legal-acceptance-durable-v1.json';
const ADAPTER='app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js';
const APP='app/app.js';
const ADMIN='app/modules/administrabilidad.js';
const CONFIG='app/modules/configuracion.js';
const I3='tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs';
const req=p=>{if(!fs.existsSync(p))throw new Error('LEGAL_SOURCE_MISSING:'+p);return fs.readFileSync(p,'utf8');};
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const contract=JSON.parse(req(CONTRACT));
const adapter=req(ADAPTER),app=req(APP),admin=req(ADMIN),config=req(CONFIG),i3=req(I3);

ensure(contract.schemaVersion==='cxorbia.legal-acceptance.durable-contract.v1','LEGAL_CONTRACT_SCHEMA');
ensure(contract.status==='source_only_prepared_write_disabled','LEGAL_CONTRACT_NOT_SOURCE_ONLY');
for(const [k,v] of Object.entries({
  firebaseAuthActorIsAuthority:true,exactIdentityOnly:true,fuzzyMatching:false,humanAcceptanceOnly:true,
  automaticAcceptance:false,providerAckRequired:true,localStorageIsAuthority:false,browserLocalAcceptanceIsAuthority:false,
  failClosedOnMissingOrAmbiguousState:true,preserveHistoricalAcceptances:true,newLegalVersionReopensGate:true,
  passwordOrTokenPersistence:false,bnOkIsInformationalOnly:true
}))ensure(contract.invariants?.[k]===v,'LEGAL_INVARIANT_'+k);
ensure(contract.scope?.actorUid==='provider_derived_from_verified_firebase_id_token','LEGAL_ACTOR_AUTHORITY');
ensure(contract.command?.commandType==='legal.acceptance.record'&&contract.command?.acceptanceMethod==='human_ui','LEGAL_COMMAND_CONTRACT');
ensure(contract.command?.writeGate==='disabled_in_this_source_only_block','LEGAL_WRITE_GATE_NOT_DISABLED');
ensure(contract.acceptanceReceipt?.serverFields?.acceptedAt==='provider_server_timestamp','LEGAL_ACCEPTED_AT_NOT_SERVER');
ensure(contract.readModel?.authority==='provider'&&contract.readModel?.browserPersistence==='memory_only_not_localStorage','LEGAL_READ_MODEL_AUTHORITY');
ensure(contract.multiTenant?.tyaHardcoded===false&&contract.multiTenant?.cinepolisHardcoded===false,'LEGAL_CLIENT_HARDCODE');
ensure(Object.values(contract.safetyForThisBlock||{}).every(v=>v===0||v===false),'LEGAL_SOURCE_BLOCK_UNSAFE_BUDGET');

ensure(!/localStorage\s*\./.test(adapter)&&!/localStorage\s*\[/.test(adapter),'LEGAL_ADAPTER_LOCALSTORAGE_FORBIDDEN');
ensure(!/firebase-admin|firebase\.firestore|\.collection\s*\(/.test(adapter),'LEGAL_ADAPTER_PROVIDER_IO_FORBIDDEN_SOURCE_ONLY');
ensure(adapter.includes("commandType:'legal.acceptance.record'"),'LEGAL_ADAPTER_COMMAND_MISSING');
ensure(adapter.includes("acceptanceMethod:ACCEPTANCE_METHOD"),'LEGAL_ADAPTER_HUMAN_METHOD_MISSING');
ensure(adapter.includes('actorUidFromProviderToken:true'),'LEGAL_PROVIDER_ACTOR_BINDING_MISSING');
ensure(adapter.includes('automaticAcceptanceForbidden:true'),'LEGAL_AUTOMATION_FORBID_MISSING');
ensure(adapter.includes("sourceOnly:true")&&adapter.includes("activated:false"),'LEGAL_ADAPTER_SOURCE_ONLY_STATUS_MISSING');

ensure(app.includes('CX.confidencialidad && CX.confidencialidad.pending(CX.session.role)'),'LEGAL_EXISTING_PENDING_CALLSITE_MISSING');
ensure(app.includes("id=\"bnOk\"")&&app.includes("localStorage.getItem('cx_banners')"),'LEGAL_INFORMATIONAL_BANNER_CONTRACT_DRIFT');
ensure(admin.includes('NDA: usa CX.confidencialidad (versión real, demo local)'),'LEGAL_ADMIN_DEMO_LOCAL_EVIDENCE_MISSING');
ensure(admin.includes('En producción quedan firmadas y auditadas.'),'LEGAL_ADMIN_PRODUCTION_AUDIT_INTENT_MISSING');
ensure(config.includes('NDA / Acuerdo de confidencialidad')&&config.includes('Guardar NDA'),'LEGAL_CONFIG_NDA_SURFACE_MISSING');
ensure(i3.includes("I3_ADMIN_LEGAL_GATE_PENDING_BEFORE_CREATE")&&i3.includes('legalConsentAutomated:false')&&i3.includes('forceClickUsed:false'),'LEGAL_I3_FAIL_CLOSED_GUARD_MISSING');

const sandbox={console,CX:{
  backendAuth:{context:()=>({authenticated:true,tenantId:'tenant-A',role:'admin',authNamespace:'staff',projectIds:['project-A']})},
  commandAdapter:{
    build:x=>({ok:true,command:{...x,version:'cxorbia-command-adapter-v1'},errors:[]}),
    execute:async()=>{throw new Error('SOURCE_ONLY_EXECUTE_MUST_NOT_BE_CALLED_BY_VERIFIER');}
  }
}};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);vm.runInContext(adapter,sandbox,{filename:ADAPTER});
const A=sandbox.CX.legalAcceptanceDurable;ensure(A?.status?.().sourceOnly===true,'LEGAL_ADAPTER_NOT_EXPOSED');
const digest='a'.repeat(64);
const scope={tenantId:'tenant-A',scopeMode:'project',projectId:'project-A',role:'admin',authNamespace:'staff'};
const current={legalContentId:'nda-admin',legalVersion:'v3',contentDigest:digest};
const accepted={authority:'provider',ready:true,subjectExact:true,ambiguous:false,tenantId:'tenant-A',scopeMode:'project',projectId:'project-A',role:'admin',authNamespace:'staff',legalContentId:'nda-admin',legalVersion:'v3',contentDigest:digest,acceptance:{status:'accepted',acceptanceMethod:'human_ui',subjectExact:true,tenantId:'tenant-A',scopeMode:'project',projectId:'project-A',role:'admin',authNamespace:'staff',legalContentId:'nda-admin',legalVersion:'v3',contentDigest:digest,acceptedAt:'2026-08-15T00:00:00.000Z'}};
const pass=A.pendingFromProviderReadModel({scope,current,snapshot:accepted});ensure(pass.pending===false&&pass.accepted===true,'LEGAL_EXACT_ACCEPTANCE_NOT_RECOGNIZED');
const missing=A.pendingFromProviderReadModel({scope,current,snapshot:{}});ensure(missing.pending===true&&missing.failClosed===true,'LEGAL_MISSING_NOT_FAIL_CLOSED');
const old=A.pendingFromProviderReadModel({scope,current:{...current,legalVersion:'v4'},snapshot:accepted});ensure(old.pending===true&&old.reasons.some(x=>x.includes('VERSION')),'LEGAL_NEW_VERSION_NOT_REOPENED');
const wrongActor=A.pendingFromProviderReadModel({scope:{...scope,role:'shopper',authNamespace:'shopper'},current,snapshot:accepted});ensure(wrongActor.pending===true,'LEGAL_CROSS_ROLE_ACCEPTANCE_LEAK');
const prepared=A.buildHumanAcceptanceCommand({scope,current,idempotencyKey:'legal-i3-source-only-test',humanConfirmed:true});ensure(prepared.ok===true&&prepared.status==='prepared','LEGAL_HUMAN_COMMAND_NOT_PREPARED');
ensure(prepared.command?.payload?.acceptanceMethod==='human_ui'&&prepared.command?.authorization?.actorUidFromProviderToken===true,'LEGAL_COMMAND_PAYLOAD_UNSAFE');
ensure(!('acceptedAt' in (prepared.command?.payload||{})),'LEGAL_CLIENT_ACCEPTED_AT_FORBIDDEN');
const noHuman=A.buildHumanAcceptanceCommand({scope,current,idempotencyKey:'legal-no-human',humanConfirmed:false});ensure(noHuman.ok===false&&noHuman.providerWrites===0,'LEGAL_AUTOMATED_COMMAND_NOT_BLOCKED');

const report={
  schemaVersion:'cxorbia.i3.legal-acceptance-durable-source-only.verify.v1',
  decision:'PASS_I3_LEGAL_ACCEPTANCE_DURABLE_ACCOUNT_SCOPED_CONTRACT_SOURCE_ONLY',
  contract:contract.schemaVersion,
  exactIdentityOnly:true,
  providerActorFromVerifiedToken:true,
  providerAuthoritativeReadModel:true,
  pendingFailClosed:true,
  humanAcceptanceOnly:true,
  automaticAcceptance:false,
  newVersionReopensGate:true,
  oldAcceptancesPreserved:true,
  localStorageAuthority:false,
  informationalBannerLegalAcceptance:false,
  multiTenantReusable:true,
  productEntrypointChanged:false,
  uiModuleChanged:false,
  providerCredentials:0,
  authWrites:0,
  firestoreWrites:0,
  legalAcceptanceWrites:0,
  hrWrites:0,
  rulesWrites:0,
  storageWrites:0,
  makeWrites:0,
  geminiCalls:0,
  paymentsWrites:0,
  deploys:0,
  merge:false,
  production:false,
  nextGate:contract.nextGate
};
console.log(JSON.stringify(report,null,2));
