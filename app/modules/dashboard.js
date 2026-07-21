/* CXOrbia · Dashboard Operativo (admin) — KPIs clickeables, filtro de meses,
   comparativo último trimestre, notificación WhatsApp. Genérico multipaís. */
CX.module('dashboard', ({data,ui})=>{
  const p=data.period();
  const BF=data.visitBucketFns;
  const ALL=!!CX.session._dashAll;
  const cs=ALL?[...new Set(data._visitas.filter(v=>data.inScope(v.pais)).map(v=>v.pais))]:p.countries;
  /* Bloque 9 (corrección V103, 20260711): el archivado (soft-delete) marca v._archived=true pero
     nunca elimina el registro — este pool() es la fuente única del dashboard, así que excluir
     _archived aquí basta para que una visita archivada no vuelva a aparecer en KPIs/listados
     activos, sin haber desaparecido físicamente de data._visitas (sigue accesible por su id/
     sourceRef para auditoría). */
  const pool=()=>(ALL?data._visitas.filter(v=>data.inScope(v.pais)):data.visitas()).filter(v=>!v._archived);
  const phaseCount=(fn)=>{const arr=pool();const o={t:arr.filter(fn).length};cs.forEach(c=>o[c]=arr.filter(x=>x.pais===c&&fn(x)).length);return o;};
  /* R19 Gate 1 (20260715): antes, con !ALL, k se tomaba de CX.data.kpis() — una función DISTINTA
     de phaseCount()/pool() de este módulo (no excluye _archived), mientras el modal de detalle
     (drill) siempre usa pool() (sí excluye _archived). Resultado reproducido: el tile "Pend.
     realizar" mostraba un conteo y su modal mostraba 0 filas — dos fuentes distintas para el
     mismo número. Ahora k SIEMPRE se calcula con la MISMA pool()/phaseCount() que alimenta el
     drill, sin importar ALL — una sola fuente, tile y detalle nunca pueden divergir. */
  const k={
    total:phaseCount(()=>true), asignadas:phaseCount(BF.asignadas),
    sinAsignar:phaseCount(BF.sinAsignar),
    sinAgendar:phaseCount(BF.sinAgendar),
    agendadas:phaseCount(BF.agendadas),
    realizadas:phaseCount(BF.realizadas),
    pendRealizar:phaseCount(BF.pendRealizar),
    cuestPend:phaseCount(BF.cuestPend),
    sinSubmitir:phaseCount(BF.sinSubmitir),
    liquidadas:phaseCount(BF.liquidadas),
    fueraRango:phaseCount(BF.fueraRango),
    postPend:data._posts.filter(pp=>pp.estado==='pendiente'&&data.inScope(pp.pais)&&!pp._archived).length,
  };
  const phaseFlow=(c)=>{const arr=pool().filter(x=>x.pais===c);const t=arr.length||1;const n=fn=>arr.filter(fn).length;const pc=x=>Math.round(x/t*100);
    const real=n(x=>['realizada','cuestionario','liquidada'].includes(x.estado));const agen=n(x=>['agendada','realizada','cuestionario','liquidada'].includes(x.estado));
    return {total:arr.length,asign:[n(x=>x.shopperId),pc(n(x=>x.shopperId))],agend:[agen,pc(agen)],
      sinAgend:[n(x=>x.estado==='asignada'),pc(n(x=>x.estado==='asignada'))],sinAsign:[n(x=>!x.shopperId&&x.estado!=='fuera_rango'),pc(n(x=>!x.shopperId&&x.estado!=='fuera_rango'))],
      real:[real,pc(real)],cuest:[n(x=>x.estado==='realizada'),pc(n(x=>x.estado==='realizada'))],submit:[n(x=>x.estado==='cuestionario'),pc(n(x=>x.estado==='cuestionario'))],liq:[n(x=>x.estado==='liquidada'),pc(n(x=>x.estado==='liquidada'))]};};
  const shoppersPool=ALL?data.shoppers.filter(s=>data.inScope(s.pais)):data.shoppersFor();
  const split=(o)=>cs.map(c=>c+':'+(o[c]||0)).join(' · ');
  const months=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

  /* drill de un KPI: listado + WA individual por fila + selección múltiple para notificar */
  const drill=(titulo, filtroFn, waMsg)=>{
    const vis=pool().filter(filtroFn);
    const rows=vis.length?vis.slice(0,40).map(v=>`<tr data-vrow="${v.id}"><td style="width:30px;text-align:center"><input type="checkbox" class="drSel" data-vid="${v.id}" ${v.shopper?'':'disabled'}></td>
      <td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td>
      <td style="font-size:12px">${v.shopper||'<span class="muted">— sin asignar</span>'}</td><td>${ui.estadoBadge(v.estado)}</td>
      <td style="font-size:11.5px;color:var(--t2)">${data.measurementWindow(v).label}</td>
      <td style="font-size:12px">${v.agendada?('📅 agend. '+v.agendada):(v.disponibleDesde?('disp. desde '+v.disponibleDesde):'—')}</td>
      <td style="text-align:right;white-space:nowrap">${v.shopper?`<button class="btn btn-soft btn-sm drWa" data-vid="${v.id}" title="WhatsApp a ${v.shopper} — borrador manual, no envío automático salvo Make activo">📲</button> <button class="btn btn-ghost btn-sm drMail" data-vid="${v.id}" title="Correo">✉️</button>`:'<span class="muted" style="font-size:11px">—</span>'}</td></tr>`).join('')
      : '<tr><td colspan="7">'+ui.empty('🔍','Sin visitas en este KPI')+'</td></tr>';
    ui.modal(titulo+' · '+vis.length, `
      ${vis.length?`<input class="inp" id="drFind" placeholder="🔍 Buscar sucursal, shopper o ciudad…" style="margin-bottom:10px">
        <div class="between" style="margin-bottom:10px"><label class="flex" style="gap:6px;font-size:12px;color:var(--t2);cursor:pointer"><input type="checkbox" id="drAll"> Seleccionar todos</label>
        <div class="flex" style="gap:6px"><button class="btn btn-soft btn-sm" id="drWaSel" title="Borrador manual salvo que la conexión con Make esté activa">📲 WhatsApp a seleccionados (<span id="drN">0</span>)</button><button class="btn btn-ghost btn-sm" id="drMailSel">✉️ Correo</button></div></div>`:''}
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th></th><th>Sucursal</th><th>Shopper</th><th>Estado</th><th>Periodo de medición</th><th>Fecha (agenda / disp.)</th><th style="text-align:right">Contacto</th></tr></thead><tbody id="drBody">${rows}</tbody></table></div>
      ${waMsg?`<div style="margin-top:12px;background:var(--green-bg);border-radius:10px;padding:10px 12px;font-size:11.5px;color:#0a7050">💡 ${waMsg} — elige a quiénes contactar arriba, o usa el botón por fila.</div>`:''}
      ${vis.length>40?`<div class="muted" style="font-size:11px;margin-top:8px">+${vis.length-40} más…</div>`:''}
    `,{onMount:(ov,close)=>{
      const dFind=ov.querySelector('#drFind');
      if(dFind)dFind.addEventListener('input',()=>{const q=dFind.value.toLowerCase();ov.querySelectorAll('#drBody tr[data-vrow]').forEach(tr=>{tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none';});});
      const sel=()=>[...ov.querySelectorAll('.drSel:checked')].map(c=>c.dataset.vid);
      const upd=()=>{const n=sel().length;const el=ov.querySelector('#drN');if(el)el.textContent=n;};
      const all=ov.querySelector('#drAll'); if(all)all.addEventListener('change',()=>{ov.querySelectorAll('.drSel:not(:disabled)').forEach(c=>c.checked=all.checked);upd();});
      ov.querySelectorAll('.drSel').forEach(c=>c.addEventListener('change',upd));
      const vget=(id)=>pool().find(x=>x.id===id)||{};
      const sendWa=(ids)=>{ if(!ids.length){ui.toast('Selecciona al menos un shopper','warn');return;}
        const hasHook=!!(CX.automations&&CX.automations.hook&&CX.automations.hook());
        ids.forEach(id=>{const v=vget(id);if(hasHook){CX.automations&&CX.automations._pushLog({fecha:new Date().toISOString().slice(0,16).replace('T',' '),canal:'whatsapp',evento:'recordatorio',titulo:'Recordatorio',txt:(v.shopper||'')+' · '+v.sucursal,hook:CX.automations.hook()});}else{const wa=(v.shopperWa||v.whatsapp||'');const msg=encodeURIComponent('Hola '+(v.shopper||'Evaluador')+', recordatorio: tu visita en '+v.sucursal+'. Por favor confírmanos.');if(wa){window.open('https://wa.me/'+wa.replace(/[^0-9]/g,'')+'?text='+msg,'_blank');}else{ui.toast('Sin número WA para '+(v.shopper||'el shopper')+' — agrégalo en su perfil','warn',2500);}}});
        ui.toast(hasHook?'WhatsApp preparado vía Make ('+ids.length+') · se envía cuando la conexión esté activa':'WhatsApp Web abierto para '+ids.length+' shopper(s)','ok',3200); };
      ov.querySelectorAll('.drWa').forEach(b=>b.addEventListener('click',()=>sendWa([b.dataset.vid])));
      ov.querySelectorAll('.drMail').forEach(b=>b.addEventListener('click',()=>ui.toast('Borrador de correo preparado para '+(vget(b.dataset.vid).shopper||'shopper')+' (envío pendiente de conexión con Outlookiente)','ok')));
      const ws=ov.querySelector('#drWaSel'); if(ws)ws.addEventListener('click',()=>sendWa(sel()));
      const msel=ov.querySelector('#drMailSel'); if(msel)msel.addEventListener('click',()=>{const n=sel().length;if(!n){ui.toast('Selecciona al menos uno','warn');return;}ui.toast('Correo preparado para '+n+' shopper(s) · envío por backend/Outlook pendiente','ok');});
    }});
  };

  /* tile clickeable */
  const tile=(id,label,o,tone,filtroFn,wa)=>`<div class="kpi ${tone}" data-kpi="${id}" style="cursor:pointer"><div class="k-l">${label} ›</div>
    <div class="k-v">${o.t}</div><div class="k-s">${split(o)}</div></div>`;

  const fases=cs.map(c=>{
    const f=phaseFlow(c);
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

  /* GAP3 (paquete V111→V112, 20260714): el top-5 ordenaba TODOS los shoppers del pool
     (incluyendo referencias protegidas y perfiles sin rating) con `.sort((a,b)=>b.rating-a.rating)`
     — sin rating numérico, la comparación produce NaN/orden arbitrario y una referencia protegida
     puede colarse en el ranking. Ahora usa data.rankableShoppers() (nivel≠protected_reference Y
     rating numérico real) como única fuente de quién es rankeable. */
  const top=data.rankableShoppers(shoppersPool).sort((a,b)=>b.rating-a.rating).slice(0,5);

  const alerts=[];
  if(k.sinAsignar.t) alerts.push(['r','sinasign',`${k.sinAsignar.t} sin asignar (${split(k.sinAsignar)})`]);
  if(k.sinAgendar.t) alerts.push(['a','sinagend',`${k.sinAgendar.t} asignadas sin fecha programada`]);
  if(k.cuestPend.t)  alerts.push(['a','cuest',`${k.cuestPend.t} realizadas sin cuestionario`]);
  if(k.fueraRango.t) alerts.push(['r','fuera',`${k.fueraRango.t} fuera de rango`]);

  /* comparativo del último trimestre (3 meses) — el mes actual sale de datos REALES; los previos se derivan */
  const _mNow=new Date().getMonth();
  const trimestre=[months[(_mNow+10)%12],months[(_mNow+11)%12],months[_mNow]];
  const cumplNow=Math.round(k.realizadas.t/Math.max(k.total.t,1)*100);
  const cobNow=Math.min(100,Math.round(k.asignadas.t/Math.max(k.total.t,1)*100));
  const realNow=k.realizadas.t;
  /* Bloque 4 (corrección V103, 20260711): bug real — margenNow caía a un fallback fijo `38`
     cuando CX.fin.porPais no devolvía datos, SIN ningún gate de modo. Ahora el fallback fijo
     solo aplica en demo; fuera de demo sin fuente financiera real, margenNow es null y el KPI
     de "Margen neto" se muestra como pending_source en vez de un 38% inventado. */
  const _showFixturesDashEarly = CX.dataSource ? CX.dataSource.showFixtures() : true;
  const margenNow=(()=>{const fp=CX.fin?CX.fin.porPais(data):null;if(!fp)return _showFixturesDashEarly?38:null;const cs=Object.keys(fp);const m=cs.reduce((a,c)=>a+(fp[c].margenPct||0),0)/(cs.length||1);return Math.round(m);})();
  /* Bloque A (auditoría V101 — 20260711): el comparativo trimestral fabricaba SIEMPRE valores
     históricos (Días Real→Submit fijo [3.1,2.8,2.6]; visitas previas como 62%/82% del mes actual)
     sin ningún guard de modo — presentándolos como si fueran periodos reales. Fuera de demo se
     muestra únicamente el periodo actual (real) y los dos meses previos se marcan explícitamente
     "sin fuente" en vez de calcularse con una fórmula sintética. */
  const _showFixturesDash = CX.dataSource ? CX.dataSource.showFixtures() : true;
  const back=(now,step,floor)=>_showFixturesDash?[Math.max(floor==null?0:floor,now-step*2),Math.max(floor==null?0:floor,now-step),now]:[null,null,now];
  const kpisTrim=[
    {n:'% Cumplimiento', vals:back(cumplNow,8,0), suf:'%', up:true},
    {n:'Días Real→Submit', vals:_showFixturesDash?[3.1,2.8,2.6]:[null,null,null], suf:'d', up:false},
    {n:'Visitas realizadas', vals:_showFixturesDash?[Math.round(realNow*0.62),Math.round(realNow*0.82),realNow]:[null,null,realNow], suf:'', up:true},
    /* P0-9 (paquete acumulado 20260711): estos dos KPIs fabricaban "cumplimiento+6" y
       "cumplimiento+8" como si fueran una métrica real e independiente — incluso fuera de demo,
       donde el valor "actual" seguía siendo esa fórmula sintética (solo el histórico se anulaba).
       Fuera de demo no existe fuente para "a tiempo"/"calidad" de cuestionario en este prototipo:
       se muestra pending_source (null) en las tres columnas, no solo en las dos históricas. */
    {n:'% Cuestionarios a tiempo', vals:_showFixturesDash?back(Math.min(100,cumplNow+6),5,0):[null,null,null], suf:'%', up:true},
    {n:'Calidad cuestionario (QA)', vals:_showFixturesDash?back(Math.min(100,cumplNow+8),3,0):[null,null,null], suf:'%', up:true},
    {n:'Tasa de reprogramación', vals:_showFixturesDash?[Math.max(0,12),Math.max(0,9),Math.max(0,Math.round((k.sinAgendar?.t||0)/Math.max(k.total.t,1)*100))]:[null,null,Math.max(0,Math.round((k.sinAgendar?.t||0)/Math.max(k.total.t,1)*100))], suf:'%', up:false},
    {n:'Cobertura de sucursales', vals:back(cobNow,9,0), suf:'%', up:true},
    {n:'Margen neto', vals:margenNow==null?[null,null,null]:back(margenNow,3,0), suf:'%', up:true},
  ];
  const trimRows=kpisTrim.map(r=>{
    const hasPrev=r.vals[0]!=null && r.vals[1]!=null;
    const delta=hasPrev?r.vals[2]-r.vals[1]:null; const good=hasPrev?(r.up?delta>=0:delta<=0):null;
    const fmt=(v)=>v==null?'—':(r.suf==='d'?v.toFixed(2)+'d':v+r.suf);
    return `<tr><td><b>${r.n}</b></td>${r.vals.map((v,i)=>`<td style="${i===2?'font-weight:800;color:var(--t1)':''}">${fmt(v)}</td>`).join('')}
      <td style="color:${hasPrev?(good?'var(--green)':'var(--red)'):'var(--t3)'};font-weight:700">${hasPrev?(delta>=0?'▲ +':'▼ ')+Math.abs(delta)+r.suf:'sin fuente'}</td></tr>`;
  }).join('');

  const host=ui.el('div');
  /* P0-1 (paquete V110→V111): retirado `monthSel` — era un selector cosmético que, al cambiar,
     solo mostraba un toast ('Mes: … · datos del periodo activo') sin filtrar NINGÚN dato; el
     único selector real de periodo es el de la barra lateral (rail #periodSel) y el de proyecto
     (#dashProjSel, abajo), que sí invocan el setter canónico CX.data.setProject/setCurrentPeriod.
     El avance real-vs-ideal usa el mes REAL del calendario (no una selección simulada). */
  const selMonth=new Date().getMonth();
  const avanceHTML=`<div class="card card-p" style="margin-bottom:18px">
    <div class="card-h"><div class="card-t">📊 Avance real vs ideal del mes — por país</div><span class="muted" style="font-size:11px">día ${new Date().getDate()} de ${new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate()} · ideal lineal</span></div>
    ${cs.map(c=>{
      const tot=k.total[c]||0, real=k.realizadas[c]||0;
      const diaHoy=new Date().getDate(), diasMes=new Date(new Date().getFullYear(),selMonth+1,0).getDate();
      const idealPct=Math.min(100,Math.round(diaHoy/diasMes*100));
      const realPct=tot?Math.round(real/tot*100):0;
      const gap=realPct-idealPct; const tone=gap>=0?'green':gap>=-15?'amber':'red';
      return `<div style="margin-bottom:13px">
        <div class="between" style="margin-bottom:5px"><span style="font-size:12.5px;font-weight:600;color:var(--t1)">${CX.paisLabel(c)} <span class="muted">${real}/${tot} visitas</span></span>
          <span style="font-size:12px;font-weight:700;color:var(--${tone})">${realPct}% real · ${idealPct}% ideal · ${gap>=0?'▲ +'+gap:'▼ '+gap} pts</span></div>
        <div style="position:relative;height:12px;background:var(--border-2);border-radius:6px;overflow:hidden">
          <div style="position:absolute;inset:0;width:${realPct}%;background:var(--${tone});border-radius:6px"></div>
          <div style="position:absolute;top:-2px;bottom:-2px;left:${idealPct}%;width:2px;background:var(--t1);opacity:.55" title="ideal"></div>
        </div></div>`;
    }).join('')}
    <div style="margin-top:6px">${ui.aiBox('La barra es el avance real; la línea vertical es el avance ideal a hoy (lineal por día del periodo). Si el real va por debajo del ideal, hay riesgo de incumplimiento de la ronda — actúa con recordatorios o reasignaciones.','Ritmo del mes, por país')}</div>
  </div>`;
  host.innerHTML=`
  <div class="between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px">
    <div>${ui.ph('Dashboard Operativo', (ALL?('Todos los proyectos · operación general · '+data.projects.length+' proyectos'):(p.name+' · '+p.industry))+' · '+cs.map(c=>CX.paisFlag(c)).join(' '))}</div>
    <div class="flex" style="flex-wrap:wrap;gap:8px">
      <select class="sel" id="dashProjSel" style="width:auto"><option value="all" ${ALL?'selected':''}>🌐 Todos los proyectos</option>${data.scopedProyectos().map(pg=>`<option value="${pg.key}" ${(!ALL&&pg.key===data.currentProgramKey())?'selected':''}>${pg.name}</option>`).join('')}</select>
      <span class="bdg bdg-b">● Preview operativo</span><button class="btn btn-ghost btn-sm" id="dashExport">⤓ Exportar</button></div>
  </div>
  <div style="font-size:10.5px;color:var(--t3);margin:-6px 0 12px" title="Contrato de contexto único (CX.data.ctx())">tenant ${(CX.data.ctx?CX.data.ctx().tenantId:CX.BRAND.id)||'—'} · rol ${CX.data.ctx?CX.data.ctx().role:CX.session.role} · modo ${CX.data.ctx?CX.data.ctx().dataMode:'demo'}${(()=>{if(!data.visitContract)return '';const arr=pool();const conf=arr.filter(v=>{const vc=data.visitContract(v);return vc&&vc.paymentState==='confirmado';}).length;return ' · '+conf+'/'+arr.length+' visitas con pago confirmado (contrato)';})()}</div>

  <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
    <div style="font-size:12.5px;color:var(--brand-dark)"><b>${months[selMonth]} ${new Date().getFullYear()} ·</b> ${k.total.t} visitas · ${split(k.total)}. Las tarjetas y fases son <b>clickeables</b> para ver su detalle. Multipaís: cada país mantiene su moneda.</div>
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

  ${avanceHTML}

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
    <div class="card-h"><div class="card-t">📈 Comparativo último trimestre — KPIs clave</div><span class="muted" style="font-size:11px">${trimestre.join(' · ')} ${new Date().getFullYear()}</span></div>
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
      <td style="text-align:right;white-space:nowrap"><button class="btn btn-ghost btn-sm bd-det" data-vid="${v.id}" title="Ver detalle">👁</button> ${goBtn} ${v.shopper?waBtn(v,'sobre tu visita en '+v.sucursal)+' '+mailBtn(v,'Visita '+v.sucursal):''}</td>
    </tr>`;
    const bucket=(titulo,color,vis,extraFn,extraLbl,bulkMsg)=>{
      const bid='bk'+Math.random().toString(36).slice(2,7);
      if(!vis.length) return `<div style="margin-bottom:10px"><div style="background:var(--${color}-bg);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:var(--${color})">${titulo} (0)</div></div>`;
      return `<div style="margin-bottom:14px">
        <div class="between bd-toggle" data-bk="${bid}" style="background:var(--${color}-bg);border-radius:8px 8px 0 0;padding:8px 12px;cursor:pointer">
          <span style="font-size:12px;font-weight:800;color:var(--${color})"><span class="bd-caret" style="display:inline-block;width:14px">▾</span> ${titulo} (${vis.length})</span>
          ${bulkMsg&&vis.some(v=>v.shopper)?`<button class="btn btn-soft btn-sm" data-bulk='${encodeURIComponent(bulkMsg)}'>📣 Recordar a todos</button>`:''}
        </div>
        <div id="${bid}" style="overflow-x:auto"><table class="tbl" style="min-width:720px"><thead><tr><th>Ref</th><th>Sucursal</th><th>Shopper</th><th>Escenario</th><th>${extraLbl==='alerta'?'Alerta':'Fecha'}</th><th>Estado</th><th></th></tr></thead>
        <tbody>${vis.slice(0,15).map(v=>boardRow(v,extraFn(v),extraLbl)).join('')}</tbody></table></div>
      </div>`;
    };
    const all=pool();
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
    board.querySelectorAll('[data-goseco]').forEach(b=>b.addEventListener('click',()=>{
      const vid=b.dataset.vid||'';
      CX.router.nav('visitas');
      setTimeout(()=>{ if(vid){const row=document.querySelector(`[data-vid="${vid}"]`);if(row){row.style.outline='2px solid var(--brand)';row.style.borderRadius='8px';setTimeout(()=>row.style.outline='',2000);row.scrollIntoView&&row.scrollIntoView({block:'center'});}} },300);
    }));
    board.querySelectorAll('[data-wa]').forEach(b=>b.addEventListener('click',()=>{CX.automations&&CX.automations._pushLog({fecha:new Date().toISOString().slice(0,16).replace('T',' '),canal:'whatsapp',evento:'recordatorio',titulo:'Recordatorio manual',txt:decodeURIComponent(b.dataset.wa),hook:CX.automations.hook()||'(Make sin configurar)'});ui.toast('WhatsApp preparado · envío real pendiente backend/Make: '+decodeURIComponent(b.dataset.wa).slice(0,40)+'…','ok');}));
    board.querySelectorAll('[data-mail]').forEach(b=>b.addEventListener('click',()=>ui.toast('Borrador de correo preparado (envío pendiente de conexión con Outlook)','ok')));
    board.querySelectorAll('[data-bulk]').forEach(b=>b.addEventListener('click',()=>ui.toast('Recordatorio masivo preparado (WhatsApp + correo) · se envía cuando la conexión esté activa (pendienteend)','ok',3200)));
    /* #226 — subsecciones contraíbles */
    board.querySelectorAll('.bd-toggle').forEach(h=>h.addEventListener('click',(e)=>{
      if(e.target.closest('[data-bulk]'))return;
      const panel=board.querySelector('#'+h.dataset.bk); const caret=h.querySelector('.bd-caret');
      if(panel){const hidden=panel.style.display==='none';panel.style.display=hidden?'':'none';if(caret)caret.textContent=hidden?'▾':'▸';}
    }));
    /* #226 — detalle real por visita con editar/borrar inline (autoadministrable) */
    board.querySelectorAll('.bd-det').forEach(b=>b.addEventListener('click',(e)=>{
      e.stopPropagation(); const v=pool().find(x=>x.id===b.dataset.vid); if(!v)return;
      ui.modal('📋 Visita · '+v.sucursal,`
        <div style="font-size:12.5px;line-height:1.95;color:var(--t2)">
          <div><b>Ref:</b> #${v.num||'—'} · <b>Estado:</b> ${v.estado}</div>
          <div><b>Sucursal:</b> ${v.sucursal} · ${CX.paisFlag(v.pais)} ${v.ciudad}</div>
          <div><b>Shopper:</b> ${v.shopper||'— sin asignar'} ${v.shopperCode?'('+v.shopperCode+')':''}</div>
          <div><b>Escenario:</b> ${v.escenario||'—'} · <b>Franja:</b> ${v.franjaCode||v.franja||'—'}</div>
          <div><b>Agendada:</b> ${v.agendada||'—'} · <b>Realizada:</b> ${v.realizada||'—'}</div>
        </div>
        <div class="grid g2" style="gap:10px;margin-top:12px">
          <div><label class="lbl">Estado</label><select class="sel" id="bdEst">${['disponible','asignada','agendada','realizada','cuestionario','liquidada','cancelada'].map(s=>`<option ${v.estado===s?'selected':''}>${s}</option>`).join('')}</select></div>
          <div><label class="lbl">Fecha agendada</label><input class="inp" id="bdFec" type="date" value="${v.agendada||''}"></div>
        </div>
        <div class="between" style="margin-top:14px">
          <button class="btn btn-ghost btn-sm" id="bdDel" style="color:var(--red)">🗄 Archivar visita</button>
          <div class="flex" style="gap:8px">${['realizada','cuestionario','liquidada'].includes(v.estado)?'<button class="btn btn-soft btn-sm" id="bdRev">🔎 Revisar</button>':''}${v.shopper?'<button class="btn btn-soft btn-sm" id="bdWa" title="Abre WhatsApp Web con un borrador manual — no es envío automático">📲 WhatsApp (borrador manual)</button>':''}<button class="btn btn-pr btn-sm" id="bdSave">Guardar</button></div>
        </div>
      `,{onMount:(ov,close)=>{
        const rev=ov.querySelector('#bdRev');if(rev)rev.addEventListener('click',()=>{close();CX.revisionAdmin&&CX.revisionAdmin(data,p,v,ui);});
        ov.querySelector('#bdSave').addEventListener('click',()=>{v.estado=ov.querySelector('#bdEst').value;const f=ov.querySelector('#bdFec').value;if(f)v.agendada=f;CX.bus&&CX.bus.emit('visit-flow');CX.automations&&CX.automations.logAction&&CX.automations.logAction('Editó visita',v.id,v.sucursal+' → '+v.estado);close();CX.router.nav('dashboard');ui.toast('Visita actualizada','ok');});
        /* Bloque 9 (corrección V103, 20260711): bug real — este botón hacía hard-delete real
           (splice() sobre data._visitas, desaparición física, solo un confirm() del navegador,
           sin permiso, sin motivo, sin auditRef, sin conservar sourceRef). Una visita con origen
           HR (sourceRef) NUNCA debe poder desaparecer así desde la UI. Ahora: exige el permiso
           'visit.archive', exige motivo, y en vez de splice() marca soft-delete
           (_archived:true, _archivedMotivo, _archivedPor, _archivedFecha, _archivedAuditRef) —
           la visita sigue existiendo en data._visitas (nunca se pierde su sourceRef) y queda
           auditada; el dashboard la excluye de las vistas activas por el flag, no por ausencia física. */
        ov.querySelector('#bdDel').addEventListener('click',()=>{
          if(!CX.permissions.gate('visit.archive',CX.permissions.ctx({entityType:'visita',entityId:v.id,pais:v.pais}),ui)) return;
          ui.modal('🗄 Archivar visita',`
            <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">La visita de <b>${v.sucursal}</b> se archivará — no se borra físicamente, queda excluida de las vistas activas y recuperable con su historial completo (incluida su referencia de fuente HR, si la tiene).</p>
            ${v.sourceRef?`<div style="font-size:11px;color:var(--t3);margin-bottom:10px">Referencia de fuente registrada — se conserva.</div>`:''}
            <label class="lbl">Motivo (obligatorio)</label><textarea class="inp" id="arMot" rows="2" placeholder="Ej. duplicada, cancelada por el cliente, error de captura…" style="margin-bottom:12px"></textarea>
            <div style="text-align:right"><button class="btn btn-sm" style="background:var(--red-bg);color:var(--red)" id="arOk">Confirmar archivado</button></div>
          `,{onMount:(o2,c2)=>{o2.querySelector('#arOk').addEventListener('click',()=>{
            const motivo=(o2.querySelector('#arMot').value||'').trim();
            if(!motivo){ ui.toast('El motivo es obligatorio','warn'); return; }
            const auditRef='aud_'+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
            v._archived=true; v._archivedMotivo=motivo; v._archivedPor=(CX.session&&CX.session.user&&CX.session.user.name)||'—';
            v._archivedFecha=new Date().toISOString(); v._archivedAuditRef=auditRef;
            CX.bus&&CX.bus.emit('visit-flow');
            CX.automations&&CX.automations.logAction&&CX.automations.logAction('Archivó visita (soft-delete, auditado)',v.id,v.sucursal+' · motivo: '+motivo+' · auditRef '+auditRef);
            c2();close();CX.router.nav('dashboard');ui.toast('Visita archivada (recuperable) · auditado','');
          });}});
        });
        const wa=ov.querySelector('#bdWa');if(wa)wa.addEventListener('click',()=>{const msg=encodeURIComponent('Hola '+(v.shopper||'')+', sobre tu visita en '+v.sucursal);window.open('https://wa.me/?text='+msg,'_blank');});
      }});
    }));

    /* ---- ranking de shoppers clickeable + completo ---- */
    const profileModal=(s)=>{ const st=data.shopperStats?data.shopperStats(s.id):{total:s.visitas||0,realizadas:0,liquidadas:0,enCurso:0}; const hist=data.visitsForShopper?data.visitsForShopper(s.id):[];
      ui.modal(s.nombre+' · '+s.code, `
        <div class="flex" style="gap:12px;margin-bottom:12px"><div class="rail-av" style="width:42px;height:42px;font-size:15px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.code.slice(-2)}</div>
          <div><div class="card-t" style="font-size:15px">${s.nombre}</div><div style="font-size:12px;color:var(--t3)">${s.ciudad?s.ciudad+', ':''}${CX.paisName(s.pais)} · ${s.estado||''}</div>
          <div style="margin-top:4px"><span style="font-size:13px;font-weight:800;color:var(--amber)">★ ${s.rating||'—'}</span></div></div></div>
        <div class="grid g4" style="margin-bottom:8px"><div data-ph="all" style="cursor:pointer">${ui.kpi('Visitas',st.total,'b')}</div><div data-ph="real" style="cursor:pointer">${ui.kpi('Realizadas',st.realizadas,'g')}</div><div data-ph="liq" style="cursor:pointer">${ui.kpi('Liquidadas',st.liquidadas,'p')}</div><div data-ph="curso" style="cursor:pointer">${ui.kpi('En curso',st.enCurso,'a')}</div></div>
        <div style="font-size:11px;color:var(--t3);margin-bottom:10px">↑ toca un indicador para ver el detalle de esas visitas</div>
        <div class="flex" style="justify-content:flex-end;gap:8px"><button class="btn btn-soft btn-sm" id="pmWa">📲 WhatsApp</button><button class="btn btn-pr btn-sm" id="pmGo">Ver perfil completo →</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#pmGo').addEventListener('click',()=>{close();CX.session._focusShopper=s.id;CX.router.nav('shoppers');});
        /* P0-11 (paquete acumulado 20260711): este toast afirmaba "(Make)" sin comprobar el gate
           — a diferencia de los demás botones de WhatsApp del dashboard (que sí revisan
           CX.automations.hook() antes de mencionar Make), este quedaba residual claim
           incondicional de envío automatizado. Ahora usa el mismo criterio que el resto. */
        ov.querySelector('#pmWa').addEventListener('click',()=>{close();const hasHook=!!(CX.automations&&CX.automations.hook&&CX.automations.hook());ui.toast(hasHook?('WhatsApp a '+s.nombre+' preparado vía Make · se envía cuando el gate esté activo'):('WhatsApp Web abierto para '+s.nombre),'ok');});
        const histModal=(f,t)=>{const arr=hist.filter(f);ui.modal(t+' · '+s.nombre,arr.length?`<table class="tbl"><thead><tr><th>Sucursal</th><th>Escenario</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${arr.map(v=>`<tr><td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td><td style="font-size:12px">${v.escenario||''}</td><td style="font-size:12px">${v.realizada||v.agendada||'—'}</td><td>${ui.estadoBadge(v.estado)}</td></tr>`).join('')}</tbody></table>`:ui.empty('🗒️','Sin visitas en esta categoría.'));};
        ov.querySelectorAll('[data-ph]').forEach(el=>el.addEventListener('click',()=>{const kk=el.dataset.ph;if(kk==='all')histModal(()=>true,'Todas las visitas');else if(kk==='real')histModal(v=>['realizada','cuestionario','liquidada'].includes(v.estado),'Realizadas');else if(kk==='liq')histModal(v=>v.estado==='liquidada','Liquidadas');else histModal(v=>['asignada','agendada'].includes(v.estado),'En curso');}));
      }});
    };
    host.querySelectorAll('[data-sh]').forEach(el=>el.addEventListener('click',()=>{const s=data.getShopper?data.getShopper(el.dataset.sh):data.shoppers.find(x=>x.id===el.dataset.sh);if(s)profileModal(s);}));
    const rf=host.querySelector('#rankFull');
    if(rf)rf.addEventListener('click',()=>{const rank=data.rankableShoppers(data.shoppersFor()).sort((a,b)=>b.rating-a.rating);
      ui.modal('Ranking completo de shoppers ('+rank.length+')',`<table class="tbl"><thead><tr><th>#</th><th>Shopper</th><th>Ciudad</th><th>Visitas</th><th>Rating</th></tr></thead><tbody>
        ${rank.map((s,i)=>`<tr class="hov" data-rk="${s.id}" style="cursor:pointer"><td style="font-family:var(--disp);color:var(--t3)">${i+1}</td><td><b>${s.nombre}</b><div style="font-size:10px;color:var(--t3)">${s.code}</div></td><td style="font-size:12px">${s.ciudad||CX.paisName(s.pais)}</td><td style="font-size:12px">${s.visitas||0}</td><td style="font-weight:800;color:var(--amber)">★ ${s.rating||'—'}</td></tr>`).join('')}
      </tbody></table>`,{onMount:(ov,close)=>ov.querySelectorAll('[data-rk]').forEach(tr=>tr.addEventListener('click',()=>{close();const s=data.getShopper(tr.dataset.rk);if(s)profileModal(s);}))});
    });

    const F={
      total:()=>true, asign:BF.asignadas, sinasign:BF.sinAsignar,
      sinagend:BF.sinAgendar, real:BF.realizadas,
      pend:BF.pendRealizar, cuest:BF.cuestPend,
      submit:BF.sinSubmitir, liq:BF.liquidadas, fuera:BF.fueraRango,
      agend:BF.agendadas,
    };
    const WA={ sinasign:'Visitas sin cobertura — avisar a la red de shoppers.', sinagend:'Pídeles agendar fecha.', cuest:'Recuérdales enviar el cuestionario.', fuera:'Coordinar reprogramación.' };
    host.querySelectorAll('[data-kpi]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.kpi;drill(el.querySelector('.k-l').textContent.replace(' ›',''),F[id]||F.total,WA[id]);}));
    host.querySelectorAll('[data-alert]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.alert;drill('Gestión: '+id,F[id]||F.total,WA[id]||'Gestionar con los involucrados.');}));
    host.querySelectorAll('[data-fase]').forEach(el=>el.addEventListener('click',()=>{const[c,fk]=el.dataset.fase.split('|');drill(CX.paisLabel(c)+' · '+fk,v=>v.pais===c&&(F[fk]||F.total)(v),WA[fk]);}));
    const dx=host.querySelector('#dashExport');
    if(dx&&CX.reportKit){
      const dSpec=(ext)=>{
        const san=(s)=>String(s||'r').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'r';
        const projectLabel=ALL?'Todos los proyectos':(data.programBase?data.programBase(p):p.name);
        const rows=cs.map(c=>{const tot=k.total[c]||0,real=k.realizadas[c]||0;return {pais:CX.paisLabel?CX.paisLabel(c):c,total:tot,asignadas:(k.asignadas[c]||0),sin_asignar:(k.sinAsignar[c]||0),realizadas:real,avance:(tot?Math.round(real/tot*100):0)+'%'};});
        return { title:'Dashboard Operativo',
          meta:{title:'Dashboard Operativo',project:projectLabel,period:(months[selMonth]+' '+new Date().getFullYear()),scope:(ALL?'Todos los proyectos':p.name),sourceLabel:'Operación viva del periodo',generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
          columns:[{key:'pais',label:'País'},{key:'total',label:'Total'},{key:'asignadas',label:'Asignadas'},{key:'sin_asignar',label:'Sin asignar'},{key:'realizadas',label:'Realizadas'},{key:'avance',label:'Avance'}],
          rows, notes:'',
          summary:['Total visitas: '+(k.total.t||0),'Realizadas: '+(k.realizadas.t||0)],
          chart:{title:'Realizadas por país',data:cs.map(c=>({label:(CX.paisLabel?CX.paisLabel(c):c),value:(k.realizadas[c]||0)}))},
          filename:[san('dashboard-operativo'),san(projectLabel),new Date().toISOString().slice(0,10)].join('_')+'.'+ext };
      };
      dx.addEventListener('click',()=>CX.ui.modal('⤓ Exportar dashboard',`<p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Genera el reporte operativo del alcance actual con el diseño del tenant.</p><div class="flex" style="gap:8px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="dxPdf">⤓ PDF</button><button class="btn btn-soft btn-sm" id="dxXls">⤓ Excel</button><button class="btn btn-pr btn-sm" id="dxPpt">⤓ PPT</button></div>`,{onMount:(ov)=>{ov.querySelector('#dxPdf').addEventListener('click',()=>CX.reportKit.exportPDF(dSpec('pdf')));ov.querySelector('#dxXls').addEventListener('click',()=>{if(CX.reportKit.exportExcel(dSpec('xlsx')))CX.ui.toast('Excel .xlsx generado','ok');});ov.querySelector('#dxPpt').addEventListener('click',()=>{if(CX.reportKit.exportPPT(dSpec('pptx')))CX.ui.toast('PowerPoint generado','ok');});}}));
    }
    const ps=host.querySelector('#dashProjSel');
    /* P0-1: este selector SÍ es el canónico (además del de la barra lateral) — llama al mismo
       setter real (data.setProgram → internamente activa el periodo más reciente vía
       data.setProject/setCurrentPeriod) y provoca el mismo evento 'project'/'cx:period-changed'
       que re-renderiza rail + vista activa, nunca solo un toast cosmético. */
    if(ps)ps.addEventListener('change',()=>{ if(ps.value==='all'){CX.session._dashAll=true;} else {CX.session._dashAll=false;data.setProgram?data.setProgram(ps.value):data.setProject(ps.value);} CX.router.nav('dashboard'); });
  },0);
  return host;
});
