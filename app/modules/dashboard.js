/* CXOrbia · Dashboard Operativo (admin) — full fidelity */
CX.module('dashboard', ({data,ui})=>{
  const p=data.project(), k=data.kpis();
  const cs=p.countries;
  const split=(o)=>cs.map(c=>c+':'+o[c]).join(' · ');
  const months=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

  const tile=(label,o,tone,extra='')=>`<div class="kpi ${tone}"><div class="k-l">${label}</div>
    <div class="k-v">${o.t}</div><div class="k-s">${extra||split(o)}</div></div>`;

  /* flujo por fases por país */
  const fases=cs.map(c=>{
    const f=data.phaseFlow(c);
    const cell=(lbl,arr,tone)=>`<div style="flex:1;min-width:84px;background:#fff;border:1px solid var(--border);border-radius:10px;padding:9px 10px">
      <div style="font-family:var(--disp);font-size:19px;font-weight:800;color:var(--t1);line-height:1">${arr[0]}</div>
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--t3);margin:2px 0 5px">${lbl} · ${arr[1]}%</div>
      <div class="bar" style="height:5px"><i style="width:${arr[1]}%;background:var(--${tone})"></i></div></div>`;
    return `<div style="margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:8px">${c==='GT'?'🇬🇹 Guatemala':'🇭🇳 Honduras'} (${f.total})</div>
      <div class="flex wrap" style="gap:8px">
        ${cell('Total',[f.total,100],'brand')}${cell('Asign.',f.asign,'brand')}${cell('Agend.',f.agend,'amber')}
        ${cell('Sin agend.',f.sinAgend,'amber')}${cell('Sin asign.',f.sinAsign,'red')}${cell('Real.',f.real,'green')}
        ${cell('Cuest.',f.cuest,'purple')}${cell('Submit.',f.submit,'teal')}${cell('Liq.',f.liq,'green')}
      </div></div>`;
  }).join('');

  const top=[...data.shoppersFor()].sort((a,b)=>b.rating-a.rating).slice(0,4);

  const alerts=[];
  if(k.sinAsignar.t) alerts.push(['r',`${k.sinAsignar.t} sin asignar (${split(k.sinAsignar)})`]);
  if(k.sinAgendar.t) alerts.push(['a',`${k.sinAgendar.t} asignadas sin fecha programada`]);
  if(k.cuestPend.t)  alerts.push(['a',`${k.cuestPend.t} realizadas sin cuestionario`]);
  if(k.fueraRango.t) alerts.push(['r',`${k.fueraRango.t} fuera de rango`]);

  const compRows=[
    ['⏱️','Días Real→Cuest.','1.2 d','Meta: ≤1d'],
    ['⏱️','Días Real→Submit','2.6 d','Meta: ≤3d'],
    ['⚠️','Fuera de rango',k.fueraRango.t,'Visitas fuera de franja/fecha'],
    ['👥','Shoppers únicos',data.shoppersFor().length,'Distintos activos en la ronda'],
    ['🏅','Top shopper',top[0]?top[0].rating+' ★':'—','Mejor calificación del periodo'],
    ['💰','Margen neto','39.6%','GT+HN combinado'],
  ];

  return `
  <div class="between" style="margin-bottom:14px">
    <div>${ui.ph('Dashboard Operativo', p.name+' · '+p.industry)}</div>
    <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div>
  </div>

  <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
    <div style="font-size:12.5px;color:var(--brand-dark)"><b>Base cargada.</b> ${k.total.t} visitas del periodo · ${split(k.total)}. Dashboard sin duplicar plataforma; cada proyecto trae su propia base.</div>
  </div>

  <div class="flex wrap" style="gap:5px;margin-bottom:16px">
    ${months.map((m,i)=>`<span class="bdg ${i===5?'bdg-b':'bdg-n'}" style="cursor:pointer">${m} 26</span>`).join('')}
  </div>

  <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:12px">
    ${tile('Total visitas',k.total,'b')}
    ${tile('Asignadas',k.asignadas,'b')}
    ${tile('Sin asignar',k.sinAsignar,'r')}
    ${tile('Sin agendar',k.sinAgendar,'a')}
    ${tile('Realizadas',k.realizadas,'g')}
  </div>
  <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:18px">
    ${tile('Pend. realizar',k.pendRealizar,'a')}
    ${tile('Cuest. pendiente',k.cuestPend,'a')}
    ${tile('Sin submitir',k.sinSubmitir,'p')}
    ${tile('Liquidadas',k.liquidadas,'g')}
    ${tile('Fuera de rango',k.fueraRango,'r')}
  </div>

  <div class="card card-p" style="margin-bottom:18px">
    <div class="card-h"><div class="card-t">Flujo por fases</div><span class="muted" style="font-size:11px">Click en una fase para ver su listado (en producción)</span></div>
    ${fases}
  </div>

  <div class="grid" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:18px">
    <div class="card card-p">
      <div class="card-t" style="margin-bottom:12px">Distribución por quincena</div>
      ${p.quincenas.map((q,i)=>`<div style="background:${i===0?'var(--brand-light)':'var(--green-bg)'};border-radius:10px;padding:11px 13px;margin-bottom:9px">
        <div style="font-size:12px;font-weight:700;color:var(--t1)">${q} ${ui.bdg(i===0?'100%':'0%',i===0?'b':'g')}</div>
        <div style="font-size:11px;color:var(--t3);margin-top:3px">${cs.map(c=>c+' '+(i===0?'completa':'pendiente')).join(' · ')}</div></div>`).join('')}
    </div>
    <div class="card card-p">
      <div class="card-t" style="margin-bottom:12px">🏅 Top shoppers</div>
      ${top.map(s=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)">
        <div class="flex"><div class="rail-av" style="width:26px;height:26px;font-size:10px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.code.slice(-2)}</div>
        <span style="font-size:12px;font-weight:600;color:var(--t1)">${s.nombre}</span></div>
        <span style="font-size:12px;font-weight:800;color:var(--amber)">★ ${s.rating}</span></div>`).join('')}
    </div>
    <div class="card card-p">
      <div class="card-t" style="margin-bottom:12px">Alertas operativas</div>
      ${alerts.length?alerts.map(a=>`<div style="background:var(--${a[0]==='r'?'red':'amber'}-bg);border-radius:9px;padding:10px 12px;margin-bottom:8px;font-size:12px;font-weight:600;color:var(--${a[0]==='r'?'red':'amber'})">${a[0]==='r'?'🔴':'⏰'} ${a[1]}</div>`).join(''):ui.empty('✅','Sin alertas')}
    </div>
  </div>

  <div class="card card-p">
    <div class="card-h"><div class="card-t">📈 Análisis comparativo — Velocidad · Calidad · Rentabilidad</div><span class="muted" style="font-size:11px">Últimos 3 meses con datos</span></div>
    <table class="tbl"><thead><tr><th>KPI</th><th>${p.name}</th><th>Nota</th></tr></thead><tbody>
      ${compRows.map(r=>`<tr><td><b>${r[0]} ${r[1]}</b></td><td style="font-weight:700;color:var(--t1)">${r[2]}</td><td style="font-size:12px;color:var(--t3)">${r[3]}</td></tr>`).join('')}
    </tbody></table>
    <div style="margin-top:14px">${ui.aiBox('Resalto atrasos, fuera de rango y anomalías antes de que escalen, y priorizo solo lo accionable por país y quincena.','Lectura inteligente')}</div>
  </div>`;
});
