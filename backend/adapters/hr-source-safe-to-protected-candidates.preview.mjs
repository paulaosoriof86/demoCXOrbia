const DEFAULT_FORBIDDEN = [
  'rawName', 'fullName', 'email', 'phone', 'dpi', 'idDocumentRaw', 'bankAccountRaw',
  'accountNumber', 'signedNdaRaw', 'privateSourceUrl', 'workbookRaw', 'paymentReceiptBase64',
  'providerToken', 'refreshToken', 'password'
];

function stableId(parts) {
  return parts
    .filter(Boolean)
    .map((part) => String(part).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('__') || 'unknown';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasForbiddenKey(value, forbidden = DEFAULT_FORBIDDEN, path = []) {
  if (!value || typeof value !== 'object') return null;
  for (const [key, nested] of Object.entries(value)) {
    if (forbidden.includes(key)) return [...path, key].join('.');
    const found = hasForbiddenKey(nested, forbidden, [...path, key]);
    if (found) return found;
  }
  return null;
}

function normalizePayload(payload = {}) {
  const tenantId = payload.tenantId || 'unknownTenant';
  const projectId = payload.projectId || 'unknownProject';
  return {
    generatedAt: payload.generatedAt || null,
    tenantId,
    projectId,
    periods: asArray(payload.periods),
    visits: asArray(payload.visits),
    shoppers: asArray(payload.shoppers),
    counts: payload.counts || {},
    sourceSafe: payload.sourceSafe === true,
    production: payload.production === true
  };
}

function inferPeriodKey(record = {}) {
  return record.periodKey || record.period || record.monthKey || record.tabKey || record.tab || 'unknownPeriod';
}

function inferCountry(record = {}) {
  return record.country || record.countryId || record.pais || record.countryCode || 'unknownCountry';
}

function inferShopperRef(record = {}) {
  return record.shopperRefId || record.shopperId || record.shopperRef || record.shopperKey || record.publicShopperRef || null;
}

function buildShopperPublicRefs(payload) {
  const refs = new Map();
  for (const shopper of payload.shoppers) {
    const shopperRefId = inferShopperRef(shopper) || stableId(['shopper', shopper.ref, shopper.id, shopper.key]);
    if (!shopperRefId || shopperRefId === 'shopper') continue;
    refs.set(shopperRefId, {
      tenantId: payload.tenantId,
      shopperRefId,
      country: inferCountry(shopper),
      projectCounts: { [payload.projectId]: Number(shopper.visitCount || shopper.visits || 0) || 0 },
      periodCounts: shopper.periodCounts || {},
      statusBucket: shopper.statusBucket || 'source_safe_reference',
      certificationBucket: shopper.certificationBucket || 'unknown_source_safe',
      paymentEligibilityBucket: shopper.paymentEligibilityBucket || 'unknown_source_safe',
      publicSourceSafe: true,
      updatedAt: payload.generatedAt || null
    });
  }
  for (const visit of payload.visits) {
    const shopperRefId = inferShopperRef(visit);
    if (!shopperRefId || refs.has(shopperRefId)) continue;
    const periodKey = inferPeriodKey(visit);
    refs.set(shopperRefId, {
      tenantId: payload.tenantId,
      shopperRefId,
      country: inferCountry(visit),
      projectCounts: { [payload.projectId]: 1 },
      periodCounts: { [periodKey]: 1 },
      statusBucket: 'derived_from_visit_source_safe',
      certificationBucket: 'unknown_source_safe',
      paymentEligibilityBucket: 'unknown_source_safe',
      publicSourceSafe: true,
      updatedAt: payload.generatedAt || null
    });
  }
  return [...refs.values()];
}

function buildIdentityLinkCandidates(payload, shopperPublicRefs) {
  return shopperPublicRefs.map((ref) => ({
    tenantId: payload.tenantId,
    identityLinkId: stableId(['identity', ref.shopperRefId]),
    shopperRefId: ref.shopperRefId,
    source: 'source_safe_hr_payload',
    status: 'candidate_needs_auth_profile_link',
    confidenceBucket: 'source_safe_reference_only',
    reviewRequired: true,
    reason: 'Full profile link requires protected Auth/RBAC and human-safe validation.'
  }));
}

function buildCertificationCarryovers(payload, shopperPublicRefs) {
  return shopperPublicRefs
    .filter((ref) => ref.certificationBucket && ref.certificationBucket !== 'unknown_source_safe')
    .map((ref) => ({
      tenantId: payload.tenantId,
      projectId: payload.projectId,
      carryoverId: stableId(['certCarryover', payload.projectId, ref.shopperRefId]),
      shopperRefId: ref.shopperRefId,
      status: 'carryover_candidate_review_required',
      certificationBucket: ref.certificationBucket,
      source: 'source_safe_hr_payload',
      reviewRequired: true
    }));
}

function buildLiquidationCandidates(payload) {
  return payload.visits.map((visit, index) => {
    const periodKey = inferPeriodKey(visit);
    const country = inferCountry(visit);
    const visitId = visit.visitId || visit.hrRowId || visit.rowKey || stableId(['visit', payload.projectId, periodKey, country, index + 1]);
    return {
      tenantId: payload.tenantId,
      projectId: payload.projectId,
      liquidationId: stableId(['liq', payload.projectId, periodKey, country, visitId]),
      visitId,
      hrRowId: visit.hrRowId || null,
      shopperRefId: inferShopperRef(visit),
      periodKey,
      country,
      currency: visit.currency || null,
      status: 'calculated_preview_or_review_required',
      source: 'source_safe_hr_payload',
      reviewRequired: !inferShopperRef(visit) || !periodKey || periodKey === 'unknownPeriod'
    };
  });
}

function buildPaymentBatchCandidates(payload, liquidations) {
  const groups = new Map();
  for (const liq of liquidations) {
    const key = stableId([payload.projectId, liq.periodKey, liq.country, liq.currency || 'currencyPending']);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(liq.liquidationId);
  }
  return [...groups.entries()].map(([key, liquidationIds]) => ({
    tenantId: payload.tenantId,
    projectId: payload.projectId,
    paymentBatchId: stableId(['batch', key]),
    status: 'draft_preview_only',
    liquidationIds,
    source: 'source_safe_liquidation_candidates',
    reviewRequired: true
  }));
}

function buildReviewQueueCandidates(payload, identityLinks, liquidations) {
  const reviews = [];
  for (const link of identityLinks) {
    if (link.reviewRequired) reviews.push({
      tenantId: payload.tenantId,
      reviewId: stableId(['review', 'identity', link.identityLinkId]),
      reviewType: 'identity',
      status: 'open_candidate',
      sourceRef: link.identityLinkId,
      reason: link.reason
    });
  }
  for (const liq of liquidations) {
    if (liq.reviewRequired) reviews.push({
      tenantId: payload.tenantId,
      reviewId: stableId(['review', 'liquidation', liq.liquidationId]),
      reviewType: 'liquidation',
      status: 'open_candidate',
      sourceRef: liq.liquidationId,
      reason: 'Liquidation candidate requires shopper/period/source validation before any protected write.'
    });
  }
  return reviews;
}

function buildAuditEvent(payload, summary) {
  return {
    tenantId: payload.tenantId,
    auditEventId: stableId(['audit', 'sourceSafeCandidateDryRun', payload.projectId, payload.generatedAt || 'no-date']),
    eventType: 'candidateGenerated',
    source: 'hr_source_safe_to_protected_candidates_preview',
    projectId: payload.projectId,
    generatedAt: new Date().toISOString(),
    summary
  };
}

export function buildProtectedCandidates(inputPayload = {}) {
  const payload = normalizePayload(inputPayload);
  const hardFails = [];
  const warnings = [];

  const forbiddenPath = hasForbiddenKey(inputPayload);
  if (forbiddenPath) hardFails.push({ message: 'forbidden_field_detected_in_input_payload', path: forbiddenPath });
  if (!payload.sourceSafe) hardFails.push({ message: 'input_not_marked_source_safe' });
  if (payload.production) hardFails.push({ message: 'production_payload_not_allowed' });
  if (!payload.tenantId || payload.tenantId === 'unknownTenant') hardFails.push({ message: 'tenantId_missing' });
  if (!payload.projectId || payload.projectId === 'unknownProject') hardFails.push({ message: 'projectId_missing' });
  if (!payload.periods.length) warnings.push({ message: 'no_periods_detected_in_source_safe_payload' });
  if (!payload.visits.length) warnings.push({ message: 'no_visits_detected_in_source_safe_payload' });

  const shopperPublicRefs = buildShopperPublicRefs(payload);
  const shopperIdentityLinkCandidates = buildIdentityLinkCandidates(payload, shopperPublicRefs);
  const certificationCarryoverCandidates = buildCertificationCarryovers(payload, shopperPublicRefs);
  const protectedLiquidationCandidates = buildLiquidationCandidates(payload);
  const protectedPaymentBatchCandidates = buildPaymentBatchCandidates(payload, protectedLiquidationCandidates);
  const reviewQueueCandidates = buildReviewQueueCandidates(payload, shopperIdentityLinkCandidates, protectedLiquidationCandidates);
  const summary = {
    periods: payload.periods.length,
    visits: payload.visits.length,
    shoppers: payload.shoppers.length,
    shopperPublicRefs: shopperPublicRefs.length,
    identityLinks: shopperIdentityLinkCandidates.length,
    certificationCarryovers: certificationCarryoverCandidates.length,
    liquidationCandidates: protectedLiquidationCandidates.length,
    paymentBatchCandidates: protectedPaymentBatchCandidates.length,
    reviewQueueCandidates: reviewQueueCandidates.length
  };
  const auditEventCandidates = [buildAuditEvent(payload, summary)];

  return {
    verdict: hardFails.length ? 'NO_GO_PROTECTED_CANDIDATES' : 'GO_DRY_RUN_PROTECTED_CANDIDATES_SOURCE_SAFE',
    allowedToWrite: false,
    hardFails,
    warnings,
    summary,
    candidates: {
      shopperPublicRefs,
      shopperIdentityLinkCandidates,
      certificationCarryoverCandidates,
      protectedLiquidationCandidates,
      protectedPaymentBatchCandidates,
      reviewQueueCandidates,
      auditEventCandidates
    },
    safeState: {
      firestoreConnected: false,
      authConnected: false,
      writesEnabled: false,
      importEnabled: false,
      productionEnabled: false,
      containsSensitiveData: false
    }
  };
}
