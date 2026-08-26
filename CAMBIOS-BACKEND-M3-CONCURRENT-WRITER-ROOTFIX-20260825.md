# CAMBIOS-BACKEND — Addendum M3 concurrent writer rootfix — 2026-08-25

**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY`  
**PHASE_A:** `98/100`  
**Backlog M3:** `27` antes y después de este bloque.

## Causa reproducible

Se demostró que el commit `c74779105700714efc5d7ad75756a676dd6a8c7a` restauró workflows históricos activos. El run `32917331228` de `.github/workflows/cxorbia-phase-a-live-hr-read-probe.yml` fue disparado por `push`; ese workflow tenía `contents: write` y un paso `git push origin HEAD:docs-tya-v6-v71-audit`, y produjo el commit bot `f164110bfe09fc817a451e9e3bb6f4503578c164`. El defecto era una carrera real de control-plane, no una inferencia.

## Corrección

Se reutiliza exclusivamente el blob histórico ya demostrado inerte `db925bb2823aa52ddfe36343567e6be5aace8f65` para 22 workflows M3 previamente identificados. No se reutilizan los cambios sobre tools/runtime del intento `d678`; por tanto no se repite la restauración amplia que originó la carrera.

Workflows fijados a `workflow_dispatch` + `contents: read` + `if:false`:

- `.github/workflows/cxorbia-corte4-bootstrap-readonly-execute.yml`
- `.github/workflows/cxorbia-i4b-retry1-authorized-runtime-lane.yml`
- `.github/workflows/cxorbia-r24-new-empty-firebase-dev.yml`
- `.github/workflows/cxorbia-c6-p0-postdeploy-readonly-recheck.yml`
- `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-crosswalk-rootfix-source-only.yml`
- `.github/workflows/cxorbia-corte6-postdeploy-readonly-revalidation.yml`
- `.github/workflows/cxorbia-canonical-plan-refresh-offline.yml`
- `.github/workflows/cxorbia-live-hr-current-reconcile.yml`
- `.github/workflows/cxorbia-c6-hold-profile-live-hr-readonly.yml`
- `.github/workflows/cxorbia-remaining-shopper-identity-reconciliation-readonly.yml`
- `.github/workflows/cxorbia-visit-identity-crosswalk-readonly.yml`
- `.github/workflows/cxorbia-live-hr-provider-capability-preflight.yml`
- `.github/workflows/cxorbia-legacy-shoppers-certifications-refresh-readonly.yml`
- `.github/workflows/cxorbia-corte6-profile-extra-readonly.yml`
- `.github/workflows/cxorbia-canonical-backend-anomaly-probe.yml`
- `.github/workflows/cxorbia-canonical-backend-phasea-gap.yml`
- `.github/workflows/cxorbia-canonical-backend-readonly-inventory.yml`
- `.github/workflows/cxorbia-firebase-dev-clean-state-read-only-run.yml`
- `.github/workflows/cxorbia-phase-a-live-hr-read-probe.yml`
- `.github/workflows/cxorbia-corte4-p0-vis02-diagnostic.yml`
- `.github/workflows/cxorbia-corte4-p0-vis02-revalidate.yml`
- `.github/workflows/tya-hr-country-tab-consistency-current.yml`

`tools/continuity/validate-cxorbia-canonical-authority.js` ahora exige que esos 22 archivos coincidan exactamente con el contrato inerte. Una futura restauración amplia no puede volver a recibir PASS del gate M3.

También se actualizan `backend/config/cxorbia-validator-authority.json`, `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y se crea `app/docs/evidence/RC15-M3-CONCURRENT-WRITER-ROOTFIX-LATEST.json`.

## Seguridad y preservación

No se modifica `/app/core`, `/app/modules`, HR fuente, runtime, adapters de producto ni tools funcionales distintos del validador de continuidad. Provider/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge = 0. El único workflow automático que debe quedar operativo para una materialización M3 es `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`, source-only y `contents: read`.

## Clasificación

- **Reusable CXOrbia:** cuarentena de authority histórica y gate fail-closed contra restauraciones.
- **Exclusivo cliente TyA:** workflows históricos concretos del carril TyA/Corte4/Corte6/HR.
- **Claude/prototipo:** sin cambio funcional frontend.
- **Academia:** sin impacto funcional; no cambia manuales, cursos, rutas por rol ni notificaciones.
- **Sin impacto Claude:** control-plane, evidence y documentación M3.

## Siguiente exacto

Readback remoto del commit atómico, comprobar que solo se dispara el checkpoint M3, verificar PASS y ausencia de commit bot. Solo después continuar la cola finita de 27 residuales.
