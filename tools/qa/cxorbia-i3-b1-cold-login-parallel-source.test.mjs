import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('app/core/backend-firebase.js','utf8');
function isolate(name,context){
  const start=source.indexOf('async function '+name+'(');
  const end=start<0?-1:source.indexOf('\n  }\n',start);
  assert.ok(start>=0&&end>start,'exact owner function '+name+' must exist');
  vm.runInNewContext(source.slice(start,end+5)+'\n globalThis.subject='+name+';',context,{timeout:1000});
  return context.subject;
}
test('B1 cold shopper: three scoped visit reads overlap but keep historical merge priority',async()=>{
  const active={now:0,max:0},calls=[];
  const rows={shopperId:[{id:'own'},{id:'duplicate',state:'old'}],status:[{id:'available'}],estado:[{id:'duplicate',state:'legacy'}]};
  const context={Map,Array,Promise,subCol:(project,collection)=>({where:(field,op,value)=>({project,collection,field,op,value})}),
    getAll:async query=>{calls.push(query);active.now++;active.max=Math.max(active.max,active.now);await new Promise(done=>setTimeout(done,15));active.now--;return rows[query.field]||[];},
    warn:()=>{}};
  const load=isolate('loadShopperVisits',context);
  const result=await load('cinepolis','shopper_fixture');
  assert.equal(active.max,3,'no sequential head-of-line blocking');
  assert.deepEqual(calls.map(q=>q.project),['cinepolis','cinepolis','cinepolis']);
  assert.deepEqual(calls.map(q=>q.collection),['visits','visits','visits']);
  assert.deepEqual(Array.from(result,v=>v.id),['own','duplicate','available']);
  assert.equal(result.find(v=>v.id==='duplicate').state,'legacy');
});
test('B1 cold shopper: one denied secondary query remains isolated as before',async()=>{
  const warnings=[];
  const context={Map,Array,Promise,subCol:(project,collection)=>({where:(field)=>({project,collection,field})}),
    getAll:async q=>{if(q.field==='estado')throw new Error('permission-denied');return [{id:q.field}];},
    warn:(...parts)=>warnings.push(parts.join(' '))};
  const load=isolate('loadShopperVisits',context);
  const out=await load('cinepolis','shopper_fixture');
  assert.deepEqual(Array.from(out,v=>v.id),['shopperId','status']);
  assert.equal(warnings.length,1);
});
test('B1 cold shopper: postulations, reservations and visit reads begin together but map only after visit joins',async()=>{
  const started=[];
  const delayed=(name,value)=>{started.push(name);return new Promise(done=>setTimeout(()=>done(value),12));};
  const context={Promise,Map,Array,
    isShopper:()=>true,isClient:()=>false,
    loadShopperVisits:()=>delayed('visits',[{id:'v1'}]),
    loadPostsForPrincipal:()=>delayed('posts',[{id:'p1',visitId:'v1'}]),
    loadReservationsForPrincipal:()=>delayed('reservations',[{id:'r1'}]),
    preserveDurableVisits:x=>x,normalizeVisit:(v,project)=>({...v,visitId:v.id,projectId:project}),
    normalizeApplication:(post,project,period,byId)=>({...post,mapped:!!byId[post.visitId]})};
  const load=isolate('loadProjectData',context);
  const pending=load({id:'cinepolis'}, {},{shopperId:'shopper_fixture'});
  assert.deepEqual(Array.from(started).sort(),['posts','reservations','visits']);
  const result=await pending;
  assert.equal(result.visits.length,1);
  assert.equal(result.posts[0].mapped,true);
  assert.equal(result.reservations[0].id,'r1');
});
test('B1 cold shopper: canonical periods overlap project-scoped records',()=>{
  assert.match(source,/const \[periods, perProject\] = await Promise\.all\(\[/);
  assert.match(source,/loadCanonicalPeriods\(activeProjects\),\s*Promise\.all\(activeProjects\.map/);
});
