/* CXOrbia · Postulaciones (admin) — full fidelity */
/* B7 — Modal propietario de Postulaciones, reutilizado desde Dashboard sin navegación. */
CX.adminPostulacionesActions=CX.adminPostulacionesActions||{};
/* B7 reason: keep provider value intact, convert only presentation to human text. */
CX.adminPostulacionesActions.cancelReasonForUi=(request)=>{
  const raw=String(request?.reason||'').trim();
  if(raw==='shopper-cancel-request')return 'El shopper solicitó cancelar la visita. No hay un motivo adicional registrado.';
  if(!raw)return 'El shopper no indicó un motivo.';
  if(/^[a-z][a-z0-9]*(?:[-_][a-z0-9]+){2,}$/i.test(raw))return 'La solicitud no contiene un motivo legible. Solicita aclaración al shopper.';
  return raw;
};
/* B7 P0: asking for another date must close the expired pending request remotely
   before a shopper can submit a replacement. The original HR date stays unchanged. */
CX.adminPostulacionesActions.requestReplacementDate=({data,ui,visitId})=>{
  const id=String(visitId||'');
  const visit=(data.visitas?.()||[]).find(x=>String(x.id||x.visitId)===id);
  if(!visit||visit.rescheduleRequest?.status!=='pending_review'){
    ui.toast('La solicitud ya no está pendiente. Actualiza Gestión de Postulaciones.','warn',4200);
    return false;
  }
  if(!CX.permissions?.gate?.('visit.reassign',{projectId:data.currentProjectId,pais:visit.pais},ui))return false;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const previousDate=String(visit.agendada||visit.scheduledDate||'').slice(0,10);
  ui.modal('🔄 Pedir una nueva fecha',
    '<p>La fecha solicitada para <b>'+esc(visit.sucursal||'esta visita')+'</b> no será autorizada. La fecha vigente <b>'+esc(previousDate||'registrada')+'</b> se conserva mientras el shopper propone otra.</p>'+
    '<label class="lbl" for="cxReplacementReason">Indicación para el shopper (obligatoria)</label>'+
    '<textarea class="inp" id="cxReplacementReason" rows="3" maxlength="500" placeholder="Explica por qué necesitas otra fecha."></textarea>'+
    '<div class="flex wrap" style="justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn btn-ghost" id="cxReplacementBack">Volver</button><button class="btn btn-pr" id="cxReplacementConfirm">Solicitar nueva fecha</button></div>',
    {premium:true,replaceExisting:true,dismissOnBackdrop:false,onMount:(ov,close)=>{
      ov.querySelector('#cxReplacementBack').addEventListener('click',close);
      ov.querySelector('#cxReplacementConfirm').addEventListener('click',async()=>{
        const btn=ov.querySelector('#cxReplacementConfirm');
        const reason=String(ov.querySelector('#cxReplacementReason').value||'').trim();
        if(!reason){ui.toast('Escribe la indicación para solicitar otra fecha.','warn',4000);return;}
        btn.disabled=true;btn.textContent='Verificando con el servidor…';
        let result=null,error=null;
        try{result=await data.requestVisitReschedule(id,null,{ackAware:true,decision:'rejected',reason});}catch(caught){error=caught;}
        if(!(result?.ok===true&&result?.status==='committed'&&result?.providerAck===true&&result?.successUiAllowed===true)){
          const diagnostic=CX.adminPostulacionesActions.rescheduleFailure(result,error);
          btn.dataset.providerResultCode=diagnostic.code;btn.disabled=false;btn.textContent='Solicitar nueva fecha';ui.toast(diagnostic.message,'warn',4400);return;
        }
        let observed=null;
        try{
          await CX.backend?.refresh?.();
          await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('admin_replacement_date_rejected_old_proposal');
          observed=(data.visitas?.()||[]).find(v=>String(v.id||v.visitId)===id);
        }catch(_){}
        const preserved=!previousDate||String(observed?.agendada||observed?.scheduledDate||'').slice(0,10)===previousDate;
        if(observed?.rescheduleRequest?.status!=='rejected'||!preserved){
          btn.disabled=false;btn.textContent='Solicitar nueva fecha';
          ui.toast('Decisión recibida por el servidor; falta confirmar su actualización visible. No se marcará como terminada.','warn',4800);
          return;
        }
        close();
        CX.router?.nav?.('postulaciones',{history:false});
        ui.toast('Fecha anterior conservada. La solicitud vencida quedó cerrada y el shopper puede proponer otra fecha.','ok',4300);
      });
    }});
  return true;
};
CX.adminPostulacionesActions.openRequest=({data,ui,visitIds=[],defaultType='confirmar'})=>{
  const ids=new Set(visitIds.map(String).filter(Boolean));
  const posts=(data._posts||[]).filter(x=>data.inScope(x.pais)&&x?._archived!==true&&x?.active!==false&&x?.postulationLifecycle!=='transitioned_to_assignment'&&(!data.currentPeriodId||String(data.recordPeriodId?.(x)||x.periodId||'')===String(data.currentPeriodId)));
  const targetMap=new Map();
  posts.filter(x=>x.shopperId&&x.visitaId).forEach(x=>{
    const key=String(x.visitaId)+'::'+String(x.shopperId);
    targetMap.set(key,Object.assign({},x,{__requestId:'post:'+String(x.id)}));
  });
  (data.visitas?.()||[]).filter(v=>v.shopperId&&v.cancelRequest?.status!=='approved').forEach(v=>{
    const id=String(v.id||v.visitId),key=id+'::'+String(v.shopperId);
    if(!targetMap.has(key))targetMap.set(key,{__requestId:'visit:'+id,visitaId:id,visitId:id,shopperId:String(v.shopperId),shopper:v.shopper||'',sucursal:v.sucursal||'',sourceType:'operational_assignment'});
  });
  const targets=[...targetMap.values()].filter(x=>!ids.size||ids.has(String(x.visitaId||x.visitId)));
  if(!targets.length){ui.toast('No hay shoppers con identidad y visita exactas para las seleccionadas.','warn',4200);return false;}
  const displayShopper=x=>{const s=data.getShopper?.(x.shopperId);const raw=String(x.shopper||'').trim();return s?.nombre||(raw&&!/^shopper_/i.test(raw)?raw:'Identidad pendiente de resolver');};
      ui.modal('📤 Pedir acción al shopper',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:14px">El equipo puede <b>solicitar</b> al shopper (no solo gestionar lo que él pide). La solicitud se registra en la experiencia interna del shopper. WhatsApp solo se considera enviado cuando exista ACK del proveedor de mensajería.</p>
        <label class="lbl">Shopper</label>
        <select class="sel" id="rqSh" style="margin-bottom:12px">${targets.slice(0,100).map(x=>`<option value="${x.__requestId}">${displayShopper(x)} · ${x.sucursal} · ${x.sourceType==='operational_assignment'?'asignación vigente':'postulación'}</option>`).join('')}</select>
        <label class="lbl">Solicitud</label>
        <select class="sel" id="rqTipo" style="margin-bottom:12px">
          <option value="confirmar">Confirmar fecha propuesta</option>
          <option value="cambio">Pedir cambio de fecha</option>
          <option value="reprog">Solicitar reprogramación</option>
          <option value="agendar">Recordar que agende</option>
          <option value="cuestionario">Solicitar cuestionario</option>
        </select>
        <label class="lbl">Nota (opcional)</label>
        <textarea class="inp" id="rqNota" rows="2" placeholder="Detalle para el shopper…" style="margin-bottom:14px"></textarea>
        <div class="flex" style="justify-content:flex-end;gap:8px"><button class="btn btn-ghost btn-sm" data-x4>Cancelar</button><button class="btn btn-pr btn-sm" id="rqSend">📲 Enviar solicitud</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('[data-x4]').addEventListener('click',close);
        if(['confirmar','cambio','reprog','agendar','cuestionario'].includes(defaultType))ov.querySelector('#rqTipo').value=defaultType;
        ov.querySelector('#rqSend').addEventListener('click',async()=>{
          const tipo=ov.querySelector('#rqTipo').value,post=targets.find(x=>String(x.__requestId)===String(ov.querySelector('#rqSh').value));
          if(!post?.shopperId||!post?.visitaId||typeof CX.notif?.pushDurable!=='function'){ui.toast('Solicitud no enviada: falta identidad exacta o persistencia durable.','warn',4200);return;}
          const map={confirmar:['📅','El equipo pide confirmar fecha','confirmar_fecha'],cambio:['📅','El equipo pide cambio de fecha','confirmar_fecha'],reprog:['🔄','El equipo solicita reprogramación',''],agendar:['📅','Recordatorio: agenda tu visita',''],cuestionario:['📝','El equipo solicita completar el cuestionario','']};
          const m=map[tipo],btn=ov.querySelector('#rqSend');btn.disabled=true;btn.textContent='Confirmando…';
          try{
            const ack=await CX.notif.pushDurable({to:'shopper',shopperId:String(post.shopperId),targetShopperIds:[String(post.shopperId)],tipo,icon:m[0],tono:'a',titulo:m[1],txt:(ov.querySelector('#rqNota').value||'').trim()||((post.sucursal||'Visita')+' · responde desde Mis Visitas'),nav:'misvisitas',accion:m[2]||undefined,entityType:'visit',entityId:String(post.visitaId),eventKey:'admin_request_'+tipo,operational:true,idempotencyKey:['admin-request',data.currentProjectId,data.currentPeriodId,post.visitaId,post.shopperId,tipo].join(':')});
            if(!(ack?.ok===true&&ack?.providerAck===true))throw new Error('REQUEST_ACK_REQUIRED');
            close();ui.toast('Solicitud guardada y dirigida a '+displayShopper(post),'ok',3500);
          }catch(_){btn.disabled=false;btn.textContent='📲 Enviar solicitud';ui.toast('Solicitud no enviada: no hubo confirmación durable.','warn',4200);}
        });
      }});
  return true;
};
/* I3 B7: provider failure diagnostics must not be erased by the UI. */
CX.adminPostulacionesActions.rescheduleFailure=(result,error)=>{
  const raw=String(result?.code||result?.reason||error?.code||error?.message||'OPS_RESCHEDULE_UNCONFIRMED').trim();
  const code=/^(OPS|AUTH|COMMAND|PROVIDER)_[A-Z0-9_]+$/.test(raw)?raw:'OPS_RESCHEDULE_UNCONFIRMED';
  const human=code.includes('DATE')?'La fecha no cumple las reglas del proyecto.':code.includes('PERIOD')?'La visita pertenece a otro período.':code.includes('SCOPE')||code.includes('ROLE')||code.includes('AUTH')||code.includes('OPERATOR_ONLY')?'No tienes autorización para decidir sobre esta visita.':code.includes('VERSION')?'La visita cambió; actualiza la pantalla antes de decidir.':code==='OPS_VISIT_REQUEST_ALREADY_PENDING'?'Existe otra solicitud pendiente.':'El servidor no confirmó la decisión.';
  return {code,message:human};
};
/* B7 P0: manual WhatsApp draft only, never a provider send acknowledgment. */
CX.adminPostulacionesActions.openWaDraft=({ui,shopper,phone,body})=>{
  const input=String(phone??'').trim();
  const digits=/^\+?[\d\s().-]+$/.test(input)?input.replace(/\D/g,''):'';
  if(!String(shopper||'').trim()||!(/^[1-9]\d{8,14}$/.test(digits))){
    ui.toast('No hay un WhatsApp internacional válido para este shopper. Verifica el número autorizado con código de país.','warn',4200);
    return false;
  }
  const opened=window.open('https://wa.me/'+digits+'?text='+encodeURIComponent(String(body||'')),'_blank');
  if(!opened){ui.toast('El navegador bloqueó WhatsApp. Permite ventanas emergentes para abrir el borrador.','warn',4200);return false;}
  try{opened.opener=null;}catch(_){}
  ui.toast('Borrador de WhatsApp abierto; el envío debe realizarse y confirmarse en WhatsApp.','ok',4200);
  return true;
};

/* I3 B7: conservative provider-boundary precheck. Never approve an expired
   proposed day; provider remains authority for quincena, eligibility and ACK. */
CX.adminPostulacionesActions.rescheduleReadiness=(visit,data,clock=new Date())=>{
  const proposed=String(visit?.rescheduleRequest?.newDate||visit?.fechaProp||'').slice(0,10);
  const cfg=(data?.__backendAllProjectRecords||[]).find(p=>String(p.id||p.projectId)===String(data.currentProjectId))||data?.period?.()||{};
  const zone=String(cfg.timeZone||cfg.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC');
  let today='';
  try{
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(clock).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    today=parts.year+'-'+parts.month+'-'+parts.day;
  }catch(_){return {eligible:false,reason:'No se pudo comprobar la zona horaria del proyecto.'};}
  const available=String(visit?.disponibleDesde||visit?.availableFrom||'').slice(0,10);
  const minimum=[today,available].filter(v=>/^20\d{2}-\d{2}-\d{2}$/.test(v)).sort().at(-1)||today;
  if(!/^20\d{2}-\d{2}-\d{2}$/.test(proposed))return {eligible:false,reason:'La propuesta no tiene una fecha válida.'};
  if(proposed<minimum)return {eligible:false,reason:'La fecha propuesta '+proposed+' ya no es autorizable. Solicita otra fecha al shopper o conserva la anterior.',minimum,proposed};
  return {eligible:true,minimum,proposed};
};
CX.adminPostulacionesActions.openAgenda=({data,ui,visitIds=[]})=>{
  const ids=new Set(visitIds.map(String).filter(Boolean));
  const visits=(data.visitas?.()||[]).filter(v=>v.shopperId&&(!ids.size||ids.has(String(v.id||v.visitId))));
  const requestByVisit=visits.filter(v=>v.rescheduleRequest?.status==='pending_review');
  const agendadas=visits.filter(v=>{const f=data.visitFacets?.(v);return f?f.scheduled===true&&f.realized!==true:!!(v.agendada&&!v.realizada);});
  const displayShopper=v=>data.getShopper?.(v.shopperId)?.nombre||v.shopper||'Shopper';
  const pendingRows=requestByVisit.map(v=>{
    const eligible=CX.adminPostulacionesActions.rescheduleReadiness(v,data);
    return `<div class="between wrap" style="gap:8px;padding:9px 11px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
      <div><b>${displayShopper(v)}</b> · ${v.sucursal||''}<div class="muted" style="font-size:12px">Fecha solicitada: ${v.rescheduleRequest.newDate||'—'} · ${v.pais||''}</div>
        ${!eligible.eligible?'<div style="font-size:12px;color:var(--red);margin-top:5px">'+eligible.reason+'</div>':''}</div>
      <div class="flex wrap" style="gap:6px">
        ${eligible.eligible?'<button class="btn btn-soft btn-sm" data-date-decision="approved" data-vid="'+v.id+'">Autorizar nueva fecha</button>':'<button class="btn btn-soft btn-sm" disabled title="La fecha propuesta está vencida">Fecha no autorizable</button><button class="btn btn-pr btn-sm" data-date-renew="'+v.id+'">Pedir nueva fecha</button>'}
        <button class="btn btn-ghost btn-sm" data-date-decision="rejected" data-vid="${v.id}">Conservar anterior</button>
      </div>
    </div>`;
  }).join('');
      const rows=agendadas.map(v=>`<div class="between" style="padding:9px 11px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
        <div><b style="font-size:13px">${v.shopper}</b> · ${v.sucursal}<div style="font-size:11px;color:var(--t3)">📅 ${v.agendada} · ${v.franjaCode} · autorizada por Coordinación</div></div>
        <button class="btn btn-ghost btn-sm aprAdjust" data-vid="${v.id}" data-sh="${v.shopper}">🗓️ Solicitar ajuste</button></div>`).join('');
      ui.modal('Gestión de agendamientos',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:14px">Separa las fechas enviadas por shoppers de las referencias HR y de las propuestas al postularse.</p>
        <div style="background:var(--green-bg);border-radius:10px;padding:12px 14px;margin-bottom:14px">
          <div style="font-size:12px;font-weight:700;color:var(--green)">⌛ Fechas pendientes de autorización <span class="bdg bdg-n">${requestByVisit.length}</span></div>
          <div style="font-size:12px;color:var(--t3);margin-top:4px">${requestByVisit.length?'Hay '+requestByVisit.length+' solicitud(es) de reprogramación con estado pendiente de revisión. Revísalas en la sección de solicitudes, sin mezclar fechas HR ni propuestas iniciales.':'No hay fechas nuevas pendientes de autorización.'}</div></div>
        <div style="font-size:12px;font-weight:700;color:var(--t1);margin-bottom:9px">✅ Agendas autorizadas desde la plataforma <span class="bdg bdg-g">${agendadas.length}</span></div>
        ${pendingRows}
        ${rows||ui.empty('🗓️','Sin agendas')}
        <div style="margin-top:8px">${'<p class="muted" style="font-size:12px;margin-top:12px">La fecha vigente se conserva hasta que una nueva fecha sea autorizada.</p>'}</div>`,
      {onMount:(ov,close)=>{ov.querySelectorAll('.aprAdjust').forEach(b=>b.addEventListener('click',async()=>{
        const visit=agendadas.find(v=>String(v.id||v.visitId)===String(b.dataset.vid||''));
        if(!visit?.shopperId||!visit?.id||typeof CX.notif?.pushDurable!=='function'){ui.toast('No se solicitó el ajuste: falta identidad exacta o notificación durable.','warn',4200);return;}
        const before=b.textContent;b.disabled=true;b.textContent='Confirmando…';
        try{
          const ack=await CX.notif.pushDurable({to:'shopper',shopperId:String(visit.shopperId),targetShopperIds:[String(visit.shopperId)],tipo:'ajuste',icon:'🗓️',tono:'a',titulo:'El equipo solicita ajustar tu agenda',txt:(visit.sucursal||'Visita')+' · revisa la fecha de tu visita en Mis Visitas',nav:'misvisitas',accion:'confirmar_fecha',entityType:'visit',entityId:String(visit.id),eventKey:'admin_agenda_adjust',operational:true,idempotencyKey:['admin-agenda-adjust',data.currentProjectId,data.currentPeriodId,visit.id,visit.shopperId,visit.agendada||''].join(':')});
          if(!(ack?.ok===true&&ack?.providerAck===true))throw new Error('AGENDA_ADJUST_ACK_REQUIRED');
          close();ui.toast('Solicitud de ajuste registrada con confirmación remota para '+displayShopper(visit),'ok',3500);
        }catch(_){b.disabled=false;b.textContent=before;ui.toast('Ajuste no confirmado: no se notificó como enviado.','warn',4200);}
      }));
      ov.querySelectorAll('[data-date-renew]').forEach(b=>b.addEventListener('click',()=>{
        const visit=requestByVisit.find(v=>String(v.id||v.visitId)===String(b.dataset.dateRenew||''));
        if(!visit)return;
        close();CX.adminPostulacionesActions.requestReplacementDate({data,ui,visitId:String(visit.id||visit.visitId)});
      }));
      ov.querySelectorAll('[data-date-decision]').forEach(b=>b.addEventListener('click',async()=>{
        const visit=requestByVisit.find(v=>String(v.id||v.visitId)===String(b.dataset.vid||''));
        const decision=String(b.dataset.dateDecision||'');
        if(!visit||!['approved','rejected'].includes(decision))return;
        if(decision==='approved'){
          const readiness=CX.adminPostulacionesActions.rescheduleReadiness(visit,data);
          if(!readiness.eligible){ui.toast(readiness.reason,'warn',4800);return;}
        }
        if(!CX.permissions?.gate?.('visit.reassign',{projectId:data.currentProjectId,pais:visit.pais},ui))return;
        const prior=b.textContent;b.disabled=true;b.textContent='Confirmando…';
        try{
          const r=await data.requestVisitReschedule(visit.id,decision==='approved'?visit.rescheduleRequest.newDate:null,{ackAware:true,decision,reason:'admin_agenda_decision_dashboard'});
          if(!(r?.ok===true&&r?.status==='committed'&&r?.providerAck===true&&r?.successUiAllowed===true)){
            const diagnostic=CX.adminPostulacionesActions.rescheduleFailure(r,null);
            b.dataset.providerResultCode=diagnostic.code;b.disabled=false;b.textContent=prior;ui.toast(diagnostic.message,'warn',4800);return;
          }
          let observed=null;
          try{
            await CX.backend?.refresh?.();
            await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('admin_schedule_decision_committed');
            observed=(data.visitas?.()||[]).find(x=>String(x.id||x.visitId)===String(visit.id||visit.visitId)||String(x.hrRowId||'')===String(visit.hrRowId||'__missing__'));
          }catch(_){}
          const readback=String(observed?.rescheduleRequest?.status||'')===decision
            &&(decision==='rejected'||String(observed?.agendada||'').slice(0,10)===String(visit.rescheduleRequest.newDate||'').slice(0,10));
          if(!readback){
            b.disabled=false;b.textContent=prior;
            ui.toast('El proveedor confirmó la decisión, pero la visita todavía no refleja la fecha. Actualiza antes de continuar.','warn',4800);
            return;
          }
          close();ui.toast(decision==='approved'?'Fecha autorizada, confirmada y releída.':'Fecha anterior conservada, confirmada y releída.','ok',3600);
        }catch(error){const diagnostic=CX.adminPostulacionesActions.rescheduleFailure(null,error);b.dataset.providerResultCode=diagnostic.code;b.disabled=false;b.textContent=prior;ui.toast(diagnostic.message,'warn',4800);}
      }));
      }});

  return true;
};


CX.adminPostulacionesActions.openContext=({data,ui,visitId})=>{
  const v=(data.visitas?.()||[]).find(x=>String(x.id||x.visitId)===String(visitId));
  if(!v){ui.toast('Visita no disponible en el período actual.','warn');return false;}
  const facets=data.visitFacets?.(v)||{}, owner=CX.adminPostulacionesActions;
  const actions=[];
  if(v.shopperId){
    actions.push(['request','Pedir agendamiento o cuestionario'],['agenda','Gestionar agenda'],['reassign','Reasignar visita'],['cancel','Cancelar visita']);
  }else if(facets.available||v.estado==='disponible')actions.push(['assign','Asignar shopper']);
  if(v.rescheduleRequest?.status==='pending_review'&&!actions.some(a=>a[0]==='agenda'))actions.push(['agenda','Revisar fecha solicitada']);
  if(v.cancelRequest?.status==='pending_review')actions.push(['approveCancel','Autorizar cancelación'],['rejectCancel','Rechazar cancelación']);
  if(!actions.length){ui.toast('No hay acciones disponibles para el estado actual.','warn');return false;}
  const safe=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const buttons=actions.map(([key,label])=>'<button class="btn btn-soft btn-sm" data-cx-admin-action="'+key+'">'+label+'</button>').join(' ');
  ui.modal('Acciones · '+safe(v.sucursal),'<p class="muted" style="font-size:12px">'+safe(v.pais)+' · '+safe(v.estado)+' · '+safe(v.shopper||'Sin asignar')+'</p><div class="flex wrap" style="gap:8px">'+buttons+'</div>',{
    onMount:(ov,close)=>ov.querySelectorAll('[data-cx-admin-action]').forEach(btn=>btn.addEventListener('click',()=>{
      const action=btn.dataset.cxAdminAction;close();
      if(action==='request')owner.openRequest({data,ui,visitIds:[String(v.id)]});
      else if(action==='agenda')owner.openAgenda({data,ui,visitIds:[String(v.id)]});
      else if(action==='assign'||action==='reassign')owner.openAssign({data,ui,visitId:v.id,reassign:action==='reassign'});
      else if(action==='cancel')owner.openCancellation({data,ui,visitId:v.id});
      else if(action==='approveCancel'||action==='rejectCancel')owner.openCancellation({data,ui,visitId:v.id,decision:action==='approveCancel'?'approved':'rejected'});
    }))
  });
  return true;
};
CX.adminPostulacionesActions.openAssign=({data,ui,visitId,reassign=false})=>{
  const v=(data.visitas?.()||[]).find(x=>String(x.id||x.visitId)===String(visitId));
  if(!v){ui.toast('Visita no disponible.','warn');return false;}
  const permission=reassign?'visit.reassign':'visit.assign';
  if(!CX.permissions?.gate?.(permission,{projectId:data.currentProjectId,pais:v.pais},ui))return false;
  const candidates=(data.shoppers||[]).filter(s=>s?.id&&String(s.id)!==String(v.shopperId||'')&&(!v.pais||String(s.pais||s.country)===String(v.pais))&&(!data.inScope||data.inScope(s.pais||s.country))&&(!Array.isArray(s.projectIds)||!s.projectIds.length||s.projectIds.map(String).includes(String(data.currentProjectId)))&&data.shopperDataLevel?.(s)!=='protected_reference');
  if(!candidates.length){ui.toast('No hay shoppers elegibles para esta visita.','warn');return false;}
  const safe=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const options=candidates.map(s=>'<option value="'+safe(s.id)+'">'+safe(s.nombre||s.code||s.id)+' · '+safe(s.pais||s.country)+'</option>').join('');
  const dateInputs=reassign?'<label class="lbl">Decisión de fecha</label><select class="sel" id="cxDashDateMode"><option value="keep">Conservar fecha vigente</option><option value="pending">Pendiente por agendar</option><option value="change">Cambiar fecha</option></select><input class="inp" id="cxDashDate" type="date" value="'+safe(v.agendada||'')+'" style="margin-top:8px"><input class="inp" id="cxDashFranja" placeholder="Franja (si cambia)" style="margin-top:8px">':'';
  ui.modal((reassign?'Reasignar':'Asignar')+' visita · '+safe(v.sucursal),'<label class="lbl">Shopper elegible</label><select class="sel" id="cxDashShopper"><option value="">Seleccionar…</option>'+options+'</select>'+dateInputs+'<div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="cxDashAssignOk">Confirmar</button></div>',{
    onMount:(ov,close)=>ov.querySelector('#cxDashAssignOk').addEventListener('click',async()=>{
      const sid=ov.querySelector('#cxDashShopper').value;
      if(!sid||!candidates.some(s=>String(s.id)===String(sid))){ui.toast('Selecciona un shopper elegible.','warn');return;}
      const mode=reassign?ov.querySelector('#cxDashDateMode').value:'keep';
      const date=reassign&&mode==='change'?ov.querySelector('#cxDashDate').value:null;
      if(reassign&&mode==='change'&&!date){ui.toast('Selecciona la nueva fecha.','warn');return;}
      if(!CX.permissions?.gate?.(permission,{projectId:data.currentProjectId,pais:v.pais},ui))return;
      const btn=ov.querySelector('#cxDashAssignOk');btn.disabled=true;btn.textContent='Confirmando…';
      try{
        const ack=await data.assignVisit(v.id,sid,{ackAware:true,reassign,assignmentSource:'platform',scheduleDecision:mode,scheduledDate:date,franjaCode:reassign&&mode==='change'?ov.querySelector('#cxDashFranja').value:null,reason:'dashboard_admin_assignment'});
        if(!(ack?.ok===true&&ack?.status==='committed'&&ack?.providerAck===true&&ack?.successUiAllowed===true))throw Error('ASSIGN_PROVIDER_ACK_REQUIRED');
        try{await CX.backend?.refresh?.();await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('dashboard_assign_committed');}catch(_){}
        close();ui.toast('Asignación confirmada por el proveedor','ok');
      }catch(_){btn.disabled=false;btn.textContent='Confirmar';ui.toast('Asignación no confirmada.','warn',4200);}
    })
  });
  return true;
};
CX.adminPostulacionesActions.openCancellation=({data,ui,visitId,decision=null})=>{
  const v=(data.visitas?.()||[]).find(x=>String(x.id||x.visitId)===String(visitId));
  if(!v||decision&&!['approved','rejected'].includes(decision))return false;
  if(decision&&v.cancelRequest?.status!=='pending_review'){ui.toast('La solicitud ya no está pendiente.','warn');return false;}
  if(!CX.permissions?.gate?.('visit.cancel',{projectId:data.currentProjectId,pais:v.pais},ui))return false;
  const safe=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  ui.modal(decision?'Decidir cancelación · '+safe(v.sucursal):'Cancelar visita · '+safe(v.sucursal),'<p class="muted" style="font-size:12px">'+safe(decision?CX.adminPostulacionesActions.cancelReasonForUi(v.cancelRequest):v.shopper||'')+'</p><label class="lbl">Motivo obligatorio</label><textarea class="inp" id="cxDashCancelReason" rows="3"></textarea><div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="cxDashCancelOk">Confirmar</button></div>',{
    onMount:(ov,close)=>ov.querySelector('#cxDashCancelOk').addEventListener('click',async()=>{
      const reason=String(ov.querySelector('#cxDashCancelReason').value||'').trim();
      if(!reason){ui.toast('Indica el motivo.','warn');return;}
      if(!CX.permissions?.gate?.('visit.cancel',{projectId:data.currentProjectId,pais:v.pais},ui))return;
      const btn=ov.querySelector('#cxDashCancelOk');btn.disabled=true;btn.textContent='Confirmando…';
      try{
        const ack=await data.requestVisitCancel(v.id,decision?{ackAware:true,requestOnly:false,decision,reason}:{ackAware:true,releaseToAvailable:true,reason});
        if(!(ack?.ok===true&&ack?.status==='committed'&&ack?.providerAck===true&&ack?.successUiAllowed===true))throw Error('CANCEL_PROVIDER_ACK_REQUIRED');
        try{await CX.backend?.refresh?.();await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('dashboard_cancel_committed');}catch(_){}
        close();ui.toast('Decisión confirmada; si HR externa aplica, sincronización pendiente de ACK HR.','ok',4200);
      }catch(_){btn.disabled=false;btn.textContent='Confirmar';ui.toast('Decisión no confirmada por el proveedor.','warn',4200);}
    })
  });
  return true;
};

CX.module('postulaciones', ({data,ui})=>{
  const p=data.period(), posts=data._posts.filter(x=>data.inScope(x.pais));
  const projName=(id)=>{const pg=data.programs?.().find(x=>x.key===id);if(pg)return pg.name;const pr=data.projects.find(x=>x.id===id);return pr?(data.programBase?data.programBase(pr):pr.name):(id||'');};
  const periodIdOf=(row)=>data.recordPeriodId?data.recordPeriodId(row):(row.periodId||row.projectId);
  /* CORTE 2A — revisión de fuente canónica (misma que Dashboard/reportes/Visitas) */
  const sourceRevision=(CX.clienteData&&CX.clienteData.sourceRevision)?CX.clienteData.sourceRevision(p):(p&&p.sourceRevision)||'0';
  /* CORTE 2A — teléfono protegido: etiqueta segura si el dato está ausente o protegido,
     nunca 'undefined'/'null' ni un teléfono expuesto sin autorización. */
  const safePhone=(x)=>{const t=(x&&x.phone!=null)?String(x.phone).trim():'';return t?t:'Contacto protegido';};
  const safe=(val)=>{const t=(val==null)?'':String(val).trim();return (t&&t!=='undefined'&&t!=='null')?t:'—';};
  /* R19 P0-1: los KPIs superiores deben coincidir con el periodo activo por defecto (mismo
     criterio que el listado abajo) — nunca contar postulaciones de otros periodos salvo que se
     pida explícitamente "Ver históricas". */
  /* HF-20261012-16: same active postulation authority as sidebar/data.kpis. */
  const activePosts=typeof data.activePosts==='function'?data.activePosts():posts.filter(x=>periodIdOf(x)===data.currentPeriodId&&x?._archived!==true&&x?.active!==false&&x?.postulationLifecycle!=='transitioned_to_assignment');
  const c=(s)=>activePosts.filter(x=>String(x.estado||x.status||'').toLowerCase()===String(s).toLowerCase()).length;
  /* VRM-259: Postulaciones is the canonical owner of the visible pending count while this
     route is rendered. The rail can have been built before the final protected-HR composition,
     so synchronize its badge after this render commits instead of leaving a stale bootstrap count. */
  const syncPendingRailBadge=()=>{const badge=document.querySelector('#nav-postulaciones .n-badge');if(!badge)return;const n=c('pendiente');badge.textContent=n?String(n):'';badge.style.display=n?'':'none';};
  setTimeout(syncPendingRailBadge,0);
  const operationalAssignments=data.visitas().filter(v=>{const f=data.visitFacets?data.visitFacets(v):null;return f?f.assigned===true&&f.cancelled!==true:!!v.shopperId;});
  /* Durable shopper requests live on visits, not in postulation.reprog. Never invent a postulation. */
  const requestByVisit=operationalAssignments.filter(v=>v.rescheduleRequest?.status==='pending_review')
    .map(v=>({id:'visit-request:'+String(v.id||v.visitId),__fromVisitRequest:true,visitaId:String(v.id||v.visitId),shopperId:String(v.shopperId||''),shopper:v.shopper||'',sucursal:v.sucursal||'',ciudad:v.ciudad||'',pais:v.pais||'',projectId:data.currentProjectId,rootProjectId:data.currentProjectId,periodId:data.currentPeriodId,fechaActual:v.agendada||v.platformSchedulePendingHr?.date||'',fechaProp:String(v.rescheduleRequest.newDate||''),franjaCode:v.franjaCode||'',reason:String(v.rescheduleRequest.reason||'')}));
  /* B7: only pending durable visit requests are actionable. Historical post.reprog
     flags have no request status/provider ACK and cannot inflate this counter. */
  const reprog=requestByVisit;
  const cancellationRequests=operationalAssignments.filter(v=>v.cancelRequest?.status==='pending_review');
  const cancellationHrPending=operationalAssignments.filter(v=>v.cancelRequest?.status==='approved_pending_hr');
  const findReprogram=id=>reprog.find(x=>String(x.id)===String(id))||posts.find(x=>String(x.id)===String(id));
  const agendadas=operationalAssignments.filter(v=>{const f=data.visitFacets?data.visitFacets(v):null;return f?f.scheduled===true&&f.realized!==true:!!(v.agendada&&!v.realizada);});
  const requestTargets=(()=>{const byVisitShopper=new Map();activePosts.filter(x=>x.shopperId&&x.visitaId).forEach(x=>byVisitShopper.set(String(x.visitaId)+'::'+String(x.shopperId),Object.assign({},x,{__requestId:'post:'+String(x.id)})));operationalAssignments.filter(v=>v.shopperId).forEach(v=>{const key=String(v.id||v.visitId)+'::'+String(v.shopperId);if(!byVisitShopper.has(key))byVisitShopper.set(key,{__requestId:'visit:'+String(v.id||v.visitId),id:String(v.id||v.visitId),visitaId:String(v.id||v.visitId),visitId:String(v.id||v.visitId),shopperId:String(v.shopperId),shopper:v.shopper||'',sucursal:v.sucursal||'',ciudad:v.ciudad||'',pais:v.pais||'',projectId:data.currentProjectId,periodId:data.currentPeriodId,sourceType:'operational_assignment'});});return [...byVisitShopper.values()];})();
  const assignmentOrigin=v=>String(v.assignmentSource||'').toLowerCase()==='platform'?'Plataforma':'HR / Hoja de Ruta';
  const assignmentState=v=>{const f=data.visitFacets?data.visitFacets(v):null;if(f?.realized)return'Realizada';if(f?.scheduled)return'Agendada';return'Asignada';};
  const visitForPost=x=>{const visitKey=String(x?.visitaId||x?.visitId||''),hrRowKey=String(x?.hrRowId||'');return(data._visitas||[]).find(v=>(visitKey&&[v?.id,v?.visitId].some(k=>String(k||'')===visitKey))||(hrRowKey&&String(v?.hrRowId||'')===hrRowKey))||null;};
  const postSyncState=x=>{
    const state=String(x?.estado||x?.status||'').toLowerCase(),v=visitForPost(x),appShopper=String(x?.shopperId||''),visitShopper=String(v?.shopperId||'');
    if(state==='pendiente')return'pending_review';
    if(state!=='aprobada')return state||'unknown';
    if(v?.assignmentReviewRequired===true||v?.assignmentReviewReason==='hr_platform_assignment_conflict')return'conflict_review_required';
    if(v&&appShopper&&visitShopper&&visitShopper!==appShopper)return'conflict_review_required';
    if(v?.assignmentSource==='platform'&&v?.assignmentSyncStatus==='pending_hr')return'platform_pending_hr_sync';
    if(v&&appShopper&&visitShopper===appShopper)return'assigned_confirmed';
    return'approved_assignment_review';
  };
  const syncPresentation=x=>{
    const sync=postSyncState(x);
    if(sync==='conflict_review_required')return{sync,badge:ui.bdg('REQUIERE REVISIÓN','a'),copy:'La postulación está aprobada, pero la asignación vigente en Hoja de Ruta no coincide. Debe revisarse antes de considerarla confirmada.'};
    if(sync==='platform_pending_hr_sync')return{sync,badge:ui.bdg('PENDIENTE HR','a'),copy:'Aprobada en plataforma · pendiente de confirmación en Hoja de Ruta.'};
    if(sync==='approved_assignment_review')return{sync,badge:ui.bdg('VALIDANDO ASIGNACIÓN','a'),copy:'La aprobación está registrada y la asignación todavía se está validando.'};
    if(sync==='assigned_confirmed')return{sync,badge:ui.bdg('ASIGNACIÓN CONFIRMADA','g'),copy:'La aprobación y la asignación vigente coinciden.'};
    return{sync,badge:'',copy:''};
  };

  /* agrupar por sucursal */
  const groups={};
  posts.forEach(x=>{(groups[x.sucursal]=groups[x.sucursal]||[]).push(x);});

  const estTag=(e)=>e==='pendiente'?ui.bdg('PENDIENTE','a'):e==='standby'?ui.bdg('STANDBY','n'):ui.bdg('APROBADA','g');
  const displayShopper=x=>{const s=data.getShopper&&data.getShopper(x&&x.shopperId);const raw=String(x&&x.shopper||'').trim();return (s&&s.nombre)||(raw&&!/^shopper_/i.test(raw)?raw:'Identidad pendiente de resolver');};
  const displayCode=x=>{const s=data.getShopper&&data.getShopper(x&&x.shopperId);const raw=String(x&&x.shopperCode||'').trim();return (s&&s.code)||(raw&&!/^shopper_/i.test(raw)?raw:'');};

  const card=(x)=>{
    const hon=x.honorario!=null?`${x.currency||''} ${x.honorario}`.trim():'Pendiente de fuente';
    const sync=syncPresentation(x);
    const lifecycleBadge=(x?._archived===true||x?.active===false||x?.postulationLifecycle==='transitioned_to_assignment')?ui.bdg('HISTÓRICA · TRANSICIÓN COMPLETADA','n'):'';
    return `<div data-pid="${x.id}" data-post-sync="${sync.sync}" data-post-lifecycle="${x.postulationLifecycle||'active'}" style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:13px 15px;margin-bottom:10px">
      <div class="between" style="margin-bottom:8px">
        <div class="flex" style="gap:8px">${estTag(x.estado)}${lifecycleBadge}<span style="font-size:11px;color:var(--t3)">${x.fechaProp}</span>${x.reprog?ui.bdg('Reprog.','a'):''}</div>
        <span style="font-size:11px;color:var(--t3)">${x.quincena}</span>
      </div>
      <div class="between" style="align-items:flex-start;gap:14px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <div style="font-size:14px;font-weight:700;color:var(--t1)">${displayShopper(x)}${displayCode(x)?` <span class="muted" style="font-weight:500;font-size:12px">· ${displayCode(x)}</span>`:''}</div>
          <div style="font-size:10px;font-weight:700;color:var(--brand);background:var(--brand-light);display:inline-block;padding:1px 7px;border-radius:6px;margin-top:3px">🗂️ ${projName(x.projectId)}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:3px">📍 ${x.sucursal} · ${x.ciudad}</div>
          <div style="font-size:11.5px;color:var(--t3);margin-top:4px">📅 ${safe(x.fechaProp)} · ⏱️ ${safe(x.franjaCode)} · 📞 ${safePhone(x)} · desde ${safe(x.disponibleDesde)}</div>
          <div style="font-size:12px;color:var(--green);font-weight:600;margin-top:4px">💲 ${hon}</div>
          ${x.estado==='aprobada'?`<div style="font-size:11px;color:var(--t3);margin-top:5px">✅ ${x.quincena} · WhatsApp preparado · pendiente de envío · Aprobación registrada</div>`:''}
          ${sync.copy?`<div style="font-size:11.5px;color:var(--t2);margin-top:7px;padding:7px 9px;background:var(--amber-bg);border-radius:8px">${sync.badge} <span style="margin-left:5px">${sync.copy}</span></div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:7px;align-items:flex-end">
          ${x.estado==='pendiente'
            ? `<button class="btn btn-green btn-sm" data-ap="${x.id}">✅ Aprobar</button>
               <div class="flex"><button class="btn btn-ghost btn-sm" data-sb="${x.id}">Standby</button><button class="btn bt-x btn-sm" data-rj="${x.id}" style="background:var(--red-bg);color:var(--red)">Rechazar</button></div>`
            : `<div style="background:${sync.sync==='assigned_confirmed'?'var(--green-bg)':'var(--amber-bg)'};border-radius:9px;padding:8px 14px;text-align:center"><div style="font-size:12px;font-weight:700;color:${sync.sync==='assigned_confirmed'?'var(--green)':'#8a5b00'}">${sync.sync==='conflict_review_required'?'⚠ Aprobada · asignación en revisión':sync.sync==='platform_pending_hr_sync'?'⏳ Aprobada · pendiente HR':sync.sync==='assigned_confirmed'?'✅ Aprobada · asignación confirmada':'⏳ Aprobada · validando asignación'}</div><div style="font-size:10px;color:var(--t3)">${x.quincena}</div></div>
               <div class="flex" style="flex-wrap:wrap;justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-perfil="${x.shopperId}">👤 Perfil</button><button class="btn btn-ghost btn-sm" data-edit="${x.id}">✏️ Editar</button><button class="btn btn-ghost btn-sm" data-reasig="${x.id}">🔁 Reasig.</button><button class="btn btn-ghost btn-sm" data-cancel="${x.id}" style="color:var(--red)">✕ Cancelar</button></div>`}
        </div>
      </div>
    </div>`;
  };

  /* R19 P0-1 fix (verificador): el cap .slice(0,8) escondía SIEMPRE los grupos de sucursal más
     allá del octavo, sin importar periodo/filtro/"Ver históricas" — 9 postulaciones reales
     (incluidas 'pendiente') quedaban inalcanzables aunque el KPI "Todas" ya mostrara el conteo
     correcto del periodo activo. Se quita el cap: search() ya oculta grupos sin tarjetas
     visibles, así que renderizar TODOS los grupos es seguro y cada postulación del periodo
     activo queda accesible. */
  const groupHTML=Object.keys(groups).map(suc=>{
    const items=groups[suc];const pend=items.filter(x=>x.estado==='pendiente').length;
    return `<div class="card card-p" style="margin-bottom:12px">
      <div class="between" style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:var(--brand-dark);text-transform:uppercase;letter-spacing:.5px">📍 ${suc}</div>
        <span class="muted" style="font-size:11px">${items.length} postulación(es) · ${pend} pendiente(s)</span></div>
      ${items.map(card).join('')}</div>`;
  }).join('');


  /* HF-20261012-15: reuse approved branch-grouped cards for operational assignments,
     keeping HR assignments distinct from durable platform postulations. */
  const assignmentGroupHTML=(()=>{
    const escapeAssignment=(value)=>safe(value).replace(/[&<>"']/g,ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));
    const byBranch=new Map();
    operationalAssignments.forEach(v=>{
      const country=String(v.pais||''), branch=String(v.sucursal||'Sucursal no informada');
      const key=JSON.stringify([country,branch]);
      if(!byBranch.has(key))byBranch.set(key,{country,branch,visits:[]});
      byBranch.get(key).visits.push(v);
    });
    const groups=Array.from(byBranch.values()).sort((a,b)=>
      a.country.localeCompare(b.country,'es')||a.branch.localeCompare(b.branch,'es'));
    if(!groups.length)return ui.empty('🗂️','Sin asignaciones vigentes en este periodo');
    return groups.map(({country,branch,visits})=>`<div class="card card-p poAssignmentGroup" data-cx-assignment-group style="margin-bottom:12px">
      <div class="between wrap" style="gap:8px;margin-bottom:10px">
        <div style="font-size:12px;font-weight:700;color:var(--brand-dark);text-transform:uppercase;letter-spacing:.4px">📍 ${escapeAssignment(branch)} · ${escapeAssignment(country)}</div>
        <span class="muted" style="font-size:11px">${visits.length} asignación(es) · ${visits.filter(v=>String(v.assignmentSource||'').toLowerCase()==='platform').length} de plataforma · ${visits.filter(v=>String(v.assignmentSource||'').toLowerCase()!=='platform').length} de HR</span>
      </div>
      ${visits.map(v=>`<article class="poAssignmentCard" data-cx-assignment-card data-visit-ref="${escapeAssignment(v.id||v.visitId)}" style="background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:12px 14px;margin-bottom:9px">
        <div class="between wrap" style="align-items:flex-start;gap:10px">
          <div style="flex:1;min-width:190px">
            <div class="flex wrap" style="gap:6px;align-items:center;margin-bottom:7px">
              ${ui.bdg(assignmentOrigin(v),String(v.assignmentSource||'').toLowerCase()==='platform'?'b':'n')}
              ${ui.bdg(assignmentState(v),data.visitFacets?.(v)?.realized?'g':data.visitFacets?.(v)?.scheduled?'b':'a')}
            </div>
            <div style="font-size:13.5px;font-weight:700;color:var(--t1)">${escapeAssignment(v.shopper||displayShopper({shopperId:v.shopperId,shopper:v.shopper}))}</div>
            <div style="font-size:12px;color:var(--t2);margin-top:4px">${escapeAssignment(v.ciudad)} · ${escapeAssignment(v.pais)}${v.escenario?' · '+escapeAssignment(v.escenario):''}</div>
            <div style="font-size:12px;color:var(--t2);margin-top:6px">Agenda: <b style="color:var(--t1)">${escapeAssignment(v.agendada||'Pendiente')}</b></div>
          </div>
          <div class="poQuickActions" aria-label="Acciones de la visita">
            <button class="btn btn-pr btn-sm" data-cx-po-action="request" data-visit-id="${escapeAssignment(v.id||v.visitId)}" title="Solicitar agendamiento o cuestionario">📤 Pedir acción</button>
            <button class="btn btn-soft btn-sm" data-cx-po-action="${v.rescheduleRequest?.status==='pending_review'?'agenda-review':'agenda'}" data-visit-id="${escapeAssignment(v.id||v.visitId)}" title="Gestionar agenda y solicitudes pendientes">${v.rescheduleRequest?.status==='pending_review'?'🗓️ Revisar fecha':'🗓️ Agenda'}</button>
            <button class="btn btn-soft btn-sm" data-cx-po-action="reassign" data-visit-id="${escapeAssignment(v.id||v.visitId)}" title="Reasignar con comprobación del proveedor">🔄 Reasignar</button>
            <button class="btn btn-sm" data-cx-po-action="cancel" data-visit-id="${escapeAssignment(v.id||v.visitId)}" title="Solicitar cancelación autorizada">✕ Cancelar</button>
            <button class="btn btn-ghost btn-sm poAssignedManage" data-visit-id="${escapeAssignment(v.id||v.visitId)}" title="Ver todas las acciones">⋯ Más</button>
          </div>
        </div>
      </article>`).join('')}
    </div>`).join('');
  })();

  const html=`
  <div class="between" style="margin-bottom:6px">
    <div>${ui.ph('Gestión de Postulaciones y Asignaciones', `${c('pendiente')} postulaciones pendientes · ${operationalAssignments.length} asignaciones vigentes · ${reprog.length} reprogramación(es) · ${cancellationRequests.length} cancelación(es) pendientes · ${agendadas.length} agendamientos pendientes de realizar`)}</div>
    <div class="flex"><span class="bdg bdg-b">Gestión activa</span><span class="bdg bdg-b">${p.name}</span></div>
  </div>

  <div class="flex wrap" style="gap:8px;margin-bottom:12px">
    <button class="btn btn-soft btn-sm" id="syncHR">🔄 Sincronizar HR</button>
    <button class="btn btn-green btn-sm" id="asignManual">＋ Asignar visita manual</button>
    <button class="btn btn-ghost btn-sm" id="poExport">⤓ Exportar</button>
    <div class="spacer"></div>
    <button class="btn btn-pr btn-sm" id="reqShopper">📤 Pedir al shopper…</button>
    <button class="btn btn-pr btn-sm" id="openAgenda">🗓️ Gestionar agendamientos</button>
  </div>

  <div class="flex wrap" style="gap:8px;margin-bottom:12px">
    <input class="inp" id="pSearch" placeholder="🔎 Buscar shopper, sucursal…" style="flex:1;min-width:200px">
    <select class="sel" id="pProj" style="width:auto"><option value="">🗂️ Todos los proyectos</option>${[...new Set(posts.map(x=>x.projectId))].map(id=>`<option value="${id}">${projName(id)}</option>`).join('')}</select>
    <select class="sel" id="pPais" style="width:auto"><option value="">Todos los países</option>${[...new Set(posts.map(x=>x.pais))].map(c=>`<option>${c}</option>`).join('')}</select>
    <select class="sel" id="pEst" style="width:auto"><option value="">Todos los estados</option><option value="pendiente">Pendiente</option><option value="aprobada">Aprobada</option><option value="standby">Standby</option></select>
    <label class="flex" style="font-size:12px;color:var(--t2);gap:6px"><input type="checkbox" id="pHist"> Ver históricas</label>
  </div>

  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:11px;margin-bottom:16px" id="poKpis">
    <div data-k="pend" style="cursor:pointer">${ui.kpi('Postulaciones pendientes',c('pendiente'),'a')}</div>
    <div data-k="assign" style="cursor:pointer">${ui.kpi('Asignaciones vigentes',operationalAssignments.length,'b')}</div>
    <div data-k="reprog" style="cursor:pointer">${ui.kpi('Reprogramaciones pendientes',reprog.length,'r')}</div>
    <div data-k="cancel" style="cursor:pointer">${ui.kpi('Cancelaciones pendientes',cancellationRequests.length,'a')}</div>
    <div data-k="agenda" style="cursor:pointer">${ui.kpi('Agendamientos activos',agendadas.length,'n')}</div>
    <div data-k="aprob" style="cursor:pointer">${ui.kpi('Postulaciones aprobadas',c('aprobada'),'g')}</div>
    <div data-k="todas" style="cursor:pointer">${ui.kpi('Todas las postulaciones',activePosts.length,'b')}</div>
  </div>

  ${reprog.length?`<div class="card card-p" style="border-left:3px solid var(--amber);margin-bottom:16px">
    <div class="card-t" style="margin-bottom:10px">🗓️ Solicitudes de reprogramación pendientes <span class="bdg bdg-a">${reprog.length}</span></div>
    ${reprog.map(x=>`<div class="between wrap" style="gap:12px;padding:10px 0;border-bottom:1px solid var(--border-2)">
      <div><b style="font-size:13px">${x.shopper}</b> · <span style="font-size:12px;color:var(--t2)">${x.sucursal}</span>
      <div style="font-size:11px;color:var(--t3)">Fecha vigente: ${safe(x.fechaActual)} → Propuesta: ${safe(x.fechaProp)} · ${safe(x.reason||'Pendiente de revisión')}</div></div>
      <div class="flex" style="flex-wrap:wrap;gap:4px"><button class="btn btn-ghost btn-sm" data-revpost="${x.id}">👁 Revisar reprog.</button>${CX.adminPostulacionesActions.rescheduleReadiness(x,data).eligible?'<button class="btn btn-green btn-sm" data-authfecha="'+x.id+'">✅ Nueva fecha</button>':'<button class="btn btn-soft btn-sm" disabled>Fecha vencida</button><button class="btn btn-pr btn-sm" data-reprog-renew="'+x.id+'">📅 Pedir otra fecha</button>'}<button class="btn btn-ghost btn-sm" data-keepfecha="${x.id}">Conservar anterior</button></div>
    </div>`).join('')}</div>`:''}

  ${cancellationRequests.length?'<div class="card card-p" style="border-left:3px solid var(--amber);margin-bottom:14px"><div class="card-t">⚠️ Solicitudes de cancelación pendientes · '+cancellationRequests.length+'</div>'+cancellationRequests.map(v=>'<div class="cx-visit-request-note"><b>'+safe(v.shopper||v.shopperId)+'</b> · '+safe(v.sucursal)+' · Motivo: '+safe(CX.adminPostulacionesActions.cancelReasonForUi(v.cancelRequest))+'<div class="flex wrap" style="gap:8px;margin-top:8px"><button class="btn btn-green btn-sm" data-cancel-review="approved" data-vid="'+String(v.id||v.visitId).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">Aprobar solicitud</button><button class="btn btn-ghost btn-sm" data-cancel-review="rejected" data-vid="'+String(v.id||v.visitId).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">Rechazar solicitud</button></div></div>').join('')+'</div>':''}
  ${cancellationHrPending.length?'<div class="card card-p" style="border-left:3px solid var(--amber);margin-bottom:14px"><div class="card-t">Cancelaciones autorizadas · pendientes de confirmación HR · '+cancellationHrPending.length+'</div>'+cancellationHrPending.map(v=>'<div class="cx-visit-request-note"><b>'+safe(v.shopper||v.shopperId)+'</b> · '+safe(v.sucursal)+' · La visita no se liberará hasta que la HR externa confirme el cambio.</div>').join('')+'</div>':''}
  <div id="pGroups">${groupHTML}</div>
  <section class="poAssignedSection" data-cx-assignments aria-label="Asignaciones vigentes">
    <div class="between wrap" style="gap:10px;margin:16px 0 10px">
      <div><div class="card-t" style="font-size:15px">Asignaciones vigentes · ${operationalAssignments.length}</div><div class="muted" style="font-size:11px;margin-top:3px">Fichas por sucursal · origen HR / Hoja de Ruta o plataforma</div></div>
    </div>
    <div id="poAssignedGroups">${assignmentGroupHTML}</div>
  </section>
  `;

  setTimeout(()=>{
    /* CORTE 2A — Exportar Postulaciones: solo periodo activo + alcance filtrado visible,
       conserva proyecto/país/estado/revisión de fuente, columnas autorizadas, sin datos
       protegidos no autorizados (teléfono se excluye del export). */
    const pox=document.getElementById('poExport');
    if(pox&&CX.reportKit){
      const san=(s)=>String(s||'r').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'r';
      const visibleActive=()=>{
        const hist=(document.getElementById('pHist')||{}).checked;
        const q=((document.getElementById('pSearch')||{}).value||'').toLowerCase();
        const fpr=(document.getElementById('pProj')||{}).value||'';
        const fp=(document.getElementById('pPais')||{}).value||'';
        const fe=(document.getElementById('pEst')||{}).value||'';
        return posts.filter(x=>(hist||periodIdOf(x)===data.currentPeriodId)&&(!q||(x.shopper+x.shopperCode+x.sucursal).toLowerCase().includes(q))&&(!fpr||x.projectId===fpr)&&(!fp||x.pais===fp)&&(!fe||x.estado===fe));
      };
      const poSpec=(ext)=>{
        const rows=visibleActive();
        const byEst={}; rows.forEach(x=>{byEst[x.estado]=(byEst[x.estado]||0)+1;});
        const projectLabel=data.programBase?data.programBase(p):p.name;
        const periodLabel=(p.periodo||p.ronda||p.name||'Periodo');
        return { title:'Postulaciones',
          meta:{title:'Postulaciones',project:projectLabel,period:periodLabel,scope:'Periodo activo · alcance filtrado',sourceLabel:'Operación viva · postulaciones del periodo',sourceRevision,generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
          columns:[{key:'shopper',label:'Shopper'},{key:'sucursal',label:'Sucursal'},{key:'ciudad',label:'Ciudad'},{key:'pais',label:'País'},{key:'proyecto',label:'Proyecto'},{key:'estado',label:'Estado'},{key:'fecha',label:'Fecha propuesta'},{key:'franja',label:'Franja'},{key:'honorario',label:'Honorario'}],
          rows:rows.map(x=>({shopper:safe(x.shopper),sucursal:safe(x.sucursal),ciudad:safe(x.ciudad),pais:safe(x.pais),proyecto:projName(x.projectId),estado:safe(x.estado),fecha:safe(x.fechaProp),franja:safe(x.franjaCode),honorario:(x.honorario!=null?x.honorario:'Pendiente de fuente')})),
          notes:'',
          summary:['Postulaciones: '+rows.length,'Revisión de fuente: '+sourceRevision, Object.entries(byEst).map(([k2,v2])=>k2+': '+v2).join(' · ')],
          chart:{title:'Postulaciones por estado',data:Object.entries(byEst).map(([k2,v2])=>({label:k2,value:v2}))},
          filename:[san('postulaciones'),san(projectLabel),san(periodLabel),new Date().toISOString().slice(0,10)].join('_')+'.'+ext };
      };
      pox.addEventListener('click',()=>{ const n=visibleActive().length;
        CX.ui.modal('⤓ Exportar postulaciones',`<p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">${n} postulación(es) del periodo activo y alcance filtrado. Se exporta con el diseño del tenant; el teléfono protegido no se incluye.</p><div class="flex" style="gap:8px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="poPdf">⤓ PDF</button><button class="btn btn-soft btn-sm" id="poXls">⤓ Excel</button><button class="btn btn-pr btn-sm" id="poPpt">⤓ PPT</button></div>`,{onMount:(ov)=>{ov.querySelector('#poPdf').addEventListener('click',()=>CX.reportKit.exportPDF(poSpec('pdf')));ov.querySelector('#poXls').addEventListener('click',()=>{if(CX.reportKit.exportExcel(poSpec('xlsx')))CX.ui.toast('Excel .xlsx generado','ok');});ov.querySelector('#poPpt').addEventListener('click',()=>{if(CX.reportKit.exportPPT(poSpec('pptx')))CX.ui.toast('PowerPoint generado','ok');});}});
      });
    }
    /* HF-20261012-15: recover per-assignment actions by invoking the same scoped
       Postulaciones owner used by Dashboard. Never synthesize a postulation or write HR. */
    /* I3 B7: quick action controls reuse one approved owner/provider boundary,
       never perform local mutation or invent durable postulations. */
    document.querySelectorAll('[data-cx-po-action]').forEach(b=>b.addEventListener('click',()=>{
      const visitId=String(b.dataset.visitId||''),action=String(b.dataset.cxPoAction||'');
      if(!visitId)return;
      const api=CX.adminPostulacionesActions;
      if(action==='request')api?.openRequest?.({data,ui,visitIds:[visitId]});
      else if(action==='agenda'||action==='agenda-review')api?.openAgenda?.({data,ui,visitIds:[visitId]});
      else if(action==='reassign')api?.openAssign?.({data,ui,visitId,reassign:true});
      else if(action==='cancel')api?.openCancellation?.({data,ui,visitId});
    }));
    document.querySelectorAll('.poAssignedManage').forEach(b=>b.addEventListener('click',()=>{
      const visitId=String(b.dataset.visitId||'');
      if(!visitId)return;
      CX.adminPostulacionesActions?.openContext?.({data,ui,visitId});
    }));
    const poList=(title,arr)=>ui.modal(title+' ('+arr.length+')', arr.length?`<table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th>Estado</th><th>Honorario</th><th></th></tr></thead><tbody>${arr.map(x=>`<tr><td><b style="font-size:12.5px">${x.shopper}</b><div style="font-size:10px;color:var(--t3)">${x.shopperCode}</div></td><td style="font-size:12px">${x.sucursal}<div style="font-size:10px;color:var(--t3)">${CX.paisFlag(x.pais)} ${x.ciudad}</div></td><td>${estTag(x.estado)}</td><td style="font-size:12px;color:var(--green)">${x.honorario!=null?x.currency+' '+x.honorario:'<span class="muted">Pendiente de fuente</span>'}</td><td style="text-align:right">${x.id?`<button class="btn btn-ghost btn-sm poRowGest" data-pid="${x.id}" style="padding:2px 9px;font-size:11px">Gestionar →</button>`:''}</td></tr>`).join('')}</tbody></table>`:ui.empty('📭','Sin elementos en esta categoría.'),
      {replaceExisting:true,onMount:(ov,close)=>ov.querySelectorAll('.poRowGest').forEach(b=>b.addEventListener('click',()=>{const x=posts.find(z=>z.id===b.dataset.pid);if(x){close();postDetalle(x);}}))});
    /* B7: functional owner of each operational KPI. No synthetic postulation
       and no new provider write. The existing authorized visit-action handlers own decisions. */
    const openOperationalKpi=(title,rows,kind)=>{
      const escapeText=(v)=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
      const actionLabel={assign:'Gestionar visita',reprog:'Revisar fecha',cancel:'Revisar cancelación',agenda:'Gestionar agenda'}[kind];
      const tableRows=rows.map(v=>{
        const id=String(v.visitaId||v.visitId||v.id||'');
        const visit=operationalAssignments.find(x=>String(x.id||x.visitId)===id);
        if(!visit)return'';
        const status=kind==='reprog'?'Pendiente de autorización':kind==='cancel'?'Cancelación pendiente':assignmentState(visit);
        return '<tr><td><b>'+escapeText(visit.shopper||visit.shopperId||'Identidad protegida')+'</b></td>'
          +'<td>'+escapeText(visit.sucursal||'—')+'<div class="muted">'+escapeText(visit.pais||'')+' · '+escapeText(visit.ciudad||'')+'</div></td>'
          +'<td>'+escapeText(status)+'</td><td><button class="btn btn-pr btn-sm" data-po-kpi-action="'+kind+'" data-visit-id="'+escapeText(id)+'">'+actionLabel+'</button></td></tr>';
      }).filter(Boolean).join('');
      ui.modal(title+' ('+rows.length+')',tableRows
        ?'<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th>Estado</th><th>Acción</th></tr></thead><tbody>'+tableRows+'</tbody></table></div>'
        :ui.empty('🗂️','Sin solicitudes vigentes en esta categoría.'),{replaceExisting:true,onMount:(ov,close)=>{
        ov.querySelectorAll('[data-po-kpi-action]').forEach(b=>b.addEventListener('click',()=>{
          const id=String(b.dataset.visitId||''),action=String(b.dataset.poKpiAction||'');
          const visit=operationalAssignments.find(x=>String(x.id||x.visitId)===id);
          if(!visit)return;
          close();
          if(action==='assign')CX.adminPostulacionesActions?.openContext?.({data,ui,visitId:id});
          else if(action==='reprog'||action==='agenda')CX.adminPostulacionesActions?.openAgenda?.({data,ui,visitIds:[id]});
          else if(action==='cancel'){
            const buttons=[...document.querySelectorAll('[data-cancel-review]')].filter(x=>String(x.dataset.vid||'')===id);
            if(!buttons.length){ui.toast('La solicitud ya no está disponible para decidir. Actualiza la vista.','warn',4200);return;}
            ui.modal('Decidir cancelación · '+escapeText(visit.sucursal),'<p>Selecciona la decisión autorizada para esta solicitud.</p><div class="flex wrap" style="gap:8px"><button class="btn btn-green" data-po-cancel-outcome="approved">Autorizar</button><button class="btn btn-soft" data-po-cancel-outcome="rejected">Rechazar</button></div>',{onMount:(dialog,closeDecision)=>{
              dialog.querySelectorAll('[data-po-cancel-outcome]').forEach(choice=>choice.addEventListener('click',()=>{
                const btn=buttons.find(x=>x.dataset.cancelReview===choice.dataset.poCancelOutcome);
                if(!btn)return;
                closeDecision();btn.click();
              }));
            }});
          }
        }));
      }});
    };
    const inPostState=state=>activePosts.filter(x=>String(x.estado||x.status||'').toLowerCase()===state);
    const poKp={
      pend:['Postulaciones pendientes',inPostState('pendiente')],
      aprob:['Postulaciones aprobadas',inPostState('aprobada')],
      todas:['Todas las postulaciones',activePosts],
    };
    const operationalKpis={
      assign:['Asignaciones vigentes',operationalAssignments],
      reprog:['Reprogramaciones pendientes',reprog],
      cancel:['Cancelaciones pendientes',cancellationRequests],
      agenda:['Agendamientos pendientes de realizar',agendadas]
    };
    document.querySelectorAll('#poKpis [data-k]').forEach(el=>el.addEventListener('click',()=>{
      const key=String(el.dataset.k||'');
      if(operationalKpis[key]){const [title,rows]=operationalKpis[key];openOperationalKpi(title,rows,key);return;}
      const spec=poKp[key];if(spec)poList(spec[0],spec[1]);
    }));
    const gestor=()=>(CX.session.user&&CX.session.user.name)||'Equipo';
    const act=(id,label,tone,extra)=>{
      const el=document.querySelector(`[data-pid="${id}"]`);
      const x=posts.find(z=>z.id===id); if(x){x.estado=(tone==='green'?'aprobada':tone==='amber'?'standby':'rechazada');x.gestionadoPor=gestor();
        CX.automations&&CX.automations.logAction(label.replace(/[^\wáéíóúñ ]/gi,'').trim(),x.visitaId||x.id,(x.shopper||'')+' · '+(x.sucursal||''));}
      if(el){
        const actionBox=el.querySelector('div[style*="flex-direction:column"]');
        if(actionBox)actionBox.innerHTML=`<div style="background:var(--${tone}-bg);border-radius:9px;padding:8px 14px;text-align:center"><div style="font-size:12px;font-weight:700;color:var(--${tone})">${label}</div><div style="font-size:10px;color:var(--t3)">por ${gestor()}</div></div>`;
        // marca trazabilidad en el cuerpo y "saca de pendientes" visualmente cuando la tarjeta sigue montada
        el.style.opacity=tone==='green'?'1':'.7';
      }
      ui.toast(extra+' · gestionado por '+gestor(),'ok');
    };
    const approveDurable=async(x,button,close)=>{
      if(!x)return;
      if(!CX.permissions.gate('postulacion.approve',{projectId:x.rootProjectId||x.projectId,pais:x.pais},ui))return;
      if(typeof data.setApplicationStatus!=='function'){
        ui.toast('Aprobación no ejecutada: el boundary durable no está disponible. No se modificó ningún dato.','warn',4200);
        return;
      }
      const previousText=button&&button.textContent;
      if(button){button.disabled=true;button.textContent='Aprobando…';}
      let result=null;
      try{result=await data.setApplicationStatus(x.id,'aprobada',{ackAware:true,reason:'admin_approval'});}
      catch(error){result={ok:false,status:'blocked',providerAck:false,successUiAllowed:false,code:error&&error.message?error.message:'COMMAND_ERROR'};}
      const committed=result&&result.ok===true&&result.status==='committed'&&result.providerAck===true&&result.successUiAllowed===true;
      if(!committed){
        if(button){button.disabled=false;button.textContent=previousText||'✅ Aprobar';}
        ui.toast('Aprobación no ejecutada: no fue posible confirmar el cambio. La postulación permanece sin cambios.','warn',4200);
        return;
      }
      if(CX.automations)CX.automations.fire('aprobacion',{shopper:x.shopper,sucursal:x.sucursal});
      try{queueMicrotask(()=>window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('postulation_approval_assignment_committed',true));}catch(_){}
      act(x.id,'✅ Aprobada','green','Aprobada · asignación creada y postulación cerrada');
      if(typeof close==='function')close();
    };

    /* perfil real del shopper (no el listado) — tarjetas clickeables + historial + requisitos */
    const profileModal=(sid)=>{ const s=data.getShopper?data.getShopper(sid):data.shoppers.find(x=>x.id===sid); if(!s){ui.toast('Shopper no encontrado','warn');return;}
      const st=data.shopperStats?data.shopperStats(s.id):{total:0,realizadas:0,liquidadas:0,enCurso:0,cumpl:0};
      const hist=data.visitsForShopper?data.visitsForShopper(s.id):[];
      const reqs=[['Perfil completo',s.perfilCompleto!==false],['Datos bancarios',!!(s.banco||s.ctaNum)],['WhatsApp',!!(s.whatsapp||s.phone)],['Certificado',(st.realizadas||0)>0||s.certificado]];
      ui.modal(s.nombre+' · '+s.code,`
        <div class="flex" style="gap:12px;margin-bottom:12px"><div class="rail-av" style="width:42px;height:42px;font-size:15px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.code.slice(-2)}</div>
        <div><div class="card-t" style="font-size:15px">${s.nombre}</div><div style="font-size:12px;color:var(--t3)">${s.ciudad?s.ciudad+', ':''}${CX.paisName(s.pais)} · ${s.whatsapp||s.phone||'sin WhatsApp'}</div>
        <div style="margin-top:4px"><span style="font-size:13px;font-weight:800;color:var(--amber)">★ ${s.rating||'—'}</span> ${s.perfilCompleto===false?ui.bdg('perfil incompleto','a'):''}</div></div></div>
        <div class="grid g4" style="margin-bottom:12px"><div data-ph="all" style="cursor:pointer">${ui.kpi('Visitas',st.total,'b')}</div><div data-ph="real" style="cursor:pointer">${ui.kpi('Realizadas',st.realizadas,'g')}</div><div data-ph="liq" style="cursor:pointer">${ui.kpi('Liquidadas',st.liquidadas,'p')}</div>${ui.kpi('Cumpl.',(st.cumpl||0)+'%','a')}</div>
        <div class="card-t" style="font-size:12.5px;margin-bottom:6px">✔ Verificación de requisitos</div>
        <div class="flex wrap" style="gap:6px;margin-bottom:12px">${reqs.map(r=>`<span class="bdg ${r[1]?'bdg-g':'bdg-a'}">${r[1]?'✓':'⚠'} ${r[0]}</span>`).join('')}</div>
        <div style="font-size:11px;color:var(--t3);margin-bottom:6px">↑ toca un indicador para ver el historial de visitas</div>
        <div class="flex" style="justify-content:flex-end;gap:8px"><button class="btn btn-soft btn-sm" id="pmWa">📲 WhatsApp</button><button class="btn btn-pr btn-sm" id="pmGo">Ver perfil completo →</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#pmGo').addEventListener('click',()=>{close();CX.session._focusShopper=s.id;CX.router.nav('shoppers');});
        ov.querySelector('#pmWa').addEventListener('click',()=>{if(CX.adminPostulacionesActions.openWaDraft({ui,shopper:s.nombre,phone:s.whatsapp||s.phone,body:'Hola '+s.nombre+', sobre tus visitas.'}))close();});
        const histModal=(filter,title)=>{ const arr=hist.filter(filter);
          ui.modal(title+' · '+s.nombre, arr.length?`<table class="tbl"><thead><tr><th>Sucursal</th><th>Escenario</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${arr.map(v=>`<tr><td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td><td style="font-size:12px">${v.escenario||''}</td><td style="font-size:12px">${v.realizada||v.agendada||'—'}</td><td>${ui.estadoBadge(v.estado)}</td></tr>`).join('')}</tbody></table>`:ui.empty('🗒️','Sin visitas en esta categoría.')); };
        ov.querySelectorAll('[data-ph]').forEach(el=>el.addEventListener('click',()=>{const k=el.dataset.ph; if(k==='all')histModal(()=>true,'Historial completo'); else if(k==='real')histModal(v=>['realizada','cuestionario','liquidada'].includes(v.estado),'Realizadas'); else histModal(v=>v.estado==='liquidada','Liquidadas');}));
      }});
    };
    document.querySelectorAll('[data-ap]').forEach(b=>b.addEventListener('click',async()=>{const x=posts.find(z=>z.id===b.dataset.ap);await approveDurable(x,b);}));
    /* FIX: el botón Perfil ahora abre el perfil real del shopper */
    document.querySelectorAll('[data-perfil]').forEach(b=>b.addEventListener('click',(e)=>{e.stopPropagation();profileModal(b.dataset.perfil);}));
    /* detalle de la postulación/visita al hacer clic en la tarjeta */
    const postDetalle=(x)=>{ const v=data._visitas?data._visitas.find(z=>z.id===x.visitaId):null;
      ui.modal('📋 '+x.sucursal+' · '+x.shopper,`
        <div style="font-size:12.5px;line-height:1.95;color:var(--t2)">
          <div><b>Shopper:</b> ${x.shopper} (${x.shopperCode}) · 📞 ${x.phone||'—'}</div>
          <div><b>Proyecto:</b> ${projName(x.projectId)} · <b>Quincena:</b> ${x.quincena}</div>
          <div><b>Sucursal:</b> ${x.sucursal} · ${CX.paisFlag(x.pais)} ${x.ciudad}</div>
          <div><b>Escenario:</b> ${(v&&v.escenario)||x.escenario||'—'}</div>
          <div><b>Fecha propuesta:</b> ${x.fechaProp||'—'} · <b>Franja:</b> ${x.franjaCode||'—'}</div>
          <div><b>Honorario:</b> ${x.currency} ${x.honorario}${x.boleto?' + boleto':''}${x.comboAmt?' + reembolso':''}</div>
          <div><b>Estado:</b> ${x.estado}${x.gestionadoPor?' · gestionado por '+x.gestionadoPor:''}</div>
        </div>
        <div class="flex wrap" style="gap:8px;margin-top:14px;justify-content:flex-end">
          ${x.estado==='pendiente'?`<button class="btn btn-green btn-sm" id="pdAp">✅ Aprobar</button><button class="btn btn-ghost btn-sm" id="pdRj" style="color:var(--red)">Rechazar</button>`:''}
          <button class="btn btn-soft btn-sm" id="pdPerfil">👤 Perfil del shopper</button>
          <button class="btn btn-soft btn-sm" id="pdWa" title="Abre WhatsApp Web con un borrador manual — no es envío automático">📲 WhatsApp (borrador manual)</button>
        </div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#pdPerfil')&&ov.querySelector('#pdPerfil').addEventListener('click',()=>{close();profileModal(x.shopperId);});
        ov.querySelector('#pdWa')&&ov.querySelector('#pdWa').addEventListener('click',()=>{const shopper=data.getShopper?.(x.shopperId);CX.adminPostulacionesActions.openWaDraft({ui,shopper:x.shopper||shopper?.nombre,phone:shopper?.whatsapp||shopper?.phone||x.phone,body:'Hola '+(x.shopper||shopper?.nombre||'')+', sobre tu visita en '+x.sucursal+'.'});});
        ov.querySelector('#pdAp')&&ov.querySelector('#pdAp').addEventListener('click',async()=>{await approveDurable(x,ov.querySelector('#pdAp'),close);});
        ov.querySelector('#pdRj')&&ov.querySelector('#pdRj').addEventListener('click',async()=>{if(await applicationStatusDurable(x,'rechazada',ov.querySelector('#pdRj'),'✕ Rechazada','red','Postulación rechazada'))close();});
      }});
    };
    document.querySelectorAll('#pGroups [data-pid]').forEach(el=>el.addEventListener('click',(e)=>{
      if(e.target.closest('button'))return; /* no interferir con los botones de acción */
      const x=posts.find(z=>z.id===el.dataset.pid); if(x)postDetalle(x);
    }));
    const applicationStatusDurable=async(x,status,button,label,tone,message)=>{
      if(!x||typeof data.setApplicationStatus!=='function'){ui.toast('Acción no ejecutada: persistencia remota no disponible.','warn',4200);return false;}
      const permission=status==='rechazada'?'postulacion.reject':'postulacion.approve';
      if(!CX.permissions.gate(permission,{projectId:x.rootProjectId||x.projectId,pais:x.pais},ui))return false;
      const prev=button&&button.textContent;if(button){button.disabled=true;button.textContent='Confirmando…';}
      let result=null;try{result=await data.setApplicationStatus(x.id,status,{ackAware:true,reason:'admin_'+status});}catch(error){result={ok:false,status:'blocked',providerAck:false,successUiAllowed:false};}
      const ok=result&&result.ok===true&&result.status==='committed'&&result.providerAck===true&&result.successUiAllowed===true;
      if(!ok){if(button){button.disabled=false;button.textContent=prev||label;}ui.toast('Acción no ejecutada: no fue posible confirmar el cambio. La postulación permanece sin cambios.','warn',4200);return false;}
      act(x.id,label,tone,message+' · guardada correctamente');return true;
    };
    document.querySelectorAll('[data-sb]').forEach(b=>b.addEventListener('click',async()=>{const x=posts.find(z=>z.id===b.dataset.sb);await applicationStatusDurable(x,'standby',b,'⏸ Standby','amber','Postulación en standby');}));
    document.querySelectorAll('[data-rj]').forEach(b=>b.addEventListener('click',async()=>{const x=posts.find(z=>z.id===b.dataset.rj);await applicationStatusDurable(x,'rechazada',b,'✕ Rechazada','red','Postulación rechazada');}));
    const search=()=>{const q=(document.getElementById('pSearch').value||'').toLowerCase(),fpr=document.getElementById('pProj').value,fp=document.getElementById('pPais').value,fe=document.getElementById('pEst').value,hist=document.getElementById('pHist').checked;
      document.querySelectorAll('#pGroups [data-pid]').forEach(el=>{const x=posts.find(z=>z.id===el.dataset.pid);
        const lifecycleOk=hist||(x?._archived!==true&&x?.active!==false&&x?.postulationLifecycle!=='transitioned_to_assignment');
        const ok=lifecycleOk&&(hist||periodIdOf(x)===data.currentPeriodId)&&(!q||(displayShopper(x)+' '+displayCode(x)+' '+x.sucursal).toLowerCase().includes(q))&&(!fpr||x.projectId===fpr)&&(!fp||x.pais===fp)&&(!fe||x.estado===fe);el.style.display=ok?'':'none';});
      // Postulaciones y asignaciones son superficies distintas: el filtro cubre ambas.
      document.querySelectorAll('#pGroups .card').forEach(g=>{const any=[...g.querySelectorAll('[data-pid]')].some(el=>el.style.display!=='none');g.style.display=any?'':'none';});
      document.querySelectorAll('#poAssignedGroups [data-cx-assignment-card]').forEach(el=>{
        const visit=operationalAssignments.find(v=>String(v.id||v.visitId)===String(el.dataset.visitRef||''));
        if(!visit){el.style.display='none';return;}
        const searchable=[visit.shopper,visit.shopperCode,visit.sucursal,visit.ciudad,visit.pais,visit.escenario,visit.code].map(x=>String(x||'')).join(' ').toLowerCase();
        const projectIds=[visit.rootProjectId,visit.projectId,data.currentProjectId].map(x=>String(x||'')).filter(Boolean);
        const matches=!q||searchable.includes(q);
        const projectOk=!fpr||projectIds.includes(String(fpr));
        const countryOk=!fp||String(visit.pais||'')===String(fp);
        const stateOk=!fe||String(visit.estado||visit.status||'').toLowerCase()===String(fe).toLowerCase();
        el.style.display=matches&&projectOk&&countryOk&&stateOk?'':'none';
      });
      document.querySelectorAll('#poAssignedGroups [data-cx-assignment-group]').forEach(group=>{
        const any=[...group.querySelectorAll('[data-cx-assignment-card]')].some(el=>el.style.display!=='none');
        group.style.display=any?'':'none';
      });
    };
    ['pSearch','pProj','pPais','pEst','pHist'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',search);});
    /* R19 P0-1 (20260715): "Postulaciones solo debe mostrar el periodo activo" — el checkbox
       "Ver históricas" ya existía en el markup pero nunca estaba conectado a ningún filtro (todas
       las postulaciones de TODOS los periodos se listaban siempre). Ahora search() oculta,
       DESDE EL PRIMER RENDER, cualquier postulación de un periodo distinto al activo salvo que el
       usuario marque "Ver históricas" explícitamente. */
    search();
    /* B7: explicit authorized Admin decision on the exact durable visit.cancelRequest.
       An approval of external HR is pending its ACK, never an immediate available visit. */
    document.querySelectorAll('[data-cancel-review]').forEach(b=>b.addEventListener('click',()=>{
      const id=String(b.dataset.vid||''),decision=b.dataset.cancelReview;
      const v=cancellationRequests.find(x=>String(x.id||x.visitId)===id);
      if(!v||!['approved','rejected'].includes(decision))return;
      if(!CX.permissions.gate('visit.cancel',{projectId:data.currentProjectId,pais:v.pais},ui))return;
      const approving=decision==='approved';
      ui.modal(approving?'Autorizar solicitud de cancelación':'Rechazar solicitud de cancelación',
        '<p style="font-size:12.5px;color:var(--t2);margin-bottom:12px"><b>'+safe(v.shopper||v.shopperId)+'</b> · '+safe(v.sucursal)+
        '</p><div class="cx-visit-request-note">Motivo del shopper: '+safe(CX.adminPostulacionesActions.cancelReasonForUi(v.cancelRequest))+'</div>'+
        '<p style="font-size:12px;color:var(--t2);margin:12px 0">'+(approving
          ?'Si la HR es externa, la aprobación quedará pendiente de su confirmación y la visita seguirá asignada mientras tanto.'
          :'La visita conservará su asignación y fecha vigente.')+'</p>'+
        '<label class="lbl" for="cxCancelAdminReason">Motivo de la decisión (obligatorio)</label>'+
        '<textarea class="inp" id="cxCancelAdminReason" maxlength="500" rows="3"></textarea>'+
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">'+
        '<button class="btn btn-ghost" id="cxCancelAdminBack">Volver</button>'+
        '<button class="btn btn-pr" id="cxCancelAdminDecide">'+(approving?'Autorizar':'Rechazar')+'</button></div>',
        {premium:true,replaceExisting:true,dismissOnBackdrop:false,onMount:(ov,close)=>{
          ov.querySelector('#cxCancelAdminBack').addEventListener('click',close);
          ov.querySelector('#cxCancelAdminDecide').addEventListener('click',async()=>{
            const btn=ov.querySelector('#cxCancelAdminDecide'),reason=ov.querySelector('#cxCancelAdminReason').value.trim();
            if(!reason){ui.toast('Indica el motivo de la decisión.','warn',3800);return;}
            btn.disabled=true;btn.textContent='Guardando decisión…';
            let result=null;
            try{result=await data.requestVisitCancel(id,{ackAware:true,requestOnly:false,decision,reason});}catch(_){}
            const ack=!!(result?.ok===true&&result?.status==='committed'&&result?.providerAck===true&&result?.successUiAllowed===true);
            if(!ack){btn.disabled=false;btn.textContent=approving?'Autorizar':'Rechazar';ui.toast('No se confirmó la decisión en el servidor.','warn',4200);return;}
            let observed=null;
            try{await CX.backend?.refresh?.();await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('admin_cancel_decision_committed');observed=data.visitas().find(x=>String(x.id||x.visitId)===id);}catch(_){}
            const status=String(observed?.cancelRequest?.status||'');
            close();CX.router.nav('postulaciones',{history:false});
            if(status==='rejected'||status==='approved'||status==='approved_pending_hr'){
              ui.toast(status==='approved_pending_hr'?'Cancelación autorizada · pendiente HR':'Decisión registrada y confirmada.','ok',4200);
            }else ui.toast('Decisión registrada con ACK remoto. Actualizando el seguimiento visible.','warn',4400);
          });
        }});
    }));
    /* botones de reprogramación (revisar / autorizar nueva fecha / conservar anterior) */
    document.querySelectorAll('[data-revpost]').forEach(b=>b.addEventListener('click',()=>{
      const x=findReprogram(b.dataset.revpost);
      const visitId=String(x?.visitaId||x?.visitId||x?.id||'');
      if(!visitId){ui.toast('No hay una visita exacta para revisar la reprogramación.','warn',4200);return;}
      CX.adminPostulacionesActions.openAgenda({data,ui,visitIds:[visitId]});
    }));
    document.querySelectorAll('[data-reprog-renew]').forEach(b=>b.addEventListener('click',()=>{
      const x=findReprogram(b.dataset.reprogRenew);
      const visitId=String(x?.visitaId||x?.visitId||x?.id||'');
      if(!visitId)return;
      CX.adminPostulacionesActions.requestReplacementDate({data,ui,visitId});
    }));
    document.querySelectorAll('[data-authfecha]').forEach(b=>b.addEventListener('click',async()=>{
      const x=findReprogram(b.dataset.authfecha);
      if(!x||!x.fechaProp)return;
      const readiness=CX.adminPostulacionesActions.rescheduleReadiness(x,data);
      if(!readiness.eligible){ui.toast(readiness.reason,'warn',4800);return;}
      if(!CX.permissions.gate('visit.reassign',{projectId:x.rootProjectId||x.projectId,pais:x.pais},ui))return;
      const before=b.textContent;b.disabled=true;b.textContent='Confirmando…';
      let result=null,error=null;
      try{result=await data.requestVisitReschedule(x.visitaId,x.fechaProp,{ackAware:true,decision:'approved',reason:'admin_reprogram_approved'});}catch(caught){error=caught;}
      if(!(result?.ok===true&&result?.status==='committed'&&result?.providerAck===true&&result?.successUiAllowed===true)){
        const diagnostic=CX.adminPostulacionesActions.rescheduleFailure(result,error);
        b.dataset.providerResultCode=diagnostic.code;b.disabled=false;b.textContent=before;ui.toast(diagnostic.message,'warn',4800);return;
      }
      let readback=false;
      try{
        await CX.backend?.refresh?.();
        await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('admin_reschedule_decision_committed');
        const exact=(data.visitas()||[]).find(v=>String(v.id||v.visitId)===String(x.visitaId));
        readback=String(exact?.rescheduleRequest?.status||'')==='approved';
      }catch(_){}
      if(readback){CX.router.nav('postulaciones',{history:false});ui.toast('Nueva fecha autorizada · confirmada y releída.','ok',3600);}
      else{b.disabled=false;b.textContent=before;ui.toast('Decisión aceptada por el servidor; la actualización visible sigue pendiente.','warn',4800);}
    }));
    document.querySelectorAll('[data-keepfecha]').forEach(b=>b.addEventListener('click',async()=>{
      const x=findReprogram(b.dataset.keepfecha);
      if(!x)return;
      if(!CX.permissions.gate('visit.reassign',{projectId:x.rootProjectId||x.projectId,pais:x.pais},ui))return;
      const before=b.textContent;b.disabled=true;b.textContent='Confirmando…';
      let result=null,error=null;
      try{result=await data.requestVisitReschedule(x.visitaId,null,{ackAware:true,decision:'rejected',reason:'admin_reprogram_rejected'});}catch(caught){error=caught;}
      if(!(result?.ok===true&&result?.status==='committed'&&result?.providerAck===true&&result?.successUiAllowed===true)){
        const diagnostic=CX.adminPostulacionesActions.rescheduleFailure(result,error);
        b.dataset.providerResultCode=diagnostic.code;b.disabled=false;b.textContent=before;ui.toast(diagnostic.message,'warn',4800);return;
      }
      let readback=false;
      try{
        await CX.backend?.refresh?.();
        await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('admin_reschedule_decision_committed');
        const exact=(data.visitas()||[]).find(v=>String(v.id||v.visitId)===String(x.visitaId));
        readback=String(exact?.rescheduleRequest?.status||'')==='rejected';
      }catch(_){}
      if(readback){CX.router.nav('postulaciones',{history:false});ui.toast('Fecha anterior conservada · confirmada y releída.','ok',3600);}
      else{b.disabled=false;b.textContent=before;ui.toast('Decisión aceptada por el servidor; la actualización visible sigue pendiente.','warn',4800);}
    }));

    /* editar fecha/franja de la visita de una postulación */
    document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>{ const x=posts.find(z=>z.id===b.dataset.edit); if(!x)return;
      ui.modal('Editar asignación · '+x.shopper,`
        <div style="font-size:12px;color:var(--t2);margin-bottom:10px">📍 ${x.sucursal} · ${x.ciudad}</div>
        <label class="lbl">Fecha</label><input class="inp" id="edF" type="date" value="${x.fechaProp||''}" style="margin-bottom:10px">
        <label class="lbl">Franja</label><select class="sel" id="edFr" style="margin-bottom:14px">${['AM 8–12h','PM 14–18h','WK fin de semana'].map(o=>`<option ${o.startsWith(x.franjaCode||'')?'selected':''}>${o}</option>`).join('')}</select>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="edOk">Guardar</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#edOk').addEventListener('click',async()=>{const f=ov.querySelector('#edF').value,fr=ov.querySelector('#edFr').value;if(!f){ui.toast('Elige la fecha','warn');return;}const btn=ov.querySelector('#edOk');btn.disabled=true;btn.textContent='Confirmando…';let r=null;try{r=await data.requestVisitReschedule(x.visitaId,f,{ackAware:true,decision:'approved',franjaCode:fr,reason:'admin_assignment_edit'});}catch(_){r=null;}const ok=r&&r.ok===true&&r.status==='committed'&&r.providerAck===true&&r.successUiAllowed===true;if(!ok){btn.disabled=false;btn.textContent='Guardar';ui.toast('Cambio no ejecutado: no fue posible confirmar el cambio.','warn',4200);return;}close();ui.toast('Asignación actualizada y guardada correctamente','ok',3600);});}});
    }));

    /* reasignar a otro shopper */
    document.querySelectorAll('[data-reasig]').forEach(b=>b.addEventListener('click',()=>{ const x=posts.find(z=>z.id===b.dataset.reasig); if(!x)return;
      const projectId=String(data.currentProjectId||''),visitCountry=String(x.pais||'');
      const candidateAudit=(Array.isArray(data.shoppers)?data.shoppers:[]).filter(s=>String(s.id||'')!==String(x.shopperId||'')).map(s=>{
        const reasons=[];
        if(visitCountry&&String(s.pais||s.country||'')!==visitCountry)reasons.push('otro país');
        if(data.inScope&&!data.inScope(s.pais||s.country))reasons.push('fuera de alcance autorizado');
        if(Array.isArray(s.projectIds)&&s.projectIds.length&&!s.projectIds.map(String).includes(projectId))reasons.push('otro proyecto');
        if(typeof data.shopperDataLevel==='function'&&data.shopperDataLevel(s)==='protected_reference')reasons.push('perfil protegido sin identidad operable');
        return {s,reasons};
      });
      const cands=candidateAudit.filter(x=>x.reasons.length===0).map(x=>x.s);
      const excluded=candidateAudit.filter(x=>x.reasons.length);
      const curFecha=safe(x.fechaProp), curFranja=safe(x.franjaCode);
      ui.modal('Reasignar visita · '+x.sucursal,`
        <div style="background:var(--panel-2);border:1px solid var(--border);border-radius:9px;padding:10px 12px;margin-bottom:12px;font-size:12px;color:var(--t2)">
          <div>Shopper actual: <b>${safe(x.shopper)}</b></div>
          <div>Fecha vigente: <b>${curFecha}</b> · Franja vigente: <b>${curFranja}</b></div>
        </div>
        <p style="font-size:12px;color:var(--t2);margin-bottom:8px">Busca y elige el nuevo evaluador.</p>
        <input class="inp" id="rsFind" placeholder="🔍 Buscar por nombre, código o ciudad…" style="margin-bottom:6px">
        <div class="flex" style="gap:6px;margin-bottom:8px"><select class="sel" id="rsPais" style="flex:1"><option value="">País: todos</option>${[...new Set(cands.map(s=>s.pais))].map(p=>`<option value="${p}">${CX.paisName(p)}</option>`).join('')}</select><select class="sel" id="rsCert" style="flex:1"><option value="">Certificación: todas</option><option value="1">Solo certificados</option></select></div>
        <div id="rsList" style="max-height:180px;overflow:auto;border:1px solid var(--border);border-radius:8px;margin-bottom:12px"></div>
        <label class="lbl">Decisión de fecha / franja <b style="color:var(--accent)">*</b></label>
        <div id="rsDate" style="margin-bottom:6px">
          <label class="flex" style="gap:7px;align-items:center;padding:6px 0;font-size:12.5px;cursor:pointer"><input type="radio" name="rsDateMode" value="keep" checked> <span>Conservar fecha <span style="color:var(--t3)">(mantiene ${curFecha} · ${curFranja})</span></span></label>
          <label class="flex" style="gap:7px;align-items:center;padding:6px 0;font-size:12.5px;cursor:pointer"><input type="radio" name="rsDateMode" value="change"> <span>Cambiar fecha</span></label>
          <div id="rsChangeBox" style="display:none;padding:4px 0 4px 24px"><div class="flex" style="gap:8px"><input class="inp" id="rsNewF" type="date" value="${x.fechaProp||''}" style="flex:1"><select class="sel" id="rsNewFr" style="flex:1">${['AM 8–12h','PM 14–18h','WK fin de semana'].map(o=>`<option ${o.startsWith(x.franjaCode||'')?'selected':''}>${o}</option>`).join('')}</select></div></div>
          <label class="flex" style="gap:7px;align-items:center;padding:6px 0;font-size:12.5px;cursor:pointer"><input type="radio" name="rsDateMode" value="pending"> <span>Pendiente de agendamiento <span style="color:var(--t3)">(sin fecha hasta coordinar)</span></span></label>
        </div>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rsOk" disabled>Reasignar</button></div>
      `,{onMount:(ov,close)=>{
        let sel=null;
        const modeOf=()=>ov.querySelector('input[name=rsDateMode]:checked').value;
        const box=ov.querySelector('#rsChangeBox');
        ov.querySelectorAll('input[name=rsDateMode]').forEach(r=>r.addEventListener('change',()=>{box.style.display=modeOf()==='change'?'':'none';}));
        const draw=()=>{ const q=(ov.querySelector('#rsFind').value||'').toLowerCase(); const fp=ov.querySelector('#rsPais').value; const fc=ov.querySelector('#rsCert').value;
          const list=cands.filter(s=>(!q||(s.nombre+' '+s.code+' '+(s.ciudad||'')).toLowerCase().includes(q))&&(!fp||s.pais===fp)&&(!fc||s.certificado));
          ov.querySelector('#rsList').innerHTML=list.length?list.slice(0,50).map(s=>`<div class="rsRow" data-id="${s.id}" style="padding:8px 11px;border-bottom:1px solid var(--border-2);cursor:pointer;${sel===s.id?'background:var(--brand-light)':''}"><b style="font-size:12.5px">${s.nombre}</b> <span style="font-size:11px;color:var(--t3)">· ${s.code} · ${s.ciudad||CX.paisName(s.pais)} · ⭐${(s.rating||0).toFixed?s.rating.toFixed(1):s.rating||'—'}</span></div>`).join(''):`<div style="padding:14px;font-size:12px;color:var(--t3)">Sin shoppers elegibles con estos filtros.${excluded.length?' · '+excluded.length+' excluido(s) por país/proyecto/alcance/perfil.':''}</div>`;
          ov.querySelectorAll('.rsRow').forEach(r=>r.addEventListener('click',()=>{sel=r.dataset.id;ov.querySelector('#rsOk').disabled=false;draw();}));
        };
        ov.querySelector('#rsFind').addEventListener('input',draw); ov.querySelector('#rsPais').addEventListener('change',draw); ov.querySelector('#rsCert').addEventListener('change',draw); draw();
        ov.querySelector('#rsOk').addEventListener('click',async()=>{if(!sel)return;if(!CX.permissions.gate('visit.reassign',{projectId:x.rootProjectId||x.projectId,pais:x.pais},ui))return;
          const mode=modeOf(),btn=ov.querySelector('#rsOk');let scheduledDate=null,franjaCode=null,fechaMsg='';
          if(mode==='keep')fechaMsg='fecha conservada ('+curFecha+')';
          else if(mode==='change'){scheduledDate=ov.querySelector('#rsNewF').value;if(!scheduledDate){ui.toast('Elige la nueva fecha','warn');return;}franjaCode=ov.querySelector('#rsNewFr').value;fechaMsg='fecha cambiada a '+scheduledDate;}
          else fechaMsg='pendiente de agendamiento';
          btn.disabled=true;btn.textContent='Confirmando…';let r=null;
          try{r=await data.assignVisit(x.visitaId,sel,{ackAware:true,reassign:true,scheduleDecision:mode,scheduledDate,franjaCode,assignmentSource:'platform',reason:'admin_visit_reassign'});}catch(_){r=null;}
          const ok=r&&r.ok===true&&r.status==='committed'&&r.providerAck===true&&r.successUiAllowed===true;
          if(!ok){btn.disabled=false;btn.textContent='Reasignar';ui.toast('Reasignación no ejecutada: no fue posible confirmar el cambio.','warn',4200);return;}
          const ns=data.getShopper&&data.getShopper(sel);try{window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('postulations_write_committed',true);}catch(_){}close();
          CX.notif&&CX.notif.push({to:'admin',tipo:'reasig',icon:'🔁',tono:'a',titulo:'Visita reasignada',txt:x.sucursal+' → '+(ns?.nombre||'shopper')+' · '+fechaMsg,nav:'postulaciones'});
          ui.toast('Reasignación guardada correctamente · '+fechaMsg,'ok',4200);
        }); }});
    }));

    /* cancelar: la visita vuelve a disponible */
    document.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',()=>{ const x=posts.find(z=>z.id===b.dataset.cancel); if(!x)return;
      ui.modal('Cancelar visita · '+x.sucursal,`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">La visita de <b>${x.shopper}</b> volverá a <b>disponible</b> y el shopper será notificado.</p>
        <label class="lbl">Motivo</label><textarea class="inp" id="cnM" rows="2" placeholder="Motivo de la cancelación…" style="margin-bottom:14px"></textarea>
        <div style="text-align:right"><button class="btn btn-sm" style="background:var(--red-bg);color:var(--red)" id="cnOk">Confirmar cancelación</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#cnOk').addEventListener('click',async()=>{if(!CX.permissions.gate('visit.cancel',{projectId:x.rootProjectId||x.projectId,pais:x.pais},ui))return;const btn=ov.querySelector('#cnOk'),reason=(ov.querySelector('#cnM').value||'').trim();btn.disabled=true;btn.textContent='Confirmando…';let r=null;try{r=await data.requestVisitCancel(x.visitaId,{ackAware:true,releaseToAvailable:true,reason:reason||'admin_cancel_release'});}catch(_){r=null;}const ok=r&&r.ok===true&&r.status==='committed'&&r.providerAck===true&&r.successUiAllowed===true;if(!ok){btn.disabled=false;btn.textContent='Confirmar cancelación';ui.toast('Cancelación no ejecutada: no fue posible confirmar el cambio.','warn',4200);return;}try{window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('postulations_write_committed',true);}catch(_){}CX.notif&&CX.notif.push({to:'shopper',tipo:'cancel',icon:'❌',tono:'r',titulo:'Visita cancelada',txt:x.sucursal+' · puedes postularte a otras',nav:'misvisitas'});close();ui.toast('Visita liberada y guardada correctamente','ok',3600);});}});
    }));

    /* asignar visita manual — con búsqueda y opción de crear shopper en el momento */
    const am=document.getElementById('asignManual');
    const shr=document.getElementById('syncHR');
    if(shr)shr.addEventListener('click',async()=>{shr.disabled=true;shr.textContent='Actualizando HR…';try{const before=String(CX.data?.previewMeta?.sourceRevision||'');const result=await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY?.('admin_postulations_manual_hr_refresh');const after=String(CX.data?.previewMeta?.sourceRevision||'');if(!result?.ok)throw new Error(result?.error||result?.reason||'No fue posible leer la HR viva');ui.toast('HR viva actualizada'+(after&&after!==before?' · revisión nueva confirmada':''),'ok',3600);CX.router.nav('postulaciones');}catch(error){ui.toast('No se pudo actualizar HR · '+String(error?.message||error),'err',5200);}finally{shr.disabled=false;shr.textContent='🔄 Sincronizar HR';}});
    if(am)am.addEventListener('click',()=>{
      const projName=(id)=>{const pr=data.projects.find(x=>x.id===id);return pr?pr.name:'';};
      const disp=data.visitas().filter(v=>{const f=data.visitFacets?data.visitFacets(v):null;return f?f.available===true&&f.assigned!==true&&f.cancelled!==true:(v.estado==='disponible'&&!v.shopperId);});
      const cands=data.shoppersFor();
      ui.modal('Asignar visita manual',`
        <p style="font-size:12px;color:var(--t2);margin-bottom:12px">Busca la visita y el shopper (no tienes que recorrer toda la lista). Si el shopper no existe, créalo aquí mismo.</p>
        <label class="lbl">Visita disponible</label>
        <input class="inp" id="amVQ" placeholder="🔎 Buscar sucursal, ciudad, proyecto…" style="margin-bottom:6px">
        <select class="sel" id="amV" size="5" style="margin-bottom:12px;height:auto">${disp.length?disp.map(v=>`<option value="${v.id}" data-t="${(v.sucursal+' '+v.ciudad+' '+projName(v.projectId)+' '+v.quincena).toLowerCase()}">${v.sucursal} · ${v.ciudad} · ${projName(v.projectId)} · ${v.quincena}</option>`).join(''):'<option value="">— no hay disponibles —</option>'}</select>

        <div class="between" style="margin-bottom:6px"><label class="lbl" style="margin:0">Shopper</label><label class="flex" style="gap:6px;font-size:11.5px;color:var(--t2);cursor:pointer"><input type="checkbox" id="amNew"> ✚ Crear nuevo</label></div>
        <div id="amExist">
          <input class="inp" id="amSQ" placeholder="🔎 Buscar shopper o código…" style="margin-bottom:6px">
          <select class="sel" id="amS" size="5" style="height:auto">${cands.map(s=>`<option value="${s.id}" data-t="${(s.nombre+' '+s.code+' '+(s.ciudad||'')).toLowerCase()}">${s.nombre} · ${s.code} · ${s.ciudad||CX.paisName(s.pais)}</option>`).join('')}</select>
        </div>
        <div id="amCreate" style="display:none">
          <div class="grid g2" style="gap:8px 10px"><div><label class="lbl">Nombre</label><input class="inp" id="amF"></div><div><label class="lbl">Apellido</label><input class="inp" id="amL"></div></div>
          <label class="lbl" style="margin-top:8px">WhatsApp</label><input class="inp" id="amW" placeholder="+502 ...">
          <div style="background:var(--amber-bg);border-radius:9px;padding:8px 11px;font-size:11px;color:#8a5b00;margin-top:8px">Se crea con perfil <b>incompleto</b>; al ingresar se le pedirá (en notificaciones y Mi Día) completar sus datos.</div>
        </div>
        <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="amOk" ${disp.length?'':'disabled'}>Asignar</button></div>
      `,{onMount:(ov,close)=>{
        const filt=(q,sel)=>{const v=(q.value||'').toLowerCase();ov.querySelectorAll('#'+sel+' option').forEach(o=>{o.style.display=(!v||(o.dataset.t||'').includes(v))?'':'none';});};
        ov.querySelector('#amVQ').addEventListener('input',e=>filt(e.target,'amV'));
        ov.querySelector('#amSQ').addEventListener('input',e=>filt(e.target,'amS'));
        const nw=ov.querySelector('#amNew');
        nw.addEventListener('change',()=>{ov.querySelector('#amExist').style.display=nw.checked?'none':'';ov.querySelector('#amCreate').style.display=nw.checked?'':'none';});
        ov.querySelector('#amOk').addEventListener('click',async()=>{
          const btn=ov.querySelector('#amOk'),vid=ov.querySelector('#amV').value;if(!vid){ui.toast('Elige una visita','warn');return;}btn.disabled=true;btn.textContent='Asignando…';let sid=null,s=null;
          try{
            if(nw.checked){const f=(ov.querySelector('#amF').value||'').trim(),l=(ov.querySelector('#amL').value||'').trim(),w=(ov.querySelector('#amW').value||'').trim();if(!f||!l||!w)throw new Error('Nombre, apellido y WhatsApp son obligatorios');const created=await data.addShopper({via:'asignacion_manual',createdVia:'manual',firstName:f,lastName:l,nombre:(f+' '+l).trim(),whatsapp:w,perfilCompleto:false,sourceType:'platform',__commandMeta:{ackAware:true,reason:'postulations-manual-assignment-create-shopper'}});if(!(created&&created.ok===true&&created.status==='committed'&&created.providerAck===true))throw new Error(created?.code||'Shopper no confirmado');sid=created.entityId;s=data.getShopper?.(sid)||{id:sid,nombre:(f+' '+l).trim()};}
            else{sid=ov.querySelector('#amS').value;s=data.getShopper(sid);}if(!sid)throw new Error('Selecciona un shopper');
            const assigned=await data.assignVisit(vid,sid,{ackAware:true,assignmentSource:'platform',reason:'postulations-manual-assignment'});if(!(assigned&&assigned.ok===true&&assigned.status==='committed'&&assigned.providerAck===true&&assigned.successUiAllowed===true))throw new Error(assigned?.code||'Asignación no confirmada');
            close();ui.toast('Asignación guardada y confirmada'+(s?.nombre?' · '+s.nombre:''),'ok',3600);try{window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('postulations_write_committed',true);}catch(_){}CX.router.nav('postulaciones');
          }catch(error){ui.toast('No se aplicó la asignación · '+String(error?.message||error),'err',5200);btn.disabled=false;btn.textContent='Asignar';}
        });
      }});
    });
    const reqBtn=document.getElementById('reqShopper');
    if(reqBtn)reqBtn.addEventListener('click',()=>CX.adminPostulacionesActions.openRequest({data,ui}));
    document.getElementById('openAgenda')?.addEventListener('click',()=>CX.adminPostulacionesActions.openAgenda({data,ui}));
  },0);
  return html;
});