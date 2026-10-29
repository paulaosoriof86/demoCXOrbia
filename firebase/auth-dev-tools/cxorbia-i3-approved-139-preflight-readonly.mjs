#!/usr/bin/env node
/* CXOrbia I3: READ-ONLY preflight of Paula's 139 explicit YES decisions.
 * Fails closed if the exact 28-Oct approved identities or HR source differ.
 * No raw identities, names, phones, logins, or UIDs are emitted to logs/artifacts.
 * No Firebase Auth, Firestore, HR, Hosting, or product source writes.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
// The plain HR representation deliberately masks shopper display names.
// Compare against the app's source-safe, display-name-only DEV operational
// view; require its explicit authority bit or fail closed before adjudication.
const HR_URL='https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV';
const EXPECTED_REV='4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a';
const EXPECTED_PAIR_DIGEST='ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872';
const AUTHORIZATION='PAULA_CONFIRMED_2026_10_28_139_EXACT_COHORT_PAIRS_READONLY_PREFLIGHT';
const OUT=String(process.env.CX_APPROVED_COHORT_PREFLIGHT_OUT||'.tmp/i3-approved-cohort-preflight');
const val=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const norm=v=>val(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const country=v=>{const c=norm(v?.pais||v?.country||v?.país);return c==='honduras'||c==='hn'?'HN':c==='guatemala'||c==='gt'?'GT':c?'OTHER':'UNSET';};
const name=v=>norm(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const displayName=v=>val(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const phone=v=>val(v?.whatsapp||v?.phone||v?.telefono).replace(/[^0-9]/g,'');
const sid=v=>val(v?.shopperId||v?.id);
const uniq=v=>[...new Set(arr(v).map(val).filter(Boolean))];
const assert=(truth,code)=>{if(!truth)throw new Error(code);};
const report={schemaVersion:'cxorbia.i3.approved139.preflight.v1',decision:'HOLD',environment:'DEV',project:PROJECT,
  tenant:TENANT,production:false,approvedCases:139,approvedIdentityGroups:83,sourceRevision:EXPECTED_REV,
  authWrites:0,firestoreWrites:0,hrWrites:0,externalWrites:0,deployments:0,merges:0,credentialResets:0};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(report,null,2)+'\n','utf8');
save();

async function readCurrentHr(){
  const response=await fetch(HR_URL+'&approvedPreflight='+Date.now(),{
    headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(120000)});
  assert(response.ok,'HR_PROVIDER_HTTP_'+response.status);
  const body=await response.json(),snapshot=body.snapshot||body.data||body;
  const revision=val(body.revision||body._runtime?.revision||snapshot.sourceRevision);
  assert(revision===EXPECTED_REV,'HR_SOURCE_REVISION_DRIFT');
  assert(body._runtime?.operationalView===true&&snapshot.operationalIdentityPreview===true,
    'HR_OPERATIONAL_DISPLAY_IDENTITY_VIEW_NOT_PROVEN');
  assert(arr(snapshot.shoppers).length>0&&arr(snapshot.visits).length>0,'HR_EMPTY');
  return {shoppers:snapshot.shoppers,visits:snapshot.visits,revision,
    currentPeriodId:val(snapshot.currentPeriodId||snapshot.currentPeriodKey),
    periodCount:arr(snapshot.periods).length};
}
function authValid(member,user){
  const claims=user?.customClaims||{};
  return !!user&&!user.disabled&&val(claims.tenantId)===TENANT&&val(claims.role)==='shopper'&&
    val(claims.authNamespace)==='shopper'&&val(claims.shopperId)===val(member.shopperId)&&
    arr(claims.projectIds).includes(PROGRAM)&&val(member.tenantId)===TENANT&&
    val(member.role)==='shopper'&&val(member.authNamespace)==='shopper'&&member.active===true;
}
function currentCanonical(memberId,cross,hrById){
  if(hrById.has(memberId))return memberId;
  const row=cross.get(memberId)||{},c=val(row.shopperId||row.canonicalShopperId);
  if(val(row.tenantId)===TENANT&&(!arr(row.projectIds).length||arr(row.projectIds).includes(PROGRAM))&&hrById.has(c))return c;
  return '';
}
function makePairs({members,profiles,hrById,cross,authByUid}){
  const strong=[],weak=[];
  const active=members.filter(m=>m.active===true&&val(m.tenantId)===TENANT&&val(m.role)==='shopper'&&
    val(m.authNamespace)==='shopper'&&arr(m.projectIds).includes(PROGRAM));
  for(const member of active){
    if(!authValid(member,authByUid.get(member.uid)))continue;
    const accountId=val(member.shopperId),profile=profiles.get(accountId);
    if(!profile||currentCanonical(accountId,cross,hrById))continue;
    const n=name(profile),p=phone(profile),c=country(profile);
    if(!n||c==='UNSET')continue;
    const matches=[];
    for(const [id] of hrById){
      const source=profiles.get(id);
      if(!source||val(source.sourceType)!=='hr_external'||country(source)!==c||name(source)!==n)continue;
      matches.push({id,phoneExact:!!p&&p===phone(source)});
    }
    const exact=matches.filter(x=>x.phoneExact);
    if(exact.length===1){strong.push({hrId:exact[0].id,accountId,country:c,hrName:displayName(profiles.get(exact[0].id))});continue;}
    if(exact.length===0)for(const x of matches){weak.push({hrId:x.id,accountId,country:c,hrName:displayName(profiles.get(x.id))});}
  }
  const sorter=(a,b)=>a.country.localeCompare(b.country)||a.hrName.localeCompare(b.hrName,'es')||a.accountId.localeCompare(b.accountId);
  strong.sort(sorter);weak.sort(sorter);
  assert(strong.length===66&&weak.length===73,'APPROVED_COHORT_COUNT_DRIFT');
  const cases=[...strong.map((x,i)=>({...x,caseId:'F-'+String(i+1).padStart(3,'0')})),
    ...weak.map((x,i)=>({...x,caseId:'R-'+String(i+1).padStart(3,'0')}))];
  const digest=hash(cases.map(c=>c.caseId+'\0'+c.hrId+'\0'+c.accountId).join('\n'));
  assert(digest===EXPECTED_PAIR_DIGEST,'APPROVED_EXACT_PAIR_DIGEST_DRIFT');
  return cases;
}
function components(cases){
  const parent=new Map(),find=id=>{if(!parent.has(id))parent.set(id,id);if(parent.get(id)!==id)parent.set(id,find(parent.get(id)));return parent.get(id);};
  const union=(a,b)=>{const x=find(a),y=find(b);if(x!==y)parent.set(y,x);};
  const byCase=new Map(cases.map(x=>[x.caseId,x]));
  for(const x of cases)union('H:'+x.hrId,'A:'+x.accountId);
  const extra=[['F-015','F-016'],['F-017','F-019'],['F-024','F-025'],['F-024','F-027'],
    ['F-032','F-033'],['F-034','F-035'],['F-034','F-036'],['F-061','F-062']];
  for(const [a,b] of extra){assert(byCase.has(a)&&byCase.has(b),'APPROVED_NOTE_REF_MISSING');
    assert(byCase.get(a).country===byCase.get(b).country,'APPROVED_NOTE_CROSS_COUNTRY');
    union('H:'+byCase.get(a).hrId,'H:'+byCase.get(b).hrId);
  }
  const group=new Map();
  for(const x of cases){const id=find('H:'+x.hrId);if(!group.has(id))group.set(id,{cases:[],hrs:new Set(),accounts:new Set(),countries:new Set()});
    const g=group.get(id);g.cases.push(x.caseId);g.hrs.add(x.hrId);g.accounts.add(x.accountId);g.countries.add(x.country);}
  assert(group.size===83,'APPROVED_GROUP_COUNT_DRIFT');
  assert([...group.values()].every(x=>x.countries.size===1),'APPROVED_GROUP_CROSS_COUNTRY');
  return [...group.values()];
}
function keeperDecision(group,membersByShopper,profiles,authByUid){
  const allIds=uniq([...group.hrs,...group.accounts]);
  const principals=[];
  for(const id of allIds){
    const matches=membersByShopper.get(id)||[];
    if(matches.length>1)return 'HOLD_MULTIPLE_ACTIVE_MEMBERSHIPS';
    if(!matches.length)continue;
    const m=matches[0],u=authByUid.get(m.uid);
    if(!authValid(m,u))return 'HOLD_AUTH_CLAIMS_OR_MEMBERSHIP';
    const proof=val(m.credentialPasswordProofVersion)===ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION||
      val(profiles.get(id)?.credentialPasswordProofVersion)===ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
    principals.push({id,m,u,proof});
  }
  if(!principals.length)return 'HOLD_NO_ACTIVE_PRINCIPAL';
  const canonical=[...group.hrs][0],profile=profiles.get(canonical);
  if(!profile||val(profile.sourceType)!=='hr_external')return 'HOLD_HR_CANONICAL_PROFILE_MISSING';
  const credential=ShopperCredentialRule.shopperCredentialRule(profile);
  const login=credential?.ok?val(credential.login).toLowerCase():'';
  const strong=principals.filter(x=>x.proof);
  let keeper=strong.length===1?strong[0]:null;
  if(!keeper&&strong.length>1&&login){
    const matched=strong.filter(x=>val(x.m.visibleLogin||profiles.get(x.id)?.visibleLogin||'').toLowerCase()===login);
    if(matched.length===1)keeper=matched[0];
  }
  if(!keeper)return 'HOLD_KEEPER_NOT_VERIFIED';
  if(!val(keeper.m.visibleLogin))return 'HOLD_KEEPER_LOGIN_MISSING';
  for(const principal of principals.filter(x=>x.id!==keeper.id)){
    const raw=val(principal.u.metadata?.lastSignInTime),t=Date.parse(raw);
    if(raw&&(!Number.isFinite(t)||Date.now()-t<7*24*3600*1000))return 'HOLD_SECONDARY_RECENT_SIGNIN';
  }
  return 'KEEPER_VERIFIED';
}
async function livePreflight({db,auth,hr}){
  const tenant=db.collection('tenants').doc(TENANT);
  const [membersSnap,profilesSnap,crossSnap,linksSnap]=await Promise.all([
    tenant.collection('users').get(),tenant.collection('shoppers').get(),tenant.collection('shopperIdentityCrosswalk').get(),tenant.collection('shopperIdentityLinks').get()]);
  const members=membersSnap.docs.map(d=>({uid:d.id,...(d.data()||{})}));
  const profiles=new Map(profilesSnap.docs.map(d=>[d.id,d.data()||{}]));
  const cross=new Map(crossSnap.docs.map(d=>[d.id,d.data()||{}]));
  const links=linksSnap.docs.map(d=>d.data()||{});
  const hrById=new Map();
  for(const row of hr.shoppers){const id=sid(row);assert(id&&!hrById.has(id),'HR_DUPLICATE_ID');hrById.set(id,row);}
  const authUsers=[];let token;
  do{const page=await auth.listUsers(1000,token);authUsers.push(...page.users);token=page.pageToken;}while(token);
  const authByUid=new Map(authUsers.map(u=>[u.uid,u]));
  const cases=makePairs({members,profiles,hrById,cross,authByUid});
  const groups=components(cases),byMember=new Map();
  for(const m of members.filter(m=>m.active===true)){
    const id=val(m.shopperId);if(!byMember.has(id))byMember.set(id,[]);byMember.get(id).push(m);
  }
  const project=tenant.collection('projects').doc(PROGRAM);
  const areas=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],
    ['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
  const snapshots=await Promise.all(areas.map(([scope,name])=>
    (scope==='tenant'?tenant:project).collection(name).get()));
  const domain=snapshots.map((snap,i)=>({name:areas[i][1],rows:snap.docs.map(doc=>doc.data()||{})}));
  const scalar=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId',
    'ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
  const arrays=['shopperIds','candidateShopperIds'];
  const countOwners=(row,ids)=>scalar.some(f=>ids.has(val(row[f])))||arrays.some(f=>arr(row[f]).some(x=>ids.has(val(x))));
  const results=[],hrNameRelations=[];
  for(const group of groups){
    const aliases=new Set([...group.accounts].filter(id=>!group.hrs.has(id)));
    const code=group.hrs.size>1?'HOLD_MULTIPLE_HR_CANONICAL':keeperDecision(group,byMember,profiles,authByUid);
    let status=code;
    const sourceConsistency={hrNameDrifts:0,hrCountryDrifts:0,hrNameMissing:0,hrCountryMissing:0,
      nameRelations:[]};
    for(const id of group.hrs){
      const live=hrById.get(id)||{},protectedSource=profiles.get(id)||{};
      const liveName=name(live),protectedName=name(protectedSource);
      const liveCountry=country(live),protectedCountry=country(protectedSource);
      if(!liveName||!protectedName)sourceConsistency.hrNameMissing++;
      else if(liveName!==protectedName)sourceConsistency.hrNameDrifts++;
      const hrTokens=liveName.split(' ').filter(Boolean),profileTokens=protectedName.split(' ').filter(Boolean);
      const intersection=hrTokens.filter(t=>profileTokens.includes(t)).length;
      const relation=!liveName||!protectedName?'MISSING':liveName===protectedName?'EQUAL':
        liveName.includes(protectedName)?'HR_CONTAINS_PROFILE':
          protectedName.includes(liveName)?'PROFILE_CONTAINS_HR':intersection?'TOKEN_OVERLAP':'DISJOINT';
      const relationProof={relation,hrTokenCount:hrTokens.length,profileTokenCount:profileTokens.length,
        overlapTokenCount:intersection,firstTokenEqual:!!hrTokens.length&&hrTokens[0]===profileTokens[0],
        lastTokenEqual:!!hrTokens.length&&hrTokens.at(-1)===profileTokens.at(-1)};
      sourceConsistency.nameRelations.push(relationProof);
      hrNameRelations.push(relationProof);
      if(liveCountry==='UNSET'||protectedCountry==='UNSET')sourceConsistency.hrCountryMissing++;
      else if(liveCountry!==protectedCountry)sourceConsistency.hrCountryDrifts++;
    }
    const operationalCounts=Object.fromEntries(domain.map(d=>[d.name,d.rows.filter(row=>countOwners(row,aliases)).length]));
    if(status==='KEEPER_VERIFIED'){
      if([...aliases].some(id=>{const target=val(cross.get(id)?.shopperId||cross.get(id)?.canonicalShopperId);return target&&target!==id;}))status='HOLD_ALIAS_CROSSWALK_ALREADY_CHANGED';
      if(links.some(link=>{
        const tokens=[link.sourceIdentityKey,link.sourceShopperId,...arr(link.exactAliases),...arr(link.sourceAliases)].map(val);
        return ['active','confirmed','approved','materialized'].includes(val(link.status||link.state).toLowerCase())&&
          tokens.some(t=>aliases.has(t))&&!group.hrs.has(val(link.canonicalShopperId));
      }))status='HOLD_PRIOR_TRUSTED_LINK_CONFLICT';
      if(operationalCounts.visits>0)status='HOLD_ALIAS_OWNED_VISITS';
      if(Object.values(operationalCounts).reduce((sum,n)=>sum+n,0)>70)status='HOLD_DOMAIN_WRITE_BUDGET';
      if(status==='KEEPER_VERIFIED'&&sourceConsistency.hrNameMissing)status='HOLD_LIVE_HR_NAME_MISSING';
      if(status==='KEEPER_VERIFIED'&&sourceConsistency.hrCountryMissing)status='HOLD_LIVE_HR_COUNTRY_MISSING';
      if(status==='KEEPER_VERIFIED'&&sourceConsistency.hrNameDrifts)status='HOLD_LIVE_HR_NAME_DRIFT';
      if(status==='KEEPER_VERIFIED'&&sourceConsistency.hrCountryDrifts)status='HOLD_LIVE_HR_COUNTRY_DRIFT';
    }
    results.push({caseCodes:[...group.cases].sort(),caseCount:group.cases.length,
      hrCount:group.hrs.size,technicalCount:group.accounts.size,country:[...group.countries][0],
      aliasOwnedVisits:operationalCounts.visits,aliasOwnedOtherDomainRows:
        Object.entries(operationalCounts).filter(([key])=>key!=='visits').reduce((sum,[,n])=>sum+n,0),
      sourceConsistency,status});
  }
  const availabilityByPeriod=new Map();
  // Diagnosis is source-scoped and read-only: distinguish 'disponible' from
  // genuinely unassigned/uncancelled vacancies before interpreting UI zeros.
  for(const visit of hr.visits){
    const periodId=val(visit?.periodId||visit?.periodKey||visit?.periodo)||'UNSET';
    const row=availabilityByPeriod.get(periodId)||{periodId,visits:0,availableByState:0,availableByFlag:0,
      availableAndUnassigned:0,availableButAssigned:0,availableButArchived:0,
      byCountry:{GT:{visits:0,availableByState:0,availableAndUnassigned:0},HN:{visits:0,availableByState:0,availableAndUnassigned:0},OTHER:{visits:0,availableByState:0,availableAndUnassigned:0}}};
    const state=norm(visit?.estado||visit?.status),isAvailable=state==='disponible',flag=visit?.available===true;
    const c=country(visit),countryKey=c==='GT'||c==='HN'?c:'OTHER';
    const assigned=!!val(visit?.shopperId),archived=visit?._archived===true||
      ['cancelada','cancelled','archivada'].includes(state);
    row.visits++;if(isAvailable)row.availableByState++;if(flag)row.availableByFlag++;
    if(isAvailable&&assigned)row.availableButAssigned++;
    if(isAvailable&&archived)row.availableButArchived++;
    if(isAvailable&&!assigned&&!archived)row.availableAndUnassigned++;
    row.byCountry[countryKey].visits++;if(isAvailable)row.byCountry[countryKey].availableByState++;
    if(isAvailable&&!assigned&&!archived)row.byCountry[countryKey].availableAndUnassigned++;
    availabilityByPeriod.set(periodId,row);
  }
  return {groups:groups.length,strongCases:66,weakCases:73,hrWithSeveralSourceRecords:results.filter(x=>x.hrCount>1).length,
    singleHrGroups:results.filter(x=>x.hrCount===1).length,
    byStatus:Object.fromEntries([...results.reduce((map,x)=>(map.set(x.status,(map.get(x.status)||0)+1),map),new Map())].sort()),
    byCountry:Object.fromEntries(['GT','HN'].map(c=>[c,results.filter(x=>x.country===c).length])),
    // Case labels alone allow private follow-up against Paula's workbook without
    // leaking personal names, logins, source IDs, phones, or authentication UIDs.
    groupStatuses:results.sort((a,b)=>a.caseCodes[0].localeCompare(b.caseCodes[0])),
    liveHrNameRelationDistribution:Object.fromEntries([...new Set(hrNameRelations.map(x=>x.relation))].sort().map(k=>
      [k,hrNameRelations.filter(x=>x.relation===k).length])),
    liveHrAvailability:{periodCount:hr.periodCount,currentPeriodId:hr.currentPeriodId,
      totalVisits:hr.visits.length,periods:[...availabilityByPeriod.values()].sort((a,b)=>a.periodId.localeCompare(b.periodId))},
    approvedWorkbookPairDigest:EXPECTED_PAIR_DIGEST,readOnly:true};
}

try{
  assert(process.env.CX_APPROVED_COHORT_PREFLIGHT===AUTHORIZATION,'AUTHORIZATION_GATE');
  assert(process.env.GOOGLE_CLOUD_PROJECT===PROJECT||process.env.GCLOUD_PROJECT===PROJECT,'DEV_PROJECT_GUARD');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore(),hr=await readCurrentHr();
  report.reconciliation=await livePreflight({db,auth,hr});
  const post=await readCurrentHr();assert(post.revision===hr.revision,'HR_CHANGED_DURING_PREFLIGHT');
  report.decision='PASS_APPROVED_COHORT_PREFLIGHT_READONLY';
}catch(error){report.decision='HOLD_APPROVED_COHORT_PREFLIGHT';
  report.errorCode=val(error?.message||error).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,80);
  process.exitCode=2;
}
save();
console.log(JSON.stringify(report));
