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
      {id:'a_pago',        evento:'pago',        activa:true,  canal:'whatsapp', to:'shopper', titulo:'Pago registrado (vista previa)', plantilla:'Tu liquidación de {sucursal} quedó marcada como pagada en el sistema (preview) · confirmación bancaria real pendiente backend'},
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
  const CX_ATTACHMENT_PDFJS_VERSION='3.11.174';
  let cxAttachmentPdfJsPromise=null;
  function attachmentError(code,message,meta){
    const error=new Error(message);error.code=code;Object.assign(error,meta||{});return error;
  }
  function normalizeAttachmentText(value){
    return String(value==null?'':value).replace(/\u0000/g,' ').replace(/[\t\f\v]+/g,' ').replace(/\r\n?/g,'\n').replace(/[ ]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim();
  }
  function attachmentQuality(value){
    const text=normalizeAttachmentText(value),chars=text.length,words=(text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/g)||[]),uniqueWords=new Set(words.map(w=>w.toLowerCase())).size;
    const alpha=(text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g)||[]).length,replacement=(text.match(/�/g)||[]).length,controls=(text.match(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g)||[]).length;
    const alphabeticRatio=chars?alpha/chars:0,replacementRatio=chars?replacement/chars:0,controlRatio=chars?controls/chars:0;
    let score=0;
    score+=Math.min(35,chars/30);
    score+=Math.min(25,words.length/2);
    score+=Math.min(20,uniqueWords);
    score+=Math.min(20,Math.max(0,alphabeticRatio*32));
    score-=Math.min(40,replacementRatio*800);
    score-=Math.min(40,controlRatio*800);
    score=Math.max(0,Math.min(100,Math.round(score)));
    const sufficient=chars>=120&&words.length>=20&&uniqueWords>=12&&alphabeticRatio>=0.40&&replacementRatio<0.02&&controlRatio<0.01;
    const label=!sufficient?'insufficient':score>=85?'high':score>=65?'medium':'low';
    return {label,score,sufficient,chars,words:words.length,uniqueWords,alphabeticRatio:+alphabeticRatio.toFixed(4),replacementRatio:+replacementRatio.toFixed(4),controlRatio:+controlRatio.toFixed(4)};
  }
  async function attachmentSha256(buffer){
    try{
      if(!window.crypto?.subtle)return null;
      const digest=await window.crypto.subtle.digest('SHA-256',buffer);
      return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
    }catch(_){return null;}
  }
  function attachmentFormat(file){
    const name=String(file?.name||'').toLowerCase(),type=String(file?.type||'').toLowerCase();
    if(/\.(txt|csv|tsv|md|json)$/.test(name)||type.startsWith('text/'))return 'text';
    if(/\.docx$/.test(name)||type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document')return 'docx';
    if(/\.pdf$/.test(name)||type==='application/pdf')return 'pdf';
    return 'unsupported';
  }
  function loadAttachmentPdfJs(){
    if(window.pdfjsLib?.getDocument)return Promise.resolve(window.pdfjsLib);
    if(cxAttachmentPdfJsPromise)return cxAttachmentPdfJsPromise;
    cxAttachmentPdfJsPromise=new Promise((resolve,reject)=>{
      const id='cxAttachmentPdfJs_'+CX_ATTACHMENT_PDFJS_VERSION.replace(/\./g,'_');
      const done=()=>{const lib=window.pdfjsLib;if(!lib?.getDocument){reject(attachmentError('PDF_PARSER_UNAVAILABLE','No fue posible cargar el parser PDF.'));return;}if(lib.GlobalWorkerOptions)lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/'+CX_ATTACHMENT_PDFJS_VERSION+'/pdf.worker.min.js';resolve(lib);};
      const existing=document.getElementById(id);
      if(existing){if(window.pdfjsLib?.getDocument){done();return;}existing.addEventListener('load',done,{once:true});existing.addEventListener('error',()=>reject(attachmentError('PDF_PARSER_UNAVAILABLE','No fue posible cargar el parser PDF.')),{once:true});return;}
      const script=document.createElement('script');script.id=id;script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/'+CX_ATTACHMENT_PDFJS_VERSION+'/pdf.min.js';script.async=true;script.crossOrigin='anonymous';
      script.onload=done;script.onerror=()=>reject(attachmentError('PDF_PARSER_UNAVAILABLE','No fue posible cargar el parser PDF.'));document.head.appendChild(script);
    }).catch(error=>{cxAttachmentPdfJsPromise=null;throw error;});
    return cxAttachmentPdfJsPromise;
  }
  async function parseAttachmentPdf(buffer){
    const lib=await loadAttachmentPdfJs(),task=lib.getDocument({data:new Uint8Array(buffer)}),pdf=await task.promise,pages=[];
    try{
      for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
        const page=await pdf.getPage(pageNumber),content=await page.getTextContent();
        const text=content.items.map(item=>String(item?.str||'')).join(' ');
        pages.push('[Página '+pageNumber+']\n'+normalizeAttachmentText(text));
      }
      return normalizeAttachmentText(pages.join('\n\n'));
    }finally{try{await pdf.destroy?.();}catch(_){}}
  }
  async function parseAttachmentDocx(buffer){
    if(!window.mammoth?.extractRawText)throw attachmentError('DOCX_PARSER_UNAVAILABLE','El parser DOCX no está disponible.');
    const result=await window.mammoth.extractRawText({arrayBuffer:buffer});
    return normalizeAttachmentText(result?.value||'');
  }

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
    /* D02 / F10 — parser compartido y fail-closed.
       TXT/CSV/TSV/MD/JSON usan UTF-8; DOCX usa Mammoth ya cargado; PDF usa PDF.js y su capa de texto.
       No ejecuta OCR. Un PDF sin texto suficiente requiere fuente con capa de texto o pegado manual. */
    attachmentQuality(text){ return attachmentQuality(text); },
    async extractAttachment(file){
      if(!file)return {ok:false,code:'ATTACHMENT_REQUIRED',format:null,text:'',extraction_quality:attachmentQuality(''),manualFallback:true,ocrExecuted:false};
      const name=String(file.name||'archivo'),format=attachmentFormat(file),mime=String(file.type||''),size=Number(file.size||0);
      if(format==='unsupported')return {ok:false,code:'ATTACHMENT_FORMAT_UNSUPPORTED',format,name,mime,size,text:'',extraction_quality:attachmentQuality(''),manualFallback:true,ocrExecuted:false};
      let buffer;
      try{buffer=await file.arrayBuffer();}catch(error){return {ok:false,code:'ATTACHMENT_READ_FAILED',format,name,mime,size,text:'',extraction_quality:attachmentQuality(''),manualFallback:true,ocrExecuted:false,error:String(error?.message||error)};}
      const source_sha256=await attachmentSha256(buffer);
      let text='';
      try{
        if(format==='text')text=normalizeAttachmentText(new TextDecoder('utf-8').decode(buffer));
        else if(format==='docx')text=await parseAttachmentDocx(buffer);
        else if(format==='pdf')text=await parseAttachmentPdf(buffer);
      }catch(error){
        return {ok:false,code:String(error?.code||'ATTACHMENT_PARSE_FAILED'),format,name,mime,size,source_sha256,text:'',extraction_quality:attachmentQuality(''),manualFallback:true,ocrRecommended:format==='pdf',ocrExecuted:false,error:String(error?.message||error)};
      }
      const extraction_quality=attachmentQuality(text),ok=extraction_quality.sufficient===true;
      return {ok,code:ok?'ATTACHMENT_TEXT_EXTRACTED':(format==='pdf'?'ATTACHMENT_TEXT_LAYER_INSUFFICIENT':'ATTACHMENT_TEXT_INSUFFICIENT'),format,name,mime,size,source_sha256,text,extraction_quality,manualFallback:!ok,ocrRecommended:format==='pdf'&&!ok,ocrExecuted:false,parser:format==='pdf'?'pdfjs-'+CX_ATTACHMENT_PDFJS_VERSION:format==='docx'?'mammoth':'utf8-text'};
    },
    async readAttachment(inputEl){
      const file=inputEl&&inputEl.files&&inputEl.files[0];
      if(!file)return '';
      const result=await this.extractAttachment(file);
      this.lastExtraction=result;
      if(!result.ok)return '';
      return '\n\n[Texto extraído de "'+result.name+'" · '+result.format+' · calidad '+result.extraction_quality.label+' · sha256 '+(result.source_sha256||'no-disponible')+']:\n'+result.text;
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
      /* OLA1 (paquete V114→V123, migración transversal de contratos): la bitácora ahora incluye
         el contexto completo (CX.data.ctx()) en cada entrada — antes una acción quedaba registrada
         sin declarar en qué proyecto/periodo/rol ocurrió, dificultando auditar acciones cruzadas
         entre proyectos. Aditivo: no cambia el shape que ya consumen auditFor()/vistas existentes. */
      const ctx = CX.data && CX.data.ctx ? CX.data.ctx() : null;
      a.unshift({id:'au'+Date.now().toString(36),accion,ref:ref||'',detalle:detalle||'',por,fecha:new Date().toISOString().replace('T',' ').slice(0,16),ctx});
      try{localStorage.setItem(this._aud,JSON.stringify(a.slice(0,1000)));}catch(e){}
      CX.bus&&CX.bus.emit('audit'); return a[0];
    },
    auditFor(ref){ return this.audit().filter(x=>x.ref===ref); },
    CANALES:{push:'Notificación in-app', whatsapp_web:'WhatsApp Web (plantilla lista)', whatsapp_api:'WhatsApp API (pendiente de conexión)', make:'Make webhook (pendiente de conexión)', correo:'Correo (pendiente de conexión)', sheet:'Google Sheets (pendiente de conexión)', off:'Apagado'},
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
          const estado = a.canal==='whatsapp_web' ? 'plantilla lista (abrir WhatsApp Web manualmente)' : 'preparado · pendiente de activación';
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
      (CX.data._visitas||[]).filter(v=>v.projectId===CX.data.currentPeriodId).forEach(v=>{
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

  /* HF-20261012-28 — provider-backed tenant template settings.
     Firebase remote transaction is the sole connected-mode authority; never assert
     WhatsApp/email delivery without a separately activated provider receipt. */
  (function installDurableTenantTemplates(A){
    const original={
      list:A.list.bind(A),save:A.save.bind(A),update:A.update.bind(A),
      reset:A.reset.bind(A),hookRequested:A.hookRequested.bind(A),
      setHookRequested:A.setHookRequested.bind(A)
    };
    const status={};
    const connected=()=>!!(CX.BACKEND&&CX.BACKEND.enabled===true);
    const scope=()=>{
      const tenant=String((CX.BACKEND&&CX.BACKEND.tenantId)||(CX.backend&&typeof CX.backend.tenantId==='function'&&CX.backend.tenantId())||'').trim();
      if(!tenant)throw new Error('AUTOMATION_TENANT_REQUIRED');
      return tenant;
    };
    const rows=(items)=>{
      if(!Array.isArray(items))throw new Error('AUTOMATION_REMOTE_TEMPLATES_INVALID');
      const allowed=new Map(defaults().map(a=>[a.id,a]));
      const byId=new Map();
      for(const row of items){
        if(!row||!allowed.has(row.id)||byId.has(row.id))throw new Error('AUTOMATION_REMOTE_TEMPLATE_ID_INVALID');
        const base=allowed.get(row.id),channel=String(row.canal||'')==='whatsapp'?'whatsapp_web':String(row.canal||'');
        if(typeof row.activa!=='boolean'||!Object.prototype.hasOwnProperty.call(A.CANALES,channel)||
           typeof row.plantilla!=='string'||row.plantilla.length>2000)
          throw new Error('AUTOMATION_REMOTE_TEMPLATE_FIELDS_INVALID');
        byId.set(row.id,{...base,activa:row.activa,canal:channel,plantilla:row.plantilla});
      }
      return defaults().map(a=>byId.get(a.id)||a);
    };
    const provider=()=>{
      if(!window.firebase||!firebase.apps||!firebase.apps.length)throw new Error('AUTOMATION_FIREBASE_NOT_READY');
      const app=firebase.app(),auth=typeof app.auth==='function'?app.auth():firebase.auth();
      if(!auth.currentUser||!auth.currentUser.uid)throw new Error('AUTOMATION_AUTH_REQUIRED');
      const db=typeof app.firestore==='function'?app.firestore():firebase.firestore();
      if(!db||typeof db.runTransaction!=='function')throw new Error('AUTOMATION_FIRESTORE_NOT_READY');
      const tenant=scope(),ref=db.collection('tenants').doc(tenant).collection('automations').doc('tenant-event-templates');
      return {db,ref,tenant,uid:auth.currentUser.uid};
    };
    const applyRemote=(tenant,snap)=>{
      const doc=snap.exists?snap.data():null;
      if(doc&&String(doc.tenantId)!==tenant)throw new Error('AUTOMATION_REMOTE_TENANT_MISMATCH');
      const state={
        ready:true,version:doc?Number(doc.version||0):0,
        templates:doc?rows(doc.templates):defaults(),
        hookRequested:doc?doc.hookRequested===true:false,
        error:null
      };
      if(!Number.isSafeInteger(state.version)||state.version<0)throw new Error('AUTOMATION_REMOTE_VERSION_INVALID');
      status[tenant]=state;
      return state;
    };
    A.configStatus=function(){
      if(!connected())return {ready:true,preview:true};
      const tenant=scope(),s=status[tenant];
      return s&&s.ready?{ready:true,version:s.version,tenantId:tenant,provider:'firestore'}:
        {ready:false,tenantId:tenant,error:s&&s.error||'AUTOMATION_REMOTE_READ_REQUIRED'};
    };
    A.loadConfig=async function(force){
      if(!connected())return {ok:true,preview:true};
      const tenant=scope(),s=status[tenant];
      if(s&&s.ready&&!force)return {ok:true,providerReadback:true,version:s.version};
      if(s&&s.pending)return s.pending;
      const task=(async()=>{
        try{
          const p=provider();
          const snap=await p.ref.get({source:'server'});
          const state=applyRemote(p.tenant,snap);
          CX.bus&&CX.bus.emit('automations');
          return {ok:true,providerReadback:true,version:state.version};
        }catch(error){
          status[tenant]={ready:false,error:String(error&&error.message||'AUTOMATION_REMOTE_READ_FAILED')};
          return {ok:false,providerReadback:false,code:status[tenant].error};
        }
      })();
      status[tenant]={ready:false,pending:task};
      return task;
    };
    A.list=function(){
      if(!connected())return original.list();
      const s=status[scope()];
      return s&&s.ready?s.templates.map(x=>({...x})):[];
    };
    A.save=function(list){
      if(!connected())return original.save(list);
      throw new Error('AUTOMATION_CONNECTED_BULK_LOCAL_SAVE_DENIED');
    };
    A.update=async function(id,patch){
      if(!connected())return original.update(id,patch);
      if(!patch||Object.keys(patch).some(k=>!['activa','canal','plantilla'].includes(k)))
        throw new Error('AUTOMATION_PATCH_INVALID');
      return A._commitRemote({id:String(id||''),patch});
    };
    A.hookRequested=function(){
      if(!connected())return original.hookRequested();
      const s=status[scope()];return !!(s&&s.ready&&s.hookRequested);
    };
    A.setHookRequested=async function(wants){
      if(!connected())return original.setHookRequested(wants);
      return A._commitRemote({hookRequested:wants===true});
    };
    A.reset=function(){
      if(!connected())return original.reset();
      throw new Error('AUTOMATION_CONNECTED_RESET_REQUIRES_AUTHORIZED_COMMAND');
    };
    A._commitRemote=async function(change){
      const p=provider(),prior=status[p.tenant];
      if(!prior||!prior.ready)throw new Error('AUTOMATION_REMOTE_READ_REQUIRED');
      const operationId='automation:'+String(Date.now())+':'+String(crypto&&crypto.randomUUID?crypto.randomUUID():Math.random());
      let expectedVersion=prior.version;
      try{
        const committed=await p.db.runTransaction(async tx=>{
          const snap=await tx.get(p.ref),source=snap.exists?snap.data():null;
          const version=source?Number(source.version||0):0;
          if(!Number.isSafeInteger(version)||version!==expectedVersion)throw new Error('AUTOMATION_VERSION_CONFLICT');
          const current=source?rows(source.templates):defaults();
          let updated=current,requested=source?source.hookRequested===true:false;
          if(change.id){
            const base=current.find(a=>a.id===change.id);
            if(!base)throw new Error('AUTOMATION_ID_NOT_FOUND');
            updated=current.map(a=>a.id===change.id?{...a,...change.patch}:a);
            updated=rows(updated);
          }
          if(Object.prototype.hasOwnProperty.call(change,'hookRequested'))requested=change.hookRequested===true;
          const next={
            tenantId:p.tenant,templates:updated.map(a=>({id:a.id,activa:a.activa,canal:a.canal,plantilla:a.plantilla})),
            hookRequested:requested,version:version+1,lastOperationId:operationId,
            updatedBy:p.uid,updatedAt:new Date().toISOString(),providerChannelActive:false
          };
          tx.set(p.ref,next,{merge:true});
          return next;
        });
        const check=await p.ref.get({source:'server'});
        const actual=check.exists?check.data():null;
        if(!actual||actual.lastOperationId!==operationId||Number(actual.version)!==committed.version)
          throw new Error('AUTOMATION_ACK_READBACK_MISMATCH');
        const current=applyRemote(p.tenant,check);
        CX.bus&&CX.bus.emit('automations');
        return {ok:true,providerAck:true,readback:true,version:current.version,externalSent:false};
      }catch(error){
        status[p.tenant]={ready:false,error:String(error&&error.message||'AUTOMATION_REMOTE_WRITE_FAILED')};
        throw error;
      }
    };
  })(CX.automations);

  CX.automations._purgeLegacySecrets();
})();
