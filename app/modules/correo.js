/* P0367: one provider-backed mailbox per authenticated user; no local mailbox authority. */
CX.module('correo',({ui})=>{
  const host=ui.el('div');
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const state={status:null,messages:[],selected:null,cursor:null,error:'',busy:false,uid:null,disposed:false};
  const controllers=new Set();let unsubscribe=null,timer=null;
  const auth=()=>window.firebase?.auth?.();
  const tenant=()=>String(window.CX_TENANT_RUNTIME_CONFIG?.tenantId||CX.data?.ctx?.()?.tenantId||'').trim();
  const errors={MAIL_AUTH_FAILED:'El servidor de correo rechazó las credenciales. Revisa tu dirección y contraseña.',MAIL_AUTH_REQUIRED:'Inicia sesión para abrir tu buzón.',MAIL_SESSION_INVALID:'Tu sesión caducó. Vuelve a iniciar sesión.',MAIL_MEMBERSHIP_DENIED:'Tu sesión no tiene acceso a este buzón.',MAIL_DISABLED:'La conexión de correo está pendiente de activación del servidor.',MAIL_ENCRYPTION_KEY_REQUIRED:'Falta completar la configuración segura del servidor de correo.',MAIL_TLS_FAILED:'No se pudo verificar la conexión segura con el servidor de correo.',MAIL_DNS_FAILED:'El servidor de correo no respondió.',MAIL_SYNC_BUSY:'Hay una lectura del buzón en curso. Intenta de nuevo en unos segundos.',MAIL_SYNC_COOLDOWN:'La bandeja acaba de actualizarse. Espera unos segundos.',MAIL_MESSAGE_NOT_FOUND:'El mensaje ya no está disponible en el servidor de correo.',MAIL_MESSAGE_TOO_LARGE:'Este mensaje supera el límite de lectura de 20 MB.',MAIL_CONNECTION_CHANGED:'La conexión cambió durante la lectura. Actualiza la bandeja.',MAIL_CONFIG_CONFLICT:'La cuenta cambió mientras se conectaba. Actualiza la pantalla.',MAIL_EMAIL_NOT_ALLOWED:'Usa una cuenta autorizada para el proveedor seleccionado.'};
  const explain=error=>errors[error?.code||error?.message]||'No se pudo completar la lectura. La bandeja conserva la última lectura confirmada.';
  function clear(){state.status=null;state.messages=[];state.selected=null;state.cursor=null;state.error='';for(const c of controllers)c.abort();controllers.clear();}
  function dispose(){state.disposed=true;clearInterval(timer);unsubscribe?.();clear();}
  async function request(suffix,method='GET',body){
    const user=auth()?.currentUser,tenantId=tenant();
    if(!user||!tenantId)throw Error('MAIL_AUTH_REQUIRED');
    const uid=user.uid,controller=new AbortController();controllers.add(controller);
    try{
      const token=await user.getIdToken(true);
      if(state.disposed||auth()?.currentUser?.uid!==uid)throw Error('MAIL_SESSION_INVALID');
      const response=await fetch('/api/tenants/'+encodeURIComponent(tenantId)+'/mailboxes/self/'+suffix,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(method==='POST'?{'Content-Type':'application/json'}:{})},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',credentials:'same-origin',signal:controller.signal});
      const result=await response.json();
      if(state.disposed||auth()?.currentUser?.uid!==uid)throw Error('MAIL_SESSION_INVALID');
      if(!response.ok||result.ok!==true){const error=Error(result.error||'MAIL_PROVIDER_FAILED');error.code=result.error;throw error;}
      return result;
    }finally{controllers.delete(controller);}
  }
  async function perform(task){
    if(state.busy||state.disposed)return;state.busy=true;state.error='';draw();
    try{await task();}catch(error){if(!state.disposed&&error.name!=='AbortError')state.error=explain(error);}
    finally{state.busy=false;if(!state.disposed)draw();}
  }
  async function loadList(append=false){
    const result=await request('messages'+(append&&state.cursor?'?before='+encodeURIComponent(state.cursor):''));
    state.messages=append?[...state.messages,...result.messages.filter(row=>!state.messages.some(old=>old.id===row.id))]:result.messages;
    state.cursor=result.nextCursor;
  }
  async function reload(sync=false,older=false){
    state.status=await request('status');
    if(!state.status.canRead){state.messages=[];state.selected=null;return;}
    if(sync){await request('sync','POST',{older});state.status=await request('status');}
    await loadList();
  }
  function draw(){
    const status=state.status,connected=status?.canRead===true,selected=state.selected;
    const last=status?.lastSyncAt?new Date(status.lastSyncAt).toLocaleString('es'):'Sin lectura de mensajes';
    host.innerHTML=`<style>.cx-user-mail-grid{display:grid;grid-template-columns:150px minmax(240px,320px) minmax(260px,1fr);min-height:480px;border:1px solid var(--border);border-radius:12px;overflow:hidden}.cx-user-mail-list{border-right:1px solid var(--border);max-height:68vh;overflow:auto}.cx-user-mail-reader{padding:20px;min-width:0;max-height:68vh;overflow:auto}.cx-user-mail-row{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--border);padding:14px;background:var(--panel);color:var(--t1);cursor:pointer}.cx-user-mail-row[aria-current=true]{background:var(--brand-light)}@media(max-width:850px){.cx-user-mail-grid{grid-template-columns:1fr}.cx-user-mail-folders{display:none}.cx-user-mail-list{max-height:260px;border-right:0;border-bottom:1px solid var(--border)}}.cx-user-mail-error{padding:12px;border:1px solid var(--danger,#b91c1c);border-radius:8px;margin:12px 0}.cx-user-mail-body{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;font:inherit}</style>
    <section class="card card-p" data-mailbox-owner="self" data-provider-backed="true" aria-busy="${state.busy}">
      <div class="between" style="gap:12px;flex-wrap:wrap"><div><h2 style="margin:0 0 6px">Mi correo</h2><p style="margin:0;color:var(--t2)">Tu bandeja corporativa, vinculada a tu sesión de CXOrbia.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-soft btn-sm" id="mail-refresh" ${!connected||state.busy?'disabled':''}>Actualizar</button><button class="btn btn-pr btn-sm" id="mail-connect" ${!status?.enabled||state.busy?'disabled':''}>${connected?'Cambiar conexión':'Conectar mi cuenta'}</button>${status?.connectionStatus==='connected'?'<button class="btn btn-ghost btn-sm" id="mail-disconnect" '+(state.busy?'disabled':'')+'>Desconectar</button>':''}</div></div>
      <div style="margin:14px 0;padding:12px;background:var(--panel-2);border-radius:8px"><b>${connected?'Cuenta conectada: '+esc(status.emailAddress):status?.connectionStatus==='revoked'?'Cuenta desconectada':status?.enabled?'Conecta tu cuenta para recibir correo':'Conexión segura pendiente de activación'}</b><div style="font-size:12px;color:var(--t2);margin-top:5px">${connected?'Última lectura: '+esc(last)+'. Se comprueban nuevos mensajes cada minuto mientras esta pantalla está abierta.':'La conexión se confirma cuando el servidor acepta tus credenciales y permite leer la bandeja.'}</div></div>
      ${state.error?'<div class="cx-user-mail-error" role="alert">'+esc(state.error)+'</div>':''}
      <div class="cx-user-mail-grid"><aside class="cx-user-mail-folders" style="padding:16px;background:var(--panel-2)"><b>Recibidos</b><p style="font-size:12px;color:var(--t2)">Los mensajes permanecen en el servidor.</p><button class="btn btn-ghost btn-sm" disabled title="El envío todavía no está activado">Redactar</button><p style="font-size:12px;color:var(--t3)">Envío pendiente de activación. No se envían correos automáticamente.</p></aside>
      <div class="cx-user-mail-list" aria-label="Mensajes recibidos">${state.messages.map(row=>'<button class="cx-user-mail-row" data-message="'+row.id+'" aria-current="'+(selected?.id===row.id)+'" '+(state.busy?'disabled':'')+'><div style="font-size:12px;color:var(--t2)">'+esc(row.fromName||row.fromAddress||'Remitente')+'</div><div style="font-weight:'+(row.read?'500':'750')+';margin:5px 0">'+esc(row.subject)+'</div>'+(row.providerPresent===false?'<small>Conservado en CXOrbia · ya no está en el servidor</small><br>':'')+'<small>'+esc(row.date?new Date(row.date).toLocaleString('es'):'Fecha no indicada')+'</small></button>').join('')||'<p style="padding:20px;color:var(--t2)">'+(state.busy?'Leyendo el buzón…':connected?'Aún no hay mensajes leídos. Usa Actualizar para consultar el servidor.':'La bandeja aparecerá después de conectar tu cuenta.')+'</p>'}${state.cursor?'<button class="btn btn-soft btn-sm" id="mail-more" '+(state.busy?'disabled':'')+'>Ver más mensajes leídos</button>':''}${status?.hasOlder?'<button class="btn btn-ghost btn-sm" id="mail-older" '+(state.busy?'disabled':'')+'>Leer mensajes anteriores del servidor</button>':''}</div>
      <article class="cx-user-mail-reader">${selected?(selected.providerPresent===false?'<p role="status">Copia leída anteriormente: este mensaje ya no está en el servidor de correo.</p>':'')+'<h3 style="margin-top:0;overflow-wrap:anywhere">'+esc(selected.subject)+'</h3><p><b>'+esc(selected.fromName)+'</b> '+esc(selected.fromAddress)+'</p><p style="font-size:12px;color:var(--t2)">Para: '+esc((selected.to||[]).map(row=>row.address||row.name).join(', '))+'</p><pre class="cx-user-mail-body">'+esc(selected.text||'(Sin cuerpo de texto)')+'</pre>'+((selected.attachments||[]).length?'<h4>Adjuntos del mensaje</h4><ul>'+selected.attachments.map(a=>'<li>'+esc(a.filename||'Adjunto')+' · '+esc(Math.ceil(a.bytes/1024))+' KB</li>').join('')+'</ul><p style="font-size:12px;color:var(--t2)">Los adjuntos se muestran como referencia; su descarga aún no está activada.</p>':'')+'<p style="font-size:11px;color:var(--t3);overflow-wrap:anywhere">Referencia CXOrbia: '+esc(selected.id)+'</p><button class="btn btn-soft btn-sm" disabled>Responder · envío pendiente</button>':'<p style="color:var(--t2)">Selecciona un correo para leerlo.</p>'}</article></div>
      <p style="font-size:12px;color:var(--t3);margin-bottom:0">Las carpetas locales de Outlook y los mensajes que ya no estén en el servidor no se importan mediante POP. Las alertas de revisión de hojas de ruta continúan dentro de CXOrbia, independientemente del correo.</p>
    </section>`;
    host.querySelector('#mail-refresh')?.addEventListener('click',()=>perform(()=>reload(true)));
    host.querySelector('#mail-more')?.addEventListener('click',()=>perform(()=>loadList(true)));
    host.querySelector('#mail-older')?.addEventListener('click',()=>perform(()=>reload(true,true)));
    host.querySelector('#mail-connect')?.addEventListener('click',connectModal);
    host.querySelector('#mail-disconnect')?.addEventListener('click',()=>perform(async()=>{await request('disconnect','POST',{});clear();await reload();}));
    host.querySelectorAll('[data-message]').forEach(button=>button.addEventListener('click',()=>perform(async()=>{state.selected=(await request('messages/'+button.dataset.message)).message;const row=state.messages.find(item=>item.id===state.selected.id);if(row)row.read=true;})));
  }
  function connectModal(){
    if(!state.status?.enabled)return;
    const providers=state.status.providers||[],initial=state.status.emailAddress||'';
    ui.modal('Conectar mi cuenta de correo',`<form id="mail-account-form"><label>Proveedor<select class="inp" name="providerId">${providers.map(row=>'<option value="'+esc(row.id)+'">'+esc(row.label)+'</option>').join('')}</select></label><label style="display:block;margin-top:12px">Tu correo<input class="inp" name="emailAddress" type="email" autocomplete="username" required value="${esc(initial)}"></label><label style="display:block;margin-top:12px">Contraseña de tu correo<input class="inp" name="password" type="password" autocomplete="current-password" required maxlength="1024"></label><p style="font-size:12px;color:var(--t2)">La contraseña se envía por HTTPS y queda cifrada en el servidor, vinculada sólo a tu usuario. CXOrbia conserva los correos en el servidor y no realiza envíos automáticos.</p><div id="mail-connect-error" role="alert"></div><button class="btn btn-pr" type="submit">Verificar y conectar</button></form>`,{onMount:(overlay,close)=>{
      const form=overlay.querySelector('form'),password=form.elements.password;
      form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button');if(button.disabled)return;button.disabled=true;const payload={providerId:form.elements.providerId.value,emailAddress:form.elements.emailAddress.value,password:password.value};password.value='';
        try{const result=await request('connect','POST',payload);payload.password='';state.status=result;close();await perform(()=>reload(true));}
        catch(error){overlay.querySelector('#mail-connect-error').textContent=explain(error);}
        finally{payload.password='';password.value='';button.disabled=false;}
      });
    }});
  }
  draw();
  const instance=auth();
  if(instance){unsubscribe=instance.onAuthStateChanged(user=>{if(state.disposed)return;if(state.uid!==user?.uid){clear();state.uid=user?.uid||null;state.busy=false;draw();if(user)void perform(()=>reload());}});}
  else{state.error='Inicia sesión para abrir tu buzón.';draw();}
  timer=setInterval(()=>{if(!host.isConnected){dispose();return;}if(!document.hidden&&state.status?.canRead&&!state.busy)void perform(()=>reload(true));},60000);
  return host;
});
