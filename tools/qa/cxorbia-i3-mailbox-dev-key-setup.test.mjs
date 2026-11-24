import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../release/cxorbia-i3-update-dev-runtime.sh',import.meta.url));
const KEY='cxorbia-dev-user-mailbox-credential-key',SA='runtime@cxorbia-backend-dev.iam.gserviceaccount.com';
const gcloud=`#!/usr/bin/env node
const fs=require('node:fs');
const a=process.argv.slice(2),c=JSON.parse(fs.readFileSync(process.env.QA_SCENARIO,'utf8'));
const trace=process.env.QA_TRACE;
const input=fs.readFileSync(0),record={args:a,stdinBytes:input.length,decodedBytes:input.length?Buffer.from(input.toString(),'base64').length:0};
fs.appendFileSync(trace,JSON.stringify(record)+'\\n');
const has=name=>a.includes(name),value=name=>{const at=a.indexOf(name);return at>=0?a[at+1]:(a.find(x=>x.startsWith(name+'='))||'').slice(name.length+1);};
const out=x=>process.stdout.write(JSON.stringify(x));
const err=(command,code)=>{console.error('ERROR: (gcloud.'+command+') '+code+': provider private detail');process.exit(1);};
const key=c.mountedName||'cxorbia-dev-user-mailbox-credential-key';
const member='serviceAccount:runtime@cxorbia-backend-dev.iam.gserviceaccount.com';
const policy={bindings:c.iamExists?[{role:'roles/secretmanager.secretAccessor',members:[member]}]:[]};
if(a.slice(0,3).join(' ')==='run services describe'){
 const env=c.plaintext?[{name:'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64',value:'PRIVATE_EXISTING_VALUE_NEVER_PRINT'}]:c.mounted?[{name:'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64',valueFrom:{secretKeyRef:{name:key,key:c.mountedVersion||'3'}}}]:[];
 out({metadata:{namespace:'123456'},spec:{template:{spec:{serviceAccountName:c.fallbackIdentity?undefined:'runtime@cxorbia-backend-dev.iam.gserviceaccount.com',containers:[{env}]}}},status:{latestReadyRevisionName:'cxorbia-live-hr-dev-00389-p4r'}});
}else if(a.slice(0,3).join(' ')==='run revisions describe')out({spec:{serviceAccountName:'runtime@cxorbia-backend-dev.iam.gserviceaccount.com'}});
else if(a.slice(0,2).join(' ')==='secrets describe'){
 if(c.lookupError)err('secrets.describe',c.lookupError);
 const created=fs.existsSync(process.env.QA_CREATED);
 if(c.missing&&!created)err('secrets.describe','NOT_FOUND');
 out({name:'projects/123456/secrets/'+key});
}else if(a.slice(0,2).join(' ')==='secrets create'){
 if(c.createDenied)err('secrets.create','PERMISSION_DENIED');
 fs.writeFileSync(process.env.QA_CREATED,'created');
 if(c.createRace)err('secrets.create','ALREADY_EXISTS');
 out({name:'projects/123456/secrets/'+key});
}else if(a.slice(0,3).join(' ')==='secrets versions describe'){
 if(c.noVersion)err('secrets.versions.describe','NOT_FOUND');
 const version=/^[1-9][0-9]*$/.test(a[3])?a[3]:(c.missing&&!c.createRace?'1':'7');
 out({name:'projects/'+(c.wrongProject?'999999':'123456')+'/secrets/'+key+'/versions/'+version,state:c.disabled?'DISABLED':'ENABLED'});
}else if(a.slice(0,2).join(' ')==='secrets get-iam-policy')out(policy);
else if(a.slice(0,2).join(' ')==='secrets add-iam-policy-binding'){
 if(c.iamDenied)err('secrets.add-iam-policy-binding','PERMISSION_DENIED');
 out({bindings:[{role:'roles/secretmanager.secretAccessor',members:[member]}]});
}else if(a.slice(0,3).join(' ')==='run services update')out({ok:true});
else{console.error('Unexpected mock gcloud operation');process.exit(9);}
`;
function execute(t,scenario={},patch={}){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-p0367-key-qa-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  fs.writeFileSync(path.join(dir,'gcloud'),gcloud,{mode:0o755});fs.writeFileSync(path.join(dir,'scenario.json'),JSON.stringify(scenario));
  const env={...process.env,PATH:dir+':'+process.env.PATH,QA_SCENARIO:path.join(dir,'scenario.json'),QA_TRACE:path.join(dir,'trace.jsonl'),QA_CREATED:path.join(dir,'created'),
    PROJECT:'cxorbia-backend-dev',SERVICE:'cxorbia-live-hr-dev',REGION:'us-central1',FOCAL_SOURCE:'a'.repeat(40),ACTIVE_STATUS:'HOLD_I3_P0367_SOURCE_READY',
    LEGAL_ENABLE_NAME:'LEGAL_ENABLE',LEGAL_ENABLE_VALUE:'true',LEGAL_GATE_NAME:'LEGAL_GATE',LEGAL_GATE_VALUE:'true',I3_HR_CACHE_PIN_NAME:'HR_CACHE_PIN',I3_HR_CACHE_PIN_VALUE:'fixture',...patch};
  const result=spawnSync('bash',[script,'gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev@sha256:'+'b'.repeat(64)],{env,encoding:'utf8',timeout:15000});
  const commands=fs.existsSync(env.QA_TRACE)?fs.readFileSync(env.QA_TRACE,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];
  assert.doesNotMatch(result.stdout+result.stderr,/PRIVATE_EXISTING_VALUE_NEVER_PRINT|provider private detail/);
  assert.equal(commands.some(row=>row.args.slice(0,3).join(' ')==='secrets versions access'),false);
  assert.equal(commands.some(row=>row.args.slice(0,3).join(' ')==='secrets versions add'),false);
  return {...result,commands,update:commands.find(row=>row.args.slice(0,3).join(' ')==='run services update')};
}
const matching=(r,command)=>r.commands.filter(row=>row.args.slice(0,command.split(' ').length).join(' ')===command);
function mounted(r){assert.ok(r.update,'Runtime update should occur only after key/IAM metadata success');const a=r.update.args;return a[a.indexOf('--update-secrets')+1];}

test('only confirmed NOT_FOUND creates a 32-byte base64 key via stdin and mounts numeric version1',t=>{
  const r=execute(t,{missing:true});assert.equal(r.status,0,r.stderr);const creates=matching(r,'secrets create');assert.equal(creates.length,1);assert.equal(creates[0].stdinBytes,44);assert.equal(creates[0].decodedBytes,32);assert.ok(creates[0].args.includes('--data-file=-'));assert.ok(creates[0].args.includes('--replication-policy=automatic'));
  assert.equal(mounted(r),'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64='+KEY+':1');
  const settings=r.update.args[r.update.args.indexOf('--update-env-vars')+1];assert.match(settings,/CXORBIA_USER_MAILBOX_ENABLED=true/);assert.match(settings,/CXORBIA_USER_MAILBOX_SEND_ENABLED=false/);assert.doesNotMatch(settings,/CXORBIA_USER_MAILBOX_SEND_ENABLED=true|CREDENTIAL_KEY_B64=/);
  const grant=matching(r,'secrets add-iam-policy-binding')[0];assert.ok(grant.args.includes('--member=serviceAccount:'+SA));assert.ok(grant.args.includes('--role=roles/secretmanager.secretAccessor'));assert.ok(grant.args.includes('--condition=None'));
});
test('existing unmounted secret reuses metadata latest resolved to numeric7 without key writes',t=>{
  const r=execute(t,{iamExists:true});assert.equal(r.status,0,r.stderr);assert.equal(matching(r,'secrets create').length,0);assert.equal(matching(r,'secrets add-iam-policy-binding').length,0);assert.equal(mounted(r),'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64='+KEY+':7');assert.ok(r.commands.every(row=>row.stdinBytes===0));
});
test('existing mounted version3 and secret name stay unchanged even if latest would be7',t=>{
  const r=execute(t,{mounted:true,mountedName:'existing-mailbox-key',mountedVersion:'3',iamExists:true});assert.equal(r.status,0,r.stderr);assert.equal(mounted(r),'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64=existing-mailbox-key:3');assert.equal(matching(r,'secrets create').length,0);assert.equal(matching(r,'secrets versions describe')[0].args[3],'3');
});
test('mounted latest resolves to numeric metadata without accessing secret value',t=>{
  const r=execute(t,{mounted:true,mountedVersion:'latest',iamExists:true});assert.equal(r.status,0,r.stderr);assert.equal(mounted(r),'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64='+KEY+':7');
});
test('missing previously mounted key is never replaced with a new random key',t=>{
  const r=execute(t,{mounted:true,missing:true});assert.notEqual(r.status,0);assert.match(r.stderr,/P0367_EXISTING_MOUNTED_SECRET_MISSING/);assert.equal(matching(r,'secrets create').length,0);assert.equal(r.update,undefined);
});
test('lookup403 and unavailable never become NOT_FOUND or authorize creation',t=>{
  for(const lookupError of ['PERMISSION_DENIED','UNAVAILABLE']){const r=execute(t,{lookupError});assert.notEqual(r.status,0);assert.match(r.stderr,/P0367_SECRET_LOOKUP_FAILED/);assert.equal(matching(r,'secrets create').length,0);assert.equal(r.update,undefined);}
});
test('disabled, absent or cross-project version fails before runtime update and never rotates',t=>{
  for(const scenario of [{disabled:true},{noVersion:true},{wrongProject:true}]){const r=execute(t,scenario);assert.notEqual(r.status,0);assert.equal(matching(r,'secrets create').length,0);assert.equal(r.update,undefined);}
});
test('concurrent secret creation reuses the winner and does not append a version',t=>{
  const r=execute(t,{missing:true,createRace:true,iamExists:true});assert.equal(r.status,0,r.stderr);assert.equal(matching(r,'secrets create').length,1);assert.equal(matching(r,'secrets describe').length,2);assert.equal(mounted(r),'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64='+KEY+':7');
});
test('IAM or create rejection blocks service update without printing provider text',t=>{
  for(const scenario of [{iamDenied:true},{missing:true,createDenied:true}]){const r=execute(t,scenario);assert.notEqual(r.status,0);assert.equal(r.update,undefined);}
});
test('B14/F3 bindings are preserved in one update-secrets argument with mailbox binding',t=>{
  const r=execute(t,{iamExists:true},{ACTIVE_STATUS:'HOLD_I3_B14_P0_SOURCE_PROVEN_PENDING_RUNTIME_AND_HOSTING_DEV_6_OF_21'});assert.equal(r.status,0,r.stderr);assert.equal(r.update.args.filter(value=>value==='--update-secrets').length,1);
  const secrets=mounted(r).split(',');assert.ok(secrets.includes('CXORBIA_B14_MAKE_TOOLBOX_TOKEN=cxorbia-dev-b14-make-toolbox:1'));assert.ok(secrets.includes('CXORBIA_F3_MAKE_TOOLBOX_TOKEN=cxorbia-dev-f3-make-toolbox:1'));assert.ok(secrets.includes('CXORBIA_MAILBOX_CREDENTIAL_KEY_B64='+KEY+':7'));
});
test('non-DEV target exits before any mocked provider command',t=>{
  for(const patch of [{PROJECT:'tya-plataforma'},{SERVICE:'other-service'},{REGION:'other-region'}]){const r=execute(t,{},patch);assert.notEqual(r.status,0);assert.equal(r.commands.length,0);}
});
test('plaintext key is not overwritten or leaked; runtime identity can come from exact ready revision',t=>{
  const blocked=execute(t,{plaintext:true});assert.notEqual(blocked.status,0);assert.match(blocked.stderr,/P0367_PLAINTEXT_KEY_MIGRATION_REQUIRED/);assert.equal(matching(blocked,'secrets create').length,0);assert.equal(blocked.update,undefined);
  const r=execute(t,{fallbackIdentity:true,iamExists:true});assert.equal(r.status,0,r.stderr);assert.equal(matching(r,'run revisions describe').length,1);
});
