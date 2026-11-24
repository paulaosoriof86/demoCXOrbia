import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const out='.tmp/canonical-candidate-authority';
fs.mkdirSync(out,{recursive:true});
const install=spawnSync('npm',['install','--no-save','--ignore-scripts','--package-lock=false','--no-audit','--no-fund','postal-mime@4.2.1'],{encoding:'utf8',timeout:120000});
if(install.status!==0)throw Error('SOURCE_QA_MIME_DEPENDENCY_INSTALL_FAILED');
const suites=[
  'backend/runtime/hr-live-service/test/cxorbia-f3-field-journal.test.mjs',
  'backend/runtime/hr-live-service/test/cxorbia-f3-scoped-excel-read.test.mjs',
  'backend/runtime/hr-live-service/test/cxorbia-f3-field-editor.test.mjs',
  'backend/runtime/hr-live-service/test/cxorbia-hr-review-observations.test.mjs',
  'backend/runtime/hr-live-service/test/mailbox-user-pop3.test.mjs',
  'tools/qa/cxorbia-i3-b14-make-graph-provider.test.mjs',
  'tools/qa/cxorbia-i3-g05-writer-receipts.test.cjs',
  'tools/qa/cxorbia-i3-a08-exact-password-proof.test.mjs',
  'tools/qa/cxorbia-i3-hr-review-ui.test.mjs',
  'tools/qa/cxorbia-i3-g03-rutas-effective-hr-source-truth.test.mjs',
  'tools/qa/cxorbia-i3-f3-endpoint-runner.test.mjs',
  'tools/qa/cxorbia-i3-vrm369-finance-metadata.test.mjs',
  'backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs'
];
const test=spawnSync(process.execPath,['--test','--test-reporter=tap',...suites],{encoding:'utf8',timeout:120000,maxBuffer:16*1024*1024});
const log=(test.stdout||'')+(test.stderr||'');fs.writeFileSync(path.join(out,'f3-review-mail-source.tap'),log);
const receipt={schemaVersion:1,scope:'FOCAL_SOURCE_ONLY',pass:test.status===0,tests:Number(log.match(/^# tests (\d+)$/m)?.[1]||0),failed:Number(log.match(/^# fail (\d+)$/m)?.[1]||0),suites,logSha256:crypto.createHash('sha256').update(log).digest('hex'),providerAckProven:false,mailboxConnected:false,domainClosure:false,production:false};
fs.writeFileSync(path.join(out,'f3-review-mail-source.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
if(!receipt.pass||!receipt.tests){console.error(log);process.exit(1);}
const event=process.env.GITHUB_EVENT_PATH?JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')):{};
if(String(event.head_commit?.message||'').includes('[i3-mail-tls-readonly]')){
  const filename=path.join(out,'p0367-mail-tls-readonly.json');
  const probe=spawnSync(process.execPath,['tools/qa/cxorbia-i3-p0367-mail-tls-readonly.mjs'],{env:{...process.env,CXORBIA_MAIL_TLS_PROBE_OUT:filename},encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
  if(!fs.existsSync(filename))fs.writeFileSync(filename,JSON.stringify({pass:false,scope:'STRICT_TLS_GREETING_ONLY_NO_CREDENTIALS',classification:'ENVIRONMENT_FAILURE',error:'PROBE_DID_NOT_COMPLETE',credentialCommands:0,messageReads:0,sends:0,deletes:0,mailboxConnected:false})+'\n');
  // This independent provider diagnostic does not turn the gated HR source gate
  // into an email integration PASS or block the unrelated HR deployment.
  console.log(JSON.stringify({mailTlsProbeExit:probe.status,mailTlsProbeReceipt:filename,pass:JSON.parse(fs.readFileSync(filename,'utf8')).pass===true,mailboxConnected:false}));
}
