import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {E10,exactPendingRules,validateRulesSeal,validateMakeAdmission,coldReaderMinimum} from '../release/cxorbia-i3-e10-rules-contract.mjs';
import {pairedRules} from '../release/cxorbia-corte6-firestore-rules-deploy.mjs';
import {resolveExcelOriginalProjectPlan} from '../../backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs';

const id='389c0a19-f9fd-4f7f-b0d2-4a5d16c9fe87';
const newName='projects/cxorbia-backend-dev/rulesets/74a3c83c-f114-4074-8377-b8a0cd3cdb9f';
const nativeGit=(...args)=>execFileSync('git',args,{encoding:'utf8'});
const priorBytes=nativeGit('show',E10.predecessor+':firestore.rules');
const targetBytes=nativeGit('show',E10.source+':firestore.rules');

test('all five strict observations account for the first inventory of each workbook',()=>{
  const options={projectId:'fixture',timeZone:'America/Guatemala',now:new Date('2026-11-27T06:01:39Z'),
    countryPeriods:Array.from({length:2},()=>['fixture-2026-10','fixture-2026-11']),probeCount:5};
  const plan=coldReaderMinimum(options);
  assert.deepEqual(plan,{inventoryCalls:2,rangeCalls:4,firstProbeCalls:6,minimumCalls:22});
  const debit=coldInstances=>(options.probeCount*plan.rangeCalls+coldInstances*plan.inventoryCalls)*3;
  assert.deepEqual([1,2,3,4,5].map(debit),[66,72,78,84,90]);
  assert.equal(coldReaderMinimum({...options,countryPeriods:[
    ['fixture-2026-10','fixture-2026-11','fixture-2026-12'],['fixture-2026-10','fixture-2026-11']
  ]}).minimumCalls,26);
});

test('the product resolver reproduces the paid call floor across one to five cold processes',async()=>{
  const scope={tenantId:'test',projectId:'fixture'},countries=['GT','HN'],now=new Date('2026-11-27T06:01:39Z');
  const source={mode:'external',providerType:'excel_online',readPolicy:'external_live',writePolicy:'external_read_only',periodDiscovery:'provider_auto',
    countryBindings:countries.map(countryCode=>({countryCode,providerBindingId:'qa-'+countryCode,mappingRef:'qa-map'}))};
  const records=new Map([['tenants/test/projects/fixture',{...scope,name:'QA window',countries,operationalSource:source}]]);
  for(const binding of source.countryBindings){
    const periods=['2026-10','2026-11'];
    records.set('tenants/test/integrationSettings/'+binding.providerBindingId,{...scope,...binding,
      enabled:true,hrWritesEnabled:false,providerType:source.providerType,readPolicy:source.readPolicy,writePolicy:source.writePolicy,
      driveId:'drive',itemId:'book-'+binding.countryCode,periodSheets:periods.map(p=>({periodId:'fixture-'+p,
        worksheetId:binding.countryCode+'-'+p,worksheetName:p}))});
  }
  const db={doc:key=>({get:async()=>({exists:records.has(key),data:()=>records.get(key),updateTime:{seconds:1,nanoseconds:0}})})};
  const totals=[];
  for(let cold=1;cold<=5;cold++){
    let calls=0;
    const processes=Array.from({length:cold},()=>new Map());
    for(let phase=0;phase<5;phase++){
      const plan=await resolveExcelOriginalProjectPlan({db,scope,now,inventoryCache:processes[phase%cold],
        readInventory:async binding=>{
          calls++;
          const row=records.get('tenants/test/integrationSettings/'+binding.privateProvider.providerBindingId);
          return {complete:true,inventoryHash:'b'.repeat(64),worksheets:row.periodSheets.map(s=>({id:s.worksheetId,name:s.worksheetName,visibility:'Visible'}))};
        }});
      assert.equal(plan.bindings.length,4);
      for(const binding of plan.bindings)calls+=binding.privateProvider.worksheets.length;
    }
    totals.push(calls*3);
  }
  assert.deepEqual(totals,[66,72,78,84,90]);
});

function fixture(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-e10-rules-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  fs.writeFileSync(path.join(root,'firestore.rules'),targetBytes);
  const observation={sourceSha:E10.source,sourceTree:E10.tree,organizationId:4090072,automaticPurchasing:false,
    unusedCenticredits:'16000',hrReadAllowance:60,restorationReserve:100,f3Debit:0,concurrentWriter:false,observedAt:new Date().toISOString()};
  const pending={sourceSha:E10.source,sourceTree:E10.tree,predecessorProductSourceSha:E10.predecessor,scope:'RUNTIME_AND_HOSTING',
    rulesDeploys:1,storageRulesDeploys:0,rulesAuthority:{path:E10.authorityPath,gitBlob:E10.authorityBlob},
    makeEconomicControl:{state:'READY',readerScenarioId:10200465,runId:id,source:E10.source},
    makeAdmission:{path:'docs/checkpoints/CXORBIA_I3_E10_MAKE_ADMISSION.json',gitBlob:'c'.repeat(40)}};
  const descriptor={pendingDevSuccessor:pending,postDeployRunSeal:{receiptBlob:'a'.repeat(40)},currentMaterialization:{
    sourceSha:E10.predecessor,runtimeRevision:'cxorbia-live-hr-dev-00395-lnc',hostingVersion:'sites/cxorbia-backend-dev/versions/e9a216661b686246'}};
  const backend={live:E10.prior,storage:E10.storage,creates:0,patches:0,allow:true,objects:new Map()};
  const env={PROJECT:E10.project,FOCAL_SOURCE:E10.source,FOCAL_TREE:E10.tree,CXORBIA_PAIRED_BUILD_ID:id,SOURCE_DIR:root,FOCAL_OUT:root};
  const git=(op,arg)=>{
    if(arg==='HEAD:CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json')return JSON.stringify(descriptor);
    if(arg==='HEAD:'+pending.makeAdmission.path)return op==='show'?JSON.stringify(observation):pending.makeAdmission.gitBlob;
    return nativeGit(op,arg);
  };
  const cloud=(tool,command,...args)=>{
    if(tool==='builds')return JSON.stringify({id,status:'WORKING',projectId:E10.project,substitutions:{
      _CXORBIA_SCOPE:'I3_PAIRED_DEV',_CXORBIA_SOURCE_SHA:E10.source,_CXORBIA_SOURCE_TREE:E10.tree,
      _CXORBIA_CONTROL_SHA:nativeGit('rev-parse','HEAD').trim(),_CXORBIA_PREDECESSOR_BLOB:descriptor.postDeployRunSeal.receiptBlob}});
    if(tool==='auth')return 'synthetic';
    if(tool==='storage' && command==='cp'){
      assert.equal(args[0],'--if-generation-match=0');
      if(backend.objects.has(args[2]))throw Error('generation-precondition');
      backend.objects.set(args[2],fs.readFileSync(args[1],'utf8'));return '';
    }
    if(tool==='storage' && command==='cat')return backend.objects.get(args[0])?.trim();
    throw Error('Unexpected operation');
  };
  const request=async(_token,method,url,body)=>{
    if(url.startsWith('https://storage.googleapis.com/storage/'))return {ok:true,payload:backend.exposed?{items:[{name:'cxorbia-i3-paired-dev/results/'+id+'/runtime-transition-intent.json'}]}:{}};
    if(url.endsWith('/documents:runQuery'))return {ok:true,payload:backend.imported?[{document:{name:'synthetic'}}]:[{readTime:new Date().toISOString()}]};
    let payload;
    if(url.endsWith(':testIamPermissions'))payload={permissions:backend.allow?body.permissions:[]};
    else if(method==='GET' && url.endsWith(E10.release))payload={rulesetName:backend.live};
    else if(method==='GET' && url.includes('/rulesets/'))payload={source:{files:[{name:'firestore.rules',content:
      url.endsWith(E10.prior)?priorBytes:targetBytes}]}};
    else if(method==='GET' && url.includes('releases?'))payload={releases:[{name:'projects/'+E10.project+'/releases/firebase.storage/test',rulesetName:backend.storage}]};
    else if(method==='POST' && url.endsWith('/rulesets')){assert.equal(body.source.files[0].content,targetBytes);backend.creates++;payload={name:newName};}
    else if(method==='PATCH' && url.endsWith(E10.release)){backend.patches++;backend.live=body.release.rulesetName;payload={rulesetName:backend.live};}
    else throw Error('Unexpected rules operation');
    return {ok:true,payload};
  };
  return {env,observation,pending,backend,git,run:action=>pairedRules(action,{env,cloud,git,request,bindPaidReaderWindow:async()=>{}})};
}
test('one planned release, independent seal, exact rollback and no duplicate forward',async t=>{
  const f=fixture(t);await f.run('preflight');assert.equal(f.backend.objects.size,0);
  await f.run('apply');await f.run('verify');
  const proof=JSON.parse(fs.readFileSync(path.join(f.env.FOCAL_OUT,'e10-rules-readback.json')));
  const result={executionProvider:'GOOGLE_CLOUD_BUILD',sourceSha:E10.source,sourceTree:E10.tree,storageRulesDeploys:0,
    firestoreRulesDeploys:1,firestoreRuleset:newName,firestoreRulesTransition:proof};
  assert.equal(validateRulesSeal(result,id),true);
  for(const [field,value] of [['sourceSha',E10.predecessor],['runId','wrong'],['storageAfter','wrong'],['releaseTransitions',2],['readbackVerified',false]]){
    assert.equal(validateRulesSeal({...result,firestoreRulesTransition:{...proof,[field]:value}},id),false);
  }
  await f.run('rollback');await f.run('rollback');await assert.rejects(f.run('apply'),/generation-precondition/);
  assert.equal(f.backend.live,E10.prior);assert.equal(f.backend.creates,1);assert.equal(f.backend.patches,2);
});
for(const [label,change] of [
  ['shared reserve unproved',f=>f.pending.makeEconomicControl.state='HOLD'],
  ['zero balance',f=>f.observation.unusedCenticredits='0'],
  ['reserve would be consumed',f=>f.observation.unusedCenticredits='15999'],
  ['expired balance',f=>f.observation.observedAt='2000-01-01T00:00:00Z'],
  ['concurrent writer',f=>f.observation.concurrentWriter=true],
  ['wrong native source',f=>f.env.FOCAL_SOURCE=E10.predecessor],
  ['wrong planned tree',f=>f.pending.sourceTree='1'.repeat(40)],
  ['wrong storage rules',f=>f.backend.storage='unrelated'],
  ['wrong predecessor rules',f=>f.backend.live=newName],
  ['missing executor permission',f=>f.backend.allow=false],
  ['wrong staged bytes',f=>fs.writeFileSync(path.join(f.env.SOURCE_DIR,'firestore.rules'),'different')],
]){
  test(label+' blocks before mutation',async t=>{const f=fixture(t);change(f);await assert.rejects(f.run('apply'));
    assert.equal(f.backend.objects.size,0);assert.equal(f.backend.patches+f.backend.creates,0);});
}
test('foreign release prevents rollback and replay',async t=>{
  const f=fixture(t);await f.run('apply');f.backend.live='projects/cxorbia-backend-dev/rulesets/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  await assert.rejects(f.run('rollback'),/FOREIGN_TRANSITION/);await assert.rejects(f.run('verify'),/FOREIGN_TRANSITION/);assert.equal(f.backend.patches,1);
});
test('ordinary successor retains a zero rules budget',()=>{
  assert.equal(exactPendingRules({sourceSha:E10.predecessor,rulesDeploys:0}),true);
  assert.equal(exactPendingRules({sourceSha:E10.predecessor,rulesDeploys:1}),false);
  assert.equal(validateRulesSeal({sourceSha:E10.predecessor,firestoreRulesDeploys:0}),true);
  assert.equal(validateMakeAdmission(null),false);
});

for(const flag of ['exposed','imported'])test('rollback retains target rules on '+flag,async t=>{
  const f=fixture(t);await f.run('apply');f.backend[flag]=true;
  await assert.rejects(f.run('rollback'),/E10_ROLLBACK_/);
  assert.equal(f.backend.live,newName);assert.equal(f.backend.patches,1);
});

test('native preflight checks provider evidence and separately claims the actual scoped window with compare-and-set',async()=>{
  const {bindPaidReaderWindow}=await import('../release/cxorbia-corte6-firestore-rules-deploy.mjs');
  const {createHash}=await import('node:crypto');
  const launchTag='synthetic-launch',uid='12345',str=stringValue=>({stringValue}),num=n=>({integerValue:String(n)}),now=Date.now();
  const kinds=['seal-meta','seal-json','canonical-before','canonical-json','canonical-after'];
  const proof={organizationId:4090072,readerScenarioId:10200465,source:E10.source,launchTag,independentlyVerified:true,
    sharedConsumersCanDebit:false,providerEnforced:true,protectedCredits:160,recoveryReserve:100,observedAtMs:now-1000,expiresAtMs:now+60000};
  let bytes=JSON.stringify(proof),patches=0;
  const digest=()=>createHash('sha256').update(bytes).digest('hex');
  const control={state:'READY',source:E10.source,readerScenarioId:10200465,launchTag,tenantId:'qa',projectId:'qa-proj',
    providerAllocation:{uri:'gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-paired-dev/results/qa/allocation.json#123',sha256:digest()}};
  const fields={windowId:str(launchTag),allocationReceiptSha256:str(digest()),source:str(E10.source),enabled:{booleanValue:false},
    tenantId:str('qa'),projectId:str('qa-proj'),bindingKey:str('a'.repeat(64)),spendingLimit:num(60),recoveryReserve:num(100),
    protectedAllocation:num(160),reserved:num(0),expiresAt:num(now+50000),maxCreditsPerCall:num(3),
    grants:{arrayValue:{values:kinds.map(kind=>({mapValue:{fields:{runId:str(launchTag),actor:str('google:'+uid),process:str(kind),
      maxCalls:num(kind==='seal-meta'?2:1),tickets:{arrayValue:{values:[str('c'.repeat(64)),str('d'.repeat(64))]}}}}}))}}};
  const month=new Date(now).toISOString().slice(0,7);
  const array=values=>({arrayValue:{values}}),map=fields=>({mapValue:{fields}});
  let registry=['qa-proj-'+month];
  const opts={control,id,launchTag,serviceAccount:'projects/test/serviceAccounts/test',token:'synthetic',apply:true,
    cloud:(group)=>group==='storage'?bytes:uid,http:async(_t,verb,url,body)=>{
      if(verb==='GET'&&url.includes('/documents/tenants/qa/projects/qa-proj?'))return {ok:true,payload:{fields:{
        tenantId:str('qa'),countries:array([str('GT')]),operationalSource:map({providerType:str('excel_online'),
          countryBindings:array([map({countryCode:str('GT'),providerBindingId:str('qa-binding')})])})}}};
      if(verb==='GET'&&url.includes('/documents/tenants/qa/integrationSettings/qa-binding?'))return {ok:true,payload:{fields:{
        tenantId:str('qa'),projectId:str('qa-proj'),countryCode:str('GT'),enabled:{booleanValue:true},
        periodSheets:array(registry.map(p=>map({periodId:str(p)})))}}};
      if(verb==='GET')return {ok:true,payload:{updateTime:'now',fields:structuredClone(fields)}};
      assert.equal(verb,'PATCH');assert.equal(new URL(url).searchParams.get('currentDocument.updateTime'),'now');
      Object.assign(fields,body.fields);patches++;return {ok:true,payload:{}};
    }};
  const originalRegistry=registry;
  registry=Array(4).fill('qa-proj-'+month);
  await assert.rejects(bindPaidReaderWindow(opts),/STRICT_COLD_BUDGET/);assert.equal(patches,0);
  registry=originalRegistry;
  await bindPaidReaderWindow({...opts,apply:false});assert.equal(patches,0);
  await bindPaidReaderWindow(opts);await bindPaidReaderWindow(opts);assert.equal(patches,1);
  await assert.rejects(bindPaidReaderWindow({...opts,id:'another'}),/SHARED_RESERVE/);
  bytes=JSON.stringify({...proof,sharedConsumersCanDebit:true});
  control.providerAllocation.sha256=digest();fields.allocationReceiptSha256=str(digest());
  await assert.rejects(bindPaidReaderWindow(opts),/SHARED_RESERVE/);assert.equal(patches,1);
});
