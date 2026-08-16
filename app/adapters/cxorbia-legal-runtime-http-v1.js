/* CXOrbia — provider-backed legal runtime bridge v1.
   Protected DEV only. Preserves the existing CX.confidencialidad gate interface.
   - reads the published legal version from the provider through /api/tenants/{tenant}/legal/current;
   - never uses localStorage/sessionStorage as legal authority;
   - never accepts automatically;
   - a receipt can be requested only after an explicit human checkbox + button click;
   - production entrypoint is intentionally not wired by this block.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};

  const VERSION='cxorbia-legal-runtime-http-v1';
  const legacy=CX.confidencialidad||null;
  let state={loaded:false,loading:null,error:null,current:null,scope:null,acceptance:null,pending:true,providerAck:false};

  const str=value=>String(value==null?'':value).trim();
  const protectedDev=()=>root.CX_PROTECTED_DEV_RUNTIME===true&&CX.BACKEND?.canonicalBackendProjectId==='cxorbia-backend-dev';
  const tenantId=()=>str(CX.backendAuth?.context?.()?.tenantId||CX.BACKEND?.tenantId);
  const authRole=()=>str(CX.backendAuth?.context?.()?.role||CX.session?.effectiveRole?.()||CX.session?.role);
  const authNamespace=()=>str(CX.backendAuth?.context?.()?.authNamespace||(authRole()==='shopper'?'shopper':'staff'));
  const endpoint=suffix=>`/api/tenants/${encodeURIComponent(tenantId())}/legal/${suffix}`;
  const escapeHtml=value=>String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  async function idToken(){
    const user=root.firebase?.auth?.()?.currentUser||null;
    if(!user||typeof user.getIdToken!=='function') throw new Error('LEGAL_RUNTIME_AUTH_SESSION_REQUIRED');
    return user.getIdToken(true);
  }

  function scopeFromCurrent(){
    return {
      tenantId:tenantId(),
      scopeMode:'tenant',
      projectId:null,
      role:authRole(),
      authNamespace:authNamespace()
    };
  }

  async function request(url,options={}){
    const token=await idToken();
    const response=await fetch(url,{
      method:options.method||'GET',
      headers:{
        'Authorization':`Bearer ${token}`,
        'Accept':'application/json',
        ...(options.body?{'Content-Type':'application/json'}:{})
      },
      credentials:'same-origin',
      cache:'no-store',
      body:options.body?JSON.stringify(options.body):undefined
    });
    let body={};
    try{body=await response.json();}catch(_){body={};}
    if(!response.ok||body.ok===false){
      const error=new Error(str(body.error)||`LEGAL_RUNTIME_HTTP_${response.status}`);
      error.status=response.status;
      throw error;
    }
    return body;
  }

  function hydrate(body){
    const current=body?.current||{};
    const scope=scopeFromCurrent();
    if(body?.authority!=='provider'||body?.targetProject!=='cxorbia-backend-dev') throw new Error('LEGAL_RUNTIME_PROVIDER_AUTHORITY_REQUIRED');
    if(!str(current.legalContentId)||!str(current.legalVersion)||!/^[a-f0-9]{64}$/.test(str(current.contentDigest).toLowerCase())) throw new Error('LEGAL_RUNTIME_CURRENT_INVALID');
    if(!str(current.renderedContent)) throw new Error('LEGAL_RUNTIME_CONTENT_REQUIRED');
    const bridged=CX.legalAcceptanceProviderBridge?.hydrate?.({scope,current,snapshot:body.acceptance||{}});
    state={
      loaded:true,
      loading:null,
      error:null,
      current:{
        legalContentId:str(current.legalContentId),
        legalVersion:str(current.legalVersion),
        contentDigest:str(current.contentDigest).toLowerCase(),
        renderedContent:String(current.renderedContent),
        counselStatus:str(current.counselStatus),
        interimGoLive:current.interimGoLive===true
      },
      scope,
      acceptance:body.acceptance||null,
      pending:bridged?bridged.pending!==false:true,
      providerAck:true
    };
    return state;
  }

  async function preload(force=false){
    if(!protectedDev()) return state;
    if(state.loaded&&!force) return state;
    if(state.loading&&!force) return state.loading;
    state.loading=(async()=>{
      try{
        const body=await request(endpoint('current'));
        return hydrate(body);
      }catch(error){
        state={...state,loaded:false,loading:null,error:str(error?.message||error),pending:true,providerAck:false};
        throw error;
      }
    })();
    return state.loading;
  }

  async function recordHumanAcceptance(){
    if(!state.loaded||!state.current||!state.scope) throw new Error('LEGAL_RUNTIME_CURRENT_NOT_READY');
    const key=`legal-human-${state.current.legalVersion}-${state.current.contentDigest.slice(0,16)}-${Date.now()}`;
    const prepared=CX.legalAcceptanceDurable?.buildHumanAcceptanceCommand?.({
      scope:state.scope,
      current:state.current,
      idempotencyKey:key,
      humanConfirmed:true
    });
    if(!prepared?.ok||!prepared.command) throw new Error(prepared?.code||'LEGAL_RUNTIME_COMMAND_BUILD_BLOCKED');
    const body=await request(endpoint('commands'),{method:'POST',body:{command:prepared.command}});
    if(body?.ok!==true||body?.providerAck!==true||body?.status!=='committed') throw new Error('LEGAL_RUNTIME_PROVIDER_ACK_REQUIRED');
    await preload(true);
    if(state.pending) throw new Error('LEGAL_RUNTIME_ACCEPTANCE_READBACK_PENDING');
    return body;
  }

  function showBlocked(error,role,go){
    const ui=CX.ui;
    if(!ui?.modal) return;
    ui.modal('Acceso legal pendiente',`
      <div style="font-size:13px;line-height:1.65;color:var(--t2)">
        No fue posible cargar desde el backend la versión legal publicada para esta cuenta.
        El acceso permanece bloqueado para evitar usar una copia local o una versión incorrecta.
      </div>
      <div style="margin-top:12px;font-size:11px;color:var(--t3)">Código: ${escapeHtml(str(error?.message||error)||'LEGAL_RUNTIME_NOT_READY')}</div>
      <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="cxLegalRetry">Reintentar</button></div>`,
      {onMount:(ov,close)=>{
        ov.querySelector('#cxLegalRetry')?.addEventListener('click',async()=>{
          close();
          try{await preload(true);showProvider(role,go);}catch(e){showBlocked(e,role,go);}
        });
      }});
  }

  function showAgreement(role,go){
    const ui=CX.ui;
    if(!ui?.modal||!state.current) return showBlocked(new Error('LEGAL_RUNTIME_UI_UNAVAILABLE'),role,go);
    const c=state.current;
    ui.modal('Términos de uso y confidencialidad',`
      <div style="font-size:11.5px;color:var(--t3);margin-bottom:8px">Versión ${escapeHtml(c.legalVersion)} · publicación interina ${c.interimGoLive?'activa':'no confirmada'}</div>
      <div style="max-height:46vh;overflow:auto;border:1px solid var(--border);border-radius:9px;padding:12px;background:var(--surface,#fff);white-space:pre-wrap;font-size:12px;line-height:1.55">${escapeHtml(c.renderedContent)}</div>
      <label style="display:flex;gap:9px;align-items:flex-start;margin-top:14px;font-size:12.5px;line-height:1.45"><input type="checkbox" id="cxLegalRead" style="margin-top:3px"> <span>Confirmo que he leído esta versión completa y acepto sus términos de uso, confidencialidad y tratamiento de información.</span></label>
      <label style="display:flex;gap:9px;align-items:flex-start;margin-top:9px;font-size:12.5px;line-height:1.45"><input type="checkbox" id="cxLegalHuman" style="margin-top:3px"> <span>Entiendo que esta aceptación se registrará para mi cuenta autenticada y para esta versión específica.</span></label>
      <div id="cxLegalErr" style="min-height:18px;margin-top:9px;font-size:11.5px;color:var(--red,#b91c1c)"></div>
      <div style="text-align:right;margin-top:8px"><button class="btn btn-pr" id="cxLegalAccept" disabled>Aceptar y continuar</button></div>`,
      {onMount:(ov,close)=>{
        const read=ov.querySelector('#cxLegalRead');
        const human=ov.querySelector('#cxLegalHuman');
        const accept=ov.querySelector('#cxLegalAccept');
        const err=ov.querySelector('#cxLegalErr');
        const sync=()=>{accept.disabled=!(read.checked&&human.checked);};
        read.addEventListener('change',sync);
        human.addEventListener('change',sync);
        accept.addEventListener('click',async()=>{
          if(!(read.checked&&human.checked)) return;
          accept.disabled=true;
          accept.textContent='Registrando...';
          err.textContent='';
          try{
            await recordHumanAcceptance();
            close();
            go();
          }catch(error){
            err.textContent='No fue posible registrar la aceptación. '+str(error?.message||error);
            accept.textContent='Aceptar y continuar';
            sync();
          }
        });
      }});
  }

  async function showProvider(role,go){
    try{
      await preload(false);
      if(state.pending===false){go();return;}
      showAgreement(role,go);
    }catch(error){showBlocked(error,role,go);}
  }

  const wrapped=Object.assign({},legacy||{});
  wrapped.pending=function(role){
    if(!protectedDev()) return legacy?.pending?legacy.pending(role):false;
    if(!state.loaded||state.error) return true;
    return state.pending!==false;
  };
  wrapped.show=function(role,go){
    if(!protectedDev()) return legacy?.show?legacy.show(role,go):go();
    return showProvider(role,go);
  };
  CX.confidencialidad=wrapped;

  CX.legalRuntimeHttp=Object.freeze({
    version:VERSION,
    preload,
    current:()=>state.current?{...state.current}:null,
    pending:()=>state.pending!==false,
    recordHumanAcceptance,
    status:()=>({
      version:VERSION,
      protectedDev:protectedDev(),
      providerAuthority:state.providerAck===true,
      loaded:state.loaded,
      pending:state.pending!==false,
      error:state.error,
      localStorageAuthority:false,
      sessionStorageAuthority:false,
      automaticAcceptance:false,
      humanConfirmationRequired:true,
      productionEntrypointWired:false,
      at:new Date().toISOString()
    })
  });
})(typeof window!=='undefined'?window:globalThis);
