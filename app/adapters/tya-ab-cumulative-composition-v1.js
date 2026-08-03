/* CXOrbia TyA — candidata acumulativa A+B · composition guard v1.
   Alcance: shell/runtime + CRM Ops Leads, Dashboard y Hojas de Ruta.

   Reglas:
   - conserva los módulos frontend aprobados/preservados; no los reescribe;
   - la HR viva y los adapters canónicos siguen siendo la autoridad operacional;
   - en el carril conectado elimina únicamente fixtures/simulaciones identificables
     de CRM, Clientes y Marketing;
   - no borra localStorage, no escribe proveedores y no activa Make/Gemini/pagos;
   - registra evidencia reproducible para gates y Checkpoint Visual 1.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};

  const params=new URLSearchParams(location.search||'');
  const canonicalLane=()=>{
    const dev=window.CX_DEV_ENTRY_CANONICAL||{};
    return dev.lane==='authenticated-human-canonical'
      || (params.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV'
        && params.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV');
  };
  if(!canonicalLane())return;

  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  const lower=v=>str(v).toLowerCase();
  const explicitSources=new Set([
    'backend','firestore','canonical','canonical_source_safe','hr','hr_live',
    'imported','platform','platform_user','user_created','project_configuration'
  ]);
  const sourceOf=o=>lower(o&&(o.dataOrigin||o.sourceType||o.source||o.origen));
  const hasExplicitProvenance=o=>!!(o&&(o.sourceRef||o.createdByUser===true||o.platformCreated===true
    ||explicitSources.has(sourceOf(o))));
  const projectClientIds=()=>new Set(arr(CX.data&&CX.data.clients).map(c=>str(c.id)).filter(Boolean));

  function sanitizeClients(){
    if(!CX.data||!Array.isArray(CX.data.clients))return {removedClients:0,removedContacts:0};
    const syntheticIds=new Set(['cl-prospecto-norte','cl-prospecto-salud']);
    const before=CX.data.clients.length;
    let removedContacts=0;
    CX.data.clients=CX.data.clients.filter(c=>!syntheticIds.has(str(c&&c.id)));
    CX.data.clients.forEach(c=>{
      if(!Array.isArray(c.contactos))return;
      const initial=c.contactos.length;
      c.contactos=c.contactos.filter(ct=>{
        const generatedName=lower(ct&&ct.nombre)==='contacto principal';
        const generatedEmail=/^contacto@[-a-z0-9]+\.com$/i.test(str(ct&&ct.email));
        return !(generatedName&&generatedEmail&&!hasExplicitProvenance(ct));
      });
      removedContacts+=initial-c.contactos.length;
      c.dataOrigin=c.dataOrigin||'project_configuration';
    });
    return {removedClients:before-CX.data.clients.length,removedContacts};
  }

  function sanitizeCrm(){
    const s=CX.crmStore;
    if(!s)return {wrapped:false,visibleLeads:0,visibleAccounts:0,visibleContacts:0};
    if(!s.__abCompositionOriginals){
      s.__abCompositionOriginals={
        seed:s.seed&&s.seed.bind(s),
        cuentasSeed:s.cuentasSeed&&s.cuentasSeed.bind(s),
        contactosSeed:s.contactosSeed&&s.contactosSeed.bind(s),
        list:s.list&&s.list.bind(s),
        cuentas:s.cuentas&&s.cuentas.bind(s),
        contactos:s.contactos&&s.contactos.bind(s),
        add:s.add&&s.add.bind(s),
        addCuenta:s.addCuenta&&s.addCuenta.bind(s),
        addContacto:s.addContacto&&s.addContacto.bind(s)
      };
      const o=s.__abCompositionOriginals;
      s.seed=()=>[];
      s.cuentasSeed=()=>[];
      s.contactosSeed=()=>[];
      const visible=x=>hasExplicitProvenance(x)||projectClientIds().has(str(x&&x.clientId));
      s.list=function(){return arr(o.list?o.list():[]).filter(visible);};
      s.cuentas=function(){return arr(o.cuentas?o.cuentas():[]).filter(visible);};
      s.contactos=function(){return arr(o.contactos?o.contactos():[]).filter(visible);};
      if(o.add)s.add=function(v){return o.add(Object.assign({dataOrigin:'platform_user',createdByUser:true},v||{}));};
      if(o.addCuenta)s.addCuenta=function(v){return o.addCuenta(Object.assign({dataOrigin:'platform_user',createdByUser:true},v||{}));};
      if(o.addContacto)s.addContacto=function(v){return o.addContacto(Object.assign({dataOrigin:'platform_user',createdByUser:true},v||{}));};
      s._l=null;s._cuentas=null;s._contactos=null;
      s.__abCompositionWrapped=true;
    }
    return {
      wrapped:true,
      visibleLeads:arr(s.list&&s.list()).length,
      visibleAccounts:arr(s.cuentas&&s.cuentas()).length,
      visibleContacts:arr(s.contactos&&s.contactos()).length
    };
  }

  function sanitizeMarketing(){
    const s=CX.mktStore;
    if(!s)return {wrapped:false,visibleItems:0};
    if(!s.__abCompositionOriginals){
      s.__abCompositionOriginals={
        seed:s.seed&&s.seed.bind(s),
        list:s.list&&s.list.bind(s),
        add:s.add&&s.add.bind(s)
      };
      const o=s.__abCompositionOriginals;
      s.seed=()=>[];
      s.list=function(){return arr(o.list?o.list():[]).filter(hasExplicitProvenance);};
      if(o.add)s.add=function(v){return o.add(Object.assign({dataOrigin:'platform_user',createdByUser:true},v||{}));};
      s._p=null;
      const period=str(CX.data&&CX.data.period&&CX.data.period()&&(
        CX.data.period().periodKey||CX.data.period().id
      )).replace(/^cinepolis-/,'');
      if(/^\d{4}-\d{2}$/.test(period))s._month=period;
      s.__abCompositionWrapped=true;
    }
    return {wrapped:true,visibleItems:arr(s.list&&s.list()).length,month:s._month||null};
  }

  function snapshot(reason){
    const clients=sanitizeClients();
    const crm=sanitizeCrm();
    const marketing=sanitizeMarketing();
    const ctx=CX.data&&typeof CX.data.ctx==='function'?CX.data.ctx():{};
    const project=CX.data&&typeof CX.data.project==='function'?CX.data.project():null;
    const period=CX.data&&typeof CX.data.period==='function'?CX.data.period():null;
    const finance=project?{
      model:project.modelo||project.projectModel||null,
      billingModel:project.billingModel||null,
      localBilling:project.localBilling,
      royalty:project.regalias,
      honorarium:project.honorario||{},
      source:project.financialConfigurationSource||null
    }:null;
    window.CX_TYA_AB_COMPOSITION={
      ready:true,
      version:'tya-ab-cumulative-composition-v1',
      reason:reason||'activate',
      lane:'authenticated-human-canonical',
      tenantId:ctx.tenantId||CX.BACKEND&&CX.BACKEND.tenantId||null,
      projectId:ctx.projectId||CX.data&&CX.data.currentProjectId||null,
      periodId:ctx.periodId||CX.data&&CX.data.currentPeriodId||null,
      projectRecordId:project&&project.id||null,
      periodRecordId:period&&period.id||null,
      hrAuthority:'live-all-detected-periods',
      modulePolicy:'preserve-approved-ui-compose-canonical-runtime',
      clients,crm,marketing,finance,
      fixtureAuthority:false,
      localStorageAuthority:false,
      makeEnabled:false,
      geminiEnabled:false,
      providerWrites:0,
      production:false,
      manifest:'docs/MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json',
      at:new Date().toISOString()
    };
    return window.CX_TYA_AB_COMPOSITION;
  }

  const activate=reason=>snapshot(reason);
  activate('script_load');
  document.addEventListener('DOMContentLoaded',()=>activate('dom_ready'),{once:true});
  window.addEventListener('cx:full-visual-ready',()=>activate('full_visual_ready'));
  window.addEventListener('cx:live-source-updated',()=>activate('live_source_updated'));
  window.addEventListener('cx:protected-auth-hr-authority-ready',()=>activate('protected_auth_hr_authority_ready'));
  if(CX.bus&&typeof CX.bus.on==='function'){
    CX.bus.on('backend-ready',()=>activate('backend_ready'));
    CX.bus.on('project',()=>activate('project_changed'));
  }
})();
