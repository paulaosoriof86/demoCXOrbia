# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`  
**Estado:** `CANONICAL_CONTINUITY_PASS__I4_SINGLE_AUTHORITY_SOURCE_PATCHED_PENDING_RUNTIME_GATE__FORMAL_60_40`

## Orden obligatorio vigente

1. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
2. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
5. addendum prevalente de empalme/carril file-aware y Plan Lock Phase A
6. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
7. PR #7 y HEAD de `docs-tya-v6-v71-audit`

Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## CONTINUITY_LOCK — PASS

El checkpoint obsoleto de julio fue reemplazado y las autoridades canónicas existen bajo el mismo epoch. No retroceder a `CORTE_0B`, Hosting DEV de julio, I3, otra candidata, otra auditoría general ni reconstrucción de Auth/Shopper/Finanzas.

## Porcentaje vigente

I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% formal / 40% pendiente**.

I4 es indivisible: fuente corregida sin runtime gate no aumenta porcentaje. Cierre I4 → **85%**; I5 preproducción/go-live → **100%**.

## Frontera viva

`I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`

### Subestado

`PROTECTED_RUNTIME_SINGLE_AUTHORITY_SOURCE_PATCHED_PENDING_RUNTIME_GATE`

Se localizó una carrera real en el carril `app/index-backend-dev.html`: el watcher HR podía aplicar source-safe sobre `CX.data` antes de que la autoridad protegida Auth + Firestore + HR quedara compuesta. El watcher fue corregido para esperar `CX_PROTECTED_AUTH_HR_AUTHORITY.applied === true` y preservar la autoridad `connected`/canonical en refreshes posteriores.

## PASS protegidos

- I4-C: source readiness suficiente para Phase A inicial; Make/HR runtime diferido.
- I4-D: `PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.
- I4-E: `PASS_I4E_MULTI_PROJECT_NO_CODE_REUSE_AND_CONTRACT_ALIGNMENT`.
- Finanzas canónicas: Mayo 44/44; Junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`.

## Siguiente acción exacta

`PROTECTED_RUNTIME_SINGLE_AUTHORITY_GATE_AND_REAL_PHASE_A_E2E`.

1. completar post-gates source del HEAD;
2. demostrar boot con una sola autoridad canónica;
3. ejecutar Admin + Shopper + Finanzas en la misma build protegida;
4. cero fallback demo/source-safe viejo;
5. si I4 pasa, mover a 85% y abrir I5;
6. si hace falta Hosting DEV para ejecutar el E2E exacto, pedir autorización específica de deploy DEV; no reauditar.

## Seguridad

0 merge, 0 producción y 0 provider writes por esta sincronización/corrección source. Workflows de deploy sin autorización exacta deben saltar sus pasos de escritura/deploy.
