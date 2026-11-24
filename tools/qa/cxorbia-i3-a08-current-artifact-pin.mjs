#!/usr/bin/env node
// QA control only. Select the canonical *materialized* receipt, never a historical alias.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const str=x=>String(x??'').trim();
const need=(ok,code)=>{if(!ok)throw Error('RELEASE_COMPOSITION_FAILURE:A08_'+code);};
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const SHA=/^[a-f0-9]{40}$/,HEX=/^[a-f0-9]{64}$/;
const materialKeys=['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','firestoreRuleset'];
const sourceOf=x=>str(x?.source?.sha||x?.sourceSha);
const treeOf=x=>str(x?.source?.tree||x?.sourceTree);
export function normalizeA08Pin(current,descriptor,receipt){
  need(current.production==='DO_NOT_TOUCH'&&current.authorizationI4===false,'DEV_AUTHORITY_REQUIRED');
  const source=str(current.productSourceSha),tree=str(current.productTree||current.productTreeAuthority);
  need(SHA.test(source)&&SHA.test(tree),'SOURCE_TUPLE_REQUIRED');
  need(descriptor.productSourceSha===source&&descriptor.productTreeAuthority===tree,'DESCRIPTOR_SOURCE_DESYNC');
  if(current.productTreeAuthority)need(current.productTreeAuthority===tree,'CURRENT_TREE_ALIAS_DESYNC');
  const c=current.currentMaterialization,d=descriptor.currentMaterialization;
  need(c&&d&&c.sourceSha===source&&c.sourceTree===tree,'CURRENT_SOURCE_NOT_MATERIALIZED');
  for(const key of materialKeys)need(str(c[key])&&c[key]===d[key],'MATERIALIZATION_DESYNC_'+key.toUpperCase());
  const receiptPath=str(c.materializationReceiptPath);
  need(/^docs\/checkpoints\/[A-Za-z0-9_.-]+\.json$/.test(receiptPath)&&receiptPath===d.materializationReceiptPath,'RECEIPT_PATH_REQUIRED');
  need(sourceOf(receipt)===source&&treeOf(receipt)===tree,'RECEIPT_SOURCE_DESYNC');
  for(const alias of [receipt.sourceSha,receipt.materialization?.sourceSha,receipt.identityBefore?.sourceSha,receipt.identityAfter?.sourceSha])
    if(alias!==undefined)need(alias===source,'RECEIPT_SOURCE_ALIAS_DESYNC');
  for(const alias of [receipt.sourceTree,receipt.materialization?.sourceTree,receipt.identityBefore?.sourceTree,receipt.identityAfter?.sourceTree])
    if(alias!==undefined)need(alias===tree,'RECEIPT_TREE_ALIAS_DESYNC');
  need(/^PASS_/.test(str(receipt.decision))&&receipt.production===false,'RECEIPT_NOT_ACCEPTED_DEV');
  need(receipt.i4Authorized!==true&&receipt.phaseAComplete!==true&&receipt.terminalCertified!==true,'NONTERMINAL_RECEIPT_REQUIRED');
  const material=receipt.materialization||receipt.identityAfter;
  need(material&&typeof material==='object','RECEIPT_MATERIALIZATION_REQUIRED');
  for(const key of materialKeys){
    if(material[key]!==undefined)need(material[key]===c[key],'RECEIPT_MATERIALIZATION_DESYNC_'+key.toUpperCase());
    if(['runtimeRevision','runtimeDigest','hostingVersion','firestoreRuleset'].includes(key))
      need(str(material[key])&&material[key]===c[key],'RECEIPT_RUNTIME_REQUIRED_'+key.toUpperCase());
  }
  for(const key of ['sourceHostedExact','runtimeTrafficExact','productionUnchanged'])
    need((receipt[key]??material[key])===true&&c[key]===true,'RECEIPT_'+key.toUpperCase()+'_NOT_PROVEN');
  need(/^cxorbia-live-hr-dev-\d+-[a-z0-9]+$/.test(c.runtimeRevision),'RUNTIME_NOT_DEV');
  need(/^sha256:[a-f0-9]{64}$/.test(c.runtimeDigest),'RUNTIME_DIGEST_REQUIRED');
  need(/^sites\/cxorbia-backend-dev\/versions\/[a-z0-9]+$/.test(c.hostingVersion),'HOSTING_NOT_DEV');
  need(/^projects\/cxorbia-backend-dev\/rulesets\/[a-z0-9-]+$/.test(c.firestoreRuleset),'FIRESTORE_RULESET_REQUIRED');
  const assets=receipt.servedSha256;
  need(assets&&typeof assets==='object'&&!Array.isArray(assets),'SERVED_HASHES_REQUIRED');
  const entries=Object.entries(assets);
  need(entries.length===41&&receipt.verifiedServedAssetCount===41&&c.verifiedServedAssetCount===41,'EXACT_41_ASSETS_REQUIRED');
  for(const [file,value] of entries)need(/^[A-Za-z0-9_./-]+$/.test(file)&&!file.startsWith('/')&&!file.includes('..')&&HEX.test(value),'SERVED_HASH_INVALID');
  const hr=str(receipt.hrRevisionAfter||receipt.hrRevisionAfterMetadata||receipt.canonicalIdReadback?.revision||material.hrRevision||c.hrRevision);
  need(HEX.test(hr),'OBSERVED_HR_REVISION_REQUIRED');
  return {schemaVersion:'cxorbia.i3.a08.current-artifact-pin.v1',decision:'PASS_A08_CURRENT_ARTIFACT_PIN',
    sourceSha:source,sourceTree:tree,receiptPath,
    runtimeRevision:c.runtimeRevision,runtimeDigest:c.runtimeDigest,hostingVersion:c.hostingVersion,
    firestoreRuleset:c.firestoreRuleset,observedHrRevision:hr,
    servedSha256:assets,verifiedServedAssetCount:41,production:false,i4Authorized:false,fullDomain:false};
}

export function loadA08Pin(repoRoot=process.cwd()){
  const git=args=>execFileSync('git',args,{cwd:repoRoot,encoding:'utf8',maxBuffer:16*1024*1024,stdio:['ignore','pipe','ignore']}).trim();
  const readTracked=file=>{
    const bytes=fs.readFileSync(path.join(repoRoot,file));
    const recorded=execFileSync('git',['show','HEAD:'+file],{cwd:repoRoot,maxBuffer:16*1024*1024,stdio:['ignore','pipe','ignore']});
    need(hash(bytes)===hash(recorded),'UNCOMMITTED_CONTROL_'+file.replace(/[^A-Za-z0-9]/g,'_').toUpperCase());
    return JSON.parse(bytes);
  };
  const current=readTracked('CXORBIA_RECOVERY_EXECUTION_CURRENT.json');
  const descriptor=readTracked('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json');
  const receiptPath=str(current.currentMaterialization?.materializationReceiptPath);
  need(/^docs\/checkpoints\/[A-Za-z0-9_.-]+\.json$/.test(receiptPath),'CANONICAL_RECEIPT_PATH_REQUIRED');
  const pin=normalizeA08Pin(current,descriptor,readTracked(receiptPath));
  need(git(['rev-parse',pin.sourceSha+'^{tree}'])===pin.sourceTree,'SOURCE_TREE_MISMATCH');
  need(current.moduleTruthPath===descriptor.moduleTruthPath,'MATRIX_ALIAS_DESYNC');
  const matrix=readTracked(descriptor.moduleTruthPath);
  need(matrix.productSource?.sha===pin.sourceSha&&matrix.productSource?.treeSha===pin.sourceTree&&matrix.modules?.length===21,'MATRIX_SOURCE_DESYNC');
  const domains=new Set(['auth-protected-data-runtime','base-router-shell-cache','core-config-data-router-permissions']);
  const owners=[...new Set(matrix.modules.filter(x=>domains.has(x.domain)).flatMap(x=>x.owners||[]).concat([
    'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','app/core/backend-hr-source-bridge.js',
    'backend/runtime/hr-live-service/server.mjs','backend/runtime/hr-live-service/user-admin.mjs','firestore.rules','storage.rules']))].sort();
  need(owners.length>=15,'FOCAL_OWNER_SET_INCOMPLETE');
  git(['diff','--exit-code',pin.sourceSha,'HEAD','--',...owners]);
  for(const [file,digest] of Object.entries(pin.servedSha256)){
    const bytes=execFileSync('git',['show',pin.sourceSha+':app/'+file],{cwd:repoRoot,maxBuffer:4*1024*1024,stdio:['ignore','pipe','ignore']});
    need(hash(bytes)===digest,'SERVED_HASH_NOT_SOURCE');
  }
  return {...pin,controlHead:git(['rev-parse','HEAD']),receiptGitBlob:git(['rev-parse','HEAD:'+receiptPath]),ownerPaths:owners};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{
    const pin=loadA08Pin();
    const out=process.env.CXORBIA_A08_PIN_PATH||'.tmp/cxorbia-i3-two-keepers-role-e2e-readonly/current-artifact-pin.json';
    fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(pin,null,2)+'\n');
    if(process.env.GITHUB_ENV)fs.appendFileSync(process.env.GITHUB_ENV,[
      'CXORBIA_PRODUCT_SOURCE_SHA='+pin.sourceSha,'CXORBIA_PRODUCT_SOURCE_TREE='+pin.sourceTree,
      'CXORBIA_HR_REVISION='+pin.observedHrRevision,'CXORBIA_ROLE_E2E_RECEIPT_PATH='+pin.receiptPath,
      'CXORBIA_A08_PIN_PATH='+out].join('\n')+'\n');
    console.log(JSON.stringify({decision:pin.decision,sourceSha:pin.sourceSha,sourceTree:pin.sourceTree,receiptPath:pin.receiptPath,receiptGitBlob:pin.receiptGitBlob}));
  }catch(error){
    const matched=str(error?.message).match(/(?:RELEASE_COMPOSITION_FAILURE:A08_[A-Z0-9_]+)/);
    console.error(matched?.[0]||'RELEASE_COMPOSITION_FAILURE:A08_PIN_UNAVAILABLE');process.exitCode=1;
  }
}
