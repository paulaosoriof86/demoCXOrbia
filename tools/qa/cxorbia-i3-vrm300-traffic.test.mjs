import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectServingDevRevision, assertExactRevisionImage } from './cxorbia-i3-vrm300-traffic.mjs';

const image = 'gcr.io/dev/service:source-exact-run';
const sample = (created, ready, revision, percent) => ({
  status: { latestCreatedRevisionName: created, latestReadyRevisionName: ready,
    traffic: [{ revisionName: revision, percent }] },
});

test('accept exact ready revision serving all DEV traffic', () => {
  assert.equal(inspectServingDevRevision(sample('00338', '00338', '00338', 100)).ok, true);
  assert.doesNotThrow(() => assertExactRevisionImage({ spec: { containers: [{ image }] } }, image));
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

test('reject other image even if that revision receives traffic', () => {
  assert.throws(() => assertExactRevisionImage({ spec: { containers: [{ image: 'gcr.io/dev/service:old' }] } }, image),
    /differs from/);
});
