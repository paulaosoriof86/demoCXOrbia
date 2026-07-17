/* ============================================================
   CXOrbia · Indicador único de origen de datos (P0-1 — paquete genérico 20260711)
   Un solo punto de verdad para demo / source_safe_preview / connected.
   Se resuelve ANTES del primer render (cargado justo después de
   core/data.js, antes de los módulos). No sustituye ni envuelve la
   interfaz pública de CX.data — solo declara y expone el modo activo
   para que CUALQUIER superficie de UI (rail, topbar, diagnóstico)
   lo muestre desde la MISMA función, nunca desde lógica propia.

   Honesto por diseño: mientras no exista un adapter backend real,
   source_safe_preview y connected SIEMPRE quedan en estado 'blocked'
   — nunca caen en silencio a los seeds de demo. demo es el único
   modo que hoy tiene datos que mostrar.

   Compatibilidad con banderas heredadas (V66-2: window.CX_BACKEND_DEV,
   localStorage 'cx_imported'): se leen SOLO como nota informativa de
   compatibilidad — nunca determinan el modo ni infieren 'connected'.
   Antes existía un segundo indicador independiente en el rail
   (core/router.js) que leía estas banderas por su cuenta y podía
   mostrar un estado contradictorio con CX.dataSource; ahora ambas
   superficies llaman a badge() de este archivo — una sola función
   resuelve modo, etiqueta, estado y visibilidad.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const LS='cx_data_mode';
  const MODES=['demo','source_safe_preview','connected'];

  CX.dataSource = {
    mode:'demo',
    status:'ready',       // ready | loading | blocked | degraded | error
    sourceRef:'',
    updatedAt:'',
    warnings:[],
    blockers:[],
    legacyNote:'',

    _load(){
      try{ const m=localStorage.getItem(LS); if(m && MODES.includes(m)) this.mode=m; }catch(e){}
    },
    _save(){ try{ localStorage.setItem(LS, this.mode); }catch(e){} },

    /* Banderas heredadas: SOLO compatibilidad informativa. Nunca alteran mode/status/isBlocked —
       una bandera aislada (p.ej. window.CX_BACKEND_DEV=true sin que el modo activo sea 'connected')
       jamás debe hacer que la app se presente como conectada. */
    _legacyFlags(){
      const out=[];
      try{ if(window.CX_BACKEND_DEV) out.push('CX_BACKEND_DEV activo (bandera heredada V66-2, no determina el modo)'); }catch(e){}
      try{ if(localStorage.getItem('cx_imported')) out.push('cx_imported presente (bandera heredada V66-2, no determina el modo)'); }catch(e){}
      return out;
    },

    /* se resuelve una sola vez, antes del primer render (ver invocación al final del archivo) */
    resolve(){
      this._load();
      this.updatedAt=new Date().toISOString();
      this.warnings=[]; this.blockers=[];
      if(this.mode==='demo'){
        this.status='ready';
        this.sourceRef='demo:seeds-locales';
        this.warnings.push('Modo demo: todos los datos son ficticios y están claramente rotulados como ejemplo.');
      } else if(this.mode==='source_safe_preview'){
        /* honesto: no existe hoy un bridge real que hidrate CX.data desde una fuente source-safe
           real — así que el estado correcto es "bloqueado", no mostrar los seeds de demo disfrazados. */
        this.status='blocked';
        this.sourceRef='';
        this.blockers.push('No hay una fuente source-safe conectada todavía — el bridge genérico de CX.data está pendiente de implementación backend.');
      } else if(this.mode==='connected'){
        this.status='blocked';
        this.sourceRef='';
        this.blockers.push('No hay un adapter backend autorizado conectado — "connected" no se activa desde este paquete.');
      }
      const legacy=this._legacyFlags();
      this.legacyNote = legacy.length ? legacy.join(' · ') : '';
      if(legacy.length) this.warnings.push('Nota de compatibilidad (no afecta el modo activo): '+this.legacyNote);
      return this;
    },

    /* P0-5 (paquete acumulado 20260711): cambiar de modo EN LA MISMA sesión dejaba vivo en
       localStorage (y en cachés en-memoria de otros módulos) cualquier dato sembrado/creado
       mientras el modo era 'demo' — un correo leído, una reserva, un usuario editado seguían
       apareciendo si luego se cambiaba a source_safe_preview/connected, mezclando fixtures con
       lo que debería ser una vista limpia. Al SALIR de demo (o al volver a entrar, para no
       arrastrar nada de una sesión previa en otro modo) se purgan los namespaces de datos
       sembrados por fixtures: correo (cx_mails), reservas por proyecto (cx_reservas_*), usuarios
       y roles personalizados (cx_users, cx_custom_roles), y las notificaciones en memoria
       (CX.notif._items). NO se purga configuración real del tenant (cx_theme, cx_font, cx_modules,
       cx_perm, cx_creds, cx_tenant_id, cx_session) — eso no es un fixture, es configuración
       persistente legítima independiente del modo de datos. */
    _purgeFixtureNamespaces(){
      try{
        localStorage.removeItem('cx_mails');
        localStorage.removeItem('cx_users');
        localStorage.removeItem('cx_custom_roles');
        Object.keys(localStorage).filter(k=>k.indexOf('cx_reservas_')===0).forEach(k=>localStorage.removeItem(k));
      }catch(e){}
      try{ if(CX.topbar) CX.topbar._mails=null; }catch(e){}
      try{ if(CX.reservas) CX.reservas._r={}; }catch(e){}
      try{ if(CX.notif) CX.notif._items = this.showFixtures() ? CX.notif._items : []; }catch(e){}
    },

    /* cambia de modo, persiste, re-resuelve y notifica — el shell (app.js) decide qué hacer
       con el nuevo estado (bloquear render o dejar pasar). Solo un modo puede estar activo. */
    setMode(mode){
      if(!MODES.includes(mode)) return this;
      const changed = mode!==this.mode;
      this.mode=mode; this._save(); this.resolve();
      if(changed) this._purgeFixtureNamespaces();
      CX.bus && CX.bus.emit('datasource');
      return this;
    },

    isBlocked(){ return this.status==='blocked' || this.status==='error'; },
    label(){ return {demo:'Demo',source_safe_preview:'Source-safe (preview)',connected:'Conectado'}[this.mode]||'No disponible'; },
    statusLabel(){ return {ready:'✅ Listo',loading:'⏳ Cargando',blocked:'⛔ Bloqueado',degraded:'⚠️ Degradado',error:'❌ Error'}[this.status]||this.status; },
    /* color asociado al estado, para el punto de color del badge compacto */
    color(){ return {ready:'#0e9c6e',loading:'#2a6fdb',blocked:'#d97706',degraded:'#d97706',error:'#dc2626'}[this.status]||'#94a3b8'; },

    /* OLA1 (paquete V114→V115, contrato reutilizable 05-CONTRATOS-REUTILIZABLES-A-REFLEJAR.md):
       nombres de campo EXACTOS del contrato de Fuente, sin duplicar el estado ya resuelto arriba
       (mode/status/sourceRef/warnings/blockers/updatedAt) — son alias de solo lectura sobre los
       mismos valores, para que cualquier módulo que necesite el nombre exacto del contrato lo
       obtenga de una única función en vez de inventar su propio mapeo. */
    sourceContract(){
      return {
        sourceSnapshotAt: this.updatedAt || null,
        sourceReadMode: this.mode,
        runtimeSyncActive: this.mode==='connected' && this.status==='ready',
        sourceRef: this.sourceRef || null,
        warnings: this.warnings.slice(),
        blockers: this.blockers.slice(),
      };
    },

    /* ÚNICA función que cualquier superficie de UI (rail, topbar, diagnóstico) debe llamar para
       pintar el indicador de origen de datos — nunca deriven su propia lógica de banderas. */
    badge(){
      return { t: this.label()+' · '+this.statusLabel(), c: this.color(), mode: this.mode, status: this.status };
    },

    /* P0-2 (paquete genérico 20260711): guard de fixtures — aunque el shell ya bloquea el 100%
       del render fuera de 'demo' (app.js renderDataSourceBlock), esta función es una segunda capa
       de defensa para que ningún módulo con datos de ejemplo (Correo, Soporte, Finanzas,
       Certificaciones, Dashboard, portales) pueda mostrar esos fixtures si en algún momento se
       invoca fuera del flujo normal del shell. Los módulos deben envolver su array/objeto semilla
       con `CX.dataSource.showFixtures() ? seed : []` (o equivalente) en vez de asumir que siempre
       están en demo. */
    showFixtures(){ return this.mode==='demo'; },
  };

  CX.dataSource.resolve();
})();
