# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 13:50 -06:00  
**Estado:** `I3_2_DEV_DEPLOY_PARITY_PASS__STAFF_RUNTIME_FOCAL_FAIL__GRANULAR_DIAGNOSTICS_SOURCE_PASS__I3_2B_GATE_NEXT__NO_REPROCESS`

## 2026-08-17 — I3.2 exact DEV deploy + runtime focal diagnostics

Se reutilizó `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`; no nueva rama/PR/workflow.

Request one-shot `i3-2-authority-compat-dev-deploy-20260817-01`, target source `245614e34bba033078342a43cecf489cbbaf7608`, request commit `ecafe08e48ab29b632e83f14fc51045a3977c3f9`.

Run `32058831910`, job `95475132736`, artifact `9297383869`, digest `sha256:621ed03757b029e48e803858e85895f1c8548618ff4353e44a85552aea80180c`.

PASS:
- source/request preflight;
- Firebase Hosting DEV deploy exacto `1`;
- remote root/direct parity PASS;
- remote hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`;
- canonical Staff credential selection sin writes.

FAIL focal:
`staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK` después de readiness Auth Staff + membership + HR authority + data non-empty + current project/period + app visible.

La aserción agrupaba cinco causas; no se aplicó fix producto a ciegas.

### Tooling QA focal

`tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`:
- errores separados para empty shell/backend empty/no projects/no periods/source block;
- router/shell + project/period selectors;
- legal loaded/pending/provider authority/error/modal;
- last sanitized snapshot on failure.

Source-only preflight `32060010492` / `95478920028`: PASS, provider/deploy/Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes `0`.

Primer one-shot y preflight request quedan consumidos/disabled; no rerun.

### Documentación sincronizada

- `SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`;
- índice;
- plan unificado;
- PHASE-A lock;
- checkpoint;
- tracker;
- RESUMEN-PARA-CLAUDE;
- PENDIENTES;
- Academia plan + addendum I3.2;
- source lock I3.1 marcado histórico/superseded para runtime;
- PR #7 al cierre.

### Progreso

I1 15/15; I2 20/20; I3 formal 0/25; I4 0/25; I5 0/15 = **35%/65%**. I3.2 deploy/parity PASS no se repite. I3 integral →60%, I4→85%, I5→100%.

### Siguiente acción

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

Nueva ejecución autenticada/deploy requiere gate nuevo porque el one-shot quedó consumido/STOP_RETRY.

## 2026-08-17 — Plan unificado Phase A

`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md` integra Cortes 0B→8, S1→S6 e I1→I5 sin crear plan nuevo. Enumera I3.1→I3.11, I4.1→I4.12 e I5.1→I5.8. I3.7 legal durable receipt e I3.8/I3.9 Shopper nuevo permanecen obligatorios.

## 2026-08-17 — TARGET_B Admin

Run `32049054855`, job `95443726801`: real Firebase password sign-in PASS, cero writes/password changes/resets. Paula ingresó. No crear/rotar/reemplazar.

## Histórico preservado

Historical Shopper `31906391682` PASS congelado; reset único consumido. HR 15/660 y Finance source-safe/historical preservados. No reprocesar.

## Clasificación acumulada

Reusable CXOrbia: same-build parity, granular diagnostics, STOP_RETRY, plan unificado. Exclusivo cliente: TyA DEV/legal. Claude/prototipo: sin módulos/core. Academia: readiness efectivo. Sin impacto Claude: tooling/gates/documentación salvo preservación de decisiones.
