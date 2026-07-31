/* CXOrbia TyA Corte 6 — stable cumulative human visual bridge (DEV only).
   HR is the immutable operational baseline per revision. Protected Firestore enriches exact identities only.
   No provider writes, no browser Firebase credentials, no module patches. */
window.CX = window.CX || {};
(function(){
  'use strict';
  const params=new URLSearchParams(window.location.search||'');
  const SELECTOR='YES_PAULA_20260731_FULL_PROFILE_DEV';
  if(params.get('cxHumanFullVisual')!==SELECTOR)return;
  if(params.get('cxProtectedRuntime')){
    console.error('[CX.full-visual-stable] Carril inválido: human full visual no debe mezclarse con protected browser Auth.');
    return;
  }
  const TOKEN_KEY='CXORBIA_C6_FULL_VISUAL_TOKEN';
  const endpoint='/api/tya/cinepolis/hr-live';
  const safeArray=v=>Array.isArray(v)?v:[];
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const lower=v=>String(v||'').trim().toLowerCase();
  const same=(a,b)=>String(a||'')!==''&&String(a||'')===String(b||'');
  let protectedPayload=null;
  let hrBaseline=null;
  let lastCompose=null;

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
  async function ensureEngine(){
    if(window.CX_TYA_CUMULATIVE_READ_MODEL&&typeof window.CX_TYA_CUMULATIVE_READ_MODEL.compose==='function')return window.CX_TYA_CUMULATIVE_READ_MODEL;
    await new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-cx-stable-composer-engine]');
      if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error('STABLE_COMPOSER_ENGINE_LOAD_FAILED')),{once:true});return;}
      const script=document.createElement('script');
      script.src='adapters/tya-cumulative-read-model.js';
      script.async=false;script.dataset.cxStableComposerEngine='1';
      script.onload=resolve;script.onerror=()=>reject(new Error('STABLE_COMPOSER_ENGINE_LOAD_FAILED'));
      document.head.appendChild(script);
    });
    if(!window.CX_TYA_CUMULATIVE_READ_MODEL||typeof window.CX_TYA_CUMULATIVE_READ_MODEL.compose!=='function')throw new Error('STABLE_COMPOSER_ENGINE_MISSING');
    return window.CX_TYA_CUMULATIVE_READ_MODEL;
  }
  function engine(){
    const api=window.CX_TYA_CUMULATIVE_READ_MODEL;
    if(!api||typeof api.compose!=='function')throw new Error('STABLE_COMPOSER_ENGINE_MISSING');
    return api;
  }
  function pureHrState(){
    if(!CX.data)return false;
    const mode=String(CX.data.sourceMode||'');
    return !/full_profile|full-visual|firestore_full/i.test(mode)&&!(CX.data.previewMeta&&CX.data.previewMeta.fullProfileVisual===true);
  }
  function currentRevision(){
    return String((CX.data&&CX.data.previewMeta&&CX.data.previewMeta.sourceRevision)||(window.CX_TYA_HR_LIVE_META&&window.CX_TYA_HR_LIVE_META.revision)||'').trim()||null;
  }
  function captureHrBaseline(reason,force){
    if(!CX.data)throw new Error('CX_DATA_MISSING');
    const revision=currentRevision();
    const shouldCapture=force||!hrBaseline||pureHrState()||(revision&&revision!==hrBaseline.sourceRevision);
    if(!shouldCapture)return hrBaseline;
    hrBaseline={
      projects:clone(CX.data.projects||[]),
      visits:clone(CX.data._visitas||[]),
      shoppers:clone(CX.data.shoppers||[]),
      posts:clone(CX.data._posts||[]),
      periodOperationalSummary:clone(CX.data.periodOperationalSummary||[]),
      currentPeriodId:CX.data.currentPeriodId||null,
      currentProjectId:CX.data.currentProjectId||'cinepolis',
      sourceRevision:revision,
      capturedAt:new Date().toISOString(),
      reason:reason||'capture_hr_baseline'
    };
    window.CX_TYA_STABLE_HR_BASELINE={
      sourceRevision:hrBaseline.sourceRevision,
      visits:hrBaseline.visits.length,
      shoppers:hrBaseline.shoppers.length,
      periods:hrBaseline.projects.length,
      capturedAt:hrBaseline.capturedAt,
      reason:hrBaseline.reason
    };
    return hrBaseline;
  }
  function realized(v){const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));return f.realized===true||f.questionnaire===true||f.submitted===true||['realizada','cuestionario','submitida','liquidada','pagada'].includes(st);}
  function liquidated(v){const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));return f.liquidationConfirmed===true||['confirmed','liquidated','liquidada'].includes(lower(v&&v.liquidationState))||['liquidada','pagada'].includes(st);}
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
      const ownPosts=this.postsForShopper?this.postsForShopper(id):safeArray(posts).filter(p=>same(p.shopperId,id));
      const submitted=v=>{const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));return f.submitted===true||['submitida','liquidada','pagada'].includes(st);};
      return {
        total:vs.length,
        realizadas:vs.filter(realized).length,
        liquidadas:vs.filter(liquidated).length,
        enCurso:vs.filter(inCourse).length,
        postulaciones:(ownPosts&&ownPosts.length)||Number(s&&s.postulaciones||0),
        submitted:vs.filter(submitted).length,
        paymentConfirmed:vs.filter(v=>(v.canonicalFacets&&v.canonicalFacets.paymentConfirmed===true)||lower(v&&(v.estado||v.status))==='pagada').length
      };
    };
  }
  function applyComposition(reason){
    if(!protectedPayload||!CX.data)return {ok:false,skipped:true,reason:'payload_or_data_missing'};
    captureHrBaseline(reason||'compose',false);
    const result=engine().compose({hr:hrBaseline,protectedPayload});
    if(result.diagnostics.outputVisits!==hrBaseline.visits.length||result.diagnostics.duplicateVisitKeys!==0||result.diagnostics.duplicateShopperIds!==0){
      throw new Error('STABLE_COMPOSER_INVARIANT_FAIL '+JSON.stringify(result.diagnostics));
    }
    CX.data.projects=clone(result.projects);
    CX.data.shoppers=clone(result.shoppers);
    CX.data._visitas=clone(result.visits);
    CX.data._posts=clone(result.posts);
    CX.data.periodOperationalSummary=clone(result.periodOperationalSummary);
    CX.data.currentProjectId=result.currentProjectId||'cinepolis';
    if(result.currentPeriodId&&CX.data.projects.some(p=>String(p.id)===String(result.currentPeriodId)))CX.data.currentPeriodId=result.currentPeriodId;
    else if(hrBaseline.currentPeriodId&&CX.data.projects.some(p=>String(p.id)===String(hrBaseline.currentPeriodId)))CX.data.currentPeriodId=hrBaseline.currentPeriodId;
    CX.data.__protectedCertifications=safeArray(protectedPayload.certifications);
    CX.data.__protectedLiquidations=safeArray(protectedPayload.liquidations);
    CX.data.sourceMode='tya_hr_live_plus_firestore_full_profile_stable_dev';
    CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{}, {
      tenantId:'tya',projectId:'cinepolis',source:'hr-live+firestore-server-side-dev-visual+canonical-finance',
      fullProfileVisual:true,cumulativeVisual:true,stableComposer:true,stableComposerVersion:engine().version,
      browserFirebaseCredentialsRequired:false,serverSideTechnicalIdentity:true,piiProtected:false,readOnly:true,production:false,
      runtimeReadActive:true,sourceRevision:hrBaseline.sourceRevision,
      shoppers:CX.data.shoppers.length,visits:CX.data._visitas.length,postulations:CX.data._posts.length,
      protectedProfileDocs:safeArray(protectedPayload.shoppers).length,
      protectedCertifications:safeArray(protectedPayload.certifications).length,
      protectedLiquidations:safeArray(protectedPayload.liquidations).length,
      generatedAt:protectedPayload.generatedAt||new Date().toISOString(),
      note:'Visual DEV estable: HR viva es baseline inmutable por revision; Firestore enriquece identidad/perfil por crosswalk tecnico exacto; no se anexan visitas historicas protegidas.'
    });
    installHistoryMethods(result.posts);
    CX.tenantProfile=Object.assign({},CX.tenantProfile||{}, {
      devShopperAccess:true,
      devHostAllowlist:Array.from(new Set([...(CX.tenantProfile&&CX.tenantProfile.devHostAllowlist||[]),'cxorbia-backend-dev.web.app','cxorbia-backend-dev.firebaseapp.com']))
    });
    if(CX.dataSource){
      CX.dataSource.mode='connected';CX.dataSource.status='ready';CX.dataSource.sourceRef='hr-live+firestore-full-profile-stable+canonical-finance';
      CX.dataSource.updatedAt=protectedPayload.generatedAt||new Date().toISOString();CX.dataSource.runtimeReadActive=true;CX.dataSource.runtimeSyncActive=false;CX.dataSource.updating=false;
      CX.dataSource.warnings=result.diagnostics.identityConflicts.length?[`${result.diagnostics.identityConflicts.length} identidades requieren revisión técnica; no se fusionaron por similitud.`]:[];
      CX.dataSource.blockers=[];
    }
    const activeVisits=typeof CX.data.visitas==='function'?CX.data.visitas().length:0;
    lastCompose={
      reason:reason||'compose',signature:engine().signature(result),diagnostics:clone(result.diagnostics),
      sourceRevision:hrBaseline.sourceRevision,periods:CX.data.projects.length,currentPeriodId:CX.data.currentPeriodId,
      activePeriodVisits:activeVisits,visits:CX.data._visitas.length,shoppers:CX.data.shoppers.length,posts:CX.data._posts.length
    };
    window.CX_TYA_FULL_VISUAL_READY=true;
    window.CX_TYA_FULL_VISUAL_CONTRACT=Object.assign({
      tenantId:'tya',projectId:'cinepolis',hrLivePreserved:true,canonicalFinancePreserved:!!window.CX_TYA_FINANCIAL_CANONICAL_READY,
      browserFirebaseCredentialsRequired:false,providerWrites:0,production:false
    },clone(lastCompose));
    window.CX_TYA_STABILITY_DIAGNOSTICS=clone(lastCompose);
    try{window.dispatchEvent(new CustomEvent('cx:full-visual-ready',{detail:window.CX_TYA_FULL_VISUAL_CONTRACT}));}catch(_){ }
    return {ok:true,...clone(lastCompose)};
  }
  function reapply(reason){
    try{return applyComposition(reason||'stable_reapply');}
    catch(error){
      console.error('[CX.full-visual-stable]',error);
      if(CX.dataSource){CX.dataSource.status='blocked';CX.dataSource.blockers=['Composición acumulativa estable bloqueada por invariante. Se conserva la HR base.'];}
      return {ok:false,error:String(error&&error.message||error)};
    }
  }
  async function load(){
    const token=takeTokenFromFragment();
    window.CX_TYA_FULL_VISUAL_REQUESTED=true;
    CX.tenantProfile=Object.assign({},CX.tenantProfile||{}, {devShopperAccess:true,devHostAllowlist:['cxorbia-backend-dev.web.app','cxorbia-backend-dev.firebaseapp.com']});
    if(!token){if(CX.dataSource){CX.dataSource.status='blocked';CX.dataSource.blockers=['Sesión visual DEV no disponible. Usa el enlace temporal generado para esta validación.'];}return;}
    try{
      await ensureEngine();
      if(CX.dataSource){CX.dataSource.status='loading';CX.dataSource.warnings=['Sincronizando HR viva antes de componer perfil protegido…'];}
      if(typeof window.CX_TYA_CHECK_LIVE_SOURCE==='function')await window.CX_TYA_CHECK_LIVE_SOURCE('full_visual_preload');
      captureHrBaseline('after_fresh_hr_preload',true);
      const q=new URLSearchParams({view:'full-profile',scope:'admin',ts:String(Date.now())});
      const response=await fetch(endpoint+'?'+q.toString(),{cache:'no-store',headers:{Authorization:'Bearer '+token,'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
      const payload=await response.json().catch(()=>null);
      if(!response.ok)throw new Error('HTTP '+response.status+(payload&&payload.error?': '+payload.error:''));
      if(!payload||payload.ok!==true||payload.schemaVersion!=='cxorbia.corte6.dev-full-visual-snapshot.v1')throw new Error('FULL_VISUAL_PAYLOAD_INVALID');
      protectedPayload=payload;
      const composed=applyComposition('initial_stable_protected_overlay');
      if(typeof window.CX_TYA_REQUEST_STABLE_RERENDER==='function')window.CX_TYA_REQUEST_STABLE_RERENDER('initial_stable_protected_overlay');
      if(CX.ui&&CX.ui.toast&&composed.ok)CX.ui.toast('HR viva + perfil protegido estables','');
    }catch(error){
      console.error('[CX.full-visual-stable]',error);
      if(CX.dataSource){CX.dataSource.status='blocked';CX.dataSource.warnings=[];CX.dataSource.blockers=['No fue posible componer el perfil protegido sobre HR viva. La HR base se conserva sin duplicar datos.'];}
    }
  }
  window.CX_TYA_REAPPLY_FULL_VISUAL_OVERLAY=reapply;
  window.CX_TYA_CAPTURE_STABLE_HR_BASELINE=(reason)=>captureHrBaseline(reason||'manual_capture',true);
  window.CX_TYA_STABLE_COMPOSE=()=>reapply('manual_stable_compose');
  window.CX_CLEAR_FULL_VISUAL_SESSION=function(){try{sessionStorage.removeItem(TOKEN_KEY);}catch(_){}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0),{once:true});
  else setTimeout(load,0);
})();
