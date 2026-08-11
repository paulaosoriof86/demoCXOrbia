# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `PASS_C6_LIVE_USER_ADMIN_STATIC_SOURCE_GATE_TERMINAL__STAFF_REPAIR_BOOTSTRAP_PREWRITE_CONTRACT_READY__PROVIDER_SNAPSHOT_PENDING__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-STATIC-PASS-PREWRITE-READY-20260811.md`;
3. `app/docs/evidence/C6-LIVE-USER-ADMIN-STATIC-GATE-LATEST.json`;
4. `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json`;
5. `app/docs/SOURCE-LOCK-C6-STAFF-TYA-COMPLETE-AND-LIVE-USER-ADMIN-SOURCE-20260811.md`;
6. `backend/config/c6-staff-bootstrap-targets-v1.json`;
7. `backend/contracts/c6-live-user-admin-v1.json` + `backend/runtime/hr-live-service/user-admin.mjs`;
8. `app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md` y su evidencia;
9. freeze Auth rector y source locks históricos cerrados de Activation, SKIP13, MultiAuth, HashConfig y direct runner;
10. `CAMBIOS-BACKEND.md`;
11. `RESUMEN-PARA-CLAUDE.md`;
12. `PENDIENTES-PROTOTIPO.md`;
13. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

Fuentes históricas que indiquen scopes, HR, SKIP13, HashConfig, direct runner, Activation o static live-user-admin como pendientes quedan superseded.

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
M5=3/8 COMPLETE
M6=COMPLETE 5/5
InitialStaffEntitlement=TYA_COMPLETE_ALL_FOUR
CanonicalCurrentProjectIds=[cinepolis]
LiveUserAdminContract=v1.1
LiveUserAdminBackendSource=materialized
LiveUserAdminStaticGate=PASS_TERMINAL
StaffRepairBootstrapPrewriteContract=READY_SOURCE_ONLY
ProviderSnapshot=PENDING
Production=false
```

## 3. Gate estático terminal

El runner read-only ya existente ejecutó el preflight obligatorio sobre el checkout exacto de la rama viva:

```text
checkoutHead=9d16521ac67c7a9fa7cd6de393e778bc6a05876b
runId=31513528713
jobId=93852916856
decision=PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT
blockers=[]
warnings=[]
```

El preflight incluye el gate `tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs` y falla si su decisión o su safe-state no son exactos. No se habilitó perfil provider/browser.

## 4. Scope de usuarios — regla vigente

El alta de cualquier usuario staff debe exigir una decisión empresarial explícita:

```text
TyA completo
or
Proyectos específicos
```

El alcance es editable posteriormente. El backend resuelve projectIds desde `tenants/{tenantId}/projects`, nunca con wildcard ni default silencioso. Los usuarios `TYA_COMPLETE` que queden desfasados frente a un proyecto nuevo deben marcarse `scopeReviewRequired` hasta confirmación autorizada.

## 5. Prewrite focal

`backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json` unifica los tres repairs históricos staff, el acceso adicional de Operaciones y el repair histórico Cliente sin confundir alias. El antiguo hard cap Auth=14 no se reutiliza; el cap final se congela solo después del snapshot provider read-only.

## 6. HR viva

M6 permanece cerrado: periodo 2026-08, 34 GT + 10 HN = 44. No pedir enlace, export ni remapeo. M7 solo verifica consumo runtime final.

## 7. Progreso estable

**Avance certificado: 83%. Restante: 17%.**

M5 pasó 2/8 -> 3/8 por PASS terminal del static gate. El prewrite contract está preparado pero no suma un punto adicional hasta que exista snapshot/prewrite provider read-only PASS.

## 8. Pendiente exacto

`C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY`.

Después, con PASS: congelar write budget + rollback dry-run -> autorización específica de repair/bootstrap -> readback/rollback -> wiring localizado -> M7 smoke final -> M8 -> M9 cutover -> M10 freeze.

## 9. Circuit breaker anti-bucle

- no reabrir M1-M4 ni M6 sin P0 reproducible;
- no volver a preguntar owners, scopes iniciales o HR;
- no nueva candidata/rama/PR por rutina;
- no repetir el static gate ya cerrado;
- no provider writes antes de snapshot/prewrite PASS y autorización específica;
- no rediseñar Usuarios & Permisos;
- no wildcard de proyectos;
- no deploy/merge/producción sin gate/autorización correspondiente.

## 10. Estado seguro

Cero provider reads/writes, Auth/Firestore/HR/Rules/Storage writes, deploy, merge o producción en el bloque cerrado.