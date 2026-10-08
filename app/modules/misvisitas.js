/* CXOrbia · Mis Visitas (shopper) — canonical Phase A v2
   P0 root correction: exact shopper identity, complete arrays (never find-one), canonical facets
   and command/ACK writes. UI layout and project-driven flow are preserved. */
CX.module('misvisitas',({data,ui})=>{
  const p=data.period();
  const rawSid=String(CX.session?.user?.shopperId||'').trim();
  const sid=rawSid?String(data.__identityMap?.[rawSid]||rawSid).trim():null;
  const shopperProfile=sid?((data.getShopper&&data.getShopper(sid))||(data.shoppers||[]).find(x=>String(x?.id||x?.shopperId||'')===String(sid))||null):null;
  const identityOk=!!(sid&&shopperProfile);
  const mine=identityOk?(data.visitsForShopper?data.visitsForShopper(sid,false):[]):[];
  const engine=window.CX_TYA_CUMULATIVE_READ_MODEL;
  const facets=v=>engine?.facets?engine.facets(v):(data.visitFacets?data.visitFacets(v):(v?.canonicalFacets||{}));
  const contract=v=>data.visitContract?data.visitContract(v):{};
  const scenarioDims=v=>data.scenarioDimensionsForVisit?data.scenarioDimensionsForVisit(v,p):[];
  const scenarioHTML=v=>{const dims=scenarioDims(v);return dims.length?'<div class="cx-scenario-grid">'+dims.map(x=>'<div class="cx-scenario-chip"><span class="cx-scenario-icon">'+x.icon+'</span><span><b>'+x.label+'</b><small>'+x.value+'</small></span></div>').join('')+'</div>':'';};
  const isCancelled=(v,f)=>f.cancelled===true||v.estado==='cancelada'||v.cancelled===true;
  const pendingSchedule=v=>v?.platformSchedulePendingHr?.status==='pending_hr'&&/^20\d{2}-[01]\d-[0-3]\d$/.test(String(v.platformSchedulePendingHr.date||''));
  const periodIdOf=v=>data.recordPeriodId?data.recordPeriodId(v):(v&&(v.periodId||v.projectId));
  const currentPeriodId=String(data.currentPeriodId||'');
  const isCurrentPeriod=v=>String(periodIdOf(v)||'')===currentPeriodId;
  const assigned=mine.filter(v=>{const f=facets(v);return isCurrentPeriod(v)&&f.assigned&&!f.scheduled&&!pendingSchedule(v)&&!f.realized&&!isCancelled(v,f);});
  const scheduled=mine.filter(v=>{const f=facets(v);return isCurrentPeriod(v)&&(f.scheduled||pendingSchedule(v))&&!f.realized&&!isCancelled(v,f);});
  const realized=mine.filter(v=>{const f=facets(v);return isCurrentPeriod(v)&&f.realized&&!f.submitted&&!isCancelled(v,f);});
  const history=mine.filter(v=>{const f=facets(v),c=contract(v);return !isCurrentPeriod(v)||f.submitted||isCancelled(v,f)||c.liquidationState==='confirmado'||c.paymentState==='confirmado'||v.estado==='liquidada';});
  const activeCount=assigned.length+scheduled.length+realized.length;
  const postState=x=>String(x&&(x.estado||x.status)||'').toLowerCase();
  const postPeriod=x=>String((data.recordPeriodId?data.recordPeriodId(x):(x.periodId||x.projectId))||'');
  const visitForApp=a=>{const visitKey=String(a?.visitaId||a?.visitId||''),hrRowKey=String(a?.hrRowId||'');return(data._visitas||[]).find(v=>(visitKey&&[v?.id,v?.visitId].some(k=>String(k||'')===visitKey))||(hrRowKey&&String(v?.hrRowId||'')===hrRowKey))||null;};
  const postSyncState=a=>{
    const state=postState(a),v=visitForApp(a),appShopper=String(a?.shopperId||''),visitShopper=String(v?.shopperId||'');
    if(state==='pendiente')return'pending_review';
    if(state!=='aprobada')return state||'unknown';
    if(v?.assignmentReviewRequired===true||v?.assignmentReviewReason==='hr_platform_assignment_conflict')return'conflict_review_required';
    if(v&&appShopper&&visitShopper&&visitShopper!==appShopper)return'conflict_review_required';
    if(v?.assignmentSource==='platform'&&v?.assignmentSyncStatus==='pending_hr')return'platform_pending_hr_sync';
    if(v&&appShopper&&visitShopper===appShopper)return'assigned_confirmed';
    return'approved_assignment_review';
  };
  const currentApps=identityOk?(data._posts||[]).filter(x=>x?._archived!==true&&String(x.shopperId||'')===String(sid)&&postPeriod(x)===String(data.currentPeriodId)):[];
  const pendingApps=currentApps.filter(x=>postState(x)==='pendiente');
  const safe=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let view='activas';
  let scheduleReturnView='misvisitas';
  const host=ui.el('div');
  const projectTimezone=String(p?.timeZone||p?.timezone||data?.ctx?.()?.timeZone||'America/Guatemala');
  const today=()=>{const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:projectTimezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return parts.year+'-'+parts.month+'-'+parts.day;};
  const pendingReschedule=v=>v?.rescheduleRequest?.status==='pending_review';
  const pendingCancel=v=>v?.cancelRequest?.status==='pending_review';
  const dateWindowCheck=(v,value)=>{
    if(!/^20\d{2}-[01]\d-[0-3]\d$/.test(String(value||'')))return 'Selecciona una fecha válida.';
    const date=new Date(value+'T00:00:00Z');
    if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)return 'Esa fecha no existe en el calendario.';
    const code=String(v?.franjaCode||v?.franja||'').trim().toUpperCase();
    const weekend=[0,6].includes(date.getUTCDay());
    if((code==='WK'||code==='SEMANA'||code==='ENTRE SEMANA')&&weekend)return 'Esta visita requiere un día entre semana.';
    if((code==='WKND'||code==='FIN DE SEMANA'||code==='WEEKEND')&&!weekend)return 'Esta visita requiere un día de fin de semana.';
    const period=String(v?.periodKey||p?.periodKey||data.currentPeriodId||'').match(/20\d{2}-(?:0[1-9]|1[0-2])/);
    const q=String(v?.quincena||v?.executionCut||'').trim().toUpperCase();
    if(period&&value.slice(0,7)!==period[0])return 'La fecha debe pertenecer al período de esta visita.';
    if(/^(1Q|Q1|QUINCENA\s*1|PRIMERA QUINCENA)$/.test(q)&&Number(value.slice(8,10))>15)return 'La visita corresponde a la primera quincena.';
    if(/^(2Q|Q2|QUINCENA\s*2|SEGUNDA QUINCENA)$/.test(q)&&Number(value.slice(8,10))<16)return 'La visita corresponde a la segunda quincena.';
    if(value<today())return 'La fecha no puede ser anterior al día de hoy.';
    if(v?.disponibleDesde&&value<String(v.disponibleDesde).slice(0,10))return 'La fecha es anterior a la disponibilidad de la visita.';
    return '';
  };
  const scheduledDateOf=v=>String(v?.agendada||v?.scheduledDate||v?.fechaAgendada||v?.platformSchedulePendingHr?.date||'').slice(0,10);
  const canCompleteVisit=v=>{const d=scheduledDateOf(v);return !!facets(v).scheduled&&!!d&&today()>=d;};
  const committed=r=>r?.ok===true&&r?.status==='committed'&&r?.providerAck===true&&r?.successUiAllowed===true;
  const commandMessage=r=>r?.code==='COMMAND_WRITES_DISABLED'
    ?'La acción está preparada, pero las escrituras reales siguen cerradas por gate. No se modificó la visita.'
    :'La acción no pudo confirmarse. No se modificó la visita.';
  const withCommand=async(btn,fn,onSuccess)=>{
    if(btn.dataset.cxCommandBusy==='true')return false;
    const prev=btn.textContent;btn.disabled=true;btn.dataset.cxCommandBusy='true';btn.setAttribute('aria-busy','true');btn.textContent='⏳ Guardando…';
    try{
      const r=await fn();
      if(!committed(r)){ui.toast(commandMessage(r),'warn',4200);return false;}
      btn.textContent='⏳ Actualizando información…';
      try{await CX.backend?.refresh?.();}catch(_){}
      try{await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('shopper_visit_command_committed');}catch(_){}
      if(onSuccess)await onSuccess(r);
      return true;
    }catch(_){ui.toast('No fue posible confirmar la acción. No se aplicó un cambio local.','err',4200);return false;}
    finally{delete btn.dataset.cxCommandBusy;btn.removeAttribute('aria-busy');btn.disabled=false;btn.textContent=prev;}
  };

  const stageOf=v=>{
    const f=facets(v),c=contract(v);
    if(c.paymentState==='confirmado')return'liquidada';
    if(f.submitted)return'submit';
    if(f.questionnaire)return'cuestionario';
    if(f.realized)return'realizada';
    if(f.scheduled||pendingSchedule(v))return'agendada';
    return'asignada';
  };
  const certificationState=()=>{
    let bank=null;try{bank=CX.certStore?.bank?.(p.id,window.CX_CERT_SELECTED_ID||'main')||CX.certStore?.bank?.(p.id)||null;}catch(_){}
    const durable=(sid&&CX.backendCertifications?.durableCurrent)?CX.backendCertifications.durableCurrent(sid,bank):null;
    const carry=(sid&&CX.backendCertifications?.carryoverDecision)?CX.backendCertifications.carryoverDecision(shopperProfile,bank,data.currentProjectId||p.projectId||''):{eligibilityGranted:false};
    const explicitlyNotRequired=!!(bank&&bank.required===false);
    const done=!!durable||carry?.eligibilityGranted===true||explicitlyNotRequired;
    const required=!explicitlyNotRequired&&!done;
    return {required,done,bank,durable,carry};
  };
  const routeState=v=>{
    const f=facets(v),c=contract(v),certState=certificationState();
    const checks=[
      {key:'asignada',label:'Asignada',done:!!f.assigned},
      {key:'instructivo',label:'Instructivo y documentos',done:!!v.instructiveReadAt},
      {key:'certificacion',label:'Certificación del proyecto',done:certState.done,note:certState.required?'':'No requerida'},
      {key:'agendada',label:pendingSchedule(v)?'Fecha registrada · pendiente HR':'Visita agendada',done:!!f.scheduled},
      {key:'realizada',label:'Visita realizada',done:!!f.realized},
      {key:'cuestionario',label:'Cuestionario',done:!!f.questionnaire},
      {key:'revision',label:'Revisión',done:!!(v.reviewedAt||v.reviewCompletedAt||['approved','revisada','reviewed'].includes(String(v.reviewStatus||v.revisionEstado||'').toLowerCase())||f.submitted)},
      {key:'submit',label:'Submitida',done:!!f.submitted},
      {key:'liquidada',label:'Liquidada',done:!!(f.liquidationConfirmed||f.paymentConfirmed||c.paymentState==='confirmado')}
    ];
    const firstPending=checks.findIndex(x=>!x.done);
    return {certState,checks:checks.map((x,i)=>({...x,state:x.done?'done':i===firstPending?'now':'todo'})),scheduleReady:!!v.instructiveReadAt&&certState.done};
  };
  const flowSteps=v=>routeState(v).checks;
  const geoOn=!!(CX.addons&&CX.addons.on('geo_checkin','shopper'));
  const geoBtn=v=>{if(!geoOn||!v)return'';return v.checkInStatus==='confirmed'&&v.latestCheckInEvidenceId
    ?`<button class="btn btn-soft btn-sm" data-geo="${v.id}" title="Evidencia confirmada y asociada a esta visita">✅ Check-in confirmado</button>`
    :`<button class="btn btn-green btn-sm" data-geo="${v.id}">📍 Check-in geolocalizado</button>`;};
  const kindOf=v=>{const f=facets(v);return f.realized?'realizada':(f.scheduled||pendingSchedule(v))?'agendada':'asignada';};
  const requestNotes=v=>{
    const messages=[];
    if(pendingReschedule(v))messages.push('<div class="cx-visit-request-note" role="status">🔄 Reprogramación solicitada para <b>'+safe(v.rescheduleRequest.newDate||'fecha por revisar')+'</b> · pendiente de autorización por el equipo.</div>');
    if(pendingCancel(v))messages.push('<div class="cx-visit-request-note" role="status">⚠️ Cancelación solicitada · pendiente de revisión. La visita sigue asignada hasta decisión y confirmación de HR.</div>');
    if(v?.rescheduleRequest?.status==='rejected')messages.push('<div class="cx-visit-request-note">La reprogramación anterior no fue autorizada. Se conserva la fecha vigente.</div>');
    if(v?.cancelRequest?.status==='rejected')messages.push('<div class="cx-visit-request-note">La solicitud de cancelación anterior no fue autorizada.</div>');
    return messages.join('');
  };
  const visitCard=v=>{
    const kind=kindOf(v),tone={asignada:'amber',agendada:'green',realizada:'brand'}[kind],cfg=p.cuestionario||{modo:'interna'};
    let actions='';
    if(kind==='asignada'){const route=routeState(v),certDone=route.certState.done;actions=`<button class="btn btn-ghost btn-sm" data-doc="${v.id}">${v.instructiveReadAt?'✓ Instructivo leído':'📄 Instructivo'}</button><button class="btn btn-soft btn-sm" data-cert="${v.id}" ${v.instructiveReadAt?'':'aria-disabled="true" title="Primero confirma la lectura del instructivo"'}>${certDone?'✓ Certificación vigente':'🏆 Certificarme'}</button><button class="btn ${route.scheduleReady?'btn-pr':'btn-soft'} btn-sm" data-sched="${v.id}" ${route.scheduleReady?'':'aria-disabled="true" title="Completa instructivo y certificación antes de agendar"'}>📅 Agendar</button>${geoBtn(v)}`;}
    else if(kind==='agendada'){const ready=canCompleteVisit(v),date=scheduledDateOf(v);actions=`<button class="btn ${ready?'btn-green':'btn-soft'} btn-sm" data-done="${v.id}" ${ready?'':'aria-disabled="true" title="Se habilita el día de la visita"'}>${ready?'✅ Marcar realizada':'🕒 Disponible el '+(date||'día de la visita')}</button><button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button><button class="btn btn-ghost btn-sm" data-reprog="${v.id}" ${pendingReschedule(v)||pendingCancel(v)?'disabled aria-disabled="true"':''}>🔄 Reprogramar</button><button class="btn btn-ghost btn-sm" data-cancel="${v.id}" ${pendingCancel(v)||pendingReschedule(v)?'disabled aria-disabled="true"':''}>✕ Solicitar cancelación</button>${geoBtn(v)}`;}
    else if(facets(v).questionnaire)actions=`<span class="bdg bdg-g" data-questionnaire-complete="${v.id}">✓ Cuestionario completado · pendiente de revisión/submit</span><button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button>`;
    else actions=`<button class="btn btn-pr btn-sm" data-quest="${v.id}">📝 ${cfg.modo==='interna'?'Llenar cuestionario':'Abrir cuestionario'}</button><button class="btn btn-ghost btn-sm" data-doc="${v.id}">📄 Instructivo</button>`;
    const badge=pendingSchedule(v)?ui.bdg('📅 Registrada en CXOrbia · pendiente HR · '+scheduledDateOf(v),'a'):kind==='agendada'?ui.bdg('📅 Agendada '+scheduledDateOf(v),'g'):kind==='asignada'?ui.bdg('🧭 Asignada · por agendar','b'):ui.bdg(facets(v).questionnaire?'📝 Cuestionario · pendiente de revisión':'🎬 Realizada · pendiente de cuestionario','b');
    const progress=flowSteps(v).map(s=>`<span class="cx-visit-progress-step ${s.state==='done'?'is-done':s.state==='now'?'is-now':'is-next'}">${s.state==='done'?'✅':s.state==='now'?'▶️':'⏳'} <span>${s.label}</span></span>`).join('');
    return `<div class="card card-p cx-shopper-visit-card" data-visit-card="${v.id}"><div class="between cx-visit-card-head"><div><div class="cx-visit-kicker">🎬 Tu visita</div><b class="cx-visit-title">${v.sucursal}</b><div class="cx-visit-location">📍 ${v.ciudad||''} ${v.pais?'· '+CX.paisFlag(v.pais)+' '+v.pais:''}</div></div>${badge}</div>${scenarioHTML(v)}<div class="cx-visit-payline"><span>💼 Honorario: <b>${ui.money(v.currency,v.honorario)}</b></span>${(v.reembolso||v.comboAmt||v.boleto)?'<span>🧾 Reembolso incluido</span>':''}</div>${scheduledDateOf(v)?`<div class="cx-visit-date-summary">📅 ${pendingSchedule(v)?'Fecha registrada · pendiente de sincronización HR':'Fecha agendada'}: <b>${scheduledDateOf(v)}</b></div>`:''}<div class="flex wrap cx-visit-actions">${actions}</div>${requestNotes(v)}<div class="cx-visit-progress">${progress}</div></div>`;
  };
  const blockedHTML=()=>`${ui.ph('Mis Visitas',p?.name||'')}<div class="card card-p" style="border-left:3px solid var(--red)"><div class="flex" style="gap:8px;align-items:center;margin-bottom:6px"><span style="font-size:20px">🔒</span><b>Identidad de evaluador no verificable</b></div><div style="font-size:12.5px;color:var(--t2)">No pudimos verificar tu perfil de evaluador en esta sesión. Por seguridad no se muestran ni se modifican visitas.</div></div>`;
  const tabs=()=>`<div class="flex" style="margin-bottom:14px;gap:8px;flex-wrap:wrap"><button class="btn btn-sm ${view==='activas'?'btn-pr':'btn-ghost'}" data-view="activas">Activas ${activeCount}</button><button class="btn btn-sm ${view==='historial'?'btn-pr':'btn-ghost'}" data-view="historial">Historial ${history.length}</button><span class="bdg ${currentApps.length?'bdg-a':'bdg-n'}">Postulaciones ${currentApps.length}</span></div>`;
  const applicationPresentation=a=>{
    const state=postState(a),sync=postSyncState(a);
    if(sync==='conflict_review_required')return{badge:ui.bdg('En revisión','a'),title:'Aprobación en revisión',copy:'Tu postulación fue aprobada, pero la asignación vigente en Hoja de Ruta no coincide. El equipo debe revisarla antes de mostrarla como visita asignada.',tone:'amber'};
    if(sync==='platform_pending_hr_sync')return{badge:ui.bdg('Aprobada · por confirmar','a'),title:'Aprobada',copy:'Tu postulación fue aprobada y está pendiente de confirmarse en Hoja de Ruta.',tone:'amber'};
    if(sync==='assigned_confirmed')return{badge:ui.bdg('Aprobada','g'),title:'Aprobada',copy:'La asignación está confirmada y la visita aparece en tu flujo activo.',tone:'green'};
    if(sync==='approved_assignment_review')return{badge:ui.bdg('Aprobada · validando','a'),title:'Aprobada',copy:'La aprobación está registrada y la asignación aún se está validando.',tone:'amber'};
    if(state==='standby')return{badge:ui.bdg('Standby','n'),title:'En standby',copy:'Tu postulación sigue registrada y está en espera de decisión.',tone:'amber'};
    if(state==='rechazada')return{badge:ui.bdg('Rechazada','r'),title:'Postulación revisada',copy:'Esta postulación fue revisada y no quedó asignada.',tone:'red'};
    if(state==='cancelada')return{badge:ui.bdg('Cancelada','n'),title:'Postulación cancelada',copy:'Esta postulación ya no está activa.',tone:'amber'};
    return{badge:ui.bdg('Pendiente','a'),title:'Postulación pendiente',copy:'Tu postulación está registrada y pendiente de decisión. No cuenta como visita activa hasta que exista asignación confirmada.',tone:'amber'};
  };
  const applicationsHTML=()=>currentApps.length?`<div class="card card-p" style="margin-bottom:12px;border-left:3px solid var(--amber)"><div class="card-h"><div class="card-t">Estado de tus postulaciones</div><span class="bdg bdg-a">${currentApps.length}</span></div>${currentApps.map(a=>{const v=visitForApp(a),present=applicationPresentation(a),sync=postSyncState(a);return`<div data-app-state="${sync}" style="padding:9px 0;border-top:1px solid var(--border-2)"><div class="between" style="gap:12px"><div><b style="font-size:12.5px">${v?.sucursal||a.sucursal||'Visita'}</b><div style="font-size:10.5px;color:var(--t3)">${a.fechaProp||a.proposedDate||'Fecha pendiente'} · ${v?.ciudad||a.ciudad||''}</div></div>${present.badge}</div><div style="font-size:11.5px;color:var(--t2);margin-top:6px"><b>${present.title}.</b> ${present.copy}</div></div>`;}).join('')}</div>`:''; 
  const activeHTML=()=>`${ui.ph('Mis Visitas',(p?.name||'')+' · agenda, ejecuta y da seguimiento')}${tabs()}${applicationsHTML()}${geoOn?`<div class="card card-p" style="margin-bottom:12px;border-left:3px solid var(--green)"><div class="flex" style="gap:8px;align-items:center;margin-bottom:4px"><span style="font-size:18px">📍</span><b style="font-size:13px">Check-in con foto geolocalizada</b><span class="bdg bdg-a" style="font-size:10px">Se confirma por visita</span></div><div style="font-size:11.5px;color:var(--t2)">La foto se guarda en Storage con scope de la visita y el GPS queda asociado solo cuando Storage y el provider confirman la operación.</div></div>`:''}${assigned.map(visitCard).join('')}${scheduled.map(visitCard).join('')}${realized.map(visitCard).join('')}${activeCount?'':ui.empty('🗓️','No tienes visitas activas en este momento.')}<div class="card card-p">${ui.aiBox('Cada cambio se muestra como confirmado únicamente cuando queda guardado correctamente. Si no puede guardarse, tu visita permanece sin cambios.','Seguimiento seguro de la visita')}</div>`;
  const historyHTML=()=>`${ui.ph('Mis Visitas',(p?.name||'')+' · agenda, ejecuta y da seguimiento')}${tabs()}<div class="card card-p"><div class="card-h"><div class="card-t">Historial de visitas</div><span class="muted" style="font-size:11px">submitidas, liquidadas, pagadas o canceladas</span></div>${history.length?`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Sucursal</th><th>Escenario</th><th>Fecha</th><th>Honorario</th><th>Estado</th><th>Pago</th></tr></thead><tbody>${history.map(v=>{const vc=contract(v);const pay=!vc||vc.paymentState==='no_aplica'?'<span class="muted" style="font-size:11px">—</span>':vc.paymentState==='confirmado'?ui.bdg('Pagado (confirmado)','g'):ui.bdg('Pago pendiente de confirmación','a');return`<tr data-history-visit="${v.id}" style="cursor:pointer" title="Abrir detalle de la visita"><td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad||''}</div></td><td style="font-size:12px">${data.scenarioSummaryForVisit?data.scenarioSummaryForVisit(v,p):(v.escenario||'')}</td><td style="font-size:12px">${v.realizada||v.fechaPago||v.agendada||'—'}</td><td>${ui.money(v.currency,v.honorario)}</td><td>${ui.estadoBadge(v.estado)}</td><td>${pay}</td></tr>`;}).join('')}</tbody></table></div>`:ui.empty('🗒️','Aún no tienes visitas en tu historial.')}</div>`;

  const find=id=>mine.find(v=>String(v.id)===String(id));
  const consumePendingAction=()=>{
    const req=window.CX_PENDING_SHOPPER_VISIT_ACTION;
    if(!req||Date.now()-Number(req.requestedAt||0)>20000)return;
    const action=String(req.action||''),visitId=String(req.visitId||'');
    if(action==='schedule'&&req.returnView==='midia')scheduleReturnView='midia';
    const attr={instructive:'doc',schedule:'sched',reschedule:'reprog'}[action];
    const target=attr?[...host.querySelectorAll('[data-'+attr+']')].find(el=>String(el.dataset[attr]||'')===visitId):null;
    delete window.CX_PENDING_SHOPPER_VISIT_ACTION;
    if(target)setTimeout(()=>target.click(),0);else ui.toast('La acción ya no aplica al estado actual de esta visita.','warn',3200);
  };
  const bindHistory=()=>host.querySelectorAll('[data-history-visit]').forEach(tr=>tr.addEventListener('click',()=>{const v=find(tr.dataset.historyVisit);if(!v)return;const c=contract(v),f=facets(v);ui.modal('📋 '+safe(v.sucursal||'Detalle de visita'),`<div class="grid g2" style="gap:10px 16px"><div><span class="muted">Periodo</span><div><b>${safe(v.periodLabel||v.periodKey||periodIdOf(v)||'—')}</b></div></div><div><span class="muted">Estado</span><div>${ui.estadoBadge(v.estado)}</div></div><div><span class="muted">Escenario</span><div>${safe(data.scenarioSummaryForVisit?data.scenarioSummaryForVisit(v,p):(v.escenario||'—'))}</div></div><div><span class="muted">Honorario</span><div>${v.honorario!=null?ui.money(v.currency,v.honorario):'Pendiente de fuente'}</div></div><div><span class="muted">Agendada</span><div>${safe(v.agendada||'—')}</div></div><div><span class="muted">Realizada</span><div>${safe(v.realizada||'—')}</div></div><div><span class="muted">Submitida</span><div>${f.submitted?'Sí':'No'}</div></div><div><span class="muted">Pago</span><div>${c?.paymentState==='confirmado'?'Pago confirmado':'Pendiente de confirmación'}</div></div></div><div style="font-size:11px;color:var(--t3);margin-top:12px">Este detalle usa la misma visita canónica del histórico y no modifica datos.</div>`);}));
  const draw=()=>{if(!identityOk){host.innerHTML=blockedHTML();return;}host.innerHTML=view==='historial'?historyHTML():activeHTML();host.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;draw();}));if(view==='activas'){bindActive();consumePendingAction();}else bindHistory();};
  const bindActive=()=>{
    host.querySelectorAll('[data-doc]').forEach(b=>b.addEventListener('click',async()=>{
      const v=find(b.dataset.doc);if(!v)return;
      const resourceScope={projectId:data.currentProjectId,periodId:data.currentPeriodId,resourceType:'project_resource'};
      let resources=CX.backendResources?.list?.(resourceScope)||[];
      let doc=resources.find(r=>(!r.visitaId||String(r.visitaId)===String(v.id))&&/instruct|manual|protocolo/i.test(String(r.n||r.name||r.title||r.tipo||'')))||null;
      if(!doc&&typeof CX.backendResources?.load==='function'){
        try{await CX.backendResources.load(resourceScope);resources=CX.backendResources?.list?.(resourceScope)||[];doc=resources.find(r=>(!r.visitaId||String(r.visitaId)===String(v.id))&&/instruct|manual|protocolo/i.test(String(r.n||r.name||r.title||r.tipo||'')))||null;}catch(_){/* fail closed below */}
      }
      if(!doc){ui.toast('No hay un instructivo publicado para esta visita.','warn',3600);CX.router.nav('documentos');return;}
      const body=String(doc.body||'').trim();
      ui.modal('📄 '+safe(doc.n||doc.name||'Instructivo'),`
        <div style="font-size:14px;color:var(--t2);margin-bottom:10px">Recurso del proyecto · revisión ${safe(doc.contentRevision||doc.version||doc.updatedAt||'vigente')}</div>
        <div class="card card-p" style="max-height:45vh;overflow:auto;white-space:pre-wrap;font-size:14px;line-height:1.65">${body?safe(body.slice(0,12000)):'Abre el recurso completo para revisar su contenido.'}</div>
        <div class="between" style="margin-top:12px;gap:8px"><button class="btn btn-ghost btn-sm" id="docOpenFull">Abrir en Recursos</button><button class="btn btn-pr btn-sm" id="docReadAck">${v.instructiveReadAt?'✓ Lectura ya confirmada':'Confirmo que lo he leído'}</button></div>
      `,{premium:true,replaceExisting:true,dismissOnBackdrop:false,onMount:(ov,close)=>{
        ov.querySelector('#docOpenFull').addEventListener('click',()=>{close();CX.router.nav('documentos');});
        ov.querySelector('#docReadAck').addEventListener('click',async e=>{
          if(v.instructiveReadAt){close();return;}
          const btn=e.currentTarget;btn.disabled=true;btn.textContent='Confirmando…';
          try{
            if(typeof data.recordResourceReadReceipt!=='function')throw new Error('RESOURCE_READ_RECEIPT_UNAVAILABLE');
            const r=await data.recordResourceReadReceipt(v.id,doc,{ackAware:true,reason:'shopper-instructive-read'});
            if(!committed(r))throw new Error(r?.code||'RESOURCE_READ_RECEIPT_NOT_COMMITTED');
            try{await CX.backend?.refresh?.();}catch(_){}
            try{await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('shopper_instructive_read_committed');}catch(_){}
            close();ui.toast('Lectura del instructivo confirmada y guardada.','ok',3200);CX.router.nav('misvisitas',{history:false});
          }catch(error){btn.disabled=false;btn.textContent='Confirmo que lo he leído';ui.toast('No fue posible confirmar la lectura. No se registró como completada.','warn',4200);}
        });
      },dismissOnBackdrop:false});
    }));
    host.querySelectorAll('[data-cert]').forEach(b=>b.addEventListener('click',()=>{const v=find(b.dataset.cert);if(!v)return;if(!v.instructiveReadAt){ui.toast('Primero confirma la lectura del instructivo.','warn',3200);return;}CX.router.nav('cert');}));
    host.querySelectorAll('[data-quest]').forEach(b=>b.addEventListener('click',()=>CX.shopperQuestionnaire(data,p,find(b.dataset.quest),ui)));
    host.querySelectorAll('[data-geo]').forEach(b=>b.addEventListener('click',()=>{
      const v=find(b.dataset.geo);if(!v)return;
      ui.modal('📍 Check-in geolocalizado · '+v.sucursal,`<div style="background:var(--brand-light);border-radius:9px;padding:9px 12px;font-size:11.5px;color:var(--brand-dark);margin-bottom:12px">🔒 La evidencia solo se confirma cuando la foto queda en Storage y el GPS queda asociado a esta visita mediante ACK remoto.</div><input type="file" accept="image/*" capture="environment" class="inp" id="geoPhoto" style="padding:6px;font-size:12px;margin-bottom:8px"><div id="geoPrev" style="margin-bottom:10px"></div><button class="btn btn-soft btn-sm" id="geoLoc" type="button" style="width:100%;justify-content:center;margin-bottom:6px">📍 Capturar ubicación GPS</button><div id="geoMsg" style="font-size:11px;color:var(--t3);min-height:16px"></div><div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="geoSave" disabled>Guardar check-in</button></div>`,{onMount:(ov,close)=>{
        let cap=null,file=null,previewUrl=null;const save=ov.querySelector('#geoSave');const refresh=()=>{save.disabled=!(cap&&cap.lat!=null&&file);};
        ov.querySelector('#geoPhoto').addEventListener('change',e=>{file=e.target.files[0]||null;if(previewUrl)URL.revokeObjectURL(previewUrl);if(file){previewUrl=URL.createObjectURL(file);ov.querySelector('#geoPrev').innerHTML='<img src="'+previewUrl+'" style="max-width:100%;max-height:150px;border-radius:8px"><div style="font-size:10.5px;color:var(--t3);margin-top:4px">Vista previa local; todavía no se considera evidencia.</div>';}else ov.querySelector('#geoPrev').innerHTML='';refresh();});
        ov.querySelector('#geoLoc').addEventListener('click',()=>{const btn=ov.querySelector('#geoLoc');btn.disabled=true;btn.textContent='📍 Obteniendo GPS…';if(!navigator.geolocation){btn.disabled=false;btn.textContent='📍 Capturar ubicación GPS';ui.toast('Este dispositivo no expone GPS','warn');return;}navigator.geolocation.getCurrentPosition(pos=>{cap={lat:pos.coords.latitude,lon:pos.coords.longitude,accuracy:pos.coords.accuracy,capturedAt:new Date().toISOString()};btn.disabled=false;btn.textContent='✅ '+cap.lat.toFixed(5)+', '+cap.lon.toFixed(5)+' · ±'+Math.round(cap.accuracy||0)+' m';refresh();},()=>{cap=null;btn.disabled=false;btn.textContent='📍 Capturar ubicación GPS';refresh();ui.toast('GPS no disponible','warn');},{enableHighAccuracy:true,timeout:10000,maximumAge:0});});
        save.addEventListener('click',async()=>{if(!(cap&&file))return;save.disabled=true;save.textContent='Guardando evidencia…';let uploaded=null;
          try{
            if(!CX.backendResources?.uploadVisitEvidence||typeof data.recordVisitCheckinEvidence!=='function')throw new Error('CHECKIN_PROVIDER_UNAVAILABLE');
            uploaded=await CX.backendResources.uploadVisitEvidence(file,{projectId:data.currentProjectId,periodId:data.currentPeriodId,visitId:v.id,shopperId:sid});
            if(!(uploaded?.providerAck===true&&uploaded?.storageProviderAck===true&&uploaded?.item?.storagePath))throw new Error(uploaded?.code||'CHECKIN_STORAGE_ACK_REQUIRED');
            const r=await data.recordVisitCheckinEvidence(v.id,Object.assign({},uploaded.item,cap,{storageProviderAck:true}),{ackAware:true,reason:'shopper-geo-checkin'});
            if(!committed(r))throw new Error(r?.code||'CHECKIN_PROVIDER_ACK_REQUIRED');
            if(previewUrl)URL.revokeObjectURL(previewUrl);
            try{await CX.backend?.refresh?.();}catch(_){}
            close();ui.toast('Check-in guardado y asociado a la visita.','ok',3600);draw();
          }catch(error){
            if(uploaded?.item?.storagePath)await CX.backendResources.deleteVisitEvidence(uploaded.item.storagePath,{projectId:data.currentProjectId,periodId:data.currentPeriodId,visitId:v.id,shopperId:sid}).catch(()=>{});
            save.disabled=false;save.textContent='Guardar check-in';ui.toast('No se confirmó el check-in. La visita no se marcó como evidenciada.','warn',4600);
          }
        });
      },dismissOnBackdrop:false});
    }));
    host.querySelectorAll('[data-sched]').forEach(b=>b.addEventListener('click',()=>{
      const v=find(b.dataset.sched);if(!v)return;
      if(!routeState(v).scheduleReady){ui.toast('Completa primero el instructivo y la certificación requerida.','warn',3600);return;}
      const minDate=(v.disponibleDesde&&v.disponibleDesde>today())?v.disponibleDesde:today();
      const proposed=String(v.proposedScheduleDate||v.approvedProposedDate||'');
      const defaultDate=(/^20\d{2}-[01]\d-[0-3]\d$/.test(proposed)&&proposed>=minDate)?proposed:minDate;
      ui.modal('📅 Agendar visita',`<div class="cx-schedule-modal-intro"><b>${safe(v.sucursal)}</b><span>${safe(p?.periodo||p?.ronda||p?.name||'Periodo actual')} · ${safe(v.ciudad||'')} · ${safe(v.franja||'Franja pendiente')}</span></div><p class="cx-schedule-modal-instructions">Elige una fecha dentro del rango y la franja indicada. Se comprobará el registro en CXOrbia; la confirmación de la HR externa se mostrará por separado.</p><label class="lbl" for="schD">Fecha propuesta</label><input class="inp" id="schD" type="date" min="${minDate}" value="${defaultDate}"><div class="cx-schedule-modal-actions"><button class="btn btn-pr" id="schOk">Confirmar agenda</button></div>`,{premium:true,replaceExisting:true,dismissOnBackdrop:false,onMount:(ov,close)=>ov.querySelector('#schOk').addEventListener('click',async()=>{
        const btn=ov.querySelector('#schOk'),f=ov.querySelector('#schD').value||defaultDate;
        if(f<minDate){ui.toast('La fecha no puede ser anterior a la disponibilidad vigente','warn');return;}
        await withCommand(btn,()=>data.setVisitState(v.id,'agendada','agendada',f,{ackAware:true,permission:'visit.schedule',reason:'shopper-schedule'}),async()=>{
          close();ui.toast('Fecha guardada en CXOrbia. Si HR aún no la refleja, se mostrará pendiente de sincronización.','ok',4400);
          CX.router.nav(scheduleReturnView==='midia'?'midia':'misvisitas');
        });
      })});
    }));
    host.querySelectorAll('[data-done]').forEach(b=>b.addEventListener('click',()=>{const v=find(b.dataset.done);if(!v)return;if(!canCompleteVisit(v)){ui.toast('Podrás marcar la visita como realizada a partir del '+(scheduledDateOf(v)||'día agendado')+'.','warn',3600);return;}const minDate=scheduledDateOf(v),maxDate=today();ui.modal('Marcar visita realizada',`<label class="lbl">Fecha de realización</label><input class="inp" id="doneD" type="date" min="${minDate}" max="${maxDate}" value="${maxDate}" style="margin-bottom:14px"><div style="text-align:right"><button class="btn btn-green btn-sm" id="doneOk">Confirmar realizada</button></div>`,{onMount:(ov,close)=>ov.querySelector('#doneOk').addEventListener('click',async()=>{const btn=ov.querySelector('#doneOk'),f=ov.querySelector('#doneD').value||maxDate;if(f<minDate||f>maxDate){ui.toast('La fecha de realización debe estar entre la fecha agendada y hoy.','warn');return;}await withCommand(btn,()=>data.setVisitState(v.id,'realizada','realizada',f,{ackAware:true,permission:'visit.complete',reason:'shopper-complete'}),async()=>{close();CX.automations&&CX.automations.fire('realizada',{shopper:v.shopper||CX.session.user.name,sucursal:v.sucursal});CX.notif&&CX.notif.push({to:'admin',tipo:'realizada',icon:'✅',tono:'g',titulo:'Visita realizada',txt:(v.shopper||CX.session.user.name)+' · '+v.sucursal,nav:'postulaciones'});ui.toast('Visita realizada correctamente','ok');});})});}));
    host.querySelectorAll('[data-reprog]').forEach(b=>b.addEventListener('click',()=>{const v=find(b.dataset.reprog);if(!v)return;ui.modal('🔄 Solicitar reprogramación',`<div class="cx-schedule-modal-intro"><b>${safe(v.sucursal)}</b><span>Fecha registrada: ${safe(scheduledDateOf(v)||'Sin fecha')} · ${pendingSchedule(v)?'Pendiente de HR externa':'Confirmada en HR'}</span></div><p class="cx-schedule-modal-instructions">El equipo revisará esta solicitud y autorizará la nueva fecha desde Gestión de Postulaciones.</p><label class="lbl">Nueva fecha propuesta</label><input class="inp" id="rpD" type="date" style="margin-bottom:10px"><label class="lbl">Motivo</label><textarea class="inp" id="rpM" rows="2" style="margin-bottom:14px"></textarea><div style="text-align:right"><button class="btn btn-pr btn-sm" id="rpOk">Enviar solicitud</button></div>`,{premium:true,replaceExisting:true,dismissOnBackdrop:false,onMount:(ov,close)=>ov.querySelector('#rpOk').addEventListener('click',async()=>{const btn=ov.querySelector('#rpOk'),f=ov.querySelector('#rpD').value,m=ov.querySelector('#rpM').value||'';const validation=dateWindowCheck(v,f);if(validation){ui.toast(validation,'warn',4200);return;}if(!m.trim()){ui.toast('Indica el motivo de la solicitud.','warn',4000);return;}if(pendingReschedule(v)||pendingCancel(v)){ui.toast('Ya existe una solicitud pendiente para esta visita.','warn');return;}await withCommand(btn,()=>data.requestVisitReschedule(v.id,f,{ackAware:true,requestedByShopper:true,reason:m.trim()}),async()=>{close();CX.router.nav('misvisitas');ui.toast('Solicitud registrada para revisión. La fecha actual se mantiene hasta autorización.','ok');});})});}));
    host.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',()=>{
      const v=find(b.dataset.cancel);if(!v)return;
      if(pendingCancel(v)||pendingReschedule(v)){ui.toast('La visita ya tiene una solicitud pendiente de revisión.','warn');return;}
      ui.modal('⚠️ Solicitar cancelación',
        '<p class="cx-cancel-warning">Esta solicitud no cancela inmediatamente la visita ni modifica la HR. Un administrador revisará tu motivo y decidirá.</p>'+
        '<div class="cx-schedule-modal-intro"><b>'+safe(v.sucursal)+'</b><span>Fecha vigente: '+safe(scheduledDateOf(v)||'Pendiente')+'</span></div>'+
        '<label class="lbl" for="cxCancelReason">Motivo de la solicitud (obligatorio)</label><textarea class="inp" id="cxCancelReason" rows="3" maxlength="500" placeholder="Explica por qué necesitas cancelar esta visita"></textarea>'+
        '<div class="cx-schedule-modal-actions"><button class="btn btn-ghost" id="cxCancelBack" type="button">Conservar mi visita</button><button class="btn btn-pr" id="cxCancelConfirm" type="button">Enviar solicitud</button></div>',
        {premium:true,replaceExisting:true,dismissOnBackdrop:false,onMount:(ov,close)=>{
          ov.querySelector('#cxCancelBack').addEventListener('click',close);
          ov.querySelector('#cxCancelConfirm').addEventListener('click',async()=>{
            const btn=ov.querySelector('#cxCancelConfirm');const reason=ov.querySelector('#cxCancelReason').value.trim();
            if(!reason){ui.toast('El motivo es obligatorio antes de solicitar la cancelación.','warn');return;}
            await withCommand(btn,()=>data.requestVisitCancel(v.id,{ackAware:true,requestOnly:true,reason}),async()=>{
              close();CX.router.nav('misvisitas');ui.toast('Solicitud registrada. La visita sigue vigente hasta la decisión del equipo.','ok',4000);
            });
          });
        }});
    }));
  };
  window.CX_MISVISITAS_CANONICAL_V2={ready:true,completeArrays:true,canonicalFacets:true,ackAwareWrites:true,identityFailClosed:true,localVisitMutation:false};
  draw();return host;
});
