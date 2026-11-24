import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/adapters/cxorbia-cxdata-command-boundary-v1.js',import.meta.url),'utf8');

function boundaryHarness(){
  const commands=[];
  const CX={
    BACKEND:{enabled:true,tenantId:'tya',defaultProjectId:'cinepolis'},
    backendAuth:{context:()=>({tenantId:'tya',projectIds:['cinepolis'],role:'admin',actorId:'paula'})},
    session:{user:{id:'paula',role:'admin'},effectiveRole:()=> 'admin'},
    data:{currentPeriodId:'cinepolis-2026-09',previewMeta:{sourceRevision:'hr-exact-revision'},
      ctx:()=>({tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-09'}),
      _visitas:[{id:'v1',hrRowId:'SEP 26!2',version:4},{id:'v2',hrRowId:'SEP 26!3',version:5}]},
    commandAdapter:{execute:async cmd=>{commands.push(cmd);return {ok:true,status:'committed',providerAck:true};}}
  };
  const context={CX,document:{readyState:'complete'},addEventListener:()=>{},setTimeout:()=>{},queueMicrotask:()=>{}};
  context.window=context;
  vm.runInNewContext(source,context,{filename:'cxorbia-cxdata-command-boundary-v1.js'});
  return {CX,commands,context};
}

test('B8 historical paid command carries exact HR revision, date and Paula authority to the provider',async()=>{
  const {CX,commands}=boundaryHarness();
  const meta={ackAware:true,sourceRef:'paula-attestation:2026-11-10',reconciliationBatchId:'sept-gt-approved-v1',
    historicalPaymentDate:'2026-10-31',historicalPaymentAuthorityRef:'PAULA_CHAT_2026_11_08_SEP_PAID',
    notes:'Historical source only, no bank transfer'};
  const result=await CX.data.reconcileHistoricalPayments(['v1','v2'],'paid',meta);
  assert.equal(result.providerAck,true);
  assert.equal(commands.length,1);
  const command=commands[0];
  assert.equal(command.commandType,'finance.historical.reconcile');
  assert.equal(command.periodId,'cinepolis-2026-09');
  assert.equal(command.authorization.permission,'finance.reconcile');
  assert.equal(command.payload.sourceRevision,'hr-exact-revision');
  assert.equal(command.payload.historicalPaymentDate,'2026-10-31');
  assert.equal(command.payload.historicalPaymentAuthorityRef,'PAULA_CHAT_2026_11_08_SEP_PAID');
  assert.equal(command.payload.sourceRef,'paula-attestation:2026-11-10');
  assert.equal(command.payload.visitRefs.length,2);
  assert.equal(command.payload.visitRefs[0].hrRowId,'SEP 26!2');
});

test('B8 historical pending command does not infer a payment date or authorization',async()=>{
  const {CX,commands}=boundaryHarness();
  await CX.data.reconcileHistoricalPayments(['v1'],'pending',
    {ackAware:true,sourceRef:'paula-scope:historical-pending',reconciliationBatchId:'sept-pending-v1'});
  assert.equal(commands.length,1);
  assert.equal(commands[0].payload.paymentStatus,'pending');
  assert.equal(commands[0].payload.sourceRevision,'hr-exact-revision');
  assert.equal(Object.hasOwn(commands[0].payload,'historicalPaymentDate'),false);
  assert.equal(Object.hasOwn(commands[0].payload,'historicalPaymentAuthorityRef'),false);
});

test('B8 explicit supersession proof is forwarded intact, without mutating input',async()=>{
  const {CX,commands}=boundaryHarness();
  const prior={priorBatchId:'sept-pending-v1',priorPaymentStatus:'pending',
    authorityRef:'PAULA_CHAT_SEP_PAID',paymentDate:'2026-10-31',identityLinkRefsByVisitId:{v1:'irl_exact_12345678'}};
  await CX.data.reconcileHistoricalPayments(['v1'],'paid',
    {ackAware:true,sourceRef:'paula-attestation',reconciliationBatchId:'sept-supersede-v1',supersession:prior});
  assert.equal(commands.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(commands[0].payload.supersession)),prior);
  assert.equal(prior.paymentDate,'2026-10-31');
});

for(const value of ['wrong-revision',undefined,123,null])test('caller cannot override current HR revision: '+String(value),()=>{
 const {CX,commands}=boundaryHarness();
 assert.throws(()=>CX.data.reconcileHistoricalPayments(['v1'],'pending',{ackAware:true,sourceRevision:value}),/HR_REVISION_MISMATCH/);
 assert.equal(commands.length,0);
});
test('missing current HR revision blocks before sending a command',()=>{
 const {CX,commands}=boundaryHarness();CX.data.previewMeta={};
 assert.throws(()=>CX.data.reconcileHistoricalPayments(['v1'],'pending',{ackAware:true}),/HR_REVISION_REQUIRED/);assert.equal(commands.length,0);
});
for(const [name,status,extra] of [
 ['future','paid',{historicalPaymentDate:'2099-01-01',historicalPaymentAuthorityRef:'explicit'}],
 ['invalid day','paid',{historicalPaymentDate:'2026-02-30',historicalPaymentAuthorityRef:'explicit'}],
 ['date without authority','paid',{historicalPaymentDate:'2026-10-31'}],
 ['authority without date','paid',{historicalPaymentAuthorityRef:'explicit'}],
 ['pending with paid date','pending',{historicalPaymentDate:'2026-10-31',historicalPaymentAuthorityRef:'explicit'}],
 ['array supersession','paid',{supersession:[]}],
 ['foreign identity map','paid',{supersession:{priorBatchId:'old',priorPaymentStatus:'pending',authorityRef:'explicit',paymentDate:'2026-10-31',identityLinkRefsByVisitId:{other:'irl_exact_12345678'}}}]
])test('invalid historical metadata blocked: '+name,()=>{
 const {CX,commands}=boundaryHarness();assert.throws(()=>CX.data.reconcileHistoricalPayments(['v1'],status,{ackAware:true,reconciliationBatchId:'new',...extra}),/HISTORICAL_/);assert.equal(commands.length,0);
});
test('supersession forwards only allowlisted fields and never authority, amount or ACK from the caller',async()=>{
 const {CX,commands}=boundaryHarness();const prior={priorBatchId:'old',priorPaymentStatus:'pending',authorityRef:'explicit',paymentDate:'2026-10-31',tenantId:'other',amount:99999,providerAck:true};
 const meta={ackAware:true,reconciliationBatchId:'new',supersession:prior,tenantId:'other',projectId:'other',amount:99999,providerAck:true};
 await CX.data.reconcileHistoricalPayments(['v1'],'paid',meta);
 assert.equal(commands[0].tenantId,'tya');assert.equal(commands[0].projectId,'cinepolis');
 assert.deepEqual(JSON.parse(JSON.stringify(commands[0].payload.supersession)),{priorBatchId:'old',priorPaymentStatus:'pending',authorityRef:'explicit',paymentDate:'2026-10-31'});
 assert.equal(Object.hasOwn(commands[0].payload,'amount'),false);assert.equal(Object.hasOwn(commands[0].payload,'providerAck'),false);assert.equal(prior.amount,99999);
});
test('identical historical calls generate the same idempotency key without changing context or input',async()=>{
 const {CX,commands}=boundaryHarness();const before=JSON.stringify(CX.data._visitas),meta={ackAware:true,reconciliationBatchId:'same',sourceRef:'explicit'};
 await CX.data.reconcileHistoricalPayments(['v1'],'pending',meta);await CX.data.reconcileHistoricalPayments(['v1'],'pending',meta);
 assert.equal(commands[0].idempotencyKey,commands[1].idempotencyKey);assert.equal(JSON.stringify(CX.data._visitas),before);assert.equal(meta.sourceRevision,undefined);
});

test('windowed command boundary rejects historical assignment and finance before transport until that exact period is read',async()=>{
 const {CX,commands,context}=boundaryHarness();
 const rows=CX.data._visitas.map(v=>({...v,tenantId:'tya',projectId:'cinepolis',rootProjectId:'cinepolis',periodId:'cinepolis-2026-09',country:'GT'}));CX.data._visitas=rows;
 context.CX_TYA_HR_SOURCE_SAFE={sourceSafe:true,tenantId:'tya',projectId:'cinepolis',visits:[],readScope:{countryPeriods:[{countryCode:'GT',periodId:'cinepolis-2026-11'}]}};
 context.CX_TYA_HR_LIVE_META={externalReadCurrent:true};
 assert.equal((await CX.data.assignVisit('v1','shopper',{ackAware:true})).code,'HR_PERIOD_FRESH_READ_REQUIRED');
 assert.equal((await CX.data.reconcileHistoricalPayments(['v1'],'pending',{ackAware:true})).code,'HR_PERIOD_FRESH_READ_REQUIRED');assert.equal(commands.length,0);
 context.CX_TYA_HR_SOURCE_SAFE.visits=rows;context.CX_TYA_HR_SOURCE_SAFE.readScope.countryPeriods=[{countryCode:'GT',periodId:'cinepolis-2026-09'}];
 assert.equal((await CX.data.assignVisit('v1','shopper',{ackAware:true})).providerAck,true);assert.equal(commands[0].periodId,'cinepolis-2026-09');
 context.CX_TYA_HR_LIVE_META.externalReadCurrent=false;assert.equal((await CX.data.reconcileHistoricalPayments(['v1'],'pending',{ackAware:true})).code,'HR_PERIOD_FRESH_READ_REQUIRED');assert.equal(commands.length,1);
});
