/* CXOrbia TyA Corte 6 — cumulative full-profile human visual bridge (DEV only).
   Contract:
   - human QA keeps prototype auto-entry; no Firebase browser credentials;
   - live HR remains the operational base and keeps auto-refresh/auto-month;
   - protected Firestore profile/history is an OVERLAY, never a replacement;
   - canonical finance/payment adapters remain untouched;
   - exact technical identity only: id/shopperId/legacyShopperId, never name/phone/email matching;
   - no provider writes. */
window.CX = window.CX || {};
(function(){
  const params=new URLSearchParams(window.location.search||'');
  const SELECTOR='YES_PAULA_20260731_FULL_PROFILE_DEV';
  if(params.get('cxHumanFullVisual')!==SELECTOR) return;
  if(params.get('cxProtectedRuntime')){
    console.error('[CX.full-visual] Carril inválido: human full visual no debe mezclarse con protected browser Auth.');
    return;
  }

  const TOKEN_KEY='CXORBIA_C6_FULL_VISUAL_TOKEN';
  const endpoint='/api/tya/cinepolis/hr-live';
  const safeArray=v=>Array.isArray(v)?v:[];
  const has=v=>v!==undefined&&v!==null&&String(v).trim()!=='';
  const firstValue=(obj,keys)=>{for(const key of keys){const v=obj&&obj[key];if(has(v))return v;}return '';};
  const lower=v=>String(v||'').trim().toLowerCase();
  const same=(a,b)=>String(a||'')!==''&&String(a||'')===String(b||'');
  const periodKeyOf=v=>String(v&&(v.periodKey||v.periodId||v.period||'')||'').replace(/^cinepolis[-:]{1,2}/,'');
  const nonEmptyPatch=(base,extra)=>{const out=Object.assign({},base||{});for(const [k,v] of Object.entries(extra||{})){if(v!==undefined&&v!==null&&(!(typeof v==='string')||v.trim()!==''))out[k]=v;}return out;};
  let protectedPayload=null;

  function takeTokenFromFragment(){
    let token='';
    try{
      const raw=String(window.location.hash||'').replace(/^#/,'');
      const hash=new URLSearchParams(raw);
      token=String(hash.get('cxVisualSession')||'').trim();
      if(token){sessionStorage.setItem(TOKEN_KEY,token);history.replaceState(null,'',window.location.pathname+window.location.search);}
    }catch(_){ }
    if(token)return token;
    try{return String(sessionStorage.getItem(TOKEN_KEY)||'').trim();}catch(_){return '';}
  }

  function normalizedName(s){
    const direct=firstValue(s,['nombre','displayName','display_name','fullName','shopperName','name']);
    if(has(direct))return String(direct).trim();
    const first=firstValue(s,['firstName','primerNombre','first_name']);
    const last=firstValue(s,['lastName','primerApellido','last_name']);
    return [first,last].filter(has).join(' ').trim();
  }

  function normalizeProfile(s){
    const id=firstValue(s,['shopperId','id']);
    const dept=firstValue(s,['depto','departamento','department']);
    const user=firstValue(s,['username','user','login']);
    const pass=firstValue(s,['pass','password']);
    return nonEmptyPatch(s,{
      id,shopperId:id,legacyShopperId:firstValue(s,['legacyShopperId']),
      nombre:normalizedName(s),
      pais:firstValue(s,['pais','country','countryCode']),
      ciudad:firstValue(s,['ciudad','city']),
      depto:dept,departamento:dept,
      whatsapp:firstValue(s,['whatsapp','wa','telefono','phone']),
      phone:firstValue(s,['phone','telefono','wa','whatsapp']),
      email:firstValue(s,['email','correo']),
      dpi:firstValue(s,['dpi','documentId','documento','idNumber']),
      direccion:firstValue(s,['direccion','address']),
      fecha_nac:firstValue(s,['fecha_nac','fechaNacimiento','birthDate']),
      edad:firstValue(s,['edad','age']),sexo:firstValue(s,['sexo','sex']),
      banco:firstValue(s,['banco','bank']),
      ctaTipo:firstValue(s,['ctaTipo','accountType']),
      ctaNum:firstValue(s,['ctaNum','accountNumber']),
      ctaTitular:firstValue(s,['ctaTitular','accountHolder']),
      ctaMoneda:firstValue(s,['ctaMoneda','accountCurrency']),
      cuentaPago:firstValue(s,['cuentaPago']),
      user,username:user,pass,
      sourceSafe:false,piiProtected:false,operationalProfileAvailable:true
    });
  }

  function knownFixture(s){
    const id=String(s&&s.id||'');
    const name=String(s&&s.nombre||'');
    const code=String(s&&s.code||'');
    const email=String(s&&s.email||'');
    return id==='sh_ref_protegida'||id==='sh_op_parcial'||(
      /^sh\d+$/i.test(id)&&/^Evaluador\s+\d+$/i.test(name)&&( /^EVL-\d+$/i.test(code)||/@demo\.cxorbia$/i.test(email) )
    );
  }

  function meaningfulProfile(s){
    if(!s||knownFixture(s))return false;
    const name=String(s.nombre||'').trim();
    const technicalOnly=/^shp-[a-f0-9]+$/i.test(name)||(!name&&/^shp-[a-f0-9]+$/i.test(String(s.id||'')));
    if(technicalOnly)return false;
    return !!(name||s.user||s.username||s.whatsapp||s.phone||s.email||s.dpi||s.legacyShopperId);
  }

  function mergeShoppers(baseRows,protectedRows){
    const base=safeArray(baseRows).map(s=>Object.assign({},s));
    const protectedProfiles=safeArray(protectedRows).map(normalizeProfile);
    const byId=new Map(),byLegacy=new Map();
    protectedProfiles.forEach(p=>{
      if(p.id)byId.set(String(p.id),p);
      if(p.legacyShopperId)byLegacy.set(String(p.legacyShopperId),p);
    });
    const consumed=new Set();
    const out=base.map(b=>{
      const bid=String(b&& (b.shopperId||b.id)||'');
      const bLegacy=String(b&&b.legacyShopperId||'');
      const p=byId.get(bid)||(bLegacy&&byLegacy.get(bLegacy))||byLegacy.get(bid)||null;
      if(!p)return b;
      consumed.add(String(p.id||''));
      const merged=nonEmptyPatch(b,p);
      // Identity stays on the canonical/live-HR row; legacy id is metadata, not a replacement key.
      merged.id=b.id||b.shopperId||p.id;
      merged.shopperId=merged.id;
      merged.nombre=normalizedName(p)||b.nombre||merged.nombre;
      merged.code=b.code||p.code||p.username||p.user||p.legacyShopperId||'';
      merged.sourceSafe=false;merged.piiProtected=false;merged.__fullProfileExactOverlay=true;
      try{if(CX.data&&typeof CX.data.shopperProfileComplete==='function')merged.perfilCompleto=CX.data.shopperProfileComplete(merged);}catch(_){ }
      return merged;
    });

    // If a legacy alias document id is already represented by another canonical profile's
    // exact legacyShopperId, do not expose the stale alias row as a second person.
    const canonicalLegacyIds=new Set(protectedProfiles.filter(p=>p.legacyShopperId&&p.id&&String(p.legacyShopperId)!==String(p.id)).map(p=>String(p.legacyShopperId)));
    for(const p of protectedProfiles){
      if(consumed.has(String(p.id||'')))continue;
      if(canonicalLegacyIds.has(String(p.id||'')))continue;
      if(!meaningfulProfile(p))continue;
      p.code=p.code||p.username||p.user||p.legacyShopperId||'';
      p.__fullProfilePlatformOnly=true;
      try{if(CX.data&&typeof CX.data.shopperProfileComplete==='function')p.perfilCompleto=CX.data.shopperProfileComplete(p);}catch(_){ }
      out.push(p);
    }
    return {rows:out,protectedProfiles,hiddenTechnical:protectedProfiles.length-out.filter(x=>x&&x.__fullProfilePlatformOnly).length-base.length};
  }

  function normalizeProtectedVisit(v){
    const key=periodKeyOf(v);
    return nonEmptyPatch(v,{
      id:v.id||v.visitId,visitId:v.visitId||v.id,rootProjectId:'cinepolis',periodKey:key||null,
      estado:v.estado||v.status||v.presentationState,status:v.status||v.estado||v.presentationState,
      shopperId:v.shopperId||null,shopper:v.shopper||v.shopperName||'',
      pais:v.pais||v.country||v.countryCode,country:v.country||v.pais||v.countryCode,
      sucursal:v.sucursal||v.branchName||v.branchId,ciudad:v.ciudad||v.city,
      sourceSafe:false,piiProtected:false
    });
  }

  function mergeVisits(baseRows,protectedRows){
    const protectedVisits=safeArray(protectedRows).map(normalizeProtectedVisit);
    const byId=new Map(protectedVisits.filter(v=>v.id).map(v=>[String(v.id),v]));
    const used=new Set();
    const out=safeArray(baseRows).map(base=>{
      const id=String(base&& (base.id||base.visitId)||'');
      const p=byId.get(id);if(!p)return base;
      used.add(id);
      const merged=nonEmptyPatch(base,p);
      // The live-HR period/project mapping owns UI navigation; protected history only enriches it.
      merged.id=base.id||base.visitId||p.id;
      merged.visitId=merged.id;
      merged.projectId=base.projectId||p.projectId;
      merged.periodId=base.periodId||base.projectId||p.periodId;
      merged.periodKey=base.periodKey||p.periodKey;
      merged.rootProjectId='cinepolis';
      merged.sourceTab=base.sourceTab||p.sourceTab;merged.sourceRow=base.sourceRow||p.sourceRow;merged.hrRowId=base.hrRowId||p.hrRowId;
      merged.sourceSafe=false;merged.piiProtected=false;merged.__canonicalHistoryOverlay=true;
      return merged;
    });
    // Only append a provider visit when it has an explicit periodKey. Never fabricate a period.
    for(const p of protectedVisits){
      if(!p.id||used.has(String(p.id))||!p.periodKey)continue;
      const period=(CX.data&&safeArray(CX.data.projects).find(x=>String(x.periodKey||'')===String(p.periodKey)))||null;
      if(!period)continue;
      p.projectId=period.id;p.periodId=period.id;p.rootProjectId='cinepolis';p.__canonicalHistoryOverlay=true;
      out.push(p);
    }
    return out;
  }

  function mapPost(p,visitsById){
    const visitId=p.visitId||p.visitaId||'';
    const visit=visitsById.get(String(visitId))||{};
    return nonEmptyPatch(p,{
      id:p.id||p.applicationId||p.postulationId||[visitId,p.shopperId].filter(Boolean).join('-'),
      visitId,visitaId:visitId,rootProjectId:'cinepolis',projectId:visit.projectId||p.projectId,
      periodKey:periodKeyOf(p)||periodKeyOf(visit)||null,
      estado:p.estado||p.status,status:p.status||p.estado,shopperId:p.shopperId||null,shopper:p.shopper||'',
      sourceSafe:false,piiProtected:false
    });
  }

  function mergePosts(baseRows,payload,visits){
    const byId=new Map(safeArray(baseRows).filter(p=>p&&p.id).map(p=>[String(p.id),Object.assign({},p)]));
    const visitsById=new Map(safeArray(visits).filter(v=>v&&v.id).map(v=>[String(v.id),v]));
    for(const raw of safeArray(payload.postulations).concat(safeArray(payload.applications))){
      const p=mapPost(raw,visitsById);if(!p.id)continue;
      const old=byId.get(String(p.id));byId.set(String(p.id),old?nonEmptyPatch(old,p):p);
    }
    return [...byId.values()];
  }

  function realized(v){
    const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));
    return f.realized===true||f.questionnaire===true||f.submitted===true||f.liquidationCandidate===true||f.liquidationConfirmed===true||f.paymentConfirmed===true||['realizada','cuestionario','submitida','liquidada','pagada'].includes(st);
  }
  function liquidated(v){const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));return f.liquidationConfirmed===true||f.paymentConfirmed===true||['liquidada','pagada'].includes(st);}
  function inCourse(v){const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));return (f.assigned===true&&!realized(v))||['asignada','agendada','postulada','fuera_rango'].includes(st);}

  function installHistoryMethods(posts){
    CX.data.visitsForShopper=function(id,onlyCurrentProject){
      return safeArray(this._visitas).filter(v=>{
        if(!same(v&&v.shopperId,id))return false;
        if(!onlyCurrentProject)return true;
        const active=this.currentProjectId;
        return !active||v.rootProjectId===active||v.projectId===active||String(v.projectId||'').startsWith(active+'-')||String(v.projectId||'').startsWith(active+'::');
      });
    };
    CX.data.shopperStats=function(id){
      const vs=this.visitsForShopper(id,false);
      const s=this.getShopper?this.getShopper(id):null;
      const ownPosts=this.postsForShopper?this.postsForShopper(id):posts.filter(p=>same(p.shopperId,id));
      const submitted=v=>{const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));return f.submitted===true||['submitida','liquidada','pagada'].includes(st);};
      return {total:vs.length,realizadas:vs.filter(realized).length,liquidadas:vs.filter(liquidated).length,enCurso:vs.filter(inCourse).length,postulaciones:(ownPosts&&ownPosts.length)||Number(s&&s.postulaciones||0),submitted:vs.filter(submitted).length,paymentConfirmed:vs.filter(v=>(v.canonicalFacets&&v.canonicalFacets.paymentConfirmed===true)||lower(v&&(v.estado||v.status))==='pagada').length};
    };
  }

  function applyPayload(payload,reason){
    if(!payload||payload.ok!==true||payload.schemaVersion!=='cxorbia.corte6.dev-full-visual-snapshot.v1'||!CX.data)throw new Error('FULL_VISUAL_PAYLOAD_INVALID');
    protectedPayload=payload;

    const baseShoppers=safeArray(CX.data.shoppers);
    const shopperMerge=mergeShoppers(baseShoppers,payload.shoppers);
    const visits=mergeVisits(CX.data._visitas,payload.visits);
    const posts=mergePosts(CX.data._posts,payload,visits);

    CX.data.shoppers=shopperMerge.rows;
    CX.data._visitas=visits;
    CX.data._posts=posts;
    // Keep approved financial truth and benefits wiring intact. Provider collections are evidence only here.
    CX.data.__protectedCertifications=safeArray(payload.certifications);
    CX.data.__protectedLiquidations=safeArray(payload.liquidations);
    if(!Array.isArray(CX.data.certifications)||!CX.data.certifications.length)CX.data.certifications=safeArray(payload.certifications);
    CX.data.currentProjectId='cinepolis';
    CX.data.sourceMode='tya_hr_live_plus_firestore_full_profile_dev';
    CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{}, {
      tenantId:'tya',projectId:'cinepolis',source:'hr-live+firestore-server-side-dev-visual+canonical-finance',
      fullProfileVisual:true,cumulativeVisual:true,browserFirebaseCredentialsRequired:false,serverSideTechnicalIdentity:true,
      piiProtected:false,readOnly:true,production:false,runtimeReadActive:true,
      shoppers:CX.data.shoppers.length,visits:visits.length,postulations:posts.length,
      protectedProfileDocs:safeArray(payload.shoppers).length,protectedCertifications:safeArray(payload.certifications).length,
      protectedLiquidations:safeArray(payload.liquidations).length,generatedAt:payload.generatedAt||new Date().toISOString(),
      note:'Visual DEV acumulativa: HR viva conserva periodos/visitas y auto-refresh; Firestore agrega perfil/histórico; finanzas/pagos canónicos aprobados permanecen intactos.'
    });

    installHistoryMethods(posts);
    CX.tenantProfile=Object.assign({},CX.tenantProfile||{}, {devShopperAccess:true,devHostAllowlist:Array.from(new Set([...(CX.tenantProfile&&CX.tenantProfile.devHostAllowlist||[]),'cxorbia-backend-dev.web.app','cxorbia-backend-dev.firebaseapp.com']))});
    if(CX.dataSource){
      CX.dataSource.mode='connected';CX.dataSource.status='ready';CX.dataSource.sourceRef='hr-live+firestore-full-profile+canonical-finance';
      CX.dataSource.updatedAt=payload.generatedAt||new Date().toISOString();CX.dataSource.runtimeReadActive=true;CX.dataSource.runtimeSyncActive=false;CX.dataSource.updating=false;
      CX.dataSource.warnings=[];CX.dataSource.blockers=[];
    }
    const activeVisits=typeof CX.data.visitas==='function'?CX.data.visitas().length:0;
    window.CX_TYA_FULL_VISUAL_READY=true;
    window.CX_TYA_FULL_VISUAL_CONTRACT={tenantId:'tya',projectId:'cinepolis',periods:safeArray(CX.data.projects).length,currentPeriodId:CX.data.currentPeriodId,activePeriodVisits:activeVisits,shoppers:CX.data.shoppers.length,protectedProfileDocs:safeArray(payload.shoppers).length,visits:visits.length,posts:posts.length,certifications:safeArray(payload.certifications).length,liquidations:safeArray(payload.liquidations).length,hrLivePreserved:true,canonicalFinancePreserved:!!window.CX_TYA_FINANCIAL_CANONICAL_READY,browserFirebaseCredentialsRequired:false,providerWrites:0,production:false,reason:reason||'full_visual_overlay'};
    try{window.dispatchEvent(new CustomEvent('cx:full-visual-ready',{detail:window.CX_TYA_FULL_VISUAL_CONTRACT}));}catch(_){ }
  }

  function reapply(reason){
    if(!protectedPayload||!CX.data)return false;
    applyPayload(protectedPayload,reason||'hr_live_reapply');
    return true;
  }

  async function load(){
    const token=takeTokenFromFragment();
    window.CX_TYA_FULL_VISUAL_REQUESTED=true;
    CX.tenantProfile=Object.assign({},CX.tenantProfile||{}, {devShopperAccess:true,devHostAllowlist:['cxorbia-backend-dev.web.app','cxorbia-backend-dev.firebaseapp.com']});
    if(!token){if(CX.dataSource){CX.dataSource.status='blocked';CX.dataSource.blockers=['Sesión visual DEV no disponible. Usa el enlace temporal generado para esta validación.'];}return;}
    try{
      if(CX.dataSource){CX.dataSource.status='loading';CX.dataSource.warnings=['Cargando perfil completo DEV sobre HR viva…'];}
      const q=new URLSearchParams({view:'full-profile',scope:'admin',ts:String(Date.now())});
      const response=await fetch(endpoint+'?'+q.toString(),{cache:'no-store',headers:{Authorization:'Bearer '+token,'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
      const payload=await response.json().catch(()=>null);
      if(!response.ok)throw new Error('HTTP '+response.status+(payload&&payload.error?': '+payload.error:''));
      applyPayload(payload,'initial_protected_overlay');
      if(typeof window.CX_TYA_CHECK_LIVE_SOURCE==='function')setTimeout(()=>window.CX_TYA_CHECK_LIVE_SOURCE('full_visual_initial_hr_refresh'),50);
      if(CX.ui&&CX.ui.toast)CX.ui.toast('HR viva + perfil completo DEV cargados','');
    }catch(error){
      console.error('[CX.full-visual]',error);
      if(CX.dataSource){CX.dataSource.status='blocked';CX.dataSource.warnings=[];CX.dataSource.blockers=['No fue posible cargar el perfil completo DEV. Se conserva la base HR pero el perfil protegido queda bloqueado.'];}
    }
  }

  window.CX_TYA_REAPPLY_FULL_VISUAL_OVERLAY=reapply;
  window.CX_CLEAR_FULL_VISUAL_SESSION=function(){try{sessionStorage.removeItem(TOKEN_KEY);}catch(_){}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0),{once:true});
  else setTimeout(load,0);
})();
