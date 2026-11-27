import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {E10, exactPendingRules, validateMakeAdmission} from './cxorbia-i3-e10-rules-contract.mjs';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, {encoding:'utf8',maxBuffer:8*1024*1024});
const demand = (ok, label) => { if (!ok) throw Error(label); };

async function request(token, method, url, body){
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body === undefined ? {} : {'Content-Type':'application/json'})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await r.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch {}
  return {ok:r.ok,status:r.status,payload};
}
function fail(label, response){
  const code = response?.payload?.error?.status || response?.status || 'unknown';
  const message = String(response?.payload?.error?.message || label).replace(/[\r\n]+/g,' ').slice(0,220);
  throw new Error(`${label}:${code}:${message}`);
}


async function historicalDeploy(){
const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const rulesPath = process.env.CXORBIA_RULES_SOURCE || 'firestore.rules';
const out = process.env.CXORBIA_RULES_DEPLOY_REPORT || 'app/docs/evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json';
const execute = process.env.CXORBIA_EXECUTE_FIRESTORE_RULES === 'true';
const releaseName = `projects/${expectedProject}/releases/cloud.firestore`;

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('credential_missing');
if (!fs.existsSync(rulesPath)) throw new Error('rules_source_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== expectedProject) throw new Error(`wrong_project:${sa.project_id || 'missing'}!=${expectedProject}`);

const {default:admin}=await import('firebase-admin');
const credential = admin.credential.cert(sa);
const token = await credential.getAccessToken();
if (!token?.access_token) throw new Error('oauth_token_unavailable');
const source = fs.readFileSync(rulesPath, 'utf8');
const sourceSha256 = sha(source);

const iamPermissions = [
  'firebaserules.rulesets.create',
  'firebaserules.rulesets.get',
  'firebaserules.rulesets.list',
  'firebaserules.rulesets.test',
  'firebaserules.releases.get',
  'firebaserules.releases.update',
  'serviceusage.services.use',
  'resourcemanager.projects.get'
];
const iam = await request(token.access_token,
  'POST',
  `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(expectedProject)}:testIamPermissions`,
  {permissions:iamPermissions}
);
if (!iam.ok) fail('iam_test_failed', iam);
const granted = new Set(Array.isArray(iam.payload?.permissions) ? iam.payload.permissions : []);
const directRequired = [
  'firebaserules.rulesets.create',
  'firebaserules.rulesets.get',
  'firebaserules.releases.get',
  'firebaserules.releases.update',
  'serviceusage.services.use',
  'resourcemanager.projects.get'
];
const missingDirect = directRequired.filter(p => !granted.has(p));
if (missingDirect.length) throw new Error(`direct_rules_api_permissions_missing:${missingDirect.join(',')}`);

const beforeRelease = await request(token.access_token, 'GET', `https://firebaserules.googleapis.com/v1/${releaseName}`);
if (!beforeRelease.ok || !beforeRelease.payload?.rulesetName) fail('current_release_unavailable', beforeRelease);
const beforeRulesetName = String(beforeRelease.payload.rulesetName);
const beforeRuleset = await request(token.access_token, 'GET', `https://firebaserules.googleapis.com/v1/${beforeRulesetName}`);
if (!beforeRuleset.ok) fail('current_ruleset_unavailable', beforeRuleset);
const beforeFile = (beforeRuleset.payload?.source?.files || []).find(f => f?.name === 'firestore.rules') || (beforeRuleset.payload?.source?.files || [])[0] || {};
const beforeSourceSha256 = sha(beforeFile.content || '');
if (execute && expectedProject === E10.project && (sourceSha256 === E10.targetHash || beforeSourceSha256 === E10.targetHash)) {
  throw Error('RELEASE_COMPOSITION_FAILURE:E10_PAIRED_OWNER_REQUIRED');
}
const alreadyCurrent = beforeSourceSha256 === sourceSha256;

const report = {
  schemaVersion:'cxorbia.corte6-firestore-rules-deploy.v1',
  generatedAt:new Date().toISOString(),
  projectId:expectedProject,
  releaseName,
  execute,
  authorizedScope:'firestore_rules_only',
  sourceSha256,
  before:{rulesetName:beforeRulesetName,sourceSha256:beforeSourceSha256},
  iam:{directApiReady:true,rulesetsTestPermission:granted.has('firebaserules.rulesets.test')},
  diagnosis:{firebaseCliPretestBlocked:granted.has('firebaserules.rulesets.test')===false},
  alreadyCurrent,
  createdRuleset:false,
  releaseUpdated:false,
  verified:false,
  providerWrites:0,
  after:null,
  safety:{authWrites:0,firestoreDataWrites:0,storageWrites:0,hostingDeploys:0,production:false,merge:false,secretsExported:false}
};

if (!execute) {
  report.decision = alreadyCurrent ? 'DRY_RUN_ALREADY_CURRENT' : 'DRY_RUN_READY_DIRECT_RULES_API';
} else if (alreadyCurrent) {
  report.decision = 'PASS_ALREADY_CURRENT_NO_RULES_WRITE';
  report.verified = true;
  report.after = {rulesetName:beforeRulesetName,sourceSha256:beforeSourceSha256};
} else {
  const created = await request(token.access_token,
    'POST',
    `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(expectedProject)}/rulesets`,
    {source:{files:[{name:'firestore.rules',content:source}]}}
  );
  if (!created.ok || !created.payload?.name) fail('ruleset_create_failed', created);
  const newRulesetName = String(created.payload.name);
  report.createdRuleset = true;
  report.providerWrites += 1;

  const patched = await request(token.access_token,
    'PATCH',
    `https://firebaserules.googleapis.com/v1/${releaseName}`,
    {release:{name:releaseName,rulesetName:newRulesetName},updateMask:'rulesetName'}
  );
  if (!patched.ok || patched.payload?.rulesetName !== newRulesetName) fail('release_patch_failed', patched);
  report.releaseUpdated = true;
  report.providerWrites += 1;

  const afterRelease = await request(token.access_token, 'GET', `https://firebaserules.googleapis.com/v1/${releaseName}`);
  if (!afterRelease.ok || afterRelease.payload?.rulesetName !== newRulesetName) fail('release_readback_mismatch', afterRelease);
  const afterRuleset = await request(token.access_token, 'GET', `https://firebaserules.googleapis.com/v1/${newRulesetName}`);
  if (!afterRuleset.ok) fail('new_ruleset_readback_failed', afterRuleset);
  const afterFile = (afterRuleset.payload?.source?.files || []).find(f => f?.name === 'firestore.rules') || (afterRuleset.payload?.source?.files || [])[0] || {};
  const afterSourceSha256 = sha(afterFile.content || '');
  if (afterSourceSha256 !== sourceSha256) throw new Error(`rules_source_hash_mismatch:${afterSourceSha256}`);
  report.verified = true;
  report.after = {rulesetName:newRulesetName,sourceSha256:afterSourceSha256};
  report.decision = 'PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED';
}

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(out, JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({projectId:expectedProject,decision:report.decision,execute,alreadyCurrent,createdRuleset:report.createdRuleset,releaseUpdated:report.releaseUpdated,verified:report.verified,providerWrites:report.providerWrites,rulesetsTestPermission:report.iam.rulesetsTestPermission,sourceSha256}));

}

export async function bindPaidReaderWindow({control,id,launchTag,serviceAccount,cloud,http,token,apply}){
  const fail='ENVIRONMENT_FAILURE:MAKE_SHARED_RESERVE_UNVERIFIED';
  demand(control?.state==='READY'&&control.source===E10.source&&control.readerScenarioId===10200465&&
    control.launchTag===launchTag&&typeof launchTag==='string'&&launchTag.length>0,fail);
  // The independent provider readback must be immutable and current. The
  // Firestore reservation below only controls this runtime's spending.
  const pin=control.providerAllocation;
  demand(/^gs:\/\/cxorbia-backend-dev_cloudbuild\/cxorbia-i3-paired-dev\/results\/[A-Za-z0-9_/-]+[.]json#[0-9]+$/.test(pin?.uri||'')&&
    /^[a-f0-9]{64}$/.test(pin?.sha256||''),fail);
  const raw=cloud('storage','cat',pin.uri);
  demand(sha(raw+'\n')===pin.sha256||sha(raw)===pin.sha256,fail);
  const observed=JSON.parse(raw),now=Date.now();
  demand(observed.organizationId===4090072&&observed.readerScenarioId===10200465&&observed.source===E10.source&&
    observed.launchTag===launchTag&&observed.independentlyVerified===true&&observed.sharedConsumersCanDebit===false&&
    observed.providerEnforced===true&&observed.protectedCredits>=160&&observed.recoveryReserve>=100&&
    Number.isFinite(observed.observedAtMs)&&observed.observedAtMs<=now&&now-observed.observedAtMs<=600000&&
    Number.isFinite(observed.expiresAtMs)&&observed.expiresAtMs>now,fail);
  const url='https://firestore.googleapis.com/v1/projects/'+E10.project+'/databases/(default)/documents/cxorbiaProviderBudgets/dev_make_hr_reader';
  const get=async()=>{const r=await http(token,'GET',url);demand(r.ok&&r.payload?.updateTime&&r.payload.fields,fail);return r.payload;};
  const doc=await get(),f=doc.fields;
  const integer=v=>typeof v?.integerValue==='string'&&/^\d+$/.test(v.integerValue)?Number(v.integerValue):NaN;
  const plans=f.grants?.arrayValue?.values||[];
  const actorId=cloud('iam','service-accounts','describe',serviceAccount.split('/').at(-1),'--format=value(uniqueId)');
  const purposes=['canonical-after','canonical-before','canonical-json','seal-json','seal-meta'];
  const bound=f.enabled?.booleanValue===true;
  demand(f.windowId?.stringValue===launchTag&&f.allocationReceiptSha256?.stringValue===pin.sha256&&
    f.source?.stringValue===E10.source&&f.tenantId?.stringValue===control.tenantId&&f.projectId?.stringValue===control.projectId&&
    /^[a-f0-9]{64}$/.test(f.bindingKey?.stringValue||'')&&integer(f.spendingLimit)===60&&integer(f.recoveryReserve)===100&&
    integer(f.protectedAllocation)>=160&&integer(f.protectedAllocation)<=observed.protectedCredits&&integer(f.reserved)===0&&
    integer(f.expiresAt)>now&&integer(f.expiresAt)<=observed.expiresAtMs&&integer(f.maxCreditsPerCall)>=3&&
    plans.length===5&&/^[0-9]+$/.test(actorId),fail);
  let maximum=0;
  const processes=plans.map(plan=>{
    const g=plan.mapValue?.fields||{},n=integer(g.maxCalls),tickets=g.tickets?.arrayValue?.values||[];
    demand(g.actor?.stringValue==='google:'+actorId&&g.runId?.stringValue===(bound?id:launchTag)&&
      Number.isSafeInteger(n)&&n>0&&tickets.length>=n&&tickets.every(t=>/^[a-f0-9]{64}$/.test(t.stringValue||'')),fail);
    maximum+=n*integer(f.maxCreditsPerCall);return g.process?.stringValue;
  }).sort();
  demand(JSON.stringify(processes)===JSON.stringify(purposes)&&maximum<=60,fail);
  if(!apply||bound)return;
  for(const v of plans)v.mapValue.fields.runId={stringValue:id};
  const q=new URLSearchParams({'currentDocument.updateTime':doc.updateTime});
  for(const key of ['enabled','grants'])q.append('updateMask.fieldPaths',key);
  const claimed=await http(token,'PATCH',url+'?'+q,{fields:{enabled:{booleanValue:true},grants:{arrayValue:{values:plans}}}});
  demand(claimed.ok,fail);
  const readback=await get();
  demand(readback.fields.enabled?.booleanValue===true&&readback.fields.grants.arrayValue.values.length===5&&
    readback.fields.grants.arrayValue.values.every(v=>v.mapValue.fields.runId.stringValue===id),fail);
}

export async function pairedRules(mode, dependencies={}) {
  const e = dependencies.env || process.env;
  const readGit = dependencies.git || git;
  const http = dependencies.request || request;
  const id = e.CXORBIA_PAIRED_BUILD_ID;
  demand(['preflight','apply','verify','rollback'].includes(mode) &&
    e.PROJECT === E10.project && e.FOCAL_SOURCE === E10.source && e.FOCAL_TREE === E10.tree &&
    /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id || '') &&
    !e.GITHUB_ACTIONS && !e.GITHUB_RUN_ID, 'RELEASE_COMPOSITION_FAILURE:E10_NATIVE_SCOPE');
  const descriptor = JSON.parse(readGit('show','HEAD:CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'));
  const pending = descriptor.pendingDevSuccessor;
  demand(pending?.sourceSha === E10.source && exactPendingRules(pending, p=>readGit('rev-parse','HEAD:'+p).trim(), args=>readGit(...args)),
    'RELEASE_COMPOSITION_FAILURE:E10_DESCRIPTOR');
  const cloud = dependencies.cloud || ((...args) => execFileSync('gcloud',[...args,'--project='+E10.project,'--quiet'],
    {encoding:'utf8',timeout:45000,maxBuffer:8*1024*1024}).trim());
  const build = JSON.parse(cloud('builds','describe',id,'--region=global','--format=json'));
  const sub = build.substitutions;
  demand(build.id === id && build.status==='WORKING' && build.projectId===E10.project &&
    sub?._CXORBIA_SCOPE==='I3_PAIRED_DEV' && sub._CXORBIA_SOURCE_SHA===E10.source &&
    sub._CXORBIA_SOURCE_TREE===E10.tree && sub._CXORBIA_CONTROL_SHA===readGit('rev-parse','HEAD').trim() &&
    sub._CXORBIA_PREDECESSOR_BLOB===descriptor.postDeployRunSeal.receiptBlob,
    'RELEASE_COMPOSITION_FAILURE:E10_NATIVE_IDENTITY');
  const token = cloud('auth','print-access-token');
  if(mode==='preflight' || mode==='apply'){
    const permissions=['firebaserules.rulesets.get','firebaserules.rulesets.create','firebaserules.releases.get',
      'firebaserules.releases.list','firebaserules.releases.update','run.services.get','run.services.update',
      'run.revisions.get','firebasehosting.releases.create','firebasehosting.versions.get'];
    const iam=await http(token,'POST','https://cloudresourcemanager.googleapis.com/v1/projects/'+E10.project+':testIamPermissions',{permissions});
    demand(iam.ok && permissions.every(p=>iam.payload.permissions?.includes(p)),'AUTH_FAILURE:E10_NATIVE_PUBLISH_OR_ROLLBACK_PERMISSION');
  }
  const api = async (method, name, body) => {
    const response = await http(token,method,'https://firebaserules.googleapis.com/v1/'+name,body);
    if (!response.ok) fail('E10_RULES_API',response);
    return response.payload;
  };
  const state = async () => {
    const release = await api('GET',E10.release);
    demand(/^projects\/cxorbia-backend-dev\/rulesets\/[a-f0-9-]{36}$/.test(release.rulesetName),'E10_FOREIGN_RULESET');
    const rules = await api('GET',release.rulesetName);
    demand(rules.source?.files?.length===1 && rules.source.files[0].name==='firestore.rules','E10_RULESET_FILE');
    const inventory = await api('GET','projects/'+E10.project+'/releases?pageSize=100');
    const storage = inventory.releases.filter(r=>r.name.startsWith('projects/'+E10.project+'/releases/firebase.storage'));
    demand(!inventory.nextPageToken && storage.length===1 && storage[0].rulesetName===E10.storage,'E10_STORAGE_DRIFT');
    return {rulesetName:release.rulesetName,sourceSha256:sha(rules.source.files[0].content)};
  };
  const before = {rulesetName:E10.prior,sourceSha256:E10.priorHash};
  const found = await state();
  const prefix='gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-paired-dev/results/';
  const record = (name,data,global=false) => {
    const path=e.FOCAL_OUT+'/'+name+'.json';
    const uri=prefix+(global?'e10-rules-'+E10.authorityBlob:id)+'/'+name+'.json';
    fs.writeFileSync(path,JSON.stringify(data,null,2)+'\n',{mode:0o600});
    cloud('storage','cp','--if-generation-match=0',path,uri);
    demand(cloud('storage','cat',uri)===fs.readFileSync(path,'utf8').trim(),'PERSISTENCE_FAILURE:E10_RULES_JOURNAL');
  };
  const patch = async (rulesetName) => {
    const result=await api('PATCH',E10.release,{release:{name:E10.release,rulesetName},updateMask:'rulesetName'});
    demand(result.rulesetName===rulesetName,'RELEASE_COMPOSITION_FAILURE:E10_RELEASE_ACK');
  };
  if(mode==='preflight' || mode==='apply') {
    demand(found.rulesetName===before.rulesetName && found.sourceSha256===before.sourceSha256,'E10_PREDECESSOR_DRIFT');
    // Changing the account balance cannot clear an audited shared-pool HOLD.
    // Admission requires a separately verified provider allocation and native
    // spend window. Keep the exact authority pinned across the entire run.
    const costControl=pending.makeEconomicControl;
    demand(costControl?.state==='READY','ENVIRONMENT_FAILURE:MAKE_SHARED_RESERVE_UNVERIFIED');
    const admission=pending.makeAdmission;
    demand(admission?.path==='docs/checkpoints/CXORBIA_I3_E10_MAKE_ADMISSION.json' &&
      admission.gitBlob===readGit('rev-parse','HEAD:'+admission.path).trim() &&
      validateMakeAdmission(JSON.parse(readGit('show','HEAD:'+admission.path))), 'ENVIRONMENT_FAILURE:E10_MAKE_ADMISSION');
    const predecessor = descriptor.currentMaterialization;
    demand(predecessor.sourceSha===E10.predecessor && predecessor.runtimeRevision==='cxorbia-live-hr-dev-00395-lnc' &&
      predecessor.hostingVersion==='sites/cxorbia-backend-dev/versions/e9a216661b686246','E10_PREDECESSOR_PAIR');
    await (dependencies.bindPaidReaderWindow||bindPaidReaderWindow)({control:costControl,id,
      launchTag:pending.pairedCloudBuild?.launchTag,serviceAccount:build.serviceAccount,cloud,http,token,apply:mode==='apply'});
    if(mode==='preflight') return;
    const source=fs.readFileSync(e.SOURCE_DIR+'/firestore.rules','utf8');
    demand(sha(source)===E10.targetHash,'E10_PRODUCT_RULES_HASH');
    record('intent',{runId:id,sourceSha:E10.source,authorityBlob:E10.authorityBlob,before},true);
    const created=await api('POST','projects/'+E10.project+'/rulesets',{source:{files:[{name:'firestore.rules',content:source}]}});
    demand(/^projects\/cxorbia-backend-dev\/rulesets\/[a-f0-9-]{36}$/.test(created.name) && created.name!==E10.prior,'E10_CREATED_RULESET');
    record('e10-rules-created',{runId:id,createdRulesetName:created.name,before});
    const current=await state();
    demand(current.rulesetName===before.rulesetName&&current.sourceSha256===before.sourceSha256,'E10_CONCURRENT_RELEASE');
    await patch(created.name);
    const applied=await state();
    demand(applied.rulesetName===created.name && applied.sourceSha256===E10.targetHash,'E10_AFTER_DRIFT');
    return;
  }
  const saved=JSON.parse(cloud('storage','cat',prefix+id+'/e10-rules-created.json'));
  demand(saved.runId===id && saved.before?.rulesetName===E10.prior,'E10_CREATED_IDENTITY');
  if(mode==='rollback' && found.rulesetName===before.rulesetName && found.sourceSha256===before.sourceSha256) return;
  demand(found.rulesetName===saved.createdRulesetName && found.sourceSha256===E10.targetHash,'E10_FOREIGN_TRANSITION');
  if(mode==='rollback'){
    // The importer creates a protected marker in the same transaction as its
    // records. Never weaken rules after possible exposure or a nonempty read.
    const expected='cxorbia-i3-paired-dev/results/'+id+'/runtime-transition-intent.json';
    const journal=await http(token,'GET','https://storage.googleapis.com/storage/v1/b/cxorbia-backend-dev_cloudbuild/o?'+
      new URLSearchParams({prefix:expected,fields:'items(name),nextPageToken'}));
    demand(journal.ok&&!journal.payload.nextPageToken&&!(journal.payload.items||[]).some(item=>item.name===expected),
      'E10_ROLLBACK_RUNTIME_EXPOSURE');
    const query=await http(token,'POST','https://firestore.googleapis.com/v1/projects/'+E10.project+
      '/databases/(default)/documents:runQuery',{structuredQuery:{from:[{collectionId:'hrImportRuns',allDescendants:true}],
      select:{fields:[{fieldPath:'__name__'}]},limit:1}});
    demand(query.ok&&Array.isArray(query.payload)&&query.payload.length>0&&query.payload.every(r=>!r.document&&r.readTime),
      'E10_ROLLBACK_IMPORT_RECORDS_OR_UNKNOWN');
    await patch(E10.prior);
    const restored=await state();
    demand(restored.rulesetName===before.rulesetName && restored.sourceSha256===before.sourceSha256,'E10_ROLLBACK_READBACK');
    record('e10-rules-rollback',{runId:id,from:found,restored,rollbackTransitions:1});
    return;
  }
  record('e10-rules-readback',{runId:id,authorityBlob:E10.authorityBlob,project:E10.project,release:E10.release,
    sourceSha:E10.source,sourceTree:E10.tree,before,after:found,storageBefore:E10.storage,storageAfter:E10.storage,
    createdRulesetName:saved.createdRulesetName,releaseTransitions:1,rollbackTransitions:0,readbackVerified:true,production:false});
}
if(process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
  if(process.argv[2]==='--i3-paired') await pairedRules(process.argv[3]);
  else await historicalDeploy();
}
