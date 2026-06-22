/* CXOrbia · Mis Visitas (shopper) — flujo completo de visita por proyecto
   instructivo → certificar → agendar → realizar → cuestionario → submit
   Cada acción sincroniza estado de visita y liquidación. */
CX.module('misvisitas', ({data,ui})=>{
  const p=data.project();
  const base=data.visitas();
  const asignada = base.find(v=>v.estado==='asignada')||base[0];
  const agendada = base.find(v=>v.estado==='agendada')||base[1];
  const realizada= base.find(v=>['realizada','cuestionario'].includes(v.estado))||base[2];

  /* pasos del flujo, dependientes del proyecto (certificación una vez por proyecto) */
  const flowSteps=(estado)=>{
    const order=['asignada','instructivo','certificacion','agendada','realizada','cuestionario','submit','liquidada'];
    const labels={asignada:'Asignada',instructivo:'Instructivo y documentos',certificacion:'Certificación del proyecto',agendada:'Visita agendada',realizada:'Visita realizada',cuestionario:'Cuestionario',submit:'Submitida',liquidada:'Liquidada'};
    const idx={asignada:0,agendada:3,realizada:4,cuestionario:5,liquidada:7}[estado]??0;
    return order.map((s,i)=>({label:labels[s],state:i<idx?'done':i===idx?'now':'todo'}));
  };

  const visitCard=(v,kind)=>{
    if(!v) return '';
    const tone={asignada:'amber',agendada:'green',realizada:'brand'}[kind];
    const cfg=p.cuestionario||{modo:'interna'};
    let actions='';
    if(kind==='asignada') actions=`
      <button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button>
      <button class="btn btn-soft btn-sm" data-cert="${v.id}">🏆 Certificarme</button>
      <button class="btn btn-pr btn-sm" data-sched="${v.id}">📅 Agendar</button>
      <button class="btn btn-ghost btn-sm" data-reprog="${v.id}">🔄 Reprogramar</button>`;
    else if(kind==='agendada') actions=`
      <button class="btn btn-green btn-sm" data-done="${v.id}">✅ Marcar realizada</button>
      <button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button>
      <button class="btn btn-ghost btn-sm" data-reprog="${v.id}">🔄 Reprogramar</button>
      <button class="btn btn-ghost btn-sm" data-cancel="${v.id}">✕ Cancelar</button>`;
    else actions=`
      <button class="btn btn-pr btn-sm" data-quest="${v.id}">📝 ${cfg.modo==='interna'?'Llenar cuestionario':'Abrir cuestionario'}</button>
      <button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button>`;

    const steps=flowSteps(v.estado);
    return `<div class="card card-p" style="border-left:3px solid var(--${tone});margin-bottom:12px">
      <div class="between" style="margin-bottom:6px">
        <b style="font-size:14px;color:var(--t1)">${v.sucursal}</b>
        ${kind==='agendada'?ui.bdg('Agendada '+(v.agendada||''),'g'):kind==='asignada'?ui.bdg('Asignada · por agendar','a'):ui.bdg('Realizada · pend. cuestionario','b')}
      </div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:10px">📍 ${v.ciudad} · ${v.escenario} · ${v.canal||''} · ${ui.money(v.currency,v.honorario)}${v.combo?' + combo':''}${v.boleto?' + boleto':''}</div>
      <div class="flex wrap" style="gap:6px;margin-bottom:12px">${actions}</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${steps.map(s=>`<span class="bdg ${s.state==='done'?'bdg-g':s.state==='now'?'bdg-b':'bdg-n'}" style="font-size:10px">${s.state==='done'?'✓':s.state==='now'?'●':'○'} ${s.label}</span>`).join('')}
      </div>
    </div>`;
  };

  const html=`
    ${ui.ph('Mis Visitas', p.name+' · agenda, ejecuta y da seguimiento')}
    <div class="flex" style="margin-bottom:14px">${ui.bdg('Activas 3','b')} ${ui.bdg('Historial 12','n')}</div>
    ${visitCard(asignada,'asignada')}
    ${visitCard(agendada,'agendada')}
    ${visitCard(realizada,'realizada')}
    <div class="card card-p">
      ${ui.aiBox('Cada acción que marcas (agendar, realizar, enviar cuestionario) actualiza la visita, notifica al equipo, sincroniza la hoja de ruta y mueve el estado de tu liquidación con fecha estimada de pago según las reglas de '+p.name+'.','Ejecución guiada y sincronizada')}
    </div>`;

  setTimeout(()=>{
    const find=(id)=>base.find(v=>v.id===id);
    const today=new Date().toISOString().slice(0,10);
    document.querySelectorAll('[data-doc]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('documentos')));
    document.querySelectorAll('[data-cert]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('cert')));
    document.querySelectorAll('[data-quest]').forEach(b=>b.addEventListener('click',()=>CX.shopperQuestionnaire(data,p,find(b.dataset.quest),ui)));

    document.querySelectorAll('[data-sched]').forEach(b=>b.addEventListener('click',()=>{
      const v=find(b.dataset.sched);
      ui.modal('Agendar visita',`
        <p style="font-size:13px;color:var(--t2);margin-bottom:10px">Elige una fecha dentro del rango y la franja <b>${(v||{}).franja||''}</b>.</p>
        <label class="lbl">Fecha</label><input class="inp" id="schD" type="date" value="${(v||{}).disponibleDesde||today}" style="margin-bottom:14px">
        <div class="flex" id="schF" style="gap:6px"><button class="btn btn-soft btn-sm" data-fr="AM 8–12h">AM 8–12h</button><button class="btn btn-ghost btn-sm" data-fr="PM 14–18h">PM 14–18h</button></div>
        <div style="text-align:right;margin-top:16px"><button class="btn btn-pr btn-sm" id="schOk">Confirmar agenda</button></div>`,
      {onMount:(ov,close)=>{
        let franja='AM 8–12h';
        ov.querySelectorAll('[data-fr]').forEach(x=>x.addEventListener('click',()=>{ov.querySelectorAll('[data-fr]').forEach(y=>y.classList.replace('btn-soft','btn-ghost'));x.classList.replace('btn-ghost','btn-soft');franja=x.dataset.fr;}));
        ov.querySelector('#schOk').addEventListener('click',()=>{
          const f=ov.querySelector('#schD').value||today;
          data.setVisitState(v.id,'agendada','agendada',f);
          CX.automations&&CX.automations.fire('agenda',{shopper:v.shopper||CX.session.user.name,sucursal:v.sucursal,fecha:f});
          close(); ui.toast('Visita agendada · equipo notificado · HR y liquidación sincronizadas','ok',3600);
        });
      }});
    }));

    document.querySelectorAll('[data-done]').forEach(b=>b.addEventListener('click',()=>{
      const v=find(b.dataset.done);
      ui.modal('Marcar visita realizada',`
        <label class="lbl">Fecha de realización</label><input class="inp" id="doneD" type="date" value="${(v||{}).agendada||today}" style="margin-bottom:14px">
        <div style="background:var(--brand-light);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--brand-dark);margin-bottom:14px">Al confirmar, se habilita el cuestionario y tu liquidación pasa a "pend. cuestionario".</div>
        <div style="text-align:right"><button class="btn btn-green btn-sm" id="doneOk">Confirmar realizada</button></div>`,
      {onMount:(ov,close)=>{ ov.querySelector('#doneOk').addEventListener('click',()=>{
        data.setVisitState(v.id,'realizada','realizada',ov.querySelector('#doneD').value||today);
        CX.automations&&CX.automations.fire('realizada',{shopper:v.shopper||CX.session.user.name,sucursal:v.sucursal});
        close(); ui.toast('Visita realizada · cuestionario habilitado · liquidación actualizada','ok',3600);
      }); }});
    }));

    document.querySelectorAll('[data-reprog]').forEach(b=>b.addEventListener('click',()=>{
      const v=find(b.dataset.reprog);
      ui.modal('Solicitar reprogramación',`
        <p style="font-size:13px;color:var(--t2);margin-bottom:10px">La solicitud se autoriza desde Gestión de Postulaciones.</p>
        <label class="lbl">Nueva fecha propuesta</label><input class="inp" id="rpD" type="date" style="margin-bottom:10px">
        <label class="lbl">Motivo</label><textarea class="inp" id="rpM" rows="2" placeholder="Motivo de la reprogramación…" style="margin-bottom:14px"></textarea>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rpOk">Enviar solicitud</button></div>`,
      {onMount:(ov,close)=>{ ov.querySelector('#rpOk').addEventListener('click',()=>{
        if(v){v.reprog=true; v.reprogFecha=ov.querySelector('#rpD').value;}
        CX.automations&&CX.automations.fire('reprog',{shopper:v.shopper||CX.session.user.name,sucursal:v.sucursal,fecha:ov.querySelector('#rpD').value||''});
        close(); CX.bus.emit('visit-flow'); ui.toast('Solicitud enviada · pendiente de autorización','ok');
      }); }});
    }));

    document.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',()=>{
      const v=find(b.dataset.cancel);
      CX.notif&&CX.notif.push({to:'admin',tipo:'cancel',icon:'⚠',tono:'r',titulo:'Solicitud de cancelación',txt:v.sucursal,nav:'postulaciones'});
      ui.toast('Solicitud de cancelación enviada al equipo','warn');
    }));
  },0);
  return html;
});
