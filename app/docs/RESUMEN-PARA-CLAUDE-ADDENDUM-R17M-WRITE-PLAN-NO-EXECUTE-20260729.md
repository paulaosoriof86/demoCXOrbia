# RESUMEN PARA CLAUDE — R17M no-execute

Fecha: 2026-07-29

## Backend
- `cxorbia-backend-dev` sigue siendo el backend canónico de CXOrbia/TyA.
- R16E PASS; R17M write plan exacto preparado, sin writes.
- Estrategia: canonical-shadow `cinepolis → periods → visits`, preservando topología DEV previa para rollback.
- No nueva base.

## No tocar ahora
- no nueva candidata;
- no `app/modules`;
- no convertir periodos/países en proyectos de producto;
- no mostrar pagos confirmados desde controles de liquidación;
- no inventar certificaciones.

## Pendiente frontend posterior
Después de materialización controlada y smoke, validar que el único proyecto Cinépolis navegue periodos/países correctamente y que el read-path canónico no mezcle datos de la topología DEV previa.

No P0 frontend nuevo en R17M.
