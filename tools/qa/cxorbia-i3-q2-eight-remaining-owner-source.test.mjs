// I3/Q2: independent, path-bound source regression for eight owners still
// awaiting exact-byte QA. This test never connects to DEV, HR or production.
// It does not replace authenticated E2E, external payment proof or human PASS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const source=descriptor.productSourceSha;
const sourceTree=descriptor.productTreeAuthority;
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
assert.match(source,/^[0-9a-f]{40}$/);
assert.equal(git('rev-parse',source+'^{tree}'),sourceTree);
const owner=path=>{
  const exact=git('rev-parse',source+':'+path);
  assert.match(exact,/^[0-9a-f]{40}$/);
  assert.equal(git('rev-parse','HEAD:'+path),exact,`owner source drift: ${path}`);
  return fs.readFileSync(path,'utf8');
};
const browserVM=(src,cx={},extra={})=>{
  const context={URLSearchParams,Date,Math,JSON,Set,Map,Promise,console,setTimeout,
    ...extra,CX:cx};
  context.window=context;
  vm.runInNewContext(src,context,{timeout:1500});
  return context;
};

test('Q2 geo owner: GT/HN/SV/NI can read scoped geography without forcing a known-city list',()=>{
  const cx={COUNTRIES:[{c:'GT',n:'Guatemala'},{c:'HN',n:'Honduras'}],paisFlag:()=>''};
  const x=browserVM(owner('app/core/geo.js'),cx);
  for(const country of ['GT','HN','SV','NI']){
    assert.equal(x.CX.geo.hasData(country),true);
    assert.ok(x.CX.geo.departments(country).length>0);
  }
  assert.equal(x.CX.geo.hasData('XX'),false);
  assert.equal(x.CX.geo.departments('XX').length,0);
  assert.match(x.CX.geo._ctrl('city',[], 'Ciudad de prueba','Ciudad'),/<input/);
  assert.match(x.CX.geo.fieldsHTML({pais:'p',depto:'d',municipio:'m',ciudad:'c'}),/Municipio/);
  assert.deepEqual(JSON.parse(JSON.stringify(x.CX.geo.cities('HN','Cortés'))).slice(0,2),['San Pedro Sula','Choloma']);
});

test('Q2 finance-core owner: provisional rows never create paid status or invented operating margin',()=>{
  const cx={bus:{emit(){}},BRAND:{id:'tya'},BACKEND:{enabled:true},
    dataSource:{showFixtures:()=>false},data:{},liq:{forProject(){return []}}};
  const x=browserVM(owner('app/core/finanzas-core.js'),cx);
  assert.equal(typeof x.CX.fin.porPais,'function');
  const p={id:'cinepolis-2026-11',projectId:'cinepolis',countries:['GT','HN'],
    currency:{GT:'GTQ',HN:'HNL'},modelo:'delegado',honRecibe:{GT:100,HN:150}};
  const data={project:()=>p,period:()=>p,periodId:()=>p.id,tenantId:()=> 'tya',
    __financialMovements:[],__financeAccounts:[],__financeBudgets:[],__financeProjectionLoaded:true};
  const out=x.CX.fin.porPais(data);
  assert.equal(out.GT.pagosConfirmados,0);
  assert.equal(out.HN.pagosConfirmados,0);
  assert.equal(out.GT.margen,null);
  assert.equal(out.HN.margen,null);
  assert.equal(out.GT.ingreso,0);
  assert.equal(out.HN.ingreso,0);
  assert.ok(!Object.keys(out).some(k=>k==='USD'),'no fabricated third-country currency');
});

test('Q2 P0 finance-core: a known income never turns an unknown margin into 0 percent',()=>{
  const cx={bus:{emit(){}},BRAND:{id:'tya'},BACKEND:{enabled:true},
    dataSource:{showFixtures:()=>false},data:{},liq:{forProject(){return [
      {id:'review-visit-1',pais:'GT',moneda:'GTQ',honorario:null,total:null,reviewRequired:true,
        financialSourceStatus:'pending_or_review',paymentConfirmed:false}
    ];}}};
  const x=browserVM(owner('app/core/finanzas-core.js'),cx);
  const p={id:'cinepolis-2026-11',projectId:'cinepolis',countries:['GT'],
    currency:{GT:'GTQ'},modelo:'delegado',honRecibe:{GT:100}};
  const data={project:()=>p,period:()=>p,periodId:()=>p.id,tenantId:()=> 'tya',
    __financialMovements:[{projectId:'cinepolis',periodId:p.id,country:'GT',currency:'GTQ',
      tipo:'ingreso',amount:100,revenueRecognized:true,operatingRevenue:true,sourceStatus:'confirmed'}],
    __financeAccounts:[],__financeBudgets:[],__financeProjectionLoaded:true};
  const result=x.CX.fin.porPais(data).GT;
  assert.equal(result.ingreso,100);
  assert.equal(result.honorarioDevengado,null);
  assert.equal(result.margen,null);
  assert.equal(result.margenPct,null,'unknown margin must not be interpreted as 0%');
  assert.equal(result.pagosConfirmados,0);
});

test('Q2 notification owner: Firestore shopper events are exact-identity scoped; fixture seed is off',()=>{
  const cx={dataSource:{showFixtures:()=>false},backendAuth:{context:()=>({shopperId:'s1'})},
    data:{currentProjectId:'p1',currentPeriodId:'p1-2026-11',
      _visitas:[{id:'v1',shopperId:'s1'}]},bus:{emit(){}}};
  const x=browserVM(owner('app/core/notif.js'),cx);
  assert.equal(x.CX.notif._items.length,0);
  const base={to:'shopper',source:'firestore',tipo:'agendar',entityType:'visit',entityId:'v1',
    projectId:'p1',periodId:'p1-2026-11',targetShopperIds:['s1']};
  assert.equal(x.CX.notif._validForRole(base,'shopper'),true);
  assert.equal(x.CX.notif._validForRole({...base,targetShopperIds:['s2']},'shopper'),false);
  assert.equal(x.CX.notif._validForRole({...base,entityId:'v2'},'shopper'),false);
  assert.equal(x.CX.notif._validForRole({...base,targetShopperIds:[]},'shopper'),false);
  assert.equal(x.CX.notif._validForRole(base,'admin'),false);
});

test('Q2 canonical-write-firewall owner: unacknowledged legacy questionnaire action stops before mutation',()=>{
  const callbacks={};let prevented=false,stopped=false,toast='';
  const cx={BACKEND:{enabled:true},ui:{toast:(s)=>{toast=s;}}};
  const x=browserVM(owner('app/adapters/cxorbia-canonical-write-firewall-v1.js'),cx,{
    document:{addEventListener:(type,fn)=>{callbacks[type]=fn;}}
  });
  assert.equal(x.CX_CANONICAL_WRITE_FIREWALL.directLocalWriteAllowed,false);
  assert.equal(x.CX_CANONICAL_WRITE_FIREWALL.providerWrites,0);
  callbacks.click({target:{id:'qSubmit',matches:()=>false,closest(){return this;}},
    preventDefault(){prevented=true;},stopImmediatePropagation(){stopped=true;}});
  assert.equal(prevented,true);
  assert.equal(stopped,true);
  assert.match(toast,/bloqueado|no se guardaron/i);
});

test('Q2 automations owner: connected configuration requires ACK and readback, never browser API secrets',()=>{
  const src=owner('app/modules/automatizaciones.js');
  new vm.Script(src);
  assert.match(src,/result\?\.providerAck===true/);
  assert.match(src,/result\?\.readback===true/);
  assert.match(src,/AUTOMATION_ACK_READBACK_REQUIRED/);
  assert.match(src,/sin API key en el navegador/);
  assert.match(src,/envío real pendiente de activación/);
  assert.doesNotMatch(src,/localStorage\.setItem\(\s*['"](?:api_key|token|webhookSecret)/i);
});

test('Q2 brand owner: protected tenant renders read-only escaped identity without localStorage writes',()=>{
  const modules={};const cx={BRAND:{clientName:'Marca <falsa>',logoUrl:''},
    BACKEND:{enableCommandWrites:true},canonicalTenantAuthority:()=>true,
    module:(id,fn)=>{modules[id]=fn;}};
  const x=browserVM(owner('app/modules/marca.js'),cx,{
    CX_PROTECTED_DEV_RUNTIME:true,CX_TENANT_RUNTIME_CONFIG:{tenantName:'T&A <script>'},
    localStorage:{getItem(){throw Error('unexpected localStorage read');},
      setItem(){throw Error('unexpected localStorage write');}}
  });
  const host={dataset:{},innerHTML:''};
  assert.equal(typeof modules.marca,'function');
  assert.equal(modules.marca({ui:{el:()=>host,ph:()=>''}}),host);
  assert.equal(host.dataset.connectedBrandAuthority,'read-only');
  assert.match(host.innerHTML,/T&amp;A &lt;script&gt;/);
  assert.doesNotMatch(host.innerHTML,/<script>/);
  assert.equal(x.CX.BACKEND.enableCommandWrites,true);
});

test('Q2 P0 brand: protected tenant remains read-only when command writes are disabled',()=>{
  const modules={};const cx={BRAND:{clientName:'Marca protegida'},BACKEND:{enabled:true,enableCommandWrites:false},
    canonicalTenantAuthority:()=>true,module:(id,fn)=>{modules[id]=fn;}};
  browserVM(owner('app/modules/marca.js'),cx,{
    CX_PROTECTED_DEV_RUNTIME:true,CX_TENANT_RUNTIME_CONFIG:{tenantName:'Marca protegida'},
    localStorage:{getItem(){return null;},setItem(){throw Error('local write forbidden');}}
  });
  const host={dataset:{},innerHTML:'',querySelector:()=>({addEventListener(){}})};
  assert.equal(modules.marca({ui:{el:()=>host,ph:()=>''}}),host);
  assert.equal(host.dataset.connectedBrandAuthority,'read-only');
  assert.match(host.innerHTML,/data-connected-brand-readonly/);
  assert.doesNotMatch(host.innerHTML,/id="bSave"/);
});

test('Q2 administrability owner: protected tenant remains read-only and never fabricates a saved version',()=>{
  const modules={};const cx={BRAND:{name:'Tenant de prueba'},BACKEND:{enableCommandWrites:true},
    canonicalTenantAuthority:()=>true,module:(id,fn)=>{modules[id]=fn;}};
  browserVM(owner('app/modules/administrabilidad.js'),cx,{
    CX_PROTECTED_DEV_RUNTIME:true,CX_TENANT_RUNTIME_CONFIG:{tenantName:'A&B',countries:['GT','HN']},
    localStorage:{getItem(){throw Error('unexpected localStorage read');},
      setItem(){throw Error('unexpected localStorage write');}}
  });
  const host={dataset:{},innerHTML:''};
  assert.equal(typeof modules.administrabilidad,'function');
  assert.equal(modules.administrabilidad({ui:{el:()=>host,ph:()=>''}}),host);
  assert.equal(host.dataset.connectedTenantAdmin,'read-only');
  assert.match(host.innerHTML,/A&amp;B/);
  assert.match(host.innerHTML,/GT, HN/);
  assert.match(host.innerHTML,/no se crean versiones locales/);
});

test('Q2 P0 administrability: protected tenant cannot enter demo NDA when command writes are disabled',()=>{
  const modules={};const cx={BRAND:{name:'Tenant protegido'},BACKEND:{enabled:true,enableCommandWrites:false},
    canonicalTenantAuthority:()=>true,module:(id,fn)=>{modules[id]=fn;}};
  browserVM(owner('app/modules/administrabilidad.js'),cx,{
    CX_PROTECTED_DEV_RUNTIME:true,CX_TENANT_RUNTIME_CONFIG:{tenantName:'Tenant protegido',countries:['GT']},
    localStorage:{getItem(){throw Error('local read forbidden');},setItem(){throw Error('local write forbidden');}}
  });
  const host={dataset:{},innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
  assert.equal(modules.administrabilidad({ui:{el:()=>host,ph:()=>'',bdg:()=>''}}),host);
  assert.equal(host.dataset.connectedTenantAdmin,'read-only');
  assert.match(host.innerHTML,/data-connected-admin-readonly/);
  assert.doesNotMatch(host.innerHTML,/id="ndaSave"/);
});

test('Q2 reservation guard owner: remote provider ACK and refresh required for any success',async()=>{
  let remoteCalls=0,readbacks=0;
  const cx={reserVations:null,reservas:{sucursales:()=>[],_seed:()=>['fixture']},
    BACKEND:{defaultProjectId:'p1'},data:{currentProjectId:'p1',currentPeriodId:'p1-2026-11',
      period:()=>({periodKey:'2026-11'}),__protectedReservations:[],
      async createReservation(){remoteCalls++;return {ok:true,providerAck:false,committed:false};}},
    bus:{emit(){}}};
  const x=browserVM(owner('app/adapters/tya-canonical-reservations-guard-v2.js'),cx,{
    location:{search:'?cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV'},
    document:{addEventListener(){}},addEventListener(){},
    CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY:async()=>{readbacks++;return {ok:true,skipped:false};}
  });
  assert.equal(x.CX_TYA_CANONICAL_RESERVATIONS.browserLocalStorageAsSource,false);
  assert.equal(x.CX_TYA_CANONICAL_RESERVATIONS.providerAckRequired,true);
  assert.equal(x.CX.reservas._seed().length,0);
  await assert.rejects(x.CX.reservas.reservar('p1-2026-11',{sucursalId:'A',shopperId:'s1'}),/RESERVATION_PROVIDER_ACK_REQUIRED/);
  assert.equal(remoteCalls,1);
  assert.equal(readbacks,0,'no independent refresh before positive ACK');
  x.CX.data.createReservation=async()=>{remoteCalls++;return {ok:true,providerAck:true,committed:true,successUiAllowed:true,entityId:'r1'};};
  const result=await x.CX.reservas.reservar('p1-2026-11',{sucursalId:'A',shopperId:'s1'});
  assert.equal(result.providerAck,true);
  assert.equal(readbacks,1);
  assert.equal(remoteCalls,2);
});
