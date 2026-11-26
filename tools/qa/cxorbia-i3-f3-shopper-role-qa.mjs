// Optional scoped browser proof inside the existing F3 fixture. No product code.
// Profiles are already seeded by F3: this does not prove automatic HR upsert or
// ordinary password login. Browser contexts cannot send operational writes.
import {randomBytes} from 'node:crypto';
export const F3_SYNTHETIC_PASSWORD_AUTH='FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY';
export function f3SyntheticCredentials(uid){
 if(!/^f3-qa-\d{8,}-\d+-(?:admin|shopper-(?:gt|hn))$/.test(uid))throw Error('AUTH_FAILURE:F3_PASSWORD_ACTOR_SCOPE');
 return {email:uid+'@cxorbia.invalid',password:'Qa!1'+randomBytes(32).toString('base64url')};
}
export async function f3RoleSignIn({page,auth,uid,authentication,credentials}){
 if(authentication===F3_SYNTHETIC_PASSWORD_AUTH){
  if(credentials?.email!==uid+'@cxorbia.invalid'||typeof credentials.password!=='string'||credentials.password.length<40)throw Error('AUTH_FAILURE:F3_PASSWORD_ACTOR_CREDENTIALS');
  await page.evaluate(async login=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);firebase.auth().signInWithEmailAndPassword(login.email,login.password).catch(()=>{});},credentials);
 }else{
  if(authentication!=='FIREBASE_CUSTOM_TOKEN_QA_ONLY')throw Error('AUTH_FAILURE:F3_ROLE_AUTH_MODE');
  let custom=await auth.createCustomToken(uid);
  await page.evaluate(async jwt=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);firebase.auth().signInWithCustomToken(jwt).catch(()=>{});},custom);custom='';
 }
}
const need=(ok,code)=>{if(!ok)throw Error(code);};
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const sorted=x=>[...x].sort();
const safeError=e=>String(e?.message||'').match(/(?:AUTH|SOURCE|MAPPING|PROVIDER|PERSISTENCE|FUNCTIONAL|VISUAL|ENVIRONMENT)_FAILURE:[A-Z0-9_]+|(?:FUNCTIONAL|VISUAL)_DEFECT:[A-Z0-9_]+/)?.[0]||(/timeout/i.test(String(e?.message||''))?'ENVIRONMENT_FAILURE:F3_ROLE_BROWSER_TIMEOUT':'FUNCTIONAL_DEFECT:F3_ROLE_BROWSER_UNCLASSIFIED');

export function f3RoleActors(owner,qa){
 need(/^f3-qa-\d{8,}-\d+$/.test(owner)&&qa.tenantId==='tya'&&qa.projectId==='f3-qa-20261124'&&qa.periodId==='f3-qa-20261124-2026-11'&&qa.baseUrl==='https://cxorbia-backend-dev.web.app','AUTH_FAILURE:F3_ROLE_SCOPE');
 return ['GT','HN'].map(country=>{
  const uid=owner+'-shopper-'+country.toLowerCase(),shopperId='qa_f3_20261124_'+country.toLowerCase()+'_a';
  const claims={tenantId:'tya',projectIds:[qa.projectId],role:'shopper',authNamespace:'shopper',shopperId,country,qaOwner:owner};
  return {uid,shopperId,country,claims,displayName:'CXOrbia F3 QA '+country+' Shopper',path:'tenants/tya/users/'+uid,
   data:{...claims,uid,active:true,status:'active',synthetic:true,qaOwner:owner}};
 });
}

export function f3RoleExpected(live,actor,qa){
 need(/^[a-f0-9]{64}$/.test(live?.revision||'')&&live?.rows?.length===2,'SOURCE_FAILURE:F3_ROLE_INDEPENDENT_HR');
 const all=live.rows.map(x=>String(x.id||x.visitId||''));
 need(same(sorted(all),sorted(Object.values(qa.visits)))&&new Set(all).size===2&&live.rows.every(x=>x.tenantId==='tya'&&x.projectId===qa.projectId&&x.periodId===qa.periodId),'MAPPING_FAILURE:F3_ROLE_HR_SCOPE');
 const eligible=v=>{
  const f=v.canonicalFacets;
  need(f&&typeof f.available==='boolean','SOURCE_FAILURE:F3_ROLE_HR_FACETS');
  return f.available===true&&f.eligibilityBlocked!==true&&!f.assigned&&!f.scheduled&&!f.realized&&!f.questionnaire&&!f.submitted&&!f.outOfRange&&!f.cancelled&&!f.liquidationConfirmed&&!f.paymentConfirmed&&
   !v.shopperId&&!v.agendada&&!v.realizada&&!v.cuestFecha&&!v.submit&&!v.submittedAt&&!v._archived&&v.outOfRange!==true&&v.cancelled!==true;
 };
 return {sourceRevision:live.revision,country:actor.country,availableIds:sorted(live.rows.filter(v=>(v.country||v.pais)===actor.country&&eligible(v)).map(v=>v.id||v.visitId)),
  ownVisitIds:sorted(live.rows.filter(v=>v.shopperId===actor.shopperId).map(v=>v.id||v.visitId))};
}

export function f3RoleCompare(actual,expected,actor,qa){
 need(actual.authenticated===true&&actual.uidMatches===true&&actual.role==='shopper'&&actual.authNamespace==='shopper'&&actual.tenantId==='tya'&&actual.shopperId===actor.shopperId&&actual.sessionShopperId===actor.shopperId&&same(actual.projectIds,[qa.projectId]),'AUTH_FAILURE:F3_ROLE_PRINCIPAL');
 need(actual.projectId===qa.projectId&&actual.periodId===qa.periodId&&actual.sourceRevision===expected.sourceRevision&&actual.authorityRevision===expected.sourceRevision&&actual.authorityApplied===true,'MAPPING_FAILURE:F3_ROLE_CONTEXT');
 need(actual.foreignVisitCount===0&&actual.duplicateVisitCount===0&&actual.duplicateShopperCount===0,'MAPPING_FAILURE:F3_ROLE_LEAK_OR_DUPLICATE');
 need(same(sorted(actual.availableIds),expected.availableIds)&&new Set(actual.availableIds).size===actual.availableIds.length,'FUNCTIONAL_DEFECT:F3_ROLE_AVAILABLE_KEYSET');
 need(same(sorted(actual.ownVisitIds),expected.ownVisitIds)&&same(sorted(actual.ownCardIds),expected.ownVisitIds)&&new Set(actual.ownCardIds).size===actual.ownCardIds.length,'FUNCTIONAL_DEFECT:F3_ROLE_OWN_VISIT_KEYSET');
 return {country:actor.country,sourceRevision:expected.sourceRevision,available:expected.availableIds.length,own:expected.ownVisitIds.length,exactAvailableKeyset:true,exactOwnKeyset:true,foreignVisitCount:0,duplicateVisitCount:0};
}

export function f3RoleMutationRequest(url,method,qa){
 const u=new URL(url);if(['GET','HEAD','OPTIONS'].includes(method.toUpperCase()))return false;
 if(u.origin===qa.baseUrl&&/^\/(?:v1|api)\//.test(u.pathname))return true;
 if(u.hostname==='firestore.googleapis.com'&&(/\/Write(?:\/|$)/.test(u.pathname)||/:commit$/.test(u.pathname)))return true;
 if(u.hostname==='identitytoolkit.googleapis.com'&&/accounts:(?:update|delete|signUp)/.test(u.pathname))return true;
 return ['firebasestorage.googleapis.com','storage.googleapis.com'].includes(u.hostname);
}

export function f3RoleAuthOwned(user,actor,owner){
 const c=user?.customClaims||{};
 return user?.uid===actor.uid&&((c.qaOwner===owner&&c.role==='shopper'&&c.authNamespace==='shopper'&&c.tenantId==='tya'&&c.shopperId===actor.shopperId&&same(c.projectIds,actor.claims.projectIds))||Object.keys(c).length===0&&user.displayName===actor.displayName);
}

export async function createF3ShopperRoleQa({auth,db,qa,owner,outDir,rememberDocument,publish,openBrowser,authentication='FIREBASE_CUSTOM_TOKEN_QA_ONLY'}){
 need(['FIREBASE_CUSTOM_TOKEN_QA_ONLY',F3_SYNTHETIC_PASSWORD_AUTH].includes(authentication),'AUTH_FAILURE:F3_ROLE_AUTH_MODE');
 const credentials=new Map();
 const actors=f3RoleActors(owner,qa),createdAuth=[],state={schemaVersion:'cxorbia.f3.scoped-shopper-role-qa.v1',decision:'PENDING',qaOwner:owner,
  sameFixture:true,automaticUpsertProven:false,ordinaryPasswordProven:false,authentication,
  actors:actors.map(x=>({uid:x.uid,shopperId:x.shopperId,country:x.country})),phases:[],blockedOperationalRequests:0,failures:[],cleanup:{authDeleted:[],authAbsent:[],complete:false}};
 let browser=null;
 const save=()=>publish(structuredClone(state));
 const recordFailure=e=>{state.failures.push(safeError(e));state.decision='HOLD_F3_QA_SHOPPER_ROLE';save();};
 const ready=async(page,actor,expected)=>{
  await page.waitForFunction(({uid,revision,projectId})=>window.firebase?.auth?.().currentUser?.uid===uid&&window.CX?.backendAuth?.context?.().authenticated===true&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX.data.currentProjectId===projectId&&window.CX.data.previewMeta?.sourceRevision===revision,{uid:actor.uid,revision:expected.sourceRevision,projectId:qa.projectId},{timeout:60000});
  const picker=page.locator('#periodSel');await picker.waitFor({timeout:15000});
  await picker.selectOption(qa.periodId,{timeout:15000});
  await page.waitForFunction(period=>window.CX?.data?.currentPeriodId===period,qa.periodId,{timeout:30000});
 };
 const snapshot=async(page,actor)=>{
  await page.locator('#nav-visitas').click({timeout:15000});
  await page.waitForFunction(()=>window.CX?.session?.view==='visitas'&&!!document.querySelector('#vList'),null,{timeout:30000});
  const availableIds=await page.locator('#vList [data-detail]').evaluateAll(x=>x.map(e=>e.dataset.detail));
  await page.locator('#nav-misvisitas').click({timeout:15000});
  await page.waitForFunction(()=>window.CX?.session?.view==='misvisitas'&&!!document.querySelector('#view [data-view="activas"]'),null,{timeout:30000});
  await page.locator('#view [data-view="activas"]').click();
  const actual=await page.evaluate(({uid,knownIds})=>{
   const cx=window.CX,d=cx?.data||{},c=cx?.backendAuth?.context?.()||{},a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},visits=d._visitas||[],ids=visits.map(v=>String(v.id||v.visitId||''));
   const own=typeof d.visitsForShopper==='function'?d.visitsForShopper(c.shopperId,false):[];
   return {authenticated:c.authenticated===true,uidMatches:window.firebase?.auth?.().currentUser?.uid===uid,role:c.role,authNamespace:c.authNamespace,tenantId:c.tenantId,projectIds:c.projectIds,shopperId:c.shopperId,sessionShopperId:cx?.session?.user?.shopperId,
    projectId:d.currentProjectId,periodId:d.currentPeriodId,sourceRevision:d.previewMeta?.sourceRevision,authorityRevision:a.sourceRevision,authorityApplied:a.applied===true,
    foreignVisitCount:ids.filter(id=>!knownIds.includes(id)).length,duplicateVisitCount:ids.length-new Set(ids).size,duplicateShopperCount:a.duplicateShopperIds,
    ownVisitIds:own.map(v=>String(v.id||v.visitId||'')),ownCardIds:[...document.querySelectorAll('#view [data-visit-card]')].map(e=>e.dataset.visitCard)};
  },{uid:actor.uid,knownIds:Object.values(qa.visits)});
  return {...actual,availableIds};
 };
 const proof={state,
  async prepare(){
   // Dependencies fail before the two temporary accounts are created.
   if(openBrowser)browser=await openBrowser();else{const {chromium}=await import('playwright');browser=await chromium.launch({headless:true});}
   for(const actor of actors){
    need(!(await db.doc(actor.path).get()).exists,'PERSISTENCE_FAILURE:F3_ROLE_MEMBER_EXISTS');
    try{await auth.getUser(actor.uid);throw Error('AUTH_FAILURE:F3_ROLE_AUTH_EXISTS');}catch(e){if(e.code!=='auth/user-not-found')throw e;}
   }
   for(const actor of actors){
    if(authentication===F3_SYNTHETIC_PASSWORD_AUTH)credentials.set(actor.uid,f3SyntheticCredentials(actor.uid));
    await auth.createUser({uid:actor.uid,displayName:actor.displayName,disabled:false,...(credentials.get(actor.uid)||{})});createdAuth.push(actor);save();
    await auth.setCustomUserClaims(actor.uid,actor.claims);
    need(f3RoleAuthOwned(await auth.getUser(actor.uid),actor,owner),'AUTH_FAILURE:F3_ROLE_AUTH_READBACK');
    rememberDocument({path:actor.path,data:actor.data});await db.doc(actor.path).create(actor.data);
    need(same((await db.doc(actor.path).get()).data(),actor.data),'PERSISTENCE_FAILURE:F3_ROLE_MEMBER_READBACK');
   }
   state.prepared=true;save();
  },
  async capture(phase,live){
   if(!state.prepared)return;
   need(['before','assigned'].includes(phase),'SOURCE_FAILURE:F3_ROLE_PHASE');
   const p={phase,sourceRevision:live.revision,countries:[]};state.phases.push(p);save();
   for(const actor of actors){let context;
    try{
     const expected=f3RoleExpected(live,actor,qa);context=await browser.newContext({viewport:{width:1440,height:1000}});
     await context.route('**/*',async route=>{
      const req=route.request();if(f3RoleMutationRequest(req.url(),req.method(),qa)){state.blockedOperationalRequests++;save();await route.abort('blockedbyclient');return;}
      await route.continue();
     });
     const page=await context.newPage();const url=qa.baseUrl+'/index-backend-dev.html?'+new URLSearchParams({cxBackendPreview:'YES_PAULA_20260628_PREVIEW_DEV',cxProjectId:qa.projectId,cxProtectedRuntime:'YES_PAULA_20260730_PROTECTED_DEV',cxTechnicalAuthE2E:'YES_PAULA_20260801_REAL_USERS_E2E'});
     await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
     await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:45000});
     await f3RoleSignIn({page,auth,uid:actor.uid,authentication,credentials:credentials.get(actor.uid)});
     await page.waitForFunction(uid=>window.firebase?.auth?.().currentUser?.uid===uid,actor.uid,{timeout:45000});
     await page.reload({waitUntil:'domcontentloaded',timeout:60000});await ready(page,actor,expected);
     const actual=await snapshot(page,actor),comparison=f3RoleCompare(actual,expected,actor,qa);
     const observed={...comparison,expected,passed:true};p.countries.push(observed);save();
     await page.locator('#view').screenshot({path:outDir+'/f3-role-'+phase+'-'+actor.country+'.png'});
     if(phase==='assigned'){
      need(expected.ownVisitIds.length===1&&expected.availableIds.length===0,'SOURCE_FAILURE:F3_ROLE_ASSIGNED_BASELINE');
      await page.reload({waitUntil:'domcontentloaded',timeout:60000});await ready(page,actor,expected);
      f3RoleCompare(await snapshot(page,actor),expected,actor,qa);observed.reloadVerified=true;save();
     }
    }catch(e){p.countries.push({country:actor.country,passed:false,failure:safeError(e)});recordFailure(e);}
    finally{await context?.close().catch(()=>{});}
   }
   if(phase==='assigned'){
    const before=state.phases.find(x=>x.phase==='before'),after=p;
    const complete=before?.countries.length===2&&after.countries.length===2&&[...before.countries,...after.countries].every(x=>x.passed)&&after.countries.every(x=>x.reloadVerified);
    state.positiveAvailabilityTransitions=complete?before.countries.filter(x=>x.expected.availableIds.includes(qa.visits[x.country])).map(x=>x.country):[];
    state.availabilityRemovalProven=complete&&state.positiveAvailabilityTransitions.length===2;
    state.limitations=['automatic_missing_shopper_upsert','ordinary_password_login','Admin_UI_assignment_button','postulation_lifecycle'];
    if(!state.availabilityRemovalProven)state.limitations.push('positive_eligible_to_unavailable_transition_not_proven_for_both_countries');
    state.decision=complete&&state.failures.length===0&&state.blockedOperationalRequests===0?'PASS_F3_QA_SHOPPER_ROLE_SCOPED':'HOLD_F3_QA_SHOPPER_ROLE';save();
   }
  },
  recordFailure,
  async close(){await browser?.close();browser=null;},
  async cleanupAuth(firestoreClean){
   if(!firestoreClean){state.cleanup.preservedForRecovery=true;save();return false;}
   for(const actor of createdAuth){
    need(!(await db.doc(actor.path).get()).exists,'PERSISTENCE_FAILURE:F3_ROLE_MEMBER_CLEANUP_NOT_ABSENT');
    let user;try{user=await auth.getUser(actor.uid);}catch(e){if(e.code!=='auth/user-not-found')throw e;}
    if(user){need(f3RoleAuthOwned(user,actor,owner),'AUTH_FAILURE:F3_ROLE_AUTH_CLEANUP_OWNER');await auth.deleteUser(actor.uid);state.cleanup.authDeleted.push(actor.uid);save();}
    try{await auth.getUser(actor.uid);throw Error('AUTH_FAILURE:F3_ROLE_AUTH_CLEANUP_READBACK');}catch(e){if(e.code!=='auth/user-not-found')throw e;}
    credentials.delete(actor.uid);state.cleanup.authAbsent.push(actor.uid);save();
   }
   state.cleanup.complete=true;save();return true;
  }
 };
 save();return proof;
}
