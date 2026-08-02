/* CXOrbia TyA — Corte 6 unified authenticated cumulative human runtime v1.
   Root recovery after human validation proved a fragmented/reduced lane regression.

   Contract:
   - the normal visible product entry uses Firebase Auth + claims;
   - HR live is the only operational authority for every detected period;
   - protected Firestore enriches exact identity/profile/certification only;
   - canonical domain/Shopper/finance adapters remain active in the same runtime;
   - project financial configuration fills operational honoraria when HR has no amount;
   - delegated projects never receive local-invoicing royalties;
   - no provider writes, deploys, merge or production.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  const PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
  const FULL_VISUAL='YES_PAULA_20260731_FULL_PROFILE_DEV';
  const TECHNICAL='YES_PAULA_20260801_REAL_USERS_E2E';
  const enabled=params.get('cxProtectedRuntime')===PROTECTED
    && params.get('cxHumanFullVisual')===FULL_VISUAL
    && params.get('cxTechnicalAuthE2E')!==TECHNICAL;
  if(!enabled)return;

  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  const num=v=>Number.isFinite(Number(v))?Number(v):null;
  const esc=v=>str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const monthLabel=key=>{
    const m=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const s=str(key),n=Number(s.slice(5,7)),y=s.slice(2,4);
    return `${m[n-1]||s} ${y}`;
  };

  function forceUnifiedConfig(){
    const cfg=CX.BACKEND=CX.BACKEND||{};
    Object.assign(cfg,{
      enabled:true,previewMode:true,humanVisualSourceSafe:false,readOnly:true,
      writeMode:'disabled',enableDataWrites:false,enableOperationalWrites:false,
      allowEmptyBackend:false,failClosedOnReadError:true,preserveCxDataInterface:true,
      tenantId:'tya',defaultProjectId:'cinepolis',previewProjectIds:['cinepolis'],
      canonicalBackendProjectId:'cxorbia-backend-dev',migrationTargetProjectId:'cxorbia-backend-dev',
      configSource:'c6-unified-authenticated-human-canonical-runtime'
    });
    cfg.devPreviewAuth=Object.assign({},cfg.devPreviewAuth||{}, {
      enabled:true,mode:'integrated-product-login-protected-dev',persist:'session',
      reuseAuthenticatedSession:true,storedCredentialFallback:false,
      requireCustomClaims:true,humanCredentialPrompt:true,allowTechnicalEmail:false
    });
    window.CX_BACKEND_PREVIEW_LANE='authenticated-human-canonical';
    window.CX_BACKEND_DATA_SOURCE='hr-live-authority+firestore-authenticated-overlay';
  }

  /*
    C6 login race root fix:
    app.js can paint the role cards before DOMContentLoaded installs the official
    backend-browser-auth wrapper. A very fast click in that interval used the
    prototype's direct-role handler. Capture the click before it reaches the
    card and route it into the same integrated Auth bridge. Once the official
    wrapper is installed this guard becomes a no-op; it never authenticates,
    persists credentials or enters the app by itself.
  */
  function installEarlyRoleClickGuard(){
    if(window.CX_C6_EARLY_AUTH_CLICK_GUARD?.installed===true)return;
    const earlyRoleClickGuard=event=>{
      const target=event.target&&event.target.closest?event.target.closest('.role-btn[data-role]'):null;
      if(!target)return;
      const protectedLogin=CX.BACKEND?.enabled===true
        && CX.BACKEND?.previewMode===true
        && CX.BACKEND?.devPreviewAuth?.enabled===true;
      const officialWrapperReady=CX.app?.__firebaseBrowserAuthWrapped===true;
      const authenticated=CX.backendAuth?.isReady?.()===true;
      if(!protectedLogin||officialWrapperReady||authenticated||typeof CX.backendAuth?.showForRole!=='function')return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const role=str(target.dataset&&target.dataset.role);
      CX.backendAuth.showForRole(role);
      window.CX_C6_EARLY_AUTH_CLICK_GUARD.lastInterceptedRole=role||null;
      window.CX_C6_EARLY_AUTH_CLICK_GUARD.intercepts+=1;
      window.CX_C6_EARLY_AUTH_CLICK_GUARD.lastInterceptedAt=new Date().toISOString();
    };
    document.addEventListener('click',earlyRoleClickGuard,true);
    window.CX_C6_EARLY_AUTH_CLICK_GUARD={
      installed:true,
      mode:'capture-until-official-auth-wrapper',
      intercepts:0,
      directRoleEntryAllowed:false,
      credentialValuesStored:false,
      providerWrites:0,
      production:false,
      at:new Date().toISOString()
    };
  }

  function clearSyntheticSession(){
    try{
      const raw=JSON.parse(localStorage.getItem('cx_session')||'null');
      const user=raw&&raw.user||{};
      const synthetic=!!raw&&(
        user.name==='Admin Demo'||
        user.name==='Cliente Demo'||
        user.name==='Evaluador (sin identidad)'||
        (raw.role==='shopper'&&!user.shopperId)||
        (!user.tenantId&&['admin','cliente','shopper'].includes(raw.role))
      );
      if(synthetic)localStorage.removeItem('cx_session');
    }catch(_){}
  }

  function projectForVisit(v){
    const list=arr(CX.data&&CX.data.projects);
    const id=str(v&& (v.periodId||v.projectId));
    return list.find(p=>str(p.id)===id)
      ||list.find(p=>str(p.periodKey)===str(v&&v.periodKey))
      ||list.find(p=>str(p.parentProjectId||p.program)==='cinepolis')
      ||null;
  }

  function configuredHonorarium(project,country){
    const value=project&&project.honorario&&project.honorario[country];
    const n=num(value);
    return n!=null&&n>0?n:null;
  }

  function applyProjectFinancialConfiguration(reason){
    if(!CX.data)return {applied:false,reason:'data_not_ready'};
    try{CX.projectFinancialModel?.normalizeAll?.('unified_runtime_financial_configuration');}catch(_){}
    let visits=0,posts=0;
    for(const v of arr(CX.data._visitas)){
      const country=str(v.pais||v.country),p=projectForVisit(v),configured=configuredHonorarium(p,country);
      const current=num(v.honorario);
      if(configured!=null&&(current==null||current<=0)){
        v.honorario=configured;
        v.contractHonorarium=configured;
        v.honorarioSource='project_configuration';
        visits++;
      }
    }
    for(const p of arr(CX.data._posts)){
      const country=str(p.pais||p.country),project=projectForVisit(p),configured=configuredHonorarium(project,country);
      const current=num(p.honorario);
      if(configured!=null&&(current==null||current<=0)){
        p.honorario=configured;
        p.contractHonorarium=configured;
        p.honorarioSource='project_configuration';
        posts++;
      }
    }
    window.CX_TYA_PROJECT_FINANCIAL_CONFIGURATION={
      applied:true,reason:reason||'runtime',visitsUpdated:visits,postsUpdated:posts,
      honorarium:{GT:60,HN:200},
      model:'delegado',
      billingModel:'delegated_coordination',
      localBilling:false,
      royaltyApplicable:false,
      royalty:0,
      compensationModel:'coordination_commission_shared',
      commissionSplit:{status:'project_configuration_required',valuesInvented:false},
      taxTreatment:'project_specific_not_inferred',
      source:'project_configuration',providerWrites:0,production:false,
      at:new Date().toISOString()
    };
    return window.CX_TYA_PROJECT_FINANCIAL_CONFIGURATION;
  }

  function clientCredentialStep(){
    const loginRoot=document.getElementById('login');
    const card=loginRoot&&loginRoot.querySelector('.login-card');
    if(!card||!CX.backendAuth)return;
    card.querySelector('#cxIntegratedAuthStep')?.remove();
    const step=document.createElement('div');
    step.id='cxIntegratedAuthStep';
    step.style.cssText='margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:left';
    step.innerHTML=
      '<div style="font-size:12px;font-weight:800;color:var(--t1);margin-bottom:3px">Portal del Cliente</div>'+
      '<div style="font-size:11.5px;color:var(--t3);line-height:1.45;margin-bottom:10px">Ingresa con el usuario y contraseña asignados a la marca.</div>'+
      '<label class="lbl" for="cxIntegratedAuthLogin">Usuario</label>'+
      '<input class="inp" id="cxIntegratedAuthLogin" type="text" autocomplete="username" style="width:100%;margin-bottom:9px">'+
      '<label class="lbl" for="cxIntegratedAuthPassword">Contraseña</label>'+
      '<input class="inp" id="cxIntegratedAuthPassword" type="password" autocomplete="current-password" style="width:100%;margin-bottom:9px">'+
      '<div id="cxIntegratedAuthError" aria-live="polite" style="display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin-bottom:9px"></div>'+
      '<div class="flex" style="justify-content:flex-end;gap:8px">'+
      '<button class="btn btn-ghost btn-sm" type="button" id="cxIntegratedAuthBack">Volver</button>'+
      '<button class="btn btn-pr btn-sm" type="button" id="cxIntegratedAuthSubmit">Ingresar</button></div>';
    card.appendChild(step);
    const login=step.querySelector('#cxIntegratedAuthLogin');
    const password=step.querySelector('#cxIntegratedAuthPassword');
    const error=step.querySelector('#cxIntegratedAuthError');
    const submit=step.querySelector('#cxIntegratedAuthSubmit');
    const showError=message=>{error.textContent=message||'';error.style.display=message?'block':'none';};
    step.querySelector('#cxIntegratedAuthBack').addEventListener('click',()=>step.remove());
    const run=async()=>{
      showError('');
      const user=str(login.value),pass=String(password.value||'');
      if(!user||!pass){showError('Completa usuario y contraseña.');return;}
      submit.disabled=true;submit.textContent='Validando...';
      try{
        const ctx=await CX.backendAuth.authenticate(user,pass,'staff');
        if(!['cliente','client'].includes(str(ctx&&ctx.role))){
          await CX.backendAuth.signOut();
          throw new Error('CLIENT_ROLE_REQUIRED');
        }
        password.value='';login.value='';submit.textContent='Cargando...';
      }catch(errorValue){
        password.value='';
        showError(/CLIENT_ROLE_REQUIRED/.test(str(errorValue&&errorValue.message))
          ?'La cuenta es válida, pero no tiene rol de Cliente para este portal.'
          :'No fue posible validar el acceso del Cliente.');
        submit.disabled=false;submit.textContent='Ingresar';password.focus();
      }
    };
    submit.addEventListener('click',run);
    password.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();run();}});
    login.focus();
  }

  function patchClientLogin(){
    if(!CX.app||CX.app.__c6UnifiedClientLogin)return;
    const previous=CX.app.selectRole.bind(CX.app);
    CX.app.selectRole=function(role){
      if(role==='cliente'&&CX.BACKEND?.enabled===true&&CX.BACKEND?.devPreviewAuth?.enabled===true&&!CX.backendAuth?.isReady?.()){
        clientCredentialStep();
        return;
      }
      return previous.apply(CX.app,arguments);
    };
    CX.app.__c6UnifiedClientLogin=true;
  }

  function renderFullHistoryComparative(){
    if(CX.session?.view!=='dashboard'||!CX.data)return;
    const summaries=arr(CX.data.periodOperationalSummary).slice()
      .filter(s=>/^\d{4}-\d{2}$/.test(str(s.periodKey)))
      .sort((a,b)=>str(a.periodKey).localeCompare(str(b.periodKey)));
    if(!summaries.length)return;
    const title=[...document.querySelectorAll('.card-t')]
      .find(x=>/Comparativo (último trimestre|histórico)/i.test(x.textContent||''));
    const card=title&&title.closest('.card');
    const table=card&&card.querySelector('table');
    if(!card||!table)return;
    title.textContent='📈 Comparativo histórico — todos los periodos HR';
    const oldMeta=card.querySelector('.card-h .muted');
    if(oldMeta)oldMeta.textContent=`${summaries.length} periodos · ${monthLabel(summaries[0].periodKey)} a ${monthLabel(summaries.at(-1).periodKey)}`;
    const ratio=(a,b)=>Number(b)>0?`${Math.round(Number(a||0)/Number(b)*100)}%`:'—';
    const rows=[
      ['% Cumplimiento',s=>ratio(s.realized,s.total)],
      ['Visitas realizadas',s=>Number(s.realized||0)],
      ['% Cuestionarios completados',s=>ratio(s.questionnaireCompleted,s.realized)],
      ['Visitas submitidas',s=>Number(s.submitted||0)],
      ['Cobertura de asignación',s=>ratio(s.assigned,s.total)],
      ['Pendientes de cuestionario',s=>Math.max(0,Number(s.realized||0)-Number(s.questionnaireCompleted||0))],
      ['Pendientes de submitir',s=>Math.max(0,Number(s.questionnaireCompleted||0)-Number(s.submitted||0))],
      ['Fuera de rango',s=>Number(s.outOfRange||0)]
    ];
    table.parentElement.style.overflowX='auto';
    table.style.minWidth=`${Math.max(980,220+summaries.length*82)}px`;
    table.innerHTML=
      `<thead><tr><th style="position:sticky;left:0;background:var(--panel);z-index:1">KPI</th>${summaries.map(s=>`<th>${esc(monthLabel(s.periodKey))}</th>`).join('')}</tr></thead>`+
      `<tbody>${rows.map(([label,get])=>`<tr><td style="position:sticky;left:0;background:var(--panel);z-index:1"><b>${esc(label)}</b></td>${summaries.map(s=>`<td>${esc(get(s))}</td>`).join('')}</tr>`).join('')}</tbody>`;
    card.dataset.c6AllHrPeriods='true';
  }

  function wrapDashboard(){
    const current=CX.modules&&CX.modules.dashboard;
    if(typeof current!=='function'||current.__c6UnifiedHistory)return;
    const wrapped=args=>{
      const out=current(args);
      setTimeout(()=>{applyProjectFinancialConfiguration('dashboard_render');renderFullHistoryComparative();},180);
      return out;
    };
    wrapped.__c6UnifiedHistory=true;
    CX.modules.dashboard=wrapped;
  }

  function refreshCurrentView(reason){
    applyProjectFinancialConfiguration(reason);
    setTimeout(()=>{
      if(CX.session?.view==='dashboard')renderFullHistoryComparative();
      try{CX.router?._reRender?.();}catch(_){}
    },0);
  }

  forceUnifiedConfig();
  installEarlyRoleClickGuard();
  clearSyntheticSession();

  const activate=reason=>{
    forceUnifiedConfig();
    installEarlyRoleClickGuard();
    clearSyntheticSession();
    patchClientLogin();
    wrapDashboard();
    applyProjectFinancialConfiguration(reason);
    window.CX_TYA_C6_UNIFIED_RUNTIME={
      ready:true,version:'c6-unified-human-runtime-v1',
      lane:'authenticated-human-canonical',
      singleVisibleProductLogin:true,
      earlyAuthClickGuard:true,
      directRoleEntryAllowed:false,
      hrAuthority:'live-all-detected-periods',
      identityOverlay:'firestore-exact-crosswalk',
      canonicalDomain:true,canonicalShopperPortal:true,canonicalFinance:true,
      projectHonorarium:{GT:60,HN:200},
      projectFinancialModel:'delegated_coordination',
      projectRoyaltyApplicable:false,
      providerWrites:0,deploys:0,merge:false,production:false,
      reason:reason||'activate',at:new Date().toISOString()
    };
  };

  window.addEventListener('cx:protected-auth-hr-authority-ready',()=>refreshCurrentView('protected_auth_hr_authority_ready'));
  window.addEventListener('cx:live-source-updated',()=>refreshCurrentView('live_source_updated'));
  if(CX.bus?.on)CX.bus.on('backend-ready',()=>refreshCurrentView('backend_ready'));

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>activate('dom_ready_before_boot'),{once:true});
  else activate('script_ready');
})();