import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';

// Execute the actual registration UI owner with a synthetic modal. No Firebase,
// Auth, Firestore, browser persistence or network writes are performed.
const source=readFileSync(new URL('../../app/app.js',import.meta.url),'utf8');
const start=source.indexOf('  showRegister(){');
const end=source.indexOf('\n  /* confirmación de registro',start);
assert.ok(start>=0&&end>start,'registro UI owner exists in canonical source');
const owner=source.slice(start,end);

function mount(create){
  const fields=Object.fromEntries(Object.entries({
    rgFirst:'Ana',rgLast:'Prueba',rgWa:'+502 5555 5555',rgMail:'',
    rgEdad:'23',rgSexo:'Femenino',rgCreds:'',rgSave:''
  }).map(([id,value])=>[id,{
    value,textContent:'Crear mi cuenta',disabled:false,innerHTML:'',handlers:{},
    addEventListener(name,fn){this.handlers[name]=fn;}
  }]));
  const ov={querySelector:selector=>fields[selector.replace(/^#/,'')]||null};
  const calls={close:0,registered:[],toast:[],create:[],modal:0};
  const CX={
    CREDS:{userExample:()=> 'nombre.apellido',user:(a,b)=>`${a}.${b}`.toLowerCase()},
    geo:{fieldsHTML:()=>'',wire:()=>{},read:()=>({pais:'GT',depto:'Guatemala',municipio:'Guatemala',ciudad:'Guatemala'})},
    ui:{toast:(...args)=>calls.toast.push(args),modal:(_title,_html,{onMount})=>{calls.modal++;onMount(ov,()=>calls.close++);}},
    data:{addShopper:cfg=>{calls.create.push(cfg);return create(cfg);},getShopper:()=>null}
  };
  const window={CX_SHOPPER_CREDENTIAL_RULE:{shopperCredentialRule:()=>({ok:true,login:'ana.prueba'})}};
  const app=vm.runInNewContext(`({${owner}})`,{CX,window},{filename:'app.js:showRegister'});
  app.afterRegister=profile=>calls.registered.push(profile);
  app.showRegister();
  return {calls,fields,click:()=>fields.rgSave.handlers.click()};
}

test('registro no anuncia cuenta ante rechazo del actor; conserva formulario y permite reintento',async()=>{
  const x=mount(async()=>({ok:false,status:'blocked',code:'SHOPPER_ACTOR_SCOPE_DENIED'}));
  await x.click();
  assert.equal(x.calls.create.length,1);
  assert.equal(x.calls.create[0].__commandMeta.ackAware,true);
  assert.equal(x.calls.close,0);
  assert.equal(x.calls.registered.length,0);
  assert.match(x.calls.toast.at(-1)[0],/no fue confirmado/i);
  assert.equal(x.fields.rgWa.value,'+502 5555 5555');
  assert.equal(x.fields.rgSave.disabled,false);
});

test('revisión de identidad nunca confirma ni duplica cuenta',async()=>{
  const x=mount(async()=>({ok:false,status:'blocked',code:'SHOPPER_CREATE_EXISTING_IDENTITY_REVIEW_REQUIRED'}));
  await x.click();
  assert.equal(x.calls.close,0);
  assert.equal(x.calls.registered.length,0);
  assert.match(x.calls.toast.at(-1)[0],/expediente existente/i);
});

test('ACK auténtico exige commandType, permiso UI y entityId durable antes de confirmar',async()=>{
  let release;
  const pending=new Promise(resolve=>{release=resolve;});
  const x=mount(()=>pending);
  const first=x.click();
  await x.click(); // Double click while the command remains pending.
  assert.equal(x.calls.create.length,1);
  assert.equal(x.fields.rgSave.disabled,true);
  assert.equal(x.calls.close,0);
  release({ok:true,status:'committed',providerAck:true,successUiAllowed:true,commandType:'shopper.create',entityId:''});
  await first;
  assert.equal(x.calls.close,0);
  assert.equal(x.calls.registered.length,0);
  assert.equal(x.fields.rgSave.disabled,false);
});

test('ACK válido confirma la identidad técnica real y conserva pantalla de bienvenida',async()=>{
  const x=mount(async()=>({ok:true,status:'committed',providerAck:true,successUiAllowed:true,commandType:'shopper.create',entityId:'shopper_manual_authorized'}));
  await x.click();
  assert.equal(x.calls.close,1);
  assert.equal(x.calls.registered.length,1);
  assert.equal(x.calls.registered[0].id,'shopper_manual_authorized');
  assert.equal(x.calls.registered[0].firstName,'Ana');
  assert.equal(x.calls.registered[0].user,'ana.prueba');
});

test('falla de red no cierra el formulario ni anuncia alta falsa',async()=>{
  const x=mount(async()=>{throw new Error('network down');});
  await x.click();
  assert.equal(x.calls.close,0);
  assert.equal(x.calls.registered.length,0);
  assert.match(x.calls.toast.at(-1)[0],/No se pudo confirmar/i);
  assert.equal(x.fields.rgSave.disabled,false);
});
