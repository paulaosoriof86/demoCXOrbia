// Exact source behavior for Q2 owners. Synthetic VM only: no provider writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const plain=x=>JSON.parse(JSON.stringify(x));
function load(path,cx={},extra={}){
  const context={console,Date,Math,JSON,Map,Set,Promise,...extra,CX:cx};
  context.window=context;vm.createContext(context);
  vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path,timeout:2000});
  return context;
}
function node(){
  return {dataset:{},style:{},innerHTML:'',value:'',handlers:{},children:new Map(),
    addEventListener(type,fn){this.handlers[type]=fn;},
    querySelector(q){return this.children.get(q)||null;},querySelectorAll(){return [];}};
}
function configFixture(writes=true){
  const modules={},notices=[],local=[],calls=[];
  const record={id:'project-a',name:'Proyecto A',version:4,countries:['GT'],currency:{GT:'GTQ'},
    operationalSource:{mode:'internal'},questionnaireProgramsByPeriod:{}};
  const period={id:'period-a',rootProjectId:'project-a',countries:['GT']};
  const cx={module:(id,fn)=>{modules[id]=fn;},canonicalTenantAuthority:()=>true,
    COUNTRIES:[{c:'GT',cur:'GTQ',n:'Guatemala'},{c:'HN',cur:'HNL',n:'Honduras'},{c:'SV',cur:'USD',n:'El Salvador'}],paisFlag:()=>'',paisName:c=>c,
    BACKEND:{enableCommandWrites:writes},BRAND:{id:'tenant-a',nda:'Original'},session:{plan:'estandar',role:'super'},
    data:{currentProjectId:'project-a',currentPeriodId:'period-a',projects:[period],
      __backendAllProjectRecords:[record],period:()=>period,
      async updateProject(id,patch,options){calls.push({id,patch:plain(patch),options});
        Object.assign(record,plain(patch));return {ok:true,committed:true,providerAck:true,successUiAllowed:true};}},
    backend:{async refresh(){}}};
  const context=load('app/modules/configuracion.js',cx,{CX_PROTECTED_DEV_RUNTIME:true,
    CX_TENANT_RUNTIME_CONFIG:{tenantId:'tenant-a',tenantName:'Tenant A',countries:['GT']},
    localStorage:{getItem(k){local.push(['read',k]);return null;},setItem(k,v){local.push(['write',k,v]);}}});
  const host=node(),body=node();host.children.set('#cfgBody',body);
  body.children.set('#saveNDA',node());body.children.set('#cfg_nda',{value:'Local replacement'});
  const ui={el:()=>host,ph:()=>'',bdg:()=>'',toast:(...a)=>notices.push(a)};
  return {context,cx,modules,record,period,calls,local,notices,host,body,ui};
}

test('configuration protected authority never becomes local editing when command writes are off',async()=>{
  for(const tab of ['nda','listas','marca','plan','paises']){
    const f=configFixture(false);vm.runInContext('_cfgTab='+JSON.stringify(tab),f.context);
    f.modules.config({data:f.cx.data,ui:f.ui});
    assert.match(f.body.innerHTML,/data-config-locked=/,tab+' requires a read-only surface');
    assert.equal(f.body.children.get('#saveNDA').handlers.click,undefined);
    assert.equal(f.cx.BRAND.nda,'Original');assert.deepEqual(f.local,[]);assert.deepEqual(f.calls,[]);
    await assert.rejects(f.cx.connectedAdminConfig.updateProjectCountries('project-a',['HN']),/CONNECTED_AUTHORITY_REQUIRED/);
  }
});
test('protected users with command gate off cannot load local roles or expose a local save',async()=>{
  const f=configFixture(false);f.modules.usuarios({ui:f.ui});
  assert.match(f.host.innerHTML,/data-connected-users="readonly"/);
  assert.deepEqual(f.local,[]);assert.deepEqual(f.calls,[]);
  await assert.rejects(f.cx.liveUserAdmin.create({displayName:'Synthetic'}),/WRITE_AUTHORITY_REQUIRED/);
});
test('project configuration requires provider ACK and independent project readback',async()=>{
  const f=configFixture();
  const ok=await f.cx.connectedAdminConfig.updateProjectCountries('project-a',['hn','GT','hn'],{HN:'HNL'},'period-a');
  assert.equal(ok.providerAck,true);assert.deepEqual(plain(ok.countries),['GT','HN']);
  assert.equal(f.calls[0].id,'project-a');assert.equal(f.calls[0].patch.periodId,'period-a');
  f.cx.data.updateProject=async()=>({ok:true,committed:true,providerAck:false,successUiAllowed:true});
  await assert.rejects(f.cx.connectedAdminConfig.updateProjectCountries('project-a',['SV']),/PROVIDER_ACK_REQUIRED/);
  f.cx.data.updateProject=async()=>({ok:true,committed:true,providerAck:true,successUiAllowed:true});
  await assert.rejects(f.cx.connectedAdminConfig.updateProjectCountries('project-a',['SV']),/READBACK_MISMATCH/);
  assert.deepEqual(plain(f.record.countries),['HN','GT']);assert.deepEqual(f.local,[]);
});
test('connected Add Country UI includes the configured currency for the new country',async()=>{
  const f=configFixture(),add=node(),choice=node();choice.dataset.c='HN';
  f.body.children.set('#addPais',add);
  f.ui.modal=(_title,_body,options)=>options.onMount({querySelectorAll:()=>[choice]},()=>{});
  vm.runInContext("_cfgTab='paises'",f.context);f.modules.config({data:f.cx.data,ui:f.ui});
  add.handlers.click();await choice.handlers.click();
  assert.deepEqual(plain(f.record.countries),['GT','HN']);assert.equal(f.record.currency.HN,'HNL');
  assert.equal(f.calls[0].patch.currency.HN,'HNL');assert.deepEqual(f.local,[]);
});
test('connected project countries work before the first period exists, using the durable project scope',async()=>{
  const f=configFixture(),add=node(),choice=node();choice.dataset.c='HN';
  f.record.periodId='setup-qa';f.cx.data.currentPeriodId='';f.cx.data.period=()=>undefined;delete f.cx.session.plan;
  f.body.children.set('#addPais',add);f.ui.modal=(_title,_body,options)=>options.onMount({querySelectorAll:()=>[choice]},()=>{});
  vm.runInContext("_cfgTab='paises'",f.context);f.modules.config({data:f.cx.data,ui:f.ui});
  add.handlers.click();await choice.handlers.click();
  assert.equal(f.calls[0].id,'project-a');assert.equal(f.calls[0].patch.periodId,'setup-qa');
  assert.equal(f.record.currency.HN,'HNL');assert.equal(f.cx.data.currentPeriodId,'');assert.deepEqual(f.local,[]);
});
test('adding a country preserves explicit project currency and requires independent currency readback',async()=>{
  const f=configFixture();
  const ack=await f.cx.connectedAdminConfig.updateProjectCountries('project-a',['GT','HN'],{GT:'Q',HN:'L'},'period-a');
  assert.deepEqual(plain(ack.currency),{GT:'Q',HN:'L'});
  f.cx.data.updateProject=async(_id,patch)=>{Object.assign(f.record,plain(patch));delete f.record.currency.SV;return {ok:true,committed:true,providerAck:true,successUiAllowed:true};};
  await assert.rejects(f.cx.connectedAdminConfig.updateProjectCountries('project-a',['GT','HN','SV']),/CURRENCY_READBACK_MISMATCH/);
});
test('unknown country without configured currency fails before calling the provider',async()=>{
  const f=configFixture();await assert.rejects(f.cx.connectedAdminConfig.updateProjectCountries('project-a',['GT','ZZ']),/COUNTRY_CURRENCY_REQUIRED:ZZ/);
  assert.deepEqual(f.calls,[]);assert.deepEqual(plain(f.record.countries),['GT']);
});
const program=name=>({activeId:'v1',versions:[{id:'v1',name,sections:[{id:'s1',weight:100,
  questions:[{id:'q1',name:'Pregunta',tipo:'Sí / No',weight:100,req:true}]}]}]});
test('questionnaire program is isolated by period, cloned and published only after durable ACK',async()=>{
  const f=configFixture();f.cx.bus={on(){},emit(){}};
  f.record.questionnaireProgramsByPeriod={'period-a':program('Primero'),'period-b':program('Segundo')};
  f.cx.data.projects.push({id:'period-b',rootProjectId:'project-a'});
  vm.runInContext(fs.readFileSync('app/core/programa.js','utf8'),f.context);
  assert.equal(f.cx.programa.get('period-a').versions[0].name,'Primero');
  assert.equal(f.cx.programa.get('period-b').versions[0].name,'Segundo');
  const clone=f.cx.programa.get('period-a');clone.versions[0].name='No persistido';
  assert.equal(f.cx.programa.get('period-a').versions[0].name,'Primero');
  const ack=await f.cx.programa.save('period-a',program('Confirmado'));
  assert.equal(ack.durableReadback,true);assert.equal(f.cx.programa.get('period-a').versions[0].name,'Confirmado');
  assert.equal(f.cx.programa.get('period-b').versions[0].name,'Segundo');
  f.cx.data.updateProject=async()=>({ok:true,committed:true,providerAck:true,successUiAllowed:true});
  await assert.rejects(f.cx.programa.save('period-a',program('Sin readback')),/DURABLE_READBACK_MISMATCH/);
  assert.equal(f.cx.programa.get('period-a').versions[0].name,'Confirmado');assert.deepEqual(f.local,[]);
});
test('program with no write authority reports draft-only without inventing a durable save',async()=>{
  const f=configFixture(false);f.cx.bus={on(){},emit(){}};
  vm.runInContext(fs.readFileSync('app/core/programa.js','utf8'),f.context);
  const ack=await f.cx.programa.save('period-a',program('Borrador'));
  assert.equal(ack.ok,false);assert.equal(ack.providerAck,false);assert.equal(ack.successUiAllowed,false);
  assert.equal(ack.localStorageWrite,false);assert.deepEqual(f.calls,[]);assert.deepEqual(f.local,[]);
});
function periodFixture(){
  const modules={},host=node(),manage=node(),notices=[],applied=[],selected=[],dialogs=[];
  manage.dataset.id='period-a';host.children.set('#pdNew',node());host.children.set('#pdCompare',node());
  host.querySelectorAll=q=>q==='.pdAct'?[manage]:[];
  const p={id:'period-a',name:'A',countries:['GT']};
  const data={projects:[p],currentPeriodId:p.id,currentProgramKey:()=> 'project-a',programs:()=>[{key:'project-a'}],
    periodsForProgram:()=>[p],periodState:()=> 'activo',periodStats:()=>({pct:0,done:0,total:1}),
    duplicatePeriod:async()=>({ok:false}),closePeriod:async()=>({ok:false}),
    applyPeriodReadback(r){applied.push(r);return r;},setProject(id){selected.push(id);}};
  const ui={el:()=>host,ph:()=>'',kpi:()=>'',aiBox:()=>'',toast:(...a)=>notices.push(a),
    modal(title,html,opts){const ov=node();for(const id of ['pdN','pdSave','pdGo','pdClose','pdArch'])ov.children.set('#'+id,node());
      ov.children.get('#pdN').value='Siguiente';const d={ov,closed:false};dialogs.push(d);opts.onMount(ov,()=>{d.closed=true;});}};
  load('app/modules/periodos.js',{module:(id,fn)=>{modules[id]=fn;},cxDataCommandBoundary:{canonicalMode:()=>true},
    bus:{on(){}},router:{},session:{}});
  modules.periodos({data,ui});return {data,host,manage,notices,applied,selected,dialogs};
}
test('period creation waits for ACK and reload before switching the active period',async()=>{
  const f=periodFixture();let release;
  f.data.duplicatePeriod=()=>new Promise(resolve=>{release=resolve;});
  f.host.children.get('#pdNew').handlers.click();const d=f.dialogs[0];
  const pending=d.ov.children.get('#pdSave').handlers.click();
  assert.equal(d.closed,false);assert.deepEqual(f.applied,[]);assert.deepEqual(f.notices,[]);
  release({ok:true,committed:true,providerAck:true,successUiAllowed:true,readbackVerified:true,entityReadback:{id:'period-b'}});
  await pending;assert.equal(d.closed,true);assert.deepEqual(f.selected,['period-b']);assert.equal(f.applied.length,1);
  assert.equal(f.notices[0][1],'ok');
});
test('period close refuses incomplete ACK without applying or closing the dialog',async()=>{
  const f=periodFixture();f.data.closePeriod=async()=>({ok:true,committed:true,providerAck:true,successUiAllowed:true,readbackVerified:false});
  f.manage.handlers.click();const d=f.dialogs[0];await d.ov.children.get('#pdClose').handlers.click();
  assert.equal(d.closed,false);assert.deepEqual(f.applied,[]);assert.equal(f.notices[0][1],'warn');
  f.data.closePeriod=async()=>({ok:true,committed:true,providerAck:true,successUiAllowed:true,readbackVerified:true,entityReadback:{id:'period-a',status:'closed'}});
  await d.ov.children.get('#pdClose').handlers.click();assert.equal(d.closed,true);assert.equal(f.applied.length,1);
});
function uiFixture(){
  const handlers=new Map(),overlays=[];let focusCount=0;
  const doc={activeElement:{isConnected:true,focus(){focusCount++;}},body:{style:{overflow:'auto'},appendChild(el){overlays.push(el);el.isConnected=true;}},
    createElement(){const el=node();el.isConnected=false;el.setAttribute=(k,v)=>{el[k]=v;};
      el.remove=()=>{el.isConnected=false;const i=overlays.indexOf(el);if(i>=0)overlays.splice(i,1);};
      el.children.set('[data-x]',node());return el;},
    querySelectorAll:q=>q==='.cx-ov'?[...overlays]:[],
    addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,new Set());handlers.get(type).add(fn);},
    removeEventListener(type,fn){handlers.get(type)?.delete(fn);}};
  const x=load('app/core/ui.js',{}, {document:doc,setTimeout:()=>0});
  return {ui:x.CX.ui,doc,overlays,handlers,focus:()=>focusCount};
}
test('shared modal replaces previous dialog, closes only the top on Escape and restores focus',()=>{
  const f=uiFixture();f.ui.modal('Uno','');f.ui.modal('Dos','');assert.equal(f.overlays.length,2);
  for(const fn of [...f.handlers.get('keydown')])fn({key:'Escape'});
  assert.equal(f.overlays.length,1);assert.equal(f.doc.body.style.overflow,'hidden');
  const close=f.ui.modal('Tres','',{replaceExisting:true,dismissOnBackdrop:false,dismissOnEscape:false});
  assert.equal(f.overlays.length,1);const ov=f.overlays[0];ov.handlers.click({target:ov});
  for(const fn of [...f.handlers.get('keydown')])fn({key:'Escape'});
  assert.equal(f.overlays.length,1);close();close();assert.equal(f.overlays.length,0);
  assert.equal(f.doc.body.style.overflow,'auto');assert.ok(f.focus()>=3);assert.equal(f.handlers.get('keydown').size,0);
});
