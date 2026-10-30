// Offline regressions. Git commands use the real checkout; cloud/browser adapters
// below are explicitly synthetic and never contact DEV or create provider data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {execFileSync,spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const RUNNER='tools/qa/cxorbia-i3-d04-e04-run1782-live.mjs';
const CONTROL='.github/control/CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007.sh';
const PACKAGE='docs/checkpoints/CXORBIA_I3_C02_D04_INDEPENDENT_SESSION_PACKAGE_20261029_R12.json';
const POINTER='CXORBIA_RECOVERY_EXECUTION_CURRENT.json';
const DESCRIPTOR='CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
const runner=fs.readFileSync(RUNNER,'utf8'),control=fs.readFileSync(CONTROL,'utf8');
const pkg=JSON.parse(fs.readFileSync(PACKAGE,'utf8'));
const receipt=JSON.parse(fs.readFileSync(pkg.d07CarryForward.path,'utf8'));
const clone=x=>structuredClone(x);
const digest=x=>createHash('sha256').update(x).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-c04-local-regression-'));

function between(source,from,to){
  const start=source.indexOf(from),end=source.indexOf(to,start);
  assert.ok(start>=0&&end>start,from);return source.slice(start,end);
}
function carryGuard(source){
  const fn=between(source,'function verifyRun1991D07CarryForward(', '\nfunction verifyC04C05OnlyResult(');
  return new Function('assert','createHash',fn+';return verifyRun1991D07CarryForward;')(assert,createHash);
}
const verifyCarry=carryGuard(runner);
const terminalFn=between(runner,'function verifyC04C05OnlyResult(', '\n\nlet sessionPackage=');
const verifyFinance=new Function('assert',terminalFn+';return verifyC04C05OnlyResult;')(assert);
const helper=between(runner,'\nconst R7Finance=R7_MODE?(()=>{','\nconst r7SafeCode=').trim();
const finance=new Function('R7_MODE','R12_FINANCE_ONLY','createHash','randomBytes','isDeepStrictEqual','fs','path',
 helper.replace('return {C04C05,runC04C05BoundedFinance};',
 'return {C04C05,runC04C05BoundedFinance,visibleFinanceRows,validateC04Actor,validateC04Command,validateC04Ack,c04ConditionalCleanupR11Residue,c04ConditionalCleanup,classifyC04Request};')+';return R7Finance;'
)(true,true,createHash,randomBytes,isDeepStrictEqual,fs,path);

test('runner and control use the same verified carry-forward and terminal guards',()=>{
  assert.equal(between(control,'function verifyRun1991D07CarryForward(', '\nfunction verifyC04C05OnlyResult('),
    between(runner,'function verifyRun1991D07CarryForward(', '\nfunction verifyC04C05OnlyResult('));
  assert.equal(between(control,'function verifyC04C05OnlyResult(', '\n\nconst [mode,'),terminalFn);
  const proof=verifyCarry(receipt,pkg.materialization);
  assert.equal(proof.executed,false);assert.equal(proof.fullTaskClosed,false);
  assert.deepEqual(proof.remainingFrozenClauses,JSON.parse(receipt.rawEvidence.d07).remainingFrozenClauses);
  assert.deepEqual(carryGuard(control)(receipt,pkg.materialization),proof);
});
for(const [name,mutate] of [
  ['origin run',r=>r.origin.runId++],['origin control',r=>r.origin.controlSha='0'.repeat(40)],
  ['artifact',r=>r.origin.artifactId++],['archive digest',r=>r.origin.artifactZipSha256='0'.repeat(64)],
  ['D07 bytes',r=>r.rawEvidence.d07+=' '],['preflight bytes',r=>r.rawEvidence.preflight+=' '],
  ['declared D07 digest',r=>r.origin.d07Sha256='0'.repeat(64)],
  ['declared preflight digest',r=>r.origin.preflightSha256='0'.repeat(64)],
  ['full closure',r=>r.fullTaskClosed=true],['production',r=>r.production=true]
])test('carry-forward rejects altered '+name,()=>{const r=clone(receipt);mutate(r);assert.throws(()=>verifyCarry(r,pkg.materialization));});
for(const key of ['sourceSha','sourceTree','runtimeSourceSha','runtimeRevision','runtimeDigest','hostingVersion','hostingRelease','hrRevision','rulesRelease','rulesetName','rulesGitBlob','materializationRunId','sourceArtifactDigest','origin','controlSha','owners','receipt'])
  test('carry-forward rejects target drift '+key,()=>{const t=clone(pkg.materialization);t[key]=null;assert.throws(()=>verifyCarry(receipt,t));});

test('R12 package and live pointers bind the same parent, scope, evidence and current helper bytes',()=>{
  const p=JSON.parse(fs.readFileSync(POINTER)),d=JSON.parse(fs.readFileSync(DESCRIPTOR));
  assert.equal(pkg.expectedControlParentSha,git('rev-parse','HEAD^'));
  assert.equal(p.currentSessionProofPackage.gitBlob,git('hash-object',PACKAGE));
  assert.deepEqual(d.currentSessionProofRequest,p.currentSessionProofPackage);
  assert.deepEqual(p.currentSessionProofPackage.tasks,['C04','C05']);
  assert.equal(pkg.d07.execute,false);assert.equal(pkg.d07.binaryGetsPerRole,0);assert.equal(pkg.d07.downloadsPerRole,0);
  assert.equal(pkg.d07.corsChanges,false);assert.equal(pkg.scope.providerConfigWritesMax,0);
  assert.equal(pkg.c04c05.helperSha256,digest(helper));
  assert.equal(pkg.d07CarryForward.sha256,digest(fs.readFileSync(pkg.d07CarryForward.path)));
  assert.equal(p.exactNextAction,d.exactNextAction);assert.equal(p.nextExactAction,d.exactNextAction);
  git('merge-base','--is-ancestor',pkg.sourceSha,pkg.expectedControlParentSha);
  git('diff','--quiet',pkg.sourceSha,'HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source');
});

test('R12 historical residue is preserved before any transaction or new fixture',async()=>{
  let writes=0;
  const absentDb={doc:ref=>({id:ref.split('/').at(-1)}),getAll:async(...refs)=>refs.map(r=>({...r,exists:false})),runTransaction:()=>{writes++;throw Error('MUST_NOT_WRITE');}};
  const absent=await finance.c04ConditionalCleanupR11Residue(absentDb);
  assert.equal(absent.count,0);assert.equal(writes,0);
  // Use the exact archived R11 account to reach the authorization guard.
  const historical=JSON.parse(fs.readFileSync('docs/checkpoints/CXORBIA_I3_C02_D04_INDEPENDENT_SESSION_PACKAGE_20261029_R11.json'));
  assert.equal(historical.scope.cleanupDeletes,13);
  const ref='tenants/tya/financeAccounts/acct-c63650b9e9d3956b67e8f96894e6';
  const data={tenantId:'tya',projectId:null,global:true,periodId:'2026-10',kind:'cxc',concepto:'QA-C04-C05-40992435376-36825c95ac0d-GT-CXC',
    country:'GT',pais:'GT',currency:'Q',moneda:'Q',monto:1,originalAmount:1,saldo:.6,balance:.6,
    sourceRef:'admin-entry:b8f998e679811e96df23f96e31fd23a18da596fe',createdBy:pkg.actor.uid,lastMovementId:'acct-8ee873cf36cd65a3ebb3e22df1e4c8'};
  absentDb.getAll=async(...refs)=>refs.map(r=>({...r,exists:r.id===ref.split('/').at(-1),data:()=>data}));
  await assert.rejects(()=>finance.c04ConditionalCleanupR11Residue(absentDb),/HISTORICAL_RESIDUE_PRESENT_DO_NOT_TOUCH/);
  assert.equal(writes,0);
});

test('cleanup rejects wrong scope and changed heads without deleting',async()=>{
  let deleted=0;
  const db={doc:p=>p,runTransaction:async callback=>callback({getAll:async()=>[{id:'acct-qa',exists:true,data:()=>({changed:true}),updateTime:null}],delete:()=>{deleted++;}})};
  await assert.rejects(()=>finance.c04ConditionalCleanup(db,new Map([['tenants/other/financeAccounts/acct-qa',{id:'acct-qa',exists:true}]])),/CLEANUP_REFERENCE_SCOPE_DENIED/);
  await assert.rejects(()=>finance.c04ConditionalCleanup(db,new Map([['tenants/tya/financeAccounts/acct-qa',{id:'acct-qa',exists:true,hash:'wrong',updateTime:null}]])),/CLEANUP_PRECONDITION_CHANGED/);
  assert.equal(deleted,0);
});

test('financial actor, amounts, currency, scope and non-exact replays fail closed',()=>{
  const member={id:pkg.actor.uid,active:true,role:'admin',tenantId:'tya',authNamespace:'staff',entitlementMode:'TYA_COMPLETE',projectIds:['cinepolis'],countries:['GT','HN']};
  const user={uid:pkg.actor.uid,disabled:false,customClaims:{role:'admin',tenantId:'tya',authNamespace:'staff',projectIds:['cinepolis']}};
  finance.validateC04Actor(member,user);
  for(const patch of [{id:'other'},{role:'shopper'},{countries:['GT']},{entitlementMode:'SPECIFIC_PROJECTS'}])assert.throws(()=>finance.validateC04Actor({...member,...patch},user));
  const command={version:'cxorbia-command-adapter-v1',tenantId:'tya',projectId:null,periodId:'2026-10',requireProject:false,requirePeriod:true,
    idempotencyKey:'synthetic-local-regression-key',actor:{actorId:pkg.actor.uid,role:'admin'},authorization:{permission:'finance.account.write',providerEnforcementRequired:true},
    commandType:'finance.account.create',entityType:'financeAccount',entityId:null,expectedVersion:'absent',
    payload:{global:true,periodId:'2026-10',country:'GT',pais:'GT',currency:'Q',moneda:'Q',amount:1,monto:1,concepto:'LOCAL-QA',kind:'cxc',origin:'manual'}};
  const step={kind:'create-cxc',role:'admin',marker:'LOCAL-QA'};
  finance.validateC04Command(command,step);
  for(const [key,value] of [['amount',2],['currency','L'],['global',false],['projectId','other'],['country','HN']]){
    const c=clone(command);c.payload[key]=value;assert.throws(()=>finance.validateC04Command(c,step));
  }
  assert.throws(()=>finance.validateC04Command({...command,projectId:'cinepolis'},step));
  assert.throws(()=>finance.validateC04Command({...command,idempotencyKey:'changed-local-key'},{...step,replay:true,originalCommand:command}));
  assert.equal(finance.classifyC04Request({url:'https://storage.googleapis.com/storage/v1/b/qa',method:'PATCH',origin:pkg.materialization.origin}),'deny');
});

function goodFinance(){
  const row={unique:true,visible:true,marker:true,country:true,money:true};
  const dom={globalSelected:true,accountRows:[clone(row),clone(row)],movementRows:[clone(row),clone(row),clone(row)],kpis:['Q','L'].map(currency=>({currency,unique:true,visible:true,unchanged:true}))};
  return {decision:'PASS_C04_C05_BOUNDED_FINANCE',executed:true,fullTaskClosed:false,production:false,sessionsClosed:true,browserClosed:true,
    commands:['create-cxc','apply-cxc','create-financing','apply-cxp'].map((kind,i)=>({kind,providerWrites:[3,4,4,4][i],strictAck:true,serverReceiptAuditAndRows:true,visibleAck:true})),
    replays:[0,1].map(()=>({exactCommand:true,idempotentReplay:true,providerWrites:0,allLinkedDataAndUpdateTimesUnchanged:true,scopedLedgerUnchanged:true})),
    linkedDocuments:Array.from({length:13},(_,i)=>({collection:'financeAccounts',id:'local-'+i})),
    writes:{financeProvider:15,cleanupDeletes:13,preflightR11CleanupDeletes:0,authAccountsIssued:0,claimsIssued:0,membershipIssued:0,hrIssued:0,productionIssued:0,bankIssued:0,externalPaymentIssued:0},
    cleanup:{decision:'PASS_EXACT_CONDITIONAL_CLEANUP',count:13,allAbsent:true,blindDeletes:false,otherScopedRecordsUnchanged:true},
    otherScopedRecords:{unchanged:true,beforeSha256:'synthetic-baseline',afterSha256:'synthetic-baseline'},primaryDom:clone(dom),independentDom:clone(dom),
    sessions:[0,1].map(()=>({newBrowserContext:true,authNullBeforeSignIn:true})),guards:[0,1].map(()=>({unexpectedMutationBlocked:0,validationFailures:[]}))};
}
test('terminal finance guard accepts only complete bounded evidence',()=>assert.equal(verifyFinance(goodFinance()),true));
for(const [name,mutate] of [
  ['failed finance',f=>f.decision='HOLD_C04_C05_BOUNDED_FINANCE'],['not executed',f=>f.executed=false],
  ['incomplete cleanup',f=>f.cleanup.count=12],['residue',f=>f.cleanup.allAbsent=false],['blind delete',f=>f.cleanup.blindDeletes=true],
  ['historical cleanup',f=>f.writes.preflightR11CleanupDeletes=1],['extra writes',f=>f.writes.financeProvider=16],
  ['replay writes',f=>f.replays[0].providerWrites=1],['changed baseline',f=>f.otherScopedRecords.afterSha256='different'],
  ['invisible KPI',f=>f.primaryDom.kpis[0].visible=false],['wrong currency',f=>f.independentDom.kpis[0].currency='USD'],
  ['duplicated documents',f=>f.linkedDocuments[1]=f.linkedDocuments[0]],['bank write',f=>f.writes.bankIssued=1]
])test('terminal finance guard rejects '+name,()=>{const f=goodFinance();mutate(f);assert.throws(()=>verifyFinance(f));});

test('R12 dispatcher never calls D07 or claims a new D07 browser',async()=>{
  const source=between(runner,'async function runR7Bounded(){','\n\n\nif(R7_MODE){');
  for(const failed of [false,true]){
    const res={},localProcess={exitCode:0};let d07Calls=0,financeCalls=0;
    const fn=new Function('assert','R12_FINANCE_ONLY','d07CarryProof','res','record','runR7D07','runR7Finance','verifyC04C05OnlyResult','process','console',source+';return runR7Bounded;')(
      assert,true,verifyCarry(receipt,pkg.materialization),res,()=>{},()=>{d07Calls++;throw Error('D07_FORBIDDEN');},
      async()=>{financeCalls++;const f=goodFinance();if(failed)f.cleanup.allAbsent=false;return f;},verifyFinance,localProcess,{log(){}});
    await fn();assert.equal(d07Calls,0);assert.equal(financeCalls,1);assert.equal(res.d07.executed,false);assert.equal(res.d07.fullTaskClosed,false);
    assert.equal(res.cleanup.d07BrowserCreated,false);assert.equal(res.cleanup.d07BrowserClosed,null);
    assert.equal(res.decision,failed?'HOLD_R7_D07_C04_C05_BOUNDED':'PASS_R7_C04_C05_ONLY_D07_CARRIED_FORWARD');
  }
});

const controlNode=between(control,"<<'R7_SESSION_CONTROL_NODE'\n",'\nR7_SESSION_CONTROL_NODE').split('\n').slice(1).join('\n');
function sourceGuard(extraEnv={}){
  const out=fs.mkdtempSync(path.join(tmp,'source-'));
  const run=spawnSync(process.execPath,['--input-type=module','-','session-source-proof',PACKAGE,out],{
    input:controlNode,encoding:'utf8',env:{...process.env,FOCAL_SOURCE:pkg.sourceSha,FOCAL_TREE:pkg.sourceTree,PROJECT:'cxorbia-backend-dev',SERVICE:'cxorbia-live-hr-dev',HOSTING_SITE:'cxorbia-backend-dev',TENANT_ID:'tya',PROJECT_ID:'cinepolis',REGION:'us-central1',GITHUB_SHA:git('rev-parse','HEAD'),GITHUB_RUN_ID:'1',CANDIDATE_DESCRIPTOR:DESCRIPTOR,...extraEnv}});
  return {run,result:fs.existsSync(path.join(out,'package-source-guard.json'))?JSON.parse(fs.readFileSync(path.join(out,'package-source-guard.json'))):null};
}
test('complete source guard passes on the actual proposed commit and Git graph, without cloud calls',()=>{
  const {run,result}=sourceGuard();assert.equal(run.status,0,run.stderr);assert.equal(result.decision,'PASS_R7_SESSION_PACKAGE_SOURCE_GUARD');assert.equal(result.liveE2e,'NOT_RUN');assert.equal(result.cloudAccess,false);
});
for(const env of [{FOCAL_SOURCE:'0'.repeat(40)},{FOCAL_TREE:'0'.repeat(40)},{GITHUB_SHA:'0'.repeat(40)},{PROJECT:'production-denied'}])
  test('complete source guard rejects local environment drift '+Object.keys(env)[0],()=>{const {run,result}=sourceGuard(env);assert.equal(run.status,1);assert.equal(result.decision,'HOLD_R7_SESSION_PACKAGE_SOURCE_GUARD');assert.equal(result.cloudAccess,false);});

// Run the actual R12 runner initialization and all its linked-receipt assertions.
// Only the current preflight is synthetic; package, pointer, blobs and Git are real.
function runnerBootstrap(mutate=()=>{}){
  const head=git('rev-parse','HEAD'),bytes=fs.readFileSync(PACKAGE);
  const packageBlob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
  const preflight={...JSON.parse(receipt.rawEvidence.preflight),controlSha:head,packageBlob,runId:'1',d07CarryForward:verifyCarry(receipt,pkg.materialization)};
  mutate(preflight);
  const env={HOSTING_URL:pkg.materialization.origin,FOCAL_SOURCE:pkg.sourceSha,EXPECTED_HR_REVISION:pkg.materialization.hrRevision,GITHUB_RUN_ID:'1',GITHUB_SHA:head,
    CXORBIA_I3_INDEPENDENT_SESSION_PROOF:'YES_PAULA_20261029_DEV',CXORBIA_I3_SESSION_MODE:pkg.mode,CXORBIA_I3_SESSION_PACKAGE:PACKAGE,CXORBIA_I3_SESSION_PREFLIGHT:'LOCAL_SYNTHETIC_PREFLIGHT',PHASEA_LIVE_OUT:tmp};
  const io={...fs,readFileSync:(file,...args)=>file==='LOCAL_SYNTHETIC_PREFLIGHT'?JSON.stringify(preflight):fs.readFileSync(file,...args)};
  const code=runner.slice(0,runner.indexOf('fs.mkdirSync(OUT,{recursive:true});')).replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.url',JSON.stringify(pathToFileURL(path.resolve(RUNNER)).href));
  return new Function('assert','fs','createHash','path','execFileSync','process',code+';return d07CarryProof;')(assert,io,createHash,path,execFileSync,{env});
}
test('actual runner R12 bootstrap accepts real graph and verified linked historical evidence',()=>assert.equal(runnerBootstrap().executed,false));
for(const [label,mutate] of [
  ['control',p=>p.controlSha='0'.repeat(40)],['package blob',p=>p.packageBlob='0'.repeat(40)],
  ['source',p=>p.sourceSha='0'.repeat(40)],['tree',p=>p.sourceTree='0'.repeat(40)],
  ['HR',p=>p.hrRevision='0'.repeat(64)],['runtime',p=>p.runtimeDigest='sha256:'+'0'.repeat(64)],
  ['Hosting',p=>p.hostingVersion+='wrong'],['rules',p=>p.rulesetName+='wrong'],
  ['owner',p=>p.servedOwnerBlobs['app/modules/finanzas.js']='0'.repeat(40)],
  ['D07 execution',p=>p.d07CarryForward.executed=true],['full closure',p=>p.d07CarryForward.fullTaskClosed=true],
  ['CORS write',p=>p.providerConfigWrites=1],['CORS changed',p=>p.storageCors.changed=true]
])test('actual runner bootstrap rejects synthetic preflight drift '+label,()=>assert.throws(()=>runnerBootstrap(mutate)));

test('CORS drift and direct PATCH transport fail before any request is issued',()=>{
  let patches=0;
  const CONTRACT={d07:{corsChanges:false},scope:{providerConfigWritesMax:0}};
  const corsBranch=between(control,'      if(!beforeCors.some(rule=>corsKey(rule)===expectedKey)){','\n      const afterBucket=');
  assert.throws(()=>new Function('assert','CONTRACT','beforeCors','corsKey','expectedKey','expectedCors','corsUrl','token','curlPatchJson',corsBranch)(assert,CONTRACT,[],x=>x,'EXPECTED',{},'https://invalid.local/','local-not-a-token',()=>{patches++;}),/D07_CARRY_CORS_DRIFT_NO_WRITE_AUTHORIZED/);
  const transport=between(control,'    const curlPatchJson=(url,token,body)=>{','\n    checkpoint(\'PREFLIGHT_RUNTIME\');');
  const patch=new Function('assert','CONTRACT','invoke',transport+';return curlPatchJson;')(assert,CONTRACT,()=>{patches++;});
  assert.throws(()=>patch('https://invalid.local/','local-not-a-token',{}),/D07_CARRY_CORS_PATCH_FORBIDDEN/);assert.equal(patches,0);
});

// Optional real local Chromium DOM tests. CI already installs Playwright; local
// execution may point to an installed module and browser without changing product.
let playwright;
try{const require=createRequire(import.meta.url);playwright=require(process.env.CXORBIA_C04_PLAYWRIGHT_MODULE||'playwright');}catch{}
test('actual DOM callback: old selector reproduces failure; corrected selector preserves negative cases', {skip:!playwright},async()=>{
  const browser=await playwright.chromium.launch({headless:true,...(process.env.CXORBIA_C04_BROWSER?{executablePath:process.env.CXORBIA_C04_BROWSER}:{})});
  try{
    const context=await browser.newContext();let network=0;await context.route('**/*',r=>{network++;return r.abort();});const page=await context.newPage();
    const from=runner.indexOf('page.evaluate(',runner.indexOf('async function visibleFinanceRows('))+'page.evaluate('.length;
    const through=runner.indexOf('},{accounts:model.accounts',from)+1;const callback=runner.slice(from,through);
    const old=callback.replaceAll("semanticText(n)==='Moneda '","text(n)==='Moneda '").replaceAll("semanticText(n.querySelector('.k-l'))", "text(n.querySelector('.k-l'))");
    const model={accounts:[{id:'qa-account',kind:'cxc',marker:'QA CXC',country:'GT',currency:'Q',balance:.6}],movements:[{id:'qa-movement',concept:'QA cobro',country:'GT',currency:'Q',amount:.4}],income:[{currency:'Q',amount:125.25},{currency:'L',amount:2300.5}]};
    function html(change={}){
      const block=cur=>`<section><div class="heading">Moneda ${cur}</div><div class="grid"><div class="kpi" ${change.hidden?'style="display:none"':''}><div class="k-l">Ingresos oper.</div><div class="k-v">${cur} ${cur==='Q'?(change.amount||'125.25'):'2,300.5'}</div></div>${change.duplicateTile&&cur==='Q'?'<div class="kpi"><div class="k-l">Ingresos oper.</div><div class="k-v">Q 125.25</div></div>':''}</div></section>`;
      return `<style>.heading,.k-l{text-transform:uppercase}.grid{display:grid}</style><button data-scope="global" class="${change.scope?'btn-ghost':'btn-pr'}">Global</button><div id="view">${change.missing?'':block('Q')}${block('L')}${change.duplicate?block('Q'):''}<div class="cxcRow"><div><button data-cxdet="cxc:qa-account">Detalle</button><b>QA CXC</b><div>GT · open</div></div><div><b>Q ${change.account?'9':'0.6'}</b></div></div><table><tr><td>date</td><td><b>QA cobro</b></td><td></td><td></td><td>${change.movement?'HN':'GT'}</td><td>+ Q 0.4</td><td><button data-delm="qa-movement">x</button></td></tr></table></div>`;
    }
    const evaluate=code=>page.evaluate(new Function('return ('+code+');')(),model);
    const accepted=p=>p.globalSelected&&[...p.accountRows,...p.movementRows].every(x=>x.unique&&x.visible&&x.marker&&x.country&&x.money)&&p.kpis.every(x=>x.unique&&x.visible&&x.unchanged);
    await page.setContent(html());assert.equal(accepted(await evaluate(old)),false);assert.equal(accepted(await evaluate(callback)),true);
    for(const change of [{amount:'125.65'},{amount:'L 125.25'},{duplicate:true},{duplicateTile:true},{missing:true},{hidden:true},{scope:true},{account:true},{movement:true}]){
      await page.setContent(html(change));assert.equal(accepted(await evaluate(callback)),false,JSON.stringify(change));
    }
    assert.equal(network,0);await context.close();
  }finally{await browser.close();}
});
