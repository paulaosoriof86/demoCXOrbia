import fs from 'node:fs';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const OUT=process.env.V42_OUT||'.tmp/i3-v42-milton-diagnostic';
const ROOT=String(process.env.V42_ROOT||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT='tya',PROJECT='cinepolis',PERIOD='cinepolis-2026-09',PERIOD_KEY='2026-09';
const INVALID='shopper_gt_018ca3e794',CANON='shopper_gt_bd74ace936';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore(),auth=getAuth(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT);
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const pick=(x,keys)=>Object.fromEntries(keys.map(k=>[k,x?.[k]??null]));
async function docView(ref){
  const s=await ref.get(); if(!s.exists)return {exists:false,id:ref.id};
  const x=s.data()||{}; return {exists:true,id:s.id,...pick(x,['id','shopperId','canonicalShopperId','sourceShopperId','nombre','firstName','lastName','visibleLogin','active','role','authNamespace','identityQuarantined','excludedFromCanonicalReadModel','identityAdjudicationState','authorityType','authorityRef','sourceStableKey','providerUidFingerprint','projectIds'])};
}
async function authView(uid){try{const u=await auth.getUser(uid);return {exists:true,uid:u.uid,disabled:u.disabled,emailPresent:!!str(u.email)};}catch(e){return {exists:false,uid,code:str(e?.code||e?.message)};}}
const shoppersSnap=await tenant.collection('shoppers').get();
const shopperCandidates=shoppersSnap.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(x=>{
  const name=str(x.nombre||[x.firstName,x.lastName].filter(Boolean).join(' ')).toLowerCase();
  return x.id===CANON||x.id===INVALID||str(x.shopperId)===CANON||str(x.shopperId)===INVALID||/milton|mishael|de paz/.test(name);
}).map(x=>({docId:x.id,shopperId:str(x.shopperId||x.id),nombre:str(x.nombre||[x.firstName,x.lastName].filter(Boolean).join(' ')),firstName:str(x.firstName),lastName:str(x.lastName),identityQuarantined:x.identityQuarantined===true,excludedFromCanonicalReadModel:x.excludedFromCanonicalReadModel===true,sourceType:str(x.sourceType||x.source)}));

const usersSnap=await tenant.collection('users').get();
const members=usersSnap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(x=>[CANON,INVALID].includes(str(x.shopperId))||/milton|mishael|de paz/i.test(str(x.nombre||x.displayName)));
const memberViews=[];
for(const m of members)memberViews.push({uid:m.uid,shopperId:str(m.shopperId),active:m.active===true,role:str(m.role),authNamespace:str(m.authNamespace),visibleLogin:str(m.visibleLogin),canonicalShopperId:str(m.canonicalShopperId),auth:await authView(m.uid)});

const crossCanon=await docView(tenant.collection('shopperIdentityCrosswalk').doc(CANON));
const crossInvalid=await docView(tenant.collection('shopperIdentityCrosswalk').doc(INVALID));
const linksSnap=await tenant.collection('shopperIdentityLinks').get();
const links=linksSnap.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(x=>[CANON,INVALID].some(id=>[x.canonicalShopperId,x.shopperId,x.sourceShopperId,x.sourceIdentity?.shopperId,x.sourceIdentity?.sourceShopperId].map(str).includes(id))).map(x=>({id:x.id,shopperId:str(x.shopperId),canonicalShopperId:str(x.canonicalShopperId),sourceShopperId:str(x.sourceShopperId||x.sourceIdentity?.sourceShopperId||x.sourceIdentity?.shopperId),status:str(x.status||x.state),authorityType:str(x.authorityType),authorityRef:str(x.authorityRef),providerUidFingerprintPresent:!!str(x.providerUidFingerprint)}));

const durable=(await project.collection('visits').where('periodId','==',PERIOD).get()).docs.filter(d=>(d.data()||{}).excludedFromCanonicalReadModel!==true);
const durableKeys=durable.map(d=>str((d.data()||{}).hrRowId)).filter(Boolean);
const durableIdentity={currentCount:durable.length,uniqueHrRows:new Set(durableKeys).size,invalidShopperRows:durable.filter(d=>str((d.data()||{}).shopperId)===INVALID).map(d=>({docId:d.id,hrRowId:str((d.data()||{}).hrRowId)})),canonShopperRows:durable.filter(d=>str((d.data()||{}).shopperId)===CANON).map(d=>({docId:d.id,hrRowId:str((d.data()||{}).hrRowId)}))};

let hr={ok:false,status:0,revision:null,currentCount:null,shopperCandidates:[],error:null};
try{
  const response=await fetch(ROOT+'/api/'+TENANT+'/'+PROJECT+'/hr-live?format=json&v42=milton-diagnostic',{headers:{'cache-control':'no-cache,no-store,max-age=0'}});
  hr.status=response.status;
  const payload=await response.json().catch(()=>null),snapshot=payload&&(payload.snapshot||payload.data||payload);
  if(!response.ok||!snapshot)throw new Error('HR_HTTP_'+response.status);
  const candidates=arr(snapshot.shoppers).filter(x=>{
    const id=str(x.id||x.shopperId),name=str(x.nombre||[x.firstName,x.lastName].filter(Boolean).join(' ')).toLowerCase();
    return id===CANON||id===INVALID||/milton|mishael|de paz/.test(name);
  }).map(x=>({id:str(x.id||x.shopperId),shopperId:str(x.shopperId||x.id),nombre:str(x.nombre||[x.firstName,x.lastName].filter(Boolean).join(' ')),firstName:str(x.firstName),lastName:str(x.lastName),sourceRef:str(x.sourceRef||x.hrRowId||x.rowId)}));
  const current=arr(snapshot.visits).filter(v=>str(v.periodKey)===PERIOD_KEY);
  hr={ok:snapshot.sourceSafe===true,status:response.status,revision:str(payload?._runtime?.revision||payload?.revision||snapshot.sourceRevision),currentCount:current.length,shopperCandidates:candidates,invalidCurrentRows:current.filter(v=>str(v.shopperId)===INVALID).map(v=>str(v.hrRowId)),canonCurrentRows:current.filter(v=>str(v.shopperId)===CANON).map(v=>str(v.hrRowId)),error:null};
}catch(e){hr.error=str(e?.stack||e);}

const canonicalDoc=await docView(tenant.collection('shoppers').doc(CANON));
const invalidDoc=await docView(tenant.collection('shoppers').doc(INVALID));
const result={
  schemaVersion:'cxorbia.i3.v42.milton-durable-diagnostic.v1',
  decision:'PASS_V42_DURABLE_MILTON_DIAGNOSTIC',
  tenantId:TENANT,projectId:PROJECT,periodId:PERIOD,
  canonicalId:CANON,invalidId:INVALID,
  canonicalDoc,invalidDoc,shopperCandidates,members,crosswalks:{canonical:crossCanon,invalid:crossInvalid},links,durableIdentity,hr,
  interpretation:{
    canonicalDocExists:canonicalDoc.exists===true,
    canonicalName:str(canonicalDoc.nombre||[canonicalDoc.firstName,canonicalDoc.lastName].filter(Boolean).join(' ')),
    canonicalMemberCount:memberViews.filter(x=>x.shopperId===CANON&&x.active===true).length,
    invalidActiveMemberCount:memberViews.filter(x=>x.shopperId===INVALID&&x.active===true).length,
    hrHasCanonical:hr.shopperCandidates.some(x=>x.id===CANON||x.shopperId===CANON||/milton de paz/i.test(x.nombre)),
    hrHasInvalid:hr.shopperCandidates.some(x=>x.id===INVALID||x.shopperId===INVALID||/mishael de paz/i.test(x.nombre))
  },
  memberViews,writes:0,deploys:0,builds:0,production:false,at:new Date().toISOString()
};
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/milton-durable-diagnostic.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
