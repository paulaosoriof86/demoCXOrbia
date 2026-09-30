/* ============================================================
   CXOrbia TyA Phase A · source-safe runtime guard
   Removes demo-only notification/reservation seeds from the
   dedicated TyA source-safe runtime without touching UI modules.
   ============================================================ */
(function(){
  'use strict';
  window.CX = window.CX || {};
  const enabled = !!(window.CX_TYA_PHASE_A_PREVIEW && CX.data && CX.data.previewMeta && CX.data.previewMeta.sourceSafe);
  if(!enabled) return;

  const removed = {
    notifications: Array.isArray(CX.notif && CX.notif._items) ? CX.notif._items.length : 0,
    reservationSeedDisabled: false,
    reservationCachesCleared: 0
  };

  if(CX.notif && Array.isArray(CX.notif._items)){
    CX.notif._items = [];
    CX.notif.sourceStatus = 'pending_backend_event_source';
    CX.notif.sourceSafe = true;
    CX.notif.imported = false;
    CX.notif.production = false;
  }

  if(CX.reservas){
    removed.reservationCachesCleared = Object.keys(CX.reservas._r || {}).length;
    CX.reservas._r = {};
    CX.reservas._seed = function(){ return []; };
    CX.reservas.sourceStatus = 'pending_backend_reservation_source';
    CX.reservas.sourceSafe = true;
    CX.reservas.imported = false;
    CX.reservas.production = false;
    removed.reservationSeedDisabled = true;
  }

  try{
    const keys=[];
    for(let i=0;i<localStorage.length;i+=1){
      const key=localStorage.key(i);
      if(key && key.indexOf('cx_reservas_cinepolis-')===0) keys.push(key);
    }
    keys.forEach(key=>localStorage.removeItem(key));
    removed.reservationCachesCleared += keys.length;
  }catch(e){}

  const report = Object.freeze({
    ready:true,
    generatedAt:new Date().toISOString(),
    notificationsSource:'pending_backend_event_source',
    reservationsSource:'pending_backend_reservation_source',
    demoNotificationsRemoved:removed.notifications,
    reservationSeedDisabled:removed.reservationSeedDisabled,
    reservationCachesCleared:removed.reservationCachesCleared,
    sourceSafe:true,
    imported:false,
    production:false,
    writes:false,
    providers:false
  });

  CX.phaseASourceSafeRuntimeGuard = report;
  CX.data.previewMeta = Object.assign({}, CX.data.previewMeta, {
    notificationSourceStatus:report.notificationsSource,
    reservationSourceStatus:report.reservationsSource,
    demoNotificationsRemoved:report.demoNotificationsRemoved,
    reservationSeedDisabled:report.reservationSeedDisabled
  });
  if(CX.dataSource){
    CX.dataSource.warnings = [
      ...(CX.dataSource.warnings||[]),
      'Notificaciones: fuente backend pendiente; seeds demo retirados del runtime TyA source-safe.',
      'Reservas: fuente backend pendiente; generación demo automática desactivada.'
    ];
  }
  CX.bus && CX.bus.emit('phase-a-source-safe-runtime-guard', report);
  CX.bus && CX.bus.emit('notif');
})();
