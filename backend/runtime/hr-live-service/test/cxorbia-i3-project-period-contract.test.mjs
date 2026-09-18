import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repoRoot=fileURLToPath(new URL('../../../../',import.meta.url));
const read=rel=>fs.readFileSync(path.join(repoRoot,rel),'utf8');

test('I3 HR frontend mapping keeps project and period independent end to end',()=>{
  const data={
    projects:[],shoppers:[],_visitas:[],_posts:[],
    visitas(){return this._visitas.filter(v=>(v.periodId||v.projectId)===this.currentPeriodId);}
  };
  const CX={data,BRAND:{},dataSource:{badge(){return {c:'#000',t:'ready'};}},bus:{emit(){}}};
  const document={getElementById(){return null;},documentElement:{setAttribute(){}}};
  const window={CX,dispatchEvent(){}};window.window=window;
  const sandbox={window,CX,document,localStorage:{setItem(){}},CustomEvent:class CustomEvent{},console};
  vm.runInNewContext(read('app/adapters/tya-live-source-inplace-apply.js'),sandbox);
  const snapshot={
    sourceSafe:true,imported:false,production:false,generatedAt:'2026-09-17T00:00:00Z',
    source:{title:'HR test'},counts:{tabs:1,byCountry:{GT:1}},
    periods:[{key:'2026-09',label:'SEP 2026',fullLabel:'SEP 2026',internalName:'Cinépolis SEP',total:1,countries:{GT:1,HN:0,total:1}}],
    visits:[{id:'visit-1',periodKey:'2026-09',periodLabel:'SEP 2026',pais:'GT',estado:'disponible',sucursal:'Cinema test'}],
    shoppers:[]
  };
  window.CX_TYA_APPLY_LIVE_SNAPSHOT(snapshot,{revision:'a'.repeat(64),latestPeriodKey:'2026-09'});
  assert.equal(data.currentProjectId,'cinepolis');
  assert.equal(data.currentPeriodId,'cinepolis-2026-09');
  assert.equal(data.projects[0].projectId,'cinepolis');
  assert.equal(data.projects[0].periodId,'cinepolis-2026-09');
  assert.equal(data.projects[0].name,'Cinépolis');
  assert.equal(data.projects[0].periodo,'SEP 2026');
  assert.equal(data._visitas[0].projectId,'cinepolis');
  assert.equal(data._visitas[0].periodId,'cinepolis-2026-09');
  assert.equal(data._posts[0].projectId,'cinepolis');
  assert.equal(data._posts[0].periodId,'cinepolis-2026-09');
});

test('I3 cumulative composition never rewrites projectId from periodId',()=>{
  const window={CX:{}};const sandbox={window,globalThis:window,console};
  vm.runInNewContext(read('app/adapters/tya-cumulative-read-model-v2.js'),sandbox);
  const api=window.CX_TYA_CUMULATIVE_READ_MODEL;
  assert.ok(api&&typeof api.compose==='function');
  const result=api.compose({
    hr:{
      currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-09',
      projects:[{id:'cinepolis-2026-09',projectId:'cinepolis',rootProjectId:'cinepolis',program:'cinepolis',periodKey:'2026-09'}],
      visits:[{id:'visit-1',visitId:'visit-1',projectId:'cinepolis',rootProjectId:'cinepolis',periodId:'cinepolis-2026-09',periodKey:'2026-09',estado:'disponible'}],
      shoppers:[],
      posts:[{id:'post-1',visitId:'visit-1',projectId:'cinepolis',rootProjectId:'cinepolis',periodId:'cinepolis-2026-09',periodKey:'2026-09',shopperId:'s1'}]
    },
    protectedPayload:{visits:[],shoppers:[],postulations:[]}
  });
  assert.equal(result.visits[0].projectId,'cinepolis');
  assert.equal(result.visits[0].periodId,'cinepolis-2026-09');
  assert.equal(result.posts[0].projectId,'cinepolis');
  assert.equal(result.posts[0].periodId,'cinepolis-2026-09');
});

test('I3 current-period consumers use canonical period owner instead of projectId',()=>{
  const core=read('app/core/data.js');
  const visits=read('app/modules/visitas.js');
  const posts=read('app/modules/postulaciones.js');
  assert.match(core,/recordPeriodId\(row\)/);
  assert.match(core,/this\.recordPeriodId\(v\)===this\.currentPeriodId/);
  assert.match(core,/this\.recordPeriodId\(p\)===this\.currentPeriodId/);
  assert.match(visits,/periodIdOf\(v\)===data\.currentPeriodId/);
  assert.match(posts,/periodIdOf\(x\)===data\.currentPeriodId/);
});

test('I3 protected shopper profile survives empty Firestore project scope for HR composition',()=>{
  const backend=read('app/core/backend-firebase.js');
  const bridge=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
  assert.match(backend,/Firestore project materialization is not the operational authority for projectId/);
  assert.match(backend,/CX\.data\.shoppers\s*=\s*safeState\.shoppers\s*\|\|\s*\[\]/);
  assert.match(backend,/shoppers:CX\.data\.shoppers\.length/);
  assert.match(backend,/emit\('backend-ready',[\s\S]*empty:true[\s\S]*counts:counts/);
  assert.match(bridge,/if\(c\?\.role==='shopper'&&str\(c\.shopperId\)\)/);
  assert.match(bridge,/arr\(CX\.data\.shoppers\)\.some/);
});

test('I3 Gate 20 restores CX auth context from persisted Firebase session before HR authority assertion',()=>{
  const gate20=read('tools/qa/cxorbia-gate20-browser-visual-dev.mjs');
  assert.match(gate20,/Persistence\.LOCAL/);
  assert.match(gate20,/backendAuth\?\.ensureAuthenticated/);
  assert.match(gate20,/await window\.CX\.backendAuth\.ensureAuthenticated\(\)/);
  assert.match(gate20,/CX_PROTECTED_AUTH_HR_AUTHORITY\?\.applied===true/);
});

test('I3 HR authority bridge follows backend operator scope semantics',()=>{
  const backend=read('app/core/backend-firebase.js');
  const bridge=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
  assert.match(backend,/function isOperator\(ctx\)\{ return \['super','admin','ops','coordinador'\]\.includes\(roleOf\(ctx\)\); \}/);
  assert.match(backend,/if\(!ctx \|\| isOperator\(ctx\)\) return getAll\(projectsCol\(\)\)/);
  assert.match(bridge,/\['super','admin','ops','coordinador'\]\.includes\(role\)/);
  assert.match(bridge,/return projects\.includes\('cinepolis'\)/);
});
