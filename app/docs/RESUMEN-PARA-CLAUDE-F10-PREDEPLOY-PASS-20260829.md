# RESUMEN PARA CLAUDE — F10 PREDEPLOY PASS — 2026-08-29

F10 no es un defecto de versión frontend. El linaje aprobado sigue exacto y el read-model sucesor ya pasó semantic gate + browser predeploy gate.

HARD PRESERVE: no modificar `app/modules/**`, `app/core/**`, `app/app.js` ni `app/index-backend-dev.html` por el incidente F10. El único sucesor funcional es `app/adapters/tya-canonical-state-semantics-v2.js` en `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`.

Semántica visible aprobada: KPI operacional usa evidencia directa HR; lifecycle promovido queda para historia/auditoría. `submitted` puede ser candidata a liquidación, pero no equivale a liquidación confirmada ni pago.

El browser predeploy quedó PASS: agosto 44 total, 30 realizadas, 14 pendientes de realizar, 4 cuestionarios pendientes, 4 sin agendar, 30 candidatas, 0 liquidadas/pagadas. La matriz conserva 41 archivos aprobados/cargados con 0 mismatches.

Pendiente backend: no tocar UI. Falta únicamente un carril Hosting DEV vigente para desplegar el sucesor F10 y luego validar contra una nueva revisión HR fresca. Los mutation lanes F4/C6 históricos no se reutilizan.

Academia/manuales: no actualizar todavía; esperar deploy + live same-revision + owner visual acceptance.
