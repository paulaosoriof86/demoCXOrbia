#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {initializeApp,cert,deleteApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {loadStaffPrivateExecutionHandoff} from '../../backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs';

const PROJECT_ID='cxorbia-backend-dev',TENANT='tya',PROJECT='cinepolis';
const REQUEST=process.env.CXORBIA_REQUEST_PATH||'backend/config/p0-human-shopper-auth-hr-readonly-request.json';
const SAFE=process.env.CXORBIA_SAFE_OUT||'app/docs/evidence/P0-HUMAN-SHOPPER-AUTH-HR-READONLY-LATEST.json';
const PRIVATE=process.env.CXORBIA_PRIVATE_OUT||'.tmp/p0-human-shopper/private.json';
const CRED=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const HR_URL=process.env.CXORBIA_LIVE_HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&fresh=1';
const s=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:typeof v==='string'?v.split(','):[];
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=(ns,v)=>hash(`${ns}\0${s(v)}`).slice(0,20);
const doc=d=>({id:d.id,...(d.data()||{})});
const visitKey=v=>s(v?.hrRowId)||((s(v?.sourceTab)&&s(v?.sourceRow))?`${s(v.sourceTab)}::${s(v.sourceRow)}`:'')||s(v?.visitId||v?.id);
function aliases(o){const out=[];const add=v=>{if(v==null)return;if(Array.isArray(v)){v.forEach(add);return;}if(typeof v==='object'){Object.values(v).forEach(add);return;}const x=s(v);if(x)out.push(x)};for(const v of [o?.id,o?.shopperId,o?.legacyShopperId,o?.legacyId,o?.sourceId,o?.sourceKey,o?.canonicalLegacyIds,o?.legacyLiveShopperIds,o?.sourceShopperIds,o?.hrShopperIds,o?.identityAliases,o?.aliases,o?.crosswalk?.aliases,o?.identity?.aliases,o?.profile?.aliases])add(v);return [...new Set(out)]}
function ensure(v,c){if(!v)throw new Error(c)}
function allowedTenant(c){return c?.role==='super'||c?.tenantId===TENANT||arr(c?.tenants).map(s).includes(TENANT)}
function allowedProject(c){return arr(c?.projectIds).map(s).includes(PROJECT)}
function passwordUser(u){return (u.providerData||[]).some(p=>p.providerId==='password')}
function inWindow(iso,start,end){const t=Date.parse(iso||'');return Number.isFinite(t)&&t>=Date.parse(start)&&t<=Date.parse(end)}
async function users(auth){const out=[];let t;do{const p=await auth.listUsers(1000,t);out.push(...p.users);t=p.pageToken}while(t);return out}
async function liveHr(){const r=await fetch(HR_URL,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'},signal:AbortSignal.timeout(180000)});const b=await r.json().catch(()=>null);if(!r.ok||!b||b.ok===false)throw new Error(`HR_HTTP_${r.status}`);const snap=b.snapshot||b.data||b;const runtime={...(b._runtime||{}),...(snap?._runtime||{})};if(snap&&snap._runtime)delete snap._runtime;return{snap,runtime}}
function membership(data,c){if(!data)return{exists:false};const x={exists:true,roleMatches:!data.role||s(data.role)===s(c.role),tenantMatches:!data.tenantId||s(data.tenantId)===TENANT,projectMatches:!data.projectIds||arr(data.projectIds).map(s).includes(PROJECT),shopperIdMatches:!data.shopperId||s(data.shopperId)===s(c.shopperId),countryPresent:Boolean(s(data.country||data.pais))};x.consistent=x.roleMatches&&x.tenantMatches&&x.projectMatches&&x.shopperIdMatches;return x}
function writeJson(p,x,mode){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n',{encoding:'utf8',...(mode?{mode}:{})})}

const req=JSON.parse(fs.readFileSync(REQUEST,'utf8'));
ensure(req.schemaVersion==='cxorbia.p0.human-shopper-auth-hr-readonly-request.v1','REQUEST_SCHEMA');
ensure(req.enabled===true&&req.consumed===false&&req.status==='authorized_execute_once','REQUEST_STATE');
ensure(req.repository==='paulaosoriof86/demoCXOrbia'&&req.branch==='docs-tya-v6-v71-audit'&&Number(req.pullRequest)===7,'REQUEST_LANE');
ensure(req.firebaseProjectId===PROJECT_ID&&req.tenantId===TENANT&&req.projectId===PROJECT,'REQUEST_TARGET');
ensure(req.authorizedBy==='Paula'&&req.authorizationSource==='current_conversation_2026-08-13','REQUEST_AUTH');
ensure(req.providerReads===true&&req.providerWrites===false&&Number(req.allowedExecutions)===1,'REQUEST_READONLY');
for(const k of ['authWrites','passwordChanges','passwordResets','firestoreWrites','hrWrites','rulesWrites','storageWrites','hostingDeploys','cloudRunDeploys','makeWrites','geminiCalls','paymentsWrites'])ensure(Number(req[k]||0)===0,`UNSAFE_${k}`);
ensure(req.merge===false&&req.production===false,'UNSAFE_RELEASE');
ensure(CRED&&fs.existsSync(CRED),'CREDENTIAL_MISSING');
const sa=JSON.parse(fs.readFileSync(CRED,'utf8'));ensure(sa.type==='service_account'&&sa.project_id===PROJECT_ID&&sa.private_key,'CREDENTIAL_TARGET');
const app=initializeApp({credential:cert(sa),projectId:PROJECT_ID});
const db=getFirestore(app),auth=getAuth(app);

async function main(){
  let handoff;
  try{
    const all=await users(auth),start=req.observedLoginWindowUtc.start,end=req.observedLoginWindowUtc.end;
    const recent=all.filter(u=>{const c=u.customClaims||{};return !u.disabled&&passwordUser(u)&&c.role==='shopper'&&allowedTenant(c)&&allowedProject(c)&&inWindow(u.metadata?.lastSignInTime,start,end)}).sort((a,b)=>Date.parse(b.metadata.lastSignInTime)-Date.parse(a.metadata.lastSignInTime));
    handoff=loadStaffPrivateExecutionHandoff({credentialPath:CRED});
    const adminVisibleLogin=handoff.getVisibleLogin('B');ensure(adminVisibleLogin,'ADMIN_B_LOGIN_MISSING');
    const base={schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.source-safe.v2',generatedAt:new Date().toISOString(),requestId:req.requestId,target:{firebaseProjectId:PROJECT_ID,tenantId:TENANT,projectId:PROJECT},observedLoginWindowUtc:{start,end},recentHumanShopperCandidates:recent.length,admin:{canonicalAlias:'B',role:'admin',visibleLoginRecovered:true,visibleLoginFingerprint:fp('staff-login-b',adminVisibleLogin),passwordRecovered:false,passwordChanged:false},ownerObservedRuntime:req.ownerObservedRuntime||{},safety:{providerReads:1,providerWrites:0,authWrites:0,passwordChanges:0,passwordResets:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,merge:false,production:false}};
    if(recent.length!==1){const decision=recent.length===0?'HOLD_P0_NO_UNIQUE_RECENT_SHOPPER_LOGIN':'HOLD_P0_AMBIGUOUS_RECENT_SHOPPER_LOGIN';writeJson(SAFE,{...base,decision,diagnosis:{code:decision,noIdentityGuessed:true}});writeJson(PRIVATE,{schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.private.v2',generatedAt:base.generatedAt,requestId:req.requestId,adminVisibleLogin,recentCandidates:recent.map(u=>({uidFingerprint:fp('auth-uid',u.uid),lastSignInTime:u.metadata?.lastSignInTime||null})),passwordIncluded:false},0o600);console.log(JSON.stringify({decision,recent:recent.length,adminVisibleLoginRecovered:true}));return 2}
    const u=recent[0],c=u.customClaims||{},shopperId=s(c.shopperId);
    const tenantRef=db.collection('tenants').doc(TENANT),projectRef=tenantRef.collection('projects').doc(PROJECT);
    const [profileDoc,userDoc,allShopperSnap,visitSnap,postSnap,appSnap,certSnap,liqSnap,hrState]=await Promise.all([
      shopperId?tenantRef.collection('shoppers').doc(shopperId).get():Promise.resolve(null),tenantRef.collection('users').doc(u.uid).get(),tenantRef.collection('shoppers').get(),projectRef.collection('visits').get(),projectRef.collection('postulations').get(),projectRef.collection('applications').get(),db.collectionGroup('certifications').get(),db.collectionGroup('liquidations').get(),liveHr()
    ]);
    const profile=profileDoc?.exists?doc(profileDoc):null,protectedShoppers=allShopperSnap.docs.map(doc),protectedVisits=visitSnap.docs.map(doc),protectedPosts=[...postSnap.docs.map(doc),...appSnap.docs.map(doc)],certs=certSnap.docs.map(doc),liqs=liqSnap.docs.map(doc);
    const hr=hrState.snap||{},hrShoppers=Array.isArray(hr.shoppers)?hr.shoppers:[],hrVisits=Array.isArray(hr.visits)?hr.visits:[],hrProjects=Array.isArray(hr.periods)?hr.periods:Array.isArray(hr.projects)?hr.projects:[];
    const keys=new Set(aliases(profile||{}));if(shopperId)keys.add(shopperId);const hrShopperMatches=hrShoppers.filter(x=>aliases(x).some(a=>keys.has(a)));for(const x of hrShopperMatches)for(const a of aliases(x))keys.add(a);const hrVisitMatches=hrVisits.filter(v=>keys.has(s(v.shopperId))||keys.has(s(v.shopperCode)));
    await import(pathToFileURL(path.resolve('app/adapters/tya-cumulative-read-model-v2.js')).href+`?p0=${Date.now()}`);await import(pathToFileURL(path.resolve('app/adapters/tya-canonical-state-semantics-v2.js')).href+`?p0=${Date.now()}`);
    const comp=globalThis.CX_TYA_CUMULATIVE_READ_MODEL;ensure(comp&&typeof comp.compose==='function','COMPOSER_MISSING');
    const result=comp.compose({hr:{projects:hrProjects,visits:hrVisits,shoppers:hrShoppers,posts:Array.isArray(hr.posts)?hr.posts:[],currentProjectId:PROJECT,currentPeriodId:s(hr.currentPeriodId),sourceRevision:s(hr.sourceRevision||hrState.runtime?.revision)},protectedPayload:{visits:protectedVisits,shoppers:protectedShoppers,posts:protectedPosts,certifications:certs,liquidations:liqs}}),d=result.diagnostics||{};
    const mapped=shopperId?((result.identityMap||{})[shopperId]||shopperId):'',canonical=result.shoppers.find(x=>s(x.id||x.shopperId)===mapped)||null,own=canonical?result.visits.filter(v=>s(v.shopperId)===s(canonical.id||canonical.shopperId)).length:0;
    const claimsReady=c.role==='shopper'&&allowedTenant(c)&&allowedProject(c)&&Boolean(shopperId),profileReady=Boolean(profile),crosswalk=hrShopperMatches.length===1,invariants=d.outputVisits===hrVisits.length&&d.duplicateVisitKeys===0&&d.duplicateShopperIds===0&&d.protectedVisitsAppended===0,canonicalReady=Boolean(canonical);
    let code='P0_RUNTIME_RECONCILE_NOT_EFFECTIVE_DESPITE_VALID_CANONICAL_INPUTS';if(!claimsReady)code='P0_SHOPPER_AUTH_SCOPE_INVALID';else if(!profileReady)code='P0_SHOPPER_CLAIM_PROFILE_DOC_MISSING';else if(hrShopperMatches.length===0)code='P0_SHOPPER_PROFILE_NO_EXACT_HR_CROSSWALK';else if(hrShopperMatches.length>1)code='P0_SHOPPER_PROFILE_AMBIGUOUS_EXACT_HR_CROSSWALK';else if(!invariants)code='P0_CANONICAL_COMPOSER_INVARIANT_FAILURE';else if(!canonicalReady)code='P0_CANONICAL_COMPOSER_EXCLUDES_AUTHENTICATED_SHOPPER';else if(own===0&&hrVisitMatches.length>0)code='P0_CANONICAL_SHOPPER_VISIT_LINK_LOSS';
    const safe={...base,decision:'HOLD_'+code,selectedShopper:{uidFingerprint:fp('auth-uid',u.uid),shopperIdFingerprint:fp('shopper-id',shopperId),lastSignInTime:u.metadata?.lastSignInTime||null,claims:{role:s(c.role),authNamespace:s(c.authNamespace)||null,tenantAllowed:allowedTenant(c),projectAllowed:allowedProject(c),shopperIdPresent:Boolean(shopperId),countryPresent:Boolean(s(c.country)),projectCount:arr(c.projectIds).length},membership:membership(userDoc?.exists?userDoc.data():null,c)},providerReadModel:{firestoreProfileExists:profileReady,tenantProtectedProfiles:protectedShoppers.length,protectedVisits:protectedVisits.length,protectedPostulationsAndApplications:protectedPosts.length,certifications:certs.length,liquidations:liqs.length},liveHr:{sourceSafe:hr.sourceSafe===true,runtimeRead:hrState.runtime?.runtimeRead===true,cacheOrigin:hrState.runtime?.cacheOrigin||null,periods:hrProjects.length,visits:hrVisits.length,shoppers:hrShoppers.length,uniqueVisitKeys:new Set(hrVisits.map(visitKey).filter(Boolean)).size,exactShopperMatches:hrShopperMatches.length,exactVisitMatchesForSelectedShopper:hrVisitMatches.length},canonicalComposition:{bridgeInvariantPass:invariants,outputVisits:d.outputVisits,outputShoppers:d.outputShoppers,duplicateVisitKeys:d.duplicateVisitKeys,duplicateShopperIds:d.duplicateShopperIds,protectedVisitsAppended:d.protectedVisitsAppended,crosswalkLiveToCanonical:d.crosswalkLiveToCanonical,identityConflictCount:Array.isArray(d.identityConflicts)?d.identityConflicts.length:0,platformOnlyProfiles:d.platformOnlyProfiles,authenticatedShopperPresentInComposedModel:canonicalReady,authenticatedShopperOwnVisits:own},diagnosis:{code,claimsReady,profileReady,exactCrosswalkReady:crosswalk,bridgeInvariantPass:invariants,canonicalProfileReady:canonicalReady,residualRuntimeFailure:code==='P0_RUNTIME_RECONCILE_NOT_EFFECTIVE_DESPITE_VALID_CANONICAL_INPUTS'}};
    writeJson(SAFE,safe);writeJson(PRIVATE,{schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.private.v2',generatedAt:safe.generatedAt,requestId:req.requestId,adminVisibleLogin,selectedShopper:{shopperId,lastSignInTime:u.metadata?.lastSignInTime||null},diagnosisCode:code,passwordIncluded:false,tokensIncluded:false,providerEmailIncluded:false},0o600);console.log(JSON.stringify({decision:safe.decision,diagnosis:code,recent:1,adminVisibleLoginRecovered:true,profileReady,exactHrCrosswalk:hrShopperMatches.length,invariants,canonicalReady,ownVisits:own}));return 0
  }finally{try{handoff?.dispose?.()}catch{}}
}
try{process.exitCode=await main()}finally{await deleteApp(app)}
