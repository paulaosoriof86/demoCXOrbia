/* ============================================================
   CXOrbia · Corte 6 DEV entry lane split v9
   ------------------------------------------------------------
   Human visual lane:
   - preserves native direct role cards;
   - keeps HR/source-safe as canonical data authority;
   - never activates protected Firebase replacement semantics;
   - never clears CX.data while the 14/616/208 baseline is valid;
   - explicitly disables the empty-backend shell contract;
   - captures and primes the selected human profile before any
     project event can overwrite cx_session with a null role;
   - restores the human profile after live 14/616/208 is ready.

   Technical Auth lane (explicit query gate only):
   - validates existing Firebase users;
   - role, tenant, project and shopper scope come from claims;
   - namespace is supplied by the private E2E harness;
   - no credentials, tokens or UIDs are persisted or logged;
   - no writes and no production.

   This adapter does not modify app/modules/* or app/core/*.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  'use strict';

  const PREVIEW_TOKEN = 'YES_PAULA_20260628_PREVIEW_DEV';
  const PROTECTED_TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  const TECHNICAL_TOKEN = 'YES_PAULA_20260801_REAL_USERS_E2E';
  const params = new URLSearchParams(window.location.search || '');
  const previewApproved = params.get('cxBackendPreview') === PREVIEW_TOKEN;
  const protectedRequested = params.get('cxProtectedRuntime') === PROTECTED_TOKEN;
  const technicalAuthEnabled = protectedRequested && params.get('cxTechnicalAuthE2E') === TECHNICAL_TOKEN;
  const humanVisualEnabled = previewApproved && !technicalAuthEnabled;
  if(!humanVisualEnabled && !technicalAuthEnabled) return;

  const technicalNamespace = params.get('cxTechnicalAuthNamespace') === 'shopper' ? 'shopper' : 'staff';
  const backendCfg = CX.BACKEND || {};
  let patched = false;
  let statusObserver = null;
  let humanRestoreTimer = null;
  let humanRestoreStartedAt = 0;

  function parseHumanSession(raw){
    try{
      const saved=typeof raw==='string'?JSON.parse(raw||'null'):raw;
      if(!saved||!['admin','cliente','shopper'].includes(saved.role)) return null;
      return {role:saved.role,user:saved.user||null,view:saved.view||null,testRole:saved.testRole||null};
    }catch(_){ return null; }
  }

  const initialHumanSession = humanVisualEnabled ? (function(){
    try{return parseHumanSession(localStorage.getItem('cx_session'));}catch(_){return null;}
  })() : null;

  function suppressTechnicalStatus(){
    const remove = function(){
      const pill = document.getElementById('cxBackendPreviewStatus');
      if(pill && pill.parentNode) pill.remove();
    };
    remove();
    if(statusObserver || !document.body) return;
    statusObserver = new MutationObserver(remove);
    statusObserver.observe(document.body,{childList:true,subtree:true});
  }

  function validCanonicalBaseline(){
    try{
      return !!(CX.data && Array.isArray(CX.data.projects) && CX.data.projects.length === 14 &&
        Array.isArray(CX.data._visitas) && CX.data._visitas.length === 616 &&
        Array.isArray(CX.data.shoppers) && CX.data.shoppers.length === 208 &&
        CX.data.currentProjectId && CX.data.currentPeriodId);
    }catch(_){ return false; }
  }

  function currentOrInitialHumanSession(){
    let current=null;
    try{current=parseHumanSession(localStorage.getItem('cx_session'));}catch(_){current=null;}
    return current||initialHumanSession;
  }

  function applySession(session){
    if(!session||!CX.session) return false;
    CX.session.role=session.role;
    CX.session.user=session.user||null;
    CX.session.view=session.view||null;
    CX.session.testRole=session.testRole||null;
    if(typeof CX.session.save==='function') CX.session.save();
    return true;
  }

  function primeHumanSession(){
    const session=currentOrInitialHumanSession();
    if(!session) return false;
    const applied=applySession(session);
    if(applied){
      window.CX_HUMAN_SESSION_PRIMED={role:session.role,beforeProjectEvents:true,credentials:false,technicalAuth:false,at:new Date().toISOString()};
    }
    return applied;
  }

  function preserveHumanDataSource(reason){
    if(!CX.dataSource || !validCanonicalBaseline()) return false;
    const now = new Date().toISOString();
    CX.dataSource.mode = 'source_safe_preview';
    CX.dataSource.status = 'ready';
    CX.dataSource.sourceRef = CX.dataSource.sourceRef || 'hr:tya-source-safe-human-visual-dev';
    CX.dataSource.updatedAt = now;
    CX.dataSource.runtimeReadActive = true;
    CX.dataSource.runtimeSyncActive = false;
    CX.dataSource.updating = false;
    CX.dataSource.blockers = [];
    CX.dataSource.warnings = Array.isArray(CX.dataSource.warnings) ? CX.dataSource.warnings.filter(function(msg){
      return !/fuente de datos no disponible|esperando lectura protegida|firestore dev verificado vac[ií]o/i.test(String(msg || ''));
    }) : [];
    window.CX_BACKEND_DATA_SOURCE = 'hr-source-safe';
    window.CX_BACKEND_PREVIEW_LANE = 'source-safe-human-visual';
    window.CX_BACKEND_LAST_STATE = {
      source:'hr-source-safe',empty:false,readOnly:true,writes:false,fallbackUsed:false,humanVisual:true,
      auth:'validated-separately',counts:{projects:14,periods:14,visits:616,shoppers:208},
      reason:reason || 'human-lane-preserved',at:now
    };
    window.CX_CORTE4_READONLY = {
      ready:true,source:'hr-source-safe',empty:false,readOnly:true,writeMode:'disabled',
      preserveCxDataInterface:true,fallbackUsed:false,humanVisual:true,state:'canonical-data-preserved',at:now
    };
    window.CX_C4_EMPTY_SHELL_STATE = {
      active:false,role:CX.session && CX.session.role || null,projects:14,
      periodId:CX.data.currentPeriodId || null,projectId:CX.data.currentProjectId || null,
      staleShell:false,reason:reason || 'human-lane-preserved'
    };
    return true;
  }

  function restoreHumanSessionAndEnter(reason){
    if(!humanVisualEnabled || !validCanonicalBaseline() || !CX.session || !CX.app) return false;
    const saved=currentOrInitialHumanSession();
    if(!saved) return false;
    applySession(saved);
    preserveHumanDataSource(reason||'restore-human-session');
    const app=document.getElementById('app');
    if(app && !app.classList.contains('on') && typeof CX.app.enter==='function') CX.app.enter();
    const restored=!!(document.getElementById('app')&&document.getElementById('app').classList.contains('on'));
    window.CX_HUMAN_SESSION_CONTINUITY={
      restored,role:CX.session.role,canonicalData:true,credentials:false,technicalAuth:false,
      reason:reason||'restore-human-session',at:new Date().toISOString()
    };
    return restored;
  }

  function stopHumanRestoreLoop(){
    if(humanRestoreTimer){clearInterval(humanRestoreTimer);humanRestoreTimer=null;}
  }

  function startHumanRestoreLoop(reason){
    if(!humanVisualEnabled || humanRestoreTimer || !currentOrInitialHumanSession()) return;
    humanRestoreStartedAt=Date.now();
    const attempt=function(){
      if(restoreHumanSessionAndEnter(reason||'human-restore-loop')){stopHumanRestoreLoop();return;}
      if(Date.now()-humanRestoreStartedAt>60000){
        stopHumanRestoreLoop();
        window.CX_HUMAN_SESSION_CONTINUITY={restored:false,timeout:true,canonicalData:validCanonicalBaseline(),reason:reason||'human-restore-loop',at:new Date().toISOString()};
      }
    };
    attempt();
    if(!humanRestoreTimer) humanRestoreTimer=setInterval(attempt,250);
  }

  function configureHumanLane(){
    backendCfg.enabled = false;
    backendCfg.previewMode = true;
    backendCfg.humanVisualSourceSafe = true;
    backendCfg.readOnly = true;
    backendCfg.writeMode = 'disabled';
    backendCfg.enableDataWrites = false;
    backendCfg.enableOperationalWrites = false;
    backendCfg.allowEmptyBackend = false;
    backendCfg.failClosedOnReadError = true;
    backendCfg.preserveCxDataInterface = true;
    if(backendCfg.devPreviewAuth) backendCfg.devPreviewAuth.enabled = false;
    window.CX_BACKEND_PREVIEW_LANE = 'source-safe-human-visual';
    primeHumanSession();
    window.CX_DEV_ENTRY_AUTH_GATE = {
      applied:true,version:9,mode:'native-direct-role-entry',humanVisual:true,visibleRoleSelector:true,
      usernamePasswordVisible:false,technicalAuthEnabled:false,integratedFirebaseLoginDisabled:true,
      backendFirebaseDisabledForHumanVisual:true,emptyBackendShellDisabled:true,humanSessionContinuity:true,
      humanSessionPrimedBeforeProjectEvents:true,humanSessionRestoreWaitsForCanonicalData:true,
      hrCanonicalAuthorityPreserved:true,canonicalBaselineRequired:{periods:14,visits:616,shoppers:208},
      providerWrites:0,writes:false,production:false,at:new Date().toISOString()
    };
    preserveHumanDataSource('configure-human-lane');
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){
        primeHumanSession();preserveHumanDataSource('dom-ready-human-lane');startHumanRestoreLoop('dom-ready-human-lane');
      }, {once:true});
    }else{
      primeHumanSession();preserveHumanDataSource('immediate-human-lane');startHumanRestoreLoop('immediate-human-lane');
    }
    window.addEventListener('cx:live-source-updated', function(){
      primeHumanSession();preserveHumanDataSource('live-source-updated');startHumanRestoreLoop('live-source-updated');
    });
    window.addEventListener('load', function(){primeHumanSession();startHumanRestoreLoop('window-load-human-lane');}, {once:true});
  }

  function configureTechnicalLane(){
    backendCfg.enabled = true;
    backendCfg.humanVisualSourceSafe = false;
    backendCfg.allowEmptyBackend = true;
    if(backendCfg.devPreviewAuth) backendCfg.devPreviewAuth.enabled = true;
    window.CX_BACKEND_PREVIEW_LANE = 'protected-technical-e2e';
  }

  function authErrorMessage(err){
    const code = String(err && (err.code || err.message) || '');
    if(/auth\/(wrong-password|invalid-credential|user-not-found|invalid-email)/i.test(code)) return 'Usuario o contraseña no válidos.';
    if(/TENANT_NOT_ALLOWED|PROJECT_SCOPE_REQUIRED|SHOPPER_SCOPE_REQUIRED|ROLE_NOT_ALLOWED|LOGIN_NAMESPACE_MISMATCH|ROLE_NAMESPACE_MISMATCH/i.test(code)) return 'La cuenta es válida, pero no tiene alcance para este proyecto.';
    return 'No fue posible validar el acceso técnico.';
  }

  function renderTechnicalAuth(){
    suppressTechnicalStatus();
    const loginRoot = document.getElementById('login');
    const card = loginRoot && loginRoot.querySelector('.login-card');
    if(!card || !window.CX || !CX.backendAuth) return false;
    card.querySelectorAll('.role-btn,.role-alt,#goReg').forEach(function(el){if(el&&el.parentNode)el.remove();});
    const guest=card.querySelector('#loginUserSel');
    if(guest){const section=guest.closest('div[style*="border-top"]')||guest.parentElement;if(section&&section.parentNode)section.remove();}
    const title=card.querySelector('.login-title');if(title)title.textContent='Validación técnica protegida';
    const sub=card.querySelector('.login-sub');if(sub)sub.textContent='Carril E2E privado; no corresponde a la entrada humana del producto.';
    const old=card.querySelector('#cxDevEntryAuth');if(old)old.remove();
    const form=document.createElement('form');
    form.id='cxDevEntryAuth';form.autocomplete='off';form.style.cssText='margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:left';
    form.innerHTML='<label class="lbl" for="cxDevEntryLogin">Usuario técnico</label><input class="inp" id="cxDevEntryLogin" type="text" autocomplete="off" style="width:100%;margin-bottom:9px"><label class="lbl" for="cxDevEntryPassword">Contraseña técnica</label><input class="inp" id="cxDevEntryPassword" type="password" autocomplete="off" style="width:100%;margin-bottom:9px"><div id="cxDevEntryError" aria-live="polite" style="display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin-bottom:9px"></div><button class="btn btn-pr" id="cxDevEntrySubmit" type="submit" style="width:100%">Validar</button>';
    const footer=card.querySelector('.login-devfor')||card.querySelector('.login-poweredby');card.insertBefore(form,footer||null);
    const login=form.querySelector('#cxDevEntryLogin'),password=form.querySelector('#cxDevEntryPassword'),error=form.querySelector('#cxDevEntryError'),submit=form.querySelector('#cxDevEntrySubmit');
    form.addEventListener('submit',async function(ev){
      ev.preventDefault();error.style.display='none';error.textContent='';
      const userValue=String(login.value||'').trim(),passwordValue=String(password.value||'');
      if(!userValue||!passwordValue){error.textContent='Completa las credenciales técnicas.';error.style.display='block';return;}
      submit.disabled=true;submit.textContent='Validando...';
      try{await CX.backendAuth.authenticate(userValue,passwordValue,technicalNamespace);password.value='';login.value='';submit.textContent='Cargando...';if(CX.app&&typeof CX.app.enter==='function')CX.app.enter();}
      catch(err){password.value='';error.textContent=authErrorMessage(err);error.style.display='block';submit.disabled=false;submit.textContent='Validar';}
    });
    window.CX_DEV_ENTRY_AUTH_GATE={applied:true,version:9,mode:'technical-auth-e2e-isolated',humanVisual:false,visibleRoleSelector:false,usernamePasswordVisible:true,technicalAuthEnabled:true,technicalNamespace,namespaceUserSelectable:false,firebaseAuthAuthorityPreserved:true,credentialsEmbedded:false,writes:false,production:false,at:new Date().toISOString()};
    return true;
  }

  function patchTechnicalLane(){
    suppressTechnicalStatus();
    if(patched||!CX.app||!CX.backendAuth)return false;
    const priorShowLogin=typeof CX.app.showLogin==='function'?CX.app.showLogin.bind(CX.app):null;
    const priorEnter=typeof CX.app.enter==='function'?CX.app.enter.bind(CX.app):null;
    CX.app.showLogin=function(){const result=priorShowLogin?priorShowLogin():undefined;renderTechnicalAuth();return result;};
    CX.app.enter=function(){suppressTechnicalStatus();const result=priorEnter?priorEnter():undefined;if(!(CX.backendAuth&&CX.backendAuth.isReady&&CX.backendAuth.isReady()))setTimeout(renderTechnicalAuth,0);return result;};
    patched=true;return true;
  }

  suppressTechnicalStatus();
  if(humanVisualEnabled){configureHumanLane();return;}
  configureTechnicalLane();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchTechnicalLane);else patchTechnicalLane();
})();
