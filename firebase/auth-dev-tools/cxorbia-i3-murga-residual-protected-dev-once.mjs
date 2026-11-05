#!/usr/bin/env node
/* I3 P0. One authorized exact-human Murga residual group; DEV only.
 * 83/83 approved prior groups remain immutable PASS. This is not a reimport.
 * Writes ONLY through shopper.identity.adjudicate protected provider.
 * Keep the strongest 27-day login, preserve domain data, ACK, replay, readback.
 * Other active humans (including recent Rocío Vilca) are never touched.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import CredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
const SOURCE='09eed4f012f9ad04e49d53569aabd86bd4c832a9';
const ROOT='https://cxorbia-backend-dev.web.app';
const HR_URL=ROOT+`/api/${TENANT}/${PROGRAM}/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV`;
const AUTH='PAULA_20261105_JHENNYPHER_MURGA_APPROVED_EXACT_HUMAN_DEV_ONCE';
const OUT='.tmp/cxorbia-i3-murga-residual-merge';
const s=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],unique=v=>[...new Set(arr(v).map(s).filter(Boolean))];
const normal=v=>s(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const hash=v=>crypto.createHash('sha256').update(s(v)).digest('hex');
const stable=v=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?
  Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const copy=v=>JSON.parse(JSON.stringify(v));
const sid=v=>s(v?.shopperId||v?.id);
const name=v=>normal(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const country=v=>{const x=normal(v?.pais||v?.country);return ['gt','guatemala'].includes(x)?'GT':['hn','honduras'].includes(x)?'HN':'UNSET';};
// Direction confirmed that no other GT shopper has the Murga surname.
// Match the whole surname token, including older first/middle-name variants;
// the exact nine-profile inventory and same-country guards still fail closed.
const murga=x=>/(^|\s)murga(\s|$)/.test(x);
const assert=(ok,code)=>{if(!ok)throw Error(code);};
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId',
  'ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];
const sensitive=['nombre','displayName','fullName','name','firstName','lastName','direccion','address','direccionResidencia',
  'residentialAddress','city','ciudad','pais','country','visibleLogin','username','user','phone','whatsapp','telefono','email','correo'];
const domains=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],
  ['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const result={schemaVersion:'cxorbia.i3.murga-residual-protected-dev-once.v1',iteration:'I3',
  environment:PROJECT,productSourceSha:SOURCE,authority:'PAULA_EXACT_SAME_HUMAN',decision:'HOLD_PREFLIGHT',
  target:'Jhennypher Murga',production:false,hrWrites:0,credentialResets:0,
  directAuthWrites:0,directFirestoreWrites:0,deployments:0,providerAck:false,
  idempotentReplays:0,keeperLoginPreserved:false};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
save();let browser;

async function hrRead(){
  const response=await fetch(HR_URL+'&once='+Date.now(),{
    headers:{'cache-control':'no-store'},signal:AbortSignal.timeout(120000)});
  assert(response.ok,'HR_HTTP_UNAVAILABLE');const body=await response.json(),data=body.snapshot||body.data||body;
  const revision=s(body.revision||body._runtime?.revision||data.sourceRevision);
  assert(revision.length>=20&&body._runtime?.operationalView===true&&data.operationalIdentityPreview===true,'HR_AUTHORITY_MISSING');
  assert(arr(data.shoppers).length>0&&arr(data.visits).length>0,'HR_EMPTY');
  const periods=unique(data.visits.map(v=>v.periodId||v.periodKey||v.periodo))
    .filter(x=>/^\d{4}-(0[1-9]|1[0-2])$/.test(x)).sort();
  assert(periods.length>0,'PERIOD_SELECTION_UNAVAILABLE');
  return {revision,shoppers:data.shoppers,visits:data.visits,periodId:PROGRAM+'-'+periods.at(-1)};
}
async function stateRead(db){
  const tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
  const [ps,ms,cross,links,...snapshots]=await Promise.all([
    tenant.collection('shoppers').get(),tenant.collection('users').get(),
    tenant.collection('shopperIdentityCrosswalk').get(),tenant.collection('shopperIdentityLinks').get(),
    ...domains.map(([scope,x])=>(scope==='tenant'?tenant:project).collection(x).get())]);
  return {tenant,profiles:new Map(ps.docs.map(d=>[d.id,d.data()||{}])),
    members:ms.docs.map(d=>({uid:d.id,...d.data()})),
    cross:new Map(cross.docs.map(d=>[d.id,d.data()||{}])),
    links:links.docs.map(d=>d.data()||{}),
    rows:domains.map(([,key],i)=>({key,rows:snapshots[i].docs.map(d=>({id:d.id,data:d.data()||{}}))}))};
}
function ownerRefs(data,ids){return ownerFields.some(k=>ids.has(s(data[k])))||
  ownerArrays.some(k=>arr(data[k]).some(x=>ids.has(s(x))));}
function domainOwned(state,aliases){const ids=new Set(aliases);
  return state.rows.map(x=>({key:x.key,rows:x.rows.filter(doc=>ownerRefs(doc.data,ids))}));}
function expected(data,aliases,canonical){
  const output=copy(data),ids=new Set(aliases);
  for(const key of ownerFields)if(ids.has(s(output[key])))output[key]=canonical;
  for(const key of ownerArrays)if(Array.isArray(output[key])){
    const next=unique(output[key].map(x=>ids.has(s(x))?canonical:x));
    if(JSON.stringify(next)!==JSON.stringify(unique(output[key])))output[key]=next;
  }
  return output;
}
function identityFields(profile){return Object.fromEntries(sensitive.filter(key=>Object.hasOwn(profile||{},key))
  .map(key=>[key,profile[key]]));}
function plan(state,hr){
  const rows=[...state.profiles].filter(([_id,p])=>murga(name(p))&&country(p)==='GT');
  const hrRows=hr.shoppers.filter(p=>name(p)==='jhennypher murga'&&country(p)==='GT');
  result.observedTargetProfiles=rows.length;
  result.observedHrSourceProfiles=hrRows.length;
  save();
  assert(rows.length===9&&hrRows.length===1,'EXACT_MURGA_GRAPH_COUNT_DRIFT');
  const canonical=sid(hrRows[0]),ids=rows.map(([id])=>id);
  assert(ids.includes(canonical),'HR_CANONICAL_PROFILE_UNAVAILABLE');
  const aliases=ids.filter(id=>id!==canonical).sort(),set=new Set(ids);
  assert(aliases.length===8,'EXACT_MURGA_ALIAS_COUNT_DRIFT');
  for(const id of ids){const target=s(state.cross.get(id)?.shopperId||state.cross.get(id)?.canonicalShopperId);
    assert(!target||set.has(target),'EXTERNAL_CROSSWALK_CONFLICT');}
  const externalLinks=state.links.filter(l=>['active','confirmed','approved','materialized'].includes(s(l.status||l.state).toLowerCase())&&
    unique([l.sourceIdentityKey,l.sourceShopperId,l.canonicalShopperId,...arr(l.exactAliases),...arr(l.sourceAliases)])
      .some(id=>set.has(id))&&s(l.canonicalShopperId)&&!set.has(s(l.canonicalShopperId)));
  assert(externalLinks.length===0,'OTHER_APPROVED_HUMAN_LINK_CONFLICT');
  const members=state.members.filter(m=>set.has(s(m.shopperId))&&m.active===true&&m.role==='shopper'&&
    m.authNamespace==='shopper'&&m.tenantId===TENANT&&arr(m.projectIds).includes(PROGRAM));
  assert(members.length===3&&members.every(m=>s(m.credentialPasswordProofVersion)===CredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION),
    'AUTH_MEMBERSHIP_OR_PROOF_DRIFT');
  assert(members.every(m=>state.members.filter(n=>n.active===true&&s(n.shopperId)===s(m.shopperId)).length===1),
    'DUPLICATE_ACTIVE_SAME_ID');
  const keeper=members.find(m=>s(m.visibleLogin).toLowerCase()==='jennypher.murga');
  assert(keeper&&members.filter(m=>s(m.visibleLogin).toLowerCase()==='jennypher.murga').length===1,
    'KEEPER_LOGIN_CHANGED');
  const owned=domainOwned(state,aliases),counts=Object.fromEntries(owned.map(d=>[d.key,d.rows.length]));
  const sum=Object.values(counts).reduce((n,v)=>n+v,0);
  const expectedCounts={paymentReconciliations:12,reviewQueue:0,certifications:7,
    liquidations:9,postulations:0,reservations:0,visits:18};
  assert(sum===46&&Object.entries(expectedCounts).every(([key,count])=>counts[key]===count),
    'DOMAIN_COUNT_DRIFT_FROM_INDEPENDENT_READONLY_PREFLIGHT');
  return {canonical,aliases,members,keeper,owned,counts};
}
async function authPreflight(auth,plan){
  for(const member of plan.members){
    const u=await auth.getUser(member.uid),claims=u.customClaims||{},last=Date.parse(s(u.metadata?.lastSignInTime));
    assert(!u.disabled&&claims.shopperId===member.shopperId&&claims.tenantId===TENANT&&
      claims.role==='shopper'&&claims.authNamespace==='shopper'&&arr(claims.projectIds).includes(PROGRAM),
      'AUTH_CLAIMS_DRIFT');
    assert(s(u.email).toLowerCase()===hash(TENANT+'\0shopper\0'+s(member.visibleLogin).toLowerCase()).slice(0,48)+'@auth.cxorbia.invalid',
      'AUTH_EMAIL_LOGIN_DRIFT');
    assert(!Number.isFinite(last)||Date.now()-last>=7*86400000,'RECENT_SESSION_MUST_NOT_BE_DISABLED');
  }
}
async function protectedOperator(auth,hr,state){
  const candidates=state.members.filter(m=>m.active===true&&m.role==='super'&&m.authNamespace==='staff');
  let uid='';
  for(const m of candidates){const u=await auth.getUser(m.uid).catch(()=>null),c=u?.customClaims||{};
    if(u&&!u.disabled&&c.tenantId===TENANT&&c.role==='super'&&c.authNamespace==='staff'){uid=m.uid;break;}}
  assert(uid,'PROTECTED_OPERATOR_NOT_AVAILABLE');
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1420,height:930},serviceWorkers:'block'}),page=await context.newPage();
  await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'+
    '&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'+
    '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:60000});
  await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
    await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(uid));
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&
    window.CX?.backendAuth?.context?.()?.role==='super'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
    typeof window.CX?.commandAdapter?.execute==='function'&&
    typeof window.CX?.shopperAdminCommandContract?.identityAdjudicate==='function',null,{timeout:120000});
  await page.evaluate(p=>window.CX.data?.setCurrentPeriod?.(p),hr.periodId);
  const scope=await page.evaluate(()=>{const a=window.CX.backendAuth.context(),d=window.CX.data.ctx();
    return {role:a.role,tenant:a.tenantId,project:d.projectId,period:d.periodId};});
  assert(scope.role==='super'&&scope.tenant===TENANT&&scope.project===PROGRAM&&scope.period===hr.periodId,
    'PROTECTED_OPERATOR_SCOPE_DRIFT');
  return {context,page};
}
async function execute(plan,hr,operator){
  const visitRows=plan.owned.find(d=>d.key==='visits').rows.map(x=>x.id);
  const reason='paula_confirmed_exact_same_human_jhennypher_murga_gt_2026_11_05';
  const key='i3-murga-residual-once:'+hash([TENANT,PROGRAM,hr.periodId,hr.revision,plan.canonical,
    plan.keeper.uid,...plan.aliases,...visitRows].join('\0')).slice(0,32);
  const input={canonical:plan.canonical,aliases:plan.aliases,keeper:plan.keeper.shopperId,
    period:hr.periodId,reason,key,visits:visitRows};
  return await operator.page.evaluate(async input=>{
    const actor=window.CX.backendAuth.context();
    const built=window.CX.shopperAdminCommandContract.identityAdjudicate({
      tenantId:actor.tenantId,projectId:'cinepolis',periodId:input.period,
      projectIds:Array.isArray(actor.projectIds)&&actor.projectIds.length?actor.projectIds:['cinepolis'],
      actorId:actor.actorId,actorRole:actor.role,canonicalShopperId:input.canonical,aliasShopperIds:input.aliases,
      humanConfirmed:true,keeperShopperId:input.keeper,keeperAccessConfirmed:true,
      preserveHistoricalVisitRows:true,authoritativeVisitIds:input.visits,
      idempotencyKey:input.key,reason:input.reason,expectedVersion:'provider-current'});
    if(!built?.ok)return {built:false,errors:built?.errors};
    const first=await window.CX.commandAdapter.execute(built.command);
    if(first?.ok!==true)return {built:true,first};
    const replay1=await window.CX.commandAdapter.execute(built.command);
    const replay2=await window.CX.commandAdapter.execute(built.command);
    return {built:true,first,replay1,replay2};
  },input);
}
async function verify(db,auth,old,plan,ack,hr){
  const state=await stateRead(db),nextHr=await hrRead();
  assert(nextHr.revision===hr.revision,'HR_CHANGED_AFTER_PROTECTED_PROVIDER_WRITE');
  const canonical=plan.canonical,keeper=await auth.getUser(plan.keeper.uid),claims=keeper.customClaims||{};
  assert(!keeper.disabled&&s(claims.shopperId)===canonical,'KEEPER_AUTH_UNSAFE');
  const current=state.members.find(m=>m.uid===plan.keeper.uid);
  assert(current&&current.active===true&&s(current.shopperId)===canonical&&
    s(current.visibleLogin).toLowerCase()==='jennypher.murga','KEEPER_LOGIN_LOST');
  assert(state.members.filter(m=>m.active===true&&s(m.shopperId)===canonical).length===1,'CANONICAL_ACTIVE_DUPLICATE');
  const aliasSet=new Set(plan.aliases);
  assert(!state.members.some(m=>m.active===true&&aliasSet.has(s(m.shopperId))),'ALIAS_ACTIVE_MEMBERSHIP');
  for(const member of plan.members.filter(m=>m.uid!==plan.keeper.uid)){
    assert((await auth.getUser(member.uid)).disabled===true,'SECONDARY_AUTH_NOT_RETIRED');
  }
  const cp=state.profiles.get(canonical)||{};
  assert(cp.shopperId===canonical&&plan.aliases.every(id=>arr(cp.exactAliases).includes(id)),
    'CANONICAL_PROFILE_ALIASES_MISSING');
  for(const alias of plan.aliases){
    const latest=state.profiles.get(alias)||{},before=old.profiles.get(alias)||{};
    assert(s(latest.supersededByShopperId)===canonical&&
      stable(identityFields(latest))===stable(identityFields(before)),'ALIAS_HISTORY_OR_NAME_LOST');
    assert(s(state.cross.get(alias)?.shopperId)===canonical,'CROSSWALK_ALIAS_MISMATCH');
  }
  assert(s(state.cross.get(canonical)?.shopperId)===canonical,'CROSSWALK_CANONICAL_MISMATCH');
  assert(domainOwned(state,plan.aliases).every(d=>d.rows.length===0),'HISTORICAL_DOMAIN_ALIAS_REFERENCES');
  for(const domain of plan.owned){
    const final=state.rows.find(x=>x.key===domain.key);
    for(const oldRow of domain.rows){
      const currentRow=final.rows.find(x=>x.id===oldRow.id);
      assert(!!currentRow,'HISTORICAL_ROW_DELETED');
      const expectedData=expected(oldRow.data,plan.aliases,canonical),gotData=copy(currentRow.data);
      delete expectedData.identityConsolidatedAt;delete gotData.identityConsolidatedAt;
      assert(stable(expectedData)===stable(gotData),'VISIT_OR_FINANCE_FIELDS_CHANGED');
    }
  }
  const links=state.links.filter(l=>s(l.identityLinkId)===s(ack.identityLinkId)&&
    s(l.canonicalShopperId)===canonical&&l.providerAck===true);
  assert(links.length===1,'PROTECTED_LINK_NOT_READBACK');
  return {keeperLogin:'jennypher.murga',aliasesRetired:plan.aliases.length,canonicalMemberships:1,
    providerDomainRowsPreserved:plan.owned.reduce((n,d)=>n+d.rows.length,0),
    domainRows:Object.fromEntries(plan.owned.map(d=>[d.key,d.rows.length])),
    nameInCanonicalProfile:s(cp.nombre),nameMatchesCorrectedHr:name(cp)==='jhennypher murga',
    hrRevision:nextHr.revision};
}

try{
  assert(process.env.CX_I3_MURGA_RESIDUAL_BATCH===AUTH,'EXPLICIT_SINGLE_HUMAN_DEV_AUTHORITY_MISSING');
  assert(process.env.GOOGLE_CLOUD_PROJECT===PROJECT||process.env.GCLOUD_PROJECT===PROJECT,'DEV_PROJECT_ONLY');
  assert(process.env.CXORBIA_PRODUCT_SOURCE_SHA===SOURCE,'PRODUCT_SOURCE_PIN_CHANGED');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const db=getFirestore(),auth=getAuth(),hr=await hrRead(),state=await stateRead(db);
  const approved=plan(state,hr);await authPreflight(auth,approved);
  const second=await hrRead();assert(second.revision===hr.revision,'HR_CHANGED_DURING_PREFLIGHT');
  result.hrRevisionBefore=hr.revision;result.domainRowsPlanned=approved.counts;
  result.keeperLogin='jennypher.murga';result.aliasCount=approved.aliases.length;
  result.decision='PREFLIGHT_PASS_PROTECTED_PROVIDER_PENDING';save();
  const operator=await protectedOperator(auth,hr,state);
  const outcome=await execute(approved,hr,operator);
  if(outcome.built!==true||outcome.first?.ok!==true||outcome.first?.providerAck!==true){
    result.decision='HOLD_PROVIDER_ACK_UNKNOWN_STOP_NO_RETRY';save();throw Error('PROVIDER_ACK_UNKNOWN_STOP');
  }
  const ack=outcome.first;result.providerAck=true;result.identityConsolidated=ack.identityConsolidated===true;
  assert(result.identityConsolidated&&ack.historicalVisitRowsPreserved===true&&
    ack.exactAliases?.length===approved.aliases.length&&
    Number(ack.authoritativeVisitCount)===approved.counts.visits&&
    Object.entries(approved.counts).every(([domain,count])=>Number(ack.domainWrites?.[domain]||0)===count)&&
    Number(ack.hrWrites||0)===0&&Number(ack.externalWrites||0)===0,'PROVIDER_ACK_CONTENT_UNSAFE');
  for(const replay of [outcome.replay1,outcome.replay2])assert(replay?.ok===true&&replay.providerAck===true&&
    replay.idempotentReplay===true&&Number(replay.providerWrites||0)===0,'ZERO_WRITE_REPLAY_FAILURE');
  result.idempotentReplays=2;
  result.readback=await verify(db,auth,state,approved,ack,hr);
  result.keeperLoginPreserved=true;result.decision=result.readback.nameMatchesCorrectedHr?
    'PASS_RESIDUAL_MURGA_FUSION_AND_NAME_DEV':
    'PASS_RESIDUAL_MURGA_FUSION_PROFILE_NAME_PROJECTION_PENDING';
  await operator.context.close();
}catch(e){result.errorCode=s(e?.message||e).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,100);
  if(!result.decision.startsWith('HOLD_PROVIDER_ACK_UNKNOWN'))result.decision='HOLD_STOP_ON_P0_PROOF_OR_WRITE';
  process.exitCode=1;
}finally{try{if(browser)await browser.close();}catch{}
  save();process.stdout.write(JSON.stringify({decision:result.decision,target:result.target,
    providerAck:result.providerAck,readback:result.readback||null,
    observedTargetProfiles:result.observedTargetProfiles,
    observedHrSourceProfiles:result.observedHrSourceProfiles,
    domainRowsPlanned:result.domainRowsPlanned,hrWrites:0,production:false,errorCode:result.errorCode||null},null,2)+'\n');}
