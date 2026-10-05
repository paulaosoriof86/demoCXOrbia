#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';
import {CREDENTIAL_PASSWORD_PROOF_VERSION,shoppersFromSnapshot} from '../../backend/runtime/cxorbia-shopper-command-provider-v1.mjs';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev').trim();
const TENANT=String(process.env.TENANT_ID||'tya').trim();
const PROGRAM=String(process.env.PROJECT_ID||'cinepolis').trim();
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const EXPECTED_HR=String(process.env.EXPECTED_HR_REVISION||'').trim();
const OUT=String(process.env.VRM215_OUT||'.tmp/i3-vrm215-shopper-population').trim();
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex'),norm=v=>str(v).toLowerCase();
const internalEmail=login=>sha(TENANT+'\0shopper\0'+norm(login)).slice(0,48)+'@auth.cxorbia.invalid';
const collisionLogin=(base,sid,n)=>base+'.'+sha(TENANT+'\0'+sid).slice(0,n);
const approvedLogin=(base,sid,login)=>login===base||[4,6,8].some(n=>login===collisionLogin(base,sid,n));
const activeMember=m=>m.active===true&&norm(m.role)==='shopper'&&norm(m.authNamespace)==='shopper'&&arr(m.projectIds).map(str).includes(PROGRAM)&&!['inactive','superseded'].includes(norm(m.status))&&norm(m.identityState)!=='superseded_exact_alias';
const visitKey=v=>str(v.hrRowId||v.visitKey||v.id||v.visitId);
const REQUIRED_MODULES=['midia','miperfil','misvisitas','aprendizaje','cert','beneficios'];

fs.mkdirSync(OUT,{recursive:true});
const result={schemaVersion:'cxorbia.i3.vrm215.shopper-population.v2',decision:'HOLD',tenantId:TENANT,projectId:PROGRAM,expectedHrRevision:EXPECTED_HR,membershipUniverseCount:0,reviewOnlyExcludedCount:0,reviewOnlyPass:false,reviewOnlyExcluded:[],populationCount:0,loginPass:0,selfScopePass:0,routeContractPass:0,population:[],errors:[],writes:0,production:false};
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
save();
if(!/^[a-f0-9]{64}$/.test(EXPECTED_HR))throw new Error('SOURCE_FAILURE:VRM215_HR_REVISION_REQUIRED');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const docs=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const [membersAll,profiles,crosswalk,durableVisits]=await Promise.all([docs(tenant.collection('users')),docs(tenant.collection('shoppers')),docs(tenant.collection('shopperIdentityCrosswalk')),docs(project.collection('visits'))]);
const profileDocById=new Map(profiles.map(p=>[p.id,p])),crossById=new Map(crosswalk.map(c=>[c.id,c]));

const hrRes=await fetch(ROOT+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&vrm215='+Date.now(),{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
if(!hrRes.ok)throw new Error('PROVIDER_FAILURE:VRM215_HR_HTTP_'+hrRes.status);
const hrBody=await hrRes.json(),hr=hrBody.snapshot||hrBody.data||hrBody,hrRevision=str(hrBody.revision||hrBody._runtime?.revision||hr.sourceRevision);
result.hrRevision=hrRevision;
if(hrRevision!==EXPECTED_HR)result.errors.push({scope:'hr',code:'HR_REVISION_DRIFT',observed:hrRevision});
if(hr.sourceSafe!==true)result.errors.push({scope:'hr',code:'HR_SOURCE_NOT_SAFE'});
const hrVisits=arr(hr.visits),providerSourceShoppers=shoppersFromSnapshot(hr).shoppers,providerSourceById=new Map(providerSourceShoppers.map(x=>[str(x.shopperId),x]));

const memberUniverse=membersAll.filter(activeMember).sort((a,b)=>str(a.shopperId).localeCompare(str(b.shopperId))||a.id.localeCompare(b.id));
result.membershipUniverseCount=memberUniverse.length;
const reviewOnlyCandidates=[],members=[];
for(const m of memberUniverse){
  const sid=str(m.shopperId),durable=profileDocById.get(sid),source=providerSourceById.get(sid);
  const durableRule=durable?ShopperCredentialRule.shopperCredentialRule(durable):{ok:false,reason:'PROFILE_MISSING'};
  const sourceRule=source?ShopperCredentialRule.shopperCredentialRule(source):{ok:false,reason:'SOURCE_PROFILE_MISSING'};
  const frozenReviewOnly=!!source&&sourceRule.ok===false&&sourceRule.reason==='SHOPPER_CREDENTIAL_NAME_INCOMPLETE'&&durableRule.ok===false&&durableRule.reason==='SHOPPER_CREDENTIAL_NAME_INCOMPLETE';
  if(frozenReviewOnly)reviewOnlyCandidates.push({member:m,source,durable,sourceRule,durableRule});
  else members.push(m);
}
result.reviewOnlyExcludedCount=reviewOnlyCandidates.length;
result.populationCount=members.length;
if(result.reviewOnlyExcludedCount!==1)result.errors.push({scope:'review-only',code:'REVIEW_ONLY_CARDINALITY_DRIFT',expected:1,observed:result.reviewOnlyExcludedCount});
if(!members.length)result.errors.push({scope:'population',code:'NO_ACTIVE_ELIGIBLE_SHOPPERS'});

const byShopper=new Map();
for(const m of memberUniverse){const sid=str(m.shopperId);if(!sid){result.errors.push({scope:'membership',uid:m.id,code:'MISSING_SHOPPER_ID'});continue;}if(!byShopper.has(sid))byShopper.set(sid,[]);byShopper.get(sid).push(m);}
for(const [sid,rows] of byShopper)if(rows.length!==1)result.errors.push({scope:'membership',shopperId:sid,code:'DUPLICATE_ACTIVE_PRINCIPAL',count:rows.length});
const activeIds=new Set([...byShopper.keys()]),runtimeRows=[];

for(const m of members){
  const sid=str(m.shopperId),row={shopperId:sid,uid:m.id,visibleLogin:str(m.visibleLogin),staticPass:true,staticErrors:[]};
  const p=profileDocById.get(sid),cw=crossById.get(sid);
  if(!p){row.staticPass=false;row.staticErrors.push('PROFILE_DOC_MISSING');}
  if(!cw||str(cw.shopperId||cw.canonicalShopperId)!==sid){row.staticPass=false;row.staticErrors.push('CANONICAL_CROSSWALK_MISSING');}
  let u=null;try{u=await auth.getUser(m.id);}catch{row.staticPass=false;row.staticErrors.push('AUTH_USER_MISSING');}
  if(u){
    const c=u.customClaims||{},projects=uniq([...(arr(c.projectIds)),c.projectId]);
    if(u.disabled===true)row.staticErrors.push('AUTH_DISABLED');
    if(str(c.tenantId)!==TENANT)row.staticErrors.push('CLAIM_TENANT_MISMATCH');
    if(norm(c.role)!=='shopper')row.staticErrors.push('CLAIM_ROLE_MISMATCH');
    if(norm(c.authNamespace)!=='shopper')row.staticErrors.push('CLAIM_NAMESPACE_MISMATCH');
    if(str(c.shopperId)!==sid)row.staticErrors.push('CLAIM_SHOPPER_MISMATCH');
    if(!projects.includes(PROGRAM))row.staticErrors.push('CLAIM_PROJECT_MISSING');
    if(row.staticErrors.length)row.staticPass=false;
  }
  if(p){
    const rule=ShopperCredentialRule.shopperCredentialRule(p),login=norm(m.visibleLogin||p.visibleLogin||p.username||p.user);
    row.visibleLogin=login;
    if(!rule?.ok){row.staticPass=false;row.staticErrors.push('CREDENTIAL_RULE_INVALID');}
    else{
      if(!approvedLogin(rule.login,sid,login)){row.staticPass=false;row.staticErrors.push('VISIBLE_LOGIN_NOT_CANONICAL_OR_APPROVED_COLLISION');}
      if(u&&norm(u.email)!==norm(internalEmail(login))){row.staticPass=false;row.staticErrors.push('AUTH_EMAIL_LOGIN_MISMATCH');}
      if(str(m.credentialPasswordProofVersion)!==CREDENTIAL_PASSWORD_PROOF_VERSION){row.staticPass=false;row.staticErrors.push('PASSWORD_PROOF_STALE');}
      row.password=rule.password;row.email=internalEmail(login);
    }
  }
  runtimeRows.push(row);
  if(!row.staticPass)for(const code of row.staticErrors)result.errors.push({scope:'static',shopperId:sid,code});
}
const reviewOnlyProofs=[];
for(const x of reviewOnlyCandidates){
  const m=x.member,sid=str(m.shopperId),p=x.durable,cw=crossById.get(sid);
  let u=null;try{u=await auth.getUser(m.id);}catch{}
  const c=u?.customClaims||{},projects=uniq([...(arr(c.projectIds)),c.projectId]);
  const claimsExact=!!u&&u.disabled!==true&&str(c.tenantId)===TENANT&&norm(c.role)==='shopper'&&norm(c.authNamespace)==='shopper'&&str(c.shopperId)===sid&&projects.includes(PROGRAM);
  const crossExact=!!cw&&str(cw.shopperId||cw.canonicalShopperId)===sid;
  const currentAssignments=hrVisits.filter(v=>str(v.shopperId)===sid).length;
  const ok=!!p&&!!x.source&&x.sourceRule.ok===false&&x.sourceRule.reason==='SHOPPER_CREDENTIAL_NAME_INCOMPLETE'&&x.durableRule.ok===false&&x.durableRule.reason==='SHOPPER_CREDENTIAL_NAME_INCOMPLETE'&&crossExact&&claimsExact&&currentAssignments>=0;
  const proof={shopperId:sid,reason:'HR_MANAGED_CREDENTIAL_NAME_INCOMPLETE',sourceCurrent:true,profilePresent:!!p,crosswalkExact:crossExact,authPresent:!!u,claimsExact,currentHrAssignedVisits:currentAssignments,authEligible:false,disposition:'EXCLUDE_FROM_AUTH_ELIGIBLE_POPULATION_PRESERVE_REVIEW_ONLY',pass:ok};
  reviewOnlyProofs.push(proof);
  if(!ok)result.errors.push({scope:'review-only',shopperId:sid,code:'REVIEW_ONLY_INVARIANT_FAILED'});
}
result.reviewOnlyExcluded=reviewOnlyProofs;
result.reviewOnlyPass=result.reviewOnlyExcludedCount===1&&reviewOnlyProofs.length===1&&reviewOnlyProofs.every(x=>x.pass===true);

const loginOwners=new Map();
for(const row of runtimeRows){if(!row.visibleLogin)continue;if(!loginOwners.has(row.visibleLogin))loginOwners.set(row.visibleLogin,[]);loginOwners.get(row.visibleLogin).push(row.shopperId);}
for(const [login,ids] of loginOwners)if(ids.length>1)result.errors.push({scope:'credential',code:'ACTIVE_VISIBLE_LOGIN_COLLISION',login,shopperIds:ids});

const hrKeys=hrVisits.map(visitKey).filter(Boolean);
if(hrKeys.length!==hrVisits.length||new Set(hrKeys).size!==hrKeys.length)result.errors.push({scope:'hr',code:'DUPLICATE_OR_MISSING_HR_VISIT_KEYS',visits:hrVisits.length,keys:hrKeys.length,unique:new Set(hrKeys).size});
let assigned=0,resolvedAssigned=0;
for(const v of hrVisits){
  const raw=str(v.shopperId);if(!raw)continue;assigned++;
  let canonical=activeIds.has(raw)?raw:'';
  if(!canonical){const cw=crossById.get(raw),target=str(cw?.shopperId||cw?.canonicalShopperId);if(target&&activeIds.has(target))canonical=target;}
  if(canonical)resolvedAssigned++;else result.errors.push({scope:'hr-assignment',code:'UNRESOLVED_ASSIGNED_SHOPPER',hrRowId:str(v.hrRowId),shopperId:raw});
}
result.hrAssignedVisits=assigned;result.hrAssignedResolved=resolvedAssigned;
const dKeys=durableVisits.map(visitKey).filter(Boolean);
if(dKeys.length!==durableVisits.length||new Set(dKeys).size!==dKeys.length)result.errors.push({scope:'durable-visits',code:'DUPLICATE_OR_MISSING_DURABLE_VISIT_KEYS',visits:durableVisits.length,keys:dKeys.length,unique:new Set(dKeys).size});

const aliasIds=new Set();
for(const p of profiles){const target=str(p.supersededByShopperId||p.canonicalShopperId);if((norm(p.identityState)==='superseded_exact_alias'||['superseded','inactive'].includes(norm(p.status||p.state)))&&target&&activeIds.has(target))aliasIds.add(p.id);}
for(const c of crosswalk){const target=str(c.shopperId||c.canonicalShopperId);if(c.id!==target&&target&&activeIds.has(target))aliasIds.add(c.id);}
const ownerFields=['shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId','ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'],arrayFields=['shopperIds','candidateShopperIds'];
const defs=[['tenant','paymentReconciliations'],['tenant','reviewQueue'],['project','certifications'],['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']];
let residual=0;
for(const [scope,name] of defs){const rows=await docs(scope==='tenant'?tenant.collection(name):project.collection(name));for(const d of rows){const hit=ownerFields.some(k=>aliasIds.has(str(d[k])))||arrayFields.some(k=>arr(d[k]).some(v=>aliasIds.has(str(v))));if(hit){residual++;result.errors.push({scope:'alias-reference',code:'SUPERSEDED_ALIAS_OPERATIONAL_REFERENCE',collection:name,id:d.id});}}}
result.supersededAliasCount=aliasIds.size;result.aliasOperationalResiduals=residual;

let browser=null;
try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const baseUrl=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(PROGRAM)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  const concurrency=Math.max(1,Math.min(8,Number(process.env.VRM215_CONCURRENCY||6)));
  let nextRow=0;
  const worker=async()=>{
    while(true){
      const rowIndex=nextRow++;
      if(rowIndex>=runtimeRows.length)return;
      const row=runtimeRows[rowIndex];
    const item={shopperId:row.shopperId,visibleLogin:row.visibleLogin,staticPass:row.staticPass,loginPass:false,selfScopePass:false,routeContractPass:false,ownVisits:null,error:null};
    if(!row.staticPass||!row.email||!row.password){result.population.push(item);save();continue;}
    let context=null;
    try{
      context=await browser.newContext({viewport:{width:1280,height:900},ignoreHTTPSErrors:true,serviceWorkers:'block'});
      const page=await context.newPage();
      await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:60000});
      await page.evaluate(async ({email,password})=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await window.firebase.auth().signInWithEmailAndPassword(email,password);},{email:row.email,password:row.password});
      await page.reload({waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(sid=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&String(c.role||'')==='shopper'&&String(c.authNamespace||'')==='shopper'&&String(c.shopperId||'')===sid&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&!!window.CX?.data?.__sessionShopperProfile;},row.shopperId,{timeout:120000});
      const proof=await page.evaluate(({sid,required})=>{const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},p=d.__sessionShopperProfile||{},pid=String(p.id||p.shopperId||''),visits=typeof d.visitsForShopper==='function'?d.visitsForShopper(sid,false):[],badVisits=visits.filter(v=>{const x=String(v?.shopperId||'');return x&&x!==sid;}).length,modules=Object.fromEntries(required.map(id=>[id,!!window.CX?.MODULES?.[id]&&window.CX.moduleEnabled?.(id)===true&&window.CX.roleCanAccess?.('shopper',id)===true&&window.CX.moduleVisibleForProfile?.(id,'shopper')===true]));return{ctxShopperId:String(c.shopperId||''),profileId:pid,ownVisits:visits.length,badVisits,authorityOwnVisits:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.ownVisits??-1),modules};},{sid:row.shopperId,required:REQUIRED_MODULES});
      item.loginPass=true;item.ownVisits=proof.ownVisits;
      item.selfScopePass=proof.ctxShopperId===row.shopperId&&proof.profileId===row.shopperId&&proof.badVisits===0&&proof.authorityOwnVisits===proof.ownVisits;
      item.routeContractPass=REQUIRED_MODULES.every(id=>proof.modules[id]===true);
      result.loginPass++;
      if(item.selfScopePass)result.selfScopePass++;else result.errors.push({scope:'browser-self-scope',shopperId:row.shopperId,code:'SELF_SCOPE_FAILED'});
      if(item.routeContractPass)result.routeContractPass++;else result.errors.push({scope:'browser-routes',shopperId:row.shopperId,code:'REQUIRED_SHOPPER_MODULES_NOT_AVAILABLE',modules:proof.modules});
    }catch(e){item.error=str(e?.message||e);result.errors.push({scope:'browser-login',shopperId:row.shopperId,code:'LOGIN_OR_BOOTSTRAP_FAILED',detail:item.error.slice(0,240)});}
    finally{try{if(context)await context.close();}catch{}}
      result.population.push(item);save();
    }
  };
  await Promise.all(Array.from({length:Math.min(concurrency,Math.max(1,runtimeRows.length))},()=>worker()));
  result.population.sort((a,b)=>str(a.shopperId).localeCompare(str(b.shopperId)));
  save();
}finally{try{if(browser)await browser.close();}catch{}}

result.staticPass=runtimeRows.filter(x=>x.staticPass).length;result.populationCount=runtimeRows.length;
result.hrAssignmentsPass=assigned===resolvedAssigned;result.identityPass=result.staticPass===result.populationCount&&residual===0&&result.reviewOnlyPass===true;
result.authPass=result.loginPass===result.populationCount;result.selfScopePopulationPass=result.selfScopePass===result.populationCount;result.routePopulationPass=result.routeContractPass===result.populationCount;
result.decision=result.errors.length===0&&result.populationCount>0&&result.authPass&&result.selfScopePopulationPass&&result.routePopulationPass&&result.hrAssignmentsPass?'PASS_VRM215_ALL_ACTIVE_SHOPPERS':'FAIL_VRM215_ALL_ACTIVE_SHOPPERS';
save();console.log(JSON.stringify(result,null,2));if(result.decision!=='PASS_VRM215_ALL_ACTIVE_SHOPPERS')process.exitCode=2;
