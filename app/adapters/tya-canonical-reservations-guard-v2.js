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
  function canonicalPeriod(){return str(CX.data?.period?.()?.periodKey||CX.data?.currentPeriodId).replace(/^cinepolis-/,'');}
  function canonicalPid(pid){const current=str(CX.data?.currentPeriodId);return current||str(pid);}
  function records(pid){
    const target=canonicalPid(pid),period=canonicalPeriod();
    return arr(CX.data?.__protectedReservations).filter(r=>(!r.projectId||str(r.projectId)===target||str(r.rootProjectId)==='cinepolis')&&(!r.periodo||str(r.periodo)===period));
  }
  function install(){
    if(!CX.reservas)return;
    const blocked=action=>({ok:false,blocked:true,reason:'canonical_reservation_source_not_connected',action,readOnly:true});
    CX.reservas._key=canonicalPid;
    CX.reservas.periodoActual=canonicalPeriod;
    CX.reservas._seed=()=>[];
    CX.reservas.list=pid=>records(pid);
    CX.reservas._persist=()=>false;
    CX.reservas.reservar=()=>blocked('reserve');
    CX.reservas.setEstado=()=>blocked('set_status');
    CX.reservas.remove=()=>blocked('remove');
    CX.reservas.cruzar=()=>blocked('cross_assignment');
    CX.reservas.resumen=pid=>{const L=records(pid);return {total:L.length,solicitadas:L.filter(r=>r.estado==='solicitada').length,asignadas:L.filter(r=>['asignada','aprobada'].includes(r.estado)).length,cruzadas:L.filter(r=>r.estado==='cruzada').length,source:'protected_canonical_or_empty',readOnly:true};};
    const original=CX.modules?.reservas;
    if(typeof original==='function'&&!original.__c6CanonicalReservations){
      const wrapped=args=>{
        const host=original(args);
        setTimeout(()=>{
          if(!host||!host.prepend)return;
          const banner=document.createElement('div');banner.className='card card-p';banner.style.cssText='margin-bottom:12px;border-left:4px solid var(--amber);background:#fff8ec';
          banner.innerHTML='<b>Reservas · fuente canónica pendiente</b><div style="font-size:12px;color:var(--t2);margin-top:4px">En DEV conectado no se leen ni escriben reservas desde localStorage. La pantalla permanece read-only hasta conectar la fuente por tenant/proyecto y pasar su gate.</div>';
          host.prepend(banner);
          host.querySelectorAll('#rNew,#aCruzar,#aAsignar,#aEscenarios,[data-del],.rEst').forEach(el=>{el.disabled=true;el.title='Bloqueado: fuente canónica de reservas pendiente';});
        },0);
        return host;
      };
      wrapped.__c6CanonicalReservations=true;CX.modules.reservas=wrapped;
    }
    window.CX_TYA_CANONICAL_RESERVATIONS={ready:true,version:'canonical-reservations-guard-v2',source:'protected_canonical_or_empty',browserLocalStorageAsSource:false,mutationsEnabled:false,providerWrites:0,production:false};
  }
  install();document.addEventListener('DOMContentLoaded',install,{once:true});window.addEventListener('cx:full-visual-ready',install);
})();
