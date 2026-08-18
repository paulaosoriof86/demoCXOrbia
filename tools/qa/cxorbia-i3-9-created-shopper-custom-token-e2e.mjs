#!/usr/bin/env node
// Compatibility entrypoint retained because the existing PR workflow already invokes this file.
// The superseded custom-token diagnostic is intentionally not rerun. Under the exact current
// combined one-shot request this wrapper performs the single Hosting DEV deploy first, then
// delegates to the canonical visible username/password I3.9-I3.11 executor.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';

const argv=process.argv.slice(2);
const arg=(name,fallback=null)=>{const i=argv.indexOf(name);return i>=0?argv[i+1]:fallback;};
const requestPath=path.resolve(arg('--request',process.env.RUNNER_TEMP?`${process.env.RUNNER_TEMP}/i3-9-created-shopper-request.json`:'backend/requests/i3-9-10-11-visible-login-close.json'));
const outPath=path.resolve(arg('--out','.tmp/i3-9-created-shopper/result.json'));
const repo=process.cwd();
const read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const write=x=>{fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(x,null,2)+'\n','utf8');};
const run=(cmd,args,opts={})=>spawnSync(cmd,args,{cwd:opts.cwd||repo,encoding:'utf8',env:{...process.env,...(opts.env||{})},maxBuffer:50*1024*1024,stdio:opts.stdio||'pipe'});
const fail=(decision,blocker,extra={})=>write({schemaVersion:'cxorbia.i3.9-10-11.visible-login-close.result.v1',requestId:null,gateId:'I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE',status:'HOLD_BEFORE_PASSWORD_WRITE',decision,safety:{historicalShopperAccess:0,historicalShopperLogin:0,historicalShopperRecovery:0,historicalShopperReset:0,userCreates:0,userUpdates:0,claimWrites:0,authWrites:0,passwordChanges:0,passwordResets:0,firestoreWrites:0,hrWrites:0,financeWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,cloudRunDeploys:0,hostingDeployAttempts:Number(extra.hostingDeployAttempts||0),hostingDeploys:Number(extra.hostingDeploys||0),merge:false,production:false,passwordPersisted:false,credentialPersisted:false},blockers:[blocker],notes:extra.notes||[]});

let deployTree='';
try{
  const req=read(requestPath);
  const exactGate='I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE';
  const valid=req.schemaVersion==='cxorbia.i3.9-10-11.visible-login-close.request.v1'&&req.enabled===true&&req.consumed===false&&req.status==='authorized_execute_once'&&req.gateId===exactGate&&req.authorizedBy==='Paula'&&req.repository==='paulaosoriof86/demoCXOrbia'&&req.branch==='docs-tya-v6-v71-audit'&&Number(req.pullRequest)===7&&req.targetProject==='cxorbia-backend-dev'&&req.tenantId==='tya'&&req.projectId==='cinepolis'&&req.shopperId==='TYA_GT_393371F88D10F7A8'&&req.identityLinkId==='irl_fd0e52a9792ef088aa275fa90e27c77d'&&Number(req.allowedExecutions)===1&&Number(req.maxHostingDeploys)===1&&Number(req.maxPasswordChanges)===1&&Number(req.maxCloudRunDeploys)===0&&Number(req.maxCreateUsers)===0&&Number(req.maxClaimWrites)===0&&Number(req.maxFirestoreWrites)===0&&Number(req.passwordResetEmails)===0&&Number(req.historicalShopperAccess)===0&&req.noAutomaticRetry===true&&/^[a-f0-9]{40}$/.test(String(req.productTargetHeadSha||''));
  if(!valid){fail('HOLD_I3_9_10_11_REQUEST_INVALID','REQUEST_CONTRACT_INVALID');process.exit(2);}
  if(Number(process.env.GITHUB_RUN_ATTEMPT||1)!==1){fail('HOLD_I3_9_10_11_RERUN_FORBIDDEN','RUN_ATTEMPT_NOT_ONE');process.exit(2);}
  if(!process.env.GOOGLE_APPLICATION_CREDENTIALS||!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)){fail('HOLD_I3_9_10_11_PRIVATE_CREDENTIAL_MISSING','GOOGLE_APPLICATION_CREDENTIALS_MISSING');process.exit(2);}

  const head=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
  execFileSync('git',['merge-base','--is-ancestor',req.productTargetHeadSha,head],{cwd:repo});
  const appDelta=execFileSync('git',['diff','--name-only',req.productTargetHeadSha,head,'--','app/'],{cwd:repo,encoding:'utf8'}).trim();
  if(appDelta){fail('HOLD_I3_9_10_11_PRODUCT_SOURCE_DRIFT','APP_SOURCE_DRIFT_AFTER_AUTHORIZED_HEAD',{notes:[appDelta.slice(0,180)]});process.exit(2);}

  deployTree=path.join(process.env.RUNNER_TEMP||path.join(repo,'.tmp'),'cxorbia-i3-9-10-11-product-source');
  try{execFileSync('git',['worktree','remove','--force',deployTree],{cwd:repo,stdio:'ignore'});}catch{}
  execFileSync('git',['worktree','add','--detach',deployTree,req.productTargetHeadSha],{cwd:repo,stdio:'inherit'});
  const exact=execFileSync('git',['rev-parse','HEAD'],{cwd:deployTree,encoding:'utf8'}).trim();
  if(exact!==req.productTargetHeadSha)throw new Error('DEPLOY_TREE_SHA_MISMATCH');
  const index=fs.readFileSync(path.join(deployTree,'app/index-backend-dev.html'),'utf8');
  if(!index.includes('adapters/cxorbia-shopper-membership-wiring-v1.js'))throw new Error('SHOPPER_MEMBERSHIP_LOADER_NOT_IN_AUTHORIZED_SOURCE');
  const firebaserc=read(path.join(deployTree,'.firebaserc'));
  if(firebaserc.projects?.default!=='cxorbia-backend-dev'||firebaserc.targets?.['cxorbia-backend-dev']?.hosting?.['cxorbia-dev']?.[0]!=='cxorbia-backend-dev')throw new Error('FIREBASE_HOSTING_TARGET_MAPPING_INVALID');

  const install=run('npm',['install','--no-save','--ignore-scripts','--package-lock=false','firebase-tools@latest'],{stdio:'inherit'});
  if(install.status!==0){fail('HOLD_I3_9_FIREBASE_TOOLS_INSTALL_FAILED','FIREBASE_TOOLS_INSTALL_FAILED');process.exit(2);}
  const firebaseBin=path.join(repo,'node_modules','.bin',process.platform==='win32'?'firebase.cmd':'firebase');
  const deploy=run(firebaseBin,['deploy','--config','firebase.json','--only','hosting:cxorbia-dev','--project','cxorbia-backend-dev','--non-interactive'],{cwd:deployTree,stdio:'inherit'});
  if(deploy.status!==0){fail('HOLD_I3_9_HOSTING_DEPLOY_FAILED_NO_AUTOMATIC_RETRY','HOSTING_DEV_DEPLOY_FAILED',{hostingDeployAttempts:1,hostingDeploys:0});process.exit(2);}

  const executor=path.join(repo,'tools/qa/cxorbia-i3-9-10-11-visible-login-close.mjs');
  const execution=run(process.execPath,[executor,'--request',requestPath,'--source-root',deployTree,'--out',outPath],{env:{CXORBIA_HOSTING_DEPLOY_COUNT:'1'},stdio:'inherit'});
  process.exit(execution.status===0?0:2);
}catch(error){
  if(!fs.existsSync(outPath))fail('HOLD_I3_9_10_11_TECHNICAL_BEFORE_PASSWORD_WRITE','COMBINED_WRAPPER_TECHNICAL_ERROR',{notes:[String(error?.message||error).slice(0,220)]});
  process.exit(2);
}finally{
  if(deployTree){try{execFileSync('git',['worktree','remove','--force',deployTree],{cwd:repo,stdio:'ignore'});}catch{}}
}
