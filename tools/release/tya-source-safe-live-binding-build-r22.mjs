#!/usr/bin/env node
/* CXOrbia TyA Phase A R22 — runtime live HR binding.
   Reuses the canonical source-safe adapter, adds in-place snapshot application,
   and replaces only the build-copy payload tag with the same-origin live source. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const htmlPath=path.resolve(valueOf('--html','app/index.html'));
const endpoint=valueOf('--live-endpoint','/api/tya/cinepolis/hr-live');
const inplaceSrc=valueOf('--inplace-src','adapters/tya-live-source-inplace-apply.js');
const watcherSrc=valueOf('--watcher-src','adapters/tya-live-source-refresh-watch.js');
const fastTriggerSrc=valueOf('--fast-trigger-src','adapters/tya-live-source-fast-trigger.js');
const reportLiveSrc=valueOf('--report-live-src','adapters/tya-corte1-report-projection-live.js');
const reportDir=path.resolve(valueOf('--out','.tmp/source-safe-live-binding-r22'));
const fail=message=>{throw new Error(`R22 live binding HOLD: ${message}`);};

await import('./tya-source-safe-binding-build-r18a.mjs');

if(!fs.existsSync(htmlPath))fail(`HTML missing: ${htmlPath}`);
const appDir=path.dirname(htmlPath);
for(const src of [inplaceSrc,watcherSrc,fastTriggerSrc,reportLiveSrc])if(!fs.existsSync(path.join(appDir,src)))fail(`Runtime adapter missing: ${src}`);
let html=fs.readFileSync(htmlPath,'utf8');
const localPayloadTag='<script src="data/tya-hr-source-safe-periods.js"></script>';
const adapterTag='<script src="adapters/tya-phase-a-source-safe-dev-adapter-r18a.js"></script>';
const inplaceTag=`<script src="${inplaceSrc}"></script>`;
const watcherTag=`<script src="${watcherSrc}"></script>`;
const fastTriggerTag=`<script src="${fastTriggerSrc}"></script>`;
const reportLiveTag=`<script src="${reportLiveSrc}"></script>`;
const liveTag=`<script>window.CX_TYA_LIVE_SOURCE_URL=${JSON.stringify(endpoint)};</script>\n<script src="${endpoint}${endpoint.includes('?')?'&':'?'}format=js"></script>`;

if(!html.includes(adapterTag))fail('canonical adapter tag missing after R18A build');
if(html.includes(localPayloadTag))html=html.replace(localPayloadTag,liveTag);
else if(!html.includes(`src="${endpoint}`))fail('local payload tag and live endpoint tag both missing');
if(!html.includes(inplaceTag))html=html.replace(adapterTag,`${adapterTag}\n${inplaceTag}`);
if(!html.includes(reportLiveTag))html=html.replace(inplaceTag,`${inplaceTag}\n${reportLiveTag}`);
if(!html.includes(watcherTag))html=html.replace(reportLiveTag,`${reportLiveTag}\n${watcherTag}`);
if(!html.includes(fastTriggerTag))html=html.replace(watcherTag,`${watcherTag}\n${fastTriggerTag}`);

const count=needle=>html.split(needle).length-1;
if(count(localPayloadTag)!==0)fail('frozen payload remains loaded');
if(count(`src="${endpoint}`)!==1)fail(`live endpoint script count ${count(`src="${endpoint}`)}/1`);
for(const [label,tag] of [['inplace',inplaceTag],['reports',reportLiveTag],['watcher',watcherTag],['fast trigger',fastTriggerTag]])if(count(tag)!==1)fail(`${label} tag count ${count(tag)}/1`);
const positions=[adapterTag,inplaceTag,reportLiveTag,watcherTag,fastTriggerTag,'<script src="app.js"></script>'].map(tag=>html.indexOf(tag));
if(positions.some(pos=>pos<0)||!positions.every((pos,index)=>index===0||positions[index-1]<pos))fail('runtime script order invalid');

fs.writeFileSync(htmlPath,html,'utf8');
fs.mkdirSync(reportDir,{recursive:true});
const report={
  ok:true,decision:'PASS_R22_LIVE_HR_INPLACE_BINDING',html:path.relative(process.cwd(),htmlPath).replaceAll('\\','/'),endpoint,
  frozenPayloadLoaded:false,canonicalAdapterReused:true,inplaceAdapterLoaded:true,watcherLoaded:true,fastTriggerLoaded:true,
  liveReportProjectionLoaded:true,liveReportProjection:reportLiveSrc,documentReloadAllowed:false,
  uiModulesModified:false,coreSourceModified:false,
  safeState:{writes:false,imports:false,deploy:false,production:false,payments:false}
};
fs.writeFileSync(path.join(reportDir,'live-binding-report.json'),JSON.stringify(report,null,2),'utf8');
console.log(JSON.stringify(report,null,2));
