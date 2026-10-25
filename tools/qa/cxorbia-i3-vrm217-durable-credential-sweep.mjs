#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {createShopperCommandProvider} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const OUT=String(process.env.VRM217_SWEEP_OUT||'.tmp/i3-vrm217-credential-sweep').trim();
const str=v=>String(v??'').trim();
const result={schemaVersion:'cxorbia.i3.vrm217.durable-credential-sweep.v1',decision:'HOLD',tenantId:TENANT,projectId:PROGRAM,expectedHrRevision:EXPECTED_HR,hrWrites:0,externalWrites:0,production:false};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('SOURCE_FAILURE:VRM217_HR_REQUIRED');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const provider=createShopperCommandProvider({auth,db,policy:{
  schemaVersion:'cxorbia.shopper-command-provider-policy.v1',enabled:true,
  allowedTenantIds:[TENANT],allowedProjectIds:[PROGRAM],
  hrWrites:false,externalWrites:false,fuzzyMatching:false
}});
async function hrMeta(tag){
  const r=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=meta&vrm217sweep='+encodeURIComponent(tag)+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
  if(!r.ok)throw new Error('PROVIDER_FAILURE:VRM217_HR_HTTP_'+r.status);
  const m=await r.json();
  if(str(m.revision)!==EXPECTED_HR||m.hrWrites!==false||m.production!==false)throw new Error('SOURCE_FAILURE:VRM217_HR_DRIFT');
  return {revision:str(m.revision),sourceSafe:m.sourceSafe===true};
}
try{
  result.beforeHr=await hrMeta('before');save();
  const first=await provider.normalizeDurableCredentials({tenantId:TENANT});
  result.first=first;save();
  if(first?.ok!==true||Number(first.normalizedShopperCount)!==78||Number(first.authWrites)!==78||Number(first.firestoreWrites)!==156)throw new Error('PERSISTENCE_FAILURE:VRM217_FIRST_SWEEP_COUNTS');
  if(Number(first.claimsWrites)!==0)throw new Error('AUTH_FAILURE:VRM217_UNEXPECTED_CLAIMS_WRITE');
  const second=await provider.normalizeDurableCredentials({tenantId:TENANT});
  result.replay=second;save();
  if(second?.ok!==true||Number(second.normalizedShopperCount)!==0||Number(second.authWrites)!==0||Number(second.claimsWrites)!==0||Number(second.firestoreWrites)!==0)throw new Error('PERSISTENCE_FAILURE:VRM217_SWEEP_NOT_IDEMPOTENT');
  result.afterHr=await hrMeta('after');
  result.decision='PASS_VRM217_DURABLE_CREDENTIAL_SWEEP';
  result.providerAck=true;result.normalizedShopperCount=78;result.idempotentReplay=true;result.hrWrites=0;result.externalWrites=0;result.production=false;
  save();console.log(JSON.stringify(result,null,2));
}catch(error){
  result.decision='FAIL_VRM217_DURABLE_CREDENTIAL_SWEEP';
  result.error=str(error?.stack||error);save();console.error(result.error);process.exitCode=2;
}
