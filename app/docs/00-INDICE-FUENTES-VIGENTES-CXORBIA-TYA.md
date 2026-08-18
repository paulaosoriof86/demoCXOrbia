# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 13:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-SOURCE-CORRECTION-04`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__RUNTIME_CONTRACT_SOURCE_CORRECTED__STAFF_READONLY_CLOSE_AUTH_REQUIRED__GO_LIVE_35`

## Lectura obligatoria
1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
6. evidencia activa
7. PR #7

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; DEV `cxorbia-backend-dev`.

## Avance formal
I1 `15/15`; I2 `20/20`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15` = **35% completado / 65% pendiente**. I3 integral PASS → **60%**.

## Cerrado
- Rules I3.11C PASS/consumidas `32163552089`.
- Focal provider read PASS/consumido `32171812808`: target intacto, 2 trusted/0 rejected, no provider repair.
- R2B forensic PASS: causa raíz `PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.
- R3-A source correction aplicada: `app/adapters/cxorbia-provider-identity-link-runtime-v1.js` alineado con `cxorbia-identity-roll-forward-v1`; QA parity gate agregado en `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs`.

La corrección no tocó `/app/modules`, `/app/core`, provider/Auth/Firestore-data/HR/Rules/Storage/Make/Gemini/pagos ni deploy/merge/producción.

## Siguiente frontera exacta
`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES`

Requiere autorización exacta nueva. Debe ejecutar primero el parity gate source y luego una única validación Staff/Admin read-only del runtime corregido. PASS: `shp-57d2e3769946 → TYA_GT_0C0BA8856E`, agosto canonical `2`, residual `0`, duplicados `0`. Sin writes/password changes/deploy/producción.

## Frozen
I1/I2/I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules; focal provider read; R2B forensic; HR 15/660; Finance V2/historical; legal V0.4. No reprocesar.

## Anti-loop
Mismatch → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`; ejecución no sincronizada → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`; dos repeticiones no reductivas → `FORENSIC_STOP`.

## Después de I3
I4 visible: lifecycle Shopper, documentos/certificación, agenda/ejecución/cuestionario/revisión, HR bidireccional, Finanzas/liquidaciones/pagos, multi-proyecto/no-code, roles/notificaciones/integraciones/Academia. I5: freeze/build-lock/preprod/rollback/E2E/gate producción/cutover/smoke/baseline.

TyA = primer tenant; Cinépolis = primer proyecto normal configurable, nunca lógica global.
