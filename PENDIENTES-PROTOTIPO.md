# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-READINESS-PROVIDER-SOURCE-READY-26`

I4-A cerrado PASS; no reabrir. I4-B readiness source-only cerrado PASS.

Pendiente activo único: `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE__SYNTHETIC_VISIT_ONLY`.

El gate debe validar en una sola ejecución DEV: postulación → aprobación/asignación → agenda → solicitud/decisión de reprogramación → realizada → cuestionario → revisión, con provider ACK, idempotencia/version conflict, refresh y audit. Solo visita sintética creada para el gate; no tocar 660 visitas HR reales, Historical Shopper, HR writes, Storage, Make, Gemini, pagos, deploy, merge o producción.

Handoff Claude posterior/alineado: `visita-detalle.js`, `postulaciones.js`, `cuestionario-shopper.js`, `revision-admin.js`.

Después: I4-C → I4-D → I4-E → I4-F → I5.
