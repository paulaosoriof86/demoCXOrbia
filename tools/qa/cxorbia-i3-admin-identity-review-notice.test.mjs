import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const script=readFileSync(new URL('../../app/adapters/cxorbia-admin-identity-review-notice-v1.js',import.meta.url),'utf8');
const entry=readFileSync(new URL('../../app/index-backend-dev.html',import.meta.url),'utf8');

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.parent=null;this.id='';this.textContent='';this.style={};}
  setAttribute(name,value){this[name]=value;}
  addEventListener(name,fn){this.events[name]=fn;}
  append(...nodes){for(const child of nodes)this.appendChild(child);}
  appendChild(node){node.parent=this;this.children.push(node);}
  insertBefore(node,before){const at=this.children.indexOf(before);assert.notEqual(at,-1);node.parent=this;this.children.splice(at,0,node);}
  remove(){if(!this.parent)return;this.parent.children=this.parent.children.filter(child=>child!==this);this.parent=null;}
  click(){this.events.click?.();}
}

function fixture({role='admin',queue=[{shopperIds:['s1','s2'],status:'active'}],resolutions=[],rows=[],authority=true,permission=true}={}){
  const main=new Element('main'),view=new Element('div');view.id='view';main.appendChild(view);
  const visit=node=>[node,...node.children.flatMap(visit)];
  const document={
    readyState:'complete',createElement:tag=>new Element(tag),
    querySelector:selector=>selector==='#app .content'?main:null,
    getElementById:id=>visit(main).find(node=>node.id===id)||null,
  };
  let merges=0;
  const CX={
    app:{enter:()=>true},
    session:{role:role==='shopper'?'shopper':'admin',effectiveRole:()=>role},
    dataSource:{mode:'connected',status:'ready'},
    data:{__identityReviewQueue:queue,__identityReviewResolutions:resolutions,
      shoppersFor:()=>rows,getShopper:id=>rows.find(x=>x.id===id)||null,
      adjudicateShopperIdentity:()=>{merges++;throw new Error('PROHIBITED_AUTO_MERGE');}},
    MODULES:{shoppers:{roles:['admin']}},
    moduleEnabled:()=>true,roleCanAccess:()=>permission,moduleVisibleForProfile:()=>true,
    router:{nav:id=>{CX.visited=id;}},bus:{on:()=>{}},
  };
  const timers=[],listeners={};
  const window={CX,
    firebase:{auth:()=>({currentUser:{uid:'authorized-admin'}})},
    CX_PROTECTED_AUTH_HR_AUTHORITY:{applied:authority,actorUid:'authorized-admin'},
    addEventListener:(name,fn)=>{listeners[name]=fn;},
  };
  vm.runInNewContext(script,{window,document,setTimeout:fn=>{timers.push(fn);}},
    {filename:'cxorbia-admin-identity-review-notice-v1.js'});
  const flush=()=>{while(timers.length)timers.shift()();};
  flush();
  const banner=()=>document.getElementById('cxAdminIdentityReviewNotice');
  const allText=()=>banner()?visit(banner()).map(x=>x.textContent||'').join(' '):'';
  const button=text=>banner()&&visit(banner()).find(x=>x.tag==='button'&&x.textContent===text);
  return {CX,window,document,main,flush,banner,allText,button,merges:()=>merges,listeners};
}

test('Admin ve aviso de cola vigente sin nombres, IDs, cifras inventadas ni autofusión',()=>{
  const f=fixture();
  assert.ok(f.banner());
  assert.match(f.allText(),/Identidades de shoppers pendientes de confirmación/);
  assert.doesNotMatch(f.allText(),/s1|s2|363|204/);
  assert.equal(f.merges(),0);
  f.button('Revisar en Shoppers').click();
  assert.equal(f.CX.visited,'shoppers');
  assert.equal(f.banner(),null);
  assert.equal(f.merges(),0);
});

test('Operaciones recibe aviso; Shopper y Coordinación quedan fuera',()=>{
  assert.ok(fixture({role:'ops'}).banner());
  assert.equal(fixture({role:'shopper'}).banner(),null);
  assert.equal(fixture({role:'coordinador'}).banner(),null);
});

test('decisión durable Mantener separadas retira el aviso si ya no hay caso activo',()=>{
  const resolutions=[{status:'resolved_distinct',identityRemap:false,shopperIds:['s1','s2']}];
  assert.equal(fixture({resolutions}).banner(),null);
  assert.equal(fixture({queue:[]}).banner(),null);
  assert.ok(fixture({queue:[],rows:[{id:'s1',exactAliases:['s2']},{id:'s2'}]}).banner(),
    'La revisión por alias exacto que aparece en Shoppers también activa el aviso');
});

test('aviso espera autoridad protegida, respeta permisos y permite posponer hasta nueva entrada',()=>{
  const f=fixture({authority:false,permission:false});
  assert.equal(f.banner(),null);
  f.window.CX_PROTECTED_AUTH_HR_AUTHORITY.applied=true;
  f.listeners['cx:protected-auth-hr-authority-ready']();f.flush();
  assert.ok(f.banner());
  assert.equal(f.button('Revisar en Shoppers'),undefined);
  assert.match(f.allText(),/Solicita la revisión a Administración/);
  f.button('Ahora no').click();
  assert.equal(f.banner(),null);
  f.listeners['cx:live-source-updated']();f.flush();
  assert.equal(f.banner(),null);
  f.CX.app.enter();f.flush();
  assert.ok(f.banner());
});

test('entrypoint carga el aviso después de app.js y no altera la ruta Shopper',()=>{
  const app=entry.indexOf('<script src="app.js"></script>');
  const banner=entry.indexOf('<script src="adapters/cxorbia-admin-identity-review-notice-v1.js"></script>');
  assert.ok(app>=0&&banner>app);
  assert.doesNotMatch(script,/localStorage|sessionStorage|\.adjudicateShopperIdentity\(|\.resolveShopperIdentityReview\(/);
});
