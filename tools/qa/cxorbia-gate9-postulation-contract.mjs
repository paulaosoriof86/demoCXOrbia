#!/usr/bin/env node
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
const ensure=(ok,msg)=>{if(!ok){console.error(`FAIL_GATE9_CONTRACT:${msg}`);process.exit(1);}};

const submit=read('app/modules/visita-detalle.js');
const bridge=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
const provider=read('backend/runtime/cxorbia-operational-command-provider-v1.mjs');
const composer=read('app/adapters/tya-cumulative-read-model-v2.js');

ensure(submit.includes("commandType:'application.create'"),'APPLICATION_CREATE_NOT_WIRED');
ensure(submit.includes("expectedVersion:'absent'"),'APPLICATION_CREATE_NOT_CREATE_ONLY');
ensure(submit.includes('result?.providerAck===true'),'PROVIDER_ACK_NOT_REQUIRED');
ensure(submit.includes('result?.successUiAllowed===true'),'SUCCESS_UI_NOT_ACK_GATED');
ensure(submit.includes("result?.status==='committed'"),'COMMITTED_STATUS_NOT_REQUIRED');
ensure(submit.includes('await CX.backend?.refresh?.()'),'BACKEND_REFRESH_AFTER_ACK_MISSING');
ensure(submit.includes("gate9_application_create_committed"),'HR_RECOMPOSE_AFTER_ACK_MISSING');
ensure(!submit.includes('Postulación validada · pendiente de envío operativo'),'LEGACY_LOCAL_SUCCESS_STILL_PRESENT');

ensure(bridge.includes('postulations:clone(protectedState.posts)'),'FIRESTORE_POSTULATIONS_NOT_PASSED_TO_COMPOSER');
ensure(bridge.includes('CX.data._posts=clone(result.posts)'),'COMPOSED_POSTS_NOT_APPLIED');
ensure(composer.includes('payload.postulations')||composer.includes('protectedPayload.postulations'),'CANONICAL_COMPOSER_DOES_NOT_CONSUME_POSTULATIONS');

ensure(provider.includes("'application.create'"),'APPLICATION_CREATE_PROVIDER_MISSING');
ensure(provider.includes("collection('postulations')")||provider.includes("collection(\"postulations\")"),'DURABLE_POSTULATIONS_COLLECTION_MISSING');
ensure(provider.includes('providerAck:true'),'PROVIDER_ACK_MISSING');
ensure(provider.includes('successUiAllowed:true'),'SUCCESS_UI_ACK_MISSING');
ensure(provider.includes("role!=='shopper'")||provider.includes("role !== 'shopper'"),'SHOPPER_SCOPE_ENFORCEMENT_MISSING');

const result={
  decision:'PASS_GATE9_POSTULATION_CONTRACT',
  gate:9,
  production:false,
  hrWrites:0,
  submitDurableCommand:true,
  successRequiresRemoteAck:true,
  refreshAfterCommit:true,
  firestorePostulationsPreservedInComposition:true,
  durableProviderPresent:true
};
console.log(JSON.stringify(result,null,2));
