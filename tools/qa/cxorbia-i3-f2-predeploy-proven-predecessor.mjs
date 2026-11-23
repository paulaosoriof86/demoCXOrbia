/** Read-only single-lane DEV predeploy identity guard.
 * Validates actual Cloud Run + Hosting against the latest independently proven
 * predecessor of the approved F2 successor. Never writes or deploys.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const [runtimePath,hostingPath,descriptorPath,status,source,tree]=process.argv.slice(2);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
assert.ok(runtimePath&&hostingPath&&descriptorPath&&status&&source&&tree,'missing exact guard arguments');
const runtime=read(runtimePath),hosting=read(hostingPath),descriptor=read(descriptorPath);
assert.equal(descriptor.productSourceSha,source,'candidate source drift');
assert.equal(descriptor.productTreeAuthority,tree,'candidate tree drift');
const isF2=status==='HOLD_I3_F2_EXCEL_OPERATIONAL_READER_SOURCE_ONLY_PENDING_DEV_6_OF_21';
let expectedRuntime=descriptor.postDeployRunSeal?.runtimeRevision;
let expectedHosting=descriptor.currentHostingOnlyDevMaterialization?.hostingVersion||descriptor.currentMaterialization?.hostingVersion;
let priorProofRun=null;
if(isF2){
 const prior=read('.github/control/CXORBIA_I3_F2_VERIFIED_SERVING_PREDECESSOR_20261123.json');
 assert.equal(prior.proofRunId,45197074228,'not last proved predecessor');
 assert.equal(prior.proofJobConclusion,'success');
 assert.equal(prior.proofResultJsonSha256,'1c529bcdcc9852b5a5813d29ede9326d55059a943f368ff53535c09b2a386507');
 assert.equal(prior.production,'DO_NOT_TOUCH');
 assert.equal(prior.nextSourceSha,source);
 assert.equal(prior.nextSourceTree,tree);
 const app=runtime.spec?.template?.spec?.containers?.[0];
 assert.equal(app?.env?.find(e=>e.name==='CXORBIA_RECOVERY_SOURCE_SHA')?.value,prior.sourceSha,'prior runtime source mismatch');
 assert.equal(app?.image,prior.runtimeImageTag,'prior runtime image mismatch');
 expectedRuntime=prior.runtimeRevision;
 expectedHosting=prior.hostingVersion;
 priorProofRun=prior.proofRunId;
}
assert.equal(runtime.status?.latestReadyRevisionName,expectedRuntime,'last proven runtime revision mismatch');
assert.equal((runtime.status?.traffic||[]).filter(x=>x.revisionName===expectedRuntime&&x.percent===100).length,1,'prior DEV runtime must serve 100%');
assert.equal(hosting.release?.version?.name,expectedHosting,'last proven Hosting version mismatch');
console.log('CXORBIA_I3_EXACT_DEV_PREDEPLOY_READBACK='+JSON.stringify({decision:'PASS_EXACT_PROVEN_DEV_PREDECESSOR',priorProofRun,predecessorRuntime:expectedRuntime,predecessorHosting:expectedHosting,newSourceSha:source,production:false,writes:0}));
