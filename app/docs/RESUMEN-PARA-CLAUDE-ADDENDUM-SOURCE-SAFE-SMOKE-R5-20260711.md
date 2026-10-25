# RESUMEN PARA CLAUDE — smoke source-safe R5

Backend ya retiró de la entrada TyA los seeds demo de notificaciones y reservas. No crear otro adapter ni reintroducir fixtures fuera de modo demo.

## Paquete crítico para Claude

1. Portal Cliente: `cli_dashboard` falla cuando `mejorSeccion/peorSeccion` es null. Renderizar empty state sin score, sin IA ni recomendaciones fabricadas.
2. Usuarios: eliminar `Admin Demo`, `Evaluador 01` y correos demo fuera de demo.
3. Histórico: iniciar con 13 periodos cerrados; el activo solo aparece al activar filtro explícito.
4. Mobile Shopper: corregir overflow 516 px sobre viewport 390 px.
5. Representar `pending_backend_event_source` y `pending_backend_reservation_source` como fuente pendiente, no como error ni datos vacíos definitivos.

## No tocar/reconstruir

- IDs de periodos y visitas;
- separación 13 históricos + 1 activo;
- ledger de 572 hasta junio;
- importadores R4;
- reviewQueue/auditEvents;
- gates de pago/certificación;
- contratos/tools/workflows.

## Validación esperada

Repetir smoke sobre la última candidata completamente empalmada y luego sobre Hosting DEV verificado. No declarar GO con Portal Cliente roto o overflow móvil.
