/* CXOrbia · Centro de Actualizaciones / Novedades (#233)
   - Admin (super): publica releases, ve estado de lectura por tenant/rol.
   - Todos los roles: ven el historial de novedades y confirman lectura.
   El banner de "novedad sin leer" lo dispara la campanita/topbar. */
CX.novedades = CX.novedades || {
  _k:'cx_novedades', _rk:'cx_novedades_read',
  seed(){ return [
    {id:'r_069',ver:'v6.9',fecha:'2026-07-21',tipo:'Nuevo',titulo:'Add-ons funcionales por rol + Check-in geolocalizado',
     cuerpo:'Nuevos add-ons que se activan y se asignan por rol desde Integraciones & Add-ons. El primero: Check-in con foto geolocalizada, ahora como sección y botón propio en Mis Visitas del shopper (GPS + hora reales), independiente del cuestionario.',roles:['admin','shopper']},
    {id:'r_068',ver:'v6.8',fecha:'2026-07-21',tipo:'Nuevo',titulo:'Reportes personalizables en todos los roles',
     cuerpo:'Crea y personaliza reportes eligiendo, ocultando, ordenando y renombrando columnas + notas, con exportación multiformato (PDF, Excel .xlsx y PPT) y el diseño de tu marca con gráficas. Disponible en Cliente, Admin/Operativo, Comercial, Finanzas y en el nuevo módulo Mis Reportes del shopper.',roles:['admin','cliente','shopper']},
    {id:'r_067',ver:'v6.7',fecha:'2026-07-21',tipo:'Mejora',titulo:'Panorama por periodo y exportables honestos',
     cuerpo:'El Panorama separa la Operación del periodo de los Resultados de evaluación y cambia sus indicadores por periodo; sin fuente de score se muestra un único Pendiente de fuente (sin ceros aparentes). Los exportables de Reportes, Histórico, Planes de Acción, Visitas, Dashboard, CRM y Finanzas ya son multiformato con gráficas.',roles:['admin','cliente']},
    {id:'r_066',ver:'v6.6',fecha:'2026-07-02',tipo:'Nuevo',titulo:'Insights & Benchmark en el portal del cliente',
     cuerpo:'El cliente ahora ve su score vs. el promedio de su industria, califica el programa (NPS), deja anotaciones colaborativas y agenda reuniones de revisión.',roles:['cliente','admin']},
    {id:'r_065',ver:'v6.5',fecha:'2026-07-01',tipo:'Nuevo',titulo:'Periodos del proyecto + detección de periodo en HR',
     cuerpo:'Gestiona cada ronda como un periodo independiente (crear/cerrar/archivar/duplicar/comparar). El importador de HR detecta el periodo automáticamente.',roles:['admin']},
    {id:'r_064',ver:'v6.4',fecha:'2026-06-30',tipo:'Mejora',titulo:'Foto geolocalizada real en la visita',
     cuerpo:'La evidencia geolocalizada captura GPS + fecha/hora reales dentro del cuestionario del shopper.',roles:['shopper','admin']},
  ];},
  list(){ try{const s=JSON.parse(localStorage.getItem(this._k)||'null'); if(!s)return this.seed();
    /* Merge: conserva lo guardado (estado/ediciones) y suma novedades nuevas del seed que aún no existan. */
    const ids=new Set(s.map(n=>n.id)); const add=this.seed().filter(n=>!ids.has(n.id));
    return add.length?add.concat(s):s;
  }catch(e){return this.seed();} },
  save(a){ try{localStorage.setItem(this._k,JSON.stringify(a));}catch(e){} CX.bus&&CX.bus.emit('novedades'); },
  add(n){ const a=this.list(); a.unshift(Object.assign({id:'r'+Date.now().toString(36),fecha:new Date().toISOString().slice(0,10),tipo:'Nuevo',estado:'publicado',modulo:''},n)); this.save(a); },
  forRole(role){ return this.list().filter(n=>(n.estado!=='archivado')&&(n.estado!=='borrador')&&(!n.roles||n.roles.includes(role))); },
  setEstado(id,e){ const a=this.list(); const n=a.find(x=>x.id===id); if(n)n.estado=e; this.save(a); },
  readMap(){ try{return JSON.parse(localStorage.getItem(this._rk)||'{}');}catch(e){return {};} },
  isRead(id){ const u=(CX.session.user&&CX.session.user.name)||'anon'; const m=this.readMap(); return !!(m[u]&&m[u][id]); },
  markRead(id){ const u=(CX.session.user&&CX.session.user.name)||'anon'; const m=this.readMap(); m[u]=m[u]||{}; m[u][id]=new Date().toISOString(); try{localStorage.setItem(this._rk,JSON.stringify(m));}catch(e){} CX.bus&&CX.bus.emit('novedades'); },
  unread(role){ return this.forRole(role).filter(n=>!this.isRead(n.id)).length; },
};

CX.module('novedades', ({role,ui})=>{
  const host=ui.el('div');
  const tipoTone={Nuevo:'g',Mejora:'b',Aviso:'a',Correcci\u00f3n:'n'};

  const draw=()=>{
    const isAdmin=(role==='admin'||role==='super');
    const items=CX.novedades.forRole(role);
    host.innerHTML=`
      ${ui.ph('Novedades & Actualizaciones', isAdmin?'Publica releases y sigue su lectura por rol':'Lo nuevo en tu plataforma · confirma que lo leíste')}
      ${isAdmin?`<div class="between" style="margin-bottom:14px"><span class="bdg bdg-n">${items.length} publicaciones</span><button class="btn btn-pr btn-sm" id="novNew">＋ Publicar novedad</button></div>`:''}
      <div style="display:flex;flex-direction:column;gap:12px">
        ${items.map(n=>{const leido=CX.novedades.isRead(n.id);return `
          <div class="card card-p" style="border-left:3px solid var(--${tipoTone[n.tipo]||'b'})">
            <div class="between" style="margin-bottom:6px">
              <div class="flex" style="gap:8px;align-items:center">${ui.bdg(n.tipo,tipoTone[n.tipo]||'b')}<b style="font-size:14px">${n.titulo}</b></div>
              <span style="font-size:11px;color:var(--t3)">${n.ver||''} · ${n.fecha}</span>
            </div>
            <div style="font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:8px">${n.cuerpo}</div>
            <div class="between">
              <span style="font-size:11px;color:var(--t3)">${(n.roles||['todos']).join(' · ')}</span>
              ${leido?'<span class="bdg bdg-g">✓ Leído</span>':`<button class="btn btn-soft btn-sm novRead" data-id="${n.id}">Marcar como leído</button>`}
            </div>
            ${isAdmin?`<div style="margin-top:8px;border-top:1px solid var(--border-2);padding-top:6px" class="between"><span style="font-size:11px;color:var(--t3)">📊 Lecturas: ${Object.values(CX.novedades.readMap()).filter(u=>u[n.id]).length} · estado: ${n.estado||'publicado'} · ${n.modulo||'general'}</span><button class="btn btn-ghost btn-sm novArch" data-id="${n.id}" style="font-size:10.5px">${n.estado==='archivado'?'Republicar':'Archivar'}</button></div>`:''}
          </div>`;}).join('')||ui.empty('📣','Sin novedades por ahora.')}
      </div>`;

    host.querySelectorAll('.novRead').forEach(b=>b.addEventListener('click',()=>{CX.novedades.markRead(b.dataset.id);draw();ui.toast('Marcado como leído','ok');}));
    host.querySelectorAll('.novArch').forEach(b=>b.addEventListener('click',()=>{const n=CX.novedades.list().find(x=>x.id===b.dataset.id);CX.novedades.setEstado(b.dataset.id,n&&n.estado==='archivado'?'publicado':'archivado');draw();ui.toast('Estado actualizado','ok');}));
    host.querySelector('#novNew')?.addEventListener('click',()=>ui.modal('＋ Publicar novedad',`
      <div class="grid g2" style="gap:8px;margin-bottom:8px"><div><label class="lbl">Tipo</label><select class="sel" id="nvT"><option>Nuevo</option><option>Mejora</option><option>Aviso</option><option>Corrección</option></select></div><div><label class="lbl">Versión</label><input class="inp" id="nvV" placeholder="v6.7"></div></div>
      <label class="lbl">Título</label><input class="inp" id="nvTit" placeholder="Qué cambió" style="margin-bottom:8px">
      <label class="lbl">Descripción</label><textarea class="inp" id="nvC" rows="3" placeholder="Detalle de la novedad" style="margin-bottom:8px"></textarea>
      <label class="lbl">Dirigida a</label>
      <div class="flex wrap" style="gap:8px;margin:4px 0 12px">${[['admin','Consultora'],['shopper','Shopper'],['cliente','Cliente']].map(([v,l])=>`<label class="flex" style="gap:5px;font-size:12.5px;cursor:pointer"><input type="checkbox" class="nvR" value="${v}" checked> ${l}</label>`).join('')}</div>
      <div class="grid g2" style="gap:8px;margin-bottom:10px"><div><label class="lbl">Versión (opcional)</label><input class="inp" id="nvV" placeholder="Ej. V79"></div>
      <label class="flex" style="gap:7px;font-size:12.5px;cursor:pointer;align-self:end;padding-bottom:8px"><input type="checkbox" id="nvBanner"> Mostrar como recordatorio destacado al ingresar</label></div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="nvOk">Publicar</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#nvOk').addEventListener('click',()=>{
      const tit=(ov.querySelector('#nvTit').value||'').trim(); if(!tit){ui.toast('Pon un título','warn');return;}
      const roles=[...ov.querySelectorAll('.nvR:checked')].map(c=>c.value);
      CX.novedades.add({tipo:ov.querySelector('#nvT').value,ver:ov.querySelector('#nvV').value,titulo:tit,cuerpo:ov.querySelector('#nvC').value,roles,banner:ov.querySelector('#nvBanner').checked});
      /* recordatorio destacado al ingresar (cuadro grande, hasta cerrarse) */
      if(ov.querySelector('#nvBanner').checked){try{const b=JSON.parse(localStorage.getItem('cx_banners')||'[]');b.unshift({id:'bn'+Date.now().toString(36),titulo:tit,cuerpo:ov.querySelector('#nvC').value,roles});localStorage.setItem('cx_banners',JSON.stringify(b));}catch(e){}}
      /* notifica a cada rol destino */
      roles.forEach(r=>CX.notif&&CX.notif.push&&CX.notif.push({to:r,tipo:'novedad',icon:'📣',tono:'b',titulo:'Novedad: '+tit,txt:ov.querySelector('#nvC').value,nav:'novedades'}));
      close();draw();ui.toast('Novedad publicada y notificada','ok');
    })}));
  };
  draw();
  CX.bus.on('novedades',()=>draw());
  return host;
});
