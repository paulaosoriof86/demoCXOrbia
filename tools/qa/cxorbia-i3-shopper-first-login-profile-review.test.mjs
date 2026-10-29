import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';

// No Firebase calls: exercises the real portal adapter with fake authenticated
// authority and lightweight DOM. It verifies the prompt never writes itself.
const source=readFileSync(new URL('../../app/adapters/tya-canonical-shopper-portal-v2.js',import.meta.url),'utf8');

function boot({role='shopper',authenticated=true,authorityReady=true,phone='',uid='verified-shopper-uid'}={}){
  const events={},busHandlers={},pending=[],nodes=new Map(),calls={updates:0,nav:[],edit:0,toast:[],logout:0};
  const element=tag=>({tag,id:'',style:{},attributes:{},children:[],handlers:{},textContent:'',type:'',className:'',
    setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.handlers[k]=fn;},
    append(...xs){this.children.push(...xs);},click(){this.handlers.click?.();},remove(){nodes.delete(this.id);}});
  const view=element('div');view.id='view';const host=element('main');
  host.insertBefore=(box)=>{nodes.set(box.id,box);host.children.push(box);};
  const edit=element('button');edit.handlers.click=()=>calls.edit++;
  const document={readyState:'loading',addEventListener:(name,fn)=>(events[name]??=[]).push(fn),
    createElement:element,getElementById:id=>id==='view'?view:nodes.get(id)||null,
    querySelector:selector=>selector==='#app .content'?host:selector==='#view [data-profile-edit]'?edit:null};
  const row={id:'shopper_gt_exact',shopperId:'shopper_gt_exact',nombre:'Ana Prueba',firstName:'Ana',lastName:'Prueba',whatsapp:phone,pais:'GT'};
  const CX={modules:{},session:{role,user:{shopperId:'shopper_gt_exact'}},
    app:{logout(){calls.logout++;CX.session.role=null;}},bus:{on:(event,fn)=>busHandlers[event]=fn},
    data:{shoppers:[row],getShopper:id=>id==='shopper_gt_exact'?row:null,updateShopper:()=>{calls.updates++;return Promise.resolve({ok:true});}},
    backendAuth:{context:()=>({role,authenticated,shopperId:'shopper_gt_exact'})},
    router:{nav:id=>calls.nav.push(id)},ui:{toast:(...args)=>calls.toast.push(args)}};
  const window={CX,CX_PROTECTED_AUTH_HR_AUTHORITY:{applied:authorityReady,shopperPrincipalClaimsVerified:true,exactSessionShopperReady:true,actorUid:uid,canonicalShopperId:'shopper_gt_exact'},
    firebase:{auth:()=>({currentUser:{uid}})},
    addEventListener:(name,fn)=>(events[name]??=[]).push(fn),
    CX_SHOPPER_CREDENTIAL_RULE:{shopperCredentialRule:()=>({ok:true,login:'ana.prueba',firstName:'Ana',lastName:'Prueba'})}};
  vm.runInNewContext(source,{window,CX,document,setTimeout:fn=>pending.push(fn)},{filename:'canonical-shopper-portal-v2.js'});
  return {window,CX,document,host,calls,events,busHandlers,flush:()=>{for(let i=0;i<20&&pending.length;i++)pending.shift()();},notice:()=>nodes.get('cxShopperFirstLoginProfileNotice')||null};
}

test('primer ingreso autenticado pide revisar perfil aunque falte teléfono, sin bloquear sesión ni escribir',()=>{
  const ctx=boot({phone:''});
  assert.equal(ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh(),true);
  const notice=ctx.notice();assert.ok(notice);
  assert.equal(notice.attributes.role,'status');
  assert.match(notice.children[1].textContent,/aunque no tengas teléfono registrado/);
  assert.equal(ctx.calls.updates,0);
  assert.equal(ctx.CX.session.role,'shopper');
  notice.children[2].children[1].click(); // Ahora no
  assert.equal(ctx.notice(),null);
  assert.equal(ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh(),false);
});

test('perfil con teléfono también recibe aviso y CTA reutiliza el formulario ACK existente',()=>{
  const ctx=boot({phone:'+502 5555 5555'});
  ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh();
  const notice=ctx.notice();assert.ok(notice);
  notice.children[2].children[0].click(); // Revisar mis datos
  ctx.flush();
  assert.equal(ctx.notice(),null);
  assert.deepEqual(ctx.calls.nav,['miperfil']);
  assert.equal(ctx.calls.edit,1);
  assert.equal(ctx.calls.updates,0,'El aviso no crea ni modifica un shopper');
  assert.match(source,/const result=await data\.updateShopper\(shopperKey,patch\)/);
  assert.match(source,/if\(!commandOk\(result\)\)throw new Error/);
});

test('no se muestra aviso para administración, identidad sin autoridad o sesión no autenticada',()=>{
  for(const options of [{role:'admin'},{authorityReady:false},{authenticated:false}]){
    const ctx=boot(options);
    assert.equal(ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh(),false);
    assert.equal(ctx.notice(),null);
  }
});

test('evento de fuente sincronizada no duplica aviso ni realiza mutaciones',()=>{
  const ctx=boot();
  ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh();
  for(const fn of ctx.events['cx:protected-auth-hr-authority-ready']||[])fn();
  for(const fn of ctx.events['cx:live-source-updated']||[])fn();
  ctx.flush();
  assert.equal(ctx.host.children.length,1);
  assert.equal(ctx.calls.updates,0);
});

test('logout y siguiente ingreso en la misma SPA vuelven a pedir actualización si el perfil sigue sin actualizar',()=>{
  const ctx=boot({phone:''});
  for(const fn of ctx.events.DOMContentLoaded||[])fn();
  ctx.flush();
  assert.ok(ctx.notice());
  ctx.notice().children[2].children[1].click(); // posponer
  assert.equal(ctx.notice(),null);
  ctx.CX.app.logout();
  assert.equal(ctx.calls.logout,1);
  ctx.CX.session.role='shopper';
  assert.equal(ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh(),true);
  assert.ok(ctx.notice(), 'Misma identidad sin actualizar vuelve a recibir aviso tras login');
  assert.equal(ctx.calls.updates,0);
});

test('ACK de actualización propia evita repetir aviso en el mismo runtime tras siguiente login',()=>{
  const ctx=boot({phone:''});
  for(const fn of ctx.events.DOMContentLoaded||[])fn();ctx.flush();
  assert.ok(ctx.notice());
  ctx.busHandlers['command-committed']({ok:true,status:'committed',providerAck:true,successUiAllowed:true,
    commandType:'shopper.update',entityId:'shopper_gt_exact'});
  assert.equal(ctx.notice(),null);
  ctx.CX.app.logout();ctx.CX.session.role='shopper';
  assert.equal(ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh(),false);
  assert.equal(ctx.notice(),null);
});

test('bloqueo de autoridad reinicia el aviso; refrescos normales no lo duplican',()=>{
  const ctx=boot({phone:''});
  ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh();
  ctx.notice().children[2].children[1].click(); // Ahora no
  for(const fn of ctx.events['cx:live-source-updated']||[])fn();ctx.flush();
  assert.equal(ctx.notice(),null,'Un refresco normal no duplica el aviso pospuesto');
  for(const fn of ctx.events['cx:protected-auth-hr-authority-blocked']||[])fn();
  assert.equal(ctx.window.CX_SHOPPER_FIRST_LOGIN_PROFILE_REVIEW.refresh(),true);
  assert.ok(ctx.notice());
  assert.equal(ctx.calls.updates,0);
});
