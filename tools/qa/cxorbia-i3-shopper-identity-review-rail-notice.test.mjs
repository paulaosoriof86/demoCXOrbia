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
console.log('PASS identity-review notice: 9 scoped role and de-duplication checks');
