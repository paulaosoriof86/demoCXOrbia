/* CXOrbia · Tablón / Novedades (admin + shopper) — centro de notificaciones real */
CX.module('tablon', ({role,ui})=>{
  const host=ui.el('div');
  const draw=()=>{
    const feed=CX.notif.for(role);
    const unread=CX.notif.unread(role);
    host.innerHTML=`
      ${ui.ph(role==='admin'?'Tablón de Noticias':'Novedades', role==='admin'?'Seguimiento operativo trazable — reemplaza el WhatsApp desordenado':'Lo último de tus visitas, en un solo lugar')}
      <div class="card card-p">
        <div class="card-h"><div class="card-t">${feed.length} novedades · ${unread} sin leer</div>
          <button class="btn btn-ghost btn-sm" id="readAll">Marcar todo leído</button></div>
        ${feed.length?feed.map(n=>`<div data-n="${n.id}" style="display:flex;align-items:flex-start;gap:11px;padding:11px 13px;border:1px solid var(--border);border-left:3px solid var(--${CX.notif.toneVar(n.tono)});border-radius:10px;margin-bottom:9px;${n.leida?'opacity:.6':''}">
          <div style="font-size:18px">${n.icon}</div>
          <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--t1)">${n.titulo} ${n.leida?'':'<span class="bdg bdg-r" style="font-size:9px;padding:1px 6px">nuevo</span>'}</div>
            <div style="font-size:12px;color:var(--t2)">${n.txt}</div><div style="font-size:10.5px;color:var(--t3);margin-top:2px">${n.fecha}</div></div>
          <div class="flex" style="gap:6px">
            ${n.accion==='confirmar_fecha'?`<button class="btn btn-green btn-sm" data-conf="${n.id}">Confirmar</button><button class="btn btn-ghost btn-sm" data-prop="${n.id}">Proponer otra</button>`
              :`<button class="btn btn-soft btn-sm" data-go="${n.id}">Ver</button>`}
          </div></div>`).join(''):ui.empty('🔔','Sin novedades')}
        <div style="margin-top:8px">${ui.aiBox('Centralizo lo que pasa: el equipo recibe cada acción del shopper y el shopper recibe lo que el equipo le pide (confirmar fecha, reprogramar). Se sincroniza con Mi Día y dispara WhatsApp cuando aplica.','Un solo canal, trazable')}</div>
      </div>`;
    host.querySelector('#readAll').addEventListener('click',()=>{CX.notif.markAllRead(role);draw();});
    host.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const n=feed.find(x=>x.id===b.dataset.go);CX.notif.markRead(n.id);if(n.nav)CX.router.nav(n.nav);}));
    host.querySelectorAll('[data-conf]').forEach(b=>b.addEventListener('click',()=>{CX.notif.markRead(b.dataset.conf);CX.notif.push({to:'admin',tipo:'confirmada',icon:'✅',tono:'g',titulo:'Fecha confirmada',txt:'El shopper confirmó la fecha propuesta',nav:'postulaciones'});ui.toast('Fecha confirmada · equipo notificado','ok');draw();}));
    host.querySelectorAll('[data-prop]').forEach(b=>b.addEventListener('click',()=>ui.modal('Proponer otra fecha',`
      <label class="lbl">Nueva fecha</label><input class="inp" type="date" style="margin-bottom:14px">
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="propOk">Enviar propuesta</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#propOk').addEventListener('click',()=>{CX.notif.markRead(b.dataset.prop);CX.notif.push({to:'admin',tipo:'reprog',icon:'🔄',tono:'a',titulo:'Nueva fecha propuesta por shopper',txt:'Requiere autorización del equipo',nav:'postulaciones'});close();ui.toast('Propuesta enviada · pendiente de autorización','ok');draw();});}})));
  };
  draw();
  CX.bus.on('notif',()=>{ if(CX.session.view==='tablon') draw(); });
  return host;
});
