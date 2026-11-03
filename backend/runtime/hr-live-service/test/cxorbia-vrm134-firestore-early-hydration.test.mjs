import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../../../../app/core/backend-firebase.js',import.meta.url),'utf8');
function pick(start,end){
  const from=source.indexOf(start),to=source.indexOf(end,from);
  assert.ok(from>=0&&to>from,`missing exact owner: ${start}`);
  return source.slice(from,to);
}
function compile(start,end,params,name,dependencies){
  return new Function(...params,`${pick(start,end)}\nreturn ${name};`)(...dependencies);
}

const consumeEarlyRead=compile('async function consumeEarlyRead(','async function loadCanonicalPeriods(',[],
  'consumeEarlyRead',[]);

test('I3 VRM134 A07 starts only exact authenticated project reads, never a global tenant scan',async()=>{
  const calls=[];
  const prime=compile('function primeAuthorizedProjectReads(','async function loadTenantData(',
    ['isOperator','cfg','toList','getAll','subCol','loadProjectSourceData'],'primeAuthorizedProjectReads',[
      ctx=>['admin','super','ops','coordinador'].includes(ctx.role),
      {defaultProjectId:'cinepolis',previewProjectIds:['cinepolis']},
      value=>Array.isArray(value)?value:typeof value==='string'?[value]:[],
      path=>{calls.push('periods:'+path.projectId);return Promise.resolve([{id:'p1'}]);},
      (projectId,collection)=>({projectId,collection}),
      projectId=>{calls.push('project:'+projectId);return Promise.resolve({visitsRawAll:[],rawPosts:[],reservations:[]});}
    ]);
  assert.equal(prime({role:'admin',authenticated:false,projectIds:['cinepolis']}).size,0);
  assert.equal(calls.length,0,'never start Firestore before authenticated principal');
  const admin=prime({role:'admin',authenticated:true,projectIds:[]});
  assert.deepEqual([...admin.keys()],['cinepolis']);
  assert.deepEqual(calls,['periods:cinepolis','project:cinepolis']);
  const p=await admin.get('cinepolis').periods;
  assert.equal(p.ok,true);
  const shopper=prime({role:'shopper',authenticated:true,projectIds:['hn-project']});
  assert.deepEqual([...shopper.keys()],['hn-project'],'Shopper uses only verified claim scope');
});

test('I3 VRM134 A07 settles unused hints, but FAILs closed for any selected failed read',async()=>{
  const prime=compile('function primeAuthorizedProjectReads(','async function loadTenantData(',
    ['isOperator','cfg','toList','getAll','subCol','loadProjectSourceData'],'primeAuthorizedProjectReads',[
      ctx=>ctx.role==='admin',{defaultProjectId:'not-in-registry'},
      value=>Array.isArray(value)?value:typeof value==='string'?[value]:[],
      ()=>Promise.reject(new Error('FIRESTORE_DENIED')),
      id=>({id}),()=>Promise.reject(new Error('PROJECT_READ_DENIED'))
    ]);
  const early=prime({role:'admin',authenticated:true});
  const periods=await early.get('not-in-registry').periods;
  const project=await early.get('not-in-registry').projectData;
  assert.equal(periods.ok,false);
  assert.equal(project.ok,false);
  assert.match(periods.error.message,/FIRESTORE_DENIED/);
  await assert.rejects(consumeEarlyRead(early.get('not-in-registry').periods,()=>[]),/FIRESTORE_DENIED/);
  await assert.rejects(consumeEarlyRead(early.get('not-in-registry').projectData,()=>[]),/PROJECT_READ_DENIED/);
  let fallback=0;
  assert.deepEqual(await consumeEarlyRead(undefined,()=>{fallback++;return ['fallback'];}),['fallback']);
  assert.equal(fallback,1);
});

test('I3 VRM134 A07 preserves visit/post/reservation normalization after a prefetched read',async()=>{
  const project={id:'cinepolis',periodId:'cinepolis-2026-10'};
  const ctx={role:'admin',authenticated:true};
  const calls=[];
  const raw={visitsRawAll:[{id:'705',visitId:'705',shopperId:'s1'}],
    rawPosts:[{id:'post1',visitId:'705',shopperId:'s1'}],reservations:[{id:'res1'}]};
  const owner=compile('async function loadProjectData(','function primeAuthorizedProjectReads(',[
    'consumeEarlyRead','loadProjectSourceData','preserveDurableVisits','normalizeVisit','normalizeApplication'
  ],'loadProjectData',[
    consumeEarlyRead,()=>{calls.push('fallback');return raw;},
    v=>v,
    (visit,pid,periodId)=>({...visit,projectId:pid,periodId}),
    (post,pid,periodId,byVisit,byShopper)=>{
      assert.equal(byVisit['705'].projectId,pid);
      assert.equal(byShopper.s1.nombre,'Julissa');
      return {...post,projectId:pid,periodId,shopperName:byShopper.s1.nombre};
    }
  ]);
  const shoppers={s1:{nombre:'Julissa'}};
  const prefetched=Promise.resolve({ok:true,value:raw});
  const result=await owner(project,shoppers,ctx,prefetched);
  assert.deepEqual(calls,[],'joined prefetch never issues a second source read');
  assert.equal(result.visits[0].periodId,'cinepolis-2026-10');
  assert.equal(result.posts[0].shopperName,'Julissa');
  assert.deepEqual(result.reservations,raw.reservations);
  const ordinary=await owner(project,shoppers,ctx,undefined);
  assert.deepEqual(ordinary,result,'no-prefetch fallback preserves the same canonical shape');
  assert.deepEqual(calls,['fallback']);
});

test('I3 VRM134 A07 waits for authorized project registry before publishing any early source data',async()=>{
  let releaseRegistry;
  const pendingRegistry=new Promise(resolve=>{releaseRegistry=resolve;});
  const events=[],calls=[];
  const early=new Map([['cinepolis',{periods:Promise.resolve({ok:true,value:[]}),projectData:Promise.resolve({ok:true,value:{visitsRawAll:[]}})}]]);
  const ctx={role:'admin',tenantId:'tya',projectIds:['cinepolis'],authenticated:true};
  const owner=compile('async function loadTenantData(){','function applyData(',[
    'authContext','emit','tenantId','roleOf','primeAuthorizedProjectReads','loadAuthorizedProjects',
    'loadAuthorizedShoppers','normalizeProject','resolveActiveProjects','normalizeShopper',
    'loadCanonicalPeriods','loadProjectData','window','now'
  ],'loadTenantData',[
    ()=>ctx,(event,payload)=>events.push({event,payload}),()=>ctx.tenantId,c=>c.role,
    ()=>{calls.push('early');return early;},
    ()=>{calls.push('registry');return pendingRegistry;},
    ()=>Promise.resolve([{id:'s1',shopperId:'s1'}]),
    x=>x,all=>all,x=>x,
    (_projects,reads)=>{assert.equal(reads,early);return Promise.resolve([{id:'p1'}]);},
    (project,_shoppers,_ctx,prefetched)=>{
      assert.equal(prefetched,early.get('cinepolis').projectData);
      assert.equal(project.id,'cinepolis');
      calls.push('project-data');
      return Promise.resolve({visits:[{id:'v1'}],posts:[],reservations:[]});
    },{},()=>new Date(0).toISOString()
  ]);
  const load=owner();
  assert.deepEqual(calls,['early','registry']);
  assert.equal(events.some(e=>e.event==='backend-loaded'),false,'do not publish partial pre-registry data');
  releaseRegistry([{id:'cinepolis'}]);
  const ready=await load;
  assert.equal(ready.visits.length,1);
  assert.deepEqual(calls,['early','registry','project-data']);
  assert.equal(events.filter(e=>e.event==='backend-loaded').length,1);
  assert.equal(events.at(-1).payload.counts.visits,1);
});

test('I3 VRM134 A07 does not materialize a hinted project missing from the registry',async()=>{
  let leaked=false;
  const early=new Map([['missing',{periods:Promise.resolve({ok:true,value:[{id:'p'}]}),projectData:Promise.resolve({ok:true,value:{visitsRawAll:[{id:'v'}]}})}]]);
  const owner=compile('async function loadTenantData(){','function applyData(',[
    'authContext','emit','tenantId','roleOf','primeAuthorizedProjectReads','loadAuthorizedProjects',
    'loadAuthorizedShoppers','normalizeProject','resolveActiveProjects','normalizeShopper',
    'loadCanonicalPeriods','loadProjectData','window','now'
  ],'loadTenantData',[
    ()=>({authenticated:true,role:'admin',tenantId:'tya',projectIds:[]}),()=>{},()=> 'tya',()=> 'admin',()=>early,
    ()=>Promise.resolve([]),()=>Promise.resolve([]),x=>x,x=>x,x=>x,
    ()=>Promise.resolve([]),()=>{leaked=true;throw new Error('unapproved_project_loaded');},
    {},()=>new Date(0).toISOString()
  ]);
  const state=await owner();
  assert.deepEqual(state.projects,[]);
  assert.deepEqual(state.visits,[]);
  assert.equal(leaked,false);
});
