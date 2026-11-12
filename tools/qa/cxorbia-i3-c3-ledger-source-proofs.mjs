// Recover scoped source QA already preserved in the canonical cumulative ledger.
// A passing workflow or a source SHA by itself is never approval of a file.
const SHA=/^[0-9a-f]{40}$/;

const sourceTestsPassed=proof=>{
  const results=[];
  if(Number.isInteger(proof.sourceTestsPass)||Number.isInteger(proof.sourceTestsFail)){
    if(!Number.isInteger(proof.sourceTestsPass)||!Number.isInteger(proof.sourceTestsFail))return false;
    results.push({pass:proof.sourceTestsPass,fail:proof.sourceTestsFail});
  }
  for(const [key,value] of Object.entries(proof)){
    if(!/Tests$/.test(key)||!value||typeof value!=='object'||Array.isArray(value))continue;
    if(!Number.isInteger(value.pass)||!Number.isInteger(value.fail))return false;
    results.push({pass:value.pass,fail:value.fail});
  }
  return results.length>0&&results.some(x=>x.pass>0)&&results.every(x=>x.pass>=0&&x.fail===0);
};

export const collectPathBoundLedgerSourceProofs=ledger=>{
  const rows=new Map();
  const walk=(node,location)=>{
    if(!node||typeof node!=='object')return;
    if(!Array.isArray(node)){
      const proof=node.sourceProof;
      if(Array.isArray(node.owners)&&proof&&typeof proof==='object'&&!Array.isArray(proof)
        &&node.production===false&&proof.production===false
        &&SHA.test(String(node.sourceSha||''))&&node.sourceSha===proof.sourceSha
        &&SHA.test(String(proof.sourceTree||''))
        &&/^PASS_/.test(String(proof.decision||''))
        &&Number.isSafeInteger(proof.runId)&&proof.runId>0
        &&sourceTestsPassed(proof)){
        for(const path of node.owners){
          if(typeof path!=='string'||!path||path.includes('..'))continue;
          const id=path+'|'+proof.sourceSha+'|'+proof.runId;
          if(!rows.has(id))rows.set(id,{
            path,sourceSha:proof.sourceSha,sourceTree:proof.sourceTree,
            runId:proof.runId,decision:proof.decision,ledgerLocation:location,
            ...(proof.evidencePath!==undefined?{evidencePath:proof.evidencePath}:{}),
            ...(proof.evidenceGitBlob!==undefined?{evidenceGitBlob:proof.evidenceGitBlob}:{})
          });
        }
      }
    }
    for(const [key,value] of Object.entries(node)){
      if(value&&typeof value==='object')walk(value,location?location+'.'+key:key);
    }
  };
  walk(ledger,'');
  return [...rows.values()].sort((a,b)=>a.path.localeCompare(b.path)||a.runId-b.runId);
};
