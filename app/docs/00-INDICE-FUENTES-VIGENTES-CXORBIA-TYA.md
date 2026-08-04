# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CLIENT_RUNTIME_ROUTE_WAIT_FAIL__ROLLBACK_EXACT__LIFECYCLE_ROOT_CAUSE_PROVEN__CLOUD_V6_NOT_AUDITED_LANE_BLOCKED__NO_PRODUCTION`

## 0. Lock prevalente

Única baseline válida:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge.

Producción `tya-plataforma` intacta. No crear candidata, shell, rama, PR, Firebase, Hosting o metodología paralela.

## 1. Fuentes activas — orden obligatorio

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-C6-CLIENT-RUNTIME-ROUTE-WAIT-20260804.md`;
3. `app/docs/evidence/CORTE6-CLIENT-ACCESS-RUNTIME-FAILURE-LATEST.json`;
4. `CAMBIOS-BACKEND-ADDENDUM-C6-CLIENT-ROUTE-SOURCE-STATIC-20260804.md`;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`;
7. `RESUMEN-PARA-CLAUDE.md`;
8. `PENDIENTES-PROTOTIPO.md`;
9. `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
10. reglas maestras/addenda activos;
11. PR #7 y HEAD vivo.

## 2. Autoridades preservadas

- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- source/static acumulativo 53/53 PASS;
- M1/Corte 1, Corte 2A/V174 y Corte 3/V182 preservados;
- HR viva conocida: 15 periodos, 660 visitas y 209 shoppers;
- producción intacta.

## 3. Runtime Cliente posterior al route fix

Solicitud:

`c6-client-access-repair-runtime-20260804-routefix-01`.

- commit de autorización `f95adea1073633e7e6d638183ff4ec04bedaf979`;
- commit de evidencia `7924b1c83bc99e6fdf9a4d081e1bb6c11d24aefc`;
- consumida una sola vez;
- resultado `FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`;
- etapa interna `client_route_wait`;
- timeout 30 segundos;
- rollback exacto PASS.

## 4. Causa raíz vigente

`openAndLogin()` prueba Auth, HR y `#app.on`, pero `CX.app.enter()` activa `#app.on` antes de `CX.router.mount()`. El mount puede quedar diferido por confidencialidad. El gate después exige ruta, nav activa, encabezado y texto en una sola espera.

La causa es un contrato de ciclo de vida incorrecto: **app visible no equivale a shell/router/rail listo**.

Pendiente:

- separar `AUTH_READY` y `SHELL_READY`;
- snapshot de timeout por condición;
- confidencialidad pendiente observable;
- ruta/render y highlight separados;
- gate local/estático antes de otro runtime.

## 5. Cloud V6

Recibido:

`Prototype development request V6.zip`.

SHA-256:

`0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

Estado:

`NOT_AUDITED__EXECUTION_LANE_NOT_READY`.

El ZIP está extraído. Falta checkout autenticado de la rama viva en la misma sesión; el entorno local no resuelve `github.com`. No se inició auditoría, no se declaró GO/HOLD y no se aplicó delta alguno.

## 6. Siguiente bloque exacto

```text
SOURCE-ONLY CLIENT SHELL READINESS ROOT FIX
→ GATE LOCAL/ESTÁTICO
→ EXECUTION_LANE_READY CON CHECKOUT AUTENTICADO
→ AUDITORÍA FOCAL ACUMULATIVA CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO SI GO Y SIN P0
```

## 7. Estado seguro

- cambios funcionales `app/`: 0;
- membership temporal eliminado;
- claims finales sin cambio;
- usuarios/password changes: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Hosting/Cloud Run: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
