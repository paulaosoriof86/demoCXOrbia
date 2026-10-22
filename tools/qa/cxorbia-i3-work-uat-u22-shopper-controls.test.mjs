import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const ROOT=new URL('../../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,ROOT),'utf8');

test('U22 B8: August historical cut is the paid authority even without a visit payment flag or new financial movement',()=>{
  const win={location:{hostname:'cxorbia-backend-dev.web.app',search:''},
    CX_TYA_FINANCIAL_CANONICAL_SOURCE_SAFE:{sourceSafe:true,liquidations:[],reviewQueue:[],payments:[],batches:[],summary:{}}};
  const CX={data:{},liq:{forProject(){return [];},fromVisita(){return null;},label:v=>[v,'n']},fin:{porPais(){return {};}}};
  win.CX=CX;
  const ctx={window:win,CX,URLSearchParams,console};
  vm.createContext(ctx);
  vm.runInContext(read('app/data/tya-payment-history-source-safe.js'),ctx);
  vm.runInContext(read('app/adapters/tya-financial-canonical-source-safe-adapter.js'),ctx);
  const august=CX.data.paymentHistoryTruthForVisit({
    id:'AGOSTO 26!21',hrRowId:'AGOSTO 26!21',projectId:'cinepolis',
    periodKey:'2026-08',paymentConfirmed:false,paymentState:'not_eligible'
  });
  assert.equal(august.paymentConfirmed,true);
  assert.equal(august.paidAt,'2026-10-02');
  assert.equal(august.paidAtPrecision,'frozen_cut_exact_date');
  assert.equal(august.paymentSourceRef,'recovery-lock:phase-a-completion:historical-cut:2026-08');
  assert.equal(august.executionAllowed,false);
  assert.equal(CX.data.paymentHistoryTruthForVisit({periodKey:'2026-10',id:'unpaid'}),null);
  assert.equal(win.CX_TYA_PAYMENT_HISTORY_READY,true);
});

function benefitsHarness(){
  const listeners=new Map(),deferred=[],modals=[];
  const control=(value='')=>({value,events:{},addEventListener(type,fn){this.events[type]=fn;}});
  const fields={'#benStatus':control(''),'#benCountry':control(''),'#benCurrency':control(''),'#benFilterCount':{textContent:''}};
  const rows=[
    {dataset:{benStatus:'paid',benCountry:'GT',benCurrency:'Q'},style:{},hidden:false},
    {dataset:{benStatus:'pending',benCountry:'GT',benCurrency:'Q'},style:{},hidden:false}
  ];
  const tr={dataset:{benRow:'AGOSTO 26!21'},addEventListener(type,fn){listeners.set(type,fn);}};
  const view={
    querySelector:query=>fields[query]||null,
    querySelectorAll:query=>query==='#benCurrentTable tbody tr[data-ben-status]'?rows:[]
  };
  const doc={
    getElementById:id=>id==='view'?view:null,
    querySelectorAll:query=>query==='[data-ben-row]'?[tr]:[],
    querySelector:()=>null
  };
  const paid={
    visitaId:'AGOSTO 26!21',visitId:'AGOSTO 26!21',sucursal:'C. Oakland Mall VIP',
    pais:'GT',moneda:'Q',freal:'2026-08-30',honorario:60,reembolso:207,total:267,
    estado:'pagada',paymentConfirmed:true,historicalReconciliationConfirmed:true,
    paymentSourceRef:'recovery-lock:phase-a-completion:historical-cut:2026-08',
    paidAt:'2026-10-02',paidAtPrecision:'frozen_cut_exact_date',fechaEstimadaPago:''
  };
  const pending={
    visitaId:'pending',visitId:'pending',sucursal:'Pendiente',pais:'GT',moneda:'Q',
    freal:'2026-08-31',honorario:60,reembolso:0,total:60,
    estado:'pendiente_fuente_financiera',paymentConfirmed:false,fechaEstimadaPago:''
  };
  const visits=[
    {id:'AGOSTO 26!21',shopperId:'qa-shopper',periodId:'cinepolis-2026-08',pais:'GT',currency:'Q'},
    {id:'pending',shopperId:'qa-shopper',periodId:'cinepolis-2026-08',pais:'GT',currency:'Q'}
  ];
  const project={id:'cinepolis-2026-08',name:'Cinépolis',currency:{GT:'Q'}};
  const data={
    currentPeriodId:project.id,__identityMap:{},shoppers:[{id:'qa-shopper',nombre:'Shopper QA'}],
    getShopper:id=>({id,nombre:'Shopper QA'}),
    visitsForShopper:()=>visits,recordPeriodId:v=>v.periodId,
    projects:[project],period:()=>project,_visitas:visits,visitContract:()=>({paymentState:'confirmed'})
  };
  const ui={empty:()=>'',ph:()=>'',kpi:()=>'',bdg:()=>'',money:(cu,v)=>cu+v,
    bar:()=>'',aiBox:()=>'',modal:(title,html)=>modals.push({title,html}),toast:()=>{}};
  let fn=null;
  const CX={
    data,session:{user:{shopperId:'qa-shopper'}},liq:{label:state=>[state,'g'],fromVisita:()=>paid},
    paisFlag:()=>'',module(name,f){assert.equal(name,'beneficios');fn=f;}
  };
  const win={CX_TYA_CANONICAL_FINANCE_READ_MODEL:{fromVisit:(_,v)=>v.id===paid.visitId?paid:pending}};
  vm.runInNewContext(read('app/modules/beneficios.js'),{window:win,CX,document:doc,setTimeout:f=>{deferred.push(f);return 1;},console});
  const html=fn({data,ui});
  deferred.forEach(f=>f());
  return {html,fields,rows,modals,listeners};
}

test('U22 B8: confirmed August paid date and historical evidence are visible in table and drill, no invented payment execution',()=>{
  const h=benefitsHarness();
  assert.match(h.html,/✓ 2026-10-02/);
  const onClick=h.listeners.get('click');
  assert.equal(typeof onClick,'function');
  onClick();
  assert.match(h.modals[0].html,/2026-10-02/);
  assert.match(h.modals[0].html,/Corte histórico aprobado/);
  assert.doesNotMatch(h.modals[0].html,/Pago —/);
});

test('U22 B8: paid/pending filters actually hide opposite rows on both input and change',()=>{
  const h=benefitsHarness();
  assert.equal(h.fields['#benFilterCount'].textContent,'Mostrando 2 de 2 liquidaciones');
  h.fields['#benStatus'].value='paid';
  h.fields['#benStatus'].events.input();
  assert.equal(h.rows[0].hidden,false);
  assert.equal(h.rows[1].hidden,true);
  assert.equal(h.rows[1].style.display,'none');
  assert.equal(h.fields['#benFilterCount'].textContent,'Mostrando 1 de 2 liquidaciones');
  h.fields['#benStatus'].value='pending';
  h.fields['#benStatus'].events.change();
  assert.equal(h.rows[0].hidden,true);
  assert.equal(h.rows[1].hidden,false);
  assert.equal(h.fields['#benFilterCount'].textContent,'Mostrando 1 de 2 liquidaciones');
});

test('U22 B2: email field validates malformed input before provider write, without requiring optional email',()=>{
  const src=read('app/adapters/tya-canonical-shopper-portal-v2.js');
  assert.match(src,/id="sp_mail" type="email"/);
  assert.match(src,/id="sp_email_error" role="alert"/);
  assert.match(src,/mailInput\?\.addEventListener\('blur',validateEmail\)/);
  assert.match(src,/if\(!validateEmail\(\)\)\{/);
  const expression=src.match(/const valid=!value\|\|(\/.*?\/)\.test\(value\);/);
  assert.ok(expression,'No executable email validation regex');
  const check=new Function('value','return '+expression[1]+'.test(value);');
  assert.equal(check('invalid-email'),false);
  assert.equal(check('correo@dominio.com'),true);
  assert.equal(check('no valid@domain.com'),false);
  assert.equal(check('name@domain'),false);
});

function topbarHarness(role){
  const routes=[],notices=[];
  const mail={_wired:false,click:null,addEventListener(type,fn){if(type==='click')this.click=fn;}};
  const document={readyState:'loading',getElementById:id=>id==='tbMail'?mail:null,addEventListener(){}};
  const CX={session:{role},MODULES:{correo:{roles:['admin','super']},soporte:{roles:['shopper','admin','super']}},
    router:{nav:route=>routes.push(route)},ui:{toast:msg=>notices.push(msg)},
    bus:{on(){}},notif:{unread:()=>0,for:()=>[]}};
  const win={CX,addEventListener(){},navigator:{},matchMedia:()=>({matches:false})};
  vm.runInNewContext(read('app/core/topbar.js'),{window:win,CX,document,setTimeout(){},navigator:win.navigator,console});
  CX.topbar.init();
  assert.equal(typeof mail.click,'function');
  mail.click();
  return {routes,notices};
}

test('U22 R/correo: Shopper Correo routes to authorized support instead of silently navigating to forbidden mailbox',()=>{
  const h=topbarHarness('shopper');
  assert.deepEqual(h.routes,['soporte']);
  assert.match(h.notices[0],/Soporte/);
});

test('U22 R/correo: Admin keeps dedicated correo route; Client never opens another role inbox',()=>{
  assert.deepEqual(topbarHarness('admin').routes,['correo']);
  const client=topbarHarness('cliente');
  assert.deepEqual(client.routes,[]);
  assert.ok(client.notices.length>0);
});
