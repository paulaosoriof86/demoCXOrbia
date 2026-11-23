import crypto from 'node:crypto';
import {resolveCountryHrPeriodBinding} from './cxorbia-country-hr-binding-v1.mjs';
import {parseTab,buildPeriods,buildShoppers} from '../../tools/hr-source/tya-build-live-hr-source-safe-r20.mjs';
import {summarizeCanonicalPeriods,validateCanonicalHistory} from '../../tools/hr-source/tya-canonical-visit-state-r20.mjs';
// I3 F2: read-only original Excel HR, scoped by durable Firestore project/country/period.
const str=x=>String(x??'').trim();
const norm=x=>str(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const sha=x=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const fail=code=>{throw Error('MAPPING_FAILURE:F2_'+code)};
const getCountry=x=>str(x.country||x.pais).toUpperCase();
const getPeriod=(x,p)=>str(x.periodId||x.measurementPeriodId||(x.periodKey?p+'-'+x.periodKey:''));
const fields=(v,names)=>names.map(k=>norm(v[k]??v.hrManaged?.[k]));
const groups=[['cinemaId','quincena','escenario'],['sucursal','quincena','escenario'],['sucursal','quincena','escenario','tipoCombo']];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const validScope=s=>s&&/^[a-z0-9_-]+$/i.test(str(s.tenantId))&&/^[a-z0-9_-]+$/i.test(str(s.projectId));
const validPeriod=(p,v)=>str(v).startsWith(p+'-')&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(str(v).slice(p.length+1));
const stamp=s=>({seconds:s?.updateTime?.seconds??null,nanoseconds:s?.updateTime?.nanoseconds??null});
function matchDurable(source,scope,previous,{sourceSiblings=1}={}){
 // Original row identity is a stronger join than financial state, and must
 // preserve ALL historical documents that refer to the same HR row.
 const pool=previous.filter(v=>getCountry(v)===scope.countryCode&&getPeriod(v,scope.projectId)===scope.periodId);
 // F2: physical Excel row, scenario and combo can change. In a single country,
 // project and month, cinema ID + execution cut establish the stable visit.
 // Historical duplicate documents are aliases, not extra assignments.
 const stableKeys=['cinemaId','quincena'],stable=fields(source,stableKeys);
 const stableMatches=stable.every(Boolean)?pool.filter(v=>same(fields(v,stableKeys),stable)):[];
 // Two independently listed rows in THIS month are two separate visits,
 // even if cinema and execution cut agree. They must not share a durable ID.
 // Exact scoped source coordinates are the only automatic join in this case.
 if(sourceSiblings>1){
   const precise=pool.filter(v=>str(v.hrRowId)===str(source.hrRowId)&&
     str(v.sourceTab)===str(source.sourceTab)&&str(v.sourceRow)===str(source.sourceRow)
     &&fields(v,['cinemaId','sucursal','quincena']).every((x,i)=>
       x===fields(source,['cinemaId','sucursal','quincena'])[i]));
   if(!precise.length)return null;
   const sameId=precise.filter(v=>str(v.id)===str(source.id));
   const canonical=precise.filter(v=>/^hr_20\\d{2}-(0[1-9]|1[0-2])_(gt|hn)_/i.test(str(v.id)));
   const chosen=sameId.length===1?sameId[0]:canonical.length===1?canonical[0]:
     precise.length===1?precise[0]:null;
   if(!chosen)return null; // ambiguous old references stay durable, no write/merge
   return {primary:chosen,cohort:precise};
 }
 if(stableMatches.length){
   const branch=fields(source,['sucursal'])[0];
   if(branch&&stableMatches.some(v=>fields(v,['sucursal'])[0]&&fields(v,['sucursal'])[0]!==branch))
     fail('STABLE_SITE_BRANCH_CONTRADICTION');
   const owners=stableMatches.filter(v=>str(v.periodId)===scope.periodId);
   const canonical=owners.filter(v=>/^hr_20\d{2}-(0[1-9]|1[0-2])_(gt|hn)_/i.test(str(v.id)));
   if(canonical.length>1)fail('CANONICAL_DURABLE_OWNER_NOT_PROVEN');
   const exact=owners.filter(v=>str(v.id)===str(source.id));
   if(exact.length>1)fail('CANONICAL_DURABLE_OWNER_NOT_PROVEN');
   const chosen=canonical.length===1?canonical[0]:exact.length===1?exact[0]:
     owners.length===1?owners[0]:null;
   if(!chosen)fail('CANONICAL_DURABLE_OWNER_NOT_PROVEN');
   const sameCoordinate=pool.filter(v=>str(v.hrRowId)===str(source.hrRowId)&&
     str(v.sourceTab)===str(source.sourceTab)&&str(v.sourceRow)===str(source.sourceRow));
   // Preserve strictly coordinate-linked historical aliases that have NO
   // competing cinema or branch identity; do not absorb an unrelated row.
   const neutralAliases=sameCoordinate.filter(v=>str(v.id)!==str(chosen.id)&&
     fields(v,['cinemaId','sucursal']).every(x=>!x));
   const cohort=[...new Map([...stableMatches,...neutralAliases].map(v=>[str(v.id),v])).values()];
   return {primary:chosen,cohort};
 }
 const coord=v=>str(v.sourceTab)+'|'+str(v.sourceRow);
 const hrRow=str(source.hrRowId);
 const matchesHrRow=v=>hrRow&&str(v.hrRowId)===hrRow&&
    str(v.sourceTab)===str(source.sourceTab)&&str(v.sourceRow)===str(source.sourceRow);
 const rowFamily=pool.filter(matchesHrRow);
 // Reject a source-row collision: when both original cinema and branch are
 // known but DIFFER, it is not the same visit despite its physical row.
 const foreign=rowFamily.filter(v=>{
   const a=fields(source,['cinemaId','sucursal']),b=fields(v,['cinemaId','sucursal']);
   return a.every(Boolean)&&b.every(Boolean)&&a[0]!==b[0]&&a[1]!==b[1];
 });
 if(foreign.length){
   // A worksheet row can move. Never reuse a mismatched historical coordinate.
   // Require three independent business-key joins to one durable owner.
   const strong=groups.map(keys=>pool.filter(row=>{
     const sourceKeys=fields(source,keys);
     return sourceKeys.every(Boolean)&&same(sourceKeys,fields(row,keys));
   }));
   // Duplicate historical documents may refer to the SAME visit. Require
   // the exact same document cohort across all business-key groups rather than
   // falsely treating the duplicates as separate visits.
   const ids=rows=>rows.map(v=>str(v.id)).sort();
   const cohort=strong[0];
   if(!cohort.length||!strong.every(rows=>rows.length&&same(ids(rows),ids(cohort))))
      fail('EXACT_HR_ROW_CONTRADICTORY_BUSINESS_IDENTITY');
   const candidates=cohort.filter(v=>str(v.periodId)===scope.periodId);
   const exact=candidates.filter(v=>str(v.id)===str(source.id));
   if(exact.length>1)fail('CANONICAL_DURABLE_OWNER_NOT_PROVEN');
   let selected=exact[0]||null;
   if(!selected){
     const canonical=candidates.filter(v=>/^hr_20\d{2}-(0[1-9]|1[0-2])_(gt|hn)_/i.test(str(v.id)));
     if(canonical.length===1)selected=canonical[0];
     else if(canonical.length===0&&candidates.length===1)selected=candidates[0];
   }
   if(!selected)fail('CANONICAL_DURABLE_OWNER_NOT_PROVEN');
   return {primary:selected,cohort};
 }
 if(rowFamily.length){
   const exact=pool.filter(v=>str(v.id)===str(source.id));
   if(exact.length>1||exact.length===1&&!matchesHrRow(exact[0]))
     fail('SOURCE_VISIT_ID_COORDINATE_CONFLICT');
   const candidates=rowFamily.filter(v=>str(v.periodId)===scope.periodId);
   let chosen=exact[0]||null;
   if(!chosen){
     const hrKeys=candidates.filter(v=>/^hr_20\d{2}-(0[1-9]|1[0-2])_(gt|hn)_/i.test(str(v.id)));
     if(hrKeys.length===1)chosen=hrKeys[0];
     else if(candidates.length===1)chosen=candidates[0];
   }
   if(!chosen||str(chosen.periodId)!==scope.periodId)
     fail('CANONICAL_DURABLE_OWNER_NOT_PROVEN');
   if(rowFamily.some(v=>!matchesHrRow(v)))fail('HR_ROW_COHORT_DRIFT');
   return {primary:chosen,cohort:rowFamily};
 }
 // Only for a reordered source worksheet: all three business identities
 // must independently resolve to the SAME one durable identity.
 const hits=groups.map(keys=>pool.filter(row=>{
   const first=fields(source,keys);return first.every(Boolean)&&same(first,fields(row,keys));
 }));
 if(hits.every(x=>x.length===0))return null;
 // Original row moved or its old tab reference differs. Historical aliases
 // may legitimately produce several *documents* for one business visit.
 // Every independent key set must identify exactly the same cohort.
 const ids=rows=>rows.map(v=>str(v.id)).sort();
 const cohort=hits[0];
 if(!cohort.length||!hits.every(rows=>rows.length&&same(ids(rows),ids(cohort))))
   fail('DURABLE_VISIT_AMBIGUOUS');
 const candidates=cohort.filter(v=>str(v.periodId)===scope.periodId);
 const exact=candidates.filter(v=>str(v.id)===str(source.id));
 if(exact.length>1)fail('CANONICAL_DURABLE_OWNER_NOT_PROVEN');
 let selected=exact[0]||null;
 if(!selected){
   const canonical=candidates.filter(v=>/^hr_20\d{2}-(0[1-9]|1[0-2])_(gt|hn)_/i.test(str(v.id)));
   if(canonical.length===1)selected=canonical[0];
   else if(canonical.length===0&&candidates.length===1)selected=candidates[0];
 }
 if(!selected)fail('CANONICAL_DURABLE_OWNER_NOT_PROVEN');
 return {primary:selected,cohort};
}
function newVisitId(source,scope){
 // A visit belongs to its OWN configured month/worksheet/row. Neither cinema
 // nor scenario/film is a cross-period invariant; multiple visits at the same
 // cinema and cut are distinct when the source has distinct rows.
 const sourceTab=str(source.sourceTab),sourceRow=Number(source.sourceRow);
 if(!sourceTab||!Number.isSafeInteger(sourceRow)||sourceRow<1)fail('NEW_VISIT_IDENTITY_MISSING');
 return 'hr_excel_'+sha([scope.tenantId,scope.projectId,scope.periodId,scope.countryCode,sourceTab,sourceRow].join('|')).slice(0,28);
}
const headerFields=rows=>{
 const n=x=>norm(x).replace(/[^a-z0-9 ]/g,'').trim();
 for(const r of rows.slice(0,14)){
  const cells=r.map(n),shopper=cells.indexOf('shopper asignado');
  if(shopper>=0)return {shopper,phone:cells.findIndex(x=>['telefono','whatsapp'].includes(x)),
    email:cells.findIndex(x=>['mail','correo','email'].includes(x))};
 }
 return null;
};
export async function resolveExcelOriginalProjectPlan({db,scope}={}){
 if(!db?.doc||!validScope(scope))fail('INVALID_SCOPE');
 const project=await db.doc('tenants/'+scope.tenantId+'/projects/'+scope.projectId).get();
 const raw=project.exists?project.data():null;
 if(!raw||raw.tenantId!==scope.tenantId||(raw.projectId&&raw.projectId!==scope.projectId))fail('PROJECT_SCOPE');
 const source=raw.operationalSource||raw.routeSource||{};
 if(source.mode!=='external'||source.providerType!=='excel_online'||source.readPolicy!=='external_live'||
   source.writePolicy!=='external_read_only'||!Array.isArray(source.countryBindings))fail('SOURCE_POLICY');
 const countries=[...(raw.countries||[])].sort(),jobs=[],settings=[];
 if(!countries.length||new Set(countries).size!==countries.length||countries.length!==source.countryBindings.length)fail('COUNTRY_SCOPE');
 for(const countryCode of countries){
  const found=source.countryBindings.filter(c=>c.countryCode===countryCode);
  if(found.length!==1||!/^[A-Z]{2}$/.test(countryCode))fail('COUNTRY_BINDING');
  const s=await db.doc('tenants/'+scope.tenantId+'/integrationSettings/'+found[0].providerBindingId).get();
  const row=s.exists?s.data():{};
  if(row.tenantId!==scope.tenantId||row.projectId!==scope.projectId||row.countryCode!==countryCode||
     row.providerType!=='excel_online'||row.enabled!==true||row.hrWritesEnabled!==false||
     row.readPolicy!=='external_live'||row.writePolicy!=='external_read_only'||row.mappingRef!==found[0].mappingRef||
     !Array.isArray(row.periodSheets)||!row.periodSheets.length)fail('COUNTRY_SETTING');
  const periods=[...new Set(row.periodSheets.map(x=>str(x.periodId)))].sort();
  if(!periods.every(x=>validPeriod(scope.projectId,x)))fail('PERIOD_IDS');
  settings.push({countryCode,stamp:stamp(s),periods});
  for(const periodId of periods)jobs.push(await resolveCountryHrPeriodBinding({db,...scope,countryCode,periodId,purpose:'operational'}));
 }
 jobs.sort((a,b)=>a.scope.periodId.localeCompare(b.scope.periodId)||a.scope.countryCode.localeCompare(b.scope.countryCode));
 const unique=new Set(jobs.map(x=>x.scope.countryCode+'|'+x.scope.periodId));
 if(unique.size!==jobs.length)fail('DUPLICATE_SCOPE');
 const proof={schemaVersion:'cxorbia.i3.f2.excel-original-plan.v1',...scope,providerType:'excel_online',
   readPolicy:'external_live',projectStamp:stamp(project),settings,
   bindingFingerprints:jobs.map(x=>x.proof.bindingFingerprint),periodCount:new Set(jobs.map(x=>x.scope.periodId)).size,
   jobCount:jobs.length,hrWrites:false,production:false};
 proof.bindingFingerprint=sha(proof);
 return {scope,project:raw,proof,bindings:jobs};
}
async function limited(items,limit,fn){
 const out=new Array(items.length);let n=0;
 await Promise.all(Array.from({length:Math.min(items.length,Math.max(1,limit))},async()=>{
  while(n<items.length){const i=n++;out[i]=await fn(items[i]);}
 }));
 return out;
}
export async function readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding}={}){
 if(!db?.doc||!plan?.scope||plan.proof?.providerType!=='excel_online'
  ||typeof readBinding!=='function'||columnMap?.contractId!=='tya-hr-column-map-r20-v1'
  ||!cinemaRegistry?.cinemas)fail('READER_CONTRACT');
 const {tenantId,projectId}=plan.scope,root=db.collection('tenants').doc(tenantId);
 const docs=await root.collection('projects').doc(projectId).collection('visits').get();
 const durable=docs.docs.map(d=>({...d.data(),id:d.id})),used=new Set();
 const crossDocs=await root.collection('shopperIdentityCrosswalk').get();
 const aliases=new Map();
 for(const item of crossDocs.docs){
  const d=item.data()||{};
  if(str(d.sourceType).toLowerCase()!=='hr_external'||d.projectId&&d.projectId!==projectId)continue;
  const target=str(d.shopperId);if(!target)continue;
  for(const alias of [item.id,d.sourceStableKey,d.sourceShopperId].map(str).filter(Boolean)){
    if(aliases.has(alias)&&aliases.get(alias)!==target)fail('SHOPPER_CROSSWALK_AMBIGUOUS');
    aliases.set(alias,target);
  }
 }
 const responses=await limited(plan.bindings,4,async binding=>{
   const read=await readBinding(binding);
   if(read.proof?.bindingFingerprint!==binding.proof.bindingFingerprint||
     read.proof.externalRevisionIndependentlyVerified!==true||!Array.isArray(read.privateProviderRows))
       fail('PROVIDER_READ_INVALID');
   return {binding,read};
 });
 const identity=new Map(),visits=[],tabs=[],sourceRevisions=[],matched=new Set();
 let matchedSourceVisits=0;
 for(const {binding,read}of responses){
  const scope=binding.scope,key=scope.periodId.slice(-7),year=Number(key.slice(0,4)),month=Number(key.slice(5));
  sourceRevisions.push({country:scope.countryCode,periodId:scope.periodId,sha:read.proof.sourceRevision});
  // Count rows from THIS country/period only. Never inspect another month
  // to decide whether the current source describes a separate visit.
  const periodTabs=read.privateProviderRows.map(rawTab=>{
   const sheet=binding.privateProvider.worksheets.find(x=>x.worksheetId===rawTab.worksheetId);
   if(!sheet)fail('TAB_UNBOUND');
   const tab={country:scope.countryCode,key,year,month,tabTitle:sheet.worksheetName,label:key,fullLabel:key,
     scenarioKey:sheet.scenarioKey||null};
   const parsed=parseTab(tab,rawTab.values,columnMap,cinemaRegistry);
   if(parsed.issues.some(x=>x.severity==='critical'))fail('COLUMN_MAPPING');
   return {rawTab,tab,parsed};
  });
  const sameCutCounts=new Map();
  for(const {parsed} of periodTabs)for(const visit of parsed.visits){
   const marker=JSON.stringify(fields(visit,['cinemaId','quincena']));
   sameCutCounts.set(marker,(sameCutCounts.get(marker)||0)+1);
  }
  for(const {rawTab,tab,parsed} of periodTabs){
   if(!parsed.visits.length)continue;
   tabs.push(tab);
   const indexes=headerFields(rawTab.values);
   for(const source of parsed.visits){
    const owner=matchDurable(source,scope,durable,{sourceSiblings:sameCutCounts.get(JSON.stringify(fields(source,['cinemaId','quincena'])))||1});
    const prior=owner?.primary||null;
    const stable=prior?str(prior.id):newVisitId(source,scope);
    if(!stable||used.has(stable))fail('DUPLICATE_VISIT_ID');used.add(stable);
    if(owner){
      matchedSourceVisits++;
      for(const related of owner.cohort)matched.add(str(related.id));
    }
    const alias=str(source.shopperId),canonical=alias?(aliases.get(alias)||alias):null;
    const original=rawTab.values[(source.sourceRow||0)-1]||[];
    if(alias&&canonical&&indexes){
     const displayName=str(original[indexes.shopper]);
     if(displayName){
      const value={displayName,country:scope.countryCode,phone:indexes.phone>=0?str(original[indexes.phone]):'',
        email:indexes.email>=0?str(original[indexes.email]):''};
      if(!identity.has(canonical))identity.set(canonical,value);
      if(!identity.has(alias))identity.set(alias,value);
     }
    }
    visits.push({...source,id:stable,visitId:stable,hrRowId:str(source.hrRowId||prior?.hrRowId),periodId:scope.periodId,
      shopperId:canonical,canonicalShopperId:canonical,sourceTab:source.sourceTab,
      sourceRow:source.sourceRow,excelSourceRow:source.sourceRow,
      excelWorksheetFingerprint:sha(rawTab.worksheetId),
      durableAliasIds:owner?owner.cohort.map(v=>str(v.id)).filter(id=>id!==stable):[],
      sourceSafe:true,piiProtected:true});
   }
  }
 }
 if(!visits.length||!tabs.length)fail('NO_VISITS');
 // Original historical periodId=YYYY-MM docs are retained in Firestore,
 // never rewritten or treated as a second current-period assignment.
 // Only the canonical project-scoped operational docs must match every HR visit.
 const unprefixedHistory=durable.filter(v=>/^20\d{2}-(0[1-9]|1[0-2])$/.test(str(v.periodId)));
 // A new month, new country or changed list of cinemas must NEVER be rejected
 // because a different month's durable visits are not in this period's HR.
 // Cross-period records remain untouched, accessible by their durable owners.
 const requestedScopes=new Set(plan.bindings.map(b=>b.scope.countryCode+'|'+b.scope.periodId));
 const missing=durable.filter(v=>requestedScopes.has(getCountry(v)+'|'+getPeriod(v,projectId))&&
   !matched.has(str(v.id))&&!v._archived&&
   !/^20\d{2}-(0[1-9]|1[0-2])$/.test(str(v.periodId))&&
   !['cancelada','cancelled','archived','archivada'].includes(norm(v.estado||v.status)));
 if(missing.length)fail('UNMATCHED_ACTIVE_DURABLE_VISITS');
 const periods=buildPeriods(visits,tabs),history=validateCanonicalHistory(visits,periods);
 if(history.decision!=='PASS_CANONICAL_HISTORY')fail('HISTORY');
 const shoppers=buildShoppers(visits),summary=summarizeCanonicalPeriods(visits);
 const revision=sha(sourceRevisions.sort((a,b)=>a.periodId.localeCompare(b.periodId)||a.country.localeCompare(b.country)));
 const count=key=>visits.filter(v=>v.canonicalFacets?.[key]===true).length;
 const byCountry={},byStatus={};
 for(const v of visits){byCountry[v.country]=(byCountry[v.country]||0)+1;byStatus[v.estado]=(byStatus[v.estado]||0)+1}
 const counts={periods:periods.length,tabs:tabs.length,visits:visits.length,shoppers:shoppers.length,
  assigned:count('assigned'),unassigned:visits.length-count('assigned'),realized:count('realized'),
  scheduled:count('scheduled'),submitted:count('submitted'),questionnaireCompleted:count('questionnaire'),
  liquidationConfirmed:count('liquidationConfirmed'),paymentConfirmed:count('paymentConfirmed'),byCountry,byStatus};
 const snapshot={generatedAt:new Date().toISOString(),buildLabel:'cxorbia-original-excel-i3-f2',
  tenantId,projectId,tenantName:'TyA',projectName:str(plan.project.name||plan.project.projectName||projectId),
  source:{type:'excel_online_original',providerType:'excel_online',accessMode:'make_graph_delegated',
    sourceRevision:revision,sourceSafe:true,rawWorkbookExposed:false,privateContactDataExposed:false,
    columnMapContract:columnMap.contractId,canonicalStateAcrossAllDetectedPeriods:true},
  tenantConfig:{tenantId,tenantName:'TyA',configurable:true},projectConfig:{...plan.project,projectId,hrSourceType:'excel_online_original'},
  sourceRevision:revision,sourceSafe:true,imported:false,firestoreWrites:0,production:false,
  periods,visits,shoppers,counts,periodOperationalSummary:summary,
  tabsRead:tabs.map(x=>({country:x.country,periodKey:x.key,scenarioKey:x.scenarioKey})),issues:[],
  safeState:{writes:false,imports:false,deploy:false,production:false,payments:false}};
 return {snapshot,identity,proof:{bindingFingerprint:plan.proof.bindingFingerprint,sourceRevision:revision,
   periodReads:responses.length,visits:visits.length,matchedDurable:matched.size,unmatchedActive:missing.length,
   matchedSourceVisits,newSourceVisits:visits.length-matchedSourceVisits,
   historicalAliasesPreserved:matched.size-matchedSourceVisits,
   historicalUnprefixedDocsPreserved:unprefixedHistory.length,
   periodScopesVerified:requestedScopes.size,otherPeriodsNotReconciled:true,
   independentlyVerified:true,hrWrites:0,firestoreWrites:0,production:false}};
}
