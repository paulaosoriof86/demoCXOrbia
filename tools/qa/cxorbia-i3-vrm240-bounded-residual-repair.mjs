#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const READINESS=String(process.env.VRM240_READINESS||'.tmp/i3-vrm240-readiness/result.json').trim();
const OUT=String(process.env.VRM240_OUT||'.tmp/i3-vrm240-repair').trim();
const REVIEW_ONLY='shopper_hn_9a6963fdf6',SAFE_RETIRE='shopper_gt_8cface989a',CLAIMS_TARGET='shp-b2e3d7bef69b',LOGIN_TARGET='TYA_GT_0C0BA8856E';
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))],norm=v=>str(v).toLowerCase();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const internalEmail=login=>sha(TENANT+'\0shopper\0'+norm(login)).slice(0,48)+'@auth.cxorbia.invalid';
fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm240.bounded-residual-repair.v1',decision:'HOLD',readinessDecision:null,reviewOnly:{},safeRetire:{},claimsRepair:{},loginRepair:{},aliasRemap:{groups:0,aliases:0,authoritativeVisitRows:0,replays:0,providerWrites:0},hrRevision:null,hrWrites:0,externalWrites:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
const fail=(classification,code,extra={})=>{Object.assign(result,{decision:'FAIL_VRM240_BOUNDED_RESIDUAL_REPAIR',classification,code,...extra});save();console.log(JSON.stringify(result,null,2));process.exit(2);};
const need=(ok,classification,code,extra={})=>{if(!ok)fail(classification,code,extra);};
need(fs.existsSync(READINESS),'SOURCE_FAILURE','VRM240_READINESS_MISSING');
const ready=JSON.parse(fs.readFileSync(READINESS,'utf8'));result.readinessDecision=ready.decision;
need(ready.decision==='PASS_VRM239_RESIDUAL_CLOSURE_READINESS','SOURCE_FAILURE','VRM240_READINESS_NOT_PASS');
need(ready.targets?.[REVIEW_ONLY]?.expectedDisposition==='EXCLUDE_FROM_AUTH_ELIGIBLE_POPULATION_PRESERVE_REVIEW_ONLY','MAPPING_FAILURE','VRM240_REVIEW_ONLY_DRIFT');
need(ready.targets?.[SAFE_RETIRE]?.expectedDisposition==='SAFE_PROVIDER_RETIRE','MAPPING_FAILURE','VRM240_RETIRE_DRIFT');
need(ready.targets?.[CLAIMS_TARGET]?.expectedDisposition==='BOUNDED_AUTH_NAMESPACE_CLAIM_REPAIR','AUTH_FAILURE','VRM240_CLAIMS_DRIFT');
need(ready.targets?.[LOGIN_TARGET]?.expectedDisposition==='DURABLE_CREDENTIAL_NORMALIZE_VISIBLE_LOGIN','MAPPING_FAILURE','VRM240_LOGIN_DRIFT');
need(ready.aliasRemap?.canonicalGroups===18&&ready.aliasRemap?.aliases===29&&ready.aliasRemap?.authoritativeVisitRows===127&&ready.aliasRemap?.allGroupsExecutable===true,'MAPPING_FAILURE','VRM240_ALIAS_PLAN_DRIFT');

const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&vrm240='+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
need(hrRes.ok,'PROVIDER_FAILURE','VRM240_HR_HTTP_'+hrRes.status);
const hrBody=await hrRes.json(),hr=hrBody.snapshot||hrBody.data||hrBody,hrRevision=str(hrBody.revision||hrBody._runtime?.revision||hr.sourceRevision);
need(hrRevision===EXPECTED_HR,'PROVIDER_FAILURE','VRM240_HR_REVISION_DRIFT',{observed:hrRevision,expected:EXPECTED_HR});result.hrRevision=hrRevision;
const periodKey=str(hr.source?.currentCalendarPeriodKey||hrBody.currentCalendarPeriodKey||''),period=str(arr(hr.periods).find(p=>str(p.key)===periodKey)?.id||('cinepolis-'+periodKey));
need(periodKey&&period,'SOURCE_FAILURE','VRM240_PERIOD_MISSING');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),users=tenant.collection('users'),profiles=tenant.collection('shoppers'),project=tenant.collection('projects').doc(PROGRAM);
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const members=await docs(users);
const memberFor=sid=>members.filter(m=>m.active===true&&str(m.shopperId)===sid&&norm(m.role)==='shopper'&&norm(m.authNamespace)==='shopper'&&!['inactive','superseded','retired'].includes(norm(m.status))&&norm(m.identityState)!=='superseded_exact_alias');
const reviewMember=memberFor(REVIEW_ONLY),retireMember=memberFor(SAFE_RETIRE),claimsMember=memberFor(CLAIMS_TARGET),loginMember=memberFor(LOGIN_TARGET);
need(reviewMember.length===1&&retireMember.length===1&&claimsMember.length===1&&loginMember.length===1,'MAPPING_FAILURE','VRM240_MEMBERSHIP_CARDINALITY',{review:reviewMember.length,retire:retireMember.length,claims:claimsMember.length,login:loginMember.length});
result.reviewOnly={preserved:true,shopperId:REVIEW_ONLY,writes:0};

const [claimsUser,loginUser,loginProfileSnap]=await Promise.all([auth.getUser(claimsMember[0].id),auth.getUser(loginMember[0].id),profiles.doc(LOGIN_TARGET).get()]);
need(!claimsUser.disabled&&!loginUser.disabled&&loginProfileSnap.exists,'AUTH_FAILURE','VRM240_AUTH_OR_PROFILE_MISSING');
const cc=claimsUser.customClaims||{},claimProjects=uniq(cc.projectIds);
const claimMismatch=[str(cc.tenantId)!==TENANT?'tenantId':null,norm(cc.role)!=='shopper'?'role':null,norm(cc.authNamespace)!=='shopper'?'authNamespace':null,str(cc.shopperId)!==CLAIMS_TARGET?'shopperId':null,!claimProjects.includes(PROGRAM)?'projectIds':null].filter(Boolean);
need(claimMismatch.length===1&&claimMismatch[0]==='authNamespace','AUTH_FAILURE','VRM240_CLAIMS_NOT_EXACTLY_BOUNDED',{claimMismatch});
const loginProfile=loginProfileSnap.data()||{},credential=ShopperCredentialRule.shopperCredentialRule(loginProfile);
need(credential.ok===true,'MAPPING_FAILURE','VRM240_LOGIN_CREDENTIAL_RULE',{reason:credential.reason});
const expectedEmail=internalEmail(credential.login);
let baseHolder=null;try{baseHolder=await auth.getUserByEmail(expectedEmail);}catch(e){if(str(e?.code)!=='auth/user-not-found')throw e;}
need(!baseHolder||baseHolder.uid===loginMember[0].id,'AUTH_FAILURE','VRM240_LOGIN_BASE_COLLISION',{baseHolderFingerprint:baseHolder?sha(baseHolder.uid).slice(0,20):null});
const aliasGroups=arr(ready.aliasRemap.groups);
need(aliasGroups.length===18&&aliasGroups.every(g=>g.executable===true),'MAPPING_FAILURE','VRM240_ALIAS_GROUPS_NOT_EXECUTABLE');
for(const g of aliasGroups){need(g.canonicalProfilePresent===true&&g.activeCanonicalMemberships===1&&g.canonicalAuthPresent===true&&g.canonicalAuthDisabled!==true,'MAPPING_FAILURE','VRM240_ALIAS_CANONICAL_NOT_READY',{canonical:g.canonicalShopperId});}
const allVisitIds=uniq(aliasGroups.flatMap(g=>g.aliases.flatMap(a=>a.visitKeys)));
need(allVisitIds.length===127,'MAPPING_FAILURE','VRM240_VISIT_PLAN_COUNT',{count:allVisitIds.length});
const visitSnaps=await Promise.all(allVisitIds.map(id=>project.collection('visits').doc(id).get()));
for(let i=0;i<visitSnaps.length;i++){const s=visitSnaps[i];need(s.exists,'PERSISTENCE_FAILURE','VRM240_VISIT_MISSING',{visitId:allVisitIds[i]});}

const staff=members.filter(x=>x.active===true&&norm(x.role)==='super'&&norm(x.authNamespace)==='staff').sort((a,b)=>a.id.localeCompare(b.id));
let actor=null;
for(const m of staff){try{const u=await auth.getUser(m.id),c=u.customClaims||{};if(!u.disabled&&str(c.tenantId)===TENANT&&norm(c.role)==='super'&&norm(c.authNamespace)==='staff'){actor=m;break;}}catch{}}
need(actor,'AUTH_FAILURE','VRM240_SUPER_ACTOR_MISSING');

let browser=null,ctx=null,page=null;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
 ctx=await browser.newContext({ignoreHTTPSErrors:true,serviceWorkers:'block'});page=await ctx.newPage();
 const url=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+PROGRAM+'&cxProtectedRuntime='+PROTECTED+'&cxTechnicalAuthE2E='+TECH;
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:90000});
 await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},await auth.createCustomToken(actor.id));
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.CX?.backendAuth?.context?.()?.authenticated===true&&String(window.CX?.backendAuth?.context?.()?.role||'')==='super'&&typeof window.CX?.commandAdapter?.execute==='function'&&!!window.CX?.shopperAdminCommandContract,null,{timeout:120000});
 await page.evaluate(p=>window.CX?.data?.setCurrentPeriod?.(p),period);

 // 1. Exact Auth claim repair only.
 await auth.setCustomUserClaims(claimsMember[0].id,{...cc,authNamespace:'shopper'});
 const claimRead=await auth.getUser(claimsMember[0].id),cr=claimRead.customClaims||{};
 need(str(cr.tenantId)===TENANT&&norm(cr.role)==='shopper'&&norm(cr.authNamespace)==='shopper'&&str(cr.shopperId)===CLAIMS_TARGET&&uniq(cr.projectIds).includes(PROGRAM),'AUTH_FAILURE','VRM240_CLAIMS_READBACK');
 result.claimsRepair={shopperId:CLAIMS_TARGET,uidFingerprint:sha(claimsMember[0].id).slice(0,20),beforeMismatch:['authNamespace'],afterMismatch:[],readback:true};

 // 2. Durable canonical login normalization through shopper.update; exact replay required.
 const loginKey='vrm240-login:'+sha([TENANT,PROGRAM,LOGIN_TARGET,credential.login].join('\0')).slice(0,32);
 const loginPair=await page.evaluate(async x=>{const a=window.CX.backendAuth.context()||{},b=window.CX.shopperAdminCommandContract.update({tenantId:a.tenantId,projectId:x.projectId,periodId:x.periodId,projectIds:Array.isArray(a.projectIds)&&a.projectIds.length?a.projectIds:[x.projectId],actorId:a.actorId,actorRole:a.role,shopperId:x.shopperId,patch:{},expectedVersion:'provider-current',idempotencyKey:x.key});if(!b?.ok)return{buildOk:false,errors:b?.errors||[]};const first=await window.CX.commandAdapter.execute(b.command),replay=await window.CX.commandAdapter.execute(b.command);return{buildOk:true,first,replay};},{projectId:PROGRAM,periodId:period,shopperId:LOGIN_TARGET,key:loginKey});
 need(loginPair.buildOk===true&&loginPair.first?.ok===true&&loginPair.first?.providerAck===true&&loginPair.replay?.ok===true&&loginPair.replay?.providerAck===true&&loginPair.replay?.idempotentReplay===true&&Number(loginPair.replay?.providerWrites||0)===0,'PERSISTENCE_FAILURE','VRM240_LOGIN_PROVIDER_ACK',{loginPair});
 const [loginMemberRead,loginProfileRead,loginAuthRead]=await Promise.all([users.doc(loginMember[0].id).get(),profiles.doc(LOGIN_TARGET).get(),auth.getUser(loginMember[0].id)]);
 const lm=loginMemberRead.data()||{},lp=loginProfileRead.data()||{};
 need(norm(lm.visibleLogin)===credential.login&&norm(lp.visibleLogin||lp.username||lp.user)===credential.login&&norm(loginAuthRead.email)===expectedEmail,'PERSISTENCE_FAILURE','VRM240_LOGIN_READBACK',{memberLogin:lm.visibleLogin,profileLogin:lp.visibleLogin||lp.username||lp.user});
 result.loginRepair={shopperId:LOGIN_TARGET,visibleLogin:credential.login,providerAck:true,idempotentReplay:true,durableReadback:true};

 // 3. Safe provider retire for non-current nameless identity.
 const retireKey='vrm240-retire:'+sha([TENANT,PROGRAM,SAFE_RETIRE].join('\0')).slice(0,32);
 const retirePair=await page.evaluate(async x=>{const a=window.CX.backendAuth.context()||{},b=window.CX.shopperAdminCommandContract.deleteShopper({tenantId:a.tenantId,projectId:x.projectId,periodId:x.periodId,projectIds:Array.isArray(a.projectIds)&&a.projectIds.length?a.projectIds:[x.projectId],actorId:a.actorId,actorRole:a.role,shopperId:x.shopperId,humanConfirmed:true,reason:'vrm240_noncurrent_nameless_safe_retire',expectedVersion:'provider-current',idempotencyKey:x.key});if(!b?.ok)return{buildOk:false,errors:b?.errors||[]};const first=await window.CX.commandAdapter.execute(b.command),replay=await window.CX.commandAdapter.execute(b.command);return{buildOk:true,first,replay};},{projectId:PROGRAM,periodId:period,shopperId:SAFE_RETIRE,key:retireKey});
 need(retirePair.buildOk===true&&retirePair.first?.ok===true&&retirePair.first?.providerAck===true&&retirePair.first?.shopperRetired===true&&retirePair.replay?.ok===true&&retirePair.replay?.providerAck===true&&retirePair.replay?.idempotentReplay===true&&Number(retirePair.replay?.providerWrites||0)===0,'PERSISTENCE_FAILURE','VRM240_RETIRE_ACK',{retirePair});
 const retireAfter=await users.doc(retireMember[0].id).get(),tomb=await tenant.collection('shopperTombstones').doc(SAFE_RETIRE).get();
 need((!retireAfter.exists||(retireAfter.data()||{}).active!==true)&&tomb.exists,'PERSISTENCE_FAILURE','VRM240_RETIRE_READBACK');
 result.safeRetire={shopperId:SAFE_RETIRE,providerAck:true,idempotentReplay:true,durableReadback:true,physicalDelete:false};

 // 4. Exact trusted alias remap, provider-owned, authoritative rows only.
 for(const g of [...aliasGroups].sort((a,b)=>str(a.canonicalShopperId).localeCompare(str(b.canonicalShopperId)))){
   const aliases=uniq(g.aliases.map(a=>a.aliasShopperId)),ids=uniq(g.aliases.flatMap(a=>a.visitKeys));
   const key='vrm240-alias:'+sha([TENANT,PROGRAM,g.canonicalShopperId,...aliases,...ids].join('\0')).slice(0,32);
   const pair=await page.evaluate(async x=>{const a=window.CX.backendAuth.context()||{},b=window.CX.shopperAdminCommandContract.identityAdjudicate({tenantId:a.tenantId,projectId:x.projectId,periodId:x.periodId,projectIds:Array.isArray(a.projectIds)&&a.projectIds.length?a.projectIds:[x.projectId],actorId:a.actorId,actorRole:a.role,canonicalShopperId:x.canonical,aliasShopperIds:x.aliases,humanConfirmed:true,expectedVersion:'provider-current',idempotencyKey:x.key,reason:'vrm240_trusted_exact_alias_authoritative_visit_remap',preserveHistoricalVisitRows:true,authoritativeVisitIds:x.ids});if(!b?.ok)return{buildOk:false,errors:b?.errors||[]};const first=await window.CX.commandAdapter.execute(b.command),replay=await window.CX.commandAdapter.execute(b.command);return{buildOk:true,first,replay};},{projectId:PROGRAM,periodId:period,canonical:g.canonicalShopperId,aliases,ids,key});
   need(pair.buildOk===true&&pair.first?.ok===true&&pair.first?.providerAck===true&&(pair.first?.identityConsolidated===true||pair.first?.idempotentReplay===true)&&pair.replay?.ok===true&&pair.replay?.providerAck===true&&pair.replay?.idempotentReplay===true&&Number(pair.replay?.providerWrites||0)===0,'PERSISTENCE_FAILURE','VRM240_ALIAS_ACK',{canonical:g.canonicalShopperId,pair});
   result.aliasRemap.groups++;result.aliasRemap.aliases+=aliases.length;result.aliasRemap.authoritativeVisitRows+=ids.length;result.aliasRemap.replays++;result.aliasRemap.providerWrites+=Number(pair.first?.providerWrites||0);result.hrWrites+=Number(pair.first?.hrWrites||0);result.externalWrites+=Number(pair.first?.externalWrites||0);save();
 }
 need(result.aliasRemap.groups===18&&result.aliasRemap.aliases===29&&result.aliasRemap.authoritativeVisitRows===127,'PERSISTENCE_FAILURE','VRM240_ALIAS_COUNTS',{aliasRemap:result.aliasRemap});
 need(result.hrWrites===0&&result.externalWrites===0,'PERSISTENCE_FAILURE','VRM240_EXTERNAL_WRITE',{hrWrites:result.hrWrites,externalWrites:result.externalWrites});
 const postVisits=await Promise.all(aliasGroups.flatMap(g=>g.aliases.flatMap(a=>a.visitKeys.map(id=>({id,canonical:g.canonicalShopperId})))).map(async x=>{const s=await project.collection('visits').doc(x.id).get();return{id:x.id,canonical:x.canonical,exists:s.exists,shopperId:str((s.data()||{}).shopperId)};}));
 const bad=postVisits.filter(x=>!x.exists||x.shopperId!==x.canonical);
 need(bad.length===0,'PERSISTENCE_FAILURE','VRM240_ALIAS_READBACK',{bad:bad.slice(0,20)});
 result.aliasRemap.durableReadback=true;

 result.decision='PASS_VRM240_BOUNDED_RESIDUAL_REPAIR';save();console.log(JSON.stringify(result,null,2));
}finally{
 try{if(ctx)await ctx.close();}catch{}
 try{if(browser)await browser.close();}catch{}
}
