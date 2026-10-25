#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const OUT=String(process.env.PREI4_004_DIAG_OUT||'.tmp/prei4-admin-004-cache-diagnostic');
const ROOT=String(process.env.PREI4_004_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT='tya',PROJECT='cinepolis';
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore();
const ref=db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT);
const snap=await ref.get();
if(!snap.exists)throw new Error('PERSISTENCE_FAILURE:ADMIN004_PROJECT_MISSING');
const durable=snap.data()||{};
const res=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&cacheDiagnostic='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!res.ok)throw new Error('PROVIDER_FAILURE:ADMIN004_HR_HTTP_'+res.status);
const body=await res.json(),hr=body?.snapshot||body?.data||body,rt=body?._runtime||hr?._runtime||{};
const result={
  schemaVersion:'cxorbia.prei4.admin004.finance-config-cache-diagnostic.v1',
  decision:null,
  durable:{
    version:Number(durable.version||0),
    currency:{GT:durable?.currency?.GT??null,HN:durable?.currency?.HN??null},
    honorario:{GT:durable?.honorario?.GT??null,HN:durable?.honorario?.HN??null}
  },
  runtimeSnapshot:{
    revision:String(rt.revision||hr.revision||hr.sourceRevision||''),
    projectConfigVersion:hr?.projectConfigVersion??null,
    projectConfigAuthority:hr?.projectConfigAuthority??null,
    currency:{GT:hr?.projectConfig?.currency?.GT??hr?.projectConfig?.currencies?.GT??null,HN:hr?.projectConfig?.currency?.HN??hr?.projectConfig?.currencies?.HN??null},
    honorario:{GT:hr?.projectConfig?.honorario?.GT??null,HN:hr?.projectConfig?.honorario?.HN??null},
    sourceSafe:hr?.sourceSafe===true,
    production:hr?.production===true
  },
  writes:0,builds:0,deploys:0,production:false
};
const durableExact=result.durable.version>=4&&Number(result.durable.honorario.GT)===60&&Number(result.durable.honorario.HN)===200&&result.durable.currency.GT==='Q'&&result.durable.currency.HN==='L';
const runtimeExact=Number(result.runtimeSnapshot.honorario.GT)===60&&Number(result.runtimeSnapshot.honorario.HN)===200&&result.runtimeSnapshot.currency.GT==='Q'&&result.runtimeSnapshot.currency.HN==='L';
if(!durableExact)throw new Error('PERSISTENCE_FAILURE:ADMIN004_DURABLE_CONFIG_DRIFT');
result.decision='PASS_PREI4_ADMIN_004_RUNTIME_PROJECT_CONFIG_CACHE_DIAGNOSTIC';
result.runtimeConfigFresh=runtimeExact;
result.classification=runtimeExact?'HONORARIUM_PROPAGATION_AFTER_FRESH_RUNTIME_CONFIG':'STALE_RUNTIME_PROJECT_CONFIG';
fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));

