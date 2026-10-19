import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const adapter=fs.readFileSync('app/adapters/tya-live-source-inplace-apply.js','utf8');
const shopperUi=fs.readFileSync('app/modules/cuestionario-shopper.js','utf8');

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
