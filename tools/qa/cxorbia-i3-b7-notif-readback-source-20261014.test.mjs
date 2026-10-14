import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../../app/core/backend-bulletins.js',import.meta.url),'utf8');
test('B7 durable shopper notices require Firestore server readback and post-hydration reload',()=>{
 assert.match(source,/const verified=await bulletinRef\.get\(\{source:'server'\}\)/);
 assert.match(source,/NOTIFICATION_DURABLE_READBACK_SCOPE_MISMATCH/);
 assert.match(source,/String\(persisted\.idempotencyKey\|\|''\)/);
 assert.match(source,/persisted\.targetShopperIds\.map\(String\)\.includes\(sid\)/);
 assert.match(source,/window\.addEventListener\('cx:protected-auth-hr-authority-ready'/);
 assert.match(source,/CX\.notif\._items = items\.concat/);
 assert.doesNotMatch(source,/if\(items\.length\)\{\s*CX\.notif\._items/);
});
