import fs from 'node:fs';
import crypto from 'node:crypto';
import process from 'node:process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import { initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const EXPECTED_PROJECT='cxorbia-backend-dev';
const TENANT='tya';
const PROJECT='cinepolis';
const REQUEST_PATH=process.env.CXORBIA_REQUEST_PATH||'backend/config/corte6-hold-profile-live-hr-readonly-request.json';
const PRIVATE_OUT=process.env.CXORBIA_PRIVATE_OUT||'.tmp/c6-hold-profile-live-hr/private.json';
const SAFE_OUT=process.env.CXORBIA_SAFE_OUT||'app/docs/evidence/CORTE6-HOLD-PROFILE-LIVE-HR-READONLY-LATEST.json';
const LIVE_URLS=(process.env.CXORBIA_LIVE_HR_URLS||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?fresh=1').split(',').map(x=>x.trim()).filter(Boolean);
const STAFF_TARGETS_PATH='backend/config/c6-staff-provider-collision-targets-v1.json';

const text=v=>String(v??'').trim();
const list=v=>Array.isArray(v)?v.map(text).filter(Boolean):typeof v==='string'?v.split(',').map(text).filter(Boolean):[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=(namespace,value)=>sha(`${namespace}\0${text(value)}`).slice(0,20);
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const docData=d=>({id:d.id,...(d.data()||{})});
const visitKey=v=>text(v?.hrRowId)||((text(v?.sourceTab)&&text(v?.sourceRow))?`${text(v.sourceTab)}::${text(v.sourceRow)}`:'')||text(v?.visitId||v?.id);

function exactAliases(o){
  const out=[];
  const add=v=>{
    if(v==null)return;
    if(Array.isArray(v)){v.forEach(add);return;}
    if(typeof v==='object'){Object.values(v).forEach(add);return;}
    const s=text(v);if(s)out.push(s);
  };
  [o?.id,o?.shopperId,o?.legacyShopperId,o?.legacyId,o?.sourceId,o?.sourceKey,o?.canonicalLegacyIds,o?.legacyLiveShopperIds,o?.sourceShopperIds,o?.hrShopperIds,o?.identityAliases,o?.aliases,o?.crosswalk?.aliases,o?.identity?.aliases,o?.profile?.aliases].forEach(add);
  return [...new Set(out)];
}
function tenantAllowed(claims){return claims?.role==='super'||claims?.tenantId===TENANT||list(claims?.tenants).includes(TENANT);}
function projectAllowed(claims){return list(claims?.projectIds).includes(PROJECT);}
function passwordPrincipal(u){return (u.providerData||[]).some(p=>p.providerId==='password');}
function inWindow(value,start,end){const t=Date.parse(value||'');return Number.isFinite(t)&&t>=Date.parse(start)&&t<=Date.parse(end);}
function membershipSummary(data,claims){
  if(!data)return {exists:false,consistent:false};
  const out={
    exists:true,
    roleMatches:!data.role||text(data.role)===text(claims.role),
    tenantMatches:!data.tenantId||text(data.tenantId)===TENANT,
    projectMatches:!data.projectIds||list(data.projectIds).includes(PROJECT),
    shopperIdMatches:!data.shopperId||text(data.shopperId)===text(claims.shopperId),
    countryPresent:Boolean(text(data.country||data.pais))
  };
  out.consistent=out.roleMatches&&out.tenantMatches&&out.projectMatches&&out.shopperIdMatches;
  return out;
}
async function listAllUsers(auth){
  const out=[];let token;
  do{const page=await auth.listUsers(1000,token);out.push(...page.users);token=page.pageToken;}while(token);
  return out;
}
async function readLiveHr(){
  const errors=[];
  for(const url of LIVE_URLS){
    try{
      const response=await fetch(url,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'},signal:AbortSignal.timeout(180000)});
      const payload=await response.json().catch(()=>null);
      if(!response.ok||!payload||payload.ok===false)throw new Error(`HTTP_${response.status}:${payload?.error||payload?.message||'invalid_json'}`);
      const snapshot=payload.snapshot||payload.data||payload;
      const runtime={...(payload._runtime||{}),...(snapshot?._runtime||{})};
      if(snapshot&&snapshot._runtime)delete snapshot._runtime;
      const periods=Array.isArray(snapshot?.periods)?snapshot.periods:Array.isArray(snapshot?.projects)?snapshot.projects:[];
      const visits=Array.isArray(snapshot?.visits)?snapshot.visits:[];
      const shoppers=Array.isArray(snapshot?.shoppers)?snapshot.shoppers:[];
      const periodKeys=periods.map(p=>text(p?.key||p?.periodKey||p?.id).match(/20\d{2}-\d{2}/)?.[0]||'').filter(Boolean).sort();
      return {ok:true,snapshot,runtime,counts:{periods:periods.length,visits:visits.length,shoppers:shoppers.length,latestPeriod:periodKeys.at(-1)||null,uniqueVisitKeys:new Set(visits.map(visitKey).filter(Boolean)).size},sourceSafe:snapshot?.sourceSafe===true,runtimeRead:runtime.runtimeRead===true,cacheOrigin:runtime.cacheOrigin||null,revision:runtime.revision||null};
    }catch(error){errors.push(String(error?.message||error).slice(0,300));}
  }
  return {ok:false,errors};
}
function writeJson(file,value,mode){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{encoding:'utf8',...(mode?{mode}:{})});}

const request=JSON.parse(fs.readFileSync(REQUEST_PATH,'utf8'));
ensure(request.schemaVersion==='cxorbia.c6.hold-profile-live-hr-readonly-request.v1','REQUEST_SCHEMA');
ensure(request.mode==='p0_human_shopper_auth_hr_readonly','REQUEST_MODE');
ensure(request.enabled===true&&request.consumed===false&&request.status==='authorized_execute_once','REQUEST_NOT_READY');
ensure(request.authorizedBy==='Paula'&&request.authorizationSource==='current_conversation_2026-08-13','REQUEST_AUTHORIZATION');
ensure(request.repository==='paulaosoriof86/demoCXOrbia'&&request.branch==='docs-tya-v6-v71-audit'&&Number(request.pullRequest)===7&&request.firebaseProjectId===EXPECTED_PROJECT&&request.tenantId===TENANT&&request.projectId===PROJECT,'TARGET_MISMATCH');
ensure(Number(request.providerReadsAuthorizedMax)===1&&Number(request.secondAttempt)===0&&request.rerunAllowed===false,'ONE_SHOT_CONTRACT');
for(const k of ['providerWrites','authWrites','firestoreWrites','hrWrites','rulesWrites','storageWrites','hostingDeploys','cloudRunDeploys','makeWrites','geminiCalls','paymentsWrites'])ensure(Number(request[k])===0,`UNSAFE_FLAG:${k}`);
ensure(request.passwordChanges===0&&request.passwordResets===0&&request.merge===false&&request.production===false,'UNSAFE_SECURITY_SCOPE');
ensure(request.observedLoginWindowUtc?.start&&request.observedLoginWindowUtc?.end,'LOGIN_WINDOW_REQUIRED');

const serviceAccount=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'{}');
ensure(serviceAccount.type==='service_account'&&serviceAccount.project_id===EXPECTED_PROJECT&&typeof serviceAccount.private_key==='string','SERVICE_ACCOUNT_INVALID');
const app=initializeApp({credential:cert(serviceAccount),projectId:EXPECTED_PROJECT});
const db=getFirestore(app),auth=getAuth(app);
try{
  const [authUsers,liveHr,tenantUsersSnap]=await Promise.all([
    listAllUsers(auth),
    readLiveHr(),
    db.collection('tenants').doc(TENANT).collection('users').select('visibleLogin','authNamespace','role','tenantId','projectIds','shopperId','country','pais').get()
  ]);
  ensure(liveHr.ok===true,'LIVE_HR_UNAVAILABLE');

  const staffTargets=JSON.parse(fs.readFileSync(STAFF_TARGETS_PATH,'utf8'));
  const targetB=staffTargets.targets?.find(x=>x.targetAlias==='B');
  ensure(targetB?.technicalLoginDigest&&targetB?.role==='admin','ADMIN_B_TARGET_INVALID');
  const adminMatches=tenantUsersSnap.docs.map(docData).filter(row=>{
    const login=text(row.visibleLogin).toLowerCase();
    const ns=text(row.authNamespace||'staff').toLowerCase();
    return login&&ns==='staff'&&sha(`${TENANT}\0staff\0${login}`)===targetB.technicalLoginDigest;
  });
  ensure(adminMatches.length===1,'ADMIN_B_VISIBLE_LOGIN_MATCH_NOT_UNIQUE');
  const adminRow=adminMatches[0],adminVisibleLogin=text(adminRow.visibleLogin).toLowerCase();
  const adminAuth=authUsers.find(u=>u.uid===adminRow.id)||null;
  const adminClaims=adminAuth?.customClaims||{};
  ensure(adminAuth&&!adminAuth.disabled&&adminClaims.role==='admin'&&tenantAllowed(adminClaims)&&projectAllowed(adminClaims),'ADMIN_B_AUTH_SCOPE_INVALID');

  const start=request.observedLoginWindowUtc.start,end=request.observedLoginWindowUtc.end;
  const recent=authUsers.filter(u=>{
    const c=u.customClaims||{};
    return !u.disabled&&passwordPrincipal(u)&&c.role==='shopper'&&tenantAllowed(c)&&projectAllowed(c)&&inWindow(u.metadata?.lastSignInTime,start,end);
  }).sort((a,b)=>Date.parse(b.metadata?.lastSignInTime||0)-Date.parse(a.metadata?.lastSignInTime||0));

  const base={
    schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.source-safe.v1',
    generatedAt:new Date().toISOString(),requestId:request.requestId,
    target:{firebaseProjectId:EXPECTED_PROJECT,tenantId:TENANT,projectId:PROJECT},
    observedLoginWindowUtc:{start,end},
    recentHumanShopperCandidates:recent.length,
    ownerObservedRuntime:request.ownerObservedRuntime||{},
    admin:{canonicalAlias:'B',role:'admin',visibleLoginRecovered:true,visibleLoginFingerprint:fp('admin-visible-login-b',adminVisibleLogin),authScopeValid:true,passwordRead:false,passwordChanged:false},
    liveHr:{sourceSafe:liveHr.sourceSafe,runtimeRead:liveHr.runtimeRead,cacheOrigin:liveHr.cacheOrigin,revision:liveHr.revision,...liveHr.counts},
    safety:{providerReadExecutions:1,providerWrites:0,authWrites:0,passwordReads:0,passwordChanges:0,passwordResets:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,merge:false,production:false,rawUidExported:false,rawShopperIdExported:false,adminPasswordExported:false}
  };

  if(recent.length!==1){
    const decision=recent.length===0?'HOLD_P0_NO_UNIQUE_RECENT_SHOPPER_LOGIN':'HOLD_P0_AMBIGUOUS_RECENT_SHOPPER_LOGIN';
    const safe={...base,decision,diagnosis:{code:decision,noIdentityGuessed:true,detail:'The owner-observed login window did not resolve to exactly one enabled password Shopper principal. No identity was guessed.'}};
    writeJson(SAFE_OUT,safe);
    writeJson(PRIVATE_OUT,{schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.private.v1',generatedAt:safe.generatedAt,requestId:request.requestId,adminVisibleLogin,passwordIncluded:false,recentCandidates:recent.map(u=>({uidFingerprint:fp('auth-uid',u.uid),lastSignInTime:u.metadata?.lastSignInTime||null}))},0o600);
    console.log(JSON.stringify({decision,recentHumanShopperCandidates:recent.length,adminVisibleLoginRecovered:true,providerReadExecutions:1}));
  }else{
    const u=recent[0],claims=u.customClaims||{},shopperId=text(claims.shopperId);
    const tenantRef=db.collection('tenants').doc(TENANT),projectRef=tenantRef.collection('projects').doc(PROJECT);
    const [profileDoc,membershipDoc,profileSnap,visitSnap,postSnap,applicationSnap]=await Promise.all([
      shopperId?tenantRef.collection('shoppers').doc(shopperId).get():Promise.resolve(null),
      tenantRef.collection('users').doc(u.uid).get(),
      tenantRef.collection('shoppers').get(),
      projectRef.collection('visits').get(),
      projectRef.collection('postulations').get(),
      projectRef.collection('applications').get()
    ]);
    const profile=profileDoc?.exists?docData(profileDoc):null;
    const protectedShoppers=profileSnap.docs.map(docData),protectedVisits=visitSnap.docs.map(docData),protectedPosts=[...postSnap.docs.map(docData),...applicationSnap.docs.map(docData)];
    const hr=liveHr.snapshot||{},hrShoppers=Array.isArray(hr.shoppers)?hr.shoppers:[],hrVisits=Array.isArray(hr.visits)?hr.visits:[],hrProjects=Array.isArray(hr.periods)?hr.periods:Array.isArray(hr.projects)?hr.projects:[];
    const keys=new Set(exactAliases(profile||{}));if(shopperId)keys.add(shopperId);
    const exactHrShoppers=hrShoppers.filter(row=>exactAliases(row).some(a=>keys.has(a)));
    exactHrShoppers.forEach(row=>exactAliases(row).forEach(a=>keys.add(a)));
    const exactHrVisits=hrVisits.filter(v=>keys.has(text(v.shopperId))||keys.has(text(v.shopperCode)));

    await import(pathToFileURL(path.resolve('app/adapters/tya-cumulative-read-model-v2.js')).href+`?p0=${Date.now()}`);
    await import(pathToFileURL(path.resolve('app/adapters/tya-canonical-state-semantics-v2.js')).href+`?p0=${Date.now()}`);
    const composer=globalThis.CX_TYA_CUMULATIVE_READ_MODEL;
    ensure(composer&&typeof composer.compose==='function','CANONICAL_COMPOSER_UNAVAILABLE');
    const composed=composer.compose({
      hr:{projects:hrProjects,visits:hrVisits,shoppers:hrShoppers,posts:Array.isArray(hr.posts)?hr.posts:[],periodOperationalSummary:Array.isArray(hr.periodOperationalSummary)?hr.periodOperationalSummary:[],currentProjectId:PROJECT,currentPeriodId:text(hr.currentPeriodId),sourceRevision:text(hr.sourceRevision||liveHr.revision)},
      protectedPayload:{visits:protectedVisits,shoppers:protectedShoppers,posts:protectedPosts,certifications:[],liquidations:[]}
    });
    const d=composed.diagnostics||{};
    const mappedShopperId=shopperId?((composed.identityMap||{})[shopperId]||shopperId):'';
    const canonicalProfile=composed.shoppers.find(row=>text(row.id||row.shopperId)===mappedShopperId)||null;
    const canonicalOwnVisits=canonicalProfile?composed.visits.filter(v=>text(v.shopperId)===text(canonicalProfile.id||canonicalProfile.shopperId)).length:0;
    const claimsReady=claims.role==='shopper'&&tenantAllowed(claims)&&projectAllowed(claims)&&Boolean(shopperId);
    const profileReady=Boolean(profile);
    const exactCrosswalkReady=exactHrShoppers.length===1;
    const bridgeInvariantPass=d.outputVisits===hrVisits.length&&Number(d.duplicateVisitKeys||0)===0&&Number(d.duplicateShopperIds||0)===0&&Number(d.protectedVisitsAppended||0)===0;
    const canonicalProfileReady=Boolean(canonicalProfile);
    let code='P0_RUNTIME_RECONCILE_NOT_EFFECTIVE_DESPITE_VALID_CANONICAL_INPUTS';
    if(!claimsReady)code='P0_SHOPPER_AUTH_SCOPE_INVALID';
    else if(!profileReady)code='P0_SHOPPER_CLAIM_PROFILE_DOC_MISSING';
    else if(exactHrShoppers.length===0)code='P0_SHOPPER_PROFILE_NO_EXACT_HR_CROSSWALK';
    else if(exactHrShoppers.length>1)code='P0_SHOPPER_PROFILE_AMBIGUOUS_EXACT_HR_CROSSWALK';
    else if(!bridgeInvariantPass)code='P0_CANONICAL_COMPOSER_INVARIANT_FAILURE';
    else if(!canonicalProfileReady)code='P0_CANONICAL_COMPOSER_EXCLUDES_AUTHENTICATED_SHOPPER';
    else if(canonicalOwnVisits===0&&exactHrVisits.length>0)code='P0_CANONICAL_SHOPPER_VISIT_LINK_LOSS';
    const membership=membershipSummary(membershipDoc?.exists?membershipDoc.data():null,claims);
    const safe={...base,decision:`HOLD_${code}`,
      selectedShopper:{uidFingerprint:fp('auth-uid',u.uid),shopperIdFingerprint:fp('shopper-id',shopperId),lastSignInTime:u.metadata?.lastSignInTime||null,claims:{role:text(claims.role),authNamespace:text(claims.authNamespace)||null,tenantAllowed:tenantAllowed(claims),projectAllowed:projectAllowed(claims),shopperIdPresent:Boolean(shopperId),countryPresent:Boolean(text(claims.country)),projectCount:list(claims.projectIds).length},membership},
      providerReadModel:{firestoreProfileExists:profileReady,tenantProtectedProfiles:protectedShoppers.length,protectedVisits:protectedVisits.length,protectedPostulationsAndApplications:protectedPosts.length},
      identity:{exactHrShopperMatches:exactHrShoppers.length,exactHrVisitMatches:exactHrVisits.length},
      canonicalComposition:{bridgeInvariantPass,outputVisits:d.outputVisits,outputShoppers:d.outputShoppers,duplicateVisitKeys:d.duplicateVisitKeys,duplicateShopperIds:d.duplicateShopperIds,protectedVisitsAppended:d.protectedVisitsAppended,crosswalkLiveToCanonical:d.crosswalkLiveToCanonical,identityConflictCount:Array.isArray(d.identityConflicts)?d.identityConflicts.length:0,platformOnlyProfiles:d.platformOnlyProfiles,authenticatedShopperPresentInComposedModel:canonicalProfileReady,authenticatedShopperOwnVisits:canonicalOwnVisits},
      bridgeAssessment:{ownerObservedSource:text(request.ownerObservedRuntime?.source)||null,expectedPostReconcileSource:'hr-live-all-periods+firestore-authenticated-exact-overlay',ownerObservedProfileLinked:Boolean(request.ownerObservedRuntime?.profileLinked),offlinePrerequisitesPass:claimsReady&&profileReady&&exactCrosswalkReady&&bridgeInvariantPass&&canonicalProfileReady,residualRuntimeFailure:code==='P0_RUNTIME_RECONCILE_NOT_EFFECTIVE_DESPITE_VALID_CANONICAL_INPUTS'},
      diagnosis:{code,claimsReady,profileReady,exactCrosswalkReady,bridgeInvariantPass,canonicalProfileReady,detail:code==='P0_RUNTIME_RECONCILE_NOT_EFFECTIVE_DESPITE_VALID_CANONICAL_INPUTS'?'Auth scope, protected profile, exact HR crosswalk and canonical composition are valid offline, but the owner-observed human browser remained Firestore-only. The residual P0 is the post-login reconciliation/activation path.':'The first failed exact prerequisite is identified by diagnosis.code; no name-based identity inference was used.'}
    };
    writeJson(SAFE_OUT,safe);
    writeJson(PRIVATE_OUT,{schemaVersion:'cxorbia.p0.human-shopper-auth-hr-readonly.private.v1',generatedAt:safe.generatedAt,requestId:request.requestId,adminVisibleLogin,adminCanonicalAlias:'B',selectedShopper:{uidFingerprint:safe.selectedShopper.uidFingerprint,shopperIdFingerprint:safe.selectedShopper.shopperIdFingerprint,lastSignInTime:safe.selectedShopper.lastSignInTime},diagnosisCode:code,passwordIncluded:false,tokensIncluded:false,providerEmailIncluded:false},0o600);
    console.log(JSON.stringify({decision:safe.decision,diagnosis:code,recentHumanShopperCandidates:1,adminVisibleLoginRecovered:true,claimsReady,profileReady,exactHrShopperMatches:exactHrShoppers.length,bridgeInvariantPass,canonicalProfileReady,canonicalOwnVisits,providerReadExecutions:1}));
  }
}finally{
  await deleteApp(app);
}
