import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const backend=fs.readFileSync('app/core/backend-firebase.js','utf8');
const browserAuth=fs.readFileSync('app/core/backend-browser-auth.js','utf8');
const hrBridge=fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8');
const documents=fs.readFileSync('app/modules/documentos.js','utf8');

test('I3 source: backend context follows current Firebase login, including logout null, without a page reload',()=>{
  let live={authenticated:true,role:'admin',tenantId:'tya'};
  const CX={BACKEND:{enabled:true,tenantId:'tya'},backendAuth:{context:()=>live}};
  const listeners=[];
  vm.runInNewContext(backend,{CX,window:{CX},document:{readyState:'loading',addEventListener:(name,fn)=>listeners.push({name,fn})},console,setTimeout});
  assert.equal(CX.backend.authContext(),live);
  live=null;
  assert.equal(CX.backend.authContext(),null,'logout must not fall back to cached Admin');
  live={authenticated:true,role:'shopper',tenantId:'tya',shopperId:'qa-exact'};
  assert.equal(CX.backend.authContext(),live,'new shopper must replace previous Admin context');
  assert.ok(listeners.some(x=>x.name==='DOMContentLoaded'));
  assert.match(backend,/if\(before!==authReadIdentity\(\)\)throw new Error\('AUTH_SESSION_CHANGED_DURING_BACKEND_READ'\)/);
});

test('I3 source: login does not enter from a previous actor snapshot and hydrates switched roles',()=>{
  assert.match(backend,/actorUid:String\(app\?\.auth\?\.\(\)\?\.currentUser\?\.uid\|\|''\)/);
  assert.match(browserAuth,/String\(p\.actorUid\|\|''\)===uid/);
  assert.match(browserAuth,/String\(p\.role\|\|''\)===String\(ctx\.role\|\|''\)/);
  assert.match(browserAuth,/list\(p\.projectIds\)\.sort\(\)\.join\('\|'\)===expectedProjects/);
  assert.match(browserAuth,/if\(backendHydratedInThisTab\)\{[\s\S]*?await CX\.backend\.refresh\(\);/);
  assert.match(browserAuth,/function enterAfterBackendReady\(\)\{[\s\S]*?if\(!backendSnapshotMatchesLivePrincipal\(currentContext\)\)return;/);
  assert.match(browserAuth,/if\(enteredPrincipalStamp===stamp&&CX\.session\?\.role\)return;/);
  assert.match(browserAuth,/enteredPrincipalStamp = '';/);
  assert.doesNotMatch(browserAuth,/if\(window\.CX_BACKEND_AUTHORIZED_STATE\)\{enterAfterBackendReady\(\)/);
  assert.match(hrBridge,/function authorizedBackendPrincipalMatches\(/);
  assert.match(hrBridge,/str\(p\.actorUid\)===uid/);
  assert.match(hrBridge,/!CX\.data\|\|!authorizedBackendPrincipalMatches\(c\)/);
});

test('I3 behavior: authenticated shopper cannot mount an Admin Firestore slice from the same tab',async()=>{
  const shopperUser={uid:'uid-shopper-qa',getIdTokenResult:async()=>({claims:{role:'shopper',tenantId:'tya',authNamespace:'shopper',shopperId:'shopper-exact-qa',projectIds:['cinepolis'],country:'GT'}})};
  const auth={currentUser:null,setPersistence:async()=>{},signInWithEmailAndPassword:async()=>{auth.currentUser=shopperUser;return {user:shopperUser};},signOut:async()=>{auth.currentUser=null;}};
  const authFunction=()=>auth;authFunction.Auth={Persistence:{SESSION:'session'}};
  const firebase={apps:[{auth:authFunction}],app:()=>({auth:authFunction}),auth:authFunction};
  const CX={BACKEND:{enabled:true,tenantId:'tya',firebaseConfig:{apiKey:'fixture'}},session:{clear(){this.role=null;this.user=null;},save(){}}};
  const win={CX,firebase,crypto:webcrypto};
  const runnable=browserAuth.replace('  CX.backendAuth = {','  CX.__qaSnapshotMatches=backendSnapshotMatchesLivePrincipal;\n  CX.backendAuth = {');
  vm.runInNewContext(runnable,{CX,window:win,firebase,crypto:webcrypto,TextEncoder,document:{readyState:'loading',addEventListener(){},getElementById(){return null;}},sessionStorage:{setItem(){},removeItem(){}},setTimeout,console});
  const ctx=await CX.backendAuth.authenticate('shopper-fixture','not-a-real-credential','shopper','shopper');
  assert.equal(ctx.role,'shopper');
  win.CX_BACKEND_AUTHORIZED_STATE={tenantId:'tya',principal:{actorUid:'uid-admin-qa',tenantId:'tya',role:'admin',authNamespace:'staff',shopperId:'',projectIds:['cinepolis']}};
  assert.equal(CX.__qaSnapshotMatches(ctx),false);
  win.CX_BACKEND_AUTHORIZED_STATE={tenantId:'tya',principal:{actorUid:'uid-shopper-qa',tenantId:'tya',role:'shopper',authNamespace:'shopper',shopperId:'shopper-exact-qa',projectIds:['cinepolis']}};
  assert.equal(CX.__qaSnapshotMatches(ctx),true);
  await CX.backendAuth.signOut();
  assert.equal(CX.__qaSnapshotMatches(ctx),false,'signed-out Firebase UID cannot reuse the old shopper snapshot');
});

test('I3 source: PDF viewer renders pages inside scoped module, never a blank PDF iframe',()=>{
  assert.match(documents,/data-pdf-viewer/);
  assert.match(documents,/pdf\.getPage\(pageNumber\)/);
  assert.match(documents,/page\.render\(\{canvasContext:context,viewport/);
  assert.match(documents,/slot\.isConnected&&host\.contains\(slot\)/);
  assert.match(documents,/data-pdf-status="failed"|status\.dataset\.pdfStatus='failed'/);
  assert.match(documents,/abre el PDF original en otra pestaña/);
  assert.doesNotMatch(documents,/<iframe title="Vista previa PDF del proyecto"/);
});
