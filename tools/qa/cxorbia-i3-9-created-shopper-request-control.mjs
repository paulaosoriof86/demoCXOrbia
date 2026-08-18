#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const argv=process.argv.slice(2);
const arg=(n,f=null)=>{const i=argv.indexOf(n);return i>=0?argv[i+1]:f;};
const mode=arg('--mode','inspect');
const requestPath=path.resolve(repo,arg('--request','backend/requests/i3-9-10-11-visible-login-close.json'));
const resultPath=path.resolve(arg('--result',process.env.RUNNER_TEMP?`${process.env.RUNNER_TEMP}/i3-9-created-shopper-result.json`:path.join(repo,'.tmp/i3-9-created-shopper-result.json')));
const stagedPath=path.resolve(arg('--staged-request',process.env.RUNNER_TEMP?`${process.env.RUNNER_TEMP}/i3-9-created-shopper-request.json`:path.join(repo,'.tmp/i3-9-created-shopper-request.json')));
const stable=x=>JSON.stringify(x,null,2)+'\n';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const out=(k,v)=>{if(!process.env.GITHUB_OUTPUT)throw new Error('GITHUB_OUTPUT_REQUIRED');fs.appendFileSync(process.env.GITHUB_OUTPUT,`${k}=${v}\n`,'utf8');};
const sh=args=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();

if(mode==='inspect'){
  out('should_execute','false');
  if(!fs.existsSync(requestPath)){console.log('Combined I3 close request absent; skipped');process.exit(0);}
  const x=read(requestPath);
  let ok=x.schemaVersion==='cxorbia.i3.9-10-11.visible-login-close.request.v1'
    &&x.enabled===true&&x.consumed===false&&x.status==='authorized_execute_once'
    &&x.gateId==='I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE'
    &&x.authorizedBy==='Paula'
    &&x.repository==='paulaosoriof86/demoCXOrbia'&&x.branch==='docs-tya-v6-v71-audit'&&Number(x.pullRequest)===7
    &&x.targetProject==='cxorbia-backend-dev'&&x.tenantId==='tya'&&x.projectId==='cinepolis'
    &&x.shopperId==='TYA_GT_393371F88D10F7A8'&&x.visibleLogin==='i38-shopper-dev-20260817-01'
    &&x.identityLinkId==='irl_fd0e52a9792ef088aa275fa90e27c77d'
    &&Number(x.allowedExecutions)===1&&Number(x.maxHostingDeploys)===1&&Number(x.maxPasswordChanges)===1
    &&Number(x.maxCloudRunDeploys)===0&&Number(x.maxCreateUsers)===0&&Number(x.maxClaimWrites)===0&&Number(x.maxFirestoreWrites)===0
    &&Number(x.passwordResetEmails)===0&&Number(x.historicalShopperAccess)===0&&x.noAutomaticRetry===true
    &&/^[a-f0-9]{40}$/.test(String(x.productTargetHeadSha||''))&&/^[a-f0-9]{40}$/.test(String(x.executionTargetHeadSha||''));
  if(ok){
    try{
      const head=sh(['rev-parse','HEAD']);const parent=sh(['rev-parse','HEAD^']);
      const changed=sh(['diff','--name-only','HEAD^','HEAD']).split(/\r?\n/).filter(Boolean);
      const event=process.env.GITHUB_EVENT_PATH&&fs.existsSync(process.env.GITHUB_EVENT_PATH)?read(process.env.GITHUB_EVENT_PATH):null;
      ok=Number(process.env.GITHUB_RUN_ATTEMPT||1)===1
        &&process.env.GITHUB_EVENT_NAME==='pull_request'
        &&event?.action==='synchronize'
        &&String(event?.pull_request?.number||'')==='7'
        &&String(event?.pull_request?.head?.sha||'')===head
        &&parent===x.executionTargetHeadSha
        &&changed.length===1&&changed[0]==='backend/requests/i3-9-10-11-visible-login-close.json';
      if(ok){
        execFileSync('git',['merge-base','--is-ancestor',x.productTargetHeadSha,head],{cwd:repo});
        const appDelta=sh(['diff','--name-only',x.productTargetHeadSha,head,'--','app/']);
        if(appDelta)ok=false;
      }
    }catch{ok=false;}
  }
  out('should_execute',ok?'true':'false');
  if(ok){
    out('request_id',x.requestId);out('product_target_sha',x.productTargetHeadSha);
    fs.mkdirSync(path.dirname(stagedPath),{recursive:true});fs.copyFileSync(requestPath,stagedPath);
  }
  console.log(ok?'I3.9-I3.11 combined visible-login request executable once':'Combined I3 request not executable on this event');
  process.exit(0);
}

if(mode==='ensure-result'){
  if(fs.existsSync(resultPath))process.exit(0);
  const x={schemaVersion:'cxorbia.i3.9-10-11.visible-login-close.result.v1',requestId:process.env.REQUEST_ID||null,gateId:'I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE',targetProject:'cxorbia-backend-dev',status:'WORKFLOW_FAILED_BEFORE_RESULT',decision:'HOLD_I3_9_10_11_WORKFLOW_FAILED_BEFORE_RESULT',safety:{historicalShopperAccess:0,passwordChanges:0,passwordResets:0,userCreates:0,userUpdates:0,claimWrites:0,firestoreWrites:0,hrWrites:0,financeWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,cloudRunDeploys:0,hostingDeploys:0,merge:false,production:false},blockers:['WORKFLOW_FAILED_BEFORE_RESULT'],notes:[]};
  fs.mkdirSync(path.dirname(resultPath),{recursive:true});fs.writeFileSync(resultPath,stable(x),'utf8');process.exit(0);
}

throw new Error(`UNSUPPORTED_MODE:${mode}`);
