# RESUMEN-PARA-CLAUDE.md

**Fecha:** 2026-08-27  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_PROVIDER_SECURITY_IAM_READ_CAPABILITY`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Conectado y preservado

El release F6 permanece congelado y no fue reconstruido ni redeployado. El Shopper histórico sigue recertificado read-only con identidad exacta, 6 visitas propias y HR viva 15 períodos / 30 hojas / 660 visitas / 214 shoppers. El gate de confidencialidad permanece humano: QA no lo acepta automáticamente.

El provider security readback F8 quedó acotado a un único bloqueo de mecanismo. Run `33117362096` pasó Cloud Run exacto, IAM readback, Service Usage y quotas. La falsa alarma sobre variables `TOKEN_SHA256` y `TOKEN_EXPIRES_AT` quedó corregida: son metadata derivada; el readback reporta `plaintextSensitiveKeyCount=0`.

Secret Manager está habilitado, pero la única credencial DEV disponible carece de `secretmanager.secrets.list`. No se leyó ni exportó ningún payload secreto. Esto es `MECHANISM_P0_STOP_PROVIDER_IAM_READ_CAPABILITY`, no P0 de producto.

## Para Claude / prototipo

**No hay cambio frontend que Claude deba implementar.** No se modificó `/app/modules`, `/app/core` ni la UI. No inferir pantallas, flujos o decisiones visuales desde este bloqueo IAM.

Preservar reglas ya vigentes:
- identidad Shopper exacta, nunca deduplicación solo por nombre;
- conflictos pasan a revisión;
- confidencialidad/aceptación legal es humana;
- credenciales de recuperación son efímeras y no se exhiben ni persisten como dato del producto.

## Academia

Sin cambio funcional nuevo. Cuando se actualicen manuales/cursos, mantener autenticación exacta, histórico Shopper, resolución segura de identidad, gate legal humano y carácter efímero de credenciales. El bloqueo IAM es operativo/infraestructura y no modifica contenido funcional del producto.

## Pendiente técnico que no corresponde a Claude

Antes de continuar F8 hace falta autorización explícita para un grant IAM temporal mínimo `roles/secretmanager.viewer`, ejecutar metadata readback y revocar el rol. Ese rol no incluye acceso al payload (`secretmanager.versions.access`). Después siguen carga/cuotas/failure injection acotado y backup/export + restore verificable antes del cutover.

Evidencias:
- `app/docs/evidence/RC15-F8-SHOPPER-HARNESS-RECOVERY-LATEST.json`;
- `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`.
