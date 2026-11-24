/* CXOrbia · Revisión de T&A: lectura autorizada de la HR vigente. */
window.CX = window.CX || {};
(function(){
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={pending_correction:'Observación por atender',pending_review:'Observación por revisar',ready_to_submit:'Revisión aprobada · pendiente de submitir',submitted_with_observation:'Submitida · conserva observación de revisión',submitted:'Submitida',no_observation:'Sin observación de revisión',not_mapped:'Columna de revisión no disponible',cancelled:'Visita cancelada'};
  CX.hrReviewPresentation=function(v){
    const r=v?.hrReview||{},state=r.state||'not_mapped';
    return {state,label:labels[state]||'Revisión pendiente de verificar',pending:r.requiresAttention===true,
      tone:r.requiresAttention?'a':r.submissionConfirmed||r.outcome==='approved'?'g':'n'};
  };
  CX.hrReviewHTML=function(v){
    const r=v?.hrReview;if(!r||r.mapped!==true)return '';
    const view=CX.hrReviewPresentation(v),note=typeof v.hrReviewObservation==='string'?v.hrReviewObservation:'';
    if(!r.hasObservation&&!view.pending)return '';
    return `<section class="card card-p" data-hr-review="${safe(view.state)}" style="margin:12px 0;border-left:3px solid var(--${view.pending?'amber':'brand'})"><b>🔎 Revisión de T&amp;A · ${safe(view.label)}</b>${view.pending?'<p style="margin:6px 0;font-size:12px">Atiende la observación antes de completar el submitido. El estado se actualizará con la hoja de ruta.</p>':''}${note?`<details ${view.pending?'open':''} style="margin-top:8px"><summary>Ver observación vigente</summary><div style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:320px;overflow:auto;font-size:12px;margin-top:8px">${safe(note)}</div></details>`:'<p style="margin:6px 0;font-size:12px">El detalle requiere una sesión autorizada para esta visita.</p>'}</section>`;
  };
  // Compatibility reads use the same current HR visit. There is no local
  // review writer and acknowledging a notification never resolves T&A review.
  CX.revisionStore={
    get(id){const v=(CX.data?._visitas||[]).find(x=>String(x.id)===String(id));return {estado:v?.hrReview?.state||'not_mapped',source:'original_hr',hist:[]};},
    set(){throw new Error('HR_REVIEW_EXTERNAL_AUTHORITY_REQUIRED');}
  };
  CX.revisionAdmin=function(data,p,v,ui){
    if(!v)return;const view=CX.hrReviewPresentation(v);
    ui.modal('🔎 Revisión de visita · '+safe(v.sucursal||''),`
      <div class="grid g2" style="gap:10px;margin-bottom:12px"><div><b>Shopper:</b> ${safe(v.shopper||'—')}</div><div><b>Período:</b> ${safe(v.periodLabel||v.periodKey||'—')}</div><div><b>Cuestionario:</b> ${safe(v.cuestFecha||'Pendiente')}</div><div><b>Submitido:</b> ${safe(v.submittedAt||'Pendiente')}</div></div>
      <div class="between"><span>Estado vigente en HR</span>${ui.bdg(view.label,view.tone)}</div>
      ${CX.hrReviewHTML(v)||'<p>No hay una observación disponible en la hoja de ruta de este período.</p>'}
      <p style="font-size:12px;color:var(--t2)">T&amp;A actualiza esta revisión en la hoja de ruta. Consultar o leer la notificación no cambia el resultado de la revisión ni confirma el submitido.</p>
      <div style="text-align:right"><button class="btn btn-soft btn-sm" id="rvRefresh">Actualizar desde HR</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#rvRefresh').addEventListener('click',async()=>{
      const button=ov.querySelector('#rvRefresh');button.disabled=true;button.textContent='Consultando HR…';
      try{if(typeof CX.backend?.refresh!=='function')throw new Error('HR_REFRESH_UNAVAILABLE');await CX.backend.refresh();const fresh=(data._visitas||[]).find(x=>String(x.id)===String(v.id));close();if(fresh)CX.revisionAdmin(data,p,fresh,ui);else ui.toast('La visita ya no aparece en la HR vigente.','warn');}
      catch(_){button.disabled=false;button.textContent='Actualizar desde HR';ui.toast('No se pudo confirmar una lectura nueva de la HR. Intenta nuevamente.','warn');}
    })});
  };
})();
