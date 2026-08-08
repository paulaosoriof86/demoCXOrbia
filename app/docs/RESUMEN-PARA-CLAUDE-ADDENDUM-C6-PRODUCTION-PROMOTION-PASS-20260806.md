# RESUMEN PARA CLAUDE — Addendum C6 promoción source-only PASS

**Fecha:** 2026-08-06

## Estado

```text
strategy=PROMOTE_EXISTING_CLEAN_PROJECT
project=cxorbia-backend-dev
gate=PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT
writes/deploy/merge/cutover=false
```

No modificar `/app/modules/*` ni `/app/core/*`. No cambiar textos o rutas por el hecho de que los identificadores técnicos conserven `dev`; la promoción es contractual y futura, no un cambio visual.

## Preservado

Frontend acumulativo, `CX.data`, Login, Finanzas, Portales, Reservas, multirol y Academia.

## Pendiente externo al frontend

HR viva v4, Auth Shopper, smoke acumulativo, validación humana, rollback y autorización específica de cutover.
