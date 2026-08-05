# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-05  
**Estado:** `LOGIN_ROOT_FIX_DEPLOYED__AUTH_MULTIROLE_PASS__CLIENT_ROUTE_PRODUCT_PASS__HARNESS_ONLY_PENDING__NO_MORE_DEPLOY`

## Microbloques de salida

| Microbloque | Estado | Evidencia |
|---|---|---|
| 0 — Carril único | COMPLETADO | Rama viva y PR #7 preservados |
| 1 — Auditoría focalizada V7.2 | COMPLETADO | P0 selector reproducible |
| 2 — Empalme/composición acumulativa | COMPLETADO | V7.2-P0F1 empalmada |
| 3 — Root fix selector Login | COMPLETADO | Dos archivos exactos con `.lg2-card, .login-card` |
| 4 — Reconciliación de pins | COMPLETADO | Solo dos pins actualizados en overlay activo |
| 5 — Source/static posterior | PASS | Composición y Lab PASS |
| 6 — Primer Hosting DEV | COMPLETADO HISTÓRICO | Release y paridad PASS; descubrió P0 selector |
| 7 — Segundo Hosting DEV correctivo | COMPLETADO | Release completa; paridad remota PASS |
| 8A — Staff | PASS | Login, reload y nueva pestaña |
| 8B — Shopper | PASS | Login, tres recargas, nueva pestaña y visita propia |
| 8C — Cliente Auth | PASS | Credencial existente, recarga y nueva pestaña |
| 8D — Finanzas/Reservas diagnóstico | PASS PARCIAL | Modelo delegado y guard fail-closed observados |
| 8E — Diagnóstico `client_route_wait` | PASS CLASIFICADO | Producto renderiza; fallo pertenece al harness |
| 8F — Predicado semántico del harness | PENDIENTE | Debe quitar dependencia de `#nav-cli_dashboard.active` |
| 9 — Validación humana y freeze | PENDIENTE | Requiere rerun semántico read-only PASS |
| 10 — Cutover/producción | PENDIENTE | Requiere freeze y autorización expresa |

## P0 original

`LEGACY_LOGIN_CONTAINER_SELECTOR_AFTER_V7_2_MARKUP_CHANGE` permanece cerrado técnicamente:

- source fix aplicado;
- pins reconciliados;
- source/static PASS;
- deploy correctivo completo;
- Login Staff, Shopper y Cliente PASS.

## Diagnóstico focal cerrado

```text
PASS_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_CLASSIFIED
OWNER=HARNESS
CODE=HARNESS_NAV_ACTIVE_SUBCONDITION_MISMATCH
```

```text
sessionView=cli_dashboard
navElementExists=false
navActive=false
viewExists=true
pageHeaderExists=true
viewTextLength=690
renderException=null
```

No existe P0 de producto demostrado: la ruta Cliente fue aceptada, `#view` existe, `.ph` existe y el contenido se renderizó. La condición incorrecta está únicamente en el harness.

## Siguiente bloque exacto

`HARNESS-ONLY: CORREGIR PREDICADO CLIENTE → RERUN SEMÁNTICO READ-ONLY → CERO DEPLOY → STOP PARA VALIDACIÓN HUMANA`.

## Estado seguro

Hosting DEV acumulado `2`; deploys adicionales autorizados `0`. Cloud Run, Firestore/Auth/Rules/Storage/HR writes, Make, Gemini, pagos, merge y producción: `0/false`.
