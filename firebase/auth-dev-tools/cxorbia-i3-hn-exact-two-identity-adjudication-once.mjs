#!/usr/bin/env node
// Explicit human-authorized, one-shot DEV adjudication of two exact HN accounts.
// Fail closed before any write if either identity, HR history, credential keeper,
// or alias-owned visit topology has drifted. No direct Auth/Firestore mutations:
// the existing authenticated CXOrbia provider performs all protected writes.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import {CREDENTIAL_PASSWORD_PROOF_VERSION} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis',PERIOD='cinepolis-2026-10';
const ROOT='https://cxorbia-backend-dev.web.app';
const OUT=String(process.env.CX_HN_ADJUDICATION_OUT||'.tmp/i3-hn-exact-two-adjudication');
const EXECUTION=String(process.env.CX_HN_EXACT_EXECUTION||'');
const AUTHORIZATION='PAULA_APPROVED_2026-10-28_TWO_EXACT_HN_DEV_IDENTITIES_ONLY';
// Fingerprints are frozen from the prior approved, read-only Auth + HR evidence.
// Resolve every real ID inside DEV. Do not put names, visible logins, UIDs or
// profile IDs into public source, run logs or uploaded evidence artifacts.
const targets=Object.freeze([
  Object.freeze({caseId:'HN_CASE_B',uidFp:'3ccba2b9a16d3ac0adf4',loginFp:'27ce81067e5bd3a2604633f5',aliasFp:'b8743b6e9316d2712342',canonicalFp:'c67d90db289483efdf98',historical:17}),
  Object.freeze({caseId:'HN_CASE_A',uidFp:'9f9b592767922cd3ed39',loginFp:'82d6a1369b5dbb8f9bc931d0',aliasFp:'5d849fd61946efa8d819',canonicalFp:'d955842b0919c2b83141',historical:9})
]);
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=v=>sha(v).slice(0,20);
const sid=v=>str(v?.shopperId||v?.id);
const country=v=>str(v?.pais||v?.country||v?.país).toUpperCase();
const hn=v=>['HN','HONDURAS'].includes(country(v));
const digits=v=>str(v).replace(/[^\d]/g,'');
const phone=v=>digits(v?.whatsapp||v?.phone||v?.telefono);
const norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const assert=(condition,code)=>{if(!condition)throw new Error(code);};
const result={schemaVersion:'cxorbia.i3.hn.exact.two-adjudications.v1',decision:'HOLD',scope:'TWO_EXACT_HN_DEV_ONLY',
  project:PROJECT,tenant:TENANT,program:PROGRAM,production:false,directAuthWrites:0,directFirestoreWrites:0,
  hrWrites:0,externalWrites:0,deployments:0,providerAck:false,readback:false,cases:[]};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(`${OUT}/result.json`,JSON.stringify(result,null,2)+'\n','utf8');
save();
assert(EXECUTION===AUTHORIZATION,'AUTHORIZATION_GATE_MISSING');
assert(process.env.GCLOUD_PROJECT===PROJECT||process.env.GOOGLE_CLOUD_PROJECT===PROJECT,'DEV_PROJECT_GUARD');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),users=tenant.collection('users');
const profiles=tenant.collection('shoppers'),cross=tenant.collection('shopperIdentityCrosswalk');
const project=tenant.collection('projects').doc(PROGRAM);
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId',
  'ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];
const domains=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],
  ['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const domainRows={};

async function resolveExactlyTwoTargets(){
  const authUsers=[];let token;
  do{const page=await auth.listUsers(1000,token);authUsers.push(...page.users);token=page.pageToken;}while(token);
  const profilesInTenant=(await profiles.get()).docs;
  const rows=[];
  for(const t of targets){
    const u=authUsers.filter(x=>fp('uid:'+x.uid)===t.uidFp);
    const a=profilesInTenant.filter(x=>fp('sid:'+x.id)===t.aliasFp);
    const c=profilesInTenant.filter(x=>fp('sid:'+x.id)===t.canonicalFp);
    assert(u.length===1&&a.length===1&&c.length===1,'TECHNICAL_FINGERPRINT_NOT_UNIQUE_'+t.caseId);
    const member=await users.doc(u[0].uid).get(),login=str(member.data()?.visibleLogin);
    assert(member.exists&&sha(norm(login)).slice(0,24)===t.loginFp,'LOGIN_FINGERPRINT_DRIFT_'+t.caseId);
    rows.push({...t,uid:u[0].uid,alias:a[0].id,canonical:c[0].id,login});
  }
  assert(new Set(rows.map(x=>x.uid)).size===2&&new Set(rows.map(x=>x.alias)).size===2&&
    new Set(rows.map(x=>x.canonical)).size===2,'TWO_TARGETS_NOT_DISTINCT');
  return rows;
}

async function hrSnapshot(tag){
  const response=await fetch(`${ROOT}/api/${TENANT}/${PROGRAM}/hr-live?format=json&hnexact=${tag}-${Date.now()}`,{
    headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
  assert(response.ok,'HR_PROVIDER_HTTP_'+response.status);
  const body=await response.json(),snapshot=body.snapshot||body.data||body;
  const revision=str(body.revision||body._runtime?.revision||snapshot.sourceRevision);
  assert(/^[a-f0-9]{64}$/.test(revision),'HR_REVISION_UNPROVEN');
  return {revision,shoppers:arr(snapshot.shoppers),visits:arr(snapshot.visits)};
}
function verifyHr(row,hr){
  const matches=hr.shoppers.filter(p=>sid(p)===row.canonical);
  const history=hr.visits.filter(v=>sid(v)===row.canonical);
  assert(matches.length===1&&hn(matches[0]),'HR_CANONICAL_UNIQUE_HN_'+row.caseId);
  assert(history.length===row.historical,'HR_HISTORIC_DRIFT_'+row.caseId);
  assert(history.every(hn),'HR_HISTORY_COUNTRY_DRIFT_'+row.caseId);
  return {owner:matches[0],historicalRows:history.length};
}
async function activeMembers(shopperId){
  const snap=await users.where('shopperId','==',shopperId).get();
  return snap.docs.filter(d=>{const m=d.data()||{};
    return m.active===true&&str(m.tenantId)===TENANT&&str(m.role)==='shopper'&&
      str(m.authNamespace)==='shopper'&&arr(m.projectIds).includes(PROGRAM);
  });
}
async function domainBaseline(){
  for(const [scope,name] of domains){
    const col=scope==='tenant'?tenant.collection(name):project.collection(name);
    domainRows[`${scope}/${name}`]=(await col.get()).docs.map(d=>({id:d.id,data:d.data()||{}}));
  }
}
async function freshAliasDomainCounts(alias){
  const counts={};
  for(const [scope,name] of domains){
    const col=scope==='tenant'?tenant.collection(name):project.collection(name);
    const rows=(await col.get()).docs;
    counts[`${scope}/${name}`]=rows.filter(d=>ownerFields.some(k=>str((d.data()||{})[k])===alias)||
      ownerArrays.some(k=>arr((d.data()||{})[k]).some(v=>str(v)===alias))).length;
  }
  return counts;
}
function aliasDomainCounts(alias){
  const counts={};
  for(const [collection,rows] of Object.entries(domainRows)){
    const hit=rows.filter(({data})=>ownerFields.some(k=>str(data[k])===alias)||
      ownerArrays.some(k=>arr(data[k]).some(v=>str(v)===alias)));
    counts[collection]=hit.length;
  }
  return counts;
}
async function preflight(row,hr){
  const authority=verifyHr(row,hr);
  const [aliasProfile,canonProfile,aliasCross,canonCross,keeperMembers,canonMembers,keeperAuth]=await Promise.all([
    profiles.doc(row.alias).get(),profiles.doc(row.canonical).get(),cross.doc(row.alias).get(),cross.doc(row.canonical).get(),
    activeMembers(row.alias),activeMembers(row.canonical),auth.getUser(row.uid)
  ]);
  assert(aliasProfile.exists&&canonProfile.exists,'IDENTITY_PROFILE_MISSING_'+row.caseId);
  assert(aliasCross.exists&&canonCross.exists,'IDENTITY_CROSSWALK_MISSING_'+row.caseId);
  assert(keeperMembers.length===1&&keeperMembers[0].id===row.uid,'IDENTITY_KEEPER_MEMBERSHIP_DRIFT_'+row.caseId);
  assert(canonMembers.length===1&&canonMembers[0].id!==row.uid,'IDENTITY_CANONICAL_MEMBERSHIP_DRIFT_'+row.caseId);
  const m=keeperMembers[0].data()||{},ap=aliasProfile.data()||{},cp=canonProfile.data()||{};
  const claims=keeperAuth.customClaims||{};
  assert(str(keeperAuth.email).endsWith('@auth.cxorbia.invalid'),
    'IDENTITY_KEEPER_AUTH_NAMESPACE_EMAIL_'+row.caseId);
  assert(!keeperAuth.disabled&&str(claims.shopperId)===row.alias&&str(claims.tenantId)===TENANT&&
    str(claims.role)==='shopper'&&str(claims.authNamespace)==='shopper'&&arr(claims.projectIds).includes(PROGRAM),
    'IDENTITY_KEEPER_AUTH_CLAIMS_DRIFT_'+row.caseId);
  assert(str(m.visibleLogin).toLowerCase()===row.login&&str(m.credentialState)==='enrolled',
    'IDENTITY_KEEPER_LOGIN_DRIFT_'+row.caseId);
  assert(str(m.credentialPasswordProofVersion||ap.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION,
    'IDENTITY_KEEPER_PASSWORD_PROOF_MISSING_'+row.caseId);
  assert(str(cp.shopperId||cp.id)===row.canonical&&str(cp.sourceType)==='hr_external'&&hn(cp),
    'IDENTITY_CANONICAL_PROFILE_DRIFT_'+row.caseId);
  assert(hn(ap)&&!!phone(ap)&&phone(ap)===phone(cp)&&phone(cp)===phone(authority.owner),
    'IDENTITY_CONTACT_CORROBORATION_DRIFT_'+row.caseId);
  assert(str((aliasCross.data()||{}).shopperId)===row.alias&&str((canonCross.data()||{}).shopperId)===row.canonical,
    'IDENTITY_CROSSWALK_CHANGED_'+row.caseId);
  const secondaryAuth=await auth.getUser(canonMembers[0].id),secondaryClaims=secondaryAuth.customClaims||{};
  assert(!secondaryAuth.disabled&&str(secondaryClaims.shopperId)===row.canonical&&
    str(secondaryClaims.tenantId)===TENANT&&str(secondaryClaims.role)==='shopper'&&
    str(secondaryClaims.authNamespace)==='shopper'&&arr(secondaryClaims.projectIds).includes(PROGRAM)&&
    str(secondaryAuth.email).endsWith('@auth.cxorbia.invalid'),
    'IDENTITY_SECONDARY_PRINCIPAL_UNSAFE_'+row.caseId);
  // The provider will disable the duplicate canonical technical principal.
  // Do not retire a principal with a recent independent sign-in.
  const secondarySignInRaw=str(secondaryAuth.metadata?.lastSignInTime);
  const lastSecondarySignIn=Date.parse(secondarySignInRaw);
  assert(!secondarySignInRaw||Number.isFinite(lastSecondarySignIn),
    'IDENTITY_SECONDARY_SIGNIN_AGE_UNVERIFIABLE_'+row.caseId);
  assert(!Number.isFinite(lastSecondarySignIn)||Date.now()-lastSecondarySignIn>7*24*3600*1000,
    'IDENTITY_SECONDARY_PRINCIPAL_RECENT_LOGIN_REVIEW_REQUIRED_'+row.caseId);
  const counts=aliasDomainCounts(row.alias);
  assert(counts['project/visits']===0,'IDENTITY_ALIAS_OWNED_VISITS_NEED_EXACT_REVIEW_'+row.caseId);
  assert(Object.values(counts).reduce((a,b)=>a+b,0)<=70,'IDENTITY_DOMAIN_BUDGET_'+row.caseId);
  const otherLinks=(await tenant.collection('shopperIdentityLinks').get()).docs.filter(d=>{
    const l=d.data()||{},ids=[l.canonicalShopperId,l.sourceShopperId,...arr(l.exactAliases)].map(str);
    return ids.includes(row.alias)&&['active','confirmed','approved','materialized'].includes(str(l.status||l.state).toLowerCase())&&
      !ids.includes(row.canonical);
  });
  assert(otherLinks.length===0,'IDENTITY_ALIAS_TRUSTED_LINK_CONFLICT_'+row.caseId);
  return {caseId:row.caseId,uidFingerprint:fp('uid:'+row.uid),keeperAliasFingerprint:fp('sid:'+row.alias),
    canonicalFingerprint:fp('sid:'+row.canonical),historyBefore:authority.historicalRows,
    activeKeeperUid:row.uid,secondaryUid:canonMembers[0].id,
    secondaryUidFingerprint:fp('uid:'+canonMembers[0].id),keeperEmailFingerprint:fp('email:'+str(keeperAuth.email)),
    keeperVisibleLoginFingerprint:sha(norm(row.login)).slice(0,24),keeperProof:true,domainAliasReferences:counts,
    canonicalProfileExists:true,keeperAuthEnabled:true,preflight:'PASS'};
}
function receiptId(key){return sha(TENANT+'\0'+PROGRAM+'\0'+PERIOD+'\0'+key).slice(0,40);}
async function readback(row,before,ack,hrRevision){
  const [keeperAuth,secondaryAuth,keeperDoc,canonicalMembers,aliases,cp,ap,cw,aw,link,receipt]=await Promise.all([
    auth.getUser(row.uid),auth.getUser(before.secondaryUid),users.doc(row.uid).get(),activeMembers(row.canonical),
    activeMembers(row.alias),profiles.doc(row.canonical).get(),profiles.doc(row.alias).get(),
    cross.doc(row.canonical).get(),cross.doc(row.alias).get(),tenant.collection('shopperIdentityLinks').doc(str(ack.identityLinkId)).get(),
    tenant.collection('commandReceipts').doc(receiptId(str(ack.idempotencyKey))).get()
  ]);
  const member=keeperDoc.data()||{},canon=cp.data()||{},alias=ap.data()||{},canonicalCross=cw.data()||{},aliasCross=aw.data()||{};
  const linked=link.data()||{},rd=receipt.data()||{};
  assert(!keeperAuth.disabled&&secondaryAuth.disabled,'READBACK_AUTH_KEEPER_OR_DUPLICATE_'+row.caseId);
  assert(str(keeperAuth.customClaims?.shopperId)===row.canonical&&str(member.shopperId)===row.canonical&&member.active===true,
    'READBACK_KEEPER_CANONICAL_'+row.caseId);
  assert(canonicalMembers.length===1&&canonicalMembers[0].id===row.uid&&aliases.length===0,'READBACK_MEMBERSHIP_'+row.caseId);
  assert(str(member.visibleLogin).toLowerCase()===row.login&&fp('email:'+str(keeperAuth.email))===before.keeperEmailFingerprint,
    'READBACK_CREDENTIAL_LOGIN_CHANGED_'+row.caseId);
  assert(cp.exists&&ap.exists&&str(canon.shopperId)===row.canonical&&
    str(alias.identityState)==='superseded_exact_alias'&&str(alias.supersededByShopperId)===row.canonical,
    'READBACK_PROFILE_ALIAS_'+row.caseId);
  assert(str(canonicalCross.shopperId)===row.canonical&&str(aliasCross.shopperId)===row.canonical,
    'READBACK_CROSSWALK_'+row.caseId);
  assert(link.exists&&str(linked.canonicalShopperId)===row.canonical&&arr(linked.exactAliases).length===1&&
    arr(linked.exactAliases)[0]===row.alias&&linked.humanConfirmed===true,'READBACK_IDENTITY_LINK_'+row.caseId);
  assert(receipt.exists&&str(rd.status)==='committed'&&rd.providerAck===true&&rd.identityConsolidated===true&&
    str(rd.commandType)==='shopper.identity.adjudicate','READBACK_COMMAND_RECEIPT_'+row.caseId);
  const hr=await hrSnapshot('post-'+row.caseId);
  assert(hr.revision===hrRevision,'READBACK_HR_REVISION_DRIFT_'+row.caseId);
  const authority=verifyHr(row,hr),residual=await freshAliasDomainCounts(row.alias);
  assert(Object.values(residual).every(n=>n===0),'READBACK_ALIAS_OPERATIONAL_RESIDUAL_'+row.caseId);
  return {providerAck:true,idempotentReplay:true,receiptId:receiptId(str(ack.idempotencyKey)),
    identityLinkId:str(ack.identityLinkId),keeperAuthEnabled:true,secondaryAccountDisabled:true,
    keeperUidFingerprint:fp('uid:'+row.uid),canonicalMemberships:1,activeAliasMemberships:0,
    canonicalFingerprint:fp('sid:'+row.canonical),aliasPreservedAsCrosswalk:true,historyCount:authority.historicalRows,
    originalLoginPreserved:true,hrRevision:hr.revision,hrWrites:0,externalWrites:0};
}

let browser=null;
try{
  const cases=await resolveExactlyTwoTargets();
  const hr=await hrSnapshot('before');
  result.hrRevision=hr.revision;
  await domainBaseline();
  const baselines=[];
  // Both must pass the entire authoritative preflight BEFORE either write.
  for(const row of cases)baselines.push(await preflight(row,hr));
  result.before=baselines.map(({secondaryUid,activeKeeperUid,...safe})=>safe);save();
  const hr2=await hrSnapshot('pre-commit');
  assert(hr2.revision===hr.revision,'HR_CHANGED_DURING_PREFLIGHT');
  for(const row of cases)verifyHr(row,hr2);
  const members=(await users.get()).docs.map(d=>({uid:d.id,...(d.data()||{})}));
  const staff=members.filter(m=>m.active===true&&str(m.role).toLowerCase()==='super'&&
    str(m.authNamespace).toLowerCase()==='staff').sort((a,b)=>a.uid.localeCompare(b.uid));
  let actor=null;
  for(const m of staff){try{const u=await auth.getUser(m.uid),c=u.customClaims||{};
    if(!u.disabled&&str(c.tenantId)===TENANT&&str(c.role).toLowerCase()==='super'&&
      str(c.authNamespace).toLowerCase()==='staff'){actor=m;break;}}catch{}}
  assert(actor,'AUTH_SUPER_OPERATOR_NOT_AVAILABLE');
  result.adminActorUidFingerprint=fp('uid:'+actor.uid);save();
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:950},serviceWorkers:'block'});
  const page=await context.newPage();
  await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+PROGRAM+
    '&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV',
    {waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:60000});
  await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
    await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(actor.uid));
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&
    String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&
    window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
    typeof window.CX?.commandAdapter?.execute==='function'&&
    typeof window.CX?.shopperAdminCommandContract?.identityAdjudicate==='function',null,{timeout:120000});
  await page.evaluate(period=>window.CX.data?.setCurrentPeriod?.(period),PERIOD);
  const ctxProof=await page.evaluate(()=>{const a=window.CX.backendAuth.context()||{},d=window.CX.data.ctx()||{};
    return {tenant:str(a.tenantId),role:str(a.role),namespace:str(a.authNamespace),
      project:str(d.projectId),period:str(d.periodId)};
    function str(x){return String(x??'').trim();}
  });
  assert(ctxProof.tenant===TENANT&&ctxProof.role==='super'&&ctxProof.namespace==='staff'&&
    ctxProof.project===PROGRAM&&ctxProof.period===PERIOD,'AUTH_PROTECTED_CONTEXT_DRIFT');
  result.adminContext=ctxProof;save();

  for(let i=0;i<cases.length;i++){
    const row=cases[i],before=baselines[i];
    const fresh=await hrSnapshot('before-'+row.caseId);
    assert(fresh.revision===hr.revision,'HR_CHANGED_BEFORE_COMMAND_'+row.caseId);
    verifyHr(row,fresh);
    // Explicit sentinel is valid in the provider's selective preservation API.
    // Preflight proved there are ZERO alias-owned project visits to transfer.
    const preserve=['__preserve_all_alias_visit_history__'];
    const key='i3-hn-20261028:'+sha([TENANT,PROGRAM,PERIOD,row.uid,row.alias,row.canonical,...preserve,hr.revision].join('\0')).slice(0,32);
    const pair=await page.evaluate(async x=>{
      const a=window.CX.backendAuth.context()||{};
      const built=window.CX.shopperAdminCommandContract.identityAdjudicate({
        tenantId:a.tenantId,projectId:x.projectId,periodId:x.periodId,
        projectIds:Array.isArray(a.projectIds)&&a.projectIds.length?a.projectIds:[x.projectId],
        actorId:a.actorId,actorRole:a.role,canonicalShopperId:x.canonical,aliasShopperIds:[x.alias],
        humanConfirmed:true,expectedVersion:'provider-current',idempotencyKey:x.key,
        reason:'paula_authorized_exact_HN_login_to_HR_identity_2026_10_28',
        keeperShopperId:x.alias,keeperAccessConfirmed:true,preserveHistoricalVisitRows:true,
        authoritativeVisitIds:x.preserve
      });
      if(!built?.ok)return {buildOk:false,errors:built?.errors||[]};
      const first=await window.CX.commandAdapter.execute(built.command);
      const replay=first?.ok===true?await window.CX.commandAdapter.execute(built.command):null;
      return {buildOk:true,first,replay};
    },{projectId:PROGRAM,periodId:PERIOD,canonical:row.canonical,alias:row.alias,key,preserve});
    assert(pair?.buildOk===true,'COMMAND_CONTRACT_INVALID_'+row.caseId);
    const ack=pair.first||{},replay=pair.replay||{};
    result.cases.push({caseId:row.caseId,canonicalFingerprint:fp('sid:'+row.canonical),keeperUidFingerprint:fp('uid:'+row.uid),
      providerResponse:{ok:ack.ok===true,providerAck:ack.providerAck===true,
        identityConsolidated:ack.identityConsolidated===true,code:str(ack.code||''),
        retiredPrincipalCount:Number(ack.retiredPrincipalCount||0),providerWrites:Number(ack.providerWrites||0),
        hrWrites:Number(ack.hrWrites||0),externalWrites:Number(ack.externalWrites||0),
        historicalVisitRowsPreserved:ack.historicalVisitRowsPreserved===true,
        authoritativeVisitCount:Number(ack.authoritativeVisitCount||0),idempotentReplay:replay.idempotentReplay===true}});
    save();
    assert(ack.ok===true&&ack.providerAck===true&&ack.identityConsolidated===true&&
      str(ack.canonicalShopperId||ack.entityId)===row.canonical&&
      JSON.stringify(uniq(ack.exactAliases))===JSON.stringify([row.alias])&&
      ack.historicalVisitRowsPreserved===true&&Number(ack.authoritativeVisitCount)===1&&
      Number(ack.retiredPrincipalCount)===1&&Number(ack.hrWrites||0)===0&&Number(ack.externalWrites||0)===0,
      'PROVIDER_ADJUDICATION_ACK_FAILED_'+row.caseId);
    assert(replay.ok===true&&replay.providerAck===true&&replay.idempotentReplay===true&&
      Number(replay.providerWrites||0)===0&&str(replay.idempotencyKey)===str(ack.idempotencyKey),
      'PROVIDER_REPLAY_FAILED_'+row.caseId);
    result.cases[i].durableReadback=await readback(row,before,ack,hr.revision);
    save();
  }
  result.decision='PASS_TWO_EXACT_HN_PROVIDER_ADJUDICATIONS';result.providerAck=true;result.readback=true;
  save();console.log(JSON.stringify(result));
}catch(error){result.decision='HOLD_OR_PARTIAL_EXACT_HN_ADJUDICATION';result.errorCode=str(error?.message||error).slice(0,180);
  save();console.error(JSON.stringify({decision:result.decision,errorCode:result.errorCode,completedCases:result.cases.length}));
  process.exitCode=2;
}finally{try{if(browser)await browser.close();}catch{}}
