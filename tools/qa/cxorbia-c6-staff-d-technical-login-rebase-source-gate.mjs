#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const ensure=(v,c)=>{if(!v)throw new Error(c);};

const targets=readJson('backend/config/c6-staff-bootstrap-targets-v1.json');
const collision=readJson('backend/config/c6-staff-provider-collision-targets-v1.json');
const rebase=readJson('backend/contracts/c6-staff-d-technical-login-rebase-v1.json');
const prewrite=readJson('backend/contracts/c6-staff-d-rebase-prewrite-v1.json');

ensure(targets.schemaVersion==='cxorbia.c6.staff-bootstrap-targets.v1','TARGETS_SCHEMA');
ensure(collision.schemaVersion==='cxorbia.c6.staff-provider-collision-targets.v1','COLLISION_SCHEMA');
ensure(rebase.schemaVersion==='cxorbia.c6.staff-d-technical-login-rebase.v1','REBASE_SCHEMA');
ensure(prewrite.schemaVersion==='cxorbia.c6.staff-d-rebase-prewrite.v1','PREWRITE_SCHEMA');

const tm=new Map(targets.targets.map(x=>[x.targetAlias,x]));
const cm=new Map(collision.targets.map(x=>[x.targetAlias,x]));
const dT=tm.get('D'),dC=cm.get('D');
ensure(dT&&dC,'D_MISSING');
ensure(dT.ownerIdentityAnchor===dC.ownerIdentityAnchor,'OWNER_ANCHOR_DRIFT');
ensure(dT.role==='ops'&&dT.entitlementMode==='TYA_COMPLETE','BUSINESS_ROLE_SCOPE_DRIFT');
ensure(JSON.stringify(dT.projectIds)===JSON.stringify(['cinepolis']),'PROJECT_SCOPE_DRIFT');
ensure(dT.expectedClaimsDigest===dC.expectedClaimsDigest,'CLAIMS_DIGEST_DRIFT');

const seed=sha([
  'cxorbia-canonical-visible-login-v1',
  'tya',
  'staff',
  'D',
  dT.ownerIdentityAnchor,
  dT.ownerRoleBindingDigest,
  dT.role
].join('\0'));
const transientVisibleLogin=`cxu-${seed.slice(0,24)}`;
const technicalLoginDigest=sha(`tya\0staff\0${transientVisibleLogin.trim().toLowerCase()}`);
const ownerTechnicalBindingDigest=sha(`cxorbia-owner-login-bind-v1\0tya\0${dT.ownerIdentityAnchor}\0${technicalLoginDigest}`);
const providerEmailSha256=sha(`${technicalLoginDigest.slice(0,48)}@auth.cxorbia.invalid`);

ensure(technicalLoginDigest===dC.technicalLoginDigest,'TECHNICAL_DIGEST_MISMATCH');
ensure(ownerTechnicalBindingDigest===dC.ownerTechnicalBindingDigest,'OWNER_TECH_BIND_MISMATCH');
ensure(providerEmailSha256===dC.providerEmailSha256,'PROVIDER_DIGEST_MISMATCH');
ensure(technicalLoginDigest===rebase.replacement.technicalLoginDigest,'REBASE_TECH_DIGEST_MISMATCH');
ensure(ownerTechnicalBindingDigest===rebase.replacement.ownerTechnicalBindingDigest,'REBASE_OWNER_BIND_MISMATCH');
ensure(providerEmailSha256===rebase.replacement.mechanicallyDerivedProviderEmailSha256,'REBASE_PROVIDER_DIGEST_MISMATCH');

for(const alias of ['A','B','C']){
  const c=cm.get(alias);ensure(c,'ABC_MISSING_'+alias);
  ensure(c.technicalLoginDigest!==technicalLoginDigest,'SOURCE_SAFE_TECH_COLLISION_'+alias);
  ensure(c.ownerTechnicalBindingDigest!==ownerTechnicalBindingDigest,'SOURCE_SAFE_OWNER_BIND_COLLISION_'+alias);
  ensure(c.providerEmailSha256!==providerEmailSha256,'SOURCE_SAFE_PROVIDER_COLLISION_'+alias);
}

ensure(rebase.sourceSafeCollisionValidation.decision==='PASS_SOURCE_SAFE_ZERO_COLLISION','REBASE_COLLISION_DECISION');
ensure(prewrite.sourceSafeCollisionGate.decision==='PASS_SOURCE_SAFE_ZERO_COLLISION','PREWRITE_COLLISION_DECISION');
ensure(prewrite.frozenWriteBudget.authWritesMax===14&&prewrite.frozenWriteBudget.firestoreWritesMax===16,'BUDGET_DRIFT');
ensure(prewrite.frozenWriteBudget.authDeletes===0&&prewrite.frozenWriteBudget.firestoreDeletes===0,'DELETE_BUDGET_DRIFT');

console.log(JSON.stringify({
  decision:'PASS_C6_STAFF_D_TECHNICAL_LOGIN_REBASE_SOURCE_ONLY',
  sourceSafeZeroCollision:true,
  preservedBusinessContract:true,
  rawVisibleLoginEmitted:false,
  providerReads:0,
  providerWrites:0,
  authWrites:0,
  firestoreWrites:0,
  deletes:0,
  deploys:0,
  merge:false,
  production:false
}));
