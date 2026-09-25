/* ============================================================
   CXOrbia · Reservas de visita (genérico, cualquier programa por periodo)
   Flujo: el cliente envía escenarios cada periodo → el equipo carga sucursales →
   los shoppers RESERVAN/solicitan las sucursales que les interesan para un periodo →
   el equipo asigna (sucursal + periodo + shopper) → al PUBLICAR la visita,
   se CRUZA la reserva con la asignación: si el shopper que reservó es el asignado,
   la visita nace ya postulada/asignada a él (sin duplicar el proceso).
   ============================================================ */
window.CX = window.CX || {};

CX.reservas = {
  _key(pid){ return pid || CX.data.currentPeriodId; },
  _source(){ return Array.isArray(CX.data&&CX.data.__protectedReservations)?CX.data.__protectedReservations:[]; },
  _periodKey(){
    const p=CX.data&&typeof CX.data.period==='function'?CX.data.period():null;
    return p&&(p.periodKey||p.measurementPeriodId||p.measurementWindowId||p.periodo||p.ronda)||null;
  },
  _committed(result){ return !!(result&&result.ok===true&&result.status==='committed'&&result.providerAck===true&&result.successUiAllowed===true); },
  _normalize(r){ return Object.assign({},r,{id:r.id||r.reservationId,reservationId:r.reservationId||r.id,estado:r.estado||r.status,status:r.status||r.estado}); },

  list(pid){
    const periodId=String(this._key(pid)||''),projectId=String(CX.data.currentProjectId||'');
    return this._source().filter(r=>String(r.periodId||'')===periodId&&(!r.projectId||String(r.projectId)===projectId)).map(r=>this._normalize(r));
  },

  sucursales(pid){
    const periodId=String(this._key(pid)||''),map={};
    const role=CX.session&&CX.session.role;
    (CX.data._visitas||[]).filter(v=>{
      const rowPeriod=String(CX.data.recordPeriodId?CX.data.recordPeriodId(v):(v.periodId||v.projectId)||'');
      if(rowPeriod!==periodId)return false;
      if(role==='shopper'&&CX.data.inScope&&!CX.data.inScope(v.pais))return false;
      const f=CX.data.visitFacets?CX.data.visitFacets(v):(v.canonicalFacets||{});
      return f.available===true&&f.assigned!==true&&f.cancelled!==true;
    }).forEach(v=>{
      const id=(v.sucursal+'|'+v.ciudad).toLowerCase().replace(/\s+/g,'-');
      if(!map[id])map[id]={id,sucursal:v.sucursal,ciudad:v.ciudad,pais:v.pais};
    });
    return Object.values(map);
  },

  periodoActual(){ return this._periodKey(); },

  async reservar(pid,rec){
    pid=this._key(pid);rec=rec||{};
    const current=this.periodoActual();
    if(!current||String(rec.periodo||'')!==String(current))throw new Error('RESERVATION_PERIOD_NOT_PUBLISHED');
    const existing=this.list(pid).find(r=>r.sucursalId===rec.sucursalId&&String(r.periodo||'')===String(rec.periodo||'')&&String(r.shopperId||'')===String(rec.shopperId||''));
    if(existing)return {dup:true,r:existing};
    if(!CX.data||typeof CX.data.createReservation!=='function')throw new Error('RESERVATION_PROVIDER_COMMAND_UNAVAILABLE');
    const payload=Object.assign({estado:rec.estado||'solicitada',status:rec.status||rec.estado||'solicitada'},rec);
    const result=await CX.data.createReservation(payload,{ackAware:true,reason:'reservation-create-provider-backed'});
    if(!this._committed(result)){
      if(String(result&&result.code||'').includes('ALREADY_EXISTS'))return {dup:true};
      throw new Error(String(result&&result.code||'RESERVATION_NOT_COMMITTED'));
    }
    CX.bus&&CX.bus.emit('reservas');
    return {ok:true,providerAck:true,entityId:result.entityId||null,r:Object.assign({},payload,{id:result.entityId||null})};
  },

  async setEstado(pid,id,estado,extra){
    pid=this._key(pid);extra=extra||{};
    if(!CX.data||typeof CX.data.setReservationStatus!=='function')throw new Error('RESERVATION_PROVIDER_COMMAND_UNAVAILABLE');
    const result=await CX.data.setReservationStatus(id,estado,extra,{ackAware:true,reason:'reservation-status-provider-backed'});
    if(!this._committed(result))throw new Error(String(result&&result.code||'RESERVATION_STATUS_NOT_COMMITTED'));
    CX.bus&&CX.bus.emit('reservas');
    return Object.assign({},result,{estado,status:estado});
  },

  async remove(pid,id){
    pid=this._key(pid);
    if(!CX.data||typeof CX.data.deleteReservation!=='function')throw new Error('RESERVATION_PROVIDER_COMMAND_UNAVAILABLE');
    const result=await CX.data.deleteReservation(id,{ackAware:true,reason:'reservation-delete-provider-backed'});
    if(!this._committed(result))throw new Error(String(result&&result.code||'RESERVATION_DELETE_NOT_COMMITTED'));
    CX.bus&&CX.bus.emit('reservas');
    return result;
  },

  async cruzar(pid,periodo){
    pid=this._key(pid);
    const current=this.periodoActual();
    if(!current||String(periodo||'')!==String(current))throw new Error('RESERVATION_PERIOD_NOT_PUBLISHED');
    const reservas=this.list(pid).filter(r=>String(r.periodo||'')===String(periodo)&&['asignada','aprobada'].includes(r.estado));
    let cruzadas=0;
    for(const r of reservas){
      const v=(CX.data._visitas||[]).find(v=>{
        const rowPeriod=String(CX.data.recordPeriodId?CX.data.recordPeriodId(v):(v.periodId||v.projectId)||'');
        const f=CX.data.visitFacets?CX.data.visitFacets(v):(v.canonicalFacets||{});
        return rowPeriod===String(pid)&&(v.sucursal+'|'+v.ciudad).toLowerCase().replace(/\s+/g,'-')===r.sucursalId&&f.available===true&&f.assigned!==true;
      });
      if(!v||!r.shopperId)continue;
      const result=await this.setEstado(pid,r.id,'aprobada',{visitId:v.id||v.visitId,shopperId:r.shopperId,shopper:r.shopper});
      if(this._committed(result))cruzadas++;
    }
    return {cruzadas,providerAck:true};
  },

  resumen(pid){ const L=this.list(pid); return {
    total:L.length,
    solicitadas:L.filter(r=>r.estado==='solicitada').length,
    asignadas:L.filter(r=>['asignada','aprobada'].includes(r.estado)).length,
    cruzadas:L.filter(r=>r.estado==='cruzada').length,
  }; },
};

/* ============== Módulo: Reservas de Visita (admin + shopper) ============== */
CX.module('reservas', ({data,role,ui})=>{
  const p=data.period(), pid=p.id;
  const host=ui.el('div');
  const ESTLBL={solicitada:'Solicitada',asignada:'Asignada',aprobada:'Aprobada',cruzada:'✓ Cruzada con visita',rechazada:'Rechazada'};
  const ESTTONE={solicitada:'a',asignada:'b',aprobada:'g',cruzada:'g',rechazada:'r'};
  /* P0 (V172): identidad fail-closed — sin shopperId verificable no hay sid; nunca 'sh1'. */
  const sid=()=> (CX.session.user&&CX.session.user.shopperId)||null;
  const shopperIdentityOk=()=>!!sid();

  const periodos=()=>{ const s=new Set(); const current=CX.reservas.periodoActual(); if(current)s.add(current); CX.reservas.list(pid).forEach(r=>{if(r.periodo)s.add(r.periodo);}); return [...s].sort().reverse(); };
  let per=CX.reservas.periodoActual();

  const draw=()=>{
    const all=CX.reservas.list(pid).filter(r=>r.periodo===per);
    const mine=all.filter(r=>r.shopperId===sid());
    const R=CX.reservas.resumen(pid);

    if(role==='shopper'){
      if(!shopperIdentityOk()){
        host.innerHTML=`${ui.ph('Reservar Visitas', p.name)}<div class="card card-p" style="border-left:3px solid var(--red)"><div class="flex" style="gap:8px;align-items:center;margin-bottom:6px"><span style="font-size:20px">🔒</span><b>Identidad de evaluador no verificable</b></div><div style="font-size:12.5px;color:var(--t2)">Sin un <code>shopperId</code> verificable no se muestran, crean, aprueban ni cancelan reservas. Inicia sesión con una identidad real.</div></div>`;
        return;
      }
      const sucs=CX.reservas.sucursales(pid);
      host.innerHTML=`
        ${ui.ph('Reservar Visitas', p.name+' · pide las sucursales que quieres evaluar este periodo')}
        <div class="flex wrap" style="gap:8px;margin-bottom:14px">
          <select class="sel" id="rPer" style="width:auto">${periodos().map(x=>`<option ${x===per?'selected':''}>${x}</option>`).join('')}</select>
          <button class="btn btn-pr btn-sm" id="rNew">🙋 Solicitar sucursal</button>
        </div>
        <div class="grid g3" style="margin-bottom:16px">
          <div>${ui.kpi('Mis solicitudes',mine.length,'b')}</div>
          <div>${ui.kpi('Asignadas a mí',mine.filter(r=>['asignada','aprobada','cruzada'].includes(r.estado)).length,'g')}</div>
          <div>${ui.kpi('Cruzadas (ya es visita)',mine.filter(r=>r.estado==='cruzada').length,'p')}</div>
        </div>
        <div class="card card-p">
          <div class="card-h"><div class="card-t">Mis solicitudes · ${per}</div></div>
          ${mine.length?`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Sucursal</th><th>Ciudad</th><th>Estado</th><th></th></tr></thead><tbody>
            ${mine.map(r=>`<tr><td><b>${r.sucursal}</b></td><td style="font-size:12px">${CX.paisFlag(r.pais)} ${r.ciudad}</td><td>${ui.bdg(ESTLBL[r.estado],ESTTONE[r.estado])}</td>
              <td style="text-align:right">${r.estado==='solicitada'?`<button class="btn btn-ghost btn-sm" data-del="${r.id}" style="color:var(--red)">Cancelar</button>`:r.estado==='cruzada'?`<button class="btn btn-soft btn-sm" data-go="${r.visitaId}">Ver en Mis Visitas →</button>`:''}</td></tr>`).join('')}
          </tbody></table></div>`:ui.empty('🙋','Aún no has solicitado sucursales este periodo. Usa "Solicitar sucursal".')}
          <div style="margin-top:12px">${ui.aiBox('Reserva las sucursales que quieres evaluar. El equipo confirma la asignación y, cuando publica las visitas del periodo, tu solicitud se cruza automáticamente: la visita nace ya asignada a ti sin volver a postularte.','Reserva con anticipación')}</div>
        </div>`;
      host.querySelector('#rPer').addEventListener('change',e=>{per=e.target.value;draw();});
      host.querySelector('#rNew').addEventListener('click',()=>{
        ui.modal('Solicitar sucursal · '+per,`
          <label class="lbl">Sucursal</label>
          <select class="sel" id="rsSuc" style="margin-bottom:10px">${sucs.map(s=>`<option value="${s.id}">${s.sucursal} · ${s.ciudad}</option>`).join('')}</select>
          <label class="lbl">Periodo</label><select class="sel" id="rsPer" style="margin-bottom:14px">${periodos().map(x=>`<option ${x===per?'selected':''}>${x}</option>`).join('')}</select>
          <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rsOk">Enviar solicitud</button></div>
        `,{onMount:(ov,close)=>ov.querySelector('#rsOk').addEventListener('click',async()=>{
          const branch=sucs.find(x=>x.id===ov.querySelector('#rsSuc').value);
          const u=CX.session.user||{};
          try{
            const result=await CX.reservas.reservar(pid,{sucursalId:branch.id,sucursal:branch.sucursal,ciudad:branch.ciudad,pais:branch.pais,periodo:ov.querySelector('#rsPer').value,shopperId:sid(),shopper:u.name||'Shopper'});
            close();
            if(result.dup){ui.toast('Ya solicitaste esa sucursal para ese periodo','warn');return;}
            ui.toast('Solicitud guardada y confirmada','ok');
            setTimeout(()=>location.reload(),180);
          }catch(_){ui.toast('No hubo ACK remoto; la solicitud no se declaró guardada','warn');}
        })});
      });
      host.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',async()=>{
        try{await CX.reservas.remove(pid,b.dataset.del);ui.toast('Solicitud cancelada y confirmada','ok');setTimeout(()=>location.reload(),180);}
        catch(_){ui.toast('No hubo confirmación del proveedor; la cancelación no se declaró aplicada','warn');}
      }));
      host.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('misvisitas')));
      return;
    }

    /* ---------- ADMIN ---------- */
    const sucs=CX.reservas.sucursales(pid);
    host.innerHTML=`
      <div class="between" style="margin-bottom:6px"><div>${ui.ph('Reservas & Asignación', p.name+' · cruza solicitudes de shoppers con la publicación de visitas')}</div>
        <div class="flex" style="gap:8px"><select class="sel" id="aPer" style="width:auto">${periodos().map(x=>`<option ${x===per?'selected':''}>${x}</option>`).join('')}</select>
        <button class="btn btn-green btn-sm" id="aCruzar">🔗 Publicar y cruzar (${R.asignadas})</button></div></div>
      <div class="grid g4" style="margin-bottom:16px" id="rKpis">
        <div data-rk="all" style="cursor:pointer">${ui.kpi('Solicitudes',all.length,'b')}</div>
        <div data-rk="solicitada" style="cursor:pointer">${ui.kpi('Por revisar',all.filter(r=>r.estado==='solicitada').length,'a')}</div>
        <div data-rk="asignada" style="cursor:pointer">${ui.kpi('Asignadas',all.filter(r=>['asignada','aprobada'].includes(r.estado)).length,'b')}</div>
        <div data-rk="cruzada" style="cursor:pointer">${ui.kpi('Cruzadas',all.filter(r=>r.estado==='cruzada').length,'g')}</div>
      </div>
      <div class="flex wrap" style="gap:8px;margin-bottom:14px">
        <button class="btn btn-pr btn-sm" id="aAsignar">＋ Asignar sucursal a shopper</button>
        <button class="btn btn-soft btn-sm" id="aEscenarios">⤒ Cargar escenarios del periodo</button>
      </div>
      <div class="card card-p">
        <div class="card-h"><div class="card-t">Solicitudes y asignaciones · ${per}</div><span class="muted" style="font-size:11px">cambia el estado o asigna el shopper definitivo</span></div>
        ${all.length?`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Sucursal</th><th>Ciudad</th><th>Shopper</th><th>Estado</th><th></th></tr></thead><tbody>
          ${all.map(r=>`<tr><td><b>${r.sucursal}</b></td><td style="font-size:12px">${CX.paisFlag(r.pais)} ${r.ciudad}</td>
            <td style="font-size:12px">${r.shopper||'<span class="muted">— sin shopper</span>'}</td>
            <td><select class="sel rEst" data-id="${r.id}" style="width:auto;padding:4px 8px;font-size:11.5px">${['solicitada','asignada','aprobada','rechazada'].concat(r.estado==='cruzada'?['cruzada']:[]).map(e=>`<option value="${e}" ${e===r.estado?'selected':''} ${e==='cruzada'?'disabled':''}>${ESTLBL[e]}</option>`).join('')}</select></td>
            <td style="text-align:right">${r.estado==='cruzada'?ui.bdg('✓ visita creada','g'):`<button class="btn btn-ghost btn-sm" data-rsh="${r.id}">Cambiar shopper</button>`}</td></tr>`).join('')}
        </tbody></table></div>`:ui.empty('🗂️','Sin solicitudes este periodo. Asigna sucursales o espera reservas de los shoppers.')}
        <div style="margin-top:12px">${ui.aiBox('Cada periodo cargas los escenarios que envía el cliente. Los shoppers van reservando sucursales; tú confirmas a quién asignas cada una. Al "Publicar y cruzar", las visitas del periodo nacen ya asignadas al shopper que las reservó — sin duplicar postulaciones.','Reserva ↔ asignación ↔ publicación')}</div>
      </div>`;

    host.querySelector('#aPer').addEventListener('change',e=>{per=e.target.value;draw();});
    host.querySelectorAll('.rEst').forEach(sel=>sel.addEventListener('change',async()=>{
      const newEst=sel.value;const reservation=CX.reservas.list(pid).find(x=>x.id===sel.dataset.id);
      try{
        let extra={};
        if(['asignada','aprobada'].includes(newEst)&&reservation?.shopperId){
          const visit=(data._visitas||[]).find(x=>x.projectId===data.currentProjectId&&x.periodId===data.currentPeriodId&&(x.sucursal+'|'+x.ciudad).toLowerCase().replace(/\s+/g,'-')===reservation.sucursalId&&(!x.shopperId||x.estado==='disponible'));
          if(visit)extra={visitId:visit.id||visit.visitId,shopperId:reservation.shopperId,shopper:reservation.shopper};
        }
        const saved=await CX.reservas.setEstado(pid,sel.dataset.id,newEst,extra);
        if(['aprobada','cruzada'].includes(String(newEst))){
          CX.notif&&CX.notif.push({to:'shopper',tipo:'reserva_aprobada',icon:'✅',tono:'g',titulo:'¡Tu reserva fue aprobada!',txt:'Sucursal: '+(reservation?.sucursal||'')+' · '+(reservation?.periodo||per)+'. Revisa tu visita en la plataforma.',nav:'misvisitas'});
        }
        ui.toast('Estado confirmado por el proveedor','ok');
        setTimeout(()=>location.reload(),180);
      }catch(_){draw();ui.toast('No hubo ACK remoto; no se declaró el cambio','warn');}
    }));
    host.querySelectorAll('[data-rsh]').forEach(b=>b.addEventListener('click',()=>{
      const reservation=CX.reservas.list(pid).find(x=>x.id===b.dataset.rsh),cands=data.shoppersFor();
      ui.modal('Asignar shopper · '+reservation.sucursal,`<select class="sel" id="rshSel" style="margin-bottom:14px">${cands.map(s=>`<option value="${s.id}">${s.nombre} · ${s.code}</option>`).join('')}</select>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rshOk">Asignar</button></div>`,
      {onMount:(ov,close)=>ov.querySelector('#rshOk').addEventListener('click',async()=>{
        const shopper=data.getShopper(ov.querySelector('#rshSel').value);
        try{await CX.reservas.setEstado(pid,reservation.id,'asignada',{shopperId:shopper.id,shopper:shopper.nombre});close();ui.toast('Shopper asignado y confirmado','ok');setTimeout(()=>location.reload(),180);}
        catch(_){ui.toast('No hubo confirmación del proveedor; la asignación no se declaró aplicada','warn');}
      })});
    }));
    host.querySelector('#aAsignar').addEventListener('click',()=>{
      const cands=data.shoppersFor();
      ui.modal('Asignar sucursal a shopper · '+per,`
        <label class="lbl">Sucursal</label><select class="sel" id="asSuc" style="margin-bottom:10px">${sucs.map(s=>`<option value="${s.id}">${s.sucursal} · ${s.ciudad}</option>`).join('')}</select>
        <label class="lbl">Shopper</label><select class="sel" id="asSh" style="margin-bottom:10px">${cands.map(s=>`<option value="${s.id}">${s.nombre} · ${s.code}</option>`).join('')}</select>
        <label class="lbl">Periodo</label><select class="sel" id="asPer" style="margin-bottom:14px">${periodos().map(x=>`<option ${x===per?'selected':''}>${x}</option>`).join('')}</select>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="asOk">Asignar</button></div>
      `,{onMount:(ov,close)=>ov.querySelector('#asOk').addEventListener('click',async()=>{
        const branch=sucs.find(x=>x.id===ov.querySelector('#asSuc').value),shopper=data.getShopper(ov.querySelector('#asSh').value);
        try{
          const result=await CX.reservas.reservar(pid,{sucursalId:branch.id,sucursal:branch.sucursal,ciudad:branch.ciudad,pais:branch.pais,periodo:ov.querySelector('#asPer').value,shopperId:shopper.id,shopper:shopper.nombre,estado:'asignada'});
          close();ui.toast(result.dup?'Ya existía esa asignación':'Sucursal asignada y confirmada a '+shopper.nombre,result.dup?'warn':'ok');if(!result.dup)setTimeout(()=>location.reload(),180);
        }catch(_){ui.toast('No hubo ACK remoto; la asignación no se declaró aplicada','warn');}
      })});
    });
    host.querySelector('#aEscenarios').addEventListener('click',()=>ui.toast('Los escenarios se administran desde la fuente configurada del proyecto. No se modificó ningún dato.','warn',3600));
    host.querySelector('#aCruzar').addEventListener('click',async()=>{
      try{
        const result=await CX.reservas.cruzar(pid,per);
        ui.toast(result.cruzadas?(result.cruzadas+' visita(s) cruzada(s) y confirmada(s)'):'No hay reservas asignadas para cruzar este periodo',result.cruzadas?'ok':'warn',4000);if(result.cruzadas)setTimeout(()=>location.reload(),180);
      }catch(_){ui.toast('No se completó el cruce; no se declaró ninguna asignación sin ACK','warn');}
    });
    const km={all:['Todas',()=>true],solicitada:['Por revisar',r=>r.estado==='solicitada'],asignada:['Asignadas',r=>['asignada','aprobada'].includes(r.estado)],cruzada:['Cruzadas',r=>r.estado==='cruzada']};
    host.querySelectorAll('#rKpis [data-rk]').forEach(el=>el.addEventListener('click',()=>{const d=km[el.dataset.rk];const L=all.filter(d[1]);
      ui.modal(d[0]+' ('+L.length+')',L.length?`<table class="tbl"><thead><tr><th>Sucursal</th><th>Shopper</th><th>Estado</th></tr></thead><tbody>${L.map(r=>`<tr><td><b>${r.sucursal}</b></td><td>${r.shopper||'—'}</td><td>${ui.bdg(ESTLBL[r.estado],ESTTONE[r.estado])}</td></tr>`).join('')}</tbody></table>`:ui.empty('🗂️','Sin registros.'));
    }));
  };

  draw();
  CX.bus.on('reservas',()=>draw());
  return host;
});
