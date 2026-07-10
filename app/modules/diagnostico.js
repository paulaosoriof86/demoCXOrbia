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
  /* ---- P0-2 (20260710): Module readiness matrix — patrón genérico ----
     Refleja la matriz que backend preparó DESPUÉS del paquete: un módulo no puede
     mostrarse como "conectado/importado/producción" si no tiene readiness.
     status: GO_READY | WARNING_READY | NO_GO_BLOCKER (nunca "producción"/"conectado" real). */
  moduleReadiness(){
    const mk=(mod,ready,blockers,warn,nota)=>({mod,ready,blockers,warn,
      status: blockers>0?'NO_GO_BLOCKER':(warn>0?'WARNING_READY':'GO_READY'), nota});
    return [
      mk('Tenant / Proyecto / Periodo', 8,0,1,'separación funcional lista (preview) · falta persistencia real multi-tenant en backend'),
      mk('HR / Source',                 5,1,2,'lectura preview de hoja/import · escritura real y gate de fuente pendiente backend'),
      mk('Usuarios / Personas / Roles / Scopes', 6,0,2,'persistencia local (preview) · Auth real y claims pendiente backend'),
      mk('Shoppers / Perfiles protegidos', 9,1,3,'campos sensibles enmascarados en UI · acceso real detrás de Auth pendiente'),
      mk('Visitas / Asignaciones',      12,2,4,'flujo completo en preview · sincronía real con HR pendiente backend'),
      mk('Postulaciones / Agendamiento / Reprogramación / Cancelación', 7,1,2,'flujo completo en preview · notificación real pendiente backend'),
      mk('Academia / Cursos / Manuales', 10,0,0,'contenido y edición completos — no depende de backend para operar'),
      mk('Certificaciones / Carryover', 6,1,2,'regla de vigencia en preview · fuente de verdad real pendiente backend'),
      mk('Liquidaciones / Pagos',       5,2,3,'cálculo y lotes en preview · pago real (bancario) pendiente gate + backend'),
      mk('Notificaciones / Outbox',     4,1,2,'preparación de mensaje (WA/correo) real · envío real pendiente backend/Make'),
      mk('reviewQueue / Conflictos',    5,0,1,'bandeja accionable en preview · aplicación real de la decisión pendiente backend'),
      mk('auditEvents',                 4,0,1,'registro local de decisiones (preview) · almacenamiento inmutable pendiente backend'),
      mk('Gates de integraciones (Make/Gemini/pagos)', 3,1,1,'configuración y prueba simulada · conexión real pendiente backend'),
      mk('Branding / PWA',              7,0,0,'white-label + manifest/favicon dinámicos — ya operativo sin backend'),
      mk('Switch CX.data ↔ backend real', 1,1,0,'un solo mock layer — adapter real (Firestore u otro) no conectado'),
    ];
  },
  /* ---- Readiness por dominio (preview) — heredado, complementa la matriz por módulo ---- */
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
      { id:'phase-a',         n:'Phase A operativa',           gate:'preview',nota:'HR fuente operacional · histórico control · seed configurable por tenant/proyecto · multi-proyecto' },
      { id:'hr-keys',         n:'HR ↔ plataforma (llaves)',    gate:'off',   nota:'tenantId·projectId·visitId/hrRowId·shopperId·assignmentSource·assignmentSyncStatus·lastSyncedAt' },
      { id:'settle-fields',   n:'Liquidación / Mis beneficios',gate:'off',   nota:'honorario·boleto·combo·reembolso·total·estado·lote — sin banco/DPI/NDA' },
      { id:'q-sources',       n:'Cuestionarios / certif.',     gate:'off',   nota:'CXOrbia/TyAOnline/externo/general/HR por visita · certificaciones presentadas conservadas · no autoaprobar' },
      { id:'evidence-types',  n:'Evidencias / tipos',          gate:'off',   nota:'tipos requeridos · estados honestos · sin base64/adjuntos crudos' },
      { id:'sensitive',       n:'Datos sensibles (política)',  gate:'human', nota:'sin DPI/banco/NDA firmado/tokens/webhooks/URLs privadas — solo referencias opacas' },
    ];
  },
};

CX.diagStore.goNoGo = function(){
  return [
    {ok:true,  n:'No hay nombres reales de tenant/cliente/proyecto hardcodeados en app/core o app/modules'},
    {ok:true,  n:'Tenant / Proyecto / Periodo separados (periodo = ronda dentro del proyecto, nunca un proyecto nuevo)'},
    {ok:true,  n:'Proyecto no mezcla periodos (UI agrupa periodos bajo su proyecto en Proyectos)'},
    {ok:true,  n:'KPIs (Dashboard/Visitas/Finanzas) filtran por periodo activo, no acumulan sin opción explícita'},
    {ok:true,  n:'Fuente de HR configurable y enmascarada (sourceRef opaco, URL nunca en localStorage)'},
    {ok:true,  n:'Alta de nuevos tenants/proyectos es manual (wizard) — sin datos de una migración real copiados'},
    {ok:true,  n:'Marca/PWA/favicon/manifest configurables desde Identidad de Marca — sin fallback fijo salvo CXOrbia'},
    {ok:true,  n:'Banderas/países/monedas configurables por tenant y por proyecto — no hardcodeadas'},
    {ok:true,  n:'Datos completos (DPI/banco/cuenta) requieren rol admin/super — enmascarados 🔒 para el resto'},
    {ok:true,  n:'Integraciones (Make/Gemini/pagos/WhatsApp/correo) muestran estados honestos — nunca "enviado" sin gate activo'},
    {ok:true,  n:'Academia refleja el pipeline de readiness, candidatos protegidos y reviewQueue introducidos en este paquete'},
  ];
};

/* ---- Checklist separado: qué falta para PRODUCCIÓN/CONEXIÓN REAL (nunca todo OK aquí) ----
   Esto es honesto a propósito: el prototipo puede estar "GO" y aun así la conexión real
   sigue "NO_GO" mientras backend/Auth/gates no estén activos. No confundir ambos. */
CX.diagStore.goNoGoProduccion = function(){
  return [
    {ok:false, n:'Auth real (Firebase u otro) conectado y validando roles/claims — hoy es solo sesión local de demo'},
    {ok:false, n:'Switch CX.data → backend real (Firestore u otro) activado — hoy es un único mock layer en memoria/localStorage'},
    {ok:false, n:'Import real de HR/source (escritura) — hoy todo queda en dry-run/source-safe, nunca se escribe'},
    {ok:false, n:'Gates de Make/Gemini/pagos activados — hoy todos están apagados o en preview'},
    {ok:false, n:'Acceso de lectura protegido (protected read) servido por backend — hoy el enmascarado es solo de UI'},
    {ok:false, n:'Writeback real hacia la fuente de HR (Google Sheets u otra) — hoy no existe ese canal'},
    {ok:false, n:'Liquidaciones/pagos reales con cruce bancario — hoy toda liquidación queda como candidata/preview'},
  ];
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

  const tabs = [['runner','🧪 Synthetic runner'],['readiness','📊 Readiness'],['conflictos','⚖️ Conflictos'],['contratos','🔌 Contratos & gates'],['gonogo','✅ GO/NO-GO']];

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
    const mrows = CX.diagStore.moduleReadiness();
    const ST = { GO_READY:['GO_READY','g'], WARNING_READY:['WARNING_READY','a'], NO_GO_BLOCKER:['NO_GO_BLOCKER','r'] };
    return `
      <div class="card card-p" style="margin-bottom:16px">
        <div class="card-t" style="margin-bottom:4px">Matriz de readiness por módulo (preview)</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Ningún módulo se muestra como "conectado/importado/producción" sin este readiness. <b>NO_GO_BLOCKER</b> = no avanza; <b>WARNING_READY</b> = avanza con revisión humana; <b>GO_READY</b> = sin blockers conocidos en preview (la confirmación real la da el backend).</p>
        <table class="tbl"><thead><tr><th>Módulo</th><th>Listos</th><th>Blockers</th><th>Warnings</th><th>Estado</th></tr></thead><tbody>
        ${mrows.map(r=>`<tr><td><b>${r.mod}</b><div style="font-size:10.5px;color:var(--t3);margin-top:2px">${r.nota}</div></td><td>${r.ready}</td><td>${r.blockers?ui.bdg(r.blockers,'r'):'—'}</td><td>${r.warn?ui.bdg(r.warn,'a'):'—'}</td><td>${ui.bdg(ST[r.status][0],ST[r.status][1])}</td></tr>`).join('')}
        </tbody></table>
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Readiness por dominio de datos (preview)</div>
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
    let importCandidates=[]; try{ importCandidates=JSON.parse(localStorage.getItem('cx_review_queue')||'[]'); }catch(e){}
    const importBlock = importCandidates.length? `
      <div class="card card-p" style="margin-bottom:14px">
        <div class="between" style="margin-bottom:6px"><div class="card-t">Candidatos desde HR/Source (Importador)</div>${ui.bdg(importCandidates.length+' en reviewQueue','a')}</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:10px">Pipeline: dry-run → source-safe → protected candidates → <b>reviewQueue</b> (aquí) → auditEvents → no escrito. Ninguno se escribió aún.</p>
        <table class="tbl"><thead><tr><th>Tipo</th><th>Cantidad</th><th>Origen</th><th>Referencia</th><th>Cuándo</th><th>Estado</th></tr></thead><tbody>
        ${importCandidates.slice(-15).reverse().map(x=>`<tr><td>${x.tipo}</td><td>${x.cantidad}</td><td style="font-size:11px;color:var(--t3)">${x.origen||'importador'}</td><td style="font-size:10px;color:var(--t3);font-family:var(--disp,monospace)">${x.sourceRef?x.sourceRef+' · ':''}${x.auditRef?'audit:'+x.auditRef:''}</td><td style="font-size:11px;color:var(--t3)">${(x.fecha||'').slice(0,16).replace('T',' ')}</td><td>${ui.bdg('pendiente review','a')}</td></tr>`).join('')}
        </tbody></table>
      </div>`:'';
    return `
      ${importBlock}
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

  const gonogoView = ()=>{
    const items = CX.diagStore.goNoGo();
    const prod = CX.diagStore.goNoGoProduccion();
    const allOk = items.every(i=>i.ok);
    const prodOk = prod.every(i=>i.ok);
    return `
      <div class="card card-p" style="margin-bottom:14px">
        <div class="between" style="margin-bottom:4px"><div class="card-t">Checklist GO / NO-GO del prototipo</div>${ui.bdg(allOk?'GO':'NO GO',allOk?'g':'r')}</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Criterios de la auditoría del paquete genérico, sobre lo que el <b>frontend/prototipo</b> debe cumplir.</p>
        ${items.map(i=>`<div class="flex" style="gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--border)"><span style="font-size:14px">${i.ok?'✅':'⛔'}</span><span style="font-size:12.5px;color:var(--t2)">${i.n}</span></div>`).join('')}
      </div>
      <div class="card card-p">
        <div class="between" style="margin-bottom:4px"><div class="card-t">Checklist GO / NO-GO de producción / conexión real</div>${ui.bdg(prodOk?'GO':'NO GO — backend pendiente',prodOk?'g':'r')}</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Este bloque <b>nunca</b> debe salir todo en verde mientras no haya backend real conectado — "GO del prototipo" ≠ "listo para producción".</p>
        ${prod.map(i=>`<div class="flex" style="gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--border)"><span style="font-size:14px">${i.ok?'✅':'⛔'}</span><span style="font-size:12.5px;color:var(--t2)">${i.n}</span></div>`).join('')}
      </div>`;
  };

  const draw = ()=>{
    const body = tab==='runner'?runnerView():tab==='readiness'?readinessView():tab==='conflictos'?conflictosView():tab==='gonogo'?gonogoView():contratosView();
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
