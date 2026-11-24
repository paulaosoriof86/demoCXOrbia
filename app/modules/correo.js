/* P0367: provider-backed mailbox and explicit SMTP submission for the signed-in owner. */
CX.module('correo',({ui})=>{
  const host=ui.el('div');
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const state={status:null,messages:[],outbox:[],folder:'inbox',selected:null,cursor:null,error:'',busy:false,sending:false,uid:null,disposed:false};
  const controllers=new Set();let unsubscribe=null,timer=null,modalClose=null;
  const auth=()=>window.firebase?.auth?.();
  const tenant=()=>String(window.CX_TENANT_RUNTIME_CONFIG?.tenantId||CX.data?.ctx?.()?.tenantId||'').trim();
  const errors={MAIL_AUTH_FAILED:'El servidor de correo rechazó las credenciales. Revisa tu dirección y contraseña.',MAIL_AUTH_REQUIRED:'Inicia sesión para abrir tu buzón.',MAIL_SESSION_INVALID:'Tu sesión caducó. Vuelve a iniciar sesión.',MAIL_MEMBERSHIP_DENIED:'Tu sesión no tiene acceso a este buzón.',MAIL_DISABLED:'La conexión de correo está pendiente de activación.',MAIL_SEND_DISABLED:'El envío de correo todavía no está activado para esta cuenta.',MAIL_ENCRYPTION_KEY_REQUIRED:'Falta completar la configuración segura del correo.',MAIL_TLS_FAILED:'No se pudo verificar la conexión segura con el servidor de correo.',MAIL_DNS_FAILED:'El servidor de correo no respondió.',MAIL_SYNC_BUSY:'Hay una operación del buzón en curso. Espera unos segundos.',MAIL_SYNC_COOLDOWN:'La bandeja acaba de actualizarse. Espera unos segundos.',MAIL_MESSAGE_NOT_FOUND:'El mensaje ya no está disponible para esta cuenta.',MAIL_MESSAGE_TOO_LARGE:'Este mensaje supera el límite de lectura de 20 MB.',MAIL_CONNECTION_CHANGED:'La conexión cambió. Actualiza la bandeja antes de continuar.',MAIL_CONFIG_CONFLICT:'La cuenta cambió mientras se conectaba. Actualiza la pantalla.',MAIL_EMAIL_NOT_ALLOWED:'Usa una cuenta autorizada para el proveedor seleccionado.',MAIL_RECIPIENT_INVALID:'Escribe de 1 a 20 direcciones válidas, separadas por comas, sin nombres ni saltos de línea.',MAIL_SUBJECT_INVALID:'Escribe un asunto de hasta 200 caracteres, sin saltos de línea.',MAIL_OUTGOING_BODY_INVALID:'Escribe el mensaje. El texto puede ocupar hasta 64 KB.',MAIL_REPLY_TRACE_INVALID:'Este mensaje no contiene una referencia válida para responder. Puedes redactar un correo nuevo.',MAIL_SMTP_RECIPIENT_REJECTED:'El servidor rechazó un destinatario. No se envió el mensaje a ninguno.',MAIL_SMTP_AUTH_UNSUPPORTED:'El servidor no permite el método seguro de autenticación disponible.',MAIL_SMTP_REJECTED:'El servidor rechazó el envío. Revisa el mensaje antes de intentarlo otra vez.',MAIL_PROVIDER_TIMEOUT:'El servidor tardó demasiado en responder.',MAIL_SEND_INTERRUPTED_BEFORE_DATA:'La operación terminó antes de enviar el mensaje.',MAIL_DUPLICATE_UNRESOLVED:'Ya existe un envío igual sin confirmación. Revísalo en Enviados; no se repetirá.',MAIL_SEND_RECORD_UNAVAILABLE:'Falta confirmar el resultado. Consulta este mismo envío para evitar duplicados.'};
  const explain=error=>errors[error?.code||error?.message]||'No se pudo completar la operación. Conservamos el último estado confirmado.';
  const labels={sending:'En curso',smtp_accepted:'Aceptado por el servidor',not_sent:'No enviado',delivery_unknown:'Sin confirmación'};
  function outcomeText(row){
    if(row.status==='smtp_accepted')return 'El servidor de correo aceptó el mensaje. Esto no confirma su entrega ni lectura por el destinatario.';
    if(row.status==='delivery_unknown')return 'La conexión terminó después de iniciar el envío y no llegó la confirmación. El correo podría haberse enviado. No se volverá a enviar automáticamente; verifica su recepción antes de crear otro.';
    if(row.status==='not_sent')return explain({code:row.error})+' Puedes revisar el contenido y realizar un nuevo intento.';
    return 'Se está comprobando el resultado. Consultar este envío conserva la misma referencia y no crea otro correo.';
  }
  function clear(){state.status=null;state.messages=[];state.outbox=[];state.selected=null;state.cursor=null;state.folder='inbox';state.error='';modalClose?.();modalClose=null;for(const c of controllers)c.abort();controllers.clear();}
  function dispose(){state.disposed=true;clearInterval(timer);unsubscribe?.();clear();}
  async function request(suffix,method='GET',body){
    const user=auth()?.currentUser,tenantId=tenant();
    if(!user||!tenantId)throw Error('MAIL_AUTH_REQUIRED');
    const uid=user.uid,controller=new AbortController();controllers.add(controller);
    try{
      const token=await user.getIdToken(true);
      if(state.disposed||auth()?.currentUser?.uid!==uid||tenant()!==tenantId)throw Error('MAIL_SESSION_INVALID');
      const response=await fetch('/api/tenants/'+encodeURIComponent(tenantId)+'/mailboxes/self/'+suffix,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(method==='POST'?{'Content-Type':'application/json'}:{})},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',credentials:'same-origin',signal:controller.signal});
      const result=await response.json();
      if(state.disposed||auth()?.currentUser?.uid!==uid||tenant()!==tenantId)throw Error('MAIL_SESSION_INVALID');
      if(!response.ok||result.ok!==true){const error=Error(result.error||'MAIL_PROVIDER_FAILED');error.code=result.error;error.status=response.status;throw error;}
      return result;
    }finally{controllers.delete(controller);}
  }
  async function perform(task){
    if(state.busy||state.sending||state.disposed)return;state.busy=true;state.error='';draw();
    try{await task();}catch(error){if(!state.disposed&&error.name!=='AbortError')state.error=explain(error);}
    finally{state.busy=false;if(!state.disposed)draw();}
  }
  async function loadList(append=false){
    const result=await request('messages'+(append&&state.cursor?'?before='+encodeURIComponent(state.cursor):''));
    state.messages=append?[...state.messages,...result.messages.filter(row=>!state.messages.some(old=>old.id===row.id))]:result.messages;state.cursor=result.nextCursor;
  }
  async function loadOutbox(){state.outbox=state.status?.canViewOutbox?(await request('outbox')).messages:[];if(state.folder==='outbox'&&state.selected){const current=state.outbox.find(row=>row.id===state.selected.id);if(current)state.selected={...state.selected,...current};}}
  async function reload(sync=false,older=false){
    state.status=await request('status');await loadOutbox();
    if(!state.status.canRead){state.messages=[];if(state.folder==='inbox')state.selected=null;return;}
    if(sync){await request('sync','POST',{older});state.status=await request('status');}
    await loadList();
  }
  function draw(){
    const status=state.status,connected=status?.canRead===true,selected=state.selected,outgoing=state.folder==='outbox',locked=state.busy||state.sending;
    const last=status?.lastSyncAt?new Date(status.lastSyncAt).toLocaleString('es'):'Sin lectura de mensajes';
    const rows=outgoing?state.outbox:state.messages;
    const list=rows.map(row=>'<button class="cx-user-mail-row" data-message="'+esc(row.id)+'" aria-current="'+(selected?.id===row.id)+'" '+(locked?'disabled':'')+'><div style="font-size:12px;color:var(--t2)">'+esc(outgoing?(row.to||[]).join(', '):row.fromName||row.fromAddress||'Remitente')+'</div><div style="font-weight:'+(row.read||outgoing?'500':'750')+';margin:5px 0">'+esc(row.subject)+'</div>'+(outgoing?'<small>'+esc(labels[row.status]||'Pendiente')+'</small><br>':row.providerPresent===false?'<small>Conservado en CXOrbia · ya no está en el servidor</small><br>':'')+'<small>'+esc((row.date||row.createdAt)?new Date(row.date||row.createdAt).toLocaleString('es'):'Fecha no indicada')+'</small></button>').join('');
    const reader=selected?(outgoing?'<p role="status"><b>'+esc(labels[selected.status]||'Pendiente')+'</b></p><p>'+esc(outcomeText(selected))+'</p>':selected.providerPresent===false?'<p role="status">Copia leída anteriormente: este mensaje ya no está en el servidor de correo.</p>':'')+'<h3 style="margin-top:0;overflow-wrap:anywhere">'+esc(selected.subject)+'</h3><p><b>'+esc(selected.fromName||'')+'</b> '+esc(selected.fromAddress||selected.from)+'</p><p style="font-size:12px;color:var(--t2)">Para: '+esc((selected.to||[]).map(row=>typeof row==='string'?row:row.address||row.name).join(', '))+'</p><pre class="cx-user-mail-body">'+esc(selected.text||'(Sin cuerpo de texto)')+'</pre>'+((selected.attachments||[]).length?'<h4>Adjuntos del mensaje</h4><ul>'+selected.attachments.map(a=>'<li>'+esc(a.filename||'Adjunto')+' · '+esc(Math.ceil(a.bytes/1024))+' KB</li>').join('')+'</ul><p style="font-size:12px;color:var(--t2)">Los adjuntos se muestran como referencia; su descarga aún no está activada.</p>':'')+'<p style="font-size:11px;color:var(--t3);overflow-wrap:anywhere">Referencia del mensaje: '+esc(selected.messageId||selected.id)+'</p>'+(!outgoing?'<button id="mail-reply" class="btn btn-soft btn-sm" '+(!status?.canSend||locked||!selected.messageId?'disabled':'')+'>Responder</button>':''):'<p style="color:var(--t2)">Selecciona un correo para leerlo.</p>';
    host.innerHTML=`<style>.cx-user-mail-grid{display:grid;grid-template-columns:150px minmax(240px,320px) minmax(260px,1fr);min-height:480px;border:1px solid var(--border);border-radius:12px;overflow:hidden}.cx-user-mail-list{border-right:1px solid var(--border);max-height:68vh;overflow:auto}.cx-user-mail-reader{padding:20px;min-width:0;max-height:68vh;overflow:auto}.cx-user-mail-row{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--border);padding:14px;background:var(--panel);color:var(--t1);cursor:pointer}.cx-user-mail-row[aria-current=true]{background:var(--brand-light)}.cx-user-mail-folders button{margin-bottom:8px}@media(max-width:850px){.cx-user-mail-grid{grid-template-columns:1fr}.cx-user-mail-folders{display:flex;gap:8px}.cx-user-mail-folders p{display:none}.cx-user-mail-list{max-height:260px;border-right:0;border-bottom:1px solid var(--border)}}.cx-user-mail-error{padding:12px;border:1px solid var(--danger,#b91c1c);border-radius:8px;margin:12px 0}.cx-user-mail-body{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;font:inherit}</style>
    <section class="card card-p" data-mailbox-owner="self" data-provider-backed="true" aria-busy="${locked}">
      <div class="between" style="gap:12px;flex-wrap:wrap"><div><h2 style="margin:0 0 6px">Mi correo</h2><p style="margin:0;color:var(--t2)">Tu bandeja corporativa, vinculada a tu sesión de CXOrbia.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-pr btn-sm" id="mail-compose" ${!status?.canSend||locked?'disabled':''}>Redactar</button><button class="btn btn-soft btn-sm" id="mail-refresh" ${(!connected&&!status?.canViewOutbox)||locked?'disabled':''}>Actualizar</button><button class="btn btn-soft btn-sm" id="mail-connect" ${!status?.enabled||locked?'disabled':''}>${connected?'Cambiar conexión':'Conectar mi cuenta'}</button>${status?.connectionStatus==='connected'?'<button class="btn btn-ghost btn-sm" id="mail-disconnect" '+(locked?'disabled':'')+'>Desconectar</button>':''}</div></div>
      <div style="margin:14px 0;padding:12px;background:var(--panel-2);border-radius:8px"><b>${connected?'Cuenta conectada: '+esc(status.emailAddress):status?.connectionStatus==='revoked'?'Cuenta desconectada':status?.enabled?'Conecta tu cuenta para recibir correo':'Conexión segura pendiente de activación'}</b><div style="font-size:12px;color:var(--t2);margin-top:5px">${connected?'Última lectura: '+esc(last)+'. Se comprueban nuevos mensajes cada minuto mientras esta pantalla está abierta.':'La conexión se confirma cuando el servidor acepta tus credenciales y permite leer la bandeja.'}</div><p style="font-size:12px;margin-bottom:0">${status?.canSend?'El envío está disponible cuando tú pulsas Enviar.':'Envío pendiente de activación.'} No se envían correos automáticamente.</p></div>
      ${state.error?'<div class="cx-user-mail-error" role="alert">'+esc(state.error)+'</div>':''}
      <div class="cx-user-mail-grid"><aside class="cx-user-mail-folders" style="padding:16px;background:var(--panel-2)"><button id="mail-inbox" class="btn btn-soft btn-sm" aria-pressed="${!outgoing}">Recibidos</button><button id="mail-outbox" class="btn btn-soft btn-sm" aria-pressed="${outgoing}" ${!status?.canViewOutbox?'disabled':''}>Enviados</button><p style="font-size:12px;color:var(--t2)">Los mensajes permanecen en el servidor.</p><p style="font-size:12px;color:var(--t3)">Enviados muestra únicamente los intentos realizados desde CXOrbia y su confirmación.</p></aside>
      <div class="cx-user-mail-list" aria-label="${outgoing?'Envíos desde CXOrbia':'Mensajes recibidos'}">${list||'<p style="padding:20px;color:var(--t2)">'+(locked?'Consultando el buzón…':outgoing?'Aún no hay envíos registrados desde CXOrbia.':connected?'Aún no hay mensajes leídos. Usa Actualizar para consultar el servidor.':'La bandeja aparecerá después de conectar tu cuenta.')+'</p>'}${!outgoing&&state.cursor?'<button class="btn btn-soft btn-sm" id="mail-more" '+(locked?'disabled':'')+'>Ver más mensajes leídos</button>':''}${!outgoing&&status?.hasOlder?'<button class="btn btn-ghost btn-sm" id="mail-older" '+(locked?'disabled':'')+'>Leer mensajes anteriores del servidor</button>':''}</div>
      <article class="cx-user-mail-reader">${reader}</article></div>
      <p style="font-size:12px;color:var(--t3);margin-bottom:0">Las carpetas locales de Outlook y los mensajes que ya no estén en el servidor no se importan mediante POP. Las alertas de revisión de hojas de ruta continúan dentro de CXOrbia, independientemente del correo.</p>
    </section>`;
    host.querySelector('#mail-refresh')?.addEventListener('click',()=>perform(async()=>{await reload(connected&&!outgoing);if(outgoing&&selected)state.selected=(await request('outbox/'+selected.id)).message;}));
    host.querySelector('#mail-more')?.addEventListener('click',()=>perform(()=>loadList(true)));
    host.querySelector('#mail-older')?.addEventListener('click',()=>perform(()=>reload(true,true)));
    host.querySelector('#mail-connect')?.addEventListener('click',connectModal);
    host.querySelector('#mail-compose')?.addEventListener('click',()=>composeModal());
    host.querySelector('#mail-reply')?.addEventListener('click',()=>composeModal(selected));
    host.querySelector('#mail-inbox')?.addEventListener('click',()=>{if(locked)return;state.folder='inbox';state.selected=null;draw();});
    host.querySelector('#mail-outbox')?.addEventListener('click',()=>perform(async()=>{state.folder='outbox';state.selected=null;await loadOutbox();}));
    host.querySelector('#mail-disconnect')?.addEventListener('click',()=>perform(async()=>{await request('disconnect','POST',{});clear();await reload();}));
    host.querySelectorAll('[data-message]').forEach(button=>button.addEventListener('click',()=>perform(async()=>{state.selected=(await request((outgoing?'outbox/':'messages/')+button.dataset.message)).message;const row=state.messages.find(item=>item.id===state.selected.id);if(row&&!outgoing)row.read=true;})));
  }
  function composeModal(parent=null){
    if(!state.status?.canSend||state.sending||state.busy)return;
    const owner=state.uid,account=state.status.emailAddress,to=parent?(parent.replyTo?.[0]?.address||parent.fromAddress||''):'',subject=parent?(/^re\s*:/i.test(parent.subject)?parent.subject:'Re: '+parent.subject):'';
    modalClose?.();
    ui.modal(parent?'Responder correo':'Redactar correo',`<form id="mail-compose-form"><p>De: <b>${esc(account)}</b></p><label>Para<input class="inp" name="to" type="email" multiple required maxlength="5200" value="${esc(to)}" ${parent?'readonly':''} placeholder="persona@empresa.com"></label><label style="display:block;margin-top:12px">Asunto<input class="inp" name="subject" required maxlength="200" value="${esc(subject)}" ${parent?'readonly':''}></label><label style="display:block;margin-top:12px">Mensaje<textarea class="inp" name="text" rows="9" required maxlength="65536" placeholder="Escribe tu mensaje"></textarea></label><p style="font-size:12px;color:var(--t2)">Texto de hasta 64 KB. ${parent?'La respuesta conservará la referencia del correo original.':'Se admiten hasta 20 destinatarios separados por comas.'}</p><div id="mail-send-status" role="status" aria-live="polite"></div><button class="btn btn-pr" type="submit">Enviar</button></form>`,{onMount:(overlay,close)=>{
      modalClose=close;const form=overlay.querySelector('form'),button=form.querySelector('button'),message=overlay.querySelector('#mail-send-status');let submission=null,outcome=null,inFlight=false;
      const freeze=value=>{form.elements.to.readOnly=value||Boolean(parent);form.elements.subject.readOnly=value||Boolean(parent);form.elements.text.readOnly=value;};
      form.addEventListener('submit',async event=>{
        event.preventDefault();if(inFlight||['smtp_accepted','delivery_unknown'].includes(outcome?.status))return;
        if(owner!==state.uid||account!==state.status?.emailAddress||!state.status?.canSend){message.textContent='La cuenta cambió. Cierra este borrador y vuelve a abrirlo desde tu buzón.';button.disabled=true;return;}
        if(outcome?.status==='not_sent'){submission=null;outcome=null;}
        if(!submission){
          if(!form.reportValidity())return;
          const text=form.elements.text.value,recipients=form.elements.to.value.split(',').map(value=>value.trim()).filter(Boolean);
          if(!text.trim()||new TextEncoder().encode(text).length>65536){message.textContent=errors.MAIL_OUTGOING_BODY_INVALID;return;}
          if(!recipients.length||recipients.length>20||recipients.some(value=>/[\r\n\0]/.test(value))){message.textContent=errors.MAIL_RECIPIENT_INVALID;return;}
          submission=parent?{idempotencyKey:crypto.randomUUID(),parentId:parent.id,text}:{idempotencyKey:crypto.randomUUID(),to:recipients,subject:form.elements.subject.value,text};
        }
        inFlight=true;state.sending=true;button.disabled=true;freeze(true);message.textContent='Comprobando el envío…';draw();
        try{
          const result=await request(parent?'reply':'send','POST',submission);outcome=result.outgoing;
          if(owner!==state.uid)return;
          message.textContent=outcomeText(outcome);button.textContent=outcome.status==='not_sent'?'Volver a enviar':outcome.status==='sending'?'Consultar este envío':labels[outcome.status];
          button.disabled=['smtp_accepted','delivery_unknown'].includes(outcome.status);freeze(outcome.status!=='not_sent');
          await loadOutbox().catch(()=>{});
        }catch(error){
          if(owner!==state.uid||state.disposed)return;
          message.textContent=explain(error);
          const safeToEdit=error.status===400||['MAIL_SEND_DISABLED','MAIL_SYNC_BUSY','MAIL_NOT_CONNECTED','MAIL_CONNECTION_CHANGED','MAIL_REPLY_TRACE_INVALID'].includes(error.code);
          if(safeToEdit){submission=null;freeze(false);button.textContent='Enviar';button.disabled=false;}
          else if(error.code==='MAIL_DUPLICATE_UNRESOLVED'){outcome={status:'delivery_unknown'};button.disabled=true;}
          else{message.textContent+=' Consulta este mismo envío; no redactes otro mientras no se confirme el resultado.';button.textContent='Consultar este envío';button.disabled=false;}
        }finally{inFlight=false;if(owner===state.uid){state.sending=false;if(!state.disposed)draw();}}
      });
    }});
  }
  function connectModal(){
    if(!state.status?.enabled||state.sending)return;
    const providers=state.status.providers||[],initial=state.status.emailAddress||'';modalClose?.();
    ui.modal('Conectar mi cuenta de correo',`<form id="mail-account-form"><label>Proveedor<select class="inp" name="providerId">${providers.map(row=>'<option value="'+esc(row.id)+'">'+esc(row.label)+'</option>').join('')}</select></label><label style="display:block;margin-top:12px">Tu correo<input class="inp" name="emailAddress" type="email" autocomplete="username" required value="${esc(initial)}"></label><label style="display:block;margin-top:12px">Contraseña de tu correo<input class="inp" name="password" type="password" autocomplete="current-password" required maxlength="1024"></label><p style="font-size:12px;color:var(--t2)">La contraseña se envía por HTTPS y queda cifrada en el servidor, vinculada sólo a tu usuario. CXOrbia conserva los correos en el servidor y no realiza envíos automáticos.</p><div id="mail-connect-error" role="alert"></div><button class="btn btn-pr" type="submit">Verificar y conectar</button></form>`,{onMount:(overlay,close)=>{
      modalClose=close;const form=overlay.querySelector('form'),password=form.elements.password;
      form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button');if(button.disabled)return;button.disabled=true;const payload={providerId:form.elements.providerId.value,emailAddress:form.elements.emailAddress.value,password:password.value};password.value='';
        try{const result=await request('connect','POST',payload);payload.password='';state.status=result;close();await perform(()=>reload(true));}
        catch(error){overlay.querySelector('#mail-connect-error').textContent=explain(error);}
        finally{payload.password='';password.value='';button.disabled=false;}
      });
    }});
  }
  draw();
  const instance=auth();
  if(instance){unsubscribe=instance.onAuthStateChanged(user=>{if(state.disposed)return;if(state.uid!==user?.uid){clear();state.uid=user?.uid||null;state.busy=false;state.sending=false;draw();if(user)void perform(()=>reload());}});}
  else{state.error='Inicia sesión para abrir tu buzón.';draw();}
  timer=setInterval(()=>{if(!host.isConnected){dispose();return;}if(!document.hidden&&(state.status?.canRead||state.status?.canViewOutbox)&&!state.busy&&!state.sending)void perform(()=>reload(state.status.canRead));},60000);
  return host;
});
