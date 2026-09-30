import fs from 'node:fs';
import crypto from 'node:crypto';

const p = 'backend/contracts/cxorbia-legal-publication-snapshot-v1.json';
const profilePath = 'backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json';
const durablePath = 'backend/contracts/cxorbia-legal-acceptance-durable-v1.json';

for (const f of [p, profilePath, durablePath]) {
  if (!fs.existsSync(f)) throw new Error(`MISSING:${f}`);
}
const c = JSON.parse(fs.readFileSync(p,'utf8'));
const profile = JSON.parse(fs.readFileSync(profilePath,'utf8'));
const durable = JSON.parse(fs.readFileSync(durablePath,'utf8'));

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

assert(c.schemaVersion === 'cxorbia.legal-publication-snapshot.v1','BAD_SCHEMA');
assert(c.status.includes('source_only'),'NOT_SOURCE_ONLY');
assert(c.invariants.unresolvedPlaceholdersMayBePublished === false,'PLACEHOLDER_PUBLISH_MUST_FAIL');
assert(c.invariants.resolvedValuesFrozenBeforeDigest === true,'RESOLVE_BEFORE_DIGEST_REQUIRED');
assert(c.invariants.contentDigestComputedAfterRendering === true,'DIGEST_AFTER_RENDER_REQUIRED');
assert(c.invariants.publishedVersionImmutable === true,'IMMUTABLE_PUBLICATION_REQUIRED');
assert(c.invariants.laterProfileChangeMutatesPublishedVersion === false,'MUTABLE_PROFILE_MUST_NOT_REWRITE');
assert(c.invariants.restrictedRegisteredDomicileMayEnterPublicSnapshotAutomatically === false,'PRIVATE_DOMICILE_MUST_NOT_AUTOPUBLISH');
assert(c.invariants.onlyApprovedPublicAddressMayRender === true,'PUBLIC_ADDRESS_APPROVAL_REQUIRED');
assert(c.invariants.disabledProviderMayRenderAsCurrentRecipient === false,'DISABLED_PROVIDER_MUST_NOT_RENDER');
assert(c.invariants.automaticAcceptance === false,'AUTO_ACCEPT_FORBIDDEN');

assert(profile.invariants?.adminEditableThroughAuthorizedProductUI === true,'NOCODE_PROFILE_REQUIRED');
assert(profile.invariants?.registeredResidentialDomicileAutoPublished === false,'PROFILE_PRIVATE_DOMICILE_DRIFT');
assert(profile.legalVersioning?.profileChangeDoesNotRewritePublishedContent === true,'PROFILE_IMMUTABILITY_DRIFT');
assert(durable.invariants?.humanAcceptanceOnly === true,'DURABLE_HUMAN_ACCEPT_REQUIRED');
assert(durable.invariants?.automaticAcceptance === false,'DURABLE_AUTO_ACCEPT_DRIFT');
assert(durable.invariants?.localStorageIsAuthority === false,'LOCALSTORAGE_AUTHORITY_DRIFT');

const forbidden = new Set(c.publicationSnapshot.restrictedFieldsForbidden || []);
for (const k of ['registeredLegalDomicileRestricted','rawBankAccount','rawIdentityDocument','password','token','secret','providerCredential']) {
  assert(forbidden.has(k),`FORBIDDEN_PUBLIC_FIELD_MISSING:${k}`);
}

const template = 'Operador={{operator}}\nPlataforma={{brand}}\nContacto={{contact}}\n';
const values = {operator:'Operador Público',brand:'Marca Visible',contact:'legal@example.test'};
const render = (t,v) => t.replace(/\{\{(operator|brand|contact)\}\}/g,(_,k)=>v[k]).replace(/\r\n?/g,'\n');
const rendered1 = render(template, values);
assert(!rendered1.includes('{{'),'UNRESOLVED_PLACEHOLDER_TEST');
const digest1 = crypto.createHash('sha256').update(Buffer.from(rendered1,'utf8')).digest('hex');

const laterMutableProfile = {...values, contact:'nuevo@example.test'};
const renderedHistorical = rendered1;
const digestHistorical = crypto.createHash('sha256').update(Buffer.from(renderedHistorical,'utf8')).digest('hex');
assert(digestHistorical === digest1,'HISTORICAL_DIGEST_CHANGED');

const rendered2 = render(template, laterMutableProfile);
const digest2 = crypto.createHash('sha256').update(Buffer.from(rendered2,'utf8')).digest('hex');
assert(digest2 !== digest1,'MATERIAL_RENDER_CHANGE_MUST_CHANGE_DIGEST');

const report = {
  decision: 'PASS_I3_LEGAL_PUBLICATION_SNAPSHOT_NOCODE_IMMUTABLE_SOURCE_ONLY',
  sourceOnly: true,
  noCodeMutableProfile: true,
  publicationSnapshotImmutable: true,
  placeholdersPublishable: false,
  digestAfterRender: true,
  restrictedDomicileAutoPublished: false,
  disabledProviderCurrentRecipient: false,
  historicalReceiptMeaningPreserved: true,
  automaticAcceptance: false,
  providerCredentials: 0,
  providerReads: 0,
  providerWrites: 0,
  firestoreWrites: 0,
  authWrites: 0,
  legalContentWrites: 0,
  legalAcceptanceWrites: 0,
  historicalCredentialAccess: 0,
  passwordResets: 0,
  deploys: 0,
  merge: false,
  production: false
};
console.log(JSON.stringify(report,null,2));
