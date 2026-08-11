# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__PROJECT_ENTITLEMENTS_PENDING__LIVE_USER_ADMIN_BACKEND_GAP_PROVEN__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-READY-20260810.md` como contrato de captura source-safe;
3. freeze Auth rector y source locks históricos cerrados de Activation, SKIP13, MultiAuth, HashConfig y direct runner;
4. `CAMBIOS-BACKEND.md`;
5. `RESUMEN-PARA-CLAUDE.md`;
6. `PENDIENTES-PROTOTIPO.md`;
7. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

Los documentos históricos que indiquen SKIP13, HashConfig, direct runner o Activation como pendientes no reabren esos bloques.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthPlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthExecuted=true
AuthUsersAfter=228
Readback=PASS
RollbackDryRun=PASS
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
HashConfig=closed PASS
CurrentBlock=CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED
OwnerReferences=received transiently
ProjectEntitlements=pending
AdditionalOpsUser=received transiently
LiveUserAdminUI=exists
LiveUserAdminBackend=false
ProductionBlocker=LIVE_USER_ADMIN_BACKEND_GAP
```

## 3. Regla de datos vivos

Las identidades humanas, correos, roles y scopes del staff no se hardcodean. Los accesos iniciales son bootstrap y deben quedar como datos vivos administrables bajo RBAC. Las referencias humanas recibidas se usan transitoriamente; no se persisten como constantes técnicas.

## 4. Gap focal probado

`app/modules/configuracion.js` ya contiene **Usuarios & Permisos**, pero persiste usuarios/roles/permisos en localStorage y la invitación sigue en modo vista previa. `app/core/backend-firebase.js` no contiene create/update/disable de Firebase Auth ni write de claims/scope. El cierre se absorbe dentro de M5; no abre una nueva metodología ni reauditoría general.

## 5. Pendiente exacto

Primero resolver únicamente el alcance de proyecto de cuatro accesos iniciales:

- A Superadministración;
- B Administración;
- C Operaciones titular;
- acceso adicional de Operaciones.

Cada uno debe clasificarse `TYA_COMPLETE` o `SPECIFIC_PROJECTS`. No asumir Cinépolis ni usar wildcard.

Después: target digests source-safe -> live user-admin contract/backend + wiring localizado -> repair focal A-D -> HR final evidence -> smoke final -> validación humana/rollback -> cutover autorizado -> post-smoke/freeze.

## 6. Progreso estable

**Avance certificado: 72%. Restante: 28%.** El denominador de 100 puntos y los milestones están congelados en el checkpoint vigente. No se recalculan por conversación.

## 7. Circuit breaker anti-bucle

- no reabrir M1-M3 sin P0 reproducible;
- no repetir preguntas ya respondidas;
- no nueva candidata/rama/PR por rutina;
- no PREWRITE/Activation general de nuevo;
- no provider/repair antes de scope exacto;
- no rediseñar UI para corregir el gap de persistencia;
- solo la cadena de cierre vigente puede bloquear producción.

## 8. Estado seguro

Sin provider writes, Auth/Firestore/HR/Rules/Storage writes del bloque, deploy, merge ni producción.
