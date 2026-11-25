import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gitBlob} from './cxorbia-i3-current-control-projection.mjs';
import {createFinanceCommandProvider} from '../../backend/runtime/cxorbia-finance-command-provider-v1.mjs';
import {digest,prepareMetadataCommand,executeAdvanceMetadata,validateMetadataEnvironment} from './cxorbia-i3-finance-advance-metadata.mjs';
const sourcePlan=JSON.parse(fs.readFileSync(new URL('../../docs/checkpoints/CXORBIA_I3_NOVEMBER_ADVANCE_METADATA_SCOPE_20261124.json',import.meta.url),'utf8'));
const copy=v=>v===undefined?undefined:structuredClone(v);
class Snap{constructor(ref,value){this.ref=ref;this.id=ref.id;this.value=value;this.exists=value!==undefined;}data(){return copy(this.value);}}
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(name){return new Col(this.db,this.path+'/'+name);}async get(){return new Snap(this,this.db.store.get(this.path));}}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}}
class DB{
  constructor(){this.store=new Map();this.committedWrites=0;}
  collection(name){return new Col(this,name);}seed(path,value){this.store.set(path,copy(value));}
  async runTransaction(fn){const next=new Map([...this.store].map(([k,v])=>[k,copy(v)]));let writes=0;
    const tx={get:async ref=>{assert.equal(writes,0);return new Snap(ref,next.get(ref.path));},set:(ref,value,{merge=false}={})=>{writes++;next.set(ref.path,merge?{...copy(next.get(ref.path)),...copy(value)}:copy(value));},create:(ref,value)=>{assert(!next.has(ref.path));writes++;next.set(ref.path,copy(value));}};
    const result=await fn(tx);this.store=next;this.committedWrites+=writes;return result;}
}
const movement=id=>`tenants/tya/financialMovements/${id}`;
function fixture({dispatch=true}={}){
  const plan=copy(sourcePlan),db=new DB(),commands=[],privateRecords=[];
  const common={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10',tipo:'ingreso',tipoIngreso:'anticipo',amount:7300,monto:7300,country:'GT',pais:'GT',currency:'Q',moneda:'Q',fecha:'2026-10-01',cat:'Synthetic October advance',categoria:'Proyecto',estado:'Conciliado',sourceStatus:'confirmed',createdAt:'2026-10-01T00:00:00.000Z',updatedAt:'2026-11-24T12:00:00.000Z'};
  const first={...common,id:'qa-first',desc:'Synthetic first support',sourceRef:'admin-entry:'+'1'.repeat(40)};
  const second={...common,id:'qa-second',desc:'Synthetic second support',sourceRef:'admin-entry:'+'2'.repeat(40)};
  plan.commandDispatchAllowed=dispatch;plan.firstIdSha256=digest(first.id);plan.secondIdSha256=digest(second.id);plan.targetSourceRefSha256=digest(second.sourceRef);
  const pick=row=>Object.fromEntries(plan.expectedFactFields.map(k=>[k,row[k]??null]));
  plan.firstOriginalFactsSha256=digest(pick(first));plan.secondOriginalFactsSha256=digest(pick(second));
  plan.firstOriginalMetadataSha256=digest({cat:first.cat,fecha:first.fecha});plan.secondOriginalMetadataSha256=digest({cat:second.cat,fecha:second.fecha});
  db.seed(movement(first.id),first);db.seed(movement(second.id),second);
  db.seed('tenants/tya/financeAccounts/qa-account',{id:'qa-account',projectId:'cinepolis',balance:17,sourceMovementId:'unrelated'});
  db.seed('tenants/tya/projects/cinepolis',{id:'cinepolis',tenantId:'tya',projectId:'cinepolis',currency:{GT:'Q'}});
  db.seed('tenants/tya/users/qa-admin',{active:true,tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:['cinepolis'],countries:['GT']});
  const auth={async verifyIdToken(){return {uid:'qa-admin',tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:['cinepolis']};}};
  const provider=createFinanceCommandProvider({auth,db,policy:{schemaVersion:'cxorbia.finance-command-provider-policy.v1',enabled:true,allowedTenantIds:['tya'],allowedProjectIds:['cinepolis'],conflictPolicy:'review_no_silent_overwrite',externalPaymentWrites:false,bankWrites:false,hrWrites:false}});
  const readLedger=async()=>Object.fromEntries(Object.entries({movements:'financialMovements',accounts:'financeAccounts',lots:'paymentLots',reconciliations:'paymentReconciliations'}).map(([name,col])=>[name,[...db.store].filter(([p])=>p.startsWith('tenants/tya/'+col+'/')).map(([p,v])=>({...copy(v),docId:p.split('/').at(-1)}))]));
  const readReceipt=async id=>copy(db.store.get('tenants/tya/commandReceipts/'+id))||null;
  const sendCommand=async command=>{commands.push(copy(command));const body=await provider.execute('qa-token',command);return {ok:body.ok,body};};
  const recordPrivate=async(stage,data)=>privateRecords.push({stage,data:copy(data)});
  return {plan,db,first,second,commands,readLedger,readReceipt,sendCommand,recordPrivate,privateRecords};
}

test('same existing second advance uses freshly read CAS, protected provider ACK, independent readback and identical replay',async()=>{
  const f=fixture(),before=await f.readLedger();const result=await executeAdvanceMetadata(f);
  assert.equal(result.decision,'PASS_FINANCE_METADATA_SECOND_ADVANCE');assert.equal(result.advanceTotal,14600);assert.equal(result.newMovements,0);
  assert.equal(result.firstUnchanged,true);assert.equal(result.financialFactsUnchanged,true);assert.equal(result.sameLedgerTotal,true);assert.equal(result.idempotentReplay,true);
  assert.equal(f.commands.length,2);assert.deepEqual(f.commands[0],f.commands[1]);assert.equal(f.commands[0].expectedVersion,f.second.updatedAt);
  assert.deepEqual(f.commands[0].payload.patch,{cat:'Remesa de anticipo Noviembre Cinépolis',fecha:'2026-10-31'});
  assert.equal(f.commands[0].periodId,'cinepolis-2026-10');assert.equal(f.commands[0].entityId,'qa-second');assert.equal(f.db.committedWrites,3);
  const after=await f.readLedger();assert.equal(after.movements.length,2);assert.deepEqual(after.movements.find(x=>x.id==='qa-first'),before.movements.find(x=>x.id==='qa-first'));
  assert.deepEqual(after.accounts,before.accounts);assert.deepEqual(after.lots,before.lots);assert.deepEqual(after.reconciliations,before.reconciliations);
  assert.equal(after.movements.find(x=>x.id==='qa-second').desc,f.second.desc);assert.deepEqual(f.privateRecords.map(x=>x.stage),['prepared','committed','verified']);
});

test('a new process verifies an already committed exact receipt without another command or recreated movement',async()=>{
  const f=fixture();await executeAdvanceMetadata(f);const after=copy([...f.db.store]);
  const again=await executeAdvanceMetadata({...f,plan:{...f.plan,commandDispatchAllowed:false}});
  assert.equal(again.decision,'PASS_FINANCE_METADATA_ALREADY_APPLIED');assert.equal(again.providerCommandsExecuted,0);assert.equal(again.idempotentNoop,true);assert.equal(again.idempotentReplay,false);
  assert.equal(f.commands.length,2);assert.equal(f.db.committedWrites,3);assert.deepEqual([...f.db.store],after);
});

test('Make/HR provider HOLD prepares exact live CAS but performs zero command or Auth dispatch',async()=>{
  const f=fixture({dispatch:false}),before=copy([...f.db.store]);
  await assert.rejects(executeAdvanceMetadata(f),/PROVIDER_FAILURE:FINANCE_METADATA_CONFIGURE_REQUIRES_HR/);
  assert.equal(f.commands.length,0);assert.equal(f.db.committedWrites,0);assert.deepEqual([...f.db.store],before);
  assert.equal(f.privateRecords.length,1);assert.equal(f.privateRecords[0].data.command.expectedVersion,f.second.updatedAt);
  assert.equal(f.plan.commandDispatchAllowed,false);
});

test('authorized resume is bound to the exact successful current HR materialization receipt',()=>{
  assert.equal(sourcePlan.commandDispatchAllowed,true);assert.equal(sourcePlan.holdReason,null);
  const proof=sourcePlan.resumeEvidence,bytes=fs.readFileSync(proof.receiptPath),receipt=JSON.parse(bytes);
  assert.equal(gitBlob(bytes),proof.receiptGitBlob);assert.equal(receipt.runId,proof.runId);
  assert.equal(receipt.decision,'PASS_I3_GTHN_EXACT_DEV_MATERIALIZATION');assert.equal(receipt.sourceHostedExact,true);assert.equal(receipt.production,false);
  assert.equal(sourcePlan.authorization,'USER_ALREADY_AUTHORIZED_SECOND_ADVANCE_METADATA_CORRECTION');
  assert.equal(sourcePlan.financialFactWrites,false);assert.equal(sourcePlan.firstAdvanceWrites,0);assert.equal(sourcePlan.newMovements,0);
});

test('unexpected before-state changes stop before any provider command',async t=>{
  const cases=[['amount',{amount:7301}],['currency',{moneda:'USD'}],['cash month',{periodId:'cinepolis-2026-11'}],['description',{desc:'unexpected'}],['source',{sourceRef:'admin-entry:'+'f'.repeat(40)}],['concept',{cat:'unexpected'}],['date',{fecha:'2026-10-22'}],['link',{accountId:'linked'}],['ID alias',{id:'other'}]];
  for(const [name,patch] of cases)await t.test(name,async()=>{const f=fixture();f.db.seed(movement('qa-second'),{...f.second,...patch});await assert.rejects(executeAdvanceMetadata(f),/PERSISTENCE_FAILURE:FINANCE_METADATA_/);assert.equal(f.commands.length,0);assert.equal(f.db.committedWrites,0);});
  const first=fixture();first.db.seed(movement('qa-first'),{...first.first,desc:'changed first'});await assert.rejects(executeAdvanceMetadata(first),/BASELINE_FACT_DRIFT/);assert.equal(first.commands.length,0);
});

test('third matching advance is not guessed or replaced',async()=>{
  const f=fixture();f.db.seed(movement('qa-third'),{...f.second,id:'qa-third'});
  await assert.rejects(executeAdvanceMetadata(f),/UNEXPECTED_THIRD_ADVANCE/);assert.equal(f.commands.length,0);assert.equal(f.db.committedWrites,0);
});

test('missing exact target cannot create a substitute',async()=>{
  const f=fixture();f.db.store.delete(movement('qa-second'));await assert.rejects(executeAdvanceMetadata(f),/EXACT_DOCUMENT_REQUIRED/);assert.equal(f.commands.length,0);assert.equal(f.db.committedWrites,0);
});

test('CAS race is rejected by the real provider without silent overwrite or retry with a new version',async()=>{
  const f=fixture();const send=f.sendCommand;
  await assert.rejects(executeAdvanceMetadata({...f,sendCommand:async command=>{f.db.seed(movement('qa-second'),{...f.second,version:12});return send(command);}}),/PROVIDER_ACK/);
  assert.equal(f.commands.length,1);assert.equal(f.db.committedWrites,0);assert.equal(f.db.store.get(movement('qa-second')).cat,f.second.cat);
});

test('lost successful ACK never causes blind reapplication; a later exact receipt recheck is read only',async()=>{
  const f=fixture(),send=f.sendCommand;
  await assert.rejects(executeAdvanceMetadata({...f,sendCommand:async command=>{const r=await send(command);return {...r,body:{...r.body,providerAck:false}};}}),/PROVIDER_ACK/);
  assert.equal(f.commands.length,1);assert.equal(f.db.committedWrites,3);
  const recovered=await executeAdvanceMetadata(f);assert.equal(recovered.idempotentNoop,true);assert.equal(f.commands.length,1);assert.equal(f.db.committedWrites,3);
});

test('readback detects another-row drift before attempting replay',async()=>{
  const f=fixture(),read=f.readLedger;let reads=0;
  await assert.rejects(executeAdvanceMetadata({...f,readLedger:async()=>{const l=await read();if(++reads===2)l.movements.find(x=>x.id==='qa-first').desc='changed elsewhere';return l;}}),/BASELINE_FACT_DRIFT|FIRST_CHANGED/);
  assert.equal(f.commands.length,1);assert.equal(f.db.committedWrites,3,'control does not compensate by overwriting another row');
});

test('replay must preserve the entire ledger and allocation tables',async()=>{
  const f=fixture(),read=f.readLedger;let reads=0;
  await assert.rejects(executeAdvanceMetadata({...f,readLedger:async()=>{const l=await read();if(++reads===3)l.accounts[0].balance=99;return l;}}),/REPLAY_CHANGED_LEDGER/);
  assert.equal(f.commands.length,2);assert.equal(f.db.committedWrites,3);
});

test('a forged or unrelated prior receipt is never sufficient to skip the target correction',async()=>{
  const f=fixture(),prepared=prepareMetadataCommand(await f.readLedger(),f.plan);
  f.db.seed('tenants/tya/commandReceipts/'+prepared.receiptId,{status:'committed',entityId:'other',providerAck:true});
  await assert.rejects(executeAdvanceMetadata(f),/PRIOR_RECEIPT_CONFLICT/);assert.equal(f.commands.length,0);assert.equal(f.db.committedWrites,0);
});

test('execution scope binds to current DEV source, exact branch and frozen production boundary',async t=>{
  const plan=fixture().plan,sha='a'.repeat(40),tree='b'.repeat(40);
  const base={plan,descriptor:{branch:'recovery/cxorbia-phase-a-20260831',productSourceSha:sha,productTreeAuthority:tree,currentMaterialization:{sourceSha:sha,sourceTree:tree,sourceHostedExact:true,hrLiveVerified:true,production:false}},current:{production:'DO_NOT_TOUCH',authorizationI4:false},source:sha,tree,project:'cxorbia-backend-dev',host:'https://cxorbia-backend-dev.web.app',branch:'recovery/cxorbia-phase-a-20260831',mode:'APPLY_NOV_ADVANCE_METADATA'};
  assert.equal(validateMetadataEnvironment(base),true);
  for(const [name,patch] of [['prod project',{project:'tya-plataforma'}],['prod host',{host:'https://tya-plataforma.web.app'}],['source',{source:'c'.repeat(40)}],['tree',{tree:'d'.repeat(40)}],['branch',{branch:'main'}],['mode',{mode:'READONLY_SEP_ADVANCES'}],['emulator',{emulator:'localhost:8080'}],['production authorization',{current:{production:'DO_NOT_TOUCH',authorizationI4:true}}]])await t.test(name,()=>assert.throws(()=>validateMetadataEnvironment({...base,...patch}),/FAILURE:FINANCE_METADATA_/));
});

test('approved patch cannot be widened to amount, source, description or another date',async()=>{
  const f=fixture();for(const patch of [{...f.plan.patch,amount:1},{...f.plan.patch,desc:'new'},{...f.plan.patch,sourceRef:'other'},{...f.plan.patch,fecha:'2026-11-01'}])await assert.rejects(async()=>prepareMetadataCommand(await f.readLedger(),{...f.plan,patch}),/APPROVED_PATCH/);
});

test('runner dispatch stays in its existing finance job, is below 510000 bytes, and no direct Firestore writer is added',()=>{
  const workflow=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');assert(Buffer.byteLength(workflow)<510000);
  const block=workflow.slice(workflow.indexOf('  i3-finance-focal-reproof:'),workflow.indexOf('  vrm085-postulation-sync-diagnostic:'));
  assert(block.includes('[i3-finance-metadata]'));assert(block.includes('APPLY_NOV_ADVANCE_METADATA'));assert(block.includes('.tmp/i3-finance-focal/metadata'));
  assert.equal((workflow.match(/i3-finance-focal-reproof:/g)||[]).length,1);
  const source=fs.readFileSync(new URL('./cxorbia-i3-finance-advance-metadata.mjs',import.meta.url),'utf8');assert(!/\.runTransaction\s*\(|\.batch\s*\(|\btx\.|\.collection\([^\n]+\)\.(?:add|set|update|delete)\s*\(/.test(source));
  const runner=fs.readFileSync('tools/qa/cxorbia-prei4-final-focal-finance-live.mjs','utf8');assert(runner.indexOf('runAdvanceMetadata(')<runner.indexOf('\nrunC01ConciliarIfRequired();'));
  assert(source.indexOf('fail(plan.commandDispatchAllowed===true')<source.indexOf('const firstResponse=await sendCommand(command)'));
});
