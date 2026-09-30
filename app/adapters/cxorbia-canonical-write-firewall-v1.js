/* CXOrbia — canonical write firewall v1.
   Transitional safety boundary for legacy UI controls that still mutate closure/local objects
   directly instead of calling the canonical CX.data command boundary.

   This is NOT a persistence implementation. It prevents those legacy paths from executing in
   the canonical runtime until each consumer is ACK-aware. Where enough entity context exists,
   it routes the action to CX.data command methods. No provider write occurs unless the explicit
   command write gate is enabled later.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-canonical-write-firewall-v1';
  const str=v=>String(v==null?'':v).trim();
  const canonical=()=>root.CX_DEV_ENTRY_CANONICAL?.canonical===true||CX.BACKEND?.enabled===true;
  const post=id=>(CX.data?._posts||[]).find(x=>str(x.id||x.applicationId||x.postulationId)===str(id))||null;
  const ok=r=>r?.ok===true&&r?.status==='committed'&&r?.providerAck===true&&r?.successUiAllowed===true;
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

  document.addEventListener('click',event=>{
    if(!canonical())return;
    const t=event.target?.closest?.('button,a');if(!t)return;

    /* Postulaciones: approval is already owned by the ACK-aware module handler; standby/reject remain protected here. */
    if(t.matches('[data-sb],[data-rj]')){
      const id=t.dataset.sb||t.dataset.rj,p=post(id);if(!p)return;
      event.preventDefault();event.stopImmediatePropagation();
      const status=t.dataset.sb?'standby':'rechazada';
      run(t,()=>CX.data.setApplicationStatus(id,status,{ackAware:true,reason:'admin-postulation-decision'}),status==='standby'?'Postulación en standby':'Postulación rechazada');return;
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

    /* Fail closed only for controls that still lack a durable ACK-aware owner.
       Postulations edit/reassign/manual assign/HR refresh and Reservations are now owned by
       provider-backed handlers; this firewall must not intercept those canonical commands. */
    if(t.id==='qSubmit'){hardBlock(event,'El envío del cuestionario queda bloqueado hasta su persistencia/evidencia canónica con ACK real. Las respuestas no se guardaron localmente.');return;}
    if(t.id==='aEscenarios'){hardBlock(event,'Los escenarios se administran desde la fuente configurada del proyecto; esta acción no realiza una carga local.');return;}
  },true);

  document.addEventListener('change',event=>{
    if(!canonical())return;
    /* Reservation state changes are ACK-aware in modules/reservas.js and are therefore allowed.
       No generic local-state change is authorized here. */
  },true);

  root.CX_CANONICAL_WRITE_FIREWALL={ready:true,version:VERSION,canonical:canonical(),directLocalWriteAllowed:false,providerWrites:0,at:new Date().toISOString()};
})(typeof window!=='undefined'?window:globalThis);
