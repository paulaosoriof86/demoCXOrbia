/* ============================================================
   CXOrbia · Protected DEV runtime switch
   ------------------------------------------------------------
   Separate authenticated DEV lane for validating real Firestore
   identities/profile/history without weakening Auth/RBAC/Rules.
   Writes remain disabled.

   Corte 6 P0 bridge:
   - source-safe watcher must not own CX.data in this lane;
   - normalize existing protected profile aliases without inventing data;
   - derive shopper KPIs from canonical facets/history, not a narrow legacy
     list of presentation-state strings.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const params = new URLSearchParams(window.location.search || '');
  const TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  const protectedRuntime = params.get('cxProtectedRuntime') === TOKEN;
  if(!protectedRuntime) return;

  const cfg = CX.BACKEND = Object.assign(CX.BACKEND || {}, {
    enabled:true,
    previewMode:true,
    humanVisualSourceSafe:false,
    readOnly:true,
    writeMode:'disabled',
    enableDataWrites:false,
    enableOperationalWrites:false,
    allowEmptyBackend:false,
    failClosedOnReadError:true,
    preserveCxDataInterface:true,
    tenantId:'tya',
    defaultProjectId:params.get('cxProjectId') || 'cinepolis',
    previewProjectIds:[params.get('cxProjectId') || 'cinepolis'],
    canonicalBackendProjectId:'cxorbia-backend-dev',
    migrationTargetProjectId:'cxorbia-backend-dev',
    sandboxOnly:false,
    projectIdentityVerified:true,
    configSource:'firebase-hosting-protected-dev-runtime',
    devPreviewAuth:{
      enabled:true,
      mode:'integrated-product-login-protected-dev',
      persist:'session',
      storedCredentialFallback:false,
      requireCustomClaims:true,
      humanCredentialPrompt:true,
      allowTechnicalEmail:false
    }
  });

  if(CX.dataSource){
    CX.dataSource.mode='connected';
    CX.dataSource.status='loading';
    CX.dataSource.sourceRef='firebase:cxorbia-backend-dev:protected-readonly';
    CX.dataSource.updatedAt=new Date().toISOString();
    CX.dataSource.warnings=['DEV protegido: perfil real solo después de Firebase Auth/claims/Rules. Escrituras deshabilitadas.'];
    CX.dataSource.blockers=[];
  }

  function firstValue(obj, keys){
    for(const key of keys){
      const value=obj&&obj[key];
      if(value!==undefined&&value!==null&&String(value).trim()!=='') return value;
    }
    return '';
  }

  function bridgeProtectedProfiles(){
    if(!CX.data || !Array.isArray(CX.data.shoppers)) return;
    for(const s of CX.data.shoppers){
      if(!s || typeof s!=='object') continue;
      // Aliases only: no synthetic PII and no fallback from name/phone matching.
      s.whatsapp = firstValue(s,['whatsapp','wa','telefono','phone']);
      s.phone = firstValue(s,['phone','telefono','wa','whatsapp']);
      s.email = firstValue(s,['email','correo']);
      s.dpi = firstValue(s,['dpi','documentId','documento','idNumber']);
      s.banco = firstValue(s,['banco','bank']);
      s.ctaTipo = firstValue(s,['ctaTipo','accountType']);
      s.ctaNum = firstValue(s,['ctaNum','accountNumber']);
      s.ctaTitular = firstValue(s,['ctaTitular','accountHolder']);
      s.ctaMoneda = firstValue(s,['ctaMoneda','accountCurrency']);
      s.cuentaPago = firstValue(s,['cuentaPago']);
      s.edad = firstValue(s,['edad','age']);
      s.sexo = firstValue(s,['sexo','sex']);
      s.user = firstValue(s,['user','username','login']);
      s.username = firstValue(s,['username','user','login']);
      // Never synthesize or persist a password. Firebase Auth cannot read it back.
      if(!Object.prototype.hasOwnProperty.call(s,'pass')) s.pass='';
      s.__protectedProfileRuntime=true;
    }

    // Canonical history/KPIs. Existing UI calls these stable CX.data methods.
    CX.data.visitsForShopper=function(id,onlyCurrentProject){
      const all=Array.isArray(this._visitas)?this._visitas:[];
      return all.filter(v=>{
        if(!v||String(v.shopperId||'')!==String(id||'')) return false;
        if(!onlyCurrentProject) return true;
        const active=this.currentProjectId;
        return !active || v.projectId===active || v.rootProjectId===active;
      });
    };
    CX.data.shopperStats=function(id){
      const vs=this.visitsForShopper(id,false);
      const facet=(v,k)=>!!(v&&v.canonicalFacets&&v.canonicalFacets[k]===true);
      const state=v=>String(v&& (v.estado||v.status||v.presentationState) ||'').toLowerCase();
      const realized=v=>facet(v,'realized')||facet(v,'questionnaire')||facet(v,'submitted')||facet(v,'liquidationCandidate')||facet(v,'liquidationConfirmed')||facet(v,'paymentConfirmed')||['realizada','cuestionario','submitida','liquidada','pagada'].includes(state(v));
      const liquidated=v=>facet(v,'liquidationConfirmed')||facet(v,'paymentConfirmed')||['liquidada','pagada'].includes(state(v));
      const inCourse=v=>{
        if(facet(v,'assigned')&&!realized(v)) return true;
        return ['asignada','agendada','postulada','fuera_rango'].includes(state(v));
      };
      const s=this.getShopper?this.getShopper(id):null;
      const posts=this.postsForShopper?this.postsForShopper(id):[];
      return {
        total:vs.length,
        realizadas:vs.filter(realized).length,
        liquidadas:vs.filter(liquidated).length,
        enCurso:vs.filter(inCourse).length,
        postulaciones:(posts&&posts.length)||Number(s&&s.postulaciones||0),
        submitted:vs.filter(v=>facet(v,'submitted')||['submitida','liquidada','pagada'].includes(state(v))).length,
        paymentConfirmed:vs.filter(v=>facet(v,'paymentConfirmed')||state(v)==='pagada').length
      };
    };

    window.CX_PROTECTED_SHOPPER_PROFILE_BRIDGE={
      applied:true,
      shoppers:CX.data.shoppers.length,
      visits:Array.isArray(CX.data._visitas)?CX.data._visitas.length:0,
      passwordSynthesized:false,
      at:new Date().toISOString()
    };
  }

  if(CX.bus&&typeof CX.bus.on==='function') CX.bus.on('backend-ready',bridgeProtectedProfiles);

  window.CX_BACKEND_DATA_SOURCE='firestore-protected-pending';
  window.CX_BACKEND_LAST_STATE={
    source:'firestore-protected-pending', tenantId:cfg.tenantId, projectId:cfg.defaultProjectId,
    protectedRuntime:true, readOnly:true, writes:false, production:false, at:new Date().toISOString()
  };
  window.CX_PROTECTED_DEV_RUNTIME=true;
  window.CX_BACKEND_PREVIEW_LANE='protected-runtime';

  console.warn('[CX.backend-protected-dev] Authenticated Firestore DEV validation enabled; writes remain disabled.');
})();
