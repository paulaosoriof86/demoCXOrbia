import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const adapter=fs.readFileSync('app/adapters/tya-live-source-inplace-apply.js','utf8');
const shopperUi=fs.readFileSync('app/modules/cuestionario-shopper.js','utf8');
const adminProjects=fs.readFileSync('app/modules/proyectos.js','utf8');

function adminProjectConfig(questionnaire,options={}){
  const pr={id:'project-fixture',name:'Proyecto de prueba',industry:'Retail · Cadena de tiendas',client:'',
    sucursales:1,countries:['GT'],currency:{GT:'GTQ'},scenarios:[],quincenas:[],
    hrFuente:{origen:'externa',etiqueta:'HR'},operationalSource:{providerType:'google_sheets',providerBindingId:'fixture-binding',mappingRef:'fixture-mapping'},
    cuestionario:{...questionnaire}};
  const data={projects:[pr],_visitas:[],scopedProyectos:()=>[],programs:()=>[pr],period:()=>pr,recordPeriodId:x=>x.periodId,periodosDe:()=>[],periodState:()=>'',currentPeriodId:pr.id};
  const handlers=new Map();
  const nodes=new Map();
  let modalHtml='',rejections=[];
  const node=id=>{
    if(!nodes.has(id))nodes.set(id,{value:'',checked:false,style:{},innerHTML:'',dataset:{},addEventListener:(type,cb)=>handlers.set(`${id}/${type}`,cb)});
    return nodes.get(id);
  };
  const ov={querySelector:sel=>node(sel),querySelectorAll:()=>[]};
  const ui={ph:()=>'',bdg:()=>'',aiBox:()=>'',kpi:()=>'',toast:(s)=>rejections.push(s),modal:(_title,html,opts)=>{
    modalHtml=html;
    const selectMarkup=html.match(/<select[^>]*id="cf_cueOrigen"[^>]*>([\s\S]*?)<\/select>/)?.[1]||'';
    const choices=[...selectMarkup.matchAll(/<option value="([^"]*)"([^>]*)>/g)];
    const selected=choices.find(x=>/\bselected\b/.test(x[2]))||choices[0];
    node('#cf_cueOrigen').value=selected?.[1]||'';
    node('#cf_name').value=pr.name;
    node('#cf_ind').value=pr.industry;
    node('#cf_cli').value=pr.client;
    node('#cf_suc').value=String(pr.sucursales);
    node('#cf_ronda').value='Mensual';
    node('#cf_cumpl').value='Igual a la ronda';
    node('#cf_hrOrigen').value='externa';
    node('#cf_hrEtiq').value='HR';
    node('#cf_cueEtiq').value='Origen original';
    node('#cf_cueUrl').value=String(pr.cuestionario.url||'');
    node('#cf_quin').value='';
    opts.onMount(ov,()=>{});
  }};
  let projectModule;
  const CX={module:(name,fn)=>{assert.equal(name,'proyectos');projectModule=fn;},
    COUNTRIES:[{c:'GT',cur:'GTQ'}],paisFlag:()=>'',paisLabel:x=>x,
    router:{nav:()=>{}},bus:{emit:()=>{}}};
  let cfgClick;
  const cfgButton={dataset:{cfg:pr.id},addEventListener:(event,fn)=>{if(event==='click')cfgClick=fn;}};
  const document={querySelectorAll:selector=>selector==='[data-cfg]'?[cfgButton]:[],getElementById:()=>null};
  let queuedMount;
  vm.runInNewContext(adminProjects,{CX,document,setTimeout:fn=>{queuedMount=fn;}},{filename:'proyectos.js'});
  projectModule({data,ui});
  queuedMount();
  cfgClick({stopPropagation:()=>{}});
  assert.ok(modalHtml.includes('id="cf_cueOrigen"'),'admin modal must be mounted');
  if(options.switchTo)node('#cf_cueOrigen').value=options.switchTo;
  node('#cf_name').value='Nombre editado sin cambiar cuestionario';
  return {pr,selected:node('#cf_cueOrigen').value,modalHtml,rejections,
    save:async()=>{await handlers.get('#cf_save/click')();return pr;}};
}

function projected(config={}){
  const CX={data:{period:()=>({periodKey:'2026-10'}),previewMeta:{}}};
  const window={CX};
  const ctx={window,CX,document:{},localStorage:{},CustomEvent:class{}};
  vm.runInNewContext(adapter,ctx,{filename:'tya-live-source-inplace-apply.js'});
  const snapshot={
    tenantId:'tenant-fixture',projectId:'project-fixture',
    projectConfig:{projectId:'project-fixture',...config},
    sourceSafe:true,imported:false,production:false,
    periods:[{key:'2026-10',label:'OCT 2026',total:1}],
    visits:[{id:'visit-1',periodKey:'2026-10',pais:'GT',shopperId:'shopper-1',sourceSafe:true}],
    shoppers:[{id:'shopper-1',pais:'GT'}],counts:{tabs:1}
  };
  return window.CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE(snapshot,{revision:'fixture-readonly'},{previousPeriodKey:'2026-10'}).data.projects[0];
}

function renderQuestionnaire(period,visit={id:'visit-1'}){
  const CX={};
  const window={CX};
  vm.runInNewContext(shopperUi,{window,CX},{filename:'cuestionario-shopper.js'});
  let captured=null;
  CX.shopperQuestionnaire({},period,visit,{modal:(title,html)=>{captured={title,html};}});
  return captured;
}

test('B10: live provider declaration never silently displays internal questionnaire',()=>{
  const period=projected({questionnaireSource:'TyAOnline'});
  assert.equal(period.cuestionario.modo,'externo_proveedor');
  assert.equal(period.cuestionario.providerSource,'TyAOnline');
  const html=renderQuestionnaire(period).html;
  assert.match(html,/proveedor externo|externo a través de proveedor/);
  assert.match(html,/enlace autorizado/);
  assert.match(html,/id="markDone"[^>]*disabled/);
  assert.doesNotMatch(html,/id="qForm"|id="qSubmit"|href="/);
});

test('B10: explicit source conflict blocks instead of choosing internal form',()=>{
  const p=projected({questionnaireSource:'TyAOnline',cuestionario:{modo:'interna'}});
  assert.equal(p.cuestionario.modo,'fuente_pendiente');
  assert.equal(p.cuestionario.sourceConflict,true);
  const h=renderQuestionnaire(p).html;
  assert.match(h,/no coincide con la fuente externa/);
  assert.match(h,/id="markDone"[^>]*disabled/);
  assert.doesNotMatch(h,/id="qForm"/);
});

test('B10: explicitly configured internal project remains internal',()=>{
  const p=projected({questionnaireSource:'internal',cuestionario:{modo:'interna'}});
  assert.equal(p.cuestionario.modo,'interna');
  assert.equal(p.cuestionario.url,'');
});

test('B10: provider mapping is generic and independent of global project names',()=>{
  const p=projected({questionnaireSource:'AnotherAuthorizedProvider'});
  assert.equal(p.cuestionario.modo,'externo_proveedor');
  assert.equal(p.cuestionario.providerSource,'AnotherAuthorizedProvider');
});

test('B10: configured per-visit link never falls back to unrelated global link',()=>{
  const p=projected({questionnaireSource:'TyAOnline',cuestionario:{modo:'externo_visita',url:'https://example.test/wrong-global'}});
  assert.equal(p.cuestionario.modo,'externo_visita');
  const noLink=renderQuestionnaire(p).html;
  assert.doesNotMatch(noLink,/href="https:\/\/example\.test\/wrong-global"/);
  assert.match(noLink,/id="markDone"[^>]*disabled/);
  const withLink=renderQuestionnaire(p,{id:'visit-1',questionnaireLink:'https://example.test/visit-1'}).html;
  assert.match(withLink,/href="https:\/\/example\.test\/visit-1"/);
  assert.doesNotMatch(withLink,/wrong-global/);
});

test('B10: explicitly configured general external URL is preserved',()=>{
  const p=projected({questionnaireSource:'TyAOnline',cuestionario:{modo:'externo_general',url:'https://example.test/form'}});
  assert.equal(p.cuestionario.modo,'externo_general');
  const h=renderQuestionnaire(p).html;
  assert.match(h,/href="https:\/\/example\.test\/form"/);
  assert.doesNotMatch(h,/id="qForm"/);
});

test('B10 Admin: provider-pending source is visibly selected and survives unrelated save',async()=>{
  const cfg=adminProjectConfig({modo:'externo_proveedor',providerSource:'TyAOnline',
    etiqueta:'TyAOnline',url:'',visitLinkField:'hrQuestionnaireField',sourceRevision:'fixture-rev'});
  assert.equal(cfg.selected,'externo_proveedor');
  assert.match(cfg.modalHtml,/Externo · proveedor registrado/);
  await cfg.save();
  assert.equal(cfg.pr.cuestionario.modo,'externo_proveedor');
  assert.equal(cfg.pr.cuestionario.providerSource,'TyAOnline');
  assert.equal(cfg.pr.cuestionario.sourceRevision,'fixture-rev');
  assert.equal(cfg.pr.cuestionario.visitLinkField,'hrQuestionnaireField');
  assert.equal(cfg.pr.name,'Nombre editado sin cambiar cuestionario');
});

test('B10 Admin: source conflict and unknown successor mode never silently become internal',async()=>{
  for(const modo of ['fuente_pendiente','future_provider_mode']){
    const cfg=adminProjectConfig({modo,providerSource:'ExternalFixture',sourceConflict:true});
    assert.equal(cfg.selected,modo);
    await cfg.save();
    assert.equal(cfg.pr.cuestionario.modo,modo);
    assert.equal(cfg.pr.cuestionario.sourceConflict,true);
  }
});

test('B10 Admin: declared external provider cannot be silently switched to internal',async()=>{
  const cfg=adminProjectConfig({modo:'externo_proveedor',providerSource:'TyAOnline'}, {switchTo:'interna'});
  await cfg.save();
  assert.equal(cfg.pr.cuestionario.modo,'externo_proveedor');
  assert.match(cfg.rejections.join(' '),/fuente externa declarada/);
});

test('B10 Admin: authorized internal project remains configurable as internal',async()=>{
  const cfg=adminProjectConfig({modo:'interna',etiqueta:'Interno'});
  assert.equal(cfg.selected,'interna');
  await cfg.save();
  assert.equal(cfg.pr.cuestionario.modo,'interna');
});

