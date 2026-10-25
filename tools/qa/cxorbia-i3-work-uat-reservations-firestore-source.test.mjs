import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// I3 Work-UAT source guard only; no credentials/provider writes.
// Firebase rules compilation and live role-scoped E2E remain separate.
const rules=readFileSync('firestore.rules','utf8');
function reservationBlock(){
 const outer=rules.indexOf('match /projects/{projectId} {');
 assert.ok(outer>=0,'Project scope missing');
 const begin=rules.indexOf('match /reservations/{reservationId} {',outer);
 assert.ok(begin>outer,'Reservation rule missing');
 const end=rules.indexOf('match /visits/{visitId} {',begin);
 assert.ok(end>begin,'Reservation must precede existing visits match');
 return rules.slice(begin,end);
}
test('reservation read lives under tenant/project-scoped rules',()=>{
 const block=reservationBlock();
 assert.match(rules,/match \/tenants\/\{tenantId\} \{/);
 assert.match(block,/match \/reservations\/\{reservationId\} \{/);
});
test('operator read must require tenant authorization, not client blanket read',()=>{
 const block=reservationBlock();
 assert.match(block,/allow read: if tenantAllowed\(tenantId\)/);
 assert.match(block,/isOperator\(\)/);
 assert.doesNotMatch(block,/isClient\(\)|allow read: if true/);
});
test('shopper reader requires own exact assigned project and nonempty identity',()=>{
 const block=reservationBlock();
 assert.match(block,/isShopperRole\(\)/);
 assert.match(block,/projectAssigned\(projectId\)/);
 assert.match(block,/shopperId\(\)\s*!=\s*''/);
});
test('shopper authorization is per reservation resource owner, never name matching',()=>{
 const block=reservationBlock();
 assert.match(block,/isOwnResource\(\)/);
 assert.doesNotMatch(block,/resource\.data\.(?:name|nombre|email|phone)/);
});
test('direct writes to reservation collection remain disabled',()=>{
 const block=reservationBlock();
 assert.match(block,/allow create, update, delete: if false;/);
 assert.doesNotMatch(block,/allow write:/);
});
test('existing scoped visit and application guards stay present',()=>{
 assert.match(rules,/match \/visits\/\{visitId\} \{/);
 assert.match(rules,/match \/applications\/\{applicationId\} \{/);
 assert.match(rules,/match \/postulations\/\{postulationId\} \{/);
});
