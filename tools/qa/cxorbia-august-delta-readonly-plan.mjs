import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const credentialRaw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'';
const sourcePath=process.env.CXORBIA_CURRENT_SOURCE_SAFE||'.tmp/hr-current/tya-hr-source-safe.js';
const countryPath=process.env.CXORBIA_COUNTRY_EVIDENCE||'app/docs/evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.json';
const registryPath=process.env.CXORBIA_HR_TAB_REGISTRY||'backend/config/tya-live-hr-tab-registry.source-safe.json';
const identityPath=process.env.CXORBIA_IDENTITY_MAPPING||'app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json';
const authorityPath=process.env.CXORBIA_LIVE_HR_AUTHORITY_JSON||'app/docs/evidence/LIVE-HR-AUTHORITY-CONTRACT-LATEST.json';
const outPath=process.env.CXORBIA_AUGUST_DELTA_PLAN||'app/docs/evidence/AUGUST-DELTA-READONLY-PLAN-LATEST.json';
const tenantId='tya',projectId='cinepolis';
const MONTH_NAMES=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
function assert(v,m){if(!v)throw new Error(m);}
function currentPeriodKey(){const explicit=String(process.env.CXORBIA_TARGET_PERIOD_KEY||'').trim();if(/^20\d{2}-(0[1-9]|1[0-2])$/.test(explicit))return explicit;const now=new Date();return `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`;}
function requiredTabsFor(key){const m=String(key).match(/^(20\d{2})-(0[1-9]|1[0-2])$/);assert(m,'target_period_invalid');const yy=m[1].slice(-2),name=MONTH_NAMES[Number(m[2])-1];return {GT:`${name} ${yy}`,HN:`${name} ${yy} HN`};}
function loadSource(){const code=fs.readFileSync(sourcePath,'utf8');const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(code,sandbox);return sandbox.window.CX_TYA_HR_SOURCE_SAFE;}
function uniq(arr){return [...new Set(arr.filter(Boolean))].sort();}
function safeRows(rows){return rows.map(v=>({id:String(v.id||v.visitId||''),hrRowId:String(v.hrRowId||''),sourceTab:String(v.sourceTab||''),sourceRow:Number(v.sourceRow||0),country:String(v.country||v.pais||''),sourceShopperRef:v.shopperId?String(v.shopperId):null,status:String(v.estado||v.status||''),assigned:v.hasShopper===true||Boolean(v.shopperId),scheduled:Boolean(v.agendada||v.scheduledDate),realized:Boolean(v.realizada||v.completedDate),submitted:v.submit===true||v.submitted===true||Boolean(v.submittedAt)}));}
function countBy(rows,key){const out={};for(const r of rows){const value=String(r[key]||'blank');out[value]=(out[value]||0)+1;}return out;}

const periodKey=currentPeriodKey();
const requiredTabs=requiredTabsFor(periodKey);
assert(credentialRaw,'service_account_missing');const sa=JSON.parse(credentialRaw);assert(sa.project_id===expectedProject,`wrong_project:${sa.project_id||'missing'}`);
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});const db=admin.firestore();
const source=loadSource();assert(source?.sourceSafe===true,'current_source_not_source_safe');
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));assert(registry?.schemaVersion==='cxorbia.tya-live-hr-tab-registry.v1'&&registry?.sourceSafe===true,'tab_registry_invalid');
const authority=fs.existsSync(authorityPath)?JSON.parse(fs.readFileSync(authorityPath,'utf8')):null;
const registryTabs=new Set(registry.monthlyTabs||[]);
const tabPresence={GT:registryTabs.has(requiredTabs.GT),HN:registryTabs.has(requiredTabs.HN)};
const country=fs.existsSync(countryPath)?JSON.parse(fs.readFileSync(countryPath,'utf8')):null;
const identity=JSON.parse(fs.readFileSync(identityPath,'utf8'));assert(identity?.schemaVersion==='cxorbia.r17n-final-write-plan-no-execute.v2','identity_mapping_invalid');
const identityMap=new Map((identity.shopperReferenceMapping||[]).map(r=>[String(r.sourceShopperRef||''),{targetShopperId:String(r.targetShopperId||''),targetKind:String(r.targetKind||'')}]))
const countryResults=Object.fromEntries(((country&&country.results)||[]).map(r=>[r.title,r]));
const current=safeRows((source.visits||[]).filter(v=>String(v.periodKey||'')===periodKey));
const sourceByCountry={GT:current.filter(v=>v.country==='GT'),HN:current.filter(v=>v.country==='HN')};
const accepted=[];const holds=[];
for(const c of ['GT','HN']){
  if(!tabPresence[c]){holds.push({country:c,reason:'required_provider_tab_missing',tab:requiredTabs[c],sourceRows:0});continue;}
  const gate=countryResults[requiredTabs[c]]||null;
  if(!gate){holds.push({country:c,reason:'country_gate_missing_after_tab_present',tab:requiredTabs[c],sourceRows:sourceByCountry[c].length});continue;}
  if(Number(gate.mismatchCount||0)>0){holds.push({country:c,reason:'country_tab_mismatch',tab:requiredTabs[c],sourceRows:sourceByCountry[c].length,mismatchCount:Number(gate.mismatchCount||0),sourceCountryCounts:gate.countryCounts||{}});continue;}
  if(sourceByCountry[c].length===0){holds.push({country:c,reason:'current_period_country_has_zero_rows',tab:requiredTabs[c],sourceRows:0});continue;}
  accepted.push(...sourceByCountry[c]);
}
const visitIds=accepted.map(v=>v.id).filter(Boolean);
const duplicateVisitIds=visitIds.length-new Set(visitIds).size;
const visitsRef=db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('visits');
const currentVisits=await visitsRef.select('periodId','periodKey','shopperId','hrRowId','sourceTab','sourceRow').get();
const currentIds=new Set(currentVisits.docs.map(d=>d.id));
const acceptedExisting=accepted.filter(v=>currentIds.has(v.id));const acceptedNew=accepted.filter(v=>!currentIds.has(v.id));
const sourceShopperRefs=uniq(acceptedNew.filter(v=>v.assigned).map(v=>v.sourceShopperRef));
const mappedSourceRefs=sourceShopperRefs.filter(ref=>identityMap.has(ref)&&identityMap.get(ref).targetShopperId);
const unmappedSourceRefs=sourceShopperRefs.filter(ref=>!identityMap.has(ref)||!identityMap.get(ref).targetShopperId);
const targetShopperIds=uniq(mappedSourceRefs.map(ref=>identityMap.get(ref).targetShopperId));
const shopperRefs=targetShopperIds.map(id=>db.collection('tenants').doc(tenantId).collection('shoppers').doc(id));const shopperSnaps=[];for(let i=0;i<shopperRefs.length;i+=150)shopperSnaps.push(...await db.getAll(...shopperRefs.slice(i,i+150)));const existingTargetShopperIds=new Set(shopperSnaps.filter(s=>s.exists).map(s=>s.id));const missingTargetShopperIds=targetShopperIds.filter(id=>!existingTargetShopperIds.has(id));
const periodSnap=await db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('periods').doc(periodKey).get();
const operational={acceptedStatusCounts:countBy(accepted,'status'),assigned:accepted.filter(v=>v.assigned).length,unassigned:accepted.filter(v=>!v.assigned).length,scheduled:accepted.filter(v=>v.scheduled).length,realized:accepted.filter(v=>v.realized).length,submitted:accepted.filter(v=>v.submitted).length};
const blockers=[];
if(duplicateVisitIds)blockers.push(`current_period_duplicate_visit_ids:${duplicateVisitIds}`);
if(unmappedSourceRefs.length)blockers.push(`new_assigned_source_shopper_ref_unmapped:${unmappedSourceRefs.length}`);
if(missingTargetShopperIds.length)blockers.push(`new_assigned_target_shopper_profile_missing:${missingTargetShopperIds.length}`);
if(authority&&authority.decision!=='PASS_LIVE_HR_AUTHORITY_CURRENT_PERIOD_AND_HISTORY_REVISION')blockers.push('live_hr_authority_contract_not_pass');
const missingRequiredTabs=!tabPresence.GT||!tabPresence.HN;
let decision='HOLD_CURRENT_PERIOD_LIVE_SOURCE_PLAN';
let releaseReadiness='SOURCE_NOT_READY';
if(missingRequiredTabs){decision='HOLD_CURRENT_PERIOD_REQUIRED_PROVIDER_TABS_MISSING';releaseReadiness='SOURCE_TABS_MISSING';}
else if(!holds.length&&!blockers.length&&accepted.length>0){decision='PASS_CURRENT_PERIOD_LIVE_SOURCE_TECH_READY';releaseReadiness=acceptedNew.length===0?'CURRENT_PERIOD_ALREADY_MATERIALIZED_REQUIRES_REVISION_READBACK':operational.unassigned>0?'HAS_UNASSIGNED_VISITS_FOR_PUBLICATION':'NO_UNASSIGNED_VISITS_IN_LIVE_SOURCE';}
const report={schemaVersion:'cxorbia.current-period-live-source-readonly-plan.v5',generatedAt:new Date().toISOString(),decision,releaseReadiness,target:{firebaseProjectId:expectedProject,tenantId,projectId,periodKey},contract:{requiredTabs,fixedExpectedCounts:false,sourceAuthority:'live_hr_provider_metadata_and_rows',historicalSync:'revision_based_reconciliation_by_stable_visit_id',deltaOnly:false,hrWritesPlanned:0},providerTabRegistry:{observedAt:registry.observedAt,monthlyTabs:registryTabs.size,tabPresence,requiredCurrentPeriodTabsPresent:tabPresence.GT&&tabPresence.HN},source:{generatedAt:source.generatedAt||null,sourceRevision:authority?.revision?.sourceRevision||null,accessMode:source.source?.accessMode||null,sourceSafe:true,tabRegistryEnforced:source.source?.tabRegistryEnforced===true,tabRegistryAutoDiscovery:source.source?.tabRegistryAutoDiscovery===true,phantomTabsRejected:source.source?.phantomTabsRejected||[],observedCurrentPeriod:{GT:sourceByCountry.GT.length,HN:sourceByCountry.HN.length,total:current.length}},countryGate:{decision:country?.decision||null,GT:countryResults[requiredTabs.GT]||null,HN:countryResults[requiredTabs.HN]||null},identityResolution:{canonicalMappingEntries:identityMap.size,newAssignedSourceShopperRefs:sourceShopperRefs.length,mappedNewAssignedSourceShopperRefs:mappedSourceRefs.length,unmappedNewAssignedSourceShopperRefs:unmappedSourceRefs.length,targetShopperProfiles:targetShopperIds.length,existingTargetShopperProfiles:existingTargetShopperIds.size,missingTargetShopperProfiles:missingTargetShopperIds.length},providerCompare:{currentCanonicalVisits:currentVisits.size,periodAlreadyExists:periodSnap.exists,acceptedLiveRows:accepted.length,newVisitRows:acceptedNew.length,existingVisitRows:acceptedExisting.length,existingRowsRequireRevisionReconcileReadback:acceptedExisting.length},operational,holds,blockers,currentPeriodPlan:{acceptedCountries:uniq(accepted.map(v=>v.country)),allVisitIds:accepted.map(v=>v.id).sort(),newVisitIds:acceptedNew.map(v=>v.id).sort(),existingVisitIds:acceptedExisting.map(v=>v.id).sort(),newHrRowIds:acceptedNew.map(v=>v.hrRowId).sort(),newShopperMappings:mappedSourceRefs.map(ref=>({sourceShopperRef:ref,targetShopperId:identityMap.get(ref).targetShopperId,targetKind:identityMap.get(ref).targetKind})),excludedCountries:holds.map(h=>h.country)},safety:{readOnly:true,providerReads:true,hrWrites:0,firestoreWrites:0,authWrites:0,rulesDeploys:0,hostingDeploys:0,cloudRunDeploys:0,production:false,merge:false,pii:false,secrets:false}};
fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({decision,releaseReadiness,providerTabRegistry:report.providerTabRegistry,source:report.source.observedCurrentPeriod,providerCompare:report.providerCompare,operational,holds,blockers,safety:report.safety}));
