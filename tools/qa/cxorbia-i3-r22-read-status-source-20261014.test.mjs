import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../app/core/backend-bulletins.js',import.meta.url),'utf8');
const midia=readFileSync(new URL('../../app/modules/midia.js',import.meta.url),'utf8');
const tablon=readFileSync(new URL('../../app/modules/tablon.js',import.meta.url),'utf8');
test('R22 server readback must precede local unread mutation',()=>{
 const scope=backend.slice(backend.indexOf('CX.notif.markRead = function(id)'),backend.indexOf('CX.notif.markAllRead = function(roleArg)'));
 assert.match(backend,/get\(\{source:'server'\}\)/);
 assert.ok(scope.indexOf('markRead(id).then')<scope.indexOf('originalMarkRead.call(this,id)'));
 assert.match(scope,/providerAck===true/);
 assert.doesNotMatch(scope,/originalMarkRead.call\(this, id\);\s*markRead\(id\)/);
});
test('R22 mark-all read only after provider succeeds; failed provider leaves local state untouched',()=>{
 const scope=backend.slice(backend.indexOf('CX.notif.markAllRead = function(roleArg)'),backend.indexOf('CX.notif.push = function(n)'));
 assert.ok(scope.indexOf('markAllRead(before).then')<scope.indexOf('originalMarkAllRead.call(this,roleArg)'));
 assert.match(scope,/providerAck:false/);
});
test('R22 Mi Día and Tablón await read and visit-scoped route',()=>{
 assert.match(midia,/const ack=await CX.notif.markRead\(n.id\)/);
 assert.match(midia,/role==='shopper'&&n.entityType==='visit'\?'misvisitas'/);
 assert.match(tablon,/const ack=await CX.notif.markAllRead\(role\)/);
 assert.match(tablon,/role==='shopper'&&n.entityType==='visit'\?'misvisitas'/);
});
