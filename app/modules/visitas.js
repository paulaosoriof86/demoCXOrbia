/* CXOrbia · Visitas (admin: tabla operativa editable · shopper: marketplace) */
CX.module('visitas', ({data,role,ui})=>{
  const p=data.project();

  /* ---------------- SHOPPER: marketplace de oportunidades ---------------- */
  if(role==='shopper'){
    const list=data.visitas().filter(v=>v.estado==='disponible');
    const escEmoji=(s)=>{const t=(s||'').toLowerCase();
      if(t.includes('fin de semana')||t.includes('estreno'))return '🎉';
      if(t.includes('incógnito')||t.includes('incognito'))return '🕵️';
      if(t.includes('almuerzo')||t.includes('cena')||t.includes('combo'))return '🍽️';
      if(t.includes('drive'))return '🚗'; if(t.includes('préstamo')||t.includes('cuenta'))return '🏦';
      if(t.includes('telef'))return '📞'; return '🎯';};
    const cell=(lbl,val)=>`<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t3)">${lbl}</div><div style="font-size:13px;font-weight:700;color:var(--t1)">${val}</div></div>`;
    const card=(v)=>`<div class="card hov" style="overflow:hidden;display:flex;flex-direction:column">
      <div style="background:linear-gradient(135deg,${p.accent},var(--brand-dark));color:#fff;padding:12px 15px" class="between">
        <div><b style="font-size:14px">${v.sucursal.split(' · ')[0]}</b><div style="font-size:11px;opacity:.9">📍 ${v.ciudad}, ${CX.paisName(v.pais)}</div></div>
        <span style="background:rgba(255,255,255,.22);border-radius:20px;padding:3px 11px;font-size:11px;font-weight:700">Disponible</span></div>
      <div class="card-p" style="padding:13px 15px;flex:1">
        <div class="grid g2" style="gap:11px;margin-bottom:11px">
          ${cell('Quincena',v.quincena)}${cell('Franja',(v.franja==='Fin de semana'?'🎉 ':'📅 ')+v.franja)}
          ${cell('Canal',v.canal||'—')}${cell('Escenario',escEmoji(v.escenario)+' '+v.escenario)}
        </div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t3)">📅 Disponible desde</div>
        <div style="font-size:12.5px;font-weight:600;color:var(--t1);margin-bottom:10px">${v.disponibleDesde||v.rango}</div>
        ${v.combo?`<div style="background:var(--amber-bg);border-radius:8px;padding:7px 10px;font-size:11.5px;color:#8a5b00;margin-bottom:11px">🍿 ${v.combo}</div>`:''}
        <div class="between">
          <div><span style="font-size:16px;font-weight:800;color:var(--green);font-family:var(--disp)">${ui.money(v.currency,v.honorario)}</span>
          <div style="font-size:10.5px;color:var(--t3)">${[v.combo?'+ combo':'',v.boleto?'+ boleto':''].filter(Boolean).join(' ')||'honorario'}</div></div>
          <button class="btn btn-pr btn-sm" data-detail="${v.id}">Ver detalle →</button>
        </div>
      </div></div>`;
    const html=`
      ${ui.ph('Visitas Disponibles', p.name+' · '+p.ronda+' · '+list.length+' oportunidades para tu perfil')}
      <div class="flex wrap" style="gap:8px;margin-bottom:12px">
        <select class="sel" id="fQuin" style="width:auto"><option value="">📆 Toda quincena</option>${p.quincenas.map(q=>`<option>${q}</option>`).join('')}</select>
        <select class="sel" id="fEsc" style="width:auto"><option value="">🎯 Todo escenario</option>${p.scenarios.map(s=>`<option>${s}</option>`).join('')}</select>
        <select class="sel" id="fCanal" style="width:auto"><option value="">📲 Todo canal</option>${(p.canales||[]).map(s=>`<option>${s}</option>`).join('')}</select>
      </div>
      ${ui.aiBox('Filtradas y priorizadas según tu país, perfil y disponibilidad. Las visitas se derivan de la hoja de ruta del proyecto (online, importada o creada en la plataforma).','Para ti ✨')}
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
