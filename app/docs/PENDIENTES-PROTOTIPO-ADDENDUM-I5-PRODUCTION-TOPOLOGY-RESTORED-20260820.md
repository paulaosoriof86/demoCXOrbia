# PENDIENTES PROTOTIPO — ADDENDUM I5 PRODUCTION TOPOLOGY RESTORED

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-EXISTING-CLEAN-PROJECT-PROMOTION-RESTORED-42`

## Pendiente vivo único de esta frontera

`I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`

No falta crear un proyecto Firebase. El contrato de promoción vigente ya define `cxorbia-backend-dev` como proyecto limpio existente a promover y acepta su URL actual como producción futura.

## Requisitos a reconciliar

1. `LIVE_HR_CURRENT_PERIOD_AND_HISTORY_REVISION_PASS`;
2. `SHOPPER_AUTH_REPAIR_PASS`;
3. `ACCUMULATIVE_MULTIROLE_SMOKE_PASS`;
4. `HUMAN_VALIDATION_PASS`;
5. `ROLLBACK_READY`;
6. `EXPLICIT_CUTOVER_AUTHORIZATION`.

Cada requisito se compara con evidencia terminal vigente. No se rerunea un bloque I1–I4 ya frozen solo porque el nombre histórico del gate sea distinto.

## No pendientes / no reprocesar

- creación de `cxorbia-preprod-20260819`;
- Project Creator / user-auth project creation;
- Auth;
- Shopper histórico;
- Finanzas;
- multi-proyecto;
- certificaciones/documentos/reservas;
- Academia;
- frontend;
- nuevo Hosting de prueba por defecto.

## Ambientes

- `cxorbia-backend-dev`: canonical backend / promotion target.
- `cxorbia-tya-dev-260729-c4`: sandbox únicamente.
- `tya-plataforma`: legacy intacto hasta autorización de cutover.

## Condición de salida

Cerrar documentalmente qué requisitos del contrato ya están satisfechos y aislar únicamente los faltantes reales. Solo después se abre el gate mutable final correspondiente.

## Seguridad actual

0 proyecto PREPROD nuevo, 0 deploy adicional, 0 provider/data writes, 0 merge y 0 producción.
