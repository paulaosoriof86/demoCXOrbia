# CAMBIOS BACKEND — ADDENDUM F10 OPERATIONAL EVIDENCE — 2026-08-29

**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`  
**Incidente:** `F10-HR-KPI-FRESHNESS-20260829-01`  
**Estado:** `OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY`  
**NEXT:** `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`

Este addendum prevalece para el bloque F10 sobre entradas anteriores de `CAMBIOS-BACKEND.md` que todavía describan la reconciliación provider como pendiente.

## Ejecutado y verificado

1. Reconciliación provider fresca independiente: run `33281688280`, revision `b7bc89176161a8a1b83e3d33098634ae77a5a8bc3f6f44ee7c749e2d11da598d`, `sourceReadAt=2026-08-29T23:44:58.827Z`, `cacheOrigin=runtime_refresh`, 660 visitas, 0 row-key duplicadas.
2. Causa raíz reproducida fila a fila: la promoción retrospectiva de lifecycle (`submitted → questionnaire → realized`) estaba siendo consumida como evidencia operacional visible.
3. Patch focal aplicado con el runner atómico existente, sin tocar módulos/core:
   - run `33283725070`;
   - status `APPLIED_AND_VERIFIED`;
   - commit funcional `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`;
   - archivo `app/adapters/tya-canonical-state-semantics-v2.js`;
   - blob `941051c96a26017363acfc72f7e88edbe70c68ba`;
   - SHA-256 `e832759e03238559617b71daa4daa52a00b2c6dbd2d2266e6df0ae391f853b2e`.
4. Gate semántico ejecutable sobre el mismo SHA: `PASS_F10_OPERATIONAL_EVIDENCE_SEMANTICS`.
5. Comparación neta `9777bdc7... → 639273607...`: exactamente un archivo funcional modificado, el adapter anterior.
6. Matriz de módulos recertificada en source: 26 Phase A + 10 soporte + 5 post-Phase-A cargados, `0` mismatches. Entry point y `app.js` permanecen exactos.

## Semántica reparada

El read model mantiene dos planos explícitos:

- `canonical lifecycle`: puede inferir hitos anteriores desde evidencia posterior para historia/auditoría;
- `operational evidence`: solo cuenta evidencia directa del hito en HR para KPIs actuales.

`submitted` sigue siendo `liquidationCandidate`. `liquidationConfirmed` y `paymentConfirmed` continúan separados y nunca se fabrican desde submitido.

Sobre la revisión fresca usada para adjudicar el incidente, el resultado esperado es 44 total, 30 realizadas, 14 pendientes de realizar, 4 cuestionarios pendientes, 4 sin agendar operativas, 30 candidatas a liquidación, 0 liquidaciones confirmadas y 0 pagos confirmados. Estas cifras son evidencia de esa revisión, no datos hardcodeados.

## Archivos creados/tocados en este bloque

### Funcional source
- `app/adapters/tya-canonical-state-semantics-v2.js` — reparación focal del read model; autorizado por atomic apply; todavía no desplegado.

### Evidencia/config/control plane
- `app/docs/evidence/RC15-F10-OPERATIONAL-EVIDENCE-SOURCE-GATE-LATEST.json` — evidencia de atomic apply, gate semántico y linaje exacto.
- `backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json` — matriz actualizada al sucesor F10 sin cambiar blobs de módulos.
- `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json` — cursor F10 source-repaired/predeploy.
- `app/docs/evidence/RC15-F10-HR-KPI-FRESHNESS-INCIDENT-20260829-01.json` — causa raíz adjudicada y reparación source registrada.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` — epoch/cursor vigente.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — checkpoint vigente.
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md` — distingue release desplegado y sucesor source F10.
- `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md` — ejecución siguiente exacta.
- este addendum y los addenda F10 de Claude/Pendientes.

## Preservado deliberadamente

- `app/modules/**`: sin cambios.
- `app/core/**`: sin cambios.
- `app/app.js`: sin cambios, blob `2043d33dee611adacebc947c8423ed1739c1a8da`.
- `app/index-backend-dev.html`: sin cambios, blob `7a5f169dd0e239d46fa4af09cf67f2eb4329a477`.
- Hosting/Cloud Run/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini: sin writes ni deploy.
- F5-F9 terminales y Phase A `100/100` preservados.

## Clasificación obligatoria

- **Reusable CXOrbia:** patrón dual `canonical lifecycle` + `direct operational evidence`; gate de frescura independiente por revision/sourceReadAt; matriz exacta de blobs antes de reabrir un módulo.
- **Exclusivo cliente TyA:** filas y conteos de agosto 2026, revisión provider `b7bc...` y mapeo Cinépolis GT/HN.
- **Claude/prototipo:** no reemplazar módulos; pendiente visible opcional: exponer `Candidatas a liquidación` separado de `Liquidadas` por el lane frontend autorizado.
- **Academia:** actualizar definición visible de hitos solo después de deploy y aceptación visual; no alterar cursos por un source-only patch todavía.
- **Sin impacto Claude:** hashes, atomic apply, overlay, validator y evidencias de control.

## Pendiente real

El patch aún no está en Hosting. Antes de cualquier deploy debe pasar `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE`. Después se requiere autorización explícita de deploy y una revalidación browser/live contra una revisión HR fresca antes de pedir visualización a Paula.

No corresponde volver a diagnosticar la causa raíz ni restaurar módulos: ya quedaron demostrados el linaje correcto y el punto focal del read model.
