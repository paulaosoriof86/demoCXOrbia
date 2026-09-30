/* CXOrbia TyA — canonical Reservations guard v2 (DEV human visual).
   The prototype module stores reservations in browser localStorage. Connected DEV must never
   present those records as backend/HR truth. Until a canonical reservation source is connected,
   reads use only an explicit protected payload and all mutations fail closed. */
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  if(params.get('cxHumanFullVisual')!=='YES_PAULA_20260731_FULL_PROFILE_DEV')return;
  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  function canonicalPeriod(){return str(CX.data?.period?.()?.periodKey||CX.data?.period?.()?.key||CX.data?.currentPeriodId).replace(/^cinepolis-/,'');}
  function canonicalPeriodId(){return str(CX.data?.currentPeriodId);}
  function canonicalProjectId(){return str(CX.data?.currentProjectId||CX.BACKEND?.defaultProjectId);}
  function branchId(v){return str((str(v?.sucursal)+'|'+str(v?.ciudad)).toLowerCase().replace(/\s+/g,'-'));}
  function records(){
    const project=canonicalProjectId(),periodId=canonicalPeriodId(),period=canonicalPeriod();
    return arr(CX.data?.__protectedReservations).filter(r=>
      (!r.projectId||str(r.projectId)===project)&&
      (!r.periodId||str(r.periodId)===periodId)&&
      (!r.periodo||str(r.periodo)===period)
    );
  }
  async function refresh(reason){
    if(typeof window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY!=='function')throw new Error('RESERVATION_READBACK_RECONCILER_REQUIRED');
    let last=null;
    for(let attempt=1;attempt<=8;attempt++){
      const readback=await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY(reason||'reservation_provider_ack');
      last=readback;
      if(readback?.ok===true&&readback?.skipped!==true){
        CX.bus?.emit?.('reservas',{source:'durable_provider_ack'});
        return readback;
      }
      if(readback?.ok===true&&readback?.skipped===true&&readback?.reason==='reconcile_in_progress'){
        await new Promise(resolve=>setTimeout(resolve,150*attempt));
        continue;
      }
      throw new Error(readback?.error||readback?.reason||'RESERVATION_READBACK_FAILED');
    }
    throw new Error(last?.error||'RESERVATION_READBACK_RECONCILE_TIMEOUT');
  }
  function assertAck(result){
    if(!result?.ok||result?.providerAck!==true||result?.committed!==true||result?.successUiAllowed!==true)throw new Error(result?.code||'RESERVATION_PROVIDER_ACK_REQUIRED');
    return result;
  }
  function install(){
    if(!CX.reservas)return;
    CX.reservas._key=()=>canonicalPeriodId();
    CX.reservas.periodoActual=canonicalPeriod;
    CX.reservas.sucursales=()=>{
      const project=canonicalProjectId(),periodId=canonicalPeriodId(),map={};
      arr(CX.data?._visitas).filter(v=>str(v.projectId)===project&&str(v.periodId)===periodId).forEach(v=>{
        const id=branchId(v);if(id&&!map[id])map[id]={id,sucursal:v.sucursal,ciudad:v.ciudad,pais:v.pais};
      });
      return Object.values(map);
    };
    CX.reservas._seed=()=>[];
    CX.reservas.list=()=>records();
    CX.reservas._persist=()=>false;
    CX.reservas.reservar=async(_pid,rec)=>{
      const duplicate=records().find(r=>str(r.sucursalId||r.branchId)===str(rec?.sucursalId||rec?.branchId)&&str(r.periodo||canonicalPeriod())===str(rec?.periodo||canonicalPeriod())&&str(r.shopperId)===str(rec?.shopperId));
      if(duplicate)return {dup:true,r:duplicate};
      const result=assertAck(await CX.data.createReservation(Object.assign({},rec,{periodo:rec?.periodo||canonicalPeriod()}),{ackAware:true,reason:'reservation_create'}));
      await refresh('reservation_create_ack');
      return {ok:true,r:records().find(r=>str(r.id||r.reservationId)===str(result.entityId))||{id:result.entityId},providerAck:true};
    };
    CX.reservas.setEstado=async(_pid,id,estado,extra)=>{
      const result=assertAck(await CX.data.setReservationStatus(id,estado,extra||{},{ackAware:true,reason:'reservation_status_update'}));
      await refresh('reservation_status_ack');
      return records().find(r=>str(r.id||r.reservationId)===str(result.entityId))||{id:result.entityId,estado};
    };
    CX.reservas.remove=async(_pid,id)=>{
      const result=assertAck(await CX.data.deleteReservation(id,{ackAware:true,reason:'reservation_delete'}));
      await refresh('reservation_delete_ack');
      return result;
    };
    CX.reservas.cruzar=async(_pid,periodo)=>{
      let cruzadas=0;
      for(const r of records().filter(r=>str(r.periodo)===str(periodo)&&['asignada','aprobada'].includes(str(r.estado||r.status)))){
        const v=arr(CX.data?._visitas).find(v=>str(v.projectId)===canonicalProjectId()&&str(v.periodId)===canonicalPeriodId()&&branchId(v)===str(r.sucursalId||r.branchId)&&(!v.shopperId||str(v.estado)==='disponible'));
        if(!v||!r.shopperId)continue;
        await CX.reservas.setEstado(null,r.id||r.reservationId,'cruzada',{visitId:v.id||v.visitId,shopperId:r.shopperId,shopper:r.shopper});
        cruzadas++;
      }
      return {cruzadas,providerAck:true};
    };
    CX.reservas.resumen=()=>{
      const L=records();
      return {total:L.length,solicitadas:L.filter(r=>str(r.estado||r.status)==='solicitada').length,asignadas:L.filter(r=>['asignada','aprobada'].includes(str(r.estado||r.status))).length,cruzadas:L.filter(r=>str(r.estado||r.status)==='cruzada').length,source:'durable_provider',readOnly:false};
    };
    window.CX_TYA_CANONICAL_RESERVATIONS={ready:true,version:'canonical-reservations-guard-v2',source:'durable_provider',browserLocalStorageAsSource:false,mutationsEnabled:true,providerAckRequired:true,readbackRequired:true,production:false};
  }
  install();document.addEventListener('DOMContentLoaded',install,{once:true});window.addEventListener('cx:full-visual-ready',install);
})();
