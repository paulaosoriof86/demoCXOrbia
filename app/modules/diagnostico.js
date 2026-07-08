/* ============================================================
   CXOrbia · Diagnóstico & Readiness (PREVIEW-ONLY) — Bloque 2
   Refleja visualmente los contratos/runners backend SIN tocar backend.
   Todo es preview: gates apagados, fuente real pendiente, revisión
   humana pendiente y PRODUCCIÓN NO AUTORIZADA. No ejecuta import/sync/
   pago/envío real. No expone datos sensibles (usa sourceRefs opacas).
   ============================================================ */
window.CX = window.CX || {};

CX.diagStore = CX.diagStore || {
  /* ---- Synthetic input pack runner (preview) ----
     Casos sintéticos de cobertura. NO son datos reales; son fixtures
     para validar reglas del prototipo. pass/fail/warn son ilustrativos. */
  runnerPacks(){
    return [
      { id:'PACK-BASE',     n:'Cobertura base',            casos:42, pass:39, warn:3, fail:0 },
      { id:'PACK-EXPANDED', n:'Cobertura expandida',       casos:118, pass:104, warn:11, fail:3 },
      { id:'PACK-ROUTING',  n:'Ruteo de cuestionarios',    casos:26, pass:24, warn:2, fail:0 },
      { id:'PACK-LIFECYCLE',n:'Ciclo de vida de visita',   casos:31, pass:28, warn:2, fail:1 },
      { id:'PACK-SETTLE',   n:'Elegibilidad de liquidación',casos:22, pass:20, warn:2, fail:0 },
      { id:'PACK-EVIDENCE', n:'Almacenamiento de evidencia',casos:18, pass:15, warn:3, fail:0 },
      { id:'PACK-IMPORT',   n:'Import histórico limpio',    casos:37, pass:33, warn:2, fail:2 },
    ];
  },
  /* ---- Readiness por dominio (preview) ---- */
  readiness(){
    return [
      { dom:'Proyectos',            ready:6, blockers:0, warn:1 },
      { dom:'Visitas',              ready:41, blockers:2, warn:5 },
      { dom:'Shoppers',             ready:58, blockers:1, warn:4 },
      { dom:'Asignaciones',         ready:37, blockers:3, warn:2 },
      { dom:'Certificaciones',      ready:52, blockers:0, warn:3 },
      { dom:'Liquidaciones',        ready:24, blockers:2, warn:6 },
      { dom:'Pagos',                ready:12, blockers:4, warn:3 },
      { dom:'Rutas de cuestionario',ready:26, blockers:0, warn:2 },
    ];
  },
  /* ---- Bandeja de conflictos (preview) ----
     sourceRefs OPACAS y auditRef obligatorios. Sin nombres/PII.
     NUNCA dedupe por coincidencia visual: se resuelve por revisión humana. */
  conflicts(){
    return [
      { id:'CFL-2041', tipo:'assignment_sync', sev:'alta',  estado:'pendiente_revision', src:['hr#a4f2','plat#9c11'], audit:'aud_7c1e', razon:'assignmentSource divergente entre HR y plataforma' },
      { id:'CFL-2042', tipo:'settlement',      sev:'alta',  estado:'pendiente_revision', src:['liq#5d0a'],            audit:'aud_7c22', razon:'visita realizada sin cuestionario submitido — no elegible a pago' },
      { id:'CFL-2043', tipo:'import_dup',      sev:'media', estado:'en_revision',        src:['imp#77be','hr#a4f2'], audit:'aud_7c31', razon:'posible duplicado por llave natural — requiere confirmación humana' },
      { id:'CFL-2044', tipo:'questionnaire',   sev:'media', estado:'pendiente_revision', src:['q#3ab9'],              audit:'aud_7c40', razon:'ruta de cuestionario ambigua (por visita vs. general)' },
      { id:'CFL-2045', tipo:'evidence',        sev:'baja',  estado:'pendiente_revision', src:['ev#0f2c'],             audit:'aud_7c55', razon:'tipo de evidencia requerido faltante — Storage pendiente de gate' },
    ];
  },
  /* ---- Resolución de conflictos (preview, persistida localmente) ----
     NO fusiona ni deduplica: solo registra la DECISIÓN humana + motivo +
     auditRef + timestamp. La aplicación real la ejecuta el backend con su gate. */
  _rk:'cx_diag_confres',
  resolutions(){ try{ return JSON.parse(localStorage.getItem(this._rk)||'{}'); }catch(e){ return {}; } },
  resolve(id, decision, motivo){
    const all=this.resolutions();
    const audit='aud_'+Math.random().toString(16).slice(2,6);
    all[id]={ decision, motivo, auditRef:audit, fecha:new Date().toISOString(), estado:(decision==='escalar'?'en_revision':'resuelto') };
    try{ localStorage.setItem(this._rk, JSON.stringify(all)); }catch(e){}
    return all[id];
  },
  /* ---- Contratos/gates backend (preview-only) ----
     estado del gate: 'off' (no autorizado) es el único estado honesto
     mientras backend no active. 'human' = requiere revisión humana. */
  contracts(){
    return [
      { id:'admin-config',    n:'Admin configurability',      gate:'off',   nota:'reglas/NDA/planes/roles versionables — sin sobre-escritura silenciosa' },
      { id:'conflict-review', n:'Conflict review / readiness', gate:'preview',nota:'bandeja accionable (preview) con severidad, auditRef y motivo obligatorio · aplicación real pendiente de backend' },
      { id:'synthetic-run',   n:'Synthetic input pack runner', gate:'preview',nota:'fixtures sintéticas — no datos reales' },
      { id:'q-routing',       n:'Questionnaire routing',       gate:'off',   nota:'CXOrbia / TyAOnline / externo / general / HR por visita' },
      { id:'visit-lifecycle', n:'Visit lifecycle',             gate:'off',   nota:'realizada ≠ cuestionario ≠ submitido ≠ pago' },
      { id:'settle-elig',     n:'Settlement eligibility',      gate:'off',   nota:'elegibilidad → liquidación → lote → pago (pendiente)' },
      { id:'evidence-store',  n:'Evidence storage',            gate:'off',   nota:'sin adjuntos crudos/base64 — Storage pendiente de gate' },
      { id:'import-clean',    n:'Historical import clean',     gate:'off',   nota:'import real y anti-duplicado los ejecuta backend' },
      { id:'rule-version',    n:'Rule versioning',             gate:'human', nota:'cambios de regla con versión y motivo' },
      { id:'notif-outbox',    n:'Notification outbox',         gate:'off',   nota:'WhatsApp/correo preparados — envío real pendiente' },
      { id:'assign-sync',     n:'Assignment sync',             gate:'human', nota:'conflictos plataforma↔HR a revisión humana' },
      { id:'phase-a',         n:'Phase A operativa',           gate:'preview',nota:'HR fuente operacional · histórico control · Cinépolis proyecto TyA · multi-proyecto' },
      { id:'hr-keys',         n:'HR ↔ plataforma (llaves)',    gate:'off',   nota:'tenantId·projectId·visitId/hrRowId·shopperId·assignmentSource·assignmentSyncStatus·lastSyncedAt' },
      { id:'settle-fields',   n:'Liquidación / Mis beneficios',gate:'off',   nota:'honorario·boleto·combo·reembolso·total·estado·lote — sin banco/DPI/NDA' },
      { id:'q-sources',       n:'Cuestionarios / certif.',     gate:'off',   nota:'CXOrbia/TyAOnline/externo/general/HR por visita · certificaciones presentadas conservadas · no autoaprobar' },
      { id:'evidence-types',  n:'Evidencias / tipos',          gate:'off',   nota:'tipos requeridos · estados honestos · sin base64/adjuntos crudos' },
      { id:'sensitive',       n:'Datos sensibles (política)',  gate:'human', nota:'sin DPI/banco/NDA firmado/tokens/webhooks/URLs privadas — solo referencias opacas' },
    ];
  },
};

CX.module('diagnostico', ({data, ui})=>{
  const host = ui.el('div');
  const SEV = { alta:'r', media:'a', baja:'n' };
  const EST = { pendiente_revision:['Pendiente de revisión','a'], en_revision:['En revisión','b'], resuelto:['Resuelto','g'] };
  const GATE = { off:['⛔ Gate apagado · no autorizado','r'], preview:['🧪 Preview','b'], human:['👤 Requiere revisión humana','a'] };
  let tab = 'runner';

  const banner = `
    <div style="background:var(--amber-bg,#fff7e6);border:1px solid var(--amber,#d97706);border-radius:11px;padding:12px 15px;margin-bottom:16px;font-size:12.5px;color:#8a5b00;line-height:1.6">
      <b>🧪 Vista de diagnóstico — PREVIEW.</b> Todos los resultados son ilustrativos sobre fixtures sintéticas.
      <b>Gates apagados · fuente real pendiente · revisión humana pendiente · producción NO autorizada.</b>
      No ejecuta import/sync/pago/envío real y no expone datos sensibles (referencias opacas).
    </div>`;

  const tabs = [['runner','🧪 Synthetic runner'],['readiness','📊 Readiness'],['conflictos','⚖️ Conflictos'],['contratos','🔌 Contratos & gates']];

  const runnerView = ()=>{
    const packs = CX.diagStore.runnerPacks();
    const tot = packs.reduce((a,p)=>({casos:a.casos+p.casos,pass:a.pass+p.pass,warn:a.warn+p.warn,fail:a.fail+p.fail}),{casos:0,pass:0,warn:0,fail:0});
    return `
      <div class="grid g4" style="gap:10px;margin-bottom:14px">
        ${ui.kpi('Casos sintéticos',tot.casos,'b','no son datos reales')}
        ${ui.kpi('Pass',tot.pass,'g')}
        ${ui.kpi('Warnings',tot.warn,'a')}
        ${ui.kpi('Fail',tot.fail,'r','requieren revisión')}
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Synthetic input packs (preview)</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Cobertura base + expandida. La ejecución real y la escritura de resultados las hace el backend cuando el gate esté activo.</p>
        <table class="tbl"><thead><tr><th>Pack</th><th>Casos</th><th>Pass</th><th>Warn</th><th>Fail</th><th>Cobertura</th></tr></thead><tbody>
        ${packs.map(p=>{const pct=Math.round((p.pass/p.casos)*100);const tone=p.fail>0?'r':(p.warn>0?'a':'g');
          return `<tr><td><b>${p.n}</b><div style="font-size:10.5px;color:var(--t3);font-family:var(--disp,monospace)">${p.id}</div></td>
          <td>${p.casos}</td><td>${ui.bdg(p.pass,'g')}</td><td>${p.warn?ui.bdg(p.warn,'a'):'—'}</td><td>${p.fail?ui.bdg(p.fail,'r'):'—'}</td>
          <td style="min-width:120px"><div class="bar"><i style="width:${pct}%"></i></div><span style="font-size:10.5px;color:var(--t3)">${pct}%</span></td></tr>`;}).join('')}
        </tbody></table>
        <div style="margin-top:12px;text-align:right"><button class="btn btn-ghost btn-sm" id="dgRun">▷ Re-ejecutar (preview)</button></div>
      </div>`;
  };

  const readinessView = ()=>{
    const rows = CX.diagStore.readiness();
    return `
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Readiness por dominio (preview)</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Un dominio con <b>blockers</b> no avanza a producción. La confirmación real depende del backend y de la revisión humana.</p>
        <table class="tbl"><thead><tr><th>Dominio</th><th>Listos</th><th>Blockers</th><th>Warnings</th><th>Estado</th></tr></thead><tbody>
        ${rows.map(r=>{const st=r.blockers>0?['Bloqueado','r']:(r.warn>0?['Con warnings','a']:['Listo (preview)','g']);
          return `<tr><td><b>${r.dom}</b></td><td>${r.ready}</td><td>${r.blockers?ui.bdg(r.blockers,'r'):'—'}</td><td>${r.warn?ui.bdg(r.warn,'a'):'—'}</td><td>${ui.bdg(st[0],st[1])}</td></tr>`;}).join('')}
        </tbody></table>
      </div>`;
  };

  const conflictosView = ()=>{
    const c = CX.diagStore.conflicts();
    const res = CX.diagStore.resolutions();
    const DEC = { mantener:['Mantener ambos (sin fusionar)','b'], escalar:['Escalado a supervisor','a'], revisado:['Revisado · sin acción de dedupe','g'] };
    const pend = c.filter(x=>!res[x.id]).length;
    return `
      <div class="card card-p">
        <div class="between" style="margin-bottom:4px">
          <div class="card-t">Bandeja de conflictos (preview · accionable)</div>
          <div>${ui.bdg(pend+' pendientes','a')}</div>
        </div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Referencias de fuente <b>opacas</b> (sin PII). Toda revisión exige <b>motivo</b> y genera <b>auditRef</b>. <b>No hay acción de fusión/deduplicado</b> — la coincidencia visual nunca resuelve; solo la decisión humana registrada.</p>
        ${c.map(x=>{const r=res[x.id]; const estado=r?r.estado:x.estado;
          return `
          <div class="card" style="padding:12px 14px;margin-bottom:9px;border-left:3px solid var(--${SEV[x.sev]==='r'?'red':SEV[x.sev]==='a'?'amber':'border'},#ddd)">
            <div class="between" style="margin-bottom:6px">
              <div><b style="font-family:var(--disp,monospace)">${x.id}</b> <span style="font-size:11.5px;color:var(--t3)">· ${x.tipo}</span></div>
              <div class="flex" style="gap:6px">${ui.bdg('sev '+x.sev,SEV[x.sev])}${ui.bdg((EST[estado]||[estado,'n'])[0],(EST[estado]||[estado,'n'])[1])}</div>
            </div>
            <div style="font-size:12.5px;color:var(--t2);margin-bottom:8px">${x.razon}</div>
            <div class="flex wrap" style="gap:6px;align-items:center;font-size:10.5px;color:var(--t3);font-family:var(--disp,monospace)">
              ${x.src.map(s=>`<span class="bdg bdg-n">src:${s}</span>`).join('')}
              <span class="bdg bdg-n">auditRef:${r?r.auditRef:x.audit}</span>
              ${r?'':`<button class="btn btn-pr btn-sm" data-cfl="${x.id}" style="margin-left:auto">Revisar</button>`}
            </div>
            ${r?`<div style="margin-top:8px;padding:8px 10px;background:var(--panel-2,#f5f7fa);border-radius:8px;font-size:11.5px;color:var(--t2)">
              <b>${(DEC[r.decision]||[r.decision])[0]}</b> · motivo: “${r.motivo}” · ${(r.fecha||'').slice(0,16).replace('T',' ')}
              <span class="bdg bdg-b" style="margin-left:6px">aplicación real pendiente de backend</span>
            </div>`:''}
          </div>`;}).join('')}
      </div>`;
  };

  const contratosView = ()=>{
    const cs = CX.diagStore.contracts();
    return `
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Contratos backend & gates (preview)</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Estos contratos preparan runtime pero <b>no lo activan</b>. El único estado honesto sin backend es <b>gate apagado</b> / <b>preview</b> / <b>revisión humana</b>.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">
        ${cs.map(c=>`<div class="card" style="padding:13px 15px">
          <div class="between" style="margin-bottom:6px"><b style="font-size:13px">${c.n}</b></div>
          <div style="margin-bottom:8px">${ui.bdg(GATE[c.gate][0],GATE[c.gate][1])}</div>
          <div style="font-size:11.5px;color:var(--t2);line-height:1.5">${c.nota}</div>
          <div style="font-size:10px;color:var(--t3);margin-top:6px;font-family:var(--disp,monospace)">contract:${c.id}</div>
        </div>`).join('')}
        </div>
      </div>`;
  };

  const draw = ()=>{
    const body = tab==='runner'?runnerView():tab==='readiness'?readinessView():tab==='conflictos'?conflictosView():contratosView();
    host.innerHTML = `
      ${ui.ph('Diagnóstico & Readiness', 'Vista preview de runners, readiness, conflictos y gates — sin ejecución real')}
      ${banner}
      <div class="flex" style="gap:6px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:10px;flex-wrap:wrap">
        ${tabs.map(([t,l])=>`<button class="btn ${tab===t?'btn-pr':'btn-ghost'} btn-sm" data-tab="${t}">${l}</button>`).join('')}
      </div>
      ${body}`;
    host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;draw();}));
    const run=host.querySelector('#dgRun'); if(run)run.addEventListener('click',()=>ui.toast('Ejecución preview · los resultados reales los escribe el backend cuando el gate esté activo','',3800));
    host.querySelectorAll('[data-cfl]').forEach(b=>b.addEventListener('click',()=>{
      const id=b.dataset.cfl;
      const cf=CX.diagStore.conflicts().find(x=>x.id===id)||{};
      ui.modal('⚖️ Revisar conflicto '+id, `
        <div style="font-size:12.5px;color:var(--t2);line-height:1.6;margin-bottom:12px">${cf.razon||''}</div>
        <div style="background:var(--panel-2,#f5f7fa);border-radius:9px;padding:10px 12px;font-size:11px;color:var(--t3);font-family:var(--disp,monospace);margin-bottom:14px">
          ${(cf.src||[]).map(s=>'src:'+s).join(' · ')} · tipo:${cf.tipo||''}
        </div>
        <label style="font-size:12px;color:var(--t3);display:block;margin-bottom:5px">Decisión (la fusión/dedupe NO es una opción)</label>
        <select id="cflDec" style="width:100%;font-size:12.5px;padding:8px 10px;border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
          <option value="mantener">Mantener ambos registros (sin fusionar)</option>
          <option value="escalar">Escalar a supervisor</option>
          <option value="revisado">Marcar revisado (sin acción de dedupe)</option>
        </select>
        <label style="font-size:12px;color:var(--t3);display:block;margin-bottom:5px">Motivo (obligatorio)</label>
        <textarea id="cflMot" placeholder="Explica la decisión — queda en el auditRef" style="width:100%;min-height:74px;font-size:12.5px;padding:9px 10px;border:1px solid var(--border);border-radius:8px;font-family:inherit;line-height:1.5"></textarea>
        <div style="background:var(--amber-bg,#fff7e6);border-radius:8px;padding:8px 11px;font-size:11.5px;color:#8a5b00;margin:12px 0">La decisión se registra en preview con auditRef y fecha. La aplicación real la ejecuta el backend cuando el gate esté activo.</div>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="cflOk">Registrar decisión</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#cflOk').addEventListener('click',()=>{
          const motivo=(ov.querySelector('#cflMot').value||'').trim();
          if(!motivo){ ui.toast('El motivo es obligatorio','warn'); return; }
          const dec=ov.querySelector('#cflDec').value;
          const r=CX.diagStore.resolve(id, dec, motivo);
          close();
          ui.toast('Decisión registrada (preview) · auditRef '+r.auditRef+' · aplicación real pendiente de backend','ok',4200);
          draw();
        });
      }});
    }));
  };

  draw();
  return host;
});
