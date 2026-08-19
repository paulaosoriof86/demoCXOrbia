# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 19:58 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-TEST-SHOPPER-PROVENANCE-HOLD-19`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_FROZEN_PASS__GO_LIVE_60__I4A_TEST_SHOPPER_PROVENANCE_HOLD__AUTH_NEXT__NO_PRODUCTION`

## Orden de lectura obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
6. evidencia activa indicada por `CXORBIA-EXECUTION-STATE.json`
7. PR #7 vivo

Permanecen vigentes las reglas maestras, Academia, patrones reutilizables, antidesvío y ejecución directa/empalmes. Los documentos históricos no sustituyen esta capa canónica.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` frozen; I4 `0/25` en curso/no puntuado; I5 `0/15` = **60% completado / 40% pendiente**.

## I4 canónico

Fuente aprobada: `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`, sección `9. I4 — operación visible`.

I4-A Shopper lifecycle: documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico. I4-B→F permanecen reservados para visita, HR bidireccional, Finanzas, multi-proyecto/no-code y Academia.

## I4-A — estado vivo

Decisión: `HOLD_I4A_TEST_SHOPPER_PROVENANCE__NONHISTORICAL_STATUS_NOT_REPRODUCIBLY_ESTABLISHED`.

La revisión source-only/read-only confirmó que la evidencia congelada conserva población y procedencia mediante fingerprints/agregados y deliberadamente no exporta login/email/UID crudos. Por ello no existe todavía en repo una prueba reproducible que permita seleccionar un principal DEV existente y afirmar que es Shopper de prueba/no histórico. No se infiere desde memoria ni por nombre.

Esto no demuestra bug ni ausencia de funcionalidad. Ya están probados profile/history/certification-status read-only, membership/scopes exactos y autoridad de postulación/asignación. Siguen pendientes de evidencia visible documentos/instrucciones, disponibles, control de postulación, notificaciones y superficie de certificación nueva.

## Frozen / no reprocesar

I1/I2/I3 completo; Historical Shopper; TARGET_B Admin; Rules I3.11C; provider focal; Hosting identityMap; Staff final; HR `15/660`; Finance V2/historical; legal V0.4. No repetir I3.

## Siguiente frontera exacta

`NEW_AUTH_REQUIRED_I4A_EXISTING_SHOPPER_IDENTITY_CLASSIFICATION_DEV_READONLY_NO_LOGIN`

Solo podrá clasificar un principal Shopper existente como test/no histórico usando metadata provider/Auth read-only. Prohibido login, exposición/selección de credenciales, acceso a perfil/histórico, writes, deploy, merge o producción. Requiere autorización nueva y explícita.

## Anti-loop

Mismatch documental → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Gate ejecutado sin sincronizar → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones sin reducción causal → `FORENSIC_STOP`. Verificador: `tools/verify-cxorbia-source-truth-sync.mjs`.
