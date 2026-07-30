import fs from 'node:fs';
import vm from 'node:vm';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const credentialRaw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'';
const sourcePath=process.env.CXORBIA_CURRENT_SOURCE_SAFE||'.tmp/hr-current/tya-hr-source-safe.js';
const countryPath=process.env.CXORBIA_COUNTRY_EVIDENCE||'app/docs/evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.json';
const identityPath=process.env.CXORBIA_IDENTITY_MAPPING||'app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json';
const outPath=process.env.CXORBIA_AUGUST_DELTA_PLAN||'app/docs/evidence/AUGUST-DELTA-READONLY-PLAN-LATEST.json';
const tenantId='tya',projectId='cinepolis',periodKey='2026-08';
const expectedByCountry={GT:34,HN:10};
function assert(v,m){if(!v)throw new Error(m);}
function loadSource(){const code=fs.readFileSync(sourcePath,'utf8');const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(code,sandbox);return sandbox.window.CX_TYA_HR_SOURCE_SAFE;}
function uniq(arr){return [...new Set(arr.filter(Boolean))].sort();}
function safeRows(rows){return rows.map(v=>({id:String(v.id||v.visitId||''),hrRowId:String(v.hrRowId||''),sourceTab:String(v.sourceTab||''),sourceRow:Number(v.sourceRow||0),country:String(v.country||v.pais||''),sourceShopperRef:v.shopperId?String(v.shopperId):null,status:String(v.estado||v.status||''),assigned:v.hasShopper===true||Boolean(v.shopperId),scheduled:Boolean(v.agendada||v.scheduledDate),realized:Boolean(v.realizada||v.completedDate),submitted:v.submit===true||v.submitted===true||Boolean(v.submittedAt)}));}
function countBy(rows,key){const out={};for(const r of rows){const value=String(r[key]||'blank');out[value]=(out[value]||0)+1;}return out;}

assert(credentialRaw,'service_account_missing');const sa=JSON.parse(credentialRaw);assert(sa.project_id===expectedProject,`wrong_project:${sa.project_id||'missing'}`);
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});const db=admin.firestore();
const source=loadSource();assert(source?.sourceSafe===true,'current_source_not_source_safe');
const country=JSON.parse(fs.readFileSync(countryPath,'utf8'));assert(country?.sourceSafe===true&&country?.providerWrites===0,'country_evidence_invalid');
const identity=JSON.parse(fs.readFileSync(identityPath,'utf8'));assert(identity?.schemaVersion==='cxorbia.r17n-final-write-plan-no-execute.v2','identity_mapping_invalid');
const identityMap=new Map((identity.shopperReferenceMapping||[]).map(r=>[String(r.sourceShopperRef||''),{targetShopperId:String(r.targetShopperId||''),targetKind:String(r.targetKind||'')}]))
const countryResults=Object.fromEntries((country.results||[]).map(r=>[r.title,r]));
const august=safeRows((source.visits||[]).filter(v=>String(v.periodKey||'')===periodKey));
const sourceByCountry={GT:august.filter(v=>v.country==='GT'),HN:august.filter(v=>v.country==='HN')};
const accepted=[];const holds=[];
for(const c of ['GT','HN']){
  const title=c==='GT'?'AGOSTO 26':'AGOSTO 26 HN';const gate=countryResults[title]||null;
  if(!gate){holds.push({country:c,reason:'country_gate_missing',sourceRows:sourceByCountry[c].length});continue;}
  if(Number(gate.mismatchCount||0)>0){holds.push({country:c,reason:'country_tab_mismatch',sourceRows:sourceByCountry[c].length,mismatchCount:Number(gate.mismatchCount||0),sourceCountryCounts:gate.countryCounts||{}});continue;}
  accepted.push(...sourceByCountry[c]);
}
const visitsRef=db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('visits');
const currentVisits=await visitsRef.select('periodId','shopperId').get();const currentIds=new Set(currentVisits.docs.map(d=>d.id));
const acceptedExisting=accepted.filter(v=>currentIds.has(v.id));const acceptedNew=accepted.filter(v=>!currentIds.has(v.id));
const sourceShopperRefs=uniq(acceptedNew.map(v=>v.sourceShopperRef));
const mappedSourceRefs=sourceShopperRefs.filter(ref=>identityMap.has(ref)&&identityMap.get(ref).targetShopperId);
const unmappedSourceRefs=sourceShopperRefs.filter(ref=>!identityMap.has(ref)||!identityMap.get(ref).targetShopperId);
const targetShopperIds=uniq(mappedSourceRefs.map(ref=>identityMap.get(ref).targetShopperId));
const shopperRefs=targetShopperIds.map(id=>db.collection('tenants').doc(tenantId).collection('shoppers').doc(id));const shopperSnaps=[];for(let i=0;i<shopperRefs.length;i+=150)shopperSnaps.push(...await db.getAll(...shopperRefs.slice(i,i+150)));const existingTargetShopperIds=new Set(shopperSnaps.filter(s=>s.exists).map(s=>s.id));const missingTargetShopperIds=targetShopperIds.filter(id=>!existingTargetShopperIds.has(id));
const periodSnap=await db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('periods').doc(periodKey).get();
const gtGate=countryResults['AGOSTO 26'];const hnGate=countryResults['AGOSTO 26 HN'];
const operational={acceptedStatusCounts:countBy(acceptedNew,'status'),assigned:acceptedNew.filter(v=>v.assigned).length,unassigned:acceptedNew.filter(v=>!v.assigned).length,scheduled:acceptedNew.filter(v=>v.scheduled).length,realized:acceptedNew.filter(v=>v.realized).length,submitted:acceptedNew.filter(v=>v.submitted).length};
const blockers=[];
if(!gtGate||gtGate.mismatchCount!==0)blockers.push('august_gt_country_gate_not_pass');
if(sourceByCountry.GT.length!==expectedByCountry.GT)blockers.push(`august_gt_count_drift:${sourceByCountry.GT.length}`);
if(acceptedExisting.length)blockers.push(`accepted_visit_already_exists:${acceptedExisting.length}`);
if(unmappedSourceRefs.length)blockers.push(`accepted_source_shopper_ref_unmapped:${unmappedSourceRefs.length}`);
if(missingTargetShopperIds.length)blockers.push(`accepted_target_shopper_profile_missing:${missingTargetShopperIds.length}`);
const hnHold=!!hnGate&&Number(hnGate.mismatchCount||0)>0;
let decision='HOLD_AUGUST_DELTA_PLAN';
if(!blockers.length&&acceptedNew.length===expectedByCountry.GT&&hnHold)decision='PASS_AUGUST_GT34_DELTA_TECH_READY__HN_HOLD_SOURCE_COUNTRY_MISMATCH';
else if(!blockers.length&&!hnHold&&acceptedNew.length===expectedByCountry.GT+expectedByCountry.HN)decision='PASS_AUGUST_FULL_DELTA_TECH_READY';
const releaseReadiness=operational.unassigned>0?'HAS_UNASSIGNED_VISITS_FOR_PUBLICATION':'NO_UNASSIGNED_VISITS_IN_ACCEPTED_SOURCE';
const report={schemaVersion:'cxorbia.august-delta-readonly-plan.v3',generatedAt:new Date().toISOString(),decision,releaseReadiness,target:{firebaseProjectId:expectedProject,tenantId,projectId,periodKey},contract:{expectedByCountry,doNotRepeatHistoricalWrites:1406,deltaOnly:true},source:{generatedAt:source.generatedAt||null,accessMode:source.source?.accessMode||null,sourceSafe:true,observedAugust:{GT:sourceByCountry.GT.length,HN:sourceByCountry.HN.length,total:august.length}},countryGate:{decision:country.decision,GT:gtGate?{mismatchCount:gtGate.mismatchCount,countryCounts:gtGate.countryCounts}:null,HN:hnGate?{mismatchCount:hnGate.mismatchCount,countryCounts:hnGate.countryCounts}:null},identityResolution:{canonicalMappingEntries:identityMap.size,requiredSourceShopperRefs:sourceShopperRefs.length,mappedSourceShopperRefs:mappedSourceRefs.length,unmappedSourceShopperRefs:unmappedSourceRefs.length,targetShopperProfiles:targetShopperIds.length,existingTargetShopperProfiles:existingTargetShopperIds.size,missingTargetShopperProfiles:missingTargetShopperIds.length},providerCompare:{currentCanonicalVisits:currentVisits.size,periodAlreadyExists:periodSnap.exists,acceptedCandidates:accepted.length,newVisitWritesPlanned:acceptedNew.length,alreadyExistingAccepted:acceptedExisting.length},operational,holds,blockers,exactDelta:{acceptedCountries:uniq(acceptedNew.map(v=>v.country)),visitIds:acceptedNew.map(v=>v.id).sort(),hrRowIds:acceptedNew.map(v=>v.hrRowId).sort(),shopperMappings:mappedSourceRefs.map(ref=>({sourceShopperRef:ref,targetShopperId:identityMap.get(ref).targetShopperId,targetKind:identityMap.get(ref).targetKind})),excludedCountries:holds.map(h=>h.country)},safety:{readOnly:true,providerReads:true,hrWrites:0,firestoreWrites:0,authWrites:0,rulesDeploys:0,hostingDeploys:0,production:false,merge:false,pii:false,secrets:false}};
fs.mkdirSync('app/docs/evidence',{recursive:true});fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n','utf8');console.log(JSON.stringify({decision,releaseReadiness,source:report.source.observedAugust,identityResolution:report.identityResolution,providerCompare:report.providerCompare,operational,holds,blockers,safety:report.safety}));
