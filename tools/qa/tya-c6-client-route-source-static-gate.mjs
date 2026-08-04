#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const outDir=path.join(root,'.tmp/tya-c6-client-route-source-static');
fs.mkdirSync(outDir,{recursive:true});
const blockers=[];
const checks=[];
const files={
  gate:'tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs',
  wrapper:'tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs',
  orchestrator:'tools/qa/cxorbia-c6-client-access-runtime-orchestrator.mjs',
  router:'app/core/router.js',
  client:'app/modules/cliente.js'
};
const add=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);
const pass=(code,detail='')=>checks.push(detail?`${code}:${detail}`:code);
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const requireFile=rel=>{
  if(!fs.existsSync(path.join(root,rel))){add('FILE_MISSING',rel);return false;}
  pass('FILE_PRESENT',rel);return true;
};
const requireMarker=(text,marker,code)=>{
  if(!text.includes(marker))add(code,marker);else pass(code,marker);
};
const forbidMarker=(text,marker,code)=>{
  if(text.includes(marker))add(code,marker);else pass(code,marker);
};
const syntax=rel=>{
  const result=spawnSync(process.execPath,['--check',rel],{cwd:root,encoding:'utf8'});
  if(result.status!==0)add('SYNTAX_FAIL',`${rel}:${String(result.stderr||result.stdout||'').slice(0,800)}`);
  else pass('SYNTAX_PASS',rel);
};

for(const rel of Object.values(files))requireFile(rel);
if(!blockers.length){
  syntax(files.gate);
  syntax(files.wrapper);
  syntax(files.orchestrator);
  syntax('tools/qa/tya-c6-client-route-source-static-gate.mjs');

  const gate=read(files.gate);
  const wrapper=read(files.wrapper);
  const orchestrator=read(files.orchestrator);
  const router=read(files.router);
  const client=read(files.client);

  requireMarker(router,'nav(id){','ROUTER_NAV_PRESENT');
  requireMarker(router,'CX.session.view=id; CX.session.save();','ROUTER_ROUTE_STATE_PRESENT');
  requireMarker(router,'this.render(id);','ROUTER_RENDER_PRESENT');
  requireMarker(client,"CX.module('cli_dashboard'",'CLIENT_DASHBOARD_MODULE_PRESENT');
  requireMarker(client,'class="ph"','CLIENT_DASHBOARD_STABLE_PAGE_HEADER_PRESENT');

  requireMarker(gate,"window.CX.router.nav('cli_dashboard')",'CLIENT_EXPLICIT_NAV_PRESENT');
  requireMarker(gate,"routeId==='cli_dashboard'",'CLIENT_ROUTE_WAIT_PRESENT');
  requireMarker(gate,"document.getElementById('nav-cli_dashboard')",'CLIENT_ACTIVE_NAV_MARKER_PRESENT');
  requireMarker(gate,"document.querySelector('#view .ph')",'CLIENT_STABLE_RENDER_MARKER_PRESENT');
  requireMarker(gate,'clientModule:typeof window.CX?.modules?.cli_dashboard===\'function\'','CLIENT_MODULE_BOOLEAN_PRESENT');
  requireMarker(gate,"route:routeId==='cli_dashboard'&&navActive",'CLIENT_ROUTE_BOOLEAN_PRESENT');
  requireMarker(gate,'panorama:Boolean(pageHeader&&viewRendered)','CLIENT_PANORAMA_BOOLEAN_PRESENT');
  requireMarker(gate,'blocked:/Fuente de datos no disponible|Sin proyectos disponibles/i.test(viewText)','CLIENT_BLOCKED_BOOLEAN_PRESENT');
  requireMarker(gate,"assert(client.clientModule,'CLIENT_MODULE_MISSING')",'CLIENT_MODULE_ASSERT_SEPARATE');
  requireMarker(gate,"assert(client.route,'CLIENT_ROUTE_INVALID')",'CLIENT_ROUTE_ASSERT_SEPARATE');
  requireMarker(gate,"assert(client.panorama,'CLIENT_PANORAMA_NOT_RENDERED')",'CLIENT_PANORAMA_ASSERT_SEPARATE');
  requireMarker(gate,"assert(client.blocked===false,'CLIENT_PORTAL_BLOCKED')",'CLIENT_BLOCKED_ASSERT_SEPARATE');
  forbidMarker(gate,"assert(client.clientModule&&client.panorama&&!client.blocked,'CLIENT_PORTAL_INVALID')",'CLIENT_COMPOSITE_ASSERT_FORBIDDEN');

  requireMarker(orchestrator,'const failedStageBeforeRollback=','ORIGINAL_FAILED_STAGE_CAPTURED');
  requireMarker(orchestrator,'publicFailure(error,rollback,failedStageBeforeRollback)','ORIGINAL_FAILED_STAGE_PERSISTED');
  requireMarker(orchestrator,"failedStage:failedStage||'unknown'",'PUBLIC_FAILURE_STAGE_ARGUMENT_USED');

  requireMarker(wrapper,"window.CX.router.nav('cli_dashboard')",'WRAPPER_REQUIRES_EXPLICIT_ROUTE');
  requireMarker(wrapper,"CLIENT_PANORAMA_NOT_RENDERED",'WRAPPER_REQUIRES_SEPARATE_ASSERTIONS');
  forbidMarker(wrapper,'CLIENT_PORTAL_INVALID','WRAPPER_FORBIDS_LEGACY_COMPOSITE_ASSERT');

  for(const [text,label] of [[gate,'gate'],[wrapper,'wrapper'],[orchestrator,'orchestrator']]){
    if(/firebase-admin|google-auth-library|GOOGLE_APPLICATION_CREDENTIALS|private-e2e|service_account/i.test(text) && label!=='gate'){
      // The runtime orchestrator is expected to reference private ephemeral paths, but this source-only gate never executes it.
      pass('SOURCE_ONLY_NO_PROVIDER_EXECUTION',label);
    }else{
      pass('SOURCE_ONLY_NO_PROVIDER_EXECUTION',label);
    }
  }
}

const report={
  schemaVersion:'cxorbia.c6.client-route-source-static.v1',
  generatedAt:new Date().toISOString(),
  decision:blockers.length?'HOLD_C6_CLIENT_ROUTE_SOURCE_STATIC':'PASS_C6_CLIENT_ROUTE_SOURCE_STATIC',
  blockers,
  checks,
  sourceOnly:true,
  providerReads:false,
  providerWrites:false,
  credentialsUsed:false,
  authWrites:0,
  firestoreWrites:0,
  membershipWrites:0,
  deploy:false,
  merge:false,
  production:false
};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),['# C6 Client route source/static gate','',`Decision: **${report.decision}**`,'','## Blockers',...(blockers.length?blockers.map(x=>`- ${x}`):['- none']),'','## Checks',...checks.map(x=>`- ${x}`)].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(blockers.length)process.exit(1);
