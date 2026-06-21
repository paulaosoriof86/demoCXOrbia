/* CXOrbia · Mi Día (admin + shopper) */
CX.module('midia', ({data,role,ui})=>{
  const p=data.project();
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
    document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>CX.router.nav(b.dataset.go)));
  },0);};
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
      ${ui.ph('Mi Día', 'Buen día, '+(CX.session.user.name.split(' ')[0])+' 👋 · '+p.name)}
      <div class="grid g4" style="margin-bottom:18px">
        ${ui.kpi('Agendadas',k.agendadas.t,'b')}${ui.kpi('Por aprobar',k.postPend,'a')}
        ${ui.kpi('Realizadas',k.realizadas.t,'g')}${ui.kpi('Sin asignar',k.sinAsignar.t,'r')}
      </div>
      ${notifBlock()}
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
  const mine=data.visitas().filter(v=>v.shopperId==='sh1'||['asignada','agendada'].includes(v.estado)).slice(0,2);
  const steps=['Postulación aprobada|done','Instructivo leído|done','Certificación 88%|done','Visita realizada|now','Cuestionario|todo','Liquidación|todo'];
  return `
    ${ui.ph('Mi Día', 'Hola, '+CX.session.user.name.split(' ')[0]+' 👋')}
    ${notifBlock()}
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
