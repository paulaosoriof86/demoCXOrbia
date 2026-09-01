/* ============================================================
   CXOrbia · Shared UI helpers (DOM builders, toast, modal)
   Keep modules terse and consistent.
   ============================================================ */
window.CX = window.CX || {};

CX.ui = {
  /* hyperscript-ish element builder */
  el(tag, attrs, children){
    const e=document.createElement(tag);
    if(attrs) for(const k in attrs){
      const v=attrs[k];
      if(k==='class') e.className=v;
      else if(k==='html') e.innerHTML=v;
      else if(k==='text') e.textContent=v;
      else if(k.startsWith('on')&&typeof v==='function') e.addEventListener(k.slice(2),v);
      else if(v!=null) e.setAttribute(k,v);
    }
    if(children!=null){
      (Array.isArray(children)?children:[children]).forEach(c=>{
        if(c==null||c===false) return;
        e.appendChild(typeof c==='string'?document.createTextNode(c):c);
      });
    }
    return e;
  },

  /* page header */
  ph(title, sub){
    return `<div class="ph"><div class="ph-acc"></div><div class="ph-t">${title}</div>${sub?`<div class="ph-s">${sub}</div>`:''}</div>`;
  },

  /* KPI tile */
  kpi(label,value,tone='b',sub=''){
    return `<div class="kpi ${tone}"><div class="k-l">${label}</div><div class="k-v">${value}</div>${sub?`<div class="k-s">${sub}</div>`:''}</div>`;
  },

  bar(pct,label,val){
    return `<div class="flex" style="margin-bottom:9px"><span style="width:96px;font-size:11px;color:var(--t2);flex-shrink:0">${label}</span>
      <div class="bar" style="flex:1"><i style="width:${pct}%"></i></div>
      <b style="width:36px;text-align:right;font-size:11px;font-family:var(--disp);color:var(--t1)">${val??pct+'%'}</b></div>`;
  },

  bdg(text,tone='n'){ return `<span class="bdg bdg-${tone}">${text}</span>`; },

  /* Vocabulario único de estados honestos (pendiente #10 — paquete genérico 20260711).
     Antes cada módulo inventaba su propia frase para "todavía no es real" (p.ej. "preparado",
     "pendiente de validación", "simulado", "vía Make (gate pendiente)", "listo para conectar"…) —
     útiles individualmente, pero sin vocabulario compartido. Este helper NO reemplaza el copy
     descriptivo de cada módulo (que sigue explicando el contexto específico) — da una etiqueta
     visual consistente cuando un módulo quiere señalizar el estado canónico de una preparación/
     conexión/revisión. Códigos: prepared, pending_backend, pending_source, pending_gate,
     pending_review, blocked, confirmed, failed. Adoptado en los módulos tocados por P0-1..P0-5
     de esta ronda (Automatizaciones, Integraciones, Finanzas, Certificación) — no propagado
     todavía a los ~48 módulos restantes (pendiente documentado, no se afirma cobertura total). */
  STATUS_VOCAB:{
    prepared:       {label:'Preparado (vista previa)',      tone:'b'},
    pending_backend:{label:'Pendiente de conexión',     tone:'a'},
    pending_source: {label:'Pendiente de fuente',      tone:'a'},
    pending_gate:   {label:'Pendiente de gate',        tone:'a'},
    pending_review: {label:'Pendiente de revisión',    tone:'a'},
    blocked:        {label:'Bloqueado',                tone:'r'},
    confirmed:      {label:'Confirmado',                tone:'g'},
    failed:         {label:'Falló',                    tone:'r'},
    not_requested:  {label:'No solicitado',             tone:'n'},
  },
  statusBdg(code, extra){
    const s=this.STATUS_VOCAB[code]||{label:'Estado pendiente de clasificación',tone:'n'};
    return this.bdg(s.label+(extra?' · '+extra:''), s.tone);
  },

  aiBox(text,label='Capa inteligente'){
    if(!CX.BRAND.showAITag) return '';
    return `<div class="ai-box"><div class="ai-l">✨ ${label}</div><p>${text}</p></div>`;
  },

  empty(icon,msg){ return `<div class="empty" role="status"><div class="e-ic" aria-hidden="true">${icon}</div>${msg}</div>`; },

  /* Componentes compartidos honestos (ítem 15 — paquete genérico 20260711): antes cada módulo
     armaba su propio HTML para "esto está vacío/bloqueado/en conflicto/degradado" con estilos y
     estructura ligeramente distintos. Estos 3 renderizadores dan una API consistente — no
     obligatorios (los módulos ya existentes con su propio HTML no se reescribieron todos), pero
     disponibles para que cualquier módulo nuevo o revisado adopte el mismo patrón visual y de
     accesibilidad (roles ARIA, foco) sin reinventarlo. */

  /* Tarjeta de "acción bloqueada por permiso" — para usar en vez de solo ocultar un botón,
     cuando conviene explicar POR QUÉ algo no está disponible en esta vista. */
  gateCard(reason, opts){
    opts=opts||{};
    return `<div class="card card-p" role="alert" style="background:#fef2f2;border-color:#fecaca;display:flex;gap:10px;align-items:flex-start">
      <div style="font-size:20px" aria-hidden="true">🔒</div>
      <div><div style="font-weight:700;font-size:12.5px;color:#991b1b">${opts.title||'Acción no disponible'}</div>
      <div style="font-size:12px;color:#7f1d1d;margin-top:2px">${reason}</div></div>
    </div>`;
  },
  /* Tarjeta de conflicto/discrepancia pendiente de revisión humana — con motivo + auditRef opcional */
  conflictCard(opts){
    opts=opts||{};
    return `<div class="card card-p" role="group" aria-label="Conflicto pendiente de revisión" style="background:#fffbeb;border-color:#fde68a">
      <div class="between" style="margin-bottom:6px"><b style="font-size:12.5px;color:#92400e">⚖️ ${opts.title||'Conflicto pendiente de revisión'}</b>${opts.auditRef?`<span style="font-size:10px;color:#a16207;font-family:var(--disp,monospace)">${opts.auditRef}</span>`:''}</div>
      <div style="font-size:12px;color:#78350f">${opts.detail||''}</div>
      ${opts.actions?`<div style="margin-top:8px;display:flex;gap:8px">${opts.actions}</div>`:''}
    </div>`;
  },
  /* Estado degradado (fuente parcial, con advertencias pero no bloqueado del todo) */
  degraded(msg, opts){
    opts=opts||{};
    return `<div class="card card-p" role="status" style="background:#fffbeb;border-color:#fde68a;display:flex;gap:10px;align-items:flex-start">
      <div style="font-size:18px" aria-hidden="true">⚠️</div>
      <div><div style="font-weight:700;font-size:12px;color:#92400e">${opts.title||'Degradado'}</div>
      <div style="font-size:11.5px;color:#78350f;margin-top:2px">${msg}</div></div>
    </div>`;
  },

  money(cur,n){ return `${cur} ${Number(n).toLocaleString('es-GT')}`; },

  /* toast */
  toast(msg,type='',ms=2800){
    let host=document.getElementById('cx-toasts');
    if(!host){host=document.createElement('div');host.id='cx-toasts';document.body.appendChild(host);}
    const t=document.createElement('div');t.className='toast '+(type||'');t.textContent=msg;
    host.appendChild(t);
    setTimeout(()=>{t.style.opacity='0';t.style.transition='.3s';setTimeout(()=>t.remove(),300);},ms);
  },

  /* modal */
  modal(title, bodyHTML, opts={}){
    const ov=document.createElement('div');ov.className='cx-ov';
    const cls='cx-modal'+(opts.full?' cx-modal-full':opts.wide?' cx-modal-wide':'');
    ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label',title.replace(/<[^>]*>/g,''));
    ov.innerHTML=`<div class="${cls}"><div class="cx-modal-h"><div class="card-t" style="font-size:16px">${title}</div>
      <button class="btn btn-ghost btn-icon" data-x aria-label="Cerrar">✕</button></div><div class="cx-modal-b">${bodyHTML}</div></div>`;
    document.body.appendChild(ov);
    const close=()=>{ ov.remove(); document.removeEventListener('keydown',onKey); if(prevFocus&&prevFocus.focus) prevFocus.focus(); };
    const prevFocus=document.activeElement;
    /* ítem 14 (accesibilidad — paquete genérico 20260711): Escape cierra el modal, y el foco
       inicial va al primer elemento enfocable dentro de él en vez de quedarse en el fondo. */
    const onKey=(e)=>{ if(e.key==='Escape') close(); };
    document.addEventListener('keydown',onKey);
    ov.addEventListener('click',e=>{if(e.target===ov)close();});
    ov.querySelector('[data-x]').addEventListener('click',close);
    if(opts.onMount)opts.onMount(ov,close);
    setTimeout(()=>{ const f=ov.querySelector('input,select,textarea,button:not([data-x])'); if(f&&f.focus) f.focus(); },30);
    return close;
  },

  /* status → badge tone for visits */
  estadoBadge(est){
    const m={disponible:['Disponible','b'],postulada:['Postulada','a'],asignada:['Asignada','b'],
      agendada:['Agendada','t'],realizada:['Realizada','g'],cuestionario:['Pend. cuestionario','a'],
      liquidada:['Liquidada','g'],fuera_rango:['Fuera de rango','r']};
    const x=m[est]||[est,'n']; return `<span class="bdg bdg-${x[1]}">${x[0]}</span>`;
  },

  /* placeholder for not-yet-deepened modules */
  scaffold(id){
    const m=CX.MODULES[id];
    return `${CX.ui.ph(m.label, 'Módulo en construcción · arquitectura y navegación listas')}
      <div class="card card-p">
        <div class="flex wrap" style="gap:14px">
          <div style="font-size:40px">${m.icon}</div>
          <div style="flex:1;min-width:220px">
            <div class="card-t" style="font-size:16px;margin-bottom:6px">${m.label}</div>
            <p style="font-size:13.5px;color:var(--t2);line-height:1.6">Este módulo ya existe en la plataforma y forma parte del producto.
            Está agendado en la oleada de profundización; su comportamiento de referencia está documentado en
            <span class="mono" style="font-size:12px">docs/MODULES.md</span>.</p>
            <div style="margin-top:12px">${CX.ui.bdg('En desarrollo','a')} ${CX.ui.bdg(m.roles.join(' · '),'n')}</div>
          </div>
        </div>
      </div>`;
  },
};

/* module registration: CX.module('id', ctx => htmlString | (el)=>void ) */
CX.modules = {};
CX.module = function(id, fn){ CX.modules[id]=fn; };
