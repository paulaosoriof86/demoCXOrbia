/* CXOrbia · Fuente de Hoja de Ruta por proyecto (HR Source)
   Contrato UI: la CONEXIÓN REAL la hace el backend. El frontend solo captura la
   configuración, muestra estados honestos y bloquea la importación si canImport=false.
   NUNCA muestra "conectado" sin una respuesta real del backend. */
window.CX = window.CX || {};

CX.hrSource = {
  KEY:'cx_hr_source',
  /* estados honestos aceptados por el contrato */
  STATES:{
    pendiente_backend:{label:'Pendiente backend', c:'#d97706', ic:'⏳', canImport:false},
    connected:        {label:'Conectado',          c:'#0e9c6e', ic:'✅', canImport:false},
    auth_error:       {label:'Error de permisos',  c:'#c8232c', ic:'🔒', canImport:false},
    not_found:        {label:'Hoja no encontrada', c:'#c8232c', ic:'❓', canImport:false},
    empty_range:      {label:'Rango vacío',         c:'#d97706', ic:'␀', canImport:false},
    schema_changed:   {label:'Columnas cambiadas',  c:'#d97706', ic:'⚠', canImport:false},
    parsed_with_warnings:{label:'Preview con avisos',c:'#d97706', ic:'⚠', canImport:true},
    blocked:          {label:'Bloqueado por errores críticos', c:'#c8232c', ic:'⛔', canImport:false},
    ready_for_preview:{label:'Preview listo',        c:'#2a6fdb', ic:'👁', canImport:false},
    ready_for_import: {label:'Listo para importar',  c:'#0e9c6e', ic:'⬇', canImport:true},
  },
  all(){ try{return JSON.parse(localStorage.getItem(this.KEY)||'{}');}catch(e){return {};} },
  get(pid){ const a=this.all(); return a[pid]||{ tipo:'google_sheets', sourceRef:'', maskedUrl:'', estado:'pendiente_backend', ultimaLectura:null, ultimoPreview:null, periodos:[], counts:{}, incidencias:[], canImport:false }; },
  /* RC69-1: NUNCA persiste la URL completa. Solo metadatos seguros; la URL real va al backend/secret. */
  save(pid, cfg){ const a=this.all();
    const safe={ tipo:cfg.tipo, sourceRef:cfg.sourceRef||'', maskedUrl:cfg.maskedUrl||'', estado:cfg.estado,
      ultimaLectura:cfg.ultimaLectura||null, ultimoPreview:cfg.ultimoPreview||null,
      periodos:cfg.periodos||[], counts:cfg.counts||{}, incidencias:cfg.incidencias||[], canImport:!!cfg.canImport };
    a[pid]=safe; try{localStorage.setItem(this.KEY, JSON.stringify(a));}catch(e){} CX.bus&&CX.bus.emit('hr-source'); },
  maskUrl(u){ if(!u) return '—'; try{ const s=String(u); return s.length>28 ? s.slice(0,14)+'…'+s.slice(-8) : s.slice(0,6)+'…'; }catch(e){ return '••••'; } },
  sourceRefFrom(u){ if(!u) return ''; try{ let s=String(u); const m=s.match(/[-\w]{25,}/); if(m) return 'ref:'+m[0].slice(0,10); return 'ref:'+btoa(s).slice(0,12); }catch(e){ return 'ref:manual'; } },
  /* RC69-2: evento backend determinístico (el backend NO lee DOM) */
  emitBackend(kind, pid){ const cfg=this.get(pid);
    const payload={ projectId:pid, sourceType:cfg.tipo, sourceRef:cfg.sourceRef||'', urlPending:!cfg.sourceRef, requestedAt:new Date().toISOString() };
    CX.bus&&CX.bus.emit('hr-source:'+kind, payload); return payload; },
};

CX.module('hrsource', ({data, ui})=>{
  const host=ui.el('div');
  const p=data.project();
  const pid=()=>data.currentProjectId;

  const draw=()=>{
    const cfg=CX.hrSource.get(pid());
    const st=CX.hrSource.STATES[cfg.estado]||CX.hrSource.STATES.pendiente_backend;
    const tipos=[['google_sheets','Google Sheets'],['excel_online','Excel Online / OneDrive'],['xlsx_manual','Carga manual XLSX']];
    host.innerHTML=`
      ${ui.ph('Fuente de Hoja de Ruta', p.name+' · la conexión real la ejecuta el backend · el prototipo captura la configuración y muestra estados honestos')}

      <div class="card card-p" style="margin-bottom:14px;border-left:4px solid ${st.c};background:${st.c}12">
        <div class="between">
          <div><div style="font-size:12px;color:var(--t3)">Estado de conexión</div>
            <div style="font-size:16px;font-weight:800;color:${st.c}">${st.ic} ${st.label}</div></div>
          <div style="text-align:right;font-size:11px;color:var(--t3)">
            <div>Última lectura: ${cfg.ultimaLectura||'—'}</div>
            <div>Último preview: ${cfg.ultimoPreview||'—'}</div>
          </div>
        </div>
        ${!st.canImport?`<div style="margin-top:8px;font-size:11.5px;color:var(--t2)">🔒 La importación está <b>bloqueada</b> hasta que el backend responda <code>ready_for_import</code> con <code>canImport=true</code>.</div>`:''}
      </div>

      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-t" style="margin-bottom:10px">Configuración de la fuente</div>
        <div class="grid g2" style="gap:10px 14px">
          <div><label class="lbl">Tipo de fuente</label><select class="sel" id="hsTipo">${tipos.map(([v,l])=>`<option value="${v}" ${cfg.tipo===v?'selected':''}>${l}</option>`).join('')}</select></div>
          <div><label class="lbl">URL privada de la fuente</label><input class="inp" id="hsUrl" placeholder="Pega la URL (no se almacena; va cifrada al backend)" value="">
            ${cfg.sourceRef?`<div style="font-size:10.5px;color:var(--t3);margin-top:3px">Guardada como referencia segura: <code>${cfg.sourceRef}</code> · ${cfg.maskedUrl||''} <span style="color:var(--green)">• URL real solo en backend/secret</span></div>`:''}</div>
        </div>
        <div class="flex wrap" style="gap:8px;margin-top:12px">
          <button class="btn btn-soft btn-sm" id="hsTest">🔌 Probar conexión</button>
          <button class="btn btn-soft btn-sm" id="hsPreview">👁 Generar preview</button>
          <button class="btn btn-pr btn-sm" id="hsSync">🔄 Solicitar sincronización</button>
          <button class="btn btn-ghost btn-sm" id="hsSave">💾 Guardar configuración</button>
        </div>
        <div style="font-size:10.5px;color:var(--t3);margin-top:8px">Estas acciones se encolan para el backend; no ejecutan la conexión desde el navegador.</div>
      </div>

      <div class="grid g2" style="gap:14px;margin-bottom:14px">
        <div class="card card-p">
          <div class="card-t" style="font-size:12.5px;margin-bottom:8px">🗂️ Tabs / periodos detectados</div>
          ${(cfg.periodos&&cfg.periodos.length)?cfg.periodos.map(pe=>`<div class="between" style="padding:5px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12px">${pe}</span></div>`).join(''):'<div style="font-size:12px;color:var(--t3)">Sin preview. El backend reporta los tabs/periodos al ejecutar la lectura.</div>'}
        </div>
        <div class="card card-p">
          <div class="card-t" style="font-size:12.5px;margin-bottom:8px">🌍 Conteos por país</div>
          ${Object.keys(cfg.counts||{}).length?Object.entries(cfg.counts).map(([k,v])=>`<div class="between" style="padding:5px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12px">${CX.paisName?CX.paisName(k):k}</span><b style="font-size:12.5px">${v}</b></div>`).join(''):'<div style="font-size:12px;color:var(--t3)">Sin conteos aún.</div>'}
        </div>
      </div>

      <div class="card card-p" style="margin-bottom:14px">
        <div class="card-t" style="font-size:12.5px;margin-bottom:8px">⚠ Incidencias de validación</div>
        ${(cfg.incidencias&&cfg.incidencias.length)?`<div style="overflow-x:auto"><table class="tbl" style="font-size:11.5px"><thead><tr><th>Sev.</th><th>Código</th><th>Periodo/Tab</th><th>Esperado</th><th>Detectado</th><th>Δ</th><th>Fila</th><th>Acción sugerida</th></tr></thead><tbody>${cfg.incidencias.map(i=>{const sv={critico:'🔴',alto:'🟠',medio:'🟡',bajo:'⚪'}[i.severidad]||'•';return `<tr><td>${sv}</td><td><code>${i.codigo||'—'}</code></td><td>${i.periodo||'—'}</td><td>${i.expected!=null?i.expected:'—'}</td><td>${i.detected!=null?i.detected:'—'}</td><td style="color:${(i.delta||0)!=0?'var(--red)':'var(--t3)'}">${i.delta!=null?i.delta:'—'}</td><td>${i.sourceRow||'—'}</td><td style="font-size:11px">${i.accion||'—'}</td></tr>`;}).join('')}</tbody></table></div>`:'<div style="font-size:12px;color:var(--t3)">Sin incidencias reportadas por el backend. Al recibir <code>issues[]</code> se muestran aquí con severidad, código, periodo, esperado/detectado, delta, fila y acción sugerida.</div>'}
        <div style="margin-top:10px;font-size:11px;color:var(--t3);line-height:1.7">
          <b>Tipos de incidencia que el backend puede reportar</b> (esperado vs detectado):
          conteo esperado ≠ detectado por país/periodo · fila adicional en revisión · fechas futuras ·
          submitidos sin visita asociada · liquidaciones sin visita · duplicados por llave natural ·
          columnas cambiadas (schema). Cada una llega en <code>issues[]</code> y bloquea la importación si es crítica.
        </div>
      </div>

      <div class="card card-p" style="background:var(--panel-2)">
        <div style="font-size:11.5px;color:var(--t2);line-height:1.7">
          <b>Contrato de respuesta del backend</b> (referencia para el equipo de integración):
          <pre style="font-size:11px;background:#0d1b2a;color:#cde3f7;border-radius:8px;padding:10px 12px;margin-top:6px;overflow:auto">{ "status":"ready_for_preview", "sourceType":"google_sheets",
  "periodsDetected":[], "counts":{"GT":34,"HN":10}, "issues":[], "canImport":false }</pre>
          El frontend refleja <code>status</code>, <code>counts</code>, <code>periodsDetected</code> e <code>issues</code>. Nunca importa si <code>canImport=false</code>.
        </div>
      </div>`;

    const setEstado=(estado, patch)=>{
      const c=Object.assign(CX.hrSource.get(pid()), patch||{}, {estado});
      c.canImport=(CX.hrSource.STATES[estado]||{}).canImport||false;
      CX.hrSource.save(pid(), c); draw();
    };
    host.querySelector('#hsSave').addEventListener('click',()=>{
      const url=(host.querySelector('#hsUrl').value||'').trim();
      const c=Object.assign(CX.hrSource.get(pid()), {tipo:host.querySelector('#hsTipo').value});
      if(url){ c.sourceRef=CX.hrSource.sourceRefFrom(url); c.maskedUrl=CX.hrSource.maskUrl(url); }
      CX.hrSource.save(pid(), c); draw();
      ui.toast('Configuración guardada · solo referencia segura en el navegador; la URL real va al backend/secret','ok',4200);
    });
    host.querySelector('#hsTest').addEventListener('click',()=>{
      const pl=CX.hrSource.emitBackend('test', pid());
      setEstado('pendiente_backend',{});
      ui.toast('🔌 Evento hr-source:test encolado · el backend reportará el estado real (no se conecta desde el navegador)','',4200);
    });
    host.querySelector('#hsPreview').addEventListener('click',()=>{
      const cfg=CX.hrSource.get(pid());
      if(!cfg.sourceRef){ui.toast('Guarda primero la fuente (URL)','warn');return;}
      CX.hrSource.emitBackend('preview', pid());
      setEstado('pendiente_backend',{});
      ui.toast('👁 Evento hr-source:preview encolado · verás tabs/periodos, conteos e incidencias cuando el backend responda','',4200);
    });
    host.querySelector('#hsSync').addEventListener('click',()=>{
      const cfg=CX.hrSource.get(pid());
      if(!cfg.canImport){ui.toast('⛔ Importación bloqueada: el backend debe responder ready_for_import (canImport=true)','warn',4200);return;}
      CX.hrSource.emitBackend('sync-request', pid());
      ui.toast('🔄 Evento hr-source:sync-request encolado al backend','ok');
    });
  };

  draw();
  CX.bus.on('hr-source',()=>draw());
  CX.bus.on('project',()=>draw());
  return host;
});
