# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-05  
**Estado:** `LOGIN_ROOT_FIX_DEPLOYED__AUTH_MULTIROLE_PASS__CLIENT_ROUTE_WAIT_HOLD__NO_MORE_DEPLOY`

## Microbloques de salida

| Microbloque | Estado | Evidencia |
|---|---|---|
| 0 — Carril único | COMPLETADO | Rama viva y PR #7 preservados |
| 1 — Auditoría focalizada V7.2 | COMPLETADO | P0 selector reproducible |
| 2 — Empalme/composición acumulativa | COMPLETADO | V7.2-P0F1 empalmada |
| 3 — Root fix selector Login | COMPLETADO | Dos archivos exactos con `.lg2-card, .login-card` |
| 4 — Reconciliación de pins | COMPLETADO | Solo dos pins actualizados en overlay activo |
| 5 — Source/static posterior | PASS | Run `31025221503`; composición y Lab PASS |
| 6 — Primer Hosting DEV | COMPLETADO HISTÓRICO | Release y paridad PASS; descubrió P0 selector |
| 7 — Segundo Hosting DEV correctivo | COMPLETADO | Release completa; paridad remota PASS |
| 8A — Staff | PASS | Login, reload y nueva pestaña |
| 8B — Shopper | PASS | Login, tres recargas, nueva pestaña y visita propia |
| 8C — Cliente Auth | PASS | Credencial existente, recarga y nueva pestaña |
| 8D — Finanzas/Reservas diagnóstico | PASS PARCIAL | Modelo delegado y guard fail-closed observados |
| 8E — Gate remoto acumulativo | HOLD | Timeout en `client_route_wait` |
| 9 — Validación humana y freeze | PENDIENTE | No iniciar como aprobación mientras el gate acumulativo esté en HOLD |
| 10 — Cutover/producción | PENDIENTE | Requiere freeze y autorización expresa |

## Estado del P0 original

El P0 `LEGACY_LOGIN_CONTAINER_SELECTOR_AFTER_V7_2_MARKUP_CHANGE` queda cerrado técnicamente:

- source fix aplicado;
- pins reconciliados;
- source/static PASS;
- deploy correctivo completo;
- Login Staff, Shopper y Cliente PASS.

## HOLD actual

```text
FAIL_C6_REMOTE_GATES_AFTER_SINGLE_DEV_HOSTING_DEPLOY_STOP_RETRY
failedStage=remote_domain_finance_portals_reservations
semantic.failedStage=client_route_wait
```

El router aceptó `cli_dashboard`, pero el gate no observó dentro de 30 segundos todo el predicado visual combinado. Falta identificar de manera separada nav activa, `.ph`, contenido de `#view` y excepción de render.

## Siguiente bloque exacto

`DIAGNÓSTICO READ-ONLY FOCAL client_route_wait → CAPTURA POR SUBCONDICIÓN → PRODUCTO VS HARNESS → STOP SIN DEPLOY`.

## Estado seguro

Hosting DEV acumulado `2`; deploys adicionales autorizados `0`. Cloud Run, Firestore/Auth/Rules/Storage/HR writes del bloque, Make, Gemini, pagos, merge y producción: `0/false`.
