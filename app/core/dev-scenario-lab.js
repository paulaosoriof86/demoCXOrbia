/* CXORBIA DEV · LABORATORIO DE ESCENARIOS
   DEV-only visible evidence panel.
   This file never invents scenario execution, cleanup or writes. Real evidence must be
   supplied by the controlled browser runner after using the visible product flows. */
window.CX = window.CX || {};

(function(){
  const STATES = [
    'AUTH_READY','CLAIMS_READY','MEMBERSHIP_READY','DATA_READY','SHELL_READY','ROUTE_READY',
    'VIEW_READY','DOMAIN_READY','SCENARIO_READY','SCENARIO_EXECUTED','CROSS_MODULE_VERIFIED','CLEANUP_VERIFIED'
  ];
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
    }catch(_){ return false; }
  }

  function stableList(value){
    return Array.isArray(value) ? value : [];
  }

  function fingerprint(){
    const d=CX.data||{};
    const visits=stableList(d._visitas||d.visits);
    const shoppers=stableList(d.shoppers);
    const postulaciones=stableList(d.postulaciones);
    const project=d.period?d.period():null;
    const base={
      tenantId:(CX.backendAuth&&CX.backendAuth.context&&CX.backendAuth.context()?.tenantId)||(CX.BRAND&&CX.BRAND.id)||null,
      projectId:(project&&project.id)||d.currentProjectId||null,
      periodId:d.currentPeriodId||null,
      visits:visits.length,
      shoppers:shoppers.length,
      postulaciones:postulaciones.length,
      auditEntities:visits.concat(shoppers,postulaciones).filter(x=>String((x&&x.id)||'').startsWith('AUDIT-')).length
    };
    try{ base.hash=btoa(unescape(encodeURIComponent(JSON.stringify(base)))).slice(0,24); }
    catch(_){ base.hash=JSON.stringify(base); }
    return base;
  }

  function preflightState(state){
    const d=CX.data||{};
    const ctx=(CX.backendAuth&&CX.backendAuth.context&&CX.backendAuth.context())||null;
    const role=CX.session&&CX.session.role;
    const view=document.getElementById('view');
    const route=CX.session&&CX.session.view;
    const project=d.period?d.period():null;
    const dataReady=Array.isArray(d._visitas||d.visits)&&Array.isArray(d.shoppers)&&Array.isArray(d.projects);
    const shellReady=!!document.querySelector('#app.on #rail')&&typeof CX.router?.nav==='function';
    const map={
      AUTH_READY:{ok:ctx?.authenticated===true||!!role,observed:ctx?.authenticated===true?'firebase_authenticated':(role||'no_session'),expected:'authenticated session'},
      CLAIMS_READY:{ok:!!(ctx?.role||(CX.session&&CX.session.user)),observed:ctx?.role||(CX.session&&CX.session.user&&CX.session.user.role)||'no_claims',expected:'role/tenant/project context'},
      MEMBERSHIP_READY:{ok:!!project,observed:project?project.id:'no_project',expected:'project membership context'},
      DATA_READY:{ok:dataReady,observed:dataReady?`visits=${stableList(d._visitas||d.visits).length}; shoppers=${stableList(d.shoppers).length}`:'missing canonical arrays',expected:'canonical CX.data arrays loaded'},
      SHELL_READY:{ok:shellReady,observed:shellReady?'router_and_rail_ready':'shell_not_ready',expected:'app shell, router and rail ready'},
      ROUTE_READY:{ok:!!route,observed:route||'no_route',expected:'CX.session.view set'},
      VIEW_READY:{ok:!!(view&&view.children.length),observed:view?String(view.children.length):'no_view',expected:'rendered view children'},
      DOMAIN_READY:{ok:!!(project&&d.currentPeriodId),observed:project?(project.name||project.id):'no_project',expected:'tenant/project/period domain'}
    };
    return map[state]||null;
  }

  function pendingRunnerReport(){
    const before=fingerprint();
    const auditId='AUDIT-PENDING-'+Date.now().toString(36).toUpperCase();
    const preflight=STATES.slice(0,8).map(state=>{
      const c=preflightState(state)||{ok:false,observed:'unknown',expected:'known state'};
      return {
        state,
        status:c.ok?'PASS':'BLOCKED',
        code:c.ok?`PASS_${state}`:`BLOCKED_${state}`,
        module:(CX.session&&CX.session.view)||'login',
        route:(CX.session&&CX.session.view)||'none',
        action:'read_only_preflight',
        expected:c.expected,
        observed:c.observed,
        snapshot:fingerprint()
      };
    });
    const pending=STATES.slice(8).map(state=>({
      state,
      status:'BLOCKED',
      code:`BLOCKED_${state}_AWAITING_CONTROLLED_RUNNER`,
      module:'scenario-runner',
      route:'pending',
      action:'await_controlled_ui_scenario',
      expected:'runner evidence from visible product flows and exact cleanup',
      observed:'no runner evidence ingested',
      snapshot:fingerprint()
    }));
    return {
      schemaVersion:'cxorbia.dev-scenario-lab.visible-shell.v2',
      generatedAt:new Date().toISOString(),
      activeScenario:auditId,
      stage:'SCENARIO_READY',
      decision:'BLOCKED_AWAITING_CONTROLLED_RUNNER',
      cleanup:null,
      baselineRestoredAfterCleanup:null,
      fingerprintBefore:before,
      fingerprintAfter:null,
      profiles:PROFILES.map(profile=>({profile,auditId,decision:'BLOCKED',steps:preflight.concat(pending)})),
      captures:[]
    };
  }

  function sanitizeEvidence(value){
    const raw=JSON.parse(JSON.stringify(value||{}));
    const text=JSON.stringify(raw);
    if(/-----BEGIN .*PRIVATE KEY-----|"private_key"\s*:|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/i.test(text)){
      throw new Error('DEV_LAB_EVIDENCE_NOT_SANITIZED');
    }
    return raw;
  }

  function validRunnerReport(report){
    return report&&
      report.schemaVersion==='cxorbia.dev-scenario-lab.runner-evidence.v1'&&
      Array.isArray(report.profiles)&&
      report.profiles.length===PROFILES.length&&
      report.profiles.every(p=>PROFILES.includes(p.profile)&&Array.isArray(p.steps))&&
      typeof report.baselineRestoredAfterCleanup==='boolean'&&
      report.fingerprintBefore&&report.fingerprintAfter;
  }

  function render(report){
    let root=document.getElementById('cx-dev-lab');
    if(!root){
      root=document.createElement('section');
      root.id='cx-dev-lab';
      root.className='cx-dev-lab';
      document.body.appendChild(root);
    }
    const rows=(report?.profiles||[]).flatMap(p=>(p.steps||[]).map(s=>({profile:p.profile,...s})));
    root.innerHTML=`<div class="cx-dev-lab__head">
      <div><b>CXORBIA DEV · LABORATORIO DE ESCENARIOS</b><span>${report?.activeScenario||'sin ejecutar'}</span></div>
      <button type="button" id="cxDevLabRun">Ejecutar pruebas</button>
    </div>
    <div class="cx-dev-lab__meta">
      <span>Decisión: ${report?.decision||'-'}</span>
      <span>Etapa: ${report?.stage||'-'}</span>
      <span>Cleanup: ${report?.baselineRestoredAfterCleanup==null?'pendiente':String(report.baselineRestoredAfterCleanup)}</span>
    </div>
    <div class="cx-dev-lab__timeline">${rows.map(r=>`<div class="cx-dev-step is-${String(r.status||'blocked').toLowerCase()}"><b>${r.status||'BLOCKED'}</b><span>${r.profile}</span><small>${r.state||'-'}</small><em>${r.module||'-'} / ${r.route||'-'}</em><code>${r.code||'-'}</code><p>${r.expected||'-'} → ${r.observed||'-'}</p></div>`).join('')||'<div class="cx-dev-step">Pendiente de evidencia del runner controlado</div>'}</div>
    <pre>${JSON.stringify({fingerprintBefore:report?.fingerprintBefore||null,fingerprintAfter:report?.fingerprintAfter||null,captures:report?.captures||[]},null,2)}</pre>`;
    root.querySelector('#cxDevLabRun').addEventListener('click',()=>CX.devScenarioLab.requestRun());
  }

  CX.devScenarioLab={
    enabled:isDev(),
    profiles:PROFILES.slice(),
    lastReport:null,
    mount(){
      if(!isDev()) return;
      this.lastReport=this.lastReport||pendingRunnerReport();
      render(this.lastReport);
    },
    requestRun(){
      if(!isDev()) return null;
      this.lastReport=pendingRunnerReport();
      this.lastReport.decision='RUN_REQUESTED_AWAITING_CONTROLLED_RUNNER';
      this.lastReport.stage='SCENARIO_READY';
      render(this.lastReport);
      window.dispatchEvent(new CustomEvent('cxorbia:dev-lab-run-request',{detail:{profiles:PROFILES.slice(),fingerprintBefore:this.lastReport.fingerprintBefore}}));
      return this.lastReport;
    },
    ingest(report){
      if(!isDev()) throw new Error('DEV_LAB_DISABLED');
      const safe=sanitizeEvidence(report);
      if(!validRunnerReport(safe)) throw new Error('DEV_LAB_RUNNER_EVIDENCE_INVALID');
      this.lastReport=safe;
      render(this.lastReport);
      return this.lastReport;
    }
  };

  window.addEventListener('message',event=>{
    if(event.source!==window) return;
    if(event.data?.type!=='CXORBIA_DEV_LAB_RUNNER_EVIDENCE') return;
    try{ CX.devScenarioLab.ingest(event.data.report); }
    catch(error){ console.error('[CX DEV LAB]',error); }
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>CX.devScenarioLab.mount());
  else CX.devScenarioLab.mount();
})();
