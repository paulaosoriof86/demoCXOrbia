/* CXOrbia · Visitas (admin: tabla operativa editable · shopper: marketplace) */
CX.module('visitas', ({data,role,ui})=>{
  const p=data.project();

  /* ---------------- SHOPPER: marketplace de oportunidades ---------------- */
  if(role==='shopper'){
    const list=data.visitas().filter(v=>v.estado==='disponible');
    const card=(v)=>`<div class="card hov" style="overflow:hidden">
      <div style="background:linear-gradient(135deg,${p.accent},var(--brand-dark));color:#fff;padding:11px 14px" class="between">
        <b style="font-size:13px">${v.sucursal}</b>${ui.bdg(v.franja,'n')}</div>
      <div class="card-p" style="padding:13px 15px">
        <div style="font-size:11.5px;color:var(--t3);margin-bottom:8px">📍 ${v.ciudad}, ${v.pais} · ${v.quincena} · ${v.escenario}</div>
        <div style="font-size:11px;color:var(--t3);margin-bottom:8px">🗓️ Rango ${v.rango}${v.canal?' · '+v.canal:''}</div>
        <div class="between">
          <div><span style="font-size:16px;font-weight:800;color:var(--green);font-family:var(--disp)">${ui.money(v.currency,v.honorario)}</span>
          ${v.boleto?`<span style="font-size:11px;color:var(--t3)"> + boleto</span>`:''}${v.combo?`<span style="font-size:11px;color:var(--t3)"> + combo</span>`:''}</div>
          <button class="btn btn-pr btn-sm" data-detail="${v.id}">Ver detalle →</button>
        </div>
      </div></div>`;
    const html=`
      ${ui.ph('Visitas Disponibles', p.name+' · '+p.ronda+' · oportunidades para tu perfil y país')}
      <div class="flex wrap" style="gap:8px;margin-bottom:12px">
        <select class="sel" id="fQuin" style="width:auto"><option value="">Toda quincena</option>${p.quincenas.map(q=>`<option>${q}</option>`).join('')}</select>
        <select class="sel" id="fEsc" style="width:auto"><option value="">Todo escenario</option>${p.scenarios.map(s=>`<option>${s}</option>`).join('')}</select>
        <select class="sel" id="fCanal" style="width:auto"><option value="">Todo canal</option>${(p.canales||[]).map(s=>`<option>${s}</option>`).join('')}</select>
      </div>
      ${ui.aiBox('Filtradas y priorizadas según tu país, perfil y disponibilidad. Las visitas se derivan de la hoja de ruta del proyecto (online, importada o creada en la plataforma).','Para ti')}
      <div id="vList" style="margin-top:14px">${list.length?`<div class="grid g3">${list.map(card).join('')}</div>`:ui.empty('🔍','Sin visitas disponibles')}</div>`;
    setTimeout(()=>{
      const bind=()=>document.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>CX.shopperVisitDetail(data,p,list.find(v=>v.id===b.dataset.detail),ui)));
      const apply=()=>{const fq=document.getElementById('fQuin').value,fe=document.getElementById('fEsc').value,fc=document.getElementById('fCanal').value;const a=list.filter(v=>(!fq||v.quincena===fq)&&(!fe||v.escenario===fe)&&(!fc||v.canal===fc));document.getElementById('vList').innerHTML=a.length?`<div class="grid g3">${a.map(card).join('')}</div>`:ui.empty('🔍','Sin resultados');bind();};
      ['fQuin','fEsc','fCanal'].forEach(id=>document.getElementById(id).addEventListener('change',apply));bind();
    },0);
    return html;
  }

  /* ---------------- ADMIN: tabla operativa completa ---------------- */
  const all=data.visitas();
  const k=data.kpis();
  const row=(v)=>`<tr data-vid="${v.id}">
    <td><b style="color:var(--brand)">#${v.num}</b></td>
    <td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${v.ciudad} · ${v.pais}</div></td>
    <td style="font-size:12px">${v.quincena}<div style="font-size:10px;color:var(--t3)">${v.escenario}</div></td>
    <td>${v.shopper?`<b style="font-size:12px">${v.shopper}</b><div style="font-size:10px;color:var(--t3)">${v.shopperCode}</div>`:'<span class="muted">— sin asignar</span>'}</td>
    <td>${ui.estadoBadge(v.estado)}</td>
    <td style="font-size:12px">${v.agendada||'<span class="muted">—</span>'}</td>
    <td style="font-size:12px;font-weight:600;color:var(--green)">${ui.money(v.currency,v.honorario)}</td>
    <td style="text-align:right"><button class="btn btn-ghost btn-sm" data-edit="${v.id}">✏️</button></td>
  </tr>`;
  const html=`
    <div class="between" style="margin-bottom:6px"><div>${ui.ph('Visitas', p.name+' · base operativa · publica, asigna y edita cada visita')}</div>
      <div class="flex"><span class="bdg bdg-g">● En vivo</span><span class="bdg bdg-b">${all.length} visitas</span></div></div>
    <div class="flex wrap" style="gap:8px;margin-bottom:12px">
      <button class="btn btn-green btn-sm" id="addV">＋ Publicar visita</button>
      <button class="btn btn-soft btn-sm">⤒ Importar HR</button>
      <button class="btn btn-ghost btn-sm">⤓ Exportar</button>
      <div class="spacer"></div>
      <input class="inp" id="vSearch" placeholder="🔎 Sucursal, shopper, ciudad…" style="max-width:240px">
      <select class="sel" id="vEst" style="width:auto"><option value="">Todos los estados</option>${['disponible','postulada','asignada','agendada','realizada','cuestionario','liquidada','fuera_rango'].map(e=>`<option value="${e}">${e}</option>`).join('')}</select>
      <select class="sel" id="vPais" style="width:auto"><option value="">País</option>${p.countries.map(c=>`<option>${c}</option>`).join('')}</select>
    </div>
    <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:16px">
      ${ui.kpi('Disponibles',all.filter(v=>v.estado==='disponible').length,'b')}
      ${ui.kpi('Asignadas',k.asignadas.t,'b')}
      ${ui.kpi('Realizadas',k.realizadas.t,'g')}
      ${ui.kpi('Sin asignar',k.sinAsignar.t,'r')}
      ${ui.kpi('Fuera de rango',k.fueraRango.t,'a')}
    </div>
    <div class="card card-p">
      <table class="tbl"><thead><tr><th>#</th><th>Sucursal</th><th>Quincena</th><th>Shopper</th><th>Estado</th><th>Agenda</th><th>Honorario</th><th></th></tr></thead>
      <tbody id="vBody">${all.map(row).join('')}</tbody></table>
      <div style="margin-top:14px">${ui.aiBox('Cada visita es editable: sucursal, escenario, honorario, shopper y estado. Detecto solapamientos, fuera de rango y faltantes de cobertura antes de publicar.','Base operativa inteligente')}</div>
    </div>`;
  setTimeout(()=>{
    const filt=()=>{const q=(document.getElementById('vSearch').value||'').toLowerCase(),fe=document.getElementById('vEst').value,fp=document.getElementById('vPais').value;
      document.querySelectorAll('#vBody tr').forEach(tr=>{const v=all.find(z=>z.id===tr.dataset.vid);const ok=(!q||(v.sucursal+(v.shopper||'')+v.ciudad).toLowerCase().includes(q))&&(!fe||v.estado===fe)&&(!fp||v.pais===fp);tr.style.display=ok?'':'none';});};
    ['vSearch','vEst','vPais'].forEach(id=>document.getElementById(id).addEventListener('input',filt));
    const editor=(v)=>ui.modal((v?'Editar':'Publicar')+' visita',`
      <div class="grid g2" style="gap:12px">
        <div><label class="lbl">Sucursal</label><input class="inp" value="${v?v.sucursal:''}" placeholder="Sucursal 01 · Ciudad"></div>
        <div><label class="lbl">País</label><select class="sel">${p.countries.map(c=>`<option ${v&&v.pais===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div><label class="lbl">Quincena</label><select class="sel">${p.quincenas.map(q=>`<option ${v&&v.quincena===q?'selected':''}>${q}</option>`).join('')}</select></div>
        <div><label class="lbl">Escenario</label><select class="sel">${p.scenarios.map(s=>`<option ${v&&v.escenario===s?'selected':''}>${s}</option>`).join('')}</select></div>
        <div><label class="lbl">Honorario</label><input class="inp" type="number" value="${v?v.honorario:''}"></div>
        <div><label class="lbl">Shopper asignado</label><select class="sel"><option value="">— sin asignar</option>${data.shoppersFor().map(s=>`<option ${v&&v.shopperId===s.id?'selected':''}>${s.nombre}</option>`).join('')}</select></div>
      </div>
      <div style="text-align:right;margin-top:16px"><button class="btn btn-pr btn-sm" onclick="CX.ui.toast('Visita guardada','ok');this.closest('.cx-ov').remove()">💾 Guardar</button></div>`);
    document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editor(all.find(z=>z.id===b.dataset.edit))));
    document.getElementById('addV').addEventListener('click',()=>editor(null));
  },0);
  return html;
});
