# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I4-PROTECTED-RUNTIME-CLOSED-38`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Score formal:** `85/100`

## Objetivo

Completar el 15% final hacia go-live sobre la misma build protegida que cerró I4, sin reconstruir funcionalidades, sin reabrir Auth/Shopper/Finanzas y sin cambiar de candidata, rama, PR o metodología.

## I4 — CERRADO / FROZEN

### I4.1 — CANONICAL_CONTINUITY_RECONCILIATION
`PASS`.

### I4.2 — PROTECTED_RUNTIME_SINGLE_AUTHORITY
`PASS`. El watcher HR queda subordinado a `CX_PROTECTED_AUTH_HR_AUTHORITY` en el carril humano autenticado; no hay doble autoridad de `CX.data`.

### I4.3 — REAL_PHASE_A_E2E
`PASS` por composición de evidencia same-build sin reproceso:
- Hosting DEV exacto de `f9802fdd498934a8e7729fa5c7d18341bec1cd71` con paridad remota PASS;
- Staff/Admin provider-backed read-only actual PASS;
- Shopper real histórico congelado PASS reutilizado, blobs sin cambio y 0 reset/reproceso;
- finanzas exactas preservadas por blob y cadena de carga sin drift de `app/`.

### I4.4 — I4_GATES_AND_FREEZE
`PASS`. Score formal: **85%**.

## I5 — PREPRODUCTION_AND_GO_LIVE

### I5.1 — PREPRODUCTION_READINESS_AND_UAT_PLAN_READONLY — ACTIVO

Sin nueva autorización y sin deploy:
1. construir matriz de regresión transversal sobre la misma build;
2. comprobar que los PASS relevantes pertenecen a la autoridad vigente y separar FAIL legacy/stale;
3. revisar scopes/RBAC, aislamiento tenant/proyecto y command/provider ACK;
4. revisar datos sensibles, secretos y exposición de PII;
5. revisar rollback/checkpoint y reversibilidad;
6. cerrar criterios UAT por Admin/Operativo/Shopper/Cliente/Academia;
7. preparar gate de PREPROD con source exacto y rollback exacto.

### I5.2 — PREPROD DEPLOY + UAT — REQUIERE AUTORIZACIÓN ESPECÍFICA

Solo cuando I5.1 cierre PASS:
- materializar exactamente la misma build o source lock resultante en PREPROD;
- ejecutar smoke/UAT provider-backed;
- corregir únicamente diferencias reproducibles y focalizadas;
- no producción todavía.

### I5.3 — PRODUCTION GO/NO-GO — REQUIERE AUTORIZACIÓN ESPECÍFICA

Con PREPROD/UAT PASS:
- congelar source lock final;
- comprobar rollback, seguridad, scopes y datos;
- solicitar autorización explícita de producción;
- desplegar una sola vez si se autoriza;
- smoke post-producción y freeze 100%.

## Evidencia que no se reabre

- Hosting DEV: run `32328316954`, artifact `9392151808`, exact remote parity PASS.
- Staff/Admin: run `32329139725`, artifact `9392431939`, `PASS_READONLY_POST_GATES` y runtime Staff/Admin PASS.
- Shopper: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`, reutilizado sin reset/reproceso.
- Finanzas: blob `088c68680177c470a4539622e1694128dd211d85`; mayo 44/44; junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`.
- Multi-proyecto/no-code: PASS protegido.
- Academia: existente; alineación I4 documentada, no reconstrucción.

## Prohibiciones antirregresión

- No reabrir I1–I4 sin evidencia nueva de P0.
- No reprocesar Shopper/Auth/Finanzas por defecto.
- No nueva candidata, rama, PR, metodología o transportador.
- No usar FAIL de workflows legacy/stale como causa automática para modificar producto.
- No confundir demo/source-safe con provider-backed.
- No activar provider writes, Make/Gemini, pagos, merge, PREPROD o producción antes de su gate/autorización.

## Verdad financiera a preservar

- Mayo 2026: 44/44 pagadas.
- Junio 2026: 2/44 pagadas, 42 pendientes, Q451 confirmado.
- `liquidada != pagada`.

## Cierre operativo de cada iteración

Toda iteración debe producir evidencia o declarar un bloqueo exacto. Después de un PASS no se vuelve a diagnosticar el mismo bloque sin insumo nuevo.
