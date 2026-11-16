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

// VRM143: run the actual mapper and shared feed, never a second test filter.
import vm from 'node:vm';
const notifSource=readFileSync(new URL('../../app/core/notif.js',import.meta.url),'utf8');
function notificationFixture({role='shopper',visits=[],period='2026-11'}={}){
 const clock=Date.parse('2026-11-16T12:00:00Z');
 class ClockDate extends Date{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
 const CX={BACKEND:{enabled:false,previewMode:false,tenantId:'tenant-a'},dataSource:{showFixtures:()=>false},session:{role,user:{shopperId:'s1'}},backendAuth:{context:()=>({tenantId:'tenant-a',role,shopperId:'s1'})},data:{currentProjectId:'project-a',currentPeriodId:period,period:()=>({periodo:period}),_visitas:visits,_posts:[]}};
 const ctx=vm.createContext({CX,Date:ClockDate,console,Set,document:{readyState:'complete'},setTimeout:()=>0});ctx.window=ctx;ctx.addEventListener=()=>{};
 vm.runInContext(notifSource,ctx);vm.runInContext(source.replace('  CX.backendBulletins = {','  CX.__normalizeNotice = normalize;\n  CX.backendBulletins = {'),ctx);
 const raw=(overrides={})=>({id:'notice-a',tenantId:'tenant-a',toRole:role,targetRoles:[role],targetShopperIds:role==='shopper'?['s1']:[],targetProjectIds:['project-a'],projectId:'project-a',periodId:period,type:'news',createdAt:'2026-11-15T12:00:00Z',...overrides});
 const load=(records,readIds=[])=>{CX.notif._items=records.map(d=>CX.__normalizeNotice({id:d.id,data:()=>d},new Set(readIds)));return CX.notif;};
 return {CX,raw,load};
}
const noticeVisit=(extra={})=>({id:'visit-a',visitId:'visit-a',hrRowId:'HR!2',tenantId:'tenant-a',projectId:'project-a',periodId:'2026-10',shopperId:'s1',estado:'agendada',canonicalFacets:{assigned:true,scheduled:true,cancelled:false},...extra});
const requestNotice=(f,extra={})=>f.raw({periodId:'2026-10',createdAt:'2026-10-30T12:00:00Z',type:'cancel',entityType:'visit',entityId:'visit-a',operational:true,eventKey:'durable_cancel_request_decision',requestCycleId:'cycle-1',...extra});
test('VRM143 mapper preserves canonical lifecycle dates, explicit action and cycle through reload',()=>{
 const f=notificationFixture(),n=f.raw({createdAt:{toDate:()=>new Date('2026-11-15T12:00:00Z')},resolvedAt:'2026-11-16T10:00:00Z',expiredAt:'2026-11-17T00:00:00Z',actionRequired:true,requestCycleId:'cycle-1'});const mapped=f.load([n])._items[0];
 assert.equal(mapped.createdAt,'2026-11-15T12:00:00.000Z');assert.equal(mapped.resolvedAt,'2026-11-16T10:00:00.000Z');assert.equal(mapped.expiredAt,'2026-11-17T00:00:00.000Z');assert.equal(mapped.actionRequired,true);assert.equal(mapped.requestCycleId,'cycle-1');
});
for(const [name,fields,expected]of [
 ['current information',{},1],['resolved',{resolvedAt:'2026-11-15T14:00:00Z',operational:true},0],['expired',{expiredAt:'2026-11-16T10:00:00Z',actionRequired:true},0],['future expiry',{expiredAt:'2026-11-17T10:00:00Z'},1],['historical date without period',{periodId:null,createdAt:'2026-10-01T00:00:00Z'},0],['foreign project actionable',{projectId:'project-b',targetProjectIds:['project-b'],actionRequired:true},0]
])test('VRM143 shared feed correctly handles '+name,()=>{const f=notificationFixture(),n=f.raw(fields),store=f.load([n]);assert.equal(store.for('shopper').length,expected);assert.equal(store.unread('shopper'),expected);});
test('VRM143 historical terminal cancellation stays in history but is never reactivated by operational flag',()=>{
 const f=notificationFixture({visits:[noticeVisit({cancelRequest:{requestCycleId:'cycle-1',status:'rejected',requestedByShopperId:'s1'}})]}),store=f.load([requestNotice(f)]);
 assert.equal(store.for('shopper').length,0);assert.equal(store.history('shopper').length,1);
});
for(const [type,field,state]of [['cancel','cancelRequest','pending_review'],['cancel','cancelRequest','approved_pending_hr'],['reprog','rescheduleRequest','pending_review']])test('VRM143 exact historical '+type+' '+state+' remains visible even read',()=>{
 const f=notificationFixture({visits:[noticeVisit({[field]:{requestCycleId:'cycle-1',status:state,requestedByShopperId:'s1'}})]}),n=requestNotice(f,{type,eventKey:'durable_'+type+'_request_decision'}),store=f.load([n],['notice-a']);assert.equal(store.for('shopper').length,1);assert.equal(store.unread('shopper'),0);
});
test('VRM143 newer request cannot reactivate either older request or its decision, including equal timestamps',()=>{
 const v=noticeVisit({cancelRequest:{requestCycleId:'cycle-2',status:'pending_review',requestedAt:'2026-10-30T12:00:00Z',requestedByShopperId:'s1'}}),f=notificationFixture({visits:[v]});const old=requestNotice(f),decision=requestNotice(f,{id:'decision-1',idempotencyKey:'decision-command-1'}),current=requestNotice(f,{id:'notice-2',requestCycleId:'cycle-2'});const store=f.load([old,decision,current]);assert.deepEqual(Array.from(store.for('shopper'),x=>x.id),['notice-2']);assert.equal(store.history('shopper').length,3);
});
for(const [name,change]of [
 ['no cycle',n=>delete n.requestCycleId],['different cycle',n=>n.requestCycleId='other'],['other recipient',n=>n.targetShopperIds=['s2']],['other project',n=>{n.projectId='project-b';n.targetProjectIds=['project-b'];}],['other entity',n=>n.entityId='visit-b'],['other period',n=>n.periodId='2026-09'],['other tenant',n=>n.tenantId='tenant-b']
])test('VRM143 historical exception denies '+name,()=>{
 const f=notificationFixture({visits:[noticeVisit({cancelRequest:{requestCycleId:'cycle-1',status:'pending_review',requestedByShopperId:'s1'}})]}),n=requestNotice(f);change(n);assert.equal(f.load([n]).for('shopper').length,0);
});
test('VRM143 duplicate matching entity cannot certify a historical actionable notice',()=>{
 const v=noticeVisit({cancelRequest:{requestCycleId:'cycle-1',status:'pending_review',requestedByShopperId:'s1'}}),f=notificationFixture({visits:[v,{...v,id:'duplicate'}]});assert.equal(f.load([requestNotice(f)]).for('shopper').length,0);
});
test('VRM143 same-period decision remains informative after terminal resolution of request',()=>{
 const f=notificationFixture({visits:[noticeVisit({periodId:'2026-11',cancelRequest:{requestCycleId:'cycle-1',status:'rejected',requestedByShopperId:'s1'}})]}),store=f.load([requestNotice(f,{periodId:'2026-11',createdAt:'2026-11-15T00:00:00Z'})]);assert.equal(store.for('shopper').length,1);assert.equal(store._actionable(store._items[0]),false);
});
test('VRM143 current legacy decision remains informative without inventing a historic cycle',()=>{
 const f=notificationFixture({visits:[noticeVisit({periodId:'2026-11',cancelRequest:{status:'rejected',requestedByShopperId:'s1'}})]}),store=f.load([requestNotice(f,{requestCycleId:null,periodId:'2026-11',createdAt:'2026-11-15T00:00:00Z'})]);assert.equal(store.for('shopper').length,1);assert.equal(store._actionable(store._items[0]),false);
});
test('VRM143 approved assignment notice retains its exact pending visit obligation',()=>{
 const f=notificationFixture({visits:[noticeVisit({estado:'asignada',canonicalFacets:{assigned:true,scheduled:false,cancelled:false}})]}),n=requestNotice(f,{type:'aprobada',eventKey:'postulation_approved_visit_assigned',requestCycleId:null});assert.equal(f.load([n]).for('shopper').length,1);
});

for(const currentOwner of ['s2',null])for(const role of ['shopper','admin'])test('VRM143 historical request from previous or absent owner is informational only: '+role+' '+currentOwner,()=>{
 const f=notificationFixture({role,visits:[noticeVisit({shopperId:currentOwner,cancelRequest:{requestCycleId:'cycle-1',status:'pending_review',requestedByShopperId:'s1'}})]}),store=f.load([requestNotice(f)]);assert.equal(store.for(role).length,0);assert.equal(store.history(role).length,1);assert.equal(store._actionable(store._items[0]),false);
});
