import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ROUTER=fs.readFileSync('app/core/router.js','utf8');
const APPLY=fs.readFileSync('app/adapters/tya-live-source-inplace-apply.js','utf8');
const periods=[{key:'2026-10',label:'Octubre 2026'},{key:'2026-11',label:'Noviembre 2026'}];
const hr={tenantId:'tya',tenantName:'TyA',projectId:'cinepolis',projectName:'Cine',sourceSafe:true,imported:false,production:false,
  projectConfig:{countries:['GT','HN'],currency:{GT:'Q',HN:'L'}},periods,visits:[{id:'gt1',periodKey:'2026-10',pais:'GT',currency:'Q'},
    {id:'hn1',periodKey:'2026-11',pais:'HN',currency:'L'}],shoppers:[]};
function harness({uid='gt-u1',role='shopper',country='GT',projects=['cinepolis'],tenant='tya'}={}){
 const memory=new Map(),principal={uid},claims={authenticated:true,provider:'firebase',role,country,tenantId:tenant,projectIds:projects};
 const data={projects:periods.map(p=>({id:'cinepolis-'+p.key,periodKey:p.key,projectId:'cinepolis',countries:['GT','HN']})),
  currentProjectId:'cinepolis',currentPeriodId:'cinepolis-2026-10',
  previewMeta:{tenantId:'tya',projectId:'cinepolis',hrAuthority:true,sourceSafe:true},
  programKey:p=>p.projectId,projectsFor(){return this.projects;},period(){return this.projects.find(p=>p.id===this.currentPeriodId)}};
 const CX={data,backendAuth:{context:()=>claims},session:{role,view:'mireportes',user:{},save(){}},tenantProfile:null,BRAND:{tenantId:'tya'},
  MODULES:{mireportes:{roles:['shopper']},midia:{roles:['shopper','cliente','admin']}},
  moduleEnabled:()=>true,roleCanAccess:()=>true,moduleVisibleForProfile:()=>true,
  bus:{on(){},emit(){}},NAV:{shopper:[{sec:'',items:['midia','mireportes']}],admin:[]}};
 const ctx={window:{CX,firebase:{auth:()=>({currentUser:principal})},addEventListener(){}},CX,sessionStorage:{
  getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},
  console,Date,URL,Map,Set,JSON,encodeURIComponent,document:{}};
 vm.runInNewContext(ROUTER,ctx,{filename:'router.js'});
 vm.runInNewContext(APPLY,ctx,{filename:'apply.js'});
 return {CX,ctx,claims,principal,memory};
}
function rememberAndReboot(options={}){
 const h=harness(options);
 assert.equal(h.CX.router.rememberScopedUiHint({view:'mireportes'}),true);
 h.CX.data.previewMeta={tenantId:'tya',projectId:'cinepolis',hrAuthority:false,sourceSafe:false};
 h.CX.data.projects=[{id:'demo',periodKey:'2026-11',projectId:'demo'}];
 h.CX.data.currentPeriodId='demo';h.CX.data.currentProjectId='demo';
 return {h,chosen:()=>h.ctx.window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE(hr,{latestPeriodKey:'2026-11'}).data.currentPeriodId};
}
for(const country of ['GT','HN']){
 test('WORK '+country+' restores October from same Firebase principal after HR snapshot hydration',()=>{
  const {h,chosen}=rememberAndReboot({uid:'u-'+country,country});
  assert.equal(chosen(),'cinepolis-2026-10');
  assert.equal(h.CX.router.readScopedUiHint('tya','cinepolis').view,'mireportes');
 });
}
test('another UID or foreign tenant and project cannot read saved selection',()=>{
 const {h,chosen}=rememberAndReboot();
 h.principal.uid='foreign';assert.equal(h.CX.router.readScopedUiHint('tya','cinepolis'),null);assert.equal(chosen(),'cinepolis-2026-11');
 h.principal.uid='gt-u1';h.claims.tenantId='foreign';assert.equal(h.CX.router.readScopedUiHint('tya','cinepolis'),null);
 h.claims.tenantId='tya';h.claims.projectIds=['other-project'];assert.equal(h.CX.router.readScopedUiHint('tya','cinepolis'),null);
});
test('source deleted period and foreign country cannot steer provider snapshot',()=>{
 const {h,chosen}=rememberAndReboot();
 const key=[...h.memory.keys()][0];
 const old=JSON.parse(h.memory.get(key));h.memory.set(key,JSON.stringify({...old,periodId:'cinepolis-2026-09'}));
 assert.equal(chosen(),'cinepolis-2026-11');
 h.memory.set(key,JSON.stringify(old));h.claims.country='SV';
 assert.equal(chosen(),'cinepolis-2026-11');
});
test('time-expired or tampered hint fails closed, without reading localStorage',()=>{
 const {h,chosen}=rememberAndReboot();
 const key=[...h.memory.keys()][0],saved=JSON.parse(h.memory.get(key));
 h.memory.set(key,JSON.stringify({...saved,savedAt:Date.now()-9*86400000}));assert.equal(chosen(),'cinepolis-2026-11');
 h.memory.set(key,JSON.stringify({...saved,role:'admin'}));assert.equal(chosen(),'cinepolis-2026-11');
 assert.equal(ROUTER.includes("localStorage.setItem('cxorbia.i3"),false);
});
test('existing trusted HR period wins over stale UI hint during in-place refresh',()=>{
 const {h,chosen}=rememberAndReboot();
 h.CX.data.projects=hr.periods.map(p=>({id:'cinepolis-'+p.key,periodKey:p.key,projectId:'cinepolis'}));
 h.CX.data.currentPeriodId='cinepolis-2026-11';h.CX.data.currentProjectId='cinepolis';
 h.CX.data.previewMeta={hrAuthority:true,sourceSafe:true,tenantId:'tya',projectId:'cinepolis'};
 assert.equal(chosen(),'cinepolis-2026-11');
});
test('mount validates remembered route and does not trust browser preference as an access grant',()=>{
 assert.match(ROUTER,/const selectedView=CX\.session\.view\|\|/);
 assert.match(ROUTER,/CX\.roleCanAccess\(gRole,selectedView\)/);
 assert.match(ROUTER,/CX\.moduleVisibleForProfile\(selectedView,role\)/);
 assert.match(ROUTER,/opts\.history!=='replace'&&opts\.remember!==false/);
});

test('protected startup reapplies the saved view after the default shell, once per principal',()=>{
 const {h}=rememberAndReboot();const {CX,ctx}=h;
 const originalNav=CX.router.nav;const nav=[];
 CX.router.nav=(id,opts)=>{nav.push({id,history:opts.history});CX.session.view=id};
 CX.session.view='midia';CX.router.restoreProtectedView();assert.equal(nav.length,0);
 CX.data.currentProjectId='cinepolis';CX.data.currentPeriodId='cinepolis-2026-10';
 CX.data.previewMeta={tenantId:'tya',projectId:'cinepolis',hrAuthority:true,sourceSafe:true};
 ctx.window.CX_PROTECTED_AUTH_HR_AUTHORITY={applied:true};
 CX.router.restoreProtectedView();assert.deepEqual(nav,[{id:'mireportes',history:'replace'}]);
 CX.session.view='midia';CX.router.restoreProtectedView();assert.equal(nav.length,1);
 CX.router.nav=originalNav;
});
test('startup does not override explicit user navigation, a different period or a foreign identity',()=>{
 for(const setting of ['interaction','period','identity']){
  const h=harness();const {CX,ctx}=h;CX.router.rememberScopedUiHint({view:'mireportes'});
  ctx.window.CX_PROTECTED_AUTH_HR_AUTHORITY={applied:true};CX.session.view='midia';
  if(setting==='interaction')CX.router._userNavigatedScope=CX.router._authorizedUiHintScope('tya','cinepolis').key;
  if(setting==='period')CX.data.currentPeriodId='cinepolis-2026-11';
  if(setting==='identity')h.principal.uid='other';
  let calls=0;CX.router.nav=()=>{calls++};CX.router.restoreProtectedView();assert.equal(calls,0);
 }
});
test('automatic data refreshes use the existing route without overwriting the saved intent',()=>{
 assert.match(ROUTER,/CX\.router\.nav\(CX\.session\.view,\{history:false,remember:false\}\)/);
 assert.match(ROUTER,/cx:protected-auth-hr-authority-ready',\(\)=>CX\.router\.restoreProtectedView\(\)/);
});
