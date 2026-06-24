/* ============================================================
   CXOrbia · Topbar — campanita de novedades + soporte
   La campanita reemplaza al Tablón en el menú: muestra las
   novedades del rol activo en un panel desplegable, con badge
   de no leídas, marcar leído e ir a la sección.
   ============================================================ */
window.CX = window.CX || {};

CX.topbar = {
  _open:false,
  role(){ return (CX.session && CX.session.role) || 'admin'; },

  badge(){
    const b=document.getElementById('tbBellBadge'); if(!b||!CX.notif)return;
    const n=CX.notif.unread(this.role());
    b.textContent=n>9?'9+':n; b.style.display=n?'flex':'none';
  },

  panel(){
    let el=document.getElementById('tbBellPanel');
    if(!el){ el=document.createElement('div'); el.id='tbBellPanel'; el.className='tb-pop'; document.body.appendChild(el); }
    const items=CX.notif?CX.notif.for(this.role()):[];
    el.innerHTML=`
      <div class="tb-pop-h">
        <b>Novedades</b>
        <button class="btn btn-ghost btn-sm" id="tbReadAll" style="padding:2px 8px">Marcar todo leído</button>
      </div>
      <div class="tb-pop-body">
        ${items.length?items.map(n=>`<div class="tb-noti ${n.leida?'':'unread'}" data-nid="${n.id}" ${n.nav?`data-nav="${n.nav}"`:''}>
          <div class="tb-noti-ic" style="background:var(--${CX.notif.toneVar(n.tono)}-bg)">${n.icon||'🔔'}</div>
          <div style="flex:1;min-width:0">
            <div class="tb-noti-t">${n.titulo}</div>
            <div class="tb-noti-x">${n.txt||''}</div>
            <div class="tb-noti-f">${n.fecha||''}</div>
          </div>
          ${n.leida?'':'<span class="tb-noti-dot"></span>'}
        </div>`).join(''):`<div style="padding:26px 16px;text-align:center;color:var(--t3);font-size:12.5px">Sin novedades por ahora.</div>`}
      </div>
      <div class="tb-pop-f"><button class="btn btn-ghost btn-sm" id="tbOpenTablon">Ver tablón completo →</button></div>`;

    el.querySelector('#tbReadAll').addEventListener('click',(e)=>{e.stopPropagation();CX.notif.markAllRead(this.role());this.render();});
    const ot=el.querySelector('#tbOpenTablon'); if(ot)ot.addEventListener('click',()=>{this.close();CX.router.nav('tablon');});
    el.querySelectorAll('[data-nid]').forEach(row=>row.addEventListener('click',()=>{
      CX.notif.markRead(row.dataset.nid);
      if(row.dataset.nav){ this.close(); CX.router.nav(row.dataset.nav); } else this.render();
    }));
    return el;
  },

  position(){
    const bell=document.getElementById('tbBell'), el=document.getElementById('tbBellPanel'); if(!bell||!el)return;
    const r=bell.getBoundingClientRect();
    el.style.top=(r.bottom+8)+'px';
    el.style.right=Math.max(12,(window.innerWidth-r.right))+'px';
  },

  toggle(){ this._open=!this._open; if(this._open){this.panel();this.position();document.getElementById('tbBellPanel').classList.add('show');}else this.close(); },
  close(){ this._open=false; const el=document.getElementById('tbBellPanel'); if(el)el.classList.remove('show'); },
  render(){ this.badge(); if(this._open)this.panel(); },

  support(){
    if(!CX.ui)return;
    CX.ui.modal('🆘 Soporte CXOrbia',`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:14px">¿Necesitas ayuda? Escríbenos por el canal que prefieras. El equipo de soporte responde en horario hábil.</p>
      <div style="display:flex;flex-direction:column;gap:9px">
        <button class="btn btn-green" id="spWa" style="justify-content:flex-start">📲 WhatsApp de soporte</button>
        <button class="btn btn-soft" id="spMail" style="justify-content:flex-start">✉️ Correo de soporte</button>
        <button class="btn btn-ghost" id="spTicket" style="justify-content:flex-start">🎫 Crear solicitud de soporte</button>
      </div>
      <div style="margin-top:14px;font-size:11px;color:var(--t3)">Tipos: plataforma · capacitación · técnica · comercial · servicio.</div>
    `,{onMount:(ov,close)=>{
      ov.querySelector('#spWa').addEventListener('click',()=>{close();CX.ui.toast('Abriendo WhatsApp de soporte…','ok');});
      ov.querySelector('#spMail').addEventListener('click',()=>{close();CX.ui.toast('Abriendo correo de soporte…','ok');});
      ov.querySelector('#spTicket').addEventListener('click',()=>{close();CX.router&&CX.router.nav('soporte');});
    }});
  },

  init(){
    const bell=document.getElementById('tbBell'), sup=document.getElementById('tbSupport');
    if(bell&&!bell._wired){ bell._wired=true; bell.addEventListener('click',(e)=>{e.stopPropagation();this.toggle();}); }
    if(sup&&!sup._wired){ sup._wired=true; sup.addEventListener('click',()=>this.support()); }
    if(!document._tbDocWired){ document._tbDocWired=true;
      document.addEventListener('click',(e)=>{ const p=document.getElementById('tbBellPanel'); if(this._open&&p&&!p.contains(e.target)&&e.target.id!=='tbBell'&&!(e.target.closest&&e.target.closest('#tbBell')))this.close(); });
      window.addEventListener('resize',()=>{ if(this._open)this.position(); });
    }
    CX.bus&&CX.bus.on('notif',()=>this.render());
    CX.bus&&CX.bus.on('route',()=>this.badge());
    CX.bus&&CX.bus.on('login',()=>this.badge());
    this.badge();
  },
};

document.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>CX.topbar.init(),60); });
