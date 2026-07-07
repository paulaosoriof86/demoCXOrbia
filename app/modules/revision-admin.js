/* CXOrbia · Revisión admin (Phase A) — separa cuestionario / revisión / submitido / liquidación.
   Estados granulares. NO escribe a backend: la HR-sync real queda pendiente de activación backend. */
window.CX = window.CX || {};

CX.revisionStore = CX.revisionStore || {
  _k:'cx_revision',
  /* claves canónicas (inglés) para backend; labels visibles en español */
  ESTADOS:['pending_review','in_review','needs_correction','approved_for_submitido','submitido_registered','rejected','hr_conflict','cancelled'],
  LABELS:{
    pending_review:'Pendiente de revisión', in_review:'En revisión', needs_correction:'Requiere corrección',
    approved_for_submitido:'Aprobada para submitido', submitido_registered:'Submitido registrado', rejected:'Rechazada',
    hr_conflict:'Conflicto HR', cancelled:'Cancelada'
  },
  TONO:{pending_review:'a', in_review:'b', needs_correction:'a', approved_for_submitido:'g', submitido_registered:'g', rejected:'r', hr_conflict:'r', cancelled:'n'},
  /* capa de datos: usa CX.data cuando exista backend; fallback a localStorage (prototipo) */
  all(){ if(CX.data&&CX.data.revisiones) return CX.data.revisiones; try{return JSON.parse(localStorage.getItem(this._k)||'{}');}catch(e){return {};} },
  _persist(a){ if(CX.data&&CX.data.revisiones){CX.data.revisiones=a;} else {try{localStorage.setItem(this._k,JSON.stringify(a));}catch(e){}} },
  get(visitaId){ const a=this.all(); return a[visitaId]||{estado:'pending_review', hist:[]}; },
  set(visitaId, estado, nota, ctx){
    const a=this.all(); const now=new Date().toISOString(); ctx=ctx||{};
    const r=a[visitaId]||{estado:'pending_review', hist:[], reviewId:'rev_'+Date.now().toString(36), createdAt:now};
    r.estado=estado; r.status=estado; r.hist=r.hist||[];
    /* estructura compatible con el contrato backend */
    r.tenantId=ctx.tenantId||(CX.BRAND&&CX.BRAND.tenantId)||'tya';
    r.projectId=ctx.projectId||(CX.data&&CX.data.currentProjectId)||'';
    r.visitId=visitaId; r.assignmentId=ctx.assignmentId||''; r.shopperId=ctx.shopperId||''; r.hrRowId=ctx.hrRowId||r.hrRowId||'';
    r.source=ctx.source||'admin_ui'; r.updatedAt=now;
    const entry={estado, nota:nota||'', por:(CX.session&&CX.session.user&&CX.session.user.name)||'admin', fecha:now.slice(0,16).replace('T',' ')};
    r.hist.unshift(entry); r.auditTrail=r.hist;
    a[visitaId]=r; this._persist(a);
    CX.bus&&CX.bus.emit('visit-flow'); return r;
  }
};

/* Modal de revisión admin — se invoca desde el detalle de visita / postulaciones */
CX.revisionAdmin = function(data, p, v, ui){
  if(!v) return;
  const R=CX.revisionStore, r=R.get(v.id);
  const submitCfg=(p.submitido||{}); const submDesc={plataforma:'Plataforma submite',consultora:'Consultora submite (externo)',cliente:'Cliente submite'}[submitCfg.quien]||'—';
  const rolDesc={submite:'La plataforma submite',monitorea:'La plataforma solo monitorea',hr:'Fecha de submitido se toma desde HR'}[submitCfg.rol||'hr']||'—';
  ui.modal('🔎 Revisión de visita · '+(v.sucursal||''),`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;font-size:12.5px;color:var(--t2);margin-bottom:12px">
      <div><b>Shopper:</b> ${v.shopper||'—'}</div><div><b>Escenario:</b> ${v.escenario||'—'}</div>
      <div><b>Realizada:</b> ${v.realizada||v.agendada||'—'}</div><div><b>Cuestionario:</b> ${v.cuestFecha||(v.submit?'realizado/completado':'pendiente')}</div>
      <div><b>Score:</b> ${v.score!=null?v.score:'—'}</div><div><b>Submitido:</b> ${submDesc}</div>
    </div>
    <div style="background:var(--brand-light);border-radius:9px;padding:9px 12px;font-size:11.5px;color:var(--brand-dark);margin-bottom:12px">
      Etapas separadas: <b>cuestionario</b> → <b>revisión</b> → <b>submitido</b> → <b>liquidación</b>. ${rolDesc}. La sincronización con HR queda <b>pendiente de activación backend</b>.
    </div>
    <div class="between" style="margin-bottom:8px"><span class="muted" style="font-size:12px">Estado de revisión</span>${ui.bdg(R.LABELS[r.estado]||r.estado, R.TONO[r.estado]||'n')}</div>
    <label class="lbl">Cambiar estado</label>
    <select class="sel" id="rvEstado" style="margin-bottom:8px">${R.ESTADOS.map(e=>`<option value="${e}" ${r.estado===e?'selected':''}>${R.LABELS[e]}</option>`).join('')}</select>
    <label class="lbl">Nota / motivo (queda en la bitácora)</label>
    <textarea class="inp" id="rvNota" rows="2" placeholder="Ej. evidencias completas / falta foto de fachada / conflicto con fila HN…" style="margin-bottom:10px"></textarea>
    ${(r.hist&&r.hist.length)?`<div class="card-t" style="font-size:12px;margin-bottom:6px">🕐 Bitácora de revisión</div>
      <div style="max-height:120px;overflow:auto;margin-bottom:10px">${r.hist.map(h=>`<div style="font-size:11.5px;padding:5px 0;border-bottom:1px solid var(--border-2)"><b>${R.LABELS[h.estado]||h.estado}</b> <span style="color:var(--t3)">· ${h.por} · ${h.fecha}</span>${h.nota?`<div style="color:var(--t2)">${h.nota}</div>`:''}</div>`).join('')}</div>`:''}
    <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rvSave">Guardar revisión</button></div>
  `,{onMount:(ov,close)=>{
    ov.querySelector('#rvSave').addEventListener('click',()=>{
      const estado=ov.querySelector('#rvEstado').value, nota=ov.querySelector('#rvNota').value.trim();
      const hrDriven=(submitCfg.rol||'hr')==='hr';
      /* HR-driven: no permitir submitido_registered libre — exige nota/referencia HR */
      if(estado==='submitido_registered' && hrDriven && !nota){
        ui.toast('Proyecto HR-driven: para confirmar submitido agrega la referencia/nota HR, o usa "Aprobada para submitido".','warn',4200); return;
      }
      R.set(v.id, estado, nota, {shopperId:v.shopperId, assignmentId:v.id, projectId:p.id, hrRowId:v.hrRowId||v.rowId||v.extId||'', source:'admin_ui'});
      if(estado==='approved_for_submitido' && hrDriven){
        ui.toast('Aprobada · el submitido se registrará desde HR (pendiente backend)','ok',3600);
      } else if(estado==='submitido_registered'){
        CX.automations&&CX.automations.logAction&&CX.automations.logAction(hrDriven?'Submitido confirmado por admin (basado en HR)':'Submitido registrado',v.id,(v.shopper||'')+' · '+(v.sucursal||''));
        ui.toast(hrDriven?'Submitido admin-confirmado (basado en HR) · liquidación pendiente HR/backend':'Submitido registrado · liquidación candidata (pendiente cruce)','ok',3800);
      } else {
        ui.toast('Revisión actualizada: '+R.LABELS[estado],'ok');
      }
      CX.notif&&CX.notif.push({to:'shopper',tipo:'revision',icon:'🔎',tono:R.TONO[estado]||'b',titulo:'Revisión de tu visita: '+R.LABELS[estado],txt:(v.sucursal||'')+(nota?' · '+nota:''),nav:'misvisitas'});
      close();
    });
  }});
};
