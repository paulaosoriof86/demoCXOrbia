import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../../backend/runtime/cxorbia-operational-command-provider-v1.mjs',import.meta.url),'utf8');
test('B7 reschedule decision targets the exact shopper',()=>{
 const block=source.split("else if(command.commandType==='visit.reschedule'){")[1]?.split("else if(command.commandType==='visit.cancel'){")[0];
 assert.ok(block);
 assert.match(block,/notificationTargetShopperId=str\(v\.shopperId\)/);
 assert.match(block,/OPS_RESCHEDULE_SHOPPER_TARGET_REQUIRED/);
 assert.match(source,/targetShopperIds:requested\?\[\]:\[targetShopper\]\.filter\(Boolean\)/);
 assert.match(source,/toRole:requested\?'admin':'shopper'/);
});
