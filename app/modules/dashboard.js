/* CXOrbia · Dashboard Operativo (admin) — KPIs clickeables, filtro de meses,
   comparativo último trimestre, notificación WhatsApp. Genérico multipaís. */
CX.module('dashboard', ({data,ui})=>{
  const p=data.project(), k=data.kpis();
  const cs=p.countries;
  const split=(o)=>cs.map(c=>c+':'+o[c]).join(' · ');
  const months=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

  /* drill de un KPI: muestra el listado de visitas que lo componen + WhatsApp si aplica */
  const drill=(titulo, filtroFn, waMsg)=>{
    const vis=data.visitas().filter(filtroFn);
    const rows=vis.length?vis.slice(0,30).map(v=>`<tr><td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td>
      <td style="font-size:12px">${v.shopper||'<span class="muted">—</span>'}</td><td>${ui.estadoBadge(v.estado)}</td>
      <td style="font-size:12px">${v.agendada||v.disponibleDesde||'—'}</td></tr>`).join('')
      : '<tr><td colspan="4">'+ui.empty('🔍','Sin visitas en este KPI')+'</td></tr>';
    ui.modal(titulo+' · '+vis.length, `
      <table class="tbl"><thead><tr><th>Sucursal</th><th>Shopper</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>${rows}</tbody></table>
      ${waMsg?`<div class="between" style="margin-top:14px;background:var(--green-bg);border-radius:10px;padding:11px 13px">
        <div style="font-size:12px;color:#0a7050">${waMsg}</div>
        <button class="btn btn-green btn-sm" id="waBtn">📲 Notificar por WhatsApp</button></div>`:''}
      ${vis.length>30?`<div class="muted" style="font-size:11px;margin-top:8px">+${vis.length-30} más…</div>`:''}
    `,{onMount:(ov,close)=>{const w=ov.querySelector('#waBtn');if(w)w.addEventListener('click',()=>{close();ui.toast('Notificación WhatsApp enviada a los involucrados','ok');});}});
  };

  /* tile clickeable */
  const tile=(id,label,o,tone,filtroFn,wa)=>`<div class="kpi ${tone}" data-kpi="${id}" style="cursor:pointer"><div class="k-l">${label} ›</div>
    <div class="k-v">${o.t}</div><div class="k-s">${split(o)}</div></div>`;

  const fases=cs.map(c=>{
    const f=data.phaseFlow(c);
    const cell=(lbl,arr,tone,fk)=>`<div data-fase="${c}|${fk}" style="flex:1;min-width:84px;background:#fff;border:1px solid var(--border);border-radius:10px;padding:9px 10px;cursor:pointer">
      <div style="font-family:var(--disp);font-size:19px;font-weight:800;color:var(--t1);line-height:1">${arr[0]}</div>
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--t3);margin:2px 0 5px">${lbl} · ${arr[1]}%</div>
      <div class="bar" style="height:5px"><i style="width:${arr[1]}%;background:var(--${tone})"></i></div></div>`;
    return `<div style="margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:8px">${CX.paisLabel(c)} (${f.total})</div>
      <div class="flex wrap" style="gap:8px">
        ${cell('Total',[f.total,100],'brand','total')}${cell('Asign.',f.asign,'brand','asign')}${cell('Agend.',f.agend,'amber','agend')}
        ${cell('Sin agend.',f.sinAgend,'amber','sinagend')}${cell('Sin asign.',f.sinAsign,'red','sinasign')}${cell('Real.',f.real,'green','real')}
        ${cell('Cuest.',f.cuest,'purple','cuest')}${cell('Submit.',f.submit,'teal','submit')}${cell('Liq.',f.liq,'green','liq')}
      </div></div>`;
  }).join('');

  const top=[...data.shoppersFor()].sort((a,b)=>b.rating-a.rating).slice(0,4);

  const alerts=[];
  if(k.sinAsignar.t) alerts.push(['r','sinasign',`${k.sinAsignar.t} sin asignar (${split(k.sinAsignar)})`]);
  if(k.sinAgendar.t) alerts.push(['a','sinagend',`${k.sinAgendar.t} asignadas sin fecha programada`]);
  if(k.cuestPend.t)  alerts.push(['a','cuest',`${k.cuestPend.t} realizadas sin cuestionario`]);
  if(k.fueraRango.t) alerts.push(['r','fuera',`${k.fueraRango.t} fuera de rango`]);

  /* comparativo del último trimestre (3 meses) con KPIs clave del proyecto */
  const trimestre=['ABR','MAY','JUN'];
  const kpisTrim=[
    {n:'% Cumplimiento', vals:[72,84, Math.round(k.realizadas.t/Math.max(k.total.t,1)*100)], suf:'%', up:true},
    {n:'Días Real→Submit', vals:[3.1,2.8,2.6], suf:'d', up:false},
    {n:'Visitas realizadas', vals:[Math.round(k.total.t*0.6),Math.round(k.total.t*0.8),k.realizadas.t], suf:'', up:true},
    {n:'Margen neto', vals:[34,37,40], suf:'%', up:true},
  ];
  const trimRows=kpisTrim.map(r=>{
    const delta=r.vals[2]-r.vals[1]; const good=r.up?delta>=0:delta<=0;
    return `<tr><td><b>${r.n}</b></td>${r.vals.map((v,i)=>`<td style="${i===2?'font-weight:800;color:var(--t1)':''}">${v}${r.suf}</td>`).join('')}
      <td style="color:${good?'var(--green)':'var(--red)'};font-weight:700">${delta>=0?'▲ +':'▼ '}${Math.abs(delta)}${r.suf}</td></tr>`;
  }).join('');

  const host=ui.el('div');
  let selMonth=5; // JUN
  host.innerHTML=`
  <div class="between" style="margin-bottom:14px">
    <div>${ui.ph('Dashboard Operativo', p.name+' · '+p.industry+' · '+cs.map(c=>CX.paisFlag(c)).join(' '))}</div>
    <div class="flex">
      <select class="sel" id="monthSel" style="width:auto">${months.map((m,i)=>`<option value="${i}" ${i===selMonth?'selected':''}>${m} 2026</option>`).join('')}</select>
      <span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div>
  </div>

  <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
    <div style="font-size:12.5px;color:var(--brand-dark)"><b>${months[selMonth]} 2026 ·</b> ${k.total.t} visitas · ${split(k.total)}. Las tarjetas y fases son <b>clickeables</b> para ver su detalle. Multipaís: cada país mantiene su moneda.</div>
  </div>

  <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:12px">
    ${tile('total','Total visitas',k.total,'b')}
    ${tile('asign','Asignadas',k.asignadas,'b')}
    ${tile('sinasign','Sin asignar',k.sinAsignar,'r')}
    ${tile('sinagend','Sin agendar',k.sinAgendar,'a')}
    ${tile('real','Realizadas',k.realizadas,'g')}
  </div>
  <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:18px">
    ${tile('pend','Pend. realizar',k.pendRealizar,'a')}
    ${tile('cuest','Cuest. pendiente',k.cuestPend,'a')}
    ${tile('submit','Sin submitir',k.sinSubmitir,'p')}
    ${tile('liq','Liquidadas',k.liquidadas,'g')}
    ${tile('fuera','Fuera de rango',k.fueraRango,'r')}
  </div>

  <div class="card card-p" style="margin-bottom:18px">
    <div class="card-h"><div class="card-t">Flujo por fases</div><span class="muted" style="font-size:11px">Click en una fase para ver su listado</span></div>
    ${fases}
  </div>

  <div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:18px">
    <div class="card card-p">
      <div class="card-h"><div class="card-t">🏅 Top shoppers</div><button class="btn btn-ghost btn-sm" id="rankFull">Ver ranking completo →</button></div>
      ${top.map((s,i)=>`<div class="between hov" data-sh="${s.id}" style="padding:7px 6px;border-bottom:1px solid var(--border-2);cursor:pointer;border-radius:8px">
        <div class="flex"><b style="width:16px;color:var(--t3);font-family:var(--disp)">${i+1}</b><div class="rail-av" style="width:26px;height:26px;font-size:10px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.code.slice(-2)}</div>
        <span style="font-size:12px;font-weight:600;color:var(--t1)">${s.nombre} <span class="muted">${CX.paisFlag(s.pais)}</span></span></div>
        <span style="font-size:12px;font-weight:800;color:var(--amber)">★ ${s.rating||'—'} ›</span></div>`).join('')}
    </div>
    <div class="card card-p">
      <div class="card-t" style="margin-bottom:12px">Alertas operativas · <span class="muted" style="font-weight:500">clic para gestionar</span></div>
      ${alerts.length?alerts.map(a=>`<div data-alert="${a[1]}" style="background:var(--${a[0]==='r'?'red':'amber'}-bg);border-radius:9px;padding:10px 12px;margin-bottom:8px;font-size:12px;font-weight:600;color:var(--${a[0]==='r'?'red':'amber'});cursor:pointer">${a[0]==='r'?'🔴':'⏰'} ${a[2]} ›</div>`).join(''):ui.empty('✅','Sin alertas')}
    </div>
  </div>

  <div class="card card-p" id="estadoBoard" style="margin-bottom:18px"></div>

  <div class="card card-p">
    <div class="card-h"><div class="card-t">📈 Comparativo último trimestre — KPIs clave</div><span class="muted" style="font-size:11px">${trimestre.join(' · ')} 2026</span></div>
    <table class="tbl"><thead><tr><th>KPI</th>${trimestre.map(m=>`<th>${m}</th>`).join('')}<th>Δ vs mes ant.</th></tr></thead><tbody>${trimRows}</tbody></table>
    <div style="margin-top:14px">${ui.aiBox('Comparo el último trimestre de los KPIs que importan a este proyecto (cumplimiento, velocidad, volumen, margen) y resalto la tendencia. Cada tarjeta y fase abre su detalle; donde hay gestión externa, ofrezco notificar por WhatsApp.','Lectura inteligente · trimestre')}</div>
  </div>`;

  setTimeout(()=>{
    /* ---- Tablero de estado operativo (genérico, estilo HR) ---- */
    const fmtD=(d)=>d||'—';
    const waBtn=(v,msg)=>`<button class="btn btn-soft btn-sm" data-wa='${encodeURIComponent((v.shopper||'Shopper')+': '+msg)}' title="WhatsApp">📲</button>`;
    const mailBtn=(v,msg)=>`<button class="btn btn-ghost btn-sm" data-mail='${encodeURIComponent(msg)}' title="Correo">✉️</button>`;
    const goBtn=`<button class="btn btn-ghost btn-sm" data-goseco title="Ir a Visitas">↗</button>`;
    const boardRow=(v,extra,extraLbl)=>`<tr>
      <td style="font-size:11px;color:var(--t3)">#${v.num||''}</td>
      <td><b style="font-size:12.5px">${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad} · ${v.franjaCode||v.franja||''}</div></td>
      <td style="font-size:12px">${v.shopper||'<span class="muted">— sin asignar</span>'}${v.shopperCode?`<div style="font-size:10px;color:var(--t3)">${v.shopperCode}</div>`:''}</td>
      <td style="font-size:11.5px">${v.escenario||''}${v.combo?`<div style="font-size:10px;color:var(--t3)">${typeof v.combo==='string'?v.combo:'combo'}</div>`:''}</td>
      <td style="font-size:11.5px;color:${extraLbl==='alerta'?'var(--red)':'var(--t2)'};font-weight:${extraLbl==='alerta'?'700':'400'}">${extra}</td>
      <td>${ui.estadoBadge(v.estado)}</td>
      <td style="text-align:right;white-space:nowrap">${goBtn} ${v.shopper?waBtn(v,'sobre tu visita en '+v.sucursal)+' '+mailBtn(v,'Visita '+v.sucursal):''}</td>
    </tr>`;
    const bucket=(titulo,color,vis,extraFn,extraLbl,bulkMsg)=>{
      if(!vis.length) return `<div style="margin-bottom:10px"><div style="background:var(--${color}-bg);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:var(--${color})">${titulo} (0)</div></div>`;
      return `<div style="margin-bottom:14px">
        <div class="between" style="background:var(--${color}-bg);border-radius:8px 8px 0 0;padding:8px 12px">
          <span style="font-size:12px;font-weight:800;color:var(--${color})">${titulo} (${vis.length})</span>
          ${bulkMsg&&vis.some(v=>v.shopper)?`<button class="btn btn-soft btn-sm" data-bulk='${encodeURIComponent(bulkMsg)}'>📣 Recordar a todos</button>`:''}
        </div>
        <div style="overflow-x:auto"><table class="tbl" style="min-width:720px"><thead><tr><th>Ref</th><th>Sucursal</th><th>Shopper</th><th>Escenario</th><th>${extraLbl==='alerta'?'Alerta':'Fecha'}</th><th>Estado</th><th></th></tr></thead>
        <tbody>${vis.slice(0,15).map(v=>boardRow(v,extraFn(v),extraLbl)).join('')}</tbody></table></div>
      </div>`;
    };
    const all=data.visitas();
    const scan=CX.automations?CX.automations.scanPendientes():{atrasadas:[]};
    const proxim=all.filter(v=>['asignada','agendada'].includes(v.estado)&&v.agendada);
    const realPend=all.filter(v=>v.estado==='realizada');
    const submitPend=all.filter(v=>v.estado==='cuestionario');
    const porProgramar=all.filter(v=>v.estado==='asignada'&&!v.agendada);
    const porAsignar=all.filter(v=>!v.shopperId&&v.estado!=='fuera_rango'&&v.estado!=='liquidada');
    const board=document.getElementById('estadoBoard');
    board.innerHTML=`<div class="card-h"><div class="card-t">🗂️ Estado operativo de visitas</div><span class="muted" style="font-size:11px">por etapa · gestiona o recuerda desde cada fila</span></div>
      ${bucket('📅 Próximas — pendientes de realizar','brand',proxim,v=>'Prog: '+fmtD(v.agendada),'fecha','Recordatorio: tu visita está próxima, no olvides realizarla.')}
      ${bucket('📝 Realizadas — pendientes de cuestionario','amber',realPend,v=>'Real: '+fmtD(v.realizada),'fecha','Recordatorio: completa el cuestionario de tu visita realizada.')}
      ${bucket('📤 Cuestionario completo — pendientes de submitir','purple',submitPend,v=>'Cuest: '+fmtD(v.cuestFecha||v.realizada),'fecha','Recordatorio: envía (submit) tu cuestionario.')}
      ${bucket('🗓️ Pendientes por programar','green',porProgramar,v=>'Desde: '+fmtD(v.disponibleDesde),'fecha','Recordatorio: agenda la fecha de tu visita asignada.')}
      ${bucket('👤 Pendientes por asignar','purple',porAsignar,v=>'Sin shopper','fecha')}
      ${bucket('⚠ Alertas — límites de tiempo excedidos','red',scan.atrasadas,v=>'Vencida · '+fmtD(v.agendada||v.disponibleDesde),'alerta','Urgente: tu visita está vencida, contáctanos.')}`;
    board.querySelectorAll('[data-goseco]').forEach(b=>b.addEventListener('click',()=>CX.router.nav('visitas')));
    board.querySelectorAll('[data-wa]').forEach(b=>b.addEventListener('click',()=>{CX.automations&&CX.automations._pushLog({fecha:new Date().toISOString().slice(0,16).replace('T',' '),canal:'whatsapp',evento:'recordatorio',titulo:'Recordatorio manual',txt:decodeURIComponent(b.dataset.wa),hook:CX.automations.hook()||'(Make sin configurar)'});ui.toast('WhatsApp enviado (Make): '+decodeURIComponent(b.dataset.wa).slice(0,40)+'…','ok');}));
    board.querySelectorAll('[data-mail]').forEach(b=>b.addEventListener('click',()=>ui.toast('Correo enviado (Make/Outlook)','ok')));
    board.querySelectorAll('[data-bulk]').forEach(b=>b.addEventListener('click',()=>ui.toast('Recordatorio masivo enviado por WhatsApp + correo (Make)','ok',3200)));

    /* ---- ranking de shoppers clickeable + completo ---- */
    const profileModal=(s)=>{ const st=data.shopperStats?data.shopperStats(s.id):{total:s.visitas||0,realizadas:0,liquidadas:0,enCurso:0};
      ui.modal(s.nombre+' · '+s.code, `
        <div class="flex" style="gap:12px;margin-bottom:12px"><div class="rail-av" style="width:42px;height:42px;font-size:15px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.code.slice(-2)}</div>
          <div><div class="card-t" style="font-size:15px">${s.nombre}</div><div style="font-size:12px;color:var(--t3)">${s.ciudad?s.ciudad+', ':''}${CX.paisName(s.pais)} · ${s.estado||''}</div>
          <div style="margin-top:4px"><span style="font-size:13px;font-weight:800;color:var(--amber)">★ ${s.rating||'—'}</span></div></div></div>
        <div class="grid g4" style="margin-bottom:12px">${ui.kpi('Visitas',st.total,'b')}${ui.kpi('Realizadas',st.realizadas,'g')}${ui.kpi('Liquidadas',st.liquidadas,'p')}${ui.kpi('En curso',st.enCurso,'a')}</div>
        <div class="flex" style="justify-content:flex-end;gap:8px"><button class="btn btn-soft btn-sm" id="pmWa">📲 WhatsApp</button><button class="btn btn-pr btn-sm" id="pmGo">Ver en Shoppers →</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#pmGo').addEventListener('click',()=>{close();CX.router.nav('shoppers');});ov.querySelector('#pmWa').addEventListener('click',()=>{close();ui.toast('WhatsApp a '+s.nombre+' (Make)','ok');});}});
    };
    host.querySelectorAll('[data-sh]').forEach(el=>el.addEventListener('click',()=>{const s=data.getShopper?data.getShopper(el.dataset.sh):data.shoppers.find(x=>x.id===el.dataset.sh);if(s)profileModal(s);}));
    const rf=host.querySelector('#rankFull');
    if(rf)rf.addEventListener('click',()=>{const rank=[...data.shoppersFor()].sort((a,b)=>(b.rating||0)-(a.rating||0));
      ui.modal('Ranking completo de shoppers ('+rank.length+')',`<table class="tbl"><thead><tr><th>#</th><th>Shopper</th><th>Ciudad</th><th>Visitas</th><th>Rating</th></tr></thead><tbody>
        ${rank.map((s,i)=>`<tr class="hov" data-rk="${s.id}" style="cursor:pointer"><td style="font-family:var(--disp);color:var(--t3)">${i+1}</td><td><b>${s.nombre}</b><div style="font-size:10px;color:var(--t3)">${s.code}</div></td><td style="font-size:12px">${s.ciudad||CX.paisName(s.pais)}</td><td style="font-size:12px">${s.visitas||0}</td><td style="font-weight:800;color:var(--amber)">★ ${s.rating||'—'}</td></tr>`).join('')}
      </tbody></table>`,{onMount:(ov,close)=>ov.querySelectorAll('[data-rk]').forEach(tr=>tr.addEventListener('click',()=>{close();const s=data.getShopper(tr.dataset.rk);if(s)profileModal(s);}))});
    });

    const F={
      total:()=>true, asign:v=>v.shopperId, sinasign:v=>!v.shopperId&&v.estado!=='fuera_rango',
      sinagend:v=>v.estado==='asignada', real:v=>['realizada','cuestionario','liquidada'].includes(v.estado),
      pend:v=>['asignada','agendada'].includes(v.estado), cuest:v=>v.estado==='realizada',
      submit:v=>v.estado==='cuestionario', liq:v=>v.estado==='liquidada', fuera:v=>v.estado==='fuera_rango',
      agend:v=>['agendada','realizada','cuestionario','liquidada'].includes(v.estado),
    };
    const WA={ sinasign:'Visitas sin cobertura — avisar a la red de shoppers.', sinagend:'Pídeles agendar fecha.', cuest:'Recuérdales enviar el cuestionario.', fuera:'Coordinar reprogramación.' };
    host.querySelectorAll('[data-kpi]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.kpi;drill(el.querySelector('.k-l').textContent.replace(' ›',''),F[id]||F.total,WA[id]);}));
    host.querySelectorAll('[data-alert]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.alert;drill('Gestión: '+id,F[id]||F.total,WA[id]||'Gestionar con los involucrados.');}));
    host.querySelectorAll('[data-fase]').forEach(el=>el.addEventListener('click',()=>{const[c,fk]=el.dataset.fase.split('|');drill(CX.paisLabel(c)+' · '+fk,v=>v.pais===c&&(F[fk]||F.total)(v),WA[fk]);}));
    const ms=host.querySelector('#monthSel');
    if(ms)ms.addEventListener('change',()=>ui.toast('Mes: '+months[+ms.value]+' 2026 (demo — datos del periodo activo)',''));
  },0);
  return host;
});
