import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {execFileSync} from 'node:child_process';

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

test('D06 QA turnover: retired bank plus scoped recertification permits a new attempt without erasing the old one',()=>{
  const prior=attempt({id:'qa-old-pass',pass:true,score:100,createdAt:'2026-11-06T10:00:00Z'});
  const oldBank={id:bankId,periodId:OCT,status:'active',version:3,
    bank:{estado:'published',certificationId:'qa-old',contentRevision:'qa-old-revision',required:true,
      preguntas:[{q:'Old QA question',ops:['A','B']}]}};
  const newBankId='certbank-project-a-'+NOV+'-qa-new';
  const replacement={id:newBankId,periodId:NOV,status:'active',version:1,
    bank:{estado:'published',certificationId:'qa-new',contentRevision:'qa-new-revision',required:true,
      preguntas:[{q:'New QA question',ops:['C','D']}]}};
  const banks=[oldBank],h=harness({records:[prior],banks});
  h.cx.data.__sessionShopperProfile={id:'shopper-one',certificationEvidenceRecords:[]};
  assert.equal(h.cx.backendCertifications.sessionDecision(h.cx.certStore.bank(OCT)).done,true);

  // D05's provider-tested retire operation tombstones the old bank. Its active
  // resource projection now returns only the new, independently published bank.
  oldBank.status='deleted';oldBank.bank.estado='withdrawn';banks.splice(0,1,replacement);
  h.cx.data.currentPeriodId=NOV;
  assert.equal(h.cx.certStore.bank(NOV).__resourceId,newBankId);
  h.cx.data.__protectedCertificationRecertifications=[{id:'qa-recert',scope:'one',
    projectId:'project-a',targetShopperIds:['shopper-one'],status:'active',
    createdAt:'2026-11-06T11:00:00Z',providerAck:true}];
  const pending=h.cx.backendCertifications.sessionDecision(h.cx.certStore.bank(NOV));
  assert.equal(pending.done,false,'Old QA result cannot grant new eligibility after recertification');
  assert.equal(pending.required,true);
  assert.equal(h.cx.backendCertifications.attemptHistory('shopper-one').length,1,
    'The old result remains as an auditable record');

  const renewed=attempt({id:'qa-new-pass',bankResourceId:newBankId,periodId:NOV,
    pass:true,score:100,createdAt:'2026-11-06T12:00:00Z'});
  h.cx.data.__protectedCertifications.push(renewed);
  assert.equal(h.cx.backendCertifications.sessionDecision(h.cx.certStore.bank(NOV)).done,true);
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',replacement.bank).id,'qa-new-pass');
  const reload=harness({records:h.cx.data.__protectedCertifications,banks:[replacement]});
  reload.cx.data.currentPeriodId=NOV;
  reload.cx.data.__sessionShopperProfile={id:'shopper-one',certificationEvidenceRecords:[]};
  reload.cx.data.__protectedCertificationRecertifications=h.cx.data.__protectedCertificationRecertifications;
  assert.equal(reload.cx.backendCertifications.sessionDecision(reload.cx.certStore.bank(NOV)).done,true);
  assert.equal(reload.cx.backendCertifications.attemptHistory('shopper-one').length,2);
  reload.cx.data.currentProjectId='other-project';
  assert.equal(reload.cx.backendCertifications.durableCurrent('shopper-one',replacement.bank),null);
});

test('D06 recertification lists every project shopper, including QA identities beyond position forty',()=>{
  const h=harness();
  const shoppers=Array.from({length:191},(_,index)=>({id:'shopper-'+index,nombre:'Auditor '+index,code:'GT-'+index}));
  const qa={id:'qa-shopper',nombre:'Shopper I3.8 DEV Validation',code:'TYA_GT_QA'};
  h.cx.data.shoppersFor=()=>[...shoppers,qa,qa];
  const candidates=h.cx.certStore.recertificationCandidates(h.cx.data);
  assert.equal(candidates.length,192,'No hidden first-forty limit or duplicated exact IDs');
  assert.ok(candidates.some(s=>s.id===qa.id));
  assert.deepEqual({...h.cx.certStore.recertificationTarget('one',qa.id,candidates)},
    {scope:'one',shopperId:qa.id});
  assert.throws(()=>h.cx.certStore.recertificationTarget('one','',candidates),/RECERT_SHOPPER_SELECTION_REQUIRED/);
  assert.throws(()=>h.cx.certStore.recertificationTarget('one','shopper-from-other-project',candidates),/RECERT_SHOPPER_SELECTION_REQUIRED/);
  assert.throws(()=>h.cx.certStore.recertificationTarget('unexpected',qa.id,candidates),/RECERT_SCOPE_INVALID/);
  assert.deepEqual({...h.cx.certStore.recertificationTarget('all','',candidates)},
    {scope:'all',shopperId:''});
});

test('D06 recertification and Shoppers use the same active project identities, excluding durable retirements',()=>{
  const h=harness();
  const active=Array.from({length:192},(_,index)=>({id:'shopper-'+index,nombre:'Shopper '+index,status:'active'}));
  const retired={id:'retired-shopper',nombre:'Retired identity',identityState:'retired_by_admin'};
  const superseded={id:'superseded-shopper',nombre:'Superseded identity',identityState:'superseded_exact_alias'};
  const retiredStatus={id:'status-retired',nombre:'Retired status',status:'retired'};
  h.cx.data.shoppersFor=()=>[...active,retired,superseded,retiredStatus];
  const visible=h.cx.data.shoppersFor().filter(x=>!['retired_by_admin','superseded_exact_alias'].includes(String(x.identityState||''))&&String(x.status||'').toLowerCase()!=='retired');
  const eligible=h.cx.certStore.recertificationCandidates(h.cx.data);
  assert.equal(visible.length,192);
  assert.equal(eligible.length,visible.length,'No retired profile may inflate a recertification list');
  assert.deepEqual(eligible.map(x=>x.id).sort(),visible.map(x=>x.id).sort());
  for(const old of [retired,superseded,retiredStatus])
    assert.throws(()=>h.cx.certStore.recertificationTarget('one',old.id,eligible),/RECERT_SHOPPER_SELECTION_REQUIRED/);
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
  const unconfirmed={id:'shopper-one',certificationEvidenceRecords:[{
    projectId:'project-a',sourceLegacyStatus:'approved'
  }]};
  assert.equal(h.cx.backendCertifications.carryoverDecision(unconfirmed,bank,'project-a').eligibilityGranted,false,
    'An unreviewed legacy approval cannot independently grant execution rights');
  for(const omitted of ['carryoverConfirmed','eligibilityGranted','currentCertification']){
    const row={projectId:'project-a',sourceLegacyStatus:'approved',status:'confirmed',
      carryoverConfirmed:true,eligibilityGranted:true,currentCertification:true};
    delete row[omitted];
    assert.equal(h.cx.backendCertifications.carryoverDecision({id:'shopper-one',certificationEvidenceRecords:[row]},bank,'project-a').eligibilityGranted,false,
      'Positive adjudication must be explicit: '+omitted);
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

test('VRM316 R3 every Shopper view shares the protected canonical certification decision',()=>{
  const h=harness();
  // The HR-facing row may still carry a separately adjudicated legacy record.
  // The authenticated protected profile is the identical identity source used by Certificación.
  h.cx.data.shoppers=[{id:'shopper-one',certificationEvidenceRecords:[{
    projectId:'project-a',sourceLegacyStatus:'approved',status:'confirmed',
    reviewRequired:false,carryoverConfirmed:true,eligibilityGranted:true,currentCertification:true
  }]}];
  h.cx.data.getShopper=id=>h.cx.data.shoppers.find(x=>x.id===id)||null;
  h.cx.data.__sessionShopperProfile={id:'shopper-one',certificationEvidenceRecords:[]};
  const selectedPublished={certificationId:'main',estado:'published',required:true};
  const resolved=h.cx.backendCertifications.sessionDecision(selectedPublished);
  assert.equal(resolved.shopperId,'shopper-one');
  assert.equal(resolved.durable,null);
  assert.equal(resolved.carry.eligibilityGranted,false);
  assert.equal(resolved.done,false);
  assert.equal(resolved.required,true);
  const bothViews=['../../app/modules/midia.js','../../app/modules/misvisitas.js'];
  for(const path of bothViews){
    const source=fs.readFileSync(new URL(path,import.meta.url),'utf8');
    assert.match(source,/backendCertifications\?\.sessionDecision/);
    assert.doesNotMatch(source,/window\.CX_CERT_SELECTED_ID\|\|'main'/,
      'The selected certification resource must match the exact bank shown to the shopper');
  }
});

test('VRM316 R3 a missing project on a historical attempt never grants current project rights',()=>{
  const h=harness({records:[attempt({pass:true,projectId:undefined})]});
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}),null);
  const actual=harness({records:[attempt({pass:true,score:100})]});
  assert.equal(actual.cx.backendCertifications.durableCurrent('shopper-one',{}).pass,true);
});

test('VRM316 R4 an HR-facing historical positive never substitutes for the authenticated protected profile',()=>{
  const h=harness(),positive={projectId:'project-a',sourceLegacyStatus:'approved',status:'confirmed',
    reviewRequired:false,carryoverConfirmed:true,eligibilityGranted:true,currentCertification:true};
  h.cx.data.shoppers=[{id:'shopper-one',certificationEvidenceRecords:[positive]}];
  h.cx.data.getShopper=id=>h.cx.data.shoppers.find(s=>s.id===id)||null;
  const bank={certificationId:'main',estado:'published',required:true};
  assert.equal(h.cx.backendCertifications.sessionDecision(bank).done,false,
    'HR-only positive is not a protected, current certification decision');
  h.cx.data.__sessionShopperProfile={id:'another-shopper',certificationEvidenceRecords:[positive]};
  assert.equal(h.cx.backendCertifications.sessionDecision(bank).done,false,
    'A protected profile of another identity never authorizes this Shopper');
  h.cx.data.__sessionShopperProfile={id:'shopper-one',certificationEvidenceRecords:[positive]};
  assert.equal(h.cx.backendCertifications.sessionDecision(bank).done,true,
    'An exact protected, explicitly approved historical carryover remains valid');
});

test('VRM316 R4 a passing flag without durable provider ACK, type or tenant cannot grant certification',()=>{
  for(const changed of [{providerAck:false},{recordType:'legacy_approval'},{tenantId:'other-tenant'}]){
    const h=harness({records:[attempt({pass:true,score:100,...changed})]});
    assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}),null,
      'Fail closed for '+JSON.stringify(changed));
  }
  const valid=harness({records:[attempt({pass:true,score:100})]});
  assert.ok(valid.cx.backendCertifications.durableCurrent('shopper-one',{}),
    'The exact provider-acknowledged attempt still counts');
});

test('VRM316 R4 required means policy obligation, while done means a separately proven completion',()=>{
  const h=harness({records:[attempt({pass:true,score:100})]}),bank={estado:'published',required:true};
  const resolved=h.cx.backendCertifications.sessionDecision(bank);
  assert.equal(resolved.done,true);
  assert.equal(resolved.required,true,'A valid completion does not mean certification was optional');
  const source=fs.readFileSync(new URL('../../app/modules/misvisitas.js',import.meta.url),'utf8');
  assert.match(source,/note:certState\.explicitlyNotRequired\?'No requerida':''/);
  assert.doesNotMatch(source,/note:certState\.required\?'':'No requerida'/);
});

test('I3 P0: passing one published certification bank never grants another bank in the same project',()=>{
  const otherBankId='certbank-project-a-'+NOV+'-second-certification';
  const passed=attempt({id:'real-pass-1',score:100,pass:true,status:'certified',eligibilityGranted:true,
    currentCertification:true,bankResourceId:bankId});
  const banks=[
    {id:bankId,periodId:OCT,version:1,bank:{estado:'published',certificationId:'first',required:true,preguntas:[{q:'Q1',ops:['A','B']}]}},
    {id:otherBankId,periodId:NOV,version:1,bank:{estado:'published',certificationId:'second',required:true,preguntas:[{q:'Q2',ops:['A','B']}]}}
  ];
  const h=harness({records:[passed],banks});
  h.cx.data.__sessionShopperProfile={id:'shopper-one',certificationEvidenceRecords:[]};
  const first=h.cx.certStore.bank(OCT,bankId),second=h.cx.certStore.bank(NOV,otherBankId);
  assert.equal(h.cx.backendCertifications.sessionDecision(first).done,true);
  assert.equal(h.cx.backendCertifications.sessionDecision(second).done,false,
    'An attempt on the first bank cannot complete a distinct second certification');
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',second),null);
  assert.equal(h.cx.backendCertifications.attemptHistory('shopper-one').length,1);
});

test('I3 P0: a voided test attempt remains in history but never grants visits or certification',()=>{
  const voided=attempt({id:'qa-voided',score:100,pass:true,status:'voided_test',
    eligibilityGranted:false,currentCertification:false,voidedAt:'2026-11-08T18:00:00Z'});
  const banks=[{id:bankId,periodId:OCT,version:1,
    bank:{estado:'published',certificationId:'main',required:true,preguntas:[{q:'Q',ops:['A','B']}]}}];
  const h=harness({records:[voided],banks});
  h.cx.data.__sessionShopperProfile={id:'shopper-one',certificationEvidenceRecords:[]};
  assert.equal(h.cx.backendCertifications.sessionDecision(h.cx.certStore.bank(OCT)).done,false);
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',h.cx.certStore.bank(OCT)),null);
  assert.match(h.render(),/Anulado \(prueba\)/);
  assert.match(h.render(),/no habilita visitas ni cuenta como certificación vigente/);
  assert.equal(h.cx.backendCertifications.attemptHistory('shopper-one').length,1);
});

test('I3 P0: an audited void with exact provider readback replaces one view item and preserves other attempts',async()=>{
  const id='attempt-'+'a'.repeat(28),prior=attempt({id,pass:true,score:100,status:'certified',
    eligibilityGranted:true,currentCertification:true});
  const untouched=attempt({id:'untouched',pass:true,score:100,shopperId:'another'});
  const item={...prior,status:'voided_test',eligibilityGranted:false,currentCertification:false,
    voidReceiptId:'cert-test-void-receipt',voidedAt:'2026-11-08T18:00:00Z'};
  const reply={ok:true,committed:true,providerAck:true,readbackVerified:true,item,
    receipt:{id:item.voidReceiptId,providerAck:true,commandType:'certification.void_test_attempt'}};
  const h=harness({records:[prior,untouched],reply});
  await h.cx.backendCertifications.voidTestAttempt({attemptId:id,shopperId:prior.shopperId,
    bankResourceId:bankId,expectedCreatedAt:prior.createdAt,reason:'Prueba sintética DEV documentada',confirmation:'ANULAR PRUEBA'});
  assert.equal(h.cx.data.__protectedCertifications.length,2);
  assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}),null);
  assert.equal(h.cx.data.__protectedCertifications.find(x=>x.id==='untouched').pass,true);
  assert.equal(h.cx.backendCertifications.attemptHistory('shopper-one').length,1);
});

test('I3 P0: rejected or mismatched void ACK never locally revokes the prior certification',async()=>{
  const id='attempt-'+'b'.repeat(28),prior=attempt({id,pass:true,score:100,status:'certified',
    eligibilityGranted:true,currentCertification:true});
  const item={...prior,status:'voided_test',eligibilityGranted:false,currentCertification:false,
    voidReceiptId:'receipt-1',voidedAt:'2026-11-08T18:00:00Z'};
  for(const reply of [{ok:false,providerAck:false},{ok:true,committed:true,providerAck:true,readbackVerified:false,item},
    {ok:true,committed:true,providerAck:true,readbackVerified:true,item:{...item,projectId:'foreign'},
      receipt:{id:'receipt-1',providerAck:true,commandType:'certification.void_test_attempt'}}]){
    const h=harness({records:[prior],reply});
    await assert.rejects(h.cx.backendCertifications.voidTestAttempt({attemptId:id,shopperId:prior.shopperId,
      bankResourceId:bankId,expectedCreatedAt:prior.createdAt,reason:'Prueba sintética DEV documentada',
      confirmation:'ANULAR PRUEBA'}));
    assert.equal(h.cx.backendCertifications.durableCurrent('shopper-one',{}).id,id);
  }
});

test('I3 P0 backend test-void protocol: five isolated provider scenarios pass before any DEV write',()=>{
  const backendTest=new URL('../../backend/runtime/hr-live-service/test/certification-attempt-void-test.test.mjs',import.meta.url);
  const stdout=execFileSync(process.execPath,['--test','--test-reporter=tap',backendTest.pathname],{encoding:'utf8',
    timeout:30000,maxBuffer:1024*1024,env:{...process.env,NODE_TEST_CONTEXT:undefined}});
  assert.match(stdout,/^# tests 5$/m);
  assert.match(stdout,/^# pass 5$/m);
  assert.match(stdout,/^# fail 0$/m);
});
