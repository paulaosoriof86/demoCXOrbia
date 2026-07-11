# CAMBIOS BACKEND — smoke source-safe R5

## Archivos y cambios

- nuevo `app/core/tya-phase-a-source-safe-runtime-guard.js`;
- nuevo contrato `backend/contracts/phase-a-source-safe-runtime-guard-v1.json`;
- nuevo validador y workflow CI;
- runtime local R5 carga el guard solo en la entrada TyA source-safe;
- no se modificaron `app/modules` ni la entrada genérica.

## Cambio operativo

- se retiraron 6 notificaciones demo;
- se desactivó el seed automático de Reservas;
- se limpiaron cachés TyA source-safe de reservas;
- notificaciones quedan en `pending_backend_event_source`;
- reservas quedan en `pending_backend_reservation_source`;
- no se inventan eventos o reservas sustitutas.

## Validación

- Admin/Shopper: 0 notificaciones demo y 0 reservas demo;
- junio: 44 liquidaciones, 0 pagadas y 0 elegibles para lote;
- node syntax/estructura R5: PASS;
- smoke visual general: HOLD por Portal Cliente, usuarios demo, filtro Histórico, overflow móvil y smoke Hosting DEV pendiente.

## Estado

Sin deploy, merge, import real, Firebase/HR writes, Make, Gemini, pagos ni producción.
