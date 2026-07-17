/* ============================================================
   CXOrbia · Instalación como app (PWA) + cláusula de confidencialidad
   - Detecta dispositivo/navegador y ofrece la descarga/instalación correcta.
   - Pide aceptar la cláusula al primer ingreso de cada usuario (por rol).
   ============================================================ */
window.CX = window.CX || {};

CX.pwa = {
  deferredPrompt:null,
  init(){
    window.addEventListener('beforeinstallprompt',(e)=>{ e.preventDefault(); this.deferredPrompt=e; this._armFirstInteraction(); });
    window.addEventListener('appinstalled',()=>{ this.deferredPrompt=null; this._installed=true; this._interactionArmed=false; try{localStorage.setItem('cx_pwa_installed','1');}catch(e){} });
  },
  /* R19 crítico 3.A (20260715): antes solo se llamaba prompt() cuando el usuario pulsaba el
     botón de instalación explícito — el paquete exige abrir el prompt nativo en la PRIMERA
     interacción elegible del usuario (pointerdown/click/keydown), una sola vez, sin esperar a
     que encuentre y pulse un botón de instalar. Se arma un listener de una sola vez apenas llega
     beforeinstallprompt; si el usuario ya rechazó antes (localStorage), no se insiste. */
  _interactionArmed:false,
  _armFirstInteraction(){
    if(this._interactionArmed || this._installed) return;
    try{ if(localStorage.getItem('cx_pwa_dismissed')==='1') return; }catch(e){}
    this._interactionArmed=true;
    const fire=()=>{
      ['pointerdown','click','keydown'].forEach(ev=>document.removeEventListener(ev,fire,true));
      if(!this.deferredPrompt) return;
      const dp=this.deferredPrompt;
      dp.prompt();
      dp.userChoice.then((choice)=>{
        this.deferredPrompt=null;
        if(choice&&choice.outcome==='dismissed'){ try{localStorage.setItem('cx_pwa_dismissed','1');}catch(e){} }
        if(CX.topbar&&CX.topbar.updatePwaBtn) CX.topbar.updatePwaBtn();
      }).catch(()=>{ this.deferredPrompt=dp; });
    };
    ['pointerdown','click','keydown'].forEach(ev=>document.addEventListener(ev,fire,true));
  },
  /* detección de plataforma */
  detect(){
    const ua=navigator.userAgent||'';
    const isIOS=/iPhone|iPad|iPod/i.test(ua);
    const isAndroid=/Android/i.test(ua);
    const isMac=/Macintosh/i.test(ua);
    const isWin=/Windows/i.test(ua);
    if(isIOS) return {os:'iOS', label:'iPhone / iPad', how:'safari'};
    if(isAndroid) return {os:'Android', label:'Android', how:'prompt'};
    if(isWin) return {os:'Windows', label:'Windows', how:'desktop'};
    if(isMac) return {os:'macOS', label:'Mac', how:'desktop'};
    return {os:'Web', label:'tu dispositivo', how:'desktop'};
  },
  installable(){ return !!this.deferredPrompt; },
  /* R19 Gate 8 (20260715): en Windows/macOS/Android con Chromium, `beforeinstallprompt` SÍ se
     dispara — pero antes solo se usaba this.deferredPrompt.prompt() cuando d.how==='prompt'
     (únicamente Android); en Windows/Mac (d.how==='desktop') se mostraba SIEMPRE el modal manual
     de instrucciones aunque el navegador ya hubiera ofrecido el evento nativo. Ahora: si existe
     el evento capturado (deferredPrompt, cualquier Chromium), se dispara el prompt() nativo del
     navegador en esta interacción — sin importar el label de plataforma. El modal de
     instrucciones queda solo como fallback real para navegadores que NO exponen el evento
     (o iOS Safari, que nunca lo expone). */
  openInstall(ui){
    const d=this.detect();
    if(this.deferredPrompt){
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.finally(()=>{this.deferredPrompt=null;});
      return;
    }
    const steps = {
      safari: ['Toca el botón <b>Compartir</b> ⬆️ en Safari','Elige <b>“Agregar a inicio”</b>','Confirma — el ícono de CXOrbia quedará en tu pantalla'],
      prompt: ['Toca <b>Instalar</b> cuando el navegador lo ofrezca','O abre el menú ⋮ → <b>“Instalar aplicación”</b>'],
      desktop: ['En el navegador, abre el menú ⋮','Elige <b>“Instalar CXOrbia”</b> (o el ícono ⊕ en la barra de direcciones)','La app se abrirá en su propia ventana'],
    }[d.how] || ['Usa el menú del navegador → “Instalar aplicación”.'];
    ui.modal('📲 Instalar CXOrbia en '+d.label, `
      <div style="background:var(--brand-light);border-radius:10px;padding:11px 13px;font-size:12.5px;color:var(--brand-dark);margin-bottom:14px">
        Detectamos <b>${d.os}</b>. Instálala como app para acceso rápido, pantalla completa y notificaciones.</div>
      <ol style="margin:0 0 4px 18px;font-size:13px;color:var(--t2);line-height:2">${steps.map(s=>`<li>${s}</li>`).join('')}</ol>
    `);
  },
};

/* ---------- Cláusula de confidencialidad (primer ingreso por usuario+rol) ---------- */
CX.confidencialidad = {
  key(role){ const u=(CX.session.user&&CX.session.user.name)||'demo'; return 'cx_nda_'+role+'_'+u.replace(/\s+/g,'_'); },
  pending(role){ try{ return !localStorage.getItem(this.key(role)); }catch(e){ return false; } },
  accept(role){ try{ localStorage.setItem(this.key(role), new Date().toISOString());
    /* #201 — registro de auditoría: quién, rol, versión y fecha */
    const u=(CX.session.user&&CX.session.user.name)||'demo';
    let log=[]; try{log=JSON.parse(localStorage.getItem('cx_nda_log')||'[]');}catch(e){}
    log.unshift({usuario:u,rol:role,version:this.version(role),fecha:new Date().toISOString()});
    localStorage.setItem('cx_nda_log',JSON.stringify(log.slice(0,500)));
  }catch(e){} },
  /* #201 — versionado: al editar el texto sube la versión y se re-pide aceptación */
  version(role){ try{const v=JSON.parse(localStorage.getItem('cx_nda_ver')||'{}');return v[role]||1;}catch(e){return 1;} },
  bumpVersion(role){ let v={}; try{v=JSON.parse(localStorage.getItem('cx_nda_ver')||'{}');}catch(e){} v[role]=(v[role]||1)+1; try{localStorage.setItem('cx_nda_ver',JSON.stringify(v));}catch(e){} },
  auditLog(){ try{return JSON.parse(localStorage.getItem('cx_nda_log')||'[]');}catch(e){return [];} },
  /* textos EDITABLES por la consultora (persistentes) */
  _defaults(){ return {
    shopper:'<b>ACUERDO DE CONFIDENCIALIDAD Y TRATAMIENTO DE DATOS — EVALUADOR (Guatemala)</b><br><br><b>1. Objeto.</b> Como evaluador incógnito me obligo a guardar absoluta reserva sobre proyectos, clientes, sucursales, instructivos, escenarios, cuestionarios, resultados y cualquier información a la que acceda.<br><b>2. Anonimato.</b> No revelaré mi condición de evaluador durante ni después de la visita.<br><b>3. Propiedad intelectual.</b> Reconozco que la metodología, instructivos y la plataforma son propiedad de la consultora (Ley de Derecho de Autor y Derechos Conexos, Dto. 33-98) y no los reproduciré ni usaré fuera del encargo.<br><b>4. Protección de datos.</b> Trataré los datos personales conforme al artículo 24 de la Constitución (garantía de confidencialidad) y buenas prácticas de protección de datos; no los cederé a terceros.<br><b>5. Vigencia.</b> Estas obligaciones subsisten durante la relación y por <b>2 años</b> tras su terminación.<br><b>6. Responsabilidad.</b> El incumplimiento faculta a la consultora a resolver el encargo, retener pagos pendientes por daños comprobados y ejercer las acciones civiles y penales aplicables (violación de secretos, Código Penal arts. 271–275).<br><b>7. Jurisdicción.</b> Este acuerdo se rige por las leyes de la República de Guatemala; las partes se someten a los tribunales de la ciudad de Guatemala.',
    admin:'<b>ACUERDO DE CONFIDENCIALIDAD — EQUIPO ADMINISTRATIVO (Guatemala)</b><br><br><b>1. Alcance.</b> Trataré con reserva absoluta datos de clientes, evaluadores, proyectos, finanzas y resultados, usándolos solo para fines operativos autorizados.<br><b>2. No divulgación ni extracción.</b> No extraeré, copiaré ni compartiré bases de datos, honorarios ni información comercial fuera de la plataforma.<br><b>3. Datos personales.</b> Custodiaré los datos conforme al art. 24 de la Constitución y buenas prácticas de protección de datos; el acceso indebido puede constituir delito (Código Penal arts. 274 y ss.).<br><b>4. Propiedad intelectual.</b> La metodología y la plataforma son propiedad de la consultora (Dto. 33-98).<br><b>5. Vigencia.</b> Subsiste durante la relación y <b>3 años</b> posteriores.<br><b>6. Jurisdicción.</b> Leyes de Guatemala; tribunales de la ciudad de Guatemala.',
    ops:'<b>ACUERDO DE CONFIDENCIALIDAD — EQUIPO OPERATIVO (Guatemala)</b><br><br><b>1.</b> Trataré con reserva la información de visitas, shoppers y resultados que gestiono, usándola solo para la operación de los proyectos asignados.<br><b>2. Datos.</b> Protegeré los datos personales conforme al art. 24 de la Constitución.<br><b>3. Propiedad intelectual.</b> Respeto la titularidad de la consultora (Dto. 33-98).<br><b>4. Vigencia.</b> Durante la relación y <b>2 años</b> posteriores.<br><b>5. Jurisdicción.</b> Leyes y tribunales de Guatemala.',
    coordinador:'<b>ACUERDO DE CONFIDENCIALIDAD — COORDINADOR / REPRESENTANTE REGIONAL (Guatemala)</b><br><br><b>1.</b> Mantendré la confidencialidad de proyectos, hojas de ruta, evaluadores y clientes de mi(s) país(es) asignado(s).<br><b>2. Alcance limitado.</b> Mi acceso se restringe a mi territorio; no compartiré información de otras regiones ni la usaré para fines ajenos al encargo.<br><b>3. Propiedad intelectual y datos.</b> Respeto la propiedad de la metodología y plataforma (Dto. 33-98) y la confidencialidad de datos (art. 24 Constitución).<br><b>4. Vigencia.</b> Durante la relación y <b>3 años</b> posteriores.<br><b>5. Jurisdicción.</b> Leyes y tribunales de Guatemala.',
    aliado:'<b>ACUERDO DE CONFIDENCIALIDAD Y FRANQUICIA — ALIADO / FRANQUICIADO (Guatemala)</b><br><br><b>1.</b> Operaré los proyectos delegados guardando reserva de metodología, instructivos, cuestionarios y resultados.<br><b>2. Propiedad intelectual.</b> La marca, procesos y plataforma pertenecen a la consultora (Dto. 33-98); no los replicaré ni explotaré fuera del acuerdo de franquicia.<br><b>3. No competencia y no elusión.</b> No captaré clientes ni evaluadores de la consultora para fines propios durante la relación y <b>2 años</b> posteriores.<br><b>4. Datos.</b> Protegeré los datos personales conforme a la ley.<br><b>5. Responsabilidad.</b> El incumplimiento genera responsabilidad civil y penal e indemnización por daños.<br><b>6. Jurisdicción.</b> Leyes y tribunales de Guatemala.',
    representante:'<b>ACUERDO DE CONFIDENCIALIDAD — REPRESENTANTE COMERCIAL (Guatemala)</b><br><br><b>1.</b> Trataré con reserva la información de prospectos, propuestas, precios y metodología de la consultora.<br><b>2. No divulgación.</b> No revelaré estrategias comerciales ni datos de clientes potenciales a competidores.<br><b>3. Propiedad intelectual.</b> Reconozco la titularidad de la consultora sobre marca y materiales (Dto. 33-98).<br><b>4. Vigencia.</b> Durante la relación y <b>2 años</b> posteriores.<br><b>5. Jurisdicción.</b> Leyes y tribunales de Guatemala.',
    socio:'<b>ACUERDO DE CONFIDENCIALIDAD — SOCIO (Guatemala)</b><br><br><b>1.</b> Mantendré reserva estratégica, financiera y operativa del negocio, sus clientes y su tecnología, conforme al acuerdo societario y al Código de Comercio.<br><b>2. Propiedad intelectual.</b> La tecnología y metodología son activos de la sociedad (Dto. 33-98).<br><b>3. No competencia.</b> No explotaré la información en negocios que compitan con la sociedad.<br><b>4. Vigencia.</b> Indefinida para secretos comerciales; <b>5 años</b> tras la salida.<br><b>5. Jurisdicción.</b> Leyes y tribunales de Guatemala.',
    cliente:'<b>ACUERDO DE CONFIDENCIALIDAD — CLIENTE / PORTAL (Guatemala)</b><br><br><b>1.</b> Trataré con reserva los resultados, evaluaciones y datos de mis sucursales y personal.<br><b>2. Anonimato del evaluador.</b> No intentaré identificar a los evaluadores ni usaré los resultados para represalias improcedentes (respeto a la dignidad laboral, Código de Trabajo).<br><b>3. Datos personales.</b> Manejaré los datos del personal conforme al art. 24 de la Constitución.<br><b>4. Uso.</b> Los reportes son para uso interno de mejora; no los cederé a terceros sin autorización.<br><b>5. Vigencia.</b> Durante la relación y <b>2 años</b> posteriores.<br><b>6. Jurisdicción.</b> Leyes y tribunales de Guatemala.',
    super:'<b>ACUERDO DE CONFIDENCIALIDAD Y RESPONSABILIDAD — ADMINISTRADOR PRINCIPAL (Guatemala)</b><br><br><b>1.</b> Soy responsable del uso confidencial y conforme a la ley de todos los datos de la plataforma: clientes, evaluadores, resultados, finanzas e integraciones.<br><b>2. Cumplimiento.</b> Garantizo el acuerdo de tratamiento de datos con cada cliente y la custodia de credenciales.<br><b>3. Propiedad intelectual.</b> Velaré por la protección de la metodología y plataforma (Dto. 33-98).<br><b>4. Vigencia.</b> Durante la relación y <b>3 años</b> posteriores.<br><b>5. Jurisdicción.</b> Leyes y tribunales de Guatemala.',
  };
  },
  text(role){ try{ const s=JSON.parse(localStorage.getItem('cx_nda_text')||'null'); if(s&&s[role])return s[role]; }catch(e){} return this._defaults()[role]||this._defaults().admin; },
  setText(role, txt){ let s={}; try{ s=JSON.parse(localStorage.getItem('cx_nda_text')||'{}'); }catch(e){} s[role]=txt; try{ localStorage.setItem('cx_nda_text',JSON.stringify(s)); }catch(e){} this.bumpVersion(role); },
  show(role, onDone){
    const texto = this.text(role);
    const ov=document.createElement('div'); ov.className='cx-ov'; ov.style.zIndex='9500';
    ov.innerHTML=`<div class="cx-modal" style="width:min(520px,96vw)">
      <div class="cx-modal-h"><div class="card-t" style="font-size:16px">🔒 Cláusula de confidencialidad</div></div>
      <div class="cx-modal-b">
        <p style="font-size:13.5px;color:var(--t2);line-height:1.7;margin-bottom:14px">${texto}</p>
        <div style="background:var(--panel-2);border:1px solid var(--border);border-radius:10px;padding:11px 13px;font-size:12px;color:var(--t3);margin-bottom:14px">Debes aceptar para continuar. Queda registrada la fecha de aceptación (este es un demo; en producción se firma y audita).</div>
        <label class="flex" style="gap:8px;font-size:13px;color:var(--t1);margin-bottom:16px"><input type="checkbox" id="ndaChk"> He leído y acepto la cláusula de confidencialidad.</label>
        <div style="text-align:right"><button class="btn btn-pr" id="ndaOk" disabled style="opacity:.5">Aceptar y continuar</button></div>
      </div></div>`;
    document.body.appendChild(ov);
    const chk=ov.querySelector('#ndaChk'), ok=ov.querySelector('#ndaOk');
    chk.addEventListener('change',()=>{ok.disabled=!chk.checked;ok.style.opacity=chk.checked?'1':'.5';});
    ok.addEventListener('click',()=>{ this.accept(role); ov.remove(); if(onDone)onDone(); });
  },
};
