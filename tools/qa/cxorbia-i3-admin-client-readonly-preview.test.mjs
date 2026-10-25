import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const source=fs.readFileSync('app/core/backend-browser-auth.js','utf8'),router=fs.readFileSync('app/core/router.js','utf8');
function fixture(role,{tenant='tya',storage=new Map()}={}){
 const claims={role,tenantId:tenant,authNamespace:role==='shopper'?'shopper':'staff',projectIds:['cinepolis']};
 if(role==='shopper')claims.shopperId='shopper-qa';
 const user={getIdTokenResult:async()=>({claims})};
 const auth={signOutCalls:0,async setPersistence(){},async signInWithEmailAndPassword(){return {user};},async signOut(){this.signOutCalls++;},onAuthStateChanged(cb){cb(user);return()=>{};}};
 function authMethod(){return auth;}authMethod.Auth={Persistence:{SESSION:'session'}};
 const firebase={apps:[{}],app:()=>({auth:()=>auth}),auth:authMethod};
 const session={role:null,user:null,view:null,testRole:null,clear(){this.role=null;this.user=null;this.view=null;this.testRole=null;},save(){}};
 const CX={BACKEND:{enabled:true,previewMode:true,tenantId:'tya',devPreviewAuth:{enabled:true},firebaseConfig:{projectId:'dev'}},session};
 const document={readyState:'loading',addEventListener(){},getElementById(){return null;},querySelectorAll(){return [];}};
 const sessionStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const window={firebase,CX,crypto:webcrypto};
 vm.runInNewContext(source,{window,CX,firebase,document,sessionStorage,crypto:webcrypto,TextEncoder,Uint8Array,setTimeout,console});
 let enters=0;CX.app={enter(){enters++;}};
 return {CX,auth,storage,enters:()=>enters};
}
test('Admin client selection is a read-only presentation, not a change of Firebase principal',async()=>{
 const x=fixture('admin');const ctx=await x.CX.backendAuth.authenticate('admin-fixture','no-real-password','staff','cliente');
 assert.equal(ctx.role,'admin');assert.equal(x.CX.session.role,'cliente');
 assert.equal(x.CX.session.user.role,'admin');assert.equal(x.CX.session.user.clientPreviewReadOnly,true);
 assert.equal(x.CX.backendAuth.clientPreviewActive(),true);assert.equal(x.storage.get('cxorbia_admin_client_preview'),'1');
 assert.equal(x.CX.backendAuth.leaveClientPreview(),true);assert.equal(x.CX.session.role,'admin');
 assert.equal(x.CX.backendAuth.enterClientPreview(),true);assert.equal(x.CX.session.role,'cliente');assert.equal(x.enters(),2);
});
test('UI preference never grants Client preview without current Admin tenant claims',async()=>{
 const shared=new Map([['cxorbia_admin_client_preview','1']]);
 const admin=fixture('admin',{storage:shared});await admin.CX.backendAuth.ensureAuthenticated();
 assert.equal(admin.CX.session.user.clientPreviewReadOnly,true);
 const ops=fixture('ops',{storage:shared});await ops.CX.backendAuth.ensureAuthenticated();
 assert.equal(ops.CX.session.role,'admin');assert.notEqual(ops.CX.session.user.clientPreviewReadOnly,true);
 assert.equal(shared.has('cxorbia_admin_client_preview'),false);
});
test('Ops and other-tenant Super cannot select Client; real Client and Shopper keep their roles',async()=>{
 const ops=fixture('ops');
 await assert.rejects(ops.CX.backendAuth.authenticate('ops-fixture','fixture','staff','cliente'),/ROLE_SELECTION_MISMATCH/);
 assert.equal(ops.auth.signOutCalls,1);
 const other=fixture('super',{tenant:'other'});
 await assert.rejects(other.CX.backendAuth.authenticate('other-fixture','fixture','staff','cliente'),/ROLE_SELECTION_MISMATCH/);
 const client=fixture('cliente');await client.CX.backendAuth.authenticate('client-fixture','fixture','staff','cliente');
 assert.equal(client.CX.session.role,'cliente');assert.equal(client.CX.session.user.clientPreviewReadOnly,false);
 const shopper=fixture('shopper');await shopper.CX.backendAuth.authenticate('shopper-fixture','fixture','shopper','shopper');
 assert.equal(shopper.CX.session.role,'shopper');assert.equal(shopper.CX.session.user.shopperId,'shopper-qa');
});
test('Admin preview controls include return path and block all client surface edits',()=>{
 assert.match(router,/cxEnterClientPreview/);
 assert.match(router,/cxLeaveClientPreview/);
 assert.match(router,/host\.addEventListener\(evt,denyClientAction,true\)/);
 assert.match(router,/e\.preventDefault\(\);e\.stopPropagation\(\);e\.stopImmediatePropagation\(\)/);
 assert.match(router,/Vista del cliente · consulta administrativa/);
 assert.doesNotMatch(source,/setCustomUserClaims|signInWithCustomToken/);
});
