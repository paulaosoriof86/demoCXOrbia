import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {E10,exactPendingRules,validateRulesSeal,validateMakeAdmission} from '../release/cxorbia-i3-e10-rules-contract.mjs';
import {pairedRules} from '../release/cxorbia-corte6-firestore-rules-deploy.mjs';

const id='389c0a19-f9fd-4f7f-b0d2-4a5d16c9fe87';
const newName='projects/cxorbia-backend-dev/rulesets/74a3c83c-f114-4074-8377-b8a0cd3cdb9f';
const nativeGit=(...args)=>execFileSync('git',args,{encoding:'utf8'});
const priorBytes=nativeGit('show',E10.predecessor+':firestore.rules');
const targetBytes=nativeGit('show',E10.source+':firestore.rules');

function fixture(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-e10-rules-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  fs.writeFileSync(path.join(root,'firestore.rules'),targetBytes);
  const observation={sourceSha:E10.source,sourceTree:E10.tree,organizationId:4090072,automaticPurchasing:false,
    unusedCenticredits:'16000',hrReadAllowance:60,restorationReserve:100,f3Debit:0,concurrentWriter:false,observedAt:new Date().toISOString()};
  const pending={sourceSha:E10.source,sourceTree:E10.tree,predecessorProductSourceSha:E10.predecessor,scope:'RUNTIME_AND_HOSTING',
    rulesDeploys:1,storageRulesDeploys:0,rulesAuthority:{path:E10.authorityPath,gitBlob:E10.authorityBlob},
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
  return {env,observation,pending,backend,git,run:action=>pairedRules(action,{env,cloud,git,request})};
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
