# CAMBIOS-BACKEND — ADDENDUM RC15 F0 TRAMO 6

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Tramo 6 — manual provider reads, HR refresh y autoridad Hosting Corte4 VIS-02

### Qué se hizo
- Se resolvió nuevamente PR #7 en `docs-tya-v6-v71-audit` y se confirmó HEAD de entrada `7a01205de7aca0eddd53a0db126961a9b2507b27`, draft/open/unmerged.
- Se replicó la identidad del plan congelado: Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, fase F0 y `providerMutationAuthorizedNow=false`.
- Se clasificaron 24 superficies adicionales, llevando la matriz de **68 a 92 hallazgos**.
- Los HOLD demostrados pasan de **18 a 22**; el incremento es visibilidad forense, no regresión de producto.

### Nuevos HOLD demostrados
- `RC15-CP-074`: el manual Firebase DEV clean-state reader puede ejecutar provider reads con confirmación tipada aunque su config vigente declara `providerRunAuthorized=false`; el ejecutor no hace cumplir ese flag antes del credential/provider access.
- `RC15-CP-078`: `cxorbia-phase-a-live-hr-read-probe.yml` tiene `workflow_dispatch`/push, `contents:write`, refresca HR viva y puede hacer commit de source-safe HR/evidence sin request ni continuity-lock vigente.
- `RC15-CP-090`: el diagnostic VIS-02 se dispara por su request diagnóstico, pero el executor no valida ese request; carga credencial y enlaza el preflight a otro request distinto, el request de revalidación que contiene autoridad histórica de Hosting.
- `RC15-CP-091`: el request `corte4-p0-vis02-revalidate.json` sigue `enabled=true` y autoriza un Hosting deploy, sin `consumed`/`executionsConsumed`. Su workflow ejecuta un `firebase deploy --only hosting` real cuando se toca el request. Esto demuestra una superficie histórica de deploy repetible no vinculada al continuity lock ni al consumed ledger actual.

### Superficies adicionales seguras/fail-closed
- I5 PREPROD project-creator route preflight: request consumido/disabled; fail-closed.
- Corte6 full-profile identity bridge V2: request consumido/disabled; fail-closed.
- CX.data Firestore R15D y existing DEV provenance R15C: manual provider-read, `contents:read`, artifacts-only; no writes, pero requieren F2 governance porque la autorización histórica no está ligada al lock actual.
- DEV Auth/Firestore readiness, Firebase clean-state static gate, Firestore canonical drift, operational readiness, period-history integrity y R25A portable adapter: offline/source-only, sin provider ni repo mutation.
- I4B workflow con nombre readonly: contiene synthetic write executor, pero el request actual ya está consumido; fail-closed.
- R17N post-materialization: request consumido; fail-closed.
- Remote smoke: HTTP/browser read-only, sin provider credential ni repo write.
- R18B/R18D y R20 source-safe gates: refrescan HR para validaciones en runner; no push en estos workflows. Quedan para F2 como política de autoridad de external-HR reads.
- Corte4 VIS-01 diagnostic/revalidate y VIS-02B final revalidate: jobs `if:false`, inertes.
- Historical V110 predeploy diagnostic: read-only/non-blocking, sin execution authority.

### Causa raíz — precisión nueva
La causa sistémica ya incluye una prueba directa de **autoridad de deploy histórica no terminalizada**: VIS-02 conserva un request `enabled=true` con permiso de Hosting real y sin ledger de consumo. También queda probado un **cross-request authority mismatch**: un workflow se dispara por un request pero ejecuta provider preflight usando otro request. Esto explica cómo podían aparecer nuevas ejecuciones/bloqueos aun cuando otras partes se daban por cerradas.

La solución permanece dentro del plan congelado: terminar F0, luego F1 tombstone atómico de toda autoridad residual y F2 enforcement único en la frontera ejecutable antes de credenciales, provider/external-HR/legacy access o repository mutation.

### Seguridad y efectos
En este bloque de auditoría no se ejecutó ningún workflow auditado, provider write, Hosting/Cloud Run deploy, Firestore/Auth/Storage/HR write, recovery G2-B, synthetic stage, Make/Gemini, pagos ni merge.

Dos llamadas del conector dirigidas explícitamente a ramas inexistentes fueron rechazadas con HTTP 404 antes de crear ref/tree/file; no produjeron delta de repo ni side effect provider. Se registra por transparencia.

### Archivos de documentación/control-plane de este cierre
- `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json`
- este addendum `CAMBIOS-BACKEND-RC15-F0-TRAMO6.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`

### Clasificación
- **Reusable CXOrbia:** terminalización uniforme; exact trigger/request binding; current-authority gate before credential access; consumed ledger para cualquier deploy.
- **Exclusivo TyA:** VIS-02, HR y requests históricos TyA.
- **Claude/prototipo:** sin cambio UI, `/app/modules` ni `/app/core`.
- **Academia:** sin cambio funcional; requisito transversal preservado.
- **Sin impacto Claude:** auditoría/control-plane/evidence/docs.

### Siguiente
`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`. No iniciar F1 hasta que todos los workflows/requests/dispatch/provider-write entrypoints estén clasificados.
