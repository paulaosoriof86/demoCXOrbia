import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('app/adapters/tya-c6-unified-human-runtime-v1.js','utf8');
function fixture({internal=true,role='super',realMount=false,mutate}={}){
  const calls=[],listeners={},uid='exact-user',tenantId='tenant-a',projectId='project-a';
  const ctx={authenticated:true,tenantId,role,authNamespace:role==='shopper'?'shopper':'staff',shopperId:role==='shopper'?'shopper-a':'',projectIds:[projectId]};
  const record={id:projectId,projectId,tenantId,operationalSource:{mode:internal?'internal':'external'},honorario:{SV:15},currency:{SV:'USD'}};
  const session={role,view:'config',user:{role,tenantId,shopperId:ctx.shopperId}};
  const generation=JSON.stringify({uid,authenticated:true,role,authNamespace:ctx.authNamespace,shopperId:ctx.shopperId,tenantId,projectId,projectIds:[projectId],shellRole:role,sessionRole:role,sessionShopperId:ctx.shopperId,sessionTenantId:tenantId});
  const data={currentProjectId:projectId,currentPeriodId:internal?'':'period-a',projects:[record],__backendAllProjectRecords:[record],
    _visitas:internal?[]:[{id:'visit-a'}],_posts:[],previewMeta:{sourceRevision:internal?null:'a'.repeat(64),internalProjectAuthority:internal},period:()=>undefined};
  const authority={applied:true,atomicPublication:true,tenantId,projectId,internalProjectAuthority:internal,sessionGeneration:generation,
    sourceRevision:internal?null:'a'.repeat(64),actorUid:uid,authNamespace:ctx.authNamespace,rawShopperId:ctx.shopperId,
    exactSessionShopperReady:true,shopperPrincipalClaimsVerified:true,canonicalShopperId:ctx.shopperId,shopperCountry:'SV'};
  const authorized={tenantId,principal:{actorUid:uid,tenantId,role,authNamespace:ctx.authNamespace,shopperId:ctx.shopperId,projectIds:[projectId]},projects:[record]};
  const cx={BACKEND:{tenantId,defaultProjectId:projectId,previewProjectIds:[projectId]},BRAND:{id:tenantId},session,data,
    dataSource:{sourceRef:internal?'firestore-internal:'+tenantId+':'+projectId:'hr-live-all-periods+firestore-authenticated-exact-overlay'},
    backendAuth:{context:()=>ctx},MODULES:{config:{roles:[role]}},moduleEnabled:()=>true,roleCanAccess:()=>true,moduleVisibleForProfile:()=>true,
    modules:{},router:{mount(){calls.push('mount');},nav(v){calls.push(v);}},bus:{on(){}}};
  const env={console,URLSearchParams,Date,JSON,Math,Set,Map,CX:cx,
    location:{search:'?cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV&cxProjectId='+projectId},
    document:{readyState:'loading',addEventListener(k,f){listeners[k]=f;},getElementById(){return null;}},
    addEventListener(){},localStorage:{getItem(){return null;},removeItem(){}},setTimeout(){return 1;},
    firebase:{auth:()=>({currentUser:{uid}})},CX_PROTECTED_AUTH_HR_AUTHORITY:authority,CX_BACKEND_AUTHORIZED_STATE:authorized};
  env.window=env;const f={env,cx,ctx,data,authority,authorized,record,calls,listeners};if(mutate)mutate(f);
  vm.createContext(env);
  if(realMount){
    // Use the production router's start selection and the actual period-dependent
    // Mi Dia owner. A mount stub alone hid the first-render failure.
    env.document.body={classList:{toggle(){}}};env.document.querySelectorAll=()=>[];
    cx.session.role='admin';cx.session.view=null;cx.session.user.name='QA Admin';
    cx.NAV={admin:[{items:['midia','config']}]};
    cx.MODULES={midia:{roles:['admin']},config:{roles:['admin']}};
    cx.moduleEnabled=()=>true;cx.roleCanAccess=()=>true;cx.moduleVisibleForProfile=()=>true;
    data.scopePaises=()=>null;data.periodMonth=()=>null;data.programBase=()=>'';
    data.kpis=()=>({postPend:0,sinAsignar:{t:0},cuestPend:{t:0},fueraRango:{t:0}});
    cx.module=(id,render)=>{cx.modules[id]=render;};
    vm.runInContext(fs.readFileSync('app/core/router.js','utf8'),env);
    vm.runInContext(fs.readFileSync('app/modules/midia.js','utf8'),env);
    cx.modules.config=()=>'<div>Project configuration</div>';
    cx.router.buildRail=()=>{};
    cx.router.nav=function(id){cx.session.view=id;calls.push(id);return cx.modules[id]({data,role:'admin',ui:{}});};
  }
  vm.runInContext(source,env);return f;
}
test('normal human entry preserves the configured authorized tenant and project',()=>{
  const f=fixture();assert.equal(f.cx.BACKEND.tenantId,'tenant-a');assert.equal(f.cx.BACKEND.defaultProjectId,'project-a');
  assert.deepEqual(Array.from(f.cx.BACKEND.previewProjectIds),['project-a']);
});
test('authenticated exact internal project can configure countries before periods or visits exist',()=>{
  const f=fixture();f.cx.router.nav('config');assert.deepEqual(f.calls,['config']);assert.equal(f.env.CX_C6_HR_AUTHORITY_GATE.ready,true);
  assert.equal(f.data.currentPeriodId,'');assert.equal(f.data._visitas.length,0);
});
for(const [name,mutate] of [
  ['unauthenticated principal',f=>f.ctx.authenticated=false],['different uid',f=>f.authorized.principal.actorUid='other'],
  ['different tenant',f=>f.authority.tenantId='other'],['different project',f=>f.authority.projectId='other'],
  ['different namespace',f=>f.authorized.principal.authNamespace='shopper'],['missing authorized project',f=>f.authorized.projects=[]],
  ['external record with internal flag',f=>f.record.operationalSource.mode='external'],['non atomic authority',f=>f.authority.atomicPublication=false],
  ['old session generation',f=>f.authority.sessionGeneration=f.authority.sessionGeneration.replace('exact-user','old-user')],
  ['missing session generation',f=>delete f.authority.sessionGeneration],['wrong internal source ref',f=>f.cx.dataSource.sourceRef='firestore-internal:other:project-a']
])test('internal entry rejects '+name,()=>{const f=fixture({mutate});f.cx.router.nav('config');assert.deepEqual(f.calls,[]);});
test('internal flag never bypasses shopper exact identity requirements',()=>{const f=fixture({role:'shopper'});f.cx.router.nav('config');assert.deepEqual(f.calls,[]);});
test('external HR authority retains revision, period and nonempty operational requirements',()=>{
  const valid=fixture({internal:false});valid.cx.router.nav('config');assert.deepEqual(valid.calls,['config']);
  for(const mutate of [f=>f.authority.sourceRevision='b'.repeat(64),f=>f.data.currentPeriodId='',f=>f.data._visitas=[],f=>f.authority.applied=false]){
    const f=fixture({internal:false,mutate});f.cx.router.nav('config');assert.deepEqual(f.calls,[]);
  }
});
test('external shopper authority still requires the exact signed-in identity',()=>{
  const valid=fixture({internal:false,role:'shopper'});valid.cx.router.nav('config');assert.deepEqual(valid.calls,['config']);
  const invalid=fixture({internal:false,role:'shopper',mutate:f=>f.authority.rawShopperId='other'});invalid.cx.router.nav('config');assert.deepEqual(invalid.calls,[]);
});
test('an initially blocked human shell releases after the actual internal authority producer completes',async()=>{
  const f=fixture({mutate:f=>{f.authority.applied=false;}});
  f.env.CX_BACKEND_LAST_STATE={source:'firestore',empty:false,counts:{projects:1}};
  f.env.clearTimeout=()=>{};
  vm.runInContext(fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8'),f.env);
  f.cx.router.nav('config');assert.deepEqual(f.calls,[]);
  await Promise.resolve();await Promise.resolve();
  assert.equal(f.env.CX_PROTECTED_AUTH_HR_AUTHORITY.internalProjectAuthority,true);
  assert.equal(f.env.CX_C6_HR_AUTHORITY_GATE.ready,true);assert.equal(f.env.CX_C6_HR_AUTHORITY_GATE.blocked,false);
  assert.deepEqual(f.calls,['mount']);
});
test('cold internal project without a period mounts configuration through the real router start resolver',()=>{
  const f=fixture({realMount:true});
  assert.doesNotThrow(()=>f.cx.router.mount());
  assert.deepEqual(f.calls,['config']);assert.equal(f.cx.session.view,'config');
  assert.equal(f.data.currentPeriodId,'');assert.equal(f.data.period(),undefined);assert.equal(f.data._visitas.length,0);
});
test('deferred internal publication selects configuration before mounting a no-period project',async()=>{
  const f=fixture({realMount:true,mutate:f=>{f.authority.applied=false;}});
  f.env.CX_BACKEND_LAST_STATE={source:'firestore',empty:false,counts:{projects:1}};f.env.clearTimeout=()=>{};
  vm.runInContext(fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8'),f.env);
  f.cx.router.mount();assert.deepEqual(f.calls,[]);
  await Promise.resolve();await Promise.resolve();
  assert.equal(f.env.CX_C6_HR_AUTHORITY_GATE.ready,true);assert.deepEqual(f.calls,['config']);
  assert.equal(f.data.currentPeriodId,'');
});
test('initial internal setup never grants configuration access to a role without permission',()=>{
  const f=fixture({realMount:true});f.cx.roleCanAccess=()=>false;
  f.cx.router.mount();assert.deepEqual(f.calls,[]);
  assert.equal(f.env.CX_C6_HR_AUTHORITY_GATE.blocked,true);
  assert.equal(f.env.CX_C6_HR_AUTHORITY_GATE.reason,'internal_project_setup_requires_config_authority');
});
test('deferred operational request does not replay Mi Dia after selecting safe configuration',async()=>{
  const f=fixture({realMount:true,mutate:f=>{f.authority.applied=false;}});
  f.env.CX_BACKEND_LAST_STATE={source:'firestore',empty:false,counts:{projects:1}};f.env.clearTimeout=()=>{};
  vm.runInContext(fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8'),f.env);
  f.cx.router.nav('midia');await Promise.resolve();await Promise.resolve();
  assert.equal(f.env.CX_C6_HR_AUTHORITY_GATE.ready,true);assert.deepEqual(f.calls,['config']);
});
test('explicit permitted period-free view survives initial setup without enlarging permissions',()=>{
  const f=fixture({realMount:true});f.cx.MODULES.marca={roles:['admin']};f.cx.modules.marca=()=>'';f.cx.session.view='marca';
  f.cx.router.mount();assert.deepEqual(f.calls,['marca']);
  const restricted=fixture({realMount:true});restricted.cx.MODULES.config.superOnly=true;
  restricted.cx.router.mount();assert.deepEqual(restricted.calls,[]);assert.equal(restricted.env.CX_C6_HR_AUTHORITY_GATE.blocked,true);
});
test('an actual internal period preserves the selected operational view',()=>{
  const f=fixture();f.data.currentPeriodId='period-a';f.data.period=()=>({id:'period-a'});f.cx.session.view='midia';
  f.cx.router.mount();assert.equal(f.cx.session.view,'midia');assert.deepEqual(f.calls,['mount']);
});
test('external HR mount keeps its existing operational selection',()=>{
  const f=fixture({internal:false});f.cx.session.view='dashboard';f.cx.router.mount();
  assert.equal(f.cx.session.view,'dashboard');assert.deepEqual(f.calls,['mount']);
});
