/* ============================================================
   CXOrbia · Boot + login / role selection
   ============================================================ */
window.CX = window.CX || {};

CX.app = {
  init(){
    CX.applyBrand();
    CX.session.load();
    if(CX.session.role){ this.enter(); }
    else { this.showLogin(); }
  },

  showLogin(){
    document.getElementById('app').classList.remove('on');
    const lg=document.getElementById('login');
    lg.classList.remove('hidden');
    const b=CX.BRAND;
    const brandBlock = b.logoUrl
      ? `<img class="client-logo" src="${b.logoUrl}" alt="logo" style="max-height:54px">`
      : `<div class="logo-mark"><span class="dot"></span></div>
         <div><div class="brand-name">${b.clientName||b.name}</div><div class="brand-sub">${b.tagline}</div></div>`;
    lg.innerHTML=`
      <div class="login-card">
        <div class="login-brand">
          ${brandBlock}
        </div>
        <div class="login-divider"></div>
        <div class="login-title">${b.clientName?b.clientName:'Plataforma operativa de campo'}</div>
        <div class="login-sub">Selecciona un perfil para entrar al ${b.demoMode?'demo':'sistema'}</div>
        <button class="role-btn role-admin" data-role="admin">
          <div class="r-ic">🖥️</div>
          <div><div class="r-t">Administración / Coordinación</div>
          <div class="r-d">Operación, proyectos, finanzas y configuración</div></div>
        </button>
        <button class="role-btn role-shopper" data-role="shopper">
          <div class="r-ic">📱</div>
          <div><div class="r-t">Shopper / Evaluador</div>
          <div class="r-d">Portal móvil: visitas, certificación y pagos</div></div>
        </button>
        <div style="text-align:center;margin-top:6px"><a id="goReg" style="font-size:12.5px;color:var(--brand);font-weight:600;cursor:pointer">¿Eres evaluador nuevo? Regístrate aquí →</a></div>
        ${b.clientName?`<div class="login-devfor">Plataforma operativa desarrollada para <b>${b.clientName}</b> por <b>${b.name}</b></div>`:''}
        <div style="text-align:center;margin-top:14px"><button class="btn btn-ghost btn-sm" id="pwaBtn">📲 Instalar como app</button></div>
        ${b.demoMode?`<div style="text-align:center;margin-top:10px;font-size:11px;color:var(--t3)">
          <span class="bdg bdg-a">● Demo comercial · datos ficticios</span></div>`:''}
      </div>`;
    lg.querySelectorAll('.role-btn').forEach(b=>b.addEventListener('click',()=>this.selectRole(b.dataset.role)));
    const gr=lg.querySelector('#goReg'); if(gr)gr.addEventListener('click',()=>this.showRegister());
    const pw=lg.querySelector('#pwaBtn'); if(pw)pw.addEventListener('click',()=>CX.pwa.openInstall(CX.ui));
  },

  showRegister(){
    CX.ui.modal('Registro de evaluador', `
      <p style="font-size:13px;color:var(--t2);margin-bottom:14px">Crea tu cuenta. El equipo revisará tu perfil y te habilitará las visitas de tu país.</p>
      <div class="grid g2" style="gap:12px">
        <div><label class="lbl">Nombre completo</label><input class="inp" id="rgName" placeholder="Nombre y apellido"></div>
        <div><label class="lbl">País</label><select class="sel" id="rgPais"><option>Guatemala</option><option>Honduras</option><option>El Salvador</option><option>Costa Rica</option><option>Panamá</option><option>México</option><option>Colombia</option></select></div>
        <div><label class="lbl">Ciudad</label><input class="inp" id="rgCity" placeholder="Ciudad"></div>
        <div><label class="lbl">Teléfono</label><input class="inp" id="rgPhone" placeholder="+502 ..."></div>
        <div style="grid-column:1/3"><label class="lbl">Correo</label><input class="inp" id="rgMail" placeholder="correo@ejemplo.com"></div>
      </div>
      <div style="background:var(--brand-light);border-radius:10px;padding:10px 13px;font-size:12px;color:var(--brand-dark);margin:14px 0">Tu usuario se generará automáticamente (patrón configurable por el cliente, ej. <b>nombre.apellido</b>). Podrás completar tu perfil al ingresar.</div>
      <div style="text-align:right"><button class="btn btn-green" id="rgSave">Crear mi cuenta</button></div>
    `, {onMount:(ov,close)=>{
      ov.querySelector('#rgSave').addEventListener('click',()=>{
        const n=(ov.querySelector('#rgName').value||'Evaluador Nuevo');
        const user=n.toLowerCase().trim().replace(/\s+/g,'.').replace(/[^a-z.]/g,'');
        close();
        CX.ui.toast('Cuenta creada · usuario: '+user+' · completa tu perfil al ingresar','ok',4000);
      });
    }});
  },

  selectRole(role){
    CX.session.role=role;
    CX.session.user = role==='admin'
      ? {name:'Admin Demo', role:'super', org:'Tu Consultora'}
      : {name:'Evaluador 01', role:'shopper', shopperId:'sh1', code:'EVL-01'};
    CX.session.view=null;
    CX.session.save();
    this.enter();
  },

  enter(){
    document.getElementById('login').classList.add('hidden');
    document.getElementById('app').classList.add('on');
    const go=()=>CX.router.mount();
    if(CX.confidencialidad && CX.confidencialidad.pending(CX.session.role)){
      CX.confidencialidad.show(CX.session.role, go);
    } else { go(); }
  },

  logout(){
    CX.session.clear();
    this.showLogin();
    CX.ui.toast('Sesión cerrada','');
  },
};

document.addEventListener('DOMContentLoaded',()=>{ CX.pwa && CX.pwa.init(); CX.app.init(); });
