/* CXOrbia · Integraciones & Add-ons — catálogo completo activable por plan/tenant
   Basado en el ecosistema de herramientas modernas; configuración real por tenant.
   Cada integración tiene: nombre, categoría, descripción, toggleable, config modal. */
window.CX = window.CX || {};

/* ============================================================
   CX.addons — Add-ons FUNCIONALES (Corte 1B ext.)
   A diferencia de las integraciones externas (que dependen de backend), estos
   son beneficios que SÍ operan en el frontend cuando se activan. Cada add-on:
   toggle por tenant + selección de roles a los que aplica. Los módulos consultan
   CX.addons.on(id, role) para encender la función en la UI del rol correcto.
   El backend queda pendiente sólo para persistencia/servidor; la función corre. */
CX.addons = {
  _base:'cx_addons_fx', _state:null, _stateKey:null,
  DEFS:[
    {id:'geo_checkin', n:'Check-in con foto geolocalizada', ic:'📍', cat:'Operación en campo',
     desc:'El evaluador registra su llegada a la sucursal con foto sellada por GPS + hora, como paso propio de la visita (no dentro del cuestionario). Requiere backend/Storage para persistir la evidencia.',
     roles:['shopper'], allowRoles:['shopper'], where:'Mis Visitas (shopper)'},
  ],
  /* P0-6 (V171): persistencia AISLADA por tenantId + projectId. Nunca clave global.
     No se infiere tenant por marca visual; sale de CX.data.ctx()/sesión. */
  _tenant(){ try{ return (CX.data&&CX.data.ctx&&CX.data.ctx().tenantId)||(CX.session.user&&CX.session.user.tenantId)||(CX.BRAND&&CX.BRAND.id)||'default'; }catch(e){ return 'default'; } },
  _project(){ try{ const p=CX.data&&CX.data.period&&CX.data.period(); return (p&&(CX.data.programKey?CX.data.programKey(p):p.id))||'all'; }catch(e){ return 'all'; } },
  _key(){ return this._base+'::'+this._tenant()+'::'+this._project(); },
  state(){ const k=this._key(); if(this._state&&this._stateKey===k) return this._state; try{this._state=JSON.parse(localStorage.getItem(k)||'{}');}catch(e){this._state={};} this._stateKey=k; return this._state; },
  _save(){ try{localStorage.setItem(this._key(),JSON.stringify(this._state||{}));}catch(e){} CX.bus&&CX.bus.emit('addons'); },
  def(id){ return this.DEFS.find(d=>d.id===id)||null; },
  isOn(id){ const s=this.state()[id]; return s?!!s.on:false; },
  rolesFor(id){ const s=this.state()[id]; if(s&&Array.isArray(s.roles))return s.roles; const d=this.def(id); return d?d.roles.slice():[]; },
  on(id,role){ return this.isOn(id) && this.rolesFor(id).includes(role); },
  setOn(id,v){ const s=this.state(); s[id]=Object.assign({roles:this.rolesFor(id)},s[id]||{},{on:!!v}); this._save(); },
  toggleRole(id,role){ const d=this.def(id); if(d&&d.allowRoles&&!d.allowRoles.includes(role))return; const s=this.state(); const cur=this.rolesFor(id); const roles=cur.includes(role)?cur.filter(r=>r!==role):cur.concat(role); s[id]=Object.assign({on:this.isOn(id)},s[id]||{},{roles}); this._save(); },
};


CX.intStore = {
  _state: null,
  _key: 'cx_integraciones',
  CATS: ['CORREO Y COMUNICACIÓN','ECOSISTEMA GOOGLE','ECOSISTEMA MICROSOFT','INTELIGENCIA ARTIFICIAL','CONTENIDO Y DISEÑO','REDES Y MARKETING','AUTOMATIZACIÓN Y PRODUCTIVIDAD','DATOS Y FACTURACIÓN'],
  ITEMS: [
    // CORREO Y COMUNICACIÓN
    {id:'outlook', cat:'CORREO Y COMUNICACIÓN', icon:'✉️', n:'Outlook / Microsoft 365', desc:'Bandeja integrada; vincula correos a proyectos, shoppers, clientes y gestiones.', cfg:['email','client_id'], plan:'pro'},
    {id:'gmail', cat:'CORREO Y COMUNICACIÓN', icon:'📧', n:'Gmail / Google Workspace', desc:'Sincroniza correos y contactos de Google.', cfg:['email'], plan:'pro'},
    {id:'imap', cat:'CORREO Y COMUNICACIÓN', icon:'📬', n:'IMAP / POP3 (dominio propio)', desc:'Conecta cualquier proveedor con dominio corporativo.', cfg:['host','port','email','pass'], plan:'estandar'},
    {id:'whatsapp', cat:'CORREO Y COMUNICACIÓN', icon:'💬', n:'WhatsApp Business (API + Web)', desc:'Recordatorios, notificaciones, encuestas y mensajería a shoppers y clientes.', cfg:['phone','token'], plan:'estandar'},
    {id:'telegram', cat:'CORREO Y COMUNICACIÓN', icon:'✈️', n:'Telegram', desc:'Notificaciones internas del equipo y alertas operativas.', cfg:['bot_token'], plan:'pro'},
    {id:'sms', cat:'CORREO Y COMUNICACIÓN', icon:'📱', n:'SMS', desc:'Avisos de visita, recordatorios y alertas por mensaje de texto.', cfg:['api_key'], plan:'enterprise'},
    // ECOSISTEMA GOOGLE
    {id:'gsheets', cat:'ECOSISTEMA GOOGLE', icon:'📊', n:'Google Sheets', desc:'HR viva colaborativa; importación/exportación de datos y reportes.', cfg:['sheet_url'], plan:'estandar'},
    {id:'gdrive', cat:'ECOSISTEMA GOOGLE', icon:'💛', n:'Google Drive', desc:'Expedientes y documentos por cliente, shopper y proyecto.', cfg:['folder_id'], plan:'pro'},
    {id:'gcal', cat:'ECOSISTEMA GOOGLE', icon:'📅', n:'Google Calendar', desc:'Cronograma, citas, visitas y vencimientos sincronizados.', cfg:['calendar_id'], plan:'pro'},
    {id:'gmeet', cat:'ECOSISTEMA GOOGLE', icon:'🎥', n:'Google Meet', desc:'Reuniones y convocatorias desde el CRM; guarda actas automáticamente.', cfg:['oauth'], plan:'pro'},
    {id:'gforms', cat:'ECOSISTEMA GOOGLE', icon:'📝', n:'Google Forms', desc:'Formularios de captación, cuestionarios y NPS vinculados al portal.', cfg:['form_id'], plan:'pro'},
    {id:'looker', cat:'ECOSISTEMA GOOGLE', icon:'📈', n:'Looker Studio', desc:'Dashboards ejecutivos sobre los datos del proyecto y del CRM.', cfg:['report_url'], plan:'enterprise'},
    // ECOSISTEMA MICROSOFT
    {id:'teams', cat:'ECOSISTEMA MICROSOFT', icon:'🟦', n:'Microsoft Teams', desc:'Colaboración del equipo, alertas y videollamadas internas.', cfg:['webhook_url'], plan:'pro'},
    {id:'onedrive', cat:'ECOSISTEMA MICROSOFT', icon:'☁️', n:'OneDrive / Excel', desc:'Documentos y hojas de datos de Microsoft; importación de HR.', cfg:['client_id'], plan:'pro'},
    // INTELIGENCIA ARTIFICIAL
    {id:'gemini', cat:'INTELIGENCIA ARTIFICIAL', icon:'✨', n:'Gemini (Google IA)', desc:'IA transversal: extracción de documentos, análisis crítico, generación de cuestionarios, propuestas y marketing. Recomendada.', cfg:['api_key','model'], plan:'estandar', recommended:true},
    {id:'chatgpt', cat:'INTELIGENCIA ARTIFICIAL', icon:'🤖', n:'ChatGPT / OpenAI', desc:'Generación de contenidos, asistente de propuestas y análisis.', cfg:['api_key','model'], plan:'pro'},
    {id:'claude', cat:'INTELIGENCIA ARTIFICIAL', icon:'🔷', n:'Claude (Anthropic)', desc:'Análisis de documentos largos y redacción precisa.', cfg:['api_key'], plan:'pro'},
    {id:'notebooklm', cat:'INTELIGENCIA ARTIFICIAL', icon:'📚', n:'NotebookLM', desc:'Base de conocimiento del cliente; alimenta cuestionarios y capacitación.', cfg:['notebook_url'], plan:'enterprise'},
    {id:'perplexity', cat:'INTELIGENCIA ARTIFICIAL', icon:'🔍', n:'Perplexity', desc:'Investigación web con fuentes para propuestas y relevamiento de clientes.', cfg:['api_key'], plan:'pro'},
    // CONTENIDO Y DISEÑO
    {id:'canva', cat:'CONTENIDO Y DISEÑO', icon:'🎨', n:'Canva', desc:'Piezas y plantillas de diseño para campañas, propuestas y Academia.', cfg:['api_key'], plan:'pro'},
    {id:'gamma', cat:'CONTENIDO Y DISEÑO', icon:'📊', n:'Gamma', desc:'Presentaciones y material comercial generados con IA.', cfg:['api_key'], plan:'pro'},
    {id:'heygen', cat:'CONTENIDO Y DISEÑO', icon:'🎬', n:'HeyGen', desc:'Videos con avatar IA para capacitación y marketing.', cfg:['api_key'], plan:'enterprise'},
    {id:'capcut', cat:'CONTENIDO Y DISEÑO', icon:'✂️', n:'CapCut', desc:'Edición rápida de video para redes sociales.', cfg:[], plan:'pro'},
    // REDES Y MARKETING
    {id:'metricool', cat:'REDES Y MARKETING', icon:'📅', n:'Metricool', desc:'Programa, publica y mide redes y pauta desde un solo lugar.', cfg:['api_key'], plan:'pro', recommended:true},
    {id:'meta', cat:'REDES Y MARKETING', icon:'🔵', n:'Facebook / Instagram (Meta)', desc:'Publicación, mensajes y captación de leads.', cfg:['token','page_id'], plan:'pro'},
    {id:'linkedin', cat:'REDES Y MARKETING', icon:'🔷', n:'LinkedIn', desc:'Publicación corporativa y captación B2B.', cfg:['token'], plan:'enterprise'},
    {id:'tiktok', cat:'REDES Y MARKETING', icon:'🎵', n:'TikTok', desc:'Publicación y captación de audiencia.', cfg:['token'], plan:'enterprise'},
    {id:'youtube', cat:'REDES Y MARKETING', icon:'▶️', n:'YouTube', desc:'Canal de video y contenidos de capacitación.', cfg:['channel_id'], plan:'pro'},
    {id:'mailchimp', cat:'REDES Y MARKETING', icon:'🐒', n:'Mailchimp', desc:'Campañas de correo masivo y segmentación.', cfg:['api_key'], plan:'pro'},
    {id:'website', cat:'REDES Y MARKETING', icon:'🌐', n:'Página web de la empresa', desc:'Formularios web → leads; contenidos publicados al sitio.', cfg:['webhook_url'], plan:'estandar'},
    // AUTOMATIZACIÓN Y PRODUCTIVIDAD
    {id:'make', cat:'AUTOMATIZACIÓN Y PRODUCTIVIDAD', icon:'⚡', n:'Make (Integromat)', desc:'Orquesta automatizaciones entre módulos y servicios (genera → publica → notifica → registra).', cfg:['webhook_url'], plan:'estandar', recommended:true},
    {id:'zapier', cat:'AUTOMATIZACIÓN Y PRODUCTIVIDAD', icon:'⚡', n:'Zapier', desc:'Automatizaciones entre miles de apps.', cfg:['webhook_url'], plan:'pro'},
    {id:'n8n', cat:'AUTOMATIZACIÓN Y PRODUCTIVIDAD', icon:'🔧', n:'n8n', desc:'Automatización self-hosted y flujos a medida.', cfg:['host','api_key'], plan:'enterprise'},
    {id:'notion', cat:'AUTOMATIZACIÓN Y PRODUCTIVIDAD', icon:'📓', n:'Notion', desc:'Base de conocimiento, procesos y wikis del equipo; sincroniza actas.', cfg:['api_key'], plan:'pro'},
    {id:'slack', cat:'AUTOMATIZACIÓN Y PRODUCTIVIDAD', icon:'#️⃣', n:'Slack', desc:'Alertas y colaboración del equipo en tiempo real.', cfg:['webhook_url'], plan:'pro'},
    {id:'zoom', cat:'AUTOMATIZACIÓN Y PRODUCTIVIDAD', icon:'📹', n:'Zoom', desc:'Reuniones y capacitaciones; guarda grabaciones y actas.', cfg:['api_key'], plan:'pro'},
    {id:'trello', cat:'AUTOMATIZACIÓN Y PRODUCTIVIDAD', icon:'📋', n:'Trello', desc:'Tableros de tareas conectados a gestiones del CRM.', cfg:['api_key'], plan:'pro'},
    // DATOS Y FACTURACIÓN
    {id:'fel_gt', cat:'DATOS Y FACTURACIÓN', icon:'🧾', n:'FEL Guatemala (SAT)', desc:'Facturación electrónica en línea (GT).', cfg:['nit','api_key'], plan:'enterprise'},
    {id:'dian_co', cat:'DATOS Y FACTURACIÓN', icon:'🧾', n:'Facturación DIAN (CO)', desc:'Facturación electrónica Colombia.', cfg:['api_key'], plan:'enterprise'},
    {id:'openbanking', cat:'DATOS Y FACTURACIÓN', icon:'🏦', n:'Banca / Open Banking', desc:'Importar movimientos y conciliar estados de cuenta automáticamente.', cfg:['api_key'], plan:'enterprise'},
  ],
  state(){ if(this._state)return this._state;try{this._state=JSON.parse(localStorage.getItem(this._key)||'{}');}catch(e){this._state={};} return this._state; },
  /* Bloque 2 (auditoría V100 — corrección exacta): "activar el toggle" es una SOLICITUD del
     tenant, nunca una conexión real. `isOn()` se conserva por compatibilidad de nombre (el toggle
     visual sigue funcionando igual), pero ya no se usa para decidir el copy "activa"/"conectada" —
     eso ahora depende exclusivamente de `connectionRef()`, que este prototipo nunca emite. */
  isOn(id){ return !!this.state()[id]; },
  /* connectionRef: SOLO el sistema central podría emitirlo tras confirmar la integración. Este
     prototipo nunca llama a un proveedor real, así que SIEMPRE es null — no se fabrica. */
  connectionRef(id){ return null; },
  /* Estados canónicos separados — nunca se cuenta una solicitud como "activa"/"configurada":
     - not_requested: toggle apagado.
     - requested: toggle encendido, sin campos sensibles que requieran valor (o sin cfg definido).
     - pending_backend: toggle encendido Y al menos un campo sensible marcado "listo" (`_set`).
     - configured / connected: solo alcanzables si `connectionRef(id)` no es null — nunca ocurre aquí. */
  status(id){
    if(this.connectionRef(id)) return 'configured';
    if(!this.isOn(id)) return 'not_requested';
    const item=this.ITEMS.find(i=>i.id===id);
    const cfg=this.state()[id+'_cfg'];
    const hasSensitiveReady = cfg && (item&&item.cfg||[]).some(k=>this._isSensitive(k) && cfg[k+'_set']);
    return hasSensitiveReady ? 'pending_backend' : 'requested';
  },
  toggle(id){ const s=this.state(); s[id]=!s[id]; try{localStorage.setItem(this._key,JSON.stringify(s));}catch(e){} CX.bus&&CX.bus.emit('integraciones'); },
  /* P0-3 (paquete genérico 20260711 — "integraciones/automatizaciones honestas"): eliminado
     `_opaqueRef()` — ya no se fabrica ningún `ref_...` local para simular que un campo sensible
     quedó "conectado". Para campos sensibles (api_key, token, pass, webhook_url, client_id,
     bot_token, host, port, oauth) solo se persiste la INTENCIÓN (`<campo>_set:true/false`) de que
     el tenant quiere activar esa integración — nunca un valor ni una referencia que aparente una
     credencial o conexión real. Un `connectionRef` real solo puede emitirlo un backend autorizado;
     este prototipo no tiene uno, así que ninguna integración con campos sensibles puede reportar
     "configurado" — siempre queda en estado `pending_backend`. */
  SENSITIVE:['api_key','token','pass','webhook_url','client_id','bot_token','host','port','oauth'],
  _isSensitive(k){ return this.SENSITIVE.includes(k); },
  setConfig(id,cfg){
    const s=this.state(); if(!s[id+'_cfg'])s[id+'_cfg']={};
    Object.entries(cfg).forEach(([k,v])=>{
      if(this._isSensitive(k)){
        /* nunca se guarda el valor real ni una referencia fabricada — solo la intención */
        s[id+'_cfg'][k+'_set']=!!(v&&String(v).trim());
      } else {
        s[id+'_cfg'][k]=v;
      }
    });
    try{localStorage.setItem(this._key,JSON.stringify(s));}catch(e){}
  },
  getConfig(id){ return this.state()[id+'_cfg']||{}; },
  /* P0.2 (V98 instrucciones exactas): purga irreversible de secretos heredados guardados en claro
     por versiones anteriores a esta corrección. Corre una vez por carga; idempotente (no hace nada
     si ya no quedan valores en claro). Nunca convierte el secreto heredado en una referencia — lo
     descarta y deja el campo como "pendiente backend", nunca como "configurado". */
  _purgeLegacySecrets(){
    try{
      const s=this.state(); let changed=false;
      this.ITEMS.forEach(item=>{
        const cfgKey=item.id+'_cfg'; const cfg=s[cfgKey]; if(!cfg) return;
        (item.cfg||[]).forEach(k=>{
          if(this._isSensitive(k) && Object.prototype.hasOwnProperty.call(cfg,k)){
            delete cfg[k]; cfg[k+'_set']=false; delete cfg[k+'_ref']; cfg.legacySecretPurged=true; changed=true;
          }
          /* purga también cualquier `_ref` fabricado por una versión anterior, aunque el valor
             crudo ya no exista (setConfig ya no los genera, pero pudieron quedar guardados) */
          if(cfg[k+'_ref']){ delete cfg[k+'_ref']; changed=true; }
        });
        if(cfg.legacySecretPurged){ s[item.id]=false; /* nunca "configurada" solo por un secreto heredado descartado */ }
      });
      if(changed) localStorage.setItem(this._key, JSON.stringify(s));
    }catch(e){}
  },
};
CX.intStore._purgeLegacySecrets();

CX.module('integraciones', ({ui,data})=>{
  const host=ui.el('div');
  const PLAN=CX.session.plan||(data.period()&&data.period().plan)||'estandar';
  const planLevel={estandar:0,pro:1,enterprise:2};
  const canUse=(p)=> (planLevel[p]||0) <= (planLevel[PLAN]||0);

  const configModal=(item)=>{
    if(!item.cfg||!item.cfg.length){
      /* Bloque B (auditoría V101 — 20260711): una integración sin campos de configuración
         NO tiene conexión real solo por activar el toggle — antes decía "activado" sin más.
         Se mantiene el mismo estado canónico (requested/pending_backend) que las demás. */
      if(!CX.intStore.isOn(item.id))CX.intStore.toggle(item.id);
      draw();ui.toast(item.n+': solicitud registrada · pendiente de conexión','ok',3200);
      return;
    }
    const cfg=CX.intStore.getConfig(item.id);
    const LABELS={api_key:'API Key',webhook_url:'Webhook URL',email:'Correo',token:'Token de acceso',host:'Host / servidor',port:'Puerto',pass:'Contraseña',client_id:'Client ID',model:'Modelo',phone:'Número de teléfono',calendar_id:'Calendar ID',folder_id:'Folder ID',sheet_url:'URL de Hoja',form_id:'Form ID',report_url:'Report URL',oauth:'OAuth',nit:'NIT / RUT',page_id:'Page ID',notebook_url:'URL Notebook',bot_token:'Bot Token',channel_id:'Channel ID'};
    ui.modal('⚙️ Configurar · '+item.n,`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">${item.desc}</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${item.cfg.map(k=>{
          const sens=CX.intStore._isSensitive(k);
          if(sens){
            const isSet=cfg[k+'_set'];
            /* P0.4 (auditoría V99): ya no se invita a pegar un secreto real — no hay input de texto
               para campos sensibles. Solo una casilla para marcar "listo para que el backend lo
               conecte" (una preferencia/checklist, nunca una credencial). */
            return `<div><label class="flex" style="gap:8px;font-size:12.5px;color:var(--t1)"><input type="checkbox" class="cfg-fld-check" data-k="${k}" ${isSet?'checked':''}> ${LABELS[k]||k} — marcar como listo para conectar (el backend pedirá el valor real por su propio canal seguro)</label>
              <div style="font-size:10px;color:var(--t3);margin-top:2px;margin-left:24px">🔒 Este prototipo nunca solicita ni guarda el valor real — no hay campo para pegarlo aquí.</div></div>`;
          }
          return `<div><label class="lbl">${LABELS[k]||k}</label><input class="inp cfg-fld" data-k="${k}" value="${(cfg[k]||'').replace(/"/g,'&quot;')}" type="text" placeholder="${LABELS[k]||k}…"></div>`;
        }).join('')}
      </div>
      <div class="between" style="margin-top:14px"><button class="btn btn-ghost btn-sm" id="cfTest">🔌 Probar conexión</button><button class="btn btn-pr btn-sm" id="cfSave">Guardar configuración</button></div>
      <div style="font-size:10.5px;color:var(--t3);margin-top:8px">🔒 Las credenciales y endpoints reales los gestiona el sistema central una vez activo — este prototipo nunca las pide, las envía a ningún proveedor, ni las conserva en el navegador.</div>
    `,{onMount:(ov,close)=>{
      ov.querySelector('#cfTest').addEventListener('click',()=>{if(!CX.permissions.gate('integration.test',CX.permissions.ctx(),ui))return;ui.toast('⚠️ Prueba simulada · la validación real de credenciales ocurre en el backend de producción.','',3600);});
      ov.querySelector('#cfSave').addEventListener('click',()=>{
        if(!CX.permissions.gate('integration.configure',CX.permissions.ctx(),ui)) return;
        const patch={};
        ov.querySelectorAll('.cfg-fld').forEach(i=>{patch[i.dataset.k]=i.value.trim();});
        ov.querySelectorAll('.cfg-fld-check').forEach(i=>{patch[i.dataset.k]=i.checked?'__CHECKED__':'';});
        CX.intStore.setConfig(item.id,patch);if(!CX.intStore.isOn(item.id))CX.intStore.toggle(item.id);
        close();draw();ui.toast(item.n+': preferencia guardada · pendiente de conexión','ok',3200);
      });
    }});
  };

  const card=(item)=>{
    const on=CX.intStore.isOn(item.id); const ok=canUse(item.plan);
    const status=CX.intStore.status(item.id);
    /* estado honesto (Bloque 2 — corrección exacta): 'requested' ≠ 'pending_backend' ≠
       'configured'/'connected' — nunca se etiqueta una solicitud como si fuera una conexión real. */
    const estado = status==='not_requested' ? ui.bdg('Inactivo','n') : ui.statusBdg(status);
    const planBadge=!ok?ui.bdg(item.plan.toUpperCase(),'r'):(item.recommended?ui.bdg('recomendado','g'):'');
    return `<div class="card ${on?'':''}" style="padding:14px 16px;background:${on?'var(--brand-light)':'var(--panel)'};border:1px solid ${on?'var(--brand)':'var(--border)'};border-radius:12px;display:flex;flex-direction:column;gap:8px">
      <div class="flex" style="gap:10px;align-items:flex-start"><div style="font-size:22px">${item.icon}</div>
        <div style="flex:1"><div class="flex" style="gap:6px;align-items:center;flex-wrap:wrap"><b style="font-size:13px">${item.n}</b>${planBadge}</div>
          <div style="font-size:11.5px;color:var(--t3);margin-top:2px">${item.desc}</div>
          <div style="margin-top:5px">${estado}</div></div></div>
      <div class="between" style="margin-top:2px">
        <label class="flex" style="cursor:${ok?'pointer':'not-allowed'};gap:6px;align-items:center">
          <input type="checkbox" class="intTog" data-id="${item.id}" ${on?'checked':''} ${!ok?'disabled':''} style="width:18px;height:18px;cursor:${ok?'pointer':'not-allowed'}">
          <span style="font-size:11px;color:${on?'var(--brand)':'var(--t3)'};font-weight:700">${on?'Solicitud registrada':'Inactivo'}</span></label>
        ${ok?`<button class="btn btn-ghost btn-sm intCfg" data-id="${item.id}" style="padding:2px 8px;font-size:10.5px">⚙️ Config.</button>`:'<span style="font-size:10px;color:var(--t3)">Plan '+item.plan+'</span>'}
      </div></div>`;
  };

  const draw=()=>{
    const items=CX.intStore.ITEMS;
    const activeCount=items.filter(i=>CX.intStore.status(i.id)!=='not_requested').length;
    host.innerHTML=`
      <div class="between" style="margin-bottom:6px"><div>${ui.ph('Integraciones & Add-ons','Conecta tu ecosistema — activables por plan · configura una vez, funciona en toda la plataforma')}</div>
        <div class="flex" style="gap:8px">${(()=>{const sc=CX.dataSource&&CX.dataSource.sourceContract?CX.dataSource.sourceContract():null;const modeLbl={demo:'Demo',source_safe_preview:'Vista previa',connected:'Conectado'}[sc&&sc.sourceReadMode]||'';return sc?ui.bdg('fuente: '+modeLbl+(sc.runtimeSyncActive?' · activo':''),sc.runtimeSyncActive?'g':'n'):'';})()}<span class="bdg bdg-a">${activeCount} solicitada(s) · pendiente(s) de activación</span></div></div>
      <div style="background:var(--brand-light);border-radius:10px;padding:11px 14px;font-size:12.5px;color:var(--brand-dark);margin-bottom:16px">
        ⚡ <b>Receta de automatización inteligente:</b> IA (Gemini/Claude) redacta → Canva/Gamma crean piezas → Metricool programa y publica → Make/Zapier orquesta → NotebookLM alimenta el conocimiento del cliente y la Academia.
      </div>
      ${(()=>{const RL={admin:'Admin',shopper:'Shopper',cliente:'Cliente'};return `<div style="margin-bottom:18px"><div class="card-t" style="margin-bottom:4px">🧩 Add-ons funcionales</div><div style="font-size:11.5px;color:var(--t3);margin-bottom:10px">Beneficios que operan en la plataforma al activarlos. Elige a qué roles aplica cada uno — aparecerá funcional en la vista de ese rol.</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px">${CX.addons.DEFS.map(a=>{const on=CX.addons.isOn(a.id);const roles=CX.addons.rolesFor(a.id);return `<div class="card" style="padding:14px 16px;background:${on?'var(--brand-light)':'var(--panel)'};border:1px solid ${on?'var(--brand)':'var(--border)'};border-radius:12px"><div class="between" style="margin-bottom:6px"><div class="flex" style="gap:8px;align-items:center"><span style="font-size:20px">${a.ic}</span><b style="font-size:13px">${a.n}</b></div><label class="flex" style="gap:6px;cursor:pointer;align-items:center"><input type="checkbox" class="axTog" data-id="${a.id}" ${on?'checked':''} style="width:18px;height:18px"><span style="font-size:11px;font-weight:700;color:${on?'var(--brand)':'var(--t3)'}">${on?'Activo':'Inactivo'}</span></label></div><div style="font-size:11.5px;color:var(--t2);line-height:1.5;margin-bottom:10px">${a.desc}</div><div style="font-size:10.5px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Roles</div><div class="flex" style="gap:6px;flex-wrap:wrap">${a.allowRoles.map(r=>`<button class="btn btn-sm ${roles.includes(r)?'btn-pr':'btn-ghost'} axRole" data-id="${a.id}" data-role="${r}" ${on?'':'disabled'} style="padding:3px 10px;font-size:11px">${RL[r]||r}</button>`).join('')}</div><div style="font-size:10.5px;color:var(--t3);margin-top:8px">${on&&roles.length?('✅ Visible para: '+roles.map(r=>RL[r]||r).join(', ')+' · '+a.where):(on?'⚠ Activa sin roles seleccionados — elige al menos uno':'Inactivo')}</div></div>`;}).join('')}</div></div>`;})()}
      ${CX.intStore.CATS.map(cat=>{
        const catItems=items.filter(i=>i.cat===cat);
        if(!catItems.length)return '';
        return `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:800;color:var(--t3);letter-spacing:.6px;text-transform:uppercase;border-bottom:1px solid var(--border-2);padding-bottom:6px;margin-bottom:10px">${cat}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px">${catItems.map(card).join('')}</div></div>`;
      }).join('')}
      <div style="margin-top:8px">${ui.aiBox('Cada integración solicitada queda pendiente de activación antes de operar de extremo a extremo (WhatsApp, Sheets, Gemini, Metricool, Make, etc.). El prototipo registra la intención y el estado; la activación real confirma la conexión.','Ecosistema — estado honesto por integración')}</div>`;
    host.querySelectorAll('.axTog').forEach(c=>c.addEventListener('click',()=>{CX.addons.setOn(c.dataset.id,c.checked);draw();ui.toast('Add-on '+(c.checked?'activado':'desactivado'),'ok');}));
    host.querySelectorAll('.axRole').forEach(b=>b.addEventListener('click',()=>{CX.addons.toggleRole(b.dataset.id,b.dataset.role);draw();}));
    host.querySelectorAll('.intTog').forEach(c=>c.addEventListener('change',()=>{
      const item=CX.intStore.ITEMS.find(i=>i.id===c.dataset.id);
      if(c.checked&&item&&item.cfg&&item.cfg.length){c.checked=false;configModal(item);}
      else{CX.intStore.toggle(c.dataset.id);draw();ui.toast(c.checked?item.n+': solicitud registrada · pendiente de conexión':item.n+': solicitud retirada','ok');}
    }));
    host.querySelectorAll('.intCfg').forEach(b=>b.addEventListener('click',()=>{
      const item=CX.intStore.ITEMS.find(i=>i.id===b.dataset.id);if(item)configModal(item);
    }));
  };
  draw();
  CX.bus.on('integraciones',()=>draw());
  return host;
});
