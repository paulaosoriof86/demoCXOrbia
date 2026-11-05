#!/usr/bin/env node
/* I3 P0 / one bounded, sequential DEV adjudication of Paula's approved 139
 * exact pairs (83 groups). No names, contact details, IDs or UIDs leave DEV.
 * No writes except protected shopper.identity.adjudicate. Every group gets a
 * fresh preflight, provider ACK, two zero-write replays and independent readback.
 * Ambiguous groups remain HOLD without blocking unrelated safe groups.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
const ROOT='https://cxorbia-backend-dev.web.app';
const HR_URL=`${ROOT}/api/${TENANT}/${PROGRAM}/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV`;
const APPROVED_REV='4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a';
const PAIR_DIGEST='ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872';
const AUTHORITY='PAULA_2026_10_28_139_PAIRS_83_GROUPS_DEV_BATCH_SINGLE_RUN';
const HASHES=JSON.parse(fs.readFileSync(new URL('./cxorbia-i3-approved-139-pair-hashes.json',import.meta.url),'utf8'));
const OUT=String(process.env.CX_I3_APPROVED139_BATCH_OUT||'.tmp/i3-approved139-batch');
const val=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],unique=v=>[...new Set(arr(v).map(val).filter(Boolean))];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const norm=v=>val(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const displayName=v=>norm(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const country=v=>{const c=norm(v?.pais||v?.country||v?.país);return c==='honduras'||c==='hn'?'HN':c==='guatemala'||c==='gt'?'GT':'UNSET';};
const sid=v=>val(v?.shopperId||v?.id);
const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const domains=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],
  ['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId',
  'ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];
const immutableFields=['nombre','displayName','fullName','name','firstName','lastName','direccion','address',
  'direccionResidencia','residentialAddress','city','ciudad','pais','country','visibleLogin','username','user',
  'phone','whatsapp','telefono','email','correo'];
const stamp=()=>new Date().toISOString();
const stable=value=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?
  Object.fromEntries(Object.keys(v).sort().map(key=>[key,v[key]])):v);
const report={schemaVersion:'cxorbia.i3.approved139.dev-batch.v1',iteration:'I3',environment:'DEV',production:false,
  decision:'HOLD_PREFLIGHT',createdAt:stamp(),approvedPairCount:139,approvedGroupCount:83,
  approvedWorkbookDigest:PAIR_DIGEST,approvedHrRevision:APPROVED_REV,
  productSourceSha:'09eed4f012f9ad04e49d53569aabd86bd4c832a9',
  directFirestoreWrites:0,directAuthWrites:0,hrWrites:0,deployments:0,credentialResets:0,
  attempted:0,merged:0,alreadyVerified:0,remaining:83,groups:[],preflight:null};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(`${OUT}/result.json`,JSON.stringify(report,null,2)+'\n','utf8');
const sanitize=e=>val(e?.message||e).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,110);
save();
let browser;

async function readHr(){
  const response=await fetch(HR_URL+'&batchGuard='+Date.now(),{
    headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(120000)});
  assert(response.ok,'HR_HTTP_'+response.status);
  const body=await response.json(),data=body.snapshot||body.data||body;
  const revision=val(body.revision||body._runtime?.revision||data.sourceRevision);
  // Identity approval is about the exact pair of IDs, not about an unrelated
  // period/source refresh. The revision is pinned freshly per run, while all
  // 139 approved pairs and 97 live names/countries are proven independently.
  assert(revision&&revision.length>=20,'HR_REVISION_MISSING');
  assert(body._runtime?.operationalView===true&&data.operationalIdentityPreview===true,'HR_PROTECTED_OPERATIONAL_VIEW_MISSING');
  assert(arr(data.shoppers).length>0&&arr(data.visits).length>0,'HR_EMPTY');
  // The operational-name HR view does not expose currentPeriodId. Derive the
  // newest configured HR month dynamically, and verify the selected scoped UI
  // period before any protected write. Never pin October/November in this lane.
  const periodCodes=unique(arr(data.visits).map(v=>v.periodId||v.periodKey||v.periodo))
    .filter(x=>/^\d{4}-(0[1-9]|1[0-2])$/.test(x)).sort();
  const periodCode=periodCodes.at(-1);
  assert(periodCode,'HR_SCOPED_PERIOD_NOT_DERIVABLE');
  const periodId=`${PROGRAM}-${periodCode}`;
  return {shoppers:arr(data.shoppers),visits:arr(data.visits),revision,periodCode,periodId};
}
async function readState(db){
  const tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
  const [usersSnap,profilesSnap,crossSnap,linksSnap,...domainSnaps]=await Promise.all([
    tenant.collection('users').get(),tenant.collection('shoppers').get(),
    tenant.collection('shopperIdentityCrosswalk').get(),tenant.collection('shopperIdentityLinks').get(),
    ...domains.map(([scope,name])=>(scope==='tenant'?tenant:project).collection(name).get())]);
  return {tenant,users:usersSnap.docs.map(d=>({...(d.data()||{}),uid:d.id})),
    profiles:new Map(profilesSnap.docs.map(d=>[d.id,d.data()||{}])),
    cross:new Map(crossSnap.docs.map(d=>[d.id,d.data()||{}])),
    links:linksSnap.docs.map(d=>({...(d.data()||{}),id:d.id})),
    domains:domains.map(([,name],i)=>({name,rows:domainSnaps[i].docs.map(d=>({id:d.id,data:d.data()||{}}))}))};
}
async function readAuthUsers(auth){
  const users=[];let pageToken;
  do{const page=await auth.listUsers(1000,pageToken);users.push(...page.users);pageToken=page.pageToken;}while(pageToken);
  return new Map(users.map(u=>[u.uid,u]));
}
function approvedGroups(state,hr){
  assert(HASHES.schemaVersion==='cxorbia.i3.approved-139-pair-hashes.v1'&&
    HASHES.approvedCaseCount===139&&HASHES.approvedGroupCount===83&&
    HASHES.sourceRevision===APPROVED_REV&&HASHES.approvedPairDigest===PAIR_DIGEST,'APPROVAL_LOCK_DRIFT');
  const expected=new Map(arr(HASHES.casePairHashes).map(([caseCode,fingerprint])=>[val(fingerprint),val(caseCode)]));
  assert(expected.size===139,'APPROVED_CASE_DIGEST_COUNT');
  const casesByCode=new Map();
  for(const [hrId,profile] of state.profiles){
    if(val(profile.sourceType)!=='hr_external')continue;
    for(const accountId of state.profiles.keys()){
      if(hrId===accountId)continue;
      const code=expected.get(sha(hrId+'\0'+accountId));
      if(!code)continue;
      assert(!casesByCode.has(code),'APPROVED_CASE_REPEATED');
      casesByCode.set(code,{code,hrId,accountId});
    }
  }
  assert(casesByCode.size===139,'APPROVED_CASES_NOT_ALL_RESOLVED');
  const cases=[...casesByCode.values()].sort((a,b)=>a.code.localeCompare(b.code));
  assert(sha(cases.map(x=>x.code+'\0'+x.hrId+'\0'+x.accountId).join('\n'))===PAIR_DIGEST,'APPROVED_IDENTITY_PAIR_DRIFT');
  const parent=new Map(),find=x=>{if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,find(parent.get(x)));return parent.get(x);};
  const join=(a,b)=>{const x=find(a),y=find(b);if(x!==y)parent.set(y,x);};
  for(const x of cases)join('H:'+x.hrId,'A:'+x.accountId);
  for(const [a,b] of [['F-015','F-016'],['F-017','F-019'],['F-024','F-025'],['F-024','F-027'],
    ['F-032','F-033'],['F-034','F-035'],['F-034','F-036'],['F-061','F-062']]){
    assert(casesByCode.has(a)&&casesByCode.has(b),'APPROVED_GROUP_NOTE_MISSING');
    join('H:'+casesByCode.get(a).hrId,'H:'+casesByCode.get(b).hrId);
  }
  const groups=new Map();
  for(const x of cases){const key=find('H:'+x.hrId);
    if(!groups.has(key))groups.set(key,{cases:[],hrs:new Set(),accounts:new Set()});
    const group=groups.get(key);group.cases.push(x.code);group.hrs.add(x.hrId);group.accounts.add(x.accountId);
  }
  assert(groups.size===83,'APPROVED_GROUP_COUNT_DRIFT');
  const hrById=new Map(hr.shoppers.map(row=>[sid(row),row]));
  let checkedHrNames=0;
  for(const group of groups.values()){
    const countries=new Set();
    for(const id of group.hrs){const profile=state.profiles.get(id)||{},row=hrById.get(id);
      assert(row,'APPROVED_HR_CANONICAL_NOT_IN_CURRENT_HR');
      assert(displayName(profile)&&displayName(row)&&displayName(profile)===displayName(row),'APPROVED_HR_NAME_FIELD_DRIFT');
      assert(country(profile)!=='UNSET'&&country(profile)===country(row),'APPROVED_HR_COUNTRY_FIELD_DRIFT');
      countries.add(country(row));checkedHrNames++;
    }
    assert(countries.size===1,'APPROVED_GROUP_CROSS_COUNTRY');
    group.country=[...countries][0];group.cases.sort();group.aliases=[...group.accounts].filter(id=>!group.hrs.has(id)).sort();
  }
  assert(checkedHrNames===97,'APPROVED_HR_NAME_VERIFICATION_COUNT_DRIFT');
  return [...groups.values()].sort((a,b)=>a.cases[0].localeCompare(b.cases[0]));
}
function owned(row,aliases){
  const data=row.data||row,ids=new Set(aliases);
  return ownerFields.some(field=>ids.has(val(data[field])))||
    ownerArrays.some(field=>arr(data[field]).some(x=>ids.has(val(x))));
}
function domainOwned(state,aliases){
  return state.domains.map(d=>({name:d.name,rows:d.rows.filter(x=>owned(x,aliases))}));
}
function authValid(member,user,id){
  const c=user?.customClaims||{};
  return !!user&&!user.disabled&&member?.active===true&&val(member.tenantId)===TENANT&&
    val(member.role)==='shopper'&&val(member.authNamespace)==='shopper'&&val(member.shopperId)===id&&
    arr(member.projectIds).includes(PROGRAM)&&val(c.tenantId)===TENANT&&val(c.role)==='shopper'&&
    val(c.authNamespace)==='shopper'&&val(c.shopperId)===id&&arr(c.projectIds).includes(PROGRAM);
}
function adjudicationPlan(group,state,authByUid){
  const canonical=[...group.hrs][0],ids=unique([...group.hrs,...group.accounts]);
  const refs=domainOwned(state,group.aliases),counts=Object.fromEntries(refs.map(d=>[d.name,d.rows.length]));
  const allMembers=ids.flatMap(id=>state.users.filter(m=>m.active===true&&val(m.shopperId)===id).map(m=>({id,member:m})));
  const resolution={code:group.cases[0],caseCodes:group.cases,caseCount:group.cases.length,country:group.country,
    aliasCount:group.aliases.length,domainRows:counts,action:'HOLD'};
  if(group.hrs.size!==1){resolution.reason='MULTIPLE_HR_CANONICAL';return {resolution};}
  if(!group.aliases.length){resolution.reason='NO_EXACT_ALIAS';return {resolution};}
  const trusted=state.links.filter(l=>val(l.authorityType)==='tenant_adjudication'&&
    /^paula_confirmed_exact_same_human_[fr]\d{3}_2026_10_28$/.test(val(l.reason))&&
    l.humanConfirmed===true&&['active','approved','confirmed'].includes(val(l.status||l.state).toLowerCase())&&
    val(l.canonicalShopperId)===canonical);
  if(group.aliases.every(id=>trusted.some(l=>arr(l.exactAliases).map(val).includes(id)))&&
    group.aliases.every(id=>val(state.cross.get(id)?.shopperId)===canonical&&
    val(state.profiles.get(id)?.supersededByShopperId)===canonical)&&
    Object.values(counts).every(n=>n===0)){
    resolution.action='ALREADY_VERIFIED';resolution.reason='EXACT_PROVIDER_LINK_AND_ZERO_RESIDUAL';return {resolution};
  }
  if(ids.some(id=>state.users.filter(m=>m.active===true&&val(m.shopperId)===id).length>1)){
    resolution.reason='MULTIPLE_ACTIVE_MEMBERSHIPS';return {resolution};
  }
  const principals=[];
  for(const {id,member} of allMembers){const user=authByUid.get(member.uid);
    if(!authValid(member,user,id)){resolution.reason='AUTH_PRINCIPAL_CLAIMS_DRIFT';return {resolution};}
    const proof=val(member.credentialPasswordProofVersion)===ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION||
      val(state.profiles.get(id)?.credentialPasswordProofVersion)===ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
    principals.push({id,member,user,proof});
  }
  const strong=principals.filter(x=>x.proof);
  let keeper=strong.length===1?strong[0]:null;
  if(!keeper&&strong.length>1){const rule=ShopperCredentialRule.shopperCredentialRule(state.profiles.get(canonical));
    const login=rule?.ok?val(rule.login).toLowerCase():'';
    const matching=strong.filter(x=>val(x.member.visibleLogin||state.profiles.get(x.id)?.visibleLogin).toLowerCase()===login);
    if(matching.length===1)keeper=matching[0];
  }
  if(!keeper||!val(keeper.member.visibleLogin)){resolution.reason='KEEPER_PASSWORD_PROOF_NOT_UNIQUE';return {resolution};}
  if(!val(keeper.user.email).endsWith('@auth.cxorbia.invalid')){
    resolution.reason='KEEPER_AUTH_NAMESPACE_UNEXPECTED';return {resolution};
  }
  for(const secondary of principals.filter(x=>x.id!==keeper.id)){
    const raw=val(secondary.user.metadata?.lastSignInTime),t=Date.parse(raw);
    if(raw&&(!Number.isFinite(t)||Date.now()-t<7*86400000)){
      resolution.reason='SECONDARY_RECENT_SIGNIN';return {resolution};
    }
  }
  for(const alias of group.aliases){const x=state.cross.get(alias)||{},target=val(x.shopperId||x.canonicalShopperId);
    if(target&&target!==alias){resolution.reason='EXISTING_ALIAS_CROSSWALK';return {resolution};}
    if(state.links.some(l=>['active','confirmed','approved','materialized'].includes(val(l.status||l.state).toLowerCase())&&
      [l.sourceShopperId,l.sourceIdentityKey,...arr(l.exactAliases),...arr(l.sourceAliases)].map(val).includes(alias)&&
      val(l.canonicalShopperId)!==canonical&&val(l.canonicalShopperId)!==alias)){
      resolution.reason='OTHER_TRUSTED_LINK_CONFLICT';return {resolution};
    }
  }
  const writeCount=refs.reduce((n,d)=>n+d.rows.length,0);
  if(writeCount>70){resolution.reason='DOMAIN_WRITE_BUDGET_PREFLIGHT';return {resolution};}
  resolution.action='ELIGIBLE';resolution.reason='EXACT_PAULA_APPROVAL_VERIFIED_KEEPER_WITH_HISTORY_PRESERVATION';
  const visits=refs.find(d=>d.name==='visits').rows.map(x=>x.id);
  return {resolution,canonical,keeper,principals,refs,visits,expectedDomainWrites:writeCount};
}
async function protectedOperator(auth,state,hr){
  const candidates=state.users.filter(m=>m.active===true&&val(m.role)==='super'&&val(m.authNamespace)==='staff').sort((a,b)=>a.uid.localeCompare(b.uid));
  let operatorUid='';
  for(const member of candidates){try{const u=await auth.getUser(member.uid),c=u.customClaims||{};
    if(!u.disabled&&val(c.tenantId)===TENANT&&val(c.role)==='super'&&val(c.authNamespace)==='staff'){
      operatorUid=member.uid;break;
    }
  }catch{}}
  assert(operatorUid,'NO_PROTECTED_SUPER_OPERATOR');
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1420,height:930},serviceWorkers:'block'}),page=await context.newPage();
  await page.goto(ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'+
    '&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'+
    '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:60000});
  await page.evaluate(async token=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
    await window.firebase.auth().signInWithCustomToken(token);},await auth.createCustomToken(operatorUid));
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&
    window.CX?.backendAuth?.context?.()?.role==='super'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
    typeof window.CX?.commandAdapter?.execute==='function'&&
    typeof window.CX?.shopperAdminCommandContract?.identityAdjudicate==='function',null,{timeout:120000});
  await page.evaluate(period=>window.CX.data?.setCurrentPeriod?.(period),hr.periodId);
  const scope=await page.evaluate(()=>{const a=window.CX.backendAuth.context(),d=window.CX.data.ctx();
    return {role:a.role,tenantId:a.tenantId,authNamespace:a.authNamespace,projectId:d.projectId,periodId:d.periodId};});
  assert(scope.role==='super'&&scope.tenantId===TENANT&&scope.authNamespace==='staff'&&
    scope.projectId===PROGRAM&&scope.periodId===hr.periodId,'PROTECTED_OPERATOR_SCOPE_DRIFT');
  return {context,page};
}
function preservedSnapshot(profile){return Object.fromEntries(immutableFields.filter(key=>
  Object.prototype.hasOwnProperty.call(profile||{},key)).map(key=>[key,profile[key]]));}
function clone(value){return JSON.parse(JSON.stringify(value));}
function expectedAfter(row,aliases,canonical){
  const output=clone(row.data),set=new Set(aliases);
  for(const field of ownerFields)if(set.has(val(output[field])))output[field]=canonical;
  for(const field of ownerArrays)if(Array.isArray(output[field])){
    const next=unique(output[field].map(x=>set.has(val(x))?canonical:x));
    if(JSON.stringify(next)!==JSON.stringify(unique(output[field])))output[field]=next;
  }
  return output;
}
async function independentReadback({db,auth,group,plan,receiptKey,ack,hr}){
  const state=await readState(db),afterHr=await readHr();
  assert(afterHr.revision===hr.revision,'HR_REVISION_CHANGED_AFTER_WRITE');
  assert(afterHr.visits.length===hr.visits.length&&afterHr.shoppers.length===hr.shoppers.length,'HR_ROWS_CHANGED_AFTER_WRITE');
  const canonical=plan.canonical,aliasSet=new Set(group.aliases),keeperUid=plan.keeper.member.uid;
  const keeper=await auth.getUser(keeperUid);
  assert(!keeper.disabled&&val(keeper.customClaims?.shopperId)===canonical,'KEEPER_AUTH_CLAIMS_READBACK');
  const member=state.users.filter(m=>m.uid===keeperUid);
  assert(member.length===1&&member[0].active===true&&val(member[0].shopperId)===canonical&&
    val(member[0].visibleLogin)===val(plan.keeper.member.visibleLogin)&&
    val(keeper.email)===val(plan.keeper.user.email),'KEEPER_ACCESS_PRESERVATION_READBACK');
  assert(state.users.filter(m=>m.active===true&&val(m.shopperId)===canonical).length===1,'MULTIPLE_CANONICAL_MEMBERSHIPS');
  assert(state.users.filter(m=>m.active===true&&aliasSet.has(val(m.shopperId))).length===0,'ACTIVE_ALIAS_MEMBERSHIP_REMAINS');
  for(const other of plan.principals.filter(x=>x.member.uid!==keeperUid)){
    assert((await auth.getUser(other.member.uid)).disabled===true,'SECONDARY_ACCESS_RETIREMENT_NOT_VERIFIED');
  }
  const cp=state.profiles.get(canonical)||{};
  assert(val(cp.shopperId)===canonical&&group.aliases.every(id=>arr(cp.exactAliases).includes(id)),'CANONICAL_PROFILE_MISSING_ALIASES');
  for(const alias of group.aliases){const ap=state.profiles.get(alias)||{},old=plan.originalProfiles.get(alias)||{};
    assert(val(ap.supersededByShopperId)===canonical,'ALIAS_NOT_SUPERSEDED');
    assert(sha(stable(preservedSnapshot(ap)))===sha(stable(preservedSnapshot(old))),
      'NAME_ADDRESS_LOGIN_PHONE_VARIANT_NOT_PRESERVED');
    assert(val(state.cross.get(alias)?.shopperId)===canonical,'ALIAS_CROSSWALK_NOT_UPDATED');
  }
  assert(val(state.cross.get(canonical)?.shopperId)===canonical,'CANONICAL_CROSSWALK_NOT_UPDATED');
  assert(group.aliases.every(id=>arr(cp.sourceShopperIds).includes(id)),'ALIAS_PROVENANCE_NOT_PRESERVED');
  const residual=domainOwned(state,group.aliases);
  assert(residual.every(d=>d.rows.length===0),'OPERATIONAL_ALIAS_REFERENCE_RESIDUAL');
  for(const domain of plan.refs){const final=state.domains.find(d=>d.name===domain.name);
    for(const old of domain.rows){const target=final.rows.find(x=>x.id===old.id);
      assert(target,'HISTORICAL_ROW_DELETED');
      const expected=expectedAfter(old,group.aliases,canonical),observed=clone(target.data);
      delete expected.identityConsolidatedAt;delete observed.identityConsolidatedAt;
      assert(sha(stable(expected))===sha(stable(observed)),'HISTORICAL_FINANCIAL_VISIT_FIELD_CHANGED');
    }
  }
  const link=state.links.find(l=>val(l.id)===val(ack.identityLinkId));
  assert(link&&link.providerAck===true&&val(link.canonicalShopperId)===canonical&&
    group.aliases.every(id=>arr(link.exactAliases).includes(id)),'PROTECTED_IDENTITY_LINK_READBACK');
  const receiptId=sha([TENANT,PROGRAM,hr.periodId,receiptKey].join('\0')).slice(0,40);
  const receipt=await state.tenant.collection('commandReceipts').doc(receiptId).get();
  assert(receipt.exists&&receipt.data()?.providerAck===true&&receipt.data()?.identityConsolidated===true&&
    val(receipt.data()?.status)==='committed','PROVIDER_RECEIPT_READBACK');
  return {canonicalMemberships:1,aliasMemberships:0,keeperLoginPreserved:true,profileVariantsPreserved:true,
    aliasCrosswalkPreserved:true,visitRowsReassigned:plan.visits.length,
    domainRowsReassigned:Object.fromEntries(plan.refs.map(d=>[d.name,d.rows.length])),
    noDeletedAffectedRows:true,financialAmountsAndHistoryPreserved:true,hrUnmodified:true};
}
async function execute({auth,db,operator,group,plan,hr}){
  const canonical=plan.canonical,keeperUid=plan.keeper.member.uid,aliases=group.aliases;
  const allVisits=plan.refs.find(d=>d.name==='visits').rows.map(x=>x.id);
  const preserve=allVisits.length?allVisits:['__preserve_all_alias_visit_history__'];
  const reason='paula_confirmed_exact_same_human_'+group.cases[0].toLowerCase().replace('-','')+'_2026_10_28';
  const key='i3-approved139-'+group.cases[0].toLowerCase()+':'+
    sha([TENANT,PROGRAM,hr.periodId,canonical,...aliases,keeperUid,hr.revision,...preserve].join('\0')).slice(0,32);
  const originalProfiles=new Map(aliases.map(id=>[id,clone(plan.stateProfiles.get(id)||{})]));
  plan.originalProfiles=originalProfiles;
  const outcome=await operator.page.evaluate(async input=>{
    const actor=window.CX.backendAuth.context()||{};
    const built=window.CX.shopperAdminCommandContract.identityAdjudicate({
      tenantId:actor.tenantId,projectId:input.projectId,periodId:input.periodId,
      projectIds:Array.isArray(actor.projectIds)&&actor.projectIds.length?actor.projectIds:[input.projectId],
      actorId:actor.actorId,actorRole:actor.role,canonicalShopperId:input.canonical,
      aliasShopperIds:input.aliases,humanConfirmed:true,expectedVersion:'provider-current',
      idempotencyKey:input.key,reason:input.reason,keeperShopperId:input.keeper,
      keeperAccessConfirmed:true,preserveHistoricalVisitRows:true,authoritativeVisitIds:input.preserve
    });
    if(!built?.ok)return {built:false,errors:built?.errors||[]};
    const first=await window.CX.commandAdapter.execute(built.command);
    if(first?.ok!==true)return {built:true,first};
    const replay1=await window.CX.commandAdapter.execute(built.command);
    const replay2=await window.CX.commandAdapter.execute(built.command);
    return {built:true,first,replay1,replay2};
  },{projectId:PROGRAM,periodId:hr.periodId,canonical,aliases,keeper:plan.keeper.id,key,reason,preserve});
  assert(outcome.built===true,'PROTECTED_COMMAND_BUILD_FAILED');
  const ack=outcome.first||{};
  if(ack.ok!==true||ack.providerAck!==true){
    // Unknown network outcome: do not retry or continue other groups blindly.
    throw new Error('PROVIDER_ACK_UNKNOWN_STOP_AND_RECONCILE');
  }
  assert(ack.identityConsolidated===true&&val(ack.canonicalShopperId||ack.entityId)===canonical&&
    aliases.every(id=>arr(ack.exactAliases).includes(id))&&
    ack.historicalVisitRowsPreserved===true&&Number(ack.authoritativeVisitCount)===preserve.length&&
    Number(ack.domainWrites?.visits||0)===allVisits.length&&
    Number(ack.hrWrites||0)===0&&Number(ack.externalWrites||0)===0,'PROVIDER_ACK_CONTENT_MISMATCH');
  for(const replay of [outcome.replay1,outcome.replay2])assert(replay?.ok===true&&replay?.providerAck===true&&
    replay?.idempotentReplay===true&&Number(replay?.providerWrites||0)===0,'IDEMPOTENT_ZERO_WRITE_REPLAY_FAILED');
  const readback=await independentReadback({db,auth,group,plan,receiptKey:key,ack,hr});
  return {providerWrites:Number(ack.providerWrites||0),
    domainWrites:ack.domainWrites||{},readback,providerAck:true,replays:2};
}

try{
  assert(process.env.CX_I3_APPROVED139_BATCH===AUTHORITY,'BATCH_EXECUTION_AUTHORITY_MISSING');
  assert(process.env.CX_I3_APPROVED139_DIGEST===PAIR_DIGEST,'BATCH_APPROVAL_DIGEST_MISSING');
  assert(process.env.GOOGLE_CLOUD_PROJECT===PROJECT||process.env.GCLOUD_PROJECT===PROJECT,'DEV_PROJECT_GUARD');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore();
  const hr=await readHr(),state=await readState(db),authByUid=await readAuthUsers(auth);
  const groups=approvedGroups(state,hr),plans=groups.map(group=>({group,...adjudicationPlan(group,state,authByUid)}));
  report.preflight={hrRevision:hr.revision,hrShoppers:hr.shoppers.length,hrVisits:hr.visits.length,
    currentPeriodId:hr.periodId,verifiedCasePairs:139,verifiedHrNames:97,groups:83,
    byAction:Object.fromEntries(['ALREADY_VERIFIED','ELIGIBLE','HOLD'].map(action=>
      [action,plans.filter(x=>x.resolution.action===action).length]))};
  report.alreadyVerified=plans.filter(x=>x.resolution.action==='ALREADY_VERIFIED').length;
  report.groups=plans.map(x=>({...x.resolution,attempted:false,providerAck:false,readback:false}));
  report.remaining=83-report.alreadyVerified;report.decision='PREFLIGHT_PASS_BATCH_PENDING';save();
  assert(report.alreadyVerified===32,'PRIOR_32_VERIFIED_COUNT_DRIFT');
  assert(report.preflight.byAction.ELIGIBLE>=3,'NO_EXACT_ELIGIBLE_GROUPS');
  const nextHr=await readHr();
  assert(nextHr.revision===hr.revision&&nextHr.visits.length===hr.visits.length&&
    nextHr.shoppers.length===hr.shoppers.length,'HR_CHANGED_BEFORE_BATCH');
  const operator=await protectedOperator(auth,state,hr);
  report.decision='BATCH_IN_PROGRESS';save();
  for(const original of plans.filter(x=>x.resolution.action==='ELIGIBLE')){
    const result=report.groups.find(x=>x.code===original.resolution.code);
    // Reconstruct all exact approved identity links on each live preflight; no
    // stale snapshot can silently authorize a later write in the same run.
    const currentHr=await readHr();
    assert(currentHr.revision===hr.revision&&currentHr.periodId===hr.periodId,'HR_CHANGED_DURING_BATCH');
    const currentState=await readState(db),currentAuth=await readAuthUsers(auth);
    const groupsNow=approvedGroups(currentState,currentHr);
    const currentGroup=groupsNow.find(g=>g.cases[0]===original.group.cases[0]);
    assert(currentGroup&&JSON.stringify(currentGroup.aliases)===JSON.stringify(original.group.aliases),
      'APPROVED_GROUP_TOPOLOGY_DRIFT');
    const current=adjudicationPlan(currentGroup,currentState,currentAuth);
    if(current.resolution.action==='ALREADY_VERIFIED'){
      result.action='ALREADY_VERIFIED';result.reason='CONSOLIDATED_DURING_RUN';
      report.alreadyVerified++;report.remaining--;save();continue;
    }
    if(current.resolution.action!=='ELIGIBLE'){
      result.action='HOLD';result.reason=current.resolution.reason;save();continue;
    }
    current.stateProfiles=currentState.profiles;
    result.attempted=true;report.attempted++;save();
    try{
      const completed=await execute({auth,db,operator,group:currentGroup,plan:current,hr:currentHr});
      result.action='MERGED_VERIFIED';result.providerAck=true;result.readback=true;
      result.providerWrites=completed.providerWrites;result.domainWrites=completed.domainWrites;
      result.conservation=completed.readback;result.idempotentReplays=completed.replays;
      report.merged++;report.remaining--;save();
      console.log(JSON.stringify({caseCode:result.code,decision:'MERGED_VERIFIED',
        country:result.country,domainRows:result.domainRows,production:false}));
    }catch(error){
      result.action='HOLD_WRITE_OR_READBACK';result.reason=sanitize(error);
      report.decision='HOLD_STOP_AFTER_POSSIBLE_WRITE';report.fatalCode=result.reason;save();
      throw error; // A provider timeout or readback failure may have written. Stop, never replay blindly.
    }
  }
  await operator.context.close();
  const afterHr=await readHr();
  assert(afterHr.revision===hr.revision&&afterHr.visits.length===hr.visits.length&&
    afterHr.shoppers.length===hr.shoppers.length,'HR_CHANGED_AFTER_BATCH');
  report.decision=report.merged>0?'PASS_VERIFIED_DEV_BATCH_WITH_FOCAL_HOLDS':'HOLD_NO_NEW_MERGES';
  report.completedAt=stamp();save();
  console.log(JSON.stringify({decision:report.decision,approvedGroups:83,alreadyVerified:report.alreadyVerified,
    merged:report.merged,remaining:report.remaining,held:report.groups.filter(x=>x.action==='HOLD').length,
    production:false}));
}catch(error){
  report.fatalCode=report.fatalCode||sanitize(error);
  if(!report.decision.startsWith('HOLD_STOP'))report.decision='HOLD_BATCH_PREWRITE_OR_GUARD';
  save();console.error(JSON.stringify({decision:report.decision,errorCode:report.fatalCode,
    approvedGroups:83,alreadyVerified:report.alreadyVerified,merged:report.merged,remaining:report.remaining,
    production:false}));process.exitCode=2;
}finally{try{if(browser)await browser.close();}catch{}}
