#!/usr/bin/env node
import crypto from 'node:crypto';
import http from 'node:http';

const PORT = Number(process.env.PORT || 8080);
const ENVIRONMENT = String(process.env.CXORBIA_ENVIRONMENT || 'DEV');
const SOURCE_LOCK = String(process.env.CXORBIA_SOURCE_LOCK || '');
const LEASE_TTL_MS = Math.max(60_000, Number(process.env.CXORBIA_LEASE_TTL_MS || 600_000));
const LEASE_MODE = 'single_instance_memory_dev';
const MAX_BODY_BYTES = 16 * 1024;
const leases = new Map();

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}

function sendJson(res, statusCode, value) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.end(`${JSON.stringify(value)}\n`);
}

function cleanupExpired(now = Date.now()) {
  for (const [key, lease] of leases.entries()) {
    if (lease.expiresAtMs <= now) leases.delete(key);
  }
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  if (!chunks.length) throw new Error('BODY_REQUIRED');
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function validateInvocation(body) {
  const requestId = String(body?.requestId || '');
  const sourceLock = String(body?.sourceLock || '');
  const valid =
    body?.schemaVersion === 'cxorbia.c6.direct-trusted-runner.invoke.v1' &&
    body?.environment === 'DEV' &&
    body?.operation === 'control_plane_self_test' &&
    body?.dryRun === true &&
    body?.providerBoundaryRequested === false &&
    body?.providerReads === false &&
    body?.providerWrites === false &&
    /^c6-direct-[a-z0-9-]{8,100}$/.test(requestId) &&
    /^[a-f0-9]{40}$/.test(sourceLock);
  if (!valid) return { ok: false, error: 'INVOCATION_CONTRACT_INVALID' };
  if (!/^[a-f0-9]{40}$/.test(SOURCE_LOCK)) return { ok: false, error: 'RUNTIME_SOURCE_LOCK_INVALID' };
  if (sourceLock !== SOURCE_LOCK) return { ok: false, error: 'SOURCE_LOCK_MISMATCH' };
  return { ok: true, requestId, sourceLock };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, {
      ok: true,
      service: 'cxorbia-c6-direct-trusted-runner',
      environment: ENVIRONMENT,
      sourceLock: SOURCE_LOCK,
      authenticatedAtEdge: true,
      leaseMode: LEASE_MODE,
      leaseTtlMs: LEASE_TTL_MS,
      providerBoundaryEnabled: false,
      allowedOperations: ['control_plane_self_test'],
      providerReads: 0,
      providerWrites: 0,
      production: false
    });
  }

  if (req.method !== 'POST' || url.pathname !== '/v1/control-plane/execute') {
    return sendJson(res, 404, { ok: false, error: 'NOT_FOUND' });
  }

  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    return sendJson(res, 415, { ok: false, error: 'CONTENT_TYPE_REQUIRED' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const code = String(error?.message || error) === 'BODY_TOO_LARGE' ? 413 : 400;
    return sendJson(res, code, { ok: false, error: String(error?.message || error) });
  }

  const validation = validateInvocation(body);
  if (!validation.ok) {
    const status = validation.error === 'SOURCE_LOCK_MISMATCH' ? 412 : 400;
    return sendJson(res, status, {
      ok: false,
      decision: `HOLD_C6_DIRECT_RUNNER_${validation.error}`,
      providerBoundaryAllowed: false,
      providerReads: 0,
      providerWrites: 0
    });
  }

  const now = Date.now();
  cleanupExpired(now);
  const payloadDigest = digest(body);
  const current = leases.get(validation.requestId);

  if (current && current.expiresAtMs > now) {
    const samePayload = current.payloadDigest === payloadDigest;
    return sendJson(res, 409, {
      ok: false,
      decision: samePayload
        ? 'HOLD_C6_DIRECT_RUNNER_DUPLICATE_REJECTED'
        : 'HOLD_C6_DIRECT_RUNNER_IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD',
      requestId: validation.requestId,
      sourceLock: validation.sourceLock,
      leaseId: current.leaseId,
      leaseState: current.state,
      leaseExpiresAt: new Date(current.expiresAtMs).toISOString(),
      providerBoundaryAllowed: false,
      providerReads: 0,
      providerWrites: 0
    });
  }

  const lease = {
    leaseId: crypto.randomUUID(),
    requestId: validation.requestId,
    sourceLock: validation.sourceLock,
    payloadDigest,
    state: 'completed_technical_validation',
    acquiredAtMs: now,
    expiresAtMs: now + LEASE_TTL_MS
  };
  leases.set(validation.requestId, lease);

  return sendJson(res, 202, {
    ok: true,
    decision: 'PASS_C6_DIRECT_TRUSTED_RUNNER_TECHNICAL_VALIDATION',
    requestId: validation.requestId,
    sourceLock: validation.sourceLock,
    leaseId: lease.leaseId,
    leaseMode: LEASE_MODE,
    leaseState: lease.state,
    leaseAcquiredAt: new Date(lease.acquiredAtMs).toISOString(),
    leaseExpiresAt: new Date(lease.expiresAtMs).toISOString(),
    providerBoundaryAllowed: false,
    providerReads: 0,
    providerWrites: 0,
    production: false
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(JSON.stringify({
    service: 'cxorbia-c6-direct-trusted-runner',
    port: PORT,
    environment: ENVIRONMENT,
    sourceLock: SOURCE_LOCK,
    providerBoundaryEnabled: false,
    providerReads: 0,
    providerWrites: 0
  }));
});
