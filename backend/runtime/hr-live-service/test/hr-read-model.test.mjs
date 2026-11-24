import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createDurableHrReadModel,createConfirmedHrHistory,hrReadModelKey,HR_READ_MODEL_CHUNK_BYTES} from '../hr-read-model.mjs';

const clone=x=>x===undefined?undefined:structuredClone(x);
const hash=x=>crypto.createHash('sha256').update(String(x)).digest('hex');
const key=hrReadModelKey({scope:{tenantId:'qa-tenant',projectId:'qa-project'},proof:{bindingFingerprint:hash('binding')}},hash('reader-v1'));
const binding={bindingFingerprint:key.bindingFingerprint};
const observation=(tag,{read=2000,start=1000,extra=''}={})=>({
  snapshot:{tenantId:key.tenantId,projectId:key.projectId,sourceSafe:true,imported:false,production:false,
    periods:[{key:'2026-11'}],visits:[{id:'qa-visit',periodKey:'2026-11',state:tag}],generatedAt:'2026-11-24T00:00:00.000Z'},
  revision:hash(tag),loadedAt:read,sourceReadStartedAt:start,bindingProof:binding,
  identity:new Map([['qa-shopper',{displayName:'Synthetic Shopper'}]]),
  privateReviewNotes:new Map([['qa-visit',{observation:'Synthetic note '+extra}]]),
  origin:'runtime_excel_online_original',externalReadCurrent:true
});
class Snap{constructor(ref,value){this.ref=ref;this.value=clone(value);this.exists=value!==undefined;}data(){return clone(this.value);}}
class Ref{
  constructor(db,path){this.db=db;this.path=path;}
  collection(name){const path=this.path+'/'+name,db=this.db;return {doc:id=>new Ref(db,path+'/'+id),get:async()=>({docs:[...db.docs].filter(([p])=>p.startsWith(path+'/')&&p.split('/').length===path.split('/').length+1).map(([p,v])=>new Snap(new Ref(db,p),v))})};}
  async get(){this.db.reads++;return new Snap(this,this.db.docs.get(this.path));}
}
class DB{
  constructor(){this.docs=new Map();this.reads=0;this.batches=0;this.transactions=0;this.writeSizes=[];this.beforeBatch=null;this.tail=Promise.resolve();}
  doc(path){return new Ref(this,path);}
  apply(ops){
    const next=new Map(this.docs);
    for(const [type,ref,data]of ops){
      if(type==='create'&&next.has(ref.path))throw Error('ALREADY_EXISTS');
      if(type==='update'&&!next.has(ref.path))throw Error('NOT_FOUND');
      next.set(ref.path,type==='update'?{...clone(next.get(ref.path)),...clone(data)}:clone(data));
      this.writeSizes.push(data.bytes?data.bytes.length:Buffer.byteLength(JSON.stringify(data)));
    }
    this.docs=next;
  }
  batch(){const ops=[];return {create:(ref,data)=>ops.push(['create',ref,data]),set:(ref,data)=>ops.push(['set',ref,data]),commit:async()=>{this.batches++;await this.beforeBatch?.(this.batches);this.apply(ops);}};}
  async runTransaction(fn){
    let release;const prior=this.tail;this.tail=new Promise(r=>release=r);await prior;
    try{this.transactions++;const ops=[],tx={get:async ref=>ref.get()};
      for(const type of ['create','set','update'])tx[type]=(ref,data)=>ops.push([type,ref,data]);
      const result=await fn(tx);this.apply(ops);return result;
    }finally{release();}
  }
}
const pointer=db=>[...db.docs.entries()].find(([p,v])=>p.split('/').length===6&&v.generation);
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};

const hscope={tenantId:'qa-tenant',projectId:'qa-project'};
const hrow=(month,id=month)=>({...hscope,id,visitId:id,periodId:'qa-project-'+month,periodKey:month,country:'GT',shopperId:'qa-shopper'});
const hsnapshot=(visits,months)=>({...hscope,sourceSafe:true,imported:false,production:false,visits,shoppers:[{id:'qa-shopper'}],
  periods:months.map(key=>({id:'qa-project-'+key,periodId:'qa-project-'+key,key})),
  readScope:{countryPeriods:months.map(month=>({countryCode:'GT',periodId:'qa-project-'+month}))}});
const hopts=(tag,start=1000,end=2000)=>({sourceReadAt:end,sourceReadStartedAt:start,revision:hash(tag),evidence:{receiptPath:'synthetic-local-test'}});

test('history survives restart and window replacement, but never grants external authority',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000});
 await store.observe(hsnapshot([hrow('2026-05'),hrow('2026-11')],['2026-05','2026-11']),hopts('seed'));
 await store.observe(hsnapshot([hrow('2026-10'),{...hrow('2026-11'),estado:'realizada'}],['2026-10','2026-11']),hopts('window',3000,4000));
 const read=await createConfirmedHrHistory({db,now:()=>1e12}).read(hscope);
 assert.equal(read.visits.length,3);assert.equal(read.visits.find(v=>v.periodKey==='2026-11').estado,'realizada');
 assert.equal(read.externalReadCurrent,false);assert.equal(read.observations.find(x=>x.periodId.endsWith('2026-05')).sourceReadAt,new Date(2000).toISOString());
});
test('an explicitly empty period erases its last historical visit without touching other periods',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000});
 await store.observe(hsnapshot([hrow('2026-05'),hrow('2026-11')],['2026-05','2026-11']),hopts('first'));
 await store.observe(hsnapshot([],['2026-11']),hopts('empty',3000,4000));
 const read=await createConfirmedHrHistory({db,now:()=>1e12}).read(hscope);
 assert.deepEqual(read.visits.map(v=>v.periodKey),['2026-05']);
});
test('invalid or incomplete history coverage is rejected before any write',async()=>{
 for(const alter of [s=>delete s.readScope,s=>s.readScope.countryPeriods.push(s.readScope.countryPeriods[0]),s=>s.readScope.countryPeriods[0].periodId='qa-project-2026-10',s=>s.visits[0].tenantId='foreign']){
  const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000}),value=hsnapshot([hrow('2026-11')],['2026-11']);alter(value);
  await assert.rejects(store.observe(value,hopts('bad')),/HISTORY_READ_COVERAGE/);assert.equal(db.docs.size,0);assert.equal(db.batches,0);
 }
});
test('history replay writes nothing; identical content reuses immutable chunks for a newer observation',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000}),s=hsnapshot([hrow('2026-11')],['2026-11']);
 await store.observe(s,hopts('first'));const writes=db.writeSizes.length,batches=db.batches;
 await store.observe(s,hopts('first'));assert.equal(db.writeSizes.length,writes);
 await store.observe(s,hopts('second',3000,4000));assert.equal(db.batches,batches);assert.equal(db.writeSizes.length,writes+1);
});
test('late old history reader cannot overwrite a newer-started read, including publication CAS',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000}),s=tag=>hsnapshot([{...hrow('2026-11'),state:tag}],['2026-11']);
 await store.observe(s('new'),hopts('new',2000,3000));
 assert.equal((await store.observe(s('old'),hopts('old',1000,4000))).published,false);
 assert.equal((await store.read(hscope)).visits[0].state,'new');
 await assert.rejects(store.observe(s('conflict'),hopts('conflict',2000,5000)),/HISTORY_CONCURRENT_OBSERVATION/);
 const barrier=deferred(),entered=deferred();let gate=true;db.beforeBatch=async()=>{if(gate){gate=false;entered.resolve();await barrier.promise;}};
 const older=store.observe(s('older-race'),hopts('older-race',5000,8000));await entered.promise;
 await store.observe(s('newer-race'),hopts('newer-race',6000,7000));barrier.resolve();await older;
 assert.equal((await store.read(hscope)).visits[0].state,'newer-race');
});
test('historical seed cannot replace an existing observation and rejects missing provenance',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000}),s=hsnapshot([hrow('2026-11')],['2026-11']);
 await store.observe(s,hopts('first'));
 const opts={...hopts('seed',3000,4000),seed:true};await assert.rejects(store.observe(s,opts),/HISTORY_SEED_PROVENANCE/);
 opts.evidence={receiptPath:'exact-accepted-artifact',snapshotSha256:hash('bytes'),artifactDigest:'sha256:'+hash('zip'),artifactId:123};
 assert.equal((await store.observe(s,opts)).published,false);
 assert.equal((await store.read(hscope)).observations[0].sourceReadAt,new Date(2000).toISOString());
});
test('failed historical chunk batch keeps the previous readable period intact',async()=>{
 const db=new DB(),store=createConfirmedHrHistory({db,now:()=>10000});
 await store.observe(hsnapshot([hrow('2026-11')],['2026-11']),hopts('old'));
 const failAt=db.batches+2;db.beforeBatch=count=>{if(count===failAt)throw Error('STORAGE_FAILURE');};
 const s=hsnapshot([{...hrow('2026-11'),payload:crypto.randomBytes(3000000).toString('base64')}],['2026-11']);
 await assert.rejects(store.observe(s,hopts('large',3000,4000)),/STORAGE_FAILURE/);
 assert.equal((await store.read(hscope)).visits[0].payload,undefined);
});

test('cold process restores validated snapshot, exact maps and original observation time without a provider',async()=>{
  const db=new DB(),value=observation('first'),writer=createDurableHrReadModel({db,now:()=>2500});
  const receipt=await writer.publish(key,value);assert.equal(receipt.published,true);
  const freshProcess=createDurableHrReadModel({db,now:()=>500000});
  const saved=await freshProcess.read(key);
  assert.deepEqual(saved.snapshot,value.snapshot);assert.deepEqual(saved.identity,value.identity);
  assert.deepEqual(saved.privateReviewNotes,value.privateReviewNotes);
  assert.equal(saved.loadedAt,2000);assert.equal(saved.sourceReadStartedAt,1000);
  assert.equal(saved.revision,value.revision);assert.equal(saved.externalReadCurrent,false);
  assert.equal(saved.origin,'durable_internal_snapshot');assert.equal(saved.durableReadModel.recoveredAt,500000);
});

test('payload over one MiB is recovered from bounded immutable shards; no document approaches Firestore limit',async()=>{
  const db=new DB(),value=observation('large',{extra:crypto.randomBytes(1500000).toString('base64')});
  assert.ok(Buffer.byteLength(JSON.stringify(value.snapshot))+Buffer.byteLength(JSON.stringify([...value.privateReviewNotes]))>1048576);
  const store=createDurableHrReadModel({db,now:()=>3000}),result=await store.publish(key,value);
  assert.ok(result.chunkCount>1);assert.ok(Math.max(...db.writeSizes)<=HR_READ_MODEL_CHUNK_BYTES);
  const saved=await store.read(key);assert.deepEqual(saved.privateReviewNotes,value.privateReviewNotes);
});

test('failed shard batch never publishes a partial new snapshot or changes the prior pointer',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>6000});
  await store.publish(key,observation('old'));const before=clone(pointer(db));
  const failAt=db.batches+2;db.beforeBatch=async count=>{if(count===failAt)throw Error('SIMULATED_STORAGE_FAILURE');};
  const large=observation('new',{start:3000,read:4000,extra:crypto.randomBytes(3000000).toString('base64')});
  await assert.rejects(store.publish(key,large),/SIMULATED_STORAGE_FAILURE/);
  assert.deepEqual(pointer(db),before);assert.equal((await store.read(key)).revision,hash('old'));
});

test('unchanged revision advances only confirmed observation metadata and reuses immutable content',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>6000});
  const first=await store.publish(key,observation('same')),batches=db.batches,count=db.docs.size;
  const second=await store.publish(key,observation('same',{start:3000,read:4000}));
  assert.equal(second.reused,true);assert.equal(second.generation,first.generation);
  assert.equal(db.batches,batches);assert.equal(db.docs.size,count);assert.equal((await store.read(key)).loadedAt,4000);
});

test('repeat presentation of the same observation performs no additional durable write',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>3000}),value=observation('same-observation');
  await store.publish(key,value);const writes=db.writeSizes.length,transactions=db.transactions;
  const repeat=await store.publish(key,value);assert.equal(repeat.published,false);assert.equal(repeat.readModelPresent,true);
  assert.equal(db.writeSizes.length,writes);assert.equal(db.transactions,transactions);
});

test('different tenant, project, binding or reader cannot recover another scoped snapshot',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>3000});await store.publish(key,observation('one'));
  for(const other of [{...key,tenantId:'other'},{...key,projectId:'other'},
    {...key,bindingFingerprint:hash('other')},{...key,readerFingerprint:hash('reader-v2')}])
    assert.equal(await store.read(other),null);
  for(const invalid of [{...key,projectId:'../other'},{...key,tenantId:'a/b'},{...key,bindingFingerprint:'wrong'}])
    await assert.rejects(store.read(invalid),/HR_READ_MODEL_KEY/);
});

test('corrupt or missing shard is rejected before exposing content',async()=>{
  for(const mode of ['corrupt','missing']){
    const db=new DB(),store=createDurableHrReadModel({db,now:()=>3000});await store.publish(key,observation(mode));
    const [path,row]=[...db.docs.entries()].find(([p])=>p.includes('/chunks/'));
    if(mode==='missing')db.docs.delete(path);else{row.bytes[0]^=1;db.docs.set(path,row);}
    await assert.rejects(store.read(key),/HR_READ_MODEL_CHUNK/);
  }
});

test('expired or future observation is never returned as a recovered valid view',async()=>{
  const db=new DB();await createDurableHrReadModel({db,now:()=>3000}).publish(key,observation('aged'));
  assert.equal(await createDurableHrReadModel({db,now:()=>10000,maxAgeMs:5000}).read(key),null);
  assert.equal(await createDurableHrReadModel({db,now:()=>1000}).read(key),null);
});

test('late prior read cannot replace a more recent observation; ambiguous equal-start revisions fail closed',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>10000});
  await store.publish(key,observation('new',{start:4000,read:5000}));const before=clone(pointer(db));
  const old=await store.publish(key,observation('old',{start:1000,read:8000}));
  assert.equal(old.published,false);assert.deepEqual(pointer(db),before);
  await assert.rejects(store.publish(key,observation('ambiguous',{start:4000,read:6000})),/CONCURRENT_REVISION/);
  assert.deepEqual(pointer(db),before);
});

test('pointer CAS rejects a slower reader even when it finishes writing shards after the newer reader',async()=>{
  const db=new DB(),hold=deferred(),reached=deferred(),store=createDurableHrReadModel({db,now:()=>10000});
  db.beforeBatch=async n=>{if(n===1){reached.resolve();await hold.promise;}};
  const old=store.publish(key,observation('slow',{start:1000,read:2000}));await reached.promise;
  const recent=await store.publish(key,observation('recent',{start:3000,read:4000}));
  assert.equal(recent.published,true);hold.resolve();assert.equal((await old).published,false);
  assert.equal((await store.read(key)).revision,hash('recent'));
});

test('bootstrap, recovered data or invalid timestamps cannot be republished as a new external observation',async()=>{
  const db=new DB(),store=createDurableHrReadModel({db,now:()=>10000});
  for(const change of [{origin:'build_bootstrap'},{origin:'durable_internal_snapshot'},
    {externalReadCurrent:false},{sourceReadStartedAt:3000,loadedAt:2000},{loadedAt:100000}])
    await assert.rejects(store.publish(key,{...observation('invalid'),...change}),/EXTERNAL_OBSERVATION_REQUIRED/);
  assert.equal(db.docs.size,0);
});

test('oversized or foreign manifest is rejected before chunk allocation',async()=>{
  for(const change of [{chunkCount:100000},{rawBytes:100000000},{tenantId:'foreign'}]){
    const db=new DB(),store=createDurableHrReadModel({db,now:()=>3000});await store.publish(key,observation('manifest'));
    const [path,row]=[...db.docs.entries()].find(([p,v])=>v.compression==='gzip');db.docs.set(path,{...row,...change});
    const reads=db.reads;await assert.rejects(store.read(key),/HR_READ_MODEL_MANIFEST/);
    assert.equal(db.reads-reads,2);
  }
});
