# Addendum maestro — ejecución directa de empalmes

Fecha: 2026-07-16
Estado: obligatorio

Este documento sustituye cualquier instrucción incompatible para empalmes ordinarios.

Cuando una candidata ya tiene auditoría GO y no existe P0 comprobado, la única secuencia válida es:

1. aplicar el delta auditado en `docs-tya-v6-v71-audit`;
2. preservar backend, contratos, adapters, tools, overlays TyA y documentación;
3. generar manifest, `build-lock.js`, verificador y registro de baseline;
4. actualizar documentación obligatoria;
5. crear el commit de empalme;
6. ejecutar gates y smoke después del empalme, antes de DEV o producción.

Durante ese estado queda prohibido crear otra rama, PR, workflow, transferencia, artefacto Drive, Base64, service account, proyecto Firebase, espera CI, PowerShell para Paula, candidata nueva, metodología nueva o reauditoría general.

Estados permitidos:

- `AUDIT_INCOMPLETE`
- `P0_PROVEN`
- `AUDITED_GO_READY_DIRECT_APPLY`
- `EMPALMED_PENDING_POST_GATES`
- `ACTIVE_BASELINE`

No se puede retroceder desde `AUDITED_GO_READY_DIRECT_APPLY` a planificación o transporte. Un bloqueo real se informa una sola vez con evidencia exacta y no habilita experimentos.

V156 está en `AUDITED_GO_READY_DIRECT_APPLY`. Operación única: `APPLY_DELTA_DIRECTLY`. Delta: 35 archivos runtime modificados y 0 eliminados.

Clasificación: Reusable CXOrbia = máquina de estados; Exclusivo cliente = gates TyA; Claude/prototipo = V156 aprobada; Academia = validación posterior por rol; Sin impacto Claude = lock documental.