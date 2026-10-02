#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const TENANT=process.env.TENANT_ID||'tya';
const PROJECT_ID=process.env.PROJECT_ID||'cinepolis';
const OUT=process.env.OUT||'.tmp/human-acceptance-forensic';
const HR_FILE=process.env.HR_FILE||'';
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const db=getFirestore();
const str=v=>String(v==null?'':v).trim(), arr=v=>Array.isArray(v)?v:[];
const low=v=>str(v).toLocaleLowerCase('es');
const cleanDoc=d=>({id:d.id,...(d.data()||{})});
const tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT_ID);
async function rows(ref){const s=await ref.get();return s.docs.map(cleanDoc);}
const [bulletins,visits,posts,certs,recerts,resources,recons,shopperProfiles]=await Promise.all([
  rows(tenant.collection('bulletins')),
  rows(project.collection('visits')),
  rows(project.collection('postulations')),
  rows(project.collection('certifications')),
  rows(project.collection('certificationRecertifications')),
  rows(tenant.collection('resources')),
  rows(tenant.collection('paymentReconciliations')),
  rows(tenant.collection('shoppers'))
]);
const projectSnap=await project.get(), projectData=projectSnap.exists?(projectSnap.data()||{}):{};
const hr=HR_FILE&&fs.existsSync(HR_FILE)?JSON.parse(fs.readFileSync(HR_FILE,'utf8')):{};
const hrVisits=arr(hr.visits),currentKey=str(hr.source?.currentCalendarPeriodKey||hr.currentCalendarPeriodKey||'2026-10');
const currentPeriodId=PROJECT_ID+'-'+currentKey;

const approvalBulletins=bulletins.filter(b=>/postulaci[oó]n aprobada/i.test(str(b.title)));
const shopperBroad=approvalBulletins.filter(b=>arr(b.targetRoles).map(low).includes('shopper')&&!arr(b.targetShopperIds).map(str).filter(Boolean).length);
const activeStale=approvalBulletins.filter(b=>low(b.status||'active')==='active');
const notif={
 total:bulletins.length,approvalBulletins:approvalBulletins.length,activeApprovalBulletins:activeStale.length,
 broadShopperApprovalBulletins:shopperBroad.length,
 examples:approvalBulletins.slice(0,12).map(b=>({id:b.id,title:b.title||null,body:b.body||b.text||null,status:b.status||'active',createdAt:b.createdAt||null,targetRoles:b.targetRoles||[],targetShopperIds:b.targetShopperIds||[],targetProjectIds:b.targetProjectIds||[],entityType:b.entityType||null,entityId:b.entityId||null,eventKey:b.eventKey||null,idempotencyKey:b.idempotencyKey||null}))
};

const rawCurrentPosts=posts.filter(p=>str(p.periodId)===currentPeriodId);
const activeCurrentPosts=rawCurrentPosts.filter(p=>p._archived!==true&&p.active!==false&&str(p.postulationLifecycle)!=='transitioned_to_assignment');
const postulations={
 currentPeriodId,rawCurrent:rawCurrentPosts.length,rawPending:rawCurrentPosts.filter(p=>low(p.estado||p.status)==='pendiente').length,
 activeCurrent:activeCurrentPosts.length,activePending:activeCurrentPosts.filter(p=>low(p.estado||p.status)==='pendiente').length,
 transitioned:rawCurrentPosts.filter(p=>str(p.postulationLifecycle)==='transitioned_to_assignment').length,
 inactive:rawCurrentPosts.filter(p=>p.active===false).length,
 samples:rawCurrentPosts.slice(0,20).map(p=>({id:p.id,status:p.estado||p.status||null,active:p.active,postulationLifecycle:p.postulationLifecycle||null,visitId:p.visitId||p.visitaId||null,shopperId:p.shopperId||null}))
};

const cayalaHr=hrVisits.filter(v=>str(v.periodKey)===currentKey&&/paseo cayal[aá]/i.test(str(v.sucursal)));
const visitRows=[];
for(const hv of cayalaHr){
  const candidates=[str(hv.hrRowId),str(hv.id||hv.visitId)].filter(Boolean);
  let dv=null;for(const id of candidates){const x=visits.find(v=>v.id===id||str(v.hrRowId)===str(hv.hrRowId)||str(v.visitId)===str(hv.id||hv.visitId));if(x){dv=x;break;}}
  const browserExpected=(hv.version??hv.updatedAt??hv.lastSyncedAt??hv.hrRevision??hv.sourceRevision??'source-current');
  visitRows.push({
    hr:{id:hv.id||hv.visitId||null,hrRowId:hv.hrRowId||null,sucursal:hv.sucursal||null,periodKey:hv.periodKey||null,estado:hv.estado||hv.status||null,shopperId:hv.shopperId||null,disponibleDesde:hv.disponibleDesde||null,agendada:hv.agendada||null,realizada:hv.realizada||null},
    durable:dv?{id:dv.id,hrRowId:dv.hrRowId||null,periodId:dv.periodId||null,estado:dv.estado||dv.status||null,shopperId:dv.shopperId||null,version:dv.version??null,agendada:dv.agendada||null,disponibleDesde:dv.disponibleDesde||null,assignmentSource:dv.assignmentSource||null,assignmentSyncStatus:dv.assignmentSyncStatus||null}:null,
    browserExpectedVersion:String(browserExpected),
    providerVersion:dv?String(dv.version??dv.updatedAt??dv.lastSyncedAt??dv.hrRevision??dv.sourceRevision??'source-current'):null,
    periodMatches:dv?str(dv.periodId)===currentPeriodId:false,
    stateSchedulable:dv?['asignada'].includes(low(dv.estado||dv.status)):false
  });
}
const scheduling={currentKey,currentPeriodId,cayala:visitRows};

const certBanks=resources.filter(r=>r.resourceType==='certification_bank'&&str(r.projectId)===PROJECT_ID);
const certifications={
 bankCount:certBanks.length,banks:certBanks.map(r=>({id:r.id,periodId:r.periodId||null,status:r.status||null,bankState:r.bank?.estado||null,gate:r.bank?.gate||null,contentRevision:r.bank?.contentRevision||null,questionCount:arr(r.bank?.preguntas).length})),
 attempts:certs.length,passed:certs.filter(c=>c.pass===true).length,failed:certs.filter(c=>c.pass===false).length,
 recertifications:recerts.length,activeRecertifications:recerts.filter(r=>str(r.status||'active')==='active').length
};

const paidVisits=visits.filter(v=>v.paymentConfirmed===true);
const histPaid=visits.filter(v=>low(v.historicalPaymentStatus)==='paid'||v.historicalReconciliationConfirmed===true);
const exactFinance=visits.filter(v=>low(v.financialSourceStatus)==='reconciled_exact'&&v.financialMatch);
const recProject=recons.filter(r=>str(r.projectId)===PROJECT_ID);
const finance={
 durableVisits:visits.length,paymentConfirmed:paidVisits.length,historicalPaidMarkers:histPaid.length,exactFinancialMatchVisits:exactFinance.length,
 reconciliationRecords:recProject.length,reconciliationPaid:recProject.filter(r=>low(r.paymentStatus)==='paid').length,reconciliationPending:recProject.filter(r=>low(r.paymentStatus)==='pending').length,
 octoberReconciliationRecords:recProject.filter(r=>str(r.periodId)===PROJECT_ID+'-2026-10'||str(r.periodKey)==='2026-10').length,
 projectedGap:histPaid.filter(v=>!(low(v.financialSourceStatus)==='reconciled_exact'&&v.financialMatch)).length
};

const names=shopperProfiles.map(s=>({id:s.id,name:str(s.nombre||s.name),firstName:str(s.firstName),lastName:str(s.lastName),projectIds:arr(s.projectIds).map(str),active:s.active,status:s.status||s.estado||null}));
const identity={
 totalProfiles:names.length,
 milton:names.filter(x=>/milton/i.test(x.name)).map(x=>({id:x.id,name:x.name,projectIds:x.projectIds,active:x.active,status:x.status})),
 patricia:names.filter(x=>/patricia/i.test(x.name)).map(x=>({id:x.id,name:x.name,projectIds:x.projectIds,active:x.active,status:x.status}))
};

const reservations={windowMode:projectData.reservationWindowMode||projectData.reservationPolicy?.windowMode||'future_only',timeZone:projectData.timeZone||projectData.timezone||'America/Guatemala'};
const out={schemaVersion:'cxorbia.i3.human-acceptance-forensic-readback.v1',decision:'PASS_READ_ONLY_FORENSIC',tenantId:TENANT,projectId:PROJECT_ID,currentPeriodId,notifications:notif,postulations,scheduling,certifications,finance,identity,reservations,writes:0,hrWrites:0,production:false};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
