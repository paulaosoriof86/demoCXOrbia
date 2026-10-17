const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ROOT=process.argv[2]||path.join(__dirname,'source');
const results=[];let executed=0;
function ast(file){return {text:fs.readFileSync(path.join(ROOT,file),'utf8')};}
function extract(file,name){
 const text=ast(file).text;const start=text.search(new RegExp('^(?:async )?function '+name+'\\(', 'm'));
 assert.ok(start>=0,'FUNCTION_MISSING:'+name);
 const tail=text.slice(start);let end=0;
 for(const line of tail.split('\n')){
  end+=line.length+1;const code=tail.slice(0,end).trimEnd();
  try{new vm.Script('('+code+')');return code;}catch(error){if(!(error instanceof SyntaxError))throw error;}
 }
 throw new Error('FUNCTION_UNTERMINATED:'+name);
}
function moduleBody(file,name){const s=ast(file).text;const start=s.indexOf("CX.module('"+name+"',");assert.ok(start>=0,'MODULE_MISSING:'+name);const end=s.indexOf("\nCX.module('",start);return s.slice(start,end<0?s.length:end);}
const bridge='app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',finance='app/modules/finanzas.js';
const scope={role:'shopper',shopperId:'raw-a',tenantId:'tenant-a',projectIds:['project-a']};
const helpers={str:v=>String(v??'').trim(),arr:v=>Array.isArray(v)?v:[],clone:v=>JSON.parse(JSON.stringify(v))};
function session(state,c,result){return JSON.parse(JSON.stringify(vm.runInNewContext('('+extract(bridge,'sessionProfile')+')',helpers)(state,c,result)));}
async function test(id,fn){executed++;try{await fn();results.push({id,status:'PASS'});}catch(e){results.push({id,status:'FAIL',error:e.message});}}
class Button{constructor(id='visit-1'){this.dataset={finReconcile:id};this.textContent='Conciliar';this.disabled=false;this.isConnected=true;this.handlers=[];this.diag={dataset:{},textContent:''};}addEventListener(event,fn){assert.equal(event,'click');this.handlers.push(fn);}closest(){return {querySelector:()=>this.diag};}async click(){for(const fn of this.handlers)await fn({preventDefault(){}});}}
function binderHarness(proof){const b=new Button(),calls=[],toasts=[],draw=[];const root={querySelectorAll:()=>[b]},data={};const ui={toast:(...x)=>toasts.push(x)};const cx={};const code=extract(finance,'cxFinanceBindReconcile');const bind=vm.runInNewContext('('+code+')',{cxFinanceReconcileWithProof:async(...args)=>{calls.push(args);return proof(...args)},cxFinanceReconcileFailure:()=>({code:'FINANCE_RECONCILE_ERROR_UNCLASSIFIED'}),cxFinanceFailureCopy:code=>String(code).includes('PENDING')?'La verificación está pendiente.':'No se pudo confirmar la operación.',CX:cx});return {b,calls,toasts,draw,bind,root,data,ui,onConfirmed:()=>draw.push(true)};}
(async()=>{
await test('A04-01-equivalent-raw-canonical',()=>{const x=session({shoppers:[{id:'raw-a',nombre:'Persona',pais:'GT'}]},scope,{identityMap:{'raw-a':'canonical-a'},shoppers:[{id:'canonical-a',nombre:'Persona',pais:'GT'}]});assert.equal(x.ok,true);assert.equal(x.canonicalShopperId,'canonical-a');assert.equal(x.profile.id,'canonical-a');});
await test('A04-02-transitive-alias',()=>{const x=session({shoppers:[{id:'raw-a',pais:'GT'}]},scope,{identityMap:{'raw-a':'middle-a','middle-a':'canonical-a'},shoppers:[{id:'canonical-a',nombre:'Persona',pais:'GT'}]});assert.equal(x.ok,true);assert.equal(x.canonicalShopperId,'canonical-a');});
await test('A04-03-cycle-rejected',()=>{const x=session({shoppers:[{id:'raw-a',pais:'GT'}]},scope,{identityMap:{'raw-a':'middle-a','middle-a':'raw-a'},shoppers:[]});assert.equal(x.ok,false);assert.equal(x.reason,'invalid_identity_alias');});
await test('A04-04-foreign-tenant-rejected',()=>{const x=session({shoppers:[{id:'raw-a',pais:'GT',tenantId:'tenant-b'}]},scope,{identityMap:{},shoppers:[]});assert.equal(x.ok,false);assert.equal(x.reason,'identity_scope_mismatch');});
await test('A04-05-homonym-not-merged',()=>{const x=session({shoppers:[{id:'other-a',nombre:'Persona',pais:'GT'}]},scope,{identityMap:{},shoppers:[{id:'other-b',nombre:'Persona',pais:'GT'}]});assert.equal(x.ok,false);assert.equal(x.reason,'no_exact_identity');});
await test('A04-06-canonical-profile-kept',()=>{const x=session({shoppers:[{id:'raw-a',nombre:'Nombre antiguo',pais:'GT'}]},scope,{identityMap:{'raw-a':'canonical-a'},shoppers:[{id:'canonical-a',nombre:'Nombre vigente',pais:'GT'}]});assert.equal(x.ok,true);assert.equal(x.profile.nombre,'Nombre vigente');});
await test('A04-07-self-map-not-cycle',()=>{const x=session({shoppers:[{id:'raw-a',nombre:'Persona',pais:'GT'}]},scope,{identityMap:{'raw-a':'raw-a'},shoppers:[]});assert.equal(x.ok,true);assert.equal(x.canonicalShopperId,'raw-a');});
await test('A04-08-missing-profile-no-unlock',()=>{const x=session({shoppers:[]},scope,{identityMap:{'raw-a':'canonical-a'},shoppers:[]});assert.equal(x.ok,false);});
await test('A04-10-contradictory-row-ids-rejected',()=>{const x=session({shoppers:[{id:'raw-a',shopperId:'different-person',pais:'GT'}]},scope,{identityMap:{'raw-a':'canonical-a'},shoppers:[]});assert.equal(x.ok,false);assert.equal(x.reason,'ambiguous_exact_identity');});
await test('A04-09-no-mutation',()=>{const s={shoppers:[{id:'raw-a',nombre:'Persona',pais:'GT'}]},r={identityMap:{'raw-a':'canonical-a'},shoppers:[{id:'canonical-a',nombre:'Persona',pais:'GT'}]},before=JSON.stringify([s,r]);session(s,scope,r);assert.equal(JSON.stringify([s,r]),before);});
await test('C01-01-dashboard-binds-own-controls',()=>{const body=moduleBody(finance,'financiero');assert.ok(body.includes('cxFinanceBindReconcile('),'Dashboard route does not bind the reconciliation control');});
await test('C01-02-positive-with-readback',async()=>{const h=binderHarness(async()=>({ok:true,providerAck:true,readback:{ok:true}}));h.bind(h.root,h.data,h.ui,h.onConfirmed);await h.b.click();assert.equal(h.calls.length,1);assert.equal(h.draw.length,1);assert.equal(h.b.disabled,false);assert.ok(h.toasts.some(t=>t[1]==='ok'));});
await test('C01-03-denied-no-success',async()=>{const h=binderHarness(async()=>({ok:false,providerAck:false,code:'FINANCE_VISIT_NOT_SUBMITTED'}));h.bind(h.root,h.data,h.ui,h.onConfirmed);await h.b.click();assert.equal(h.calls.length,1);assert.equal(h.draw.length,0);assert.ok(!h.toasts.some(t=>t[1]==='ok'));assert.equal(h.b.disabled,false);});
await test('C01-04-ack-pending-is-not-success',async()=>{const h=binderHarness(async()=>({ok:false,providerAck:true,code:'FINANCE_RECONCILE_ACK_READBACK_PENDING'}));h.bind(h.root,h.data,h.ui,h.onConfirmed);await h.b.click();assert.equal(h.draw.length,0);assert.ok(!h.toasts.some(t=>t[1]==='ok'));});
await test('C01-05-binding-idempotent',async()=>{const h=binderHarness(async()=>({ok:true,providerAck:true}));h.bind(h.root,h.data,h.ui,h.onConfirmed);h.bind(h.root,h.data,h.ui,h.onConfirmed);await h.b.click();assert.equal(h.calls.length,1);});
await test('C01-06-pending-double-click-no-duplicate',async()=>{let resolve;const deferred=new Promise(r=>resolve=r);const h=binderHarness(()=>deferred);h.bind(h.root,h.data,h.ui,h.onConfirmed);const first=h.b.click();await h.b.click();assert.equal(h.calls.length,1);resolve({ok:true,providerAck:true});await first;});
await test('C01-07-exception-human-failure-restores-control',async()=>{const h=binderHarness(()=>{throw Error('secret_or_provider_detail')});h.bind(h.root,h.data,h.ui,h.onConfirmed);await h.b.click();assert.equal(h.draw.length,0);assert.equal(h.b.disabled,false);assert.ok(!JSON.stringify(h.toasts).includes('secret_or_provider_detail'));});
await test('C01-08-missing-visit-no-command',async()=>{const h=binderHarness(async()=>({ok:true,providerAck:true}));h.b.dataset.finReconcile='';h.bind(h.root,h.data,h.ui,h.onConfirmed);await h.b.click();assert.equal(h.calls.length,0);});
await test('C01-09-modal-uses-same-binder',()=>{const src=ast(finance).text;assert.ok(/cxFinanceBindReconcile\(ov,data,ui/.test(src),'Liquidation detail does not use the shared binder');});
const report={scope:'ISOLATED_SYNTHETIC_SOURCE_CONTRACTS_NO_NETWORK_NO_PROVIDER',tests:executed,pass:results.filter(x=>x.status==='PASS').length,fail:results.filter(x=>x.status==='FAIL').length,results};console.log(JSON.stringify(report,null,2));if(report.fail)process.exitCode=1;
})();
