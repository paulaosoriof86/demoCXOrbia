// I3/Q2: independent, read-only proof for the exact two finance support bytes
// present in the already-served DEV source. This is NOT a human/module PASS.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const SOURCE='e2458f449ee76d965ee39effdb5790d2e6d45d8c';
const SOURCE_TREE='4b331d8bda49fc8a4e0fd46d947cd629ff8000e1';
const SOURCE_FILES={
  'app/adapters/tya-financial-canonical-source-safe-adapter.js':'9d2d1a9a541c74a6234353a44f0bfaa43bc1fb79',
  'app/adapters/tya-canonical-finance-read-model-v2.js':'4997010949dd8a126b058f720041fe5eeb04f1bd'
};
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const parse=value=>JSON.parse(JSON.stringify(value));
const visit=(id,periodKey)=>({
  id,visitId:id,hrRowId:`HR!${id}`,periodKey,projectId:`cinepolis-${periodKey}`,
  pais:'GT',moneda:'Q',shopper:'Shopper QA',sucursal:'QA',realizada:'2026-09-02',submit:true
});
const snapshot=()=>({
  sourceSafe:true,snapshotId:'finance-q2-source-proof',generatedAt:'2026-11-12',
  source:{financialWorkbookRef:'qa:synthetic-only'},
  summary:{exactAcceptedLinks:1,reviewLiquidationRows:0,reviewQueue:0,amountReviewRequired:0,canonicalAmountReady:1},
  liquidations:[{visitId:'v-sep',hrRowId:'HR!v-sep',periodKey:'2026-09',country:'GT',currency:'Q',honorario:80,boleto:30,combo:20,total:130,reviewRequired:false}],
  reviewQueue:[],payments:[],batches:[]
});
const history=()=>({
  sourceSafe:true,projectId:'cinepolis',schemaVersion:'finance-q2-test',
  paidItems:[{visitId:'v-jul',hrRowId:'HR!v-jul',periodKey:'2026-07',paymentConfirmed:true,paymentSourceRef:'qa:confirmed-provider-source',paymentItemId:'qa-paid-item',honorarioPaid:75,reimbursementPaid:25,totalPaid:100,country:'GT',currency:'Q'}],
  historicalPaymentGroups:[{id:'qa-history',executionAllowed:false}],
  historicalCut:{paidFromPeriodKey:'2026-01',paidThroughPeriodKey:'2026-07',throughJuly:{paymentConfirmed:true}},
  periodPolicies:{},summary:{confirmedPaymentVisits:1}
});

function sandbox({host='cxorbia-backend-dev.web.app',query='',financial=snapshot(),paid=history()}={}){
  const visits=[visit('v-sep','2026-09'),visit('v-jul','2026-07'),visit('v-unknown','2026-09')];
  const project={id:'cinepolis-2026-09',periodKey:'2026-09'};
  const data={period:()=>project,visitas:()=>visits,visitContract:v=>({id:v.id})};
  const liq={forProject:()=>[],fromVisita:(p,v)=>({visitaId:v.id,estado:'pendiente_fuente_financiera'}),label:s=>[s,'n']};
  const fin={porPais:()=>({GT:{pagosConfirmados:0}})};
  const cx={data,liq,fin,dataSource:{}};
  const window={location:{hostname:host,search:query},CX:cx,
    CX_TYA_FINANCIAL_CANONICAL_SOURCE_SAFE:financial,
    CX_TYA_PAYMENT_HISTORY_SOURCE_SAFE:paid};
  const context=vm.createContext({window,CX:cx,URLSearchParams,console});
  vm.runInContext(fs.readFileSync('app/adapters/tya-financial-canonical-source-safe-adapter.js','utf8'),context,{filename:'tya-financial-canonical-source-safe-adapter.js'});
  return {window,cx,visits,project};
}

test('Q2 scope: both exact finance adapter blobs match current served source tree',()=>{
  assert.equal(git('rev-parse',`${SOURCE}^{tree}`),SOURCE_TREE);
  for(const [file,expected] of Object.entries(SOURCE_FILES)){
    assert.equal(git('rev-parse',`${SOURCE}:${file}`),expected);
    assert.equal(git('rev-parse',`HEAD:${file}`),expected);
    assert.equal(git('hash-object',file),expected);
  }
});

test('financial source adapter: exact September amount is not mistaken for a paid item',()=>{
  const {window,cx,visits}=sandbox();
  assert.equal(window.CX_TYA_FINANCIAL_CANONICAL_READY,true);
  assert.equal(window.CX_TYA_PAYMENT_HISTORY_READY,true);
  const [sept,july,unknown]=parse(cx.liq.forProject(cx.data));
  assert.equal(sept.visitId,'v-sep');
  assert.equal(sept.total,130);
  assert.equal(sept.paymentConfirmed,false);
  assert.equal(sept.paymentState,'pending_source_confirmation');
  assert.equal(sept.reviewRequired,false);
  assert.equal(july.paymentConfirmed,true);
  assert.equal(july.paymentSourceRef,'qa:confirmed-provider-source');
  assert.equal(unknown.paymentConfirmed,false);
  assert.equal(unknown.reviewRequired,true);
  assert.equal(cx.data.paymentHistoryTruthForVisit(visits[0]),null);
  assert.equal(cx.data.visitContract(visits[0]).paymentConfirmed,false);
  assert.equal(cx.data.visitContract(visits[1]).paymentConfirmed,true);
});

test('financial source adapter: read-only cloned rows, empty batches, explicit paid amounts',()=>{
  const {window,cx}=sandbox();
  const first=cx.data.financialLiquidations();
  first[0].honorario=99999;
  assert.equal(cx.data.financialLiquidations()[0].honorario,80);
  assert.deepEqual(parse(cx.data.paymentBatches()),[]);
  assert.equal(cx.data.confirmedPayments().length,1);
  const july=parse(cx.liq.forProject(cx.data))[1];
  assert.equal(july.total,100);
  assert.equal(july.honorario,75);
  assert.equal(july.reembolso,25);
  assert.equal(july.paymentBatchId,null);
  assert.equal(july.paymentExecutionAllowed,false);
  assert.equal(window.CX_TYA_FINANCIAL_CANONICAL_CONTRACT.paymentExecutionAllowed,false);
  assert.equal(window.CX_TYA_FINANCIAL_CANONICAL_CONTRACT.production,false);
});

test('financial source adapter: missing input cannot assert READY or override methods',()=>{
  const invalid=snapshot();invalid.payments=[{id:'unexpected-incoming-payment'}];
  const {window,cx}=sandbox({financial:invalid});
  assert.equal(window.CX_TYA_FINANCIAL_CANONICAL_READY,false);
  assert.equal(window.CX_TYA_PAYMENT_HISTORY_READY,false);
  assert.equal(cx.data.financialLiquidations,undefined);
});

test('financial source adapter: production hostname without explicit DEV opt-in is inactive',()=>{
  const {window,cx}=sandbox({host:'tya-plataforma.web.app'});
  assert.equal(window.CX_TYA_FINANCIAL_CANONICAL_READY,false);
  assert.equal(cx.data.financialLiquidations,undefined);
});

test('canonical finance read model: 12 synthetic behavior assertions on the same source byte',()=>{
  const raw=execFileSync(process.execPath,['tools/qa/tya-c6-canonical-finance-read-model-gate.mjs'],{encoding:'utf8'});
  const result=JSON.parse(raw);
  assert.equal(result.decision,'PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS');
  assert.equal(result.assertions.length,12);
  assert.equal(result.assertions.filter(x=>x.ok).length,12);
  assert.equal(result.counts.realized,40);
  assert.equal(result.counts.liquidations,40);
  assert.equal(result.counts.submitted,33);
  assert.equal(result.safety.paymentsWrites,0);
  assert.equal(result.safety.production,false);
});
