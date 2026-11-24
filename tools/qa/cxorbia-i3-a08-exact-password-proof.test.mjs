import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {finalDecision} from '../../firebase/auth-dev-tools/cxorbia-i3-a08-residual-password-api-storage-readonly.mjs';
import {assessExactPasswordProof,A08_PASSWORD_EXCEPTION_IDS,A08_USER_ADMIN_PATH} from './cxorbia-i3-a08-exact-password-proof.mjs';
const password='QA-only-not-a-real-secret';
const hash=crypto.createHash('sha256').update(password).digest('hex');
const base={expected:{ok:true,login:'canonical.name',password},visibleLogin:'existing.alias',sealedHashes:[hash]};
test('exact RUN2222 alias may use only its sealed proven password, without claiming canonization',()=>{
  for(const shopperId of A08_PASSWORD_EXCEPTION_IDS){
    const r=assessExactPasswordProof({...base,shopperId});
    assert.equal(r.allowed,true);assert.equal(r.credentialHashMatches,true);
    assert.equal(r.canonicalLoginMatches,false);assert.equal(r.usernameCanonizationProven,false);
    assert.equal(r.provenance,'EXACT_SEALED_HASH_EXISTING_LOGIN_ALIAS_AND_AUTH_CLAIMS');
    assert.equal(Object.values(r).includes(password),false);
  }
});
test('no exception for another shopper, missing hash, multiple hashes, or wrong password',()=>{
  assert.equal(assessExactPasswordProof({...base,shopperId:'unapproved'}).allowed,false);
  for(const sealedHashes of [[],[hash,hash],['0'.repeat(64)]])
    assert.equal(assessExactPasswordProof({...base,shopperId:A08_PASSWORD_EXCEPTION_IDS[0],sealedHashes}).allowed,false);
});
test('incomplete profile rule remains unproved and is diagnosed before any login attempt',()=>{
  const r=assessExactPasswordProof({...base,shopperId:A08_PASSWORD_EXCEPTION_IDS[0],expected:{ok:false}});
  assert.equal(r.allowed,false);assert.equal(r.reason,'CANONICAL_CREDENTIAL_RULE_INCOMPLETE');
});
test('ordinary canonical credential behavior remains unchanged outside A08',()=>{
  const r=assessExactPasswordProof({...base,shopperId:'other',visibleLogin:'canonical.name'});
  assert.equal(r.allowed,true);assert.equal(r.canonicalLoginMatches,true);
  assert.equal(r.provenance,'EXACT_SEALED_HASH_CANONICAL_RULE_AND_AUTH_CLAIMS');
});
test('API probe follows the existing Hosting rewrite and server route',()=>{
  assert.equal(A08_USER_ADMIN_PATH,'/api/tenants/tya/users');
  const hosting=JSON.parse(fs.readFileSync('firebase.json','utf8')).hosting;
  const matching=hosting.rewrites.find(x=>x.source==='/api/tenants/**');
  assert.equal(matching?.run?.serviceId,'cxorbia-live-hr-dev');
  const route=/^\/(?:api\/)?v?1?\/?tenants\/([^/]+)\/users(?:\/([^/:]+)(?:\/(profile|scope))?|\/([^/:]+):(disable|reactivate))?\/?$/;
  assert.equal(route.test(A08_USER_ADMIN_PATH),true);
  assert.equal(A08_USER_ADMIN_PATH.startsWith('/api/v1/'),false);
});

test('password/API focal result remains HOLD for Storage, and cannot promote full scope',()=>{
  const base={decision:'PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT',sourceSha:'source',sourceTree:'tree',runtimeRevision:'r',runtimeDigest:'d',hostingVersion:'h',firestoreRuleset:'f',storageRuleset:'s',receiptPath:'p',receiptGitBlob:'b'};
  const before={...base,servedAssetsMatch:41},after={...base,phase:'after'};
  const result={sourceSha:'source',scope:{executionMode:'PASSWORD_API_ONLY'},passwordProofs:A08_PASSWORD_EXCEPTION_IDS.map(shopperId=>({shopperId,pass:true})),apiProofs:Array.from({length:4},()=>({pass:true})),storageProof:{pass:false,skipped:true},errors:[]};
  const focal=finalDecision(result,before,after);
  assert.equal(focal.requestedScopePass,true);assert.equal(focal.pass,false);assert.equal(focal.storage,false);
  result.scope.executionMode='PASSWORD_API_STORAGE';assert.equal(finalDecision(result,before,after).requestedScopePass,false);
  result.scope.executionMode='PASSWORD_API_ONLY';result.passwordProofs[0].pass=false;assert.equal(finalDecision(result,before,after).requestedScopePass,false);
  result.passwordProofs[0].pass=true;after.hostingVersion='changed';assert.equal(finalDecision(result,before,after).requestedScopePass,false);
});
