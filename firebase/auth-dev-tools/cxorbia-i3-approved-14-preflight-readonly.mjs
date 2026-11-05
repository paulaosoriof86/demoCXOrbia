#!/usr/bin/env node
/* I3 — read-only DEV preflight for the 14 approved hold groups, exact 139-pair
 * fingerprint authority, current HR, provider Auth and Firestore. This report
 * carries no raw shopper identity IDs, emails, passwords, phone or addresses.
 * No IAM, Firestore, Auth, Hosting, runtime or HR writes are permitted here.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import CredentialRule from '../../app/core/shopper-credential-rule.js';

const TENANT='tya',PROGRAM='cinepolis',PROJECT='cxorbia-backend-dev';
const ROOT='https://cxorbia-backend-dev.web.app';
const HR_URL=`${ROOT}/api/${TENANT}/${PROGRAM}/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV`;
const AUTHORITY='PAULA_APPROVED_20261105_14_REMAINING_READONLY_PREFLIGHT';
const DIGEST='ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872';
const USER_CONFIRMED_LOGIN_HASH='6c9c200636d9a84530154ff0dc918e7a0a1b24d0e87d6b8f23b9ab90f3aeb473';
const HASHES=JSON.parse(fs.readFileSync(new URL('./cxorbia-i3-approved-139-pair-hashes.json',import.meta.url),'utf8'));
const OUT=String(process.env.CX_I3_APPROVED14_PREFLIGHT_OUT||'.tmp/i3-approved14-preflight');
const HOLD_CODES=new Set(['F-015','F-017','F-024','F-032','F-034','F-055','F-061','F-064','R-009','R-018','R-027','R-045','R-055','R-064']);
const val=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=x=>[...new Set(arr(x).map(val).filter(Boolean))];
const hash=x=>crypto.createHash('sha256').update(String(x),'utf8').digest('hex');
const norm=v=>val(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const name=v=>norm(v?.nombre||v?.displayName||v?.fullName||v?.name||[v?.firstName,v?.lastName].filter(Boolean).join(' '));
const country=v=>{const c=norm(v?.pais||v?.country||v?.país);return ['hn','honduras'].includes(c)?'HN':['gt','guatemala'].includes(c)?'GT':'UNSET';};
const sid=v=>val(v?.shopperId||v?.id),assert=(x,reason)=>{if(!x)throw new Error(reason);};
const stamp=()=>new Date().toISOString();
const domains=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],
 ['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId',
 'ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'];
const ownerArrays=['shopperIds','candidateShopperIds'];
const report={schemaVersion:'cxorbia.i3.approved14.dev-preflight.v1',iteration:'I3',environment:'DEV',
 production:false,decision:'HOLD_PREFLIGHT',startedAt:stamp(),approvedGroupCount:83,approvedPairs:139,
 priorVerified:69,approvedHoldCodes:[...HOLD_CODES].sort(),authWrites:0,firestoreWrites:0,hrWrites:0,
 identityWrites:0,deployments:0,credentialResets:0,groups:[]};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(`${OUT}/result.json`,JSON.stringify(report,null,2)+'\n');
save();

async function hrRead(){
 const response=await fetch(HR_URL+'&readGuard='+Date.now(),{headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(120000)});
 assert(response.ok,'HR_HTTP_'+response.status);
 const body=await response.json(),data=body.snapshot||body.data||body;
 const revision=val(body.revision||body._runtime?.revision||data.sourceRevision);
 assert(revision.length>=20&&body._runtime?.operationalView===true&&data.operationalIdentityPreview===true,'HR_PROTECTED_VIEW_UNAVAILABLE');
 assert(arr(data.shoppers).length>0&&arr(data.visits).length>0,'HR_EMPTY');
 const months=uniq(data.visits.map(v=>v.periodId||v.periodKey||v.periodo)).filter(x=>/^\d{4}-(0[1-9]|1[0-2])$/.test(x)).sort();
 assert(months.length>0,'HR_PERIOD_MISSING');
 return {shoppers:arr(data.shoppers),visits:arr(data.visits),revision,periodId:`${PROGRAM}-${months.at(-1)}`};
}
async function stateRead(db){
 const tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
 const [profiles,users,cross,links,...owned]=await Promise.all([
   tenant.collection('shoppers').get(),tenant.collection('users').get(),
   tenant.collection('shopperIdentityCrosswalk').get(),tenant.collection('shopperIdentityLinks').get(),
   ...domains.map(([scope,n])=>(scope==='tenant'?tenant:project).collection(n).get())]);
 return {profiles:new Map(profiles.docs.map(d=>[d.id,d.data()||{}])),
   users:users.docs.map(d=>({uid:d.id,...(d.data()||{})})),
   cross:new Map(cross.docs.map(d=>[d.id,d.data()||{}])),
   links:links.docs.map(d=>({id:d.id,...(d.data()||{})})),
   domains:domains.map(([,n],i)=>({name:n,rows:owned[i].docs.map(d=>({id:d.id,data:d.data()||{}}))}))};
}
function approvedGroups(state,hr){
 assert(HASHES.approvedCaseCount===139&&HASHES.approvedGroupCount===83&&HASHES.approvedPairDigest===DIGEST,'APPROVED_PAIR_LOCK_CHANGED');
 const expected=new Map(arr(HASHES.casePairHashes).map(([c,d])=>[val(d),val(c)]));
 assert(expected.size===139,'APPROVED_HASH_COUNT_DRIFT');
 const byCode=new Map();
 for(const [hrId,profile] of state.profiles){
   if(val(profile.sourceType)!=='hr_external')continue;
   for(const accountId of state.profiles.keys()){
     if(hrId===accountId)continue;
     const code=expected.get(hash(hrId+'\0'+accountId));if(!code)continue;
     assert(!byCode.has(code),'APPROVED_PAIR_DUPLICATE');byCode.set(code,{code,hrId,accountId});
   }
 }
 assert(byCode.size===139,'APPROVED_PAIR_NOT_RESOLVED');
 const exact=[...byCode.values()].sort((a,b)=>a.code.localeCompare(b.code));
 assert(hash(exact.map(x=>x.code+'\0'+x.hrId+'\0'+x.accountId).join('\n'))===DIGEST,'APPROVED_PAIR_DIGEST_DRIFT');
 const parent=new Map(),find=x=>{if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,find(parent.get(x)));return parent.get(x);};
 const join=(a,b)=>{const x=find(a),y=find(b);if(x!==y)parent.set(y,x);};
 for(const x of exact)join('H:'+x.hrId,'A:'+x.accountId);
 for(const [a,b] of [['F-015','F-016'],['F-017','F-019'],['F-024','F-025'],['F-024','F-027'],
   ['F-032','F-033'],['F-034','F-035'],['F-034','F-036'],['F-061','F-062']]){
   assert(byCode.has(a)&&byCode.has(b),'APPROVED_GROUP_NOTE_DRIFT');
   join('H:'+byCode.get(a).hrId,'H:'+byCode.get(b).hrId);
 }
 const groups=new Map(),hrById=new Map(hr.shoppers.map(x=>[sid(x),x]));
 for(const x of exact){const id=find('H:'+x.hrId);if(!groups.has(id))groups.set(id,{cases:[],hrs:new Set(),accounts:new Set()});
   const g=groups.get(id);g.cases.push(x.code);g.hrs.add(x.hrId);g.accounts.add(x.accountId);
 }
 assert(groups.size===83,'COHORT_TOPOLOGY_DRIFT');
 let verifiedHr=0;
 for(const group of groups.values()){
   const countries=new Set();group.cases.sort();
   for(const hrId of group.hrs){const p=state.profiles.get(hrId),h=hrById.get(hrId);
     assert(h&&name(p)&&name(h)&&name(p)===name(h),'HR_APPROVED_NAME_DRIFT');
     assert(country(p)!=='UNSET'&&country(p)===country(h),'HR_APPROVED_COUNTRY_DRIFT');
     verifiedHr++;countries.add(country(h));
   }
   assert(countries.size===1,'COHORT_COUNTRY_MIX');group.country=[...countries][0];
 }
 assert(verifiedHr===97,'HR_97_APPROVED_ROWS_DRIFT');
 return [...groups.values()].sort((a,b)=>a.cases[0].localeCompare(b.cases[0]));
}
function ownerReference(row,idSet){const d=row.data||{};
 return ownerFields.some(k=>idSet.has(val(d[k])))||ownerArrays.some(k=>arr(d[k]).some(v=>idSet.has(val(v))));}
function principalValid(member,user,identityId){const c=user?.customClaims||{};
 return !!user&&user.disabled!==true&&member.active===true&&val(member.shopperId)===identityId&&
   val(member.tenantId)===TENANT&&val(member.role)==='shopper'&&val(member.authNamespace)==='shopper'&&arr(member.projectIds).includes(PROGRAM)&&
   val(c.tenantId)===TENANT&&val(c.shopperId)===identityId&&val(c.role)==='shopper'&&val(c.authNamespace)==='shopper'&&arr(c.projectIds).includes(PROGRAM);}
async function evaluateGroup(g,state,auth,hr){
 const hrs=[...g.hrs].sort(),accounts=[...g.accounts].sort(),ids=uniq([...hrs,...accounts]),aliasSet=new Set(ids);
 const members=state.users.filter(m=>m.active===true&&aliasSet.has(val(m.shopperId)));
 const identities=await Promise.all(members.map(async member=>{
   const id=val(member.shopperId),p=state.profiles.get(id)||{},u=await auth.getUser(member.uid).catch(()=>null);
   const time=Date.parse(val(u?.metadata?.lastSignInTime)),age=Number.isFinite(time)?Math.round((Date.now()-time)/86400000):null;
   return {id,member,valid:principalValid(member,u,id),proof:val(member.credentialPasswordProofVersion)===CredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION||
     val(p.credentialPasswordProofVersion)===CredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION,
     login:val(member.visibleLogin||p.visibleLogin||p.username||p.user).toLowerCase(),
     namespaceExpected:!!u&&val(u.email).endsWith('@auth.cxorbia.invalid'),
     ageDays:age,sourceKind:hrs.includes(id)?'HR':'ALIAS'};
 }));
 const rawRefs=state.domains.map(d=>({name:d.name,rows:d.rows.filter(row=>ownerReference(row,aliasSet))}));
 const counts=Object.fromEntries(rawRefs.map(x=>[x.name,x.rows.length]));
 const crossTargets=ids.map(id=>val(state.cross.get(id)?.shopperId||state.cross.get(id)?.canonicalShopperId)).filter(Boolean);
 const outsideCross=crossTargets.filter(target=>!aliasSet.has(target));
 const externalLinks=state.links.filter(l=>{
   const status=val(l.status||l.state).toLowerCase();if(!['active','approved','confirmed','materialized'].includes(status))return false;
   const tokens=uniq([l.sourceShopperId,l.sourceIdentityKey,l.canonicalShopperId,...arr(l.exactAliases),...arr(l.sourceAliases)]);
   return tokens.some(t=>aliasSet.has(t))&&val(l.canonicalShopperId)&&!aliasSet.has(val(l.canonicalShopperId));
 });
 const recent=identities.filter(x=>x.ageDays!==null&&x.ageDays<7),strong=identities.filter(x=>x.proof&&x.valid);
 const rocLogin=identities.filter(x=>hash(x.login)===USER_CONFIRMED_LOGIN_HASH&&x.valid);
 const dominantHr=hrs.map(id=>({id,n:hr.visits.filter(v=>sid(v)===id||val(v.assignedShopperId)===id).length})).sort((a,b)=>b.n-a.n||a.id.localeCompare(b.id));
 const hrMember=identities.filter(x=>hrs.includes(x.id));
 let anchor=dominantHr[0]?.id||hrs[0],anchorReason='STABLE_HR_ID_ORDER';
 if(hrMember.length===1){anchor=hrMember[0].id;anchorReason='UNIQUE_CURRENT_HR_AUTH_PRINCIPAL';}
 else if(dominantHr.length>1&&dominantHr[0].n>dominantHr[1].n){anchor=dominantHr[0].id;anchorReason='MOST_DIRECT_HR_VISIT_REFERENCES';}
 let keeperReason='',keeper=null;
 if(g.cases[0]==='F-064'&&rocLogin.length===1){keeper=rocLogin[0];keeperReason='USER_CONFIRMED_EXACT_VISIBLE_LOGIN';}
 else if(strong.length===1){keeper=strong[0];keeperReason='UNIQUE_PROVEN_CREDENTIAL';}
 else if(recent.length===1&&recent[0].proof&&recent[0].valid){keeper=recent[0];keeperReason='UNIQUE_RECENT_PROVEN_ACTIVE_LOGIN';}
 else if(identities.length===1&&identities[0].valid){keeper=identities[0];keeperReason='SINGLE_ACTIVE_AUTH_UID_KEEP_ACCESS';}
 else if(strong.length>1){
   const rule=CredentialRule.shopperCredentialRule(state.profiles.get(anchor)||{});
   const matches=strong.filter(x=>x.login===val(rule.login).toLowerCase());
   if(matches.length===1){keeper=matches[0];keeperReason='UNIQUE_CANONICAL_CREDENTIAL_RULE_MATCH';}
 }
 const allValid=identities.every(x=>x.valid&&x.namespaceExpected);
 const aliases=ids.filter(id=>id!==anchor),aliasOwners=new Set(aliases);
 const domainCounts=Object.fromEntries(state.domains.map(d=>[d.name,d.rows.filter(row=>ownerReference(row,aliasOwners)).length]));
 const writeBudget=Object.values(domainCounts).reduce((a,b)=>a+b,0);
 const rr={code:g.cases[0],caseCodes:g.cases,country:g.country,hrSourceCount:hrs.length,accountAliasCount:accounts.length,
   unionIdentityCount:ids.length,activePrincipalCount:identities.length,strongCredentialPrincipalCount:strong.length,
   recentSigninPrincipalCount:recent.length,exactUserConfirmedLoginCandidates:rocLogin.length,
   allPrincipalClaimsValid:allValid,activePrincipals:identities.map(x=>({sourceKind:x.sourceKind,verifiedClaims:x.valid,
     strongPasswordProof:x.proof,loginMatchesApprovedRocio:x.login?hash(x.login)===USER_CONFIRMED_LOGIN_HASH:false,
     signInWithinSevenDays:x.ageDays!==null&&x.ageDays<7,authEmailNamespaceExpected:x.namespaceExpected})),
   canonicalChoiceRule:anchorReason,keeperChoiceRule:keeperReason||'UNDETERMINED',
   keeperSourceKind:keeper?.sourceKind||null,keeperProof:keeper?.proof===true,
   crosswalkOutsideApprovedIdentitySet:outsideCross.length,otherTrustedLinkConflicts:externalLinks.length,
   domainRowsToRetarget:domainCounts,domainWriteCount:writeBudget,liveHrVisitCount:hr.visits.length,
   localHistoryReadbackExpected:rawRefs.find(x=>x.name==='visits')?.rows.length||0,
   eligibleReadOnly:!!keeper&&!!keeper.login&&allValid&&!outsideCross.length&&!externalLinks.length&&writeBudget<=380};
 return rr;
}

try{
 assert(process.env.CX_I3_APPROVED14_PREFLIGHT===AUTHORITY,'EXACT_PREFLIGHT_AUTHORITY_REQUIRED');
 assert(process.env.GOOGLE_CLOUD_PROJECT===PROJECT||process.env.GCLOUD_PROJECT===PROJECT,'DEV_PROJECT_ONLY');
 if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
 const db=getFirestore(),auth=getAuth(),hr=await hrRead(),state=await stateRead(db);
 const groups=approvedGroups(state,hr),selected=groups.filter(g=>HOLD_CODES.has(g.cases[0]));
 assert(selected.length===14,'APPROVED_14_HOLD_GROUPS_NOT_FOUND');
 for(const group of selected){const result=await evaluateGroup(group,state,auth,hr);report.groups.push(result);
   console.log(JSON.stringify({caseCode:result.code,readOnlyEligible:result.eligibleReadOnly,
     reason:result.keeperChoiceRule,hrSourceCount:result.hrSourceCount}));
 }
 const hrAgain=await hrRead();assert(hrAgain.revision===hr.revision&&hrAgain.visits.length===hr.visits.length&&hrAgain.shoppers.length===hr.shoppers.length,'HR_REVISION_DRIFT_DURING_READ');
 report.hrRevision=hr.revision;report.hrShoppers=hr.shoppers.length;report.hrVisits=hr.visits.length;
 report.currentPeriodId=hr.periodId;report.exactPairsVerified=139;report.hrNamesVerified=97;
 report.eligibleGroups=report.groups.filter(g=>g.eligibleReadOnly).length;
 report.heldGroups=14-report.eligibleGroups;report.decision='PASS_READONLY_14_GROUP_PREFLIGHT_WITH_FOCAL_HOLDS';
 report.completedAt=stamp();save();
 console.log(JSON.stringify({decision:report.decision,approvedGroups:83,remainingCohortGroups:14,
   readOnlyEligible:report.eligibleGroups,held:report.heldGroups,production:false,writes:0}));
}catch(error){report.decision='HOLD_READONLY_PREFLIGHT';report.errorCode=val(error?.message||error).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,100);save();
 console.error(JSON.stringify({decision:report.decision,errorCode:report.errorCode,production:false,writes:0}));process.exitCode=2;}
