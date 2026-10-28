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
  {caseId: 'HN_CASE_A', namespaceEmailPrefix: '699fa4b58b12acbb5c7206f189e037145a0c5301a4ffc3cd', loginFingerprint: '82d6a1369b5dbb8f9bc931d0', exactNameFingerprint: 'aa27ea4ede44e2253bbbc6b7', adminHistoricalCount: 9, adminCanonicalFingerprint: 'a7f9e320a5675ee9a6c6'},
  {caseId: 'HN_CASE_B', namespaceEmailPrefix: '0147d9724b37ef0d8932680e42f82e75f2e743be6f', loginFingerprint: '27ce81067e5bd3a2604633f5', exactNameFingerprint: '1691aecc2c6c601234218af6', adminHistoricalCount: 17}
];
const value = x => String(x ?? '').trim();
const sha = x => crypto.createHash('sha256').update(value(x)).digest('hex');
const fp = x => sha(x).slice(0,20);
const norm = x => value(x).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
const nameFp = x => sha(norm(x)).slice(0,24);
const displayName = x => value(x?.nombre || x?.fullName || x?.displayName || x?.name || [x?.firstName, x?.lastName].filter(Boolean).join(' '));
const country = x => value(x?.pais || x?.country || x?.país).toUpperCase();
const normalizedCountry = x => ['HONDURAS','HN'].includes(country(x)) ? 'HN' : ['GUATEMALA','GT'].includes(country(x)) ? 'GT' : country(x) || 'UNSET';
const sid = x => value(x?.shopperId || x?.id);
const sidClass = x => /^TYA_HN_[A-F0-9]{6,}$/i.test(value(x)) ? 'HN_STABLE' : /^TYA_GT_[A-F0-9]{6,}$/i.test(value(x)) ? 'GT_STABLE' : value(x) ? 'OTHER_TECHNICAL_ID' : 'MISSING';
const digits = x => value(x).replace(/[^0-9]/g,'');
const phone = x => digits(x?.whatsapp || x?.phone || x?.telefono);
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
  const profiles = (await tenant.collection('shoppers').get()).docs.map(d => ({...d.data(), _firestoreDocumentId:d.id}));
  const profileById = new Map(profiles.map(p => [p._firestoreDocumentId,p]));
  const crosswalk = (await tenant.collection('shopperIdentityCrosswalk').get()).docs.map(d => ({id:d.id,...d.data()}));
  const crossById = new Map(crosswalk.map(x => [x.id,x]));
  const links = (await tenant.collection('shopperIdentityLinks').get()).docs.map(d => ({id:d.id,...d.data()}));
  report.hrSummary.hnProfiles = hrProfiles.filter(p => normalizedCountry(p) === 'HN').length;
  const hrIds = new Map(hrProfiles.map(p => [sid(p),p]));

  for (const target of expected) {
    const email = `${target.namespaceEmailPrefix}@auth.cxorbia.invalid`;
    const authMatchesByEmail = allAuth.filter(a => value(a.email).toLowerCase() === email);
    const memberMatchesLogin = members.filter(m => sha(norm(m.visibleLogin || m.username || m.user)).slice(0,24) === target.loginFingerprint);
    const durableProfileMatchesName = profiles.filter(p => nameFp(displayName(p)) === target.exactNameFingerprint);
    const memberMatchesProfile = members.filter(m => durableProfileMatchesName.some(p => [p._firestoreDocumentId,p.shopperId,p.id].map(value).includes(value(m.shopperId))));
    // Choose the strongest *unique technical* selector. Never union weaker
    // display-name matches: historical duplicate profiles are not proof of
    // authenticated account ownership or permission to merge.
    const candidateUids = new Set(authMatchesByEmail.length===1
      ? authMatchesByEmail.map(a => a.uid)
      : memberMatchesLogin.length===1
        ? memberMatchesLogin.map(m => m.uid)
        : []);
    const authMatches = allAuth.filter(a => candidateUids.has(a.uid));
    const sourceMatches = hrProfiles.filter(p => nameFp(displayName(p)) === target.exactNameFingerprint);
    const sourceHN = sourceMatches.filter(p => normalizedCountry(p) === 'HN');
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
    const linkedTokens = new Set([rawSid,memberSid,p?.sourceShopperId,p?.sourceIdentityKey,p?.canonicalShopperId,cw?.sourceShopperId,cw?.shopperId,cw?.canonicalShopperId,
      ...(Array.isArray(p?.exactAliases)?p.exactAliases:[]),...(Array.isArray(p?.sourceShopperIds)?p.sourceShopperIds:[])].map(value).filter(Boolean));
    const linksTouchingClaim = links.filter(l => [l.shopperId,l.sourceShopperId,l.canonicalShopperId,...(Array.isArray(l.exactAliases)?l.exactAliases:[])].map(value).some(t => linkedTokens.has(t)));
    const directSourceIds = [...linkedTokens].filter(t => hrIds.has(t));
    const directSourceHNIds = directSourceIds.filter(t => normalizedCountry(hrIds.get(t)) === 'HN');
    const claimsCountry = value(claims.country).toUpperCase();
    const namedDurableCandidates = durableProfileMatchesName.map(candidate => {
      const candidateId = value(candidate._firestoreDocumentId);
      const fieldShopperId = value(candidate.shopperId);
      const fieldId = value(candidate.id);
      const shopperCode = value(candidate.shopperCode || candidate.code);
      const technicalIds = [...new Set([candidateId,fieldShopperId,fieldId].filter(Boolean))];
      const exactHrRowsById = technicalIds.map(id => ({id, count:hrVisits.filter(v => sid(v) === id).length,source:hrIds.has(id)}));
      const sourceOwner = exactHrRowsById.filter(row => row.source && row.count === target.adminHistoricalCount);
      const directHrVisits = Math.max(0,...exactHrRowsById.map(x => x.count));
      const hasSource = exactHrRowsById.some(x => x.source);
      const activeMembers = members.filter(row => row.active === true && value(row.shopperId) === candidateId).length;
      return {
        candidateId, candidateIdClass: sidClass(candidateId), candidateIdFingerprint: fp(`sid:${candidateId}`),
        declaredIdClass: sidClass(fieldId), declaredShopperIdClass: sidClass(fieldShopperId),
        documentIdMatchesDeclaredId: candidateId === fieldId,
        documentIdMatchesShopperId: candidateId === fieldShopperId,
        adminObservedIdentifierMatchesShopperCode: Boolean(target.adminCanonicalFingerprint && shopperCode && fp(`sid:${shopperCode}`) === target.adminCanonicalFingerprint),
        exactTechnicalSourceKeys: exactHrRowsById.filter(x => x.source).length,
        exactHistoricalSourceOwnerKeys: sourceOwner.length,
        sourceOwnerClass: sourceOwner.length===1 ? sidClass(sourceOwner[0].id) : 'UNPROVEN',
        sourceOwnerFingerprint: sourceOwner.length===1 ? fp(`sid:${sourceOwner[0].id}`) : null,
        profileCountry: normalizedCountry(candidate), directHrVisits, exactCurrentHrSource: hasSource,
        authMemberCount: activeMembers, sourceType: value(candidate.sourceType),
        sourceRevisionMatchesCurrent: value(candidate.hrSourceRevision) === report.hrRevision,
        contactPhoneMatchesActivePrincipal: Boolean(phone(candidate) && phone(p) && phone(candidate) === phone(p)),
        crosswalkCanonicalSelf: value(crossById.get(candidateId)?.shopperId || crossById.get(candidateId)?.canonicalShopperId) === candidateId,
        identityState: value(candidate.identityState || candidate.status).toUpperCase() || 'UNSET'
      };
    });
    const canonicalCandidates = namedDurableCandidates.filter(row =>
      row.profileCountry === 'HN' && row.exactCurrentHrSource &&
      row.exactHistoricalSourceOwnerKeys === 1 && row.directHrVisits === target.adminHistoricalCount &&
      row.contactPhoneMatchesActivePrincipal &&
      (!target.adminCanonicalFingerprint ||
        row.candidateIdFingerprint === target.adminCanonicalFingerprint ||
        row.sourceOwnerFingerprint === target.adminCanonicalFingerprint ||
        row.adminObservedIdentifierMatchesShopperCode));
    const exactHN = canonicalCandidates.length === 1 ? canonicalCandidates[0] : null;
    report.cases.push({
      caseId: target.caseId, authCandidates: authMatches.length, authSelector: authMatchesByEmail.length===1?'EXACT_INTERNAL_EMAIL':memberMatchesLogin.length===1?'MEMBER_VISIBLE_LOGIN':memberMatchesProfile.length===1?'DURABLE_NAME_DIAGNOSTIC_ONLY':'NOT_UNIQUE',
      memberLoginCandidates: memberMatchesLogin.length, durableNameCandidates: durableProfileMatchesName.length,
      disabled: a?.disabled === true,
      authUidFingerprint: a ? fp(`uid:${a.uid}`) : null,
      claimRole: value(claims.role), claimNamespace: value(claims.authNamespace),
      claimCountry: value(claims.country).toUpperCase() || 'UNSET',
      claimShopperIdClass: sidClass(rawSid), claimShopperIdFingerprint: rawSid ? fp(`sid:${rawSid}`) : null,
      memberPresent: Boolean(m), memberCountry: normalizedCountry(m),
      memberShopperIdClass: sidClass(memberSid), memberMatchesClaim: Boolean(m && memberSid === rawSid),
      authLinkedProfilePresent: Boolean(p), authLinkedProfileCountry: normalizedCountry(p),
      authLinkedProfileHistoricalCount: Number(p?.visitsCount || p?.totalVisits || 0),
      crosswalkPresent: Boolean(cw), crosswalkCanonicalClass: sidClass(cw?.shopperId || cw?.canonicalShopperId),
      hrNameCandidates: sourceMatches.length, hrHNCandidates: sourceHN.length,
      hrExactOwnerClass: sidClass(hrOwner), hrExactOwnerFingerprint: hrOwner ? fp(`sid:${hrOwner}`) : null,
      hrDirectVisitRows: hrVisitMatches.length, adminHistoricalCountObserved: target.adminHistoricalCount,
      exactIdRelation, countryClaimConflictsWithHN: claimsCountry === 'GT' && sourceHN.length === 1,
      directExactSourceIdCount: directSourceIds.length, directExactHNSourceIdCount: directSourceHNIds.length,
      trustedLinksTouchingPrincipal: linksTouchingClaim.filter(l => ['provider_exact','tenant_adjudication','platform_created','migrated_exact'].includes(value(l.authorityType || l.authority?.type).toLowerCase()) && ['active','confirmed','approved','materialized'].includes(value(l.status || l.state).toLowerCase())).length,
      namedDurableCandidateProfiles: namedDurableCandidates.map(({candidateId, ...safe}) => safe),
      exactCanonicalHNCandidateCount: canonicalCandidates.length,
      exactCanonicalHNFingerprint: exactHN?.candidateIdFingerprint || null,
      exactCanonicalCountry: exactHN?.profileCountry || null,
      exactCanonicalHistVisits: exactHN?.directHrVisits ?? null,
      principalAndHnProfileSharePhone: exactHN?.contactPhoneMatchesActivePrincipal || false,
      canonicalRepairPreflight: !exactHN ? 'HOLD_CANONICAL_NOT_UNIQUELY_PROVEN' :
        'UNIQUE_SOURCE_CONTACT_CORROBORATION_ONLY__HUMAN_AUTHORITY_LINK_STILL_REQUIRED',
      note: 'Ninguna identidad se fusiona ni se infiere por nombre; la coincidencia de nombre es solo un selector de diagnóstico.'
    });
  }
  report.decision = report.cases.every(x => x.authCandidates === 1)
    ? 'PASS_TWO_HN_AUTH_MEMBERSHIP_DIAGNOSTIC_READ'
    : 'HOLD_TARGET_SELECTORS_NOT_UNIQUE';
} catch (error) {
  report.decision = 'HOLD_DIAGNOSTIC_PROVIDER_OR_CREDENTIALS';
  report.errorClass = value(error?.code || error?.name || 'UNKNOWN').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,72);
}
write(report);
console.log(JSON.stringify(report));
if (!report.decision.startsWith('PASS_')) process.exitCode=2;
