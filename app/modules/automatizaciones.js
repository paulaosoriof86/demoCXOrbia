/* CXOrbia · Automatizaciones (orquestador de eventos) + integraciones + IA — admin
   Ejemplos anonimizados, industria distinta (red de farmacias) — todo genérico. */
CX.module('automatizaciones', ({data,ui})=>{
  const A=CX.automations, AI=CX.ai;
  const host=ui.el('div');

  const draw=()=>{
    const list=A.list(), hookStatus=A.hookStatus(), log=A.log(), aic=AI.cfg();
    const scan=A.scanPendientes();

    const autoRow=(a)=>`<tr>
      <td><label class="flex" style="gap:8px;cursor:pointer"><input type="checkbox" class="autoTog" data-id="${a.id}" ${a.activa?'checked':''}><b style="font-size:12.5px">${A._icon(a.evento)} ${a.titulo}</b></label>
        <div style="font-size:10.5px;color:var(--t3);margin-top:2px">Evento: ${A.EVENTOS[a.evento]||a.evento} → ${a.to==='shopper'?'Shopper':'Equipo'}</div></td>
      <td><select class="sel autoCanal" data-id="${a.id}" style="width:auto;padding:5px 8px">${Object.keys(A.CANALES).map(c=>`<option value="${c}" ${c===a.canal?'selected':''}>${A.CANALES[c]}</option>`).join('')}</select></td>
      <td><input class="inp autoTpl" data-id="${a.id}" value="${a.plantilla.replace(/"/g,'&quot;')}" style="padding:5px 8px;font-size:11.5px"></td>
    </tr>`;

    const provOpts=Object.keys(AI.PROVIDERS).map(k=>`<option value="${k}" ${k===aic.provider?'selected':''}>${AI.PROVIDERS[k].label}</option>`).join('');
    const modelOpts=(AI.PROVIDERS[aic.provider]||AI.PROVIDERS.gemini).modelos.map(m=>`<option ${m===aic.model?'selected':''}>${m}</option>`).join('');

    host.innerHTML=`
    ${ui.ph('Automatizaciones & Integraciones', 'Conecta eventos de la operación con tu orquestador de automatizaciones, WhatsApp, correo/Outlook y Sheets · IA opcional')}
    <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
      <div style="font-size:12.5px;color:var(--brand-dark)">Cada evento del flujo puede disparar una <b>conexión con tu orquestador de automatizaciones</b>, un WhatsApp, un correo (Outlook/Gmail) o una fila en Sheets. Ejemplos mostrados con datos <b>anonimizados</b> (industria: red de farmacias).</div>
      <div style="font-size:11px;color:#92400e;margin-top:8px">🔒 <b>Pendiente de activación por tenant.</b> En el prototipo, los eventos solo se registran en el log local (simulación). El envío real, los envíos de WhatsApp/correo y las llamadas de IA se ejecutan desde el sistema central, no desde el navegador.</div>
    </div>

    <div class="grid g2" style="gap:14px;margin-bottom:16px">
      <div class="card card-p">
        <div class="card-t" style="font-size:13px;margin-bottom:10px">🔗 Conexión con tu orquestador de automatizaciones</div>
        <div style="font-size:11.5px;color:var(--t2);margin-bottom:8px">Estado: ${ui.statusBdg(hookStatus)}</div>
        <label class="flex" style="gap:8px;font-size:12.5px;color:var(--t1);margin-bottom:6px"><input type="checkbox" id="hookReady" ${A.hookRequested()?'checked':''}> Marcar como listo para conectar (se pedirá la URL real por un canal seguro al activarse)</label>
        <div style="font-size:11px;color:var(--t3)">🔒 Este prototipo no pide ni guarda ninguna URL o credencial real de conexión, ni por tenant ni por automatización individual — no hay ningún campo para pegarla. No se fabrica ninguna referencia local que aparente una conexión: esa referencia solo existe si la emite el sistema central una vez activo, y aquí siempre es nula.</div>
        <button class="btn btn-soft btn-sm" id="hookSave" style="margin-top:10px">Guardar preferencia</button> <button class="btn btn-ghost btn-sm" id="hookTest">Simular disparo (local)</button>
      </div>
      <div class="card card-p">
        <div class="card-t" style="font-size:13px;margin-bottom:10px">🧩 Integraciones</div>
        ${[['Orquestador de automatizaciones','Conecta eventos con tus herramientas',hookStatus==='pending_backend'?'Pendiente de activación':'Configurar'],['Outlook / M365','Correo y calendario',aic._outlook?'Preparado (demo)':'Vincular'],['Gmail / Workspace','Correo',''],['Google Sheets','HR viva + export','Preparado (demo)'],['WhatsApp Cloud','Mensajería','pendiente de activación']].map(r=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)"><div><b style="font-size:12.5px">${r[0]}</b><div style="font-size:10.5px;color:var(--t3)">${r[1]}</div></div><button class="btn btn-ghost btn-sm" data-int="${r[0]}">${r[2]||'Vincular'}</button></div>`).join('')}
      </div>
    </div>

    <div class="card card-p" style="margin-bottom:16px">
      <div class="card-h"><div class="card-t">⚙️ Automatizaciones por evento</div><span class="muted" style="font-size:11px">activa/edita · canal y plantilla configurables</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Evento → destino</th><th>Canal</th><th>Plantilla del mensaje</th></tr></thead><tbody>${list.map(autoRow).join('')}</tbody></table></div>
      <div style="font-size:11px;color:var(--t3);margin-top:8px">Variables: {shopper} {sucursal} {fecha} {estado} {score}. La <b>escritura de vuelta a HR</b> mantiene la doble vía sin duplicar. La conexión con el orquestador se gestiona a nivel de tenant (arriba), no por automatización individual.</div>
    </div>

    <div class="grid g2" style="gap:14px;margin-bottom:16px">
      <div class="card card-p">
        <div class="card-h"><div class="card-t">⏰ Alertas de pendientes</div><button class="btn btn-soft btn-sm" id="scanBtn" title="Detecta pendientes y prepara notificaciones in-app — no envía correo/WhatsApp real">Escanear y preparar notificaciones (in-app)</button></div>
        <div class="grid g3" style="gap:8px">
          ${ui.kpi('Atrasadas',scan.atrasadas.length,'r')}${ui.kpi('Pend. cuestionario',scan.pendientes.length,'a')}${ui.kpi('Sin agendar',scan.desactualizadas.length,'a')}
        </div>
        <div style="font-size:11px;color:var(--t3);margin-top:8px">Programa recordatorios automáticos o dispáralos manualmente.</div>
      </div>
      <div class="card card-p">
        <div class="between" style="margin-bottom:10px"><div class="card-t" style="font-size:13px">🤖 Asistente de IA (importadores, extracción, generación)</div>
          <button class="btn btn-ghost btn-sm" id="aiCompare" style="font-size:11px">📊 Comparar modelos</button></div>
        <div style="font-size:11.5px;color:var(--t3);margin-bottom:10px">CXOrbia es <b>agnóstica</b>: elige el modelo que prefieras por costo/beneficio. Ninguno viene preseleccionado.</div>
        <div class="grid g4" style="gap:8px;margin-bottom:12px">
          ${Object.entries(AI.PROVIDERS).map(([k,p])=>`<button class="card hov aiPick" data-aip="${k}" style="padding:11px;cursor:pointer;text-align:left;border:1px solid ${aic.provider===k?'var(--brand)':'var(--border)'};background:#fff;${aic.provider===k?'box-shadow:0 0 0 2px var(--brand-light)':''}">
            <div style="font-size:12.5px;font-weight:700;color:var(--t1)">${p.label}${aic.provider===k?' <span style="color:var(--brand);font-size:10px">●</span>':''}</div>
            <div style="font-size:10px;color:var(--t3);margin-top:2px">${'💲'.repeat(p.costo||1)} · ${p.ideal||''}</div></button>`).join('')}
        </div>
        <div class="grid g2" style="gap:8px 12px">
          <div><label class="lbl">Modelo (preferencia — el sistema decide con qué conectarse una vez activo)</label><select class="sel" id="aiModel">${modelOpts}</select></div>
          <div><label class="lbl">Estado de conexión</label><div class="inp" style="display:flex;align-items:center;color:var(--t3);font-size:12px">🔒 Solo el sistema central — sin API key en el navegador</div></div>
        </div>
        <label class="flex" style="gap:8px;font-size:12px;color:var(--t1);margin-top:10px"><input type="checkbox" id="aiOn" ${aic.activa?'checked':''}> Marcar IA como preferencia activa (mapeo, extracción de documentos, generación de cuestionarios/propuestas)</label>
        <div style="font-size:11px;color:var(--amber);margin-top:6px">🔒 El navegador nunca llama al proveedor de IA ni guarda su API key — eso lo resuelve el sistema autorizado una vez activo. Aquí solo se guarda tu preferencia de modelo para cuando esa conexión exista.</div>
        <div style="font-size:11px;color:var(--t3);margin-top:6px">Mientras tanto, los importadores y asistentes usan <b>heurística local</b> (sin costo ni llamada externa). El modelo que elijas aplica a TODAS las funciones inteligentes cuando la conexión esté activa.</div>
        <button class="btn btn-soft btn-sm" id="aiSave" style="margin-top:10px">Guardar preferencia</button>
        <select class="sel" id="aiProv" style="display:none">${provOpts}</select>
      </div>
    </div>

    <div class="card card-p">
      <div class="card-h"><div class="card-t">📜 Mensajes preparados (envío real pendiente de activación)</div><span class="muted" style="font-size:11px">últimos eventos encolados · estado por entrega</span></div>
      ${log.length?`<table class="tbl"><thead><tr><th>Fecha</th><th>Canal</th><th>Evento</th><th>Mensaje</th><th>Estado</th></tr></thead><tbody>
        ${log.slice(0,12).map(l=>`<tr><td style="font-size:11px">${l.fecha}</td><td>${ui.bdg(A.CANALES[l.canal]||l.canal,'b')}</td><td style="font-size:11.5px">${l.titulo}</td><td style="font-size:11px;color:var(--t2)">${l.txt}</td><td>${ui.statusBdg(l.estado==='pending_backend'?'pending_backend':(l.estado==='not_requested'?'not_requested':(l.canal==='whatsapp_web'?'prepared':'pending_backend')))}</td></tr>`).join('')}
      </tbody></table>`:ui.empty('📭','Aún no hay disparos. Activa automatizaciones y ejecuta acciones del flujo.')}
      <div style="font-size:10.5px;color:var(--t3);margin-top:8px">Cada mensaje preparado muestra su estado con el mismo vocabulario en toda la plataforma — "Preparado (vista previa)" para plantillas de WhatsApp Web listas para abrir manualmente, "Pendiente de activación" para todo lo que espera el envío real por correo/WhatsApp/Sheets. Nunca dice "enviado" ni "entregado" porque este prototipo no ejecuta ningún envío real.</div>
      <div style="margin-top:12px">${ui.aiBox('Toda acción del flujo (agendar, realizar, cuestionario, pago, reprogramación) y la escritura de vuelta a la HR pueden enviar los datos del evento a tu orquestador de automatizaciones, que ramifica a WhatsApp/correo/Sheets/CRM. Datos del ejemplo: anonimizados.','Operación conectada')}</div>
    </div>`;
    bind();
  };

  const bind=()=>{
    host.querySelectorAll('.autoTog').forEach(c=>c.addEventListener('change',()=>{if(!CX.permissions.gate('automation.configure',CX.permissions.ctx(),ui)){c.checked=!c.checked;return;}A.update(c.dataset.id,{activa:c.checked});ui.toast('Automatización '+(c.checked?'activada':'desactivada'),'ok');}));
    host.querySelectorAll('.autoCanal').forEach(s=>s.addEventListener('change',()=>{if(!CX.permissions.gate('automation.configure',CX.permissions.ctx(),ui)){draw();return;}A.update(s.dataset.id,{canal:s.value});}));
    host.querySelectorAll('.autoTpl').forEach(i=>i.addEventListener('change',()=>{if(!CX.permissions.gate('automation.configure',CX.permissions.ctx(),ui)){draw();return;}A.update(i.dataset.id,{plantilla:i.value});}));
    host.querySelector('#hookSave').addEventListener('click',()=>{if(!CX.permissions.gate('automation.configure',CX.permissions.ctx(),ui))return;const on=host.querySelector('#hookReady').checked;A.setHookRequested(on);ui.toast(on?'Marcado como listo para conectar (vista previa) · sin credencial real guardada · pendiente de activación':'Preferencia retirada','ok');draw();});
    host.querySelector('#hookTest').addEventListener('click',()=>{if(!CX.permissions.gate('integration.test',CX.permissions.ctx(),ui))return;const requested=A.hookRequested();A._pushLog({fecha:new Date().toISOString().slice(0,16).replace('T',' '),canal:'sheet',evento:'test',titulo:'Disparo de prueba (local)',txt:'Datos de evento de prueba preparados · envío real pendiente de activación',estado:requested?'pending_backend':'not_requested'});draw();ui.toast(requested?'Disparo simulado (vista previa) · envío real pendiente de activación':'Marca la preferencia de conexión primero','ok');});
    host.querySelectorAll('[data-int]').forEach(b=>b.addEventListener('click',()=>{if(!CX.permissions.gate('integration.configure',CX.permissions.ctx(),ui))return;if(b.dataset.int==='Outlook / M365'){AI.save({_outlook:true});ui.toast('Outlook preparado (demo) · conexión real de correo y calendario pendiente de activación','ok');draw();}else ui.toast(b.dataset.int+': preparado (demo) · conexión real pendiente de activación','ok');}));
    host.querySelector('#scanBtn').addEventListener('click',()=>{const r=A.notifyPendientes();ui.toast(r.alertas+' alerta(s) de visitas atrasadas preparadas · pendiente de confirmación/autorización','ok',3200);draw();});
    host.querySelector('#aiProv').addEventListener('change',e=>{if(!CX.permissions.gate('automation.configure',CX.permissions.ctx(),ui))return;AI.save({provider:e.target.value, model:(AI.PROVIDERS[e.target.value]||{}).modelos[0]});draw();});
    host.querySelectorAll('.aiPick').forEach(b=>b.addEventListener('click',()=>{if(!CX.permissions.gate('automation.configure',CX.permissions.ctx(),ui))return;AI.save({provider:b.dataset.aip, model:(AI.PROVIDERS[b.dataset.aip]||{}).modelos[0]});draw();}));
    host.querySelector('#aiCompare')?.addEventListener('click',()=>{
      ui.modal('📊 Comparativo de modelos de IA',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Elige por costo/beneficio según tu operación. CXOrbia funciona con cualquiera.</p>
        <table class="tbl"><thead><tr><th>Proveedor</th><th>Costo</th><th>Fuerte en</th><th>Ideal para</th></tr></thead><tbody>
        ${Object.values(AI.PROVIDERS).map(p=>`<tr><td><b>${p.label}</b></td><td>${'💲'.repeat(p.costo||1)}</td><td style="font-size:12px">${p.fuerte||''}</td><td style="font-size:12px">${p.ideal||''}</td></tr>`).join('')}
        </tbody></table>
        <div style="margin-top:12px">${ui.aiBox('Recomendación general: empieza con el más económico para volumen (importadores, operación) y agrega uno premium solo para documentos de marca. Puedes cambiar el proveedor cuando quieras.','Sin dependencia de un solo proveedor')}</div>
      `);
    });
    host.querySelector('#aiSave').addEventListener('click',()=>{if(!CX.permissions.gate('automation.configure',CX.permissions.ctx(),ui))return;AI.save({model:host.querySelector('#aiModel').value, activa:host.querySelector('#aiOn').checked});ui.toast('Preferencia de IA guardada (sin API key en el navegador)','ok');draw();});
  };

  draw();
  return host;
});
