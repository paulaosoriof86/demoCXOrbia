# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-11  
**Estado:** `PASS_C6_LIVE_USER_ADMIN_STATIC_SOURCE_GATE_TERMINAL__STAFF_REPAIR_BOOTSTRAP_PREWRITE_CONTRACT_READY__PROVIDER_SNAPSHOT_PENDING__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-STATIC-PASS-PREWRITE-READY-20260811.md`;
- producción: intacta.

## 2. Baseline protegido

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuth=closed
HashConfig=closed PASS
DirectRunnerDEV=PASS
HRSourceMapped=true
HRSourceLive=true
M6=COMPLETE
```

No reconstruir Auth, no reabrir HR y no repetir PREWRITE/Activation históricos.

## 3. M4 — COMPLETE

Los cuatro accesos iniciales permanecen `TYA_COMPLETE`, convertidos a projectIds canónicos exactos y sin wildcard. No volver a pedir owner names, correos o scope inicial.

```text
M4=5/5 COMPLETE
```

## 4. Regla viva de alcance por usuario

Usuarios & Permisos debe preguntar al crear cada usuario:

```text
Alcance de proyectos:
- TyA completo
- Proyectos específicos
```

El alcance es obligatorio y editable. `Proyectos específicos` usa inventario vivo. `TyA completo` persiste projectIds exactos y marca `scopeReviewRequired` si el inventario cambia; no existe herencia silenciosa.

## 5. M5 — static gate PASS

Ejecución terminal:

```text
checkoutHead=9d16521ac67c7a9fa7cd6de393e778bc6a05876b
workflowRunId=31513528713
workflowJobId=93852916856
controlledRunnerDecision=PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT
blockers=[]
warnings=[]
providerProfileEnabled=false
```

El preflight obligatorio incorpora el gate live-user-admin y falla si su decisión/safe-state no son exactos. El request que disparó el control quedó congelado como `consumed_pass_control_plane_static_gate_only`, `enabled=false`, sin ejecución residual.

Subasignación:

```text
M5a contract source-only                    = COMPLETE 1/8
M5b executable backend source materialized = COMPLETE 1/8
M5c static terminal gate                    = COMPLETE 1/8
M5 remaining                               = PENDING 5/8
```

## 6. Prewrite focal listo

Nuevo contrato: `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json`.

Se distinguen R1/Super->A, R2/Admin->B, R3/Ops->C, target D adicional Ops y `R4_CLIENT_HISTORICAL` como viejo repair Cliente.

El cap histórico de 14 Auth writes queda superseded. El contrato solo registra un peor caso teórico de 16 antes del snapshot; **no es autorización ni cap final**. El cap exacto se congela después del provider snapshot read-only.

## 7. Progreso de cierre

```text
M1 Baseline acumulativa/Phase A preservada        35 = COMPLETE
M2 Auth V4 activation/readback/rollback           20 = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner      15 = COMPLETE
M4 Owners + exact project entitlements             5 = COMPLETE
M5 Staff repair/bootstrap + live admin + rollback  8 = 3/8 COMPLETE
M6 HR live current production evidence              5 = COMPLETE
M7 Final accumulative multirole smoke               5 = PENDING
M8 Human validation + rollback ready                3 = PENDING
M9 Explicit cutover + one production promotion      3 = PENDING
M10 Post-cutover smoke + freeze                     1 = PENDING
```

**Avance certificado: 83%. Restante: 17%.**

## 8. Circuit breaker anti-bucle

1. No reabrir M1-M4 ni M6 sin P0 reproducible.
2. No volver a pedir owners, scopes iniciales ni HR.
3. No repetir el static gate ya PASS.
4. No hardcodear staff/emails/projectIds en runtime UI.
5. No nueva candidata/rama/PR por rutina.
6. No provider writes antes de provider snapshot/prewrite PASS y autorización específica.
7. No rediseñar Usuarios & Permisos; wiring localizado únicamente.
8. No producción sin autorización explícita de cutover.

## 9. Siguiente gate exacto

`C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY`.

Debe observar una sola vez los focales Auth source-safe, resolver reutilización de A solo con owner-binding independiente, verificar colisiones técnicas con inputs transitorios, congelar write budget exacto y producir rollback dry-run. Si falta un input transitorio, STOP antes de writes y sin reabrir las 340 identidades.

## 10. Estado seguro

```text
providerReadsCurrentBlock=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
```