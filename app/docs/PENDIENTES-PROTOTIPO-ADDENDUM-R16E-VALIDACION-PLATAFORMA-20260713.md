# Pendientes prototipo — R16E y validación en plataforma

Fecha: 2026-07-13

## P0

No se detectó P0 frontend nuevo.

No solicitar nueva candidata Claude por R16E ni por la cuota Firestore.

## P1 acumulado relacionado

1. Mantener visible el modo `DEV source-safe` para perfiles autorizados.
2. Distinguir `source-safe`, `connected DEV`, `operational DEV` y `production`.
3. No presentar Firestore materializado antes del checkpoint correspondiente.
4. Mantener el gap shopper 210/213 como revisión humana.
5. No mostrar overlays financieros como pagos confirmados.
6. No mostrar certificaciones carryover como certificadas sin fuente.
7. En Diagnóstico, mostrar bloqueos de proveedor de forma sanitizada; no exponer credenciales, IDs privados o detalles técnicos a Shopper/Cliente.

## Próximo momento para auditar frontend

Después de la materialización controlada en Firestore DEV. En ese momento se deberá comparar la información visible por módulo con los conteos y muestras aprobadas.

## Clasificación

- **Reusable CXOrbia:** estados de madurez del entorno.
- **Exclusivo cliente:** conteos TyA/Cinépolis.
- **Claude/prototipo:** P1 de estados y Diagnóstico; sin P0 actual.
- **Academia:** guía de revisión por checkpoint.
- **Sin impacto Claude:** cuota Firestore y comparador backend.
