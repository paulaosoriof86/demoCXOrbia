#!/usr/bin/env node
/* I3 A08 focal DEV read-only: exactly three RUN2222 exceptional shopper IDs
 * plus authenticated Firestore deny/read tests using the two already-approved
 * GT/HN shopper principals. No census, mutation, credential export or deploy.
 * A signed custom-token session does NOT prove ordinary password login. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault, getApps, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import {classifyA08MembershipEvidence} from '../../tools/qa/cxorbia-i3-a08-membership-classifier.mjs';

const TENANT='tya', PROGRAM='cinepolis', PROJECT='cxorbia-backend-dev';
const ROOT='https://cxorbia-backend-dev.web.app';
const IDS=['shopper_gt_a092a0647f','shopper_hn_3b3c2f5cc1','shp-3669abbb015a'];
const SOURCE=String(process.env.CXORBIA_PRODUCT_SOURCE_SHA||'').trim();
const SEALED_HR=String(process.env.CXORBIA_HR_REVISION||'').trim();
const OUT='.tmp/cxorbia-i3-two-keepers-role-e2e-readonly';
const str=x=>String(x??'').trim();
const arr=x=>Array.isArray(x)?x:[];
const fp=x=>crypto.createHash('sha256').update(str(x)).digest('hex').slice(0,16);
const result={
  schemaVersion:'cxorbia.i3.a08.exception-auth-and-role-denial.readonly.v1',
  iteration:'I3',gate:'HOLD',environment:PROJECT,sourceSha:SOURCE,
  sealedHrRevision:SEALED_HR,observedHrRevision:null,
  scope:{exceptionShopperIds:IDS,keepers:['GT_MURGA','HN_VILCA'],
    firestoreDeniedOps:['cross-shopper-profile-get','staff-membership-get'],
    apiDenials:'UNTESTED',storageDenials:'UNTESTED',passwordLogin:'UNTESTED'},
  exceptions:[],keeperProof:[],decision:'HOLD_NOT_EXECUTED',checks:[],
  safety:{providerCommands:0,directAuthWrites:0,directFirestoreWrites:0,
    hrWrites:0,deploys:0,production:false}};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
const assert=(value,code,details={})=>{
  result.checks.push({code,pass:Boolean(value),...details});
  if(!value)throw Error(code);
};
const knownError=e=>{
  const v=str(e?.message||e);
  const m=v.match(/(?:SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE):[A-Z0-9_]+/);
  return m?m[0]:/timeout/i.test(v)?'ENVIRONMENT_FAILURE:A08_TIMEOUT':'AUTH_FAILURE:A08_UNCLASSIFIED';
};
const authUrl=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'+
  '&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'+
  '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
let browser;
async function keeperByLogin(tenant,auth,label,login){
  const members=new Map();
  for(const field of ['visibleLogin','username','user']){
    const snap=await tenant.collection('users').where(field,'==',login).limit(4).get();
    for(const doc of snap.docs)members.set(doc.id,{uid:doc.id,...doc.data()});
  }
  const matches=[...members.values()].filter(m=>m.active===true&&str(m.role)==='shopper'&&
    str(m.authNamespace)==='shopper'&&arr(m.projectIds).includes(PROGRAM));
  assert(matches.length===1,'MAPPING_FAILURE:A08_KEEPER_MEMBERSHIP_NOT_UNIQUE',{label,count:matches.length});
  const user=await auth.getUser(matches[0].uid);
  assert(!user.disabled&&str(user.customClaims?.shopperId)===str(matches[0].shopperId),
    'AUTH_FAILURE:A08_KEEPER_AUTH_CLAIM_MISMATCH',{label});
  const profile=await tenant.collection('shoppers').doc(str(matches[0].shopperId)).get();
  assert(profile.exists,'MAPPING_FAILURE:A08_KEEPER_PROFILE_MISSING',{label});
  return {label,member:matches[0]};
}
async function inspectException(tenant,auth,id){
  const [profileSnap,memberSnap]=await Promise.all([
    tenant.collection('shoppers').doc(id).get(),
    tenant.collection('users').where('shopperId','==',id).limit(9).get()
  ]);
  const evidence={shopperId:id,profileExists:profileSnap.exists,
    membershipCount:memberSnap.size,membershipQueryBoundedAt:9,
    authRecords:[],ordinaryPasswordLoginProven:false,
    classification:'AUTH_EVIDENCE_NOT_YET_ADJUDICATED'};
  for(const doc of memberSnap.docs){
    const m=doc.data()||{};
    let authUser=null,authLookup='PRESENT';
    try{authUser=await auth.getUser(doc.id);}
    catch(e){if(e?.code==='auth/user-not-found')authLookup='NOT_FOUND';else throw e;}
    const claims=authUser?.customClaims||{};
    evidence.authRecords.push({uidFingerprint:fp(doc.id),authLookup,
      activeMembership:m.active===true,role:str(m.role),
      authNamespace:str(m.authNamespace),projectMember:arr(m.projectIds).includes(PROGRAM),
      authDisabled:authUser?.disabled===true,
      claimShopperMatches:str(claims.shopperId)===id,
      claimRoleMatches:str(claims.role)===str(m.role),
      claimTenantMatches:str(claims.tenantId)===TENANT});
  }
  Object.assign(evidence,classifyA08MembershipEvidence(evidence));
  return evidence;
}
async function signedShopper(auth,member,label){
  const context=await browser.newContext({viewport:{width:1360,height:950}});
  const page=await context.newPage();
  try{
    const token=await auth.createCustomToken(member.uid);
    const url=authUrl+'&i3A08='+label+'&stamp='+Date.now();
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&!!window.firebase?.firestore,
      null,{timeout:90000});
    await page.evaluate(async()=>window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL));
    await page.evaluate(jwt=>window.firebase.auth().signInWithCustomToken(jwt),token);
    await page.waitForFunction(uid=>window.firebase.auth().currentUser?.uid===uid,
      member.uid,{timeout:90000});
    await page.goto('about:blank',{waitUntil:'domcontentloaded',timeout:30000});
    await page.goto(url+'&settled=1',{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(({uid,shopperId})=>{
      const context=window.CX?.backendAuth?.context?.()||{};
      return window.firebase?.auth?.()?.currentUser?.uid===uid &&
        context.authenticated===true&&strForBrowser(context.role)==='shopper'&&
        strForBrowser(context.shopperId)===shopperId&&
        window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
        /^[a-f0-9]{64}$/.test(String(window.CX?.data?.previewMeta?.sourceRevision||''));
      function strForBrowser(x){return String(x??'').trim();}
    },{uid:member.uid,shopperId:str(member.shopperId)},{timeout:120000});
    const contextInfo=await page.evaluate(()=>({
      projectId:String(window.firebase.app().options.projectId||''),
      hrRevision:String(window.CX?.data?.previewMeta?.sourceRevision||''),
      role:String(window.CX?.backendAuth?.context?.()?.role||'')
    }));
    assert(contextInfo.projectId===PROJECT,'ENVIRONMENT_FAILURE:A08_FIREBASE_PROJECT_NOT_DEV',{label});
    if(result.observedHrRevision===null)result.observedHrRevision=contextInfo.hrRevision;
    else assert(result.observedHrRevision===contextInfo.hrRevision,
      'PROVIDER_FAILURE:A08_KEEPER_HR_REVISION_CHANGED_BETWEEN_SESSIONS',{label});
    return {context,page};
  }catch(error){await context.close().catch(()=>{});throw error;}
}
async function firestoreProbe(page,path){
  return page.evaluate(async docPath=>{
    try{
      const snap=await window.firebase.firestore().doc(docPath).get();
      return {outcome:'READ_ALLOWED',exists:snap.exists};
    }catch(e){
      return {outcome:String(e?.code||'UNKNOWN_ERROR'),messageType:String(e?.name||'')};
    }
  },path);
}
try{
  assert(/^[a-f0-9]{40}$/.test(SOURCE)&&/^[a-f0-9]{64}$/.test(SEALED_HR),
    'RELEASE_COMPOSITION_FAILURE:A08_UNSEALED_SOURCE_OR_HR');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
  for(const id of IDS)result.exceptions.push(await inspectException(tenant,auth,id));
  assert(result.exceptions.length===3,'MAPPING_FAILURE:A08_THREE_EXCEPTIONS_NOT_TRIAGED');
  assert(result.exceptions.every(x=>x.classification.startsWith('AUTH_RECORD_CONSISTENT_')),
    'AUTH_FAILURE:A08_UNRESOLVED_ACTIVE_OR_AMBIGUOUS_MEMBERSHIP');
  const [gt,hn]=await Promise.all([
    keeperByLogin(tenant,auth,'GT_MURGA','jennypher.murga'),
    keeperByLogin(tenant,auth,'HN_VILCA','rocio.vilca')
  ]);
  const staffQueries=await Promise.all([
    tenant.collection('users').where('role','==','admin').limit(12).get(),
    tenant.collection('users').where('role','==','super').limit(12).get()
  ]);
  const staff=[...staffQueries.flatMap(s=>s.docs)]
    .map(d=>({uid:d.id,...d.data()}))
    .find(m=>m.active===true&&str(m.authNamespace)==='staff'&&
      arr(m.projectIds).includes(PROGRAM));
  assert(Boolean(staff),'AUTH_FAILURE:A08_STAFF_REFERENCE_NOT_FOUND');
  assert((await tenant.collection('users').doc(staff.uid).get()).exists,
    'MAPPING_FAILURE:A08_STAFF_REFERENCE_NOT_PERSISTED');
  browser=await chromium.launch({headless:true});
  for(const own of [gt,hn]){
    const other=own.label==='GT_MURGA'?hn:gt;
    const session=await signedShopper(auth,own.member,own.label);
    try{
      const ownResult=await firestoreProbe(session.page,
        'tenants/'+TENANT+'/shoppers/'+own.member.shopperId);
      const otherResult=await firestoreProbe(session.page,
        'tenants/'+TENANT+'/shoppers/'+other.member.shopperId);
      const staffResult=await firestoreProbe(session.page,
        'tenants/'+TENANT+'/users/'+staff.uid);
      const proof={caseId:own.label,signedCustomTokenRole:'shopper',
        ownProfileGet:ownResult,crossShopperProfileGet:otherResult,
        staffMembershipGet:staffResult,hrRevision:result.observedHrRevision};
      result.keeperProof.push(proof);
      assert(ownResult.outcome==='READ_ALLOWED'&&ownResult.exists===true,
        'AUTH_FAILURE:A08_OWN_PROFILE_READ_DENIED',{caseId:own.label,outcome:ownResult.outcome});
      assert(otherResult.outcome==='permission-denied',
        'AUTH_FAILURE:A08_CROSS_SHOPPER_PROFILE_NOT_DENIED',
        {caseId:own.label,outcome:otherResult.outcome});
      assert(staffResult.outcome==='permission-denied',
        'AUTH_FAILURE:A08_STAFF_MEMBERSHIP_NOT_DENIED',
        {caseId:own.label,outcome:staffResult.outcome});
    }finally{await session.context.close().catch(()=>{});}
  }
  result.hrSnapshotLinkage={liveKeeperRevisionConsistent:true,
    sameAsHistoricalMaterialization:result.observedHrRevision===SEALED_HR};
  result.decision='PASS_I3_A08_SCOPED_FIRESTORE_DENIALS_AUTH_TRIAGE';
  result.gate='HOLD';
  result.remaining=['three exception ordinary-password login outcomes',
    'uncovered API operation-by-role denials','real cross-shopper Storage object denial'];
  if(!result.hrSnapshotLinkage.sameAsHistoricalMaterialization)
    result.remaining.push('live HR revision requires fresh same-revision acceptance, not historical snapshot carryover');
}catch(error){
  result.decision='HOLD_I3_A08_SCOPED_FIRESTORE_DENIALS_AUTH_TRIAGE';
  result.failureCode=knownError(error);
  result.failureDetailFingerprint=fp(error?.message||error);
  process.exitCode=1;
}finally{
  if(browser)await browser.close().catch(()=>{});
  save();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
