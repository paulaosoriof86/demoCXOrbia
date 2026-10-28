#!/usr/bin/env node
// I3 P0 GT/HN: targeted DEV diagnostic. Reads only; does not infer identity
// equivalence from names or prepare any write/merge.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault, getApps, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT = 'cxorbia-backend-dev';
const TENANT = 'tya';
const PROGRAM = 'cinepolis';
const OUTPUT = process.env.CX_DIAG_OUT || '.tmp/i3-p0-hn-two-shopper';
const HR_URL = 'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json';
const expected = [
  {caseId: 'HN_CASE_A', namespaceEmailPrefix: '699fa4b58b12acbb5c7206f189e037145a0c5301a4ffc3cd', exactNameFingerprint: 'aa27ea4ede44e2253bbbc6b7', adminHistoricalCount: 9},
  {caseId: 'HN_CASE_B', namespaceEmailPrefix: '0147d9724b37ef0d8932680e42f82e75f2e743be6f', exactNameFingerprint: '1691aecc2c6c601234218af6', adminHistoricalCount: 17}
];
const value = x => String(x ?? '').trim();
const sha = x => crypto.createHash('sha256').update(value(x)).digest('hex');
const fp = x => sha(x).slice(0,20);
const norm = x => value(x).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
const nameFp = x => sha(norm(x)).slice(0,24);
const displayName = x => value(x?.nombre || x?.fullName || x?.displayName || x?.name || [x?.firstName, x?.lastName].filter(Boolean).join(' '));
const country = x => value(x?.pais || x?.country || x?.país).toUpperCase();
const sid = x => value(x?.shopperId || x?.id);
const sidClass = x => /^TYA_HN_[A-F0-9]{6,}$/i.test(value(x)) ? 'HN_STABLE' : /^TYA_GT_[A-F0-9]{6,}$/i.test(value(x)) ? 'GT_STABLE' : value(x) ? 'OTHER_TECHNICAL_ID' : 'MISSING';
const write = report => {fs.mkdirSync(OUTPUT,{recursive:true});fs.writeFileSync(`${OUTPUT}/result.json`,JSON.stringify(report,null,2)+'\n');};

const report = {schemaVersion: 'cxorbia.i3.p0.hn-two-shopper-auth-readonly.v1',
  decision: 'HOLD_READONLY_DIAG_INCOMPLETE', project: PROJECT, tenant: TENANT,
  phase: 'I3_DEV', production: false, hrWrites: 0, authWrites: 0,
  firestoreWrites: 0, deployments: 0, merges: 0, cases: []};
write(report);

try {
  if (!getApps().length) initializeApp({credential: applicationDefault(), projectId: PROJECT});
  const auth = getAuth();
  const db = getFirestore();
  const response = await fetch(`${HR_URL}&i3diag=${Date.now()}`,{
    headers: {'Cache-Control': 'no-cache, no-store'},signal: AbortSignal.timeout(120000)});
  if (!response.ok) throw new Error('HR_PROVIDER_HTTP');
  const payload = await response.json();
  const hr = payload?.snapshot || payload?.data || payload;
  report.hrRevision = value(payload?.revision || hr?.sourceRevision || payload?._runtime?.revision);
  const hrProfiles = Array.isArray(hr?.shoppers) ? hr.shoppers : [];
  const hrVisits = Array.isArray(hr?.visits) ? hr.visits : [];
  report.hrSummary = {profiles: hrProfiles.length, visits: hrVisits.length};

  const allAuth = []; let nextToken;
  do {const page = await auth.listUsers(1000,nextToken);allAuth.push(...page.users);nextToken=page.pageToken;}while(nextToken);
  const tenant = db.collection('tenants').doc(TENANT);
  const members = (await tenant.collection('users').get()).docs.map(d => ({uid:d.id,...d.data()}));
  const memberByUid = new Map(members.map(m => [m.uid,m]));
  const profiles = (await tenant.collection('shoppers').get()).docs.map(d => ({id:d.id,...d.data()}));
  const profileById = new Map(profiles.map(p => [p.id,p]));
  const crosswalk = (await tenant.collection('shopperIdentityCrosswalk').get()).docs.map(d => ({id:d.id,...d.data()}));
  const crossById = new Map(crosswalk.map(x => [x.id,x]));

  for (const target of expected) {
    const email = `${target.namespaceEmailPrefix}@auth.cxorbia.invalid`;
    const authMatches = allAuth.filter(a => value(a.email).toLowerCase() === email);
    const sourceMatches = hrProfiles.filter(p => nameFp(displayName(p)) === target.exactNameFingerprint);
    const sourceHN = sourceMatches.filter(p => country(p) === 'HN');
    const a = authMatches.length === 1 ? authMatches[0] : null;
    const claims = a?.customClaims || {};
    const m = a ? memberByUid.get(a.uid) : null;
    const rawSid = value(claims.shopperId);
    const memberSid = value(m?.shopperId);
    const p = profileById.get(rawSid);
    const cw = crossById.get(rawSid);
    const hrOwner = sourceHN.length === 1 ? sid(sourceHN[0]) : '';
    const hrVisitMatches = hrOwner ? hrVisits.filter(v => sid(v) === hrOwner) : [];
    const exactIdRelation = !a || !hrOwner ? 'UNPROVEN' : rawSid === hrOwner ? 'AUTH_MATCHES_HN_HR' : 'AUTH_DIFFERS_FROM_HN_HR';
    report.cases.push({
      caseId: target.caseId, authCandidates: authMatches.length, disabled: a?.disabled === true,
      authUidFingerprint: a ? fp(`uid:${a.uid}`) : null,
      claimRole: value(claims.role), claimNamespace: value(claims.authNamespace),
      claimCountry: value(claims.country).toUpperCase() || 'UNSET',
      claimShopperIdClass: sidClass(rawSid), claimShopperIdFingerprint: rawSid ? fp(`sid:${rawSid}`) : null,
      memberPresent: Boolean(m), memberCountry: country(m) || 'UNSET',
      memberShopperIdClass: sidClass(memberSid), memberMatchesClaim: Boolean(m && memberSid === rawSid),
      authLinkedProfilePresent: Boolean(p), authLinkedProfileCountry: country(p) || 'UNSET',
      authLinkedProfileHistoricalCount: Number(p?.visitsCount || p?.totalVisits || 0),
      crosswalkPresent: Boolean(cw), crosswalkCanonicalClass: sidClass(cw?.shopperId || cw?.canonicalShopperId),
      hrNameCandidates: sourceMatches.length, hrHNCandidates: sourceHN.length,
      hrExactOwnerClass: sidClass(hrOwner), hrExactOwnerFingerprint: hrOwner ? fp(`sid:${hrOwner}`) : null,
      hrDirectVisitRows: hrVisitMatches.length, adminHistoricalCountObserved: target.adminHistoricalCount,
      exactIdRelation, countryClaimConflictsWithHN: value(claims.country).toUpperCase() === 'GT' && sourceHN.length === 1,
      note: 'Ninguna identidad se fusiona ni se infiere por nombre; la coincidencia de nombre es solo un selector de diagnóstico.'
    });
  }
  report.decision = report.cases.every(x => x.authCandidates === 1 && x.hrHNCandidates === 1)
    ? 'PASS_EXACT_DIAGNOSTIC_TWO_HN_AUTH_PRINCIPALS_READ'
    : 'HOLD_TARGET_SELECTORS_NOT_EXACT';
} catch (error) {
  report.decision = 'HOLD_DIAGNOSTIC_PROVIDER_OR_CREDENTIALS';
  report.errorClass = value(error?.code || error?.name || 'UNKNOWN').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,72);
}
write(report);
console.log(JSON.stringify(report));
if (!report.decision.startsWith('PASS_')) process.exitCode=2;
