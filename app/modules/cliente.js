/* CXOrbia · Portal del Cliente — Panorama · Sucursales & Score · Planes de Acción */

/* ---------- helpers UI compartidos del portal del cliente ---------- */
CX.cliUI = {
  TONE_VAR:{g:'var(--green)',b:'var(--brand)',a:'var(--amber)',r:'var(--red)'},

  /* anillo de score con conic-gradient */
  donut(v,size=72){
    const C=CX.clienteData, col=this.TONE_VAR[C.tone(v)];
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:conic-gradient(${col} ${v*3.6}deg,var(--panel-2) 0);display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <div style="width:${size-14}px;height:${size-14}px;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;flex-direction:column">
        <b style="font-size:${size*0.28}px;font-family:var(--disp);color:${col};line-height:1">${v}</b>
        <span style="font-size:${size*0.12}px;color:var(--t3)">/100</span></div></div>`;
  },
  pill(v){ const C=CX.clienteData; return `<span class="bdg bdg-${C.tone(v)}">${C.label(v)} · ${v}</span>`; },
  delta(d){ if(!d) return `<span style="color:var(--t3);font-size:12px">—</span>`;
    const up=d>0; return `<span style="font-size:12px;font-weight:700;color:${up?'var(--green)':'var(--red)'}">${up?'▲':'▼'} ${Math.abs(d)} pts</span>`; },

  /* conmutador de persona (Director / Gerente Regional / Responsable de Sucursal) */
  personaBarHTML(){
    const u=CX.session.user||{}, role=u.clienteRole||'director';
    const p=CX.data.project(), C=CX.clienteData;
    let scope='Toda la marca';
    if(role==='regional') scope='Región: '+(u.scopeRegion||C.topRegion(p));
    if(role==='sucursal'){ const s=C.sucursales(p).find(x=>x.id===u.scopeSucursal)||C.sucursales(p).slice(-1)[0]; scope='Sucursal: '+(s?s.name:'—'); }
    const opts=CX.CLIENTE_ROLES.map(r=>`<option value="${r.id}" ${r.id===role?'selected':''}>${r.label}</option>`).join('');
    return `<div class="card" style="padding:10px 14px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">Ver como</span>
      <select class="sel" id="cliPersonaSel" style="width:auto;min-width:200px">${opts}</select>
      <span class="bdg bdg-b">${scope}</span>
      <span style="flex:1"></span>
      <span style="font-size:11.5px;color:var(--t3)">Programa: <b style="color:var(--t1)">${p.name}</b> · permisos y datos acotados por rol</span>
    </div>`;
  },
  wirePersona(){
    const sel=document.getElementById('cliPersonaSel'); if(!sel) return;
    sel.addEventListener('change',()=>{
      const role=sel.value, u=CX.session.user, p=CX.data.project(), C=CX.clienteData;
      u.clienteRole=role;
      if(role==='regional') u.scopeRegion=C.topRegion(p);
      if(role==='sucursal'){ const list=C.sucursales(p); u.scopeSucursal=list[list.length-1].id; }
      CX.session.save(); CX.router.nav(CX.session.view);
    });
  },

  /* visitas sintéticas de una sucursal (determinísticas) para histórico/evidencia */
  branchVisits(suc){
    let s=0; for(let i=0;i<suc.id.length;i++)s=(s*31+suc.id.charCodeAt(i))|0; s=Math.abs(s)+3;
    const rnd=()=>(s=s*16807%2147483647)/2147483647;
    const esc=(CX.data.project().scenarios)||['Visita estándar'];
    return Array.from({length:suc.visitas},(_,i)=>({
      fecha:'2026-'+(rnd()>.5?'06':'05')+'-'+String(3+Math.floor(rnd()*25)).padStart(2,'0'),
      escenario:esc[Math.floor(rnd()*esc.length)],
      score:Math.max(40,Math.min(100,suc.score+Math.round((rnd()-0.5)*22))),
      shopper:CX.clienteData.NAMES[Math.floor(rnd()*CX.clienteData.NAMES.length)],
    })).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  },

  /* modal de detalle de sucursal */
  branchModal(suc){
    const C=CX.clienteData, ui=CX.ui, prog=C.programa();
    const secRows=prog.map(sec=>{
      const v=suc.sectionScores[sec.id]||0;
      return `<div class="flex" style="margin-bottom:10px;gap:10px">
        <span style="width:160px;font-size:12px;color:var(--t2);flex-shrink:0">${sec.name}<span style="color:var(--t3)"> · ${sec.weight}%</span></span>
        <div class="bar" style="flex:1"><i style="width:${v}%;background:${this.TONE_VAR[C.tone(v)]}"></i></div>
        <b style="width:30px;text-align:right;font-size:12px;font-family:var(--disp)">${v}</b></div>`;
    }).join('');
    const vis=this.branchVisits(suc);
    const visRows=vis.slice(0,6).map(v=>`<tr><td style="font-size:12px">${v.fecha}</td><td style="font-size:12px">${v.escenario}</td>
      <td style="font-size:12px;color:var(--t3)">${v.shopper}</td><td>${this.pill(v.score)}</td></tr>`).join('');
    ui.modal(suc.name, `
      <div class="between" style="margin-bottom:16px;gap:14px;flex-wrap:wrap">
        <div class="flex" style="gap:14px">${this.donut(suc.score,76)}
          <div><div class="card-t" style="font-size:16px">${suc.name}</div>
          <div style="font-size:12px;color:var(--t3)">${CX.paisFlag(suc.pais)} ${suc.ciudad} · ${suc.region}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:3px">Responsable: <b>${suc.responsable}</b></div>
          <div style="margin-top:6px">${this.pill(suc.score)} ${this.delta(suc.delta)}</div></div></div>
      </div>
      <div class="grid g4" style="margin-bottom:16px">
        ${ui.kpi('Visitas',suc.visitas,'b')}${ui.kpi('NPS',suc.nps,'p')}
        ${ui.kpi('vs. periodo previo',(suc.delta>0?'+':'')+suc.delta,suc.delta>=0?'g':'r','pts')}${ui.kpi('Última visita',suc.lastVisit.slice(5),'n')}
      </div>
      <div class="card-t" style="font-size:13px;margin-bottom:10px">Score por sección (ponderado)</div>
      ${secRows}
      <div class="card-t" style="font-size:13px;margin:18px 0 8px">Histórico de visitas</div>
      <table class="tbl"><thead><tr><th>Fecha</th><th>Escenario</th><th>Evaluador</th><th>Score</th></tr></thead><tbody>${visRows}</tbody></table>
      <div class="flex" style="flex-wrap:wrap;gap:8px;margin-top:18px;justify-content:flex-end">
        <button class="btn btn-soft btn-sm" data-act="reconocimiento">★ Reconocer</button>
        <button class="btn btn-soft btn-sm" data-act="incentivo">🎁 Incentivo</button>
        <button class="btn btn-soft btn-sm" data-act="mejora">📈 Plan de mejora</button>
        <button class="btn btn-soft btn-sm" data-act="sancion">⚠ Sancionar</button>
        <button class="btn btn-ghost btn-sm" data-export>📤 Exportar ficha</button>
      </div>
    `, {onMount:(ov,close)=>{
      ov.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>{ close(); CX.cliUI.accionModal({tipo:b.dataset.act, sucId:suc.id, sucursal:suc.name, responsable:suc.responsable}); }));
      ov.querySelector('[data-export]').addEventListener('click',()=>CX.ui.toast('Ficha de '+suc.name+' exportada (PDF demo)','ok'));
    }});
  },

  ACC_META:{
    reconocimiento:{label:'Reconocimiento',icon:'★',tone:'g'},
    incentivo:{label:'Incentivo',icon:'🎁',tone:'b'},
    mejora:{label:'Plan de mejora',icon:'📈',tone:'a'},
    sancion:{label:'Sanción',icon:'⚠',tone:'r'},
  },

  /* alta de plan de acción */
  accionModal(prefill={}){
    const p=CX.data.project(), C=CX.clienteData, ui=CX.ui;
    const sucOpts=C.scoped(p).map(s=>`<option value="${s.id}" ${s.id===prefill.sucId?'selected':''}>${s.name}</option>`).join('');
    const tipoOpts=Object.keys(this.ACC_META).map(k=>`<option value="${k}" ${k===prefill.tipo?'selected':''}>${this.ACC_META[k].icon} ${this.ACC_META[k].label}</option>`).join('');
    ui.modal('Nueva acción', `
      <div class="grid g2" style="gap:12px 14px">
        <div><label class="lbl">Tipo de acción</label><select class="sel" id="ac_tipo">${tipoOpts}</select></div>
        <div><label class="lbl">Sucursal</label><select class="sel" id="ac_suc">${sucOpts}</select></div>
        <div style="grid-column:1/3"><label class="lbl">Título</label><input class="inp" id="ac_tit" placeholder="Ej. Plan de mejora en tiempos de servicio" value="${prefill.titulo||''}"></div>
        <div style="grid-column:1/3"><label class="lbl">Detalle</label><textarea class="inp" id="ac_det" rows="3" placeholder="Acciones, plazos y meta…"></textarea></div>
        <div><label class="lbl">Responsable</label><input class="inp" id="ac_resp" value="${prefill.responsable||''}" placeholder="Nombre del responsable"></div>
        <div><label class="lbl">Fecha límite</label><input class="inp" id="ac_fec" type="date"></div>
      </div>
      <div style="text-align:right;margin-top:16px"><button class="btn btn-green" id="ac_save">Crear acción</button></div>
    `, {onMount:(ov,close)=>{
      ov.querySelector('#ac_save').addEventListener('click',()=>{
        const tipo=ov.querySelector('#ac_tipo').value;
        const sucId=ov.querySelector('#ac_suc').value;
        const suc=C.sucursales(p).find(s=>s.id===sucId)||{};
        const tit=(ov.querySelector('#ac_tit').value||'').trim();
        if(!tit){ CX.ui.toast('Ponle un título a la acción','err'); return; }
        C.addAccion(p,{tipo, sucId, sucursal:suc.name||'', titulo:tit,
          detalle:(ov.querySelector('#ac_det').value||'').trim(),
          responsable:(ov.querySelector('#ac_resp').value||'').trim()||'—',
          limite:ov.querySelector('#ac_fec').value||''});
        close(); CX.ui.toast('Acción creada','ok'); CX.router.nav('cli_acciones');
      });
    }});
  },
};

/* ============== Panorama ejecutivo ============== */
CX.module('cli_dashboard', ({ui})=>{
  const C=CX.clienteData, p=CX.data.project();
  const list=C.scoped(p), R=C.resumen(list);
  const distrib=[['Excelente','g',list.filter(s=>s.score>=85).length],['Bueno','b',list.filter(s=>s.score>=75&&s.score<85).length],
    ['En atención','a',list.filter(s=>s.score>=65&&s.score<75).length],['Crítico','r',list.filter(s=>s.score<65).length]];
  const tot=list.length||1;
  const rankRow=(s,i)=>`<div class="card hov flex" data-suc="${s.id}" style="padding:10px 12px;gap:10px;cursor:pointer">
    <b style="width:18px;color:var(--t3);font-family:var(--disp)">${i+1}</b>
    <div style="flex:1;min-width:0"><b style="font-size:13px">${s.name}</b><div style="font-size:11px;color:var(--t3)">${s.region}</div></div>
    ${CX.cliUI.delta(s.delta)} ${CX.cliUI.pill(s.score)}</div>`;

  setTimeout(()=>{ CX.cliUI.wirePersona();
    document.querySelectorAll('[data-suc]').forEach(el=>el.addEventListener('click',()=>{const s=C.sucursales(p).find(x=>x.id===el.dataset.suc); if(s)CX.cliUI.branchModal(s);}));
    const sucList=(arr,title)=>ui.modal(title+' ('+arr.length+')',arr.length?`<table class="tbl"><thead><tr><th>Sucursal</th><th>Región</th><th>Score</th><th>Δ</th></tr></thead><tbody>${arr.map(s=>`<tr class="hov" data-sk="${s.id}" style="cursor:pointer"><td><b>${s.name}</b></td><td style="font-size:12px">${s.region}</td><td>${CX.cliUI.pill(s.score)}</td><td>${CX.cliUI.delta(s.delta)}</td></tr>`).join('')}</tbody></table>`:CX.ui.empty('🏪','Sin sucursales en esta categoría.'),{onMount:(ov,close)=>ov.querySelectorAll('[data-sk]').forEach(tr=>tr.addEventListener('click',()=>{close();const s=C.sucursales(p).find(x=>x.id===tr.dataset.sk);if(s)CX.cliUI.branchModal(s);}))});
    const ckMap={nps:()=>ui.modal('NPS de marca',`<p style="font-size:13px;color:var(--t2);line-height:1.7">El NPS (${R.nps}) resume la propensión a recomendar derivada de los cuestionarios. Sube cuando cierras brechas en las secciones débiles y reduces sucursales críticas.</p>`),
      exc:()=>sucList(list.filter(s=>s.score>=85),'Sucursales excelentes'),
      crit:()=>sucList(list.filter(s=>s.score<70),'Sucursales críticas'),
      mej:()=>sucList(list.filter(s=>(s.delta||0)>0),'Sucursales mejorando')};
    document.querySelectorAll('#cliKpis [data-ck]').forEach(el=>el.addEventListener('click',()=>ckMap[el.dataset.ck]&&ckMap[el.dataset.ck]()));
    const rr=C.realResults(p);
    const liveEl=document.getElementById('cliLive'); if(liveEl&&rr.count) liveEl.addEventListener('click',()=>{
      ui.modal('Resultados en vivo de operación ('+rr.count+')', `<table class="tbl"><thead><tr><th>Sucursal</th><th>Evaluador</th><th>Score</th></tr></thead><tbody>${rr.visitas.map(v=>`<tr><td><b style="font-size:12.5px">${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td><td style="font-size:12px">${v.shopper||'—'}</td><td>${CX.cliUI.pill(v.score)}</td></tr>`).join('')}</tbody></table>`);
    });
  },0);

  const rr=C.realResults(p);
  const liveBlock = rr.count ? `
    <div class="card card-p" id="cliLive" style="margin-bottom:16px;cursor:pointer;border-left:4px solid var(--green);background:#f0fbf4">
      <div class="between" style="flex-wrap:wrap;gap:10px">
        <div class="flex" style="gap:14px;align-items:center">${CX.cliUI.donut(rr.avg,60)}
          <div><div class="card-t" style="font-size:14px">🟢 Resultados en vivo de operación</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px"><b>${rr.count}</b> cuestionario(s) enviados por evaluadores · score real promedio <b>${rr.avg}</b>${rr.ko?` · <span style="color:var(--red)">${rr.ko} con KO</span>`:''}</div>
          <div style="font-size:11px;color:var(--t3);margin-top:3px">Alimentado directamente por el cuestionario ponderado del programa · toca para ver el detalle →</div></div></div>
      </div>
    </div>` : '';

  return `
    ${ui.ph('Panorama de '+p.name, 'Resultados de la marca · score ponderado por programa')}
    ${CX.cliUI.personaBarHTML()}
    ${liveBlock}
    <div class="flex" style="gap:16px;align-items:stretch;margin-bottom:16px;flex-wrap:wrap">
      <div class="card card-p flex" style="gap:16px;min-width:260px;flex:1">
        ${CX.cliUI.donut(R.score,86)}
        <div><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">Score global</div>
          <div style="font-size:13px;color:var(--t2);margin-top:4px">${R.n} sucursales · ${R.visitas} visitas</div>
          <div style="margin-top:8px">${CX.cliUI.pill(R.score)}</div></div>
      </div>
      <div class="grid g2" style="flex:2;min-width:300px;gap:12px" id="cliKpis">
        <div data-ck="nps" style="cursor:pointer">${ui.kpi('NPS de marca',R.nps,'p')}</div>
        <div data-ck="exc" style="cursor:pointer">${ui.kpi('Excelentes',R.excelentes,'g','score ≥ 85')}</div>
        <div data-ck="crit" style="cursor:pointer">${ui.kpi('Sucursales críticas',R.criticas,'r','score < 70')}</div>
        <div data-ck="mej" style="cursor:pointer">${ui.kpi('Mejorando',R.mejora,'b','vs. periodo previo')}</div>
      </div>
    </div>
    <div class="grid g2" style="gap:16px;margin-bottom:16px">
      <div class="card card-p"><div class="card-h"><div class="card-t">🏆 Mejores sucursales</div></div>
        <div class="grid" style="gap:8px">${R.top.map(rankRow).join('')}</div></div>
      <div class="card card-p"><div class="card-h"><div class="card-t">⚠ Requieren atención</div></div>
        <div class="grid" style="gap:8px">${R.bottom.map(rankRow).join('')}</div></div>
    </div>
    <div class="grid g2" style="gap:16px">
      <div class="card card-p"><div class="card-h"><div class="card-t">Distribución por nivel</div></div>
        ${distrib.map(d=>ui.bar(Math.round(d[2]/tot*100),d[0],d[2])).join('')}
      </div>
      <div class="card card-p"><div class="card-h"><div class="card-t">Fortalezas y brechas (por sección)</div></div>
        <div class="flex" style="gap:10px;margin-bottom:12px">
          <div class="kpi g" style="flex:1"><div class="k-l">Más fuerte</div><div class="k-v" style="font-size:16px">${R.mejorSeccion.sec.name}</div><div class="k-s">${R.mejorSeccion.val}/100</div></div>
          <div class="kpi r" style="flex:1"><div class="k-l">Mayor brecha</div><div class="k-v" style="font-size:16px">${R.peorSeccion.sec.name}</div><div class="k-s">${R.peorSeccion.val}/100</div></div>
        </div>
        ${ui.aiBox('La brecha en "'+R.peorSeccion.sec.name+'" arrastra el score. Sugiero un plan de acción + capacitación dirigida y reevaluar en 30 días.','Recomendación')}
      </div>
    </div>`;
});

/* ============== Sucursales & Score ============== */
CX.module('cli_sucursales', ({ui})=>{
  const C=CX.clienteData, p=CX.data.project();
  const all=C.scoped(p);
  const card=(s)=>`<div class="card hov" data-suc="${s.id}" style="padding:14px;cursor:pointer">
    <div class="flex" style="gap:12px">${CX.cliUI.donut(s.score,58)}
      <div style="flex:1;min-width:0"><b style="font-size:13.5px">${s.name}</b>
        <div style="font-size:11px;color:var(--t3)">${CX.paisFlag(s.pais)} ${s.ciudad} · ${s.region}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:3px">${s.responsable} · ${s.visitas} visitas</div>
        <div style="margin-top:6px">${CX.cliUI.delta(s.delta)}</div></div></div></div>`;

  const regions=C.regions(p);
  const render=(L)=>document.getElementById('cliGrid').innerHTML=L.length?L.map(card).join(''):CX.ui.empty('🔍','Sin sucursales para este filtro.');
  setTimeout(()=>{ CX.cliUI.wirePersona();
    const grid=document.getElementById('cliGrid');
    const bind=()=>grid.querySelectorAll('[data-suc]').forEach(el=>el.addEventListener('click',()=>{const s=all.find(x=>x.id===el.dataset.suc); if(s)CX.cliUI.branchModal(s);}));
    bind();
    const q=document.getElementById('cliSearch'), reg=document.getElementById('cliReg'), ord=document.getElementById('cliOrd');
    const apply=()=>{ let L=all.slice();
      const t=(q.value||'').toLowerCase().trim(); if(t)L=L.filter(s=>(s.name+s.ciudad+s.region+s.responsable).toLowerCase().includes(t));
      if(reg.value)L=L.filter(s=>s.region===reg.value);
      if(ord.value==='peor')L.sort((a,b)=>a.score-b.score); else if(ord.value==='mejor')L.sort((a,b)=>b.score-a.score);
      render(L); bind(); };
    [q,reg,ord].forEach(e=>e&&e.addEventListener('input',apply));
  },0);

  return `
    ${ui.ph('Sucursales & Score', 'Puntuación ponderada por programa · toca una sucursal para el detalle')}
    ${CX.cliUI.personaBarHTML()}
    <div class="card card-p" style="margin-bottom:16px">
      <div class="flex" style="gap:8px;flex-wrap:wrap">
        <input class="inp" id="cliSearch" placeholder="Buscar sucursal, ciudad, responsable…" style="flex:1;min-width:200px">
        <select class="sel" id="cliReg" style="width:auto"><option value="">Todas las regiones</option>${regions.map(r=>`<option>${r}</option>`).join('')}</select>
        <select class="sel" id="cliOrd" style="width:auto"><option value="mejor">Mejor score primero</option><option value="peor">Menor score primero</option></select>
      </div>
    </div>
    <div class="grid g3" id="cliGrid" style="gap:14px">${all.map(card).join('')}</div>`;
});

/* ============== Planes de Acción ============== */
CX.module('cli_acciones', ({ui})=>{
  const C=CX.clienteData, p=CX.data.project();
  const M=CX.cliUI.ACC_META;
  const render=()=>{
    const acc=C.acciones(p);
    const f=window.__cliAccFilter||'';
    const L=f?acc.filter(a=>a.tipo===f):acc;
    const card=(a)=>{ const m=M[a.tipo]||{label:a.tipo,icon:'•',tone:'n'};
      return `<div class="card card-p" style="border-left:4px solid var(--${m.tone==='n'?'border':m.tone==='g'?'green':m.tone==='b'?'brand':m.tone==='a'?'amber':'red'})">
        <div class="between" style="gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:0"><div class="flex" style="gap:8px"><span>${m.icon}</span><b style="font-size:13.5px">${a.titulo}</b></div>
            <div style="font-size:12px;color:var(--t2);margin-top:4px">${a.detalle||''}</div>
            <div class="flex" style="gap:8px;margin-top:8px;flex-wrap:wrap">${ui.bdg(m.label,m.tone)} ${ui.bdg(a.sucursal||'—','n')} <span style="font-size:11px;color:var(--t3)">${a.responsable||''} · ${a.fecha||''}</span></div>
          </div>${ui.bdg(a.estado||'Abierto', a.estado==='En curso'?'a':a.estado==='Cerrado'?'g':'b')}</div></div>`; };
    document.getElementById('accList').innerHTML=L.length?L.map(card).join(''):CX.ui.empty('🎯','Sin acciones en esta categoría.');
  };
  setTimeout(()=>{ CX.cliUI.wirePersona();
    document.getElementById('accNew').addEventListener('click',()=>CX.cliUI.accionModal({}));
    document.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>{
      window.__cliAccFilter=b.dataset.f; document.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('btn-pr',x===b));
      document.querySelectorAll('[data-f]').forEach(x=>{if(x!==b)x.classList.add('btn-soft');}); b.classList.remove('btn-soft'); render();
    }));
    render();
  },0);
  const acc=C.acciones(p);
  const count=(t)=>acc.filter(a=>a.tipo===t).length;
  return `
    ${ui.ph('Planes de Acción', 'Decisiones a partir de resultados: incentivos, reconocimientos, mejora y sanciones')}
    ${CX.cliUI.personaBarHTML()}
    <div class="between" style="margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div class="flex" style="gap:6px;flex-wrap:wrap">
        <button class="btn btn-sm btn-pr" data-f="">Todas (${acc.length})</button>
        <button class="btn btn-sm btn-soft" data-f="reconocimiento">★ Reconocimientos (${count('reconocimiento')})</button>
        <button class="btn btn-sm btn-soft" data-f="incentivo">🎁 Incentivos (${count('incentivo')})</button>
        <button class="btn btn-sm btn-soft" data-f="mejora">📈 Mejora (${count('mejora')})</button>
        <button class="btn btn-sm btn-soft" data-f="sancion">⚠ Sanciones (${count('sancion')})</button>
      </div>
      <button class="btn btn-pr btn-sm" id="accNew">+ Nueva acción</button>
    </div>
    <div class="grid" id="accList" style="gap:12px"></div>`;
});
