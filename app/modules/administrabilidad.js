/* ============================================================
   CXOrbia · Centro de administración — Bloque 3
   Superficie de configuración versionada por dominio. Refleja qué es
   administrable, versionado y con motivo obligatorio — SIN activar
   escritura real ni sobre-escribir en silencio.
   - NDA: usa CX.confidencialidad (versión real, demo local). Editar
     SUBE versión; NO altera las aceptaciones ya presentadas (auditLog).
   - Planes: usa CX.PLANS (solo lectura + versión vista previa).
   Sin autorizar · fuente real pendiente · revisión humana · producción NO autorizada.
   ============================================================ */
window.CX = window.CX || {};

CX.adminCfg = CX.adminCfg || {
  /* Matriz de administrabilidad por dominio. */
  matrix(){
    return [
      { dom:'Tenant / Proyecto',      versionado:true,  motivo:true,  gate:'human', nota:'multi-tenant · project config con llaves estables' },
      { dom:'Reglas de negocio',      versionado:true,  motivo:true,  gate:'human', nota:'cambios con versión + motivo · sin overwrite silencioso' },
      { dom:'Fuente HR / origen',     versionado:true,  motivo:true,  gate:'off',   nota:'origen de asignación · sincronización a revisión humana' },
      { dom:'Cuestionarios',          versionado:true,  motivo:true,  gate:'off',   nota:'CXOrbia/plataforma externa/externo/general/HR por visita' },
      { dom:'Documentos / Recursos',  versionado:true,  motivo:false, gate:'off',   nota:'versionado de material · sin adjuntos crudos' },
      { dom:'NDA / Confidencialidad', versionado:true,  motivo:true,  gate:'human', nota:'editable/versionado · NO altera aceptaciones presentadas' },
      { dom:'Planes comerciales',     versionado:true,  motivo:true,  gate:'human', nota:'define módulos/temas/integraciones del tenant' },
      { dom:'Evidencias',             versionado:true,  motivo:false, gate:'off',   nota:'tipos requeridos · almacenamiento pendiente de autorización' },
      { dom:'Certificaciones',        versionado:true,  motivo:true,  gate:'off',   nota:'presentadas se conservan · no autoaprobar' },
      { dom:'Academia',               versionado:true,  motivo:false, gate:'preview',nota:'rutas por rol · cursos/manuales/checklists' },
      { dom:'Notificaciones',         versionado:true,  motivo:false, gate:'off',   nota:'mensajería · envío real pendiente de activación' },
      { dom:'Postulaciones',          versionado:true,  motivo:true,  gate:'off',   nota:'sin duplicación · sync bidireccional' },
      { dom:'Shoppers',               versionado:true,  motivo:true,  gate:'off',   nota:'históricos conservados' },
      { dom:'Visitas',                versionado:true,  motivo:true,  gate:'off',   nota:'ciclo de vida honesto (realizada≠pago)' },
      { dom:'Reservas / Asignaciones',versionado:true,  motivo:true,  gate:'human', nota:'reprogramaciones y cancelaciones con motivo' },
      { dom:'Liquidaciones / Pagos',  versionado:true,  motivo:true,  gate:'off',   nota:'elegibilidad→liquidación→lote→pago (pendiente)' },
      { dom:'Integraciones',          versionado:true,  motivo:true,  gate:'off',   nota:'sin proveedor fijo · ningún proveedor activo' },
      { dom:'Roles y autorizaciones', versionado:true,  motivo:true,  gate:'human', nota:'permisos por rol · autorizaciones de activación' },
    ];
  },
};

CX.module('administrabilidad', ({data, ui, role})=>{
  const host = ui.el('div');
  const GATE = { off:['⛔ Sin autorizar','r'], preview:['🧪 Vista previa','b'], human:['👤 Revisión humana','a'] };
  const NDA_ROLES = [['shopper','Evaluador'],['admin','Equipo administrativo'],['ops','Equipo operativo'],['coordinador','Coordinador'],['cliente','Cliente / Portal'],['super','Admin principal']];
  let tab = 'matriz';
  let ndaRole = 'shopper';

  const banner = `
    <div style="background:var(--amber-bg,#fff7e6);border:1px solid var(--amber,#d97706);border-radius:11px;padding:12px 15px;margin-bottom:16px;font-size:12.5px;color:#8a5b00;line-height:1.6">
      <b>⚙️ Centro de administración.</b> Muestra qué es configurable y versionado por dominio.
      <b>Los cambios se guardan como versión (demo local), con motivo, sin sobre-escritura silenciosa.</b>
      Acciones reales pendientes de autorización · producción NO autorizada.
    </div>`;

  const tabs = [['matriz','🧭 Matriz de configuración'],['nda','🔒 NDA (versionado)'],['planes','📦 Planes (versionado)'],['reglas','📜 Reglas y autorizaciones'],['fasea','🏗️ Fase A & dominios profundos']];

  const matrizView = ()=>{
    const rows = CX.adminCfg.matrix();
    return `
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Matriz de configuración</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Todo dominio administrable es <b>versionado</b>; los cambios sensibles exigen <b>motivo</b>. Ningún cambio se aplica en producción sin autorización.</p>
        <table class="tbl"><thead><tr><th>Dominio</th><th>Versionado</th><th>Motivo obligatorio</th><th>Autorización</th><th>Nota</th></tr></thead><tbody>
        ${rows.map(r=>`<tr>
          <td><b>${r.dom}</b></td>
          <td>${r.versionado?ui.bdg('sí','g'):ui.bdg('no','n')}</td>
          <td>${r.motivo?ui.bdg('sí','a'):ui.bdg('opcional','n')}</td>
          <td>${ui.bdg(GATE[r.gate][0],GATE[r.gate][1])}</td>
          <td style="font-size:11.5px;color:var(--t2)">${r.nota}</td>
        </tr>`).join('')}
        </tbody></table>
      </div>`;
  };

  const ndaView = ()=>{
    const C = CX.confidencialidad;
    const ver = C ? C.version(ndaRole) : 1;
    const txt = C ? C.text(ndaRole) : '';
    const log = C ? C.auditLog().filter(x=>x.rol===ndaRole) : [];
    return `
      <div class="card card-p" style="margin-bottom:14px">
        <div class="between" style="margin-bottom:12px">
          <div class="card-t">NDA por rol · versionado</div>
          <div>${ui.bdg('versión actual: v'+ver,'b')}</div>
        </div>
        <div class="flex wrap" style="gap:6px;margin-bottom:12px">
          ${NDA_ROLES.map(([id,l])=>`<button class="btn ${ndaRole===id?'btn-pr':'btn-ghost'} btn-sm" data-nda="${id}">${l}</button>`).join('')}
        </div>
        <label style="font-size:12px;color:var(--t3);display:block;margin-bottom:5px">Texto del NDA (HTML permitido) — guardar crea una <b>nueva versión</b></label>
        <textarea id="ndaTxt" style="width:100%;min-height:150px;font-size:12.5px;padding:10px;border:1px solid var(--border);border-radius:9px;font-family:inherit;line-height:1.6;resize:vertical">${(txt||'').replace(/</g,'&lt;')}</textarea>
        <div class="between" style="margin-top:10px;align-items:flex-end">
          <div style="flex:1;margin-right:12px">
            <label style="font-size:12px;color:var(--t3);display:block;margin-bottom:4px">Motivo del cambio (obligatorio)</label>
            <input id="ndaReason" placeholder="p.ej. actualización legal Dto. 33-98" style="width:100%;font-size:12.5px;padding:8px 10px;border:1px solid var(--border);border-radius:8px">
          </div>
          <button class="btn btn-pr btn-sm" id="ndaSave">Guardar nueva versión (v${ver+1})</button>
        </div>
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Aceptaciones presentadas — <span style="color:var(--t3);font-weight:400">solo lectura · se conservan intactas</span></div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:10px">Subir la versión del NDA <b>no altera</b> las aceptaciones ya registradas. En producción quedan firmadas y auditadas.</p>
        ${log.length ? `<table class="tbl"><thead><tr><th>Usuario</th><th>Rol</th><th>Versión aceptada</th><th>Fecha</th></tr></thead><tbody>
          ${log.slice(0,40).map(x=>`<tr><td>${x.usuario}</td><td>${x.rol}</td><td>${ui.bdg('v'+(x.version||1),'n')}</td><td style="font-size:11.5px;color:var(--t3)">${(x.fecha||'').slice(0,10)}</td></tr>`).join('')}
        </tbody></table>` : `<div style="font-size:12.5px;color:var(--t3);padding:8px 0">Sin aceptaciones registradas para este rol en esta demo.</div>`}
      </div>`;
  };

  const planesView = ()=>{
    const plans = CX.PLANS || {};
    let pv = {}; try{ pv = JSON.parse(localStorage.getItem('cx_plan_ver')||'{}'); }catch(e){}
    return `
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Planes comerciales · versionado</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Cada plan preconfigura módulos, temas e integraciones del tenant. Editar un plan crea una versión con motivo; los tenants existentes no se re-configuran en silencio.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">
        ${Object.keys(plans).map(id=>{const p=plans[id];const mods=(typeof p.modulos==='string')?p.modulos:(p.modulos||[]).length+' módulos';
          const ints=(p.integraciones==='all')?'todas':(Array.isArray(p.integraciones)?p.integraciones.length+' integraciones':'—');
          return `<div class="card" style="padding:13px 15px">
            <div class="between" style="margin-bottom:6px"><b style="font-size:14px">${p.label}</b>${ui.bdg('v'+(pv[id]||1),'b')}</div>
            <div style="font-size:11.5px;color:var(--t2);line-height:1.7">
              <div>Módulos: <b>${mods}</b></div>
              <div>Temas: <b>${p.temas==='all'?'todos':(p.temas||[]).length}</b></div>
              <div>Integraciones: <b>${ints}</b></div>
            </div>
            <div style="margin-top:10px"><button class="btn btn-ghost btn-sm" data-plan="${id}">Editar (vista previa)</button></div>
          </div>`;}).join('')}
        </div>
      </div>`;
  };

  const reglasView = ()=>{
    const rules = [
      { n:'Elegibilidad de liquidación', v:3, gate:'off',   nota:'visita realizada + cuestionario submitido + dentro de rango' },
      { n:'Anti-duplicado de import',    v:2, gate:'off',   nota:'por llave natural · confirmación humana, no visual' },
      { n:'Ruteo de cuestionario',       v:2, gate:'off',   nota:'por visita vs. general · fuente configurable' },
      { n:'Sync de asignaciones',        v:4, gate:'human', nota:'plataforma↔HR · conflictos a revisión' },
      { n:'Requisito de certificación',  v:1, gate:'off',   nota:'no autoaprobar · asistente de IA con revisión humana' },
    ];
    return `
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Reglas versionadas y autorizaciones</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Cada regla tiene versión y motivo de cambio. La <b>autorización</b> controla si la regla aplica en la operación real (hoy: sin autorizar / revisión humana).</p>
        ${rules.map(r=>`<div class="card" style="padding:12px 14px;margin-bottom:9px">
          <div class="between" style="margin-bottom:5px"><b>${r.n}</b><div class="flex" style="gap:6px">${ui.bdg('v'+r.v,'n')}${ui.bdg(GATE[r.gate][0],GATE[r.gate][1])}</div></div>
          <div style="font-size:12px;color:var(--t2)">${r.nota}</div>
        </div>`).join('')}
      </div>`;
  };

  const faseAView = ()=>{
    const blocks = [
      { t:'Bloque 5 · Fase A operativa', items:[
        ['Alcance actual','Proyecto piloto (multi-cliente) + módulos multi-cliente existentes conviven en un solo tenant demo'],
        ['Multi-proyecto','Cada proyecto conserva su propio HR, cuestionario y liquidación — sin mezclar datos entre proyectos'],
        ['Estado honesto','"Fase A" se muestra explícito en dashboard/reportes cuando el dato es piloto, no histórico consolidado'],
      ]},
      { t:'Bloque 6 · HR ↔ plataforma (sync)', items:[
        ['Llaves de sincronía','tenantId · projectId · visitId/hrRowId · shopperId · assignmentSource · assignmentSyncStatus · lastSyncedAt'],
        ['Origen de asignación','assignmentSource ∈ {plataforma, hr, mixto} — nunca se sobre-escribe sin dejar rastro'],
        ['Conflicto de sync','diferencias entre HR y plataforma van a la bandeja de conflictos (Diagnóstico → Conflictos), nunca autoresueltas'],
      ]},
      { t:'Bloque 7 · Liquidaciones / Mis beneficios', items:[
        ['Campos elegibles','honorario · boleto · combo · reembolso · total · estado · lote — sin número de cuenta ni datos bancarios'],
        ['Ciclo honesto','visita realizada → cuestionario submitido → elegible → liquidado → lote → pago (cada etapa con estado propio, no colapsadas en una)'],
        ['Qué NO hace esta demo','no calcula pagos reales ni genera lotes reales; son estados ilustrativos de UI'],
      ]},
      { t:'Bloque 8 · Cuestionarios / certificaciones', items:[
        ['Fuentes de ruteo','CXOrbia · plataforma externa · externo · general · HR-por-visita — configurable por proyecto'],
        ['Certificaciones','presentadas se conservan siempre; no hay auto-aprobación — revisión humana antes de certificar'],
        ['Asistente de IA','solo sugiere/asiste evaluación; la decisión final la marca una persona'],
      ]},
      { t:'Bloque 9 · Evidencias', items:[
        ['Tipos requeridos','foto de fachada, ticket/factura, evidencia de producto — configurable por cuestionario'],
        ['Almacenamiento','sin adjuntos crudos ni base64 en esta demo; el guardado real de archivos depende de la autorización de almacenamiento'],
        ['Estado honesto','"evidencia preparada (vista previa)" en vez de "evidencia guardada" mientras no esté autorizada'],
      ]},
      { t:'Bloque 10 · Datos sensibles (política)', items:[
        ['Prohibido en vista previa','DPI, número de cuenta bancaria, NDA firmado con firma real, o cualquier credencial o URL privada'],
        ['Referencias opacas','todo cruce de datos usa IDs cortos (p.ej. hr#a4f2) en vez de nombres o documentos reales'],
        ['Aplicable a todo el prototipo','esta política rige todos los módulos nuevos — Diagnóstico, Administrabilidad y futuros'],
      ]},
    ];
    return `
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:4px">Fase A & dominios profundos</div>
        <p style="font-size:12px;color:var(--t3);margin-bottom:14px">Detalle honesto de los bloques 5–10 del paquete: qué existe hoy, qué es solo vista previa, y qué política de datos aplica. Sin datos reales ni activación pendiente.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px">
        ${blocks.map(b=>`<div class="card" style="padding:14px 16px">
          <div style="font-weight:700;font-size:13.5px;margin-bottom:10px">${b.t}</div>
          ${b.items.map(([k,v])=>`<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:.03em;margin-bottom:2px">${k}</div><div style="font-size:12px;color:var(--t2);line-height:1.5">${v}</div></div>`).join('')}
        </div>`).join('')}
        </div>
      </div>`;
  };

  const draw = ()=>{
    const body = tab==='matriz'?matrizView():tab==='nda'?ndaView():tab==='planes'?planesView():tab==='reglas'?reglasView():faseAView();
    host.innerHTML = `
      ${ui.ph('Centro de administración', 'Configuración versionada por dominio — vista previa, sin aplicar en producción')}
      ${banner}
      <div class="flex" style="gap:6px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:10px;flex-wrap:wrap">
        ${tabs.map(([t,l])=>`<button class="btn ${tab===t?'btn-pr':'btn-ghost'} btn-sm" data-tab="${t}">${l}</button>`).join('')}
      </div>
      ${body}`;
    host.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;draw();}));
    host.querySelectorAll('[data-nda]').forEach(b=>b.addEventListener('click',()=>{ndaRole=b.dataset.nda;draw();}));
    const save=host.querySelector('#ndaSave');
    if(save)save.addEventListener('click',()=>{
      const reason=(host.querySelector('#ndaReason').value||'').trim();
      if(!reason){ui.toast('El motivo del cambio es obligatorio','warn');return;}
      const nuevo=host.querySelector('#ndaTxt').value;
      if(CX.confidencialidad&&CX.confidencialidad.setText){ CX.confidencialidad.setText(ndaRole,nuevo); }
      ui.toast('NDA guardado como nueva versión (demo local) · aceptaciones previas conservadas · aplicación real pendiente de activación','ok',4200);
      draw();
    });
    host.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{
      let pv={}; try{pv=JSON.parse(localStorage.getItem('cx_plan_ver')||'{}');}catch(e){}
      pv[b.dataset.plan]=(pv[b.dataset.plan]||1)+1; try{localStorage.setItem('cx_plan_ver',JSON.stringify(pv));}catch(e){}
      ui.toast('Nueva versión del plan registrada (vista previa) · tenants existentes no se reconfiguran en silencio · aplicación real pendiente de activación','ok',4200);
      draw();
    }));
  };

  draw();
  return host;
});
