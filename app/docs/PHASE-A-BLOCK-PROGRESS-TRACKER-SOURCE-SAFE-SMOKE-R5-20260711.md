# TRACKER PHASE A — smoke source-safe R5

## Completado

- baseline V103 R4 preservada y empalmada en R5;
- guard source-safe de notificaciones/reservas;
- 6 notificaciones demo retiradas;
- reservas demo automáticas desactivadas;
- Admin 36 rutas, Ops 19, Coordinador GT 19, Aliado HN 19, Shopper 11;
- scopes correctos GT 34 / HN 10;
- junio 44 liquidaciones, 0 pagos, 0 lote;
- validación estructural R5 PASS;
- source lock local R5 reproducible.

## Bloqueado por Claude/prototipo

- Portal Cliente crash sin scores;
- usuarios demo fuera de demo;
- Histórico incluye activo por defecto;
- overflow móvil shopper.

## Bloqueado por entorno/gate

- smoke sobre Hosting DEV verificado;
- exports reales de pagos y certificaciones para dry-run R4;
- base Firebase nueva y limpia;
- materialización/import real.

## Estado

Integridad backend PASS. Visual/deploy HOLD.

## Siguiente bloque exacto

1. Entregar a Claude paquete crítico de cuatro correcciones sobre la última candidata empalmada.
2. Auditar y empalmar la nueva candidata cuando la entregue.
3. Repetir smoke source-safe y móvil.
4. Con los dos exports limpios, ejecutar dry-run real.
5. Solo después preparar Hosting DEV/base nueva limpia.
