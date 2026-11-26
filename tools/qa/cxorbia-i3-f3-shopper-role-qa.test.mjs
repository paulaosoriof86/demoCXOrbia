import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {f3RoleActors,f3RoleExpected,f3RoleCompare,f3RoleMutationRequest,f3RoleAuthOwned,createF3ShopperRoleQa,f3SyntheticCredentials,F3_SYNTHETIC_PASSWORD_AUTH,f3RoleSignIn,f3RolePageReady} from './cxorbia-i3-f3-shopper-role-qa.mjs';
const qa={tenantId:'tya',projectId:'f3-qa-20261124',periodId:'f3-qa-20261124-2026-11',baseUrl:'https://cxorbia-backend-dev.web.app',visits:{GT:'qa-visit-gt',HN:'qa-visit-hn'}};
const owner='f3-qa-45527777777-1',actors=f3RoleActors(owner,qa);
function live(assigned=false){return{revision:'a'.repeat(64),rows:actors.map(a=>({id:qa.visits[a.country],tenantId:'tya',projectId:qa.projectId,periodId:qa.periodId,country:a.country,shopperId:assigned?a.shopperId:null,canonicalFacets:{available:!assigned,assigned}}))};}
function observation(expected,actor){return {authenticated:true,uidMatches:true,role:'shopper',authNamespace:'shopper',tenantId:'tya',shopperId:actor.shopperId,sessionShopperId:actor.shopperId,projectIds:[qa.projectId],projectId:qa.projectId,periodId:qa.periodId,sourceRevision:expected.sourceRevision,authorityRevision:expected.sourceRevision,authorityApplied:true,foreignVisitCount:0,duplicateVisitCount:0,duplicateShopperCount:0,availableIds:[...expected.availableIds],ownVisitIds:[...expected.ownVisitIds],ownCardIds:[...expected.ownVisitIds]};}
test('the same F3 fixture has exactly two country-scoped temporary Shopper principals',()=>{
 assert.equal(actors.length,2);for(const a of actors){assert.equal(a.path,'tenants/tya/users/'+a.uid);assert.deepEqual(a.claims.projectIds,[qa.projectId]);assert.equal(a.claims.qaOwner,owner);}
 assert.throws(()=>f3RoleActors(owner,{...qa,projectId:'cinepolis'}),/F3_ROLE_SCOPE/);
 assert.throws(()=>f3RoleActors('foreign',qa),/F3_ROLE_SCOPE/);
});
test('independent HR drives available-before and own-after country keysets',()=>{
 for(const actor of actors){const before=f3RoleExpected(live(),actor,qa),after=f3RoleExpected(live(true),actor,qa);assert.deepEqual(before.availableIds,[qa.visits[actor.country]]);assert.deepEqual(before.ownVisitIds,[]);assert.deepEqual(after.availableIds,[]);assert.deepEqual(after.ownVisitIds,[qa.visits[actor.country]]);assert.equal(f3RoleCompare(observation(after,actor),after,actor,qa).own,1);}
});
test('an expired or blocked baseline stays empty and is never invented as a positive transition',()=>{
 const hr=live();hr.rows[0].canonicalFacets.outOfRange=true;const expected=f3RoleExpected(hr,actors[0],qa);assert.deepEqual(expected.availableIds,[]);
 hr.rows[0].canonicalFacets={available:true,eligibilityBlocked:true};assert.deepEqual(f3RoleExpected(hr,actors[0],qa).availableIds,[]);
});
for(const mutate of [x=>x.rows[0].projectId='cinepolis',x=>x.rows[1].id=x.rows[0].id,x=>delete x.rows[0].canonicalFacets,x=>x.revision='stale'])test('invalid independent HR fails closed '+mutate.toString(),()=>{const x=live();mutate(x);assert.throws(()=>f3RoleExpected(x,actors[0],qa));});
for(const mutate of [x=>x.uidMatches=false,x=>x.role='admin',x=>x.projectIds=['cinepolis'],x=>x.sessionShopperId=actors[1].shopperId,x=>x.sourceRevision='b'.repeat(64),x=>x.foreignVisitCount=1,x=>x.duplicateVisitCount=1,x=>x.availableIds=['wrong'],x=>x.ownCardIds=[qa.visits.GT,qa.visits.GT],x=>x.ownCardIds=[qa.visits.HN]])test('wrong role, revision, scope, keyset, duplicate or foreign card cannot pass '+mutate.toString(),()=>{const ex=f3RoleExpected(live(true),actors[0],qa),x=observation(ex,actors[0]);mutate(x);assert.throws(()=>f3RoleCompare(x,ex,actors[0],qa));});
test('browser blocks command, Firestore write, Auth mutation and Storage mutation but allows login and reads',()=>{
 for(const url of [qa.baseUrl+'/v1/cxorbia/commands','https://firestore.googleapis.com/v1/projects/x/databases/(default)/documents:commit','https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel','https://identitytoolkit.googleapis.com/v1/accounts:update','https://firebasestorage.googleapis.com/v0/b/x/o'])assert.equal(f3RoleMutationRequest(url,'POST',qa),true);
 for(const url of [qa.baseUrl+'/api/tenants/tya/projects/'+qa.projectId+'/hr-live','https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken','https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel'])assert.equal(f3RoleMutationRequest(url,url.includes('hr-live')?'GET':'POST',qa),false);
});
function providers(){
 const members=new Map(),users=new Map(),actions=[];
 const absent=()=>Object.assign(Error('absent'),{code:'auth/user-not-found'});
 const db={doc:path=>({async get(){return {exists:members.has(path),data:()=>members.get(path)};},async create(data){assert.equal(members.has(path),false);members.set(path,structuredClone(data));actions.push(['member',path]);}})};
 const auth={async getUser(uid){if(!users.has(uid))throw absent();return structuredClone(users.get(uid));},async createUser(user){assert.equal(users.has(user.uid),false);users.set(user.uid,{...user,customClaims:{}});actions.push(['create',user.uid]);},async setCustomUserClaims(uid,claims){users.get(uid).customClaims=structuredClone(claims);},async deleteUser(uid){users.delete(uid);actions.push(['delete',uid]);}};
 const docs=[],published=[];return{db,auth,members,users,actions,docs,published,args:{db,auth,qa,owner,outDir:'/unused',rememberDocument:r=>docs.push(r),publish:v=>published.push(v),openBrowser:async()=>({async close(){}})}};
}
test('only owned QA membership and Auth accounts are created, then absence is read back',async()=>{
 const p=providers(),q=await createF3ShopperRoleQa(p.args);await q.prepare();assert.equal(p.users.size,2);assert.equal(p.members.size,2);assert.deepEqual(p.docs.map(r=>r.path),actors.map(r=>r.path));
 p.members.clear();assert.equal(await q.cleanupAuth(true),true);assert.equal(p.users.size,0);assert.equal(q.state.cleanup.authAbsent.length,2);assert.equal(q.state.automaticUpsertProven,false);assert.equal(q.state.ordinaryPasswordProven,false);
});
test('foreign account collision prevents all setup writes',async()=>{
 const p=providers();p.users.set(actors[1].uid,{uid:actors[1].uid,customClaims:{qaOwner:'foreign'}});const q=await createF3ShopperRoleQa(p.args);await assert.rejects(q.prepare(),/F3_ROLE_AUTH_EXISTS/);assert.deepEqual(p.actions,[]);
});
test('unverified Firestore cleanup preserves both QA accounts',async()=>{
 const p=providers(),q=await createF3ShopperRoleQa(p.args);await q.prepare();assert.equal(await q.cleanupAuth(false),false);assert.equal(p.users.size,2);assert.equal(q.state.cleanup.preservedForRecovery,true);
});
test('member or Auth ownership drift blocks deletion',async()=>{
 const p=providers(),q=await createF3ShopperRoleQa(p.args);await q.prepare();await assert.rejects(q.cleanupAuth(true),/MEMBER_CLEANUP_NOT_ABSENT/);assert.equal(p.users.size,2);
 p.members.clear();p.users.get(actors[0].uid).customClaims.qaOwner='foreign';await assert.rejects(q.cleanupAuth(true),/AUTH_CLEANUP_OWNER/);assert.equal(p.users.size,2);
});
test('only an exact newly created empty-claims account can recover a failed claims setup',()=>{
 assert.equal(f3RoleAuthOwned({uid:actors[0].uid,displayName:actors[0].displayName,customClaims:{}},actors[0],owner),true);
 assert.equal(f3RoleAuthOwned({uid:actors[0].uid,displayName:'foreign',customClaims:{}},actors[0],owner),false);
});
test('synthetic password credentials are unique, fixture-only and absent from published evidence',async()=>{
 const a=f3SyntheticCredentials(actors[0].uid),b=f3SyntheticCredentials(actors[0].uid);
 assert.equal(a.email,actors[0].uid+'@cxorbia.invalid');assert.notEqual(a.password,b.password);assert.ok(a.password.length>=40);
 assert.throws(()=>f3SyntheticCredentials('real-shopper'),/ACTOR_SCOPE/);
 const p=providers(),q=await createF3ShopperRoleQa({...p.args,authentication:F3_SYNTHETIC_PASSWORD_AUTH});await q.prepare();
 for(const user of p.users.values()){
  assert.equal(user.email,user.uid+'@cxorbia.invalid');assert.ok(user.password.length>=40);
  assert.equal(JSON.stringify(p.published).includes(user.password),false);assert.equal(JSON.stringify(p.published).includes(user.email),false);
 }
 assert.equal(q.state.authentication,F3_SYNTHETIC_PASSWORD_AUTH);assert.equal(q.state.ordinaryPasswordProven,false);
 p.members.clear();assert.equal(await q.cleanupAuth(true),true);
});
test('password QA signs in through Firebase password provider and never requests custom-token signing',async()=>{
 const calls=[],credentials=f3SyntheticCredentials(actors[0].uid),instance={async setPersistence(value){calls.push(['persist',value]);},async signInWithEmailAndPassword(email,password){calls.push(['password',email,password]);},async signInWithCustomToken(){throw Error('UNEXPECTED_CUSTOM_TOKEN');}};
 const firebase={auth:Object.assign(()=>instance,{Auth:{Persistence:{SESSION:'session'}}})};
 const page={evaluate:(fn,arg)=>vm.runInNewContext('('+fn.toString()+')(argument)',{firebase,argument:arg})};
 const auth={async createCustomToken(){throw Error('UNEXPECTED_IAM_SIGNING');}};
 await f3RoleSignIn({page,auth,uid:actors[0].uid,authentication:F3_SYNTHETIC_PASSWORD_AUTH,credentials});
 assert.deepEqual(calls,[['persist','session'],['password',credentials.email,credentials.password]]);
 await assert.rejects(f3RoleSignIn({page,auth,uid:actors[1].uid,authentication:F3_SYNTHETIC_PASSWORD_AUTH,credentials}),/ACTOR_CREDENTIALS/);
 assert.equal(f3RoleMutationRequest('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword','POST',qa),false);
});

test('readiness waits through restored Firebase user with null backend context, then requires authority and the exact scope',()=>{
 const expected={uid:actors[0].uid,revision:'a'.repeat(64),projectId:qa.projectId};
 let context=null;
 const user={uid:expected.uid};
 const window={firebase:{auth:()=>({currentUser:user})},CX:{backendAuth:{context:()=>context},data:{currentProjectId:qa.projectId,previewMeta:{sourceRevision:expected.revision}}},
  CX_PROTECTED_AUTH_HR_AUTHORITY:{applied:true}};
 const ready=()=>vm.runInNewContext('('+f3RolePageReady.toString()+')(expected)',{window,expected});
 assert.equal(ready(),false);
 context={authenticated:true};window.CX_PROTECTED_AUTH_HR_AUTHORITY.applied=false;assert.equal(ready(),false);
 window.CX_PROTECTED_AUTH_HR_AUTHORITY.applied=true;assert.equal(ready(),true);
 user.uid='foreign';assert.equal(ready(),false);user.uid=expected.uid;
 window.CX.data.currentProjectId='cinepolis';assert.equal(ready(),false);window.CX.data.currentProjectId=qa.projectId;
 window.CX.data.previewMeta.sourceRevision='b'.repeat(64);assert.equal(ready(),false);
 window.CX.data=null;assert.equal(ready(),false);
});

test('capture failures retain phase, country, stage and safe error metadata without raw error content',async()=>{
 const p=providers(),secret='SYNTHETIC_SECRET_MUST_NOT_APPEAR_IN_EVIDENCE';let attempts=0;
 const q=await createF3ShopperRoleQa({...p.args,openBrowser:async()=>({
  async newContext(){const error=new TypeError(secret);if(attempts++===0)error.code='ECONNRESET';else{error.name=secret;error.code='Bearer '+secret;}throw error;},
  async close(){}
 })});
 await q.prepare();await q.capture('before',live());
 assert.equal(q.state.decision,'HOLD_F3_QA_SHOPPER_ROLE');assert.equal(q.state.failures.length,2);
 assert.deepEqual(q.state.failureDetails.map(x=>({phase:x.phase,country:x.country,step:x.step})),[
  {phase:'before',country:'GT',step:'context_create'},{phase:'before',country:'HN',step:'context_create'}]);
 assert.equal(q.state.failureDetails[0].errorName,'TypeError');assert.equal(q.state.failureDetails[0].errorCode,'ECONNRESET');
 assert.equal(q.state.failureDetails[1].errorName,'Error');assert.equal(q.state.failureDetails[1].errorCode,null);
 assert.equal(q.state.failureDetails[1].errorCodeOmitted,true);
 assert.equal(q.state.phases[0].countries[0].diagnostic.step,'context_create');
 assert.equal(JSON.stringify(p.published).includes(secret),false);
 assert.equal(q.state.blockedOperationalRequests,0);
});
