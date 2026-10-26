import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const entry=fs.readFileSync('app/index-backend-dev.html','utf8');
const liveApply=fs.readFileSync('app/adapters/tya-live-source-inplace-apply.js','utf8');
const projectionSource=fs.readFileSync('app/adapters/tya-corte1-report-projection-live.js','utf8');

test('VRM-289: DEV authenticated entry installs the verified projection exactly once before protected HR publication',()=>{
  const owner='adapters/tya-corte1-report-projection-live.js';
  assert.equal(entry.split(`<script src="${owner}"></script>`).length-1,1);
  const apply=entry.indexOf('adapters/tya-live-source-inplace-apply.js');
  const report=entry.indexOf(owner);
  const watcher=entry.indexOf('adapters/tya-live-source-refresh-watch-v2.js');
  const protectedAuthority=entry.indexOf('adapters/tya-protected-auth-hr-authority-bridge-v2.js');
  assert.ok(apply>=0&&apply<report&&report<watcher&&watcher<protectedAuthority);
  assert.match(liveApply,/typeof window\.CX_TYA_BUILD_CORTE1_REPORTS==='function'\)window\.CX_TYA_BUILD_CORTE1_REPORTS\(candidate\.snapshot,candidate\.meta\|\|\{\}\)/);
});

const validSource={
  sourceSafe:true,imported:false,production:false,tenantId:'tya',projectId:'cinepolis',
  projectName:'Cinépolis',periods:[{key:'2026-10'}],
  visits:[
    {periodKey:'2026-10',pais:'GT',sucursal:'Portales',ciudad:'Guatemala',estado:'submitida',shopperId:'fixture-a',paymentConfirmed:false},
    {periodKey:'2026-10',pais:'HN',sucursal:'Altara',ciudad:'San Pedro Sula',estado:'agendada',paymentConfirmed:false}
  ]
};

test('VRM-289: async protected HR publication builds period/country and branch rows from exact source-safe snapshot',()=>{
  const window={};
  vm.runInNewContext(projectionSource,{window},{timeout:1500});
  assert.equal(window.CX_TYA_CORTE1_REPORTS,null,'no reports before authenticated HR snapshot');
  const p=window.CX_TYA_BUILD_CORTE1_REPORTS(validSource,{revision:'synthetic-revision'});
  assert.equal(p?.sourceRevision,'synthetic-revision');
  assert.equal(p.totals.visits,2);
  assert.equal(p.totals.assigned,1);
  assert.equal(p.totals.performed,1);
  assert.equal(p.totals.paymentConfirmed,0);
  assert.equal(p.filter({periodKey:'2026-10',country:'GT'}).length,1);
  assert.equal(p.filter({periodKey:'2026-10',country:'HN'}).length,1);
  assert.equal(p.report('branch_operational_status',{periodKey:'2026-10'}).rows.length,2);
  assert.equal(p.report('brand_scorecard',{periodKey:'2026-10'}).available,false,'unverified scores stay disabled');
  assert.equal(window.CX_TYA_CORTE1_REPORTS_LIVE_META.writes,false);
  assert.equal(window.CX_TYA_CORTE1_REPORTS_LIVE_META.production,false);
});

test('VRM-289: reports fail closed on invalid, imported, or production snapshots',()=>{
  const window={};
  vm.runInNewContext(projectionSource,{window},{timeout:1500});
  for(const invalid of [null,{...validSource,sourceSafe:false},{...validSource,imported:true},{...validSource,production:true}]){
    assert.equal(window.CX_TYA_BUILD_CORTE1_REPORTS(invalid,{revision:'synthetic'}),null);
    assert.equal(window.CX_TYA_CORTE1_REPORTS,null);
  }
});
