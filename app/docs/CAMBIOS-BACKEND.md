# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-27  
**Estado:** `F6_CLOSED_PASS_IMMUTABLE__MIRRORS_SYNCED__NEXT_F7_INTEGRAL_READINESS`

## 2026-08-27 — F6 Phase A immutable release + synchronization

### Gate cerrado

F6 quedó terminal:

`F6_PHASE_A_RELEASE_100_FROZEN`

Release ID:

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`

PHASE_A = `100/100`.
PRODUCTION_REAL_READINESS = `90/100`.
NEXT = `F7_INTEGRAL_READINESS`.

### Release tuple congelado

- functional source SHA: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- runtime release source SHA: `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`;
- runtime release tree: `f93012599e4ca5195f89f19995251fa91c0d38d9`;
- manifest: `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
- manifest blob: `732dbfd48912b3550c6fb20bc592bd118647263a`;
- manifest SHA-256: `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`;
- Cloud Run revision: `cxorbia-live-hr-dev-00013-rns`;
- image digest: `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`;
- Hosting release: `sites/cxorbia-backend-dev/releases/1787796646738000`;
- Hosting version: `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`;
- Hosting adapter SHA-256: `9d69d0d0db42e3f2b93cc893f2da1ed0b2e753403d3f46a9a8537dbe994c82b0`.

### Evidencia

- `app/docs/evidence/RC15-F5-LIVE-SYNTHETIC-ACCEPTANCE-LATEST.json` — F5 PASS, cleanup PASS, post-clean residue 0.
- `app/docs/evidence/RC15-F6-PHASE-A-IMMUTABLE-RELEASE-LATEST.json` — F6 PASS.
- `app/docs/evidence/RC15-F6-MIRROR-SYNCHRONIZATION-LATEST.json` — readback final de sincronización documental.
- continuity lock schema `3.6.0`, epoch `CXORBIA-20260827-F6-PHASE-A-RELEASE-100-FROZEN-01`.

### Archivos sincronizados y readback de blobs

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` → `e4c9816369a01a6e1859dd5b48223b278afe993f`;
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md` → `a5ba8c0fec12058e5387008ab299c6cad05ab1aa`;
- `app/docs/PRODUCTION-REAL-PROGRESS-LOCK-CXORBIA-TYA.md` → `c04d689fcfc67c8d77b6c70f393bc55fca7c54b1`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` → `ac87df1d4364781f5f33ffe1647041d1c35511a1`;
- `app/docs/RESUMEN-PARA-CLAUDE.md` → `b34b1f86b9be2d18ad5c147521b8a8ab01342d0d`;
- `app/docs/PENDIENTES-PROTOTIPO.md` → `b1aed141b1bb95f13743a19dd70b18bcc67d4dfa`;
- `backend/config/cxorbia-phase-a-continuity-lock.json` permanece `6cf6f78339c53d9f5f21bd8abc05e93448c9ea09`;
- manifest F6 permanece `732dbfd48912b3550c6fb20bc592bd118647263a`;
- evidencia terminal F6 permanece `9375c0c7d20574e5c43b4e80de906d49ca0693d5`;
- `app/docs/CAMBIOS-BACKEND.md` — este archivo;
- PR #7 mirror actualizado, permanece cerrado/draft/no merge.

El master plan V1.1 no se modifica: está congelado y conserva blob `0ea2cd9802e687938086886d8d03648f105a7d64` / SHA-256 `7b49f7df172f8b322c3ae38bdf55f50936696d2d6f7b5086ae8a68e97827dafa`. Sus encabezados históricos de fase no son el cursor operativo; el cursor vivo es continuity lock + evidencia terminal + mirrors.

### Safety

Durante F6 y esta sincronización documental:

- provider access F6 = 0;
- Firestore/Auth/HR externa/datos reales/pagos/Rules/Storage/Make/Gemini writes = 0;
- Cloud Build/Cloud Run update/Hosting deploy F6 = 0;
- data reimport = 0;
- merge = false;
- F5 replay = false;
- F6 rebuild/redeploy = false.

La consulta final de GitHub Actions no mostró nuevos push-runs asociados a los commits de sincronización F6; el run más reciente devuelto por la rama continúa siendo el histórico M3 `33088417581` sobre `89ddee6...`, ya inertizado posteriormente. Por tanto esta sincronización no reactivó los workflows históricos.

### Hallazgo de mecanismo vigente

Run `33085991102`: `MECHANISM_P1_NON_BLOCKING`, causado por inicio del predeploy local sin `firebase-admin` instalado. No hizo provider mutation ni deploy. Queda pendiente de reparación focal antes de reutilizar ese carril.

### Incidente de herramienta durante sincronización documental

Antes de iniciar los cambios canónicos de mirrors hubo una operación de herramienta equivocada que generó transitoriamente commits sin cambio funcional (archivo probe vacío y restauración exacta del índice). Se contuvo de inmediato devolviendo la rama al commit F6 `1af96b170d54917ec1ebd188a9deb0534f7eb7df`, cuyo tree `f0f3428693e251f1d4baf236728e58a2cd5314f2` quedó confirmado idéntico antes de continuar.

Clasificación: `MECHANISM_P1_PROCESS_DEVIATION_CONTAINED`.

Impacto probado: frontend/producto/provider/runtime/datos = 0. No se perdió contenido. A partir de ese punto la sincronización se realizó únicamente mediante reemplazo versionado de mirrors sobre la rama viva. No se autoriza repetir force/ref rewrite como método operativo.

## Siguiente bloque exacto

`F7_INTEGRAL_READINESS` sobre el release inmutable exacto.

Criterio: `GO` o `GO_WITH_WARNINGS` sin P0. `HOLD/NO_GO` solo con evidencia reproducible.

## Clasificación obligatoria

- **Reusable CXOrbia:** release manifest inmutable, continuity lock, evidencia terminal, readback exacto y separación release/control-plane.
- **Exclusivo cliente:** tenant TyA/proyecto Cinépolis como alcance de la evidencia F5/F6, sin hardcodearlos como arquitectura global.
- **Claude/prototipo:** no se tocó UI; Claude debe respetar release congelado y no presentar integraciones no autorizadas como activas.
- **Academia:** F7 debe validar que rutas por rol, manuales, certificaciones, estados y notificaciones reflejen el comportamiento real del release.
- **Sin impacto Claude:** sincronización de mirrors, hashes, receipts y locks internos.

Histórico anterior a este corte permanece preservado en Git y en las evidencias/source locks terminales correspondientes; no se reprocesa.
