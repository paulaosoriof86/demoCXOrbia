import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createAcademyCommandProvider,academyProgressCourseContract,academyProgressCatalog,academyProgressSnapshot} from '../../cxorbia-academy-command-provider-v1.mjs';
import {commandProviderKind,createProviderForCommand} from '../cxorbia-command-runtime-v1.mjs';

const clone=v=>v===undefined?undefined:structuredClone(v);
class Snap{constructor(id,v){this.id=id;this._v=v;this.exists=v!==undefined;}data(){return clone(this._v);}}
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(n){return new Col(this.db,this.path+'/'+n);}async get(){return new Snap(this.id,this.db.s.get(this.path));}}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}}
class DB{
  constructor(){this.s=new Map();}
  collection(n){return new Col(this,n);}
  seed(p,v){this.s.set(p,clone(v));}
  async runTransaction(fn){
    const w=new Map([...this.s].map(([k,v])=>[k,clone(v)]));let wrote=false;
    const tx={
      get:async r=>{if(wrote)throw new Error('READ_AFTER_WRITE');return new Snap(r.id,w.get(r.path));},
      set:(r,v,o={})=>{wrote=true;const old=w.get(r.path);w.set(r.path,o.merge&&old?{...clone(old),...clone(v)}:clone(v));},
      create:(r,v)=>{wrote=true;if(w.has(r.path))throw new Error('ALREADY_EXISTS');w.set(r.path,clone(v));}
    };
    const out=await fn(tx);this.s=w;return out;
  }
}
class Auth{
  constructor(uid='admin-1',role='super'){this.uid=uid;this.role=role;}
  async verifyIdToken(){return{uid:this.uid,tenantId:'tenant-a',role:this.role,authNamespace:'staff',name:this.uid};}
}
const policy={schemaVersion:'cxorbia.academy-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],hrWrites:false,externalWrites:false,paymentWrites:false};
function baseDb(){
  const d=new DB();
  d.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff',name:'Admin One'});
  d.seed('tenants/tenant-a/users/admin-2',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',name:'Admin Two'});
  d.seed('tenants/tenant-a/users/admin-3',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',name:'Admin Three'});
  return d;
}
function cmd(type,payload={},extra={}){
  return {commandType:type,entityType:type==='academy.category.create'?'academyCategory':'academyCourse',entityId:extra.entityId||null,tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',requireProject:false,requirePeriod:false,expectedVersion:extra.expectedVersion??(type.endsWith('.create')?'absent':1),idempotencyKey:extra.idempotencyKey||type+':key',payload,authorization:{providerEnforcementRequired:true,permission:extra.permission||'academy.edit'}};
}

test('VRM-192 runtime routes academy lifecycle commands to academy provider',()=>{
  for(const t of ['academy.course.create','academy.course.update','academy.course.state','academy.category.create'])assert.equal(commandProviderKind(t),'academy');
});

test('D08 runtime factory selects the actual Academia provider without operational policy',async()=>{
  const db=baseDb(),auth=new Auth();
  for(const type of ['academy.course.create','academy.course.update','academy.course.state','academy.category.create']){
    const selected=createProviderForCommand(cmd(type),{auth,db,academyPolicy:policy});
    assert.equal(selected.kind,'academy');
    assert.ok(selected.provider,selected.error);
    assert.equal(selected.provider.version,'cxorbia-academy-command-provider-v1');
  }
  const create=cmd('academy.course.create',{audience:'admin',n:'Curso QA de dispatch',lessons:[]},{idempotencyKey:'dispatch:create'});
  const selected=createProviderForCommand(create,{auth,db,academyPolicy:policy});
  const first=await selected.provider.execute('token',create);
  const replay=await selected.provider.execute('token',create);
  assert.equal(first.ok,true);assert.equal(first.providerAck,true);assert.equal(first.readbackVerified,true);
  assert.equal(first.entityType,'academyCourse');assert.equal(first.entityReadback.n,'Curso QA de dispatch');
  assert.equal(first.hrWrites,0);assert.equal(first.externalWrites,0);assert.equal(first.paymentWrites,0);
  assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
});

test('D08 missing Academia policy never falls through to the operational provider',()=>{
  const db=baseDb(),before=[...db.s.entries()];
  const selected=createProviderForCommand(cmd('academy.course.update'),{auth:new Auth(),db,academyPolicy:null,operationalPolicy:{enabled:true}});
  assert.equal(selected.kind,'academy');assert.equal(selected.provider,null);
  assert.equal(selected.error,'ACADEMY_COMMAND_PROVIDER_NOT_CONFIGURED');
  assert.deepEqual([...db.s.entries()],before);
});

test('D08 invalid Academia policy fails closed without operational fallback or writes',()=>{
  const db=baseDb(),before=[...db.s.entries()];
  const selected=createProviderForCommand(cmd('academy.course.update'),{auth:new Auth(),db,academyPolicy:{...policy,enabled:false},operationalPolicy:{enabled:true}});
  assert.equal(selected.kind,'academy');assert.equal(selected.provider,null);
  assert.equal(selected.error,'ACADEMY_COMMAND_PROVIDER_POLICY_INVALID');
  assert.match(selected.detail,/POLICY_DISABLED/);assert.deepEqual([...db.s.entries()],before);
});

test('VRM-192 custom course create is tenant durable audited idempotent and seed-safe',async()=>{
  const db=baseDb(),provider=createAcademyCommandProvider({auth:new Auth(),db,policy});
  const c=cmd('academy.course.create',{audience:'admin',n:'Curso Durable',cat:'Operación',lessons:[],scope:{tenantId:['tenant-a']}});
  const first=await provider.execute('token',c),again=await provider.execute('token',c);
  assert.equal(first.ok,true);assert.equal(first.providerAck,true);assert.equal(first.readbackVerified,true);
  assert.equal(first.entityReadback.n,'Curso Durable');assert.equal(first.entityReadback.estado,'borrador');assert.equal(first.entityReadback.version,1);
  assert.equal(first.hrWrites,0);assert.equal(first.externalWrites,0);assert.equal(first.localStorageWrite,false);
  assert.equal(again.ok,true);assert.equal(again.idempotentReplay,true);assert.equal(again.providerWrites,0);
  assert.ok([...db.s.keys()].some(k=>k.includes('/academyCourses/')));
  assert.ok([...db.s.keys()].some(k=>k.includes('/academyAudit/')));
  assert.ok([...db.s.keys()].some(k=>k.includes('/commandReceipts/')));
  assert.ok([...db.s.keys()].some(k=>k.includes('/entityAuditTrail/')));
  const seed=await provider.execute('token',cmd('academy.course.create',{audience:'admin',n:'Seed',sourceOwned:true},{idempotencyKey:'seed:deny'}));
  assert.equal(seed.ok,false);assert.match(seed.code,/ACADEMY_COURSE_INVALID/);
});

test('VRM-192 expectedVersion protects content edits and increments content version',async()=>{
  const db=baseDb(),provider=createAcademyCommandProvider({auth:new Auth(),db,policy});
  const created=await provider.execute('token',cmd('academy.course.create',{audience:'admin',n:'Curso Uno',lessons:[]},{idempotencyKey:'course:create:one'}));
  const updated=await provider.execute('token',cmd('academy.course.update',{audience:'admin',patch:{desc:'Cambio durable'},contentChange:true},{entityId:created.entityId,expectedVersion:1,idempotencyKey:'course:update:one'}));
  assert.equal(updated.ok,true);assert.equal(updated.entityReadback.desc,'Cambio durable');assert.equal(updated.entityReadback.version,2);assert.equal(updated.entityReadback.contentVersion,2);
  const stale=await provider.execute('token',cmd('academy.course.update',{audience:'admin',patch:{desc:'Stale'},contentChange:true},{entityId:created.entityId,expectedVersion:1,idempotencyKey:'course:update:stale'}));
  assert.equal(stale.ok,false);assert.match(stale.code,/ACADEMY_EXPECTED_VERSION_CONFLICT/);
});

test('VRM-192 workflow enforces separation of duties and durable workflow version',async()=>{
  const db=baseDb(),creator=createAcademyCommandProvider({auth:new Auth('admin-1','super'),db,policy});
  const created=await creator.execute('token',cmd('academy.course.create',{audience:'admin',n:'Curso Flujo',lessons:[]},{idempotencyKey:'wf:create'}));
  const selfReview=await creator.execute('token',cmd('academy.course.state',{audience:'admin',state:'en_revision',reason:'revisar'},{entityId:created.entityId,expectedVersion:1,idempotencyKey:'wf:self-review'}));
  assert.equal(selfReview.ok,false);assert.match(selfReview.code,/REVIEWER_MUST_DIFFER/);
  const reviewer=createAcademyCommandProvider({auth:new Auth('admin-2','admin'),db,policy});
  const reviewed=await reviewer.execute('token',cmd('academy.course.state',{audience:'admin',state:'en_revision',reason:'revisión'},{entityId:created.entityId,expectedVersion:1,idempotencyKey:'wf:review'}));
  assert.equal(reviewed.ok,true);assert.equal(reviewed.entityReadback.estado,'en_revision');assert.equal(reviewed.entityReadback.workflowVersion,2);assert.equal(reviewed.entityReadback.reviewedByUserId,'admin-2');
  const approver=createAcademyCommandProvider({auth:new Auth('admin-3','admin'),db,policy});
  const approved=await approver.execute('token',cmd('academy.course.state',{audience:'admin',state:'aprobado',reason:'contenido validado'},{entityId:created.entityId,expectedVersion:2,idempotencyKey:'wf:approve'}));
  assert.equal(approved.ok,true);assert.equal(approved.entityReadback.estado,'aprobado');assert.equal(approved.entityReadback.workflowVersion,3);assert.equal(approved.entityReadback.approvedByUserId,'admin-3');
});

test('VRM-192 categories are durable tenant entities with provider ACK/readback',async()=>{
  const db=baseDb(),provider=createAcademyCommandProvider({auth:new Auth(),db,policy});
  const result=await provider.execute('token',cmd('academy.category.create',{name:'Investigación de mercados'},{idempotencyKey:'cat:create'}));
  assert.equal(result.ok,true);assert.equal(result.entityType,'academyCategory');assert.equal(result.readbackVerified,true);assert.equal(result.entityReadback.name,'Investigación de mercados');
});

test('VRM-192 frontend custom content uses protected academy state and awaits provider ACK/readback',()=>{
  const academy=fs.readFileSync(new URL('../../../../app/modules/academia.js',import.meta.url),'utf8');
  const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
  const bridge=fs.readFileSync(new URL('../../../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',import.meta.url),'utf8');
  assert.match(academy,/_state\(\)\{CX\.data\.__academyState/);
  assert.match(academy,/if\(this\._canonical\(\)\)return \(Array\.isArray\(this\._state\(\)\.courses\)/);
  assert.match(academy,/ACADEMY_PROVIDER_OWNS_CUSTOM_CONTENT/);
  assert.match(academy,/academy\.course\.create/);assert.match(academy,/academy\.course\.update/);assert.match(academy,/academy\.course\.state/);assert.match(academy,/academy\.category\.create/);
  assert.match(academy,/providerAck===true&&a\.successUiAllowed===true&&a\.readbackVerified===true/);
  assert.match(academy,/await Promise\.resolve\(CX\.acadData\.editCourse/);
  assert.match(academy,/await Promise\.resolve\(CX\.acadData\.setCourseState/);
  assert.match(academy,/await Promise\.resolve\(CX\.acadData\.addCourse/);
  assert.match(academy,/CX\.acadData\.addCategory\(n\)/);
  assert.doesNotMatch(academy,/ncatSave[^\n]*localStorage/);
  assert.match(server,/firestore_tenant_academy/);assert.match(server,/academyCourses/);assert.match(server,/academyCategories/);assert.match(server,/academyAudit/);
  assert.match(bridge,/__academyState(?:=|:)clone\(protectedState\?\.academy\|\|\{\}\)/);
});

console.log('PASS_VRM192_ACADEMY_PROVIDER_SOURCE');

const contract=JSON.parse(fs.readFileSync(new URL('../../../contracts/cxorbia-academy-base-progress-contract-v1.json',import.meta.url),'utf8'));
const baseCourse=(audience='shopper',id)=>contract.courses.find(c=>c.audience===audience&&(!id||c.courseId===id));
function learnerDb(uid='learner-a',role='shopper',namespace=role==='shopper'?'shopper':role==='cliente'?'client':'staff'){
  const db=baseDb();db.seed('tenants/tenant-a/users/'+uid,{active:true,tenantId:'tenant-a',role,authNamespace:namespace,projectIds:['project-a'],membershipVersion:42,name:uid,untouched:{keep:true}});return db;
}
const learnerAuth=(uid='learner-a',role='shopper',namespace=role==='shopper'?'shopper':role==='cliente'?'client':'staff')=>({verifyIdToken:async()=>({uid,tenantId:'tenant-a',role,authNamespace:namespace,name:uid,country:'GT'})});
function progressCommand(c,lesson=c.lessons[0],version=0,extra={}){
  return cmd('academy.progress.lesson.complete',{origin:'base',audience:c.audience,courseId:c.courseId,revision:c.revision,lessonId:lesson.id,answers:lesson.quiz.map(()=>0)},
    {entityId:c.courseId,expectedVersion:version,idempotencyKey:'progress:'+c.courseId+':'+lesson.id+':'+version,...extra});
}
function pcommand(c,lesson,version=0,extra={}){
  const out=progressCommand(c,lesson,version,extra);out.entityType='academyProgress';out.authorization.permission='academy.progress.self';return out;
}
const progressProvider=(db,auth=learnerAuth())=>createAcademyCommandProvider({auth,db,policy});

test('D08 source validation contract matches all 27 existing courses and 117 lessons exactly',()=>{
  const CX={};vm.runInNewContext(fs.readFileSync(new URL('../../../../app/modules/academia.js',import.meta.url),'utf8').split('/* ─ Engine del módulo ─ */')[0],{CX,window:{CX}},{timeout:2000});
  const actual=Object.entries(CX.acadData.COURSES).flatMap(([audience,cs])=>cs.map(c=>academyProgressCourseContract(c,audience)));
  assert.deepEqual(JSON.parse(JSON.stringify(actual)),contract.courses);assert.equal(actual.length,27);assert.equal(actual.reduce((n,c)=>n+c.lessons.length,0),117);
});

test('D08 complete lesson persists only own progress with ACK, new-session reconstruction and period-independent replay',async()=>{
  const db=learnerDb(),before=clone(db.s.get('tenants/tenant-a/users/learner-a')),c=baseCourse(),command=pcommand(c);
  const result=await progressProvider(db).execute('token',command);assert.equal(result.ok,true,result.code);assert.equal(result.providerAck,true);assert.equal(result.readbackVerified,true);assert.equal(result.providerWrites,4);assert.equal(result.entityReadback.progress.lessons[c.lessons[0].id],100);
  const member=db.s.get('tenants/tenant-a/users/learner-a'),{academyProgress,...core}=member;assert.deepEqual(core,before);assert.equal(academyProgress.ownerUid,'learner-a');
  const fresh=academyProgressSnapshot(member,'tenant-a','learner-a');assert.equal(Object.values(fresh.courses)[0].version,1);assert.equal(Object.values(fresh.courses)[0].completed,false);
  const replay=await progressProvider(db).execute('new-session-token',{...command,periodId:'new-period'});assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
  assert([...db.s.keys()].filter(k=>!k.includes('/users/')).every(k=>/\/(commandReceipts|academyAudit|entityAuditTrail)\//.test(k)));
});

test('D08 same-role identities are isolated, payload cannot select another owner and editing remains denied',async()=>{
  const db=learnerDb(),c=baseCourse();db.seed('tenants/tenant-a/users/learner-b',{...clone(db.s.get('tenants/tenant-a/users/learner-a')),name:'learner-b'});
  await progressProvider(db).execute('token',pcommand(c));
  assert.deepEqual(academyProgressSnapshot(db.s.get('tenants/tenant-a/users/learner-b'),'tenant-a','learner-b').courses,{});
  assert.deepEqual(academyProgressSnapshot(db.s.get('tenants/tenant-a/users/learner-a'),'tenant-a','learner-b').courses,{});
  const forged=pcommand(c);forged.payload.ownerUid='learner-a';const bad=await progressProvider(db,learnerAuth('learner-b')).execute('token',forged);assert.equal(bad.ok,false);assert.equal(bad.providerWrites,0);
  const own=await progressProvider(db,learnerAuth('learner-b')).execute('token',pcommand(c));assert.equal(own.ok,true,own.code);assert.equal(own.entityReadback.ownerUid,'learner-b');
  const edit=await progressProvider(db).execute('token',cmd('academy.course.create',{audience:'shopper',n:'Forbidden'}));assert.equal(edit.ok,false);assert.match(edit.code,/ACTOR_DENIED/);
});

test('D08 learner access rejects tenant, inactive member, namespace, project and audience without writes',async()=>{
  for(const kind of ['tenant','inactive','namespace','project','audience']){
    const db=learnerDb(),c=baseCourse(),command=pcommand(c);let auth=learnerAuth();
    if(kind==='tenant')command.tenantId='tenant-b';
    if(kind==='inactive')db.s.get('tenants/tenant-a/users/learner-a').active=false;
    if(kind==='namespace')auth=learnerAuth('learner-a','shopper','staff');
    if(kind==='project')command.projectId='project-foreign';
    if(kind==='audience')Object.assign(command,pcommand(baseCourse('admin')));
    const before=clone([...db.s.entries()]),r=await progressProvider(db,auth).execute('token',command);assert.equal(r.ok,false,kind);assert.equal(r.providerWrites,0,kind);assert.deepEqual([...db.s.entries()],before,kind);
  }
});

test('D08 membership compatibility matches existing protected login without weakening explicit denials',async()=>{
  const db=learnerDb(),member=db.s.get('tenants/tenant-a/users/learner-a');delete member.active;delete member.tenantId;
  const r=await progressProvider(db).execute('token',pcommand(baseCourse()));assert.equal(r.ok,true,r.code);
  member.tenantId='different-tenant';db.s.set('tenants/tenant-a/users/learner-a',member);
  const denied=await progressProvider(db).execute('token',pcommand(baseCourse()));assert.equal(denied.ok,false);assert.equal(denied.providerWrites,0);
});

test('D08 stale version cannot overwrite a concurrent lesson and replay never duplicates progress',async()=>{
  const db=learnerDb(),c=baseCourse(),provider=progressProvider(db);const first=await provider.execute('token',pcommand(c));assert.equal(first.ok,true);
  const stale=await provider.execute('token',pcommand(c,c.lessons[1],0));assert.equal(stale.code,'ACADEMY_PROGRESS_VERSION_CONFLICT');
  const second=await provider.execute('token',pcommand(c,c.lessons[1],1));assert.equal(second.ok,true,second.code);assert.equal(Object.keys(second.entityReadback.progress.lessons).length,2);
  const replay=await provider.execute('token',pcommand(c));assert.equal(replay.ok,true);assert.equal(replay.providerWrites,0);assert.equal(replay.entityVersion,2);
});

test('D08 quiz needs every valid reviewed answer, does not invent a passing-score gate or certify project',async()=>{
  const db=learnerDb(),c=baseCourse(),quiz=c.lessons.find(l=>l.quiz.length),command=pcommand(c,quiz),provider=progressProvider(db);
  const missing=clone(command);missing.payload.answers=[];const blocked=await provider.execute('token',missing);assert.equal(blocked.code,'ACADEMY_PROGRESS_QUIZ_REVIEW_REQUIRED');
  const r=await provider.execute('token',command);assert.equal(r.ok,true,r.code);assert.equal(r.entityReadback.progress.completed,false);assert.equal(r.entityReadback.progress.lessons[quiz.id],100);
  assert.equal([...db.s.keys()].some(k=>/certifications|visits|academyCourses/.test(k)),false);
});

test('D08 a course without a quiz completes only after all its actual lessons',async()=>{
  const db=learnerDb('admin-own','admin','staff'),c=baseCourse('admin','a_plat_ctx'),provider=progressProvider(db,learnerAuth('admin-own','admin','staff'));
  assert(c.lessons.every(l=>l.quiz.length===0));let r;
  for(let i=0;i<c.lessons.length;i++){r=await provider.execute('token',pcommand(c,c.lessons[i],i));assert.equal(r.ok,true,r.code);assert.equal(r.entityReadback.progress.completed,i===c.lessons.length-1);}
  assert.equal(r.entityReadback.ownerUid,'admin-own');
});

test('D08 every existing base course reaches completion only after all 117 content and quiz requirements',async()=>{
  let lessons=0;
  for(const c of contract.courses){
    const role=c.audience==='admin'?'super':c.audience,uid='catalog-'+c.audience,namespace=role==='shopper'?'shopper':role==='cliente'?'client':'staff';
    const db=learnerDb(uid,role,namespace),provider=progressProvider(db,learnerAuth(uid,role,namespace));
    for(let i=0;i<c.lessons.length;i++){
      const r=await provider.execute('token',pcommand(c,c.lessons[i],i));assert.equal(r.ok,true,c.courseId+':'+r.code);assert.equal(r.entityReadback.progress.completed,i===c.lessons.length-1,c.courseId);lessons++;
    }
    assert.equal([...db.s.keys()].some(k=>/certifications|visits|academyCourses/.test(k)),false);
  }
  assert.equal(lessons,117);
});

test('D08 Cliente progression is self-scoped while client course editing stays denied',async()=>{
  const db=learnerDb('client-own','cliente','client'),provider=progressProvider(db,learnerAuth('client-own','cliente','client')),c=baseCourse('cliente');
  const own=await provider.execute('token',pcommand(c));assert.equal(own.ok,true,own.code);assert.equal(own.entityReadback.ownerUid,'client-own');
  const edit=await provider.execute('token',cmd('academy.category.create',{name:'denied'}));assert.equal(edit.ok,false);assert.equal(edit.providerWrites,0);
});

test('D08 custom published revision validates scope and preserves old revision history',async()=>{
  const db=learnerDb(),course={id:'custom-one',tenantId:'tenant-a',audience:'shopper',estado:'publicado_preview',contentVersion:1,scope:{tenantId:['tenant-a'],projectId:['project-a'],pais:['GT']},lessons:[{id:'custom-l1',content:'First'}]};
  const ref='tenants/tenant-a/academyCourses/custom-one';db.seed(ref,course);
  const c=academyProgressCourseContract(course,'shopper'),command=pcommand(c);command.payload.origin='custom';const r=await progressProvider(db).execute('token',command);assert.equal(r.ok,true,r.code);assert.equal(r.entityReadback.progress.completed,true);
  db.seed(ref,{...course,contentVersion:2,lessons:[{id:'custom-l1',content:'Updated'}]});
  const stale=await progressProvider(db).execute('token',command);assert.equal(stale.code,'ACADEMY_PROGRESS_REVISION_CONFLICT');
  const next=academyProgressCourseContract(db.s.get(ref),'shopper'),nextCommand=pcommand(next);nextCommand.idempotencyKey='new-revision';nextCommand.payload.origin='custom';const saved=await progressProvider(db).execute('token',nextCommand);assert.equal(saved.ok,true,saved.code);
  assert.equal(Object.keys(db.s.get('tenants/tenant-a/users/learner-a').academyProgress.courses).length,2);assert.equal(db.s.get(ref).contentVersion,2);
});

test('D08 reference forgery, unreviewed quiz and draft custom content cannot grant completion',async()=>{
  for(const kind of ['revision','lesson','origin','percentage','draft']){
    const db=learnerDb(),c=baseCourse(),command=pcommand(c);
    if(kind==='revision')command.payload.revision='0'.repeat(64);
    if(kind==='lesson')command.payload.lessonId='unknown-lesson';
    if(kind==='origin')command.payload.origin='custom';
    if(kind==='percentage')command.payload.percentage=100;
    if(kind==='draft'){command.payload.origin='custom';db.seed('tenants/tenant-a/academyCourses/'+c.courseId,{tenantId:'tenant-a',audience:c.audience,estado:'borrador'});}
    const before=clone([...db.s.entries()]),r=await progressProvider(db).execute('token',command);assert.equal(r.ok,false,kind);assert.deepEqual([...db.s.entries()],before,kind);
  }
});

test('D08 failed remote readback never permits success even after a committed transaction',async()=>{
  const db=learnerDb(),memberRef=db.collection('tenants').doc('tenant-a').collection('users').doc('learner-a');
  const original=Ref.prototype.get;Ref.prototype.get=async function(){if(this.path===memberRef.path)throw new Error('READBACK_OFFLINE');return original.call(this);};
  try{const result=await progressProvider(db).execute('token',pcommand(baseCourse()));assert.equal(result.ok,false);assert.equal(result.successUiAllowed,false);assert.equal(result.readbackVerified,false);assert.equal(result.committed,true);assert.equal(result.providerWrites,4);}finally{Ref.prototype.get=original;}
});

function browserAcademy({db,uid='learner-a',role='shopper',execute}={}){
  const member=db.s.get('tenants/tenant-a/users/'+uid),auth={actorId:uid,role,tenantId:'tenant-a',projectIds:['project-a'],projectId:'project-a',shopperId:role==='shopper'?'shopper-a':null};
  const CX={data:{__academyState:{tenantId:'tenant-a',courses:[],progressOwnerUid:uid,progress:academyProgressSnapshot(member,'tenant-a',uid),progressCatalog:academyProgressCatalog()}},BRAND:{id:'tenant-a'},BACKEND:{tenantId:'tenant-a',enableCommandWrites:true},backendAuth:{context:()=>auth},cxDataCommandBoundary:{canonicalMode:()=>true,context:()=>auth},session:{user:{role},role},bus:{emit(){}}};
  const firebaseUser={uid},window={CX,firebase:{auth:()=>({currentUser:firebaseUser})}};
  const context={CX,window,localStorage:{getItem(){throw new Error('LOCAL_STORAGE_FORBIDDEN');},setItem(){throw new Error('LOCAL_STORAGE_FORBIDDEN');}}};
  vm.runInNewContext(fs.readFileSync(new URL('../../../../app/modules/academia.js',import.meta.url),'utf8').split('/* ─ Engine del módulo ─ */')[0],context,{timeout:2000});
  vm.runInNewContext(fs.readFileSync(new URL('../../../../app/adapters/cxorbia-command-adapter-v1.js',import.meta.url),'utf8'),context,{timeout:2000});
  const provider=progressProvider(db,learnerAuth(uid,role));CX.commandAdapter.registerTransport('test',{execute:execute||((command)=>provider.execute('test-token',command))});CX.commandAdapter.useTransport('test');
  return {CX,user:firebaseUser};
}

test('D08 actual frontend adapter writes own progress and a fresh storage-free UI reconstructs it',async()=>{
  const db=learnerDb(),{CX}=browserAcademy({db}),course=CX.acadData.COURSES.shopper[0];assert.equal(CX.acadData.courseProgress(course,'shopper').version,0);
  const r=await CX.acadData.completeLesson(course,'shopper',course.lessons[0]);assert.equal(r.ok,true,r.code);assert.equal(CX.acadData.courseProgress(course,'shopper').version,1);
  const fresh=browserAcademy({db}).CX;assert.equal(fresh.acadData.courseProgress(fresh.acadData.COURSES.shopper[0],'shopper').version,1);
  const edit=await CX.acadData.addCourse('shopper',{n:'Forbidden',lessons:[]});assert.equal(edit.ok,false);assert.match(edit.code,/ROLE_DENIED/);
});

test('D08 frontend completion waits for ACK and suppresses a late result after identity switch',async()=>{
  const db=learnerDb();let release;const response=new Promise(resolve=>{release=resolve;});const {CX,user}=browserAcademy({db,execute:()=>response});const course=CX.acadData.COURSES.shopper[0],lesson=course.lessons[0];
  const pending=CX.acadData.completeLesson(course,'shopper',lesson);assert.equal(CX.acadData.courseProgress(course,'shopper').version,0);
  const saved=await progressProvider(db).execute('token',pcommand(baseCourse()));user.uid='learner-b';release(saved);
  const r=await pending;assert.equal(r.ok,false);assert.equal(r.code,'ACADEMY_PROGRESS_READBACK_BINDING_MISMATCH');assert.equal(CX.acadData.courseProgress(course,'shopper').version,0);
});

test('D08 frontend does not create a local progress truth when provider ACK fails',async()=>{
  const db=learnerDb(),{CX}=browserAcademy({db,execute:async()=>({ok:false,code:'PROVIDER_OFFLINE'})}),course=CX.acadData.COURSES.shopper[0];
  const result=await CX.acadData.completeLesson(course,'shopper',course.lessons[0]);assert.equal(result.ok,false);assert.equal(CX.acadData.courseProgress(course,'shopper').version,0);assert.equal(db.s.get('tenants/tenant-a/users/learner-a').academyProgress,undefined);
});

test('D08 frontend Cliente exception permits only own-progress command and correct permission',async()=>{
  const db=learnerDb('client-own','cliente','client'),{CX}=browserAcademy({db,uid:'client-own',role:'cliente'}),course=CX.acadData.COURSES.cliente[0];
  const r=await CX.acadData.completeLesson(course,'cliente',course.lessons[0]);assert.equal(r.ok,true,r.code);
  const edit=await CX.acadData.addCategory('Must not create');assert.equal(edit.ok,false);assert.equal(edit.code,'COMMAND_CLIENT_WRITE_DENIED');
  const forged=pcommand(baseCourse('cliente'));forged.authorization.permission='academy.edit';forged.actor={role:'cliente'};const denied=await CX.commandAdapter.execute(forged);assert.equal(denied.ok,false);assert.equal(denied.code,'COMMAND_ACADEMY_SELF_SCOPE_REQUIRED');
});

test('D08 source player never writes on open, uses explicit completion and protected principal readback',()=>{
  const ui=fs.readFileSync(new URL('../../../../app/modules/academia.js',import.meta.url),'utf8'),server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(ui,/cx_acad2_|setProg\(|host\.getElementById/);assert.match(ui,/async event=>\{\s*if\(!await saveLesson/);assert.match(ui,/const reviewed=new Map\(\)/);assert.match(ui,/Mi avance/);assert.doesNotMatch(ui,/del equipo<\/div>/);
  assert.match(server,/tenant\.collection\('users'\)\.doc\(principal\.uid\)\.get\(\)/);assert.match(server,/academyProgressSnapshot\(learner\.data\(\),scope\.tenantId,principal\.uid\)/);
  assert.equal(commandProviderKind('academy.progress.lesson.complete'),'academy');
});
