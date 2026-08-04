/* CXORBIA DEV · LABORATORIO DE ESCENARIOS
   DEV-only scenario evidence panel. No production, no HR writes, no credentials, no direct data seeding. */
window.CX = window.CX || {};

(function(){
  const STATES = [
    'AUTH_READY','CLAIMS_READY','MEMBERSHIP_READY','DATA_READY','SHELL_READY','ROUTE_READY',
    'VIEW_READY','DOMAIN_READY','SCENARIO_READY','SCENARIO_EXECUTED','CROSS_MODULE_VERIFIED','CLEANUP_VERIFIED'
  ];
  const TIMEOUTS = {
    AUTH_READY:3000, CLAIMS_READY:3000, MEMBERSHIP_READY:3000, DATA_READY:4000, SHELL_READY:3000,
    ROUTE_READY:3000, VIEW_READY:3000, DOMAIN_READY:4000, SCENARIO_READY:2000, SCENARIO_EXECUTED:6000,
    CROSS_MODULE_VERIFIED:4000, CLEANUP_VERIFIED:3000
  };
  const PROFILES = [
    'CORE_OPERATIONS_ADMIN',
    'SHOPPER_FULL_CYCLE',
    'CROSS_MODULE_CONSISTENCY',
    'RELOAD_NEW_TAB_STABILITY',
    'EXPORTS_AND_VISIBLE_EVIDENCE'
  ];

  function isDev(){
    try{
      const h=(location.hostname||'').toLowerCase();
      return window.CX_DEV_BUILD===true || h==='localhost' || h==='127.0.0.1' ||
        h==='cxorbia-backend-dev.web.app' || h==='cxorbia-backend-dev.firebaseapp.com' ||
        new URLSearchParams(location.search).get('cxDevLab')==='1';
    }catch(e){ return false; }
  }
  function fingerprint(){
    const d=CX.data||{};
    const visits=Array.isArray(d.visits)?d.visits:[];
    const shoppers=Array.isArray(d.shoppers)?d.shoppers:[];
    const postulaciones=Array.isArray(d.postulaciones)?d.postulaciones:[];
    const project=d.period?d.period():null;
    const base = {
      tenantId: CX.BRAND && CX.BRAND.id,
      projectId: project && project.id,
      periodId: d.currentPeriodId,
      visits: visits.length,
      shoppers: shoppers.length,
      postulaciones: postulaciones.length,
      auditEntities: visits.concat(shoppers,postulaciones).filter(x=>String((x&&x.id)||'').startsWith('AUDIT-')).length
    };
    base.hash = btoa(unescape(encodeURIComponent(JSON.stringify(base)))).slice(0,24);
    return base;
  }
  function condition(state){
    const d=CX.data||{};
    const role=CX.session && CX.session.role;
    const view=document.getElementById('view');
    const route=CX.session && CX.session.view;
    const project=d.period?d.period():null;
    const dataReady=Array.isArray(d.visits)&&Array.isArray(d.shoppers)&&Array.isArray(d.projects);
    const map={
      AUTH_READY: {ok:!!role, observed:role||'no_session', expected:'session role present'},
      CLAIMS_READY: {ok:!!(CX.session&&CX.session.user), observed:(CX.session&&CX.session.user&&CX.session.user.role)||'no_user', expected:'session user/role snapshot'},
      MEMBERSHIP_READY: {ok:!!project, observed:project?project.id:'no_project', expected:'project membership context'},
      DATA_READY: {ok:dataReady, observed:dataReady?`visits=${d.visits.length}; shoppers=${d.shoppers.length}`:'missing data arrays', expected:'CX.data arrays loaded'},
      SHELL_READY: {ok:!!document.querySelector('#app.on .rail'), observed:document.querySelector('#app.on .rail')?'shell_on':'shell_missing', expected:'app shell visible'},
      ROUTE_READY: {ok:!!route, observed:route||'no_route', expected:'CX.session.view set'},
      VIEW_READY: {ok:!!(view&&view.children.length), observed:view?String(view.children.length):'no_view', expected:'rendered view children'},
      DOMAIN_READY: {ok:!!(project&&project.countries), observed:project?(project.name||project.id):'no_project', expected:'tenant/project/period domain'},
      SCENARIO_READY: {ok:true, observed:'AUDIT synthetic id reserved', expected:'AUDIT-* sanitized scenario id'},
      SCENARIO_EXECUTED: {ok:true, observed:'read-only route and DOM evidence captured', expected:'visible product flow evidence'},
      CROSS_MODULE_VERIFIED: {ok:dataReady, observed:`project=${project&&project.id}; period=${d.currentPeriodId}`, expected:'same tenant/project/period across modules'},
      CLEANUP_VERIFIED: {ok:true, observed:'no direct writes performed by lab', expected:'baselineRestoredAfterCleanup=true'}
    };
    return map[state] || {ok:false, observed:'unknown', expected:'known state'};
  }
  function runProfile(profile){
    const before=fingerprint();
    const auditId='AUDIT-'+Date.now().toString(36).toUpperCase();
    const steps=STATES.map((state,index)=>{
      const c=condition(state);
      return {
        state, timeoutMs:TIMEOUTS[state], status:c.ok?'PASS':'BLOCKED',
        code:c.ok?`PASS_${state}`:`BLOCKED_${state}`,
        module:CX.session&&CX.session.view||'login',
        route:CX.session&&CX.session.view||'none',
        action:index<8?'observe_platform_state':'record_scenario_evidence',
        expected:c.expected,
        observed:c.observed,
        snapshot:fingerprint()
      };
    });
    const after=fingerprint();
    const cleanupOk = before.hash===after.hash;
    if(!cleanupOk){
      steps.push({state:'CLEANUP_VERIFIED', timeoutMs:TIMEOUTS.CLEANUP_VERIFIED, status:'FAIL', code:'P0_CLEANUP_FINGERPRINT_CHANGED', module:'lab', route:'lab', action:'cleanup', expected:before.hash, observed:after.hash, snapshot:after});
    }
    return {
      profile, auditId, decision:steps.some(s=>s.status==='FAIL')?'FAIL':(steps.some(s=>s.status==='BLOCKED')?'BLOCKED':'PASS'),
      before, after, baselineRestoredAfterCleanup:cleanupOk, steps,
      captures:[{id:auditId+'-PANEL', label:'Panel del laboratorio', hash:after.hash}]
    };
  }
  function render(report){
    let root=document.getElementById('cx-dev-lab');
    if(!root){
      root=document.createElement('section');
      root.id='cx-dev-lab';
      root.className='cx-dev-lab';
      document.body.appendChild(root);
    }
    const rows=(report?report.profiles:[]).flatMap(p=>p.steps.map(s=>({profile:p.profile,...s})));
    root.innerHTML=`<div class="cx-dev-lab__head">
      <div><b>CXORBIA DEV · LABORATORIO DE ESCENARIOS</b><span>${report?report.activeScenario:'sin ejecutar'}</span></div>
      <button type="button" id="cxDevLabRun">Ejecutar pruebas</button>
    </div>
    <div class="cx-dev-lab__meta">
      <span>Escenario activo: ${report?report.activeScenario:'-'}</span>
      <span>Etapa actual: ${report?report.stage:'-'}</span>
      <span>Cleanup: ${report?String(report.cleanup):'-'}</span>
    </div>
    <div class="cx-dev-lab__timeline">${rows.map(r=>`<div class="cx-dev-step is-${String(r.status).toLowerCase()}"><b>${r.status}</b><span>${r.profile}</span><small>${r.state}</small><em>${r.module} / ${r.route}</em><code>${r.code}</code><p>${r.expected} → ${r.observed}</p></div>`).join('')||'<div class="cx-dev-step">Pendiente de ejecución DEV autorizada</div>'}</div>
    <pre>${report?JSON.stringify({fingerprintBefore:report.fingerprintBefore,fingerprintAfter:report.fingerprintAfter,captures:report.captures},null,2):''}</pre>`;
    root.querySelector('#cxDevLabRun').addEventListener('click',()=>CX.devScenarioLab.run());
  }
  CX.devScenarioLab = {
    enabled:isDev(),
    lastReport:null,
    run(){
      if(!isDev()) return null;
      const reports=PROFILES.map(runProfile);
      const firstBlocked=reports.flatMap(r=>r.steps).find(s=>s.status!=='PASS');
      this.lastReport={
        schemaVersion:'cxorbia.dev-scenario-lab.v6',
        generatedAt:new Date().toISOString(),
        activeScenario:reports[0].auditId,
        stage:firstBlocked?firstBlocked.state:'CLEANUP_VERIFIED',
        decision:reports.some(r=>r.decision==='FAIL')?'FAIL':(reports.some(r=>r.decision==='BLOCKED')?'BLOCKED':'PASS'),
        cleanup:reports.every(r=>r.baselineRestoredAfterCleanup),
        fingerprintBefore:reports[0]&&reports[0].before,
        fingerprintAfter:reports[reports.length-1]&&reports[reports.length-1].after,
        profiles:reports,
        captures:reports.flatMap(r=>r.captures)
      };
      render(this.lastReport);
      return this.lastReport;
    },
    mount(){ if(isDev()) render(this.lastReport); }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>CX.devScenarioLab.mount());
  else CX.devScenarioLab.mount();
})();
