import fs from 'node:fs';
import path from 'node:path';

const [outDir,root,tenantId,projectId,runId]=process.argv.slice(2);
if(!outDir||!root||!tenantId||!projectId||!runId)throw Error('HR_ACK_PREFLIGHT_ARGS_REQUIRED');
fs.mkdirSync(outDir,{recursive:true});
const origin=root.replace(/\/+$/,'');
const endpoint=origin+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&phaseapreflight='+encodeURIComponent(runId);
const pinned=/^[0-9a-f]{64}$/;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function read(n,attempt){
  const url=endpoint+'&read='+n+'&attempt='+attempt;
  let response;
  for(let retry=1;retry<=3;retry++){
    try{response=await fetch(url,{headers:{'Cache-Control':'no-cache, no-store'},signal:AbortSignal.timeout(30000)});if(response.ok)break;}catch(e){if(retry===3)throw e;}
    if(retry===3)throw Error('HR_META_HTTP_'+(response?.status||'UNKNOWN'));
    await sleep(1000);
  }
  const data=await response.json();
  fs.writeFileSync(path.join(outDir,'hr-meta-'+n+'.json'),JSON.stringify(data,null,2)+'\n');
  return data;
}
function validOptionalReconciliation(row,revision){
  if(row==null)return true;
  return row?.providerAck===true&&row?.tenantId===tenantId&&row?.projectId===projectId&&row?.sourceRevision===revision;
}
function safeMeta(meta,revision){
  const s=meta?.shopperReconciliation,v=meta?.visitReconciliation;
  return meta?.ok===true&&meta?.revisionStable===true&&meta?.sourceSafe===true&&
    meta?.revision===revision&&meta?.writes===false&&meta?.hrWrites===false&&
    meta?.imports===false&&meta?.production===false&&
    validOptionalReconciliation(s,revision)&&validOptionalReconciliation(v,revision);
}
let revision='',passed=false,attempts=0,last=null;
for(let attempt=1;attempt<=8;attempt++){
  const a=await read(1,attempt),b=await read(2,attempt);
  if(!revision){revision=a.revision;if(!pinned.test(String(revision||'')))throw Error('HR_REVISION_INVALID');}
  if(a.revision!==revision||b.revision!==revision)throw Error('HR_REVISION_CHANGED_DURING_ACK_PREFLIGHT');
  attempts=attempt;last=[a,b];
  if(safeMeta(a,revision)&&safeMeta(b,revision)){passed=true;break;}
  if(attempt!==8)await sleep(5000);
}
const diagnostics={decision:passed?'PASS_HR_EXACT_REVISION_READ_ONLY':'HOLD_HR_EXACT_REVISION_READ_ONLY',
  revision,attempts,shopperAck:last?.[0]?.shopperReconciliation?.providerAck===true,
  visitAck:last?.[0]?.visitReconciliation?.providerAck===true,
  shopperReconciliationObserved:last?.[0]?.shopperReconciliation!=null,
  visitReconciliationObserved:last?.[0]?.visitReconciliation!=null,
  reconciliationRequiredForRead:false,tenantId,projectId,
  production:false,scriptWrites:false,hrWrites:false};
fs.writeFileSync(path.join(outDir,'hr-ack-preflight.json'),JSON.stringify(diagnostics,null,2)+'\n');
console.log(JSON.stringify(diagnostics));
if(!passed)throw Error('HR_READ_ONLY_META_TIMEOUT_SAME_REVISION');
