/* CXOrbia · Cuestionario del shopper (interno / externo / link)
   El modo lo define el proyecto: p.cuestionario.modo = interna|externa|link */
window.CX = window.CX || {};

CX.shopperQuestionnaire = function(data, p, visita, ui){
  const cfg=p.cuestionario||{modo:'interna'};
  /* ----- Cuestionario EXTERNO o por LINK ----- */
  if(cfg.modo==='externa' || cfg.modo==='link'){
    const cred = (CX.session.user.name||'evaluador').toLowerCase().replace(/\s+/g,'.').replace(/[^a-z.]/g,'');
    ui.modal('Cuestionario del proyecto', `
      <div style="background:var(--brand-light);border-radius:11px;padding:12px 14px;margin-bottom:14px;font-size:12.5px;color:var(--brand-dark)">
        Este proyecto usa un <b>cuestionario ${cfg.modo==='link'?'con link propio por visita':'en plataforma externa'}</b> (${cfg.label||'externo'}). Complétalo y luego marca la visita como cuestionario enviado.</div>
      ${cfg.modo==='externa'?`<div class="card-p" style="border:1px solid var(--border);border-radius:11px;margin-bottom:12px">
        <div class="lbl">Tus credenciales (autogeneradas)</div>
        <div class="between" style="padding:6px 0"><span style="font-size:12px;color:var(--t2)">Usuario</span><b class="mono">${cred}</b></div>
        <div class="between" style="padding:6px 0;border-top:1px solid var(--border-2)"><span style="font-size:12px;color:var(--t2)">Contraseña</span><b class="mono">••••••</b></div>
      </div>`:''}
      <a href="${cfg.url||'#'}" target="_blank" class="btn btn-pr" style="width:100%;justify-content:center;margin-bottom:10px">🌐 Abrir cuestionario ${cfg.modo==='link'?'(link de esta visita)':'externo'}</a>
      <button class="btn btn-green" id="markDone" style="width:100%;justify-content:center">✅ Marcar cuestionario como enviado</button>
    `, {onMount:(ov,close)=>{
      ov.querySelector('#markDone').addEventListener('click',()=>{close();ui.toast('Cuestionario marcado como enviado · liquidación pasa a "pend. validar"','ok');CX.bus.emit('visit-flow');});
    }});
    return;
  }

  /* ----- Cuestionario INTERNO (se llena en la plataforma) ----- */
  const preguntas=[
    {t:'¿Cómo fue el saludo y el tiempo de espera?',tipo:'escala'},
    {t:'¿El local estaba limpio y ordenado?',tipo:'sino'},
    {t:'¿El personal mostró conocimiento del producto?',tipo:'escala'},
    {t:'¿Te ofrecieron '+(p.combo?'el combo/producto sugerido':'productos adicionales')+'?',tipo:'sino'},
    {t:'Comentario abierto y evidencia',tipo:'texto'},
  ];
  const qHTML=preguntas.map((q,i)=>{
    let input='';
    if(q.tipo==='escala') input=`<div class="flex" data-q="${i}" style="gap:6px">${[1,2,3,4,5].map(n=>`<button class="btn btn-ghost btn-sm qscale" data-v="${n}" style="width:38px;justify-content:center">${n}</button>`).join('')}</div>`;
    else if(q.tipo==='sino') input=`<div class="flex" data-q="${i}" style="gap:6px"><button class="btn btn-ghost btn-sm qbin" data-v="Sí">Sí</button><button class="btn btn-ghost btn-sm qbin" data-v="No">No</button></div>`;
    else input=`<textarea class="inp" data-q="${i}" rows="2" placeholder="Escribe aquí…"></textarea>`;
    return `<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:7px">${i+1}. ${q.t}</div>${input}</div>`;
  }).join('');

  ui.modal('Cuestionario · '+(visita?visita.sucursal:p.name), `
    <div style="background:var(--brand-light);border-radius:11px;padding:10px 13px;margin-bottom:14px;font-size:12px;color:var(--brand-dark)">Cuestionario configurado en la plataforma para <b>${p.name}</b>. Al enviarlo, la visita y la liquidación se actualizan solas.</div>
    <div id="qForm">${qHTML}</div>
    <button class="btn btn-green" id="qSubmit" style="width:100%;justify-content:center;margin-top:6px">✅ Enviar cuestionario</button>
  `, {onMount:(ov,close)=>{
    ov.querySelectorAll('.qscale,.qbin').forEach(b=>b.addEventListener('click',()=>{
      b.parentElement.querySelectorAll('button').forEach(x=>x.classList.replace('btn-pr','btn-ghost'));
      b.classList.replace('btn-ghost','btn-pr');
    }));
    ov.querySelector('#qSubmit').addEventListener('click',()=>{close();ui.toast('Cuestionario enviado · liquidación pasa a "pend. validar"','ok');CX.bus.emit('visit-flow');});
  }});
};
