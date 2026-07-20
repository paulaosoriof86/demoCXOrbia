#!/usr/bin/env node
/* CXOrbia TyA Phase A R22 — runtime live HR binding.
   Reuses the existing canonical source-safe adapter and replaces only the build-copy
   payload tag with a same-origin server-side live source. No UI module/core source is changed. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const htmlPath=path.resolve(valueOf('--html','app/index.html'));
const endpoint=valueOf('--live-endpoint','/api/tya/cinepolis/hr-live');
const watcherSrc=valueOf('--watcher-src','adapters/tya-live-source-refresh-watch.js');
const reportDir=path.resolve(valueOf('--out','.tmp/source-safe-live-binding-r22'));
const fail=message=>{throw new Error(`R22 live binding HOLD: ${message}`);};

await import('./tya-source-safe-binding-build-r18a.mjs');

if(!fs.existsSync(htmlPath))fail(`HTML missing: ${htmlPath}`);
const appDir=path.dirname(htmlPath);
if(!fs.existsSync(path.join(appDir,watcherSrc)))fail(`Watcher missing: ${watcherSrc}`);
let html=fs.readFileSync(htmlPath,'utf8');
const localPayloadTag='<script src="data/tya-hr-source-safe-periods.js"></script>';
const adapterTag='<script src="adapters/tya-phase-a-source-safe-dev-adapter-r18a.js"></script>';
const watcherTag=`<script src="${watcherSrc}"></script>`;
const liveTag=`<script>window.CX_TYA_LIVE_SOURCE_URL=${JSON.stringify(endpoint)};</script>\n<script src="${endpoint}${endpoint.includes('?')?'&':'?'}format=js"></script>`;

if(!html.includes(adapterTag))fail('canonical adapter tag missing after R18A build');
if(html.includes(localPayloadTag))html=html.replace(localPayloadTag,liveTag);
else if(!html.includes(`src="${endpoint}`))fail('local payload tag and live endpoint tag both missing');
if(!html.includes(watcherTag))html=html.replace(adapterTag,`${adapterTag}\n${watcherTag}`);

const localCount=html.split(localPayloadTag).length-1;
const endpointCount=html.split(`src="${endpoint}`).length-1;
const watcherCount=html.split(watcherTag).length-1;
if(localCount!==0)fail(`frozen payload remains loaded: ${localCount}`);
if(endpointCount!==1)fail(`live endpoint script count ${endpointCount}/1`);
if(watcherCount!==1)fail(`watcher tag count ${watcherCount}/1`);
if(!html.includes('<script src="app.js"></script>'))fail('app boot tag missing');

fs.writeFileSync(htmlPath,html,'utf8');
fs.mkdirSync(reportDir,{recursive:true});
const report={
  ok:true,
  decision:'PASS_R22_LIVE_HR_RUNTIME_BINDING',
  html:path.relative(process.cwd(),htmlPath).replaceAll('\\','/'),
  endpoint,
  frozenPayloadLoaded:false,
  canonicalAdapterReused:true,
  watcherLoaded:true,
  uiModulesModified:false,
  coreSourceModified:false,
  safeState:{writes:false,imports:false,deploy:false,production:false,payments:false}
};
fs.writeFileSync(path.join(reportDir,'live-binding-report.json'),JSON.stringify(report,null,2),'utf8');
console.log(JSON.stringify(report,null,2));
