# PENDIENTES PROTOTIPO — Addendum Corte 5 CX.data PASS

Fecha: 2026-07-30

## P0 cerrado técnicamente
`P0_C5_CXDATA_PERIOD_MODEL_MISMATCH` ya no está abierto.

Re-smoke final:
- 14/14 periodos canónicos;
- currentPeriodId `2026-07` canónico;
- 616 visitas;
- source Firestore;
- fallback demo false;
- blockers 0.

## Pendiente vivo
Único pendiente para cerrar Corte 5: validación visual/operativa del consumidor con datos reales mediante binding DEV read-only al backend `cxorbia-backend-dev` y un único Hosting DEV controlado.

Verificar:
- proyecto padre vs selector de periodos;
- histórico por periodo;
- identidad real por rol;
- certificaciones carryover;
- liquidaciones sin inferir pagos;
- ausencia de fallback demo/local;
- ausencia de fuga PII.

## Claude
No nueva candidata ni cambio frontend por rutina. Solo actuar ante P0 visual reproducible y localizado.

## HOLD preservado
22 existing updates, 7 legacy profile holds, 1 cert hold, Agosto HN, deletes, pagos/lotes, Auth/RBAC, Make/Gemini/Storage.

## Backlog P1/P2
PDF/gráficas, formato Excel, reportKit/copy y equivalencia de exportaciones continúan no bloqueantes salvo evidencia operativa distinta.
