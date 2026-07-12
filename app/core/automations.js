/* ============================================================
   CXOrbia · Automatizaciones (Make) + alertas de pendientes
   - Cada evento del bus puede disparar una automatización (webhook
     Make / WhatsApp / correo). Editable y configurable por tenant.
   - Notifica al equipo TODOS los movimientos del shopper.
   - Detecta visitas atrasadas / pendientes / desactualizadas y
     genera alertas.
   Genérico/white-label. En demo "dispara" = notif + log; en
   producción = POST al webhook de Make configurado.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const LS='cx_automations', LS_HOOK='cx_make_hook', LS_LOG='cx_auto_log';

  /* catálogo por defecto de automatizaciones (todas editables/activables) */
  function defaults(){
    return [
      {id:'a_postulacion', evento:'postulacion', activa:true,  canal:'whatsapp', to:'admin', titulo:'Nueva postulación', plantilla:'{shopper} se postuló a {sucursal}'},
      {id:'a_agenda',      evento:'agenda',      activa:true,  canal:'push',     to:'admin', titulo:'Visita agendada', plantilla:'{shopper} agendó {sucursal} para {fecha}'},
      {id:'a_realizada',   evento:'realizada',   activa:true,  canal:'push',     to:'admin', titulo:'Visita realizada', plantilla:'{shopper} realizó {sucursal} · validar cuestionario'},
      {id:'a_cuestionario',evento:'cuestionario',activa:true,  canal:'push',     to:'admin', titulo:'Cuestionario realizado', plantilla:'{shopper} completó el cuestionario de {sucursal} · pendiente revisión (score {score})'},
      {id:'a_reprog',      evento:'reprog',      activa:true,  canal:'whatsapp', to:'admin', titulo:'Reprogramación solicitada', plantilla:'{shopper} pide reprogramar {sucursal}'},
      {id:'a_pago',        evento:'pago',        activa:true,  canal:'whatsapp', to:'shopper', titulo:'Pago registrado (preview)', plantilla:'Tu liquidación de {sucursal} quedó marcada como pagada en el sistema (preview) · confirmación bancaria real pendiente backend'},
      {id:'a_atraso',      evento:'atraso',      activa:true,  canal:'whatsapp', to:'admin', titulo:'Visita atrasada', plantilla:'{sucursal} sin avance · vence {fecha}'},
      {id:'a_aprobacion',  evento:'aprobacion',  activa:true,  canal:'whatsapp', to:'shopper', titulo:'Postulación aprobada', plantilla:'Tu visita a {sucursal} fue aprobada'},
      {id:'a_hr_writeback',evento:'hr_writeback', activa:true,  canal:'sheet',    to:'admin', titulo:'HR: escritura preparada', plantilla:'{sucursal}: {shopper} · {fecha} · {estado} (se reflejará cuando el sync backend esté activo)'},
      {id:'a_shopper_edit',evento:'shopper_edit', activa:true,  canal:'push',     to:'admin', titulo:'Datos de shopper actualizados', plantilla:'{shopper} actualizó: {campos}'},
    ];
  }

  /* ---------- Proveedor de IA (configurable · por defecto Gemini económico) ----------
     P0 (paquete 20260710 — "proveedores fuera del navegador"): el prototipo NUNCA debe
     llamar directo a un proveedor real de IA desde el navegador ni guardar su API key en
     localStorage — eso expone la key a cualquiera con acceso al dispositivo/DevTools y es
     exactamente lo que un backend/adapter autorizado debe intermediar. `ask()` por tanto
     ya NO hace fetch a Gemini/OpenAI/Anthropic; siempre resuelve con un estado estructurado
     y dispara la heurística local que cada módulo ya implementaba como fallback. La UI solo
     registra "qué proveedor preferirías" (preferencia, no secreto) para que el backend real
     sepa a quién enrutar cuando exista. */
  CX.ai = {
    _cfg:null,
    defaults(){ return {provider:'', model:'', activa:false, cacheTpl:true}; },
    cfg(){ if(this._cfg)return this._cfg; try{ this._cfg=Object.assign(this.defaults(), JSON.parse(localStorage.getItem('cx_ai')||'{}')); }catch(e){ this._cfg=this.defaults(); }
      /* migración: si un cx_ai de una versión anterior traía apiKey/endpoint guardados, se purgan al leer */
      if(this._cfg.apiKey||this._cfg.endpoint){ delete this._cfg.apiKey; delete this._cfg.endpoint; try{localStorage.setItem('cx_ai',JSON.stringify(this._cfg));}catch(e){} }
      return this._cfg; },
    save(patch){ patch=Object.assign({},patch); delete patch.apiKey; delete patch.endpoint; /* nunca persistir secretos/endpoints desde el navegador */
      this._cfg=Object.assign(this.cfg(), patch); try{ localStorage.setItem('cx_ai', JSON.stringify(this._cfg)); }catch(e){} },
    /* P0.1 (V98 instrucciones exactas): separación real de significado —
       - preferred(): el usuario ELIGIÓ un proveedor/modelo (preferencia guardada, nunca conexión).
       - available(): existe un adapter backend CONFIRMADO y autorizado. Mientras no exista un
         backend real, esto es SIEMPRE false — no hay excepción ni modo que lo cambie.
       - ready(): alias de available() (no de preferred()) — así ningún módulo puede confundir
         "el usuario tiene una preferencia" con "hay IA real conectada". Todo consumidor debe
         ejecutar su heurística local directamente sin intentar ask() ni gatear en preferred(). */
    preferred(){ const c=this.cfg(); return !!(c.activa && c.provider); },
    available(){ return false; },
    ready(){ return this.available(); },
    /* Lee un <input type=file> y devuelve Promise<string> con el texto para alimentar la IA.
       txt/csv/json → texto directo; PDF/imagen/doc → best-effort + nota del archivo. Reutilizable en TODA la plataforma. */
    readAttachment(inputEl){
      return new Promise((resolve)=>{
        const f=inputEl&&inputEl.files&&inputEl.files[0];
        if(!f){ resolve(''); return; }
        const name=f.name||'archivo';
        if(/\.(txt|csv|tsv|md|json)$/i.test(name)||(f.type||'').startsWith('text/')){
          const r=new FileReader(); r.onload=e=>resolve('\n\n[Contenido de "'+name+'"]:\n'+e.target.result); r.onerror=()=>resolve('\n\n[Adjunto: '+name+']'); r.readAsText(f); return;
        }
        if(/\.pdf$/i.test(name)){
          /* extrae texto plano legible del PDF (text layer) sin librerías externas */
          const r=new FileReader(); r.onload=e=>{ try{ const raw=new TextDecoder('latin1').decode(e.target.result);
            const chunks=[...raw.matchAll(/\(([^()\\]{2,})\)/g)].map(m=>m[1]).filter(t=>/[a-zA-ZáéíóúñÁÉÍÓÚÑ]{2,}/.test(t));
            const txt=chunks.join(' ').replace(/\s+/g,' ').trim();
            resolve(txt.length>40?'\n\n[Texto extraído de "'+name+'"]:\n'+txt.slice(0,12000):'\n\n[PDF "'+name+'" adjunto — sin capa de texto legible; usa el texto pegado o un .txt]');
          }catch(err){ resolve('\n\n[Adjunto PDF: '+name+']'); } };
          r.onerror=()=>resolve('\n\n[Adjunto PDF: '+name+']'); r.readAsArrayBuffer(f); return;
        }
        resolve('\n\n[Documento adjunto: '+name+' — formato '+(f.type||'desconocido')+']');
      });
    },
    /* ask() NUNCA se invoca por ningún módulo consumidor (todos ejecutan heurística local
       directamente) — se conserva solo por compatibilidad de interfaz. Rechaza siempre con un
       código estructurado, nunca hace fetch a un proveedor real desde el navegador. */
    ask(prompt, opts){
      const err=new Error('IA real gestionada solo por el backend/adapter autorizado — el navegador no llama proveedores directamente.');
      err.code='AI_BACKEND_UNAVAILABLE';
      return Promise.reject(err);
    },
    /* Catálogo SIN sesgo: cada consultora elige el modelo por costo/beneficio (solo referencia
       informativa para el backend — el navegador no la usa para conectarse a nada).
       costo = índice relativo de costo por 1M tokens (1=más barato). */
    PROVIDERS:{
      gemini:{label:'Google Gemini', modelos:['gemini-2.0-flash','gemini-1.5-flash','gemini-1.5-flash-8b','gemini-1.5-pro'], costo:1, fuerte:'Costo bajo + multimodal + tokens largos', ideal:'Operación diaria, importadores, alto volumen'},
      openai:{label:'OpenAI (ChatGPT)', modelos:['gpt-4o-mini','gpt-4o','o1-mini'], costo:2, fuerte:'Ecosistema maduro, razonamiento sólido', ideal:'Set-up complejo, propuestas, análisis'},
      anthropic:{label:'Anthropic (Claude)', modelos:['claude-3-5-haiku','claude-3-5-sonnet','claude-3-opus'], costo:3, fuerte:'Mejor redacción y documentos largos', ideal:'Instructivos, manuales, copy de marca'},
      custom:{label:'Endpoint propio / otro', modelos:['custom'], costo:0, fuerte:'Modelo local o proveedor propio', ideal:'Cumplimiento/privacidad estricta'}
    },
  };

  /* ---------- Iterar/refinar lo entregado por IA (reutilizable en todo importador) ----------
     ui.modal con una caja de "instrucción de ajuste" + botón Regenerar. onRegen(instruccion)
     debe devolver el nuevo resultado; onAccept(resultado) lo confirma. */
  CX.aiIterate = function(opts){
    const ui=CX.ui; let result=opts.initial;
    const preview=(r)=> (opts.render? opts.render(r) : '<pre style="white-space:pre-wrap;font-size:12px;color:var(--t2);max-height:34vh;overflow:auto">'+JSON.stringify(r,null,2)+'</pre>');
    const body=()=>`
      <div style="font-size:11.5px;color:var(--t3);margin-bottom:8px">${opts.hint||'Revisa lo que generó la IA. Si quieres ajustarlo, escribe una instrucción y regenera; repite hasta que quede bien.'}</div>
      <div id="aiPrev" style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px;background:var(--panel-2)">${preview(result)}</div>
      <label class="lbl">Instrucción de ajuste (opcional)</label>
      <textarea class="inp" id="aiInstr" rows="2" placeholder="Ej. agrega una sección de limpieza; sube el peso de atención; menos preguntas…" style="margin-bottom:10px"></textarea>
      <div class="between"><button class="btn btn-soft btn-sm" id="aiRegen">🔄 Regenerar con ajuste</button>
        <button class="btn btn-green btn-sm" id="aiAccept">✓ Usar este resultado</button></div>`;
    ui.modal(opts.title||'🤖 Resultado de la IA · iterar', body(),{onMount:(ov,close)=>{
      const wire=()=>{
        ov.querySelector('#aiRegen').addEventListener('click',()=>{
          const instr=(ov.querySelector('#aiInstr').value||'').trim();
          result = opts.onRegen ? opts.onRegen(instr, result) : result;
          ov.querySelector('#aiPrev').innerHTML=preview(result);
          ov.querySelector('#aiInstr').value='';
          ui.toast('Ajustado (heurística local · sin proveedor de IA real conectado)','ok');
          wire();
        });
        ov.querySelector('#aiAccept').addEventListener('click',()=>{ close(); opts.onAccept&&opts.onAccept(result); });
      };
      wire();
    }});
  };

  CX.automations = {
    /* #167 — asignación de responsables a ítems que requieren gestión interna */
    _akey:'cx_asignaciones',
    asignaciones(){ try{return JSON.parse(localStorage.getItem(this._akey)||'[]');}catch(e){return [];} },
    asignar(item){ const a=this.asignaciones(); a.unshift(Object.assign({id:'asg'+Date.now().toString(36),fecha:new Date().toISOString().slice(0,10),estado:'pendiente'},item));
      try{localStorage.setItem(this._akey,JSON.stringify(a));}catch(e){}
      CX.notif&&CX.notif.push({to:item.responsableRol||'admin',tipo:'asignacion',icon:'📌',tono:'a',titulo:'Tarea asignada: '+(item.titulo||''),txt:(item.detalle||'')+' · responsable: '+(item.responsable||''),nav:item.nav||'midia'});
      CX.bus&&CX.bus.emit('asignaciones'); return a[0]; },
    resolverAsignacion(id){ const a=this.asignaciones(); const x=a.find(i=>i.id===id); if(x){x.estado='resuelta';x.resueltaFecha=new Date().toISOString().slice(0,10);} try{localStorage.setItem(this._akey,JSON.stringify(a));}catch(e){} CX.bus&&CX.bus.emit('asignaciones'); },
    pendientesPara(rol){ return this.asignaciones().filter(a=>a.estado==='pendiente'&&(!rol||a.responsableRol===rol||a.responsableRol==='admin')); },
    /* #185 — bitácora de acciones operativas persistible (aprobar/rechazar/reprogramar/reasignar/pagar) */
    _aud:'cx_audit_ops',
    audit(){ try{return JSON.parse(localStorage.getItem(this._aud)||'[]');}catch(e){return [];} },
    logAction(accion, ref, detalle){
      const a=this.audit();
      const por=(CX.session&&CX.session.user&&CX.session.user.name)||'—';
      a.unshift({id:'au'+Date.now().toString(36),accion,ref:ref||'',detalle:detalle||'',por,fecha:new Date().toISOString().replace('T',' ').slice(0,16)});
      try{localStorage.setItem(this._aud,JSON.stringify(a.slice(0,1000)));}catch(e){}
      CX.bus&&CX.bus.emit('audit'); return a[0];
    },
    auditFor(ref){ return this.audit().filter(x=>x.ref===ref); },
    CANALES:{push:'Notificación in-app', whatsapp_web:'WhatsApp Web (plantilla lista)', whatsapp_api:'WhatsApp API (pendiente backend)', make:'Make webhook (pendiente backend)', correo:'Correo (pendiente backend)', sheet:'Google Sheets (pendiente backend)', off:'Apagado'},
    EVENTOS:{postulacion:'Postulación creada', agenda:'Visita agendada', realizada:'Visita realizada', cuestionario:'Cuestionario realizado', reprog:'Reprogramación', pago:'Pago/liquidación', atraso:'Visita atrasada/pendiente', aprobacion:'Postulación aprobada', hr_writeback:'Escritura de vuelta a HR', shopper_edit:'Cambio de datos del shopper'},

    list(){ try{ const s=JSON.parse(localStorage.getItem(LS)||'null'); if(s&&s.length) return s; }catch(e){} return defaults(); },
    save(list){ try{ localStorage.setItem(LS, JSON.stringify(list)); }catch(e){} CX.bus&&CX.bus.emit('automations'); },
    get(id){ return this.list().find(a=>a.id===id); },
    update(id, patch){ const l=this.list(); const a=l.find(x=>x.id===id); if(a){Object.assign(a,patch); this.save(l);} return a; },
    reset(){ try{ localStorage.removeItem(LS); }catch(e){} CX.bus&&CX.bus.emit('automations'); },

    /* tenant activo (cada consultora guarda SUS propios webhooks) */
    tenantId(){ try{ return (CX.session&&CX.session.tenant)|| (CX.theme&&CX.theme.active&&CX.theme.active())||'default'; }catch(e){ return 'default'; } },
    /* P0-3 (paquete genérico 20260711 — "integraciones/automatizaciones honestas"):
       ELIMINADO el input de webhook por automatización y cualquier generador local de
       `ref_...` usado para aparentar una conexión. Un webhook real es un endpoint privado que
       SOLO el backend puede emitir y validar — el navegador no fabrica ninguna referencia que
       simule "ya está conectado". Lo único que este prototipo puede registrar es la INTENCIÓN
       del tenant de conectar Make ("quiero conectar esto cuando exista backend"), como un
       booleano simple sin ningún valor que parezca una credencial o referencia de conexión.
       `connectionRef` solo existiría si un backend real lo emitiera — aquí siempre es null. */
    _hooks(){ try{ return JSON.parse(localStorage.getItem(LS_HOOK)||'{}'); }catch(e){ return {}; } },
    /* true si el tenant marcó la intención de conectar Make — NUNCA implica que hay conexión real */
    hookRequested(){ const h=this._hooks(); const map=(typeof h==='string')?{}:h; return !!(map[this.tenantId()]&&map[this.tenantId()].requested); },
    /* connectionRef: SOLO un backend real puede emitirlo. Aquí siempre null — no se fabrica. */
    connectionRef(){ return null; },
    /* Bloque 2 (auditoría V100 — corrección exacta): antes hookConfigured() era un alias de
       hookRequested(), mezclando "el tenant pidió conectar" con "está configurado" — dos cosas
       distintas. Ahora hookConfigured() depende EXCLUSIVAMENTE de connectionRef(), que en este
       prototipo siempre es null → hookConfigured() siempre es false, sin excepción, hasta que
       exista un backend real que emita una referencia de conexión. */
    hookConfigured(){ return Boolean(this.connectionRef()); },
    /* estados canónicos separados (Bloque 2): requested → pending_backend; sin solicitud →
       not_requested; configurado real (con connectionRef) → configured; nunca 'connected' sin
       confirmación explícita de un adapter, que este prototipo no tiene. */
    hookStatus(){
      if(this.connectionRef()) return 'configured';
      return this.hookRequested() ? 'pending_backend' : 'not_requested';
    },
    setHookRequested(wantsConnect){
      const h=this._hooks(); const map=(typeof h==='string')?{}:h;
      map[this.tenantId()]={ requested: !!wantsConnect };
      try{ localStorage.setItem(LS_HOOK, JSON.stringify(map)); }catch(e){}
    },
    /* P0.2 (V98) + P0-3 (20260711): purga irreversible de CUALQUIER secreto o referencia local
       heredada — incluye el formato antiguo `{set,ref}` (que fabricaba un `ref_...` local) y
       cualquier webhook por automatización (`a.hook`/`a.hookSet`/`a.hookRef`). Nunca conserva ni
       transforma el valor previo en una nueva referencia — lo descarta y dejar solo la intención
       (`requested`) en `false` por defecto tras la purga. Idempotente. */
    _purgeLegacySecrets(){
      try{
        const raw=localStorage.getItem(LS_HOOK);
        if(raw){
          const h=JSON.parse(raw);
          let migrated={};
          if(typeof h==='string'){ migrated[this.tenantId()]={requested:false}; }
          else if(h && typeof h==='object'){
            Object.keys(h).forEach(tid=>{
              const v=h[tid];
              /* formato legado string, o {set,ref}/{set:...,ref:'ref_...'} → nunca conservar el ref, solo la intención si estaba marcada */
              if(typeof v==='string'){ migrated[tid]={requested:false}; }
              else if(v && typeof v==='object'){ migrated[tid]={requested: !!(v.requested||v.set)}; }
            });
          }
          localStorage.setItem(LS_HOOK, JSON.stringify(migrated));
        }
      }catch(e){}
      try{
        const list=this.list(); let changed=false;
        list.forEach(a=>{ if(a.hook||a.hookSet||a.hookRef){ delete a.hook; delete a.hookSet; delete a.hookRef; changed=true; } });
        if(changed) this.save(list);
      }catch(e){}
    },

    log(){ try{ return JSON.parse(localStorage.getItem(LS_LOG)||'[]'); }catch(e){ return []; } },
    _pushLog(rec){ try{ const l=this.log(); l.unshift(rec); localStorage.setItem(LS_LOG, JSON.stringify(l.slice(0,40))); }catch(e){} },

    _fill(tpl, ctx){ return (tpl||'').replace(/\{(\w+)\}/g, (_,k)=> ctx[k]!=null?ctx[k]:''); },

    /* dispara las automatizaciones activas para un evento de negocio */
    fire(evento, ctx={}){
      this.list().filter(a=>a.activa && a.evento===evento && a.canal!=='off').forEach(a=>{
        const txt=this._fill(a.plantilla, ctx);
        // notificación in-app siempre (centro de eventos)
        CX.notif && CX.notif.push({to:a.to, tipo:evento, icon:this._icon(evento), tono:this._tone(evento), titulo:a.titulo, txt, nav:this._nav(a.to,evento)});
        // canal externo: modo honesto según configuración (sin envíos reales sin backend)
        if(a.canal && a.canal!=='push'){
          const estado = a.canal==='whatsapp_web' ? 'plantilla lista (abrir WhatsApp Web manualmente)' : 'preparado · pendiente de activación backend';
          this._pushLog({fecha:new Date().toISOString().slice(0,16).replace('T',' '), canal:(this.CANALES[a.canal]||a.canal), evento, titulo:a.titulo, txt, estado, hookStatus:this.hookStatus()});
        }
      });
    },
    _icon(e){ return {postulacion:'📩',agenda:'📅',realizada:'✅',cuestionario:'📝',reprog:'🔄',pago:'💰',atraso:'⏰',aprobacion:'✅',hr_writeback:'🔃',shopper_edit:'✏️'}[e]||'🔔'; },
    _tone(e){ return {postulacion:'b',agenda:'g',realizada:'b',cuestionario:'b',reprog:'a',pago:'g',atraso:'r',aprobacion:'g',hr_writeback:'b',shopper_edit:'b'}[e]||'b'; },
    _nav(to,e){ if(to==='shopper') return e==='pago'?'beneficios':'misvisitas'; return e==='atraso'?'visitas':'postulaciones'; },

    /* escanea visitas y detecta atrasadas / pendientes / desactualizadas */
    scanPendientes(){
      const hoy=new Date(); const out={atrasadas:[],pendientes:[],desactualizadas:[]};
      (CX.data._visitas||[]).filter(v=>v.projectId===CX.data.currentProjectId).forEach(v=>{
        const ref=v.agendada||v.disponibleDesde; const d=ref?new Date(ref+'T12:00:00'):null;
        if(['asignada','agendada'].includes(v.estado) && d && d<hoy) out.atrasadas.push(v);
        else if(v.estado==='realizada') out.pendientes.push(v);          // pend. cuestionario
        else if(v.estado==='asignada' && !v.agendada) out.desactualizadas.push(v); // sin agendar
      });
      return out;
    },
    /* genera alertas (notif) para lo atrasado/pendiente */
    notifyPendientes(){
      const s=this.scanPendientes(); let n=0;
      s.atrasadas.forEach(v=>{ this.fire('atraso',{sucursal:v.sucursal, fecha:v.agendada||v.disponibleDesde||'—', shopper:v.shopper||'sin asignar'}); n++; });
      return {alertas:n, ...s};
    },
  };
  CX.automations._purgeLegacySecrets();
})();
