    document.querySelectorAll('#midKpis [data-mk]').forEach(el=>el.addEventListener('click',()=>{const d=kDrills[el.dataset.mk];if(!d)return;const L=d[1]();ui.modal(d[0]+' ('+L.length+')',L.length?'<table class="tbl"><tbody>'+L.slice(0,20).map(v=>'<tr><td><b>'+v.sucursal+'</b></td><td style="font-size:12px">'+(v.shopper||'—')+'</td><td>'+(v.estado||'')+'</td></tr>').join('')+'</tbody></table>':ui.empty('✅','Sin registros.'));}));
/* CXOrbia · Mi Día (admin + shopper) */
/* P0-1 (paquete V110→V111, 20260714): antes _cgMonth arrancaba en el literal fijo '2026-06' y
   nunca se realineaba con el periodo activo — si el usuario cambiaba de periodo, el calendario
   seguía mostrando el mes de OTRO periodo (o de ninguno). Ahora _cgMonth se deriva de
   data.periodMonth(periodId) — calculado sobre las fechas REALES de las visitas de ESE
   periodo — y se recalcula automáticamente cada vez que cambia el periodo activo (_cgLastPeriod
   detecta el cambio). Sin fechas literales de estado inicial. */
let _cgMonth=null, _cgByDay={}, _cgProj='', _cgLastPeriod=null;
function _shiftMonth(ym,delta){let[y,m]=ym.split('-').map(Number);m+=delta;if(m<1){m=12;y--;}if(m>12){m=1;y++;}return y+'-'+String(m).padStart(2,'0');}
CX.module('midia', ({data,role,ui})=>{
  const p=data.period();
  /* realinea el mes visible del calendario con el periodo activo (nunca un literal fijo) —
     primera carga o cambio real de periodo; navegación manual (‹ ›) se conserva mientras el
     periodo no cambie. */
  if(_cgLastPeriod!==data.currentPeriodId){ _cgMonth=data.periodMonth(data.currentPeriodId); _cgLastPeriod=data.currentPeriodId; }
  /* bloque de notificaciones (común a ambos roles) */
  const notifBlock=()=>{
    const fe=CX.notif.for(role).slice(0,4), un=CX.notif.unread(role);
    return `<div class="card card-p" style="margin-bottom:16px">
      <div class="card-h"><div class="card-t">🔔 Notificaciones ${un?`<span class="bdg bdg-r">${un} sin leer</span>`:''}</div><button class="btn btn-ghost btn-sm" data-nav="tablon">Ver todas →</button></div>
      ${fe.length?fe.map(n=>`<div class="between" data-ngo="${n.id}" style="cursor:pointer;padding:9px 11px;border-radius:9px;${n.leida?'':'background:var(--'+CX.notif.toneVar(n.tono)+'-bg)'};margin-bottom:6px">
        <div class="flex"><span style="font-size:16px">${n.icon}</span><div><div style="font-size:12.5px;font-weight:700;color:var(--t1)">${n.titulo}</div><div style="font-size:11px;color:var(--t3)">${n.txt} · ${n.fecha}</div></div></div>
        ${n.accion==='confirmar_fecha'?'<span class="btn btn-green btn-sm">Confirmar</span>':'<span style="color:var(--t3)">›</span>'}</div>`).join(''):ui.empty('🔔','Sin notificaciones')}
    </div>`;
  };
  const bindNotif=()=>{setTimeout(()=>{
    document.querySelectorAll('[data-ngo]').forEach(b=>b.addEventListener('click',()=>{const n=CX.notif.for(role).find(x=>x.id===b.dataset.ngo);CX.notif.markRead(n.id);CX.router.nav(n.nav||'tablon');}));
    document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>CX.router.nav(b.dataset.nav)));
    document.querySelectorAll('.asgDone').forEach(b=>b.addEventListener('click',()=>{CX.automations.resolverAsignacion(b.dataset.id);CX.router.nav('midia');CX.ui&&CX.ui.toast('Asignación resuelta','ok');}));
    document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>CX.router.nav(b.dataset.go)));
    document.querySelectorAll('[data-cgo]').forEach(b=>b.addEventListener('click',()=>CX.router.nav(b.dataset.cgo)));
    document.querySelectorAll('[data-day]').forEach(c=>c.addEventListener('click',()=>{
      const its=_cgByDay[c.dataset.day]||[];
      const body=its.map(it=>`<div class="between" data-cgo2="${it.nav}" style="cursor:pointer;padding:9px 11px;border:1px solid var(--border);border-radius:9px;margin-bottom:8px"><div class="flex"><span style="font-size:16px">${it.icon}</span><div><div style="font-size:13px;font-weight:700">${it.titulo}</div><div style="font-size:11px;color:var(--t3)">${it.sub}</div></div></div>${(()=>{const v=data._visitas.find(x=>x.sucursal===it.titulo);const vc=v&&data.visitContract?data.visitContract(v):null;return vc&&vc.paymentState!=='no_aplica'?CX.ui.bdg(vc.paymentState,vc.paymentState==='confirmado'?'g':'n'):(it.estado==='tarea'?CX.ui.bdg('Tarea','a'):CX.ui.estadoBadge(it.estado));})()}</div>`).join('');
      CX.ui.modal('Agenda · '+c.dataset.day, body, {onMount:(ov,close)=>ov.querySelectorAll('[data-cgo2]').forEach(b=>b.addEventListener('click',()=>{close();CX.router.nav(b.dataset.cgo2);}))});
    }));
    const pv=document.getElementById('cgPrev'); if(pv)pv.addEventListener('click',()=>{_cgMonth=_shiftMonth(_cgMonth,-1);CX.router.nav('midia');});
    const nx=document.getElementById('cgNext'); if(nx)nx.addEventListener('click',()=>{_cgMonth=_shiftMonth(_cgMonth,1);CX.router.nav('midia');});
    const cp=document.getElementById('cgProj'); if(cp)cp.addEventListener('change',()=>{_cgProj=cp.value;CX.router.nav('midia');});
    const BF=data.visitBucketFns;
    document.querySelectorAll('#midKpis [data-mk]').forEach(el=>el.addEventListener('click',()=>{const kD={agd:['Agendadas',data.visitas().filter(BF.agendadas),'visitas'],post:['Por aprobar',data._posts.filter(p=>p.estado==='pendiente'),'postulaciones'],real:['Realizadas',data.visitas().filter(BF.realizadas),'visitas'],sinA:['Sin asignar',data.visitas().filter(BF.sinAsignar),'visitas']};const d=kD[el.dataset.mk];if(!d)return;const L=d[1];ui.modal(d[0]+' ('+L.length+')',L.length?'<table class="tbl"><thead><tr><th>Sucursal</th><th>Shopper</th><th>Estado</th></tr></thead><tbody>'+L.slice(0,20).map(v=>'<tr><td><b>'+v.sucursal+'</b></td><td style="font-size:12px">'+(v.shopper||'—')+'</td><td>'+(v.estado||'')+'</td></tr>').join('')+'</tbody></table>':ui.empty('✅','Sin registros.'));}));
  },0);};

  /* GAP2 (paquete V111→V112, 20260714): cronograma() arrancaba en `pool=data._visitas` — TODOS
     los proyectos/periodos, sin scope — y solo filtraba si el usuario tocaba el selector. El mes
     visible venía del periodo activo, pero los EVENTOS podían ser de otro periodo/proyecto
     distinto: exactamente la inconsistencia que P0-1 buscaba eliminar. Ahora el default (`_cgProj
     === ''`) usa data.visitas() — SOLO el periodo activo, igual que Dashboard/Visitas/Histórico.
     Ver TODOS los periodos a la vez es ahora una opción EXPLÍCITA ('ALL'), nunca el default, y
     se etiqueta visiblemente como vista agregada (nunca se presenta como si fuera el periodo
     activo). Periodo vacío: data.visitas() ya devuelve [] honestamente — el calendario se ve sin
     puntos, no reutiliza eventos de otro periodo. */
  const cronograma=()=>{
    const sid=(CX.session.user||{}).shopperId||null;
    const projName=(id)=>{const pr=data.projects.find(x=>x.id===id);return pr?pr.name:'';};
    let pool = _cgProj==='ALL' ? data._visitas.filter(v=>data.inScope(v.pais)) : data.visitas();
    let vis;
    /* P0 (V172): shopper ve SOLO sus visitas por shopperId; el estado no sustituye identidad.
       Sin shopperId verificable no se muestra cronograma privado. */
    if(role==='shopper') vis = sid ? pool.filter(v=>v.shopperId===sid) : [];
    else vis=pool.filter(v=>v.agendada||['asignada','realizada','cuestionario'].includes(v.estado));
    const items=[];
    vis.forEach(v=>{
      const f=(v.agendada||v.disponibleDesde||'').slice(0,10);
      const pn=projName(v.projectId);
      if(f) items.push({fecha:f, icon:'📍', titulo:v.sucursal, sub:(v.escenario||'')+' · '+pn+(role==='admin'&&v.shopper?(' · '+v.shopper):(' · '+v.ciudad)), estado:v.estado, nav:role==='shopper'?'misvisitas':'visitas'});
      if(v.estado==='realizada') items.push({fecha:(v.realizada||f||'').slice(0,10), icon:'📝', titulo:'Cuestionario pendiente', sub:v.sucursal+' · '+pn, estado:'tarea', nav:role==='shopper'?'misvisitas':'visitas'});
    });
    if(role==='admin'){ const k=data.kpis(); const hoy=new Date().toISOString().slice(0,10);
      if(k.postPend) items.push({fecha:hoy,icon:'📩',titulo:k.postPend+' postulaciones por revisar',sub:'Gestión de postulaciones',estado:'tarea',nav:'postulaciones'});
      if(k.sinAsignar.t) items.push({fecha:hoy,icon:'📌',titulo:k.sinAsignar.t+' visitas sin asignar',sub:'Asignar shoppers',estado:'tarea',nav:'visitas'});
    }
    const byDay={}; items.forEach(it=>{ if(!it.fecha)return; (byDay[it.fecha]=byDay[it.fecha]||[]).push(it); });
    _cgByDay=byDay;
    const [Y,M]=_cgMonth.split('-').map(Number);
    const first=new Date(Y,M-1,1); const startDow=(first.getDay()+6)%7;
    /* P0-1: 'hoy' es la fecha real del reloj del sistema — nunca un literal de snapshot. Si el
       periodo activo es de otro mes, hoy simplemente no cae en la cuadrícula visible (correcto:
       no se fabrica un "hoy" falso dentro de un periodo pasado). */
    const daysIn=new Date(Y,M,0).getDate(); const today=new Date().toISOString().slice(0,10);
    const monthLabel=first.toLocaleDateString('es-GT',{month:'long',year:'numeric'});
    const wd=['L','M','M','J','V','S','D'];
    let cells='';
    for(let i=0;i<startDow;i++) cells+='<div class="cg-cell cg-empty"></div>';
    for(let dd=1;dd<=daysIn;dd++){
      const ds=Y+'-'+String(M).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
      const its=byDay[ds]||[]; const isT=ds===today;
      cells+=`<div class="cg-cell${its.length?' cg-has':''}${isT?' cg-today':''}"${its.length?` data-day="${ds}"`:''}>
        <div class="cg-num">${dd}</div>
        ${its.length?`<div class="cg-dots">${its.slice(0,4).map(it=>`<span class="cg-dot" style="background:${it.estado==='tarea'?'var(--amber)':'var(--brand)'}"></span>`).join('')}${its.length>4?`<span style="font-size:9px;color:var(--t3)">+${its.length-4}</span>`:''}</div>`:''}
      </div>`;
    }
    return `<div class="card card-p" style="margin-bottom:16px">
      <div class="card-h"><div class="card-t">🗓️ Cronograma <span class="muted" style="font-size:11px">· ${_cgProj==='ALL'?'vista agregada de TODOS los periodos':'periodo activo'}</span></div>
        <div class="flex" style="gap:6px"><select class="sel" id="cgProj" style="width:auto;padding:5px 9px;font-size:12px"><option value="" ${_cgProj===''?'selected':''}>📌 Este periodo</option><option value="ALL" ${_cgProj==='ALL'?'selected':''}>🗂️ Todos los periodos (vista agregada)</option></select><button class="btn btn-ghost btn-sm" id="cgPrev">‹</button><span style="font-size:12.5px;font-weight:800;text-transform:capitalize;min-width:120px;text-align:center">${monthLabel}</span><button class="btn btn-ghost btn-sm" id="cgNext">›</button></div></div>
      <div class="cg-grid cg-head">${wd.map(w=>`<div class="cg-wd">${w}</div>`).join('')}</div>
      <div class="cg-grid">${cells}</div>
      <div style="font-size:11px;color:var(--t3);margin-top:10px"><span class="cg-dot" style="background:var(--brand)"></span> visita &nbsp; <span class="cg-dot" style="background:var(--amber)"></span> tarea &nbsp;·&nbsp; toca un día con actividad</div>
    </div>`;
  };
  if(role==='admin'){
    const k=data.kpis();
    const tasks=[
      ['📩',`${k.postPend} postulaciones por revisar`,'postulaciones',k.postPend],
      ['📌',`${k.sinAsignar.t} visitas sin asignar`,'visitas',k.sinAsignar.t],
      ['📝',`${k.cuestPend.t} pendientes de cuestionario`,'dashboard',k.cuestPend.t],
      ['⏰',`${k.fueraRango.t} fuera de rango`,'dashboard',k.fueraRango.t],
    ].filter(t=>t[3]>0);
    bindNotif();
    return `
      ${ui.ph('Mi Día', 'Buen día, '+(CX.session.user.name.split(' ')[0])+' 👋 · '+data.programBase(p)+' · periodo '+(p.periodo||p.ronda||p.name))}
      <div class="grid g4" style="margin-bottom:18px" id="midKpis">
        <div data-mk="agd" style="cursor:pointer">${ui.kpi('Agendadas',k.agendadas.t,'b')}</div>
        <div data-mk="post" style="cursor:pointer">${ui.kpi('Por aprobar',k.postPend,'a')}</div>
        <div data-mk="real" style="cursor:pointer">${ui.kpi('Realizadas',k.realizadas.t,'g')}</div>
        <div data-mk="sinA" style="cursor:pointer">${ui.kpi('Sin asignar',k.sinAsignar.t,'r')}</div>
      </div>
      ${notifBlock()}
      ${(()=>{const asg=CX.automations&&CX.automations.pendientesPara?CX.automations.pendientesPara('admin'):[];return asg.length?`
      <div class="card card-p" style="margin-bottom:16px;border-left:3px solid var(--amber)">
        <div class="card-h"><div class="card-t">📌 Asignaciones internas pendientes (${asg.length})</div></div>
        ${asg.slice(0,6).map(a=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)"><div><b style="font-size:12.5px">${a.titulo}</b><div style="font-size:11px;color:var(--t3)">${a.detalle||''} · 👤 ${a.responsable||'—'}</div></div><button class="btn btn-soft btn-sm asgDone" data-id="${a.id}">✓ Resuelto</button></div>`).join('')}
      </div>`:'';})()}
      ${cronograma()}
      <div class="card card-p">
        <div class="card-h"><div class="card-t">Lo que requiere tu acción</div></div>
        ${tasks.length?tasks.map(t=>`<div class="between" data-go="${t[2]}" style="cursor:pointer;padding:12px 13px;border:1px solid var(--border);border-radius:11px;margin-bottom:9px">
          <div class="flex"><div style="font-size:20px">${t[0]}</div><span style="font-size:13.5px;font-weight:600;color:var(--t1)">${t[1]}</span></div>
          <span class="btn btn-soft btn-sm">Ir →</span></div>`).join(''):ui.empty('✅','Todo al día')}
        <div style="margin-top:8px">${ui.aiBox('Solo te muestro lo accionable y lo resalto por urgencia, antes de que escale a incumplimiento.','Tu día, priorizado')}</div>
      </div>`;
  }
  // shopper
  bindNotif();
  /* P0 (V172): 'sh1' hardcodeado eliminado; el shopper ve SOLO sus visitas por shopperId real.
     El estado (asignada/agendada) NO sustituye identidad. Sin shopperId: cero contenido privado. */
  const _mySid=(CX.session.user||{}).shopperId||null;
  const mine=_mySid?data.visitas().filter(v=>v.shopperId===_mySid).slice(0,2):[];
  const steps=['Postulación aprobada|done','Instructivo leído|done','Certificación 88%|done','Visita realizada|now','Cuestionario|todo','Liquidación|todo'];
  return `
    ${ui.ph('Mi Día', 'Hola, '+CX.session.user.name.split(' ')[0]+' 👋 · '+data.programBase(p)+' · periodo '+(p.periodo||p.ronda||p.name))}
    ${notifBlock()}
    ${cronograma()}
    <div class="card card-p" style="margin-bottom:16px">
      <div class="card-h"><div class="card-t">Tu próxima visita</div>${ui.bdg('Por agendar','a')}</div>
      ${mine[0]?`<div style="font-size:15px;font-weight:700;color:var(--t1)">${mine[0].sucursal}</div>
      <div style="font-size:12px;color:var(--t3);margin:3px 0 12px">Rango ${mine[0].rango} · ${ui.money(mine[0].currency,mine[0].honorario)}${mine[0].combo?' + '+mine[0].combo:''}</div>
      <div class="flex wrap"><button class="btn btn-pr btn-sm">📅 Agendar</button><button class="btn btn-ghost btn-sm">📄 Instructivo</button><button class="btn btn-ghost btn-sm">🔄 Reprogramar</button></div>`:ui.empty('🧭','Sin visitas activas')}
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Progreso de la visita</div></div>
      ${steps.map(s=>{const[t,st]=s.split('|');const ic=st==='done'?'✅':st==='now'?'⏳':'○';const col=st==='done'?'var(--green)':st==='now'?'var(--brand)':'var(--t3)';
        return `<div class="flex" style="padding:6px 0;font-size:13px;color:${col};font-weight:${st==='now'?'700':'500'}">${ic} <span>${t}</span></div>`;}).join('')}
    </div>`;
});
