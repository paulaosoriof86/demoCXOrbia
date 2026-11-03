import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';

// I3 P0: read-only proof after the existing single DEV materialization run.
// An accepted gcloud update is not evidence that the new revision is serving.
const source='3c2e3973c47759a5892f3c8c3c41f5db67c59396';
const expectedRevision='cxorbia-live-hr-dev-00335-tpk';
const expectedImage='gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev:i3-vrm154-156-3c2e3973c477-41655176051';
const previousDigest='sha256:ef9f7134c6a4505fdd3a1e960f49da81486cb1feedb5ecbe677c52aa8df8f641';
const run=(args)=>JSON.parse(execFileSync('gcloud',args,{encoding:'utf8',timeout:45000,maxBuffer:6_000_000}));
const d=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
assert.equal(d.productSourceSha,source,'RELEASE_COMPOSITION_FAILURE:SOURCE_NOT_EXACT');
assert.equal(d.production,'DO_NOT_TOUCH');

const service=run(['run','services','describe','cxorbia-live-hr-dev',
  '--project=cxorbia-backend-dev','--region=us-central1','--format=json']);
const created=service.status?.latestCreatedRevisionName;
const ready=service.status?.latestReadyRevisionName;
const traffic=(service.status?.traffic||[]).filter(x=>x.revisionName===ready&&x.percent===100);
assert.equal(created,expectedRevision,'ENVIRONMENT_FAILURE:UNEXPECTED_CREATED_REVISION');
assert.equal(ready,expectedRevision,'ENVIRONMENT_FAILURE:NEW_RUNTIME_NOT_READY');
assert.equal(service.spec?.template?.spec?.containers?.[0]?.image,expectedImage,
  'RELEASE_COMPOSITION_FAILURE:SOURCE_IMAGE_TAG_NOT_ACTIVE');
assert.equal(traffic.length,1,'ENVIRONMENT_FAILURE:NEW_RUNTIME_NOT_100_PERCENT_TRAFFIC');

const revision=run(['run','revisions','describe',ready,
  '--project=cxorbia-backend-dev','--region=us-central1','--format=json']);
const raw=String(revision.status?.imageDigest||'');
const digest=raw.includes('@sha256:')?`sha256:${raw.split('@sha256:')[1]}`:raw;
assert.match(digest,/^sha256:[a-f0-9]{64}$/,'ENVIRONMENT_FAILURE:REVISION_DIGEST_MISSING');
assert.notEqual(digest,previousDigest,'RELEASE_COMPOSITION_FAILURE:OLD_RUNTIME_DIGEST_STILL_SERVING');
assert.equal(revision.metadata?.name,expectedRevision);
assert.equal(revision.status?.conditions?.find(x=>x.type==='Ready')?.status,'True',
  'ENVIRONMENT_FAILURE:REVISION_NOT_HEALTHY');

console.log(JSON.stringify({decision:'PASS_VRM134_A05_ACTIVE_RUNTIME_READBACK',sourceSha:source,
  revision:ready,imageTag:expectedImage,runtimeDigest:digest,trafficPercent:100,
  sourceBuildRun:41655176051,builds:0,deploys:0,providerWrites:0,production:false}));
