#!/usr/bin/env node
/* One exact, human-confirmed DEV shopper identity canary: F-048.
 * All personal identifiers are resolved inside the DEV GitHub runner and never
 * stored in source, public logs, or evidence. Writes only through the already
 * protected, authenticated CXOrbia identity-adjudication command provider.
 * Unlike F-001, the alias owns one protected historical visit: preserve and
 * reassign only that exact visit after corroborating its live HR source row.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis',PERIOD='cinepolis-2026-10';
const ROOT='https://cxorbia-backend-dev.web.app';
const HR_REV='4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a';
const PAIR_DIGEST='ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872';
const CANON_FP='b44ba04b2778112cdf13',ALIAS_FP='44d86958b394c10cffdb';
const EXECUTION='PAULA_I3_2026_10_28_APPROVED_F048_DEV_CANARY_ONLY';
const OUT=String(process.env.CX_F048_CANARY_OUT||'.tmp/cxorbia-i3-f048-canary');
const val=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=xs=>[...new Set(arr(xs).map(val).filter(Boolean))];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=(kind,v)=>sha(kind+':'+v).slice(0,20);
const norm=v=>val(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const phone=v=>val(v?.whatsapp||v?.phone||v?.telefono).replace(/[^0-9]/g,'');
const sid=v=>val(v?.shopperId||v?.id);
const name=v=>norm(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const country=v=>{const c=norm(v?.pais||v?.country||v?.país);return c==='guatemala'||c==='gt'?'GT':c==='honduras'||c==='hn'?'HN':'UNSET';};
const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const result={schemaVersion:'cxorbia.i3.f048.canary.v1',caseCode:'F-048',decision:'HOLD',environment:'DEV',
  project:PROJECT,tenant:TENANT,program:PROGRAM,production:false,approved139Digest:PAIR_DIGEST,
  exactCanonicalFingerprint:CANON_FP,exactAliasFingerprint:ALIAS_FP,hrRevision:HR_REV,
  providerWrites:0,hrWrites:0,directAuthWrites:0,directFirestoreWrites:0,deployments:0,
  identityConsolidated:false,providerAck:false,readback:false,shopperUiVerified:false};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(`${OUT}/result.json`,JSON.stringify(result,null,2)+'\n','utf8');
save();
let browser;

async function liveHr(){
  const r=await fetch(`${ROOT}/api/${TENANT}/${PROGRAM}/hr-live?format=json`+
    `&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&f048=${Date.now()}`,{
    headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(120000)});
  assert(r.ok,'HR_PROVIDER_HTTP_'+r.status);
  const body=await r.json(),data=body.snapshot||body.data||body;
  const rev=val(body.revision||body._runtime?.revision||data.sourceRevision);
  assert(rev===HR_REV,'HR_SOURCE_REVISION_DRIFT');
  assert(body._runtime?.operationalView===true&&data.operationalIdentityPreview===true,
    'HR_OPERATIONAL_NAME_VIEW_NOT_PROVEN');
  return {shoppers:arr(data.shoppers),visits:arr(data.visits),rev};
}
async function findProfileByFp(col,hash){
  const docs=(await col.get()).docs.filter(d=>fp('sid',d.id)===hash);
  assert(docs.length===1,'F048_PROFILE_FINGERPRINT_NOT_UNIQUE');
  return docs[0];
}
async function activeMembers(users,identityId){
  const snap=await users.where('shopperId','==',identityId).get();
  return snap.docs.filter(d=>{const m=d.data()||{};
    return m.active===true&&val(m.tenantId)===TENANT&&val(m.role)==='shopper'&&
      val(m.authNamespace)==='shopper'&&arr(m.projectIds).includes(PROGRAM);
  });
}
function validPrincipal(authUser,member,id){
  const c=authUser?.customClaims||{};
  return !!authUser&&!authUser.disabled&&val(c.role)==='shopper'&&val(c.authNamespace)==='shopper'&&
    val(c.tenantId)===TENANT&&val(c.shopperId)===id&&arr(c.projectIds).includes(PROGRAM)&&
    val(member.shopperId)===id&&member.active===true;
}
const scopes=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],
  ['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const ownerKeys=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId',
  'ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
async function aliasReferences(tenant,id){
  const out={};
  for(const [scope,collection] of scopes){
    const parent=scope==='tenant'?tenant:tenant.collection('projects').doc(PROGRAM),snap=await parent.collection(collection).get();
    out[collection]=snap.docs.filter(d=>{const row=d.data()||{};
      return ownerKeys.some(key=>val(row[key])===id)||['shopperIds','candidateShopperIds'].some(key=>arr(row[key]).some(x=>val(x)===id));
    }).length;
  }
  return out;
}
async function aliasHistoricalVisit(tenant,alias,canonical,hr){
  const visits=tenant.collection('projects').doc(PROGRAM).collection('visits');
  const all=(await visits.get()).docs;
  const matches=all.filter(d=>{
    const row=d.data()||{};
    return ownerKeys.some(k=>val(row[k])===alias)||['shopperIds','candidateShopperIds'].some(k=>arr(row[k]).some(x=>val(x)===alias));
  });
  assert(matches.length===1,'F048_ALIAS_VISIT_CARDINALITY_DRIFT');
  const doc=matches[0],row=doc.data()||{};
  const keys=r=>uniq([r?.id,r?.visitId,r?.hrRowId,
    r?.sourceTab&&r?.sourceRow?`${r.sourceTab}!${r.sourceRow}`:'',
    r?.sourceTab&&r?.sourceRow?`${r.sourceTab}::${r.sourceRow}`:'']);
  const source=hr.visits.filter(v=>keys(v).some(k=>keys({...row,id:doc.id}).includes(k)));
  assert(source.length===1&&sid(source[0])===canonical,'F048_ALIAS_VISIT_HR_EXACT_AUTHORITY_NOT_PROVEN');
  assert(!val(row.rootProjectId)||val(row.rootProjectId)===PROGRAM,'F048_ALIAS_VISIT_PROJECT_MISMATCH');
  assert(country(source[0])==='GT'&&['GT','UNSET'].includes(country(row)),'F048_ALIAS_VISIT_COUNTRY_MISMATCH');
  const withoutOwner=value=>{
    const clean={...value};
    for(const k of [...ownerKeys,'shopperIds','candidateShopperIds','identityConsolidatedAt'])delete clean[k];
    return JSON.stringify(clean);
  };
  return {id:doc.id,sourceFingerprint:fp('visit',sid(source[0])+'|'+val(source[0].hrRowId)),
    unownedJson:withoutOwner(row),withoutOwner};
}
async function openProtectedAdmin(browser,auth,adminUid){
  const context=await browser.newContext({viewport:{width:1420,height:930},serviceWorkers:'block'}),page=await context.newPage();
  await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'+
    '&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'+
    '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:60000});
  await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
    await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(adminUid));
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&
    window.CX?.backendAuth?.context?.()?.role==='super'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
    typeof window.CX?.commandAdapter?.execute==='function'&&
    typeof window.CX?.shopperAdminCommandContract?.identityAdjudicate==='function',null,{timeout:120000});
  await page.evaluate(period=>window.CX.data?.setCurrentPeriod?.(period),PERIOD);
  const scope=await page.evaluate(()=>{const a=window.CX.backendAuth.context()||{},d=window.CX.data?.ctx?.()||{};
    return {role:a.role,tenantId:a.tenantId,authNamespace:a.authNamespace,projectId:d.projectId,periodId:d.periodId};});
  assert(scope.role==='super'&&scope.tenantId===TENANT&&scope.authNamespace==='staff'&&
    scope.projectId===PROGRAM&&scope.periodId===PERIOD,'PROTECTED_OPERATOR_SCOPE_DRIFT');
  return {context,page};
}
async function readShopperUi(browser,auth,uid,expectedCountry,hrVisitCount){
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const page=await context.newPage();
  try{
    await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'+
      '&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'+
      '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV',{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.firebase?.auth,null,{timeout:60000});
    await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
      await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(uid));
    await page.reload({waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
      window.CX_PROTECTED_AUTH_HR_AUTHORITY?.role==='shopper',null,{timeout:120000});
    const data=await page.evaluate(()=>{const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},d=window.CX?.data||{};
      const visits=Array.isArray(d._visitas)?d._visitas:[],scopeId=String(d.currentPeriodId||''),
        scopedCountry=String(a.shopperCountry||''),programKey=v=>{
          try{return String(d.programKeyOfVisit?.(v)||d.programKey?.(v)||v?.rootProjectId||v?.projectId||'');}
          catch{return String(v?.rootProjectId||v?.projectId||'');}
        };
      const projects=window.CX?.router?.resolveVisibleProjects?.('shopper')||[],
        allowed=new Set(projects.map(p=>{try{return String(d.programKey(p));}catch{return String(p?.program||p?.projectId||'');}}));
      const periodOf=v=>String(d.recordPeriodId?.(v)||v?.periodId||v?.periodKey||''),
        available=v=>{const f=d.visitFacets?.(v);return f&&typeof f.available==='boolean'
          ?f.available===true&&f.eligibilityBlocked!==true:String(v?.estado)==='disponible'&&!v?.shopperId;};
      const current=visits.filter(v=>periodOf(v)===scopeId),inCountry=current.filter(v=>
        String(v.pais||v.country||'')===scopedCountry),inProgram=inCountry.filter(v=>allowed.has(programKey(v)));
      return {ready:a.exactSessionShopperReady===true,country:a.shopperCountry||'',
        ownVisits:Number(a.ownVisits||0),periods:Number(a.authorizedPeriods||0),
        hrVisits:Number(a.hrVisits||0),sourceRevision:String(a.sourceRevision||''),
        profilePreserved:a.sessionProfilePreserved===true,
        dataVisits:visits.length,marketplace:{currentPeriodId:scopeId,visibleProjectPeriods:projects.length,
          scopeCountry:scopedCountry,sourceAvailableAll:visits.filter(available).length,
          currentPeriodRows:current.length,currentPeriodAvailable:current.filter(available).length,
          countryAvailable:inCountry.filter(available).length,
          authorizedProgramRows:inProgram.length,authorizedProgramAvailable:inProgram.filter(available).length}};});
    assert(data.ready&&data.country===expectedCountry&&data.sourceRevision===HR_REV&&
      data.profilePreserved&&data.ownVisits===hrVisitCount,'F048_SHOPPER_UI_EXACT_HR_AUTHORITY_NOT_READY');
    return {ok:true,principalAuthenticated:true,country:data.country,ownVisits:data.ownVisits,
      authorizedPeriods:data.periods,hrVisits:data.hrVisits,dataVisits:data.dataVisits,
      marketplace:data.marketplace,sourceRevisionVerified:true,rawCredentialNotPrinted:true};
  }finally{await context.close();}
}

try{
  assert(process.env.CX_F048_EXECUTION===EXECUTION,'AUTHORIZATION_GATE');
  assert(process.env.GOOGLE_CLOUD_PROJECT===PROJECT||process.env.GCLOUD_PROJECT===PROJECT,'DEV_PROJECT_GUARD');
  assert(process.env.CX_F048_APPROVED_DIGEST===PAIR_DIGEST,'APPROVED_WORKBOOK_DIGEST_GUARD');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),
    users=tenant.collection('users'),profiles=tenant.collection('shoppers'),cross=tenant.collection('shopperIdentityCrosswalk');
  const [canonicalDoc,aliasDoc,hr]=await Promise.all([
    findProfileByFp(profiles,CANON_FP),findProfileByFp(profiles,ALIAS_FP),liveHr()]);
  const canonical=canonicalDoc.id,alias=aliasDoc.id,hrMatches=hr.shoppers.filter(row=>sid(row)===canonical),
    hrAliasMatches=hr.shoppers.filter(row=>sid(row)===alias),cp=canonicalDoc.data()||{},ap=aliasDoc.data()||{};
  assert(canonical!==alias&&hrMatches.length===1&&hrAliasMatches.length===0,'F048_HR_IDENTITIES_DRIFT');
  result.sourceConsistency={
    canonicalProfileSourceTypeExternal:val(cp.sourceType)==='hr_external',
    canonicalCountry:country(cp),aliasCountry:country(ap),hrCountry:country(hrMatches[0]),
    profileNamesAgreeNormalized:name(cp)===name(ap),
    hrNamePresent:!!name(hrMatches[0]),hrMatchesCanonicalName:name(cp)===name(hrMatches[0]),
    hrSourceFields:{nombre:Object.prototype.hasOwnProperty.call(hrMatches[0],'nombre'),
      displayName:Object.prototype.hasOwnProperty.call(hrMatches[0],'displayName'),
      fullName:Object.prototype.hasOwnProperty.call(hrMatches[0],'fullName'),
      firstName:Object.prototype.hasOwnProperty.call(hrMatches[0],'firstName'),
      pais:Object.prototype.hasOwnProperty.call(hrMatches[0],'pais'),
      country:Object.prototype.hasOwnProperty.call(hrMatches[0],'country')}
  };save();
  assert(val(cp.sourceType)==='hr_external'&&country(cp)==='GT'&&country(ap)==='GT'&&
    country(hrMatches[0])==='GT'&&name(cp)===name(ap)&&name(ap)===name(hrMatches[0]),'F048_NAME_COUNTRY_AUTHORITY_MISMATCH');
  assert(phone(cp)&&phone(cp)===phone(ap),'F048_STRONG_CONTACT_CORROBORATION_DRIFT');
  const historical=hr.visits.filter(v=>sid(v)===canonical);
  const [aliasMembers,canonicalMembers,aliasCross,canonicalCross,refs]=await Promise.all([
    activeMembers(users,alias),activeMembers(users,canonical),cross.doc(alias).get(),cross.doc(canonical).get(),aliasReferences(tenant,alias)]);
  assert(aliasMembers.length===1&&canonicalMembers.length<=1,'F048_MEMBERSHIP_CARDINALITY_DRIFT');
  assert(aliasCross.exists&&canonicalCross.exists&&
    val((aliasCross.data()||{}).shopperId)===alias&&val((canonicalCross.data()||{}).shopperId)===canonical,
    'F048_CROSSWALK_CHANGED');
  assert(refs.visits===1&&Object.entries(refs).filter(([k])=>k!=='visits').every(([,n])=>n===0),
    'F048_ALIAS_HISTORY_DOMAIN_TOPOLOGY_DRIFT');
  assert(historical.length===1,'F048_HR_HISTORY_CARDINALITY_DRIFT');
  const protectedHistory=await aliasHistoricalVisit(tenant,alias,canonical,hr);
  const keeperUid=aliasMembers[0].id,member=aliasMembers[0].data()||{},keeper=await auth.getUser(keeperUid);
  assert(validPrincipal(keeper,member,alias),'F048_KEEPER_AUTH_DRIFT');
  assert(val(member.visibleLogin)&&val(member.credentialPasswordProofVersion||ap.credentialPasswordProofVersion)===
    ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION,'F048_KEEPER_LOGIN_PROOF_MISSING');
  assert(val(keeper.email).endsWith('@auth.cxorbia.invalid'),'F048_KEEPER_PRIVATE_EMAIL_NAMESPACE_REQUIRED');
  const secondaries=[];
  for(const doc of canonicalMembers){const user=await auth.getUser(doc.id);
    assert(validPrincipal(user,doc.data()||{},canonical),'F048_SECONDARY_AUTH_DRIFT');
    const raw=val(user.metadata?.lastSignInTime),stamp=Date.parse(raw);
    assert(!raw||(Number.isFinite(stamp)&&Date.now()-stamp>7*86400000),'F048_SECONDARY_RECENT_SIGNIN');
    secondaries.push(user);
  }
  const oldLinks=(await tenant.collection('shopperIdentityLinks').get()).docs.filter(doc=>{
    const link=doc.data()||{},ids=[link.sourceShopperId,link.canonicalShopperId,...arr(link.exactAliases),...arr(link.sourceAliases)].map(val);
    return ['active','approved','confirmed','materialized'].includes(val(link.status||link.state).toLowerCase())&&
      ids.includes(alias)&&!ids.includes(canonical);
  });
  assert(oldLinks.length===0,'F048_ACTIVE_LINK_CONFLICT');
  const allMembers=(await users.get()).docs.map(d=>({uid:d.id,...(d.data()||{})}));
  const staff=allMembers.filter(x=>x.active===true&&val(x.role)==='super'&&val(x.authNamespace)==='staff');
  const actors=[];
  for(const x of staff){try{const user=await auth.getUser(x.uid),c=user.customClaims||{};
    if(!user.disabled&&val(c.tenantId)===TENANT&&val(c.role)==='super'&&val(c.authNamespace)==='staff')actors.push(x.uid);
  }catch{}}
  assert(actors.length>0,'F048_AUTH_SUPER_OPERATOR_NOT_AVAILABLE');
  actors.sort();
  result.before={canonicalFingerprint:CANON_FP,aliasFingerprint:ALIAS_FP,hrHistoricalVisits:historical.length,
    keeperUidFingerprint:fp('uid',keeperUid),keeperCredentialProof:true,aliasOwnedDomainRows:refs,
    aliasVisitFingerprint:fp('visitDoc',protectedHistory.id),sourceVisitFingerprint:protectedHistory.sourceFingerprint,
    secondaryActivePrincipals:secondaries.length,sourceRevisionVerified:true};save();

  // An exact second source read is mandatory immediately before protected writes.
  const preCommit=await liveHr();
  assert(preCommit.visits.filter(v=>sid(v)===canonical).length===historical.length,'F048_HR_HISTORICAL_DRIFT');
  await aliasHistoricalVisit(tenant,alias,canonical,preCommit);
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const admin=await openProtectedAdmin(browser,auth,actors[0]);
  const preserve=[protectedHistory.id];
  const idempotencyKey='i3-f048-20261028:'+sha([TENANT,PROGRAM,PERIOD,canonical,alias,keeperUid,HR_REV,...preserve].join('\0')).slice(0,32);
  const outcome=await admin.page.evaluate(async input=>{
    const a=window.CX.backendAuth.context()||{};
    const built=window.CX.shopperAdminCommandContract.identityAdjudicate({
      tenantId:a.tenantId,projectId:input.projectId,periodId:input.periodId,
      projectIds:Array.isArray(a.projectIds)&&a.projectIds.length?a.projectIds:[input.projectId],
      actorId:a.actorId,actorRole:a.role,canonicalShopperId:input.canonical,aliasShopperIds:[input.alias],
      humanConfirmed:true,expectedVersion:'provider-current',idempotencyKey:input.key,
      reason:'paula_confirmed_exact_same_human_f048_2026_10_28',
      keeperShopperId:input.alias,keeperAccessConfirmed:true,preserveHistoricalVisitRows:true,
      authoritativeVisitIds:input.preserve
    });
    if(!built?.ok)return {built:false,errors:built?.errors||[]};
    const first=await window.CX.commandAdapter.execute(built.command);
    const replay=first?.ok===true?await window.CX.commandAdapter.execute(built.command):null;
    return {built:true,first,replay};
  },{projectId:PROGRAM,periodId:PERIOD,canonical,alias,key:idempotencyKey,preserve});
  assert(outcome.built===true,'F048_COMMAND_CONTRACT_BUILD_FAILED');
  const ack=outcome.first||{},replay=outcome.replay||{};
  result.providerAck=ack.ok===true&&ack.providerAck===true;result.identityConsolidated=ack.identityConsolidated===true;
  result.providerWrites=Number(ack.providerWrites||0);save();
  assert(result.providerAck&&result.identityConsolidated&&val(ack.canonicalShopperId||ack.entityId)===canonical&&
    JSON.stringify(uniq(ack.exactAliases))===JSON.stringify([alias])&&ack.historicalVisitRowsPreserved===true&&
    Number(ack.authoritativeVisitCount)===1&&Number(ack.domainWrites?.visits||0)===1&&
    Number(ack.hrWrites||0)===0&&Number(ack.externalWrites||0)===0,
    'F048_PROTECTED_PROVIDER_ACK_FAILED');
  assert(replay.ok===true&&replay.providerAck===true&&replay.idempotentReplay===true&&
    Number(replay.providerWrites||0)===0,'F048_IDEMPOTENCY_FAILED');
  await admin.context.close();
  const [keeperRead,memberRead,canonMembersAfter,aliasMembersAfter,cpAfter,apAfter,cwAfter,awAfter,link,receipt,hrAfter]=
    await Promise.all([auth.getUser(keeperUid),users.doc(keeperUid).get(),activeMembers(users,canonical),
      activeMembers(users,alias),profiles.doc(canonical).get(),profiles.doc(alias).get(),
      cross.doc(canonical).get(),cross.doc(alias).get(),
      tenant.collection('shopperIdentityLinks').doc(val(ack.identityLinkId)).get(),
      tenant.collection('commandReceipts').doc(sha([TENANT,PROGRAM,PERIOD,idempotencyKey].join('\0')).slice(0,40)).get(),liveHr()]);
  assert(!keeperRead.disabled&&val(keeperRead.customClaims?.shopperId)===canonical&&
    memberRead.data()?.active===true&&val(memberRead.data()?.shopperId)===canonical&&
    canonMembersAfter.length===1&&canonMembersAfter[0].id===keeperUid&&aliasMembersAfter.length===0,
    'F048_KEEPER_MEMBERSHIP_READBACK_FAILED');
  for(const secondary of secondaries)assert((await auth.getUser(secondary.uid)).disabled===true,'F048_RETIRED_SECONDARY_AUTH_READBACK_FAILED');
  assert(val(memberRead.data()?.visibleLogin)===val(member.visibleLogin)&&
    val(keeperRead.email)===val(keeper.email),'F048_ORIGINAL_KEEPER_CREDENTIAL_CHANGED');
  assert(cpAfter.exists&&apAfter.exists&&val((cpAfter.data()||{}).shopperId)===canonical&&
    val((apAfter.data()||{}).supersededByShopperId)===canonical&&
    val((cwAfter.data()||{}).shopperId)===canonical&&val((awAfter.data()||{}).shopperId)===canonical,
    'F048_PROFILE_AND_CROSSWALK_READBACK_FAILED');
  assert(link.exists&&val((link.data()||{}).canonicalShopperId)===canonical&&
    arr((link.data()||{}).exactAliases).length===1&&
    val((link.data()||{}).exactAliases[0])===alias,'F048_IDENTITY_LINK_READBACK_FAILED');
  assert(receipt.exists&&receipt.data()?.providerAck===true&&receipt.data()?.identityConsolidated===true&&
    val(receipt.data()?.status)==='committed','F048_COMMAND_RECEIPT_READBACK_FAILED');
  const residual=await aliasReferences(tenant,alias);
  assert(Object.values(residual).every(n=>n===0),'F048_OPERATIONAL_ALIAS_RESIDUAL');
  const visitRead=await tenant.collection('projects').doc(PROGRAM).collection('visits').doc(protectedHistory.id).get();
  assert(visitRead.exists,'F048_HISTORICAL_VISIT_DISAPPEARED');
  const visitAfter=visitRead.data()||{};
  assert(val(visitAfter.shopperId)===canonical&&protectedHistory.withoutOwner(visitAfter)===protectedHistory.unownedJson,
    'F048_HISTORICAL_VISIT_OWNER_OR_CONTENT_MISMATCH');
  assert(hrAfter.visits.filter(v=>sid(v)===canonical).length===historical.length,'F048_HR_HISTORY_CHANGED');
  result.readback=true;result.after={canonicalMemberships:1,activeAliasMemberships:0,
    keeperUidFingerprint:fp('uid',keeperUid),keeperEnabled:true,retiredSecondaryPrincipals:secondaries.length,
    originalLoginPreserved:true,canonicalCrosswalk:true,aliasCrosswalk:true,hrHistoricalVisits:historical.length,
    historicalVisitIdPreserved:true,historicalVisitOwnerCanonical:true,domainVisitWrites:Number(ack.domainWrites?.visits||0),
    readbackOperationalAliasResidual:residual};save();
  try{
    result.shopperUi=await readShopperUi(browser,auth,keeperUid,'GT',historical.length);
    result.shopperUiVerified=result.shopperUi.ok===true;
  }catch(e){result.shopperUi={ok:false,code:val(e.message||e).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,110)};}
  result.decision=result.shopperUiVerified?'PASS_F048_CANARY_PROVIDER_AND_SHOPPER_UI':'PARTIAL_F048_CANARY_PROVIDER_PASS_UI_HOLD';
  save();console.log(JSON.stringify({decision:result.decision,caseCode:'F-048',
    providerAck:result.providerAck,readback:result.readback,shopperUiVerified:result.shopperUiVerified,
    hrHistoricalVisits:historical.length,providerWrites:result.providerWrites,production:false}));
  if(!result.shopperUiVerified)process.exitCode=3;
}catch(error){result.decision=result.identityConsolidated?'HOLD_F048_CANARY_AFTER_POSSIBLE_WRITE':'HOLD_F048_CANARY_PREWRITE';
  result.errorCode=val(error?.message||error).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,130);
  save();console.error(JSON.stringify({decision:result.decision,code:result.errorCode,
    sourceConsistency:result.sourceConsistency||null,
    providerAck:result.providerAck,readback:result.readback,production:false}));process.exitCode=2;
}finally{try{if(browser)await browser.close();}catch{}}
