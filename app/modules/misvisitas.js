/* CXOrbia · Mis Visitas (shopper) — canonical Phase A v2
   P0 root correction: exact shopper identity, complete arrays (never find-one), canonical facets
   and command/ACK writes. UI layout and project-driven flow are preserved. */
CX.module('misvisitas',({data,ui})=>{
  const p=data.period();
  const sid=(CX.session.user&&CX.session.user.shopperId)||null;
  const identityOk=!!sid;
  const mine=identityOk?(data.visitsForShopper?data.visitsForShopper(sid):[]):[];
  const engine=window.CX_TYA_CUMULATIVE_READ_MODEL;
  const facets=v=>engine?.facets?engine.facets(v):(data.visitFacets?data.visitFacets(v):(v?.canonicalFacets||{}));
  const contract=v=>data.visitContract?data.visitContract(v):{};
  const isCancelled=(v,f)=>f.cancelled===true||v.estado==='cancelada'||v.cancelled===true;
  const assigned=mine.filter(v=>{const f=facets(v);return f.assigned&&!f.scheduled&&!f.realized&&!isCancelled(v,f);});
  const scheduled=mine.filter(v=>{const f=facets(v);return f.scheduled&&!f.realized&&!isCancelled(v,f);});
  const realized=mine.filter(v=>{const f=facets(v);return f.realized&&!f.submitted&&!isCancelled(v,f);});
  const history=mine.filter(v=>{const f=facets(v),c=contract(v);return f.submitted||isCancelled(v,f)||c.liquidationState==='confirmado'||c.paymentState==='confirmado'||v.estado==='liquidada';});
  const activeCount=assigned.length+scheduled.length+realized.length;
  const geoPreview=new Map();
  let view='activas';
  const host=ui.el('div');
  const today=()=>new Date().toISOString().slice(0,10);
  const committed=r=>r?.ok===true&&r?.status==='committed'&&r?.providerAck===true&&r?.successUiAllowed===true;
  const commandMessage=r=>r?.code==='COMMAND_WRITES_DISABLED'
    ?'La acción está preparada, pero las escrituras reales siguen cerradas por gate. No se modificó la visita.'
    :'La acción no recibió ACK real del backend. No se modificó la visita.';
  const withCommand=async(btn,fn,onSuccess)=>{
    const prev=btn.textContent;btn.disabled=true;
    try{
      const r=await fn();
      if(!committed(r)){ui.toast(commandMessage(r),'warn',4200);return false;}
      try{await CX.backend?.refresh?.();}catch(_){}
      if(onSuccess)await onSuccess(r);
      return true;
    }catch(_){ui.toast('No fue posible confirmar la acción. No se aplicó un cambio local.','err',4200);return false;}
    finally{btn.disabled=false;btn.textContent=prev;}
  };

  const stageOf=v=>{
    const f=facets(v),c=contract(v);
    if(c.paymentState==='confirmado')return'liquidada';
    if(f.submitted)return'submit';
    if(f.questionnaire)return'cuestionario';
    if(f.realized)return'realizada';
    if(f.scheduled)return'agendada';
    return'asignada';
  };
  const flowSteps=v=>{
    const order=['asignada','instructivo','certificacion','agendada','realizada','cuestionario','revision','submit','liquidada'];
    const labels={asignada:'Asignada',instructivo:'Instructivo y documentos',certificacion:'Certificación del proyecto',agendada:'Visita agendada',realizada:'Visita realizada',cuestionario:'Cuestionario',revision:'Revisión',submit:'Submitida',liquidada:'Liquidada'};
    const idx={asignada:0,agendada:3,realizada:4,cuestionario:5,revision:6,submit:7,liquidada:8}[stageOf(v)]??0;
    return order.map((s,i)=>({label:labels[s],state:i<idx?'done':i===idx?'now':'todo'}));
  };
  const geoOn=!!(CX.addons&&CX.addons.on('geo_checkin','shopper'));
  const geoBtn=v=>{if(!geoOn||!v)return'';const g=geoPreview.get(v.id);return g?`<button class="btn btn-soft btn-sm" data-geo="${v.id}" title="Check-in preparado solo en esta vista; Storage pendiente">⏳ Check-in ${g.ts||''}</button>`:`<button class="btn btn-green btn-sm" data-geo="${v.id}">📍 Check-in geolocalizado</button>`;};
  const kindOf=v=>{const f=facets(v);return f.realized?'realizada':f.scheduled?'agendada':'asignada';};
  const visitCard=v=>{
    const kind=kindOf(v),tone={asignada:'amber',agendada:'green',realizada:'brand'}[kind],cfg=p.cuestionario||{modo:'interna'};
    let actions='';
    if(kind==='asignada')actions=`<button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button><button class="btn btn-soft btn-sm" data-cert="${v.id}">🏆 Certificarme</button><button class="btn btn-pr btn-sm" data-sched="${v.id}">📅 Agendar</button><button class="btn btn-ghost btn-sm" data-reprog="${v.id}">🔄 Reprogramar</button>${geoBtn(v)}`;
    else if(kind==='agendada')actions=`<button class="btn btn-green btn-sm" data-done="${v.id}">✅ Marcar realizada</button><button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button><button class="btn btn-ghost btn-sm" data-reprog="${v.id}">🔄 Reprogramar</button><button class="btn btn-ghost btn-sm" data-cancel="${v.id}">✕ Cancelar</button>${geoBtn(v)}`;
    else actions=`<button class="btn btn-pr btn-sm" data-quest="${v.id}">📝 ${cfg.modo==='interna'?'Llenar cuestionario':'Abrir cuestionario'}</button><button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button>`;
    const badge=kind==='agendada'?ui.bdg('Agendada '+(v.agendada||''),'g'):kind==='asignada'?ui.bdg('Asignada · por agendar','a'):ui.bdg(facets(v).questionnaire?'Cuestionario · pend. submit/revisión':'Realizada · pend. cuestionario','b');
    return `<div class="card card-p" data-visit-card="${v.id}" style="border-left:3px solid var(--${tone});margin-bottom:12px"><div class="between" style="margin-bottom:6px"><b style="font-size:14px;color:var(--t1)">${v.sucursal}</b>${badge}</div><div style="font-size:12px;color:var(--t3);margin-bottom:10px">📍 ${v.ciudad||''} · ${v.escenario||''} · ${v.canal||''} · ${ui.money(v.currency,v.honorario)}${(v.reembolso||v.comboAmt||v.boleto)?' + reembolso incluido':''}</div><div class="flex wrap" style="gap:6px;margin-bottom:12px">${actions}</div><div style="display:flex;flex-wrap:wrap;gap:5px">${flowSteps(v).map(s=>`<span class="bdg ${s.state==='done'?'bdg-g':s.state==='now'?'bdg-b':'bdg-n'}" style="font-size:10px">${s.state==='done'?'✓':s.state==='now'?'●':'○'} ${s.label}</span>`).join('')}</div></div>`;
  };
  const blockedHTML=()=>`${ui.ph('Mis Visitas',p?.name||'')}<div class="card card-p" style="border-left:3px solid var(--red)"><div class="flex" style="gap:8px;align-items:center;margin-bottom:6px"><span style="font-size:20px">🔒</span><b>Identidad de evaluador no verificable</b></div><div style="font-size:12.5px;color:var(--t2)">No hay un <code>shopperId</code> verificable en esta sesión. Por seguridad no se muestran ni ejecutan visitas de ningún evaluador.</div></div>`;
  const tabs=()=>`<div class="flex" style="margin-bottom:14px;gap:8px"><button class="btn btn-sm ${view==='activas'?'btn-pr':'btn-ghost'}" data-view="activas">Activas ${activeCount}</button><button class="btn btn-sm ${view==='historial'?'btn-pr':'btn-ghost'}" data-view="historial">Historial ${history.length}</button></div>`;
  const activeHTML=()=>`${ui.ph('Mis Visitas',(p?.name||'')+' · agenda, ejecuta y da seguimiento')}${tabs()}${geoOn?`<div class="card card-p" style="margin-bottom:12px;border-left:3px solid var(--green)"><div class="flex" style="gap:8px;align-items:center;margin-bottom:4px"><span style="font-size:18px">📍</span><b style="font-size:13px">Check-in con foto geolocalizada</b><span class="bdg bdg-a" style="font-size:10px">Storage pendiente</span></div><div style="font-size:11.5px;color:var(--t2)">La foto y GPS se previsualizan sin convertirse en estado productivo. La evidencia definitiva solo se confirmará con Storage/backend y ACK real.</div></div>`:''}${assigned.map(visitCard).join('')}${scheduled.map(visitCard).join('')}${realized.map(visitCard).join('')}${activeCount?'':ui.empty('🗓️','No tienes visitas activas en este momento.')}<div class="card card-p">${ui.aiBox('Las acciones de visita solo se confirman después del ACK real del backend. Con el gate de escrituras cerrado, la plataforma no modifica estados ni muestra éxito falso.','Ejecución guiada · persistencia canónica')}</div>`;
  const historyHTML=()=>`${ui.ph('Mis Visitas',(p?.name||'')+' · agenda, ejecuta y da seguimiento')}${tabs()}<div class="card card-p"><div class="card-h"><div class="card-t">Historial de visitas</div><span class="muted" style="font-size:11px">submitidas, liquidadas, pagadas o canceladas</span></div>${history.length?`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Sucursal</th><th>Escenario</th><th>Fecha</th><th>Honorario</th><th>Estado</th><th>Pago</th></tr></thead><tbody>${history.map(v=>{const vc=contract(v);const pay=!vc||vc.paymentState==='no_aplica'?'<span class="muted" style="font-size:11px">—</span>':vc.paymentState==='confirmado'?ui.bdg('Pagado (confirmado)','g'):ui.bdg('Pago pendiente/preview','a');return`<tr><td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad||''}</div></td><td style="font-size:12px">${v.escenario||''}</td><td style="font-size:12px">${v.realizada||v.fechaPago||v.agendada||'—'}</td><td>${ui.money(v.currency,v.honorario)}</td><td>${ui.estadoBadge(v.estado)}</td><td>${pay}</td></tr>`;}).join('')}</tbody></table></div>`:ui.empty('🗒️','Aún no tienes visitas en tu historial.')}</div>`;

  const find=id=>mine.find(v=>String(v.id)===String(id));
  const draw=()=>{if(!identityOk){host.innerHTML=blockedHTML();return;}host.innerHTML=view==='historial'?historyHTML():activeHTML();host.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;draw();}));if(view==='activas')bindActive();};
  const bindActive=()=>{
    host.querySelectorAll('[data-doc]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('documentos')));
    host.querySelectorAll('[data-cert]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('cert')));
    host.querySelectorAll('[data-quest]').forEach(b=>b.addEventListener('click',()=>CX.shopperQuestionnaire(data,p,find(b.dataset.quest),ui)));
    host.querySelectorAll('[data-geo]').forEach(b=>b.addEventListener('click',()=>{
      const v=find(b.dataset.geo);if(!v)return;const prior=geoPreview.get(v.id);
      ui.modal('📍 Check-in geolocalizado · '+v.sucursal,`<div style="background:var(--amber-bg,#fffbeb);border-radius:9px;padding:9px 12px;font-size:11.5px;color:#8a5b00;margin-bottom:12px">⏳ <b>Storage pendiente.</b> La preparación queda solo en esta vista y no altera la visita.</div><input type="file" accept="image/*" capture="environment" class="inp" id="geoPhoto" style="padding:6px;font-size:12px;margin-bottom:8px"><div id="geoPrev" style="margin-bottom:10px"></div><button class="btn btn-soft btn-sm" id="geoLoc" type="button" style="width:100%;justify-content:center;margin-bottom:6px">${prior?'⏳ '+prior.ts:'📍 Capturar ubicación GPS'}</button><div id="geoMsg" style="font-size:11px;color:var(--t3);min-height:16px"></div><div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="geoSave" disabled>Preparar check-in</button></div>`,{onMount:(ov,close)=>{
        let cap=null,photoOk=false,previewUrl=null;const save=ov.querySelector('#geoSave');const refresh=()=>{save.disabled=!(cap&&cap.lat!=null&&photoOk);};
        ov.querySelector('#geoPhoto').addEventListener('change',e=>{const f=e.target.files[0];if(previewUrl)URL.revokeObjectURL(previewUrl);if(f){photoOk=true;previewUrl=URL.createObjectURL(f);ov.querySelector('#geoPrev').innerHTML='<img src="'+previewUrl+'" style="max-width:100%;max-height:150px;border-radius:8px"><div style="font-size:10.5px;color:var(--t3);margin-top:4px">Vista previa efímera — no persistida.</div>';}else{photoOk=false;ov.querySelector('#geoPrev').innerHTML='';}refresh();});
        ov.querySelector('#geoLoc').addEventListener('click',()=>{const btn=ov.querySelector('#geoLoc');btn.disabled=true;btn.textContent='📍 Obteniendo GPS…';if(!navigator.geolocation){btn.disabled=false;btn.textContent='📍 Capturar ubicación GPS';ui.toast('Este dispositivo no expone GPS','warn');return;}navigator.geolocation.getCurrentPosition(pos=>{cap={lat:pos.coords.latitude,lon:pos.coords.longitude,ts:new Date().toLocaleString('es-GT'),acc:pos.coords.accuracy};btn.disabled=false;btn.textContent='✅ '+cap.lat.toFixed(5)+', '+cap.lon.toFixed(5)+' · '+cap.ts;refresh();},()=>{cap=null;btn.disabled=false;btn.textContent='📍 Capturar ubicación GPS';refresh();ui.toast('GPS no disponible','warn');},{enableHighAccuracy:true,timeout:8000});});
        save.addEventListener('click',()=>{if(!(cap&&photoOk))return;geoPreview.set(v.id,{lat:cap.lat,lon:cap.lon,ts:cap.ts,acc:cap.acc,pending:true});if(previewUrl)URL.revokeObjectURL(previewUrl);close();draw();ui.toast('Check-in preparado en vista previa · evidencia definitiva pendiente de Storage/backend','warn',3600);});
      }});
    }));
    host.querySelectorAll('[data-sched]').forEach(b=>b.addEventListener('click',()=>{const v=find(b.dataset.sched);if(!v)return;ui.modal('Agendar visita',`<p style="font-size:13px;color:var(--t2);margin-bottom:10px">Elige una fecha dentro del rango y la franja <b>${v.franja||''}</b>.</p><label class="lbl">Fecha</label><input class="inp" id="schD" type="date" value="${v.disponibleDesde||today()}" style="margin-bottom:14px"><div style="text-align:right;margin-top:16px"><button class="btn btn-pr btn-sm" id="schOk">Confirmar agenda</button></div>`,{onMount:(ov,close)=>ov.querySelector('#schOk').addEventListener('click',async()=>{const btn=ov.querySelector('#schOk'),f=ov.querySelector('#schD').value||today();await withCommand(btn,()=>data.setVisitState(v.id,'agendada','agendada',f,{ackAware:true,permission:'visit.schedule',reason:'shopper-schedule'}),async()=>{close();CX.automations&&CX.automations.fire('agenda',{shopper:v.shopper||CX.session.user.name,sucursal:v.sucursal,fecha:f});CX.notif&&CX.notif.push({to:'admin',tipo:'agenda',icon:'📅',tono:'b',titulo:'Visita agendada',txt:(v.shopper||CX.session.user.name)+' · '+v.sucursal+' · '+f,nav:'postulaciones'});ui.toast('Visita agendada y confirmada por backend','ok');});})});}));
    host.querySelectorAll('[data-done]').forEach(b=>b.addEventListener('click',()=>{const v=find(b.dataset.done);if(!v)return;ui.modal('Marcar visita realizada',`<label class="lbl">Fecha de realización</label><input class="inp" id="doneD" type="date" value="${v.agendada||today()}" style="margin-bottom:14px"><div style="text-align:right"><button class="btn btn-green btn-sm" id="doneOk">Confirmar realizada</button></div>`,{onMount:(ov,close)=>ov.querySelector('#doneOk').addEventListener('click',async()=>{const btn=ov.querySelector('#doneOk'),f=ov.querySelector('#doneD').value||today();await withCommand(btn,()=>data.setVisitState(v.id,'realizada','realizada',f,{ackAware:true,permission:'visit.complete',reason:'shopper-complete'}),async()=>{close();CX.automations&&CX.automations.fire('realizada',{shopper:v.shopper||CX.session.user.name,sucursal:v.sucursal});CX.notif&&CX.notif.push({to:'admin',tipo:'realizada',icon:'✅',tono:'g',titulo:'Visita realizada',txt:(v.shopper||CX.session.user.name)+' · '+v.sucursal,nav:'postulaciones'});ui.toast('Visita realizada y confirmada por backend','ok');});})});}));
    host.querySelectorAll('[data-reprog]').forEach(b=>b.addEventListener('click',()=>{const v=find(b.dataset.reprog);if(!v)return;ui.modal('Solicitar reprogramación',`<p style="font-size:13px;color:var(--t2);margin-bottom:10px">La solicitud se autoriza desde Gestión de Postulaciones.</p><label class="lbl">Nueva fecha propuesta</label><input class="inp" id="rpD" type="date" style="margin-bottom:10px"><label class="lbl">Motivo</label><textarea class="inp" id="rpM" rows="2" style="margin-bottom:14px"></textarea><div style="text-align:right"><button class="btn btn-pr btn-sm" id="rpOk">Enviar solicitud</button></div>`,{onMount:(ov,close)=>ov.querySelector('#rpOk').addEventListener('click',async()=>{const btn=ov.querySelector('#rpOk'),f=ov.querySelector('#rpD').value,m=ov.querySelector('#rpM').value||'';await withCommand(btn,()=>data.requestVisitReschedule(v.id,f,{ackAware:true,requestedByShopper:true,reason:m||'shopper-reschedule-request'}),async()=>{close();CX.automations&&CX.automations.fire('reprog',{shopper:v.shopper||CX.session.user.name,sucursal:v.sucursal,fecha:f});ui.toast('Solicitud de reprogramación confirmada','ok');});})});}));
    host.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',async()=>{const v=find(b.dataset.cancel);if(!v)return;await withCommand(b,()=>data.requestVisitCancel(v.id,{ackAware:true,requestOnly:true,reason:'shopper-cancel-request'}),async()=>{CX.notif&&CX.notif.push({to:'admin',tipo:'cancel',icon:'⚠',tono:'r',titulo:'Solicitud de cancelación',txt:v.sucursal,nav:'postulaciones'});ui.toast('Solicitud de cancelación confirmada por backend','ok');});}));
  };
  window.CX_MISVISITAS_CANONICAL_V2={ready:true,completeArrays:true,canonicalFacets:true,ackAwareWrites:true,identityFailClosed:true,localVisitMutation:false};
  draw();return host;
});
