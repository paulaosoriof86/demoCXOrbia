import fs from 'node:fs';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const OUT=process.env.V25_OUT||'.tmp/i3-v25-visual-forensic';
if(!getApps().length) initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const db=getFirestore(),auth=getAuth();
const tenant=db.collection('tenants').doc('tya');
const project=tenant.collection('projects').doc('cinepolis');
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const cleanName=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const safeProfile=(id,x)=>({id,nombre:str(x.nombre||[x.firstName,x.lastName].filter(Boolean).join(' ')),firstName:str(x.firstName),lastName:str(x.lastName),pais:str(x.pais||x.country),sourceType:str(x.sourceType),shopperId:str(x.shopperId||id),projectIds:arr(x.projectIds).map(str),visibleLogin:str(x.visibleLogin||x.username||x.user),sourceShopperIds:arr(x.sourceShopperIds).map(str),exactAliases:arr(x.exactAliases).map(str),version:x.version??null,updatedAt:str(x.updatedAt),selfManagedFields:arr(x.selfManagedFields).map(str)});
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));

const [profiles,users,crosswalk,links,visits,posts,reservations,receipts]=await Promise.all([
  docs(tenant.collection('shoppers')),docs(tenant.collection('users')),docs(tenant.collection('shopperIdentityCrosswalk')),
  docs(tenant.collection('shopperIdentityLinks')),docs(project.collection('visits')),docs(project.collection('postulations')),
  docs(project.collection('reservations')),docs(tenant.collection('commandReceipts'))
]);

const dePazProfiles=profiles.filter(x=>/de\s*paz/.test(cleanName(x.nombre||[x.firstName,x.lastName].join(' ')))||/mishael|milton/.test(cleanName(x.nombre||[x.firstName,x.lastName].join(' ')))).map(x=>safeProfile(x.id,x));
const targetIds=new Set(dePazProfiles.flatMap(x=>[x.id,x.shopperId,...x.sourceShopperIds,...x.exactAliases]).filter(Boolean));
const dePazUsers=users.filter(x=>targetIds.has(str(x.shopperId))||/mishael|milton|de\s*paz/.test(cleanName([x.nombre,x.displayName,x.visibleLogin].filter(Boolean).join(' ')))).map(x=>({id:x.id,shopperId:str(x.shopperId),role:str(x.role),authNamespace:str(x.authNamespace),visibleLogin:str(x.visibleLogin),projectIds:arr(x.projectIds).map(str),active:x.active===true}));
const dePazCross=crosswalk.filter(x=>targetIds.has(x.id)||targetIds.has(str(x.shopperId))||targetIds.has(str(x.sourceShopperId))).map(x=>({id:x.id,shopperId:str(x.shopperId),sourceShopperId:str(x.sourceShopperId),canonicalShopperId:str(x.canonicalShopperId),projectIds:arr(x.projectIds).map(str),providerUidFingerprint:str(x.providerUidFingerprint),updatedAt:str(x.updatedAt)}));
const dePazLinks=links.filter(x=>targetIds.has(str(x.shopperId))||targetIds.has(str(x.sourceShopperId))||targetIds.has(str(x.canonicalShopperId))).map(x=>({id:x.id,shopperId:str(x.shopperId),sourceShopperId:str(x.sourceShopperId),canonicalShopperId:str(x.canonicalShopperId),authority:str(x.authority||x.identityAuthority),state:str(x.state||x.status),projectIds:arr(x.projectIds).map(str)}));
const dePazVisits=visits.filter(x=>targetIds.has(str(x.shopperId))).map(x=>({id:x.id,hrRowId:str(x.hrRowId),periodId:str(x.periodId),sucursal:str(x.sucursal),shopperId:str(x.shopperId),estado:str(x.estado||x.status),agendada:str(x.agendada),realizada:str(x.realizada),assignmentSource:str(x.assignmentSource),assignmentSyncStatus:str(x.assignmentSyncStatus)}));
const dePazPosts=posts.filter(x=>targetIds.has(str(x.shopperId))).map(x=>({id:x.id,periodId:str(x.periodId),visitaId:str(x.visitaId||x.visitId),sucursal:str(x.sucursal),shopperId:str(x.shopperId),shopper:str(x.shopper),estado:str(x.estado||x.status),fecha:str(x.fechaProp||x.createdAt)}));

const paulaMembers=users.filter(x=>cleanName(x.visibleLogin)==='paula.osorio'||cleanName(x.nombre||x.displayName).includes('paula osorio')||['s3','shopper_gt_1440137b73'].includes(str(x.shopperId)));
const paula=[];
for(const m of paulaMembers){
  let au=null;try{const u=await auth.getUser(m.id);au={uid:u.uid,email:str(u.email),disabled:u.disabled===true,claims:u.customClaims||{}};}catch(e){au={error:str(e?.code||e?.message||e)};}
  const sid=str(m.shopperId);
  const ps=profiles.find(x=>x.id===sid),cw=crosswalk.find(x=>x.id===sid);
  paula.push({member:{id:m.id,shopperId:sid,visibleLogin:str(m.visibleLogin),role:str(m.role),authNamespace:str(m.authNamespace),projectIds:arr(m.projectIds).map(str),active:m.active===true},auth:au,profile:ps?safeProfile(ps.id,ps):null,crosswalk:cw?{id:cw.id,shopperId:str(cw.shopperId),sourceShopperId:str(cw.sourceShopperId),canonicalShopperId:str(cw.canonicalShopperId),projectIds:arr(cw.projectIds).map(str),providerUidFingerprint:str(cw.providerUidFingerprint)}:null});
}
const explicitPaulaIds=['s3','shopper_gt_1440137b73'];
const paulaIdPresence=explicitPaulaIds.map(id=>({id,profile:!!profiles.find(x=>x.id===id),crosswalk:!!crosswalk.find(x=>x.id===id),member:users.filter(x=>str(x.shopperId)===id).map(x=>({id:x.id,visibleLogin:str(x.visibleLogin),projectIds:arr(x.projectIds).map(str)}))}));

const recentShopperUpdateReceipts=receipts.filter(x=>str(x.commandType)==='shopper.update').sort((a,b)=>str(b.updatedAt||b.createdAt).localeCompare(str(a.updatedAt||a.createdAt))).slice(0,30).map(x=>({id:x.id,shopperId:str(x.shopperId||x.entityId),status:str(x.status),providerAck:x.providerAck===true,actorUid:str(x.actorUid),selfScoped:x.selfScoped===true,updatedAt:str(x.updatedAt||x.createdAt)}));

const current=visits.filter(x=>str(x.periodId)==='cinepolis-2026-09');
const honoraria=current.map(x=>x.honorario).filter(v=>Number.isFinite(v));
const currentHonorarium={visits:current.length,knownCount:honoraria.length,nullOrUnknown:current.length-honoraria.length,uniqueKnown:[...new Set(honoraria)].sort((a,b)=>a-b),examples:current.filter(x=>Number.isFinite(x.honorario)).slice(0,12).map(x=>({id:x.id,hrRowId:str(x.hrRowId),sucursal:str(x.sucursal),honorario:x.honorario,currency:str(x.currency)}))};

const scheduling=current.filter(x=>str(x.shopperId)&&!str(x.realizada)&&(!str(x.agendada)||['asignada','assigned'].includes(cleanName(x.estado||x.status)))).map(x=>({id:x.id,hrRowId:str(x.hrRowId),sucursal:str(x.sucursal),shopperId:str(x.shopperId),estado:str(x.estado||x.status),agendada:str(x.agendada),disponibleDesde:str(x.disponibleDesde),updatedAt:str(x.updatedAt)}));
const inconsistentScheduling=current.filter(x=>str(x.shopahopperId));
const currentStateCounts=current.reduce((a,x)=>{const k=str(x.estado||x.status)||'blank';a[k]=(a[k]||0)+1;return a;},{});
const result={schemaVersion:'cxorbia.i3.v25.visual-forensic.v1',decision:'PASS_READ_ONLY_DIAGNOSTIC',generatedAt:new Date().toISOString(),production:false,writes:0,counts:{profiles:profiles.length,users:users.length,crosswalk:crosswalk.length,links:links.length,visits:visits.length,posts:posts.length,reservations:reservations.length},dePaz:{profiles:dePazProfiles,users:dePazUsers,crosswalk:dePazCross,links:dePazLinks,visits:dePazVisits,postulations:dePazPosts,postulationCount:dePazPosts.length,visitCount:dePazVisits.length},paula:{members:paula,idPresence:paulaIdPresence,recentShopperUpdateReceipts},currentHonorarium,currentStateCounts,schedulingRows:scheduling.slice(0,40)};
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/v25-visual-forensic.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({decision:result.decision,dePaz:result.dePaz,paula:result.paula,currentHonorarium:result.currentHonorarium,currentStateCounts:result.currentStateCounts,schedulingRows:result.schedulingRows},null,2));
