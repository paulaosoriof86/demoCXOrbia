/* CXOrbia · Postulaciones (admin) — full fidelity */
CX.module('postulaciones', ({data,ui})=>{
  const p=data.project(), posts=data.posts();
  const c=(s)=>posts.filter(x=>x.estado===s).length;
  const reprog=posts.filter(x=>x.reprog);
  const agendadas=data.visitas().filter(v=>v.agendada&&v.shopperId);

  /* agrupar por sucursal */
  const groups={};
  posts.forEach(x=>{(groups[x.sucursal]=groups[x.sucursal]||[]).push(x);});

  const estTag=(e)=>e==='pendiente'?ui.bdg('PENDIENTE','a'):e==='standby'?ui.bdg('STANDBY','n'):ui.bdg('APROBADA','g');

  const card=(x)=>{
    const hon=`${x.currency} ${x.honorario}`+(x.boleto?' + boleto':'')+(x.comboAmt?' + combo':'');
    return `<div data-pid="${x.id}" style="background:#fff;border:1px solid var(--border);border-radius:11px;padding:13px 15px;margin-bottom:10px">
      <div class="between" style="margin-bottom:8px">
        <div class="flex" style="gap:8px">${estTag(x.estado)}<span style="font-size:11px;color:var(--t3)">${x.fechaProp}</span>${x.reprog?ui.bdg('Reprog.','a'):''}</div>
        <span style="font-size:11px;color:var(--t3)">${x.quincena}</span>
      </div>
      <div class="between" style="align-items:flex-start;gap:14px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <div style="font-size:14px;font-weight:700;color:var(--t1)">${x.shopper} <span class="muted" style="font-weight:500;font-size:12px">· ${x.shopperCode}</span></div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">📍 ${x.sucursal} · ${x.ciudad}</div>
          <div style="font-size:11.5px;color:var(--t3);margin-top:4px">📅 ${x.fechaProp} · ⏱️ ${x.franjaCode} · 📞 ${x.phone} · desde ${x.disponibleDesde}</div>
          <div style="font-size:12px;color:var(--green);font-weight:600;margin-top:4px">💲 ${hon}</div>
          ${x.estado==='aprobada'?`<div style="font-size:11px;color:var(--t3);margin-top:5px">✅ ${x.quincena} · WA enviado al shopper · Aprobada por <b style="color:var(--t2)">${x.aprobadaPor}</b></div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;gap:7px;align-items:flex-end">
          ${x.estado==='pendiente'
            ? `<button class="btn btn-green btn-sm" data-ap="${x.id}">✅ Aprobar</button>
               <div class="flex"><button class="btn btn-ghost btn-sm" data-sb="${x.id}">Standby</button><button class="btn bt-x btn-sm" data-rj="${x.id}" style="background:var(--red-bg);color:var(--red)">Rechazar</button></div>`
            : `<div style="background:var(--green-bg);border-radius:9px;padding:8px 14px;text-align:center"><div style="font-size:12px;font-weight:700;color:var(--green)">✅ Aprobada</div><div style="font-size:10px;color:var(--t3)">${x.quincena}</div></div>
               <div class="flex"><button class="btn btn-ghost btn-sm" data-perfil="${x.shopperId}">👤 Perfil</button><button class="btn btn-ghost btn-sm">✏️ Editar</button><button class="btn btn-ghost btn-sm">🔁 Reasig.</button></div>`}
        </div>
      </div>
    </div>`;
  };

  const groupHTML=Object.keys(groups).slice(0,8).map(suc=>{
    const items=groups[suc];const pend=items.filter(x=>x.estado==='pendiente').length;
    return `<div class="card card-p" style="margin-bottom:12px">
      <div class="between" style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:var(--brand-dark);text-transform:uppercase;letter-spacing:.5px">📍 ${suc}</div>
        <span class="muted" style="font-size:11px">${items.length} postulación(es) · ${pend} pendiente(s)</span></div>
      ${items.map(card).join('')}</div>`;
  }).join('');

  const html=`
  <div class="between" style="margin-bottom:6px">
    <div>${ui.ph('Gestión de Postulaciones', `${c('pendiente')} pendientes · ${c('aprobada')} aprobadas · ${reprog.length} reprogramación(es) · ${agendadas.length} agendamientos`)}</div>
    <div class="flex"><span class="bdg bdg-g">● En vivo</span><span class="bdg bdg-b">${p.name}</span></div>
  </div>

  <div class="flex wrap" style="gap:8px;margin-bottom:12px">
    <button class="btn btn-soft btn-sm">🔄 Sincronizar HR</button>
    <button class="btn btn-green btn-sm">＋ Asignar visita manual</button>
    <button class="btn btn-ghost btn-sm">⤓ Exportar</button>
    <div class="spacer"></div>
    <button class="btn btn-pr btn-sm" id="reqShopper">📤 Pedir al shopper…</button>
    <button class="btn btn-pr btn-sm" id="openAgenda">🗓️ Gestionar agendamientos</button>
  </div>

  <div class="flex wrap" style="gap:8px;margin-bottom:12px">
    <input class="inp" id="pSearch" placeholder="🔎 Buscar shopper, sucursal…" style="flex:1;min-width:200px">
    <select class="sel" id="pPais" style="width:auto"><option value="">Todos los países</option>${p.countries.map(c=>`<option>${c}</option>`).join('')}</select>
    <select class="sel" id="pEst" style="width:auto"><option value="">Todos los estados</option><option value="pendiente">Pendiente</option><option value="aprobada">Aprobada</option><option value="standby">Standby</option></select>
    <label class="flex" style="font-size:12px;color:var(--t2);gap:6px"><input type="checkbox" id="pHist"> Ver históricas</label>
  </div>

  <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:16px">
    ${ui.kpi('Pendientes',c('pendiente'),'a')}
    ${ui.kpi('Reprogramaciones',reprog.length,'r')}
    ${ui.kpi('Aprobadas',c('aprobada'),'g')}
    ${ui.kpi('Todas',posts.length,'b')}
    ${ui.kpi('Agendamientos',agendadas.length,'n')}
  </div>

  ${reprog.length?`<div class="card card-p" style="border-left:3px solid var(--amber);margin-bottom:16px">
    <div class="card-t" style="margin-bottom:10px">🗓️ Solicitudes de reprogramación pendientes <span class="bdg bdg-a">${reprog.length}</span></div>
    ${reprog.slice(0,3).map(x=>`<div class="between wrap" style="gap:12px;padding:10px 0;border-bottom:1px solid var(--border-2)">
      <div><b style="font-size:13px">${x.shopper}</b> · <span style="font-size:12px;color:var(--t2)">${x.sucursal}</span>
      <div style="font-size:11px;color:var(--t3)">Fecha vigente → propuesta · aplicación tarde 😬</div></div>
      <div class="flex"><button class="btn btn-ghost btn-sm">👁 Revisar</button><button class="btn btn-green btn-sm">✅ Autorizar nueva fecha</button><button class="btn btn-ghost btn-sm">Conservar anterior</button></div>
    </div>`).join('')}</div>`:''}

  <div id="pGroups">${groupHTML}</div>
  <div class="card card-p">${ui.aiBox('Sugiero el mejor shopper por historial y certificación, detecto reprogramaciones tardías y disparo WhatsApp y notificaciones automáticamente al aprobar. Cada decisión queda firmada y trazada.','Asistente de asignación')}</div>`;

  setTimeout(()=>{
    const act=(id,label,tone,extra)=>{const el=document.querySelector(`[data-pid="${id}"]`);if(!el)return;
      el.querySelector('div[style*="flex-direction:column"]').innerHTML=`<div style="background:var(--${tone}-bg);border-radius:9px;padding:8px 14px;text-align:center"><div style="font-size:12px;font-weight:700;color:var(--${tone})">${label}</div></div>`;
      ui.toast(extra,'ok');};
    document.querySelectorAll('[data-ap]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.ap,'✅ Aprobada','green','Aprobada · WhatsApp enviado al shopper')));
    document.querySelectorAll('[data-sb]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.sb,'⏸ Standby','amber','Postulación en standby')));
    document.querySelectorAll('[data-rj]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.rj,'✕ Rechazada','red','Postulación rechazada · shopper notificado')));
    const search=()=>{const q=(document.getElementById('pSearch').value||'').toLowerCase(),fp=document.getElementById('pPais').value,fe=document.getElementById('pEst').value;
      document.querySelectorAll('#pGroups [data-pid]').forEach(el=>{const x=posts.find(z=>z.id===el.dataset.pid);
        const ok=(!q||(x.shopper+x.shopperCode+x.sucursal).toLowerCase().includes(q))&&(!fp||x.pais===fp)&&(!fe||x.estado===fe);el.style.display=ok?'':'none';});};
    ['pSearch','pPais','pEst'].forEach(id=>document.getElementById(id).addEventListener('input',search));
    document.querySelectorAll('[data-perfil]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('shoppers')));
    const reqBtn=document.getElementById('reqShopper');
    if(reqBtn)reqBtn.addEventListener('click',()=>{
      ui.modal('📤 Pedir acción al shopper',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:14px">El equipo puede <b>solicitar</b> al shopper (no solo gestionar lo que él pide). La solicitud le llega en Mi Día, Tablón y por WhatsApp.</p>
        <label class="lbl">Shopper</label>
        <select class="sel" id="rqSh" style="margin-bottom:12px">${posts.slice(0,10).map(x=>`<option>${x.shopper} · ${x.sucursal}</option>`).join('')}</select>
        <label class="lbl">Solicitud</label>
        <select class="sel" id="rqTipo" style="margin-bottom:12px">
          <option value="confirmar">Confirmar fecha propuesta</option>
          <option value="cambio">Pedir cambio de fecha</option>
          <option value="reprog">Solicitar reprogramación</option>
          <option value="agendar">Recordar que agende</option>
        </select>
        <label class="lbl">Nota (opcional)</label>
        <textarea class="inp" id="rqNota" rows="2" placeholder="Detalle para el shopper…" style="margin-bottom:14px"></textarea>
        <div class="flex" style="justify-content:flex-end;gap:8px"><button class="btn btn-ghost btn-sm" data-x4>Cancelar</button><button class="btn btn-pr btn-sm" id="rqSend">📲 Enviar solicitud</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('[data-x4]').addEventListener('click',close);
        ov.querySelector('#rqSend').addEventListener('click',()=>{
          const tipo=ov.querySelector('#rqTipo').value, sh=ov.querySelector('#rqSh').value.split(' · ')[0];
          const map={confirmar:['📅','El equipo pide confirmar fecha','confirmar_fecha'],cambio:['📅','El equipo pide cambio de fecha','confirmar_fecha'],reprog:['🔄','El equipo solicita reprogramación',''],agendar:['📅','Recordatorio: agenda tu visita','']};
          const m=map[tipo];
          CX.notif.push({to:'shopper',tipo,icon:m[0],tono:'a',titulo:m[1],txt:sh+' · responde desde Mis Visitas',nav:'misvisitas',accion:m[2]||undefined});
          close();ui.toast('Solicitud enviada a '+sh+' · Mi Día + Tablón + WhatsApp','ok',3500);
        });
      }});
    });
    document.getElementById('openAgenda').addEventListener('click',()=>{
      const rows=agendadas.slice(0,4).map(v=>`<div class="between" style="padding:9px 11px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
        <div><b style="font-size:13px">${v.shopper}</b> · ${v.sucursal}<div style="font-size:11px;color:var(--t3)">📅 ${v.agendada} · ${v.franjaCode} · autorizada por Coordinación</div></div>
        <button class="btn btn-ghost btn-sm">🗓️ Solicitar ajuste</button></div>`).join('');
      ui.modal('Gestión de agendamientos',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:14px">Separa las fechas enviadas por shoppers de las referencias HR y de las propuestas al postularse.</p>
        <div style="background:var(--green-bg);border-radius:10px;padding:12px 14px;margin-bottom:14px">
          <div style="font-size:12px;font-weight:700;color:var(--green)">⌛ Fechas pendientes de autorización <span class="bdg bdg-n">0</span></div>
          <div style="font-size:12px;color:var(--t3);margin-top:4px">No hay fechas nuevas pendientes de autorización.</div></div>
        <div style="font-size:12px;font-weight:700;color:var(--t1);margin-bottom:9px">✅ Agendas autorizadas desde la plataforma <span class="bdg bdg-g">${agendadas.length}</span></div>
        ${rows||ui.empty('🗓️','Sin agendas')}
        <div style="margin-top:8px">${ui.aiBox('Estas fechas provienen de HR o de una postulación aprobada; se reflejan para coordinación y shopper sin contarse como pendientes.','Referencias')}</div>`);
    });
  },0);
  return html;
});
