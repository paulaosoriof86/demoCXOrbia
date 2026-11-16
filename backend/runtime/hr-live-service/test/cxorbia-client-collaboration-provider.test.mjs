import test from 'node:test';
import assert from 'node:assert/strict';
import {createOperationalCommandProvider} from '../../cxorbia-operational-command-provider-v1.mjs';
import {createProviderForCommand,maybeHandleCxorbiaCommandRuntimeRequest} from '../cxorbia-command-runtime-v1.mjs';
import {Readable} from 'node:stream';
import {readFileSync} from 'node:fs';
const clone=x=>x===undefined?undefined:structuredClone(x);
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(n){return new Col(this.db,this.path+'/'+n);}async get(){if(this.db.failReadback&&this.path.includes('/bulletins/'))throw Error('READBACK_FAILED');return snap(this.id,this.db.rows.get(this.path));}}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}}
const snap=(id,v)=>({id,exists:v!==undefined,data:()=>clone(v)});
class DB{
  constructor(){this.rows=new Map();this.tail=Promise.resolve();this.failReadback=false;}
  collection(n){return new Col(this,n);}
  runTransaction(fn){const task=this.tail.then(async()=>{const rows=new Map([...this.rows].map(([k,v])=>[k,clone(v)]));let written=false;const tx={get:async r=>{assert.equal(written,false,'FIRESTORE_READ_AFTER_WRITE');return snap(r.id,rows.get(r.path));},create:(r,v)=>{assert.ok(!rows.has(r.path));written=true;rows.set(r.path,clone(v));},set:(r,v,opt)=>{written=true;rows.set(r.path,opt?.merge?{...rows.get(r.path),...clone(v)}:clone(v));},delete:r=>{written=true;rows.delete(r.path);}};const out=await fn(tx);this.rows=rows;return out;});this.tail=task.catch(()=>{});return task;}
}
const scope={tenantId:'tenant-a',projectId:'project-a',periodId:'period-a'};
const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:[],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
const types={nps:['client.nps.submit','clientNps',{score:9,comment:'Bueno'}],note:['client.note.create','clientNote',{subject:'Hallazgo',detail:'Detalle'}],meeting:['client.meeting.request','clientMeeting',{subject:'Revisión',date:'2099-12-15',time:'10:00',mode:'Presencial'}]};
function fixture(){const db=new DB();const users={a:{uid:'client-a',role:'cliente',authNamespace:'staff',tenantId:'tenant-a',projectIds:['project-a']},b:{uid:'client-b',role:'cliente',authNamespace:'staff',tenantId:'tenant-a',projectIds:['project-a']},admin:{uid:'admin-a',role:'admin',authNamespace:'staff',tenantId:'tenant-a',projectIds:['project-a']},shopper:{uid:'shopper-a',role:'shopper',authNamespace:'shopper',shopperId:'shopper-a',tenantId:'tenant-a',projectIds:['project-a']}};
 for(const v of Object.values(users))db.rows.set('tenants/tenant-a/users/'+v.uid,{...v,status:'active',active:true,name:'Nombre verificado'});
 db.rows.set('tenants/tenant-a/projects/project-a',{id:'project-a',tenantId:'tenant-a',status:'active',timeZone:'UTC'});db.rows.set('tenants/tenant-a/projects/project-a/periods/period-a',{id:'period-a',tenantId:'tenant-a',projectId:'project-a',state:'activo'});
 const auth={verifyIdToken:async token=>{assert.ok(users[token]);return clone(users[token]);}},p=createOperationalCommandProvider({db,auth,policy});
 const command=(kind,key='request-000000001')=>{const [commandType,entityType,payload]=types[kind];return {version:'cxorbia-command-adapter-v1',commandType,entityType,entityId:null,...scope,expectedVersion:'absent',idempotencyKey:commandType+':'+key,payload:{...payload,periodId:scope.periodId,clientRequestId:key},actor:{actorId:'client-a',role:'cliente',projectIds:['project-a']},authorization:{providerEnforcementRequired:true,permission:commandType}};};
 return {db,users,auth,p,command,records:()=>[...db.rows.entries()].filter(([path])=>path.includes('/bulletins/')).map(([,v])=>v)};
}
function externalFixture(){const x=fixture();x.db.rows.delete('tenants/tenant-a/projects/project-a/periods/period-a');x.db.rows.get('tenants/tenant-a/projects/project-a').operationalSource={mode:'external',providerType:'google_sheets'};
 const hrSnapshot={sourceSafe:true,imported:false,tenantId:'tenant-a',projectId:'project-a',periods:[{id:'project-a-2026-11',key:'2026-11',projectId:'project-a'}]},hrRevision='b'.repeat(64),c=x.command('note');c.periodId='project-a-2026-11';c.payload.periodId=c.periodId;
 return {...x,hrSnapshot,hrRevision,c,provider:()=>createProviderForCommand(c,{auth:x.auth,db:x.db,operationalPolicy:policy,hrSnapshot,hrRevision}).provider};
}
test('Client commands accept exact current server HR period without creating optional Firestore metadata',async()=>{const x=externalFixture(),r=await x.provider().execute('a',x.c);assert.equal(r.ok,true,JSON.stringify(r));assert.equal(x.records().length,1);assert.equal([...x.db.rows.keys()].filter(k=>k.includes('/periods/')).length,0);});
test('legacy project without explicit source metadata may use only its exact server HR scope',async()=>{const x=externalFixture();delete x.db.rows.get('tenants/tenant-a/projects/project-a').operationalSource;assert.equal((await x.provider().execute('a',x.c)).ok,true);});
for(const [label,mutate] of [
 ['internal project',x=>x.db.rows.get('tenants/tenant-a/projects/project-a').operationalSource.mode='internal'],
 ['foreign snapshot',x=>x.hrSnapshot.projectId='project-b'],['foreign tenant',x=>x.hrSnapshot.tenantId='tenant-b'],
 ['unsafe snapshot',x=>x.hrSnapshot.sourceSafe=false],['imported snapshot',x=>x.hrSnapshot.imported=true],
 ['unknown period',x=>x.hrSnapshot.periods=[]],['duplicate period',x=>x.hrSnapshot.periods.push(clone(x.hrSnapshot.periods[0]))],
 ['foreign period',x=>x.hrSnapshot.periods[0].projectId='project-b'],['closed HR period',x=>x.hrSnapshot.periods[0].state='closed'],
 ['closed canonical metadata',x=>x.db.rows.set('tenants/tenant-a/projects/project-a/periods/'+x.c.periodId,{tenantId:'tenant-a',projectId:'project-a',state:'cerrado'})],
 ['closed key metadata',x=>x.db.rows.set('tenants/tenant-a/projects/project-a/periods/2026-11',{tenantId:'tenant-a',projectId:'project-a',state:'cerrado'})],
 ['ambiguous metadata',x=>{for(const k of [x.c.periodId,'2026-11'])x.db.rows.set('tenants/tenant-a/projects/project-a/periods/'+k,{tenantId:'tenant-a',projectId:'project-a',state:'activo'});}],
])test('HR period authority denies '+label,async()=>{const x=externalFixture();mutate(x);const r=await x.provider().execute('a',x.c);assert.equal(r.ok,false,JSON.stringify(r));assert.equal(x.records().length,0);});
test('missing trusted server revision cannot authorize an absent period',async()=>{const x=externalFixture(),p=createOperationalCommandProvider({auth:x.auth,db:x.db,policy,hrSnapshot:x.hrSnapshot,hrRevision:''});assert.equal((await p.execute('a',x.c)).ok,false);});
test('command runtime passes the parsed command to server configuration before provider selection',async()=>{const x=externalFixture(),req=Readable.from([JSON.stringify(x.c)]);req.method='POST';req.headers={authorization:'Bearer a'};let configured=null,body=null;const res={setHeader(){},end(v){body=JSON.parse(v);}};await maybeHandleCxorbiaCommandRuntimeRequest(req,res,new URL('http://localhost/v1/cxorbia/commands'),{configure:async command=>{configured=command;}});assert.deepEqual(configured,x.c);assert.ok(body);});
const actualServerConfigure=readFileSync(new URL('../server.mjs',import.meta.url),'utf8').split('configure:async command=>{')[1]?.split('},\n      hrSnapshotReconcile:')[0];
test('VRM350 actual server confirmation and replay force fresh HR before provider selection',async()=>{
 const seen=[],cache={snapshot:'old'},configure=Function('buildSnapshot','configureCommandRuntime','cache','return async command=>{'+actualServerConfigure+'}')(
 async options=>{seen.push(options);cache.snapshot='fresh';},snapshot=>seen.push(snapshot),cache);
 await configure({commandType:'visit.sync.confirm'});await configure({commandType:'visit.sync.confirm'});assert.deepEqual(seen,[{forceFresh:true},'fresh',{forceFresh:true},'fresh']);
});
test('VRM350 actual server confirmation never reuses cache on fresh HR failure',async()=>{
 const seen=[],configure=Function('buildSnapshot','configureCommandRuntime','cache','return async command=>{'+actualServerConfigure+'}')(
 async options=>{assert.deepEqual(options,{forceFresh:true});throw Error('FRESH_HR_DOWN');},snapshot=>seen.push(snapshot),{snapshot:'old'});
 await assert.rejects(configure({commandType:'visit.sync.confirm'}),/FRESH_HR_DOWN/);assert.deepEqual(seen,[]);
});
test('actual server callback refreshes HR before each Client flow and retains other command behavior',async()=>{
 assert.ok(actualServerConfigure);for(const commandType of [...Object.values(types).map(x=>x[0]),'visit.assign']){const seen=[],cache={snapshot:'old'};const configure=Function('buildSnapshot','configureCommandRuntime','cache','return async command=>{'+actualServerConfigure+'}')(
 async()=>{seen.push('refresh');cache.snapshot='fresh';},snapshot=>seen.push(snapshot),cache);await configure({commandType});assert.deepEqual(seen,commandType.startsWith('client.')?['refresh','fresh']:['old']);}
});
test('actual server callback never reuses old HR when the Client refresh fails',async()=>{const seen=[];const configure=Function('buildSnapshot','configureCommandRuntime','cache','return async command=>{'+actualServerConfigure+'}')(
 async()=>{throw Error('HR_DOWN');},snapshot=>seen.push(snapshot),{snapshot:'old'});await assert.rejects(configure({commandType:'client.note.create'}),/HR_DOWN/);assert.deepEqual(seen,[]);});
for(const kind of Object.keys(types))test(`${kind}: token-owned durable entity, independent readback, audit and zero-write replay`,async()=>{
 const x=fixture(),c=x.command(kind),r=await x.p.execute('a',c);assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.providerAck,true);assert.equal(r.readbackVerified,true);assert.equal(r.actorUid,'client-a');assert.equal(x.records().length,1);const row=x.records()[0];assert.equal(row.requesterUid,'client-a');assert.equal(row.projectId,'project-a');assert.equal(row.periodId,'period-a');assert.equal(row.version,1);assert.deepEqual(row.targetUserIds,['client-a']);assert.notEqual(row.targetAll,true);assert.equal(row.targetProjectIds?.length||0,0);assert.equal(row.requesterName,'Nombre verificado');
 const replay=await x.p.execute('a',c);assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);assert.equal(x.records().length,1);assert.equal([...x.db.rows.keys()].filter(x=>x.includes('/entityAuditTrail/')).length,1);
});
test('canonical active Client membership without an active boolean remains valid',async()=>{const x=fixture();delete x.db.rows.get('tenants/tenant-a/users/client-a').active;assert.equal((await x.p.execute('a',x.command('note'))).ok,true);});
test('canonical client role alias uses its exact staff membership',async()=>{const x=fixture();x.users.a.role='client';x.db.rows.get('tenants/tenant-a/users/client-a').role='client';assert.equal((await x.p.execute('a',x.command('note'))).ok,true);});
test('same received key in another authorized period preserves separate durable audit entries',async()=>{
 const x=fixture(),c=x.command('note');assert.equal((await x.p.execute('a',c)).ok,true);
 x.db.rows.set('tenants/tenant-a/projects/project-a/periods/period-b',{id:'period-b',tenantId:'tenant-a',projectId:'project-a',state:'activo'});
 c.periodId='period-b';c.payload.periodId='period-b';assert.equal((await x.p.execute('a',c)).ok,true);
 assert.equal(x.records().length,2);assert.equal([...x.db.rows.keys()].filter(x=>x.includes('/entityAuditTrail/')).length,2);
});
test('lost readback after commit reports pending proof and retry recovers the one durable entity',async()=>{
 const x=fixture(),c=x.command('note');x.db.failReadback=true;const failed=await x.p.execute('a',c);assert.equal(failed.ok,false);assert.equal(failed.providerAck,false);assert.equal(failed.mutationCommitted,true);assert.equal(x.records().length,1);x.db.failReadback=false;const retry=await x.p.execute('a',c);assert.equal(retry.ok,true);assert.equal(retry.idempotentReplay,true);assert.equal(retry.providerWrites,0);assert.equal(x.records().length,1);
});
test('concurrent replay produces one entity, one receipt and one audit',async()=>{const x=fixture(),c=x.command('note');const rs=await Promise.all([x.p.execute('a',c),x.p.execute('a',c)]);assert.ok(rs.every(x=>x.ok));assert.equal(x.records().length,1);assert.equal(rs.filter(x=>x.idempotentReplay).length,1);});
test('changed payload and another actor cannot adopt an existing idempotency receipt',async()=>{const x=fixture(),c=x.command('note');assert.equal((await x.p.execute('a',c)).ok,true);const changed=clone(c);changed.payload.detail='Otro';assert.equal((await x.p.execute('a',changed)).ok,false);assert.equal((await x.p.execute('b',c)).ok,false);assert.equal(x.records().length,1);});
for(const [label,mutate,token] of [
 ['staff preview',(x,c)=>{},'admin'],['shopper',(x,c)=>{},'shopper'],
 ['wrong tenant',(x,c)=>{c.tenantId='tenant-b';}],['wrong project',(x,c)=>{c.projectId='project-b';}],['missing period',(x,c)=>{c.periodId='missing';c.payload.periodId='missing';}],
 ['inactive membership',x=>{x.db.rows.get('tenants/tenant-a/users/client-a').active=false;}],['inactive status',x=>{x.db.rows.get('tenants/tenant-a/users/client-a').status='inactive';}],
 ['foreign member project',x=>{x.db.rows.get('tenants/tenant-a/users/client-a').projectIds=['project-b'];}],['wrong namespace',x=>{x.users.a.authNamespace='shopper';x.db.rows.get('tenants/tenant-a/users/client-a').authNamespace='shopper';}],
 ['missing namespace',x=>{delete x.users.a.authNamespace;}],
 ['closed period',x=>{x.db.rows.get('tenants/tenant-a/projects/project-a/periods/period-a').state='cerrado';}],
 ['archived period',x=>{x.db.rows.get('tenants/tenant-a/projects/project-a/periods/period-a').state='archivado';}],
 ['foreign period',x=>{x.db.rows.get('tenants/tenant-a/projects/project-a/periods/period-a').projectId='project-b';}],
 ['spoofed author',(x,c)=>{c.payload.requesterUid='client-b';}],['spoofed recipients',(x,c)=>{c.payload.targetRoles=['super'];}],['wrong entity',(x,c)=>{c.entityType='visit';}],['chosen entity id',(x,c)=>{c.entityId='existing';}],['wrong permission',(x,c)=>{c.authorization.permission='visit.assign';}],
 ['wrong payload period',(x,c)=>{c.payload.periodId='period-b';}],['missing request id',(x,c)=>{delete c.payload.clientRequestId;}],['empty note',(x,c)=>{c.payload.detail='';}],['excessive note',(x,c)=>{c.payload.detail='x'.repeat(12001);}],
])test('client collaboration denies '+label,async()=>{const x=fixture(),c=x.command('note');mutate(x,c);const r=await x.p.execute(token||'a',c);assert.equal(r.ok,false);assert.equal(r.providerAck,false);assert.equal(x.records().length,0);assert.equal([...x.db.rows.keys()].filter(x=>x.includes('/commandReceipts/')).length,0);});
for(const score of [-1,11,9.5,'9',null])test('NPS rejects invalid numeric score '+JSON.stringify(score),async()=>{const x=fixture(),c=x.command('nps');c.payload.score=score;assert.equal((await x.p.execute('a',c)).ok,false);assert.equal(x.records().length,0);});
for(const patch of [{date:'2026-02-30'},{date:'2001-01-01'},{time:'25:00'},{mode:'Calendar invitation sent'}])test('meeting rejects invalid request '+JSON.stringify(patch),async()=>{const x=fixture(),c=x.command('meeting');Object.assign(c.payload,patch);assert.equal((await x.p.execute('a',c)).ok,false);assert.equal(x.records().length,0);});
