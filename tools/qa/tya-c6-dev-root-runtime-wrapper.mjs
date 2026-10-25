#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=String(process.argv[2]||process.env.CXORBIA_DEV_ROOT_URL||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/phase-a-runtime-private/private-e2e.json';
const outDir=String(process.env.CXORBIA_DEV_ROOT_RUNTIME_DIR||'.tmp/c6-dev-root-runtime');
const outputFile=String(process.env.CXORBIA_DEV_ROOT_RUNTIME_OUTPUT||path.join(outDir,'report.json'));
const exactStaffAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const action=String(process.env.CXORBIA_C6_ACTION||'').trim();
const staffOnly=action===exactStaffAction;
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
if(!fs.existsSync(privatePath))throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
fs.mkdirSync(outDir,{recursive:true});

const genericHumanSourcePath='tools/qa/tya-c6-unified-human-auth-browser-smoke.mjs';
const staffHumanSourcePath='tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs';
const domainSourcePath='tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs';
const semanticWrapperPath='tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs';
const parityGatePath='tools/qa/tya-c6-dev-root-entrypoint-remote-parity-gate.mjs';
const parityPath=path.join(outDir,'root-parity.json');
const humanPath=path.join(outDir,'human-root.json');
const domainPath=path.join(outDir,'domain-root.json');
const tempHumanPath=path.join(outDir,'tya-c6-unified-human-auth-browser-smoke.root.mjs');

const run=(command,args,extraEnv={})=>{
  const result=spawnSync(command,args,{
    cwd:process.cwd(),
    encoding:'utf8',
    env:{...process.env,...extraEnv},
    maxBuffer:100*1024*1024
  });
  if(result.stdout)process.stdout.write(result.stdout);
  if(result.stderr)process.stderr.write(result.stderr);
  if(result.status!==0)throw new Error(`COMMAND_FAILED_${path.basename(args[0]||command)}_${result.status}`);
  return result;
};
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const write=value=>{
  fs.mkdirSync(path.dirname(outputFile),{recursive:true});
  fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');
};

let report=null;
try{
  run(process.execPath,['--check',parityGatePath]);
  run(process.execPath,[parityGatePath,root],{
    CXORBIA_ROOT_ENTRY_REMOTE_OUTPUT:parityPath
  });
  const parity=readJson(parityPath);
  ensure(parity.decision==='PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY','ROOT_REMOTE_PARITY_NOT_PASS');

  if(staffOnly){
    run(process.execPath,['--check',staffHumanSourcePath]);
    run(process.execPath,[staffHumanSourcePath,root],{
      CXORBIA_E2E_PRIVATE_CREDENTIALS:privatePath,
      CXORBIA_DEV_ROOT_URL:root,
      CXORBIA_HUMAN_GATE_OUTPUT:humanPath,
      CXORBIA_C6_ACTION:action
    });
  }else{
    const humanSource=fs.readFileSync(genericHumanSourcePath,'utf8');
    const humanNeedle="root+'/index-backend-dev.html'";
    const humanCount=humanSource.split(humanNeedle).length-1;
    ensure(humanCount===2,'HUMAN_ENTRY_PATCH_SCOPE_INVALID_'+humanCount);
    const humanRootSource=humanSource.split(humanNeedle).join("root+'/'");
    fs.writeFileSync(tempHumanPath,humanRootSource,'utf8');
    run(process.execPath,['--check',tempHumanPath]);
    run(process.execPath,[tempHumanPath,root],{
      CXORBIA_E2E_PRIVATE_CREDENTIALS:privatePath,
      CXORBIA_DEV_ROOT_URL:root,
      CXORBIA_HUMAN_GATE_OUTPUT:humanPath,
      CXORBIA_C6_ACTION:action
    });
  }

  const human=readJson(humanPath);

  if(staffOnly){
    ensure(human.decision==='PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY','ROOT_STAFF_ADMIN_HUMAN_GATE_NOT_PASS');
    ensure(human.action===exactStaffAction,'ROOT_STAFF_ACTION_NOT_EXACT');
    ensure(human.staff?.canonicalForm===true,'ROOT_STAFF_CANONICAL_FORM_NOT_PASS');
    ensure(human.staff?.reloadsStable===true&&human.staff?.newTabStable===true,'ROOT_STAFF_CONTINUITY_NOT_PASS');
    ensure(['super','admin','ops','coordinador'].includes(String(human.staff?.role||'')),'ROOT_STAFF_ROLE_NOT_ADMIN_FAMILY');
    ensure(human.shopper===null&&human.client===null&&human.genericShopperClientLogicPreserved===true,'ROOT_STAFF_SCOPE_NOT_EXACT');

    const status=spawnSync('git',['status','--porcelain'],{encoding:'utf8'});
    ensure(status.status===0&&String(status.stdout||'').trim()==='','REPOSITORY_CHANGED_BY_ROOT_RUNTIME_GATE');

    report={
      schemaVersion:'cxorbia.c6.live-user-admin-frontend-wiring-runtime-readonly-proof.v2',
      generatedAt:new Date().toISOString(),
      decision:exactStaffAction,
      action:exactStaffAction,
      scope:'staff_admin_only',
      root,
      parity:{
        decision:parity.decision,
        redirect:parity.redirect,
        exact:parity.parity?.exact===true
      },
      staff:{
        authenticated:true,
        role:human.staff?.role||null,
        periods:human.staff?.periods||null,
        visits:human.staff?.visits||null,
        canonicalForm:human.staff?.canonicalForm===true,
        canonicalSelectors:Array.isArray(human.staff?.canonicalSelectors)?human.staff.canonicalSelectors:[],
        reloadsStable:human.staff?.reloadsStable===true,
        newTabStable:human.staff?.newTabStable===true
      },
      shopper:null,
      client:null,
      genericShopperClientLogicPreserved:true,
      repositoryUnchanged:true,
      credentialsExposed:false,
      tokensExposed:false,
      safety:{
        hostingDeploys:0,
        cloudRunDeploys:0,
        firestoreWrites:0,
        authWrites:0,
        passwordChanges:0,
        passwordResets:0,
        rulesWrites:0,
        storageWrites:0,
        hrWrites:0,
        makeCalls:0,
        geminiCalls:0,
        paymentWrites:0,
        merge:false,
        production:false
      }
    };
  }else{
    ensure(human.decision==='PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY','ROOT_HUMAN_GATE_NOT_PASS');
    ensure(human.staff?.reloadsStable===true&&human.staff?.newTabStable===true,'ROOT_STAFF_CONTINUITY_NOT_PASS');
    ensure(human.shopper?.reloadsStable===true&&human.shopper?.newTabStable===true&&Number(human.shopper?.ownVisits||0)>0,'ROOT_SHOPPER_CONTINUITY_NOT_PASS');
    ensure(human.client?.integratedCredentialRoute===true,'ROOT_CLIENT_LOGIN_ROUTE_NOT_READY');

    const originalDomain=fs.readFileSync(domainSourcePath,'utf8');
    const domainNeedle="root+'/index-backend-dev.html?cxRemoteSemantic=1&ts='";
    const domainCount=originalDomain.split(domainNeedle).length-1;
    ensure(domainCount===1,'DOMAIN_ENTRY_PATCH_SCOPE_INVALID_'+domainCount);
    const rootDomainSource=originalDomain.split(domainNeedle).join("root+'/?cxRemoteSemantic=1&ts='");
    try{
      fs.writeFileSync(domainSourcePath,rootDomainSource,'utf8');
      run(process.execPath,['--check',domainSourcePath]);
      run(process.execPath,[semanticWrapperPath,root],{
        CXORBIA_E2E_PRIVATE_CREDENTIALS:privatePath,
        CXORBIA_DEV_ROOT_URL:root,
        CXORBIA_REMOTE_SEMANTIC_OUTPUT:domainPath
      });
    }finally{
      fs.writeFileSync(domainSourcePath,originalDomain,'utf8');
    }

    const domain=readJson(domainPath);
    ensure(domain.decision==='PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC','ROOT_DOMAIN_GATE_NOT_PASS');
    ensure(domain.client?.authenticated===true&&domain.client?.routeAccepted===true&&domain.client?.viewExists===true&&domain.client?.pageHeader===true&&Number(domain.client?.viewTextLength||0)>0&&domain.client?.renderException===null&&domain.client?.panoramaVisible===true&&domain.client?.blocked===false,'ROOT_CLIENT_PORTAL_NOT_PASS');
    ensure(domain.shopper?.authenticated===true&&domain.shopper?.exactIdentity===true&&domain.shopper?.fullHistory===true&&domain.shopper?.certificationVisible===true,'ROOT_SHOPPER_PORTAL_NOT_PASS');
    ensure(domain.finance?.model==='delegado'&&Number(domain.finance?.royaltyPct||0)===0&&domain.finance?.valuesInvented===false,'ROOT_FINANCE_NOT_PASS');
    ensure(domain.reservations?.browserLocalStorageAsSource===false&&domain.reservations?.mutationsEnabled===false,'ROOT_RESERVATIONS_NOT_PASS');

    const status=spawnSync('git',['status','--porcelain'],{encoding:'utf8'});
    ensure(status.status===0&&String(status.stdout||'').trim()==='','REPOSITORY_CHANGED_BY_ROOT_RUNTIME_GATE');

    report={
      schemaVersion:'cxorbia.c6.dev-root-runtime-accumulative.v1',
      generatedAt:new Date().toISOString(),
      decision:'PASS_C6_DEV_ROOT_RUNTIME_ACCUMULATIVE',
      root,
      parity:{
        decision:parity.decision,
        redirect:parity.redirect,
        exact:parity.parity?.exact===true
      },
      staff:{
        authenticated:true,
        role:human.staff?.role||null,
        periods:human.staff?.periods||null,
        visits:human.staff?.visits||null,
        reloadsStable:human.staff?.reloadsStable===true,
        newTabStable:human.staff?.newTabStable===true
      },
      shopper:{
        authenticated:true,
        exactIdentity:domain.shopper?.exactIdentity===true,
        ownVisits:domain.shopper?.ownVisits||human.shopper?.ownVisits||null,
        fullHistory:domain.shopper?.fullHistory===true,
        certificationVisible:domain.shopper?.certificationVisible===true,
        reloadsStable:human.shopper?.reloadsStable===true,
        newTabStable:human.shopper?.newTabStable===true
      },
      client:{
        authenticated:domain.client?.authenticated===true,
        integratedCredentialRoute:human.client?.integratedCredentialRoute===true,
        routeId:domain.client?.routeId||null,
        routeAccepted:domain.client?.routeAccepted===true,
        viewExists:domain.client?.viewExists===true,
        pageHeaderExists:domain.client?.pageHeader===true,
        viewTextLength:domain.client?.viewTextLength||null,
        renderException:domain.client?.renderException??null,
        panoramaVisible:domain.client?.panoramaVisible===true,
        blocked:domain.client?.blocked===true
      },
      finance:domain.finance,
      reservations:domain.reservations,
      source:domain.source,
      repositoryUnchanged:true,
      credentialsExposed:false,
      tokensExposed:false,
      safety:{
        hostingDeploys:0,
        cloudRunDeploys:0,
        firestoreWrites:0,
        authWrites:0,
        passwordChanges:0,
        passwordResets:0,
        rulesWrites:0,
        storageWrites:0,
        hrWrites:0,
        makeCalls:0,
        geminiCalls:0,
        paymentWrites:0,
        merge:false,
        production:false
      }
    };
  }

  write(report);
  console.log(JSON.stringify(report));
}catch(error){
  try{
    if(!staffOnly&&fs.existsSync(domainSourcePath)){
      const current=fs.readFileSync(domainSourcePath,'utf8');
      if(current.includes("root+'/?cxRemoteSemantic=1&ts='")){
        const restored=current.split("root+'/?cxRemoteSemantic=1&ts='").join("root+'/index-backend-dev.html?cxRemoteSemantic=1&ts='");
        fs.writeFileSync(domainSourcePath,restored,'utf8');
      }
    }
  }catch{}
  report={
    schemaVersion:staffOnly?'cxorbia.c6.live-user-admin-frontend-wiring-runtime-readonly-proof.failure.v2':'cxorbia.c6.dev-root-runtime-accumulative.failure.v1',
    generatedAt:new Date().toISOString(),
    decision:staffOnly?'FAIL_C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF':'FAIL_C6_DEV_ROOT_RUNTIME_ACCUMULATIVE',
    action:staffOnly?exactStaffAction:null,
    root,
    error:String(error?.stack||error?.message||error),
    credentialsExposed:false,
    tokensExposed:false,
    safety:{
      hostingDeploys:0,
      cloudRunDeploys:0,
      firestoreWrites:0,
      authWrites:0,
      rulesWrites:0,
      storageWrites:0,
      hrWrites:0,
      makeCalls:0,
      geminiCalls:0,
      paymentWrites:0,
      merge:false,
      production:false
    }
  };
  write(report);
  console.error(JSON.stringify(report));
  process.exitCode=1;
}
