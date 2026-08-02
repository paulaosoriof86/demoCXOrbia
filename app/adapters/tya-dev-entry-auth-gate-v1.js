/* CXOrbia Corte 6 — DEV entry lane split v10.
   Human visual keeps native role cards and HR 14/616/208 authority.
   Technical Auth exists only behind the explicit private E2E query gate.
   No module/core patches, provider writes, merge or production. */
window.CX=window.CX||{};
(function(){
  'use strict';
  const PREVIEW_TOKEN='YES_PAULA_20260628_PREVIEW_DEV';
  const PROTECTED_TOKEN='YES_PAULA_20260730_PROTECTED_DEV';
  const TECHNICAL_TOKEN='YES_PAULA_20260801_REAL_USERS_E2E';
  const params=new URLSearchParams(window.location.search||'');
  const previewApproved=params.get('cxBackendPreview')===PREVIEW_TOKEN;
  const protectedRequested=params.get('cxProtectedRuntime')===PROTECTED_TOKEN;
  const technicalAuthEnabled=protectedRequested&&params.get('cxTechnicalAuthE2E')===TECHNICAL_TOKEN;
  const humanVisualEnabled=previewApproved&&!technicalAuthEnabled;
  if(!humanVisualEnabled&&!technicalAuthEnabled)return;

  const technicalNamespace=params.get('cxTechnicalAuthNamespace')==='shopper'?'shopper':'staff';
  const backendCfg=CX.BACKEND||{};
  let patched=false,statusObserver=null,humanRestoreTimer=null,humanRestoreStartedAt=0;

  function parseHumanSession(raw){
    try{const s=typeof raw==='string'?JSON.parse(raw||'null'):raw;if(!s||!['admin','cliente','shopper'].includes(s.role))return null;return {role:s.role,user:s.user||null,view:s.view||null,testRole:s.testRole||null};}catch(_){return null;}
  }
  const initialHumanSession=humanVisualEnabled?(()=>{try{return parseHumanSession(localStorage.getItem('cx_session'));}catch(_){return null;}})():null;

  function suppressTechnicalStatus(){
    const remove=()=>{const pill=document.getElementById('cxBackendPreviewStatus');if(pill&&pill.parentNode)pill.remove();};
    remove();if(statusObserver||!document.body)return;statusObserver=new MutationObserver(remove);statusObserver.observe(document.body,{childList:true,subtree:true});
  }
  function validCanonicalBaseline(){
    try{return !!(CX.data&&Array.isArray(CX.data.projects)&&CX.data.projects.length===14&&Array.isArray(CX.data._visitas)&&CX.data._visitas.length===616&&Array.isArray(CX.data.shoppers)&&CX.data.shoppers.length===208&&CX.data.currentProjectId&&CX.data.currentPeriodId);}catch(_){return false;}
  }
  function visibleEmptyShell(){
    const view=document.getElementById('view')?.innerText||'';
    const rail=document.getElementById('rail')?.innerText||'';
    return view.includes('Sin proyectos disponibles')||rail.includes('Sin proyectos disponibles')||rail.includes('Sin periodos disponibles');
  }
  function currentOrInitialHumanSession(){
    let current=null;try{current=parseHumanSession(localStorage.getItem('cx_session'));}catch(_){current=null;}return current||initialHumanSession;
  }
  function applySession(session){
    if(!session||!CX.session)return false;CX.session.role=session.role;CX.session.user=session.user||null;CX.session.view=session.view||null;CX.session.testRole=session.testRole||null;if(typeof CX.session.save==='function')CX.session.save();return true;
  }
  function primeHumanSession(){
    const session=currentOrInitialHumanSession();if(!session)return false;const applied=applySession(session);if(applied)window.CX_HUMAN_SESSION_PRIMED={role:session.role,beforeProjectEvents:true,credentials:false,technicalAuth:false,at:new Date().toISOString()};return applied;
  }
  function preserveHumanDataSource(reason){
    if(!CX.dataSource||!validCanonicalBaseline())return false;
    const now=new Date().toISOString();
    Object.assign(CX.dataSource,{mode:'source_safe_preview',status:'ready',sourceRef:CX.dataSource.sourceRef||'hr:tya-source-safe-human-visual-dev',updatedAt:now,runtimeReadActive:true,runtimeSyncActive:false,updating:false,blockers:[]});
    CX.dataSource.warnings=Array.isArray(CX.dataSource.warnings)?CX.dataSource.warnings.filter(msg=>!/fuente de datos no disponible|esperando lectura protegida|firestore dev verificado vac[ií]o/i.test(String(msg||''))):[];
    window.CX_BACKEND_DATA_SOURCE='hr-source-safe';
    window.CX_BACKEND_PREVIEW_LANE='source-safe-human-visual';
    window.CX_BACKEND_LAST_STATE={source:'hr-source-safe',empty:false,readOnly:true,writes:false,fallbackUsed:false,humanVisual:true,auth:'validated-separately',counts:{projects:14,periods:14,visits:616,shoppers:208},reason:reason||'human-lane-preserved',at:now};
    window.CX_CORTE4_READONLY={ready:true,source:'hr-source-safe',empty:false,readOnly:true,writeMode:'disabled',preserveCxDataInterface:true,fallbackUsed:false,humanVisual:true,state:'canonical-data-preserved',at:now};
    window.CX_C4_EMPTY_SHELL_STATE={active:false,role:CX.session?.role||null,projects:14,periodId:CX.data.currentPeriodId||null,projectId:CX.data.currentProjectId||null,staleShell:false,reason:reason||'human-lane-preserved'};
    return true;
  }
  function restoreHumanSessionAndEnter(reason){
    if(!humanVisualEnabled||!validCanonicalBaseline()||!CX.session||!CX.app)return false;
    const saved=currentOrInitialHumanSession();if(!saved)return false;
    applySession(saved);preserveHumanDataSource(reason||'restore-human-session');
    const app=document.getElementById('app');
    const stale=visibleEmptyShell();
    if(app&&(!app.classList.contains('on')||stale)&&typeof CX.app.enter==='function')CX.app.enter();
    const restored=!!(document.getElementById('app')?.classList.contains('on'))&&!visibleEmptyShell();
    window.CX_HUMAN_SESSION_CONTINUITY={restored,role:CX.session.role,canonicalData:true,emptyShellVisible:visibleEmptyShell(),credentials:false,technicalAuth:false,reason:reason||'restore-human-session',at:new Date().toISOString()};
    return restored;
  }
  function stopHumanRestoreLoop(){if(humanRestoreTimer){clearInterval(humanRestoreTimer);humanRestoreTimer=null;}}
  function startHumanRestoreLoop(reason){
    if(!humanVisualEnabled||humanRestoreTimer||!currentOrInitialHumanSession())return;
    humanRestoreStartedAt=Date.now();
    const attempt=()=>{if(restoreHumanSessionAndEnter(reason||'human-restore-loop')){stopHumanRestoreLoop();return;}if(Date.now()-humanRestoreStartedAt>60000){stopHumanRestoreLoop();window.CX_HUMAN_SESSION_CONTINUITY={restored:false,timeout:true,canonicalData:validCanonicalBaseline(),emptyShellVisible:visibleEmptyShell(),reason:reason||'human-restore-loop',at:new Date().toISOString()};}};
    attempt();if(!humanRestoreTimer)humanRestoreTimer=setInterval(attempt,250);
  }

  function configureHumanLane(){
    backendCfg.enabled = false;
    backendCfg.previewMode=true;
    backendCfg.humanVisualSourceSafe = true;
    backendCfg.readOnly=true;backendCfg.writeMode='disabled';backendCfg.enableDataWrites=false;backendCfg.enableOperationalWrites=false;backendCfg.allowEmptyBackend=false;backendCfg.failClosedOnReadError=true;backendCfg.preserveCxDataInterface=true;
    if(backendCfg.devPreviewAuth) backendCfg.devPreviewAuth.enabled = false;
    window.CX_BACKEND_PREVIEW_LANE = 'source-safe-human-visual';
    primeHumanSession();
    window.CX_DEV_ENTRY_AUTH_GATE={applied:true,version:10,mode:'native-direct-role-entry',humanVisual:true,visibleRoleSelector:true,usernamePasswordVisible:false,technicalAuthEnabled:false,integratedFirebaseLoginDisabled:true,backendFirebaseDisabledForHumanVisual:true,emptyBackendShellDisabled:true,staleEmptyShellRemounted:true,humanSessionContinuity:true,humanSessionPrimedBeforeProjectEvents:true,humanSessionRestoreWaitsForCanonicalData:true,hrCanonicalAuthorityPreserved:true,canonicalBaselineRequired:{periods:14,visits:616,shoppers:208},providerWrites:0,writes:false,production:false,at:new Date().toISOString()};
    preserveHumanDataSource('configure-human-lane');
    const ready=reason=>{primeHumanSession();preserveHumanDataSource(reason);startHumanRestoreLoop(reason);};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>ready('dom-ready-human-lane'),{once:true});else ready('immediate-human-lane');
    window.addEventListener('cx:live-source-updated',()=>ready('live-source-updated'));
    window.addEventListener('load',()=>ready('window-load-human-lane'),{once:true});
  }

  function configureTechnicalLane(){backendCfg.enabled=true;backendCfg.humanVisualSourceSafe=false;backendCfg.allowEmptyBackend=true;if(backendCfg.devPreviewAuth)backendCfg.devPreviewAuth.enabled=true;window.CX_BACKEND_PREVIEW_LANE='protected-technical-e2e';}
  function authErrorMessage(err){const code=String(err&&(err.code||err.message)||'');if(/auth\/(wrong-password|invalid-credential|user-not-found|invalid-email)/i.test(code))return 'Usuario o contraseña no válidos.';if(/TENANT_NOT_ALLOWED|PROJECT_SCOPE_REQUIRED|SHOPPER_SCOPE_REQUIRED|ROLE_NOT_ALLOWED|LOGIN_NAMESPACE_MISMATCH|ROLE_NAMESPACE_MISMATCH/i.test(code))return 'La cuenta es válida, pero no tiene alcance para este proyecto.';return 'No fue posible validar el acceso técnico.';}
  function renderTechnicalAuth(){
    suppressTechnicalStatus();const loginRoot=document.getElementById('login'),card=loginRoot&&loginRoot.querySelector('.login-card');if(!card||!CX.backendAuth)return false;
    card.querySelectorAll('.role-btn,.role-alt,#goReg').forEach(el=>{if(el?.parentNode)el.remove();});const guest=card.querySelector('#loginUserSel');if(guest){const section=guest.closest('div[style*="border-top"]')||guest.parentElement;if(section?.parentNode)section.remove();}
    const title=card.querySelector('.login-title');if(title)title.textContent='Validación técnica protegida';const sub=card.querySelector('.login-sub');if(sub)sub.textContent='Carril E2E privado; no corresponde a la entrada humana del producto.';card.querySelector('#cxDevEntryAuth')?.remove();
    const form=document.createElement('form');form.id='cxDevEntryAuth';form.autocomplete='off';form.style.cssText='margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:left';form.innerHTML='<label class="lbl" for="cxDevEntryLogin">Usuario técnico</label><input class="inp" id="cxDevEntryLogin" type="text" autocomplete="off" style="width:100%;margin-bottom:9px"><label class="lbl" for="cxDevEntryPassword">Contraseña técnica</label><input class="inp" id="cxDevEntryPassword" type="password" autocomplete="off" style="width:100%;margin-bottom:9px"><div id="cxDevEntryError" aria-live="polite" style="display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin-bottom:9px"></div><button class="btn btn-pr" id="cxDevEntrySubmit" type="submit" style="width:100%">Validar</button>';
    card.insertBefore(form,card.querySelector('.login-devfor')||card.querySelector('.login-poweredby')||null);
    const login=form.querySelector('#cxDevEntryLogin'),password=form.querySelector('#cxDevEntryPassword'),error=form.querySelector('#cxDevEntryError'),submit=form.querySelector('#cxDevEntrySubmit');
    form.addEventListener('submit',async ev=>{ev.preventDefault();error.style.display='none';const u=String(login.value||'').trim(),p=String(password.value||'');if(!u||!p){error.textContent='Completa las credenciales técnicas.';error.style.display='block';return;}submit.disabled=true;submit.textContent='Validando...';try{await CX.backendAuth.authenticate(u,p,technicalNamespace);password.value='';login.value='';submit.textContent='Cargando...';CX.app?.enter?.();}catch(err){password.value='';error.textContent=authErrorMessage(err);error.style.display='block';submit.disabled=false;submit.textContent='Validar';}});
    window.CX_DEV_ENTRY_AUTH_GATE={applied:true,version:10,mode:'technical-auth-e2e-isolated',humanVisual:false,visibleRoleSelector:false,usernamePasswordVisible:true,technicalAuthEnabled:true,technicalNamespace,namespaceUserSelectable:false,firebaseAuthAuthorityPreserved:true,credentialsEmbedded:false,writes:false,production:false,at:new Date().toISOString()};return true;
  }
  function patchTechnicalLane(){suppressTechnicalStatus();if(patched||!CX.app||!CX.backendAuth)return false;const show=typeof CX.app.showLogin==='function'?CX.app.showLogin.bind(CX.app):null,enter=typeof CX.app.enter==='function'?CX.app.enter.bind(CX.app):null;CX.app.showLogin=function(){const r=show?.();renderTechnicalAuth();return r;};CX.app.enter=function(){suppressTechnicalStatus();const r=enter?.();if(!CX.backendAuth?.isReady?.())setTimeout(renderTechnicalAuth,0);return r;};patched=true;return true;}

  suppressTechnicalStatus();if(humanVisualEnabled){configureHumanLane();return;}configureTechnicalLane();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchTechnicalLane);else patchTechnicalLane();
})();
