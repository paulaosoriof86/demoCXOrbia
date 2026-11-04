import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectServingDevRevision, assertExactServingDigest } from './cxorbia-i3-vrm300-traffic.mjs';

const digest = 'sha256:' + 'a'.repeat(64);
const otherDigest = 'sha256:' + 'b'.repeat(64);
const sample = (created, ready, revision, percent) => ({
  status: { latestCreatedRevisionName: created, latestReadyRevisionName: ready,
    traffic: [{ revisionName: revision, percent }] },
});

test('accept exact ready revision serving all DEV traffic', () => {
  assert.equal(inspectServingDevRevision(sample('00338', '00338', '00338', 100)).ok, true);
  assert.doesNotThrow(() => assertExactServingDigest({ status: { imageDigest: digest } }, digest));
});

test('accept reused revision with a different image tag but identical bytes', () => {
  assert.doesNotThrow(() => assertExactServingDigest({
    spec: { containers: [{ image: 'gcr.io/dev/service:previous-tag' }] },
    status: { imageDigest: 'gcr.io/dev/service@' + digest },
  }, digest));
});

test('reject old serving revision even when a new one is ready', () => {
  assert.equal(inspectServingDevRevision(sample('00338', '00338', '00336', 100)).ok, false);
});

test('reject newly ready revision with 0% traffic', () => {
  assert.equal(inspectServingDevRevision(sample('00338', '00338', '00338', 0)).ok, false);
});

test('reject revision not ready or missing traffic', () => {
  assert.equal(inspectServingDevRevision(sample('00338', '00337', '00338', 100)).ok, false);
  assert.equal(inspectServingDevRevision({ status: { latestReadyRevisionName: '00338' } }).ok, false);
});

test('reject other bytes even if that revision receives traffic', () => {
  assert.throws(() => assertExactServingDigest({ status: { imageDigest: otherDigest } }, digest),
    /differs from/);
});

test('reject missing immutable SHA-256', () => {
  assert.throws(() => assertExactServingDigest({ status: { imageDigest: '' } }, digest),
    /differs from/);
});
