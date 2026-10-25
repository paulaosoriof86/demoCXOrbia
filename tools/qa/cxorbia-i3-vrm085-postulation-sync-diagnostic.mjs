import fs from 'node:fs';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const OUT=String(process.env.VRM085_OUT||'').trim();
const ROOT=String(process.env.VRM085_ROOT||'').replace(/\/$/,'');
const SOURCE=String(process.env.VRM085_SOURCE||'').trim();
const TARGET_FILE=String(process.env.VRM085_TARGET_HR_FILE||'').trim();
const HUMAN_FILE=String(process.env.VRM085_HUMAN_FILE||'').trim();
const TARGET_REV=String(process.env.VRM085_TARGET_HR_REVISION||'').trim();
if(!OUT||!ROOT||!SOURCE||!TARGET_FILE||!HUMAN_FILE||!TARGET_REV)throw new Error('ENVIRONMENT_FAILURE:VRM085_ENV_MISSING');
fs.mkdirSync(OUT,{recursive:true});
const target=JSON.parse(fs.readFileSync(TARGET_FILE,'utf8'));
const human=JSON.parse(fs.readFileSync(HUMAN_FILE,'utf8'));
const targetRev=String(target?._runtime?.revision||target?.sourceRevision||'');
if(targetRev!==TARGET_REV)throw new Error('SOURCE_FAILURE:VRM085_TARGET_HR_REVISION:'+targetRev);
if(String(human?.decision||'')!=='PASS_I3_HUMAN_LIVE_ACCEPTANCE'||String(human?.sourceRevision||'')!==TARGET_REV)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM085_RUN574_HUMAN_EVIDENCE');

const tenantId='tya',projectId='cinepolis',periodId='cinepolis-2026-09';
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime='+PROTECTED+'&cxHumanFullVisual='+FULL;
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const authExists=async m=>{try{await auth.getUser(m.id);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}};
let admin=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){
  if(await authExists(m)){admin=m;break;}
}
if(!admin)throw new Error('AUTH_FAILURE:VRM085_ADMIN_PRINCIPAL_MISSING');

const browser=await chromium.launch({headless:true});
const result={
  schemaVersion:'cxorbia.i3.vrm085.same-revision-postulation-sync-forensic.v1',
  decision:'HOLD',
  sourceSha:SOURCE,
  targetHrRevision:TARGET_REV,
  run574HumanAcceptance:String(human.decision||''),
  production:false,readOnly:true,builds:0,deploys:0,firestoreWrites:0,authWrites:0,hrWrites:0,externalWrites:0,
  rows:[],summary:null
};

try{
  const ctx=await browser.newContext({viewport:{width:1440,height:980}});
  const page=await ctx.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e)));
  let settled=false;
  for(let attempt=1;attempt<=5&&!settled;attempt++){
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
    const token=await auth.createCustomToken(admin.id);
    await page.evaluate(async t=>{const fb=window.firebase;await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);await fb.auth().signInWithCustomToken(t);},token).catch(()=>{});
    await page.waitForLoadState('domcontentloaded',{timeout:90000}).catch(()=>{});
    const uid=await page.evaluate(()=>String(window.firebase?.auth?.().currentUser?.uid||'')).catch(()=> '');
    settled=uid===String(admin.id);
    if(!settled)await page.waitForTimeout(1000*attempt);
  }
  if(!settled)throw new Error('AUTH_FAILURE:VRM085_ADMIN_SESSION_NOT_SETTLED');
  await page.goto('about:blank');
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(admin.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({tenantId,projectId,periodId,targetRev})=>{
    const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
    return c.authenticated===true&&c.tenantId===tenantId&&String(c.role||'').toLowerCase()!=='shopper'
      &&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true
      &&String(d.currentProjectId||'')===projectId&&String(d.currentPeriodId||'')===periodId
      &&String(d.previewMeta?.sourceRevision||'')===targetRev;
  },{tenantId,projectId,periodId,targetRev:TARGET_REV},{timeout:120000});
  await page.evaluate(()=>window.CX.router.nav('postulaciones',{history:false}));
  await page.waitForTimeout(900);

  const browserEvidence=await page.evaluate(({periodId})=>{
    const d=window.CX?.data||{};
    const periodPosts=(d._posts||[]).filter(x=>String(d.recordPeriodId?d.recordPeriodId(x):(x.periodId||x.projectId)||'')===String(periodId));
    const visits=d._visitas||[];
    const identityMap=d.__identityMap&&typeof d.__identityMap==='object'?d.__identityMap:{};
    const stateRaw=x=>String(x?.estado||x?.status||'').toLowerCase();
    const postId=x=>String(x?.id||x?.applicationId||x?.postulationId||'');
    const visitId=x=>String(x?.visitId||x?.visitaId||'');
    const hrRowId=x=>String(x?.hrRowId||'');
    const strongCandidates=x=>{
      const vk=visitId(x),hk=hrRowId(x);
      return visits.filter(v=>(vk&&[v?.id,v?.visitId].some(k=>String(k||'')===vk))||(hk&&String(v?.hrRowId||'')===hk));
    };
    const focalCandidates=x=>{
      const vk=visitId(x);
      return visits.filter(v=>vk&&String(v?.id||v?.visitId||'')===vk);
    };
    const moduleState=(x,v)=>{
      const state=stateRaw(x),appShopper=String(x?.shopperId||''),visitShopper=String(v?.shopperId||'');
      if(state==='pendiente')return'pending_review';
      if(state!=='aprobada')return state||'unknown';
      if(v?.assignmentReviewRequired===true||v?.assignmentReviewReason==='hr_platform_assignment_conflict')return'conflict_review_required';
      if(v&&appShopper&&visitShopper&&visitShopper!==appShopper)return'conflict_review_required';
      if(v?.assignmentSource==='platform'&&v?.assignmentSyncStatus==='pending_hr')return'platform_pending_hr_sync';
      if(v&&appShopper&&visitShopper===appShopper)return'assigned_confirmed';
      return'approved_assignment_review';
    };
    const focalState=(x,v)=>{
      const state=stateRaw(x),appShopper=String(x?.shopperId||''),visitShopper=String(v?.shopperId||'');
      if(state==='pendiente')return'pending_review';
      if(state!=='aprobada')return state||'unknown';
      if(v?.assignmentReviewRequired===true||v?.assignmentReviewReason==='hr_platform_assignment_conflict')return'conflict_review_required';
      if(v?.assignmentSource==='platform'&&v?.assignmentSyncStatus==='pending_hr')return'platform_pending_hr_sync';
      if(v&&appShopper&&visitShopper===appShopper)return'assigned_confirmed';
      return'approved_assignment_review';
    };
    const domState=id=>{
      const el=[...document.querySelectorAll('[data-pid]')].find(n=>String(n.getAttribute('data-pid')||'')===String(id||''));
      return el?{sync:String(el.getAttribute('data-post-sync')||''),text:String(el.innerText||'').replace(/\s+/g,' ').trim().slice(0,600)}:null;
    };
    const row=x=>{
      const sc=strongCandidates(x),fc=focalCandidates(x),sv=sc[0]||null,fv=fc[0]||null,id=postId(x);
      const postShopper=String(x?.shopperId||''),visitShopper=String(sv?.shopperId||'');
      return{
        postulationId:id,visitId:visitId(x),hrRowId:hrRowId(x),pais:String(x?.pais||sv?.pais||''),sucursal:String(sv?.sucursal||x?.sucursal||x?.branch||''),
        postState:stateRaw(x),postShopperId:postShopper,postCanonicalShopperId:String(identityMap[postShopper]||postShopper),
        visitShopperId:visitShopper,visitCanonicalShopperId:String(identityMap[visitShopper]||visitShopper),
        assignmentReviewRequired:sv?.assignmentReviewRequired===true,assignmentReviewReason:String(sv?.assignmentReviewReason||''),
        assignmentSource:String(sv?.assignmentSource||''),assignmentSyncStatus:String(sv?.assignmentSyncStatus||''),
        strongCandidateCount:sc.length,strongCandidateIds:sc.map(v=>String(v?.id||v?.visitId||'')),
        focalCandidateCount:fc.length,focalCandidateIds:fc.map(v=>String(v?.id||v?.visitId||'')),
        moduleSyncState:moduleState(x,sv),focalSyncState:focalState(x,fv),dom:domState(id)
      };
    };
    return{
      currentProjectId:String(d.currentProjectId||''),currentPeriodId:String(d.currentPeriodId||''),sourceRevision:String(d.previewMeta?.sourceRevision||''),
      periodPostCount:periodPosts.length,approvedCount:periodPosts.filter(x=>stateRaw(x)==='aprobada').length,pendingCount:periodPosts.filter(x=>stateRaw(x)==='pendiente').length,
      approved:periodPosts.filter(x=>stateRaw(x)==='aprobada').map(row),
      pending:periodPosts.filter(x=>stateRaw(x)==='pendiente').map(row)
    };
  },{periodId});

  if(pageErrors.length)throw new Error('FUNCTIONAL_DEFECT:VRM085_PAGE_ERRORS:'+JSON.stringify(pageErrors));
  if(browserEvidence.sourceRevision!==TARGET_REV)throw new Error('SOURCE_FAILURE:VRM085_BROWSER_NOT_RUN574_REVISION:'+browserEvidence.sourceRevision);
  if(browserEvidence.periodPostCount!==12||browserEvidence.approvedCount!==6||browserEvidence.pendingCount!==6)throw new Error('MAPPING_FAILURE:VRM085_POSTULATION_CARDINALITY:'+JSON.stringify({periodPostCount:browserEvidence.periodPostCount,approvedCount:browserEvidence.approvedCount,pendingCount:browserEvidence.pendingCount}));

  const targetVisits=arr(target.visits);
  const humanRaw=JSON.stringify(human);
  result.rows=browserEvidence.approved.map(r=>{
    const hc=targetVisits.filter(v=>(r.visitId&&[v?.id,v?.visitId].some(k=>String(k||'')===r.visitId))||(r.hrRowId&&String(v?.hrRowId||'')===r.hrRowId));
    const h=hc[0]||null,hrShopper=str(h?.shopperId),hrCanonical=hrShopper;
    return {...r,
      targetHrCandidateCount:hc.length,
      targetHr:{visitId:str(h?.id||h?.visitId),hrRowId:str(h?.hrRowId),pais:str(h?.pais||h?.country),sucursal:str(h?.sucursal),shopperId:hrShopper,assignmentSource:str(h?.assignmentSource),assignmentSyncStatus:str(h?.assignmentSyncStatus),reviewRequired:h?.reviewRequired===true,reviewReasons:arr(h?.reviewReasons).map(str)},
      targetHrShopperDiffersFromPost:!!(hrShopper&&r.postShopperId&&hrCanonical!==r.postShopperId),
      humanAcceptanceMentionsPostulationId:!!(r.postulationId&&humanRaw.includes(r.postulationId))
    };
  });

  const exactSix=result.rows.length===6;
  const uniquePostIds=new Set(result.rows.map(r=>r.postulationId).filter(Boolean)).size===6;
  const uniqueTargetVisits=result.rows.every(r=>r.targetHrCandidateCount===1);
  const domAllConflict=result.rows.every(r=>r.dom?.sync==='conflict_review_required');
  const moduleAllConflict=result.rows.every(r=>r.moduleSyncState==='conflict_review_required');
  const focalAllApprovedReview=result.rows.every(r=>r.focalSyncState==='approved_assignment_review');
  const noReviewConflictFlags=result.rows.every(r=>r.assignmentReviewRequired!==true&&r.assignmentReviewReason!=='hr_platform_assignment_conflict');
  const ownershipMismatchAll=result.rows.every(r=>r.postShopperId&&r.visitShopperId&&r.postShopperId!==r.visitShopperId);
  const targetOwnershipMismatchAll=result.rows.every(r=>r.targetHr?.shopperId&&r.postShopperId&&r.targetHr.shopperId!==r.postShopperId);
  const noDuplicateCandidates=result.rows.every(r=>r.strongCandidateCount===1&&r.targetHrCandidateCount===1);
  const step10SameRowCoverage=result.rows.every(r=>r.humanAcceptanceMentionsPostulationId===true);

  result.summary={
    exactSix,uniquePostIds,uniqueTargetVisits,domAllConflict,moduleAllConflict,focalAllApprovedReview,noReviewConflictFlags,
    ownershipMismatchAll,targetOwnershipMismatchAll,noDuplicateCandidates,
    humanStep10SameRowSemanticCoverage:step10SameRowCoverage,
    rootCause:'FOCAL_SYNC_STATE_RULE_OMITS_EXACT_HR_OWNERSHIP_MISMATCH_BRANCH_PRESENT_IN_APPROVED_VRM077_PRODUCT_CONTRACT',
    provenOwner:'tools/qa/cxorbia-pre-i4-focal-remote-browser.mjs',
    productDefect:false,
    classification:'RELEASE_COMPOSITION_FAILURE',
    correctionScope:'control-only'
  };
  if(!(exactSix&&uniquePostIds&&uniqueTargetVisits&&domAllConflict&&moduleAllConflict&&focalAllApprovedReview&&noReviewConflictFlags&&ownershipMismatchAll&&targetOwnershipMismatchAll&&noDuplicateCandidates&&!step10SameRowCoverage)){
    throw new Error('MAPPING_FAILURE:VRM085_OWNER_NOT_FULLY_PROVEN:'+JSON.stringify(result.summary));
  }
  result.decision='PASS_VRM085_CONTROL_FALSE_NEGATIVE_PROVEN';
  fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
  fs.writeFileSync(OUT+'/rows.json',JSON.stringify(result.rows,null,2)+'\n');
  fs.writeFileSync(OUT+'/target-hr.sha256',sha(fs.readFileSync(TARGET_FILE))+'  hr-current-live.json\n');
  await ctx.close();
}catch(error){
  result.decision='FAIL_VRM085_FORENSIC_DIAGNOSTIC';
  result.error=String(error?.message||error||'unknown').slice(0,3000);
  fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
  throw error;
}finally{
  await browser.close();
}
