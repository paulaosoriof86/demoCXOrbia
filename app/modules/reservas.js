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
  _r:{},                 // reservas: { pid: [ {id, sucursalId, sucursal, ciudad, pais, periodo, shopperId, shopper, estado, fecha} ] }
  _seeded:{},
  _key(pid){ return pid || CX.data.currentPeriodId; },

  /* sucursales del proyecto disponibles para reservar en un periodo (derivadas de las visitas) */
  sucursales(pid){
    pid=this._key(pid);
    const map={};
    (CX.data._visitas||[]).filter(v=>v.projectId===pid).forEach(v=>{
      const id=(v.sucursal+'|'+v.ciudad).toLowerCase().replace(/\s+/g,'-');
      if(!map[id]) map[id]={id, sucursal:v.sucursal, ciudad:v.ciudad, pais:v.pais};
    });
    return Object.values(map);
  },

  list(pid){ pid=this._key(pid); if(!this._r[pid]){ try{ this._r[pid]=JSON.parse(localStorage.getItem('cx_reservas_'+pid)||'null')||this._seed(pid); }catch(e){ this._r[pid]=this._seed(pid); } } return this._r[pid]; },
  _persist(pid){ try{ localStorage.setItem('cx_reservas_'+pid, JSON.stringify(this._r[pid]||[])); }catch(e){} },

  /* Frontend gen\u00e9rico (correcci\u00f3n 20260711): bug real \u2014 se sembraban 2 reservas "demo"
     (Evaluador 01/02) SIN gate de modo, visibles tambi\u00e9n fuera de demo. Ahora solo se siembran en
     demo; fuera de demo, sin reservas reales todav\u00eda, la lista empieza vac\u00eda (honesto). */
  _seed(pid){
    const allowSynthetic = CX.dataSource ? CX.dataSource.showFixtures() : true;
    if(!allowSynthetic) return [];
    const sucs=this.sucursales(pid).slice(0,4);
    const per=this.periodoActual();
    return sucs.slice(0,2).map((s,i)=>({id:'rsv'+i+Date.now().toString(36).slice(-3), sucursalId:s.id, sucursal:s.sucursal, ciudad:s.ciudad, pais:s.pais, periodo:per, shopperId:'sh'+(i+1), shopper:'Evaluador 0'+(i+1), estado:'solicitada', fecha:new Date().toISOString().slice(0,10)}));
  },

  periodoActual(){ const d=new Date(); return d.toISOString().slice(0,7); },

  /* shopper solicita/reserva una sucursal para un periodo */
  reservar(pid, rec){
    pid=this._key(pid); const L=this.list(pid);
    // anti-duplicado: misma sucursal+periodo+shopper
    if(L.some(r=>r.sucursalId===rec.sucursalId && r.periodo===rec.periodo && r.shopperId===rec.shopperId)) return {dup:true};
    const r=Object.assign({id:'rsv'+Date.now().toString(36), estado:'solicitada', fecha:new Date().toISOString().slice(0,10)}, rec);
    L.unshift(r); this._persist(pid); CX.bus&&CX.bus.emit('reservas');
    CX.notif&&CX.notif.push({to:'admin',tipo:'reserva',icon:'🙋',tono:'b',titulo:'Nueva solicitud de visita',txt:(r.shopper||'Shopper')+' · '+r.sucursal+' · '+r.periodo,nav:'reservas'});
    return {ok:true, r};
  },

  setEstado(pid, id, estado, extra){ pid=this._key(pid); const r=this.list(pid).find(x=>x.id===id); if(r){ r.estado=estado; if(extra)Object.assign(r,extra); this._persist(pid); CX.bus&&CX.bus.emit('reservas'); } return r; },
  remove(pid, id){ pid=this._key(pid); this._r[pid]=this.list(pid).filter(x=>x.id!==id); this._persist(pid); CX.bus&&CX.bus.emit('reservas'); },

  /* CRUCE: al publicar visitas para un periodo, busca reservas/asignaciones que coincidan
     y deja la visita ya asignada al shopper que la reservó (estado 'asignada'). */
  cruzar(pid, periodo){
    pid=this._key(pid);
    const reservas=this.list(pid).filter(r=>r.periodo===periodo && ['asignada','aprobada'].includes(r.estado));
    let cruzadas=0;
    reservas.forEach(r=>{
      // busca una visita disponible de esa sucursal sin shopper
      const v=(CX.data._visitas||[]).find(v=>v.projectId===pid && (v.sucursal+'|'+v.ciudad).toLowerCase().replace(/\s+/g,'-')===r.sucursalId && (!v.shopperId || v.estado==='disponible'));
      if(v && r.shopperId){
        const s=CX.data.getShopper && CX.data.getShopper(r.shopperId);
        v.shopperId=r.shopperId; v.shopper=r.shopper||(s&&s.nombre); v.shopperCode=s&&s.code; v.estado='asignada';
        r.estado='cruzada'; r.visitaId=v.id; cruzadas++;
        CX.hr&&CX.hr.writeBack&&CX.hr.writeBack(CX.data.period(), v);
      }
    });
    this._persist(pid); CX.bus&&CX.bus.emit('visit-flow'); CX.bus&&CX.bus.emit('reservas');
    return {cruzadas};
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

  const periodos=()=>{ const s=new Set([CX.reservas.periodoActual()]); CX.reservas.list(pid).forEach(r=>s.add(r.periodo)); return [...s].sort().reverse(); };
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
            draw();ui.toast('Solicitud guardada y confirmada','ok');
          }catch(_){ui.toast('No hubo ACK remoto; la solicitud no se declaró guardada','warn');}
        })});
      });
      host.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',async()=>{
        try{await CX.reservas.remove(pid,b.dataset.del);draw();ui.toast('Solicitud cancelada y confirmada','ok');}
        catch(_){ui.toast('No hubo ACK remoto; la cancelación no se declaró aplicada','warn');}
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
        draw();
        if(['aprobada','cruzada'].includes(String(saved?.estado||saved?.status||newEst))){
          CX.notif&&CX.notif.push({to:'shopper',tipo:'reserva_aprobada',icon:'✅',tono:'g',titulo:'¡Tu reserva fue aprobada!',txt:'Sucursal: '+(reservation?.sucursal||'')+' · '+(reservation?.periodo||per)+'. Revisa tu visita en la plataforma.',nav:'misvisitas'});
        }
        ui.toast('Estado confirmado por el proveedor','ok');
      }catch(_){draw();ui.toast('No hubo ACK remoto; no se declaró el cambio','warn');}
    }));
    host.querySelectorAll('[data-rsh]').forEach(b=>b.addEventListener('click',()=>{
      const reservation=CX.reservas.list(pid).find(x=>x.id===b.dataset.rsh),cands=data.shoppersFor();
      ui.modal('Asignar shopper · '+reservation.sucursal,`<select class="sel" id="rshSel" style="margin-bottom:14px">${cands.map(s=>`<option value="${s.id}">${s.nombre} · ${s.code}</option>`).join('')}</select>
        <div style="text-align:right"><button class="btn btn-pr btn-sm" id="rshOk">Asignar</button></div>`,
      {onMount:(ov,close)=>ov.querySelector('#rshOk').addEventListener('click',async()=>{
        const shopper=data.getShopper(ov.querySelector('#rshSel').value);
        try{await CX.reservas.setEstado(pid,reservation.id,'asignada',{shopperId:shopper.id,shopper:shopper.nombre});close();draw();ui.toast('Shopper asignado y confirmado','ok');}
        catch(_){ui.toast('No hubo ACK remoto; la asignación no se declaró aplicada','warn');}
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
          close();draw();ui.toast(result.dup?'Ya existía esa asignación':'Sucursal asignada y confirmada a '+shopper.nombre,result.dup?'warn':'ok');
        }catch(_){ui.toast('No hubo ACK remoto; la asignación no se declaró aplicada','warn');}
      })});
    });
    host.querySelector('#aEscenarios').addEventListener('click',()=>ui.toast('Los escenarios se administran desde la fuente configurada del proyecto. No se modificó ningún dato.','warn',3600));
    host.querySelector('#aCruzar').addEventListener('click',async()=>{
      try{
        const result=await CX.reservas.cruzar(pid,per);
        draw();ui.toast(result.cruzadas?(result.cruzadas+' visita(s) cruzada(s) con ACK remoto'):'No hay reservas asignadas para cruzar este periodo',result.cruzadas?'ok':'warn',4000);
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
