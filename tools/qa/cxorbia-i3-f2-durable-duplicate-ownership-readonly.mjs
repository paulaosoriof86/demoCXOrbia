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
 const aliasPeriodRows=visits.docs.map(doc=>({id:doc.id,...(doc.data()||{})}))
   .filter(d=>/^20\\d{2}-(?:0[1-9]|1[0-2])$/.test(val(d.periodId))&&['GT','HN'].includes(country(d)));
 const aliasByPeriod=aliasPeriodRows.reduce((m,row)=>{
   const key=val(row.periodId);m[key]=(m[key]||0)+1;return m;
 },{});
 const aliasReferenced=aliasPeriodRows.filter(d=>(links.get(d.id)?.total||0)>0).length;
 const aliasPaid=aliasPeriodRows.filter(d=>d.canonicalFacets?.paymentConfirmed===true||d.paymentConfirmed===true).length;
 const aliasByIdKind=aliasPeriodRows.reduce((m,d)=>{const k=kind(d.id);m[k]=(m[k]||0)+1;return m},{});
 const aliasSharedWithCanonical=aliasPeriodRows.filter(d=>
   visits.docs.some(x=>{const v=x.data()||{};return val(v.periodId)==='cinepolis-'+val(d.periodId)
     &&country(v)===country(d)&&val(v.hrRowId)&&val(v.hrRowId)===val(d.hrRowId);}
   )).length;
 proof.periodAlias={total:aliasPeriodRows.length,byPeriod:aliasByPeriod,
   byIdKind:aliasByIdKind,directlyReferenced:aliasReferenced,paid:aliasPaid,
   sameHrRowOnCanonicalPeriod:aliasSharedWithCanonical};
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
   linkedKinds:rows.filter((v,i)=>linkCounts[i]>0).map(v=>kind(v.id)).sort().join('+')||'NONE',
   paidKinds:rows.filter((v,i)=>finance[i]).map(v=>kind(v.id)).sort().join('+')||'NONE',
   confirmedPayments:finance.filter(Boolean).length,
   versionClass:rows.map(v=>Number(v.version||0)).sort((a,b)=>a-b),
   fingerprint:sha(k)};
 });
 const countBy=(fn)=>summaries.reduce((a,z)=>(a[fn(z)]=(a[fn(z)]||0)+1,a),{});
 const other=visits.docs.map(x=>({id:x.id,...(x.data()||{})})).filter(x=>
  !/^cinepolis-20\d\d-(0[1-9]|1[0-2])\|(?:GT|HN)\|/.test(key(x)));
 const tally=(f)=>other.reduce((a,x)=>{const k=f(x);a[k]=(a[k]||0)+1;return a;},{});
 const periodClass=x=>{const p=pkey(x);return /^cinepolis-20\d\d-(0[1-9]|1[0-2])$/.test(p)?'canonical':
   /^20\d\d-(0[1-9]|1[0-2])$/.test(p)?'unprefixed':!p?'missing':'other'};
 const countryClass=x=>{const c=country(x);return ['GT','HN'].includes(c)?c:
   ['GUATEMALA','HONDURAS'].includes(c)?c:'OTHER_OR_EMPTY'};
 proof.unclassified={count:other.length,periodFormats:tally(x=>periodClass(x)),countryFormats:tally(x=>countryClass(x)),
   jointByFormat:tally(x=>periodClass(x)+'|'+countryClass(x)),
   byPeriod:tally(x=>pkey(x).replace(/^cinepolis-/,'').slice(0,7)||'missing'),
   idKinds:tally(x=>kind(x.id)),
   directRefs:other.filter(x=>(links.get(x.id)?.total||0)>0).length,
   paymentConfirmed:other.filter(x=>x.canonicalFacets?.paymentConfirmed===true||x.paymentConfirmed===true).length,
   archived:other.filter(x=>x._archived===true||['archived','archivada','cancelled','cancelada'].includes(norm(x.estado||x.status))).length,
   hrRowIdPresent:other.filter(x=>val(x.hrRowId)).length};
 const normalizedGroups=new Map();
 for(const doc of visits.docs){
   const row={id:doc.id,...(doc.data()||{})},p=pkey(row);
   const period=/^20\d\d-(0[1-9]|1[0-2])$/.test(p)?'cinepolis-'+p:p;
   if(!/^cinepolis-20\d\d-(0[1-9]|1[0-2])$/.test(period)||!['GT','HN'].includes(country(row)))continue;
   const k=[period,country(row),norm(row.cinemaId||row.hrManaged?.cinemaId),
     norm(row.quincena||row.hrManaged?.quincena),norm(row.escenario||row.hrManaged?.escenario)].join('|');
   if(!normalizedGroups.has(k))normalizedGroups.set(k,[]);
   normalizedGroups.get(k).push(row);
 }
 const grouped=[...normalizedGroups.values()];
 const countsBySize=grouped.reduce((m,rows)=>{
   const k=rows.length;m[k]=(m[k]||0)+1;return m;
 },{});
 const sameValues=values=>new Set(values.map(val)).size===1;
 const differingHrRow=grouped.filter(rows=>rows.length>1
   &&(!rows.every(x=>val(x.hrRowId))||!sameValues(rows.map(x=>x.hrRowId)))).length;
 const differingSourceCoord=grouped.filter(rows=>rows.length>1&&(
   !sameValues(rows.map(x=>x.sourceTab))||!sameValues(rows.map(x=>x.sourceRow)))).length;
 const byDirectRefs=grouped.filter(rows=>rows.length>1).reduce((m,rows)=>{
   const n=rows.filter(x=>(links.get(x.id)?.total||0)>0).length;
   const k=rows.length+'|'+n+'-referenced';m[k]=(m[k]||0)+1;return m;
 },{});
 const byPayment=grouped.filter(rows=>rows.length>1).reduce((m,rows)=>{
   const n=rows.filter(x=>x.canonicalFacets?.paymentConfirmed===true||x.paymentConfirmed===true).length;
   const k=rows.length+'|'+n+'-paid';m[k]=(m[k]||0)+1;return m;
 },{});
 proof.normalizedTripleLineage={groups:grouped.length,countsBySize,
   maxGroupSize:Math.max(...grouped.map(x=>x.length)),
   differingHrRow,differingSourceCoord,byDirectRefs,byPayment,
   expectedAllRows:visits.size,groupedRows:grouped.reduce((n,x)=>n+x.length,0)};
 const exactLegacy=visits.docs.map(x=>({id:x.id,...(x.data()||{})}))
   .filter(d=>/^20\d\d-(0[1-9]|1[0-2])$/.test(pkey(d))&&['GT','HN'].includes(country(d)));
 const canon=visits.docs.map(x=>({id:x.id,...(x.data()||{})}))
   .filter(d=>/^cinepolis-20\d\d-(0[1-9]|1[0-2])$/.test(pkey(d))&&['GT','HN'].includes(country(d)));
 const sameHr=(a,b)=>val(a.hrRowId)&&val(a.hrRowId)===val(b.hrRowId);
 const sameCoord=(a,b)=>val(a.sourceTab)&&val(a.sourceTab)===val(b.sourceTab)&&
   val(a.sourceRow)&&val(a.sourceRow)===val(b.sourceRow);
 const matchKeys=countByType=>exactLegacy.reduce((m,x)=>{
   const candidates=canon.filter(y=>pkey(y)==='cinepolis-'+pkey(x)&&country(y)===country(x)
     &&sameHr(x,y));
   const coordinateConsistent=candidates.length&&candidates.every(y=>sameCoord(x,y));
   const label=countByType(x,candidates,coordinateConsistent);m[label]=(m[label]||0)+1;return m;
 },{});
 proof.legacyExactHrRowJoin={
   legacyRows:exactLegacy.length,canonicalRows:canon.length,
   byCandidates:matchKeys((x,m)=>String(m.length)),
   byCoordinate:matchKeys((x,m,ok)=>m.length?ok?'MATCHED_COORD':'MISMATCH_COORD':'NO_HR_ROW_JOIN'),
   byDirectLink:matchKeys((x,m)=>String((links.get(x.id)?.total||0)>0)+'|'+String(m.length)),
   byBusinessFields:matchKeys((x)=>['cinemaId','sucursal','quincena','escenario']
     .map(k=>val(x[k]??x.hrManaged?.[k])?'1':'0').join('')),
   noAutomaticMerge:true,sourceWrites:0,firestoreWrites:0
 };
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
 proof.byDirectLinkedKind=countBy(z=>z.linkedKinds);
 proof.byPaidKind=countBy(z=>z.paidKinds);
 proof.byLinkAndPaidKind=countBy(z=>z.linkedKinds+'|'+z.paidKinds);
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
