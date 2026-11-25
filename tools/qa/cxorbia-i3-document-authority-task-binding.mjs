import fs from 'node:fs';
import crypto from 'node:crypto';

// D01 is an existing document approval, not a product/provider execution. Its
// exact immutable receipt is the authority; a producer cannot nominate a PASS.
export const DOCUMENT_AUTHORITY_KIND='FROZEN_DOCUMENT_AUTHORITY';
export const D01_DOCUMENT_AUTHORITY=Object.freeze({
 taskId:'D01',
 originalPlanSha256:'83e8f2c0a6b190bab1d9dea32bf99158116f3164f419ae72e051fd791fd8576c',
 acceptanceBindingSha256:'e34bf159dafeee79a2992e7b840a6b56bf6cc30209f9d5c60667097237459de5',
 path:'CXORBIA_I3_D01_AUTHORIZED_DOCUMENT_PROOF_2026-10-17.json',
 gitBlob:'b38b0747bf624ceaeb54c4c0e6168b76bcd79281',
 sha256:'87a8c107b90a3e737e31cc1dcfb64efc86bc2800f8166c4ab0b46b33e1a9acec',
 sourceDocumentSha256:'3654d624896f3517c39136b29f6c37542d8a128f9d8d9d8a616693f039753454'
});
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const equal=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const hash=(value,algorithm='sha256')=>crypto.createHash(algorithm).update(value).digest('hex');
const gitBlob=bytes=>hash(Buffer.concat([Buffer.from(`blob ${Buffer.byteLength(bytes)}\0`),Buffer.from(bytes)]),'sha1');
const APPROVAL_CLAUSES=['D01.exact_authorized_document_version','D01.approval_country_project_scope'];

export function createD01DocumentAuthorityMapping(task){
 const a=D01_DOCUMENT_AUTHORITY;
 if(task?.taskId!==a.taskId||task.acceptanceBindingSha256!==a.acceptanceBindingSha256)
  throw Error('MAPPING_FAILURE:D01_FROZEN_ACCEPTANCE');
 return {taskId:a.taskId,originalPlanSha256:a.originalPlanSha256,
  acceptanceBindingSha256:a.acceptanceBindingSha256,completeTaskInventory:true,
  acceptanceKind:DOCUMENT_AUTHORITY_KIND,
  authorityReceipt:{path:a.path,gitBlob:a.gitBlob,sha256:a.sha256},
  sourceDocumentSha256:a.sourceDocumentSha256,
  requiredClauses:APPROVAL_CLAUSES.map(id=>({id,operationKind:'DOCUMENT_AUTHORITY'})),
  // The frozen owner index is retained for traceability. D01 does not claim
  // code parity, parsing, generation, publication, authentication or UI proof.
  traceabilityOwnerPaths:[...task.ownerPaths],
  production:false};
}

const documentFacts=p=>({task:p?.task,classification:p?.classification,project:p?.project,
 scopeCountries:p?.scopeCountries,source:p?.source,approval:p?.approval,
 acceptance:p?.acceptance,production:p?.production});

export function validateD01DocumentAuthorityBinding({task,mapping,matrix,readBytes=p=>fs.readFileSync(p)}){
 const failures=[];const fail=code=>{if(!failures.includes(code))failures.push(code);};
 const a=D01_DOCUMENT_AUTHORITY;
 try{
  if(!equal(mapping,createD01DocumentAuthorityMapping(task)))fail('DOCUMENT_MAPPING_CONTRACT_BINDING');
 }catch{fail('DOCUMENT_MAPPING_CONTRACT_BINDING');}
 // Never read a receipt path supplied by a mapping/producer. Both hashes and
 // the fixed path come from the existing approved D01 evidence authority.
 let proof;
 try{
  const bytes=readBytes(a.path);
  if(hash(bytes)!==a.sha256||gitBlob(bytes)!==a.gitBlob)fail('DOCUMENT_RECEIPT_HASH');
  else proof=JSON.parse(Buffer.from(bytes).toString('utf8'));
 }catch{fail('DOCUMENT_RECEIPT_UNAVAILABLE');}
 if(proof){
  if(proof.task!=='D01'||proof.acceptance!=='PASS_D01_AUTHORIZED_DOCUMENT_SOURCE'||
     proof.classification!=='DOCUMENT_AUTHORITY_PROVEN'||proof.production!==false||
     proof.source?.sha256!==a.sourceDocumentSha256||proof.source.byteParityDriveLibrary!==true||
     !proof.source.driveRevisionId||!proof.source.driveFileId||
     !equal(proof.scopeCountries,['GT','HN'])||proof.project!=='Cinépolis'||
     proof.approval?.recoveredFromProjectConversation!==true||
     proof.approval.chronologyAlignedWithFinalDriveRevision!==true)
   fail('DOCUMENT_APPROVAL_SCOPE');
  // Reject a historical proof if the active matrix changed document/version
  // or approval. No new live product action is inferred from this comparison.
  if(!equal(documentFacts(matrix?.executionUpdateD01),documentFacts(proof)))
   fail('DOCUMENT_ACTIVE_AUTHORITY_MISMATCH');
 }
 const pass=failures.length===0;
 return {pass,failures,acceptanceKind:DOCUMENT_AUTHORITY_KIND,
  evidence:{path:a.path,gitBlob:a.gitBlob,sha256:a.sha256,sourceDocumentSha256:a.sourceDocumentSha256},
  observedClauses:pass?[...APPROVAL_CLAUSES]:[],
  newFunctionalExecution:false,production:false};
}
