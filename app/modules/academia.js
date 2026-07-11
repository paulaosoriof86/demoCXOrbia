/* ============================================================
   CXOrbia · Academia — cursos por lecciones, por audiencia y categoría
   Modelo: curso → lecciones (5-6 por curso, profundas) → evaluación
   Igual a Orbit Academia: sidebar, progress, verify por pregunta, certificación.
   ============================================================ */
window.CX=window.CX||{};

/* ─ Catálogo de cursos ─ */
CX.acadData={
  CATS:(()=>{try{const s=JSON.parse(localStorage.getItem('cx_acad_cats')||'null');if(s&&Array.isArray(s)&&s.length)return s;}catch(e){}return ['Todos','Inducción','Operación','Set-up','Finanzas','Comercial','Técnico','IA','Industria MS'];})(),
  /* ── Persistencia de cursos personalizados ── */
  _ck:'cx_acad_cust',
  getCustom(r){ try{return JSON.parse(localStorage.getItem(this._ck+'_'+r)||'[]');}catch(e){return[];} },
  saveCustom(r,arr){ try{localStorage.setItem(this._ck+'_'+r,JSON.stringify(arr));}catch(e){} CX.bus&&CX.bus.emit('acad'); },
  /* Bloque 4 (auditoría V100 — corrección exacta): addCourse()/editCourse() ahora EXIGEN permiso
     de acción (academy.create/academy.edit) — antes solo duplicateCourse() lo validaba. Devuelven
     {ok:false,error} en vez de ejecutar en silencio cuando el rol no tiene el permiso. */
  addCourse(r,c,ctx){
    if(CX.permissions && !CX.permissions.can('academy.create', ctx)) return {ok:false, error:'Tu rol no tiene el permiso de acción "academy.create".'};
    const arr=this.getCustom(r); const lessons=c.lessons||[]; const mins=(typeof c.mins==='number')?c.mins:Math.max(10,lessons.length*12);
    const auditRef='aud_'+Math.random().toString(36).slice(2,8);
    arr.unshift(Object.assign({id:'cu'+Date.now().toString(36),lessons:[],mins,cert:false,estado:'borrador',contentVersion:1,workflowVersion:1,auditRef},c,{mins}));
    this.saveCustom(r,arr);
    this._logAudit(r,{accion:'crear',cid:arr[0].id,titulo:arr[0].n,motivo:c.motivo||'(creación)'});
    return {ok:true, course:arr[0]};
  },
  editCourse(r,cid,patch,ctx){
    if(CX.permissions && !CX.permissions.can('academy.edit', ctx)) return {ok:false, error:'Tu rol no tiene el permiso de acción "academy.edit".'};
    const cs=[...this.COURSES[r]||[],...this.getCustom(r)]; const c=cs.find(x=>x.id===cid); if(c)Object.assign(c,patch); const custom=this.getCustom(r); const cu=custom.find(x=>x.id===cid); if(cu){Object.assign(cu,patch); cu.contentVersion=(cu.contentVersion||1)+1;} this.saveCustom(r,custom);
    this._logAudit(r,{accion:'editar',cid,titulo:(cu&&cu.n)||(c&&c.n)||cid,motivo:patch.motivo||'(edición de campos)'});
    return {ok:true};
  },
  /* ---- Ciclo de vida de cursos personalizados (paquete 20260710 — Academia transversal) ----
     Solo aplica a cursos CUSTOM (creados/editados desde la UI); el contenido seed/base de
     Academia es material de referencia de la plataforma y no se archiva ni versiona desde aquí. */
  _audKey(r){ return 'cx_acad_audit_'+r; },
  auditLog(r){ try{return JSON.parse(localStorage.getItem(this._audKey(r))||'[]');}catch(e){return [];} },
  /* P0-5 (paquete genérico 20260711): CADA entrada de auditoría lleva su PROPIO auditRef —
     antes solo el curso tenía un auditRef fijo desde su creación, y todos los eventos
     posteriores (editar, transicionar, duplicar…) se registraban sin una referencia propia. */
  _logAudit(r,entry){ const l=this.auditLog(r); const auditRef='aud_'+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
    l.unshift(Object.assign({fecha:new Date().toISOString(),por:(CX.session&&CX.session.user&&CX.session.user.name)||'—',auditRef},entry)); try{localStorage.setItem(this._audKey(r),JSON.stringify(l.slice(0,300)));}catch(e){} },
  isCustom(r,cid){ return this.getCustom(r).some(x=>x.id===cid); },

  /* P0.6 (V98 instrucciones exactas): transición ÚNICA y centralizada de estado de curso.
     Estados: borrador → en_revision → aprobado → publicado_preview → archivado / eliminado.
     Reglas: motivo obligatorio en archivar/eliminar/restaurar/aprobar/publicar; restaurar
     SIEMPRE vuelve a 'borrador' (nunca directo a publicado); publicar exige permiso
     'academy.publish'; cada transición queda en auditLog con estado anterior/nuevo, actor,
     motivo y auditRef; y dispara una notificación local de cambio de estado/versión. */
  ALLOWED_TRANSITIONS:{
    borrador:['en_revision','archivado','eliminado'],
    en_revision:['aprobado','borrador','archivado','eliminado'],
    aprobado:['publicado_preview','en_revision','archivado','eliminado'],
    publicado_preview:['archivado','en_revision'],
    archivado:['borrador'],
    eliminado:['borrador'],
  },
  ACTION_FOR_STATE:{ en_revision:'academy.review', aprobado:'academy.approve', archivado:'academy.archive', eliminado:'academy.delete', publicado_preview:'academy.publish', borrador:'academy.restore' },
  setCourseState(r, cid, nextState, opts){
    opts=opts||{};
    const reason=(opts.reason||'').trim();
    if(!this.isCustom(r,cid)) return {ok:false, error:'El contenido seed no cambia de estado desde el prototipo.'};
    const custom=this.getCustom(r); const c=custom.find(x=>x.id===cid); if(!c) return {ok:false, error:'Curso no encontrado.'};
    const prev=c.estado||'borrador';
    const allowedNext=this.ALLOWED_TRANSITIONS[prev]||[];
    if(prev!==nextState && !allowedNext.includes(nextState)) return {ok:false, error:'Transición no permitida: '+prev+' → '+nextState+'.'};
    /* motivo obligatorio en archivar, eliminar, restaurar (→borrador), aprobar, publicar */
    const needsReason = ['archivado','eliminado','publicado_preview','aprobado'].includes(nextState) || (nextState==='borrador' && (prev==='archivado'||prev==='eliminado'));
    if(needsReason && !reason) return {ok:false, error:'El motivo es obligatorio para pasar a "'+nextState+'".'};
    /* permiso de acción — no basta con ocultar el botón, se valida también aquí */
    const action=this.ACTION_FOR_STATE[nextState];
    if(action && CX.permissions && !CX.permissions.can(action, opts.ctx)){
      return {ok:false, error:'Tu rol no tiene el permiso de acción "'+action+'".'};
    }
    c.estado=nextState; c.workflowVersion=(c.workflowVersion||1)+1; this.saveCustom(r,custom);
    const accionLbl={en_revision:'enviar a revisión',aprobado:'aprobar',publicado_preview:'publicar (preview)',archivado:'archivar',eliminado:'eliminar',borrador:'restaurar a borrador'}[nextState]||nextState;
    this._logAudit(r,{accion:accionLbl, cid, titulo:c.n, motivo:reason||'(sin motivo — transición sin exigencia)', estadoAnterior:prev, estadoNuevo:nextState, source:opts.source||'ui_admin'});
    /* notificación local del cambio (in-app; nunca canal externo) */
    CX.notif && CX.notif.push({to:'admin', tipo:'academia_estado', icon:'📚', tono:'b', titulo:'Academia: "'+c.n+'" → '+nextState, txt:'workflow v'+c.workflowVersion+' · '+(reason||'sin motivo adicional')+' (auditoría preview local, no de backend)', nav:'aprendizaje'});
    return {ok:true, course:c};
  },

  duplicateCourse(r,cid,ctx){
    const src=[...this.COURSES[r]||[],...this.getCustom(r)].find(x=>x.id===cid); if(!src) return null;
    if(CX.permissions && !CX.permissions.can('academy.duplicate', ctx)) return null;
    const arr=this.getCustom(r); const auditRef='aud_'+Math.random().toString(36).slice(2,8);
    const copy=Object.assign({},JSON.parse(JSON.stringify(src)),{id:'cu'+Date.now().toString(36),n:(src.n||'Curso')+' (copia)',estado:'borrador',contentVersion:1,workflowVersion:1,auditRef});
    arr.unshift(copy); this.saveCustom(r,arr);
    this._logAudit(r,{accion:'duplicar',cid:copy.id,titulo:copy.n,motivo:'Duplicado desde "'+(src.n||'')+'"'});
    return copy;
  },
  archiveCourse(r,cid,motivo,ctx){ return this.setCourseState(r,cid,'archivado',{reason:motivo,ctx}).ok; },
  /* restaurar SIEMPRE vuelve a 'borrador' (nunca directo a publicado_preview) — desde ahí
     el flujo normal es enviar a revisión → aprobar → publicar, cada paso con su propio motivo. */
  restoreCourse(r,cid,motivo,ctx){ return this.setCourseState(r,cid,'borrador',{reason:motivo,ctx}).ok; },
  /* Bloque 4 (auditoría V100 — corrección exacta): crear/editar lecciones ahora exige permiso
     de acción (academy.edit) — antes ninguna de las dos se validaba. Además se corrigió un bug
     real encontrado durante la auditoría: addLesson() nunca llamaba saveCustom(), así que una
     lección agregada se perdía al recargar (mutaba un objeto efímero de getCustom() y solo
     emitía el evento del bus, sin persistir nada). */
  addLesson(r,cid,lesson,ctx){
    if(CX.permissions && !CX.permissions.can('academy.edit', ctx)) return {ok:false, error:'Tu rol no tiene el permiso de acción "academy.edit".'};
    const custom=this.getCustom(r); const c=custom.find(x=>x.id===cid);
    if(!c) return {ok:false, error:'Solo se pueden agregar lecciones a cursos personalizados.'};
    c.lessons=c.lessons||[]; c.lessons.push(Object.assign({id:'ls'+Date.now().toString(36)},lesson)); c.contentVersion=(c.contentVersion||1)+1;
    this.saveCustom(r,custom); CX.bus&&CX.bus.emit('acad');
    this._logAudit(r,{accion:'agregar_leccion',cid,titulo:c.n,motivo:(lesson&&lesson.motivo)||'(lección nueva)'});
    return {ok:true};
  },
  editLesson(r,cid,lid,patch,ctx){
    if(CX.permissions && !CX.permissions.can('academy.edit', ctx)) return {ok:false, error:'Tu rol no tiene el permiso de acción "academy.edit".'};
    const custom=this.getCustom(r); const c=custom.find(x=>x.id===cid);
    if(!c) return {ok:false, error:'Solo se pueden editar lecciones de cursos personalizados.'};
    const l=(c.lessons||[]).find(x=>x.id===lid); if(l){Object.assign(l,patch); c.contentVersion=(c.contentVersion||1)+1;}
    this.saveCustom(r,custom); CX.bus&&CX.bus.emit('acad');
    this._logAudit(r,{accion:'editar_leccion',cid,titulo:c.n,motivo:(patch&&patch.motivo)||'(edición de lección)'});
    return {ok:true};
  },
  /* soft-delete de lección (P0.8 — auditoría V99): igual patrón que los cursos — nunca
     hard-delete, exige motivo, y queda auditada. La lección oculta no aparece en el reproductor
     normal (se filtra por _deleted) pero es recuperable llamando restoreLesson(). */
  delLesson(r,cid,lid,motivo,ctx){
    if(CX.permissions && !CX.permissions.can('academy.edit', ctx)) return {ok:false,error:'Tu rol no tiene el permiso de acción "academy.edit".'};
    if(!motivo||!motivo.trim()) return {ok:false,error:'El motivo es obligatorio para eliminar una lección.'};
    const custom=this.getCustom(r); const c=custom.find(x=>x.id===cid); if(!c) return {ok:false,error:'Curso no encontrado.'};
    const l=(c.lessons||[]).find(x=>x.id===lid); if(!l) return {ok:false,error:'Lección no encontrada.'};
    l._deleted=true; c.contentVersion=(c.contentVersion||1)+1; this.saveCustom(r,custom);
    this._logAudit(r,{accion:'eliminar_leccion',cid,titulo:c.n+' → '+l.n,motivo});
    return {ok:true};
  },
  restoreLesson(r,cid,lid,motivo,ctx){
    if(CX.permissions && !CX.permissions.can('academy.edit', ctx)) return {ok:false,error:'Tu rol no tiene el permiso de acción "academy.edit".'};
    /* Bloque D (auditoría V101 — 20260711): restaurar una lección eliminada permitía motivo vacío
       ("sin motivo registrado") — ahora es obligatorio, igual que al eliminar (delLesson). */
    if(!motivo||!motivo.trim()) return {ok:false,error:'El motivo es obligatorio para restaurar una lección.'};
    const custom=this.getCustom(r); const c=custom.find(x=>x.id===cid); if(!c) return {ok:false,error:'Curso no encontrado.'};
    const l=(c.lessons||[]).find(x=>x.id===lid); if(!l) return {ok:false,error:'Lección no encontrada.'};
    delete l._deleted; c.contentVersion=(c.contentVersion||1)+1; this.saveCustom(r,custom);
    this._logAudit(r,{accion:'restaurar_leccion',cid,titulo:c.n+' → '+l.n,motivo:motivo.trim()});
    return {ok:true};
  },
  delCourse(r,cid,motivo,ctx){ return this.setCourseState(r,cid,'eliminado',{reason:motivo,ctx}).ok;
  },
  COURSES:{
    admin:[
      /* ─── FINANZAS & LIQUIDACIONES (profundo) ─── */
      {id:'a_fin_op',cat:'Finanzas',ic:'💵',color:'#0e9c6e',n:'Finanzas: liquidaciones, movimientos y beneficios',
       desc:'Cómo se liquida, se paga y se concilia — pantalla por pantalla, con estados honestos.',
       cert:false,mins:55,
       lessons:[
         {id:'af1',ic:'🧾',n:'De la visita al pago: el flujo',content:`
<h2>El recorrido del dinero</h2>
<div class="acad-section">🎯 <b>Objetivo del módulo</b><p>Liquidaciones convierte cada visita aprobada en un monto a pagar, sin que nadie calcule nada a mano. Vive en <b>Finanzas → Liquidaciones</b>.</p></div>
<div class="acad-section">⚙️ <b>Cómo funciona</b><p>Cuando una visita se marca realizada y su cuestionario queda "realizado/completado", el sistema genera automáticamente un registro de liquidación en estado <code>pending_review</code>. Ese registro recorre estados hasta convertirse en un pago real — nunca salta directo de "realizada" a "pagada".</p></div>
<div class="acad-section">🖱️ <b>Pantalla y botones que usarás</b><p>En la tabla de Liquidaciones, cada fila tiene un selector de estado (<code>pending_review → in_review → needs_correction/approved_for_submitido → submitido_registered</code>), un campo de <b>Nota/motivo</b> obligatorio para justificar el cambio, y el botón <b>"Guardar revisión"</b>. Ninguno de estos cambios de estado se pierde: queda en la <b>bitácora de revisión</b> de esa visita, visible para auditoría.</p></div>
<h3>Flujo completo, paso a paso</h3>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Cuestionario realizado</b><p>El shopper completó y entregó el cuestionario. Aún no genera liquidación.</p></div>
  <div class="acad-step"><span>2</span><b>Revisión admin</b><p>Apruebas, pides corrección o marcas conflicto (held_for_conflict).</p></div>
  <div class="acad-step"><span>3</span><b>Submitido</b><p>Confirmado manual o desde HR según config del proyecto.</p></div>
  <div class="acad-step"><span>4</span><b>Candidata para lote</b><p>Verificas y mueves a un lote de pago (batchId).</p></div>
  <div class="acad-step"><span>5</span><b>Pago (backend)</b><p>El cruce financiero real lo hace el backend. En el prototipo queda "preview".</p></div>
</div>
<div class="acad-section">✅ <b>Para qué sirve (si no existiera este módulo)</b><p>Sin este ciclo, calcularías honorarios y reembolsos manualmente en un Excel cada quincena, sin registro de quién aprobó qué ni por qué — y cualquier error en un cuestionario se pagaría igual porque nadie tendría un punto de control antes de comprometer el dinero.</p></div>
<blockquote>Ningún estado dice "pagado" sin cruce financiero real del backend. En el prototipo verás "candidata / preview operativo".</blockquote>`},
         {id:'af2',ic:'💳',n:'Movimientos: ingresos, egresos y CxC/CxP',content:`
<h2>Movimientos & Tesorería</h2>
<div class="acad-section">🎯 <b>Objetivo del módulo</b><p>Registrar y conciliar todo el dinero que entra y sale de la operación — vive en <b>Finanzas → Movimientos</b>. Es la fuente de verdad detrás de cada cifra del Dashboard Financiero.</p></div>
<div class="acad-section">⚙️ <b>Cómo funciona</b><p>Cada movimiento (ingreso o egreso) queda ligado a un proyecto (o marcado como global) y a un estado de conciliación. El sistema no concilia solo — tú confirmas cuándo un movimiento registrado ya se verificó con su comprobante real.</p></div>
<div class="acad-section">🖱️ <b>Pantalla y botones que usarás</b><p>En Movimientos encontrarás los botones <b>"⚙️ Generar CxC/CxP automáticas"</b> (crea cuentas por cobrar/pagar a partir de las liquidaciones y facturación del periodo), <b>"＋ Remesa"</b> (registra una transferencia de/hacia la casa matriz), y <b>"⤒ Importar histórico"</b> (carga movimientos previos desde archivo). Cada CxC/CxP en la tabla es clickeable para ver su detalle y marcarla conciliada.</p></div>
<h3>Tipos de movimiento</h3>
<div class="acad-section"><b>Ingreso</b><p>Define la <b>fuente/pagador</b> (cliente, casa matriz) y el <b>proyecto destino</b>. Estados: conciliado, pendiente (CxC), por conciliar.</p></div>
<div class="acad-section"><b>Egreso</b><p>Define el <b>beneficiario</b> (shopper, proveedor) y el proyecto. Un pago de lote genera un egreso por beneficiario con su número de lote.</p></div>
<div class="acad-section"><b>CxC / CxP</b><p>Cuentas por cobrar y por pagar con buscador. Un egreso programado crea una CxP; al liquidarse, se concilia.</p></div>
<div class="acad-section">✅ <b>Para qué sirve (si no existiera este módulo)</b><p>Sin Movimientos, el Dashboard Financiero mostraría solo estimaciones sin respaldo — no sabrías con certeza si un ingreso del cliente ya llegó de verdad o si sigues esperando el comprobante.</p></div>
<h3>Datos sensibles</h3>
<p>Los datos bancarios del shopper y montos de pago son sensibles: en producción se protegen por backend y solo se referencian con <code>sourcePaymentRef</code> opaco. El prototipo no expone datos reales.</p>`},
         {id:'af3',ic:'🎟️',n:'Conceptos configurables (Boleto, Combo, etc.)',content:`
<h2>Conceptos de reembolso por proyecto</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Permitir que cada proyecto reembolse al shopper los consumos que su escenario exige (ej. entrada de cine, combo), sin que estos conceptos estén programados fijos en la plataforma.</p></div>
<div class="acad-section">⚙️ <b>Cómo funciona</b><p>Al configurar el proyecto (Admin del Proyecto → Proyectos → ⚙️), defines la lista de conceptos reembolsables junto con su monto tope (si aplica) y si requieren evidencia (foto del ticket). Esa lista queda asociada SOLO a ese proyecto — otro proyecto define la suya propia, sin interferir.</p></div>
<div class="acad-section">🖱️ <b>Dónde se configura y usa</b><p>Se configura una sola vez en la ficha del proyecto. Después, cada vez que un shopper llena su cuestionario, el escenario le pide adjuntar la evidencia del concepto correspondiente (ej. foto del ticket de "Combo"), y ese monto se suma automáticamente al total de su liquidación junto al honorario.</p></div>
<div class="acad-section"><b>Ejemplo (configurable)</b><p>Un programa de cine puede definir "Boleto" y "Combo" como conceptos reembolsables. Otro programa define los suyos. La plataforma no los trae fijos.</p></div>
<ul class="acad-check">
<li>Conceptos de reembolso definidos por proyecto</li>
<li>Monto tope por concepto (si aplica)</li>
<li>Evidencia requerida para reembolsar (foto del ticket)</li>
<li>Corte del periodo: reembolsos pendientes quedan como liquidación/pago pendiente hasta el cruce</li>
</ul>
<div class="acad-section">✅ <b>Para qué sirve (si no existiera esto)</b><p>Sin conceptos configurables, cada cliente nuevo con un modelo de reembolso distinto (cine, restaurante, banco) requeriría una modificación de código — lo que hace que la plataforma sea difícil de vender a nuevos rubros de negocio.</p></div>
<blockquote>Lo específico de un cliente (conceptos, montos) es configuración por tenant/proyecto/periodo, para mantener la plataforma comercializable y multi-proyecto.</blockquote>`},
         {id:'af4',ic:'❓',n:'Evaluación de finanzas',tipo:'quiz',quiz:[
           {q:'Un egreso por pago de lote, ¿qué genera?',o:['Un ingreso','Un egreso por beneficiario con número de lote','Una CxC'],a:1,fb:'Genera un egreso por beneficiario (shopper/proveedor) asociado a su número de lote (batchId).'},
           {q:'¿Los conceptos "Boleto" y "Combo" son fijos de la plataforma?',o:['Sí, siempre están','No: son configuración por tenant/proyecto','Solo en cine'],a:1,fb:'Son configuración por proyecto. La plataforma es genérica y comercializable; cada cliente define sus conceptos.'},
           {q:'¿Cuándo un movimiento dice "pagado"?',o:['Al moverlo a lote','Solo cuando el backend hace el cruce financiero real','Al crear la liquidación'],a:1,fb:'En el prototipo se muestra "candidata/preview". El estado real de pago depende del cruce del backend.'},
         ]},
       ]},
      /* ─── BLOQUES BACKEND (transparencia de estado) ─── */
      {id:'a_backend_prepared',cat:'Inducción',ic:'🔌',color:'#7c3aed',n:'Capacidades de backend: qué está preparado',
       desc:'Qué funciones dependen del backend y cómo se ven mientras el gate no está activo.',
       cert:false,mins:25,
       lessons:[
         {id:'ab1',ic:'🔌',n:'Preparado vs. activo',content:`
<h2>Cómo leer los estados del backend</h2>
<p>Varias capacidades ya tienen su interfaz lista pero su ejecución real ocurre en el backend. Mientras el gate no esté autorizado, verás el badge <b>"preparado / pendiente backend"</b> — nunca "enviado" o "en vivo" falsos. Esta distinción existe para que nunca confundas una demo bien diseñada con un sistema en producción: lo que ves funciona en pantalla, pero la acción real (enviar un WhatsApp, escribir en una base de datos externa) solo ocurre cuando el equipo técnico activa esa conexión.</p>
<div class="acad-cards">
  <div class="acad-card"><div>🕐</div><b>Historial de comunicación</b><p>Timeline seguro por shopper. Se poblará cuando el backend registre los envíos reales.</p></div>
  <div class="acad-card"><div>⭐</div><b>Ranking / scoring</b><p>Ayuda al admin a decidir. No autoasigna: la decisión sigue siendo humana.</p></div>
  <div class="acad-card"><div>📐</div><b>Versionado de reglas</b><p>Cada proyecto/tenant versiona sus reglas; los cambios quedan con changelog draft→review→approved.</p></div>
  <div class="acad-card"><div>🚦</div><b>Release readiness</b><p>Snapshot con blockers antes de habilitar producción.</p></div>
  <div class="acad-card"><div>🧪</div><b>Synthetic pack</b><p>Fixtures de prueba — NO son la fuente real de datos del cliente.</p></div>
</div>
<blockquote>Regla de oro: si un dato no dice explícitamente que proviene de una fuente confirmada, trátalo como preview. El indicador de fuente de datos en el sidebar te lo aclara.</blockquote>`},
         {id:'ab3',ic:'🚪',n:'Qué es un "gate" y quién lo activa',content:`
<h2>El concepto de gate, explicado sin jerga</h2>
<p>Un "gate" es simplemente un interruptor que separa "la interfaz está lista para mostrarse" de "la acción real está autorizada a ejecutarse". Existen tres estados posibles que verás repetidos en Diagnóstico & Readiness y en Administrabilidad:</p>
<ul>
<li><b>⛔ Gate apagado:</b> la funcionalidad está construida pero nadie la ha autorizado a tocar datos o sistemas reales todavía.</li>
<li><b>🧪 Preview:</b> puedes probar el flujo completo con datos de ejemplo (fixtures), pero no afecta nada real.</li>
<li><b>👤 Revisión humana:</b> la acción sí puede ejecutarse, pero solo después de que una persona confirme la decisión — nunca de forma automática.</li>
</ul>
<p>¿Quién prende un gate? Normalmente el equipo técnico, una vez que el backend correspondiente (Firebase, Make, Gemini, Storage) está conectado y probado en un ambiente controlado. Como admin de negocio, tu rol no es prender el gate — es entender en qué estado está cada capacidad para explicarle correctamente al cliente qué es demo y qué es producción real.</p>`},
         {id:'ab4',ic:'❓',n:'Evaluación',tipo:'quiz',quiz:[
           {q:'El ranking de shoppers, ¿asigna visitas solo?',o:['Sí, automático','No: es ayuda para el admin; la decisión es humana','Solo en HN'],a:1,fb:'El ranking es apoyo a la decisión. La asignación la confirma una persona.'},
           {q:'Ves "preparado / pendiente backend" en una acción. ¿Ya se ejecutó?',o:['Sí','No: la interfaz está lista, la ejecución real depende del gate de backend','Depende del plan'],a:1,fb:'"Preparado" = UI lista; la ejecución real ocurre cuando el gate de backend está activo.'},
         ]},
       ]},
      /* ─── GLOSARIO & CHECKLISTS (referencia rápida) ─── */
      {id:'a_glos',cat:'Inducción',ic:'📖',color:'#0891b2',n:'Glosario y checklists operativos',
       desc:'Referencia de términos clave y listas de verificación reales para el día a día.',
       cert:false,mins:20,
       lessons:[
         {id:'ag1',ic:'📖',n:'Glosario CXOrbia',content:`
<h2>Términos que usarás a diario</h2>
<p>Referencia rápida. Estos conceptos aparecen en la plataforma y en los manuales técnicos.</p>
<h3>Operación</h3>
<dl class="acad-gloss">
<dt>HR / Hoja de Ruta</dt><dd>El plan de visitas del periodo: qué sucursales, con qué escenario, en qué quincena y con qué honorario.</dd>
<dt>Escenario</dt><dd>El guion de la visita (qué debe evaluar el shopper). Configurable por proyecto.</dd>
<dt>Submitido</dt><dd>El momento en que el cuestionario se considera formalmente entregado. Configurable por proyecto; puede tomarse desde la HR.</dd>
<dt>Revisión</dt><dd>Etapa formal del admin entre "cuestionario realizado" y "liquidación": aprobar, pedir corrección o marcar conflicto.</dd>
<dt>Candidata (liquidación)</dt><dd>Una liquidación en preview operativo, aún sin cruce financiero real. No es un pago confirmado.</dd>
</dl>
<h3>Conceptos técnicos (backend)</h3>
<dl class="acad-gloss">
<dt>sourceSafe</dt><dd>Registro seguro de la fuente de HR: el backend guarda la conexión y devuelve un <code>sourceRef</code> opaco. La URL real nunca se guarda en el navegador.</dd>
<dt>sourceVisitRef</dt><dd>Referencia opaca que vincula una visita con su fila de origen en la HR, sin exponer datos sensibles.</dd>
<dt>sourcePaymentRef</dt><dd>Referencia opaca que vincula un pago con su origen, para trazabilidad sin exponer datos bancarios.</dd>
<dt>manual_review_required</dt><dd>Estado que exige revisión humana del admin antes de avanzar (p. ej. inconsistencia detectada).</dd>
<dt>held_for_conflict</dt><dd>Retenido por conflicto entre la plataforma y la HR; requiere reconciliación antes de liquidar.</dd>
<dt>batchId / paymentItemId / movementId</dt><dd>Identificadores del backend para el lote de pago, cada ítem de pago y cada movimiento financiero. Aparecen cuando el backend está activo.</dd>
</dl>
<blockquote>Los conceptos técnicos son visibles pero su ejecución real depende del backend. En el prototipo se muestran como preparados/pendientes.</blockquote>`},
         {id:'ag2',ic:'✅',n:'Checklist: publicar una ronda',content:`
<h2>Antes de publicar visitas</h2>
<p>Verifica cada punto. La lista es una guía real, no un párrafo.</p>
<ul class="acad-check">
<li class="done">Proyecto configurado (país, moneda, periodicidad de rondas)</li>
<li class="done">Fuente de HR definida (interna, importada o registro seguro por backend)</li>
<li>Cuestionario asignado al tipo de visita correcto</li>
<li>Escenarios cargados para la quincena</li>
<li>Honorarios por país configurados</li>
<li>Certificación del proyecto lista (los shoppers no se postulan sin ella)</li>
<li>Contactos de gestión (WhatsApp por tipo) configurados</li>
</ul>
<h3>Al cerrar el periodo</h3>
<ul class="acad-check">
<li>Cuestionarios en estado "realizado" revisados por el admin</li>
<li>Revisión: aprobar / pedir corrección / marcar conflicto</li>
<li>Submitido confirmado (manual o desde HR según config)</li>
<li>Liquidaciones candidatas verificadas antes de mover a lote</li>
</ul>
<blockquote>Marca mental cada punto. Los estados reales de pago dependen del cruce financiero del backend.</blockquote>`},
         {id:'ag3',ic:'❓',n:'Evaluación de referencia',tipo:'quiz',quiz:[
           {q:'¿Qué significa que una liquidación esté como "candidata"?',o:['Que ya se pagó','Que está en preview operativo, sin cruce financiero real','Que fue rechazada'],a:1,fb:'Candidata = preview operativo. El pago real depende del cruce financiero del backend.'},
           {q:'¿Dónde se guarda la URL real de una HR externa?',o:['En el navegador (localStorage)','En ningún lado del frontend; el backend la registra y devuelve un sourceRef opaco','En el cuestionario'],a:1,fb:'Nunca en el navegador. El backend hace el registro seguro (sourceSafe) y devuelve un sourceRef opaco.'},
           {q:'¿Qué es la etapa de "Revisión"?',o:['Un paso opcional','La etapa formal del admin entre cuestionario realizado y liquidación','Lo mismo que el submitido'],a:1,fb:'Revisión es una etapa formal: aprobar, pedir corrección o marcar conflicto antes de liquidar.'},
         ]},
       ]},
      /* ─── DIAGNÓSTICO, ADMINISTRABILIDAD Y CONFLICTOS (módulos nuevos) ─── */
      {id:'a_diag_admin',cat:'Técnico',ic:'🧭',color:'#2a6fdb',n:'Diagnóstico, Administrabilidad y conflictos: tu nueva caja de herramientas',
       desc:'Tour de los dos módulos nuevos de Configuración: qué muestran, qué NO ejecutan, y cómo resolver un conflicto paso a paso.',
       cert:false,mins:45,
       lessons:[
         {id:'ada1',ic:'🧪',n:'Diagnóstico & Readiness: qué verás',content:`
<h2>Configuración → Diagnóstico & Readiness</h2>
<p>Es la vista donde el equipo revisa la salud del sistema <b>en preview</b>, sin ejecutar nada real. Piénsalo como el panel de control de un piloto antes de despegar: te dice qué está listo, qué tiene bloqueos y qué necesita revisión, sin mover el avión todavía. Tiene 4 pestañas:</p>
<div class="acad-cards">
  <div class="acad-card"><div>🧪</div><b>Synthetic runner</b><p>Corre "paquetes" de casos de prueba ficticios (no datos reales de clientes) y muestra pass/warn/fail por paquete, con % de cobertura.</p></div>
  <div class="acad-card"><div>📊</div><b>Readiness</b><p>Matriz por módulo (15 módulos: tenant/proyecto/periodo, HR/source, usuarios/roles, shoppers, visitas, postulaciones, Academia, certificaciones, pagos, notificaciones, reviewQueue, auditEvents, gates, branding, switch de backend) + readiness por dominio de datos.</p></div>
  <div class="acad-card"><div>⚖️</div><b>Conflictos</b><p>La bandeja de conflictos accionable, más los candidatos que llegaron desde el Importador — la ves en la siguiente lección.</p></div>
  <div class="acad-card"><div>🔌</div><b>Contratos & gates</b><p>Lista cada capacidad de backend preparada (assignment sync, liquidaciones, evidencias, etc.) con su gate: apagado, preview o revisión humana.</p></div>
</div>
<blockquote>El banner ámbar de arriba de la pantalla siempre te recuerda: gates apagados · fuente real pendiente · revisión humana pendiente · producción NO autorizada. Si algo dice "preview", nunca asumas que ya pasó de verdad.</blockquote>`},
         {id:'ada1b',ic:'📊',n:'Readiness por módulo y candidatos protegidos',content:`
<h2>La matriz de readiness (patrón genérico)</h2>
<p>Ningún módulo debe mostrarse como "conectado / importado / en producción" sin este semáforo. Cada módulo tiene un estado honesto:</p>
<div class="acad-cards">
  <div class="acad-card"><div>🟢</div><b>GO_READY</b><p>Sin blockers conocidos en preview. La confirmación real de producción la sigue dando el backend, no el frontend.</p></div>
  <div class="acad-card"><div>🟡</div><b>WARNING_READY</b><p>Avanza, pero con revisión humana pendiente — hay warnings que alguien debe mirar antes de confiar del todo.</p></div>
  <div class="acad-card"><div>🔴</div><b>NO_GO_BLOCKER</b><p>No avanza. Hay al menos un blocker real (ej. Auth real no conectado, gate de pagos apagado).</p></div>
</div>
<h3>De dónde salen los "candidatos"</h3>
<p>Cuando importas datos (Importador) o lees una fuente de HR, nada se escribe directo al sistema. Todo pasa por un pipeline de 6 etapas, siempre en este orden:</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>dry-run</b><p>Solo simula: cuenta filas, detecta tipos, no toca nada.</p></div>
  <div class="acad-step"><span>2</span><b>source-safe</b><p>Los datos sensibles (DPI, teléfono, banco, correo) se enmascaran antes de mostrarse en preview.</p></div>
  <div class="acad-step"><span>3</span><b>protected candidates</b><p>Candidatos de shopper, certificación, liquidación o lote de pago — aún no son registros reales.</p></div>
  <div class="acad-step"><span>4</span><b>reviewQueue</b><p>Bandeja donde una persona revisa cada candidato antes de decidir qué hacer.</p></div>
  <div class="acad-step"><span>5</span><b>auditEvents</b><p>Cada decisión (aprobar, escalar, descartar) queda registrada con motivo y fecha — nunca en silencio.</p></div>
  <div class="acad-step"><span>6</span><b>no escrito</b><p>El estado final en el prototipo: nada llega a la base de datos real hasta que el backend con su gate lo autorice.</p></div>
</div>
<p>Verás esto en acción en <b>Importador → Análisis IA</b> (el stepper del pipeline arriba del análisis) y en <b>Diagnóstico → Conflictos</b> (bloque "Candidatos desde HR/Source").</p>
<blockquote>Acceso de lectura protegido: un shopper solo lee su propio perfil; un rol sin Auth ve datos enmascarados con 🔒; finanzas nunca ve el número de cuenta bancaria crudo. Esto se aplica ya en el módulo Shoppers.</blockquote>`},
         {id:'ada2',ic:'⚖️',n:'Resolver un conflicto, paso a paso',content:`
<h2>Bandeja de conflictos: cómo se resuelve de verdad</h2>
<p>Cada tarjeta de conflicto trae: severidad, estado, <b>referencias de fuente opacas</b> (por ejemplo <code>src:hr#a4f2</code> — nunca un nombre o documento real) y un <code>auditRef</code>.</p>
<ol>
<li>Lee la razón del conflicto (p. ej. "assignmentSource divergente entre HR y plataforma").</li>
<li>Pulsa <b>Revisar</b>.</li>
<li>Elige una decisión: <b>mantener ambos registros</b>, <b>escalar a supervisor</b>, o <b>marcar revisado</b>. No existe la opción de "fusionar" o "deduplicar" — nunca se resuelve por coincidencia visual.</li>
<li>Escribe el <b>motivo</b> (obligatorio) — queda ligado al auditRef.</li>
<li>Al registrar, el conflicto pasa a "Resuelto" con fecha y auditRef visibles. El banner te recuerda: la <b>aplicación real</b> de esa decisión la ejecuta el backend cuando su gate esté activo.</li>
</ol>
<blockquote>Esta bandeja es igual para asignaciones (HR↔plataforma), liquidaciones, cuestionarios, importaciones y evidencias — mismo patrón en todos los dominios.</blockquote>`},
         {id:'ada3',ic:'⚙️',n:'Administrabilidad: configurar sin romper nada',content:`
<h2>Configuración → Administrabilidad</h2>
<p>Aquí se ve qué es <b>versionado</b> y qué exige <b>motivo</b> antes de cambiar, en 5 pestañas:</p>
<div class="acad-cards">
  <div class="acad-card"><div>🧭</div><b>Matriz de configuración</b><p>18 dominios (tenant, reglas, HR, cuestionarios, NDA, planes, evidencias, roles, etc.) con su estado: versionado, motivo obligatorio, gate.</p></div>
  <div class="acad-card"><div>🔒</div><b>NDA (versionado)</b><p>Editar el texto por rol crea una <b>nueva versión</b> con motivo. Las aceptaciones que ya firmaron los usuarios <b>nunca se alteran</b> — quedan intactas y auditables.</p></div>
  <div class="acad-card"><div>📦</div><b>Planes (versionado)</b><p>Cada plan comercial (Básico, Pro, etc.) puede versionarse sin reconfigurar en silencio a los tenants que ya lo usan.</p></div>
  <div class="acad-card"><div>📜</div><b>Reglas & gates</b><p>Reglas de negocio (elegibilidad de pago, anti-duplicado, ruteo de cuestionario) con su versión y su gate actual.</p></div>
  <div class="acad-card"><div>🏗️</div><b>Fase A & dominios profundos</b><p>El detalle honesto de Fase A, sincronía HR↔plataforma, liquidaciones, cuestionarios, evidencias y la política de datos sensibles.</p></div>
</div>
<blockquote>Regla de oro de administrabilidad: <b>ningún cambio se sobre-escribe en silencio</b>. Todo cambio sensible pide un motivo y queda versionado.</blockquote>`},
         {id:'ada4',ic:'❓',n:'Evaluación',tipo:'quiz',quiz:[
           {q:'En la bandeja de conflictos, ¿puedes "fusionar" dos registros que se parecen?',o:['Sí, si coinciden visualmente','No: nunca se deduplica por coincidencia visual; solo mantener ambos, escalar o marcar revisado','Solo el super admin puede fusionar'],a:1,fb:'La fusión/dedupe nunca es una opción. La única resolución válida es una decisión humana registrada con motivo.'},
           {q:'Si subes una nueva versión del NDA, ¿qué pasa con las aceptaciones ya firmadas?',o:['Se invalidan y hay que re-firmar','Se conservan intactas; solo aplica a nuevas aceptaciones','Se actualizan automáticamente a la nueva versión'],a:1,fb:'Las aceptaciones presentadas nunca se alteran. Es solo lectura y auditable.'},
           {q:'¿Qué significa un gate en estado "apagado"?',o:['Que la función no existe','Que la interfaz está lista pero la ejecución real no está autorizada todavía','Que hay un error'],a:1,fb:'"Gate apagado" = preparado pero no autorizado a ejecutar en producción.'},
           {q:'Un módulo aparece como NO_GO_BLOCKER en la matriz de readiness. ¿Qué significa?',o:['Que el módulo no existe en el prototipo','Que tiene al menos un blocker real y no debe tratarse como listo para producción','Que necesita más diseño visual'],a:1,fb:'NO_GO_BLOCKER = hay un bloqueo real (ej. Auth no conectado). Nunca se muestra ese módulo como "conectado/producción" mientras tenga blockers.'},
           {q:'Importaste un archivo de shoppers desde el Importador. ¿En qué etapa del pipeline queda antes de que alguien lo revise?',o:['Ya quedó escrito en el sistema','reviewQueue (candidato pendiente de revisión humana)','auditEvents directamente'],a:1,fb:'Todo candidato importado pasa por reviewQueue antes de cualquier decisión; nada se escribe sin gate + revisión.'},
         ]},
       ]},
/* ─── GUÍA COMPLETA DE MÓDULOS (por módulo: beneficio, flujo, cómo usar) ─── */
      {id:'a_modguide',cat:'Inducción',ic:'🗺️',color:'#0e9c6e',n:'Guía de módulos: beneficio, flujo y cómo usar — Operación y Administración',
       desc:'Cada módulo del menú, uno por uno: para qué existe, qué pasa si no lo usas, y los pasos exactos para operarlo.',
       cert:false,mins:170,
       lessons:[
         {id:'mg1',ic:'📋',n:'Operación (7 módulos)',content:`
<h2>Sección "Operación" del menú</h2>
<p>Es la sección que usas todos los días. Cada módulo aquí existe para eliminar una fricción operativa concreta.
Esta lección va más a fondo que un resumen: para cada módulo verás qué es, qué problema resuelve, quién lo usa, el
flujo completo con los botones exactos, cómo saber que funcionó, los errores más comunes y qué hacer cuando algo
falla.</p>

<div class="acad-section">☀️ <b>Mi Día</b>
<p><b>Qué es y qué problema resuelve:</b> es tu pantalla de aterrizaje al entrar — junta en un solo cronograma lo que
te toca hoy (visitas agendadas, postulaciones por aprobar, asignaciones internas pendientes) para que no tengas que
recorrer 5 módulos distintos para saber qué hacer primero. Sin ella, cada coordinador arma su propio checklist mental
y las tareas atrasadas se descubren tarde.</p>
<p><b>Quién lo usa:</b> admin/coordinador (vista de equipo) y shopper (vista de sus propias visitas).</p>
<p><b>Flujo completo y botones:</b> entras a la app → el bloque superior de KPIs (Agendadas / Por aprobar / etc.) es
clickeable — un click en cualquier tarjeta te lleva a la lista filtrada detrás del número. Debajo, el <b>Cronograma</b>
muestra el mes con un selector de proyecto ("🗂️ Todos" agrega, o elige uno) y flechas ◀ ▶ para cambiar de mes. Click
en cualquier día abre un modal con los ítems de esa fecha; click en un ítem del modal te lleva directo a su pantalla
de gestión (la visita, la postulación). Si hay asignaciones internas pendientes (tarea manual asignada por otro
admin), aparecen en una tarjeta ámbar aparte con botón "Resuelta" para cerrarlas.</p>
<p><b>Cómo validar que funcionó:</b> el ítem desaparece de "pendientes" y el contador de la tarjeta KPI baja en uno;
si resolviste una asignación, deja de aparecer en la tarjeta ámbar.</p>
<p><b>Errores frecuentes / qué hacer si falla:</b> si un ítem "vencido" no aparece resaltado, revisa que el filtro de
proyecto arriba del cronograma no esté limitando la vista a un proyecto distinto al de esa visita. Si clickeas un
KPI y la lista sale vacía, es porque no hay ningún registro en ese estado para el proyecto/periodo activo — no es un
error, es el estado real.</p></div>

<div class="acad-section">📊 <b>Dashboard Operativo</b>
<p><b>Qué es y qué problema resuelve:</b> es tu alerta temprana de todo el programa — sin él, un atraso solo se nota
cuando ya es tarde para corregirlo (ej. faltando 2 días para cerrar el periodo). Convierte filas de datos en un
semáforo de avance real vs. ideal.</p>
<p><b>Quién lo usa:</b> admin/coordinador. Ops/coordinador con scope de país solo ven sus países asignados.</p>
<p><b>Flujo completo y botones:</b> arriba eliges país/proyecto — "Todos los proyectos" agrega KPIs globales; un
proyecto específico muestra su detalle. Cada tarjeta de KPI (agendadas, realizadas, pendientes de revisión, atrasadas,
etc.) es clickeable y abre la tabla de visitas detrás de ese número — desde ahí puedes entrar a cada visita
individual. El bloque de comparativo trimestral (abajo) grafica 8 KPIs de los últimos 3 meses para ver tendencia, no
solo la foto de hoy. Los botones 📲 junto a cada shopper en la tabla abren un borrador de WhatsApp (manual, no
automático) para dar seguimiento.</p>
<p><b>Cómo validar que funcionó:</b> el número de la tarjeta baja/sube según las acciones que tomes en Postulaciones/
Visitas — el dashboard no se actualiza "en vivo backend", se recalcula sobre los mismos datos del prototipo cada vez
que entras o cambias de proyecto.</p>
<p><b>Errores frecuentes / qué hacer si falla:</b> si los KPIs parecen "congelados" tras aprobar algo, vuelve a entrar
al módulo (o cambia de proyecto y regresa) para forzar el recálculo. Si un país/proyecto no aparece en el selector,
revisa el scope del usuario en Configuración → Usuarios — puede estar limitado a otros países.</p></div>

<div class="acad-section">📋 <b>Visitas Disponibles</b>
<p><b>Qué es y qué problema resuelve:</b> es el "marketplace" donde el shopper ve qué visitas hay para tomar. Sin
publicar aquí, ningún shopper puede reservar ni postularse — es el primer eslabón de toda la cadena operativa.</p>
<p><b>Quién lo usa:</b> admin publica/gestiona; shopper reserva/postula desde su propia vista.</p>
<p><b>Flujo completo y botones:</b> publicas una visita (botón <b>"+ Publicar"</b>, formulario manual) o la traes vía
Hojas de Ruta/Importador → aparece en la tabla admin con su estado (disponible, reservada, asignada…) → usa los
filtros de país/proyecto/estado arriba de la tabla para encontrarla → el shopper la ve en su propia lista y pulsa
Reservar/Postular → tú la apruebas desde Postulaciones o Reservas & Asignación según el modo del proyecto.</p>
<p><b>Datos a ingresar al publicar:</b> sucursal, rango de fechas disponible, honorario/combo, instructivo asociado
— sin instructivo, el shopper no tiene contexto de qué evaluar.</p>
<p><b>Cómo validar que funcionó:</b> la visita nueva aparece en la tabla con estado "disponible" y, si el proyecto
tiene shoppers activos en ese país, empieza a mostrarse en su lista de disponibles.</p>
<p><b>Errores frecuentes / qué hacer si falla:</b> si publicaste pero ningún shopper la ve, revisa que el país de la
sucursal coincida exactamente con el país de certificación del shopper — el cruce es por país, no por texto libre.
Una visita "huérfana" (sin instructivo) genera cuestionarios pobres — complétalo antes de publicar en volumen.</p></div>

<div class="acad-section">📩 <b>Postulaciones</b>
<p><b>Qué es y qué problema resuelve:</b> reemplaza el proceso manual de aprobar/reasignar shoppers por WhatsApp sin
registro — aquí cada decisión queda con nombre de quien la tomó y fecha, evitando disputas de "yo nunca aprobé eso".</p>
<p><b>Quién lo usa:</b> admin/coordinador/ops según permiso de acción de aprobar.</p>
<p><b>Flujo completo y botones:</b> el shopper se postula desde Visitas Disponibles → aparece en tu bandeja agrupada
por sucursal → cada fila tiene botones directos: <b>✅ Aprobar</b>, <b>✕ Rechazar</b>, y desde el detalle también
Standby/Reasignar/Reprogramar/Cancelar. El badge numérico rojo en el menú lateral te dice cuántas hay pendientes de
gestionar sin tener que entrar a contar.</p>
<p><b>Cómo validar que funcionó:</b> al aprobar, el badge baja en uno, la visita pasa a "asignada" y se prepara un
borrador de WhatsApp de notificación al shopper (manual, no envío automático salvo Make activo) — revisa el toast de
confirmación para saber si quedó registrado.</p>
<p><b>Errores frecuentes / qué hacer si falla:</b> si dos shoppers se postulan a la misma sucursal, la Academia →
"Priorizar candidatos" te da el criterio (certificación vigente, rating, cercanía) — no hay una regla automática que
decida por ti, es una decisión humana con motivo. Rechazar sin dejar motivo dificulta auditar después por qué se
descartó a alguien — siempre completa el campo de motivo cuando el modal lo pida.</p></div>

<div class="acad-section">🙋 <b>Reservas & Asignación</b>
<p><b>Qué es y qué problema resuelve:</b> para programas con muchos cupos por periodo (ej. mensual, alto volumen),
cruza automáticamente lo que el shopper reservó contra lo que se postuló, para que no se dupliquen dos personas en
el mismo cupo sin que nadie se dé cuenta hasta el día de la visita.</p>
<p><b>Quién lo usa:</b> admin/coordinador de proyectos por reservas (no todos los proyectos usan este modo).</p>
<p><b>Flujo completo y botones:</b> el shopper reserva un cupo del periodo desde su portal → tú revisas la vista de
cruce (reserva vs. postulación) en este módulo → si coinciden, pulsas <b>Confirmar asignación</b>; si hay dos
shoppers en el mismo cupo, el sistema los marca en conflicto para que decidas manualmente cuál se queda.</p>
<p><b>Cómo validar que funcionó:</b> el cupo pasa de "reservado" a "asignado" y ya no acepta más reservas de otros
shoppers para esa misma fecha/sucursal.</p>
<p><b>Errores frecuentes / qué hacer si falla:</b> confirmar sin revisar el cruce puede duplicar el gasto (dos
honorarios por el mismo cupo) — siempre revisa la marca de conflicto antes de confirmar en lote.</p></div>

<div class="acad-section">👥 <b>Shoppers</b>
<p><b>Qué es y qué problema resuelve:</b> es tu base de datos de evaluadores — sin datos bancarios completos y
certificación vigente, un shopper no puede entrar a un lote de pago ni postularse a un proyecto que lo exija.</p>
<p><b>Quién lo usa:</b> admin da de alta/gestiona; el propio shopper autoactualiza sus datos desde Mi Perfil.</p>
<p><b>Flujo completo y botones:</b> alta del shopper (nombre, país, contacto) → certificación por proyecto (ver
módulo Certificación) → queda disponible para postularse/reservarse → su historial de desempeño (rating, visitas
completas y a tiempo) se acumula automáticamente visita a visita. En la ficha, el botón <b>✎ Editar perfil</b> solo
aparece para roles con acceso a datos protegidos (super/admin real, no un rol de prueba/scope) — de lo contrario
verás "🔒 Edición de datos protegidos requiere acceso completo".</p>
<p><b>Datos a ingresar:</b> nombre, país, teléfono/WhatsApp, correo, y — cuando el rol lo permite — datos bancarios
(banco, tipo de cuenta, número). El número de cuenta/DPI se enmascara para roles sin ese permiso.</p>
<p><b>Cómo validar que funcionó:</b> el shopper editado refleja el cambio inmediatamente en su ficha y en cualquier
lista que lo referencie (Postulaciones, Dashboard).</p>
<p><b>Errores frecuentes / qué hacer si falla:</b> un shopper "invisible" en la lista de candidatos para un proyecto
casi siempre es un país mal cargado o una certificación vencida para ese proyecto específico — revisa ambos antes de
asumir que es un bug.</p></div>

<div class="acad-section">📑 <b>Reportes & KPIs</b>
<p><b>Qué es y qué problema resuelve:</b> convierte datos operativos en reportes presentables (cumplimiento, ranking,
hallazgos) sin armar un Excel a mano cada vez que el cliente o la dirección los pide.</p>
<p><b>Quién lo usa:</b> admin/coordinador; el resultado también alimenta el Portal del Cliente.</p>
<p><b>Flujo completo y botones:</b> eliges el tipo de reporte → filtras por periodo/proyecto/país con los selectores
de arriba → el reporte se arma en pantalla; el botón <b>⤓ Exportar</b> lo descarga. Los reportes de cumplimiento y
ranking se reflejan automáticamente en el Portal del Cliente — no hace falta reenviarlos por correo.</p>
<p><b>Valor comercial:</b> "Reportes & KPIs" avanzados y comparativos trimestrales suelen ser parte de planes
Estándar/Pro — es un argumento de venta cuando un cliente pide visibilidad ejecutiva sin pedirte trabajo manual extra.</p>
<p><b>Errores frecuentes / qué hacer si falla:</b> un reporte "vacío" casi siempre es un filtro de periodo que no
tiene datos todavía (ej. el periodo actual recién empezó) — cambia al periodo anterior para confirmar que el reporte
sí funciona con datos históricos.</p></div>`},
         {id:'mg2',ic:'🗂️',n:'Admin del Proyecto (8 módulos)',content:`
<h2>Sección "Admin del Proyecto" del menú</h2>
<p>Aquí configuras el programa antes (y durante) su operación — el set-up correcto aquí evita errores en cascada más
adelante: un país mal cargado en Proyectos, una fuente de HR mal elegida, o un cuestionario mal ponderado se sienten
después en Postulaciones, Finanzas y Reportes sin que sea obvio de dónde vino el problema.</p>

<div class="acad-section">🏢 <b>Clientes</b>
<p><b>Qué es y por qué importa:</b> es la ficha centralizada de la marca/empresa que te contrata — sin ella, cada
proyecto queda aislado y pierdes el histórico de la relación comercial (propuestas anteriores, contactos, notas).</p>
<p><b>Flujo y botones:</b> creas el cliente ANTES que su primer proyecto (nombre, contactos, notas comerciales) → la
ficha se conecta automáticamente al CRM y a todos los proyectos que declares con ese cliente.</p>
<p><b>Cómo validar / errores frecuentes:</b> si un proyecto no aparece bajo su cliente en el CRM, revisa que el campo
"Cliente" del proyecto coincida EXACTAMENTE con el nombre de la ficha (no es una búsqueda difusa).</p></div>

<div class="acad-section">🗂️ <b>Proyectos</b>
<p><b>Qué es y por qué importa:</b> es la unidad que agrupa reglas de negocio — países, monedas, honorarios,
periodicidad. Sin un proyecto bien configurado, las visitas que publiques no tienen contexto ni reglas de
liquidación, y el sistema no sabrá cuánto pagarle a un shopper.</p>
<p><b>Flujo completo:</b> <b>Crear proyecto</b> → defines países/monedas/honorarios → cargas el instructivo (la IA
sugiere escenarios y estructura de cuestionario a partir de él, pero tú revisas y ajustas) → publicas. Ya publicado,
puedes reabrir su configuración desde la ficha del proyecto para ajustar países/reglas — el cambio se guarda de
inmediato para proyectos propios (no para los 3 proyectos de ejemplo/seed, que no persisten tras recargar).</p>
<p><b>Cómo validar que funcionó:</b> el proyecto aparece en el selector de "Proyecto" de la barra lateral y en
Dashboard/Mi Día; sus países filtran correctamente qué shoppers pueden postularse.</p>
<p><b>Errores frecuentes:</b> mezclar "proyecto" (la configuración estable) con "periodo" (la ventana de tiempo
operativa) — son cosas distintas aunque compartan pantalla; ver el módulo Periodos abajo.</p></div>

<div class="acad-section">🗓️ <b>Periodos</b>
<p><b>Qué es y por qué importa:</b> define la ventana de cumplimiento (quincena/mes) dentro de un proyecto — sin un
corte claro, no hay un momento definido para saber qué visitas entran a liquidar en ese ciclo de pago.</p>
<p><b>Flujo completo:</b> se configura la periodicidad al crear el proyecto; cada periodo cierra y el siguiente se
abre automáticamente (o se duplica manualmente desde la ficha del proyecto con "Duplicar periodo" si necesitas
reabrir uno similar). El estado del periodo (abierto/cerrado) determina si acepta nuevas visitas.</p>
<p><b>Cómo validar que funcionó:</b> el periodo activo se refleja en el selector superior y todas las visitas nuevas
quedan ligadas a él automáticamente.</p>
<p><b>Errores frecuentes:</b> publicar visitas nuevas contra un periodo ya cerrado las deja "fuera de ciclo" —
verifica el periodo activo antes de publicar en volumen al cierre de mes.</p></div>

<div class="acad-section">📜 <b>Histórico</b>
<p><b>Qué es y por qué importa:</b> preserva periodos ya cerrados como referencia y control de auditoría — un
periodo cerrado NUNCA se sobre-escribe, ni siquiera por accidente, porque es la prueba de lo que realmente pasó.</p>
<p><b>Flujo:</b> entras al histórico → eliges el periodo pasado → consultas sus visitas, liquidaciones y reportes tal
como quedaron al cierre.</p>
<p><b>Cuándo usarlo:</b> para comparar mes contra mes, auditar una disputa de pago, o justificar un reporte ante el
cliente con datos de un ciclo ya cerrado.</p></div>

<div class="acad-section">🗺️ <b>Hojas de Ruta (HR)</b>
<p><b>Qué es y por qué importa:</b> es el plan de visitas del periodo (qué sucursal, cuándo, con qué honorario) —
sin ella no hay nada que publicar en Visitas Disponibles.</p>
<p><b>Flujo:</b> la subes por Importador (archivo puntual) o la conectas en vivo desde Fuente de HR (Google Sheets) →
cada fila se convierte en una visita publicable.</p>
<p><b>Cómo validar que funcionó:</b> las filas de la HR aparecen como visitas en estado "disponible" en el módulo
Visitas Disponibles, con su sucursal y honorario correctos.</p>
<p><b>Errores frecuentes:</b> filas con sucursal duplicada o país mal escrito no calzan contra los shoppers
certificados de ese país — revisa el preview de importación antes de confirmar, no después.</p></div>

<div class="acad-section">🔗 <b>Fuente de HR</b>
<p><b>Qué es y por qué importa:</b> define SI tu Hoja de Ruta es un archivo estático (importación puntual) o una
conexión viva (Google Sheets con lectura/escritura) — esto determina si un cambio en la hoja del cliente se refleja
solo o si necesitas volver a importar cada vez.</p>
<p><b>Flujo:</b> eliges "en vivo" (pegas la URL de un Sheet; el sistema usa una llave natural inmutable para nunca
duplicar una fila ya importada) o "importación" para cargas puntuales sin conexión persistente.</p>
<p><b>Botón clave:</b> "🧬 Generar candidatos source-safe (preview)" prepara los candidatos de sincronización
(identity link, certification carryover, liquidation, payment batch) para revisión humana en Diagnóstico →
Conflictos — nunca escribe nada directamente, es siempre preview.</p>
<p><b>Errores frecuentes:</b> pensar que "en vivo" sincroniza en tiempo real automáticamente — en el prototipo,
"en vivo" prepara los candidatos para revisión; el sync real a producción lo ejecuta el backend con su gate.</p></div>

<div class="acad-section">🧩 <b>Cuestionarios</b>
<p><b>Qué es y por qué importa:</b> sin un cuestionario bien ponderado, el score final no refleja lo que realmente le
importa al cliente — un cuestionario mal armado produce datos que parecen objetivos pero no lo son.</p>
<p><b>Flujo completo:</b> "Set-up desde instructivo" deja que la IA (heurística local en este prototipo) proponga
secciones y preguntas a partir del documento del cliente → ajustas los pesos de cada sección hasta que sumen 100% →
publicas la versión activa para el proyecto.</p>
<p><b>Cómo validar que funcionó:</b> al abrir una visita nueva de ese proyecto, el shopper ve exactamente esas
secciones y preguntas en su cuestionario.</p>
<p><b>Errores frecuentes:</b> pesos que no suman 100% distorsionan el score sin que sea evidente a simple vista — el
editor te avisa si la suma no cuadra, no publiques hasta corregirlo.</p></div>

<div class="acad-section">📥 <b>Importador</b>
<p><b>Qué es y por qué importa:</b> migra datos masivos (shoppers, visitas, clientes) sin captura manual fila por
fila — el error humano más caro en set-up suele ser digitar mal un dato al copiarlo a mano.</p>
<p><b>Flujo completo:</b> subes el archivo (CSV/Excel/Sheet) → el sistema detecta el tipo de entidad por sus
columnas → te muestra un preview con lo que va a crear/actualizar ANTES de tocar nada → confirmas la importación.</p>
<p><b>Cómo validar que funcionó:</b> los registros nuevos aparecen en su módulo correspondiente (Shoppers, Visitas,
Clientes) con los datos exactos del preview que confirmaste.</p>
<p><b>Errores frecuentes:</b> confirmar sin revisar el preview es la causa #1 de datos mal cargados — siempre revisa
cuántas filas se van a crear vs. actualizar antes de confirmar, especialmente en la primera carga de un proyecto
nuevo.</p></div>`},
         {id:'mg3',ic:'🎓',n:'Capacitación & IA, Finanzas (8 módulos)',content:`
<h2>Capacitación & IA</h2>
<div class="acad-section">📚 <b>Academia</b> (donde estás ahora)
<p><b>Qué es y por qué importa:</b> autocapacitación sin depender de una sesión en vivo con un formador — cursos,
manuales, certificación y evaluación en un solo lugar, disponible cuando el usuario lo necesita (no solo el día del
onboarding).</p>
<p><b>Flujo y botones:</b> el selector "Ver como" (arriba, solo admin) cambia entre el contenido de Consultora/
Shopper/Cliente. <b>✨ Crear con IA</b> abre un modal para generar un curso desde un archivo o tema (heurística
local en este prototipo, siempre como borrador). <b>🧬</b> duplica un curso, <b>🗄/♻️</b> archiva/restaura uno
personalizado, <b>✎</b> edita nombre/categoría/descripción. "Ver archivados" muestra lo archivado sin mezclarlo con
el catálogo activo.</p>
<p><b>Errores frecuentes:</b> un curso "no aparece" tras crearlo casi siempre es porque nace en estado
<b>borrador</b> — sigue visible para el admin que lo creó, pero conviene revisarlo antes de considerarlo listo.</p></div>

<div class="acad-section">🏆 <b>Certificación</b>
<p><b>Qué es y por qué importa:</b> filtra quién puede postularse a un proyecto según si domina su instructivo —
protege la calidad del dato que finalmente le entregas al cliente. Sin certificación, cualquiera podría evaluar sin
saber qué mirar.</p>
<p><b>Flujo completo:</b> el shopper presenta el examen generado a partir del instructivo del proyecto (banco de
preguntas por proyecto) → si aprueba, queda certificado para ese proyecto específico (la certificación NO es
genérica, es por proyecto) → si no aprueba, puede repasar y volver a presentar.</p>
<p><b>Cómo validar que funcionó:</b> el shopper certificado aparece elegible en la lista de candidatos de ese
proyecto en Postulaciones/Visitas Disponibles.</p>
<p><b>Errores frecuentes:</b> confundir "certificado en general" con "certificado para ESTE proyecto" — un shopper
con muchas certificaciones previas puede seguir bloqueado si no tiene la de este proyecto puntual.</p></div>

<div class="acad-section">📎 <b>Recursos del proyecto (Documentos)</b>
<p><b>Qué es y por qué importa:</b> centraliza instructivos, guías y material de referencia con lector in-app, para
no depender de PDFs sueltos perdidos en un correo o chat.</p>
<p><b>Flujo:</b> subes el documento al proyecto → queda accesible desde Academia y desde la ficha del proyecto → el
shopper lo consulta antes/durante su visita sin salir de la app.</p></div>

<div class="acad-section">🤖 <b>Soporte IA</b>
<p><b>Qué es y por qué importa:</b> resuelve dudas comunes al instante (heurística local en este prototipo) sin
saturar al equipo humano con preguntas repetitivas de "cómo hago X".</p>
<p><b>Flujo:</b> el usuario escribe su duda → recibe una respuesta sugerida → si no resuelve, puede escalar a un
ticket real para que un humano lo atienda — el escalamiento queda registrado, la respuesta automática no reemplaza
al soporte humano cuando hace falta.</p></div>

<h2>Finanzas</h2>
<div class="acad-section">💹 <b>Dashboard Financiero</b>
<p><b>Qué es y por qué importa:</b> te dice si el negocio es rentable país por país y proyecto por proyecto — no
solo si la operación "funciona", sino si conviene seguir operándola así.</p>
<p><b>Flujo y botones:</b> revisas márgenes, cuentas por cobrar/pagar (CxC/CxP) y el comparativo intermensual; el
bloque de análisis crítico resalta desviaciones fuera de lo normal para que no tengas que leer cada número a mano.</p>
<p><b>Errores frecuentes:</b> un margen que "no cuadra" casi siempre viene de un movimiento mal clasificado en el
módulo Movimientos (ver abajo) — revisa ahí antes de dudar del cálculo del dashboard.</p></div>

<div class="acad-section">🧾 <b>Movimientos</b>
<p><b>Qué es y por qué importa:</b> registra cada ingreso y egreso con trazabilidad — sin esto no puedes conciliar
cuentas ni auditar de dónde salió o entró cada monto.</p>
<p><b>Flujo y botones:</b> cada CxC/CxP es clickeable y editable directamente en la tabla; los financiamientos
(préstamos, aportes) se marcan con su propia categoría — NO cuentan como ingreso operativo, para no inflar
artificialmente el margen del negocio.</p>
<p><b>Cómo validar que funcionó:</b> el movimiento aparece en la tabla y se refleja en el Dashboard Financiero al
recalcular.</p></div>

<div class="acad-section">💸 <b>Liquidaciones</b>
<p><b>Qué es y por qué importa:</b> automatiza el cálculo de lo que se le debe a cada shopper según reglas de
elegibilidad, sin captura manual visita por visita — el error humano más caro en finanzas operativas es calcular
mal un monto a pagar.</p>
<p><b>Flujo completo:</b> una visita realizada con cuestionario completo genera su liquidación sola → pasa por los
estados de revisión (pending_review → in_review → needs_correction/aprobada) → tú eliges cuáles entran al siguiente
lote de pago.</p>
<p><b>Cómo validar que funcionó:</b> la liquidación nueva aparece en la tabla con el monto correcto (honorario +
combo si aplica) y el estado "pendiente de revisión".</p>
<p><b>Errores frecuentes:</b> liquidar una visita que está en conflicto de sincronía HR↔plataforma es un error
grave — se retiene hasta reconciliar, nunca se liquida "para no atrasar" mientras el conflicto siga abierto.</p></div>

<div class="acad-section">📦 <b>Lotes de Pago</b>
<p><b>Qué es y por qué importa:</b> agrupa liquidaciones para procesarlas juntas (ej. quincenal) en vez de pago por
pago — reduce el trabajo operativo y da un corte claro de cuándo se paga.</p>
<p><b>Flujo y botones:</b> armas el lote seleccionando las liquidaciones candidatas (deben estar aprobadas, no en
conflicto) → el botón <b>Marcar pagado (preview)</b> lo cierra y prepara el egreso correspondiente en Movimientos —
"preview" porque el pago real y su evidencia bancaria los confirma el backend, no el navegador.</p>
<p><b>Errores frecuentes:</b> incluir en un lote a un shopper con datos bancarios incompletos deja ese pago
bloqueado — revisa su ficha en Shoppers antes de armar el lote, no después de intentar pagar.</p></div>`},
         {id:'mg4',ic:'📈',n:'Comercial y Configuración (12 módulos)',content:`
<h2>Comercial</h2>
<div class="acad-section">🧮 <b>Costos & Propuestas</b>
<p><b>Qué es y por qué importa:</b> cotiza con una calculadora que cruza honorarios, número de visitas y overhead
en vez de estimar a ojo — reduce el riesgo de vender un proyecto por debajo de costo sin darte cuenta.</p>
<p><b>Flujo:</b> defines volumen de visitas, honorario por visita y márgenes deseados → la calculadora arma el
precio de venta → generas la propuesta con ese cálculo como base, no un número inventado.</p>
<p><b>Errores frecuentes:</b> cotizar sin incluir el overhead de coordinación (tiempo del equipo, no solo el pago al
shopper) es la causa más común de un proyecto que "opera bien pero no deja margen".</p></div>

<div class="acad-section">🤝 <b>CRM Comercial</b>
<p><b>Qué es y por qué importa:</b> sin un CRM, los leads y el seguimiento comercial viven en la memoria de una
persona — se pierden por completo si esa persona rota o está de vacaciones.</p>
<p><b>Flujo y botones:</b> <b>Pipeline</b> (vista kanban) para ver el embudo por etapa; <b>Ficha 360</b> de cada
cuenta con el historial completo de interacciones, propuestas y proyectos asociados. El botón 📲 WhatsApp abre un
borrador manual de seguimiento — no envía nada solo.</p>
<p><b>Cómo validar que funcionó:</b> mover una cuenta de etapa en el pipeline se refleja de inmediato en su Ficha
360 con la fecha del cambio.</p></div>

<div class="acad-section">📣 <b>Marketing & Contenidos</b>
<p><b>Qué es y por qué importa:</b> genera piezas y calendario de contenido con IA (heurística local en este
prototipo) sin depender de un equipo de diseño dedicado para cada pieza pequeña.</p>
<p><b>Flujo:</b> eliges el tipo de pieza/tema → se genera un borrador → lo ajustas y lo dejas listo para publicar
manualmente (la publicación real a redes la ejecuta el proveedor conectado por el backend, no este módulo).</p></div>

<h2>Configuración</h2>
<div class="acad-section">⚙️ <b>Configuración</b>
<p><b>Qué es y por qué importa:</b> es el panel central de ajustes del tenant (identidad, países operativos, patrón
de nombres de usuario) — cambiarlo aquí afecta a toda la plataforma, no a un módulo aislado.</p>
<p><b>Errores frecuentes:</b> agregar un país aquí no crea proyectos automáticamente en ese país — solo lo habilita
como opción disponible al crear/editar un proyecto.</p></div>

<div class="acad-section">🌐 <b>Consola SaaS</b>
<p><b>Qué es y por qué importa:</b> vista de super-administración multi-tenant, para gestionar varias consultoras si
operas la plataforma como proveedor (no como una sola consultora usándola para sí misma).</p>
<p><b>Quién lo usa:</b> exclusivamente rol <b>super</b> — no aparece para admin/ops ni siquiera con permisos altos,
porque afecta a otros tenants, no solo al propio.</p></div>

<div class="acad-section">🧪 <b>Diagnóstico & Readiness</b>
<p><b>Qué es y por qué importa:</b> te dice qué tan lista está la operación antes de confiar en ella — sin esto, un
problema (ej. una fuente de HR mal sincronizada) se descubre en producción, no antes de que impacte a un shopper o
al cliente.</p>
<p><b>Flujo y botones:</b> revisa la pestaña <b>Conflictos</b> regularmente — cualquier tarjeta en estado "pendiente
de revisión" necesita que TÚ tomes una decisión (mantener ambos, escalar, marcar revisado) con motivo obligatorio;
nunca se resuelve solo, ni por coincidencia de nombres.</p>
<p><b>Errores frecuentes:</b> ignorar conflictos acumulados "porque no urgen" es la causa más común de que una
liquidación se calcule mal semanas después — resuélvelos en el momento, no en lote al final del periodo.</p></div>

<div class="acad-section">⚙️ <b>Administrabilidad</b>
<p><b>Qué es y por qué importa:</b> te deja versionar reglas y el texto del NDA sin miedo a romper lo que los
usuarios ya aceptaron — todo cambio sensible queda registrado con motivo y versión, nunca se sobre-escribe en
silencio.</p>
<p><b>Flujo:</b> editas el texto del NDA por rol → se crea una nueva versión con tu motivo → las aceptaciones ya
firmadas por usuarios anteriores se conservan intactas, solo aplica a nuevas aceptaciones desde ahora.</p></div>

<div class="acad-section">🔐 <b>Usuarios & Permisos</b>
<p><b>Qué es y por qué importa:</b> define quién ve qué módulo — sin esto, todos los roles verían todo, incluyendo
finanzas sensibles y datos protegidos de shoppers.</p>
<p><b>Flujo completo:</b> <b>Invitar usuario</b> → asignas rol técnico, persona operativa (opcional), país(es)/scope,
proyecto y cliente (opcionales) → el usuario invitado entra ya con ese alcance aplicado desde el login. Un rol
personalizado sin matriz de permisos configurada queda bloqueado por defecto (fail-closed) — solo ve Capacitación
hasta que un admin le defina explícitamente qué categorías puede ver.</p>
<p><b>Errores frecuentes:</b> crear un rol nuevo y esperar que "vea todo" por default es exactamente lo contrario
del comportamiento real — hay que ir a la matriz de permisos y asignarle categorías explícitamente.</p></div>

<div class="acad-section">⚡ <b>Automatizaciones</b>
<p><b>Qué es y por qué importa:</b> dispara notificaciones (WhatsApp/correo) automáticamente en eventos clave, sin
que alguien tenga que enviarlas una por una manualmente.</p>
<p><b>Flujo y botones:</b> activas/desactivas cada automatización con su switch → eliges canal y plantilla → el
botón <b>Escanear y preparar notificaciones (in-app)</b> detecta visitas atrasadas/pendientes y prepara sus alertas.
El navegador NUNCA llama directo a un proveedor real de IA ni guarda su API key — solo guarda tu preferencia de
modelo para cuando el backend/adapter esté conectado.</p></div>

<div class="acad-section">🔌 <b>Integraciones & Add-ons</b>
<p><b>Qué es y por qué importa:</b> muestra el catálogo del ecosistema (WhatsApp, Sheets, IA, facturación) que la
plataforma puede conectar sin depender de desarrollo a medida por cada cliente nuevo.</p>
<p><b>Errores frecuentes:</b> "Configurar" una integración en este prototipo guarda tu preferencia/preview — no
activa una conexión real; el estado siempre lo aclara la etiqueta junto al botón.</p></div>

<div class="acad-section">✉️ <b>Correo integrado</b>
<p><b>Qué es y por qué importa:</b> da trazabilidad de comunicación con clientes sin salir de la plataforma ni
perder el hilo en bandejas personales de cada persona del equipo.</p>
<p><b>Flujo:</b> respondes desde el hilo del correo → el botón WA (borrador manual) abre WhatsApp Web si prefieres
ese canal para ese contacto — ningún envío sale solo del navegador.</p></div>

<div class="acad-section">🎨 <b>Identidad de Marca</b>
<p><b>Qué es y por qué importa:</b> tu logo y colores aparecen en login, documentos y propuestas — sin configurarlo,
todo sale con la marca genérica de CXOrbia, lo cual no transmite profesionalismo ante un cliente final.</p>
<p><b>Cómo validar que funcionó:</b> cierra sesión y vuelve a entrar — el login y el manifest (ícono de instalación
PWA) deben reflejar ya la marca configurada.</p></div>`},
         {id:'mg5',ic:'❓',n:'Evaluación de la guía de módulos',tipo:'quiz',quiz:[
           {q:'Un shopper no puede entrar a un lote de pago aunque tenga liquidaciones elegibles. ¿Qué módulo revisas primero?',o:['Marca','Shoppers — probablemente falten sus datos bancarios completos','Marketing','Automatizaciones'],a:1,fb:'El módulo Shoppers requiere banco, tipo de cuenta, número y titular completos para poder incluir a alguien en un lote de pago.'},
           {q:'¿Cuál es la diferencia entre Fuente de HR y Hojas de Ruta?',o:['Son el mismo módulo con dos nombres','Fuente de HR define CÓMO se conecta la HR (archivo o en vivo); Hojas de Ruta ES el plan de visitas en sí','Hojas de Ruta es solo para shoppers','Fuente de HR es exclusivo de Finanzas'],a:1,fb:'Fuente de HR configura el mecanismo de conexión (importación vs. Google Sheets en vivo); Hojas de Ruta es el contenido — el plan de visitas del periodo.'},
         ]}
       ]},
      /* ─── INDUCCIÓN ─── */
      {id:'a_ind',cat:'Inducción',ic:'🚀',color:'#e0004d',n:'Inducción CXOrbia 360',
       desc:'Conoce la plataforma, el ciclo operativo y tu día a día como consultora.',
       cert:true,mins:65,
       lessons:[
         {id:'l1',ic:'🎯',n:'Bienvenida y visión',content:`
<h2>Bienvenida a CXOrbia</h2>
<p>CXOrbia es el ecosistema operativo y estratégico para consultoras de <strong>mystery shopping, auditoría de campo y experiencia al cliente</strong>. Este curso es tu punto de partida: antes de tocar cualquier módulo, vale la pena entender la visión completa, porque cada pantalla que verás después tiene sentido dentro de este ecosistema, no como una herramienta aislada.</p>
<div class="acad-cards">
  <div class="acad-card"><div>🏢</div><b>Admin</b><p>Operación, finanzas, comercial, IA. El cerebro de la consultora.</p></div>
  <div class="acad-card"><div>🕵️</div><b>Shopper</b><p>App de campo: visitas, OKRs, certificación, pagos.</p></div>
  <div class="acad-card"><div>🏬</div><b>Cliente</b><p>Portal estratégico: score, ranking, hallazgos, acciones.</p></div>
</div>
<h3>¿Por qué no es una herramienta estática?</h3>
<ul><li>Una visita realizada genera automáticamente la liquidación, actualiza el dashboard y notifica al equipo — sin captura manual.</li>
<li>La IA (Gemini) es transversal: cuestionarios, propuestas, actas, análisis crítico, marketing.</li>
<li>Conecta con Make, WhatsApp, Google Sheets, Outlook y 30+ herramientas sin programar.</li>
<li>Multi-tenant: cada consultora tiene su propia instancia con marca, plan y módulos.</li></ul>`},
         {id:'l2',ic:'🗺️',n:'La plataforma: módulos y menú',content:`
<h2>Arquitectura del menú (admin)</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que ubiques rápido cualquier módulo sin memorizar el sistema completo el primer día.</p></div>
<div class="acad-section"><b>Operación</b> — lo que uses a diario<br>Mi Día · Dashboard · Visitas · Postulaciones · Reservas · Shoppers · Informes</div>
<div class="acad-section"><b>Admin del Proyecto</b> — set-up y configuración<br>Clientes · Proyectos · Hojas de Ruta · Cuestionarios · Importador</div>
<div class="acad-section"><b>Capacitación & IA</b><br>Academia · Certificación · Documentos · Soporte</div>
<div class="acad-section"><b>Finanzas</b><br>Dashboard Financiero · Movimientos · Liquidaciones · Lotes</div>
<div class="acad-section"><b>Comercial</b><br>CRM · Costos & Propuestas · Marketing</div>
<div class="acad-section"><b>Configuración</b><br>Usuarios & Permisos · Plan · Automatizaciones · Integraciones</div>
<h3>Tip clave: el sidebar es colapsable</h3>
<p>Usa el botón ☰ arriba a la izquierda para colapsar el menú y tener más espacio de trabajo. El proyecto activo siempre se muestra en la parte superior del rail.</p>`},
         {id:'l3',ic:'☀️',n:'Mi Día: el punto de partida',content:`
<h2>Mi Día — tu cockpit diario</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que sepas qué hacer hoy sin revisar módulo por módulo.</p></div>
<p>Mi Día es la primera pantalla que verás al entrar. Muestra en un calendario mensual todas las visitas y tareas del periodo, con KPIs de la operación en tiempo real.</p>
<h3>KPIs de Mi Día (todos clickeables)</h3>
<ul>
<li><b>Agendadas</b>: visitas con fecha confirmada. Clic → lista filtrada con opción de ir a Postulaciones.</li>
<li><b>Por aprobar</b>: postulaciones de shoppers esperando revisión. Clic → ir directo a Postulaciones para aprobar.</li>
<li><b>Realizadas</b>: visitas cuyo cuestionario puede estar pendiente. Clic → lista con estado de cada una.</li>
<li><b>Sin asignar</b>: visitas publicadas sin shopper asignado. Clic → ir a Visitas para asignar.</li>
</ul>
<h3>Filtro por proyecto</h3>
<p>Puedes ver el cronograma de un proyecto específico o de todos los proyectos simultáneamente usando el selector en la parte superior del calendario.</p>`},
         {id:'l4',ic:'🔄',n:'El ciclo operativo completo',content:`
<h2>Ciclo de vida de una visita</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que entiendas qué dispara qué — esto es la base de toda la plataforma.</p></div>
<p>Entender este ciclo es fundamental. Cada etapa tiene responsables y genera acciones automáticas:</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Publicar</b><p>El equipo carga la HR o publica visitas manualmente. Nacen en estado "disponible".</p></div>
  <div class="acad-step"><span>2</span><b>Reservar/Postular</b><p>El shopper reserva sucursales o se postula. El equipo recibe notificación.</p></div>
  <div class="acad-step"><span>3</span><b>Asignar</b><p>El equipo aprueba la postulación o asigna manualmente. La visita pasa a "asignada" y se prepara la notificación al shopper (WhatsApp/in-app según configuración · pendiente backend).</p></div>
  <div class="acad-step"><span>4</span><b>Agendar</b><p>El shopper elige fecha y franja. El equipo recibe notificación.</p></div>
  <div class="acad-step"><span>5</span><b>Realizar</b><p>El shopper ejecuta la visita y la marca como realizada. Se habilita el cuestionario.</p></div>
  <div class="acad-step"><span>6</span><b>Cuestionario</b><p>El shopper llena el cuestionario el mismo día con evidencias. El score se calcula automáticamente.</p></div>
  <div class="acad-step"><span>7</span><b>Validar y Pagar</b><p>El equipo valida la liquidación y la incluye en un lote de pago. Se generan los egresos automáticamente.</p></div>
</div>
<p><b>Sincronía automática</b>: cada cambio de estado notifica al equipo, actualiza el dashboard, sincroniza la HR externa (Google Sheets) y mueve la liquidación.</p>`},
         {id:'l4b',ic:'🔗',n:'Sincronía entre módulos: cómo todo se conecta',content:`
<h2>La sincronía es el corazón de CXOrbia</h2>
<p>Ninguna acción vive aislada. Un solo evento dispara una cadena de actualizaciones automáticas en toda la plataforma. Entender esto te evita el trabajo manual duplicado y los errores de datos.</p>
<h3>Ejemplo real: un shopper envía su cuestionario</h3>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Visita</b><p>La visita pasa de "realizada" a "cuestionario realizado/completado". Su estado cambia en Visitas y en Mi Día.</p></div>
  <div class="acad-step"><span>2</span><b>Score</b><p>El cuestionario calcula el score ponderado por sección y lo guarda. El Portal del Cliente lo muestra en vivo.</p></div>
  <div class="acad-step"><span>3</span><b>Liquidación</b><p>Nace la liquidación con honorario + reembolso y su fecha estimada de pago (viernes + días configurados).</p></div>
  <div class="acad-step"><span>4</span><b>Beneficios</b><p>El shopper ve la liquidación en Mis Beneficios con estado y fecha.</p></div>
  <div class="acad-step"><span>5</span><b>Dashboard</b><p>Los KPIs de realizadas, cuestionarios y avance vs ideal se recalculan al instante.</p></div>
  <div class="acad-step"><span>6</span><b>Notificación</b><p>El equipo recibe aviso; si Make está activo, dispara WhatsApp/correo.</p></div>
</div>
<h3>El bus de eventos</h3>
<p>Internamente, cada cambio emite un evento (<code>visit-flow</code>, <code>fin</code>, <code>crm</code>) al que se suscriben todas las vistas abiertas. Por eso no necesitas refrescar: si tienes el Dashboard abierto y en otra pestaña se paga un lote, el Dashboard se actualiza solo.</p>
<h3>Anti-duplicación con HR externa</h3>
<p>Cuando la HR vive en Google Sheets y también gestionas desde la plataforma, el sistema usa una <b>llave natural inmutable</b> (documento del shopper + id de visita) para reconciliar. Aunque asignes en ambos lados, nunca se duplica el registro.</p>
<h3>Por qué te importa como consultora</h3>
<ul>
<li>No capturas nada dos veces: una acción propaga a todos los módulos.</li>
<li>Los números siempre cuadran: finanzas, operación y portal del cliente leen la misma fuente.</li>
<li>La trazabilidad es total: cada gestión queda registrada con quién y cuándo.</li>
</ul>`},
         {id:'l5',ic:'❓',n:'Evaluación de inducción',tipo:'quiz',quiz:[
           {q:'¿Cuál es el flujo correcto para que una visita pase de disponible a pagada?',o:['Disponible → Asignada → Realizada → Cuestionario → Pagada','Publicada → Postulación → Asignación → Agenda → Realización → Cuestionario → Liquidada/Pagada','Solo hay que marcarla como realizada y automáticamente se paga','El shopper la marca como pagada desde su app'],a:1,exp:'El ciclo completo es: Publicar → Postular/Reservar → Asignar → Agendar → Realizar → Cuestionario → Validar → Pagar. Cada etapa tiene responsables y genera notificaciones automáticas. Saltarse una etapa rompe la sincronía de la liquidación.'},
           {q:'¿Qué sección del menú contiene el Dashboard, Visitas y Postulaciones?',o:['Admin del Proyecto','Configuración','Operación','Finanzas'],a:2,exp:'El menú de Operación contiene todo lo que se usa a diario: Mi Día, Dashboard, Visitas, Postulaciones, Reservas, Shoppers e Informes. Admin del Proyecto contiene el set-up (Clientes, Proyectos, HR, Cuestionarios).'},
           {q:'¿Qué herramienta de IA usa CXOrbia por defecto y por qué?',o:['ChatGPT, porque es la más conocida','Gemini Flash, por su relación costo-beneficio para operaciones de alto volumen','No usa IA — todo es manual','Claude, porque es el más preciso'],a:1,exp:'CXOrbia usa Gemini Flash de Google por su excelente relación costo-beneficio con tokens económicos. Es configurable por tenant desde Configuración → Automatizaciones → Asistente de IA. Sin configurar, los generadores usan heurística local sin costo.'},
           {q:'¿Qué ocurre cuando el equipo aprueba una postulación?',o:['Solo cambia el estado en la plataforma, nada más','La visita pasa a "asignada" y se emite un evento local (pendiente de backend) para notificar al shopper y, si aplica, reflejarse en la HR externa','El shopper debe verificar manualmente si fue aprobado','Se genera automáticamente la liquidación'],a:1,exp:'Al aprobar una postulación, la plataforma: (1) mueve la visita a "asignada", (2) emite un evento local que queda en estado pendiente de backend para notificar al shopper (WhatsApp/push vía Make, una vez que el backend confirme la conexión), (3) prepara la escritura de vuelta a la HR externa (Google Sheets) si esa integración está conectada, y (4) registra quién gestionó la aprobación para trazabilidad. Ninguna notificación ni escritura externa ocurre realmente hasta que el backend conecta la integración.'},
         ]}
       ]},
      /* ─── OPERACIÓN ─── */
      {id:'a_ops',cat:'Operación',ic:'📊',color:'#2a6fdb',n:'Dashboard y gestión operativa',
       desc:'Domina el cockpit: KPIs, estado por fases, Tablón, gestión de shoppers y reportes.',
       cert:false,mins:80,
       lessons:[
         {id:'o1',ic:'📊',n:'Dashboard Operativo',content:`
<h2>Dashboard Operativo — el cockpit</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Darte, en una sola pantalla, la salud de tu programa: ¿vas a tiempo?, ¿qué visitas necesitan atención hoy?, ¿cómo viene el trimestre? Vive en <b>Operación → Dashboard Operativo</b>.</p></div>
<div class="acad-section">🖱️ <b>Selectores y botones que usarás</b><p>Arriba tienes el selector <b>"🌐 Todos los proyectos"</b> (o uno específico) y el selector de mes. Cada KPI y cada fila de los buckets es clickeable. El botón <b>"⤓ Exportar"</b> descarga el estado actual, y <b>"Ver ranking completo →"</b> te lleva al detalle de shoppers.</p></div>
<h3>Avance real vs. ideal por país</h3>
<p>La barra de progreso compara el % de visitas realizadas contra el % esperado según el día del mes (curva lineal). Si a día 15 se esperaba 50% y tienes 30%, el semáforo es rojo y hay riesgo de incumplimiento.</p>
<ul><li>🟢 En rango: avance real ≥ ideal</li><li>🟡 Al límite: real está 1-15 pts por debajo del ideal</li><li>🔴 En riesgo: real más de 15 pts por debajo del ideal</li></ul>
<h3>Estado operativo de visitas (buckets)</h3>
<p>Cada bucket es clickeable y muestra la lista completa de visitas en esa etapa con botones de acción reales: <b>📲 WhatsApp</b> individual por fila, <b>📣 Recordar a todos</b> (recordatorio masivo al bucket completo), y checkboxes para seleccionar solo a algunos antes de recordar.</p>
<ul><li>Sucursal, shopper asignado, escenario y fecha</li><li>WhatsApp individual por fila</li><li>Recordatorio masivo a todos los del bucket</li><li>Selección múltiple para recordar a los que elijas</li></ul>
<h3>Comparativo trimestral (8 KPIs)</h3>
<p>Compara los últimos 3 meses: cumplimiento, días real→submit, visitas realizadas, cuestionarios a tiempo, calidad QA, tasa de reprogramación, cobertura de sucursales y margen neto.</p>
<div class="acad-section">✅ <b>Para qué sirve (si no existiera)</b><p>Sin este dashboard, un atraso o un cuello de botella se detectaría hasta fin de mes, cuando ya es tarde para corregirlo — el semáforo diario es lo que te da tiempo real de reacción.</p></div>`},
         {id:'o2',ic:'📋',n:'Postulaciones y asignaciones',content:`
<h2>Gestión de Postulaciones</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que ninguna solicitud de un shopper quede sin respuesta ni sin trazabilidad. Vive en <b>Operación → Postulaciones</b>.</p></div>
<div class="acad-section">⚙️ <b>Cómo funciona</b><p>Cuando un shopper reserva o se postula a una visita, aparece en tu bandeja en estado "pendiente". Cada acción que tomas (aprobar, rechazar, reasignar) queda registrada con tu nombre como gestor — esto es lo que te permite responder "¿quién gestionó esto?" meses después sin adivinar.</p></div>
<h3>¿Qué es una postulación?</h3>
<p>Cuando un shopper ve una visita disponible y solicita realizarla, se crea una postulación. El equipo decide si aprobar, poner en standby o rechazar.</p>
<h3>Botones y acciones disponibles por postulación</h3>
<ul>
<li><b>✅ Aprobar</b>: la visita pasa a "asignada" y el shopper recibe notificación.</li>
<li><b>Standby</b>: se reserva pero no confirma todavía.</li>
<li><b>Rechazar</b>: la visita queda disponible para otro shopper.</li>
<li><b>👤 Ver perfil</b>: abre la ficha del shopper con KPIs, historial y verificación de requisitos (perfil completo, datos bancarios, certificación).</li>
<li><b>Editar</b>: cambia la fecha o franja; sincroniza con la HR externa.</li>
<li><b>Reasignar</b>: transfiere a otro shopper con trazabilidad.</li>
<li><b>Cancelar</b>: la visita vuelve a disponible y el shopper es notificado.</li>
</ul>
<h3>Asignación manual</h3>
<p>Usa "＋ Asignar visita manual" para asignar directamente sin que el shopper se postule. Puedes buscar por sucursal y por nombre de shopper. Si el shopper no existe, créalo al vuelo con nombre, apellido y WhatsApp.</p>
<h3>Trazabilidad</h3>
<p>Cada gestión queda registrada con "gestionado por [quién]". Esto es crítico cuando varias personas del equipo operan la plataforma al mismo tiempo.</p>
<div class="acad-section">✅ <b>Para qué sirve (si no existiera)</b><p>Sin esta bandeja con trazabilidad, dos personas del equipo podrían aprobar y reasignar la misma visita sin saberlo, generando confusión con el shopper y disputas internas sobre quién decidió qué.</p></div>`},
         {id:'o3',ic:'👥',n:'Gestión de shoppers',content:`
<h2>Shoppers — red de evaluadores</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Ser la base de datos maestra de tu red de evaluadores — sin ella no puedes asignar, certificar ni pagar a nadie. Vive en <b>Operación → Shoppers</b>.</p></div>
<h3>KPIs del módulo</h3>
<ul>
<li><b>En este proyecto</b>: shoppers activos para el proyecto seleccionado.</li>
<li><b>Activos</b>: con estado distinto a "Pendiente".</li>
<li><b>Perfiles incompletos</b>: no tienen todos los datos — riesgo en pagos.</li>
<li><b>Preferentes</b>: con tarifa de honorario preferente configurada.</li>
</ul>
<h3>Perfil del shopper (clickeable desde cualquier módulo)</h3>
<p>Al hacer clic en un shopper desde el Top del Dashboard o el Ranking, se abre su ficha con:</p>
<ul><li>KPIs de desempeño (visitas, realizadas, liquidadas, en curso)</li><li>Verificación de requisitos (perfil completo, datos bancarios, WhatsApp, certificado)</li><li>Historial de visitas por categoría (todas, realizadas, liquidadas, en curso)</li><li>Acceso directo a "Ver perfil completo" y "WhatsApp"</li></ul>
<h3>Datos bancarios</h3>
<p>Es obligatorio completar banco, tipo de cuenta, número, titular y moneda para incluir al shopper en un lote de pago. El shopper puede actualizar sus propios datos desde Mi Perfil (autoservicio). Cualquier cambio bancario genera una notificación al equipo.</p>
<div class="acad-section">✅ <b>Para qué sirve (si no existiera)</b><p>Sin este módulo, no habría forma centralizada de saber quién puede recibir una visita nueva, quién está certificado, o a quién le falta completar su perfil antes del próximo lote de pago.</p></div>`},
         {id:'o4',ic:'📝',n:'Reportes operativos',content:`
<h2>Reportes & KPIs</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Convertir la data operativa en reportes listos para compartir, sin depender de Excel manual. Vive en <b>Operación → Informes</b>.</p></div>
<p>Este módulo existe para que dejes de armar Excels manuales cada vez que el cliente pide un análisis: los reportes se generan solos a partir de la misma data que ya está en la plataforma, siempre actualizados.</p>
<h3>Reportes disponibles</h3>
<ul>
<li><b>Cumplimiento por sucursal</b>: ranking de tiendas por % de visitas realizadas.</li>
<li><b>Cobertura por país y quincena</b>: distribución geográfica del cumplimiento.</li>
<li><b>Ranking de shoppers</b>: por efectividad (realizadas/asignadas).</li>
<li><b>Hallazgos más frecuentes</b>: los top errores recurrentes — base para planes de capacitación.</li>
<li><b>Liquidaciones del periodo</b>: detalle de honorarios y reembolsos.</li>
</ul>
<h3>Crear reportes personalizados</h3>
<p>Cada reporte puede personalizarse (nombre, notas, columnas adicionales) y descargarse. Usa el botón "＋ Nuevo reporte personalizado" para añadir variantes basadas en los reportes estándar.</p>
<h3>Conexión con el portal del cliente</h3>
<p>Los reportes de cumplimiento, ranking y hallazgos se reflejan automáticamente en el portal del cliente de la marca. No hay que enviar PDFs — el cliente los ve en tiempo real.</p>`},
         {id:'o5',ic:'❓',n:'Evaluación operación',tipo:'quiz',quiz:[
           {q:'Un shopper tiene visitas asignadas pero no tiene número de WhatsApp registrado. ¿Qué riesgo implica?',o:['Ninguno, el WhatsApp es opcional','No recibirá notificaciones automáticas (Make) ni mensajes manuales de WA Web, afectando la comunicación y el seguimiento de la visita','Solo afecta si tiene Make configurado','El sistema le envía SMS automáticamente'],a:1,exp:'El número de WhatsApp es crítico para la comunicación operativa. Sin él: no recibe confirmaciones de asignación, no recibe recordatorios automáticos de Make, y el equipo no puede contactarlo por WhatsApp Web desde la plataforma. Además, cualquier automatización de Make que envíe WA al shopper fallará silenciosamente.'},
           {q:'¿Qué diferencia hay entre el Dashboard en modo "Todos los proyectos" vs. proyecto específico?',o:['Son iguales','El modo general agrega KPIs de todos los proyectos activos; el modo específico filtra por el proyecto seleccionado. Ambos son en tiempo real','El modo general solo muestra el trimestre anterior','No existe el modo "Todos los proyectos"'],a:1,exp:'El selector en el Dashboard permite ver: (a) la operación general de toda la consultora (todos los proyectos agregados) o (b) un proyecto específico. El avance real vs. ideal, los buckets de estado y el comparativo trimestral cambian según la selección.'},
           {q:'¿Qué son los "hallazgos frecuentes" en Reportes y para qué sirven?',o:['Errores técnicos de la plataforma','Los criterios del cuestionario que más frecuentemente obtienen puntuación negativa en las visitas — base para planes de capacitación dirigidos','Las visitas que el equipo olvidó asignar','Los shoppers con más rechazos'],a:1,exp:'Los hallazgos frecuentes identifican automáticamente los criterios del cuestionario con más fallas recurrentes. Esta información es gold: permite al equipo y al cliente diseñar planes de capacitación específicos para el personal que falla en esos puntos, en vez de capacitar sobre todo sin foco.'},
         ]}
       ]},
      /* ─── SET-UP ─── */
      {id:'a_setup',cat:'Set-up',ic:'⚙️',color:'#7c3aed',n:'Configurar un programa completo',
       desc:'Crea cliente, proyecto, HR, cuestionario ponderado, instructivo y certificación con IA.',
       cert:true,mins:90,
       lessons:[
         {id:'s1',ic:'🏢',n:'Crear cliente y proyecto',content:`
<h2>Paso 1: Crear el cliente</h2>
<p>Ve a Admin del Proyecto → Clientes → Nuevo cliente. Este es el primer paso de cualquier programa nuevo: el cliente es el contenedor que agrupará todos sus proyectos presentes y futuros, así que vale la pena cargarlo bien desde el inicio en vez de corregirlo después.</p>
<ul><li>Nombre, rubro (catálogo compartido CX.RUBROS), país, contactos.</li><li>Si el prospecto ya está en el CRM y lo marcas como ganado, el cliente se crea automáticamente sin recapturar.</li></ul>
<h2>Paso 2: Crear el proyecto</h2>
<div class="acad-section">🎯 <b>Objetivo de este paso</b><p>El proyecto es donde vive toda la configuración operativa y financiera del programa — sin él, no puedes cargar HR ni publicar visitas.</p></div>
<p>Ve a Proyectos → Nuevo proyecto (o abre uno existente y usa el botón ⚙️).</p>
<ul>
<li><b>Periodicidad de rondas</b>: mensual, bimensual, trimestral, semestral o anual.</li>
<li><b>Periodo de cumplimiento</b>: puede ser diferente a la ronda. Ej: ronda mensual + cumplimiento quincenal (la mitad de las visitas del mes debe hacerse en la primera quincena).</li>
<li><b>Países y monedas</b>: múltiples países, cada uno con su moneda. Los KPIs y las liquidaciones se separan automáticamente por moneda.</li>
<li><b>Escenarios</b>: define los tipos de evaluación. Puedes agregarlos manualmente o usar "Extraer del instructivo (IA)".</li>
</ul>`},
         {id:'s2',ic:'🗺️',n:'Hoja de Ruta inteligente',content:`
<h2>La Hoja de Ruta (HR) es la base operativa</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Sin HR no hay visitas que publicar — es el plan operativo del periodo. Vive en <b>Admin del Proyecto → Hojas de Ruta</b>.</p></div>
<p>La HR define qué sucursales se evalúan, con qué escenario, en qué quincena y con qué honorario. Sin ella no hay visitas.</p>
<h3>Tres formas de crear la HR</h3>
<div class="acad-section"><b>🤖 HR Inteligente (recomendado)</b><p>Ve a Hojas de Ruta → HR Inteligente. Carga el instructivo del cliente (PDF, Word, imagen) o pégalo como texto. La IA extrae: sucursales, ciudades, escenarios, franjas horarias y honorarios sugeridos. Revisas, iteras con lenguaje natural y aceptas.</p></div>
<div class="acad-section"><b>📥 Importar HR</b><p>Si el cliente te envía un Excel o CSV con sus sucursales. El Importador Inteligente detecta las columnas automáticamente, muestra vista previa y aplica anti-duplicado por llave natural (sucursal+ciudad+escenario+quincena).</p></div>
<div class="acad-section"><b>🔗 Google Sheets en vivo</b><p>Conecta la hoja del cliente. La plataforma la lee en tiempo real y escribe de vuelta al asignar o agendar (doble vía). Las fechas que cambien en Sheets se actualizan en la plataforma; las asignaciones hechas en la plataforma aparecen en Sheets.</p></div>
<h3>Anti-duplicado crítico</h3>
<p>Si usas Sheets en vivo Y además importas manualmente, el sistema no duplica porque usa una llave natural inmutable. Esto resolvió el problema que tenían en la plataforma anterior.</p>`},
         {id:'s3',ic:'🧩',n:'Cuestionario ponderado',content:`
<h2>El cuestionario: el corazón de la medición</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>El cuestionario es lo que convierte una visita en un dato medible y comparable. Vive en <b>Admin del Proyecto → Cuestionarios</b>.</p></div>
<h3>¿Qué es un cuestionario ponderado?</h3>
<p>Cada sección tiene un peso % y cada pregunta tiene un peso dentro de su sección. El score final es el promedio ponderado — objetivo y reproducible.</p>
<h3>Botones y flujo: Crear con IA (Set-up desde instructivo)</h3>
<ol>
<li>Ve a Cuestionarios → botón <b>"🤖 Set-up desde instructivo"</b>.</li>
<li>Carga el instructivo del cliente.</li>
<li>La IA propone secciones con pesos y preguntas.</li>
<li>Usa el <b>Iterador</b>: escribe en lenguaje natural "agrega sección de limpieza", "sube el peso de atención a 35%", "menos preguntas por sección". La IA regenera.</li>
<li>Acepta cuando esté bien.</li>
</ol>
<h3>Múltiples versiones</h3>
<p>Puedes tener versiones diferentes del cuestionario para distintos tipos de sucursales: tiendas grandes, kioscos, franquicias, diferentes marcas. Cada versión se asigna a un agrupador de sucursales.</p>
<h3>Evidencia por pregunta</h3>
<p>Configura qué tipo de evidencia requiere cada pregunta: foto normal, foto geolocalizada, audio o video. Sin la evidencia correcta, el cuestionario no puede enviarse.</p>`},
         {id:'s4',ic:'📋',n:'Instructivo y certificación',content:`
<h2>Instructivo: el manual del shopper</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>El instructivo alimenta tanto al cuestionario como a la certificación — es la fuente única de verdad del protocolo del cliente.</p></div>
<p>El instructivo le dice al evaluador exactamente qué hacer, qué observar y cómo actuar en el escenario.</p>
<h3>Crear el instructivo</h3>
<p>Ve a Academia → Nuevo bloque → sube el PDF o documento del protocolo del cliente. También puedes crear uno en texto con formato y adjuntar videos (YouTube, Vimeo o archivo subido).</p>
<h2>Certificación: el gate de calidad</h2>
<p>Antes de ejecutar visitas de un proyecto, el shopper debe aprobar la certificación. Esto garantiza que entendió el protocolo.</p>
<h3>Crear certificación con IA</h3>
<ol>
<li>Ve a Certificación → 🤖 Crear certificación con IA.</li>
<li>Carga el instructivo (el mismo que usaste para el set-up).</li>
<li>Define el número de preguntas (10 recomendado) y el % mínimo para aprobar (gate, usualmente 80%).</li>
<li>La IA genera el banco de preguntas con respuesta correcta y explicación para el feedback.</li>
</ol>
<h3>Re-certificación</h3>
<p>Cuando el instructivo cambia, usa "🔄 Solicitar re-certificación" para exigir que todos (o un shopper específico) se vuelvan a certificar. El shopper recibe notificación automática.</p>`},
         {id:'s5',ic:'❓',n:'Evaluación de set-up',tipo:'quiz',quiz:[
           {q:'¿Qué ocurre si no configuras el "periodo de cumplimiento" en un proyecto mensual?',o:['La plataforma da error','El periodo de cumplimiento es igual a la ronda (mensual) por defecto; si necesitas metas quincenales, debes configurarlo explícitamente','No se pueden crear visitas','Los shoppers no pueden postularse'],a:1,exp:'Si el periodo de cumplimiento no se configura, la plataforma asume que es igual a la periodicidad de la ronda. Para programas como los que tienen metas quincenales (ej: la mitad de las visitas del mes debe realizarse antes del día 15), debes configurar explícitamente "periodo de cumplimiento: quincenal" en el set-up del proyecto.'},
           {q:'¿Qué hace el botón "Iterar" en el generador de cuestionarios con IA?',o:['Genera un cuestionario completamente nuevo ignorando el anterior','Permite refinar la propuesta de la IA con instrucciones en lenguaje natural antes de aplicarla al proyecto','Sube todos los pesos al 100%','Copia el cuestionario del proyecto anterior'],a:1,exp:'El Iterador es una de las funciones más poderosas: después de que la IA propone las secciones, puedes darle instrucciones como "agrega una sección de limpieza e imagen", "reduce el peso de tiempos" o "máximo 3 preguntas por sección". La IA ajusta y regenera. Puedes iterar tantas veces como necesites antes de confirmar.'},
           {q:'¿Qué es la "llave natural" y por qué es crítica en la HR?',o:['Un código alfanumérico aleatorio','La combinación sucursal+ciudad+escenario+quincena que identifica de forma única e inmutable cada visita, evitando duplicados aunque cambie la fecha o el estado','El nombre de usuario del shopper','La URL de la Hoja de Google Sheets'],a:1,exp:'La llave natural es la solución al problema de duplicación en la doble vía HR↔plataforma. Como sucursal+ciudad+escenario+quincena no cambia (son datos estables del programa), la plataforma puede reconocer que una visita ya existente es "la misma" aunque su fecha de agenda o su estado hayan cambiado, y la actualiza en vez de crear una nueva.'},
         ]}
       ]},
      /* ─── FINANZAS ─── */
      {id:'a_fin',cat:'Finanzas',ic:'💰',color:'#059669',n:'Finanzas y liquidaciones sin Excel',
       desc:'Domina el ciclo financiero: liquidaciones automáticas, lotes, movimientos y análisis.',
       cert:false,mins:75,
       lessons:[
         {id:'f1',ic:'💸',n:'Liquidaciones — el ciclo automático',content:`
<h2>Liquidaciones: cero captura manual</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Calcular automáticamente cuánto se le debe a cada shopper, sin captura manual. Vive en <b>Finanzas → Liquidaciones</b>.</p></div>
<p>Cada visita que se realiza y cuyo cuestionario se envía, genera automáticamente una liquidación. No hay captura manual. Esto elimina el error humano más común en finanzas operativas: calcular a mano cuánto le corresponde a cada shopper y olvidar un reembolso o duplicar un honorario.</p>
<h3>Estados de la liquidación</h3>
<ol>
<li><b>Pend. cuestionario</b>: la visita fue realizada pero el shopper no ha completado el cuestionario.</li>
<li><b>Pend. submitir</b>: el cuestionario está completo pero no submitido.</li>
<li><b>Validada</b>: cuestionario realizado y aprobado en revisión. Lista para incluir en un lote.</li>
<li><b>En lote</b>: fue movida al lote de pago en construcción.</li>
<li><b>Pagada</b>: el lote fue pagado. Se generó el egreso en Movimientos.</li>
</ol>
<h3>Estructura del total</h3>
<p>Total = Honorario + Reembolsos (consumos del escenario). Los reembolsos son un pass-through: el cliente los paga a la consultora y la consultora los paga al shopper. No son utilidad — si los contabilizas como ingreso, tu margen real quedaría inflado artificialmente. Vigila esto especialmente al leer el Dashboard Financiero.</p>`},
         {id:'f2',ic:'📦',n:'Lotes de pago',content:`
<h2>El Lote en Construcción</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Pagar varias liquidaciones de una sola vez, en vez de una por una. Vive en <b>Finanzas → Liquidaciones</b>, panel "📦 Lote en construcción".</p></div>
<p>El lote es el mecanismo de pago por batches. En vez de pagar visita por visita, las agrupas en un lote y pagas todo de una vez.</p>
<h3>Proceso paso a paso</h3>
<ol>
<li>Ve a Finanzas → Liquidaciones.</li>
<li>Usa "▶ Mover a lote" por cada liquidación validada que quieras incluir.</li>
<li>El panel "Lote en construcción" muestra el total por moneda en tiempo real.</li>
<li>Si hay liquidaciones de meses anteriores (diferidas), usa "➕ Incluir CxP meses anteriores".</li>
<li>Haz clic en "💳 Pagar lote" → confirma → se generan los egresos en Movimientos y se actualiza el portal de Beneficios del shopper.</li>
</ol>
<h3>¿Qué pasa con las que no incluyes?</h3>
<p>Al confirmar el pago del lote, tienes la opción de "diferir" las validadas no incluidas. Se convierten en Cuentas por Pagar (CxP) del mes siguiente y aparecerán disponibles para el próximo lote.</p>`},
         {id:'f3',ic:'📊',n:'Movimientos y tesorería',content:`
<h2>Movimientos: la tesorería de la consultora</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Registrar y conciliar todo el dinero de la operación — no solo lo de shoppers. Vive en <b>Finanzas → Movimientos</b>.</p></div>
<p>Si Liquidaciones responde "¿cuánto le debo a cada shopper?", Movimientos responde la pregunta más grande: "¿cómo está la salud financiera del negocio completo?" — y por eso vale la pena registrar aquí todo, no solo lo relacionado a shoppers.</p>
<h3>Tipos de movimientos</h3>
<ul>
<li><b>Ingresos operativos</b>: comisiones, honorarios de programa, facturación, anticipos.</li>
<li><b>Financiamientos</b>: NO son ingreso operativo. Entran como flujo y se registran automáticamente como CxP hasta devolverse.</li>
<li><b>Egresos</b>: gastos fijos, honorarios a shoppers (se generan al pagar lotes), abonos a CxP.</li>
<li><b>Remesas</b>: ingresos de casa matriz o sede regional para conciliar.</li>
</ul>
<h3>Scope: proyecto vs. global</h3>
<p>Puedes ver movimientos por proyecto (específico de un programa) o globales (gastos administrativos que no corresponden a un proyecto particular). Usa el selector en Movimientos. Esta separación es la que te permite saber si UN proyecto específico es rentable, en vez de ver solo el resultado consolidado de toda la operación.</p>
<h3>Presupuesto mensual</h3>
<p>En la misma pantalla, en la sección "Presupuesto mensual", define los rubros de gasto por mes. El Dashboard Financiero mostrará semáforos (en rango/al límite/excedido) comparando el real vs. el presupuestado.</p>`},
         {id:'f4',ic:'📈',n:'Dashboard Financiero',content:`
<h2>Dashboard Financiero: inteligencia del negocio</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Responder en una pantalla si el negocio es rentable, no solo si opera bien. Vive en <b>Finanzas → Dashboard Financiero</b>.</p></div>
<h3>Tiles por país (clickeables)</h3>
<p>Cada país tiene su tile con: ingresos operativos, honorarios pagados, reembolsos, CxC, margen % y análisis rápido. Clic → detalle de esa métrica.</p>
<h3>Análisis crítico inteligente</h3>
<p>El sistema analiza automáticamente los datos y genera hallazgos con estrategias:</p>
<ul>
<li>🔴 Margen crítico (&lt;20%): qué hacer para recuperarlo.</li>
<li>🟡 Cobranza alta: CxC supera el 40% del ingreso → riesgo de liquidez.</li>
<li>🟦 Financiamientos activos: no son utilidad, están como CxP.</li>
<li>📊 Gasto sobre presupuesto: qué rubro excedió y cuánto.</li>
</ul>
<h3>Comparativos</h3>
<ul>
<li><b>Intermensual</b>: margen % mes vs. mes anterior (barras de columna, con Δ).</li>
<li><b>Interanual</b>: 2024 → 2025 → 2026 (evolución del margen y el ingreso).</li>
</ul>`},
         {id:'f5',ic:'❓',n:'Evaluación finanzas',tipo:'quiz',quiz:[
           {q:'¿Por qué los financiamientos NO deben contarse como ingreso operativo?',o:['Porque son en otra moneda','Porque son dinero que se debe devolver — no son utilidad generada por el programa sino deuda que aumenta el pasivo','Porque no son pagos del cliente','Porque el banco no lo permite'],a:1,exp:'Un financiamiento es un préstamo o anticipo que debe devolverse. Si lo cuentas como ingreso operativo, tu margen aparece inflado artificialmente. CXOrbia lo registra como "entrada de flujo" (para que tengas el dinero disponible) y simultáneamente como CxP (deuda), manteniendo separados el ingreso real del financiamiento.'},
          ]}
        ]},
      {id:'a_ind_ms',cat:'Industria MS',ic:'🌍',color:'#0891b2',n:'Mystery Shopping: mejores prácticas globales',
       desc:'Estándares internacionales, tipos de programa, ROI y benchmarks del sector.',
       cert:false,mins:55,
       lessons:[
         {id:'ms1',ic:'📖',n:'¿Qué es el Mystery Shopping profesional?',content:`
<h2>Mystery Shopping: más que un evaluador disfrazado</h2>
<p>El mystery shopping profesional es una <strong>metodología de investigación de mercados</strong> usada por las principales marcas del mundo para medir la experiencia del cliente con objetividad y consistencia.</p>
<h3>¿Por qué las marcas lo usan?</h3>
<ul><li>Medir la <b>brecha entre el estándar de servicio diseñado</b> y el que el cliente realmente experimenta.</li><li>Identificar <b>comportamientos del personal</b> que los supervisores no pueden observar directamente.</li><li>Tener <b>datos comparables</b> a lo largo del tiempo y entre sucursales.</li><li>Complementar el NPS (voz del cliente) con observación objetiva.</li></ul>
<h3>Tipos de programa</h3>
<div class="acad-cards">
  <div class="acad-card"><div>🕵️</div><b>Mystery Shopping presencial</b><p>Evaluador visita la sucursal como cliente real.</p></div>
  <div class="acad-card"><div>📞</div><b>Mystery Calling</b><p>Evaluación de la atención telefónica.</p></div>
  <div class="acad-card"><div>💻</div><b>Mystery Online/Digital</b><p>Evaluación de ecommerce, apps y chatbots.</p></div>
  <div class="acad-card"><div>🎯</div><b>Auditoría de imagen</b><p>Estado de la instalación, visual merchandising, precios.</p></div>
</div>
<h3>Estándares internacionales</h3>
<p>La <b>MSPA (Mystery Shopping Professionals Association)</b> establece los estándares éticos y metodológicos del sector a nivel mundial. Los programas profesionales siguen sus guías de diseño, reclutamiento y certificación de evaluadores.</p>`},
         {id:'ms2',ic:'💰',n:'ROI y valor de un programa de MS',content:`
<h2>¿Cuánto vale realmente un programa de mystery shopping?</h2>
<p>El ROI de un programa de MS es una de las preguntas más frecuentes de los clientes. La respuesta no es solo financiera.</p>
<h3>ROI directo (medible)</h3>
<ul><li><b>Reducción de reprocesos</b>: empleados que fallan consistentemente en protocolos generan costos (quejas, devoluciones, pérdida de clientes).</li><li><b>Conversión de ventas</b>: en programas de retail o banca, un aumento del 5% en score de cierre puede traducirse en millones en ventas adicionales.</li><li><b>Retención de clientes</b>: estudios muestran que mejorar 10 puntos el CX score reduce el churn hasta un 8%.</li></ul>
<h3>ROI indirecto (estratégico)</h3>
<ul><li>Información objetiva para decisiones de RRHH (reconocimiento, capacitación, desvinculación).</li><li>Evidencia real para negociaciones con proveedores de capacitación.</li><li>Benchmark contra la competencia para posicionamiento.</li></ul>
<h3>Cómo presentar el ROI a tu cliente</h3>
<p>Usa la calculadora de CXOrbia: modelo directo vs. delegado, con costos claros y desglose por sucursal. La propuesta generada con IA incluye la lógica del ROI adaptada al rubro del cliente.</p>`},
         {id:'ms3',ic:'📊',n:'Benchmarks y tendencias 2026',content:`
<h2>Estado del sector: tendencias en CX y MS (2026)</h2>
<h3>Top 5 tendencias</h3>
<ol>
<li><b>IA en análisis de cuestionarios</b>: modelos como Gemini analizan respuestas abiertas y detectan patrones que el análisis manual no ve.</li>
<li><b>Video mystery shopping</b>: evidencia en video se convierte en estándar en sectores de alto riesgo (salud, finanzas) por su trazabilidad legal.</li>
<li><b>Integración con VoC</b>: combinar mystery shopping (voz del evaluador) con NPS real (voz del cliente) para un 360° de la experiencia.</li>
<li><b>Programas de mejora continua</b>: el mystery shopping evoluciona de "medir" a "mejorar" con planes de acción vinculados directamente a los resultados.</li>
<li><b>Acceso en tiempo real del cliente</b>: los portales estratégicos (como el de CXOrbia) reemplazan los reportes PDF mensuales.</li>
</ol>
<h3>Benchmarks por sector (Latinoamérica, 2025-2026)</h3>
<ul><li><b>Retail</b>: score promedio del sector 71/100. Top performers: 85+.</li><li><b>Banca</b>: 68/100 promedio. Protocolo de ventas es el criterio más bajo.</li><li><b>Restaurantes</b>: 74/100. Tiempos de espera y despedida son las brechas principales.</li><li><b>Telecomunicaciones</b>: 65/100. El conocimiento del producto es el hallazgo más frecuente.</li></ul>`},
         {id:'ms4',ic:'❓',n:'Evaluación de industria',tipo:'quiz',quiz:[
           {q:'¿Cuál es la diferencia entre Mystery Shopping y la encuesta de NPS/satisfacción?',o:['Son lo mismo, solo diferentes nombres','El MS mide la experiencia de forma objetiva y anónima (evaluador entrenado); el NPS mide la percepción subjetiva del cliente real. Se complementan pero no se sustituyen','El MS es más barato que el NPS','El NPS es más objetivo que el MS'],a:1,exp:'Son herramientas complementarias: el mystery shopping dice "¿se cumplió el protocolo?" con objetividad y evidencia; el NPS/VoC dice "¿cómo se sintió el cliente?" con su perspectiva subjetiva. Las marcas más avanzadas usan ambas para tener el cuadro completo. CXOrbia puede conectar los resultados de MS con programas de VoC para análisis integrado.'},
           {q:'¿Qué significa que un programa de mystery shopping tiene "calibración"?',o:['Que los cuestionarios son muy largos','Que todos los evaluadores miden igual los mismos criterios (consistencia metodológica), garantizando que los datos sean comparables entre sucursales y periodos','Que el programa es muy exacto en precios','Que los evaluadores son profesionales certificados'],a:1,exp:'La calibración es el proceso de asegurar que todos los evaluadores interpretan y aplican los criterios del cuestionario de la misma manera. Sin calibración, dos evaluadores en la misma sucursal pueden dar scores muy diferentes por interpretaciones distintas del mismo criterio. En CXOrbia, la certificación + el instructivo detallado son los mecanismos de calibración.'},
         ]}
       ]},
      /* ── Admin: Backend técnico ── */
      {id:'a_backend',cat:'Técnico',ic:'⚙️',color:'#7c3aed',n:'Backend técnico: Firebase, Gemini, Make y Storage',
       desc:'Conecta el backend de producción: base de datos en tiempo real, IA generativa, automatizaciones y almacenamiento de archivos.',cert:false,mins:90,
       lessons:[
         {id:'bt1',ic:'🔥',n:'Firebase: Auth, Firestore y Realtime DB',content:`
<h2>Firebase: el backend de CXOrbia en producción</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Conectar autenticación, base de datos y hosting reales para pasar de prototipo a producción.</p></div>
<div class="acad-section" style="background:#fff7e6;border-color:#f5c344">⚠️ <b>Importante — esto NO se hace desde el navegador del prototipo</b><p>Esta guía es para el <b>equipo de desarrollo del backend</b>, no para un usuario del prototipo. <code>firebaseConfig</code> identifica el proyecto de Firebase (no es un secreto por sí solo, pero igual vive en el código del backend, nunca pegado en un formulario de la app), y las reglas de seguridad reales las define y despliega ese equipo — el prototipo nunca pide ni guarda estas credenciales.</p></div>
<p>Firebase (Google) es el backend recomendado. Ofrece autenticación, base de datos en tiempo real y almacenamiento sin servidor que escala automáticamente. La ventaja frente a montar tu propio servidor: no necesitas contratar infraestructura ni preocuparte por escalar cuando crece el número de tenants — Firebase escala solo, y pagas por uso real.</p>
<h3>Pasos de configuración (equipo de backend)</h3>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>console.firebase.google.com → Crear proyecto</b><p>Activa Google Analytics si lo deseas.</p></div>
  <div class="acad-step"><span>2</span><b>Authentication → Sign-in method → Email/Password</b><p>Habilita y agrega los correos de los primeros usuarios.</p></div>
  <div class="acad-step"><span>3</span><b>Firestore Database → Crear en modo producción</b><p>Elige región us-central1 para América Latina.</p></div>
  <div class="acad-step"><span>4</span><b>Configuración → Apps web → Copiar firebaseConfig al código del backend</b><p>Es el objeto con apiKey, projectId, etc. — se agrega al código fuente del backend/adapter, nunca a un formulario de la interfaz.</p></div>
</div>
<h3>Reglas de Firestore (producción)</h3>
<p>Nunca dejes el modo prueba en producción — permite acceso público sin autenticación. Define reglas que permitan lectura/escritura solo a usuarios autenticados con el rol correcto. El HANDOFF-DESARROLLO.md incluye las reglas por colección.</p>`},
         {id:'bt2',ic:'🤖',n:'Gemini: IA generativa en la plataforma',content:`
<h2>Conectar Gemini (Google AI) a CXOrbia — en el backend de producción</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Activar generación de contenido e IA real en los módulos que hoy usan heurística local.</p></div>
<p>Gemini impulsa: análisis crítico, generación de cuestionarios desde instructivos, propuestas, documentos con branding, clasificación de hallazgos e importador inteligente.</p>
<div class="acad-section" style="background:#fff7e6;border-color:#f5c344">⚠️ <b>Importante — esto NO se hace en el navegador del prototipo</b><p>Este prototipo <b>nunca</b> pide ni guarda una API key real de IA en su interfaz — cualquier campo de "proveedor preferido" que veas en Configuración solo guarda una preferencia local, no una conexión. Los pasos de abajo son para el <b>equipo de desarrollo del backend</b>, cuando construya el adapter real: la API key vive en el servidor (Secret Manager u equivalente), nunca en localStorage ni en un formulario que el usuario final pueda ver.</p></div>
<h3>Obtener API Key (para el backend, no para pegar aquí)</h3>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>aistudio.google.com → Get API Key → Create API key</b><p>La key tiene formato AIza...</p></div>
  <div class="acad-step"><span>2</span><b>El equipo de backend la guarda en el servidor (Secret Manager)</b><p>Nunca se pega en el navegador ni en un input de esta plataforma — el backend expone un endpoint propio que el frontend consume sin ver la key.</p></div>
</div>
<h3>Indicador "preferencia de IA" del prototipo</h3>
<p>El selector de proveedor en Configuración → Automatizaciones solo guarda qué proveedor prefiere la consultora para cuando exista el backend — es información de enrutamiento, no una conexión activa. El estado real (disponible/no disponible) lo determina exclusivamente el adapter del backend, nunca un checkbox en el navegador.</p>
<h3>Modelos recomendados</h3>
<ul>
<li><b>gemini-2.0-flash</b>: ultra rápido, ideal para análisis de cuestionarios, generación de contenido, clasificación. Usar por defecto.</li>
<li><b>gemini-2.0-flash-thinking</b>: para análisis financiero complejo, razonamiento profundo.</li>
</ul>
<h3>Límites del free tier</h3>
<p>~1,500 requests/día con gemini-flash. Para producción con 10+ usuarios activos, el plan pago ($0.075/1M tokens) cubre el uso normal sin problema.</p>`},
         {id:'bt3',ic:'🔗',n:'Make: automatizaciones y webhooks',content:`
<h2>Make: el motor de automatizaciones</h2>
<p>Make conecta CXOrbia con WhatsApp Business, correo, Google Sheets, Slack y cualquier API externa. La idea central es que CXOrbia nunca envía un WhatsApp directamente — solo dispara un evento con datos, y Make decide qué hacer con él. Esto significa que puedes cambiar la lógica de notificaciones (a quién avisar, por qué canal, con qué texto) sin tocar el código de la plataforma, editando solo el escenario en Make.</p>
<h3>Configuración básica</h3>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Crear cuenta en make.com</b><p>El plan gratuito tiene 1,000 operaciones/mes — suficiente para empezar.</p></div>
  <div class="acad-step"><span>2</span><b>Crear escenario → Webhooks → Custom webhook → Copiar URL</b><p>Esta URL va en Configuración → Automatizaciones → URL de Make.</p></div>
  <div class="acad-step"><span>3</span><b>Router por event.type</b><p>CXOrbia envía eventos JSON. Usa un Router en Make para separar: aprobacion, pago, alerta, visita_realizada, cuestionario, correo_wa.</p></div>
</div>
<h3>Por qué webhook por tenant, no uno global</h3>
<p>Cada consultora (tenant) configura su propia URL de Make. Esto evita que los eventos de un cliente lleguen al escenario de otro, y le permite a cada consultora personalizar sus propias reglas de notificación sin afectar a las demás — clave para que la plataforma sea multi-tenant de verdad.</p>`},
         {id:'bt4',ic:'📦',n:'Storage: archivos y evidencias',content:`
<h2>Firebase Storage: evidencias, PDFs y logos</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Guardar de forma segura evidencias, documentos y logos sin exponerlos públicamente.</p></div>
<h3>Activar Storage</h3>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Firebase Console → Storage → Comenzar</b><p>Selecciona la misma región que Firestore.</p></div>
  <div class="acad-step"><span>2</span><b>Configura reglas</b><p>Lectura autenticada; escritura solo en la ruta propia del usuario (/evidencias/uid/) o admin en /logos/.</p></div>
</div>
<h3>Estructura de carpetas</h3>
<ul>
<li><code>/logos/{tenantId}/</code> — logo de la consultora y clientes</li>
<li><code>/evidencias/{proyectoId}/{visitaId}/</code> — fotos del shopper</li>
<li><code>/documentos/{tenantId}/</code> — NDAs, instructivos, propuestas</li>
<li><code>/exportaciones/{tenantId}/</code> — PDFs y reportes generados</li>
</ul>
<h3>Costo estimado</h3>
<p>Free tier: 5 GB almacenamiento + 1 GB descarga/día. A partir de ahí: $0.026/GB/mes almacenado y $0.12/GB descargado — muy bajo para uso operativo típico.</p>`},
         {id:'bt5',ic:'❓',n:'Evaluación técnica de backend',tipo:'quiz',quiz:[
           {q:'¿Por qué se debe usar Firestore en modo producción desde el inicio y no en modo prueba?',o:['Porque el modo prueba es de pago','Porque el modo prueba permite acceso público sin autenticación — cualquier persona con la URL del proyecto puede leer y escribir todos los datos','Porque el modo prueba no soporta autenticación','Porque Gemini no funciona con el modo prueba'],a:1,exp:'El modo prueba de Firestore abre acceso total sin autenticación. Para datos operativos (shoppers, visitas, finanzas, clientes), esto es un riesgo de seguridad crítico. Siempre arranca en modo producción con reglas granulares desde el día 1.'},
           {q:'¿Qué información debe incluir el payload JSON que CXOrbia envía a Make al aprobar una postulación?',o:['Solo el ID del shopper','Solo el nombre de la visita','Un objeto completo con event.type, shopperNombre, shopperTelefono, sucursal, fecha, honorario y proyectoNombre','Solo el teléfono del shopper'],a:2,exp:'El payload debe ser completo para que Make no necesite hacer una segunda llamada a Firestore. Si solo mandas el ID de la visita, Make tiene que ir a buscar los datos de Firestore — eso agrega latencia, dependencia y complejidad. La regla de oro: el evento debe contener todo lo que el mensaje final (WhatsApp al shopper) necesita.'},
         ]}
       ]},
      /* ─── RUTA OPERATIVA (equipo ops) ─── */
      {id:'a_ops_conflicts_route',cat:'Operación',ic:'🎧',color:'#2a6fdb',n:'Equipo operativo: asignación, conflictos y fuera de rango',
       desc:'Tu ruta diaria: aprobar postulaciones, reasignar, resolver conflictos de HR y autorizar visitas fuera de rango — con estados honestos.',
       cert:false,mins:50,
       lessons:[
         {id:'ao1',ic:'🧩',n:'Gestión de postulaciones',content:`
<h2>De postulación a asignación</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que ninguna postulación quede sin gestionar, con el candidato correcto para cada visita.</p></div>
<p>Cada postulación que entra a tu bandeja representa a un shopper esperando una respuesta — mientras más rápido y criterioso seas gestionándola, mejor experiencia tiene el evaluador y menos riesgo de que la visita quede sin cubrir cerca de la fecha límite. Esta es tu rutina central del día.</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Revisar</b><p>Filtra por proyecto, país o estado. Cada postulación muestra quién la gestionó.</p></div>
  <div class="acad-step"><span>2</span><b>Aprobar / standby / rechazar</b><p>Al aprobar, la visita pasa a "asignada" y se prepara la notificación (pendiente confirmación).</p></div>
  <div class="acad-step"><span>3</span><b>Reasignar</b><p>Usa el buscador (país, certificación) para elegir otro shopper. Queda auditado.</p></div>
</div>
<h3>Cómo decidir entre varios candidatos</h3>
<p>Cuando más de un shopper se postula a la misma sucursal, prioriza por: certificación vigente para ese proyecto específico, rating histórico (visitas completas y a tiempo), cercanía geográfica declarada, y si ya conoce el instructivo de ese cliente por visitas anteriores. No hay una regla única correcta — usa criterio, pero sé consistente para no generar percepción de favoritismo.</p>
<div class="acad-section"><b>Sin duplicar</b><p>Si gestionas desde la plataforma y desde la HR, verifica que la visita quede con un solo gestor. El sync real lo resuelve el backend por llave natural.</p></div>`},
         {id:'ao2',ic:'⚠️',n:'Conflictos y sincronía de HR',content:`
<h2>Cuando la HR y la plataforma no coinciden</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Detectar y resolver conflictos de datos entre HR externa y la plataforma sin perder información.</p></div>
<p>Cuando un cliente gestiona su hoja de ruta en Google Sheets o Excel EN VIVO, y tu equipo también opera desde la plataforma, es cuestión de tiempo antes de que ambos lados intenten cambiar el mismo registro casi al mismo tiempo (por ejemplo: tú reasignas un shopper en la plataforma, mientras alguien en el cliente edita la misma fila en la hoja). Esto es un <b>conflicto de sincronía</b>, no un error — es esperable en cualquier integración de dos vías.</p>
<p>La sincronía con hoja de ruta externa (Google Sheets/Excel) queda <b>pendiente de backend</b>. Mientras tanto, tu trabajo es NO dejar que un conflicto pase desapercibido:</p>
<ul class="acad-check">
<li>Revisa el panel de incidencias de la Fuente de HR</li>
<li>Un conflicto (held_for_conflict) se retiene hasta reconciliar</li>
<li>No fuerces liquidación de una visita en conflicto</li>
<li>Deja nota del criterio con que resolviste</li>
</ul>
<h3>Cómo se ve un conflicto resuelto correctamente</h3>
<p>Confirmas cuál de las dos versiones es la correcta (normalmente preguntando directamente a quien hizo el cambio más reciente), documentas el motivo en la nota, y solo entonces liberas la visita para continuar su flujo normal. Nunca se resuelve "a ojo" comparando qué versión se ve más completa — eso es exactamente lo que la política de "no dedupe visual" prohíbe en todo el sistema.</p>
<blockquote>Los estados "sincronizada / actualizada" reales dependen del gate de backend. En preview verás "preparado · pendiente backend".</blockquote>`},
         {id:'ao3',ic:'📍',n:'Visitas fuera de rango',content:`
<h2>Autorizar (o no) una visita fuera de rango</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Decidir con criterio cuándo un atraso es responsabilidad del shopper y cuándo no.</p></div>
<p>Cada proyecto define un rango de tiempo aceptable entre la fecha agendada y la fecha real de ejecución (por ejemplo, ±3 días). Una visita realizada fuera de ese rango no se rechaza automáticamente — pasa a tu bandeja para que decidas si se autoriza, porque puede haber una razón legítima detrás del atraso.</p>
<h3>Antes de decidir, pregunta</h3>
<ul>
<li>¿El atraso fue por causa del shopper (falta de planeación, olvido) o por algo fuera de su control?</li>
<li>¿La sucursal estaba cerrada, en remodelación, o el cliente canceló y reprogramó tarde?</li>
<li>¿Es un patrón repetido de este shopper, o un caso aislado?</li>
</ul>
<div class="acad-section"><b>Regla de puntaje</b><p>Solo penaliza al shopper si la causa es suya. Si la causa es del cliente, local cerrado o fuerza mayor, se autoriza sin penalización, con motivo y responsable registrados.</p></div>
<p>Registrar el motivo no es un trámite burocrático: es lo que te protege a ti si el cliente pregunta después por qué una visita se aceptó fuera de fecha, y es lo que te permite detectar patrones (un shopper que siempre se atrasa, una sucursal que siempre cancela) para actuar a tiempo.</p>`},
         {id:'ao4',ic:'❓',n:'Evaluación operativa',tipo:'quiz',quiz:[
           {q:'Una visita está en conflicto (HR vs plataforma). ¿La liquidas?',o:['Sí, de inmediato','No: se retiene hasta reconciliar','Solo si el shopper insiste'],a:1,fb:'Un conflicto se retiene (held_for_conflict) hasta reconciliar. No se liquida forzado.'},
           {q:'Apruebas una postulación. ¿El shopper ya recibió WhatsApp?',o:['Sí, automático','No: la notificación queda preparada, pendiente de confirmación/gate','Depende del país'],a:1,fb:'La notificación se prepara; el envío real depende del gate de backend.'},
         ]},
       ]},
      /* ─── FRANQUICIA / COORDINACIÓN ─── */
      {id:'a_coord',cat:'Franquicia',ic:'🌎',color:'#0891b2',n:'Coordinador, Representante y Aliado: administra tu región',
       desc:'La herramienta que la consultora te da para gestionar proyectos, HR, shoppers y liquidaciones de tu territorio.',cert:true,mins:70,
       lessons:[
         {id:'co1',ic:'🧭',n:'Tu rol en el ecosistema',content:`
<h2>Coordinador / Representante / Aliado: qué eres y qué no</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Darte control real de la operación de tu territorio, sin depender de hojas de cálculo sueltas.</p></div>
<p>Eres el brazo operativo de la consultora en tu territorio. Antes, gestionar proyectos regionales significaba hojas de cálculo sueltas y correos; ahora tienes una plataforma que centraliza tu operación local con la misma potencia que usa la casa matriz — pero con alcance limitado a lo tuyo.</p>
<h3>Diferencias entre los tres roles</h3>
<div class="acad-cards">
  <div class="acad-card"><div>🧭</div><b>Coordinador</b><p>Gestiona la operación de un país o región asignada: HR, asignaciones, seguimiento. Empleado o contratado de la consultora.</p></div>
  <div class="acad-card"><div>🤝</div><b>Representante</b><p>Enfocado en lo comercial: prospecta, presenta propuestas y representa la marca en su zona.</p></div>
  <div class="acad-card"><div>🏢</div><b>Aliado / Franquiciado</b><p>Opera proyectos delegados de forma semi-autónoma, factura localmente y liquida a sus propios shoppers bajo la metodología de la consultora.</p></div>
</div>
<h3>Alcance por país (scope)</h3>
<p>Tu acceso está limitado por país: solo ves y gestionas las visitas, HR, shoppers y clientes de tu(s) territorio(s) asignado(s). No ves la operación de otras regiones. Toda tu gestión queda registrada con tu nombre para trazabilidad (bitácora de auditoría).</p>`},
         {id:'co2',ic:'🗺️',n:'Administrar tu HR y asignaciones',content:`
<h2>La hoja de ruta de tu territorio</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Centralizar qué sucursales de tu región se evalúan, con qué shopper y cuándo.</p></div>
<p>Tu día a día gira en torno a la Hoja de Ruta (HR) de tu región. Puede vivir en la plataforma o en un Google Sheet colaborativo — en ambos casos, la ves y la gestionas desde CXOrbia.</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Recibes o cargas la HR</b><p>La casa matriz te asigna las visitas de tu país, o tú cargas la HR de tu programa local vía importador inteligente.</p></div>
  <div class="acad-step"><span>2</span><b>Publicas visitas</b><p>Las visitas quedan disponibles para que tus shoppers se postulen o reserven.</p></div>
  <div class="acad-step"><span>3</span><b>Asignas</b><p>Apruebas postulaciones o asignas manualmente. El shopper recibe notificación automática.</p></div>
  <div class="acad-step"><span>4</span><b>Das seguimiento</b><p>Vigilas atrasos, cuestionarios pendientes y avance vs meta de TU región desde el dashboard filtrado.</p></div>
</div>
<div class="acad-section">⚠️ <b>Anti-duplicación:</b> si trabajas la HR en Google Sheets y también en la plataforma, el sistema reconcilia por llave natural — no se duplica aunque asignes en ambos lados.</div>
<p>Esta flexibilidad es intencional: muchos coordinadores llevan años trabajando en Excel/Sheets con su propio equipo y no quieren abandonar ese flujo de golpe. CXOrbia te deja seguir operando como ya sabes mientras te da, sin esfuerzo adicional, el dashboard, los KPIs y la trazabilidad que antes no tenías.</p>`},
         {id:'co3',ic:'💵',n:'Liquidar honorarios y cruzar cuentas',content:`
<h2>Control financiero de tu operación local</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Pagar correctamente a tu red de shoppers y mantener cuentas claras con la casa matriz.</p></div>
<p>Si tu modelo es de aliado/franquiciado, gestionas el dinero de tu territorio: pagas a tus shoppers y cruzas cuentas con la casa matriz.</p>
<h3>Liquidación a tus shoppers</h3>
<ul>
<li>Cada visita realizada y con cuestionario aprobado genera una liquidación (honorario + reembolso).</li>
<li>Agrupas las liquidaciones validadas en un <b>lote de pago</b> y pagas por quincena.</li>
<li>La fecha estimada de pago se calcula automáticamente (viernes + días configurados tras el submit).</li>
</ul>
<h3>Cruce con la casa matriz</h3>
<p>Cuando facturas localmente un programa, registras el ingreso; cuando recibes o envías remesas a la casa matriz, las concilias. El módulo financiero mantiene separadas tus comisiones/honorarios de los financiamientos, para que sepas exactamente tu margen real por proyecto.</p>
<p>Esta separación te protege de un error común en operaciones regionales: confundir un anticipo o financiamiento de la casa matriz con ingreso real del negocio, lo que infla artificialmente tu margen aparente hasta que el dinero tiene que devolverse.</p>`},
         {id:'co4',ic:'🤝',n:'Prospectar y presentar propuestas (Representante)',content:`
<h2>Vender en tu territorio con respaldo de la consultora</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Convertir prospectos en clientes usando las mismas herramientas comerciales de la casa matriz.</p></div>
<p>Como representante, usas el CRM y la calculadora de costos para convertir prospectos en clientes, con la metodología y la marca de la consultora.</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Registra el prospecto</b><p>En el CRM, como lead, con sus datos y la fuente.</p></div>
  <div class="acad-step"><span>2</span><b>Releva la necesidad</b><p>Reúnete, entiende qué quiere medir, cuántas sucursales, qué frecuencia.</p></div>
  <div class="acad-step"><span>3</span><b>Calcula y propón</b><p>Usa la calculadora de costos y genera la propuesta desde plantilla o con IA. Queda vinculada a la ficha del cliente.</p></div>
  <div class="acad-step"><span>4</span><b>Da seguimiento con cadencia</b><p>Registra actividades y recordatorios. No dejes enfriar la oportunidad.</p></div>
</div>
<p>Todo lo que produces (propuestas, actividades, correos) queda en la ficha 360 del cliente, visible para ti y para la casa matriz según los permisos.</p>`},
         {id:'co5',ic:'❓',n:'Evaluación de coordinación',tipo:'quiz',quiz:[
           {q:'Como coordinador de Honduras, ¿qué operación puedes ver y gestionar en la plataforma?',o:['Toda la operación de todos los países de la consultora','Solo las visitas, HR, shoppers y clientes de Honduras (tu territorio asignado)','Solo las visitas que tú creaste','Solo el módulo financiero'],a:1,exp:'Tu rol tiene scope por país: ves y gestionas únicamente la operación de tu(s) territorio(s) asignado(s) — en este caso Honduras. No accedes a la operación de otras regiones. Esto permite a la consultora delegar la gestión regional sin exponer toda la base de datos, y mantiene la trazabilidad de quién gestionó cada acción en tu zona.'},
           {q:'Trabajas la HR de tu región en un Google Sheet compartido, pero también apruebas postulaciones en la plataforma. ¿Qué pasa con los datos?',o:['Se duplican y tienes que borrar manualmente','El sistema reconcilia por llave natural (documento del shopper + id de visita) y no duplica, aunque gestiones en ambos lados','Debes elegir solo uno de los dos','La plataforma bloquea el Google Sheet'],a:1,exp:'CXOrbia usa una llave natural inmutable para reconciliar la HR externa con la plataforma. Aunque asignes una visita en el Google Sheet y la apruebes también en la plataforma, el sistema reconoce que es el mismo registro y no lo duplica. Esto te permite mantener tu forma de trabajo colaborativa en Sheets mientras aprovechas la inteligencia y los KPIs de la plataforma.'},
         ]}
       ]},
    ],
    shopper:[
      /* ─── RUTA OPERATIVA DEL SHOPPER (paso a paso) ─── */
      {id:'s_ruta',cat:'Inducción',ic:'🧭',color:'#10b981',n:'Tu ruta operativa: de la oferta al pago',
       desc:'Cada pantalla que usarás, en orden: agendar, reprogramar, realizar, cuestionario, beneficios y privacidad.',
       cert:false,mins:45,
       lessons:[
         {id:'sr1',ic:'📅',n:'Agendar y reprogramar',content:`
<h2>De visita disponible a agendada</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Convertir una visita disponible en un compromiso con fecha y hora. Vive en <b>Visitas Disponibles</b> y <b>Mis Visitas</b>.</p></div>
<p>Este es el punto de entrada a cualquier trabajo: sin agendar correctamente, no hay visita que ejecutar ni honorario que cobrar. Vale la pena dominar esta pantalla desde el primer día.</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Visitas disponibles</b><p>Ves ofertas de TODOS los proyectos. Filtra por país, quincena o escenario.</p></div>
  <div class="acad-step"><span>2</span><b>Postularte / reservar</b><p>Te postulas a la sucursal que quieras. Queda "pendiente" hasta que el equipo apruebe.</p></div>
  <div class="acad-step"><span>3</span><b>Agendar</b><p>Cuando te aprueban, eliges fecha y franja dentro del rango permitido.</p></div>
</div>
<h3>Reprogramar</h3>
<p>Si necesitas cambiar la fecha, pulsa <b>"Solicitar reprogramación"</b> desde la visita, elige la nueva fecha propuesta, escribe el motivo y pulsa <b>"Enviar solicitud"</b>. El equipo autoriza la nueva fecha o conserva la anterior. <b>Una reprogramación justificada no afecta tu puntaje.</b> Avisa con la mayor anticipación posible: una reprogramación de último minuto es más difícil de aprobar y puede dejar la sucursal sin cobertura si nadie más puede cubrirla a tiempo.</p>
<div class="acad-section">⚠️ <b>Fuera de rango:</b> si agendas fuera del rango autorizado, requiere aprobación. Solo penaliza si la causa es tuya.</div>
<h3>Cómo elegir bien tus visitas</h3>
<p>No te postules a todo lo que veas: revisa el honorario, la distancia real desde tu ubicación, y si la franja horaria es compatible con tu disponibilidad real. Postularte a una visita que luego no puedes cumplir daña tu rating más que no postularte en absoluto.</p>`},
         {id:'sr2',ic:'✅',n:'Realizar la visita y evidencias',content:`
<h2>El día de la visita</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Convertir tu visita en evidencia verificable, no solo en una narrativa de tu palabra.</p></div>
<p>Las evidencias no son un formalismo — son la prueba objetiva de que la visita ocurrió tal como la reportas. Sin evidencia correcta, tu cuestionario puede ser devuelto para corrección o incluso rechazado, retrasando tu pago.</p>
<h3>Botones que usarás</h3>
<ul class="acad-check">
<li>Pulsa <b>"Confirmar realizada"</b> cuando termines — esto habilita el cuestionario.</li>
<li>Adjunta las evidencias que pida el escenario (foto, foto geolocalizada, audio o video)</li>
<li>Si el add-on de geolocalización está activo, la foto lleva GPS + fecha/hora automáticos</li>
<li>Pulsa <b>"📝 Llenar cuestionario"</b> (o "Abrir cuestionario" si es externo) para completar el reporte</li>
</ul>
<h3>Errores comunes que retrasan tu cuestionario</h3>
<ul>
<li>Foto borrosa o tomada desde muy lejos, donde no se distingue el criterio evaluado.</li>
<li>Evidencia de audio/video cuando el escenario pedía solo foto (o viceversa).</li>
<li>Marcar "realizada" pero dejar el cuestionario para otro día — cuanto más tiempo pasa, más detalles olvidas y menos preciso es tu reporte.</li>
</ul>
<div class="acad-section"><b>Modal al marcar realizada</b><p>Al marcar realizada aparece el botón del cuestionario y el contacto de evidencias. No cierres sin completar el cuestionario.</p></div>`},
         {id:'sr3',ic:'📝',n:'Cuestionario: realizado/completado',content:`
<h2>Completar el cuestionario</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Registrar tu observación de forma estructurada — es lo que genera tu score y tu liquidación.</p></div>
<p>Según el proyecto, el cuestionario puede ser <b>interno</b> (formulario en la plataforma) o <b>externo por link</b> (general o propio de cada visita, desde la hoja de ruta). Ninguno de los dos es "más importante" que el otro — ambos alimentan el mismo score y la misma liquidación, solo cambia dónde lo llenas.</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Abrir</b><p>Si es externo, pulsa "🌐 Abrir cuestionario" con el link de ESTA visita. Si falta el link, avisa a soporte; no uses otro formulario.</p></div>
  <div class="acad-step"><span>2</span><b>Completar</b><p>Responde con evidencia y narrativa objetiva.</p></div>
  <div class="acad-step"><span>3</span><b>Marcar realizado/completado</b><p>Pulsa "✅ Enviar cuestionario" (interno) o "✅ Marcar cuestionario realizado" (externo). El cuestionario queda "realizado/completado". Luego pasa a revisión del equipo.</p></div>
</div>
<h3>Cómo escribir una buena narrativa</h3>
<p>Cuando el cuestionario pide un comentario abierto, describe hechos concretos y en orden cronológico ("el asesor saludó al entrar, preguntó el motivo de mi visita, tardó 4 minutos en ofrecer una solución") en vez de juicios generales ("la atención fue mala"). Una narrativa concreta es la que realmente ayuda al cliente a mejorar, y es la que evita que tu cuestionario sea devuelto por falta de detalle.</p>
<blockquote>El texto correcto es "realizado/completado", no "enviado". Después de tu cuestionario viene la revisión del admin antes de cualquier liquidación.</blockquote>`},
         {id:'sr4',ic:'💰',n:'Mis Beneficios y privacidad',content:`
<h2>Cobrar y proteger tus datos</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que veas exactamente en qué etapa está tu pago, sin tener que preguntar. Vive en <b>Mis Beneficios</b>.</p></div>
<p>En <b>Mis Beneficios</b> ves tus honorarios, reembolsos y el estado de cada pago con su fecha estimada. Esta pantalla existe para que nunca tengas que preguntar "¿ya me pagaron?" por WhatsApp — el estado siempre está a la vista, actualizado.</p>
<div class="acad-section"><b>Estados honestos</b><p>Un pago no dice "pagado" hasta el cruce financiero real. Antes verás "candidata / preview / pendiente".</p></div>
<h3>Tus datos bancarios</h3>
<p>Registra tus datos bancarios en tu perfil para agilizar pagos. <b>Son datos sensibles:</b> se protegen y solo se referencian de forma opaca. La plataforma nunca los expone públicamente. Un dato bancario mal escrito (número de cuenta con un dígito equivocado, nombre del titular distinto al de la cuenta) es la causa más común de retraso en pagos — revísalo con cuidado la primera vez que lo cargas.</p>
<h3>Checklist antes de tu primera visita</h3>
<ul class="acad-check">
<li>Perfil completo (nombre, documento, WhatsApp)</li>
<li>Datos bancarios registrados</li>
<li>Certificación del proyecto aprobada</li>
</ul>`},
         {id:'sr5',ic:'❓',n:'Evaluación de tu ruta',tipo:'quiz',quiz:[
           {q:'Reprogramas una visita con causa justificada. ¿Afecta tu puntaje?',o:['Sí, siempre','No, una reprogramación justificada no penaliza','Solo si es fin de semana'],a:1,fb:'Una reprogramación justificada no penaliza. Solo penaliza lo que es responsabilidad del shopper.'},
           {q:'El proyecto usa cuestionario externo por link y falta el link de tu visita. ¿Qué haces?',o:['Uso cualquier formulario interno','Aviso a soporte y espero el link de esa visita','Invento las respuestas'],a:1,fb:'Nunca uses otro formulario. Avisa a soporte; el link correcto es el de esa visita, desde la hoja de ruta.'},
           {q:'En Mis Beneficios, un pago aparece como "candidata". ¿Ya te pagaron?',o:['Sí','No: es preview, el pago real depende del cruce financiero','Depende del país'],a:1,fb:'"Candidata/preview" no es pago confirmado. El pago real ocurre con el cruce financiero del backend.'},
         ]},
       ]},
      {id:'s_ind',cat:'Inducción',ic:'🕵️',color:'#10b981',n:'Inducción del evaluador incógnito',
       desc:'Tu rol, las reglas de oro, el anonimato y cómo crecer profesionalmente.',
       cert:true,mins:60,
       lessons:[
         {id:'si1',ic:'🎯',n:'Tu rol y responsabilidad',content:`
<h2>Ser evaluador incógnito</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que entiendas por qué el anonimato y la objetividad no son opcionales, sino la base de tu credibilidad.</p></div>
<p>Eres el <strong>cliente invisible</strong> que mide la experiencia real. Tu trabajo impacta directamente en decisiones de negocio de grandes marcas.</p>
<h3>Las 4 reglas de oro</h3>
<div class="acad-cards">
  <div class="acad-card"><div>🔒</div><b>Anonimato total</b><p>Nunca reveles tu rol. Ni antes, ni durante, ni al salir.</p></div>
  <div class="acad-card"><div>📊</div><b>Objetividad</b><p>Reporta hechos, no interpretaciones ni opiniones.</p></div>
  <div class="acad-card"><div>📸</div><b>Evidencia</b><p>Respalda cada hallazgo con el tipo de evidencia que pide el escenario.</p></div>
  <div class="acad-card"><div>⏱️</div><b>Mismo día</b><p>El cuestionario se completa el mismo día. Sin excepciones.</p></div>
</div>
<h3>¿Por qué importa el anonimato?</h3>
<p>Si el personal sabe que está siendo evaluado, modifica su comportamiento. La medición pierde validez. El cliente paga por ver la realidad, no un performance. Tu credibilidad como evaluador depende de mantener el anonimato impecable.</p>
<p>Piensa en tu rol como el de un auditor silencioso: no estás ahí para "atrapar" a nadie ni para regalar una buena calificación por simpatía — estás ahí para producir un dato que, sumado al de cientos de otras visitas, le dice a la empresa dónde está fallando su servicio y dónde está funcionando bien de verdad.</p>`},
         {id:'si2',ic:'📋',n:'El flujo de una visita',content:`
<h2>De la reserva al cobro — paso a paso</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que veas el camino completo de una visita, de principio a fin, antes de tu primera vez.</p></div>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Ver la oferta</b><p>Visitas Disponibles muestra TODAS las visitas de todos los proyectos. Filtra por proyecto, quincena, escenario o ciudad.</p></div>
  <div class="acad-step"><span>2</span><b>Reservar o postular</b><p>En Reservas puedes pedir con anticipación la sucursal que prefieres para el próximo periodo. En Visitas Disponibles te postulas para visitas activas.</p></div>
  <div class="acad-step"><span>3</span><b>Certificarte</b><p>Antes de tu primera visita de un proyecto, aprueba la certificación. El material está en Academia → Inducción del evaluador.</p></div>
  <div class="acad-step"><span>4</span><b>Agendar</b><p>Mis Visitas → Agendar → elige fecha y franja. El equipo recibe notificación automática.</p></div>
  <div class="acad-step"><span>5</span><b>Realizar</b><p>Ejecuta la visita siguiendo el instructivo. Marca "Realizada" en la plataforma el mismo día.</p></div>
  <div class="acad-step"><span>6</span><b>Cuestionario</b><p>Llena todos los campos con tus observaciones y adjunta la evidencia requerida. El score se calcula automáticamente.</p></div>
  <div class="acad-step"><span>7</span><b>Enviar y cobrar</b><p>Submit → tu liquidación nace automáticamente. Revisa en Mis Beneficios el estado y la fecha estimada de pago.</p></div>
</div>`},
         {id:'si3',ic:'⭐',n:'Tus OKRs y cómo crecer',content:`
<h2>Sistema de crecimiento del evaluador</h2>
<p>CXOrbia mide tu desempeño con 4 indicadores (OKRs). Cumplirlos consistentemente sube tu <strong>calificación (★)</strong>, que define tu acceso a más visitas y mejores honorarios.</p>
<h3>Tus 4 OKRs</h3>
<ul>
<li><b>Efectividad ≥ 90%</b>: visitas realizadas / asignadas. Si te asignan 10 visitas al mes, debes realizar al menos 9.</li>
<li><b>Cuestionarios completos ≥ 95%</b>: cuestionarios enviados / visitas realizadas. No dejes cuestionarios pendientes.</li>
<li><b>Envíos a tiempo ≥ 90%</b>: cuestionarios enviados el mismo día de la visita.</li>
<li><b>Calificación (★)</b>: se calcula de las 3 anteriores. Sube gradualmente con buen desempeño.</li>
</ul>
<h3>Beneficios de una ★ alta</h3>
<ul>
<li>Primer acceso a visitas nuevas antes que otros evaluadores.</li>
<li>Acceso a programas con honorarios preferentes.</li>
<li>Menor tasa de rechazos de postulaciones.</li>
<li>Convocatorias especiales para visitas de mayor complejidad y pago.</li>
</ul>
<p>Piensa en tu calificación como tu currículum dentro de la plataforma: se construye visita a visita, y una mala racha (varias reprogramaciones sin motivo, cuestionarios tarde) puede costarte semanas de recuperación. Vigílala como vigilarías cualquier reputación profesional.</p>`},
         {id:'si4',ic:'❓',n:'Evaluación de inducción',tipo:'quiz',quiz:[
           {q:'Un asesor de tienda te pregunta directamente: "¿Eres evaluador de mystery shopping?" ¿Qué haces?',o:['Dices la verdad, porque la honestidad es un valor','Niegas ser evaluador y continúas la visita como cualquier cliente real','Sales inmediatamente de la tienda y reportas la situación','Llamas al equipo desde la tienda para preguntar cómo proceder'],a:1,exp:'Niegas tu rol y continúas con naturalidad. El anonimato es la base del servicio: si confirmas que eres evaluador, el personal cambia su comportamiento, la medición pierde validez y el cliente no obtendrá información real. Después de la visita, puedes reportar al equipo que sospechan de tu identidad para que lo consideren en futuras visitas.'},
           {q:'¿Desde cuándo debes cronometrar el "tiempo de espera"?',o:['Desde que ves a un asesor disponible','Desde que llegas al establecimiento','Desde que ingresas a la fila o zona de atención del servicio','Desde que el asesor te comienza a atender'],a:2,exp:'El tiempo de espera se mide desde que el cliente ingresa a la fila o zona de atención, no desde que llega al mostrador. Medirlo desde el mostrador subestima la experiencia real del cliente, que comenzó a esperar mucho antes. Esta distinción es crítica porque determina si el estándar de servicio se cumplió o no.'},
           {q:'Tu OKR de efectividad está en 82% (meta: 90%). ¿Cuál es la causa más probable y qué debes hacer?',o:['El equipo está asignando mal las visitas — no es tu problema','Has cancelado o no realizado visitas asignadas. Debes reducir las postulaciones a lo que puedas cumplir y comunicar al equipo cualquier impedimento con anticipación','Es un error del sistema','El OKR de 90% es imposible de alcanzar'],a:1,exp:'Una efectividad de 82% (vs. meta 90%) significa que de 10 visitas asignadas, solo realizas 8.2. Las causas más comunes: te postulas a más visitas de las que puedes realizar, o cancelas sin previo aviso. La solución: postula solo a lo que puedas comprometer, y si surge un impedimento, notifica al equipo antes de la fecha agendada para que puedan reasignar a tiempo.'},
         ]}
       ]},
      /* ── Shopper: Cuestionario ── */
      {id:'s_cuest',cat:'Operación',ic:'📋',color:'#3b82f6',n:'El cuestionario: llenarlo bien',
       desc:'Tipos de pregunta, evidencias requeridas, tiempos, score y errores comunes.',cert:false,mins:30,
       lessons:[
         {id:'sc1',ic:'📝',n:'Tipos de pregunta y cómo responder',content:`
<h2>Tipos de pregunta en el cuestionario</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que tu observación se traduzca en datos comparables, no en opiniones sueltas.</p></div>
<div class="acad-cards">
  <div class="acad-card"><div>⭐</div><b>Escala 1–5</b><p>Calificas del 1 al 5. Usa el RANGO COMPLETO: 1 y 2 para fallas claras, 4 y 5 para cumplimiento, 3 solo cuando es genuinamente intermedio.</p></div>
  <div class="acad-card"><div>✅</div><b>Sí / No</b><p>La respuesta es binaria. ¿Se cumplió o no se cumplió? No hay término medio. Sé preciso.</p></div>
  <div class="acad-card"><div>🔢</div><b>Numérico</b><p>Registra el valor exacto (tiempo en minutos, precio observado, número de personas en fila).</p></div>
  <div class="acad-card"><div>📝</div><b>Texto abierto</b><p>Describe con precisión lo que observaste: qué dijo el asesor, qué acción realizó, qué faltaba. Evita opiniones subjetivas.</p></div>
</div>
<h3>El principio de la evidencia observable</h3>
<p>Reporta solo lo que VISTE o ESCUCHASTE, no lo que interpretaste o asumiste. "El asesor no saludó al ingresar" es observable. "El asesor no quería trabajar" es una interpretación. Este principio es la diferencia entre un cuestionario que el cliente puede usar para tomar decisiones y uno que le genera dudas sobre tu objetividad.</p>`},
         {id:'sc2',ic:'📸',n:'Evidencias: cuándo y cómo',content:`
<h2>Evidencias: la prueba de lo que evaluaste</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Respaldar tu reporte con prueba verificable, no solo tu palabra.</p></div>
<p>El instructivo especifica qué evidencia requiere cada pregunta. No improvises — entrega exactamente lo que se pide. La evidencia es lo que convierte tu narrativa en un hecho verificable en vez de "la palabra de alguien"; sin ella, cualquier hallazgo puede ser cuestionado por la sucursal evaluada.</p>
<h3>Tipos de evidencia</h3>
<ul>
<li><b>📸 Foto</b>: toma la foto con discreción. Usa el celular naturalmente (simula revisar mensajes). La foto debe mostrar claramente el elemento evaluado.</li>
<li><b>🧾 Ticket/recibo</b>: consérvalo siempre. Es prueba de que realizaste la compra o consumo.</li>
<li><b>🎥 Video</b>: solo si el escenario lo pide y puedes grabarlo sin revelar tu identidad.</li>
<li><b>⏱️ Captura de tiempo</b>: screenshot del reloj del celular mostrando hora de inicio y hora de atención.</li>
<li><b>📄 Documento entregado</b>: folletería, cotizaciones, NDAs que te hayan dado.</li>
</ul>
<h3>Errores comunes en evidencias</h3>
<ul>
<li>❌ Foto borrosa o con el dedo en el lente.</li>
<li>❌ Foto que no muestra el elemento evaluado.</li>
<li>❌ No guardar el ticket después de pagar.</li>
<li>❌ Tomar foto cuando el personal te ve — rompe el anonimato.</li>
</ul>`},
         {id:'sc3',ic:'⚠️',n:'Errores comunes y cómo evitarlos',content:`
<h2>Los 7 errores más frecuentes de los evaluadores</h2>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Llenar el cuestionario de memoria al día siguiente</b><p>El plazo es el mismo día. La memoria falla en detalles críticos (tiempos exactos, frases textuales). Si no puedes completarlo inmediatamente, toma notas físicas durante la visita.</p></div>
  <div class="acad-step"><span>2</span><b>Usar siempre el puntaje intermedio (3 de 5)</b><p>El 3 está sobre-utilizado. Si el criterio se cumplió claramente → 4 o 5. Si falló claramente → 1 o 2. El 3 es para casos genuinamente ambiguos.</p></div>
  <div class="acad-step"><span>3</span><b>Confundir tu experiencia subjetiva con el criterio</b><p>"No me gustó el servicio" ≠ "El asesor no cumplió el protocolo de saludo". El cuestionario mide comportamientos específicos, no tu satisfacción personal.</p></div>
  <div class="acad-step"><span>4</span><b>Olvidar cronometrar los tiempos</b><p>El tiempo de espera es uno de los criterios más frecuentes. Activa el cronómetro del celular desde que entras a la zona de atención.</p></div>
  <div class="acad-step"><span>5</span><b>No adjuntar las evidencias requeridas</b><p>Una visita sin evidencias puede ser rechazada. Revisa el instructivo ANTES de la visita para saber qué necesitas capturar.</p></div>
</div>`},
         {id:'sc4',ic:'❓',n:'Evaluación del cuestionario',tipo:'quiz',quiz:[
           {q:'¿Cuándo debes completar el cuestionario después de tu visita?',o:['Al día siguiente, cuando tienes más tiempo y calma','El mismo día de la visita, mientras los detalles están frescos','Dentro de los 3 días siguientes','Puedes esperar hasta el cierre de la quincena'],a:1,exp:'El cuestionario debe completarse el mismo día. La memoria humana decae rápidamente — los detalles específicos (qué dijo exactamente el asesor, tiempos en segundos, número de personas en fila) se pierden o se confunden con otras experiencias si esperas. Además, las evidencias (foto, ticket, cronómetro) solo son válidas si se adjuntan en el contexto correcto de esa visita.'},
           {q:'En una pregunta de Escala 1-5, el asesor saludó pero con tono indiferente, sin sonrisa ni contacto visual. ¿Qué puntaje asignas?',o:['5 — saludó, criterio cumplido','3 — fue intermedio, ni muy bien ni muy mal','2 — el saludo existió pero fue deficiente en forma y actitud','1 — no saludó'],a:2,exp:'La respuesta correcta es 2. El criterio no es solo "¿hubo saludo?" sino "¿el saludo cumplió el estándar de servicio?". Un saludo indiferente, sin contacto visual ni sonrisa, generalmente no cumple el protocolo de bienvenida. Un 5 sería para un saludo cálido, con nombre y bienvenida genuina. Un 3 sería para un saludo neutro pero correcto. Un 2 refleja que existió el gesto mínimo pero sin calidad.'},
         ]}
       ]},
      /* ── Shopper: Certificación ── */
      {id:'s_cert',cat:'Inducción',ic:'🏅',color:'#f59e0b',n:'Certificación: prepárate y aprueba',
       desc:'Qué evalúa el examen, cómo prepararte, qué pasa si no apruebas y cómo recertificarte.',cert:false,mins:20,
       lessons:[
         {id:'sct1',ic:'🎯',n:'Para qué sirve la certificación',content:`
<h2>¿Por qué existe la certificación?</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Garantizar que todos los evaluadores midan con el mismo criterio antes de dejarlos operar un proyecto.</p></div>
<p>La certificación garantiza que todos los evaluadores de un programa aplican los mismos criterios de la misma manera. Sin calibración, dos evaluadores en la misma sucursal pueden dar puntajes muy diferentes — los datos dejan de ser comparables.</p>
<h3>¿Qué se evalúa en la certificación?</h3>
<ul>
<li>Conocimiento del instructivo del proyecto (protocolo del cliente).</li>
<li>Correcta interpretación de cada criterio del cuestionario.</li>
<li>Procedimiento de la visita (anonimato, tiempos, documentación).</li>
<li>Manejo de situaciones especiales (asesor que te reconoce, visita interrumpida, etc.).</li>
</ul>
<h3>¿Cuándo debes certificarte?</h3>
<p>Antes de tu primera visita de cualquier proyecto nuevo. Si ya estás certificado en un proyecto pero cambia el cuestionario o el protocolo, recibirás notificación de recertificación.</p>
<h3>¿Qué pasa si no apruebas?</h3>
<p>Tienes intentos adicionales. No perderás visitas asignadas por un primer intento fallido — el sistema permite reintento. Lee el feedback de cada pregunta fallida antes de reintentar.</p>
<p>Piensa en la certificación como una inversión, no un obstáculo: el tiempo que dediques a entender bien el instructivo se traduce directamente en cuestionarios mejor llenados, menos correcciones pedidas por el equipo, y un ciclo de pago más rápido porque tu trabajo no necesita revisión adicional.</p>`},
         {id:'sct2',ic:'📚',n:'Cómo prepararte para el examen',content:`
<h2>Estrategia para aprobar la certificación</h2>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Lee el instructivo del proyecto (si está disponible)</b><p>El instructivo es la fuente primaria. El examen pregunta sobre lo que está ahí, no sobre experiencia general. Léelo al menos dos veces.</p></div>
  <div class="acad-step"><span>2</span><b>Haz los cursos de la Academia en orden</b><p>Los cursos de Inducción y Operación tienen exactamente el contenido que cubre el examen. No saltes lecciones.</p></div>
  <div class="acad-step"><span>3</span><b>Presta atención a los "quizzes" de cada lección</b><p>Las preguntas de los quizzes de la Academia son similares en estilo y dificultad a las del examen real de certificación.</p></div>
  <div class="acad-step"><span>4</span><b>Antes de intentar la cert, revisa las lecciones que fallaste</b><p>El sistema te muestra en qué lecciones tuviste más errores en los quizzes. Úsalo como guía.</p></div>
</div>`},
         {id:'sct3',ic:'❓',n:'Evaluación: certificación',tipo:'quiz',quiz:[
           {q:'¿Qué ocurre si repruebas el primer intento de certificación?',o:['Quedas bloqueado permanentemente del proyecto','Tienes que esperar 30 días para volver a intentar','Tienes intentos adicionales — lee el feedback de las preguntas fallidas antes de reintentar','Tu calificación (★) baja a 0'],a:2,exp:'Fallar en el primer intento no bloquea ni penaliza. El sistema registra el intento pero te permite reintentarlo. El feedback que aparece en cada pregunta errónea te explica la respuesta correcta y por qué — esa es tu guía de estudio antes del siguiente intento. La cert mide comprensión real, no memorización; si entiendes el razonamiento detrás de cada criterio, aprobarás.'},
         ]}
       ]},
      /* ── Shopper: Soporte y beneficios ── */
      {id:'s_soporte',cat:'Operación',ic:'💬',color:'#10b981',n:'Soporte, pagos y mis beneficios',
       desc:'Cómo pedir ayuda, interpretar tus beneficios, cuándo y cómo te pagan.',cert:false,mins:20,
       lessons:[
         {id:'ss1',ic:'💰',n:'Cómo se calcula y cuándo recibes tu pago',content:`
<h2>El ciclo de pago</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que sepas en qué etapa exacta está tu pago, sin depender de preguntar.</p></div>
<p>Esta es probablemente la pregunta que más te importa como evaluador, y la que menos control directo tienes sobre su velocidad — por eso vale la pena entender exactamente qué pasa en cada etapa, para saber cuándo es normal esperar y cuándo sí toca preguntar.</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Realizas y completas el cuestionario</b><p>Tu visita pasa a "cuestionario realizado/completado". Aún no genera liquidación: primero va a revisión.</p></div>
  <div class="acad-step"><span>2</span><b>Revisión del equipo</b><p>El coordinador revisa tu cuestionario y evidencias. Si hay observaciones, te notifican por la plataforma.</p></div>
  <div class="acad-step"><span>3</span><b>Submitido y lote de pago</b><p>Tras la revisión y el submitido, tu liquidación candidata puede incluirse en el lote de la quincena.</p></div>
  <div class="acad-step"><span>4</span><b>Transferencia (backend)</b><p>El pago real se procesa por backend a tus datos bancarios. Verifica que estén correctos en Mi Perfil.</p></div>
</div>
<h3>¿Qué hacer si hay un error en tu pago?</h3>
<p>Abre un ticket de soporte con: visita afectada, monto esperado vs. monto recibido, y captura de la liquidación. El equipo responderá en máx. 48 horas hábiles. Ten la captura lista antes de escribir — acelera muchísimo la resolución porque el equipo no tiene que reconstruir tu caso desde cero.</p>`},
         {id:'ss2',ic:'🆘',n:'Canales de soporte y cuándo usarlos',content:`
<h2>Cuándo y cómo pedir ayuda</h2>
<div class="acad-cards">
  <div class="acad-card"><div>🤖</div><b>Soporte IA (inmediato)</b><p>Para dudas sobre el cuestionario, instructivo, cómo funciona la plataforma. Disponible 24/7.</p></div>
  <div class="acad-card"><div>💬</div><b>WhatsApp del equipo</b><p>Para emergencias durante la visita o problemas urgentes antes de la fecha límite.</p></div>
  <div class="acad-card"><div>🎫</div><b>Ticket de soporte</b><p>Para problemas de pago, errores en tu perfil, o solicitudes que requieren resolución formal y trazabilidad.</p></div>
  <div class="acad-card"><div>📧</div><b>Correo</b><p>Para comunicaciones que necesiten respaldo escrito (disputas, cambios de datos bancarios).</p></div>
</div>
<h3>SLA (tiempo de respuesta)</h3>
<ul>
<li>Soporte IA: inmediato.</li>
<li>WhatsApp: respuesta en horario laboral en máx. 2 horas.</li>
<li>Tickets: cierre en máx. 48 horas hábiles.</li>
<li>Correo: respuesta en máx. 24 horas hábiles.</li>
</ul>`},
         {id:'ss3',ic:'❓',n:'Evaluación de soporte y pagos',tipo:'quiz',quiz:[
           {q:'Tu cuestionario fue aprobado y aparece en tu sección de Mis Beneficios pero no ves la fecha de pago. ¿Qué significa?',o:['El pago fue cancelado','El coordinador rechazó tu visita','Tu liquidación está aprobada pero el lote de pago de esta quincena aún no ha sido procesado — recibirás notificación cuando se cierre el lote','Hay un error en tus datos bancarios'],a:2,exp:'El flujo es: visita realizada → cuestionario aprobado → liquidación generada → lote de pago formado → pago procesado. Si ya ves la liquidación en Mis Beneficios pero sin fecha de pago, significa que está en la fase "lote formado". El lote se cierra y paga en fechas de quincena definidas (por ejemplo, el 15 y el último día del mes). Recibirás una notificación automática cuando tu lote sea pagado.'},
         ]}
       ]},
      /* ── Shopper: Introducción a la profesión ── */
      {id:'s_prof',cat:'Inducción',ic:'🎓',color:'#8b5cf6',n:'Ser mystery shopper: la profesión',
       desc:'Qué es realmente el mystery shopping, tipos de programa, ética, y cómo convertirlo en un ingreso serio.',cert:false,mins:35,
       lessons:[
         {id:'sp1',ic:'🕵️',n:'¿Qué es el mystery shopping de verdad?',content:`
<h2>Más que "comprar y opinar"</h2>
<p>El mystery shopping (o cliente incógnito) es una herramienta profesional de <b>investigación de mercado y control de calidad</b>. Las empresas contratan a una consultora para medir, de forma objetiva y anónima, si sus estándares de servicio se cumplen en el punto de venta. Tú, como evaluador, eres el instrumento de medición: tus observaciones se convierten en datos que mueven decisiones reales (capacitación, incentivos, cambios de proceso).</p>
<h3>Qué NO es</h3>
<ul>
<li>❌ No es dar tu opinión personal ("me gustó" / "no me gustó").</li>
<li>❌ No es una compra gratis — es un trabajo con criterios y evidencias.</li>
<li>❌ No es delatar personas — es medir procesos y comportamientos contra un estándar.</li>
</ul>
<h3>Qué SÍ es</h3>
<ul>
<li>✅ Observación estructurada y objetiva contra un instructivo definido.</li>
<li>✅ Documentación con evidencia (fotos, tiempos, tickets).</li>
<li>✅ Reporte fiel y a tiempo que la empresa usará para mejorar.</li>
</ul>`},
         {id:'sp2',ic:'🎯',n:'Tipos de programa y modalidades',content:`
<h2>No todas las visitas son iguales</h2>
<div class="acad-cards">
  <div class="acad-card"><div>🏪</div><b>Presencial</b><p>Visitas la sucursal como cliente normal, evalúas atención, tiempos, limpieza, protocolo.</p></div>
  <div class="acad-card"><div>📞</div><b>Mystery calling</b><p>Llamas al call center o sucursal y evalúas la atención telefónica.</p></div>
  <div class="acad-card"><div>💻</div><b>Digital / e-commerce</b><p>Evalúas la web, app o compra en línea, tiempos de entrega y postventa.</p></div>
  <div class="acad-card"><div>🏆</div><b>Competitivo</b><p>Evalúas a la competencia del cliente para comparar (benchmarking).</p></div>
</div>
<h3>Franjas y escenarios</h3>
<p>Cada visita tiene un <b>escenario</b> (el rol que debes representar: "cliente interesado en un crédito", "familia buscando promoción") y una <b>franja</b> (entre semana / fin de semana). Respeta ambos: si el escenario pide preguntar por un producto específico, hazlo con naturalidad. El escenario existe para provocar el comportamiento que se quiere medir.</p>
<p>Es común empezar en modalidad presencial y, conforme construyes reputación, acceder a proyectos digitales o competitivos que suelen pagar mejor por requerir más discreción y análisis. Pregunta a tu coordinador qué modalidades están disponibles en tu país antes de asumir que solo existe la presencial.</p>`},
         {id:'sp3',ic:'⚖️',n:'Ética profesional del evaluador',content:`
<h2>Las 6 reglas de oro de la ética</h2>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Objetividad</b><p>Reporta hechos observables, no interpretaciones ni emociones. Tu simpatía o antipatía con el personal no cambia el dato.</p></div>
  <div class="acad-step"><span>2</span><b>Honestidad total</b><p>Nunca inventes una visita ni respondas de memoria días después. Un dato falso daña a la empresa evaluada y destruye tu reputación.</p></div>
  <div class="acad-step"><span>3</span><b>Anonimato</b><p>Jamás revelas que eres evaluador. Si te descubren, la medición se invalida.</p></div>
  <div class="acad-step"><span>4</span><b>Confidencialidad</b><p>No compartes instructivos, escenarios, cuestionarios ni resultados con nadie.</p></div>
  <div class="acad-step"><span>5</span><b>No represalias</b><p>No usas tu rol para perjudicar a un empleado por motivos personales. Mides el proceso, no a la persona.</p></div>
  <div class="acad-step"><span>6</span><b>Cumplimiento</b><p>Respetas fechas, franjas y escenarios. Una visita fuera de las reglas no sirve.</p></div>
</div>
<p>Estas reglas no son burocracia — son lo que le da valor comercial a tu trabajo. Una empresa paga por un dato confiable y objetivo; en el momento en que cualquiera de estas seis reglas se rompe, el dato deja de servir para tomar decisiones reales, y con él, la razón de ser de toda la profesión.</p>`},
         {id:'sp4',ic:'📈',n:'Convertirlo en un ingreso serio',content:`
<h2>De ocasional a evaluador top</h2>
<p>Los evaluadores con mejor rating reciben más visitas, mejores honorarios y acceso a programas premium. La diferencia entre un evaluador ocasional y uno que vive de esto no es suerte — es un puñado de hábitos consistentes. Así se construye:</p>
<ul>
<li><b>Rating alto</b>: cuestionarios completos, a tiempo, con evidencias correctas. Cada visita bien hecha sube tu calificación.</li>
<li><b>Confiabilidad</b>: nunca dejas una visita a medias ni cancelas a última hora. La consultora prioriza a quien cumple.</li>
<li><b>Certificación vigente</b>: mantén tus certificaciones al día para no perder acceso a proyectos.</li>
<li><b>Perfil completo</b>: datos bancarios, ubicación y disponibilidad actualizados agilizan tus pagos y asignaciones.</li>
<li><b>Cobertura</b>: si puedes cubrir varias zonas o franjas, recibes más oferta de visitas.</li>
</ul>
<div class="acad-section">💡 <b>Tip:</b> revisa "Visitas disponibles" de todos los proyectos, no solo del que tienes activo. La oferta se cruza entre programas.</div>`},
         {id:'sp5',ic:'❓',n:'Evaluación de la profesión',tipo:'quiz',quiz:[
           {q:'Durante una visita, el asesor te atendió mal y sentiste que fue grosero contigo personalmente. ¿Cómo lo reportas?',o:['Le pongo la peor nota en todo para que aprenda','Reporto objetivamente los comportamientos observables contra cada criterio del cuestionario, sin dejar que mi molestia personal infle o distorsione las notas','No reporto nada porque me incomodó','Escribo una queja larga sobre lo mal que me sentí'],a:1,exp:'La ética profesional exige objetividad. Reportas los hechos observables (¿saludó? ¿escuchó? ¿ofreció solución?) contra cada criterio, con la nota que corresponde a cada uno. Tu incomodidad personal no debe inflar artificialmente las notas negativas ni distorsionar la medición. El cuestionario mide el cumplimiento del protocolo, no tu experiencia emocional.'},
           {q:'¿Por qué el anonimato es la regla más importante del mystery shopping?',o:['Para que el evaluador no se sienta observado','Porque si el personal sabe que es evaluado, altera su comportamiento y la medición deja de reflejar la realidad','Por seguridad del evaluador únicamente','Porque lo exige la ley'],a:1,exp:'El valor del mystery shopping está en medir el comportamiento REAL del personal en condiciones normales. Si el empleado sabe que lo evalúan, se comporta distinto (efecto observador) y el dato deja de ser útil. Por eso jamás revelas tu condición: la medición solo es válida si el personal actúa como lo haría con cualquier cliente.'},
         ]}
       ]},
/* ─── GUÍA DE MÓDULOS DEL PORTAL (beneficio, flujo, cómo usar) ─── */
      {id:'s_modguide',cat:'Inducción',ic:'🗺️',color:'#10b981',n:'Guía de tu portal: cada módulo, beneficio y cómo usarlo',
       desc:'Los 11 módulos de tu app, uno por uno: para qué existe, qué pasa si no lo usas, y cómo se usa paso a paso.',
       cert:false,mins:75,
       lessons:[
         {id:'smg1',ic:'📱',n:'Tu día a día operativo (5 módulos)',content:`
<h2>Sección "Operación" de tu portal</h2>
<div class="acad-section">☀️ <b>Mi Día</b>
<p><b>Qué es y por qué importa:</b> sin esto, tendrías que revisar varias pantallas por separado para saber qué te
toca hoy — aquí lo ves todo junto: visitas agendadas, alertas de cuestionario sin enviar, recertificación próxima.</p>
<p><b>Flujo:</b> ábrela al empezar el día → revisa lo resaltado arriba (lo urgente) → toca cualquier ítem para ir
directo a esa visita o tarea.</p>
<p><b>Cómo validar que funcionó:</b> al completar una acción (enviar cuestionario, confirmar agenda), el ítem
desaparece de la lista de pendientes de Mi Día.</p></div>

<div class="acad-section">👤 <b>Mi Perfil</b>
<p><b>Qué es y por qué importa:</b> tus datos bancarios, ubicación y disponibilidad determinan qué visitas te
ofrecen y qué tan rápido te pagan — un perfil incompleto significa menos oferta de visitas y pagos más lentos, no
un simple detalle administrativo.</p>
<p><b>Datos a ingresar:</b> banco, tipo de cuenta, número de cuenta y titular <b>exactamente</b> como aparecen en tu
cuenta bancaria real — una letra o dígito distinto retrasa tu pago porque no concilia contra el banco.</p>
<p><b>Cómo validar que funcionó:</b> el resumen de tu perfil ya no muestra advertencias de "datos incompletos"; sigues
apareciendo elegible en las listas de candidatos de tus proyectos certificados.</p>
<p><b>Errores frecuentes:</b> copiar el número de cuenta con espacios o guiones que el banco no usa — pégalo tal
cual aparece en tu estado de cuenta, sin formatear.</p></div>

<div class="acad-section">📋 <b>Visitas Disponibles</b>
<p><b>Qué es y por qué importa:</b> es tu "marketplace" de trabajo — si no lo revisas seguido, otros evaluadores se
adelantan en las mejores sucursales (mejor honorario, ubicación más cómoda).</p>
<p><b>Flujo completo:</b> filtras por país/proyecto → revisas honorario, combo y fecha límite de cada visita → pulsas
<b>Reservar</b> (si el proyecto usa cupos) o <b>Postularme</b> (si usa aprobación) → esperas confirmación del equipo.</p>
<p><b>Cómo validar que funcionó:</b> la visita pasa de "disponible" a "reservada"/"postulada" en tu lista, y luego a
"asignada" cuando el equipo la confirma — revisa Mis Visitas para ver en qué etapa quedó.</p>
<p><b>Errores frecuentes:</b> revisar solo el proyecto que tienes "activo" y no ver que hay oferta en otro proyecto
donde también estás certificado — la oferta se cruza entre programas, revisa todos los que te habiliten.</p></div>

<div class="acad-section">🙋 <b>Reservas & Asignación</b>
<p><b>Qué es y por qué importa:</b> en programas mensuales de alto volumen, te deja apartar cupos por adelantado en
vez de competir visita por visita cada vez que se publica algo nuevo.</p>
<p><b>Flujo:</b> reservas el cupo del periodo que te interesa → el equipo confirma la asignación final (puede haber
más de un shopper interesado en el mismo cupo, por eso no es automático).</p>
<p><b>Cómo validar que funcionó:</b> el cupo pasa de "reservado" a "confirmado" en tu vista — hasta ese momento no
des la visita por segura.</p></div>

<div class="acad-section">🧭 <b>Mis Visitas</b>
<p><b>Qué es y por qué importa:</b> es tu agenda personal completa — sin esto, perderías el rastro de en qué etapa
está cada visita (agendada, realizada, cuestionario pendiente, liquidada).</p>
<p><b>Flujo y botones:</b> cada visita muestra su estado actual; el botón <b>🔄 Reprogramar</b> abre el formulario
para pedir nueva fecha (requiere motivo); una visita en "cuestionario pendiente" tiene un botón directo para
completarlo.</p>
<p><b>Cómo validar que funcionó:</b> tras enviar el cuestionario, la visita cambia de estado a "realizada/completada"
— nunca dice "enviado", porque después viene la revisión del admin antes de cualquier liquidación.</p>
<p><b>Errores frecuentes:</b> dejar una visita en "cuestionario pendiente" varios días afecta tu rating — complétalo
el mismo día de la visita mientras los detalles están frescos.</p></div>`},

         {id:'smg2',ic:'🎓',n:'Capacitación y tus beneficios (6 módulos)',content:`
<h2>Capacitación & IA</h2>
<div class="acad-section">📚 <b>Academia</b> (donde estás ahora)
<p><b>Qué es y por qué importa:</b> te prepara para certificarte y entender la plataforma sin depender de que
alguien te explique todo en una llamada — puedes repasar cuando quieras, a tu ritmo.</p></div>

<div class="acad-section">🏆 <b>Certificación</b>
<p><b>Qué es y por qué importa:</b> sin aprobarla, no puedes postularte a ese proyecto — es tu llave de entrada,
específica de cada programa (no genérica).</p>
<p><b>Flujo:</b> estudias el instructivo en Recursos del proyecto → presentas el examen → si apruebas, quedas
habilitado para postularte a ese proyecto; si no, puedes repasar y volver a presentar.</p>
<p><b>Cómo validar que funcionó:</b> el proyecto deja de mostrarte "certificación requerida" y puedes postularte a
sus visitas normalmente.</p></div>

<div class="acad-section">📎 <b>Recursos del proyecto</b>
<p><b>Qué es y por qué importa:</b> el instructivo y material de referencia en un lector dentro de la misma app —
no necesitas buscar PDFs sueltos en tu correo justo antes de una visita.</p></div>

<div class="acad-section">🤖 <b>Soporte IA</b>
<p><b>Qué es y por qué importa:</b> respuesta inmediata para dudas comunes del cuestionario o la plataforma, sin
esperar a que alguien del equipo te conteste por WhatsApp.</p>
<p><b>Flujo:</b> escribes tu duda → recibes una respuesta sugerida; si no resuelve tu caso, puedes escalar a un
ticket real para que un humano lo revise.</p></div>

<h2>Mis Beneficios</h2>
<div class="acad-section">💰 <b>Mis Beneficios</b>
<p><b>Qué es y por qué importa:</b> ves exactamente en qué etapa está tu pago — sin esto, no sabrías si "ya te toca
cobrar" o si falta un paso.</p>
<p><b>Flujo completo (etapas del ciclo):</b> visita realizada → cuestionario completado → revisión del admin →
liquidación generada (elegible) → incluida en un lote de pago → lote marcado pagado.</p>
<p><b>Cómo validar que funcionó:</b> tu visita muestra el estado correcto en cada etapa; cuando dice "pagada", el
egreso correspondiente ya quedó registrado del lado de Finanzas.</p>
<p><b>Errores frecuentes / qué significa cuando algo "no avanza":</b> si una visita muestra liquidación pero sin
fecha de pago, significa que está formada pero el lote de la quincena todavía no se procesa — no es un error, es
una etapa intermedia normal del ciclo.</p></div>

<div class="acad-section">📢 <b>Tablón / Novedades</b>
<p><b>Qué es y por qué importa:</b> anuncios y avisos importantes centralizados en un solo lugar, para que no se
pierdan entre mensajes de WhatsApp de distintos chats y personas.</p></div>`},

         {id:'smg3',ic:'❓',n:'Evaluación de la guía de tu portal',tipo:'quiz',quiz:[
           {q:'Llevas dos semanas sin recibir ofertas de visitas nuevas. ¿Qué revisas primero?',o:['Tablón de Novedades','Mi Perfil — puede que falte disponibilidad, ubicación o certificación vigente','Soporte IA','Mis Beneficios'],a:1,fb:'Un perfil incompleto (disponibilidad, ubicación, certificación vencida) reduce directamente la oferta de visitas que te llega.'},
           {q:'Tu liquidación aparece en Mis Beneficios pero sin fecha de pago. ¿Qué significa?',o:['Que hubo un error','Que está liquidada pero el lote de pago de esta quincena aún no se ha procesado','Que te rechazaron la visita','Que debes volver a enviar el cuestionario'],a:1,fb:'El ciclo tiene etapas separadas: liquidada (candidata) → en lote → pagada. Sin fecha de pago solo significa que el lote aún no cierra.'},
         ]}
       ]},
    ],
    /* ─── CLIENTE ─── */
    cliente:[
      /* ─── RUTA DEL CLIENTE (lectura estratégica, sin operar) ─── */
      {id:'cl_ruta',cat:'Portal',ic:'🧭',color:'#f59e0b',n:'Tu ruta en el portal: leer y decidir',
       desc:'Cómo interpretar estados y resultados sin operar la plataforma — tu rol es estratégico.',
       cert:false,mins:35,
       lessons:[
         {id:'clr1',ic:'📊',n:'Qué ves y qué NO operas',content:`
<h2>Tu portal es de lectura estratégica</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que decidas con datos objetivos, sin necesitar acceso operativo a la plataforma.</p></div>
<p>Tu acceso a CXOrbia tiene un propósito distinto al del equipo de la consultora: tú no publicas visitas, no asignas shoppers ni procesas pagos — esa es la parte <b>operativa</b> y la hace la consultora con su propio equipo. Tu portal existe para que <b>leas resultados objetivos</b> de tu programa de evaluación y <b>tomes decisiones de negocio</b> con esa información, sin depender de que alguien te envíe un reporte por correo cada mes.</p>
<p>Esta separación es intencional: mantiene la evaluación imparcial (tú no puedes influir en quién visita tu sucursal ni cuándo) y a la vez te da visibilidad total y en tiempo real de lo que se está midiendo.</p>
<div class="acad-cards">
  <div class="acad-card"><div>📈</div><b>Panorama</b><p>Score ponderado, ranking de sucursales, evolución.</p></div>
  <div class="acad-card"><div>🏬</div><b>Sucursales & Score</b><p>Detalle por sucursal, hallazgos, evidencias.</p></div>
  <div class="acad-card"><div>🎯</div><b>Planes de acción</b><p>Incentivos, mejora, seguimiento.</p></div>
  <div class="acad-card"><div>📊</div><b>Insights & Benchmark</b><p>NPS, comparativo vs industria, anotaciones.</p></div>
</div>`},
         {id:'clr2',ic:'🚦',n:'Leer los estados correctamente',content:`
<h2>Estados honestos: qué significan</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que nunca confundas un dato preliminar con uno confirmado.</p></div>
<p>CXOrbia nunca te muestra un dato como "definitivo" si todavía puede cambiar. Esto protege tus decisiones: si tomaras una acción comercial basada en una cifra que luego se ajusta, perderías confianza en el sistema. Por eso cada dato lleva una etiqueta de estado que debes aprender a leer.</p>
<div class="acad-section"><b>Preview / candidata</b><p>Dato operativo aún sin confirmación final del backend. No es cifra cerrada.</p></div>
<div class="acad-section"><b>Pendiente backend</b><p>La integración (correo, WhatsApp, sincronía) está preparada pero aún no ejecuta en vivo.</p></div>
<div class="acad-section"><b>En vivo</b><p>Solo cuando el dato proviene de una fuente confirmada. Si no lo dice, trátalo como preview.</p></div>
<blockquote>No interpretes un "preview" como resultado final. Pregunta a tu consultora cuándo el dato queda confirmado.</blockquote>
<h3>Dónde aparecen estas etiquetas</h3>
<p>Las verás junto a KPIs financieros compartidos, en badges de estado dentro de Sucursales & Score, y en cualquier cifra que dependa de un cruce que el backend aún no ha confirmado (por ejemplo, una liquidación reciente o un score calculado el mismo día de la visita). Con el tiempo aprenderás que la mayoría de tus decisiones estratégicas (dónde capacitar, a quién premiar) puedes tomarlas perfectamente sobre datos en preview — solo evita comprometerte con un número exacto frente a tu propia dirección hasta que esté confirmado.</p>`},
         {id:'clr3',ic:'🤝',n:'Solicitar acciones y soporte',content:`
<h2>Cómo pedir sin operar</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que puedas activar cambios sin tocar la operación directamente.</p></div>
<p>Aunque no operas la plataforma directamente, tu portal sí te permite <b>iniciar</b> acciones — la diferencia es que quedan como una solicitud que la consultora ejecuta, nunca como un cambio directo tuyo sobre la operación de otra persona (un shopper, una visita ajena).</p>
<ul class="acad-check">
<li>Solicitar un reporte personalizado</li>
<li>Pedir una reunión de revisión de resultados</li>
<li>Abrir soporte desde tu portal</li>
<li>Solicitar capacitación dirigida a tus áreas débiles</li>
<li>Cargar documentos (protocolos, imagen de marca) para el set-up</li>
</ul>
<p>Cada una de estas solicitudes llega como una tarea con tu nombre al equipo de la consultora — no se pierde en un correo genérico. Si necesitas visitas adicionales fuera de tu programa contratado, o quieres explorar un add-on (evidencia geolocalizada, NPS, benchmarking), también lo inicias desde aquí: la solicitud entra como oportunidad comercial y te contactan con una propuesta, sin que tengas que negociar el alcance tú mismo desde cero.</p>
<div class="acad-section"><b>Datos sensibles</b><p>Los documentos que cargas se referencian de forma segura. La consultora los usa para el set-up; no se exponen públicamente.</p></div>`},
         {id:'clr4',ic:'❓',n:'Evaluación del portal',tipo:'quiz',quiz:[
           {q:'Ves un margen en estado "preview". ¿Es cifra final?',o:['Sí','No: es dato operativo sin confirmación final del backend','Solo si es de este mes'],a:1,fb:'Preview = dato operativo sin confirmar. La cifra final la confirma el backend/consultora.'},
           {q:'Quieres cambiar la asignación de un shopper. ¿Puedes?',o:['Sí, desde mi portal','No: la operación la hace la consultora; yo decido y solicito','Solo los viernes'],a:1,fb:'Tu rol es estratégico: lees y decides. La operación la ejecuta la consultora.'},
         ]},
       ]},
      {id:'cl_por',cat:'Portal',ic:'🏬',color:'#f59e0b',n:'Tu portal de resultados estratégicos',
       desc:'Lee tu score, el ranking de sucursales y toma decisiones basadas en evidencia.',
       cert:false,mins:45,
       lessons:[
         {id:'cp1',ic:'📊',n:'Entender tu score',content:`
<h2>¿Qué significa tu score?</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Que tengas una cifra objetiva del desempeño de tu red, sin esperar un reporte mensual manual.</p></div>
<p>El score de tu programa es el <strong>promedio ponderado</strong> de todos los criterios evaluados en tus sucursales durante el periodo.</p>
<h3>Cómo se calcula</h3>
<p>El cuestionario tiene secciones con pesos porcentuales (ej: Atención 30%, Tiempos 25%, Limpieza 20%, Cierre y despedida 25%). Cada pregunta tiene peso dentro de su sección. El score es el promedio ponderado de todas las respuestas de todas las visitas del periodo.</p>
<h3>¿Qué significa cada rango?</h3>
<ul>
<li>⭐ 85-100: Excelente — estándares cumplidos consistentemente.</li>
<li>🟡 70-84: En desarrollo — hay brechas identificables pero no críticas.</li>
<li>🔴 Menos de 70: Crítico — requiere acción inmediata (capacitación, supervisión, revisión de procesos).</li>
</ul>
<h3>¿Con qué frecuencia se actualiza?</h3>
<p>En tiempo real. Cada visita procesada impacta el score. No esperas el reporte mensual — puedes ver el efecto de una capacitación reciente reflejado en cuanto las próximas visitas de esa sucursal se procesan, en vez de esperar el corte formal de fin de mes.</p>`},
         {id:'cp2',ic:'🏆',n:'Ranking y hallazgos',content:`
<h2>Ranking de sucursales</h2>
<p>El portal clasifica automáticamente tus sucursales por cumplimiento y score. Desde aquí puedes:</p>
<ul>
<li>Ver las <b>excelentes</b>: modelos a replicar en el resto de la red.</li>
<li>Ver las <b>en desarrollo</b>: necesitan atención pero están en proceso de mejora.</li>
<li>Ver las <b>críticas</b>: prioridad de intervención inmediata.</li>
<li>Filtrar por ciudad, región o tipo de formato.</li>
</ul>
<h2>Hallazgos frecuentes</h2>
<p>El sistema identifica automáticamente los criterios que más frecuentemente obtienen puntuación negativa en toda tu red. Esto te dice <strong>dónde concentrar la capacitación</strong>.</p>
<p>Por ejemplo: si "tiempo de espera en caja" aparece como el hallazgo #1, el plan de acción es capacitar específicamente en ese proceso, no en todo el protocolo genérico.</p>`},
         {id:'cp3',ic:'⚡',n:'Planes de acción',content:`
<h2>De los datos a las decisiones</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Convertir el ranking y los hallazgos en acciones concretas con dueño y fecha, no solo en observación pasiva.</p></div>
<p>El portal no es solo para ver — es para actuar. Desde "Planes de Acción" puedes:</p>
<ul>
<li>Crear un plan específico para una sucursal o grupo de sucursales.</li>
<li>Asignar responsables y fechas límite.</li>
<li>Vincular el plan al hallazgo que lo origina.</li>
<li>Hacer seguimiento del avance.</li>
</ul>
<h3>Incentivos y sanciones</h3>
<p>Basándote en el ranking, puedes definir:</p>
<ul>
<li>Reconocimiento para el top 3 de sucursales — tu consultora puede configurar tableros de reconocimiento.</li>
<li>Planes de mejora obligatoria para las críticas.</li>
<li>Criterios de escalamiento para gerentes regionales.</li>
</ul>
<p>El plan de acción más efectivo no es el más severo, sino el más específico: ligar el reconocimiento y la corrección directamente al hallazgo que los origina hace que el personal entienda exactamente qué se espera de él, en vez de recibir una sanción genérica sin contexto.</p>
<h3>Solicitar servicios adicionales</h3>
<p>Desde el portal, en la sección "Servicios & Add-ons", puedes solicitar a tu consultora: NPS real (encuestas al cliente final), capacitación del personal, mystery shopping competitivo o dashboards ejecutivos en BI.</p>`},
         {id:'cp3b',ic:'⚡',n:'Planes de acción y seguimiento',content:`
<h2>Del hallazgo al plan de acción</h2>
<p>El portal no es solo para ver números — es para actuar. En la sección <b>Planes de Acción</b> puedes crear, asignar y hacer seguimiento de mejoras concretas.</p>
<h3>Cómo crear un plan de acción</h3>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Identifica el hallazgo a atacar</b><p>Elige el criterio con más fallas frecuentes en tu red o en las sucursales críticas.</p></div>
  <div class="acad-step"><span>2</span><b>Define la acción específica</b><p>No "mejorar el servicio" — sino "capacitar a los asesores de Miraflores en protocolo de bienvenida antes del 30 de julio".</p></div>
  <div class="acad-step"><span>3</span><b>Asigna responsable y fecha límite</b><p>Sin responsable y fecha, los planes no se ejecutan. El portal rastrea quién es responsable de cada acción.</p></div>
  <div class="acad-step"><span>4</span><b>Mide el impacto en el siguiente reporte</b><p>El portal compara el score pre-plan vs. post-plan para las sucursales intervenidas. Así ves si la acción funcionó.</p></div>
</div>
<h3>Incentivos: reconoce lo que funciona</h3>
<p>Las sucursales del top 3 son modelos a replicar. Usa el portal para identificarlas y comparte sus prácticas con el resto de la red. El reconocimiento interno es tan poderoso como la corrección.</p>`},
         {id:'cp4',ic:'❓',n:'Evaluación del portal',tipo:'quiz',quiz:[
           {q:'Tu score de este mes es 71 (vs. 78 del mes anterior). ¿Qué herramienta del portal usas primero para entender la caída?',o:['Descargas el reporte PDF y lo lees en tu oficina','Revisas el ranking de sucursales para identificar cuáles bajaron y luego los hallazgos frecuentes para ver qué criterio causó la caída','Llamas al consultor para que te explique','Esperas el mes siguiente para ver si se recupera solo'],a:1,exp:'El proceso correcto: (1) Ranking de sucursales — ¿cuáles bajaron? ¿Es una sola o varias? (2) Hallazgos frecuentes — ¿qué criterio específico generó más fallas? (3) Detalle de visitas de las sucursales problemáticas — ¿hay un patrón por horario, por día o por personal específico? (4) Plan de acción dirigido. El portal tiene todo esto en tiempo real — no esperas el reporte mensual.'},
         ]}
       ]},
      /* ── Cliente: Hallazgos profundos ── */
      {id:'cl_hall',cat:'Portal',ic:'🔍',color:'#6366f1',n:'Hallazgos: del dato a la decisión',
       desc:'Cómo leer el análisis de hallazgos, priorizar acciones y medir el impacto real.',cert:false,mins:30,
       lessons:[
         {id:'ch1',ic:'📊',n:'Leer el análisis de hallazgos',content:`
<h2>Hallazgos: la inteligencia detrás del score</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Entender por qué y dónde falla tu red, no solo qué tan bien va en promedio.</p></div>
<p>El score te dice <em>qué tan bien</em> está tu red en general. Los hallazgos te dicen <em>por qué</em> y <em>dónde</em>. Esta distinción es la razón por la que este módulo existe: un score sin hallazgos es solo una calificación; un score con hallazgos es un plan de mejora esperando ser ejecutado.</p>
<h3>Hallazgos frecuentes vs. hallazgos críticos</h3>
<ul>
<li><b>Frecuentes</b>: criterios que fallan en más del 30% de las visitas. Son el área de mejora sistémica — afectan a muchas sucursales.</li>
<li><b>Críticos (KO)</b>: comportamientos que nunca deben ocurrir (ej: cobro incorrecto, trato irrespetuoso). Una sola falla es suficiente para que impacte negativamente el score de la sucursal.</li>
</ul>
<h3>Cómo priorizar</h3>
<p>No puedes atacar todo al mismo tiempo. Usa esta matriz:</p>
<div class="acad-cards">
  <div class="acad-card"><div>🔴</div><b>Alta frecuencia + KO</b><p>Intervención inmediata. Capacitación urgente + supervisión directa.</p></div>
  <div class="acad-card"><div>🟡</div><b>Alta frecuencia + no KO</b><p>Plan de mejora a 30-60 días. Capacitación grupal.</p></div>
  <div class="acad-card"><div>🟢</div><b>Baja frecuencia</b><p>Monitorear. No prioritario salvo que sea KO.</p></div>
</div>`},
         {id:'ch2',ic:'📈',n:'Comparativo intermensual y tendencias',content:`
<h2>¿Estás mejorando o empeorando?</h2>
<p>El portal muestra el comparativo mes a mes del score general y por criterio. Esto es más importante que el número puntual — la tendencia te dice si tus acciones están funcionando. Un score de 78% no significa nada por sí solo hasta que sabes si el mes pasado era 72% (vas mejorando) o 84% (algo se rompió).</p>
<h3>Cómo interpretar el comparativo</h3>
<ul>
<li><b>Tendencia positiva (+3pp o más)</b>: tus acciones están funcionando. Identifica qué cambió y replica.</li>
<li><b>Estancamiento (±2pp)</b>: las acciones tomadas no están moviendo el indicador. Revisa si se implementaron realmente o si el criterio es más estructural.</li>
<li><b>Caída (−3pp o más)</b>: hay un nuevo problema o una mejora anterior se revirtió. Revisa hallazgos del período y compara qué sucursales bajaron.</li>
</ul>
<h3>Granularidad del análisis</h3>
<p>Puedes ver el comparativo a nivel de: toda la red → región → sucursal → criterio específico. El drill-down te lleva desde el panorama general hasta la causa raíz — evita el error común de reaccionar a un promedio de red cuando en realidad el problema está concentrado en 2 o 3 sucursales puntuales.</p>`},
         {id:'ch3',ic:'❓',n:'Evaluación de hallazgos',tipo:'quiz',quiz:[
           {q:'Tu top hallazgo frecuente este mes es "el asesor no ofreció producto adicional" en el 55% de las visitas. ¿Cuál es el plan de acción más efectivo?',o:['Bajar el peso de ese criterio en el cuestionario para mejorar el score','Capacitar específicamente en técnicas de venta cruzada y validar en el siguiente mes con un criterio de seguimiento','Despedir a los asesores con más fallas','Contratar más personal en las sucursales afectadas'],a:1,exp:'El hallazgo dice exactamente dónde está el problema: no es falta de personal sino falta de habilidad/protocolo en venta cruzada. La acción efectiva es capacitación específica (no genérica) + medición en el siguiente ciclo. El plan correcto incluye: sesión de capacitación, rol plays con el equipo, seguimiento con mystery en el próximo periodo, y comparativo pre/post. Bajar el peso del criterio esconde el problema sin resolverlo.'},
         ]}
       ]},
      /* ── Cliente: Soporte ── */
      {id:'cl_soporte',cat:'Inducción',ic:'🤝',color:'#0891b2',n:'Solicitar servicios y soporte',
       desc:'Cómo abrir un ticket, solicitar visitas adicionales, NPS y nuevos servicios.',cert:false,mins:20,
       lessons:[
         {id:'cls1',ic:'🎫',n:'Soporte y solicitudes desde el portal',content:`
<h2>Tu canal de comunicación con la consultora</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Formalizar cualquier solicitud con seguimiento, sin depender de correos o llamadas informales.</p></div>
<p>Desde el portal puedes hacer solicitudes formales sin necesidad de llamar o enviar un correo por fuera del sistema. Esto tiene una ventaja concreta: cada solicitud queda registrada con fecha y seguimiento, en vez de perderse en un hilo de correo o una llamada que nadie documentó.</p>
<h3>Tipos de solicitudes</h3>
<div class="acad-cards">
  <div class="acad-card"><div>🎫</div><b>Ticket de soporte</b><p>Preguntas sobre el reporte, aclaraciones de score, errores en datos. Respuesta en 24h hábiles.</p></div>
  <div class="acad-card"><div>📋</div><b>Visitas adicionales</b><p>Solicita visitas fuera del programa estándar: campaña específica, semana de seguimiento, sucursal crítica.</p></div>
  <div class="acad-card"><div>🎯</div><b>NPS + VoC</b><p>Solicita encuestas de satisfacción al cliente final para complementar los datos de mystery shopping.</p></div>
  <div class="acad-card"><div>📊</div><b>Reporte personalizado</b><p>Solicita un análisis específico: región, temporada, campaña, benchmarking vs. competencia.</p></div>
</div>
<h3>Add-ons disponibles</h3>
<p>Desde la sección Servicios & Add-ons puedes ver el catálogo completo de servicios adicionales de tu consultora y solicitar cotización directamente desde el portal — sin tener que averiguar por separado qué más ofrece o negociar el alcance desde cero en una llamada.</p>`},
         {id:'cls2',ic:'❓',n:'Evaluación final del cliente',tipo:'quiz',quiz:[
           {q:'¿Cuál es la diferencia entre un ticket de soporte y una solicitud de servicio adicional?',o:['Son lo mismo, no hay diferencia','El ticket de soporte es para preguntas o problemas con el servicio contratado; la solicitud de servicio adicional es para pedir algo fuera del alcance del programa actual (cotización, nueva campaña, etc.)','El ticket de soporte cuesta dinero, la solicitud no','Solo el admin puede abrir tickets'],a:1,exp:'Los tickets de soporte están dentro del servicio contratado — son gratuitos y el equipo responde sin cargo. Las solicitudes de servicios adicionales implican un nuevo alcance que requiere cotización y acuerdo. Esta distinción ayuda al equipo de la consultora a priorizarlos correctamente: soporte operativo vs. desarrollo comercial.'},
         ]}
       ]},
      /* ── Cliente: ROI y decisiones estratégicas ── */
      {id:'cl_roi',cat:'Portal',ic:'💡',color:'#0e9c6e',n:'Del score al ROI: decisiones estratégicas',
       desc:'Cómo convertir los resultados de tu programa en incentivos, capacitación y retorno medible.',cert:false,mins:35,
       lessons:[
         {id:'cr1',ic:'🎁',n:'Incentivos y reconocimiento basados en datos',content:`
<h2>Premiar lo que se mide</h2>
<div class="acad-section">🎯 <b>Objetivo</b><p>Convertir el ranking en un sistema de incentivos justo y objetivo, no en un premio arbitrario.</p></div>
<p>El ranking de sucursales no es solo información — es la base de un sistema de incentivos justo y objetivo. Cuando el reconocimiento se basa en el score de mystery shopping, el equipo entiende exactamente qué se espera de ellos.</p>
<h3>Modelos de incentivo que funcionan</h3>
<ul>
<li><b>Bono por umbral</b>: toda sucursal que supere 85% recibe un bono. Simple y claro.</li>
<li><b>Ranking competitivo</b>: el top 3 de la red recibe reconocimiento mensual (público, no solo económico).</li>
<li><b>Mejora sostenida</b>: premia a quien más suba su score respecto al mes anterior — motiva a las sucursales rezagadas, no solo a las que ya están arriba.</li>
<li><b>Criterio específico</b>: bono ligado al criterio más crítico del negocio (ej. tiempo de espera).</li>
</ul>
<div class="acad-section">⚠️ <b>Cuidado:</b> un incentivo mal diseñado genera trampa. Si premias solo el número, el personal puede intentar identificar al evaluador. Por eso el anonimato y la rotación de evaluadores son clave.</div>
<p>La regla práctica: comunica el criterio y el umbral con transparencia total ("toda sucursal sobre 85% recibe X"), pero nunca reveles cuándo ni con qué frecuencia llega el evaluador — esa combinación de transparencia en la regla y opacidad en el método es lo que mantiene la medición honesta y el incentivo efectivo al mismo tiempo.</p>`},
         {id:'cr2',ic:'🎓',n:'Planes de capacitación dirigidos',content:`
<h2>Capacitar donde duele, no en general</h2>
<p>El error más común es capacitar en "servicio al cliente" de forma genérica. El portal te dice exactamente en qué criterio falla tu red — capacita ahí.</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Identifica el hallazgo #1</b><p>El criterio con más puntuación negativa en toda la red. Ej: "no ofrece productos complementarios".</p></div>
  <div class="acad-step"><span>2</span><b>Diseña capacitación específica</b><p>Una sesión de 30 min sobre venta cruzada es más efectiva que un curso genérico de 8 horas.</p></div>
  <div class="acad-step"><span>3</span><b>Mide el impacto</b><p>Compara el score de ese criterio antes y después. Si subió, la capacitación funcionó.</p></div>
  <div class="acad-step"><span>4</span><b>Itera</b><p>Ataca el siguiente hallazgo. Mejora continua criterio por criterio.</p></div>
</div>
<p>Tu consultora puede ofrecerte capacitación del personal como add-on, dirigida precisamente a tus áreas débiles detectadas por el programa.</p>`},
         {id:'cr3',ic:'💰',n:'Calcular el ROI del programa',content:`
<h2>¿Vale la pena el mystery shopping?</h2>
<p>Un programa de evaluación cuesta, pero el retorno es medible. Así se calcula:</p>
<h3>Fórmula simple de ROI</h3>
<div class="acad-section" style="font-family:monospace">ROI = (Beneficio generado − Costo del programa) / Costo del programa × 100</div>
<h3>De dónde sale el beneficio</h3>
<ul>
<li><b>Mayor conversión</b>: si el score de "cierre de venta" sube 10pp y eso mueve la tasa de conversión, calcula el ingreso adicional.</li>
<li><b>Retención de clientes</b>: mejor servicio = menos fuga. Un cliente retenido vale su ticket promedio × frecuencia × años.</li>
<li><b>Reducción de quejas</b>: menos reclamos = menos costo de gestión y compensaciones.</li>
<li><b>Consistencia de marca</b>: una red uniforme protege el valor de la marca — difícil de cuantificar pero real.</li>
</ul>
<div class="acad-section">💡 <b>Tip:</b> pide a tu consultora un dashboard de correlación entre score y tus KPIs de negocio (ventas, NPS, quejas). Ahí ves el ROI en vivo.</div>`},
         {id:'cr4',ic:'❓',n:'Evaluación estratégica',tipo:'quiz',quiz:[
           {q:'Tu red tiene un score general de 82%, pero el criterio "tiempo de espera" está en 58% en 8 de 20 sucursales. ¿Cuál es la mejor decisión?',o:['Capacitar a toda la red en servicio al cliente general','Diseñar una intervención específica sobre gestión de filas y tiempos en esas 8 sucursales, y medir el impacto el mes siguiente','Cambiar de consultora porque el score es bajo','Ignorarlo porque el score general es bueno'],a:1,exp:'La decisión correcta es dirigida y medible: el problema está localizado (tiempo de espera en 8 sucursales específicas), así que la intervención debe serlo también. Capacitar a toda la red en algo genérico desperdicia recursos y no ataca la causa. Una intervención específica sobre gestión de filas en esas 8 sucursales, con medición antes/después, genera mejora demostrable y ROI claro.'},
           {q:'¿Por qué premiar "la mejora sostenida" además del "top del ranking" es una buena estrategia de incentivos?',o:['Porque es más barato','Porque motiva también a las sucursales rezagadas a mejorar, no solo a las que ya están arriba','Porque el ranking no importa','Porque evita que el personal identifique al evaluador'],a:1,exp:'Premiar solo el top del ranking motiva a las mejores sucursales pero desmotiva a las de abajo (sienten que nunca ganarán). Premiar la mejora sostenida (quién más subió respecto al mes anterior) da a TODAS las sucursales una meta alcanzable y motiva especialmente a las rezagadas, que son justamente donde hay más margen de mejora y mayor impacto en el score general de la red.'},
         ]}
       ]},
    ]
  }
};

/* ─ Engine del módulo ─ */
CX.module('aprendizaje', ({data,role,ui})=>{
  const host=ui.el('div');
  const PK='cx_acad2_'+role;
  const prog=()=>{try{return JSON.parse(localStorage.getItem(PK)||'{}');}catch(e){return{};}};
  const setProg=(id,v)=>{const s=prog();s[id]=v;try{localStorage.setItem(PK,JSON.stringify(s));}catch(e){}};

  let activeCat='Todos';
  let openCourse=null;
  let openLesson=null;
  let showArchived=false;

  const getCourses=()=>{
    const r=role==='admin'?(CX._acadAud||'admin'):(role==='shopper'?'shopper':role==='cliente'?'cliente':'admin');
    const base=CX.acadData.COURSES[r]||CX.acadData.COURSES.admin;
    const custom=CX.acadData.getCustom(r);
    const all=[...custom,...base];
    /* los archivados solo se listan si el admin activa "ver archivados" — nunca para shopper/cliente */
    if(role==='admin' && showArchived) return all;
    return all.filter(c=>c.estado!=='archivado' && c.estado!=='eliminado');
  };

  /* ── player de lección ── */
  const lessonPlayer=(course)=>{
    const lessons=(course.lessons||[]).filter(l=>!l._deleted); /* respeta soft-delete de lección */
    const li=Math.max(0,lessons.findIndex(l=>l.id===openLesson));
    const lesson=lessons[li];
    if(!lesson)return;
    const pct=Math.round((lessons.filter(l=>prog()[l.id]>=100)).length/lessons.length*100);

    host.innerHTML=`
      <div class="between" style="margin-bottom:12px">
        <button class="btn btn-ghost btn-sm" id="backBtn">← Volver</button>
        <div style="font-size:12px;color:var(--t3)"><b>${course.ic} ${course.n}</b></div>
        <div style="font-size:12px;color:var(--t3)">${li+1}/${lessons.length}</div>
      </div>
      <div style="background:var(--border-2);border-radius:4px;height:4px;margin-bottom:20px"><div style="height:4px;border-radius:4px;background:${course.color};width:${Math.max(4,(li+1)/lessons.length*100)}%"></div></div>
      <div style="display:grid;grid-template-columns:220px 1fr;gap:20px;align-items:flex-start">
        <!-- Sidebar lecciones -->
        <div class="card card-p" style="position:sticky;top:10px">
          <div style="font-size:10px;font-weight:800;color:var(--t3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px">LECCIONES</div>
          ${lessons.map((l,i)=>{const done=prog()[l.id]>=100;return `<div data-li="${l.id}" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:9px;cursor:pointer;margin-bottom:4px;background:${l.id===lesson.id?course.color+'20':done?'#f0faf4':'transparent'};border-left:3px solid ${l.id===lesson.id?course.color:done?'var(--green)':'transparent'}">
            <span style="width:20px;height:20px;border-radius:50%;background:${l.id===lesson.id?course.color:done?'var(--green)':'var(--border-2)'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${l.id===lesson.id||done?'#fff':'var(--t3)'};">${done?'✓':(i+1)}</span>
            <span style="font-size:12px;font-weight:${l.id===lesson.id?'700':'400'};color:var(--t1)">${l.ic} ${l.n}</span>
          </div>`;}).join('')}
        </div>
        <!-- Contenido -->
        <div>
          ${lesson.tipo==='quiz'?quizView(course,lesson,li,lessons):contentView(lesson,course,li,lessons)}
        </div>
      </div>`;

    host.querySelector('#backBtn').addEventListener('click',()=>{openLesson=null;openCourse=null;draw();});
    host.querySelectorAll('[data-li]').forEach(b=>b.addEventListener('click',()=>{openLesson=b.dataset.li;lessonPlayer(course);}));
    if(lesson.tipo==='quiz')wireQuiz(course,lesson,li,lessons);
    else wireContent(course,lesson,li,lessons);
  };

  const contentView=(lesson,course,li,lessons)=>`
    <div class="card card-p">
      ${(role==='admin'&&CX.permissions&&CX.permissions.can('academy.edit',CX.permissions.ctx()))?`<div class="between" style="margin-bottom:10px"><span style="font-size:11px;color:var(--t3)">${lesson.ic} ${lesson.n}</span><div class="flex" style="gap:6px"><button class="btn btn-ghost btn-sm" id="editLsn">✎ Editar lección</button><button class="btn btn-ghost btn-sm" id="addLsn">＋ Añadir lección</button>${CX.acadData.isCustom(role==='admin'?(CX._acadAud||'admin'):role,course.id)?`<button class="btn btn-ghost btn-sm" id="delLsn" style="color:var(--red)" ${lessons.length<2?'disabled title="No se puede eliminar la única lección"':''}>🗑 Eliminar lección</button><button class="btn btn-ghost btn-sm" id="viewDelLsn">♻️ Lecciones eliminadas</button>`:''}</div></div>`:''}
      <div class="acad-content">${lesson.content}</div>
      <div class="between" style="margin-top:20px;padding-top:14px;border-top:1px solid var(--border-2)">
        ${li>0?`<button class="btn btn-ghost btn-sm" id="prevL">← Anterior</button>`:'<div></div>'}
        <button class="btn btn-pr btn-sm" id="nextL">${li<lessons.length-1?'Siguiente lección →':'Ver evaluación →'}</button>
      </div>
    </div>`;

  const wireContent=(course,lesson,li,lessons)=>{
    setProg(lesson.id,100);
    host.querySelector('#nextL')?.addEventListener('click',()=>{if(li<lessons.length-1){openLesson=lessons[li+1].id;lessonPlayer(course);}});
    host.querySelector('#prevL')?.addEventListener('click',()=>{if(li>0){openLesson=lessons[li-1].id;lessonPlayer(course);}});
    const rr=role==='admin'?(CX._acadAud||'admin'):(role==='cliente'?'cliente':'shopper');
    host.querySelector('#delLsn')?.addEventListener('click',()=>ui.modal('🗑 Eliminar lección',`
      <p style="font-size:12px;color:var(--t2);margin-bottom:8px">"${lesson.n.replace(/"/g,'&quot;')}" se marcará como eliminada (recuperable desde "♻️ Lecciones eliminadas") — no se borra de forma irreversible.</p>
      <label class="lbl">Motivo (obligatorio)</label><textarea class="inp" id="dlMot" rows="2" placeholder="Ej. contenido duplicado, ya no aplica…"></textarea>
      <div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="dlOk" style="background:var(--red);border-color:var(--red)">Eliminar</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#dlOk').addEventListener('click',()=>{
      const m=(ov.querySelector('#dlMot').value||'').trim();
      if(!m){ ui.toast('El motivo es obligatorio','warn'); return; }
      const r=CX.acadData.delLesson(rr,course.id,lesson.id,m,CX.permissions.ctx());
      if(!r.ok){ ui.toast('🔒 '+r.error,'warn',4200); return; }
      close();openLesson=null;draw();ui.toast('Lección eliminada (recuperable) · auditado','');
    });}}));
    host.querySelector('#viewDelLsn')?.addEventListener('click',()=>{
      const custom=CX.acadData.getCustom(rr); const c=custom.find(x=>x.id===course.id);
      const deleted=(c&&c.lessons||[]).filter(l=>l._deleted);
      ui.modal('♻️ Lecciones eliminadas',`
        ${deleted.length?`<div style="display:flex;flex-direction:column;gap:8px">${deleted.map(l=>`<div class="between" style="padding:8px 10px;border:1px solid var(--border);border-radius:8px"><span style="font-size:12.5px">${l.ic||'📄'} ${l.n}</span><button class="btn btn-ghost btn-sm restLsn" data-lid="${l.id}">♻️ Restaurar</button></div>`).join('')}</div>`
        :'<p style="font-size:12.5px;color:var(--t3)">No hay lecciones eliminadas en este curso.</p>'}
      `,{onMount:(ov,close)=>{ov.querySelectorAll('.restLsn').forEach(b=>b.addEventListener('click',()=>{
        close();
        ui.modal('♻️ Restaurar lección',`<label class="lbl">Motivo (obligatorio)</label><textarea class="inp" id="rlMot" rows="2" placeholder="Ej. vuelve a ser vigente…"></textarea><div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="rlOk">Restaurar</button></div>`,{onMount:(o2,c2)=>{o2.querySelector('#rlOk').addEventListener('click',()=>{
          const m=(o2.querySelector('#rlMot').value||'').trim();
          if(!m){ ui.toast('El motivo es obligatorio','warn'); return; }
          const r=CX.acadData.restoreLesson(rr,course.id,b.dataset.lid,m,CX.permissions.ctx());
          if(!r.ok){ ui.toast('🔒 '+r.error,'warn',4200); return; }
          c2();draw();ui.toast('Lección restaurada · auditado','ok');
        });}});
      }));}});
    });
    host.querySelector('#editLsn')?.addEventListener('click',()=>ui.modal('✎ Editar lección',`
      <label class="lbl">Título</label><input class="inp" id="elT" value="${lesson.n.replace(/"/g,'&quot;')}" style="margin-bottom:8px">
      <label class="lbl">Icono</label><input class="inp" id="elI" value="${lesson.ic||''}" style="max-width:80px;margin-bottom:8px">
      <label class="lbl">Contenido</label>
      <div style="border:1px solid var(--border);border-radius:9px;overflow:hidden;margin-bottom:10px">
        <div class="flex" style="background:var(--panel-2);border-bottom:1px solid var(--border);padding:6px 8px;gap:4px;flex-wrap:wrap" id="wys-tb">
          <button class="btn btn-ghost btn-sm" data-cmd="bold" style="font-weight:700;min-width:28px" title="Negrita">B</button>
          <button class="btn btn-ghost btn-sm" data-cmd="italic" style="font-style:italic;min-width:28px" title="Cursiva">I</button>
          <button class="btn btn-ghost btn-sm" data-cmd="h2" title="Título">H2</button>
          <button class="btn btn-ghost btn-sm" data-cmd="h3" title="Subtítulo">H3</button>
          <button class="btn btn-ghost btn-sm" data-cmd="ul">• Lista</button>
          <button class="btn btn-ghost btn-sm" data-cmd="ol">1. Num</button>
          <button class="btn btn-ghost btn-sm" data-cmd="hr" title="Separador">─</button>
          <button class="btn btn-ghost btn-sm" data-cmd="clr" style="font-size:10px;color:var(--t3)" title="Limpiar formato">Tx</button>
        </div>
        <div id="elEditor" contenteditable="true" class="acad-content" style="min-height:200px;max-height:340px;overflow-y:auto;padding:14px 16px;outline:none;line-height:1.7">${lesson.content||'<p>Contenido de la lección…</p>'}</div>
      </div>
      <div style="background:var(--panel-2);border-radius:9px;padding:10px 12px;margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:6px">📎 Cambiar / añadir recurso embebido</div>
        <input class="inp" id="elVU" placeholder="URL de video (YouTube/Vimeo/HeyGen)" style="margin-bottom:6px">
        <div class="flex" style="gap:6px;flex-wrap:wrap">
          <label class="btn btn-soft btn-sm" style="cursor:pointer">🎥 Subir video<input type="file" id="elVF" accept="video/*" style="display:none"></label>
          <label class="btn btn-soft btn-sm" style="cursor:pointer">🖼 Subir imagen<input type="file" id="elIF" accept="image/*" style="display:none"></label>
          <label class="btn btn-soft btn-sm" style="cursor:pointer">📄 Adjuntar documento<input type="file" id="elDF" accept=".pdf,.doc,.docx" style="display:none"></label>
        </div>
        <div id="elResPrev" style="margin-top:8px"></div>
      </div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="elSave">Guardar</button></div>
    `,{onMount:(ov,close)=>{
      let newRes='';
      ov.querySelector('#elVU')?.addEventListener('blur',e=>{const u=e.target.value;if(u){const src=u.includes('embed')?u:u.replace('watch?v=','embed/').replace('youtu.be/','www.youtube-nocookie.com/embed/');newRes='<div class="acad-video"><iframe src="'+src+'" style="width:100%;aspect-ratio:16/9;border:none;border-radius:10px" allowfullscreen></iframe></div>';ov.querySelector('#elResPrev').innerHTML='<iframe src="'+src+'" style="width:100%;height:140px;border:0;border-radius:8px"></iframe>';}});
      ov.querySelector('#elVF')?.addEventListener('change',e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{newRes='<div class="acad-video"><video src="'+ev.target.result+'" controls style="width:100%;aspect-ratio:16/9;border-radius:10px"></video></div>';ov.querySelector('#elResPrev').innerHTML='<video src="'+ev.target.result+'" controls style="width:100%;max-height:160px;border-radius:8px"></video>';};r.readAsDataURL(f);}});
      ov.querySelector('#elIF')?.addEventListener('change',e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{newRes='<img src="'+ev.target.result+'" style="max-width:100%;border-radius:10px">';ov.querySelector('#elResPrev').innerHTML='<img src="'+ev.target.result+'" style="max-height:140px;border-radius:8px">';};r.readAsDataURL(f);}});
      ov.querySelector('#elDF')?.addEventListener('change',e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{newRes='<div style="padding:12px;border:1px solid var(--border);border-radius:8px"><a href="'+ev.target.result+'" target="_blank">📄 '+f.name+'</a><iframe src="'+ev.target.result+'" style="width:100%;height:50vh;border:0;border-radius:8px;margin-top:6px"></iframe></div>';ov.querySelector('#elResPrev').innerHTML='📄 '+f.name+' adjuntado';};r.readAsDataURL(f);}});
      ov.querySelector('#wys-tb').addEventListener('click',e=>{
        const btn=e.target.closest('[data-cmd]');if(!btn)return;
        const ed=ov.querySelector('#elEditor');ed.focus();
        const cmd=btn.dataset.cmd;
        if(cmd==='bold')document.execCommand('bold');
        else if(cmd==='italic')document.execCommand('italic');
        else if(cmd==='h2')document.execCommand('formatBlock',false,'h2');
        else if(cmd==='h3')document.execCommand('formatBlock',false,'h3');
        else if(cmd==='ul')document.execCommand('insertUnorderedList');
        else if(cmd==='ol')document.execCommand('insertOrderedList');
        else if(cmd==='hr')document.execCommand('insertHTML',false,'<hr style="border:none;border-top:1px solid var(--border-2);margin:12px 0">');
        else if(cmd==='clr')document.execCommand('removeFormat');
      });
      ov.querySelector('#elSave').addEventListener('click',()=>{
        let content=ov.querySelector('#elEditor').innerHTML;
        if(newRes)content=newRes+content;
        const rEd=CX.acadData.editLesson(rr,course.id,lesson.id,{n:ov.querySelector('#elT').value.trim()||lesson.n,ic:ov.querySelector('#elI').value||lesson.ic,content});
        if(!rEd.ok){ ui.toast('🔒 '+rEd.error,'warn',4200); return; }
        close();lessonPlayer(course);ui.toast('Lección actualizada','ok');
      });
    }}));
    host.querySelector('#addLsn')?.addEventListener('click',()=>{
      let lsnType='texto';
      ui.modal('+ Nueva lección',`
        <div class="flex" style="gap:5px;margin-bottom:12px;flex-wrap:wrap">
          <button class="btn btn-sm btn-pr" data-lt="texto">Texto</button>
          <button class="btn btn-sm btn-ghost" data-lt="video">🎥 Video</button>
          <button class="btn btn-sm btn-ghost" data-lt="imagen">🖼 Imagen</button>
          <button class="btn btn-sm btn-ghost" data-lt="doc">📄 Documento</button>
          <button class="btn btn-sm btn-ghost" data-lt="quiz">❓ Quiz</button>
        </div>
        <label class="lbl">Título</label><input class="inp" id="nlT" placeholder="Título" style="margin-bottom:8px">
        <label class="lbl">Icono</label><input class="inp" id="nlI" value="📘" style="max-width:80px;margin-bottom:10px">
        <div id="lt-doc" style="display:none">
          <label class="lbl">Documento (PDF/imagen) — se embebe inline para lectura</label>
          <input type="file" class="inp" id="nlDF" accept="application/pdf,image/*" style="padding:7px;margin-bottom:6px">
          <div id="nlDP" style="font-size:11px;color:var(--t3)"></div>
        </div>
        <div id="lt-texto">
          <div class="flex" style="justify-content:space-between;margin-bottom:5px">
            <label class="lbl" style="margin:0">Contenido</label>
            <button class="btn btn-ghost btn-sm" id="nlAI">✨ Generar con IA</button>
          </div>
          <textarea class="inp" id="nlC" rows="6" placeholder="HTML o texto…"></textarea>
          <div class="flex" style="gap:6px;margin-top:6px">
            <button class="btn btn-ghost btn-sm" id="nlRef" style="display:none">🔄 Refinar</button>
            <button class="btn btn-ghost btn-sm" id="nlExp" style="display:none">+ Ampliar</button>
          </div>
        </div>
        <div id="lt-video" style="display:none">
          <label class="lbl">URL del video (YouTube, Vimeo, HeyGen)</label>
          <input class="inp" id="nlVU" placeholder="https://youtube.com/embed/..." style="margin-bottom:8px">
          <label class="btn btn-soft btn-sm" style="cursor:pointer;display:block;text-align:center">📤 Subir video<input type="file" id="nlVF" accept="video/*" style="display:none"></label>
          <div id="nlVP" style="margin-top:8px"></div>
        </div>
        <div id="lt-imagen" style="display:none">
          <label class="lbl">URL de imagen</label>
          <input class="inp" id="nlIU" placeholder="https://..." style="margin-bottom:8px">
          <label class="btn btn-soft btn-sm" style="cursor:pointer;display:block;text-align:center">🖼 Subir imagen<input type="file" id="nlIF" accept="image/*" style="display:none"></label>
          <div id="nlIP" style="margin-top:8px"></div>
        </div>
        <div id="lt-quiz" style="display:none">
          <div style="background:var(--brand-light);border-radius:9px;padding:9px 12px;font-size:12.5px;color:var(--brand-dark);margin-bottom:8px">✨ La evaluación se genera con IA a partir del contenido del curso. Puedes editarla después.</div>
          <div class="grid g2" style="gap:8px;margin-bottom:8px">
            <div><label class="lbl">Nº de preguntas</label><input class="inp" id="nlQn" type="number" value="5" min="1" max="30"></div>
            <div><label class="lbl">Nivel</label><select class="sel" id="nlQlvl"><option>Básico</option><option selected>Intermedio</option><option>Avanzado</option></select></div>
            <div><label class="lbl">Puntaje mínimo (%)</label><input class="inp" id="nlQgate" type="number" value="80" min="0" max="100"></div>
            <div><label class="lbl">Intentos permitidos</label><input class="inp" id="nlQtry" type="number" value="3" min="1" max="10"></div>
          </div>
          <textarea class="inp" id="nlQD" rows="3" placeholder="Qué debe evaluar o deja vacío para auto-generar…"></textarea>
        </div>
        <div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="nlSave">Agregar</button></div>`,
      {onMount:(ov,close)=>{
        ov.querySelectorAll('[data-lt]').forEach(b=>b.addEventListener('click',()=>{
          lsnType=b.dataset.lt;
          ov.querySelectorAll('[data-lt]').forEach(x=>x.className='btn btn-sm '+(x===b?'btn-pr':'btn-ghost'));
          ['texto','video','imagen','doc','quiz'].forEach(t=>{const el=ov.querySelector('#lt-'+t);if(el)el.style.display=t===lsnType?'block':'none';});
        }));
        ov.querySelector('#nlDF')?.addEventListener('change',e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{ov.querySelector('#nlDP').dataset.src=ev.target.result;ov.querySelector('#nlDP').dataset.pdf=(f.type==='application/pdf')?'1':'';ov.querySelector('#nlDP').textContent='📎 '+f.name+' · se embeberá inline';};r.readAsDataURL(f);}});
        ov.querySelector('#nlAI')?.addEventListener('click',()=>{
          const box=ov.querySelector('#nlC'),title=ov.querySelector('#nlT').value||'lección';
          box.placeholder='Generando…';
          /* P0.1 (V98): heurística local directa — nunca se llama CX.ai.ask() (available() es
             siempre false en el navegador). */
          const gen=()=>{box.value='<h2>'+title+'</h2>\n<p>Contenido generado con heurística local (sin proveedor de IA real conectado).</p>\n<ul><li>Punto clave 1</li><li>Punto clave 2</li><li>Punto clave 3</li></ul>';['#nlRef','#nlExp'].forEach(s=>ov.querySelector(s)&&(ov.querySelector(s).style.display=''));ui.toast('Borrador local generado','ok');};
          setTimeout(gen,600);
        });
        ov.querySelector('#nlRef')?.addEventListener('click',()=>{const b=ov.querySelector('#nlC');b.value+='\n<p><em>Refinado: detalle añadido.</em></p>';ui.toast('Refinado','ok');});
        ov.querySelector('#nlExp')?.addEventListener('click',()=>{const b=ov.querySelector('#nlC');b.value+='\n<h3>Profundizando</h3>\n<p>Contenido ampliado.</p>';ui.toast('Ampliado','ok');});
        ov.querySelector('#nlVU')?.addEventListener('blur',e=>{const u=e.target.value;if(u){const src=u.includes('embed')?u:u.replace('watch?v=','embed/').replace('youtu.be/','www.youtube-nocookie.com/embed/');ov.querySelector('#nlVP').innerHTML='<iframe src="'+src+'" style="width:100%;height:180px;border:none;border-radius:8px" allowfullscreen></iframe>';}});
        ov.querySelector('#nlIF')?.addEventListener('change',e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{ov.querySelector('#nlIP').innerHTML='<img src="'+ev.target.result+'" style="max-width:100%;max-height:160px;border-radius:8px;object-fit:contain">';ov.querySelector('#nlIP').dataset.src=ev.target.result;};r.readAsDataURL(f);}});
        ov.querySelector('#nlVF')?.addEventListener('change',e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{ov.querySelector('#nlVP').innerHTML='<video src="'+ev.target.result+'" controls style="width:100%;max-height:180px;border-radius:8px"></video>';ov.querySelector('#nlVP').dataset.src=ev.target.result;};r.readAsDataURL(f);}});
        ov.querySelector('#nlSave')?.addEventListener('click',()=>{
          const t=(ov.querySelector('#nlT').value||'').trim();if(!t){ui.toast('Pon un título','warn');return;}
          let content='',tipo=lsnType;
          if(lsnType==='texto')content=ov.querySelector('#nlC').value||'<p>Contenido por completar.</p>';
          else if(lsnType==='video'){const upl=ov.querySelector('#nlVP')?.dataset.src;const u=ov.querySelector('#nlVU').value;
            if(upl)content='<div class="acad-video"><video src="'+upl+'" controls style="width:100%;aspect-ratio:16/9;border-radius:10px"></video></div>';
            else{const src=u?u.includes('embed')?u:u.replace('watch?v=','embed/').replace('youtu.be/','www.youtube-nocookie.com/embed/'):u;content=src?'<div class="acad-video"><iframe src="'+src+'" style="width:100%;aspect-ratio:16/9;border:none;border-radius:10px" allowfullscreen></iframe></div>':'';}}
          else if(lsnType==='imagen'){const upl=ov.querySelector('#nlIP')?.dataset.src;const u=ov.querySelector('#nlIU').value;content=(upl||u)?'<img src="'+(upl||u)+'" style="max-width:100%;border-radius:10px">':'';}
          else if(lsnType==='doc'){const src=ov.querySelector('#nlDP')?.dataset.src;const isPdf=ov.querySelector('#nlDP')?.dataset.pdf;tipo='texto';
            if(src&&isPdf)content='<iframe src="'+src+'" style="width:100%;height:70vh;border:0;border-radius:10px"></iframe>';
            else if(src)content='<img src="'+src+'" style="max-width:100%;border-radius:10px">';
            else content='<p>Documento por adjuntar.</p>';}
          else if(lsnType==='quiz'){tipo='quiz';content=ov.querySelector('#nlQD').value;}
          const rAddL=CX.acadData.addLesson(rr,course.id,{n:t,ic:ov.querySelector('#nlI').value||'📘',tipo,content});
          if(!rAddL.ok){ ui.toast('🔒 '+rAddL.error,'warn',4200); return; }
          close();lessonPlayer(course);ui.toast('Lección añadida','ok');
        });
      }});
    });
  };

  /* ── quiz per-question (Orbit style) ── */
  const quizView=(course,lesson,li,lessons)=>`
    <div class="card card-p">
      <div class="between" style="margin-bottom:16px">
        <div style="font-size:14px;font-weight:800;color:var(--t1)">📝 ${lesson.n}</div>
        <span style="font-size:12px;color:var(--t3)">${lesson.quiz.length} preguntas</span>
      </div>
      ${lesson.quiz.map((q,qi)=>`
        <div class="acad-question" id="qb${qi}" style="border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:16px">
          <div style="display:flex;gap:8px;margin-bottom:12px"><span style="color:var(--brand);font-size:16px">?</span><b style="font-size:13.5px;color:var(--t1);line-height:1.4">${qi+1}. ${q.q}</b></div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${q.o.map((o,oi)=>`<label data-qi="${qi}" data-oi="${oi}" class="acad-opt" style="display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border:1px solid var(--border);border-radius:9px;cursor:pointer">
              <input type="radio" name="q${qi}" value="${oi}" style="margin-top:3px;flex-shrink:0"> <span style="font-size:13px;color:var(--t1);line-height:1.4">${o}</span></label>`).join('')}
          </div>
          <button class="acad-verify btn btn-pr btn-sm" data-qi="${qi}" style="margin-top:12px">Verificar</button>
          <div class="acad-fb" id="fb${qi}" style="display:none;margin-top:12px;padding:12px 14px;border-radius:10px;font-size:13px;line-height:1.5"></div>
        </div>`).join('')}
      <div style="text-align:center;margin-top:20px"><button class="btn btn-green btn-sm" id="finQuiz" style="padding:10px 28px">Marcar completada ✓</button></div>
    </div>`;

  const wireQuiz=(course,lesson,li,lessons)=>{
    host.querySelectorAll('.acad-verify').forEach(b=>b.addEventListener('click',()=>{
      const qi=+b.dataset.qi;const q=lesson.quiz[qi];
      const sel=host.querySelector(`input[name="q${qi}"]:checked`);
      if(!sel){ui.toast('Elige una respuesta primero','warn');return;}
      const oi=+sel.value;const correct=(oi===q.a);
      const fb=host.getElementById(`fb${qi}`);
      const opts=host.querySelectorAll(`[data-qi="${qi}"]`);
      opts.forEach(opt=>{const isCorrect=+opt.dataset.oi===q.a;opt.style.background=isCorrect?'#f0faf4':+opt.dataset.oi===oi&&!correct?'#fef2f2':'';opt.style.borderColor=isCorrect?'var(--green)':+opt.dataset.oi===oi&&!correct?'var(--red)':'var(--border)';});
      fb.style.display='block';fb.style.background=correct?'#f0faf4':'#fef9ec';fb.style.borderLeft=`3px solid var(--${correct?'green':'amber'})`;
      fb.innerHTML=`<b style="color:var(--${correct?'green':'amber'})">${correct?'✅ Correcto':'💡 Respuesta a revisar'}</b><br><span style="color:var(--t2)">${q.exp}</span>`;
      b.disabled=true;b.textContent=correct?'✓ Correcto':'→ Revisado';
    }));
    host.querySelector('#finQuiz')?.addEventListener('click',()=>{setProg(lesson.id,100);setProg(course.id,100);ui.toast('🏆 Curso completado','ok');openLesson=null;openCourse=null;draw();});
  };

  /* ── Manuales: biblioteca por rol, lector in-app ── */
  const openManuales=()=>{
    const list=(CX.manualesData?CX.manualesData.all():[]);
    const roleVisible=role==='admin'?list:list.filter(m=>m.rol===role||m.rol==='superadmin'&&role==='admin');
    const visibles=role==='admin'?list:list.filter(m=>m.rol===role);
    const shown=visibles.length?visibles:list.filter(m=>m.rol==='m_'+role)||list;
    const finalList=role==='admin'?list:(visibles.length?visibles:list);
    ui.modal('📖 Manuales CXOrbia', `
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:14px">Manuales completos y legibles aquí mismo. ${role==='admin'?'Como administrador ves todos los manuales por rol.':'Ves el manual de tu rol.'}</p>
      <div style="display:grid;gap:10px">
        ${finalList.map(m=>`<button class="card hov manualPick" data-mid="${m.id}" style="padding:14px 16px;cursor:pointer;text-align:left;border:1px solid var(--border);background:#fff;display:flex;gap:12px;align-items:flex-start">
          <div style="font-size:24px">${m.ic}</div>
          <div><div style="font-size:13.5px;font-weight:700;color:var(--t1)">${m.titulo}</div>
          <div style="font-size:11.5px;color:var(--t3);margin-top:2px">${m.desc}</div>
          <div style="font-size:10.5px;color:var(--brand);font-weight:600;margin-top:4px">${(m.secciones||[]).length} secciones · Leer →</div></div>
        </button>`).join('')}
      </div>
      ${(CX.permissions&&CX.permissions.can('academy.edit',CX.permissions.ctx()))?`<div style="text-align:right;margin-top:12px"><button class="btn btn-pr btn-sm" id="manualNew">＋ Crear manual</button></div>`:''}
    `,{onMount:(ov,close)=>{
      ov.querySelectorAll('.manualPick').forEach(b=>b.addEventListener('click',()=>{close();readManual(b.dataset.mid);}));
      ov.querySelector('#manualNew')?.addEventListener('click',()=>{close();crearManual();});
    }});
  };
  /* ── Crear manual: desde idea/texto/recurso, visibilidad por rol, con IA ── */
  const crearManual=()=>{
    let lsnType='texto';
    ui.modal('📘 Crear manual', `
      <label class="lbl">Título del manual</label><input class="inp" id="cmT" placeholder="Ej. Manual operativo del programa" style="margin-bottom:8px">
      <div class="grid g2" style="gap:8px;margin-bottom:8px">
        <div><label class="lbl">Icono</label><input class="inp" id="cmI" value="📘" style="max-width:80px"></div>
        <div><label class="lbl">¿Quién lo ve?</label><select class="sel" id="cmRol"><option value="superadmin">Super Admin</option><option value="admin">Equipo administrativo</option><option value="ops">Operativo</option><option value="coordinador">Coordinador/Representante</option><option value="aliado">Aliado/Franquiciado</option><option value="shopper">Shopper</option><option value="cliente">Cliente (portal)</option></select></div>
      </div>
      <label class="lbl">Descripción</label><input class="inp" id="cmD" placeholder="De qué trata" style="margin-bottom:10px">
      <div style="border-top:1px solid var(--border-2);padding-top:10px;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:6px">Contenido inicial</div>
        <div class="flex" style="gap:5px;margin-bottom:8px;flex-wrap:wrap">
          <button class="btn btn-sm btn-pr cmSrc" data-s="texto">✍️ Desde idea/texto</button>
          <button class="btn btn-sm btn-ghost cmSrc" data-s="recurso">📎 Desde recurso</button>
          <button class="btn btn-sm btn-ghost cmSrc" data-s="vacio">Vacío</button>
        </div>
        <div id="cmTextoWrap"><textarea class="inp" id="cmTexto" rows="4" placeholder="Pega el texto, describe la idea o el temario… la IA lo estructura en secciones" style="margin-bottom:6px"></textarea></div>
        <div id="cmRecWrap" style="display:none"><label class="btn btn-soft btn-sm" style="cursor:pointer">📎 Subir documento/recurso<input type="file" id="cmRecF" accept=".pdf,.doc,.docx,.txt,image/*" style="display:none"></label><div id="cmRecName" style="font-size:11px;color:var(--t3);margin-top:5px"></div></div>
        <label class="flex" style="gap:8px;font-size:12px;margin-top:8px"><input type="checkbox" id="cmIA"> Estructurar en secciones (heurística local, sin proveedor de IA real)</label>
      </div>
      <div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="cmOk">Crear manual</button></div>
    `,{onMount:(ov,close)=>{
      ov.querySelectorAll('.cmSrc').forEach(b=>b.addEventListener('click',()=>{lsnType=b.dataset.s;ov.querySelectorAll('.cmSrc').forEach(x=>x.className='btn btn-sm '+(x===b?'btn-pr':'btn-ghost'));ov.querySelector('#cmTextoWrap').style.display=lsnType==='texto'?'block':'none';ov.querySelector('#cmRecWrap').style.display=lsnType==='recurso'?'block':'none';}));
      let recTxt='';
      ov.querySelector('#cmRecF')?.addEventListener('change',e=>{const f=e.target.files[0];if(f){ov.querySelector('#cmRecName').textContent='📎 '+f.name+' · leyendo…';if(CX.ai&&CX.ai.readAttachment){CX.ai.readAttachment(e.target).then(txt=>{recTxt=txt||('[Documento: '+f.name+']');ov.querySelector('#cmRecName').textContent='📎 '+f.name+' · listo';});}else{const r=new FileReader();r.onload=ev=>recTxt=ev.target.result;r.readAsText(f);}}});
      ov.querySelector('#cmOk').addEventListener('click',()=>{
        const t=(ov.querySelector('#cmT').value||'').trim();if(!t){ui.toast('Pon un título','warn');return;}
        const rol=ov.querySelector('#cmRol').value, ic=ov.querySelector('#cmI').value||'📘', desc=ov.querySelector('#cmD').value||'Manual';
        const fuente=(lsnType==='recurso'?recTxt:(ov.querySelector('#cmTexto').value||'')).trim();
        /* P0.1 (V98): "Estructurar" ya no depende de una preferencia de proveedor — la heurística
           local (partir por líneas en blanco/oraciones) siempre está disponible. */
        const usarIA=ov.querySelector('#cmIA').checked && fuente;
        const finalizar=(secciones)=>{const m=CX.manualesData.add({rol,ic,titulo:t,desc,secciones});close();ui.toast('Manual creado','ok');openManuales();};
        if(usarIA){
          const parts=fuente.split(/\n{2,}/).filter(Boolean);
          const secs=parts.map((p,i)=>({t:'Sección '+(i+1),html:'<p>'+p.trim()+'</p>'}));
          ui.toast('Estructurado con heurística local (sin proveedor de IA real conectado)','',3000);
          finalizar(secs.length?secs:[{t:'Sección 1',html:'<p>'+(fuente||'Contenido por completar.')+'</p>'}]);
        } else {
          finalizar([{t:'Sección 1',html:fuente?'<p>'+fuente.replace(/\n/g,'</p><p>')+'</p>':'<p>Contenido por completar. Usa ✎ Editar sección.</p>'}]);
        }
      });
    }});
  };

  const readManual=(mid)=>{
    const m=(CX.manualesData.all()).find(x=>x.id===mid); if(!m)return;
    let secIdx=0;
    const render=()=>{
      const sec=m.secciones[secIdx]||{t:'',html:''};
      const pct=Math.round((secIdx+1)/m.secciones.length*100);
      host.innerHTML=`
        <div style="background:linear-gradient(135deg,#1a2740,#0d1b2e);border-radius:14px;padding:16px 20px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">
          <div class="flex" style="gap:12px;align-items:center">
            <button class="btn btn-sm" style="background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)" id="manBack">← Volver</button>
            <div><div style="font-size:15px;font-weight:800;color:#fff">${m.ic} ${m.titulo}</div><div style="font-size:11px;color:#94a3b8">${m.desc||''}</div></div>
          </div>
          <div style="text-align:right"><div style="font-size:12px;color:#fff">${secIdx+1}/${m.secciones.length}</div>
            <div style="width:120px;height:4px;background:rgba(255,255,255,.2);border-radius:4px;margin-top:5px"><div style="height:4px;border-radius:4px;background:var(--brand);width:${pct}%"></div></div></div>
        </div>
        <div style="display:grid;grid-template-columns:230px 1fr;gap:18px;align-items:flex-start">
          <div class="card card-p" style="position:sticky;top:10px">
            <div style="font-size:10px;font-weight:800;color:var(--t3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px">CONTENIDO</div>
            ${m.secciones.map((s,i)=>`<div class="manSec" data-si="${i}" style="padding:9px 11px;border-radius:9px;cursor:pointer;margin-bottom:4px;font-size:12px;background:${i===secIdx?'var(--brand)':'transparent'};color:${i===secIdx?'#fff':'var(--t1)'};font-weight:${i===secIdx?'700':'400'}">${i+1}. ${s.t.replace(/^\d+\s*·\s*/,'')}</div>`).join('')}
            ${(CX.permissions&&CX.permissions.can('academy.edit',CX.permissions.ctx()))?`<button class="btn btn-ghost btn-sm" id="manAddSec" style="width:100%;margin-top:8px;border-style:dashed">＋ Sección</button>`:''}
          </div>
          <div class="card card-p">
            <div class="between" style="margin-bottom:12px"><h2 style="font-size:19px;font-weight:800;margin:0">${sec.t}</h2>${(CX.permissions&&CX.permissions.can('academy.edit',CX.permissions.ctx()))?`<button class="btn btn-ghost btn-sm" id="manEditSec">✎ Editar sección</button>`:''}</div>
            <div class="acad-content" style="font-size:14px;line-height:1.75;color:var(--t1)">${sec.html}</div>
            <div class="between" style="margin-top:22px;border-top:1px solid var(--border-2);padding-top:14px">
              <button class="btn btn-ghost btn-sm" id="mPrev" ${secIdx===0?'disabled':''}>← Anterior</button>
              <button class="btn btn-soft btn-sm" id="manPrint">🖨 Imprimir / PDF</button>
              <button class="btn btn-pr btn-sm" id="mNext" ${secIdx===m.secciones.length-1?'disabled':''}>Siguiente →</button>
            </div>
          </div>
        </div>`;
      host.querySelector('#manBack').addEventListener('click',()=>{openManuales();});
      host.querySelectorAll('.manSec').forEach(b=>b.addEventListener('click',()=>{secIdx=+b.dataset.si;render();}));
      host.querySelector('#mPrev')?.addEventListener('click',()=>{if(secIdx>0){secIdx--;render();}});
      host.querySelector('#mNext')?.addEventListener('click',()=>{if(secIdx<m.secciones.length-1){secIdx++;render();}});
      host.querySelector('#manPrint')?.addEventListener('click',()=>window.print());
      host.querySelector('#manAddSec')?.addEventListener('click',()=>{m.secciones.push({t:'Nueva sección',html:'<p>Contenido…</p>'});CX.manualesData.saveCustom(CX.manualesData.getCustom());secIdx=m.secciones.length-1;render();});
      host.querySelector('#manEditSec')?.addEventListener('click',()=>ui.modal('✎ Editar sección',`
        <label class="lbl">Título</label><input class="inp" id="msT" value="${(sec.t||'').replace(/"/g,'&quot;')}" style="margin-bottom:10px">
        <label class="lbl">Contenido</label>
        <div id="msEd" contenteditable="true" class="acad-content" style="min-height:220px;max-height:50vh;overflow:auto;border:1px solid var(--border);border-radius:9px;padding:12px;outline:none;line-height:1.7">${sec.html}</div>
        <div class="between" style="margin-top:10px"><button class="btn btn-ghost btn-sm" id="msDel" style="color:var(--red)">🗑 Eliminar sección</button><button class="btn btn-pr btn-sm" id="msSave">Guardar</button></div>
      `,{onMount:(ov,close)=>{
        ov.querySelector('#msSave').addEventListener('click',()=>{sec.t=ov.querySelector('#msT').value||sec.t;sec.html=ov.querySelector('#msEd').innerHTML;if(m.custom)CX.manualesData.saveCustom(CX.manualesData.getCustom());close();render();ui.toast('Sección actualizada','ok');});
        ov.querySelector('#msDel').addEventListener('click',()=>{if(m.secciones.length>1){m.secciones.splice(secIdx,1);secIdx=Math.max(0,secIdx-1);if(m.custom)CX.manualesData.saveCustom(CX.manualesData.getCustom());close();render();ui.toast('Sección eliminada','');}});
      }}));
    };
    render();
  };

  /* ── lista de cursos ── */
  const draw=()=>{
    if(openLesson){const c=getCourses().find(x=>x.id===openCourse);if(c)return lessonPlayer(c);}
    if(openCourse){const c=getCourses().find(x=>x.id===openCourse);if(c)return lessonPlayer(c);}
    const courses=getCourses();
    /* visibilidad de gestión a nivel de módulo (crear categoría, crear manual, etc.) — mismo
       criterio que canManage por tarjeta: deriva del permiso real, no de role==='admin' crudo. */
    const canManageTop = role==='admin' && CX.permissions && CX.permissions.can('academy.edit', CX.permissions.ctx());
    const filtered=activeCat==='Todos'?courses:courses.filter(c=>c.cat===activeCat);
    const totalLessons=courses.reduce((a,c)=>a+(c.lessons||[]).length,0);
    const completedCourses=courses.filter(c=>prog()[c.id]>=100).length;
    const completedLessons=courses.reduce((a,c)=>a+(c.lessons||[]).filter(l=>prog()[l.id]>=100).length,0);
    const avgProg=courses.length?Math.round(courses.reduce((a,c)=>{const ls=c.lessons||[];const done=ls.filter(l=>prog()[l.id]>=100).length;return a+(ls.length?done/ls.length*100:0);},0)/courses.length):0;
    const certs=courses.filter(c=>c.cert&&prog()[c.id]>=100).length;

    host.innerHTML=`
      <div style="background:linear-gradient(135deg,#1a2740,#0d1b2e);border-radius:14px;padding:20px 24px;margin-bottom:16px">
        <div class="between" style="margin-bottom:14px">
          <div><div style="font-size:18px;font-weight:900;color:#fff">🎓 Academia CXOrbia <span style="font-size:13px;font-weight:400;color:#94a3b8">Capacitación, certificaciones y recursos</span></div></div>
          <div class="flex" style="gap:8px">
            <button class="btn btn-sm" style="background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.3)" id="acadManuales">📖 Manuales</button>
            ${role==='admin'?`<select class="sel" id="acadAud" style="width:auto" title="A quién se dirigen los cursos"><option value="admin" ${(CX._acadAud||'admin')==='admin'?'selected':''}>🏢 Consultora</option><option value="shopper" ${CX._acadAud==='shopper'?'selected':''}>🕵️ Shopper</option><option value="cliente" ${CX._acadAud==='cliente'?'selected':''}>🏬 Cliente</option></select><button class="btn btn-sm ${showArchived?'':''}" style="background:rgba(255,255,255,${showArchived?'.3':'.1'});color:#fff;border-color:rgba(255,255,255,.25)" id="acadShowArch" title="Cursos personalizados archivados">🗄 ${showArchived?'Ocultar':'Ver'} archivados</button><button class="btn btn-sm" style="background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.3)" id="acadNew">✨ Crear con IA</button><button class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)" id="acadLoad">⤒ Cargar recurso</button>`:''}
          </div>
        </div>
        <div class="grid g4">
          <div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:800;color:#fff">${courses.length}</div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px">Cursos</div><div style="font-size:11px;color:#64748b">${completedCourses} completados</div></div>
          <div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:800;color:${avgProg>=80?'#34d399':'#fbbf24'}">${avgProg}%</div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px">Avance promedio</div><div style="font-size:11px;color:#64748b">del equipo</div></div>
          <div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:800;color:#a78bfa">${certs}</div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px">Certificaciones</div><div style="font-size:11px;color:#64748b">obtenidas</div></div>
          <div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:800;color:#fff">${totalLessons}</div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px">Lecciones</div><div style="font-size:11px;color:#64748b">${completedLessons} completadas</div></div>
        </div>
      </div>
      <div class="flex wrap" style="gap:6px;margin-bottom:16px">
        ${CX.acadData.CATS.filter(c=>c==='Todos'||courses.some(x=>x.cat===c)).map(c=>`<button class="btn btn-sm acad-cat ${activeCat===c?'btn-pr':'btn-ghost'}" data-cat="${c}">${c}</button>`).join('')}
        ${canManageTop?`<button class="btn btn-sm btn-ghost" id="acadNewCat" style="border-style:dashed">＋ Categoría</button>`:''}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
        ${filtered.map(c=>{
          const ls=c.lessons||[];const done=ls.filter(l=>prog()[l.id]>=100).length;const pct=ls.length?Math.round(done/ls.length*100):0;
          /* visibilidad de acciones de gestión (Academia — cierre de pendiente auditoría V101):
             antes se mostraban por role==='admin' crudo, que sigue siendo 'admin' incluso cuando
             un coordinador/aliado/ops navega en modo prueba sobre el shell admin (session.role
             no cambia, solo session.testRole). Ahora se deriva del permiso real de acción —
             el mismo chequeo que ya hacía el handler — para que el botón coincida con lo que
             realmente va a pasar al hacer clic. */
          const canManage = role==='admin' && CX.permissions && CX.permissions.can('academy.edit', CX.permissions.ctx());
          const isCustom=canManage&&CX.acadData.isCustom(CX._acadAud||'admin',c.id);
          const estadoLbl={borrador:'📝 Borrador',en_revision:'👀 En revisión',aprobado:'✅ Aprobado',archivado:'🗄 Archivado',eliminado:'🗑 Eliminado',publicado_preview:'✓ Publicado (preview)'}[c.estado]||'';
          return `<div class="card hov" data-course="${c.id}" style="cursor:pointer;overflow:hidden;${c.estado==='archivado'||c.estado==='eliminado'?'opacity:.6':''}">
            <div style="background:linear-gradient(135deg,${c.color},${c.color}99);padding:18px 18px 14px;position:relative">
              <div class="between" style="margin-bottom:8px"><span style="background:rgba(255,255,255,.22);color:#fff;border-radius:20px;padding:3px 11px;font-size:11px;font-weight:700">${c.ic} ${c.cat}</span><div class="flex" style="gap:6px;align-items:center">${c.cert&&pct>=100?'<span style="font-size:18px">🏅</span>':''}${canManage?`<button class="acad-dup" data-cid="${c.id}" title="Duplicar curso" style="background:rgba(255,255,255,.25);border:none;color:#fff;width:26px;height:26px;border-radius:8px;cursor:pointer;font-size:12px;line-height:1">🧬</button>`:''}${isCustom?((c.estado==='archivado'||c.estado==='eliminado')?`<button class="acad-restore" data-cid="${c.id}" title="Restaurar curso" style="background:rgba(255,255,255,.25);border:none;color:#fff;width:26px;height:26px;border-radius:8px;cursor:pointer;font-size:12px;line-height:1">♻️</button>`:`<button class="acad-arch" data-cid="${c.id}" title="Archivar curso" style="background:rgba(255,255,255,.25);border:none;color:#fff;width:26px;height:26px;border-radius:8px;cursor:pointer;font-size:12px;line-height:1">🗄</button>`):''}${canManage?`<button class="acad-edit" data-cid="${c.id}" title="Editar / eliminar curso" style="background:rgba(255,255,255,.25);border:none;color:#fff;width:26px;height:26px;border-radius:8px;cursor:pointer;font-size:13px;line-height:1">✎</button>`:''}</div></div>
              <div style="font-size:16px;font-weight:800;color:#fff">${c.n}</div>
              <div style="font-size:12px;color:rgba(255,255,255,.8);margin-top:4px">${c.desc}</div>
            </div>
            <div class="card-p" style="padding:14px 16px">
              <div style="font-size:11.5px;color:var(--t3);margin-bottom:10px">${ls.length} lecciones · ${typeof c.mins==='number'?c.mins:Math.max(10,ls.length*12)} min ${c.cert?'· 🏅 certifica':''} ${estadoLbl?'· '+estadoLbl+((c.contentVersion>1||c.workflowVersion>1)?' · contenido v'+(c.contentVersion||1)+' · flujo v'+(c.workflowVersion||1):''):''}</div>
              <div style="background:var(--border-2);border-radius:4px;height:6px;margin-bottom:6px"><div style="height:6px;border-radius:4px;background:${pct>=100?'var(--green)':c.color};width:${pct}%;transition:width .4s"></div></div>
              <div style="font-size:11.5px;color:var(--t3)">${pct>=100?'✅ Completado':pct>0?pct+'% completado':'Comenzar'}</div>
            </div>
          </div>`;}).join('')}
      </div>`;

    host.querySelector('#acadManuales')?.addEventListener('click',()=>openManuales());
    host.querySelector('#acadShowArch')?.addEventListener('click',()=>{showArchived=!showArchived;draw();});
    host.querySelectorAll('.acad-dup').forEach(b=>b.addEventListener('click',(e)=>{e.stopPropagation();const rr=role==='admin'?(CX._acadAud||'admin'):role;const copy=CX.acadData.duplicateCourse(rr,b.dataset.cid,CX.permissions.ctx());draw();ui.toast(copy?'Curso duplicado como borrador: "'+copy.n+'"':'No se pudo duplicar','ok');}));
    host.querySelectorAll('.acad-arch').forEach(b=>b.addEventListener('click',(e)=>{e.stopPropagation();const rr=role==='admin'?(CX._acadAud||'admin'):role;
      ui.modal('🗄 Archivar curso',`<label class="lbl">Motivo (obligatorio)</label><textarea class="inp" id="archMot" rows="2" placeholder="Ej. contenido desactualizado, se reemplaza por otro curso…"></textarea><div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="archOk">Archivar</button></div>`,{onMount:(ov,close)=>{ov.querySelector('#archOk').addEventListener('click',()=>{const m=(ov.querySelector('#archMot').value||'').trim();if(!m){ui.toast('El motivo es obligatorio','warn');return;}const r=CX.acadData.archiveCourse(rr,b.dataset.cid,m,CX.permissions.ctx());if(!r){ui.toast('🔒 No se pudo archivar (permiso o transición no válida)','warn',4200);return;}close();draw();ui.toast('Curso archivado · auditado','ok');});}});
    }));
    host.querySelectorAll('.acad-restore').forEach(b=>b.addEventListener('click',(e)=>{e.stopPropagation();const rr=role==='admin'?(CX._acadAud||'admin'):role;
      ui.modal('♻️ Restaurar curso',`<p style="font-size:12px;color:var(--t2);margin-bottom:6px">El curso vuelve a estado <b>Borrador</b> — desde ahí sigue el flujo normal (enviar a revisión → aprobar → publicar).</p><label class="lbl">Motivo (obligatorio)</label><textarea class="inp" id="resMot" rows="2" placeholder="Ej. vuelve a ser vigente…"></textarea><div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="resOk">Restaurar a borrador</button></div>`,{onMount:(ov,close)=>{ov.querySelector('#resOk').addEventListener('click',()=>{
        const m=(ov.querySelector('#resMot').value||'').trim();
        if(!m){ ui.toast('El motivo es obligatorio','warn'); return; }
        const r=CX.acadData.setCourseState(rr,b.dataset.cid,'borrador',{reason:m,ctx:CX.permissions.ctx()});
        if(!r.ok){ ui.toast('🔒 '+r.error,'warn',4200); return; }
        close();draw();ui.toast('Curso restaurado a Borrador · auditado','ok');
      });}});
    }));
    host.querySelector('#acadAud')?.addEventListener('change',e=>{CX._acadAud=e.target.value;activeCat='Todos';openCourse=null;openLesson=null;draw();});
    host.querySelectorAll('[data-course]').forEach(c=>c.addEventListener('click',()=>{openCourse=c.dataset.course;const course=getCourses().find(x=>x.id===openCourse);if(course){openLesson=course.lessons[0].id;lessonPlayer(course);}}));
    host.querySelectorAll('.acad-cat').forEach(b=>b.addEventListener('click',()=>{activeCat=b.dataset.cat;draw();}));
    host.querySelector('#acadNewCat')?.addEventListener('click',()=>ui.modal('＋ Nueva categoría',`
      <label class="lbl">Nombre de la categoría</label><input class="inp" id="ncatN" placeholder="Ej. Investigación de mercados" style="margin-bottom:12px">
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="ncatSave">Crear</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#ncatSave').addEventListener('click',()=>{const n=(ov.querySelector('#ncatN').value||'').trim();if(!n){ui.toast('Pon un nombre','warn');return;}if(!CX.acadData.CATS.includes(n))CX.acadData.CATS.push(n);try{localStorage.setItem('cx_acad_cats',JSON.stringify(CX.acadData.CATS));}catch(e){}close();draw();ui.toast('Categoría "'+n+'" creada','ok');})}));
    host.querySelectorAll('.acad-edit').forEach(b=>b.addEventListener('click',(e)=>{e.stopPropagation();const rr=role==='admin'?(CX._acadAud||'admin'):(role==='cliente'?'cliente':'shopper');const cc=getCourses().find(x=>x.id===b.dataset.cid);if(!cc)return;
      ui.modal('✎ Editar curso',`<div class="grid g2" style="gap:8px 12px"><div><label class="lbl">Nombre</label><input class="inp" id="ecN" value="${(cc.n||'').replace(/"/g,'&quot;')}"></div><div><label class="lbl">Categoría</label><select class="sel" id="ecC">${CX.acadData.CATS.filter(c=>c!=='Todos').map(c=>`<option ${c===cc.cat?'selected':''}>${c}</option>`).join('')}</select></div><div style="grid-column:1/3"><label class="lbl">Descripción</label><textarea class="inp" id="ecD" rows="2">${cc.desc||''}</textarea></div>${CX.acadData.isCustom(rr,cc.id)?`<div style="grid-column:1/3;font-size:10.5px;color:var(--t3)">Estado: <b>${({borrador:'📝 Borrador',en_revision:'👀 En revisión',aprobado:'✅ Aprobado',archivado:'🗄 Archivado',eliminado:'🗑 Eliminado',publicado_preview:'✓ Publicado (preview)'}[cc.estado]||'—')}</b> · contenido v${cc.contentVersion||1} · flujo v${cc.workflowVersion||1}${cc.auditRef?' · '+cc.auditRef:''}</div>
        <div style="grid-column:1/3;display:flex;gap:6px;flex-wrap:wrap;margin-top:2px">${(CX.acadData.ALLOWED_TRANSITIONS[cc.estado||'borrador']||[]).filter(s=>s!=='archivado'&&s!=='eliminado').map(s=>`<button class="btn btn-soft btn-sm acadTrans" data-to="${s}" style="font-size:10.5px;padding:4px 9px">→ ${({borrador:'Borrador',en_revision:'Enviar a revisión',aprobado:'Aprobar',publicado_preview:'Publicar (preview)'}[s]||s)}</button>`).join('')}</div>`:''}</div><div style="text-align:right;margin-top:10px;display:flex;justify-content:space-between">${CX.acadData.isCustom(rr,cc.id)?'<button class="btn btn-ghost btn-sm" id="ecDel" style="color:var(--red)">🗑 Eliminar</button>':'<span></span>'}<button class="btn btn-pr btn-sm" id="ecSave">Guardar</button></div>`,{onMount:(ov,close)=>{ov.querySelector('#ecSave').addEventListener('click',()=>{const r=CX.acadData.editCourse(rr,cc.id,{n:ov.querySelector('#ecN').value.trim(),cat:ov.querySelector('#ecC').value,desc:ov.querySelector('#ecD').value.trim()});if(!r.ok){ui.toast('🔒 '+r.error,'warn',4200);return;}close();draw();ui.toast('Curso actualizado · auditado','ok');});
      ov.querySelectorAll('.acadTrans').forEach(b=>b.addEventListener('click',()=>{
        const to=b.dataset.to;
        close();
        ui.modal('Cambiar estado → '+to,`<p style="font-size:12px;color:var(--t2);margin-bottom:8px">"${(cc.n||'').replace(/"/g,'&quot;')}" pasará a estado <b>${to}</b>.</p><label class="lbl">Motivo</label><textarea class="inp" id="trMot" rows="2" placeholder="Explica el cambio de estado…"></textarea><div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="trOk">Confirmar</button></div>`,{onMount:(o2,c2)=>{o2.querySelector('#trOk').addEventListener('click',()=>{
          const m=(o2.querySelector('#trMot').value||'').trim();
          const r=CX.acadData.setCourseState(rr,cc.id,to,{reason:m,ctx:CX.permissions.ctx()});
          if(!r.ok){ ui.toast('🔒 '+r.error,'warn',4200); return; }
          c2();draw();ui.toast('Curso → '+to+' · auditado','ok');
        });}});
      }));
      ov.querySelector('#ecDel')?.addEventListener('click',()=>{
        close();
        ui.modal('🗑 Eliminar curso',`<p style="font-size:12px;color:var(--t2);margin-bottom:8px">"${(cc.n||'').replace(/"/g,'&quot;')}" se marcará como eliminado (recuperable desde "Ver archivados") — no se borra de forma irreversible.</p><label class="lbl">Motivo (obligatorio)</label><textarea class="inp" id="delMot" rows="2" placeholder="Ej. duplicado por error, contenido incorrecto…"></textarea><div style="text-align:right;margin-top:10px"><button class="btn btn-pr btn-sm" id="delOk" style="background:var(--red);border-color:var(--red)">Eliminar</button></div>`,{onMount:(o2,c2)=>{o2.querySelector('#delOk').addEventListener('click',()=>{const m=(o2.querySelector('#delMot').value||'').trim();if(!m){ui.toast('El motivo es obligatorio','warn');return;}const rDel=CX.acadData.delCourse(rr,cc.id,m,CX.permissions.ctx());if(!rDel){ui.toast('🔒 No se pudo eliminar (permiso o transición no válida)','warn',4200);return;}c2();draw();ui.toast('Curso eliminado (recuperable) · auditado','');});}});
      });}});
    }));
    host.querySelector('#acadNew')?.addEventListener('click',()=>ui.modal('✨ Crear módulo con IA',`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Carga material (PDF, video, texto) y la IA genera un curso completo con lecciones profundas y evaluación.</p>
      <input type="file" id="aiCourseF" class="inp" accept=".pdf,.doc,.docx,.txt,image/*" style="padding:7px;margin-bottom:8px">
      <textarea class="inp" id="aiT" rows="3" placeholder="o describe el tema que quieres desarrollar…" style="margin-bottom:10px"></textarea>
      <div style="text-align:right"><button class="btn btn-green btn-sm" id="aiGo">Generar curso</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#aiGo').addEventListener('click',()=>{
      const pasted=(ov.querySelector('#aiT').value||'').trim();
      /* P0.1 (V98): heurística local directa — nunca se llama CX.ai.ask() (available() es
         siempre false en el navegador); nunca bloquea por falta de proveedor configurado. */
      ui.toast('Leyendo material y generando borrador local…','',2000);
      CX.ai.readAttachment(ov.querySelector('#aiCourseF')).then(fileTxt=>{
        const tema=(pasted+fileTxt).trim();
        if(!tema){ui.toast('Describe el tema o adjunta material','warn');return;}
        /* parte el tema/material en 3-4 bloques y arma lecciones + un quiz genérico */
        const chunks=tema.split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/).map(s=>s.trim()).filter(s=>s.length>20);
        const per=Math.max(1,Math.ceil(chunks.length/3));
        const bloques=[]; for(let i=0;i<chunks.length;i+=per) bloques.push(chunks.slice(i,i+per).join(' '));
        let res=(bloques.length?bloques:[tema]).map((b,i)=>'## Parte '+(i+1)+'\n<p>'+b+'</p>').join('\n\n');
        res+='\n\n## Evaluación\n<p>Repasa los puntos anteriores antes de continuar.</p>';
        const parts=res.split(/##\s+/).filter(Boolean);
        const lessons=parts.map((p,i)=>{const nl=p.indexOf('\n');const n=p.slice(0,nl).trim()||'Lección '+(i+1);const html=p.slice(nl+1).trim();return {id:'l'+Date.now().toString(36)+i,n,ic:/quiz|evalua/i.test(n)?'❓':'📘',tipo:/quiz|evalua/i.test(n)?'quiz':'texto',content:'<div class="acad-content">'+html+'</div>'};});
        const rr=role==='admin'?(CX._acadAud||'admin'):(role==='cliente'?'cliente':'shopper');
        const rAdd=CX.acadData.addCourse(rr,{cat:activeCat==='Todos'?'IA':activeCat,ic:'✨',color:'#7c3aed',n:tema.slice(0,60),desc:'Borrador local (heurística, sin IA real)',lessons});
        if(!rAdd.ok){ ui.toast('🔒 '+rAdd.error,'warn',4200); return; }
        close();draw();ui.toast('Curso generado (borrador local) · revisa, itera y publica','ok',4000);
      });
    })}));
    host.querySelector('#acadLoad')?.addEventListener('click',()=>CX.router.nav('importador'));
  };

  draw();
  return host;
});

/* ── CSS de la Academia ── */
(()=>{const s=document.createElement('style');s.textContent=`
/* ── Formato de marca CXOrbia para lecciones y manuales (estilo Orbit) ── */
.acad-content{font-size:14px;color:var(--t2);line-height:1.75;counter-reset:acadsec}
.acad-content h2{font-size:19px;font-weight:800;color:var(--t1);margin:24px 0 12px;padding-left:42px;position:relative;min-height:32px;display:flex;align-items:center}
.acad-content h2::before{counter-increment:acadsec;content:counter(acadsec);position:absolute;left:0;top:0;width:32px;height:32px;background:linear-gradient(135deg,var(--brand),var(--brand-dark));color:#fff;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;box-shadow:0 3px 8px rgba(33,150,211,.28)}
.acad-content h2:first-child{margin-top:0}
.acad-content h3{font-size:15px;font-weight:800;color:var(--brand-dark);margin:20px 0 8px;padding-bottom:6px;border-bottom:2px solid var(--brand-light)}
.acad-content ul{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-direction:column;gap:7px}
.acad-content ul>li{position:relative;padding:10px 14px 10px 28px;background:#fff;border:1px solid var(--border);border-left:3px solid var(--brand);border-radius:0 10px 10px 0;box-shadow:0 1px 4px rgba(13,39,64,.04)}
.acad-content ul>li::before{content:'';position:absolute;left:11px;top:17px;width:6px;height:6px;border-radius:50%;background:var(--brand)}
.acad-content ol{list-style:none;margin:0 0 14px;padding:0;counter-reset:acadstep;display:flex;flex-direction:column;gap:7px}
.acad-content ol>li{position:relative;padding:10px 14px 10px 40px;background:var(--panel-2,#f8fafc);border:1px solid var(--border);border-radius:10px;counter-increment:acadstep}
.acad-content ol>li::before{content:counter(acadstep);position:absolute;left:10px;top:9px;width:20px;height:20px;border-radius:6px;background:linear-gradient(135deg,var(--brand),var(--brand-dark));color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}
.acad-content li{margin:0}
.acad-content li::marker{color:var(--brand)}
.acad-content p{margin:0 0 10px;color:var(--t2)}
.acad-content b{color:var(--t1)}
.acad-content code{background:#eef4fb;padding:2px 7px;border-radius:5px;font-size:12.5px;font-family:'SF Mono',Menlo,monospace;color:var(--brand-dark)}
.acad-content blockquote{border-left:4px solid var(--brand);background:var(--brand-light);border-radius:0 10px 10px 0;padding:11px 16px;margin:12px 0;color:var(--brand-dark);font-size:13.5px}
/* tarjetas con ícono (grid) */
.acad-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:16px 0}
.acad-card{background:#fff;border:1px solid var(--border);border-top:3px solid var(--brand);border-radius:13px;padding:16px;box-shadow:0 2px 10px rgba(13,39,64,.05);transition:transform .12s}
.acad-card:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(13,39,64,.1)}
.acad-card>div:first-child,.acad-card div:first-child{font-size:26px;margin-bottom:8px}
.acad-card b{font-size:13px;color:var(--t1);display:block;margin-bottom:5px}
.acad-card p{font-size:12px;color:var(--t3);margin:0;line-height:1.55}
/* caja de sección (acento de marca, elevada) */
.acad-section{background:linear-gradient(180deg,#fff,var(--panel-2,#f8fafc));border:1px solid var(--border);border-left:4px solid var(--brand);border-radius:0 12px 12px 0;padding:13px 16px;margin:0 0 12px;font-size:13.5px;color:var(--t2);box-shadow:0 2px 8px rgba(13,39,64,.04)}
.acad-section b{color:var(--t1);font-weight:800}
.acad-section b:first-child{display:block;margin-bottom:4px;font-size:14px;color:var(--brand-dark)}
.acad-section p{margin:4px 0 0}
/* flujo numerado en tarjetas (grid horizontal, estilo Orbit) */
.acad-flow{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:16px 0}
.acad-step{background:#fff;border:1px solid var(--border);border-radius:13px;padding:15px 15px 14px;position:relative;box-shadow:0 2px 10px rgba(13,39,64,.05)}
.acad-step span{display:inline-flex;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,var(--brand),var(--brand-dark));color:#fff;font-weight:800;font-size:13px;align-items:center;justify-content:center;margin-bottom:9px;box-shadow:0 3px 8px rgba(33,150,211,.28)}
.acad-step b{font-size:13.5px;color:var(--t1);display:block;margin-bottom:4px}
.acad-step p{font-size:12px;color:var(--t3);margin:0;line-height:1.55}
/* checklist real (marca) */
.acad-check{list-style:none;margin:12px 0;padding:0}
.acad-check li{position:relative;padding:8px 8px 8px 34px;border:1px solid var(--border);border-radius:10px;margin-bottom:7px;background:#fff;font-size:13px;color:var(--t2)}
.acad-check li::before{content:'';position:absolute;left:11px;top:50%;transform:translateY(-50%);width:16px;height:16px;border:2px solid var(--brand);border-radius:5px}
.acad-check li.done::before{background:var(--brand);box-shadow:inset 0 0 0 2px #fff}
/* glosario / definición */
.acad-gloss{display:grid;gap:8px;margin:12px 0}
.acad-gloss dt{font-weight:800;color:var(--brand-dark);font-size:13.5px}
.acad-gloss dd{margin:0 0 6px;font-size:13px;color:var(--t2);padding-left:12px;border-left:2px solid var(--brand-light)}
.acad-opt:hover{background:var(--brand-light);border-color:var(--brand)}
@media(max-width:680px){[style*="grid-template-columns:220px"]{grid-template-columns:1fr!important}}
`;document.head.appendChild(s);})();
