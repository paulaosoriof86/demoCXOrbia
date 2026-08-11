# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `PASS_C6_M4_STAFF_TYA_COMPLETE_TARGET_DIGESTS__LIVE_USER_ADMIN_EXECUTABLE_SOURCE_PREPARED__STATIC_GATE_EXECUTION_PENDING__NO_PROVIDER__NO_RUNTIME_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-STAFF-TYA-COMPLETE-AND-LIVE-USER-ADMIN-SOURCE-20260811.md`;
3. `backend/config/c6-staff-bootstrap-targets-v1.json`;
4. `app/docs/evidence/C6-STAFF-TYA-COMPLETE-TARGET-DIGESTS-LATEST.json`;
5. `backend/contracts/c6-live-user-admin-v1.json`;
6. `backend/runtime/hr-live-service/user-admin.mjs` + source packaging/router;
7. `app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md` y su evidencia;
8. freeze Auth rector y source locks históricos cerrados de Activation, SKIP13, MultiAuth, HashConfig y direct runner;
9. `CAMBIOS-BACKEND.md`;
10. `RESUMEN-PARA-CLAUDE.md`;
11. `PENDIENTES-PROTOTIPO.md`;
12. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

Fuentes históricas que indiquen scopes, HR, SKIP13, HashConfig, direct runner o Activation como pendientes no reabren esos bloques.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuthAdjudication=closed
HashConfig=closed PASS
HRSourceMapped=true
HRSourceLive=true
M4=COMPLETE 5/5
M5=2/8 COMPLETE
M6=COMPLETE 5/5
InitialStaffEntitlement=TYA_COMPLETE_ALL_FOUR
CanonicalCurrentProjectIds=[cinepolis]
LiveUserAdminContract=v1.1
LiveUserAdminBackendSource=materialized
LiveUserAdminStaticGate=prepared_not_terminally_executed
Production=false
```

## 3. Scope de usuarios — regla vigente

El alta de cualquier usuario staff debe exigir una decisión empresarial explícita:

```text
TyA completo
or
Proyectos específicos
```

El alcance es editable posteriormente. El backend resuelve projectIds desde `tenants/{tenantId}/projects`, nunca con wildcard ni default silencioso. Los usuarios `TYA_COMPLETE` que queden desfasados frente a un proyecto nuevo deben marcarse `scopeReviewRequired` hasta confirmación autorizada.

## 4. Backend user-admin source

Se reutiliza el backend Cloud Run existente. Source preparado:

- `backend/runtime/hr-live-service/user-admin.mjs`;
- routing en `server.mjs`;
- Firebase Admin dependency en `package.json`;
- packaging en `Dockerfile`;
- rewrite source-only `/api/tenants/**` en `firebase.json`;
- gate `tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs`.

No se tocó la UI desde backend. El wiring futuro queda localizado para Claude en `app/modules/configuracion.js#usuarios`.

## 5. HR viva

M6 permanece cerrado: periodo 2026-08, 34 GT + 10 HN = 44. No pedir enlace, export ni remapeo. M7 solo verifica consumo runtime final.

## 6. Progreso estable

**Avance certificado: 82%. Restante: 18%.**

M4 pasó 2/5 -> 5/5 y M5 pasó 1/8 -> 2/8 por materialización del backend executable source. No se acredita el punto del gate estático hasta ejecución terminal.

## 7. Pendiente exacto

`C6 LIVE USER ADMIN STATIC SOURCE GATE -> STAFF REPAIR/BOOTSTRAP PREWRITE`.

Después: ejecución focal autorizada + readback/rollback -> wiring localizado -> M7 smoke final -> M8 -> M9 cutover -> M10 freeze.

## 8. Circuit breaker anti-bucle

- no reabrir M1-M4 ni M6 sin P0 reproducible;
- no volver a preguntar owners, scopes iniciales o HR;
- no nueva candidata/rama/PR por rutina;
- no provider/repair antes del gate source-only terminal;
- no rediseñar Usuarios & Permisos;
- no wildcard de proyectos;
- no deploy/merge/producción sin gate/autorización correspondiente.

## 9. Estado seguro

Cero provider/Auth/Firestore/HR/Rules/Storage writes, deploy, merge o producción en este bloque.