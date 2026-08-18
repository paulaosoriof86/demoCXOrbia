# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 13:13 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-CONTRACT-DRIFT-03`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_11C_ROOT_CAUSE_PROVEN_RUNTIME_CONTRACT_DRIFT__SOURCE_CORRECTION_NEXT__GO_LIVE_35__NO_PRODUCTION`

## Orden de lectura obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
6. evidencia activa indicada por `CXORBIA-EXECUTION-STATE.json`
7. PR #7 vivo

Marcos maestros vigentes: reglas maestras, Academia profunda, patrones reutilizables, antidesvío y empalme directo/file-aware. Los locks/addenda fechados son historia salvo activación expresa desde este índice.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15` = **35% completado / 65% pendiente**. I3 integral PASS → **60%**.

## R2 focal provider — PASS / CONSUMED

Run `32171812808`: target link intacto/aplicable en provider; `2` trusted normalized links, `0` rejected; provider writes `0`. No reparar provider.

## R2B temporal/runtime forensic — PASS CAUSA RAÍZ PROBADA

Evidencia activa: `app/docs/evidence/I3-11C-TEMPORAL-RUNTIME-CONTRACT-DRIFT-FORENSIC-LATEST.json`.

La contradicción Staff/provider ya tiene causa suficiente y reproducible en source:
- target `irl_3ed1b9a65d36c5873c1306bae1621e9d` está `materialized`, authority `tenant_adjudication`, period-independent y el contrato canónico lo acepta;
- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js` exige `status === active` y `providerAck === true`;
- por ser `materialized`, el target es rechazado determinísticamente por el runtime legacy antes de precompose/enrichment;
- `app/index-backend-dev.html` carga ese runtime legacy y no carga `cxorbia-identity-roll-forward-v1.js`.

Causa raíz: `PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

Un write temporal de provider ya no es necesario para explicar el fallo. Provider read/write de este forensic: `0/0`.

## Frozen / no reprocesar

I1/I2; I3.1→I3.10; Historical Shopper `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C `32163552089`; focal provider read `32171812808`; R2B forensic; HR 15/660; Finance V2/historical; legal V0.4.

## Siguiente frontera exacta

`I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO`

Alcance: corregir únicamente el adapter reusable de identidad runtime y agregar un gate de paridad de contrato; preservar API, exact matching, multi-tenant y cero fuzzy matching. No `/app/modules`, no `/app/core`, no provider I/O, no Auth/Firestore data/Rules/HR/Storage/Make/Gemini/pagos/deploy/merge/producción.

Después de esa corrección, el siguiente runtime read-only sí requerirá gate exacto para demostrar `shp-57d2e3769946 → TYA_GT_0C0BA8856E`, agosto canonical `2`, residual `0`, duplicados `0`. Si PASS integral, I3 → **60%**.

## Anti-loop

Mismatch evidence/docs → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Ejecución sin sincronización → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones sin reducción causal → `FORENSIC_STOP`. Verificador: `tools/verify-cxorbia-source-truth-sync.mjs`.

## Camino restante

I4 visible: documentos/certificación/disponibles/postulación/asignación; agenda/ejecución/cuestionario/revisión; HR bidireccional; finanzas/liquidaciones/pagos; multi-proyecto/no-code; roles/notificaciones/integraciones/Academia. I5: freeze/build-lock/preprod/rollback/same-build E2E/gate producción/cutover/smoke/baseline.

TyA = primer tenant; Cinépolis = primer proyecto normal configurable, nunca lógica global. Fuentes objetivo: Sheets/Excel/CSV/API/plataforma/import/link externo. Alta objetivo: `configurar → mapear → dry-run → validar → activar`.
