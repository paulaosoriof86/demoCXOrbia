#!/usr/bin/env node
/*
  CXOrbia source-lock verifier.

  Historical mode preserves the deterministic V110 union verification.
  Postproduction mode is selected only when the effective F10 postproduction
  overlay AND the exact source-successor lock exist. In that mode the frozen
  live release remains immutable while current source evolution is permitted
  only for an exact path + Git blob SHA allowlist. Any undeclared runtime path
  or blob mismatch fails closed.

  This tool is read-only: no provider calls, writes, imports, deploy or production mutation.
*/

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const args=process.argv.slice(2);
const manifestIdx=args.indexOf('--manifest');
const outIdx=args.indexOf('--out');
const manifestPath=manifestIdx>=0?args[manifestIdx+1]:'app/docs/MANIFEST-V110-UNION-EMPALME-R1.json';
const outDir=outIdx>=0?args[outIdx+1]:'.tmp/source-lock-v110-union';
const absoluteManifest=path.isAbsolute(manifestPath)?manifestPath:path.join(root,manifestPath);
const appRoot=path.join(root,'app');
const overlayPath=path.join(root,'backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json');
const successorPath=path.join(root,'backend/config/cxorbia-postprod-source-successor-lock-v1.json');

function sha256(buffer){return crypto.createHash('sha256').update(buffer).digest('hex');}
function git(a){return execFileSync('git',a,{encoding:'utf8'}).trim();}
function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function listFiles(directory,base=directory){
  const output=[];
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    const absolute=path.join(directory,entry.name);
    if(entry.isDirectory())output.push(...listFiles(absolute,base));
    else if(entry.isFile())output.push(path.relative(base,absolute).replace(/\\/g,'/'));
  }
  return output.sort();
}
function runtimeFiles(files){
  const exact=new Set(['app/index.html','app/index-backend-dev.html','app/app.js','app/manifest.webmanifest','app/sw.js']);
  const prefixes=['app/core/','app/modules/','app/styles/','app/adapters/','app/data/','app/demo/'];
  return files.filter(f=>exact.has(f)||prefixes.some(p=>f.startsWith(p))).sort();
}
function blobFor(file){return git(['hash-object','--',file]);}
function verifyBlobs(entries,kind){
  const mismatches=[];
  for(const entry of entries||[]){
    const file=String(entry.path||'').trim(),expected=String(entry.gitBlobSha||'').trim();
    if(!file||!expected){mismatches.push({path:file||null,kind,reason:'declaration_incomplete'});continue;}
    if(!fs.existsSync(path.join(root,file))){mismatches.push({path:file,kind,reason:'missing'});continue;}
    let actual='';try{actual=blobFor(file);}catch(error){mismatches.push({path:file,kind,reason:'hash_failed',error:String(error?.message||error)});continue;}
    if(actual!==expected)mismatches.push({path:file,kind,expectedGitBlobSha:expected,actualGitBlobSha:actual,reason:'blob_mismatch'});
  }
  return mismatches;
}
function writeOutputs(report){
  const absoluteOut=path.isAbsolute(outDir)?outDir:path.join(root,outDir);
  fs.mkdirSync(absoluteOut,{recursive:true});
  fs.writeFileSync(path.join(absoluteOut,'source-lock-v110-union-report.json'),JSON.stringify(report,null,2),'utf8');
  fs.writeFileSync(path.join(absoluteOut,'source-lock-v110-union-report.md'),[
    '# CXOrbia source lock','',
    `Decision: ${report.decision}`,
    `Mode: ${report.mode||'historical_v110'}`,
    `Head: ${report.head||'n/a'}`,
    `Frozen functional source: ${report.functionalSourceSha||'n/a'}`,
    `Runtime successor files: ${report.runtimeChangedCount??'n/a'}`,
    `Unexpected runtime files: ${report.unexpectedRuntimeCount??'n/a'}`,
    `Runtime blob mismatches: ${report.runtimeBlobMismatchCount??'n/a'}`,
    '',
    'No provider calls, writes, imports, deploy or production mutation.'
  ].join('\n'),'utf8');
}
function finish(report,pass){writeOutputs(report);console.log(JSON.stringify(report,null,2));process.exitCode=pass?0:1;}

// Effective postproduction mode: frozen live release + exact source successor.
if(fs.existsSync(overlayPath)&&fs.existsSync(successorPath)){
  let overlay,successor;
  try{overlay=readJson(overlayPath);successor=readJson(successorPath);}catch(error){
    finish({schemaVersion:'2.0.0',gate:'cxorbia-source-lock',mode:'postprod_successor',generatedAt:new Date().toISOString(),decision:'FAIL_POSTPROD_SOURCE_SUCCESSOR_LOCK',error:String(error?.message||error),safeState:{providerCalls:false,firestoreWrites:false,authWrites:false,imports:false,deploy:false,production:false}},false);
    process.exit();
  }
  const frozen=successor.frozenLiveRelease||{},production=overlay.productionState||{};
  let changed=[];try{changed=git(['diff','--name-only',`${frozen.functionalSourceSha}..HEAD`]).split(/\r?\n/).map(v=>v.trim()).filter(Boolean);}catch(error){
    finish({schemaVersion:'2.0.0',gate:'cxorbia-source-lock',mode:'postprod_successor',generatedAt:new Date().toISOString(),decision:'FAIL_POSTPROD_SOURCE_SUCCESSOR_LOCK',error:'git_diff_failed:'+String(error?.message||error),functionalSourceSha:frozen.functionalSourceSha,safeState:{providerCalls:false,firestoreWrites:false,authWrites:false,imports:false,deploy:false,production:false}},false);
    process.exit();
  }
  const actualRuntime=runtimeFiles(changed);
  const expectedRuntime=(successor.runtimeSuccessorExact||[]).map(e=>String(e.path||'').trim()).filter(Boolean).sort();
  const unexpectedRuntime=actualRuntime.filter(p=>!expectedRuntime.includes(p));
  const declaredButAbsent=expectedRuntime.filter(p=>!actualRuntime.includes(p));
  const runtimeBlobMismatches=verifyBlobs(successor.runtimeSuccessorExact,'runtime_successor');
  const criticalSourceBlobMismatches=verifyBlobs(successor.criticalSourceContractsExact,'critical_source_contract');
  const identityErrors=[];
  if(successor.repository!=='paulaosoriof86/demoCXOrbia')identityErrors.push('repository_mismatch');
  if(successor.branch!=='docs-tya-v6-v71-audit')identityErrors.push('branch_mismatch');
  if(!frozen.functionalSourceSha)identityErrors.push('functional_source_missing');
  if(production.functionalSourceSha!==frozen.functionalSourceSha)identityErrors.push('overlay_functional_source_mismatch');
  if(production.releaseId!==frozen.releaseId)identityErrors.push('overlay_release_id_mismatch');
  if(successor.policy?.sourceSuccessorDeployed!==false)identityErrors.push('source_successor_deployment_state_not_false');
  if(successor.policy?.deployAuthorized!==false)identityErrors.push('deploy_policy_not_false');
  const pass=!identityErrors.length&&!unexpectedRuntime.length&&!declaredButAbsent.length&&!runtimeBlobMismatches.length&&!criticalSourceBlobMismatches.length;
  const report={
    schemaVersion:'2.0.0',
    gate:'cxorbia-source-lock',
    mode:'postprod_successor',
    generatedAt:new Date().toISOString(),
    decision:pass?'PASS_POSTPROD_LIVE_RELEASE_PRESERVED_EXACT_SOURCE_SUCCESSOR':'FAIL_POSTPROD_SOURCE_SUCCESSOR_LOCK',
    lockId:successor.lockId,
    syncEpoch:overlay.effectiveState?.syncEpoch,
    liveReleaseId:frozen.releaseId,
    functionalSourceSha:frozen.functionalSourceSha,
    head:git(['rev-parse','HEAD']),
    sourceSuccessorDeployed:false,
    runtimeChangedFiles:actualRuntime,
    runtimeChangedCount:actualRuntime.length,
    expectedRuntimeFiles:expectedRuntime,
    unexpectedRuntime,
    unexpectedRuntimeCount:unexpectedRuntime.length,
    declaredButAbsent,
    runtimeBlobMismatches,
    runtimeBlobMismatchCount:runtimeBlobMismatches.length,
    criticalSourceBlobMismatches,
    criticalSourceBlobMismatchCount:criticalSourceBlobMismatches.length,
    identityErrors,
    historicalV110ManifestRetainedButNotCurrentEqualityAuthority:true,
    pass,
    policy:{exactPathAndBlobAllowlist:true,unexpectedRuntimeFilesBlocked:true,historicalV110ModeRetained:true},
    safeState:{appFilesModified:false,providerCalls:false,firestoreWrites:false,authWrites:false,imports:false,deploy:false,production:false}
  };
  finish(report,pass);
  process.exit();
}

// Historical V110 deterministic-union mode retained for old refs.
function isAllowedNonRuntimeAddition(relative){return relative.startsWith('docs/');}
if(!fs.existsSync(absoluteManifest)){console.error(`Missing V110 manifest: ${manifestPath}`);process.exit(2);}
const manifest=readJson(absoluteManifest);
const missing=[],mismatched=[],entries=[],manifestPaths=new Set();
for(const expected of manifest.files||[]){
  const relative=String(expected.path||'').replace(/\\/g,'/');manifestPaths.add(relative);
  const absolute=path.join(appRoot,relative);
  if(!fs.existsSync(absolute)){missing.push(relative);continue;}
  const bytes=fs.readFileSync(absolute),actualSha256=sha256(bytes),actualSize=bytes.length;
  if(actualSha256!==expected.sha256||actualSize!==expected.size)mismatched.push({path:relative,expectedSha256:expected.sha256,actualSha256,expectedSize:expected.size,actualSize});
  entries.push(`${relative}:${actualSha256}`);
}
const declaredExclusions=new Set((manifest.exclusionsDeclared||[]).map(entry=>String(entry.path||'').replace(/\\/g,'/')));
const actualAppFiles=listFiles(appRoot);
const allowedNonRuntimeAdditions=actualAppFiles.filter(relative=>!manifestPaths.has(relative)&&!declaredExclusions.has(relative)&&isAllowedNonRuntimeAddition(relative));
const unexpectedRuntime=actualAppFiles.filter(relative=>!manifestPaths.has(relative)&&!declaredExclusions.has(relative)&&!isAllowedNonRuntimeAddition(relative));
const excludedMissing=[...declaredExclusions].filter(relative=>!fs.existsSync(path.join(appRoot,relative)));
const aggregateSha256=sha256(Buffer.from(entries.join('\n'),'utf8'));
const aggregateMatches=aggregateSha256===manifest.aggregateSha256;
const fileCountMatches=Number(manifest.fileCount)===(manifest.files||[]).length;
const runtimeInventoryMatches=unexpectedRuntime.length===0&&excludedMissing.length===0;
const pass=missing.length===0&&mismatched.length===0&&aggregateMatches&&fileCountMatches&&runtimeInventoryMatches;
const report={
  schemaVersion:'1.1.0',gate:'cxorbia-source-lock-v110-union',mode:'historical_v110',generatedAt:new Date().toISOString(),decision:pass?'PASS_V110_UNION_SOURCE_LOCK':'FAIL_V110_UNION_SOURCE_LOCK',package:manifest.package,baseline:manifest.baseline,sourceZipSha256:manifest.sourceZipSha256,expectedFileCount:manifest.fileCount,manifestEntryCount:(manifest.files||[]).length,declaredExclusionCount:declaredExclusions.size,actualAppFileCount:actualAppFiles.length,verifiedFileCount:entries.length,missingCount:missing.length,mismatchCount:mismatched.length,allowedNonRuntimeAdditionCount:allowedNonRuntimeAdditions.length,unexpectedRuntimeCount:unexpectedRuntime.length,excludedMissingCount:excludedMissing.length,aggregateExpected:manifest.aggregateSha256,aggregateActual:aggregateSha256,aggregateMatches,fileCountMatches,runtimeInventoryMatches,missing,mismatched,allowedNonRuntimeAdditions,unexpectedRuntime,excludedMissing,pass,policy:{manifestFilesRemainHashLocked:true,unexpectedRuntimeFilesBlocked:true,newAppDocsAllowed:true},safeState:{appFilesModified:false,providerCalls:false,firestoreWrites:false,authWrites:false,imports:false,deploy:false,production:false}
};
finish(report,pass);
