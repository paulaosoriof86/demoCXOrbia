import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import './cxorbia-i3-r22-human-notice-copy-source-20261015.test.mjs';
const src=readFileSync(new URL('../../app/core/topbar.js',import.meta.url),'utf8');
function surface({raw='shp-primary',role='shopper',authenticated=true,projectIds=['project-a'],project='project-a',map={},visits=[]}={}){
 const CX={
  session:{role:role==='shopper'?'shopper':'admin',user:{shopperId:raw}},
  backendAuth:{context:()=>({authenticated,role,shopperId:raw,projectIds})},
  data:{currentProjectId:project,__identityMap:map,_visitas:visits}
 };
 const ctx={CX,window:{CX},document:{readyState:'loading',addEventListener(){}},setTimeout(){}};
 vm.runInNewContext(src,ctx,{filename:'app/core/topbar.js'});
 return CX.topbar;
}
const notice=(id,action='cuestionario')=>({entityType:'visit',entityId:id,tipo:action,nav:'novedades'});
test('R22 exact canonical shopper can open its current visit',()=>{
 const top=surface({visits:[{id:'visit-1',shopperId:'shp-primary',projectId:'project-a'}]});
 assert.equal(top._noticeTarget(notice('visit-1')).visitId,'visit-1');
});
test('R22 approved historical alias resolves through exact identity crosswalk',()=>{
 const top=surface({map:{'shp-old':'shp-primary'},visits:[{id:'visit-old',hrRowId:'FEB!6',shopperId:'shp-old',projectId:'project-a'}]});
 const v=top._noticeTarget(notice('FEB!6'));
 assert.equal(v.visitId,'visit-old');assert.equal(v.action,'questionnaire');
});
test('R22 authenticated source alias and canonical visit resolve to one owner',()=>{
 const top=surface({raw:'shp-old',map:{'shp-old':'shp-primary'},visits:[{id:'visit-3',shopperId:'shp-primary'}]});
 assert.equal(top._noticeTarget(notice('visit-3')).visitId,'visit-3');
});
test('R22 another shoppers visit never opens even if display names coincide',()=>{
 const top=surface({map:{'shp-old':'shp-primary'},visits:[{id:'visit-other',shopperId:'shp-other',shopper:'Same Name'}]});
 assert.equal(top._noticeTarget(notice('visit-other')).visitId,'');
});
test('R22 cannot navigate a visit in a project outside authenticated membership',()=>{
 const top=surface({visits:[{id:'visit-out',shopperId:'shp-primary',projectId:'project-b'}]});
 assert.equal(top._noticeTarget(notice('visit-out')).visitId,'');
});
test('R22 unauthenticated shopper context never resolves a private visit',()=>{
 const top=surface({authenticated:false,visits:[{id:'visit-1',shopperId:'shp-primary'}]});
 assert.equal(top._noticeTarget(notice('visit-1')).visitId,'');
});
test('R22 non-shopper notification keeps its original navigation target',()=>{
 const top=surface({role:'admin'});
 assert.equal(top._noticeTarget({entityType:'visit',entityId:'visit-1',nav:'visitas'}).nav,'visitas');
});
