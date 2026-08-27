# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-27  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**NEXT:** `F6_PHASE_A_IMMUTABLE_RELEASE`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `86/100`

## Cerrado y preservado

F5 terminó `F5_LIVE_SYNTHETIC_ACCEPTANCE_PASS` en run `33085990980`. El lifecycle sintético integral pasó, cleanup fue obligatorio y el post-clean readback quedó en cero. El one-shot se considera consumido y no debe reejecutarse.

## Pendiente inmediato único del camino crítico

`F6 — freeze Phase A como release inmutable`.

Debe crear/certificar el Release Manifest exacto con source SHA, release SHA, hashes/config, build/image digest, Cloud Run revision, Hosting release/version, receipts, data fingerprints y readbacks. No reabrir F5 ni repetir Build/Cloud Run por documentación.

## Pendiente de mecanismo no bloqueante

`MECHANISM_P1`: workflow `cxorbia-phase-a-live-hr-runtime-predeploy.yml` no instala `firebase-admin` antes de iniciar localmente `server.mjs`. Run observado `33085991102`. No hubo provider mutation ni deploy. Reparar focalmente antes de depender de ese predeploy como gate futuro; no convertirlo en P0 de producto.

## Producto / Claude / Academia

No tocar `/app/modules`, `/app/core` ni UI por F5. Sin tarea frontend nueva para Claude. Academia: esperar consolidación F6/F7 antes de actualizar manuales/cursos.
