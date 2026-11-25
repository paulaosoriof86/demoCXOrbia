import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {publicA08ClauseRefs,projectCurrentScopedClauses,verifiedTypedReceipt,canonicalSha256,FINANCE_METADATA_SCOPE_PATH} from './cxorbia-i3-scoped-clause-projection.mjs';
import {summarizeTypedResult} from './cxorbia-i3-typed-result-summary.mjs';
import {readScopedIndexResults,reconcileCurrentScopedClauses} from './cxorbia-i3-automatic-result-consumer.mjs';
import {jsonBytes,gitBlob,sha256,DESCRIPTOR,POINTER,bindControlPaths,assertPreserved} from './cxorbia-i3-current-control-projection.mjs';
const HN='shopper_hn_3b3c2f5cc1',GT='shopper_gt_a092a0647f',SHP='shp-3669abbb015a';
const artifactDigest='sha256:3531e310a17d435f6b4b5eebcd3c55b245939c4fdbdf96ab02d5c894b3ed3dbb';
const leaf='f901d42c1ff1ec0dd6538324b076021731da154f08b7d34e72a987939c76f2da';
const source='1691a76a7bc095ad4bf444aa0db76df2f359a5f0',tree='3725071a72014d6b891648ab5d2eeef9638276ac';
const transport=()=>({runId:45514816284,runAttempt:1,jobId:138871930190,artifactId:14976459189,artifactDigest,verifiedArchiveDigest:artifactDigest,controlHead:'7fa5862854e07b71bcb2c73edf73eab2e29fa8e9',entry:'result.json',jobName:'i3-keeper-role-e2e-readonly',jobConclusion:'failure'});
function raw(){return {schemaVersion:'cxorbia.i3.a08.password3-api-storage.residual.readonly.v1',decision:'HOLD_I3_A08_RESIDUAL_READONLY',gate:'HOLD',fullA08Certified:false,newDomainMatches:0,sourceSha:source,sourceTree:tree,runtimeRevision:'cxorbia-live-hr-dev-00391-8mg',runtimeDigest:'sha256:'+'a'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/test',scope:{executionMode:'PASSWORD_ONLY'},passwordProofs:[{shopperId:GT,pass:false},{shopperId:HN,pass:true,decision:'PASS_R20_ORDINARY_PASSWORD_FULL_SESSION_LIFECYCLE',evidenceSha256:leaf,customTokenCountsAsPasswordProof:false},{shopperId:SHP,pass:false}],apiProofs:[],preservedEvidence:[{runNumber:2760,artifactId:14906482096,artifactSha256:'ec78e422057ff95e8d062c58df9c57aff9e30ddec505303461b2e95daf700dfa',credit:'HISTORICAL_API_DENIALS_4_OF_4_PRESERVED_NOT_REEXECUTED',currentRunApiCalls:0}],sameArtifactAfter:true,finalChecks:{seal:true,expectedAssetCount:48,servedAssetCount:48},safety:{production:false}};}
function preservedHn(){return {runId:45514816284,runAttempt:1,jobId:138871930190,artifactId:14976459189,artifactSha256:artifactDigest.slice(7),entry:'r20-shopper_hn_3b3c2f5cc1/result.json',entrySha256:leaf,credit:'HISTORICAL_HN_PASSWORD_LIFECYCLE_PASS_PRESERVED_NOT_REEXECUTED',currentRunLoginAttempts:0};}
function summary(){return summarizeTypedResult({resultText:jsonBytes(raw()),transport:transport()});}
function indexEntry(result,runId=45514816284,jobId=138871930190){
 const bytes=jsonBytes(result);return {key:`${runId}/1/${jobId}`,path:`docs/checkpoints/CXORBIA_I3_RUN${runId}_ATTEMPT1_JOB${jobId}_TYPED_RESULT.json`,gitBlob:gitBlob(bytes),sha256:sha256(bytes),runId,runAttempt:1,jobId,controlHead:transport().controlHead,artifactId:14976459189,artifactDigest,ownerReceiptCount:0};
}
function matrix(){return {version:'V399',classificationCounts:{MATCH:6,HOLD:15},productSource:{sha:source},sourceFiles:[{currentBlob:'unchanged'}],modules:[
 {domain:'auth-protected-data-runtime',classification:'HOLD',currentCandidateSource:'candidate',lastServedSource:'predecessor',currentResidualClauses:{pending:`Only exact RUN2222 Auth exceptions ${GT},${HN},${SHP} and uncovered A08 API/Firestore/Storage role denials.`,preserved:'Julissa and VRM217 approved.'}},
 {domain:'shoppers-mi-visitas-profile',classification:'HOLD',currentResidualClauses:{pending:'A07 profile edit; three exactAuth exceptions; B3 UI camera/file/GPS and independentAdmin review.',preserved:'RUN2479 accepted.'}},
 {domain:'core-config-data-router-permissions',classification:'HOLD',currentResidualClauses:{pending:'Only uncovered operation×role×project cases at API,Firestore and Storage.',preserved:'Existing permissions accepted.'}},
 {domain:'finance-core-liquidation-costs',classification:'HOLD',currentResidualClauses:{pending:'Resolve current amount/source/payability and safe November metadata edit; finish eligible/blocked UI and role/session/reload/replay/support.',preserved:'C04/C05 and B5 accepted.'}},
 {domain:'certifications',classification:'HOLD',currentResidualClauses:{pending:'D08 functional UI remains.',preserved:'RUN2391 provider PASS.'}},
 {domain:'benefits',classification:'MATCH',actionRequired:'Preserve approved benefits.',humanApproval:{approved:true}}
 ]};}
const financeHash='f'.repeat(64);
function finance(){return {schemaVersion:'cxorbia.i3.typed-result-summary.v1',kind:'FINANCE_METADATA',state:'HOLD',fullDomain:false,newDomainMatches:0,phaseAComplete:false,production:false,ownerSpecificReceipts:[],producer:{decision:'PASS_FINANCE_METADATA_SECOND_ADVANCE',jobConclusion:'success'},observations:{readbackExact:true,firstUnchanged:true,financialFactsUnchanged:true,sameLedgerTotal:true,advanceCount:2,newMovements:0,allocationOrPayoutWrites:0,providerCommandsExecuted:2,providerWrites:3,idempotentReplay:true,scopeSha256:financeHash,safety:{production:false,hrWrites:0,bankWrites:0,externalPaymentWrites:0,directFirestoreWrites:0,financialFactWrites:0}}};}
function verified(){const a=summary(),f=finance();return [{entry:indexEntry(a),result:a},{entry:{key:'45514816284/1/138871923237',runId:45514816284,jobId:138871923237},result:f}];}
const project=(m=matrix(),v=verified(),hash=financeHash)=>projectCurrentScopedClauses({matrix:m,verified:v,financeScopeSha256:hash});

test('held A08 job preserves exactly HN and four historical API cells',()=>{
 const x=summary();assert.equal(x.observations.acceptedClauseRefs.length,5);assert.deepEqual(x.observations.acceptedClauseRefs.filter(x=>x.clauseId.startsWith('A08.password')).map(x=>x.caseId),[HN]);assert.equal(x.state,'HOLD');assert.equal(x.newDomainMatches,0);assert.deepEqual(x.ownerSpecificReceipts,[]);
});
test('wrong HN leaf or artifact cannot acquire historical credit',()=>{
 const a=raw();a.passwordProofs[1].evidenceSha256='0'.repeat(64);assert.equal(publicA08ClauseRefs(a,transport()).length,4);
 const t=transport();t.artifactDigest='sha256:'+'0'.repeat(64);assert.equal(publicA08ClauseRefs(raw(),t).length,4);
});
test('provenance-only carries existing evidence without crediting either diagnosed password',()=>{
 const a=raw();a.passwordProofs=[];a.preservedEvidence.push(preservedHn());a.provenanceDiagnostics=[{caseId:'GT',diagnosticComplete:true},{caseId:'SHP',diagnosticComplete:true}];a.diagnosticComplete=true;a.password='DO_NOT_COPY';a.uid='DO_NOT_COPY';
 const refs=publicA08ClauseRefs(a,{...transport(),runId:999});assert.equal(refs.length,5);assert.ok(!JSON.stringify(refs).includes('DO_NOT_COPY'));assert.deepEqual(refs.filter(x=>x.clauseId.startsWith('A08.password')).map(x=>x.caseId),[HN]);
});
test('diagnostic completion alone supplies no accepted clauses',()=>{const a=raw();a.passwordProofs=[];a.preservedEvidence=[];a.diagnosticComplete=true;assert.deepEqual(publicA08ClauseRefs(a,transport()),[]);});
test('API preservation with wrong digest does not credit any API denial',()=>{const a=raw();a.preservedEvidence[0].artifactSha256='0'.repeat(64);assert.equal(publicA08ClauseRefs(a,transport()).length,1);});
test('receipt identity and hash are both verified before projection',()=>{const a=summary(),e=indexEntry(a),bytes=jsonBytes(a);assert.equal(verifiedTypedReceipt(e,bytes,{gitBlob,sha256}).result.kind,'A08_RESIDUAL');assert.throws(()=>verifiedTypedReceipt(e,bytes+' ',{gitBlob,sha256}),/RECEIPT_HASH/);const bad={...e,jobId:7};assert.throws(()=>verifiedTypedReceipt(bad,bytes,{gitBlob,sha256}),/RECEIPT_IDENTITY/);});
test('subtracts only HN and metadata; GT, SHP, Storage and financial UI remain',()=>{
 const before=matrix(),p=project(before);assert.equal(p.changedDomains.length,4);
 const by=id=>p.matrix.modules.find(x=>x.domain===id).currentResidualClauses;
 assert.ok(!by('auth-protected-data-runtime').pending.includes(HN));assert.ok(by('auth-protected-data-runtime').pending.includes(GT));assert.ok(by('auth-protected-data-runtime').pending.includes(SHP));assert.match(by('auth-protected-data-runtime').pending,/Storage/);
 assert.match(by('shoppers-mi-visitas-profile').pending,/two exact Auth exceptions/);assert.match(by('shoppers-mi-visitas-profile').pending,/A07.*B3/);
 assert.ok(!by('finance-core-liquidation-costs').pending.includes('November metadata edit'));assert.match(by('finance-core-liquidation-costs').pending,/payability.*eligible\/blocked UI/);
 assert.deepEqual(p.matrix.modules.find(x=>x.domain==='certifications'),before.modules.find(x=>x.domain==='certifications'));assert.deepEqual(p.matrix.sourceFiles,before.sourceFiles);assert.deepEqual(p.matrix.classificationCounts,before.classificationCounts);assert.deepEqual(p.matrix.modules.find(x=>x.classification==='MATCH'),before.modules.find(x=>x.classification==='MATCH'));
 assert.ok(before.modules[0].currentResidualClauses.pending.includes(HN));
});
test('API-only credit leaves all three password exceptions pending',()=>{const v=verified().slice(0,1);v[0].result.observations.acceptedClauseRefs=v[0].result.observations.acceptedClauseRefs.filter(x=>x.clauseId.includes('.api.'));const p=project(matrix(),v);assert.ok(p.matrix.modules[0].currentResidualClauses.pending.includes(HN));assert.deepEqual(p.changedDomains,['auth-protected-data-runtime','core-config-data-router-permissions']);});
for(const [name,edit]of [['wrong scope',f=>{f.observations.scopeSha256='0'.repeat(64);}],['failed job',f=>{f.producer.jobConclusion='failure';}],['no exact readback',f=>{f.observations.readbackExact=false;}],['financial write',f=>{f.observations.safety.financialFactWrites=1;}],['domain promotion claim',f=>{f.newDomainMatches=1;}],['not replay safe',f=>{f.observations.idempotentReplay=false;}]])test('metadata does not clear obligation with '+name,()=>{const v=verified().slice(1);edit(v[0].result);assert.equal(project(matrix(),v).changed,false);});
test('idempotent metadata noop settles the same metadata obligation only',()=>{const v=verified().slice(1),f=v[0].result;f.producer.decision='PASS_FINANCE_METADATA_ALREADY_APPLIED';Object.assign(f.observations,{providerCommandsExecuted:0,providerWrites:0,idempotentReplay:false,idempotentNoop:true});assert.deepEqual(project(matrix(),v).changedDomains,['finance-core-liquidation-costs']);});
test('replay and duplicate receipts do not increase credit or create another residual version',()=>{const v=verified(),p=project(matrix(),v),again=project(p.matrix,[...v,...v]);assert.equal(again.changed,false);assert.deepEqual(again.matrix,p.matrix);});
test('unknown or tampered A08 reference is rejected',()=>{const v=verified();v[0].result.observations.acceptedClauseRefs[0].evidence.entrySha256='0'.repeat(64);assert.throws(()=>project(matrix(),v),/A08_REFERENCE_NOT_EXACT/);});
test('predecessor serving and pending candidate are not rewritten by scoped credit',()=>{const p=project();assert.equal(p.matrix.modules[0].currentCandidateSource,'candidate');assert.equal(p.matrix.modules[0].lastServedSource,'predecessor');});
test('MATCH modules and their human acceptance remain byte-identical',()=>{const m=matrix();m.modules[0].classification='MATCH';const p=project(m);assert.deepEqual(p.matrix.modules[0],m.modules[0]);});
test('cleanup-only evidence does not settle D08 functional requirements',()=>{const result={...finance(),kind:'D08_RECOVERY',observations:{cleanup:{ok:true,remainingOwnedDocuments:0,remainingOwnedAuth:0}},producer:{decision:'PASS_I3_D08_RUN2783_EXACT_RECOVERY_CLEANUP',jobConclusion:'success'}};assert.equal(project(matrix(),[{entry:{key:'cleanup',runId:999,jobId:1},result}]).changed,false);});

function oldIndexFixture(){
 const rawText=jsonBytes(raw()),a=summary();delete a.observations.acceptedClauseRefs;const e=indexEntry(a),stored=jsonBytes(a),folder=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-scoped-test-'));fs.writeFileSync(path.join(folder,'result.json'),rawText);
 const index={schemaVersion:'cxorbia.i3.typed-result-index.v1',production:false,results:[e]},files=new Map(),controls={blobs:new Map([[e.path,e.gitBlob]]),readBytes:async p=>{assert.equal(p,e.path);return stored;}};
 let downloads=0;const artifact={id:e.artifactId,digest:e.artifactDigest,expired:false,workflow_run:{id:e.runId,head_sha:e.controlHead}};
 const api=async route=>{assert.equal(route,`/repos/paulaosoriof86/demoCXOrbia/actions/artifacts/${e.artifactId}`);return artifact;};
 const download=async()=>{downloads++;return {folder,digest:artifactDigest,cleanup(){}};};
 return {index,files,controls,api,download,artifact,folder,stored,downloads:()=>downloads,cleanup:()=>fs.rmSync(folder,{recursive:true,force:true})};
}
test('old A08 index upgrades from exact artifact without changing old receipt or key',async()=>{const f=oldIndexFixture();try{
 const got=await readScopedIndexResults(f);assert.equal(got.upgraded,1);assert.equal(got.index.results.length,1);assert.equal(got.index.results[0].key,f.index.results[0].key);assert.match(got.index.results[0].path,/_TYPED_RESULT_SCOPED_V1.json$/);assert.equal(f.files.has(f.index.results[0].path),false);assert.equal(got.verified[0].result.observations.acceptedClauseRefs.length,5);assert.deepEqual(got.verified[0].result.normalizationOrigin,{path:f.index.results[0].path,gitBlob:f.index.results[0].gitBlob,sha256:f.index.results[0].sha256});
 const again=await readScopedIndexResults({...f,index:got.index});assert.equal(again.upgraded,0);assert.equal(f.downloads(),1);assert.deepEqual(again.index,got.index);
 }finally{f.cleanup();}});
test('normalization rejects changed artifact without writing anything',async()=>{const f=oldIndexFixture();try{f.artifact.digest='sha256:'+'0'.repeat(64);await assert.rejects(readScopedIndexResults(f),/NORMALIZATION_ARTIFACT/);assert.equal(f.files.size,0);}finally{f.cleanup();}});
test('normalization rejects changed raw result and retains historical receipt',async()=>{const f=oldIndexFixture();try{fs.appendFileSync(path.join(f.folder,'result.json'),' ');await assert.rejects(readScopedIndexResults(f),/NORMALIZATION_RAW_HASH/);assert.equal(f.files.size,0);}finally{f.cleanup();}});

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const readFile=p=>fs.readFileSync(path.join(root,p),'utf8');
function controlsFixture(){const descriptor=JSON.parse(readFile(DESCRIPTOR)),pointer=JSON.parse(readFile(POINTER));return {descriptor,pointer,matrix:JSON.parse(readFile(descriptor.moduleTruthPath)),ledger:JSON.parse(readFile(descriptor.findingsLedgerPath)),blobs:new Map(),readBytes:async p=>readFile(p)};}
test('existing control binder can bind residual-only successor without fabricated execution receipt',()=>{const controls=controlsFixture(),out=structuredClone({descriptor:controls.descriptor,pointer:controls.pointer,matrix:controls.matrix,ledger:controls.ledger});const files=bindControlPaths(out,{matrixPath:'RECOVERY-I3-MODULE-TRUTH-MATRIX-20261125-V999.json',ledgerPath:'CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V999_2026-11-25.json'});assert.equal(files.size,4);assert.equal(files.has(undefined),false);assertPreserved(controls,out);});
test('consumer projects already indexed metadata with no provider or artifact download',async()=>{
 const controls=controlsFixture(),f=finance();f.observations.scopeSha256=canonicalSha256(JSON.parse(readFile(FINANCE_METADATA_SCOPE_PATH)));f.provenance={runId:45514816284,runAttempt:1,jobId:138871923237,artifactId:14976459189,artifactDigest,controlHead:transport().controlHead};
 const e=indexEntry(f,45514816284,138871923237),index={schemaVersion:'cxorbia.i3.typed-result-index.v1',production:false,results:[e]},files=new Map([[e.path,jsonBytes(f)]]);for(const c of [controls.descriptor,controls.pointer])c.currentFunctionalEvidenceIndex=index;
 const before=structuredClone({descriptor:controls.descriptor,pointer:controls.pointer,ledger:controls.ledger,matrix:controls.matrix});
 const noProvider=async()=>{throw Error('UNEXPECTED_PROVIDER_CALL');};const got=await reconcileCurrentScopedClauses({api:noProvider,download:noProvider,controls,files,index,now:'2026-11-25T01:00:00Z'});
 assert.equal(got.upgraded,0);assert.deepEqual(got.changedDomains,['finance-core-liquidation-costs']);
 const d=JSON.parse(files.get(DESCRIPTOR)),p=JSON.parse(files.get(POINTER)),m=JSON.parse(files.get(d.moduleTruthPath)),l=JSON.parse(files.get(d.findingsLedgerPath));
 assertPreserved(before,{descriptor:d,pointer:p,matrix:m,ledger:l});assert.deepEqual(d.currentMaterialization,before.descriptor.currentMaterialization);assert.deepEqual(d.currentC3PreterminalAudit,before.descriptor.currentC3PreterminalAudit);assert.deepEqual(m.classificationCounts,before.matrix.classificationCounts);assert.deepEqual(l.findings,before.ledger.findings);assert.equal(d.moduleTruthExpectedGitBlob,gitBlob(files.get(d.moduleTruthPath)));
 const nextControls={...controls,descriptor:d,pointer:p,matrix:m,ledger:l,readBytes:async file=>files.has(file)?files.get(file):readFile(file)};const againFiles=new Map();const again=await reconcileCurrentScopedClauses({api:noProvider,download:noProvider,controls:nextControls,files:againFiles,index:got.index,now:'2026-11-25T02:00:00Z'});assert.equal(again.changed,false);assert.equal(againFiles.size,0);
});
test('projection failure cannot leak a staged normalization receipt or mutate caller files',async()=>{const f=oldIndexFixture();try{
 f.controls.descriptor={moduleTruthPath:'m.json',findingsLedgerPath:'l.json'};f.controls.pointer={};f.controls.matrix=matrix();f.controls.ledger={};f.controls.matrix.modules[0].currentResidualClauses.pending=HN+' in an unexpected scope';f.files.set('already-verified.json','preserve');
 const before=[...f.files];await assert.rejects(reconcileCurrentScopedClauses({...f,now:'2026-11-25T01:00:00Z'}),/AUTH_PENDING_INVENTORY/);assert.deepEqual([...f.files],before);
 }finally{f.cleanup();}});
test('C3 still ignores scoped summaries with no owner receipts',async()=>{
 const {readDurableDomainReceipts}=await import('./cxorbia-i3-c3-finalize-module-truth.mjs');const a=summary(),e=indexEntry(a),idx={schemaVersion:'cxorbia.i3.typed-result-index.v1',production:false,results:[e]};
 assert.deepEqual(readDurableDomainReceipts({descriptor:{currentFunctionalEvidenceIndex:idx},pointer:{currentFunctionalEvidenceIndex:idx},readBytes:()=>{throw Error('No C3 owner receipt exists');}}),{receipts:[],records:0});
});
