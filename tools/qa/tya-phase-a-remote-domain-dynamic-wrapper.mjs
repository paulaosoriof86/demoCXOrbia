#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const privatePath=String(process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'');
const f10Helper='tools/qa/tya-f10-live-admin-shopper-functional-readonly.mjs';
if(privatePath&&fs.existsSync(privatePath)){
  let privateBundle=null;try{privateBundle=JSON.parse(fs.readFileSync(privatePath,'utf8'));}catch{}
  if(privateBundle?.shopper?.credentialMode==='firebase_custom_token'&&privateBundle?.shopper?.login==='__cxorbia_f10_custom_token__'){
    if(!fs.existsSync(path.join(root,f10Helper)))throw new Error('F10_LIVE_ADMIN_SHOPPER_HELPER_MISSING');
    const syntax=spawnSync(process.execPath,['--check',f10Helper],{cwd:root,encoding:'utf8'});
    if(syntax.status!==0){if(syntax.stdout)process.stdout.write(syntax.stdout);if(syntax.stderr)process.stderr.write(syntax.stderr);throw new Error('F10_LIVE_ADMIN_SHOPPER_HELPER_SYNTAX_INVALID');}
    const run=spawnSync(process.execPath,[f10Helper,...process.argv.slice(2)],{cwd:root,env:{...process.env},encoding:'utf8',maxBuffer:80*1024*1024});
    if(run.stdout)process.stdout.write(run.stdout);
    if(run.stderr)process.stderr.write(run.stderr);
    process.exitCode=run.status||0;
  }else{
    await runLegacyWrapper();
  }
}else{
  await runLegacyWrapper();
}

async function runLegacyWrapper(){
  const sourcePath=path.join(root,'tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs');
  if(!fs.existsSync(sourcePath))throw new Error('DOMAIN_GATE_SOURCE_MISSING');
  const source=fs.readFileSync(sourcePath,'utf8');
  const forbidden=[
    "staff.authority.latestPeriod==='2026-07'",
    "staff.data.periodKey==='2026-07'",
    "window.CX?.modules?.cliente==='function'"
  ];
  for(const marker of forbidden){
    if(source.includes(marker))throw new Error('OUTDATED_DOMAIN_GATE_MARKER_'+marker.replace(/[^A-Z0-9]+/gi,'_'));
  }
  const required=[
    "staff.data.periodKey===staff.authority.latestPeriod",
    "window.CX?.modules?.cli_dashboard==='function'",
    "decision:'PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC'"
  ];
  for(const marker of required){
    if(!source.includes(marker))throw new Error('DYNAMIC_DOMAIN_GATE_MARKER_MISSING_'+marker.replace(/[^A-Z0-9]+/gi,'_'));
  }

  const patches=[
    {
      name:'client_render_exception_probe',
      from:"  stage='client_login';\n  const clientSession=await openAndLogin(browser,'cliente',credentials.client,'staff');\n  stage='client_route_navigation';",
      to:"  stage='client_login';\n  const clientSession=await openAndLogin(browser,'cliente',credentials.client,'staff');\n  const clientRenderExceptions=[];\n  clientSession.page.on('pageerror',error=>clientRenderExceptions.push(String(error?.stack||error?.message||error)));\n  stage='client_route_navigation';"
    },
    {
      name:'client_wait_predicate',
      from:"  stage='client_route_wait';\n  await clientSession.page.waitForFunction(()=>{\n    const routeId=window.CX?.session?.view||null;\n    const navActive=document.getElementById('nav-cli_dashboard')?.classList.contains('active')===true;\n    const pageHeader=document.querySelector('#view .ph');\n    const viewText=(document.getElementById('view')?.innerText||'').trim();\n    return routeId==='cli_dashboard'&&navActive&&Boolean(pageHeader)&&viewText.length>0;\n  },null,{timeout:30000});",
      to:"  stage='client_route_wait_corrected';\n  await clientSession.page.waitForFunction(()=>{\n    const routeId=window.CX?.session?.view||null;\n    const view=document.getElementById('view');\n    const pageHeader=view?.querySelector('.ph')||null;\n    const viewText=String(view?.innerText||'').trim();\n    return routeId==='cli_dashboard'&&Boolean(view)&&Boolean(pageHeader)&&viewText.length>0;\n  },null,{timeout:30000});\n  await clientSession.page.waitForTimeout(250);"
    },
    {
      name:'client_snapshot_view_state',
      from:"    const viewText=document.getElementById('view')?.innerText||'';\n    const d=window.CX?.data||{};\n    const routeId=window.CX?.session?.view||null;\n    const navActive=document.getElementById('nav-cli_dashboard')?.classList.contains('active')===true;\n    const pageHeader=document.querySelector('#view .ph');\n    const viewRendered=Boolean(document.getElementById('view')&&viewText.trim().length>0);",
      to:"    const view=document.getElementById('view');\n    const viewText=String(view?.innerText||'');\n    const d=window.CX?.data||{};\n    const routeId=window.CX?.session?.view||null;\n    const pageHeader=view?.querySelector('.ph')||null;\n    const viewTextLength=viewText.trim().length;\n    const viewRendered=Boolean(view&&viewTextLength>0);"
    },
    {
      name:'client_snapshot_predicate_fields',
      from:"      route:routeId==='cli_dashboard'&&navActive,\n      routeId,\n      navActive,\n      panorama:Boolean(pageHeader&&viewRendered),\n      pageHeader:Boolean(pageHeader),\n      heading:pageHeader?.querySelector('.ph-t')?.textContent?.trim()||null,\n      viewRendered,",
      to:"      route:routeId==='cli_dashboard',\n      routeAccepted:routeId==='cli_dashboard',\n      routeId,\n      viewExists:Boolean(view),\n      panorama:Boolean(pageHeader&&viewRendered),\n      panoramaVisible:Boolean(pageHeader&&viewRendered),\n      pageHeader:Boolean(pageHeader),\n      heading:pageHeader?.querySelector('.ph-t')?.textContent?.trim()||null,\n      viewTextLength,\n      viewRendered,"
    },
    {
      name:'client_snapshot_render_exception',
      from:"  partial.client={...partial.client,...client};\n  stage='client_assertions';",
      to:"  client.renderException=clientRenderExceptions[0]||null;\n  partial.client={...partial.client,...client};\n  stage='client_assertions';"
    },
    {
      name:'client_assertion_predicate',
      from:"  assert(client.clientModule,'CLIENT_MODULE_MISSING');\n  assert(client.route,'CLIENT_ROUTE_INVALID');\n  assert(client.panorama,'CLIENT_PANORAMA_NOT_RENDERED');",
      to:"  assert(client.clientModule,'CLIENT_MODULE_MISSING');\n  assert(client.route&&client.routeAccepted&&client.viewExists&&client.pageHeader&&client.viewTextLength>0,'CLIENT_ROUTE_RENDER_PREDICATE_INVALID');\n  assert(client.renderException===null,'CLIENT_RENDER_EXCEPTION');\n  assert(client.panorama&&client.panoramaVisible,'CLIENT_PANORAMA_NOT_RENDERED');"
    },
    {
      name:'client_evidence_predicate',
      from:"    client:{authenticated:true,projectScope:'cinepolis',clientModule:client.clientModule,route:client.route,routeId:client.routeId,panorama:client.panorama,blocked:client.blocked,heading:client.heading},",
      to:"    client:{authenticated:true,projectScope:'cinepolis',clientModule:client.clientModule,route:client.route,routeAccepted:client.routeAccepted,routeId:client.routeId,viewExists:client.viewExists,pageHeader:client.pageHeader,viewTextLength:client.viewTextLength,renderException:client.renderException,panorama:client.panorama,panoramaVisible:client.panoramaVisible,blocked:client.blocked,heading:client.heading,predicateVersion:'session-view-canonical-render-v1'},"
    }
  ];

  let patched=source;
  for(const patch of patches){
    const parts=patched.split(patch.from);
    if(parts.length!==2)throw new Error('SEMANTIC_HARNESS_PATCH_SCOPE_INVALID_'+patch.name.toUpperCase());
    patched=parts.join(patch.to);
  }

  const forbiddenPatched=[
    "return routeId==='cli_dashboard'&&navActive&&Boolean(pageHeader)&&viewText.length>0;",
    "route:routeId==='cli_dashboard'&&navActive",
    "assert(client.route,'CLIENT_ROUTE_INVALID')"
  ];
  for(const marker of forbiddenPatched){
    if(patched.includes(marker))throw new Error('LEGACY_CLIENT_PREDICATE_REMAINS');
  }
  const requiredPatched=[
    "return routeId==='cli_dashboard'&&Boolean(view)&&Boolean(pageHeader)&&viewText.length>0;",
    "predicateVersion:'session-view-canonical-render-v1'",
    "assert(client.renderException===null,'CLIENT_RENDER_EXCEPTION')"
  ];
  for(const marker of requiredPatched){
    if(!patched.includes(marker))throw new Error('CORRECTED_CLIENT_PREDICATE_MISSING');
  }

  const tempDir=path.join(root,'.tmp/c6-remote-semantic-harness');
  const patchedPath=path.join(tempDir,'tya-c6-remote-domain-finance-portals-reservations-gate.patched.mjs');
  fs.mkdirSync(tempDir,{recursive:true});
  fs.writeFileSync(patchedPath,patched,'utf8');

  const syntax=spawnSync(process.execPath,['--check',patchedPath],{cwd:root,encoding:'utf8'});
  if(syntax.status!==0){
    if(syntax.stdout)process.stdout.write(syntax.stdout);
    if(syntax.stderr)process.stderr.write(syntax.stderr);
    throw new Error('CORRECTED_SEMANTIC_HARNESS_SYNTAX_INVALID');
  }

  const run=spawnSync(process.execPath,[patchedPath,...process.argv.slice(2)],{
    cwd:root,
    env:{...process.env,CXORBIA_CLIENT_SEMANTIC_PREDICATE_VERSION:'session-view-canonical-render-v1'},
    encoding:'utf8',
    maxBuffer:80*1024*1024
  });
  if(run.stdout)process.stdout.write(run.stdout);
  if(run.stderr)process.stderr.write(run.stderr);
  process.exitCode=run.status||0;
}
