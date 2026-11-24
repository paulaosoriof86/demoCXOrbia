import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePredeployPredecessor} from './cxorbia-i3-f2-predeploy-proven-predecessor.mjs';
const clone=structuredClone;
function fixture(){
 const source='b'.repeat(40),tree='c'.repeat(40),receiptBlob='d'.repeat(40),status='HOLD_I3_GTHN_PENDING_DEV';
 const paired={sourceSha:'9'.repeat(40),sourceTree:'a'.repeat(40),runtimeRevision:'runtime-384',runtimeDigest:'sha256:'+('e'.repeat(64)),hostingVersion:'hosting-384',runId:2748,materializationReceiptPath:'docs/checkpoints/prior.json',production:false};
 const seal={...paired,mode:'PREDECESSOR_SERVING_PENDING_SOURCE',receiptPath:paired.materializationReceiptPath,receiptBlob};
 const pending={state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',scope:'RUNTIME_AND_HOSTING',sourceSha:source,sourceTree:tree,predecessorProductSourceSha:paired.sourceSha,servingPairedMaterialization:clone(paired),servingRuntimeSeal:clone(seal),devPublished:false,production:false};
 return {source,tree,status,receiptBlob,pendingDev:{present:true,pass:true},receipt:{source:{sha:paired.sourceSha,tree:paired.sourceTree},materialization:clone(paired)},descriptor:{productSourceSha:source,productTreeAuthority:tree,status,currentMaterialization:paired,postDeployRunSeal:seal,pendingDevSuccessor:pending,i4Authorized:false},
 runtime:{spec:{template:{spec:{containers:[{env:[{name:'CXORBIA_RECOVERY_SOURCE_SHA',value:paired.sourceSha}]}]}}},status:{latestReadyRevisionName:paired.runtimeRevision,traffic:[{revisionName:paired.runtimeRevision,percent:100}]}},
 hosting:{release:{version:{name:paired.hostingVersion}}},revision:{metadata:{name:paired.runtimeRevision},status:{imageDigest:'gcr.io/example@'+paired.runtimeDigest}}};
}
test('new paired source is bound to the actual committed serving predecessor',()=>{
 const f=fixture(),r=validatePredeployPredecessor(f);assert.equal(r.decision,'PASS_EXACT_PROVEN_DEV_PREDECESSOR');assert.equal(r.writes,0);assert.equal(r.production,false);assert.equal(r.priorProofRun,2748);
});
for(const [label,mutate,error]of[
 ['wrong status',f=>f.status='OTHER',/pending status drift/],
 ['candidate source',f=>f.source='wrong',/candidate source drift/],
 ['candidate tree',f=>f.tree='wrong',/candidate tree drift/],
 ['missing proof',f=>delete f.pendingDev,/proof missing/],
 ['unproven source',f=>f.pendingDev.pass=false,/proof invalid/],
 ['wrong predecessor',f=>f.descriptor.pendingDevSuccessor.predecessorProductSourceSha='wrong',/predecessor source drift/],
 ['altered receipt',f=>f.receipt.materialization.runtimeRevision='other',/committed predecessor materialization drift/],
 ['wrong blob',f=>f.receiptBlob='f'.repeat(40),/receipt blob drift/],
 ['wrong ready revision',f=>f.runtime.status.latestReadyRevisionName='other',/last proven runtime revision mismatch/],
 ['split traffic',f=>f.runtime.status.traffic.push({revisionName:'other',percent:1}),/one serving revision/],
 ['99 percent',f=>f.runtime.status.traffic[0].percent=99,/100%/],
 ['other traffic',f=>f.runtime.status.traffic[0].revisionName='other',/traffic revision mismatch/],
 ['wrong runtime source',f=>f.runtime.spec.template.spec.containers[0].env[0].value='other',/prior runtime source mismatch/],
 ['missing runtime source',f=>f.runtime.spec.template.spec.containers[0].env=[],/prior runtime source mismatch/],
 ['wrong hosting',f=>f.hosting.release.version.name='other',/Hosting version mismatch/],
 ['wrong digest',f=>f.revision.status.imageDigest='sha256:wrong',/runtime digest mismatch/],
 ['missing revision',f=>delete f.revision,/revision readback missing/],
 ['published claim',f=>f.descriptor.pendingDevSuccessor.devPublished=true,/Expected values/],
 ['production claim',f=>f.descriptor.pendingDevSuccessor.production=true,/Expected values/]
])test('predeploy blocks '+label,()=>{const f=fixture();mutate(f);assert.throws(()=>validatePredeployPredecessor(f),error);});
