import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../app/adapters/tya-cumulative-read-model-v2.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const composer = context.window.CX_TYA_CUMULATIVE_READ_MODEL;
assert.equal(typeof composer?.compose, 'function');

const shoppers = [
  { id: 'hr-01', shopperId: 'hr-01', nombre: 'María   José  Núñez', pais: 'GT' },
  { id: 'hr-02', shopperId: 'hr-02', nombre: '  MARIA JOSE NUNEZ ', pais: 'GT' },
  { id: 'hr-03', shopperId: 'hr-03', nombre: 'Marina Jose Nunez', pais: 'GT' },
];
const data = composer.compose({
  hr: {
    sourceRevision: 'identity-normalization-regression', currentProjectId: 'cinepolis',
    currentPeriodId: 'cinepolis-2026-10',
    projects: [{ id: 'cinepolis-2026-10', projectId: 'cinepolis', periodKey: '2026-10' }],
    shoppers, visits: [], posts: [],
  },
  protectedPayload: { shoppers: [], visits: [], postulations: [], applications: [] },
});
const review = data.identityReviewQueue.filter(row => row.reason === 'display_name_collision_not_auto_merged');
assert.equal(review.length, 1, 'equivalent display names should generate one staff review');
assert.equal(review[0].normalizedName, 'maria jose nunez');
assert.deepEqual(Array.from(review[0].shopperIds), ['hr-01', 'hr-02']);
assert.equal(data.diagnostics.duplicateShopperIds, 0, 'display match must not create duplicate IDs');
assert.equal(data.shoppers.length, 3, 'display match must not merge distinct technical IDs');
assert.equal(Object.hasOwn(data.identityMap, 'hr-01'), false, 'no alias crosswalk should be minted from a display name');
assert.equal(Object.hasOwn(data.identityMap, 'hr-02'), false, 'second identity should not be remapped');
console.log('PASS name normalization: case, accents, whitespace; no automatic merge; active staff review');
