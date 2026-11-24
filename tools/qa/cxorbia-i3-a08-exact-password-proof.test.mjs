import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {finalDecision} from '../../firebase/auth-dev-tools/cxorbia-i3-a08-residual-password-api-storage-readonly.mjs';
import {assessExactPasswordProof,assessCurrentProviderPasswordProof,sameKeeperSealedHashes,A08_PASSWORD_EXCEPTION_IDS,A08_USER_ADMIN_PATH} from './cxorbia-i3-a08-exact-password-proof.mjs';
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

const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function durableFixture(adjudicated=false){
  const shopperId=A08_PASSWORD_EXCEPTION_IDS[0],uid=adjudicated?'QA-keeper-uid':'cx-sh-'+digest('tya\0shopper\0'+shopperId).slice(0,28);
  const fingerprint=digest('cxorbia-provider-uid-v1\0'+uid),rule='tya-shopper-primer-nombre-primer-apellido-v2';
  const versions={credentialRuleVersion:rule,credentialSweepVersion:'cxorbia-durable-shopper-credential-sweep-v2',credentialPasswordProofVersion:'cxorbia-shopper-password-proof-v2',credentialPasswordRuleVersion:rule};
  const common={tenantId:'tya',shopperId,projectIds:['cinepolis'],visibleLogin:'qa.existing',...versions};
  const member={...common,active:true,role:'shopper',authNamespace:'shopper',credentialState:'enrolled',providerUidFingerprint:fingerprint};
  const profile={...common},authUser={uid,disabled:false,email:digest('tya\0shopper\0qa.existing').slice(0,48)+'@auth.cxorbia.invalid',customClaims:{tenantId:'tya',shopperId,projectIds:['cinepolis'],role:'shopper',authNamespace:'shopper'}};
  const cross={tenantId:'tya',shopperId,sourceStableKey:shopperId,providerUidFingerprint:fingerprint,sourceType:'hr_external',identityMode:'stable_hr_shopper_id',fuzzyMatching:false};
  const expected={ok:true,ruleVersion:rule,login:'qa.current',password:'Qa123*'};
  const f={shopperId,uid,member,profile,authUser,expected,cross,sealedHashes:[]};
  if(adjudicated){
    const ref='a'.repeat(40),linkId='irl_'+'b'.repeat(32);
    Object.assign(profile,{identityAuthority:'tenant_adjudication',identityAuthorityRef:ref,identityConsolidatedAt:'2026-01-01'});
    member.identityConsolidatedAt='2026-01-01';cross.identityAuthorityRef=ref;
    f.receipt={status:'committed',commandType:'shopper.identity.adjudicate',providerAck:true,identityConsolidated:true,shopperId,keeperUidFingerprint:fingerprint,actorUid:'QA-super',commandDigest:'c'.repeat(64),identityLinkId:linkId};
    f.link={identityLinkId:linkId,tenantId:'tya',projectScope:'cinepolis',status:'active',canonicalShopperId:shopperId,authorityType:'tenant_adjudication',authorityRef:ref,providerAck:true,humanConfirmed:true,fuzzyMatching:false};
  }
  return f;
}
test('explicit current-provider mode authorizes only one recipe with exact durable HR-native UID',()=>{
  const f=durableFixture(),r=assessCurrentProviderPasswordProof(f);
  assert.equal(r.allowed,true);assert.equal(r.durableProviderProof,true);assert.equal(r.credentialHashMatches,false);
  assert.equal(r.credentialHashSource,'NOT_STORED_BY_HR_NATIVE_PROVIDER');assert.equal(Object.values(r).includes(f.expected.password),false);
});
test('adjudicated keeper must carry exact committed receipt, crosswalk, link and UID',()=>{
  const f=durableFixture(true);assert.equal(assessCurrentProviderPasswordProof(f).allowed,true);
  f.receipt.keeperUidFingerprint='wrong';assert.equal(assessCurrentProviderPasswordProof(f).allowed,false);
  const g=durableFixture(true);g.link.authorityRef='d'.repeat(40);assert.equal(assessCurrentProviderPasswordProof(g).allowed,false);
  const h=durableFixture(true);h.link.humanConfirmed=false;assert.equal(assessCurrentProviderPasswordProof(h).allowed,false);
});
test('changed first name cannot invent an alternative keeper password',()=>{
  const f=durableFixture(true);f.expected.login='another.current';f.expected.password='Another123*';
  assert.equal(assessCurrentProviderPasswordProof(f).reason,'CURRENT_PROVIDER_FIRST_NAME_AUTHORITY_CHANGED');
});
test('missing durable markers, wrong exact target, mismatched Auth or scope remain HOLD',()=>{
  for(const mutate of [f=>delete f.member.credentialPasswordProofVersion,f=>delete f.profile.credentialPasswordRuleVersion,f=>f.shopperId='unapproved',f=>f.authUser.disabled=true,f=>f.authUser.customClaims.shopperId='other',f=>f.cross.providerUidFingerprint='wrong',f=>f.member.projectIds=[]]){
    const f=durableFixture();mutate(f);assert.equal(assessCurrentProviderPasswordProof(f).allowed,false);
  }
});
test('a same-UID sealed hash can veto durable provenance and cannot be replaced',()=>{
  const f=durableFixture();f.sealedHashes=['0'.repeat(64)];assert.equal(assessCurrentProviderPasswordProof(f).allowed,false);
  f.sealedHashes=[digest(f.expected.password)];assert.equal(assessCurrentProviderPasswordProof(f).credentialHashMatches,true);
  f.sealedHashes.push(f.sealedHashes[0]);assert.equal(assessCurrentProviderPasswordProof(f).allowed,false);
});
test('legacy seal follows exact import UID, not a different record sharing the person name',()=>{
  const login='qa.original',uid='tya-sh-'+digest('tya\0shopper\0'+login).slice(0,24),hash=digest('Qa123*');
  const row={kind:'shopper',authNamespace:'shopper',normalizedLogin:login,passwordHashAlgorithm:'SHA256',passwordHashRounds:1,passwordHashHex:hash};
  assert.deepEqual(sameKeeperSealedHashes([row,{...row,normalizedLogin:'qa.other'}],uid),[hash]);
  assert.deepEqual(sameKeeperSealedHashes([row],'different-uid'),[]);
});
test('password-only focal proof does not repeat or manufacture current API/Storage evidence',()=>{
  const base={decision:'PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT',sourceSha:'source',sourceTree:'tree',runtimeRevision:'r',runtimeDigest:'d',hostingVersion:'h',firestoreRuleset:'f',storageRuleset:'s',receiptPath:'p',receiptGitBlob:'b'};
  const result={sourceSha:'source',scope:{executionMode:'PASSWORD_ONLY'},passwordProofs:A08_PASSWORD_EXCEPTION_IDS.map(shopperId=>({shopperId,pass:true})),apiProofs:[],storageProof:null,errors:[]};
  const r=finalDecision(result,{...base,servedAssetsMatch:41},{...base,phase:'after'});
  assert.equal(r.requestedScopePass,true);assert.equal(r.pass,false);assert.equal(r.apis,false);assert.equal(r.storage,false);
});
