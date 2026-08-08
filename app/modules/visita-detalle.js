/* CXOrbia · Ficha de visita + flujo de postulación (shopper)
   Adaptable por proyecto: escenario, restricción, canal, combo, honorario,
   y propuesta de fecha con validación de franja/disponibilidad. */
window.CX = window.CX || {};

CX.shopperVisitDetail = function(data, p, v, ui){
  if(!v) return;
  /* P0-1: available solo es canónico cuando visitFacets() lo expone como boolean explícito.
     Sin ese contrato, preserva el criterio anterior (v.estado==='disponible'). */
  const f = typeof data.visitFacets==='function' ? data.visitFacets(v) : null;
  const hasCanonicalAvailability = !!f && typeof f.available === 'boolean';
  const canApply = hasCanonicalAvailability ? (f.available===true && f.eligibilityBlocked!==true) : v.estado==='disponible';
  /* P0-1 (V160) / Ajuste A (V161): franja comercial única — WK/RH WK → Lunes a viernes; WKND/RH
     WKND → Sábado o domingo; P1Q, valores desconocidos o códigos no reconocidos ('other') →
     Pendiente de validación. Nunca "feriado", nunca el valor crudo de una categoría 'other'.
     Colapsa espacios internos antes de comparar. Normaliza sobre franjaCode y, si no existe,
     sobre v.franja; acepta texto ya comercial. Nunca expone los códigos crudos. */
  const franjaCategory=(vv)=>{
    const raw=(vv.franjaCode!=null?vv.franjaCode:vv.franja);
    const t=String(raw||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(!t) return 'pending';
    if(t==='WK'||t==='RH WK') return 'weekday';
    if(t==='WKND'||t==='RH WKND') return 'weekend';
    if(t==='P1Q') return 'pending';
    if(t==='SEMANA'||t==='LUNES A VIERNES') return 'weekday';
    if(t==='FIN DE SEMANA'||t==='SÁBADO O DOMINGO'||t==='SABADO O DOMINGO') return 'weekend';
    return 'other';
  };
  const franjaLabelOf=(vv)=>{
    const cat=franjaCategory(vv);
    if(cat==='weekday') return 'Lunes a viernes';
    if(cat==='weekend') return 'Sábado o domingo';
    return 'Pendiente de validación';
  };
  const franjaLabel = franjaLabelOf(v);
  const field=(l,val)=>`<div style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:10px 13px">
    <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t3);margin-bottom:3px">${l}</div>
    <div style="font-size:13.5px;font-weight:700;color:var(--t1)">${val}</div></div>`;
  const honor=`${v.currency} ${v.honorario}`+(v.combo?' + combo':'')+(v.boleto?' + boleto':'');

  ui.modal(`${v.sucursal}<div style="font-size:12px;font-weight:500;color:var(--t3);margin-top:2px">📍 ${v.ciudad}, ${v.pais}</div>`, `
    <div class="ai-box" style="margin-bottom:14px"><div class="ai-l">RESUMEN DEL PROYECTO / ESCENARIO</div>
      <p>${p.conocimiento||p.industry}. Escenario: <b>${v.escenario}</b>.</p></div>
    <div class="grid g2" style="gap:10px;margin-bottom:12px">
      ${field('Proyecto',data.programBase?data.programBase(p):p.name)}${field('Ronda',p.ronda||'—')}
      ${field('Formato',v.formato||p.formato||'—')}${field('Quincena',v.quincena)}
      ${field('Franja',franjaLabel)}${field('Canal',v.canal||'—')}
    </div>
    ${v.combo?`<div style="background:var(--amber-bg);border-radius:11px;padding:11px 14px;margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:var(--amber)">🍿 TIPO DE COMBO / REEMBOLSO</div><div style="font-size:13px;color:var(--t1);margin-top:2px">${v.combo}</div></div>`:''}
    <div style="background:var(--green-bg);border-radius:11px;padding:11px 14px;margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:var(--green)">💲 HONORARIO</div>
      <div style="font-size:16px;font-weight:800;color:var(--green);font-family:var(--disp)">${honor}</div>
      <div style="font-size:11px;color:var(--t3)">Honorario${v.combo?' + combo':''}${v.boleto?' + boleto':''} reembolsados según programa.</div></div>
    ${(v.estado==='fuera_rango')?`<div style="border:1px solid var(--border);border-radius:11px;padding:11px 14px;margin-bottom:10px;font-size:12.5px;color:var(--red)">⚠️ Esta visita está fuera de rango${v.frMotivo?' · '+v.frMotivo:''}${v.frResponsable&&v.frResponsable!=='shopper'?' · no penaliza tu historial':''}</div>`:''}
    ${p.restriccion?`<div style="background:var(--amber-bg);border-radius:11px;padding:10px 13px;margin-bottom:10px;font-size:12.5px;color:#8a5b00">⚠️ ${p.restriccion}</div>`:''}
    ${!canApply?`<div style="background:var(--amber-bg);border-radius:11px;padding:10px 13px;margin-bottom:10px;font-size:12.5px;color:#8a5b00">⏳ Esta oportunidad todavía no ha sido habilitada para postulación.</div>`:''}
    <div style="background:var(--brand-light);border-radius:11px;padding:10px 13px;margin-bottom:14px;font-size:12px;color:var(--brand-dark)">📄 El instructivo completo lo recibirás ${CX.BRAND.clientName?'por WhatsApp':'en la plataforma'} al ser aprobada, y estará disponible en la sección Documentos del proyecto.</div>
    <div class="flex" style="gap:10px"><button class="btn btn-green" id="goPost" style="flex:1;justify-content:center" ${canApply?'':'disabled'}>📩 Postularme</button><button class="btn btn-ghost" data-x2>Cerrar</button></div>
  `, {onMount:(ov,close)=>{
    ov.querySelector('[data-x2]').addEventListener('click',close);
    const gp=ov.querySelector('#goPost');
    if(canApply) gp.addEventListener('click',()=>{close();CX.shopperPostForm(data,p,v,ui);});
    else gp.addEventListener('click',()=>ui.toast('Esta oportunidad todavía no ha sido habilitada','warn'));
  }});
};

CX.shopperPostForm = function(data, p, v, ui){
  /* P0-1 (V160) / Ajuste A (V161): misma normalización de franja que la ficha — ver comentario en
     shopperVisitDetail. */
  const franjaCategory=(vv)=>{
    const raw=(vv.franjaCode!=null?vv.franjaCode:vv.franja);
    const t=String(raw||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(!t) return 'pending';
    if(t==='WK'||t==='RH WK') return 'weekday';
    if(t==='WKND'||t==='RH WKND') return 'weekend';
    if(t==='P1Q') return 'pending';
    if(t==='SEMANA'||t==='LUNES A VIERNES') return 'weekday';
    if(t==='FIN DE SEMANA'||t==='SÁBADO O DOMINGO'||t==='SABADO O DOMINGO') return 'weekend';
    return 'other';
  };
  const franjaLabelOf=(vv)=>{
    const cat=franjaCategory(vv);
    if(cat==='weekday') return 'Lunes a viernes';
    if(cat==='weekend') return 'Sábado o domingo';
    return 'Pendiente de validación';
  };
  const franjaCat = franjaCategory(v);
  const franjaLabel = franjaLabelOf(v);
  const REASON_TEXT = {
    visit_already_assigned:'Esta visita ya fue asignada.',
    blocked_previous_measurement_window:'Esta oportunidad depende de completar o validar la ventana anterior.',
    blocked_missing_availability:'Esta oportunidad todavía no ha sido habilitada.',
    available_from_missing_or_invalid:'La fecha de disponibilidad está pendiente de validación.',
    before_available_from:'Selecciona una fecha igual o posterior a la habilitación.',
    before_measurement_window:'La fecha está antes del periodo de medición.',
    after_measurement_window:'La fecha está después del periodo de medición.',
    requires_weekend:'Esta visita debe realizarse sábado o domingo.',
    requires_weekday:'Esta visita debe realizarse de lunes a viernes.',
    proposed_date_invalid:'Selecciona una fecha válida.',
    franja_pending_validation:'La franja de esta oportunidad está pendiente de validación.',
  };
  const isIso=s=>/^20\d{2}-[01]\d-[0-3]\d$/.test(String(s||''));
  /* Contrato real (postulationEligibility) cuando el adapter lo inyecta. Sin adapter, se
     mantiene un fallback mínimo equivalente a la validación previa de este mismo formulario —
     nunca una regla de negocio nueva, solo continuidad mientras no hay contrato disponible. */
  const runEligibility=(dateVal)=>{
    if(typeof data.postulationEligibility==='function') return data.postulationEligibility(v,dateVal);
    const reasons=[];
    if(!isIso(dateVal)) reasons.push('proposed_date_invalid');
    else{
      if(!isIso(v.disponibleDesde)) reasons.push('available_from_missing_or_invalid');
      else if(dateVal<v.disponibleDesde) reasons.push('before_available_from');
      /* P0-3 (V161): el fallback ignoraba measurementWindowStart/End — aceptaba fechas fuera de la
         ventana de medición. Rechaza antes/después de la ventana SOLO cuando esos campos existen
         (nunca se inventa una ventana ausente). */
      if(isIso(v.measurementWindowStart) && dateVal<v.measurementWindowStart) reasons.push('before_measurement_window');
      if(isIso(v.measurementWindowEnd) && dateVal>v.measurementWindowEnd) reasons.push('after_measurement_window');
      const day=new Date(dateVal+'T12:00:00Z').getUTCDay(), weekend=(day===0||day===6);
      /* P0-4 (V161): P1Q o franja desconocida ('pending'/'other') ya NO se validan como correctas —
         producen franja_pending_validation en vez de ok:true silencioso. */
      if(franjaCat==='weekend'&&!weekend) reasons.push('requires_weekend');
      if(franjaCat==='weekday'&&weekend) reasons.push('requires_weekday');
      if(franjaCat==='pending'||franjaCat==='other') reasons.push('franja_pending_validation');
    }
    return {ok:reasons.length===0,reasons};
  };
  const dispValida = isIso(v.disponibleDesde);
  const franjaHelp = franjaCat==='weekend' ? 'fin de semana = sábado y domingo' : franjaCat==='weekday' ? 'semana = lunes a viernes' : 'franja pendiente de validación';
  ui.modal('📩 Enviar postulación', `
    <div style="background:var(--amber-bg);border-radius:10px;padding:10px 13px;margin-bottom:12px;font-size:12px;color:#8a5b00">${p.restriccion||'Confirma que cumples los requisitos del proyecto.'}</div>
    <div class="grid g2" style="gap:10px;margin-bottom:14px">
      <div style="background:var(--green-bg);border-radius:11px;padding:11px 13px"><div style="font-size:9.5px;font-weight:700;text-transform:uppercase;color:var(--t3)">Disponible a partir de</div>
        <div style="font-size:15px;font-weight:800;color:var(--green);font-family:var(--disp)">${dispValida?v.disponibleDesde:'Pendiente de validación'}</div>
        <div style="font-size:10.5px;color:var(--t3)">Tu visita puede realizarse desde esta fecha</div></div>
      <div style="background:var(--brand-light);border-radius:11px;padding:11px 13px"><div style="font-size:9.5px;font-weight:700;text-transform:uppercase;color:var(--t3)">Franja requerida</div>
        <div style="font-size:15px;font-weight:800;color:var(--brand-dark);font-family:var(--disp)">${franjaLabel}</div>
        <div style="font-size:10.5px;color:var(--t3)">Canal: ${v.canal||'—'}${v.measurementWindowLabel?' · Ventana: '+v.measurementWindowLabel:''}</div></div>
    </div>
    <div style="background:var(--amber-bg);border-radius:10px;padding:9px 12px;margin-bottom:14px;font-size:12px;color:#8a5b00">🗓️ Al postularte propones la fecha; el equipo la <b>autoriza y gestiona</b> desde Gestión de Postulaciones.</div>
    <label class="lbl">Fecha propuesta *</label>
    <input class="inp" id="postDate" type="date" ${dispValida?`value="${v.disponibleDesde}" min="${v.disponibleDesde}"`:''} style="margin-bottom:6px">
    <div id="dateErr" style="font-size:11.5px;color:var(--red);margin-bottom:10px;display:none"></div>
    <div style="font-size:11px;color:var(--t3);margin-bottom:14px">Debe ser posterior a "Disponible a partir de" y en la franja correcta (${franjaHelp}).</div>
    <label class="lbl">¿Visitaste esta sucursal recientemente?</label>
    <select class="sel" id="postRecent" style="margin-bottom:12px"><option>No / hace más de 2 meses</option><option>Sí, en los últimos 2 meses</option></select>
    <label class="lbl">Nota (opcional)</label>
    <textarea class="inp" id="postNote" rows="2" placeholder="Disponibilidad, comentarios…" style="margin-bottom:12px"></textarea>
    <label class="flex" style="gap:8px;font-size:12.5px;color:var(--t2);margin-bottom:16px"><input type="checkbox" id="postOk"> Confirmo que cumplo los requisitos del proyecto.</label>
    <div class="flex" style="gap:10px"><button class="btn btn-green" id="postSend" style="flex:1;justify-content:center">📩 Enviar postulación</button><button class="btn btn-ghost" data-x3>Cancelar</button></div>
  `, {onMount:(ov,close)=>{
    ov.querySelector('[data-x3]').addEventListener('click',close);
    const di=ov.querySelector('#postDate'), err=ov.querySelector('#dateErr');
    const showResult=(result)=>{
      if(result.ok){ err.style.display='none'; return true; }
      const msgs=result.reasons.map(r=>REASON_TEXT[r]||'Esta fecha no es válida para esta oportunidad.');
      err.textContent=[...new Set(msgs)].join(' ');
      err.style.display='block';
      return false;
    };
    const validate=()=>showResult(runEligibility(di.value));
    di.addEventListener('change',validate);
    ov.querySelector('#postSend').addEventListener('click',()=>{
      if(!ov.querySelector('#postOk').checked){ui.toast('Confirma los requisitos para continuar','warn');return;}
      if(ov.querySelector('#postRecent').selectedIndex===1){ui.toast('No cumples la restricción de recencia para esta sucursal','err');return;}
      if(!validate())return;
      close(); ui.toast('Postulación validada · pendiente de envío operativo.','ok');
    });
  }});
};
