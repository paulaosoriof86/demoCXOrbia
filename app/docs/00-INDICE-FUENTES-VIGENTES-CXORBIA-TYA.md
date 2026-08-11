# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_HR_LIVE_DIRECT_READ_PASS__LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_REPAIR__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md`;
3. `app/docs/evidence/C6-HR-LIVE-DIRECT-READ-LATEST.json`;
4. `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-CONTRACT-SOURCE-ONLY-20260811.md`;
5. `backend/contracts/c6-live-user-admin-v1.json`;
6. `app/docs/SOURCE-LOCK-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-READY-20260810.md` como contrato de captura source-safe;
7. freeze Auth rector y source locks históricos cerrados de Activation, SKIP13, MultiAuth, HashConfig y direct runner;
8. `CAMBIOS-BACKEND.md`;
9. `RESUMEN-PARA-CLAUDE.md`;
10. `PENDIENTES-PROTOTIPO.md`;
11. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

Los documentos históricos que indiquen SKIP13, HashConfig, direct runner, Activation o **HR live mapping/readiness** como pendientes no reabren esos bloques.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthExecuted=true
AuthUsersAfter=228
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuthAdjudication=closed
HashConfig=closed PASS
HRSourceMapped=true
HRSourceLive=true
HRCurrentPeriod=2026-08
HRCurrentVisits=44
HRCurrentGT=34
HRCurrentHN=10
M6=COMPLETE
Production=false
OwnerReferences=received transiently
ProjectEntitlements=pending
AdditionalOpsUser=received transiently
LiveUserAdminUI=exists
LiveUserAdminContract=PASS_SOURCE_ONLY
LiveUserAdminBackendExecutable=pending
```

## 3. HR viva — corrección anti-bucle

La antigua fuente `SOURCE-LOCK-C6-LIVE-HR-CONTROL-PLANE-OBSERVABILITY-20260806.md` queda **histórica** para explicar un problema de observabilidad del workflow. No demuestra que HR estuviera desconectada.

El 2026-08-11 se realizó lectura directa de la fuente Google Sheets compartida previamente. Agosto 2026 contiene 34 filas GT + 10 HN = 44, con país validado correctamente en ambos tabs. No se requiere nuevo mapeo, export ni workflow provider para volver a demostrar M6.

## 4. Regla de datos vivos

Las identidades humanas, correos, roles y scopes del staff no se hardcodean. Los accesos iniciales son bootstrap y deben quedar como datos vivos administrables bajo RBAC.

## 5. Gap focal de usuarios

`app/modules/configuracion.js` ya contiene **Usuarios & Permisos**, pero persiste usuarios/roles/permisos en localStorage y la invitación sigue en modo vista previa. `app/core/backend-firebase.js` no contiene create/update/disable de Firebase Auth ni write de claims/scope.

El contrato source-only para resolverlo ya quedó PASS en `backend/contracts/c6-live-user-admin-v1.json`. El backend executable/admin adapter y el wiring localizado siguen pendientes dentro de M5.

## 6. Pendiente exacto

Primero resolver el alcance de proyecto de cuatro accesos iniciales:

- A Superadministración;
- B Administración;
- C Operaciones titular;
- acceso adicional de Operaciones.

Cada uno debe clasificarse `TYA_COMPLETE` o `SPECIFIC_PROJECTS`. No asumir Cinépolis ni usar wildcard.

Después: target digests source-safe -> backend executable/admin adapter + wiring localizado -> repair focal A-D -> smoke final M7 usando la misma HR viva -> validación humana/rollback -> cutover autorizado -> post-smoke/freeze.

## 7. Progreso estable

**Avance certificado: 78%. Restante: 22%.** M6 aporta 5/5 y queda cerrado. El denominador de 100 puntos no cambia.

## 8. Circuit breaker anti-bucle

- no reabrir M1-M3 ni M6 sin P0 reproducible;
- no repetir preguntas ya respondidas;
- no pedir de nuevo el enlace HR ni rehacer mapeo;
- no nueva candidata/rama/PR por rutina;
- no PREWRITE/Activation general de nuevo;
- no repair Auth antes de scope exacto;
- no rediseñar UI para corregir persistencia;
- solo la cadena de cierre vigente puede bloquear producción.

## 9. Estado seguro

Lecturas HR directas únicamente; cero provider writes, Auth/Firestore/HR/Rules/Storage writes, deploy, merge o producción.