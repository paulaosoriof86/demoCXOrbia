/* CXOrbia · Fuente de Hoja de Ruta por proyecto (HR Source)
   Contrato UI: la conexión real la ejecuta el sistema central. El frontend solo captura la
   configuración, muestra estados honestos y bloquea la importación si canImport=false.
   NUNCA muestra "conectado" sin una respuesta real del sistema central. */
window.CX = window.CX || {};

CX.hrSource = {
  KEY:'cx_hr_source',
  STATES:{
    pendiente_backend:{label:'Pendiente de conexión', c:'#d97706', ic:'⏳', canImport:false},
    connected:{label:'Conectado', c:'#0e9c6e', ic:'✅', canImport:false},
    auth_error:{label:'Error de permisos', c:'#c8232c', ic:'🔒', canImport:false},
    not_found:{label:'Hoja no encontrada', c:'#c8232c', ic:'❓', canImport:false},
    empty_range:{label:'Rango vacío', c:'#d97706', ic:'␀', canImport:false},
    schema_changed:{label:'Columnas cambiadas', c:'#d97706', ic:'⚠', canImport:false},
    parsed_with_warnings:{label:'Vista previa con avisos',c:'#d97706',ic:'⚠',canImport:false},
    blocked:{label:'Bloqueado por errores críticos',c:'#c8232c',ic:'⛔',canImport:false},
    ready_for_preview:{label:'Vista previa lista',c:'#2a6fdb',ic:'👁',canImport:false},
    ready_for_import:{label:'Listo para importar',c:'#0e9c6e',ic:'⬇',canImport:true},
  },
  _canonical(){return CX.cxDataCommandBoundary?.canonicalMode?.()===true;},
  _projectId(){return String(CX.data?.currentProjectId||'');},
  _projectRecord(pid){
    pid=String(pid||this._projectId());
    const backend=Array.isArray(CX.data?.__backendAllProjectRecords)?CX.data.__backendAllProjectRecords.find(p=>String(p?.id||p?.projectId)===pid):null;
    if(backend)return backend;
    const current=CX.data?.project?.();if(current&&String(current.id||current.projectId)===pid)return current;
    const period=CX.data?.period?.();if(period&&CX.data?.programKey&&String(CX.data.programKey(period))===pid)return Object.assign({},period,{id:pid,projectId:pid});
    return null;
  },
  _default(){return{tipo:'google_sheets',sourceRef:'',providerBindingId:'',mappingRef:'',maskedUrl:'',estado:'pendiente_backend',ultimaLectura:null,ultimoPreview:null,periodos:[],counts:{},incidencias:[],canImport:false,syncMode:'manual',mappingContract:'',visitLinkField:'',stableKeys:[],gobierna:{}};},
  _fromProject(pid){
    const p=this._projectRecord(pid)||{},src=p.operationalSource||p.routeSource||{},admin=p.hrSourceAdmin||{},binding=String(src.providerBindingId||src.integrationSettingId||src.providerRef||admin.providerBindingId||admin.sourceRef||''),mapping=String(src.mappingRef||admin.mappingRef||admin.mappingContract||'');
    const tipo=admin.tipo||src.providerType||'google_sheets',estado=admin.estado||((binding&&mapping)?'connected':'pendiente_backend');
    return Object.assign(this._default(),admin,{tipo,sourceRef:binding,providerBindingId:binding,mappingRef:mapping,mappingContract:mapping,estado,canImport:!!admin.canImport});
  },
  all(){
    if(this._canonical()){const pid=this._projectId();return pid?{[pid]:this._fromProject(pid)}:{};}
    try{return JSON.parse(localStorage.getItem(this.KEY)||'{}');}catch(e){return{};}
  },
  get(pid){pid=String(pid||this._projectId());if(this._canonical())return this._fromProject(pid);const a=this.all();return a[pid]||this._default();},
  _providerType(tipo){return tipo==='excel_online'?'external_platform':tipo==='xlsx_manual'?'excel_import':'google_sheets';},
  _readPolicy(tipo){return tipo==='xlsx_manual'?'external_snapshot_import':'external_live';},
  _applyProjectReadback(row){
    if(!row?.id)return row;
    CX.data.__backendAllProjectRecords=Array.isArray(CX.data.__backendAllProjectRecords)?CX.data.__backendAllProjectRecords:[];
    const i=CX.data.__backendAllProjectRecords.findIndex(p=>String(p?.id||p?.projectId)===String(row.id));
    if(i>=0)CX.data.__backendAllProjectRecords[i]=Object.assign({},row);else CX.data.__backendAllProjectRecords.push(Object.assign({},row));
    (CX.data.projects||[]).filter(p=>CX.data.periodMatchesProjectScope?.(p,row.id)).forEach(p=>{p.operationalSource=Object.assign({},row.operationalSource||{});p.hrFuente=Object.assign({},row.hrFuente||{});p.hrSourceAdmin=Object.assign({},row.hrSourceAdmin||{});});
    CX.bus&&CX.bus.emit('hr-source');return row;
  },
  async save(pid,cfg,meta){
    pid=String(pid||this._projectId());cfg=Object.assign(this.get(pid),cfg||{});
    const safe={tipo:cfg.tipo||'google_sheets',sourceRef:cfg.sourceRef||cfg.providerBindingId||'',providerBindingId:cfg.providerBindingId||cfg.sourceRef||'',mappingRef:cfg.mappingRef||cfg.mappingContract||'',maskedUrl:cfg.maskedUrl||'',estado:cfg.estado||'pendiente_backend',ultimaLectura:cfg.ultimaLectura||null,ultimoPreview:cfg.ultimoPreview||null,periodos:cfg.periodos||[],counts:cfg.counts||{},incidencias:cfg.incidencias||[],canImport:!!cfg.canImport,syncMode:cfg.syncMode||'manual',mappingContract:cfg.mappingRef||cfg.mappingContract||'',visitLinkField:cfg.visitLinkField||'',stableKeys:cfg.stableKeys||[],gobierna:cfg.gobierna||{}};
    if(!this._canonical()){
      const a=this.all();a[pid]=safe;try{localStorage.setItem(this.KEY,JSON.stringify(a));}catch(e){}CX.bus&&CX.bus.emit('hr-source');return{ok:true,status:'preview',providerAck:false,readbackVerified:false};
    }
    const binding=String(safe.providerBindingId||''),mapping=String(safe.mappingRef||'');
    if(!binding||!mapping)return{ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,readbackVerified:false,code:!binding?'HR_SOURCE_PROVIDER_BINDING_REQUIRED':'HR_SOURCE_MAPPING_REQUIRED'};
    const current=this._projectRecord(pid);if(!current)return{ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,readbackVerified:false,code:'HR_SOURCE_PROJECT_RECORD_MISSING'};
    const next=Object.assign({},current);
    next.operationalSource=Object.assign({},current.operationalSource||{},{
      mode:'external',authority:'external_source',providerType:this._providerType(safe.tipo),readPolicy:this._readPolicy(safe.tipo),writePolicy:'external_read_only',providerBindingId:binding,mappingRef:mapping
    });
    next.hrFuente=Object.assign({},current.hrFuente||{},{origen:'externa',etiqueta:current.hrFuente?.etiqueta||'Fuente HR externa'});
    next.hrSourceAdmin=safe;
    const ack=await Promise.resolve(CX.data.updateProject(pid,next,{ackAware:true,reason:meta?.reason||'hr-source-safe-config'}));
    if(!(ack&&ack.ok===true&&ack.committed===true&&ack.providerAck===true&&ack.successUiAllowed===true&&ack.readbackVerified===true&&ack.entityReadback))return ack||{ok:false,status:'blocked',providerAck:false,readbackVerified:false,code:'HR_SOURCE_PROJECT_ACK_REQUIRED'};
    this._applyProjectReadback(ack.entityReadback);return ack;
  },
  maskUrl(u){if(!u)return'—';try{const s=String(u);return s.length>28?s.slice(0,14)+'…'+s.slice(-8):s.slice(0,6)+'…';}catch(e){return'••••';}},
  async register(pid,rawUrl,cfg){
    pid=String(pid||this._projectId());const current=Object.assign(this.get(pid),cfg||{});
    if(!rawUrl||!String(rawUrl).trim())return{status:'blocked',providerAck:false,message:'URL requerida para registrar la fuente.'};
    if(!CX.backendHrSourceBridge?.handle)return{status:'pendiente_backend',providerAck:false,message:'Canal backend HR no disponible.'};
    return CX.backendHrSourceBridge.handle('register',{projectId:pid,sourceType:current.tipo,sourceRef:current.sourceRef||'',mappingRef:current.mappingRef||current.mappingContract||'',privateSourceUrl:String(rawUrl).trim(),requestedAt:new Date().toISOString()});
  },
  emitBackend(kind,pid){
    pid=String(pid||this._projectId());const cfg=this.get(pid),payload={projectId:pid,sourceType:cfg.tipo,sourceRef:cfg.providerBindingId||cfg.sourceRef||'',mappingRef:cfg.mappingRef||cfg.mappingContract||'',maskedUrl:cfg.maskedUrl||'',urlPending:!(cfg.providerBindingId||cfg.sourceRef),requestedAt:new Date().toISOString()};
    if(this._canonical()&&CX.backendHrSourceBridge?.handle)return CX.backendHrSourceBridge.handle(kind,payload);
    CX.bus&&CX.bus.emit('hr-source:'+kind,payload);return Promise.resolve(payload);
  },
}

CX.module('hrsource', ({data, ui})=>{
  const host=ui.el('div');
  const p=data.project();
  const pid=()=>data.currentProjectId;

  const draw=()=>{
    const cfg=CX.hrSource.get(pid());
    const st=CX.hrSource.STATES[cfg.estado]||CX.hrSource.STATES.pendiente_backend;
    const tipos=[['google_sheets','Google Sheets'],['excel_online','Excel Online / OneDrive'],['xlsx_manual','Carga manual XLSX']];
    host.innerHTML=`
      ${ui.ph('Fuente de Hoja de Ruta', p.name+' · la conexión real la ejecuta el sistema central · el prototipo captura la configuración y muestra estados honestos')}

      <div class="card card-p" style="margin-bottom:14px;border-left:4px solid ${st.c};background:${st.c}12">
        <div class="between">
          <div><div style="font-size:12px;color:var(--t3)">Estado de conexión</div>
            <div style="font-size:16px;font-weight:800;color:${st.c}">${st.ic} ${st.label}</div></div>
          <div style="text-align:right;font-size:11px;color:var(--t3)">
            <div>Última lectura: ${cfg.ultimaLectura||'—'}</div>
            <div>Última vista previa: ${cfg.ultimoPreview||'—'}</div>
          </div>
        </div>
        ${!st.canImport?`<div style="margin-top:8px;font-size:11.5px;color:var(--t2)">🔒 La importación está <b>bloqueada</b> hasta que la fuente quede lista y validada.</div>`:''}
      </div>

      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-t" style="font-size:12.5px;margin-bottom:8px">🚦 Etapas de activación</div>
        <div class="grid g4" style="gap:8px">
          ${[['Vista previa', st.canImport||['ready_for_preview','parsed_with_warnings'].includes(cfg.estado), 'Vista previa de los datos','Genera la vista previa'],
             ['Importación', false, 'Importación no autorizada todavía','Espera validación'],
             ['Consolidación', false, 'Bloqueado · requiere validación previa','Promover tras revisión'],
             ['Producción', false, 'Bloqueado · sin escritura realizada','Aprobación final']].map(([f,ok,d,next])=>`
            <div style="padding:10px 12px;border:1px solid var(--border);border-radius:9px;background:${ok?'#f0fdf4':'var(--panel-2)'}">
              <div style="font-size:12px;font-weight:700">${ok?'🟢 Listo':'🔒 '+(f==='Importación'?'No autorizado':'Bloqueado')} · ${f}</div>
              <div style="font-size:10.5px;color:var(--t3);margin-top:3px">${d}</div>
              <div style="font-size:10px;color:var(--brand);margin-top:4px">➡ Siguiente: ${next}</div>
            </div>`).join('')}
        </div>
        <div style="margin-top:10px;font-size:10.5px;color:var(--t3)">Solo el sistema central activa cada etapa. El prototipo nunca escribe datos reales.</div>
      </div>

      <div class="card card-p" style="margin-bottom:14px;background:var(--panel-2)">
        <div class="card-t" style="font-size:12.5px;margin-bottom:8px">🔗 De la fuente viva a candidatos protegidos (patrón genérico)</div>
        <div class="flex wrap" style="gap:6px;font-size:11px;margin-bottom:8px">
          ${ui.bdg('fuente viva','n')}→${ui.bdg('registro seguro','b')}→${ui.bdg('candidatos protegidos','n')}→${ui.bdg('en revisión','a')}→${ui.bdg('registro de decisiones','n')}→${ui.bdg('sin escribir','r')}
        </div>
        <div class="grid g2" style="gap:8px">
          <div style="font-size:11px;color:var(--t2)"><b>Vínculo de identidad</b> — vincula una fila de HR con un shopper existente, nunca por coincidencia visual.</div>
          <div style="font-size:11px;color:var(--t2)"><b>Vigencia de certificación</b> — propone si una certificación previa sigue vigente para el nuevo periodo.</div>
          <div style="font-size:11px;color:var(--t2)"><b>Elegibilidad de liquidación</b> — visitas elegibles a liquidar, aún sin cruce financiero real.</div>
          <div style="font-size:11px;color:var(--t2)"><b>Agrupación de pago</b> — agrupación propuesta para un lote, sin pago real ejecutado.</div>
        </div>
        <div style="font-size:10.5px;color:var(--t3);margin-top:8px">Cada candidato pasa por revisión humana obligatoria y queda registrado en el historial de decisiones antes de aplicarse.</div>
        <div style="margin-top:10px"><button class="btn btn-pr btn-sm" id="hsGenCand">🧬 Generar candidatos (vista previa)</button></div>
        <div id="hsCandOut" style="margin-top:10px"></div>
      </div>

      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-t" style="font-size:12.5px;margin-bottom:8px">🏷️ Estados posibles</div>
        <div class="flex wrap" style="gap:6px">
          ${[['Vista previa disponible','#2a6fdb'],['Advertencia','#d97706'],['Bloqueado','#c8232c'],['Pendiente de conexión','#64748b'],['No autorizado','#c8232c'],['Sin escritura realizada','#0e9c6e'],['Error de validación','#c8232c']].map(([l,c])=>`<span class="bdg" style="background:${c}1a;color:${c};border:1px solid ${c}55">${l}</span>`).join('')}
        </div>
      </div>

      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-t" style="margin-bottom:10px">Configuración de la fuente</div>
        <div class="grid g2" style="gap:10px 14px">
          <div><label class="lbl">Tipo de fuente</label><select class="sel" id="hsTipo">${tipos.map(([v,l])=>`<option value="${v}" ${cfg.tipo===v?'selected':''}>${l}</option>`).join('')}</select></div>
          <div><label class="lbl">URL privada de la fuente</label><input class="inp" id="hsUrl" placeholder="Pega la URL (no se almacena; queda cifrada al conectar)" value="">
            ${cfg.sourceRef?`<div style="font-size:10.5px;color:var(--t3);margin-top:3px">Guardada como referencia segura · ${cfg.maskedUrl||''} <span style="color:var(--green)">• URL real solo en el sistema central</span></div>`:''}</div>
        </div>
        <div class="flex wrap" style="gap:8px;margin-top:12px">
          <button class="btn btn-soft btn-sm" id="hsTest">🔌 Probar conexión</button>
          <button class="btn btn-soft btn-sm" id="hsPreview">👁 Generar vista previa</button>
          <button class="btn btn-pr btn-sm" id="hsSync">🔄 Solicitar sincronización</button>
          <button class="btn btn-ghost btn-sm" id="hsSave">💾 Guardar configuración</button>
        </div>
        <div style="font-size:10.5px;color:var(--t3);margin-top:8px">Estas acciones quedan en espera de activación; no ejecutan la conexión desde el navegador.</div>
      </div>

      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-t" style="margin-bottom:10px">Mapeo y gobernanza</div>
        <div class="grid g2" style="gap:10px 14px">
          <div><label class="lbl">Modo de sincronización</label><select class="sel" id="hsSyncMode">${[['manual','Manual (bajo demanda)'],['programada','Automática programada'],['webhook','Webhook (push)']].map(([v,l])=>`<option value="${v}" ${(cfg.syncMode||'manual')===v?'selected':''}>${l}</option>`).join('')}</select></div>
          <div><label class="lbl">Identificador de mapeo</label><input class="inp" id="hsMapping" value="${(cfg.mappingContract||'').replace(/"/g,'&quot;')}" placeholder="Ej. hr-contract-v3"></div>
          <div><label class="lbl">Campo de link por visita</label><input class="inp" id="hsLinkField" value="${(cfg.visitLinkField||'').replace(/"/g,'&quot;')}" placeholder="Ej. columna 'Link cuestionario'"></div>
          <div><label class="lbl">Llaves estables (separadas por coma)</label><input class="inp" id="hsKeys" value="${(cfg.stableKeys||[]).join(', ')}" placeholder="Ej. sucursal, quincena, escenario"></div>
        </div>
        <div style="margin-top:10px"><label class="lbl">La HR gobierna:</label>
          <div class="flex wrap" style="gap:12px;margin-top:4px">
            ${[['asignacion','Asignación'],['agenda','Agenda'],['realizacion','Realización'],['cuestionario','Cuestionario'],['submit','Submit']].map(([k,l])=>`<label class="flex" style="gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" class="hsGob" data-k="${k}" ${(cfg.gobierna||{})[k]?'checked':''}> ${l}</label>`).join('')}
          </div>
        </div>
        <div style="font-size:10.5px;color:var(--t3);margin-top:8px">Se persiste junto con el resto de la configuración de esta fuente (sin URLs reales, solo metadatos).</div>
      </div>

      <div class="grid g2" style="gap:14px;margin-bottom:14px">
        <div class="card card-p">
          <div class="card-t" style="font-size:12.5px;margin-bottom:8px">🗂️ Tabs / periodos detectados</div>
          ${(cfg.periodos&&cfg.periodos.length)?cfg.periodos.map(pe=>`<div class="between" style="padding:5px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12px">${pe}</span></div>`).join(''):'<div style="font-size:12px;color:var(--t3)">Sin vista previa aún. Se reportarán los tabs/periodos al ejecutar la lectura.</div>'}
        </div>
        <div class="card card-p">
          <div class="card-t" style="font-size:12.5px;margin-bottom:8px">🌍 Conteos por país</div>
          ${Object.keys(cfg.counts||{}).length?Object.entries(cfg.counts).map(([k,v])=>`<div class="between" style="padding:5px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12px">${CX.paisName?CX.paisName(k):k}</span><b style="font-size:12.5px">${v}</b></div>`).join(''):'<div style="font-size:12px;color:var(--t3)">Sin conteos aún.</div>'}
        </div>
      </div>

      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-t" style="font-size:12.5px;margin-bottom:8px">⚠ Incidencias de validación</div>
        ${(cfg.incidencias&&cfg.incidencias.length)?`<div style="overflow-x:auto"><table class="tbl" style="font-size:11.5px"><thead><tr><th>Sev.</th><th>Código</th><th>Periodo/Tab</th><th>Esperado</th><th>Detectado</th><th>Δ</th><th>Fila</th><th>Acción sugerida</th></tr></thead><tbody>${cfg.incidencias.map(i=>{const sv={critico:'🔴',alto:'🟠',medio:'🟡',bajo:'⚪'}[i.severidad]||'•';return `<tr><td>${sv}</td><td><code>${i.codigo||'—'}</code></td><td>${i.periodo||'—'}</td><td>${i.expected!=null?i.expected:'—'}</td><td>${i.detected!=null?i.detected:'—'}</td><td style="color:${(i.delta||0)!=0?'var(--red)':'var(--t3)'}">${i.delta!=null?i.delta:'—'}</td><td>${i.sourceRow||'—'}</td><td style="font-size:11px">${i.accion||'—'}</td></tr>`;}).join('')}</tbody></table></div>`:'<div style="font-size:12px;color:var(--t3)">Sin incidencias reportadas todavía. Al recibirlas se muestran aquí con severidad, código, periodo, esperado/detectado, delta, fila y acción sugerida.</div>'}
        <div style="margin-top:10px;font-size:11px;color:var(--t3);line-height:1.7">
          <b>Tipos de incidencia que puede reportar la fuente</b> (esperado vs detectado):
          conteo esperado ≠ detectado por país/periodo · fila adicional en revisión · fechas futuras ·
          submitidos sin visita asociada · liquidaciones sin visita · duplicados por llave natural ·
          columnas cambiadas. Cada una bloquea la importación si es crítica.
        </div>
      </div>

      <div class="card card-p" style="background:var(--panel-2);border-left:4px solid var(--red)">
        <div class="between" style="margin-bottom:8px"><div class="card-t" style="font-size:12.5px">📋 Estado de validación</div><span class="bdg" style="background:#c8232c1a;color:#c8232c;border:1px solid #c8232c55">⛔ Bloqueado · importación no autorizada</span></div>
        <div style="font-size:11.5px;color:var(--t2);line-height:1.7">Pendientes principales que impiden la importación real (los resuelve la activación):</div>
        <ul style="font-size:11.5px;color:var(--t2);line-height:1.7;margin:6px 0 0 16px">
          <li>Datos personales de shoppers en la fuente</li>
          <li>Duplicados de fuentes</li>
          <li>Codificación de caracteres inconsistente</li>
          <li>Notificaciones sin destinatario resuelto</li>
          <li>Fila adicional HN (junio) en revisión</li>
          <li>Liquidaciones pendientes de cruce financiero</li>
        </ul>
        <div style="margin-top:8px;font-size:11px;color:var(--t3)">Vista informativa. La importación real depende de la activación.</div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-2)">
          <div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:4px">🔐 Flujo de registro seguro</div>
          <div style="font-size:10.5px;color:var(--t3);line-height:1.7">1) Se solicita registro seguro · 2) El sistema central recibe la URL por canal seguro · 3) El sistema central guarda el secreto · 4) El sistema central devuelve una referencia opaca · 5) La vista previa usa esa referencia, nunca la URL. Mientras no exista esa referencia, la vista previa queda pendiente de conexión.</div>
        </div>
        ${(()=>{
          const sc = CX.dataSource && CX.dataSource.sourceContract ? CX.dataSource.sourceContract() : null;
          if(!sc) return '';
          const modeLbl={demo:'Demo',source_safe_preview:'Vista previa',connected:'Conectado'}[sc.sourceReadMode]||'No disponible';
          return `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-2)">
            <div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:6px">📡 Estado de la fuente (plataforma, no de esta HR)</div>
            <div class="flex wrap" style="gap:5px">
              ${ui.bdg('modo: '+modeLbl, sc.sourceReadMode==='demo'?'g':'n')}
              ${ui.bdg('activo: '+(sc.runtimeSyncActive?'sí':'no'), sc.runtimeSyncActive?'g':'n')}
              ${sc.sourceRef?ui.bdg('referencia registrada','b'):ui.bdg('sin referencia','a')}
            </div>
            <div style="font-size:10px;color:var(--t3);margin-top:5px">Última actualización: ${sc.sourceSnapshotAt?new Date(sc.sourceSnapshotAt).toLocaleString():'—'}${sc.blockers.length?' · '+sc.blockers.length+' pendiente(s) de plataforma':''}</div>
          </div>`;
        })()}
      </div>`;

    const setEstado=async(estado,patch)=>{
      const next=Object.assign(CX.hrSource.get(pid()),patch||{},{estado});
      next.canImport=(CX.hrSource.STATES[estado]||{}).canImport||false;
      const ack=await Promise.resolve(CX.hrSource.save(pid(),next,{reason:'hr-source-state-'+estado}));
      draw();return ack;
    };
    host.querySelector('#hsSave').addEventListener('click',async()=>{
      const url=(host.querySelector('#hsUrl').value||'').trim(),mapping=(host.querySelector('#hsMapping').value||'').trim();
      const next=Object.assign(CX.hrSource.get(pid()),{tipo:host.querySelector('#hsTipo').value,syncMode:host.querySelector('#hsSyncMode').value,mappingContract:mapping,mappingRef:mapping,visitLinkField:(host.querySelector('#hsLinkField').value||'').trim(),stableKeys:(host.querySelector('#hsKeys').value||'').split(',').map(s=>s.trim()).filter(Boolean),gobierna:Object.fromEntries([...host.querySelectorAll('.hsGob')].map(cb=>[cb.dataset.k,cb.checked]))});
      if(url){
        if(!mapping){ui.toast('Indica primero el identificador de mapeo del proyecto.','warn',4200);return;}
        const result=await CX.hrSource.register(pid(),url,next);draw();
        if(result?.providerAck===true&&result?.projectPersistence?.providerAck===true&&result?.projectPersistence?.readbackVerified===true)ui.toast('Fuente registrada y configuración confirmada por el proveedor.','ok',4200);
        else ui.toast(result?.message||'Registro enviado; la fuente permanece pendiente hasta recibir vínculo seguro y readback.','',5200);
        return;
      }
      const ack=await CX.hrSource.save(pid(),next,{reason:'hr-source-safe-config-edit'});draw();
      if(ack?.providerAck===true&&ack?.readbackVerified===true)ui.toast('Configuración HR actualizada con ACK/readback durable.','ok',4200);
      else ui.toast('Configuración no actualizada: falta vínculo seguro, mapeo o ACK/readback del proveedor.','warn',4800);
    });
    host.querySelector('#hsTest').addEventListener('click',async()=>{
      const cfg=CX.hrSource.get(pid());if(!(cfg.providerBindingId||cfg.sourceRef)){ui.toast('Registra primero la fuente y obtén un vínculo seguro.','warn',4200);return;}
      const result=await CX.hrSource.emitBackend('test',pid());draw();ui.toast(result?.message||'Prueba solicitada al proveedor.','',4200);
    });
    host.querySelector('#hsPreview').addEventListener('click',async()=>{
      const cfg=CX.hrSource.get(pid());if(!(cfg.providerBindingId||cfg.sourceRef)){ui.toast('Registra primero la fuente y obtén un vínculo seguro.','warn',4200);return;}
      const result=await CX.hrSource.emitBackend('preview',pid());draw();ui.toast(result?.message||'Vista previa solicitada al proveedor.','',4200);
    });
    host.querySelector('#hsSync').addEventListener('click',async()=>{
      const cfg=CX.hrSource.get(pid());if(!(cfg.estado==='ready_for_import'&&cfg.canImport===true)){ui.toast('⛔ Importación bloqueada: solo avanza cuando la fuente quede lista y validada','warn',4600);return;}
      const result=await CX.hrSource.emitBackend('sync-request',pid());draw();ui.toast(result?.message||'Solicitud de sincronización enviada al proveedor.','',4200);
    });
    host.querySelector('#hsGenCand')?.addEventListener('click',()=>{
      /* genera candidatos (vista previa) a partir del estado actual del proyecto — no lee la
         fuente externa (eso lo hace la activación), solo prepara los 4 tipos de candidato sobre
         datos ya presentes en el prototipo, siempre "sin escribir". Llave estable
         (projectId+tipo+origen): al volver a generar, ACTUALIZA el candidato existente en vez
         de duplicarlo. */
      const proj = data.period();
      const visitasProj = data._visitas.filter(v=>v.projectId===pid());
      const identity = visitasProj.filter(v=>v.shopperId).length;
      const carryover = data.shoppers.filter(s=>proj.countries.includes(s.pais) && (s.certs||0)>0).length;
      const liquidacion = visitasProj.filter(v=>['realizada','cuestionario'].includes(v.estado)).length;
      const lote = Math.ceil(liquidacion/8);
      const stamp=new Date().toISOString();
      const upsert=(tipo,cantidad)=>{
        try{
          const q=JSON.parse(localStorage.getItem('cx_review_queue')||'[]');
          const key='hrsrc-'+pid()+'-'+tipo;
          const auditRef='aud_'+Math.abs((key+stamp).split('').reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0)).toString(16).slice(0,6);
          const rec={key,tipo,cantidad,fecha:stamp,stage:'reviewQueue',origen:'hr-source',projectId:pid(),sourceRef:'src:hrsrc#'+key.slice(-6),auditRef};
          const i=q.findIndex(x=>x.key===key);
          if(i>=0) q[i]=rec; else q.push(rec);
          localStorage.setItem('cx_review_queue', JSON.stringify(q));
        }catch(e){}
      };
      upsert('identity_link', identity); upsert('certification_carryover', carryover); upsert('liquidation', liquidacion); upsert('payment_batch', lote);
      CX.hrSource.emitBackend('candidates-preview', pid());
      const out = host.querySelector('#hsCandOut');
      if(out) out.innerHTML = `<div class="card" style="padding:10px 12px;font-size:11.5px;color:var(--t2)">
        <b>Candidatos generados (vista previa · sin escribir):</b>
        vínculo de identidad: ${identity} · vigencia de certificación: ${carryover} · elegibilidad de liquidación: ${liquidacion} · agrupación de pago: ${lote}
        <div style="font-size:10.5px;color:var(--t3);margin-top:4px">Actualizado por llave estable (proyecto+tipo) — no duplica al volver a generar. Revísalos en la bandeja de conflictos del equipo. <button class="btn btn-ghost btn-sm" id="hsCandClear" style="padding:2px 8px;font-size:10.5px;margin-left:6px">🗑 Limpiar candidatos de este proyecto</button></div>
      </div>`;
      host.querySelector('#hsCandClear')?.addEventListener('click',()=>{
        try{ const q=JSON.parse(localStorage.getItem('cx_review_queue')||'[]').filter(x=>!(x.origen==='hr-source'&&x.projectId===pid())); localStorage.setItem('cx_review_queue', JSON.stringify(q)); }catch(e){}
        if(out) out.innerHTML='';
        ui.toast('Candidatos de este proyecto eliminados de la cola de revisión (vista previa)','',2800);
      });
      ui.toast('Candidatos preparados (vista previa) · cola de revisión actualizada · sin activar aún','ok',4200);
    });
  };

  draw();
  CX.bus.on('hr-source',()=>draw());
  CX.bus.on('project',()=>draw());
  return host;
});
