# PHASE A TRACKER — ADDENDUM C6 AUTH V4 HASH_CONFIG_EMPTY STOP_RETRY

**Fecha:** 2026-08-10

## Avance real del bloque

- causa anterior `HASH_CONFIG_HTTP_400`: cerrada source-only;
- gate observable del GET sin `mask`: PASS;
- plan v4 340/HOLD0/digest rector: preservado;
- request nuevo no superpuesto: consumido una sola vez;
- único PREWRITE provider: ejecutado;
- nuevo STOP: `HASH_CONFIG_EMPTY`;
- write boundary: no alcanzado;
- Auth writes: 0;
- smoke runtime: no ejecutado porque Auth no obtuvo PASS;
- producción: intacta.

## Estado Phase A

```text
AuthPlanV4=FROZEN
AuthPlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
HashConfigGetShapeRepair=PASS
AuthPrewrite=STOP_RETRY_HASH_CONFIG_EMPTY
ProviderAttempts=1
SecondProviderAttempt=false
AuthExecuted=false
WriteBoundaryEntered=false
AuthWrites=0
RuntimeSmoke=false
Production=false
```

## Causa raíz viva

```text
currentParser=body.hashConfig|body.hash_config
officialSchema=Config.signIn.hashConfig
classification=HASH_CONFIG_RESPONSE_PATH_MISMATCH
```

Gate independiente pendiente antes de otra lectura provider: verificar read-only disponibilidad de `firebaseauth.configs.getHashConfig` para el principal exacto.

## Phase A preservada

- frontend acumulativo;
- Login;
- `CX.data`;
- HR histórico;
- shoppers;
- postulaciones;
- certificaciones;
- visitas;
- liquidaciones/pagos;
- Finanzas;
- Portal Cliente;
- Portal Shopper;
- Reservas;
- multi-tenant/multi-proyecto;
- sincronización HR/plataforma;
- Academia.

## Siguiente bloque exacto

`C6 AUTH V4 HASH CONFIG RESPONSE PATH + PERMISSION READINESS SOURCE-ONLY → SINGLE PREWRITE RETRY`, solo con nueva autorización.

No reconstruir identidad ni emitir un segundo provider attempt con el request consumido.
