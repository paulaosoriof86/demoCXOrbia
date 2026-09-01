#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';

const sourcePath='app/adapters/tya-ab-cumulative-composition-v1.js';
const source=fs.readFileSync(sourcePath,'utf8');
const events={};
const bus={
  on:(name,fn)=>{(events[name]??=[]).push(fn);},
  emit:name=>{for(const fn of events[name]||[])fn();}
};
const CX={
  BACKEND:{tenantId:'tya'},
  bus,
  data:{
    currentProjectId:'cinepolis',
    currentPeriodId:'cinepolis-2026-07',
    clients:[
      {id:'cl-cinepolis',name:'Cinépolis',contactos:[{nombre:'Contacto Principal',email:'contacto@cinepolis.com'}]},
      {id:'cl-prospecto-norte',name:'Prospecto Cadena Norte',contactos:[]},
      {id:'cl-real',name:'Cliente real',contactos:[{nombre:'Persona real',email:'real@example.com',sourceRef:'crm:1'}]}
    ],
    ctx(){return {tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-07'};},
    project(){return {id:'cinepolis',modelo:'delegado',billingModel:'delegated_coordination',localBilling:false,regalias:0,honorario:{GT:60,HN:200},financialConfigurationSource:'exact_tenant_project_registry'};},
    period(){return {id:'cinepolis-2026-07',periodKey:'2026-07'};}
  }
};
CX.crmStore={
  _l:null,_cuentas:null,_contactos:null,
  seed(){return [{id:'op1',empresa:'Fixture'}];},
  cuentasSeed(){return [{id:'ac1',nombre:'Fixture'}];},
  contactosSeed(){return [{id:'ct1',nombre:'Fixture'}];},
  list(){if(!this._l)this._l=this.seed();return this._l;},
  cuentas(){if(!this._cuentas)this._cuentas=this.cuentasSeed();return this._cuentas;},
  contactos(){if(!this._contactos)this._contactos=this.contactosSeed();return this._contactos;},
  add(value){this.list().push({...value,id:value.id||'new'});return value;},
  addCuenta(value){this.cuentas().push({...value,id:value.id||'new-account'});return value;},
  addContacto(value){this.contactos().push({...value,id:value.id||'new-contact'});return value;}
};
CX.mktStore={
  _p:null,_month:'2026-06',
  seed(){return [{id:'m1',titulo:'Fixture'}];},
  list(){if(!this._p)this._p=this.seed();return this._p;},
  add(value){this.list().unshift({...value,id:value.id||'new-marketing'});return value;}
};
const document={addEventListener:(name,fn)=>{(events[`document:${name}`]??=[]).push(fn);}};
const window={
  CX,
  CX_DEV_ENTRY_CANONICAL:{lane:'authenticated-human-canonical'},
  addEventListener:(name,fn)=>{(events[`window:${name}`]??=[]).push(fn);}
};
const context={window,CX,document,location:{search:''},URLSearchParams,console,Date,Set,Array,Object,String,RegExp};
vm.createContext(context);
vm.runInContext(source,context,{filename:sourcePath});

const checks=[];
const check=(condition,id,detail)=>{
  if(!condition)throw new Error(`${id}:${detail}`);
  checks.push(`${id}:${detail}`);
};
check(CX.data.clients.length===2,'CLIENT_FIXTURE_REMOVED','2 visible clients');
check(!CX.data.clients.some(x=>x.id==='cl-prospecto-norte'),'CLIENT_SYNTHETIC_ID_REMOVED','cl-prospecto-norte');
check(CX.data.clients.find(x=>x.id==='cl-cinepolis').contactos.length===0,'PLACEHOLDER_CONTACT_REMOVED','generated contact');
check(CX.data.clients.find(x=>x.id==='cl-real').contactos.length===1,'REAL_CONTACT_PRESERVED','sourceRef contact');
check(CX.crmStore.list().length===0,'CRM_FIXTURES_HIDDEN','connected lane');
check(CX.crmStore.cuentas().length===0,'CRM_ACCOUNT_FIXTURES_HIDDEN','connected lane');
check(CX.crmStore.contactos().length===0,'CRM_CONTACT_FIXTURES_HIDDEN','connected lane');
CX.crmStore.add({empresa:'Lead real'});
CX.crmStore.addCuenta({nombre:'Cuenta real'});
CX.crmStore.addContacto({nombre:'Contacto real'});
check(CX.crmStore.list().length===1,'CRM_USER_RECORD_MUTABLE','lead');
check(CX.crmStore.cuentas().length===1,'CRM_ACCOUNT_MUTABLE','account');
check(CX.crmStore.contactos().length===1,'CRM_CONTACT_MUTABLE','contact');
check(CX.crmStore.list()[0].dataOrigin==='platform_user','CRM_PROVENANCE','platform_user');
check(CX.mktStore.list().length===0,'MARKETING_FIXTURES_HIDDEN','connected lane');
CX.mktStore.add({titulo:'Pieza real'});
check(CX.mktStore.list().length===1,'MARKETING_USER_RECORD_MUTABLE','content');
check(CX.mktStore.list()[0].dataOrigin==='platform_user','MARKETING_PROVENANCE','platform_user');
check(CX.mktStore._month==='2026-07','MARKETING_PERIOD_CONTEXT','2026-07');
check(window.CX_TYA_AB_COMPOSITION?.ready===true,'COMPOSITION_READY','true');
check(window.CX_TYA_AB_COMPOSITION?.providerWrites===0,'PROVIDER_WRITES','0');
check(window.CX_TYA_AB_COMPOSITION?.production===false,'PRODUCTION','false');
check(window.CX_TYA_AB_COMPOSITION?.finance?.model==='delegado','FINANCIAL_MODEL','delegado');
check(window.CX_TYA_AB_COMPOSITION?.finance?.localBilling===false,'LOCAL_BILLING','false');
check(window.CX_TYA_AB_COMPOSITION?.finance?.royalty===0,'ROYALTY','0');
check(window.CX_TYA_AB_COMPOSITION?.finance?.honorarium?.GT===60,'HONORARIUM_GT','60');
check(window.CX_TYA_AB_COMPOSITION?.finance?.honorarium?.HN===200,'HONORARIUM_HN','200');

console.log(JSON.stringify({
  schema:'cxorbia.tya.ab-composition-unit.v1',
  status:'PASS',
  checks,
  composition:window.CX_TYA_AB_COMPOSITION,
  safeState:{providerWrites:0,deploy:0,merge:false,production:false}
},null,2));
