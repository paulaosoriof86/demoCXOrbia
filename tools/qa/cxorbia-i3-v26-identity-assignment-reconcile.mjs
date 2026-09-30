import fs from 'node:fs';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const OUT=process.env.V26_OUT||'.tmp/i3-v26-identity-assignment-reconcile';
const HR_URL=process.env.V26_HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&v26=reconcile';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore(),tenant=db.collection('tenants').doc('tya'),project=tenant.collection('projects').doc('cinepolis');
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const safeMeta=(x={})=>{
  const out={};
  for(const k of ['id','shopperId','nombre','firstName','lastName','pais','country','sourceType','visibleLogin','username','user','sourceIdentityKey','sourceRef','createdVia','hrSourceRevision','lastHrSyncedAt','updatedAt','credentialRuleVersion','credentialState','identityMode','identityAuthority','authorityType','authorityRef','status','state']){
    if(x[k]!==undefined)out[k]=x[k];
  }
  for(const k of ['projectIds','sourceShopperIds','exactAliases','sourceAliases','selfManagedFields'])if(Array.isArray(x[k]))out[k]=x[k];
  return out;
};

const [visitDocs,profiles,users,crosswalk,links,posts,reservations,receipts]=await Promise.all([
  docs(project.collection('visits')),docs(tenant.collection('shoppers')),docs(tenant.collection('users')),
  docs(tenant.collection('shopperIdentityCrosswalk')),docs(tenant.collection('shopperIdentityLinks')),
  docs(project.collection('postulations')),docs(project.collection('reservations')),docs(tenant.collection('commandReceipts'))
]);

const response=await fetch(HR_URL,{headers:{'cache-control':'no-cache,no-store,max-age=0'}});
if(!response.ok)throw new Error('ENVIRONMENT_FAILURE:HR_HTTP_'+response.status);
const hr=await response.json();
const hrCurrent=arr(hr.visits).filter(v=>str(v.periodKey)==='2026-09');
const fsCurrent=visitDocs.filter(v=>str(v.periodId)==='cinepolis-2026-09');
const hmap=new Map(hrCurrent.map(v=>[str(v.hrRowId),v]));
const fmap=new Map(fsCurrent.map(v=>[str(v.hrRowId),v]));
const summarizeVisit=v=>v?({id:str(v.id),hrRowId:str(v.hrRowId),sourceTab:str(v.sourceTab),sourceRow:v.sourceRow??null,pais:str(v.pais||v.country),sucursal:str(v.sucursal),shopperId:str(v.shopperId),estado:str(v.estado||v.status),canonicalState:str(v.canonicalState),assignmentState:str(v.assignmentState),schedulingState:str(v.schedulingState),agendada:str(v.agendada),realizada:str(v.realizada),disponibleDesde:str(v.disponibleDesde),honorario:Number.isFinite(v.honorario)?v.honorario:null,sourceRevision:str(v.sourceRevision||v.hrSourceRevision),updatedAt:str(v.updatedAt)}):null;
const extraFs=[...fmap.keys()].filter(k=>!hmap.has(k)).sort().map(k=>summarizeVisit(fmap.get(k)));
const missingFs=[...hmap.keys()].filter(k=>!fmap.has(k)).sort().map(k=>summarizeVisit(hmap.get(k)));
const mismatches=[];
for(const [k,h] of hmap){const f=fmap.get(k);if(!f)continue;const fields=['shopperId','estado','canonicalState','assignmentState','schedulingState','agendada','realizada','disponibleDesde'];const diff={};for(const field of fields){if(str(h[field])!==str(f[field]))diff[field]={hr:str(h[field]),firestore:str(f[field])};}const hh=Number.isFinite(h.honorario)?h.honorario:null,fh=Number.isFinite(f.honorario)?f.honorario:null;if(hh!==fh)diff.honorario={hr:hh,firestore:fh};if(Object.keys(diff).length)mismatches.push({hrRowId:k,sucursal:str(h.sucursal),diff});}

const ids=['shopper_gt_018ca3e794','shopper_gt_bd74ace936'];
const identity={};
for(const id of ids){
  const profile=profiles.find(x=>x.id===id);
  identity[id]={
    profile:profile?safeMeta(profile):null,
    user:users.filter(x=>str(x.shopperId)===id).map(x=>safeMeta(x)),
    crosswalk:crosswalk.filter(x=>x.id===id||str(x.shopperId)===id||str(x.canonicalShopperId)===id||str(x.sourceShopperId)===id).map(x=>safeMeta(x)),
    links:links.filter(x=>str(x.shopperId)===id||str(x.canonicalShopperId)===id||str(x.sourceShopperId)===id).map(x=>safeMeta(x)),
    hrCurrent:hrCurrent.filter(x=>str(x.shopperId)===id).map(summarizeVisit),
    firestoreCurrent:fsCurrent.filter(x=>str(x.shopperId)===id).map(summarizeVisit),
    firestoreAll:visitDocs.filter(x=>str(x.shopperId)===id).map(summarizeVisit),
    postulations:posts.filter(x=>str(x.shopperId)===id).map(x=>({id:x.id,periodId:str(x.periodId),visitId:str(x.visitId||x.visitaId),sucursal:str(x.sucursal),shopperId:str(x.shopperId),shopper:str(x.shopper),estado:str(x.estado||x.status),source:str(x.source||x.sourceType),createdAt:str(x.createdAt||x.fecha||x.fechaProp),updatedAt:str(x.updatedAt)}))
  };
}

const currentHrIds=new Set(hrCurrent.map(x=>str(x.shopperId)).filter(Boolean));
const unresolvedCurrentNames=[...currentHrIds].map(id=>{
 const p=profiles.find(x=>x.id===id);return{id,nombre:p?str(p.nombre||[p.firstName,p.lastName].filter(Boolean).join(' ')):''};
}).filter(x=>!x.nombre);

const paulaIds=['s3','shopper_gt_1440137b73'];
const paula={
  profiles:profiles.filter(x=>paulaIds.includes(x.id)).map(x=>safeMeta(x)),
  users:users.filter(x=>paulaIds.includes(str(x.shopperId))||str(x.visibleLogin)==='paula.osorio').map(x=>safeMeta(x)),
  crosswalk:crosswalk.filter(x=>paulaIds.includes(x.id)||paulaIds.includes(str(x.shopperId))||paulaIds.includes(str(x.canonicalShopperId))||paulaIds.includes(str(x.sourceShopperId))).map(x=>safeMeta(x)),
  recentUpdateReceipts:receipts.filter(x=>str(x.commandType)==='shopper.update').sort((a,b)=>str(b.updatedAt||b.createdAt).localeCompare(str(a.updatedAt||a.createdAt))).slice(0,20).map(x=>safeMeta(x))
};

const result={
  schemaVersion:'cxorbia.i3.v26.identity-assignment-reconcile.v1',
  decision:'PASS_READ_ONLY_RECONCILIATION',
  generatedAt:new Date().toISOString(),
  production:false,writes:0,
  hr:{revision:str(hr.revision),revisionStable:hr.revisionStable===true,sourceSafe:hr.sourceSafe===true,generatedAt:str(hr.generatedAt),currentCount:hrCurrent.length},
  firestore:{currentCount:fsCurrent.length,totalVisits:visitDocs.length},
  parity:{extraFirestoreCount:extraFs.length,extraFirestore:extraFs,missingFirestoreCount:missingFs.length,missingFirestore:missingFs,mismatchCount:mismatches.length,mismatches},
  identity,
  unresolvedCurrentNames,
  paula,
  postulationCount:posts.length,
  reservationCount:reservations.length
};
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(OUT+'/v26-identity-assignment-reconcile.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({decision:result.decision,hr:result.hr,firestore:result.firestore,parity:result.parity,identity:result.identity,paula:result.paula,unresolvedCurrentNames:result.unresolvedCurrentNames},null,2));
