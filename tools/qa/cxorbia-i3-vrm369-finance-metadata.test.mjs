import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createFinanceCommandProvider} from '../../backend/runtime/cxorbia-finance-command-provider-v1.mjs';

const clone=value=>value===undefined?undefined:structuredClone(value);
const TENANT='qa-tenant',PROJECT='qa-project',PERIOD=PROJECT+'-2026-10',ID='qa-advance';
const movementPath=`tenants/${TENANT}/financialMovements/${ID}`;
const original={id:ID,tenantId:TENANT,projectId:PROJECT,periodId:PERIOD,tipo:'ingreso',tipoIngreso:'anticipo',amount:13,monto:13,country:'GT',pais:'GT',currency:'Q',moneda:'Q',fecha:'2026-10-01',cat:'QA program October',desc:'Original support note',sourceRef:'admin-entry:'+'a'.repeat(40),sourceStatus:'confirmed',updatedAt:'2026-10-18T15:41:01.210Z',revenueRecognized:false,operatingRevenue:false,externalPaymentConfirmed:false,qaOnly:true};
const policy={schemaVersion:'cxorbia.finance-command-provider-policy.v1',enabled:true,allowedTenantIds:[TENANT],allowedProjectIds:[PROJECT],conflictPolicy:'review_no_silent_overwrite',externalPaymentWrites:false,bankWrites:false,hrWrites:false};
class Snap{constructor(ref,value){this.ref=ref;this.id=ref.id;this.value=value;this.exists=value!==undefined;}data(){return clone(this.value);}}
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(name){return new Col(this.db,this.path+'/'+name);}async get(){return new Snap(this,this.db.store.get(this.path));}}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}}
class DB{
  constructor(){this.store=new Map();this.committedWrites=0;}
  collection(name){return new Col(this,name);}
  seed(path,value){this.store.set(path,clone(value));}
  async runTransaction(fn){
    const next=new Map([...this.store].map(([key,value])=>[key,clone(value)]));let writes=0;
    const tx={get:async ref=>{assert.equal(writes,0,'all Firestore transaction reads precede writes');return new Snap(ref,next.get(ref.path));},set:(ref,value,{merge=false}={})=>{writes++;next.set(ref.path,merge?{...clone(next.get(ref.path)),...clone(value)}:clone(value));},create:(ref,value)=>{assert(!next.has(ref.path));writes++;next.set(ref.path,clone(value));}};
    const result=await fn(tx);this.store=next;this.committedWrites+=writes;return result;
  }
}
function environment({row={},role='admin',member={},claims={}}={}){
  const db=new DB();db.seed(movementPath,{...original,...row});
  db.seed(`tenants/${TENANT}/projects/${PROJECT}`,{id:PROJECT,tenantId:TENANT,projectId:PROJECT,currency:{GT:'Q'}});
  db.seed(`tenants/${TENANT}/users/qa-admin`,{active:true,tenantId:TENANT,role,authNamespace:'staff',projectIds:[PROJECT],countries:['GT'],...member});
  const auth={async verifyIdToken(token,checkRevoked){assert.equal(token,'qa-token');assert.equal(checkRevoked,true);return {uid:'qa-admin',tenantId:TENANT,role,authNamespace:'staff',projectIds:[PROJECT],...claims};}};
  return {db,provider:createFinanceCommandProvider({auth,db,policy})};
}
function command(extra={}){
  return {version:'cxorbia-command-adapter-v1',commandType:'finance.movement.metadata.update',entityType:'financialMovement',entityId:ID,tenantId:TENANT,projectId:PROJECT,periodId:PERIOD,expectedVersion:original.updatedAt,idempotencyKey:'qa-metadata-stable-key',authorization:{providerEnforcementRequired:true,permission:'finance.movement.write'},payload:{periodId:PERIOD,patch:{cat:'QA program November',fecha:'2026-10-31'},reason:'Isolated metadata correction fixture',authorityRef:'qa-only-owner-confirmation'},...extra};
}
const facts=row=>Object.fromEntries(Object.entries(row).filter(([key])=>!['cat','fecha','desc','version','updatedAt','updatedBy','metadataCorrection'].includes(key)));

test('VRM-369 updates the same manual advance metadata after exact CAS, preserving every financial fact',async()=>{
  const {db,provider}=environment(),result=await provider.execute('qa-token',command());
  assert.equal(result.ok,true);assert.equal(result.providerAck,true);assert.equal(result.metadataOnly,true);assert.equal(result.amountsChanged,false);assert.equal(result.movementCreated,false);assert.equal(result.providerWrites,3);assert.equal(result.hrWrites,0);assert.equal(result.bankWrites,0);assert.equal(result.externalPaymentWrites,0);assert.equal(result.externalPaymentConfirmed,false);
  const after=db.store.get(movementPath);assert.equal(after.cat,'QA program November');assert.equal(after.fecha,'2026-10-31');assert.equal(after.desc,original.desc);assert.equal(after.version,1);assert.deepEqual(facts(after),facts(original));
  assert.equal([...db.store.keys()].filter(key=>key.includes('/financialMovements/')).length,1);
  assert.equal(after.metadataCorrection.authorityType,'USER_DECLARED_METADATA_CORRECTION');assert.equal(after.metadataCorrection.bankEvidenceConfirmed,false);
  const audit=[...db.store.entries()].find(([key])=>key.includes('/entityAuditTrail/'))[1];assert.equal(audit.beforeMetadata.fecha,'2026-10-01');assert.equal(audit.afterMetadata.fecha,'2026-10-31');assert.equal(audit.financialFactsSha256,result.financialFactsSha256);
});

test('VRM-369 transport replay returns the original receipt without another mutation; changed payload with same key is rejected',async()=>{
  const {db,provider}=environment(),cmd=command();const first=await provider.execute('qa-token',cmd),after=clone([...db.store]);
  const replay=await provider.execute('qa-token',clone(cmd));assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);assert.deepEqual(replay.movement,first.movement);assert.deepEqual([...db.store],after);assert.equal(db.committedWrites,3);
  const changed=command({payload:{...cmd.payload,patch:{cat:'Unapproved other concept'}}});const conflict=await provider.execute('qa-token',changed);assert.equal(conflict.ok,false);assert.match(conflict.code,/IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD/);assert.deepEqual([...db.store],after);
});

test('VRM-369 stale version blocks the entire transaction and never silently overwrites another editor',async()=>{
  const {db,provider}=environment({row:{version:4,cat:'Already edited elsewhere'}}),before=clone([...db.store]);
  const result=await provider.execute('qa-token',command());assert.equal(result.ok,false);assert.match(result.code,/EXPECTED_VERSION_CONFLICT/);assert.deepEqual([...db.store],before);assert.equal(db.committedWrites,0);
});

test('VRM-369 all unsupported fields and unbounded versions fail before writes',async t=>{
  const base=command();
  const variants=[
    ['amount',{payload:{...base.payload,patch:{amount:99}}}],['currency',{payload:{...base.payload,patch:{currency:'USD'}}}],['period',{payload:{...base.payload,patch:{periodId:'other'}}}],['payment',{payload:{...base.payload,patch:{externalPaymentConfirmed:true}}}],['classification',{payload:{...base.payload,patch:{tipoIngreso:'honorarios'}}}],['allocation',{payload:{...base.payload,patch:{accountId:'account'}}}],['source',{payload:{...base.payload,patch:{sourceRef:'other'}}}],
    ['extra-payload',{payload:{...base.payload,amount:99}}],['nested-period',{payload:{...base.payload,periodId:'other'}}],['no-authority',{payload:{...base.payload,authorityRef:''}}],['no-reason',{payload:{...base.payload,reason:''}}],['empty-patch',{payload:{...base.payload,patch:{}}}],['HTML',{payload:{...base.payload,patch:{cat:'<script>bad</script>'}}}],['invalid-date',{payload:{...base.payload,patch:{fecha:'2026-02-30'}}}],['missing-version',{expectedVersion:null}],['floating-version',{expectedVersion:'source-current'}],['new-record-version',{expectedVersion:'absent'}],['traversal',{entityId:'../other'}],['global',{projectId:null,requireProject:false,payload:{...base.payload,global:true}}]
  ];
  for(const [name,change] of variants)await t.test(name,async()=>{const {db,provider}=environment(),before=clone([...db.store]);const r=await provider.execute('qa-token',command(change));assert.equal(r.ok,false);assert.equal(r.providerWrites,0);assert.deepEqual([...db.store],before);});
});

test('VRM-369 metadata scope, origin, linked obligations and cash month are exact',async t=>{
  const cases=[['foreign-tenant',{tenantId:'other'}],['foreign-project',{projectId:'other'}],['foreign-period',{periodId:'qa-project-2026-09'}],['foreign-id',{id:'other'}],['global-row',{global:true}],['payment',{tipo:'egreso'}],['revenue',{tipoIngreso:'honorarios'}],['nonmanual',{sourceRef:'imported:unknown'}],['account',{accountId:'linked'}],['visit',{visitId:'linked'}],['lot',{loteId:'linked'}],['invalid-version',{version:'not-a-counter'}]];
  for(const [name,row] of cases)await t.test(name,async()=>{const {db,provider}=environment({row}),before=clone([...db.store]);const result=await provider.execute('qa-token',command({expectedVersion:row.version??original.updatedAt}));assert.equal(result.ok,false);assert.deepEqual([...db.store],before);assert.equal(db.committedWrites,0);});
  const {db,provider}=environment(),before=clone([...db.store]);const base=command();const r=await provider.execute('qa-token',command({payload:{...base.payload,patch:{fecha:'2026-11-01'}}}));assert.equal(r.ok,false);assert.match(r.code,/CASH_PERIOD_CONFLICT/);assert.deepEqual([...db.store],before);
});

test('VRM-369 missing target does not create a third advance',async()=>{
  const {db,provider}=environment();db.store.delete(movementPath);const before=clone([...db.store]);const r=await provider.execute('qa-token',command());assert.equal(r.ok,false);assert.match(r.code,/MOVEMENT_MISSING/);assert.deepEqual([...db.store],before);
});

test('VRM-369 claims plus durable membership authorize writes, never payload role alone',async t=>{
  const cases=[['shopper',{role:'shopper'}],['client',{role:'cliente'}],['ops',{role:'ops'}],['inactive',{member:{active:false}}],['claim-project',{claims:{projectIds:['other']}}],['member-project',{member:{projectIds:['other']}}],['country',{member:{countries:['HN']}}],['claim-tenant',{claims:{tenantId:'other'}}],['namespace',{claims:{authNamespace:'shopper'}}]];
  for(const [name,setup] of cases)await t.test(name,async()=>{const {db,provider}=environment(setup),before=clone([...db.store]);const r=await provider.execute('qa-token',command());assert.equal(r.ok,false);assert.equal(r.providerWrites,0);assert.deepEqual([...db.store],before);});
});

function browserBoundary(){
  const commands=[],CX={BACKEND:{enabled:true,enableCommandWrites:true,tenantId:TENANT},backendAuth:{context:()=>({authenticated:true,tenantId:TENANT,role:'admin',authNamespace:'staff',actorId:'qa-admin',projectIds:[PROJECT]})},session:{user:{id:'qa-admin',tenantId:TENANT,role:'admin',projectIds:[PROJECT]}},bus:{on(){},emit(){}},data:{ctx:()=>({tenantId:TENANT,projectId:PROJECT,periodId:PERIOD}),currentProjectId:PROJECT,currentPeriodId:PERIOD,__financialMovements:[clone(original)]}};
  const context={CX,console,document:{readyState:'complete'},setTimeout:()=>0,queueMicrotask:()=>{},addEventListener(){}};context.window=context;vm.createContext(context);
  for(const name of ['cxorbia-command-adapter-v1.js','cxorbia-cxdata-command-boundary-v1.js'])vm.runInContext(fs.readFileSync(new URL('../../app/adapters/'+name,import.meta.url),'utf8'),context);
  CX.commandAdapter.registerTransport('fixture',{execute:async command=>{commands.push(clone(command));return {ok:true,status:'committed',providerAck:true,successUiAllowed:true};}});CX.commandAdapter.useTransport('fixture');return {CX,commands};
}

test('VRM-369 browser boundary sends exact scope, original CAS and stable replay key with an ACK-aware caller',async()=>{
  const {CX,commands}=browserBoundary(),meta={ackAware:true,expectedVersion:original.updatedAt,idempotencyKey:'qa-fixed-replay',reason:'QA correction',authorityRef:'QA owner'};
  await CX.data.updateFinancialMovementMetadata(ID,{cat:'Program November'},meta);CX.data.__financialMovements[0].version=9;
  await CX.data.updateFinancialMovementMetadata(ID,{cat:'Program November'},meta);
  assert.equal(commands.length,2);assert.deepEqual(commands[0],commands[1]);assert.equal(commands[0].commandType,'finance.movement.metadata.update');assert.equal(commands[0].payload.periodId,PERIOD);assert.equal(commands[0].expectedVersion,original.updatedAt);assert.equal(commands[0].idempotencyKey,'qa-fixed-replay');
  const {provider}=environment();const result=await provider.execute('qa-token',commands[0]);assert.equal(result.ok,true,'boundary payload is accepted by the exact provider contract');
});

test('VRM-369 boundary rejects missing, duplicated and cross-scope cached rows without a command or local mutation',async()=>{
  const {CX,commands}=browserBoundary();for(const rows of [[],[original,original],[{...original,projectId:'other'}],[{...original,periodId:'other'}],[{...original,global:true}]]){CX.data.__financialMovements=clone(rows);const before=clone(rows);const r=await CX.data.updateFinancialMovementMetadata(ID,{cat:'X'},{ackAware:true});assert.equal(r.ok,false);assert.equal(commands.length,0);assert.deepEqual(CX.data.__financialMovements,before);}
});

const uiSource=fs.readFileSync(new URL('../../app/modules/finanzas.js',import.meta.url),'utf8');
const uiStart=uiSource.indexOf('function cxFinanceCommandCommitted('),uiEnd=uiSource.indexOf('/* R12:',uiStart);
const helpers=vm.runInNewContext(uiSource.slice(uiStart,uiEnd)+'\n({editable:cxFinanceMetadataEditable,readback:cxFinanceMetadataReadback});');

test('VRM-369 visible metadata action and readback reject duplicates, changed financial facts and unconfirmed replies',async()=>{
  const {provider}=environment(),cmd=command(),ack=await provider.execute('qa-token',cmd);const after=ack.movement;
  assert.equal(helpers.editable(original),true);assert.equal(helpers.editable({...original,accountId:'linked'}),false);assert.equal(helpers.readback(ack,[after],original,cmd.payload.patch),true);
  for(const changed of [{amount:14},{periodId:'other'},{sourceRef:'other'},{accountId:'new-link'},{externalPaymentConfirmed:true},{version:22}])assert.equal(helpers.readback(ack,[{...after,...changed}],original,cmd.payload.patch),false);
  assert.equal(helpers.readback({...ack,providerAck:false},[after],original,cmd.payload.patch),false);assert.equal(helpers.readback(ack,[after,after],original,cmd.payload.patch),false);assert.equal(helpers.readback(ack,[],original,cmd.payload.patch),false);
});

function readAdapter(metadata){
  const queries=[];class Query{where(){return this;}doc(){return this;}collection(){return this;}async get(options){queries.push(options);return {metadata,docs:[{id:ID,data:()=>clone(original)}]};}}
  const CX={BACKEND:{tenantId:TENANT},bus:{emit(){}}},context={CX,console:{warn(){}},firebase:{apps:[{}],firestore:()=>new Query()}};context.window=context;
  vm.runInNewContext(fs.readFileSync(new URL('../../app/core/backend-finance-benefits.js',import.meta.url),'utf8'),context);return {adapter:CX.backendFinanceBenefits,queries};
}
test('VRM-369 independent metadata readback forces server and rejects cache or pending writes',async()=>{
  for(const metadata of [{fromCache:false,hasPendingWrites:false},{fromCache:true,hasPendingWrites:false},{fromCache:false,hasPendingWrites:true},{}]){
    const {adapter,queries}=readAdapter(metadata),r=await adapter.getFinancialMovements({tenantId:TENANT,projectId:PROJECT,periodId:PERIOD,requireServerRead:true});assert.equal(queries[0]?.source,'server');assert.equal(r.status,metadata.fromCache===false&&metadata.hasPendingWrites===false?'ok':'error');if(r.status==='ok')assert.equal(r.serverConfirmed,true);
  }
});
test('VRM-369 runtime dispatches the additive command to the existing finance provider',()=>{
  const source=fs.readFileSync(new URL('../../backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs',import.meta.url),'utf8');const set=source.match(/const FINANCE_COMMANDS=new Set\((\[[^;]*?\])\)/);assert(set);const commands=vm.runInNewContext(set[1]);assert(commands.includes('finance.movement.metadata.update'));assert(commands.includes('finance.movement.create'));
});
