/* CXOrbia TyA Corte 6 — full profile human visual bridge (DEV only).
   Human QA must preserve prototype auto-entry and never require Paula to know
   Firebase credentials. Protected Auth/claims/Rules remain provider-gated
   separately. Full profile data is fetched read-only through the existing
   Cloud Run service using a short-lived opaque visual-session token that is
   never committed and is stored only in sessionStorage for the current tab. */
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
  const firstValue=(obj,keys)=>{for(const key of keys){const v=obj&&obj[key];if(v!==undefined&&v!==null&&String(v).trim()!=='')return v;}return '';};
  const lower=v=>String(v||'').trim().toLowerCase();
  const periodKeyOf=v=>String(v&& (v.periodKey||v.periodId||v.period||'') || '').replace(/^cinepolis-/,'');

  function takeTokenFromFragment(){
    let token='';
    try{
      const raw=String(window.location.hash||'').replace(/^#/,'');
      const hash=new URLSearchParams(raw);
      token=String(hash.get('cxVisualSession')||'').trim();
      if(token){
        sessionStorage.setItem(TOKEN_KEY,token);
        history.replaceState(null,'',window.location.pathname+window.location.search);
      }
    }catch(_){ }
    if(token) return token;
    try{return String(sessionStorage.getItem(TOKEN_KEY)||'').trim();}catch(_){return '';}
  }

  function mapShopper(s){
    const id=s&& (s.shopperId||s.id);
    return Object.assign({},s,{
      id:id,shopperId:id,
      nombre:firstValue(s,['nombre','name','fullName'])||id||'Shopper',
      pais:firstValue(s,['pais','country'])||'GT',
      ciudad:firstValue(s,['ciudad','city']),
      departamento:firstValue(s,['departamento','depto','department']),
      whatsapp:firstValue(s,['whatsapp','wa','telefono','phone']),
      phone:firstValue(s,['phone','telefono','wa','whatsapp']),
      email:firstValue(s,['email','correo']),
      dpi:firstValue(s,['dpi','documentId','documento','idNumber']),
      direccion:firstValue(s,['direccion','address']),
      fecha_nac:firstValue(s,['fecha_nac','fechaNacimiento','birthDate']),
      banco:firstValue(s,['banco','bank']),
      ctaTipo:firstValue(s,['ctaTipo','accountType']),
      ctaNum:firstValue(s,['ctaNum','accountNumber']),
      ctaTitular:firstValue(s,['ctaTitular','accountHolder']),
      ctaMoneda:firstValue(s,['ctaMoneda','accountCurrency']),
      cuentaPago:firstValue(s,['cuentaPago']),
      user:firstValue(s,['user','username','login']),
      username:firstValue(s,['username','user','login']),
      pass:firstValue(s,['pass','password']),
      sourceSafe:false,piiProtected:false,dataLevel:'dev_full_profile_visual',operationalProfileAvailable:true
    });
  }

  function mapVisit(v){
    const key=periodKeyOf(v);
    return Object.assign({},v,{
      id:v.id||v.visitId,visitId:v.visitId||v.id,
      rootProjectId:'cinepolis',projectId:key?('cinepolis-'+key):'cinepolis',periodKey:key||null,
      estado:v.estado||v.status||'disponible',status:v.status||v.estado||'disponible',
      shopperId:v.shopperId||null,shopper:v.shopper||v.shopperName||'',
      pais:v.pais||v.country||v.countryCode||'GT',country:v.country||v.pais||v.countryCode||'GT',
      sucursal:v.sucursal||v.branchName||v.branchId||v.id||'',ciudad:v.ciudad||v.city||'',
      sourceSafe:false,piiProtected:false
    });
  }

  function mapPost(p,visitsById){
    const visitId=p.visitId||p.visitaId||'';
    const visit=visitsById[visitId]||{};
    const key=periodKeyOf(p)||periodKeyOf(visit);
    return Object.assign({},p,{
      id:p.id||p.applicationId||p.postulationId||[visitId,p.shopperId].filter(Boolean).join('-'),
      visitId,visitaId:visitId,rootProjectId:'cinepolis',projectId:key?('cinepolis-'+key):'cinepolis',periodKey:key||null,
      estado:p.estado||p.status||'pendiente',status:p.status||p.estado||'pendiente',
      shopperId:p.shopperId||null,shopper:p.shopper||'',
      sourceSafe:false,piiProtected:false
    });
  }

  function realized(v){
    const f=v&&v.canonicalFacets||{};
    const st=lower(v&& (v.estado||v.status||v.presentationState));
    return f.realized===true||f.questionnaire===true||f.submitted===true||f.liquidationCandidate===true||f.liquidationConfirmed===true||f.paymentConfirmed===true||['realizada','cuestionario','submitida','liquidada','pagada'].includes(st);
  }
  function liquidated(v){
    const f=v&&v.canonicalFacets||{};
    const st=lower(v&& (v.estado||v.status||v.presentationState));
    return f.liquidationConfirmed===true||f.paymentConfirmed===true||['liquidada','pagada'].includes(st);
  }
  function inCourse(v){
    const f=v&&v.canonicalFacets||{};
    const st=lower(v&& (v.estado||v.status||v.presentationState));
    return (f.assigned===true&&!realized(v))||['asignada','agendada','postulada','fuera_rango'].includes(st);
  }

  function applyPayload(payload){
    if(!payload||payload.ok!==true||payload.schemaVersion!=='cxorbia.corte6.dev-full-visual-snapshot.v1'||!CX.data) throw new Error('FULL_VISUAL_PAYLOAD_INVALID');
    const shoppers=safeArray(payload.shoppers).map(mapShopper);
    const visits=safeArray(payload.visits).map(mapVisit);
    const visitsById=Object.fromEntries(visits.map(v=>[v.id||v.visitId,v]));
    const posts=safeArray(payload.postulations).concat(safeArray(payload.applications)).map(p=>mapPost(p,visitsById));

    CX.data.shoppers=shoppers;
    CX.data._visitas=visits;
    CX.data._posts=posts;
    CX.data._certifications=safeArray(payload.certifications);
    CX.data.certifications=safeArray(payload.certifications);
    CX.data._liquidations=safeArray(payload.liquidations);
    CX.data.liquidations=safeArray(payload.liquidations);
    CX.data.currentProjectId='cinepolis';
    CX.data.sourceMode='tya_dev_full_profile_server_visual';
    CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{}, {
      tenantId:'tya',projectId:'cinepolis',source:'firestore-server-side-dev-visual',
      fullProfileVisual:true,browserFirebaseCredentialsRequired:false,serverSideTechnicalIdentity:true,
      piiProtected:false,sourceSafe:false,readOnly:true,production:false,
      shoppers:shoppers.length,visits:visits.length,postulations:posts.length,
      certifications:safeArray(payload.certifications).length,liquidations:safeArray(payload.liquidations).length,
      generatedAt:payload.generatedAt||new Date().toISOString(),
      note:'Validación humana DEV con perfil completo desde Firestore mediante gate técnico server-side; sin login Firebase visible.'
    });

    CX.data.visitsForShopper=function(id,onlyCurrentProject){
      return safeArray(this._visitas).filter(v=>{
        if(String(v&&v.shopperId||'')!==String(id||''))return false;
        if(!onlyCurrentProject)return true;
        const active=this.currentProjectId;
        return !active||v.rootProjectId===active||v.projectId===active||String(v.projectId||'').startsWith(active+'-');
      });
    };
    CX.data.shopperStats=function(id){
      const vs=this.visitsForShopper(id,false);
      const s=this.getShopper?this.getShopper(id):null;
      const ownPosts=this.postsForShopper?this.postsForShopper(id):posts.filter(p=>String(p.shopperId||'')===String(id||''));
      const submitted=v=>{
        const f=v&&v.canonicalFacets||{};const st=lower(v&& (v.estado||v.status||v.presentationState));
        return f.submitted===true||['submitida','liquidada','pagada'].includes(st);
      };
      return {total:vs.length,realizadas:vs.filter(realized).length,liquidadas:vs.filter(liquidated).length,enCurso:vs.filter(inCourse).length,postulaciones:(ownPosts&&ownPosts.length)||Number(s&&s.postulaciones||0),submitted:vs.filter(submitted).length,paymentConfirmed:vs.filter(v=>(v.canonicalFacets&&v.canonicalFacets.paymentConfirmed===true)||lower(v&& (v.estado||v.status))==='pagada').length};
    };

    CX.tenantProfile=Object.assign({},CX.tenantProfile||{}, {
      devShopperAccess:true,
      devHostAllowlist:Array.from(new Set([...(CX.tenantProfile&&CX.tenantProfile.devHostAllowlist||[]),'cxorbia-backend-dev.web.app','cxorbia-backend-dev.firebaseapp.com']))
    });
    if(CX.dataSource){
      CX.dataSource.mode='connected';CX.dataSource.status='ready';CX.dataSource.sourceRef='firestore-server-side-dev-visual';
      CX.dataSource.updatedAt=payload.generatedAt||new Date().toISOString();CX.dataSource.runtimeReadActive=true;CX.dataSource.runtimeSyncActive=false;CX.dataSource.updating=false;CX.dataSource.warnings=[];CX.dataSource.blockers=[];
    }
    window.CX_TYA_FULL_VISUAL_READY=true;
    window.CX_TYA_FULL_VISUAL_CONTRACT={tenantId:'tya',projectId:'cinepolis',shoppers:shoppers.length,visits:visits.length,posts:posts.length,certifications:safeArray(payload.certifications).length,liquidations:safeArray(payload.liquidations).length,browserFirebaseCredentialsRequired:false,providerWrites:0,production:false};
    try{window.dispatchEvent(new CustomEvent('cx:full-visual-ready',{detail:window.CX_TYA_FULL_VISUAL_CONTRACT}));}catch(_){ }
  }

  async function load(){
    const token=takeTokenFromFragment();
    window.CX_TYA_FULL_VISUAL_REQUESTED=true;
    CX.tenantProfile=Object.assign({},CX.tenantProfile||{}, {devShopperAccess:true,devHostAllowlist:['cxorbia-backend-dev.web.app','cxorbia-backend-dev.firebaseapp.com']});
    if(!token){
      if(CX.dataSource){CX.dataSource.status='blocked';CX.dataSource.blockers=['Sesión visual DEV no disponible. Usa el enlace temporal generado para esta validación.'];}
      return;
    }
    try{
      if(CX.dataSource){CX.dataSource.status='loading';CX.dataSource.warnings=['Cargando perfil completo DEV…'];}
      const q=new URLSearchParams({view:'full-profile',scope:'admin',ts:String(Date.now())});
      const response=await fetch(endpoint+'?'+q.toString(),{cache:'no-store',headers:{Authorization:'Bearer '+token,'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
      const payload=await response.json().catch(()=>null);
      if(!response.ok)throw new Error('HTTP '+response.status+(payload&&payload.error?': '+payload.error:''));
      applyPayload(payload);
      if(CX.ui&&CX.ui.toast)CX.ui.toast('Perfil completo DEV cargado','');
    }catch(error){
      console.error('[CX.full-visual]',error);
      if(CX.dataSource){CX.dataSource.status='blocked';CX.dataSource.warnings=[];CX.dataSource.blockers=['No fue posible cargar el perfil completo DEV. Se mantiene bloqueado para evitar mostrar datos parciales.'];}
    }
  }

  window.CX_CLEAR_FULL_VISUAL_SESSION=function(){try{sessionStorage.removeItem(TOKEN_KEY);}catch(_){}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0),{once:true});
  else setTimeout(load,0);
})();
