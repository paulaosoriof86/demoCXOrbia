/* I3/F2: readonly owner signature of duplicate durable visits.
 * No PII, raw IDs or visit payloads in the receipt. No writes.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const norm=x=>String(x??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const val=x=>String(x??'').trim();
const sha=x=>crypto.createHash('sha256').update(x).digest('hex').slice(0,12);
const pkey=d=>val(d.periodId||d.measurementPeriodId||(d.periodKey?'cinepolis-'+d.periodKey:''));
const country=d=>val(d.country||d.pais).toUpperCase();
const key=d=>[pkey(d),country(d),norm(d.cinemaId||d.hrManaged?.cinemaId),
 norm(d.quincena||d.hrManaged?.quincena),norm(d.escenario||d.hrManaged?.escenario)].join('|');
const kind=id=>/^hr_excel_/.test(id)?'EXCEL_KEY':/^hr_20/.test(id)?'HR_ROW_KEY':/^visit_/.test(id)?'VISIT_KEY':/^v[-_]/.test(id)?'V_KEY':'OTHER_KEY';
const output='.tmp/i3-f2-duplicate-durable-ownership/result.json';
const proof={schemaVersion:'cxorbia.i3.f2.durable-duplicate-ownership-readonly.v1',
 tenantId:'tya',projectId:'cinepolis',decision:'HOLD',writeCount:0,
 hrWrites:0,authWrites:0,production:false};
const fail=code=>{throw Error(code)};
try{
 if(process.env.GITHUB_REF!=='refs/heads/recovery/cxorbia-phase-a-20260831'
 ||process.env.GITHUB_REPOSITORY!=='paulaosoriof86/demoCXOrbia')fail('SOURCE_FAILURE:WRONG_BRANCH');
 const app=initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
 const db=getFirestore(app);
 const project=db.collection('tenants').doc('tya').collection('projects').doc('cinepolis');
 const [visits,postulations,reservations,certifications,liquidations]=await Promise.all([
  project.collection('visits').get(),project.collection('postulations').get(),
  project.collection('reservations').get(),project.collection('certifications').get(),project.collection('liquidations').get()
 ]);
 const links=new Map(),fields=['visitId','hrRowId','originalVisitId','sourceVisitId','canonicalVisitId','assignedVisitId'];
 const sets=[['postulations',postulations],['reservations',reservations],['certifications',certifications],['liquidations',liquidations]];
 for(const [label,rows] of sets){
   for(const d of rows.docs){
    const data=d.data()||{};
    const ids=[...fields.map(f=>val(data[f])),...(Array.isArray(data.visitIds)?data.visitIds.map(val):[])].filter(Boolean);
    for(const id of new Set(ids)){
      if(!links.has(id))links.set(id,{total:0,types:{}});
      const record=links.get(id);record.total++;record.types[label]=(record.types[label]||0)+1;
    }
   }
 }
 const groups=new Map(),seen=new Set();
 for(const doc of visits.docs){
  const d={...doc.data(),id:doc.id},k=key(d);
  if(!/^cinepolis-20\d\d-(0[1-9]|1[0-2])\|(?:GT|HN)\|/.test(k))continue;
  if(seen.has(doc.id))fail('MAPPING_FAILURE:DUPLICATE_DOC_ID');seen.add(doc.id);
  if(!groups.has(k))groups.set(k,[]);
  groups.get(k).push(d);
 }
 const duplicated=[...groups.entries()].filter(([,rows])=>rows.length>1);
 const same=x=>new Set(x.map(v=>val(v))).size===1;
 const idsShared=rows=>rows.every(v=>val(v.hrRowId))&&same(rows.map(v=>v.hrRowId));
 const summaries=duplicated.map(([k,rows])=>{
  const parts=k.split('|'),type=rows.map(v=>kind(v.id)).sort().join('+');
  const linkCounts=rows.map(v=>links.get(v.id)?.total||0);
  const sharedHrRowRefs=idsShared(rows)?(links.get(val(rows[0].hrRowId))?.total||0):0;
  const origin=rows.map(v=>val(v.sourceTab||v.hrManaged?.sourceTab)),sr=rows.map(v=>val(v.sourceRow||v.hrManaged?.sourceRow));
  const ids=rows.map(v=>val(v.hrRowId));
  const assigned=rows.map(v=>Boolean(v.shopperId||v.canonicalShopperId));
  const finance=rows.map(v=>v.canonicalFacets?.paymentConfirmed===true||v.paymentConfirmed===true);
  return {country:parts[1],period:parts[0].slice(-7),count:rows.length,type,sourceTabEqual:same(origin),
   sourceRowEqual:same(sr),sourceRowsPresent:sr.filter(Boolean).length,hrRowIdEqual:same(ids),
   hrRowIdsPresent:ids.filter(Boolean).length,linkedOwners:linkCounts.filter(n=>n>0).length,
   linksPerCandidate:linkCounts,sharedHrRowRefs,assignedOwners:assigned.filter(Boolean).length,
   directOwnerCategories:rows.map((v,i)=>({kind:kind(v.id),directLinks:linkCounts[i],paid:finance[i]})),
   confirmedPayments:finance.filter(Boolean).length,
   versionClass:rows.map(v=>Number(v.version||0)).sort((a,b)=>a-b),
   fingerprint:sha(k)};
 });
 const countBy=(fn)=>summaries.reduce((a,z)=>(a[fn(z)]=(a[fn(z)]||0)+1,a),{});
 proof.totalDurableVisits=visits.size;
 proof.groupCount=groups.size;
 proof.duplicateBusinessKeyGroups=summaries.length;
 proof.duplicateDurableRows=summaries.reduce((n,s)=>n+s.count,0);
 proof.byCountryPeriod=countBy(z=>z.country+'|'+z.period);
 proof.byPairType=countBy(z=>z.type);
 proof.bySourceCoordinate=countBy(z=>z.sourceTabEqual&&z.sourceRowEqual&&z.sourceRowsPresent===z.count?'SAME_SOURCE_ROW':'DIFFERENT_OR_MISSING_COORD');
 proof.byStableHrRowId=countBy(z=>z.hrRowIdEqual&&z.hrRowIdsPresent===z.count?'SAME_HR_ROW':'DIFFERENT_OR_MISSING_HR_ROW');
 proof.byRelationships=countBy(z=>z.linkedOwners===0?'NONE':z.linkedOwners===1?'ONE_LINKED':'MULTIPLE_LINKED');
 proof.bySharedHrCoordReferences=countBy(z=>z.sharedHrRowRefs>0?'SHARED_COORD_REFERENCED':'NONE');
 proof.byConfirmedPaymentOwnership=countBy(z=>z.confirmedPayments===0?'NO_PAYMENT':z.confirmedPayments===1?'ONE_PAID':'MULTIPLE_PAID');
 proof.samples=summaries.filter(x=>['2025-06','2026-07','2026-09','2026-10'].includes(x.period)).slice(0,16);
 proof.refsScanned=Object.fromEntries(sets.map(([label,snap])=>[label,snap.size]));
 proof.decision='PASS_DURABLE_DUPLICATE_PROVENANCE_INVENTORY_READONLY';
}catch(e){
 proof.errorCode=/^(SOURCE_FAILURE|MAPPING_FAILURE|AUTH_FAILURE):[A-Z0-9_]+$/.test(String(e.message))?e.message:'ENVIRONMENT_FAILURE:READONLY_PROVENANCE';
 process.exitCode=1;
}finally{
 fs.mkdirSync('.tmp/i3-f2-duplicate-durable-ownership',{recursive:true});
 fs.writeFileSync(output,JSON.stringify(proof,null,2)+'\n');
 console.log('CXORBIA_F2_DUPLICATE_OWNER_PROOF='+JSON.stringify(proof));
}
