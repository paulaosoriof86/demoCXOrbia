// Synthetic, local QA only. No provider reads, real credentials, browser, or writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import * as helper from './cxorbia-i3-a08-exact-password-proof.mjs';

const sha=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');

// Same durable keeper fields as a08-exact-password-proof.test.mjs::durableFixture.
// The link matches shopper-command-provider-v1's adjudication writer, except the
// historical omission documented in RUN2529_DURABLE_AUTHORITY_RECEIPT_20261115.
// The authorized GT selector is retained; keeper UID, aliases, actor, login,
// receipt/link IDs, and recipe below are synthetic test values.
function historicalFixture(){
  const shopperId=helper.A08_PASSWORD_EXCEPTION_IDS[0],uid='qa-historical-keeper';
  const login='qa.existing',fingerprint=sha('cxorbia-provider-uid-v1\0'+uid);
  const ref=sha('qa-authority-receipt').slice(0,40),aliases=['qa-alias-a','qa-alias-b'];
  const linkId='irl_'+sha(['tya','cinepolis',shopperId,...aliases].join('\0')).slice(0,32);
  const rule='tya-shopper-primer-nombre-primer-apellido-v2';
  const versions={credentialRuleVersion:rule,credentialSweepVersion:'cxorbia-durable-shopper-credential-sweep-v2',
    credentialPasswordProofVersion:'cxorbia-shopper-password-proof-v2',credentialPasswordRuleVersion:rule};
  const common={tenantId:'tya',shopperId,projectIds:['cinepolis'],visibleLogin:login,...versions};
  const member={...common,active:true,role:'shopper',authNamespace:'shopper',credentialState:'enrolled',
    providerUidFingerprint:fingerprint,identityConsolidatedAt:'2026-01-01'};
  const profile={...common,identityAuthority:'tenant_adjudication',identityAuthorityRef:ref,identityConsolidatedAt:'2026-01-01'};
  const authUser={uid,disabled:false,email:sha('tya\0shopper\0'+login).slice(0,48)+'@auth.cxorbia.invalid',
    customClaims:{tenantId:'tya',shopperId,projectIds:['cinepolis'],role:'shopper',authNamespace:'shopper'}};
  const cross={tenantId:'tya',shopperId,sourceStableKey:shopperId,providerUidFingerprint:fingerprint,identityAuthorityRef:ref};
  const receipt={status:'committed',commandType:'shopper.identity.adjudicate',providerAck:true,identityConsolidated:true,
    shopperId,keeperUidFingerprint:fingerprint,actorUid:'qa-synthetic-actor',commandDigest:sha('qa-synthetic-command'),identityLinkId:linkId};
  const link={schemaVersion:'cxorbia.shopper-identity-link.v1',identityLinkId:linkId,tenantId:'tya',projectScope:'cinepolis',
    periodIndependent:true,canonicalShopperId:shopperId,sourceSystem:'hr_external',sourceIdentityKey:aliases[0],
    exactAliases:[...aliases],sourceAliases:[...aliases],status:'active',state:'active',authorityType:'tenant_adjudication',
    authorityRef:ref,adjudicationId:ref,humanConfirmed:true,autoNormalized:false,sourceSafe:true,fuzzyMatching:false};
  const providerRead={complete:true,stage:'COMPLETE',crossExists:true,receiptExists:true,linkExists:true,
    receiptDocumentId:ref,receiptDocumentPath:'tenants/tya/commandReceipts/'+ref,
    linkDocumentId:linkId,linkDocumentPath:'tenants/tya/shopperIdentityLinks/'+linkId};
  const expected={ok:true,ruleVersion:rule,login:'qa.current',password:'Qa123*'};
  return {shopperId,uid,member,profile,authUser,expected,cross,receipt,link,sealedHashes:[],providerRead};
}

test('historical absent inline ACK permits only the same durable keeper recipe',()=>{
  const f=historicalFixture(),before=structuredClone(f),proof=helper.assessCurrentProviderPasswordProof(f);
  assert.equal(proof.allowed,true);
  assert.equal(proof.durableProviderProof,true);
  assert.equal(proof.reason,'CURRENT_PROVIDER_SINGLE_RULE_CREDENTIAL_PROVEN');
  assert.equal(proof.identityAuthority,'EXACT_DURABLE_ADJUDICATED_KEEPER');
  assert.equal(proof.identityLinkAckMode,'REFERENCED_COMMITTED_COMMAND_RECEIPT');
  assert.equal(proof.credentialHashMatches,false);
  assert.equal(proof.usernameCanonizationProven,false);
  assert.deepEqual(f,before);
});

test('historical ACK exposes only boolean and enum proof metadata',()=>{
  const f=historicalFixture();
  assert.equal(Object.hasOwn(f.link,'providerAck'),false);
  assert.deepEqual(helper.a08AdjudicationAck(f),{allowed:true,mode:'REFERENCED_COMMITTED_COMMAND_RECEIPT',
    inlineState:'ABSENT',historicalReceiptBound:true});
});

test('historical alias-set order and matching optional scope do not invent drift',()=>{
  const f=historicalFixture();f.link.exactAliases.reverse();
  f.link.scope={tenantId:'tya',projectId:'cinepolis'};
  Object.assign(f.receipt,{tenantId:'tya',projectId:'cinepolis',projectScope:'cinepolis',scope:{tenantId:'tya',projectId:'cinepolis'}});
  assert.equal(helper.a08AdjudicationAck(f).allowed,true);
  assert.equal(helper.assessCurrentProviderPasswordProof(f).allowed,true);
});

test('the existing explicit link ACK contract remains valid without historical transport metadata',()=>{
  const f=historicalFixture();f.link.providerAck=true;
  for(const key of ['schemaVersion','exactAliases','sourceAliases','adjudicationId','sourceSafe','periodIndependent'])delete f.link[key];
  delete f.providerRead;
  assert.deepEqual(helper.a08AdjudicationAck(f),{allowed:true,mode:'EXPLICIT_LINK_ACK',inlineState:'TRUE',historicalReceiptBound:false});
  const proof=helper.assessCurrentProviderPasswordProof(f);
  assert.equal(proof.allowed,true);assert.equal(proof.identityLinkAckMode,'EXPLICIT_LINK_ACK');
});

for(const [name,value,state]of [['false',false,'FALSE'],['null',null,'NULL'],['string','true','NON_BOOLEAN'],['undefined',undefined,'NON_BOOLEAN']])
test('an own inline ACK field blocks historical fallback when '+name,()=>{
  const f=historicalFixture();f.link.providerAck=value;
  assert.equal(Object.hasOwn(f.link,'providerAck'),true);
  assert.deepEqual(helper.a08AdjudicationAck(f),{allowed:false,mode:'UNPROVEN',inlineState:state,historicalReceiptBound:false});
  assert.equal(helper.assessCurrentProviderPasswordProof(f).reason,'CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN');
});

const historicalRejections=[
  ['provider read missing',f=>delete f.providerRead],
  ['provider read incomplete',f=>f.providerRead.complete=false],
  ['provider read completion not boolean',f=>f.providerRead.complete='true'],
  ['provider read stage incomplete',f=>f.providerRead.stage='LINK'],
  ['receipt not observed',f=>f.providerRead.receiptExists=false],
  ['link not observed',f=>f.providerRead.linkExists=false],
  ['receipt physical ID absent',f=>delete f.providerRead.receiptDocumentId],
  ['receipt physical ID conflicts',f=>f.providerRead.receiptDocumentId='b'.repeat(40)],
  ['receipt physical path absent',f=>delete f.providerRead.receiptDocumentPath],
  ['receipt physical tenant conflicts',f=>f.providerRead.receiptDocumentPath=f.providerRead.receiptDocumentPath.replace('/tya/','/foreign/')],
  ['receipt physical collection conflicts',f=>f.providerRead.receiptDocumentPath=f.providerRead.receiptDocumentPath.replace('/commandReceipts/','/other/')],
  ['receipt physical document conflicts',f=>f.providerRead.receiptDocumentPath+='x'],
  ['link physical ID absent',f=>delete f.providerRead.linkDocumentId],
  ['link physical ID conflicts',f=>f.providerRead.linkDocumentId='irl_'+'b'.repeat(32)],
  ['link physical path absent',f=>delete f.providerRead.linkDocumentPath],
  ['link physical tenant conflicts',f=>f.providerRead.linkDocumentPath=f.providerRead.linkDocumentPath.replace('/tya/','/foreign/')],
  ['link physical collection conflicts',f=>f.providerRead.linkDocumentPath=f.providerRead.linkDocumentPath.replace('/shopperIdentityLinks/','/identityResolutionLinks/')],
  ['link physical document conflicts',f=>f.providerRead.linkDocumentPath+='x'],
  ['receipt missing',f=>delete f.receipt],
  ['receipt null',f=>f.receipt=null],
  ['link missing',f=>delete f.link],
  ['historical schema absent',f=>delete f.link.schemaVersion],
  ['historical schema changed',f=>f.link.schemaVersion='qa.other.v1'],
  ['link tenant absent',f=>delete f.link.tenantId],
  ['link tenant conflicts',f=>f.link.tenantId='foreign'],
  ['link project scope absent',f=>delete f.link.projectScope],
  ['historical project scope widened',f=>f.link.projectScope='*'],
  ['link project conflicts',f=>f.link.projectId='foreign'],
  ['link nested tenant conflicts',f=>f.link.scope={tenantId:'foreign'}],
  ['link nested project conflicts',f=>f.link.scope={projectId:'foreign'}],
  ['receipt tenant conflicts',f=>f.receipt.tenantId='foreign'],
  ['receipt project conflicts',f=>f.receipt.projectId='foreign'],
  ['receipt project scope conflicts',f=>f.receipt.projectScope='foreign'],
  ['receipt nested tenant conflicts',f=>f.receipt.scope={tenantId:'foreign'}],
  ['receipt nested project conflicts',f=>f.receipt.scope={projectId:'foreign'}],
  ['authority reference conflicts',f=>f.link.authorityRef='b'.repeat(40)],
  ['adjudication reference absent',f=>delete f.link.adjudicationId],
  ['adjudication reference conflicts',f=>f.link.adjudicationId='b'.repeat(40)],
  ['link body ID absent',f=>delete f.link.identityLinkId],
  ['link body ID conflicts',f=>f.link.identityLinkId='irl_'+'b'.repeat(32)],
  ['receipt link ID absent',f=>delete f.receipt.identityLinkId],
  ['receipt link ID conflicts',f=>f.receipt.identityLinkId='irl_'+'b'.repeat(32)],
  ['receipt target conflicts',f=>f.receipt.shopperId='qa-other-shopper'],
  ['link canonical target absent',f=>delete f.link.canonicalShopperId],
  ['link canonical target conflicts',f=>f.link.canonicalShopperId='qa-other-shopper'],
  ['link not active',f=>f.link.status='pending'],
  ['link conflicting state',f=>f.link.state='inactive'],
  ['human authority absent',f=>delete f.link.humanConfirmed],
  ['human authority false',f=>f.link.humanConfirmed=false],
  ['human authority nonboolean',f=>f.link.humanConfirmed='true'],
  ['source safety absent',f=>delete f.link.sourceSafe],
  ['source safety false',f=>f.link.sourceSafe=false],
  ['fuzzy matching enabled',f=>f.link.fuzzyMatching=true],
  ['period independence absent',f=>delete f.link.periodIndependent],
  ['period independence false',f=>f.link.periodIndependent=false],
  ['receipt not committed',f=>f.receipt.status='pending'],
  ['receipt command conflicts',f=>f.receipt.commandType='shopper.profile.update'],
  ['receipt ACK absent',f=>delete f.receipt.providerAck],
  ['receipt ACK false',f=>f.receipt.providerAck=false],
  ['receipt ACK null',f=>f.receipt.providerAck=null],
  ['receipt ACK nonboolean',f=>f.receipt.providerAck='true'],
  ['receipt not consolidated',f=>f.receipt.identityConsolidated=false],
  ['receipt digest absent',f=>delete f.receipt.commandDigest],
  ['receipt digest malformed',f=>f.receipt.commandDigest='qa-invalid-digest'],
  ['exact alias set absent',f=>delete f.link.exactAliases],
  ['source alias set absent',f=>delete f.link.sourceAliases],
  ['exact alias set differs',f=>f.link.exactAliases.push('qa-new-alias')],
  ['source alias set differs',f=>f.link.sourceAliases.push('qa-new-alias')],
  ['both alias sets changed under old ACK',f=>{f.link.exactAliases.push('qa-new-alias');f.link.sourceAliases.push('qa-new-alias');}],
  ['duplicate aliases',f=>{f.link.exactAliases.push(f.link.exactAliases[0]);f.link.sourceAliases.push(f.link.sourceAliases[0]);}],
  ['nonstring alias',f=>{f.link.exactAliases[0]=42;f.link.sourceAliases[0]=42;}],
  ['whitespace alias',f=>{f.link.exactAliases[0]=' qa-alias-a ';f.link.sourceAliases[0]=' qa-alias-a ';}]
];
for(const owner of ['link','receipt'])for(const field of ['periodId','periodKey','periodScope']){
  historicalRejections.push([owner+' direct '+field+' binds a period',f=>f[owner][field]='qa-period']);
  historicalRejections.push([owner+' nested '+field+' binds a period',f=>f[owner].scope={[field]:'qa-period'}]);
}
for(const [name,mutate]of historicalRejections)test('historical ACK rejects '+name,()=>{
  const f=historicalFixture();mutate(f);
  assert.equal(helper.a08AdjudicationAck(f).allowed,false);
  assert.equal(helper.assessCurrentProviderPasswordProof(f).allowed,false);
});

const keeperRejections=[
  ['unauthorized target',f=>f.shopperId='qa-not-authorized','CURRENT_PROVIDER_TARGET_NOT_AUTHORIZED'],
  ['missing durable member marker',f=>delete f.member.credentialPasswordProofVersion,'CURRENT_PROVIDER_DURABLE_RULE_PROOF_MISSING'],
  ['missing durable profile marker',f=>delete f.profile.credentialPasswordRuleVersion,'CURRENT_PROVIDER_DURABLE_RULE_PROOF_MISSING'],
  ['changed first-name authority',f=>f.expected.login='changed.current','CURRENT_PROVIDER_FIRST_NAME_AUTHORITY_CHANGED'],
  ['profile login divergence',f=>f.profile.visibleLogin='qa.other','CURRENT_PROVIDER_LOGIN_PARITY_MISSING'],
  ['UID changed',f=>f.uid='qa-other-uid','CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['Auth UID changed',f=>f.authUser.uid='qa-other-uid','CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['Auth disabled',f=>f.authUser.disabled=true,'CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['Auth tenant claim conflicts',f=>f.authUser.customClaims.tenantId='foreign','CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['Auth project claim absent',f=>f.authUser.customClaims.projectIds=[],'CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['Auth shopper claim conflicts',f=>f.authUser.customClaims.shopperId='qa-other-shopper','CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['Auth role claim conflicts',f=>f.authUser.customClaims.role='admin','CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['Auth namespace claim conflicts',f=>f.authUser.customClaims.authNamespace='staff','CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['Auth login email conflicts',f=>f.authUser.email='qa-other@auth.cxorbia.invalid','CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['member keeper fingerprint conflicts',f=>f.member.providerUidFingerprint=sha('qa-other'),'CURRENT_PROVIDER_AUTH_KEEPER_MISMATCH'],
  ['crosswalk keeper fingerprint conflicts',f=>f.cross.providerUidFingerprint=sha('qa-other'),'CURRENT_PROVIDER_CROSSWALK_MISMATCH'],
  ['crosswalk reference conflicts',f=>f.cross.identityAuthorityRef='b'.repeat(40),'CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN'],
  ['receipt keeper fingerprint absent',f=>delete f.receipt.keeperUidFingerprint,'CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN'],
  ['receipt keeper fingerprint conflicts',f=>f.receipt.keeperUidFingerprint=sha('qa-other'),'CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN'],
  ['receipt actor absent',f=>delete f.receipt.actorUid,'CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN'],
  ['member consolidation absent',f=>delete f.member.identityConsolidatedAt,'CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN'],
  ['profile consolidation absent',f=>delete f.profile.identityConsolidatedAt,'CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN'],
  ['same-UID seal mismatches',f=>f.sealedHashes=[sha('qa-different-recipe')],'CURRENT_PROVIDER_SAME_UID_SEALED_HASH_CONFLICT'],
  ['same-UID seal malformed',f=>f.sealedHashes=['qa-not-a-hash'],'CURRENT_PROVIDER_SAME_UID_SEALED_HASH_CONFLICT'],
  ['same-UID seal duplicates',f=>f.sealedHashes=[sha(f.expected.password),sha(f.expected.password)],'CURRENT_PROVIDER_SAME_UID_SEALED_HASH_CONFLICT']
];
for(const [name,mutate,reason]of keeperRejections)test('historical receipt never overrides '+name,()=>{
  const f=historicalFixture();mutate(f);
  const proof=helper.assessCurrentProviderPasswordProof(f);
  assert.equal(proof.allowed,false);assert.equal(proof.reason,reason);
});

test('an exact same-UID seal corroborates the existing single recipe',()=>{
  const f=historicalFixture();f.sealedHashes=[sha(f.expected.password)];
  const proof=helper.assessCurrentProviderPasswordProof(f);
  assert.equal(proof.allowed,true);assert.equal(proof.credentialHashMatches,true);
  assert.equal(proof.credentialHashSource,'EXACT_C6_SAME_KEEPER_UID_SEAL');
});

test('the public historical diagnosis keeps physical evidence private and claims no login',()=>{
  const f=historicalFixture(),diagnostic=helper.diagnoseCurrentProviderPasswordProof(f,[],f.providerRead);
  assert.equal(diagnostic.diagnosticOnly,true);assert.equal(diagnostic.diagnosticComplete,true);
  assert.equal(diagnostic.provenanceAllowed,true);assert.equal(diagnostic.checks.LINK_PROVIDER_ACK,true);
  assert.deepEqual(diagnostic.adjudicationAck,{mode:'REFERENCED_COMMITTED_COMMAND_RECEIPT',inlineState:'ABSENT',historicalReceiptBound:true});
  assert.equal(diagnostic.loginAttempts,0);assert.equal(diagnostic.browserLaunches,0);assert.equal(diagnostic.customTokensUsed,0);
  assert.equal(diagnostic.historicalSameUidProof.recipeUsedForLogin,false);
  const text=JSON.stringify(diagnostic);
  for(const privateValue of [f.uid,f.member.visibleLogin,f.expected.login,f.expected.password,sha(f.expected.password),
    f.receipt.actorUid,f.receipt.commandDigest,f.receipt.keeperUidFingerprint,f.link.identityLinkId,f.link.authorityRef,
    f.providerRead.receiptDocumentPath,f.providerRead.linkDocumentPath,...f.link.exactAliases])
    assert.equal(text.includes(privateValue),false,'public diagnostic must omit private fixture data');
});

test('the public projection drops raw evidence and unknown ACK fields',()=>{
  const marker='QA_PRIVATE_DO_NOT_EXPORT',out=helper.publicA08ProvenanceDiagnostic({
    caseId:'GT_EXCEPTION',diagnosticOnly:true,diagnosticComplete:true,primaryReason:'CURRENT_PROVIDER_SINGLE_RULE_CREDENTIAL_PROVEN',
    provenanceAllowed:true,identityAuthority:'TENANT_ADJUDICATION',readStage:'COMPLETE',
    password:marker,login:marker,uid:marker,providerRead:{receiptDocumentPath:marker},
    checks:{LINK_PROVIDER_ACK:true,AUTH_UID:marker,[marker]:marker},
    adjudicationAck:{mode:'REFERENCED_COMMITTED_COMMAND_RECEIPT',inlineState:'ABSENT',historicalReceiptBound:true,
      allowed:true,receiptPath:marker,linkPath:marker,receiptId:marker,commandDigest:marker,passwordHashHex:marker,login:marker,password:marker},
    historicalSameUidProof:{recordCount:0,supportedSealCount:0,uniqueSupportedSeal:false,currentRuleRecipeMatches:null,
      keeperLoginRecipeMatches:null,recipeUsedForLogin:false,passwordHashHex:marker},loginAttempts:0,browserLaunches:0,customTokensUsed:0
  });
  assert.deepEqual(out.adjudicationAck,{mode:'REFERENCED_COMMITTED_COMMAND_RECEIPT',inlineState:'ABSENT',historicalReceiptBound:true});
  assert.equal(out.checks.AUTH_UID,null);assert.equal(Object.hasOwn(out.checks,marker),false);
  assert.doesNotMatch(JSON.stringify(out),/QA_PRIVATE_DO_NOT_EXPORT/);
});

test('the public projection rejects arbitrary strings instead of exporting them as ACK metadata',()=>{
  const marker='QA_PRIVATE_DO_NOT_EXPORT',out=helper.publicA08ProvenanceDiagnostic({
    caseId:marker,primaryReason:marker,identityAuthority:marker,readStage:marker,
    adjudicationAck:{mode:marker,inlineState:marker,historicalReceiptBound:marker}
  });
  assert.deepEqual(out.adjudicationAck,{mode:null,inlineState:null,historicalReceiptBound:null});
  assert.equal(out.caseId,null);assert.equal(out.primaryReason,null);assert.equal(out.identityAuthority,null);assert.equal(out.readStage,null);
  assert.doesNotMatch(JSON.stringify(out),/QA_PRIVATE_DO_NOT_EXPORT/);
});
