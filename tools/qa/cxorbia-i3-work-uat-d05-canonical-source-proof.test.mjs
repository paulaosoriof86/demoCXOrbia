import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

// Included by the existing canonical-candidate-authority work-uat glob.
// This is source CI only: no provider, browser, Firebase, or financial writes.
const descriptorPath='CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
const owners=[
  'app/modules/cert.js',
  'app/core/backend-resources.js',
  'backend/runtime/hr-live-service/certification-runtime.mjs',
  'firestore.rules'
];
const suites=[
  ['backend/runtime/hr-live-service/test/cxorbia-prei4-cert-res-contract.test.mjs',40],
  ['tools/qa/cxorbia-i3-d04-versioned-bank-review.test.mjs',60],
  ['tools/qa/cxorbia-i3-d05-review-visibility-source.test.mjs',6]
];
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',timeout:30000}).trim();

test('D05/D04 exact canonical source, 106 server/client assertions, no DEV actions',()=>{
  const descriptor=JSON.parse(readFileSync(descriptorPath,'utf8'));
  const source=String(descriptor.productSourceSha||'');
  const tree=String(descriptor.productTreeAuthority||'');
  assert.match(source,/^[0-9a-f]{40}$/,'candidate source SHA required');
  assert.match(tree,/^[0-9a-f]{40}$/,'candidate source tree required');
  assert.equal(git('rev-parse',source+'^{tree}'),tree);
  git('merge-base','--is-ancestor',source,'HEAD');
  git('diff','--quiet',source,'HEAD','--',...owners);
  for(const owner of owners)assert.equal(git('rev-parse','HEAD:'+owner),git('rev-parse',source+':'+owner),owner);

  for(const [suite,count] of suites){
    const output=execFileSync(process.execPath,[suite],{
      encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024,
      env:{...process.env,NODE_TEST_CONTEXT:undefined}
    });
    const has=(field,num)=>new RegExp('^(?:#|ℹ)\\s*'+field+'\\s+'+num+'\\s*$','m').test(output);
    assert.ok(has('tests',count),'exact test count for '+suite);
    assert.ok(has('pass',count),'all assertions pass for '+suite);
    assert.ok(has('fail',0),'no assertion failures for '+suite);
  }
  console.log(JSON.stringify({
    decision:'PASS_D05_D04_EXACT_CANONICAL_SOURCE_CI_FOCAL',
    sourceSha:source,sourceTree:tree,tests:106,pass:106,fail:0,
    scope:'SERVER_CLIENT_SOURCE_ONLY',rulesE2e:'PENDING',
    devRuntimeHosting:'PENDING',shopperLifecycle:'PENDING',
    humanAcceptance:'PENDING',builds:0,deploys:0,hrWrites:0,production:false
  }));
});
