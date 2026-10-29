#!/usr/bin/env node
/* CXOrbia I3 S1: read-only authenticated Shopper marketplace comparison.
 * Exactly the A2BE DEV Preview. No profile, HR, Auth or Firestore mutations.
 * The only sign-in is an ephemeral custom token inside the test browser.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis',PERIOD='cinepolis-2026-10';
const ROOT='https://cxorbia-backend-dev--i3-a2be-40833285318-rlxwpgjo.web.app';
const HR_REV='4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a';
const UID_FP='153519d08665bfbb8469',CANON_FP='ea0cffb5ee5c3074b8df';
const OUT=String(process.env.CX_I3_S1_OUT||'.tmp/cxorbia-i3-s1-shopper-marketplace');
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=(kind,v)=>sha(kind+':'+v).slice(0,20);
const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const save=o=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(`${OUT}/result.json`,JSON.stringify(o,null,2)+'\n');};
const result={schemaVersion:'cxorbia.i3.s1.shopper-marketplace.readonly.v1',environment:'DEV',production:false,
  sourceSha:'a2be5a77a4c0008ec374c17f42d5da27070e1ed6',previewUrl:ROOT,
  decision:'HOLD',readOnly:true,authWrites:0,firestoreWrites:0,hrWrites:0,
  providerWrites:0,deployments:0,profileChanges:0};
save(result);
let browser;
try{
  assert(process.env.CX_I3_S1_MODE==='A2BE_GT_SHOPPER_READONLY','AUTHORIZATION_GATE');
  assert(process.env.GOOGLE_CLOUD_PROJECT===PROJECT||process.env.GCLOUD_PROJECT===PROJECT,'DEV_PROJECT_GUARD');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore(),users=db.collection('tenants').doc(TENANT).collection('users');
  const members=(await users.get()).docs.filter(d=>fp('uid',d.id)===UID_FP);
  assert(members.length===1,'R026_KEEPER_UID_NOT_UNIQUE');
  const m=members[0].data()||{},canonical=m.shopperId||'',uid=members[0].id;
  assert(fp('sid',canonical)===CANON_FP&&m.active===true&&m.role==='shopper'&&
    m.authNamespace==='shopper'&&m.tenantId===TENANT&&Array.isArray(m.projectIds)&&
    m.projectIds.includes(PROGRAM),'R026_KEEPER_CANONICAL_MEMBERSHIP_DRIFT');
  const user=await auth.getUser(uid),claims=user.customClaims||{};
  assert(!user.disabled&&claims.shopperId===canonical&&claims.role==='shopper'&&
    claims.tenantId===TENANT&&claims.authNamespace==='shopper','R026_KEEPER_AUTH_DRIFT');
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const page=await context.newPage();
  await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'+
    '&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'+
    '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV',
    {waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth,null,{timeout:60000});
  await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
    await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(uid));
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(expected=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.role==='shopper'&&
    window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
    window.CX_PROTECTED_AUTH_HR_AUTHORITY?.sourceRevision===expected&&
    typeof window.CX?.router?.nav==='function',HR_REV,{timeout:120000});
  await page.evaluate(period=>{
    window.CX.data.setCurrentPeriod(period);
    window.CX.router.nav('visitas');
  },PERIOD);
  await page.waitForFunction(()=>document.body.innerText.includes('Visitas Disponibles')&&
    document.querySelector('#vList')!==null,null,{timeout:45000});
  const data=await page.evaluate(()=>{
    const d=window.CX.data,raw=Array.isArray(d._visitas)?d._visitas:[];
    const authorized=window.CX.router.resolveVisibleProjects('shopper')||[];
    const allowed=new Set(authorized.map(p=>d.programKey(p)));
    const programKeyOf=v=>{const pr=d.projects.find(x=>x.id===v.projectId)||
      d.projects.find(x=>d.programKey(x)===v.projectId);return pr?d.programKey(pr):v.projectId;};
    const scoped=raw.filter(v=>(!d.inScope||d.inScope(v.pais))&&allowed.has(programKeyOf(v))&&
      d.recordPeriodId(v)===d.currentPeriodId);
    const candidate=typeof d.availableVisits==='function'?d.availableVisits(scoped):scoped;
    const effectiveAvailable=v=>{
      if(!v||typeof v!=='object')return false;
      const status=String(v.estado||'').trim().toLowerCase();
      if(['asignada','agendada','realizada','cuestionario','submitida','liquidada','pagada','fuera_rango','cancelada','cancelled','archivada'].includes(status)||
        v.shopperId||v.agendada||v.realizada||v.cuestFecha||v.submit||v.submittedAt||v._archived||v.outOfRange===true||v.cancelled===true)return false;
      const f=typeof d.visitFacets==='function'?d.visitFacets(v):null;
      if(f&&typeof f.available==='boolean')return f.available===true&&f.eligibilityBlocked!==true&&
        !f.assigned&&!f.scheduled&&!f.realized&&!f.questionnaire&&!f.submitted&&!f.outOfRange&&!f.cancelled&&
        !f.liquidationConfirmed&&!f.paymentConfirmed;
      return status==='disponible';
    };
    const eligible=Array.isArray(candidate)?candidate.filter(v=>v&&
      (!d.inScope||d.inScope(v.pais))&&allowed.has(programKeyOf(v))&&
      d.recordPeriodId(v)===d.currentPeriodId&&effectiveAvailable(v)):[];
    // Source facet `available=true` is only a first-level signal. Explain why
    // records do not meet the complete anti-duplicate/terminal offer predicate,
    // without disclosing individual visit identifiers, addresses or shoppers.
    const initiallyAvailable=scoped.filter(v=>{const f=d.visitFacets?.(v);
      return f&&typeof f.available==='boolean'
        ?f.available===true&&f.eligibilityBlocked!==true
        :String(v?.estado||'').toLowerCase()==='disponible'&&!v?.shopperId;});
    const exclusionReasons=initiallyAvailable.filter(v=>!effectiveAvailable(v)).map(v=>{
      const f=d.visitFacets?.(v)||{},r=[];
      const terminal=['asignada','agendada','realizada','cuestionario','submitida',
        'liquidada','pagada','fuera_rango','cancelada','cancelled','archivada'];
      if(terminal.includes(String(v.estado||'').trim().toLowerCase()))r.push('terminal_status');
      if(v.shopperId)r.push('raw_shopper_assigned');
      if(v.agendada)r.push('raw_scheduled');
      if(v.realizada)r.push('raw_realized');
      if(v.cuestFecha)r.push('raw_questionnaire');
      if(v.submit||v.submittedAt)r.push('raw_submitted');
      if(v._archived||v.cancelled===true)r.push('raw_cancelled');
      if(v.outOfRange===true)r.push('raw_out_of_range');
      for(const key of ['assigned','scheduled','realized','questionnaire','submitted',
        'outOfRange','cancelled','liquidationConfirmed','paymentConfirmed']){
        if(f[key]===true)r.push('facet_'+key);
      }
      if(f.eligibilityBlocked===true)r.push('facet_eligibility_blocked');
      return r.length?r:['unexplained_status_facet_conflict'];
    });
    const vList=document.querySelector('#vList'),cards=vList?.querySelectorAll('.card.hov')?.length??-1;
    const text=document.body.innerText,match=text.match(/(\d+) oportunidades en (\d+) proyecto\(s\)/);
    return {sessionRole:window.CX.session.role,sourceRevision:window.CX_PROTECTED_AUTH_HR_AUTHORITY.sourceRevision,
      country:window.CX_PROTECTED_AUTH_HR_AUTHORITY.shopperCountry||'',
      period:d.currentPeriodId,totalHrVisits:raw.length,authorizedPrograms:allowed.size,
      scopeRows:scoped.length,providerCandidates:Array.isArray(candidate)?candidate.length:null,
      initiallyAvailableSourceRows:initiallyAvailable.length,
      excludedInitialRows:exclusionReasons.length,exclusionReasons,
      eligibleSourceRows:eligible.length,renderedOpportunityCards:cards,
      headingVisible:text.includes('Visitas Disponibles'),displayedOpportunityCount:match?Number(match[1]):null,
      emptyMessageVisible:!!vList?.innerText?.includes('Sin visitas disponibles'),
      activeView:window.CX.session.view||null};
  });
  result.data=data;result.browserRoleVerified=data.sessionRole==='shopper';
  result.consistentWithSource=data.sourceRevision===HR_REV&&data.country==='GT'&&data.period===PERIOD;
  result.renderedMatchesEligible=data.eligibleSourceRows===data.renderedOpportunityCards&&
    data.eligibleSourceRows===data.displayedOpportunityCount&&data.headingVisible===true&&
    (data.eligibleSourceRows===0||data.emptyMessageVisible===false);
  result.decision=result.browserRoleVerified&&result.consistentWithSource&&result.renderedMatchesEligible
    ?'PASS_S1_SHOPPER_UI_MATCHES_HR_SCOPE':'FAIL_S1_SHOPPER_UI_AVAILABLE_COUNT_MISMATCH';
  save(result);console.log(JSON.stringify({decision:result.decision,data,readOnly:true,production:false}));
  if(result.decision.startsWith('FAIL'))process.exitCode=3;
  await context.close();
}catch(e){result.decision='HOLD_S1_SHOPPER_READONLY';result.errorCode=String(e?.message||e).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,130);
  save(result);console.error(JSON.stringify({decision:result.decision,errorCode:result.errorCode}));process.exitCode=2;
}finally{try{await browser?.close();}catch{}}
