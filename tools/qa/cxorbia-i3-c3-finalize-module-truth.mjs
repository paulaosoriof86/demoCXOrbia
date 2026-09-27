import fs from 'node:fs';

const PRE=process.env.C3_PRETERMINAL;
const FOCAL=process.env.C3_FOCAL;
const HUMAN=process.env.C3_HUMAN;
const QA=process.env.C3_QA;
const PARITY=process.env.C3_PARITY;
const LEDGER=process.env.C3_LEDGER;
const OUT=process.env.C3_FINAL_MATRIX;
const SOURCE=String(process.env.C3_SOURCE||'');
const TREE=String(process.env.C3_TREE||'');
const RUNTIME=String(process.env.C3_RUNTIME_REVISION||'');
const DIGEST=String(process.env.C3_RUNTIME_DIGEST||'');
const HOSTING=String(process.env.C3_HOSTING_VERSION||'');

for(const [k,v] of Object.entries({PRE,FOCAL,HUMAN,QA,PARITY,LEDGER,OUT,SOURCE,TREE,RUNTIME,DIGEST,HOSTING})){
  if(!v)throw new Error('ENVIRONMENT_FAILURE:C3_FINALIZE_'+k);
}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const pre=read(PRE),focal=read(FOCAL),human=read(HUMAN),qa=read(QA),parity=read(PARITY),ledger=read(LEDGER);

if(pre?.preTerminalComposition?.decision!=='PASS_C3_PRETERMINAL_COMPOSITION'||pre?.productSource?.sha!==SOURCE||pre?.productSource?.treeSha!==TREE)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_PRETERMINAL_RECEIPT');
if(focal?.decision!=='PASS_PRE_I4_FOCAL_HUMAN_BROWSER'||focal?.sourceSha!==SOURCE)throw new Error('FUNCTIONAL_DEFECT:C3_HARDENED_FOCAL');
if(human?.decision!=='PASS_I3_HUMAN_LIVE_ACCEPTANCE'||human?.sourceSha!==SOURCE)throw new Error('FUNCTIONAL_DEFECT:C3_FULL_HUMAN_ACCEPTANCE');
if(String(focal?.hrRevision||'')!==String(human?.sourceRevision||''))throw new Error('RELEASE_COMPOSITION_FAILURE:C3_HR_REVISION_DESYNC');
if(qa?.decision!=='PASS_C3_QA_RESERVATION_CLEANUP'||Number(qa?.after)!==0)throw new Error('PERSISTENCE_FAILURE:C3_QA_RESIDUE');
if(parity?.decision!=='PASS_C3_PENDING_OWNER_BYTE_PARITY'||Number(parity?.mismatches)!==0)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_PENDING_OWNER_PARITY');

const f=ledger?.findings||{};
const resolvedState=state=>{
  const s=String(state||'');
  if(!s)return false;
  if(/^P0_PROVEN(?:_|$)/.test(s)||/PENDING|REQUIRED|HOLD|FAIL|OPEN/.test(s))return false;
  return /^PASS_/.test(s)||/FIXED_(?:SOURCE_)?PROVEN|PROVEN_CLOSED|CLOSED_PROVEN|ALREADY_PROVEN|RESOLVED/.test(s);
};
const ownerPaths=v=>[...(Array.isArray(v?.owner)?v.owner:(v?.owner?[v.owner]:[])),...(v?.owners||[]),...(v?.sourceFixFiles||[]),...(v?.productFiles||[])].map(String);

for(const id of ['VRM-036','VRM-037','VRM-039','VRM-042']){
  if(!resolvedState(f[id]?.state))throw new Error('RELEASE_COMPOSITION_FAILURE:C3_PRIOR_P0_NOT_RESOLVED:'+id);
}
const terminalIds=['VRM-033','VRM-034','VRM-035','VRM-038','VRM-040','VRM-041'];
for(const id of terminalIds)if(!f[id]||!resolvedState(f[id]?.state))throw new Error('RELEASE_COMPOSITION_FAILURE:C3_TERMINAL_FINDING_NOT_RESOLVED:'+id);

const openP0=Object.entries(f).filter(([,v])=>String(v?.severity||'').toUpperCase()==='P0'&&!resolvedState(v?.state));
if(openP0.length)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OPEN_P0_FINDINGS:'+openP0.map(([id])=>id).join(','));

const sourceFiles=(pre.sourceFiles||[]).map(x=>({...x}));
const modules=(pre.modules||[]).map(x=>({...x,pendingTerminalFiles:[...(x.pendingTerminalFiles||[])]}));
if(modules.length!==20)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_TERMINAL_MODULE_COUNT');

const receiptsByDomain=new Map();
for(const [id,v] of Object.entries(f)){
  if(!resolvedState(v?.state))continue;
  const r=v?.terminalEvidence?.ownerSpecificReceipt;
  if(!r)continue;
  const domain=String(r.moduleDomain||'');
  if(!domain)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_DOMAIN_MISSING:'+id);
  if(String(r.decision||'').startsWith('PASS_')!==true)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_DECISION:'+id);
  if(r.sourceSha!==SOURCE||r.sourceTree!==TREE)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_SOURCE:'+id);
  if(r.runtimeRevision!==RUNTIME||r.runtimeDigest!==DIGEST||r.hostingVersion!==HOSTING)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_RUNTIME:'+id);
  if(String(r.hrRevision||'')!==String(human.sourceRevision||''))throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_HR_REVISION:'+id);
  if(r.production!==false)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_PRODUCTION:'+id);
  for(const k of ['actionReal','providerAck','durableReadback','reloadProof','noDuplicateRegression']){
    if(r[k]!==true)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_INCOMPLETE:'+id+':'+k);
  }
  const paths=[...(r.ownerPaths||[])].map(String);
  if(!paths.length)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_PATHS:'+id);
  const findingOwners=new Set(ownerPaths(v));
  if(paths.some(p=>!findingOwners.has(p)))throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_OWNER_MISMATCH:'+id);
  if(!receiptsByDomain.has(domain))receiptsByDomain.set(domain,[]);
  receiptsByDomain.get(domain).push({findingId:id,receipt:r});
}

const promotionByDomain=new Map();
for(const mod of modules){
  const cls=String(mod.classification||'');
  if(cls==='MATCH')continue;
  const domain=String(mod.domain||'');
  const moduleFiles=sourceFiles.filter(x=>x.domain===domain).map(x=>String(x.path||'')).filter(Boolean);
  const moduleOwners=new Set([...(mod.owners||[]).map(String),...moduleFiles]);
  const candidate=(receiptsByDomain.get(domain)||[]).filter(x=>(x.receipt.ownerPaths||[]).some(p=>moduleOwners.has(String(p))));
  if(!candidate.length)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_MISSING:'+domain);
  const covered=new Set(candidate.flatMap(x=>(x.receipt.ownerPaths||[]).map(String)));
  const pending=(mod.pendingTerminalFiles||[]).map(String);
  const uncovered=pending.filter(p=>!covered.has(p));
  if(uncovered.length)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_OWNER_RECEIPT_PENDING_FILE_UNCOVERED:'+domain+':'+uncovered.join(','));
  promotionByDomain.set(domain,candidate);
  mod.preTerminalClassification=cls;
  mod.classification='MATCH';
  mod.pendingTerminalFiles=[];
  mod.terminalServedSource=SOURCE;
  mod.terminalProof='owner-specific-receipt+same-source-byte-parity+full-human+hardened-focal';
  mod.ownerSpecificReceiptFindingIds=candidate.map(x=>x.findingId);
}

for(const file of sourceFiles){
  const cls=String(file.classification||'');
  if(cls==='MATCH'){
    file.terminalServedSource=SOURCE;
    file.terminalProof='preserved-preterminal-match+same-source-byte-parity';
    continue;
  }
  const promoted=promotionByDomain.get(String(file.domain||''))||[];
  if(!promoted.length)continue;
  const covered=promoted.some(x=>(x.receipt.ownerPaths||[]).map(String).includes(String(file.path||'')));
  if(!covered)continue;
  file.preTerminalClassification=cls;
  file.classification='MATCH';
  file.terminalServedSource=SOURCE;
  file.terminalProof='owner-specific-receipt+same-source-byte-parity';
  file.ownerSpecificReceiptFindingIds=promoted.map(x=>x.findingId);
}

const nonMatchModules=modules.filter(x=>x.classification!=='MATCH');
const nonMatchFiles=sourceFiles.filter(x=>x.classification!=='MATCH');
if(nonMatchModules.length||nonMatchFiles.length)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_MODULE_TRUTH_NOT_CLOSED:'+JSON.stringify({modules:nonMatchModules.map(x=>x.domain),files:nonMatchFiles.map(x=>x.path)}));

const receiptRows=[...promotionByDomain.entries()].flatMap(([moduleDomain,rows])=>rows.map(x=>({moduleDomain,findingId:x.findingId,decision:x.receipt.decision,ownerPaths:x.receipt.ownerPaths})));
const out={...pre,
  schemaVersion:'cxorbia.recovery.module-truth-matrix.v8-terminal-owner-receipts',
  generatedAt:new Date().toISOString(),
  productSource:{sha:SOURCE,treeSha:TREE},
  sourceFiles,modules,phaseAComplete:true,allModulesMatch:true,
  terminalClosure:{
    decision:'PASS_C3_TERMINAL_MODULE_TRUTH_20_20',
    moduleCount:20,matchModules:20,nonMatchModules:0,
    sourceSha:SOURCE,sourceTree:TREE,hrRevision:String(human.sourceRevision||''),
    runtimeRevision:RUNTIME,runtimeDigest:DIGEST,hostingVersion:HOSTING,
    hardenedFocalDecision:focal.decision,fullHumanDecision:human.decision,
    qaReservationAfter:Number(qa.after),pendingOwnerByteParity:parity.decision,
    terminalFindingsResolved:terminalIds,priorP0Resolved:['VRM-036','VRM-037','VRM-039','VRM-042'],
    ownerSpecificReceipts:receiptRows,
    selfApproval:false,production:false
  }
};
fs.writeFileSync(OUT,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out.terminalClosure,null,2));
