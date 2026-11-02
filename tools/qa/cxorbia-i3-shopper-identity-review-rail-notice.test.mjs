import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Keep the real router source in the test, without access to Firebase or PII.
const CX={
  session:{role:'admin',user:{},hasTechAccess(){return true;}},
  bus:{on(){}},
  backendAuth:{context(){return {authenticated:true,authNamespace:'staff',role:'super'};}},
  data:{currentProjectId:'cinepolis',__identityReviewQueue:[
    {shopperIds:['HR_GT_A','ALIAS_B'],reason:'display_name_collision_not_auto_merged'},
    {shopperIds:['ALIAS_B','HR_GT_A'],reason:'duplicate_signal'},
    {shopperId:'HR_GT_C',reason:'human_display_name_unresolved'},
    {shopperIds:['HR_GT_D','ALIAS_D'],status:'resolved_merged'},
    {shopperIds:['HR_HN_A','ALIAS_HN_A'],projectScope:'another-project'}
  ]}
};
const window={CX,addEventListener(){}};
vm.runInNewContext(readFileSync(new URL('../../app/core/router.js',import.meta.url),'utf8'),{window,CX});
const count=role=>CX.router.pendingShopperIdentityReviewCount(role);
assert.equal(count('admin'),2,'two exact pending groups, de-duplicated and scoped');
assert.equal(count('shopper'),0,'shopper never receives staff identity review details');
assert.equal(count('cliente'),0,'client never receives staff identity review details');
CX.backendAuth.context=()=>({authenticated:false,authNamespace:'staff',role:'super'});
assert.equal(count('admin'),0,'unauthenticated route never receives staff review details');
CX.backendAuth.context=()=>({authenticated:true,authNamespace:'shopper',role:'super'});
assert.equal(count('admin'),0,'wrong Auth namespace is not staff');
CX.backendAuth.context=()=>({authenticated:true,authNamespace:'staff',role:'shopper'});
assert.equal(count('admin'),0,'shopper claims cannot see reviews');
CX.backendAuth.context=()=>({authenticated:true,authNamespace:'staff',role:'ops'});
assert.equal(count('admin'),2,'operations staff sees scoped review counts');
CX.data.__identityReviewQueue=[{reviewId:'r-123',status:'active'}];
assert.equal(count('admin'),1,'a review-only technical case still gets a visible notification');
CX.data.__identityReviewQueue=[];
assert.equal(count('admin'),0,'zero pending reviews produce zero badge');
const source=readFileSync(new URL('../../app/core/router.js',import.meta.url),'utf8');
const shopperSource=readFileSync(new URL('../../app/modules/shoppers.js',import.meta.url),'utf8');
assert.match(source,/expedientes técnicos en revisión/,'rail explicitly labels its technical-case universe');
assert.match(source,/no representa personas ni fusiones pendientes/,'rail cannot misstate the count as remaining approved merges');
assert.match(shopperSource,/ui\.kpi\('Perfiles visibles con revisión',activeRows\(\)\.filter\(s=>identityReviewIds\.has\(String\(s\.id\|\|''\)\)\)\.length,'a'\)/,
  'Shopper KPI counts only project profiles shown by the same identity filter, not the unrelated technical-ID set');
assert.doesNotMatch(shopperSource,/ui\.kpi\('Requieren revisión \/ decisión',identityReviewIds\.size/,
  'old technical-ID numerator is not used for the clickable shopper-review filter');
const shoppers=[{id:'s1',nombre:'Uno',pais:'GT',estado:'Activo'},
  {id:'s2',nombre:'Dos',pais:'GT',estado:'Activo'},
  {id:'s3',nombre:'Tres',pais:'GT',estado:'Activo',identityState:'retired_by_admin'},
  {id:'s4',nombre:'Cuatro',pais:'GT',estado:'Activo'}];
let registerShopperModule=null;
const moduleCx={module(name,fn){if(name==='shoppers')registerShopperModule=fn;},
  data_shopperDataLevel(){return 'operational';},paisName(c){return c;}};
vm.runInNewContext(shopperSource,{CX:moduleCx,setTimeout(){}},{filename:'shoppers.js'});
const mockData={shoppersFor:()=>shoppers,period:()=>({name:'Periodo QA'}),
  shopperActivo:()=>true,activeRefDate:()=> '2026-11-02',currentProjectId:'cinepolis',
  getShopper:id=>shoppers.find(s=>s.id===id)||null,
  __identityReviewQueue:[
    {reviewId:'review1',shopperIds:['s1','s2','alias-not-visible'],status:'active'},
    {reviewId:'review2',shopperIds:['s3','alias-retired'],status:'active'}],
  __identityReviewResolutions:[]};
const fakeUi={ph:()=>'',kpi:(label,n)=>`<kpi title="${label}">${n}</kpi>`,
  bdg:()=>'',empty:()=>'',aiBox:()=>''};
const rendered=registerShopperModule({data:mockData,ui:fakeUi});
assert.match(rendered,/<kpi title="Perfiles visibles con revisión">2<\/kpi>/,
  'two visible active profiles counted; unrelated technical aliases and retired profiles excluded');
assert.doesNotMatch(rendered,/<kpi title="Perfiles visibles con revisión">(?:5|6)<\/kpi>/,
  'technical queue IDs do not inflate the clickable numerator');
console.log('PASS identity-review notice: 15 scoped, semantic, numerator and actual Shopper render checks');
