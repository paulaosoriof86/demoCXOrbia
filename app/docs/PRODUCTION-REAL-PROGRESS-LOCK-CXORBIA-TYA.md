# CXOrbia TyA — Progreso hacia producción real

**Fecha de baseline vigente:** 2026-08-27  
**Métrica canónica:** `PRODUCTION_REAL_READINESS`  
**Estado actual:** `95/100`  
**PHASE_A:** `100/100`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`

## Gates cerrados

- `69 → 74`: M3 terminal PASS.
- `74 → 76`: F3 mecanismo provider + recovery lane PASS.
- `76 → 81`: F4 recovery PASS.
- `81 → 86`: F5 live synthetic acceptance + cleanup + residue cero PASS.
- `86 → 90`: F6 release Phase A inmutable PASS.
- `90 → 95`: F7 integral readiness `GO_WITH_WARNINGS`, P0=0.

## F8 — avance que no cambia porcentaje

Evidencia vigente: `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`.

Prechecks ya demostrados:
- Shopper runtime exacto read-only PASS;
- Cloud Run exacto/revision congelada PASS;
- Cloud Run IAM readback PASS;
- plaintext secret-bearing env names detectados = 0;
- Service Usage 4/4 ENABLED;
- quota readbacks 4/4 PASS sin overrides.

HOLD único actual: Secret Manager API está habilitado, pero la credencial DEV de precheck carece de `secretmanager.secrets.list`. No existe ruta alterna de credencial disponible y no se leyó ningún payload secreto. Clasificación: `MECHANISM_P0_STOP_PROVIDER_IAM_READ_CAPABILITY`, no P0 de producto.

El porcentaje **no aumenta** por preparación, diagnóstico ni readback parcial. F8 solo mueve `95 → 98` cuando el cutover exacto quede terminal y reconciliado.

## Escalera restante

- actual `95/100`;
- `95 → 98`: F8 cutover exacto;
- `98 → 100`: F9 aceptación postproducción.

## Siguiente gate

`WAIT_FOR_EXPLICIT_F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_AUTHORIZATION`.

La autorización requerida es acotada al IAM temporal necesario para metadata readback + revocación. Provider mutation permanece en cero hasta esa autorización.
