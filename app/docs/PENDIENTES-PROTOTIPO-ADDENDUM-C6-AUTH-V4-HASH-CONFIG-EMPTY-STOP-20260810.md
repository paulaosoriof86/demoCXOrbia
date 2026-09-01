# PENDIENTES PROTOTIPO — ADDENDUM C6 AUTH V4 HASH_CONFIG_EMPTY STOP_RETRY

**Fecha:** 2026-08-10

## Pendiente backend P0 actual

`HASH_CONFIG_RESPONSE_PATH_MISMATCH` en PREWRITE Auth DEV.

El GET administrativo ya usa la forma correcta sin `mask`, pero el ejecutor heredado extrae `body.hashConfig || body.hash_config` y no la ruta documentada `Config.signIn.hashConfig`.

Antes de otro provider PREWRITE debe añadirse un gate read-only/source-only que confirme la disponibilidad del permiso `firebaseauth.configs.getHashConfig` para el principal exacto, sin IAM writes.

## No es pendiente de prototipo/Claude

No requiere cambios visuales ni nueva candidata. Quedan protegidos:

- Login único;
- Admin/Operaciones;
- Shopper;
- Cliente;
- Dashboard/Historico/Visitas/Postulaciones/Reservas;
- Finanzas/Liquidaciones/Portales;
- Academia;
- multi-tenant/multi-proyecto;
- Cinépolis configurable.

## Circuit breakers

- no reabrir SKIP13;
- no reabrir multi-Auth;
- no reabrir lineage `ac93...`;
- no regenerar plan v3/v4;
- no crear otra rama/PR;
- no segundo provider attempt con el request consumido;
- no producción/merge hasta Auth PASS + smoke acumulativo + validación humana.

## Pendiente posterior a Auth PASS

Solo después de PREWRITE + Auth DEV PASS:

1. readback 110→228 esperado;
2. idempotencia;
3. rollback dry-run con 8 password restore entries exactas;
4. smoke acumulativo Admin/Operaciones, Shopper y Cliente;
5. validación humana;
6. cutover bajo autorización separada.
