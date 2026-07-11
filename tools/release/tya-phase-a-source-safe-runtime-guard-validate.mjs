import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../..');
const args=process.argv.slice(2);
const outIndex=args.indexOf('--out');
const outDir=outIndex>=0?path.resolve(repo,args[outIndex+1]):path.resolve(repo,'.tmp/source-safe-runtime-guard');
const source=fs.readFileSync(path.join(repo,'app/core/tya-phase-a-source-safe-runtime-guard.js'),'utf8');
const contract=JSON.parse(fs.readFileSync(path.join(repo,'backend/contracts/phase-a-source-safe-runtime-guard-v1.json'),'utf8'));

const storage=new Map([
  ['cx_reservas_cinepolis-2026-07','[{"id":"demo"}]'],
  ['unrelated','keep']
]);
const localStorage={
  get length(){return storage.size;},
  key(index){return [...storage.keys()][index]??null;},
  getItem(key){return storage.has(key)?storage.get(key):null;},
  setItem(key,value){storage.set(String(key),String(value));},
  removeItem(key){storage.delete(String(key));}
};
const events=[];
const CX={
  data:{previewMeta:{sourceSafe:true}},
  dataSource:{warnings:[]},
  notif:{_items:[{id:'n1'},{id:'n2'}]},
  reservas:{_r:{'cinepolis-2026-07':[1]},_seed(){return [{id:'demo'}];}},
  bus:{emit(name,payload){events.push({name,payload});}}
};
const context={window:{CX_TYA_PHASE_A_PREVIEW:true},CX,localStorage,console,Date};
context.window.CX=CX;
vm.createContext(context);
vm.runInContext(source,context,{filename:'tya-phase-a-source-safe-runtime-guard.js'});

const report=context.CX.phaseASourceSafeRuntimeGuard;
const checks={
  reportReady:report?.ready===true,
  notificationsCleared:context.CX.notif._items.length===0,
  notificationsPending:context.CX.notif.sourceStatus==='pending_backend_event_source',
  reservationsSeedDisabled:Array.isArray(context.CX.reservas._seed())&&context.CX.reservas._seed().length===0,
  reservationsPending:context.CX.reservas.sourceStatus==='pending_backend_reservation_source',
  reservationCacheCleared:!storage.has('cx_reservas_cinepolis-2026-07'),
  unrelatedStoragePreserved:storage.get('unrelated')==='keep',
  safeState:report?.sourceSafe===true&&report?.imported===false&&report?.production===false&&report?.writes===false&&report?.providers===false,
  warningsAdded:context.CX.dataSource.warnings.length===2,
  eventEmitted:events.some(event=>event.name==='phase-a-source-safe-runtime-guard'),
  contractSafe:contract.safeState.sourceSafe===true&&contract.safeState.writes===false&&contract.safeState.deploy===false
};
const blockers=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
const result={ok:blockers.length===0,generatedAt:new Date().toISOString(),contractId:contract.contractId,checks,blockers,report};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'phase-a-source-safe-runtime-guard-report.json'),JSON.stringify(result,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'phase-a-source-safe-runtime-guard-report.md'),`# Phase A source-safe runtime guard\n\nVerdict: **${result.ok?'PASS':'HOLD'}**\n\nChecks: ${Object.keys(checks).length}\nBlockers: ${blockers.length}\n`,'utf8');
console.log(JSON.stringify(result,null,2));
if(!result.ok)process.exit(1);
