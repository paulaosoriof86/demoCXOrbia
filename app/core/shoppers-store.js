/* ============================================================
   CXOrbia · Shoppers store
   ------------------------------------------------------------
   Demo/lab compatibility only for local shopper persistence.
   In the canonical/backend runtime this file exposes read helpers but never hydrates,
   mutates or persists shopper truth in localStorage; the final mutation owner is the
   canonical CX.data command boundary loaded later in the entrypoint.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const D=CX.data;if(!D)return;
  const LS_ADDED='cx_shoppers';
  const LS_PATCH='cx_shopper_patches';
  const canonical=window.CX_DEV_ENTRY_CANONICAL?.canonical===true;
  const localPersistenceAllowed=!canonical;
  const SEED_IDS=new Set(D.shoppers.map(s=>s.id));
  function load(k){if(!localPersistenceAllowed)return null;try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
  function save(k,v){if(!localPersistenceAllowed)return false;try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
  function norm(s){
    if(!s.firstName&&!s.lastName){const parts=(s.nombre||'').trim().split(/\s+/);s.firstName=parts[0]||'';s.lastName=parts.slice(1).join(' ')||'';}
    const full=(s.firstName+' '+s.lastName).trim();if(full)s.nombre=full;
    s.whatsapp=s.whatsapp||s.phone||'';if(!s.phone)s.phone=s.whatsapp;
    if(s.perfilCompleto===undefined)s.perfilCompleto=true;
    if(!s.createdVia)s.createdVia='seed';
    return s;
  }
  D.shoppers.forEach(norm);
  const patches=load(LS_PATCH)||{};
  if(localPersistenceAllowed){
    D.shoppers.forEach(s=>{if(patches[s.id])Object.assign(s,patches[s.id]);norm(s);});
    (load(LS_ADDED)||[]).forEach(s=>{if(!D.shoppers.some(x=>x.id===s.id))D.shoppers.push(norm(s));});
  }
  function nextCode(){let max=0;D.shoppers.forEach(s=>{const m=/EVL-(\d+)/.exec(s.code||'');if(m)max=Math.max(max,+m[1]);});return'EVL-'+String(max+1).padStart(2,'0');}
  function persist(){if(!localPersistenceAllowed)return false;const added=D.shoppers.filter(s=>!SEED_IDS.has(s.id));save(LS_ADDED,added);save(LS_PATCH,patches);return true;}
  function localBlocked(action){
    const result={ok:false,status:'blocked',code:'CANONICAL_SHOPPER_LOCAL_PERSISTENCE_DISABLED',action,localMutation:false,localStorageWrite:false,successUiAllowed:false,reason:'El runtime canónico no permite persistencia Shopper en localStorage.'};
    try{CX.bus?.emit?.('backend-write-blocked',result);}catch(_){}
    return result;
  }

  D.getShopper=function(id){return this.shoppers.find(s=>s.id===id)||null;};

  /* Legacy mutators remain ONLY so the explicit demo can keep its historical behavior.
     Canonical/backend runtime fails closed here; cxorbia-cxdata-command-boundary-v1.js
     replaces these methods before human interaction. */
  D.addShopper=function(cfg={}){
    if(!localPersistenceAllowed)return localBlocked('addShopper');
    const id=cfg.id||('sh-'+Date.now().toString(36)+Math.floor(Math.random()*900+100));
    const firstName=(cfg.firstName||'').trim(),lastName=(cfg.lastName||'').trim(),nombre=(firstName+' '+lastName).trim()||cfg.nombre||'Evaluador nuevo',via=cfg.via||'manual';
    const completo=cfg.perfilCompleto!==undefined?cfg.perfilCompleto:!!(firstName&&lastName&&(cfg.whatsapp||cfg.phone)&&cfg.pais&&cfg.ciudad&&cfg.email&&cfg.edad&&cfg.sexo);
    const s=norm(Object.assign({id,code:cfg.code||nextCode(),firstName,lastName,nombre,pais:cfg.pais||'',depto:cfg.depto||'',ciudad:cfg.ciudad||'',email:cfg.email||'',whatsapp:cfg.whatsapp||cfg.phone||'',edad:cfg.edad||'',sexo:cfg.sexo||'',dpi:cfg.dpi||'',cuentaPago:cfg.cuentaPago||'',user:cfg.user||CX.CREDS.user(firstName,lastName),pass:cfg.pass||CX.CREDS.pass(firstName,lastName),estado:cfg.estado||'Pendiente',perfilCompleto:completo,createdVia:via,rating:cfg.rating||0,visitas:0,postulaciones:0,promCuest:0,certs:0,honorarioPref:cfg.honorarioPref||'Estándar',createdAt:Date.now()},cfg,{id,firstName,lastName,nombre,createdVia:via,perfilCompleto:completo}));
    this.shoppers.push(s);persist();CX.bus&&CX.bus.emit('shoppers');return s;
  };
  D.updateShopper=function(id,patch={}){
    if(!localPersistenceAllowed)return localBlocked('updateShopper');
    const s=this.getShopper(id);if(!s)return null;Object.assign(s,patch);
    if('firstName'in patch||'lastName'in patch){s.nombre=((s.firstName||'')+' '+(s.lastName||'')).trim();if(patch.regenCreds){s.user=CX.CREDS.user(s.firstName,s.lastName);s.pass=CX.CREDS.pass(s.firstName,s.lastName);}}
    norm(s);if(SEED_IDS.has(id))patches[id]=Object.assign(patches[id]||{},patch,{firstName:s.firstName,lastName:s.lastName,nombre:s.nombre,perfilCompleto:s.perfilCompleto});persist();
    if(!patch._silent){const campos=Object.keys(patch).filter(k=>!['_silent','regenCreds','perfilCompleto'].includes(k));const banca=campos.some(k=>['banco','ctaTipo','ctaNum','ctaTitular','ctaMoneda','cuentaPago'].includes(k));if(campos.length){CX.notif&&CX.notif.push({to:'admin',tipo:'shopper-edit',icon:banca?'🏦':'✏️',tono:banca?'a':'b',titulo:banca?'Datos bancarios actualizados':'Datos de shopper actualizados',txt:s.nombre+' · '+campos.slice(0,4).join(', '),nav:'shoppers'});CX.automations&&CX.automations.fire('shopper_edit',{shopper:s.nombre,campos:campos.join(', ')});}}
    CX.bus&&CX.bus.emit('shoppers');return s;
  };

  D.shopperProfileComplete=function(s){return!!(s.firstName&&s.lastName&&s.whatsapp&&s.pais&&s.ciudad&&s.email&&s.edad&&s.sexo);};
  D.visitsForShopper=function(id,onlyCurrentProject){return this._visitas.filter(v=>v.shopperId===id&&(!onlyCurrentProject||v.projectId===this.currentPeriodId));};
  D.postsForShopper=function(id){return this._posts.filter(p=>p.shopperId===id);};
  D.shopperStats=function(id){
    const vs=this.visitsForShopper(id),done=vs.filter(v=>['realizada','cuestionario','liquidada'].includes(v.estado)),liq=vs.filter(v=>v.estado==='liquidada'),s=this.getShopper(id)||{};
    return{total:vs.length,realizadas:done.length,liquidadas:liq.length,enCurso:vs.filter(v=>['asignada','agendada','postulada'].includes(v.estado)).length,postulaciones:this.postsForShopper(id).length||s.postulaciones||0};
  };
  D.__shopperStore={mode:localPersistenceAllowed?'explicit-demo-local':'canonical-provider-only',localHydration:localPersistenceAllowed,localPersistence:localPersistenceAllowed,canonical};
})();
