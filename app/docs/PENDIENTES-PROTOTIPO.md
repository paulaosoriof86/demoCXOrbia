# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-28  
**Estado:** `PHASE_A_100__PROD_READINESS_95__F8_AUTHORIZED_UNCONSUMED__EXTERNAL_TRANSPORT_STOP`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5 y F6 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`. `F7-P1-003` está `CLOSED/PASS` con run `33131739261`.

Phase A=`100/100`; Production Real Readiness=`95/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, F7, R24/Corte 4, IAM Owner bridge, no rebuild/redeploy del release congelado, no reimportar datos y no crear candidata por rutina.

## Pendiente real actual

`F7-P1-004` backup/export + restore verificable y cierre F8 ya cuentan con autorización explícita single-use en la conversación actual. La autorización permanece `AUTHORIZED_NOT_YET_CONSUMED`: ninguna mutación provider comenzó.

El ejecutor acotado `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` quedó preparado y fail-closed. El bloqueo real es de transporte: la sesión actual no dispone de un canal GCP/provider autenticado que pueda ejecutarlo, no existe un workflow F8 activo ya autorizado, y crear/revivir workflows o credenciales está fuera del alcance vigente.

Clasificación: `EXTERNAL_TRANSPORT_OUTAGE_NO_SAFE_PROVIDER_EXECUTOR_IN_CURRENT_SESSION`.

**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.

## Warnings no bloqueantes posteriores

1. P1 `F7-P1-002`: metadata Secret Manager.
2. P2 `F7-P2-001`: alert delivery/runbook rehearsal.
3. P2 `F7-P2-002`: profundidad de Academia por rol/módulo.

## Reglas vigentes

- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- release F6 inmutable mientras no exista gate que autorice sustitución;
- base nueva y limpia; legacy solo export/import útil, nunca conexión/copia de la base vieja;
- multi-tenant `tenantId` + `projectId`;
- Make/Gemini/pagos solo con gate real;
- datos sensibles protegidos y fuera del repo;
- la autorización F8 actual no autoriza nuevas ramas/PR, IAM, credenciales, payloads de secretos, rebuild ni reimport;
- no consumir la autorización hasta iniciar una mutación provider real.
