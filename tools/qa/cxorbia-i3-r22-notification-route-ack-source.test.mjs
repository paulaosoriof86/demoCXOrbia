import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const top=fs.readFileSync(new URL('../../app/core/topbar.js',import.meta.url),'utf8');
const visits=fs.readFileSync(new URL('../../app/modules/misvisitas.js',import.meta.url),'utf8');
test('R22 role and exact shopper visit select action without fuzzy fallback',()=>{
 const match=top.match(/  _noticeTarget\(n\)\{([\s\S]*?)\n  \},\n  _noticeText/);
 assert.ok(match);
 const fn=vm.runInNewContext('(function(n){'+match[1]+'\n})',{
    CX:{backendAuth:{context:()=>({authenticated:true,role:'shopper',shopperId:'s1',projectIds:['cinepolis']})},session:{user:{shopperId:'s1'}},data:{currentProjectId:'cinepolis',__identityMap:{},_visitas:[{id:'v1',shopperId:'s1',projectId:'cinepolis'},{id:'v2',shopperId:'s2',projectId:'cinepolis'}]}}
 });
 const shopper={role:()=> 'shopper'};
 assert.deepEqual(JSON.parse(JSON.stringify(fn.call(shopper,{tipo:'cuestionario',entityType:'visit',entityId:'v1',nav:'misvisitas'}))),{nav:'misvisitas',visitId:'v1',action:'questionnaire'});
 assert.equal(fn.call(shopper,{tipo:'cuestionario',entityType:'visit',entityId:'v2'}).visitId,'');
});
test('R22 notification click awaits durable read ACK and targets exact action',()=>{
 assert.match(top,/await Promise\.resolve\(CX\.notif\.markRead\(notice\.id\)\)/);
 assert.match(top,/await Promise\.resolve\(CX\.notif\.markAllRead\(this\.role\(\)\)\)/);
 assert.match(top,/window\.CX_PENDING_SHOPPER_VISIT_ACTION=\{action:target\.action,visitId:target\.visitId,requestedAt:Date\.now\(\)\}/);
 assert.match(visits,/questionnaire:'quest'/);
 assert.match(visits,/data-visit-card/);
});
test('R22 raw technical HR IDs are presentation only, never persisted as titles',()=>{
 assert.match(top,/_noticeText\(n\)/);
 assert.match(top,/replace\(\/\\bhr_20/);
 assert.match(top,/this\._noticeText\(n\)/);
});
