/* CXOrbia · Automatizaciones (Make) + integraciones + IA — admin
   Ejemplos anonimizados, industria distinta (red de farmacias) — todo genérico. */
CX.module('automatizaciones', ({data,ui})=>{
  const A=CX.automations, AI=CX.ai;
  const host=ui.el('div');

  const draw=()=>{
    const list=A.list(), hook=A.hook(), log=A.log(), aic=AI.cfg();
    const scan=A.scanPendientes();

    const autoRow=(a)=>`<tr>
      <td><label class="flex" style="gap:8px;cursor:pointer"><input type="checkbox" class="autoTog" data-id="${a.id}" ${a.activa?'checked':''}><b style="font-size:12.5px">${A._icon(a.evento)} ${a.titulo}</b></label>
        <div style="font-size:10.5px;color:var(--t3);margin-top:2px">Evento: ${A.EVENTOS[a.evento]||a.evento} → ${a.to==='shopper'?'Shopper':'Equipo'}</div></td>
      <td><select class="sel autoCanal" data-id="${a.id}" style="width:auto;padding:5px 8px">${Object.keys(A.CANALES).map(c=>`<option value="${c}" ${c===a.canal?'selected':''}>${A.CANALES[c]}</option>`).join('')}</select></td>
      <td><input class="inp autoTpl" data-id="${a.id}" value="${a.plantilla.replace(/"/g,'&quot;')}" style="padding:5px 8px;font-size:11.5px"></td>
      <td><input class="inp autoHook" data-id="${a.id}" value="${(a.hook||'').replace(/"/g,'&quot;')}" placeholder="hook propio (opcional)" style="padding:5px 8px;font-size:11px"></td>
    </tr>`;

    const provOpts=Object.keys(AI.PROVIDERS).map(k=>`<option value="${k}" ${k===aic.provider?'selected':''}>${AI.PROVIDERS[k].label}</option>`).join('');
    const modelOpts=(AI.PROVIDERS[aic.provider]||AI.PROVIDERS.gemini).modelos.map(m=>`<option ${m===aic.model?'selected':''}>${m}</option>`).join('');

    host.innerHTML=`
    ${ui.ph('Automatizaciones & Integraciones', 'Conecta eventos de la operación con Make, WhatsApp, correo/Outlook y Sheets · IA opcional')}
    <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
      <div style="font-size:12.5px;color:var(--brand-dark)">Cada evento del flujo puede disparar un <b>escenario de Make</b> (webhook), un WhatsApp, un correo (Outlook/Gmail) o una fila en Sheets. Ejemplos mostrados con datos <b>anonimizados</b> (industria: red de farmacias).</div>
    </div>

    <div class="grid g2" style="gap:14px;margin-bottom:16px">
      <div class="card card-p">
        <div class="card-t" style="font-size:13px;margin-bottom:10px">🔗 Webhook de Make (escenario)</div>
        <label class="lbl">URL del webhook del escenario Make (de <b>este tenant</b>: ${A.tenantId()})</label>
        <input class="inp" id="hookUrl" value="${hook}" placeholder="https://hook.eu2.make.com/xxxxx" style="margin-bottom:8px">
        <div style="font-size:11px;color:var(--t3)">Pega aquí el webhook del escenario ya creado en Make. Cada automatización activa enviará su payload (evento, datos, plantilla) a ese escenario; desde Make ramificas a WhatsApp, correo, Sheets, CRM, etc.</div>
        <button class="btn btn-soft btn-sm" id="hookSave" style="margin-top:10px">Guardar webhook</button> <button class="btn btn-ghost btn-sm" id="hookTest">Probar disparo</button>
      </div>
      <div class="card card-p">
        <div class="card-t" style="font-size:13px;margin-bottom:10px">🧩 Integraciones</div>
        ${[['Make','Orquestador de escenarios',hook?'Conectado':'Configurar'],['Outlook / M365','Correo y calendario',aic._outlook?'Conectado':'Vincular'],['Gmail / Workspace','Correo',''],['Google Sheets','HR viva + export','Vinculado'],['WhatsApp Cloud','Mensajería',hook?'vía Make':'vía Make']].map(r=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)"><div><b style="font-size:12.5px">${r[0]}</b><div style="font-size:10.5px;color:var(--t3)">${r[1]}</div></div><button class="btn btn-ghost btn-sm" data-int="${r[0]}">${r[2]||'Vincular'}</button></div>`).join('')}
      </div>
    </div>

    <div class="card card-p" style="margin-bottom:16px">
      <div class="card-h"><div class="card-t">⚙️ Automatizaciones por evento</div><span class="muted" style="font-size:11px">activa/edita · canal y plantilla configurables</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Evento → destino</th><th>Canal</th><th>Plantilla del mensaje</th><th>Webhook propio</th></tr></thead><tbody>${list.map(autoRow).join('')}</tbody></table></div>
      <div style="font-size:11px;color:var(--t3);margin-top:8px">Variables: {shopper} {sucursal} {fecha} {estado} {score}. La <b>escritura de vuelta a HR</b> mantiene la doble vía sin duplicar.</div>
    </div>

    <div class="grid g2" style="gap:14px;margin-bottom:16px">
      <div class="card card-p">
        <div class="card-h"><div class="card-t">⏰ Alertas de pendientes</div><button class="btn btn-soft btn-sm" id="scanBtn">Escanear y notificar</button></div>
        <div class="grid g3" style="gap:8px">
          ${ui.kpi('Atrasadas',scan.atrasadas.length,'r')}${ui.kpi('Pend. cuestionario',scan.pendientes.length,'a')}${ui.kpi('Sin agendar',scan.desactualizadas.length,'a')}
        </div>
        <div style="font-size:11px;color:var(--t3);margin-top:8px">Programa recordatorios automáticos (Make) o dispáralos manualmente.</div>
      </div>
      <div class="card card-p">
        <div class="card-t" style="font-size:13px;margin-bottom:10px">🤖 Asistente de IA (importadores, extracción, generación)</div>
        <div class="grid g2" style="gap:8px 12px">
          <div><label class="lbl">Proveedor</label><select class="sel" id="aiProv">${provOpts}</select></div>
          <div><label class="lbl">Modelo (económico)</label><select class="sel" id="aiModel">${modelOpts}</select></div>
          <div style="grid-column:1/3"><label class="lbl">API key / endpoint</label><input class="inp" id="aiKey" value="${aic.apiKey||''}" placeholder="Pega tu API key de ${(AI.PROVIDERS[aic.provider]||{}).label||''}"></div>
        </div>
        <label class="flex" style="gap:8px;font-size:12px;color:var(--t1);margin-top:10px"><input type="checkbox" id="aiOn" ${aic.activa?'checked':''}> Activar IA como asistente (mapeo de columnas, extracción de documentos, generación de cuestionarios/propuestas)</label>
        <div style="font-size:11px;color:var(--t3);margin-top:6px">Recomendado <b>Gemini Flash</b> por costo/token; con caché de plantillas. La IA es <b>opcional</b>: sin ella, los importadores usan heurística (sin costo).</div>
        <button class="btn btn-soft btn-sm" id="aiSave" style="margin-top:10px">Guardar IA</button>
      </div>
    </div>

    <div class="card card-p">
      <div class="card-h"><div class="card-t">📜 Registro de disparos (Make)</div><span class="muted" style="font-size:11px">últimos eventos enviados</span></div>
      ${log.length?`<table class="tbl"><thead><tr><th>Fecha</th><th>Canal</th><th>Evento</th><th>Mensaje</th></tr></thead><tbody>
        ${log.slice(0,12).map(l=>`<tr><td style="font-size:11px">${l.fecha}</td><td>${ui.bdg(A.CANALES[l.canal]||l.canal,'b')}</td><td style="font-size:11.5px">${l.titulo}</td><td style="font-size:11px;color:var(--t2)">${l.txt}</td></tr>`).join('')}
      </tbody></table>`:ui.empty('📭','Aún no hay disparos. Activa automatizaciones y ejecuta acciones del flujo.')}
      <div style="margin-top:12px">${ui.aiBox('Toda acción del flujo (agendar, realizar, cuestionario, pago, reprogramación) y la escritura de vuelta a la HR pueden enviar su payload a un escenario de Make, que ramifica a WhatsApp/correo/Sheets/CRM. Datos del ejemplo: anonimizados.','Operación conectada vía Make')}</div>
    </div>`;
    bind();
  };

  const bind=()=>{
    host.querySelectorAll('.autoTog').forEach(c=>c.addEventListener('change',()=>{A.update(c.dataset.id,{activa:c.checked});ui.toast('Automatización '+(c.checked?'activada':'desactivada'),'ok');}));
    host.querySelectorAll('.autoCanal').forEach(s=>s.addEventListener('change',()=>A.update(s.dataset.id,{canal:s.value})));
    host.querySelectorAll('.autoTpl').forEach(i=>i.addEventListener('change',()=>A.update(i.dataset.id,{plantilla:i.value})));
    host.querySelectorAll('.autoHook').forEach(i=>i.addEventListener('change',()=>{A.update(i.dataset.id,{hook:i.value.trim()});ui.toast('Webhook de la automatización guardado','ok');}));
    host.querySelector('#hookSave').addEventListener('click',()=>{A.setHook(host.querySelector('#hookUrl').value.trim());ui.toast('Webhook de Make guardado','ok');});
    host.querySelector('#hookTest').addEventListener('click',()=>{A._pushLog({fecha:new Date().toISOString().slice(0,16).replace('T',' '),canal:'sheet',evento:'test',titulo:'Disparo de prueba',txt:'Payload de prueba enviado al escenario Make',hook:A.hook()||'(sin webhook)'});draw();ui.toast(A.hook()?'Disparo enviado a Make':'Configura el webhook primero','ok');});
    host.querySelectorAll('[data-int]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.int==='Outlook / M365'){AI.save({_outlook:true});ui.toast('Outlook vinculado (demo) · correo y calendario disponibles','ok');draw();}else ui.toast(b.dataset.int+': vinculación (demo)','ok');}));
    host.querySelector('#scanBtn').addEventListener('click',()=>{const r=A.notifyPendientes();ui.toast(r.alertas+' alerta(s) de visitas atrasadas enviadas','ok',3200);draw();});
    host.querySelector('#aiProv').addEventListener('change',e=>{AI.save({provider:e.target.value, model:(AI.PROVIDERS[e.target.value]||{}).modelos[0]});draw();});
    host.querySelector('#aiSave').addEventListener('click',()=>{AI.save({model:host.querySelector('#aiModel').value, apiKey:host.querySelector('#aiKey').value.trim(), activa:host.querySelector('#aiOn').checked});ui.toast('Configuración de IA guardada'+(host.querySelector('#aiOn').checked?' · IA activa':''),'ok');});
  };

  draw();
  return host;
});
