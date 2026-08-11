# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_STAFF_PROVIDER_SNAPSHOT_HARNESS_REPAIRED__FIRST_REQUEST_ABORTED_PRE_PROVIDER_READS_0__ONE_AUTHORIZED_PROVIDER_OBSERVATION_STILL_PENDING__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-HARNESS-REPAIRED-20260811.md`;
3. `backend/contracts/c6-staff-provider-snapshot-runner-v1.json`;
4. `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json`;
5. `backend/config/c6-staff-provider-collision-targets-v1.json`;
6. `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-STATIC-PASS-PREWRITE-READY-20260811.md`;
7. `app/docs/evidence/C6-LIVE-USER-ADMIN-STATIC-GATE-LATEST.json`;
8. `app/docs/SOURCE-LOCK-C6-STAFF-TYA-COMPLETE-AND-LIVE-USER-ADMIN-SOURCE-20260811.md`;
9. `backend/config/c6-staff-bootstrap-targets-v1.json`;
10. `backend/contracts/c6-live-user-admin-v1.json` + `backend/runtime/hr-live-service/user-admin.mjs`;
11. `app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md` y su evidencia;
12. freeze Auth rector y source locks históricos cerrados de Activation, SKIP13, MultiAuth, HashConfig y direct runner;
13. `CAMBIOS-BACKEND.md`;
14. `RESUMEN-PARA-CLAUDE.md`;
15. `PENDIENTES-PROTOTIPO.md`;
16. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

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
ProviderSnapshot=AUTHORIZED_NOT_YET_EFFECTIVELY_OBSERVED
ProviderReadsEffective=0
Production=false
```

## 3. Provider snapshot — harness incident does not consume observation

El primer request autorizado llegó hasta source preflight + request gate, pero abortó por parseo del shell antes de iniciar el script provider:

```text
runId=31518115944
jobId=93868277963
rootCause=NESTED_HEREDOC_DELIMITER_INDENTATION
providerScriptStarted=false
authListObservations=0
firestoreProviderReads=0
```

El request quedó cerrado como `HARNESS_ABORTED_PRE_PROVIDER_READS_0`. El status failure de ese commit es telemetría y no una observación provider.

El root fix reutiliza el mismo workflow existente con `tools/qa/cxorbia-c6-staff-provider-snapshot-runner-report.mjs`. Validación con request deshabilitado:

```text
runId=31518696584
jobId=93870136421
conclusion=success
providerProfileExecuted=false
```

La autorización vigente conserva una sola observación provider efectiva todavía pendiente. Si esa observación detecta drift, faltante, colisión o ambigüedad, se aplica `STOP_RETRY` sin segundo provider read.

## 4. Scope de usuarios — regla vigente

El alta de cualquier usuario staff exige `TyA completo` o `Proyectos específicos`. El alcance es editable; `TYA_COMPLETE` se materializa en projectIds exactos y nunca wildcard. Proyecto nuevo requiere revisión explícita antes de expandir claims.

## 5. HR viva

M6 permanece cerrado: periodo 2026-08, 34 GT + 10 HN = 44. No pedir enlace, export ni remapeo.

## 6. Progreso estable

**Avance certificado: 83%. Restante: 17%.** El incidente pre-provider no cambia la métrica.

## 7. Pendiente exacto

`C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY` — primera y única observación efectiva.

Con PASS: congelar write budget + rollback dry-run -> autorización específica de repair/bootstrap -> ejecución focal/readback -> wiring localizado -> M7 -> M8 -> M9 -> M10.

## 8. Circuit breaker anti-bucle

- no reabrir M1-M4 ni M6 sin P0 reproducible;
- no repetir static gate;
- no volver a pedir owners, scopes iniciales o HR;
- no nueva candidata/rama/PR;
- no provider writes antes de snapshot PASS + autorización específica;
- no segundo provider read después de una observación efectiva;
- no rediseñar Usuarios & Permisos;
- no deploy/merge/producción sin gate/autorización.

## 9. Estado seguro

Hasta este punto: provider reads efectivos 0; provider/Auth/Firestore/HR/Rules/Storage writes 0; deletes 0; deploy 0; merge false; production false.
