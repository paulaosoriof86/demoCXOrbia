import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const clientSource=fs.readFileSync(new URL('../../app/core/backend-certifications.js',import.meta.url),'utf8');
const certSource=fs.readFileSync(new URL('../../app/modules/cert.js',import.meta.url),'utf8');
const OCT='project-a-2026-10',NOV='project-a-2026-11',bankId='certbank-project-a-'+OCT;
const feedback=[{index:0,question:'Pregunta del proyecto',ok:false,selected:'B',correcta:'A',exp:'Explicación confirmada por servidor'}];
const attempt=(more={})=>({id:'attempt-one',recordType:'certification_attempt',tenantId:'tenant-a',
  projectId:'project-a',periodId:OCT,bankResourceId:bankId,shopperId:'shopper-one',score:0,gate:80,pass:false,
  providerAck:true,createdAt:'2026-11-06T10:00:00Z',feedback,...more});
const response=item=>({ok:true,committed:true,providerAck:true,item,score:item.score,gate:item.gate,pass:item.pass,feedback:item.feedback});
function harness({records=[],reply=response(attempt()),banks=[]}={}){
  const current={uid:'actor-one',shopperId:'shopper-one'};
  const cx={BACKEND:{enabled:true,tenantId:'tenant-a'},
    data:{currentProjectId:'project-a',currentPeriodId:OCT,__protectedCertifications:structuredClone(records),
      __protectedCertificationRecertifications:[],shoppers:[{id:'shopper-one'}],
      ctx(){return {tenantId:'tenant-a',projectId:this.currentProjectId,periodId:this.currentPeriodId};},
      period(){return {id:this.currentPeriodId,name:'Proyecto A'};}},
    session:{role:'shopper',user:{shopperId:'shopper-one'},effectiveRole(){return this.role;}},
    backendAuth:{context:()=>({shopperId:current.shopperId,projectIds:['project-a']})},
    backendResources:{list:()=>banks},dataSource:{showFixtures:()=>false},bus:{emit(){}},
    module(name,fn){if(name==='cert')this.renderCert=fn;}};
  const firebase={auth:()=>({currentUser:{uid:current.uid,getIdToken:async()=> 'memory-test-only'}})};
  const sandbox={CX:cx,firebase,console,crypto:webcrypto,TextEncoder,setTimeout:()=>0,
    fetch:async()=>({ok:true,json:async()=>typeof reply==='function'?await reply():reply})};
  sandbox.window=sandbox;
  vm.createContext(sandbox);vm.runInContext(clientSource,sandbox);vm.runInContext(certSource,sandbox);
  const ui={ph:(title,subtitle)=>title+' '+subtitle,bdg:x=>String(x),kpi:()=>'',degraded:x=>String(x),
    el(){return {innerHTML:'',querySelectorAll:()=>[],querySelector:()=>({addEventListener(){}})};}};
  const render=()=>{const out=cx.renderCert({role:'shopper',data:cx.data,ui});return typeof out==='string'?out:out.innerHTML;};
  return {cx,current,render};
}

test('VRM311 server ACK is in the view before remount; failed feedback survives another render and reload',async()=>{
  const row=attempt(),h=harness({banks:[{id:bankId,periodId:OCT,version:1,bank:{estado:'published',certificationId:'main',gate:80,preguntas:[{q:'Pregunta',ops:['A','B']}]}}]});
  assert.equal(h.cx.backendCertifications.attemptHistory('shopper-one').length,0);
  await h.cx.backendCertifications.submitAttempt({periodId:OCT,bankResourceId:bankId,answers:['B']});
  assert.equal(h.cx.data.__protectedCertifications.length,1);
  for(let i=0;i<2;i++){
    const html=h.render();assert.match(html,/0% · No alcanzado/);
    assert.match(html,/Explicación confirmada por servidor/);
    assert.match(html,/data-attempt-id="attempt-one"/);
  }
  const reloaded=harness({records:[row],banks:h.cx.backendResources.list()});
  assert.match(reloaded.render(),/Explicación confirmada por servidor/);
  assert.equal(reloaded.cx.backendCertifications.durableCurrent('shopper-one',{}),null);
});

test('VRM311 a missing or mismatched provider ACK never becomes a local result',async()=>{
  for(const reply of [{...response(attempt()),providerAck:false},response(attempt({projectId:'other'})),
    response(attempt({shopperId:'other'})),response(attempt({bankResourceId:'another-bank'}))]){
    const h=harness({reply});
    await assert.rejects(h.cx.backendCertifications.submitAttempt({periodId:OCT,bankResourceId:bankId,answers:['B']}));
    assert.equal(h.cx.data.__protectedCertifications.length,0);
  }
});

test('VRM311 an acknowledged replay does not duplicate history; a late response cannot enter a new project',async()=>{
  const h=harness();
  for(let i=0;i<2;i++)await h.cx.backendCertifications.submitAttempt({periodId:OCT,bankResourceId:bankId,answers:['B'],idempotencyKey:'same-key'});
  assert.equal(h.cx.data.__protectedCertifications.length,1);
  let resolve;const late=harness({reply:()=>new Promise(r=>{resolve=r;})});
  const pending=late.cx.backendCertifications.submitAttempt({periodId:OCT,bankResourceId:bankId,answers:['B']});
  await new Promise(r=>setImmediate(r));
  late.cx.data.currentProjectId='another-project';resolve(response(attempt()));await pending;
  assert.equal(late.cx.data.__protectedCertifications.length,0);
});

test('VRM312 an approved project attempt and both outcomes survive OCT/NOV/reload without a monthly expiry',()=>{
  const failed=attempt(),passed=attempt({id:'attempt-two',score:100,pass:true,createdAt:'2026-11-06T10:01:00Z',feedback:[{...feedback[0],ok:true,selected:'A'}]});
  const h=harness({records:[failed,passed]});
  for(const period of [OCT,NOV,OCT]){
    h.cx.data.currentPeriodId=period;
    assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}).id,'attempt-two');
    assert.equal(h.cx.backendCertifications.attemptHistory('shopper-one').length,2);
    const html=h.render();assert.match(html,/Certificación vigente/);assert.match(html,/attempt-one/);assert.match(html,/attempt-two/);
  }
  const reloaded=harness({records:[failed,passed]});reloaded.cx.data.currentPeriodId=NOV;
  assert.match(reloaded.render(),/Vigente para este proyecto entre periodos/);
  reloaded.cx.data.currentProjectId='another';
  assert.equal(reloaded.cx.backendCertifications.durableCurrent('shopper-one',{}),null);
  assert.equal(reloaded.cx.backendCertifications.attemptHistory('shopper-one').length,0);
});

test('VRM312 explicit expiration or later recertification changes eligibility while preserving history',()=>{
  const passed=attempt({pass:true,score:100,validUntil:'2000-01-01T00:00:00Z'});
  const h=harness({records:[passed]});
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}),null);
  delete h.cx.data.__protectedCertifications[0].validUntil;
  assert.ok(h.cx.backendCertifications.durableCurrent('shopper-one',{}));
  h.cx.data.__protectedCertificationRecertifications=[{scope:'one',projectId:'project-a',targetShopperIds:['shopper-one'],status:'active',createdAt:'2026-11-06T11:00:00Z'}];
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}),null);
  assert.equal(h.cx.backendCertifications.attemptHistory('shopper-one').length,1);
});

test('VRM312 bank selection keeps original resource identity even when logical names repeat',()=>{
  const make=(id,period)=>({id,periodId:period,version:2,bank:{estado:'published',certificationId:'main',certificationName:'Mismo nombre'}});
  const h=harness({banks:[make(bankId,OCT),make('certbank-project-a-'+NOV,NOV)]});
  const original=h.cx.certStore.bank(NOV,bankId);
  assert.equal(original.__resourceId,bankId);assert.equal(original.__resourcePeriodId,OCT);
  assert.throws(()=>h.cx.certStore.bank(NOV,'main'),/CERT_BANK_SELECTION_AMBIGUOUS/);
});

test('VRM312 editing an inherited bank addresses the original document and never creates a monthly copy',async()=>{
  const h=harness();h.cx.session.role='admin';h.cx.data.currentPeriodId=NOV;
  let captured;
  h.cx.backendResources.saveMetadata=async(item,options)=>{captured={item,options};return {providerAck:false};};
  await h.cx.certStore.save(NOV,{certificationId:'main',certificationName:'Banco del proyecto',estado:'pending_review',
    __resourceId:bankId,__resourcePeriodId:OCT,__resourceVersion:2},'main',{expectedResourceId:bankId});
  assert.equal(captured.item.id,bankId);assert.equal(captured.item.periodId,OCT);
  assert.equal(captured.options.periodId,OCT);
  assert.equal(captured.item.bank.__resourcePeriodId,undefined);
});


test('VRM311 failed history remains readable even when its bank is absent or back in review',()=>{
 for(const banks of [[],[{id:bankId,periodId:OCT,version:1,bank:{estado:'pending_review',certificationId:'main',preguntas:[{q:'Question',ops:['A','B']}]}}]]){
  const h=harness({records:[attempt()],banks});
  assert.match(h.render(),/data-attempt-id="attempt-one"/);
  assert.match(h.render(),/Explicación confirmada por servidor/);
 }
});


test('P0 pre-I4 projected historical evidence cannot grant present certification or visit execution',()=>{
  const h=harness();
  const bank={certificationId:'main'};
  const pending={id:'shopper-one',certificationEvidenceRecords:[{
    projectId:'project-a',sourceLegacyStatus:'approved',status:'pending_review',
    reviewRequired:true,carryoverConfirmed:false,eligibilityGranted:false,currentCertification:false
  }]};
  assert.equal(h.cx.backendCertifications.carryoverDecision(pending,bank,'project-a').eligibilityGranted,false);
  assert.equal(h.cx.backendCertifications.carryoverDecision(pending,bank,'project-a').state,'pending_review');
  const individuallyDenied=['reviewRequired','carryoverConfirmed','eligibilityGranted','currentCertification','status'];
  for(const key of individuallyDenied){
    const row={projectId:'project-a',sourceLegacyStatus:'approved'};
    row[key]=key==='reviewRequired'?true:key==='status'?'pending_review':false;
    const shopper={id:'shopper-one',certificationEvidenceRecords:[row]};
    assert.equal(h.cx.backendCertifications.carryoverDecision(shopper,bank,'project-a').eligibilityGranted,false,key);
  }
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',bank),null);
});

test('P0 valid historical approvals and durable passes survive the scoped fail-closed guard',()=>{
  const passed=attempt({id:'confirmed-qa',pass:true,score:100,createdAt:'2026-11-07T10:00:00Z'});
  const h=harness({records:[passed]});
  const accepted={id:'shopper-one',certificationEvidenceRecords:[{
    projectId:'project-a',sourceLegacyStatus:'approved',status:'confirmed',
    reviewRequired:false,carryoverConfirmed:true,eligibilityGranted:true,currentCertification:true
  }]};
  assert.equal(h.cx.backendCertifications.carryoverDecision(accepted,{},'project-a').eligibilityGranted,true);
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}).id,'confirmed-qa');
  assert.equal(h.cx.backendCertifications.carryoverDecision(accepted,{},'another-project').eligibilityGranted,false);
  h.cx.data.__protectedCertificationRecertifications.push({
    scope:'all',projectId:'project-a',status:'active',createdAt:'2026-11-07T11:00:00Z'
  });
  assert.equal(h.cx.backendCertifications.carryoverDecision(accepted,{},'project-a').eligibilityGranted,false);
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}),null);
});
