#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { loadStaffPrivateExecutionHandoff } from '../../backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs';

const EXPECTED_PROJECT='cxorbia-backend-dev';
const TENANT='tya';
const PROJECT='cinepolis';
const REQUEST_PATH=process.env.CXORBIA_REQUEST_PATH||'backend/config/p0-human-shopper-auth-hr-readonly-request.json';
const PRIVATE_OUT=process.env.CXORBIA_PRIVATE_OUT||'.tmp/p0-human-shopper/private.json';
const SAFE_OUT=process.env.CXORBIA_SAFE_OUT||'app/docs/evidence/P0-HUMAN-SHOPPER-AUTH-HR-READONLY-LATEST.json';
const CREDENTIAL_PATH=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const LIVE_URL=process.env.CXORBIA_LIVE_HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&fresh=1';

const text=v=>String(v??'').trim();
const list=v=>Array.isArray(v)?v.map(text).filter(Boolean):typeof v==='string'?v.split(',').map(text).filter(Boolean):[];
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=(ns,v)=>hash(`${ns}\0${text(v)}`).slice(0,20);
const bool=v=>v===true;
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const docData=d=>({id:d.id,...(d.data()||{})});
const exactAliases=o=>{
  const out=[];
  const add=v=>{if(v==null)return;if(Array.isArray(v)){v.forEach(add);return;}if(typeof v==='object'){Object.values(v).forEach(add);return;}const s=text(v);if(s)out.push(s);};
  add(o?.id);add(o?.shopperId);add(o?.legacyShopperId);add(o?.legacyId);add(o?.sourceId);add(o?.sourceKey);
  add(o?.canonicalLegacyIds);add(o?.legacyLiveShopperIds);add(o?.sourceShopperIds);add(o?.hrShopperIds);add(o?.identityAliases);add(o?.aliases);add(o?.crosswalk?.aliases);add(o?.identity?.aliases);add(o?.profile?.aliases);
  return [...new Set(out)];
};
const visitKey=v=>text(v?.hrRowId)||((text(v?.sourceTab)&&text(v?.sourceRow))?`${text(v.sourceTab)}::${text(v.sourceRow)}`:'')||text(v?.visitId||v?.id);

async function listAllUsers(auth){
  const out=[];let token;
  do{const page=await auth.listUsers(1000,token);out.push(...page.users);token=page.pageToken;}while(token);
  return out;
}
async function liveHr(){
  const r=await fetch(LIVE_URL,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'},signal:AbortSignal.timeout(180000)});
  const body=await r.json().catch(()=>null);
  if(!r.ok||!body||body.ok===false)throw new Error(`LIVE_HR_HTTP_${r.status}`);
  const snap=body.snapshot||body.data||body;
  const runtime={...(body._runtime||{}),...(snap?._runtime||{})};
  if(snap&&snap._runtime)delete snap._runtime;
  return {snapshot:snap,runtime};
}
function tenantAllowed(claims){return claims?.role==='super'||claims?.tenantId===TENANT||list(claims?.tenants).includes(TENANT);}
function projectAllowed(claims){return list(claims?.projectIds).includes(PROJECT);}
function between(iso,start,end){const t=Date.parse(iso||'');return Number.isFinite(t)&&t>=Date.parse(start)&&t<=Date.parse(end);}
function providerPassword(u){return (u.providerData||[]).some(x=>x.providerId==='password');}
function membershipSummary(data,claims){
  if(!data)return {exists:false};
  const m={exists:true,roleMatches:!data.role||text(data.role)===text(claims.role),tenantMatches:!data.tenantId||text(data.tenantId)===TENANT,projectMatches:!data.projectIds||list(data.projectIds).includes(PROJECT),shopperIdMatches:!data.shopperId||text(data.shopperId)===text(claims.shopperId),countryPresent:Boolean(text(data.country||data.pais)),rawIdentityExported:false};
  m.consistent=Object.entries(m).filter(([k])=>k.endsWith('Matches')).every(([,v])=>v===true);
  return m;
}

const request=JSON.parse(fs.readFileSync(REQUEST_PATH,'utf8'));
ensure(request.schemaVersion==='cxorbia.p0.human-shopper-auth-hr-readonly-request.v1','REQUEST_SCHEMA');
ensure(request.enabled===true&&request.consumed===false&&request.status==='authorized_execute_once','REQUEST_STATE');
ensure(request.repository==='paulaosoriof86/demoCXOrbia'&&request.branch==='docs-tya-v6-v71-audit'&&Number(request.pullRequest)===7,'REQUEST_LANE');
ensure(request.firebaseProjectId===EXPECTED_PROJECT&&request.tenantId===TENANT&&request.projectId===PROJECT,'REQUEST_TARGET');
ensure(request.authorizedBy==='Paula'&&request.authorizationSource==='current_conversation_2026-08-13','REQUEST_AUTHORIZATION');
ensure(Number(request.allowedExecutions)===1&&request.providerReads===true&&request.providerWrites===false,'REQUEST_READONLY');
ensure(Boolean(request.observedLoginWindowUtc?.start)&&Boolean(request.observedLoginWindowUtc?.end),'REQUEST_LOGIN_WINDOW');
for(const k of ['authWrites','passwordChanges','passwordResets','firestoreWrites','hrWrites','rulesWrites','storageWrites','hostingDeploys','cloudRunDeploys','makeWrites','geminiCalls','paymentsWrites'])ensure(Number(request[k]||0)===0,`UNSAFE_${k}`);
ensure(request.merge===false&&request.production===false,'UNSAFE_RELEASE');
ensure(CREDENTIAL_PATH&&fs.existsSync(CREDENTIAL_PATH),'CREDENTIAL_PATH');
const sa=JSON.parse(fs.readFileSync(CREDENTIAL_PATH,'utf8'));
ensure(sa.type==='service_account'&&sa.project_id===EXPECTED_PROJECT&&typeof sa.private_key==='string','SERVICE_ACCOUNT');

const app=initializeApp({credential:cert(sa),projectId:EXPECTED_PROJECT});
const db=getFirestore(app),auth=getAuth(app);
let handoff;
try{
  const users=await listAllUsers(auth);
  const start=request.observedLoginWindowUtc.start,end=request.observedLoginWindowUtc.end;
  const recent=users.filter(u=>{
    const c=u.customClaims||{};
    return !u.disabled&&providerPassword(u)&&c.role==='shopper'&&tenantAllowed(c)&&projectAllowed(c)&&between(u.metadata?.lastSignInTime,start,end);
  }).sort((a,b)=>Date.parse(b.metadata.lastSignInTime)-Date.parse(a.metadata.lastSignInTime));

  handoff=loadStaffPrivateExecutionHandoff({credentialPath:CREDENTIAL_PATH});
  const adminVisibleLogin=handoff.getVisibleLogin('B');
  ensure(adminVisibleLogin,'ADMIN_LOGIN_B_MISSING');

  const safeBase={
    schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.source-safe.v1',
    generatedAt:new Date().toISOString(),requestId:request.requestId,
    target:{firebaseProjectId:EXPECTED_PROJECT,tenantId:TENANT,projectId:PROJECT},
    observedLoginWindowUtc:{start,end},
    recentHumanShopperCandidates:recent.length,
    admin:{canonicalAlias:'B',role:'admin',visibleLoginRecovered:true,visibleLoginFingerprint:fp('staff-visible-login-b',adminVisibleLogin),passwordRecovered:false,passwordChanged:false},
    ownerObservedRuntime:clone(request.ownerObservedRuntime||{}),
    safety:{providerReads:1,providerWrites:0,authWrites:0,passwordChanges:0,passwordResets:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,merge:false,production:false,rawUidExported:false,rawShopperIdExported:false,adminPasswordExported:false}
  };

  if(recent.length!==1){
    const decision=recent.length===0?'HOLD_P0_NO_UNIQUE_RECENT_SHOPPER_LOGIN':'HOLD_P0_AMBIGUOUS_RECENT_SHOPPER_LOGIN';
    const safe={...safeBase,decision,diagnosis:{code:decision,detail:'The owner-observed login window did not resolve to exactly one enabled password Shopper principal. No identity was guessed.'}};
    fs.mkdirSync(path.dirname(SAFE_OUT),{recursive:true});fs.mkdirSync(path.dirname(PRIVATE_OUT),{recursive:true});
    fs.writeFileSync(SAFE_OUT,JSON.stringify(safe,null,2)+'\n','utf8');
    fs.writeFileSync(PRIVATE_OUT,JSON.stringify({schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.private.v1',generatedAt:safe.generatedAt,requestId:request.requestId,adminVisibleLogin,recentHumanShopperCandidates:recent.map(u=>({uidFingerprint:fp('auth-uid',u.uid),lastSignInTime:u.metadata?.lastSignInTime||null}))},null,2)+'\n',{encoding:'utf8',mode:0o600});
    console.log(JSON.stringify({decision,recentHumanShopperCandidates:recent.length,adminVisibleLoginRecovered:true}));
    process.exitCode=2;return;
  }

  const u=recent[0],claims=u.customClaims||{},shopperId=text(claims.shopperId);
  const [profileDoc,userDoc,fsVisitsSnap,fsPostsSnap,fsAppsSnap,certSnap,liqSnap,live]=await Promise.all([
    shopperId?db.collection('tenants').doc(TENANT).collection('shoppers').doc(shopperId).get():Promise.resolve(null),
    db.collection('tenants').doc(TENANT).collection('users').doc(u.uid).get(),
    db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT).collection('visits').get(),
    db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT).collection('postulations').get(),
    db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT).collection('applications').get(),
    db.collectionGroup('certifications').get(),
    db.collectionGroup('liquidations').get(),
    liveHr()
  ]);
  const tenantShopperSnap=await db.collection('tenants').doc(TENANT).collection('shoppers').get();
  const profile=profileDoc?.exists?docData(profileDoc):null;
  const membership=userDoc?.exists?membershipSummary(userDoc.data()||{},claims):{exists:false};
  const protectedShoppers=tenantShopperSnap.docs.map(docData);
  const protectedVisits=fsVisitsSnap.docs.map(docData);
  const protectedPosts=[...fsPostsSnap.docs.map(docData),...fsAppsSnap.docs.map(docData)];
  const certifications=certSnap.docs.map(docData);
  const liquidations=liqSnap.docs.map(docData);
  const hr=live.snapshot||{};
  const hrShoppers=Array.isArray(hr.shoppers)?hr.shoppers:[];
  const hrVisits=Array.isArray(hr.visits)?hr.visits:[];
  const hrProjects=Array.isArray(hr.periods)?hr.periods:Array.isArray(hr.projects)?hr.projects:[];
  const aliases=new Set(exactAliases(profile||{}));
  if(shopperId)aliases.add(shopperId);
  const hrShopperMatches=hrShoppers.filter(s=>exactAliases(s).some(a=>aliases.has(a)));
  const matchedHrIds=new Set(hrShopperMatches.flatMap(exactAliases));
  const exactKeys=new Set([...aliases,...matchedHrIds]);
  const hrVisitMatches=hrVisits.filter(v=>exactKeys.has(text(v.shopperId))||exactKeys.has(text(v.shopperCode)));

  await import(pathToFileURL(path.resolve('app/adapters/tya-cumulative-read-model-v2.js')).href+`?p0=${Date.now()}`);
  await import(pathToFileURL(path.resolve('app/adapters/tya-canonical-state-semantics-v2.js')).href+`?p0=${Date.now()}`);
  const composer=globalThis.CX_TYA_CUMULATIVE_READ_MODEL;
  ensure(composer&&typeof composer.compose==='function','COMPOSER_UNAVAILABLE');
  const composed=composer.compose({
    hr:{projects:hrProjects,visits:hrVisits,shoppers:hrShoppers,posts:Array.isArray(hr.posts)?hr.posts:[],periodOperationalSummary:Array.isArray(hr.periodOperationalSummary)?hr.periodOperationalSummary:[],currentProjectId:'cinepolis',currentPeriodId:text(hr.currentPeriodId||''),sourceRevision:text(hr.sourceRevision||live.runtime?.revision||'')},
    protectedPayload:{visits:protectedVisits,shoppers:protectedShoppers,posts:protectedPosts,certifications,liquidations}
  });
  const d=composed.diagnostics||{};
  const mappedShopperId=shopperId?(composed.identityMap||{})[shopperId]||shopperId:'';
  const composedProfile=composed.shoppers.find(s=>text(s.id||s.shopperId)===mappedShopperId)||null;
  const canonicalOwnVisits=composedProfile?composed.visits.filter(v=>text(v.shopperId)===text(composedProfile.id||composedProfile.shopperId)).length:0;
  const bridgeInvariantPass=d.outputVisits===hrVisits.length&&d.duplicateVisitKeys===0&&d.duplicateShopperIds===0&&d.protectedVisitsAppended===0;
  const claimsReady=claims.role==='shopper'&&tenantAllowed(claims)&&projectAllowed(claims)&&Boolean(shopperId);
  const profileReady=Boolean(profile);
  const exactCrosswalkReady=hrShopperMatches.length===1;
  const canonicalProfileReady=Boolean(composedProfile);

  let code='P0_RUNTIME_RECONCILE_NOT_EFFECTIVE_DESPITE_VALID_CANONICAL_INPUTS';
  if(!claimsReady)code='P0_SHOPPER_AUTH_SCOPE_INVALID';
  else if(!profileReady)code='P0_SHOPPER_CLAIM_PROFILE_DOC_MISSING';
  else if(!exactCrosswalkReady)code=hrShopperMatches.length===0?'P0_SHOPPER_PROFILE_NO_EXACT_HR_CROSSWALK':'P0_SHOPPER_PROFILE_AMBIGUOUS_EXACT_HR_CROSSWALK';
  else if(!bridgeInvariantPass)code='P0_CANONICAL_COMPOSER_INVARIANT_FAILURE';
  else if(!canonicalProfileReady)code='P0_CANONICAL_COMPOSER_EXCLUDES_AUTHENTICATED_SHOPPER';
  else if(canonicalOwnVisits===0&&hrVisitMatches.length>0)code='P0_CANONICAL_SHOPPER_VISIT_LINK_LOSS';

  const decision=code==='P0_RUNTIME_RECONCILE_NOT_EFFECTIVE_DESPITE_VALID_CANONICAL_INPUTS'?'HOLD_P0_RUNTIME_RECONCILE_NOT_EFFECTIVE':'HOLD_'+code;
  const safe={...safeBase,decision,
    selectedShopper:{uidFingerprint:fp('auth-uid',u.uid),shopperIdFingerprint:fp('shopper-id',shopperId),lastSignInTime:u.metadata?.lastSignInTime||null,claims:{role:text(claims.role),authNamespace:text(claims.authNamespace)||null,tenantAllowed:tenantAllowed(claims),projectAllowed:projectAllowed(claims),shopperIdPresent:Boolean(shopperId),countryPresent:Boolean(text(claims.country)),projectCount:list(claims.projectIds).length},membership},
    providerReadModel:{firestoreProfileExists:profileReady,tenantProtectedProfiles:protectedShoppers.length,protectedVisits:protectedVisits.length,protectedPostulationsAndApplications:protectedPosts.length,certifications:certifications.length,liquidations:liquidations.length},
    liveHr:{sourceSafe:hr.sourceSafe===true,runtimeRead:live.runtime?.runtimeRead===true,cacheOrigin:live.runtime?.cacheOrigin||null,periods:hrProjects.length,visits:hrVisits.length,shoppers:hrShoppers.length,uniqueVisitKeys:new Set(hrVisits.map(visitKey).filter(Boolean)).size,exactShopperMatches:hrShopperMatches.length,exactVisitMatchesForSelectedShopper:hrVisitMatches.length},
    canonicalComposition:{bridgeInvariantPass,outputVisits:d.outputVisits,outputShoppers:d.outputShoppers,duplicateVisitKeys:d.duplicateVisitKeys,duplicateShopperIds:d.duplicateShopperIds,protectedVisitsAppended:d.protectedVisitsAppended,crosswalkLiveToCanonical:d.crosswalkLiveToCanonical,identityConflictCount:Array.isArray(d.identityConflicts)?d.identityConflicts.length:0,platformOnlyProfiles:d.platformOnlyProfiles,authenticatedShopperPresentInComposedModel:canonicalProfileReady,authenticatedShopperOwnVisits:canonicalOwnVisits},
    diagnosis:{code,claimsReady,profileReady,exactCrosswalkReady,bridgeInvariantPass,canonicalProfileReady,detail:code==='P0_RUNTIME_RECONCILE_NOT_EFFECTIVE_DESPITE_VALID_CANONICAL_INPUTS'?'Provider claims, exact profile/HR crosswalk and offline canonical composition are valid, while the owner-observed browser remained Firestore-only. The residual P0 is the post-login runtime reconciliation/activation path, not missing HR data or a guessed identity.':'The source-safe checks isolated the first failing exact prerequisite shown by code.'}
  };
  const privateResult={schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.private.v1',generatedAt:safe.generatedAt,requestId:request.requestId,adminVisibleLogin,selectedShopper:{shopperId,uidFingerprint:safe.selectedShopper.uidFingerprint,lastSignInTime:safe.selectedShopper.lastSignInTime},diagnosisCode:code,passwordIncluded:false,tokensIncluded:false,providerEmailIncluded:false};
  fs.mkdirSync(path.dirname(SAFE_OUT),{recursive:true});fs.mkdirSync(path.dirname(PRIVATE_OUT),{recursive:true});
  fs.writeFileSync(SAFE_OUT,JSON.stringify(safe,null,2)+'\n','utf8');
  fs.writeFileSync(PRIVATE_OUT,JSON.stringify(privateResult,null,2)+'\n',{encoding:'utf8',mode:0o600});
  console.log(JSON.stringify({decision,diagnosis:code,recentHumanShopperCandidates:1,adminVisibleLoginRecovered:true,firestoreProfileExists:profileReady,exactHrCrosswalk:hrShopperMatches.length,canonicalProfileReady,canonicalOwnVisits,bridgeInvariantPass}));
}finally{
  try{handoff?.dispose?.();}catch{}
  await deleteApp(app);
}
