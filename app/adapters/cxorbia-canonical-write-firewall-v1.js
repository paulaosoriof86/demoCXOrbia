/* CXOrbia — canonical write firewall v1.
   Transitional safety boundary for legacy UI controls that still mutate closure/local objects
   directly instead of calling the canonical CX.data command boundary.

   G2-B P0 correction: the authenticated HTTP command transport is activated only inside the
   exact canonical production host and only when the explicit synthetic-session flag is present.
   Server-side Firebase Auth/RBAC and CXORBIA_E2E_SYNTH_* enforcement remain authoritative.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-canonical-write-firewall-v1';
  const G2B_TOKEN='YES_PAULA_20260820_G2B_SYNTHETIC';
  const G2B_ENDPOINT='/api/tenants/tya/projects/cinepolis/g2b-synthetic/commands';
  const G2B_PREFIX='CXORBIA_E2E_SYNTH_';
  const str=v=>String(v==null?'':v).trim();
  const canonical=()=>root.CX_DEV_ENTRY_CANONICAL?.canonical===true||CX.BACKEND?.enabled===true;
  const post=id=>(CX.data?._posts||[]).find(x=>str(x.id||x.applicationId||x.postulationId)===str(id))||null;
  const ok=r=>r?.ok===true&&r?.status==='committed'&&r?.providerAck===true&&r?.successUiAllowed===true;

  function activateG2BSyntheticCommandLane(){
    const params=new URLSearchParams(root.location?.search||'');
    const host=str(root.location?.hostname).toLowerCase();
    const exactHost=host==='cxorbia-backend-dev.web.app'||host==='cxorbia-backend-dev.firebaseapp.com';
    const enabled=canonical()&&root.CX_PROTECTED_DEV_RUNTIME===true&&exactHost&&params.get('cxG2BSynthetic')===G2B_TOKEN;
    if(!enabled){
      root.CX_G2B_SYNTHETIC_COMMAND_LANE={ready:true,enabled:false,defaultProductionWriteState:'disabled',providerWrites:0,at:new Date().toISOString()};
      return false;
    }
    CX.BACKEND=CX.BACKEND||{};
    CX.BACKEND.enableCommandWrites=true;
    CX.BACKEND.commandEndpoint=G2B_ENDPOINT;
    CX.BACKEND.syntheticCommandWriteOnly=true;
    CX.BACKEND.syntheticTagPrefix=G2B_PREFIX;
    CX.BACKEND.writeMode='g2b-synthetic-command-only';
    const src='adapters/cxorbia-command-http-transport-v1.js';
    let script=document.querySelector('script[data-cx-g2b-command-transport="1"]');
    if(!script){
      script=document.createElement('script');script.src=src;script.async=false;script.dataset.cxG2bCommandTransport='1';
      script.onload=()=>{try{CX.commandHttpTransport?.activate?.();}catch(_){}};
      document.head.appendChild(script);
    }else{setTimeout(()=>{try{CX.commandHttpTransport?.activate?.();}catch(_){}},0);}
    root.CX_G2B_SYNTHETIC_COMMAND_LANE={ready:true,enabled:true,endpoint:G2B_ENDPOINT,syntheticTagPrefix:G2B_PREFIX,serverAuthRequired:true,realDataAllowed:false,externalHrWrites:false,payments:false,make:false,gemini:false,at:new Date().toISOString()};
    return true;
  }

  const message=result=>{
    if(ok(result))return null;
    if(result?.code==='COMMAND_WRITES_DISABLED')return'Acción no ejecutada: las escrituras reales siguen cerradas por gate. No se modificó ningún dato.';
    return'Acción no ejecutada: este flujo requiere persistencia canónica y ACK real. No se modificó ningún dato.';
  };
  async function run(button,fn,success){
    const oldDisabled=button.disabled,oldText=button.textContent;button.disabled=true;
    try{
      const result=await fn();
      if(!ok(result)){CX.ui?.toast?.(message(result),'warn',4200);return;}
      try{await CX.backend?.refresh?.();}catch(_){}
      CX.ui?.toast?.(success||'Cambio confirmado','ok',3200);
      try{CX.router?._reRender?.();}catch(_){}
    }catch(e){CX.ui?.toast?.('No fue posible confirmar la acción. No se aplicó un cambio local.','err',4200);}
    finally{button.disabled=oldDisabled;button.textContent=oldText;}
  }
  function hardBlock(event,reason){event.preventDefault();event.stopImmediatePropagation();CX.ui?.toast?.(reason||'Acción temporalmente bloqueada hasta que este control use el command adapter con ACK real. No se modificó ningún dato.','warn',4200);}

  activateG2BSyntheticCommandLane();

  document.addEventListener('click',event=>{
    if(!canonical())return;
    const t=event.target?.closest?.('button,a');if(!t)return;
    if(t.matches('[data-ap],[data-sb],[data-rj]')){
      const id=t.dataset.ap||t.dataset.sb||t.dataset.rj,p=post(id);if(!p)return;
      event.preventDefault();event.stopImmediatePropagation();
      const status=t.dataset.ap?'aprobada':t.dataset.sb?'standby':'rechazada';
      run(t,()=>CX.data.setApplicationStatus(id,status,{ackAware:true,reason:'admin-postulation-decision'}),status==='aprobada'?'Postulación aprobada':status==='standby'?'Postulación en standby':'Postulación rechazada');return;
    }
    if(t.matches('[data-authfecha],[data-keepfecha]')){
      const id=t.dataset.authfecha||t.dataset.keepfecha,p=post(id);if(!p)return;
      event.preventDefault();event.stopImmediatePropagation();
      const keep=Boolean(t.dataset.keepfecha);
      run(t,()=>CX.data.requestVisitReschedule(p.visitaId||p.visitId,keep?null:p.fechaProp,{ackAware:true,decision:keep?'keep_current':'approve_new',reason:'admin-reschedule-decision'}),keep?'Fecha original conservada':'Reprogramación confirmada');return;
    }
    if(t.matches('#pGroups [data-cancel]')){
      const p=post(t.dataset.cancel);if(!p)return;
      event.preventDefault();event.stopImmediatePropagation();
      run(t,()=>CX.data.requestVisitCancel(p.visitaId||p.visitId,{ackAware:true,reason:'admin-cancel',requestOnly:false}),'Cancelación confirmada');return;
    }
    if(t.matches('#pGroups [data-edit],#pGroups [data-reasig],#asignManual,#syncHR')){hardBlock(event);return;}
    if(t.id==='qSubmit'){hardBlock(event,'El envío del cuestionario queda bloqueado hasta su persistencia/evidencia canónica con ACK real. Las respuestas no se guardaron localmente.');return;}
    if(t.matches('#rNew,[data-del],#aCruzar,#aAsignar,#aEscenarios')){hardBlock(event,'Reservas permanece en lectura segura hasta que su persistencia canónica esté habilitada. No se modificó localStorage.');return;}
  },true);

  document.addEventListener('change',event=>{
    if(!canonical())return;
    const t=event.target;
    if(t?.matches?.('.rEst'))hardBlock(event,'El estado de reserva no puede cambiarse en memoria/localStorage en el runtime canónico.');
  },true);

  root.CX_CANONICAL_WRITE_FIREWALL={ready:true,version:VERSION,canonical:canonical(),directLocalWriteAllowed:false,g2bSyntheticLane:root.CX_G2B_SYNTHETIC_COMMAND_LANE||null,providerWrites:0,at:new Date().toISOString()};
})(typeof window!=='undefined'?window:globalThis);
