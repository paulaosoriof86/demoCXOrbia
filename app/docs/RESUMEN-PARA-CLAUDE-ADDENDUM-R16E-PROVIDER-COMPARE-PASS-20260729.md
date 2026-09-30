# RESUMEN PARA CLAUDE — R16E provider compare PASS

Fecha: 2026-07-29

## Backend conectado / comprobado
R16E read-only contra `cxorbia-backend-dev` cerró SUCCESS/PASS WITH REVIEW, sin writes.

Resultado source-safe:
- plan canónico: 1 tenant, 1 proyecto padre `cinepolis`, 14 periodos, 210 shoppers, 616 visitas, 572 controles de liquidación;
- acciones por path canónico: 1,414 create / 1 update / 0 noop / 0 record-review;
- 29 project docs y 215 shopper docs existentes quedaron como extras preservados, no borrados.

## Interpretación para frontend
No interpretar `create=1414` como base vacía. El backend DEV contiene información TyA, pero gran parte vive en la topología anterior period-country o bajo IDs/paths distintos del modelo canónico. Backend preparará R17/write plan antes de cualquier materialización.

## Qué preservar
- proyecto padre y periodo como conceptos distintos;
- fixes VIS-01/VIS-02/VIS-02B;
- no fallback demo;
- no hardcodear Cinépolis globalmente;
- no presentar controles financieros como pagos;
- no marcar certificaciones sin fuente.

## Qué NO hacer ahora
- no nueva candidata;
- no tocar `app/modules` por R16E;
- no crear datos demo para cubrir gaps;
- no convertir 29 project docs period-country en UX definitiva;
- no asumir que 215 shoppers existentes equivalen 1:1 a los 210 del plan sin diff estable.

## Pendiente frontend posterior
Después de materialización controlada y smoke canónico, validar que un único proyecto Cinépolis permita navegar periodos/países sin exponer la topología de migración como proyectos independientes.

Clasificación: Reusable CXOrbia + Claude/prototipo futuro; sin P0 frontend nuevo.
