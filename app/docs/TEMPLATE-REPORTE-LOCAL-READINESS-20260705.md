# Template reporte local readiness - CXOrbia TyA

Fecha: PENDIENTE
Repo local: PENDIENTE
Rama local: PENDIENTE
Commit local: PENDIENTE

## 1. Seguridad previa

- Produccion: bloqueada
- Deploy: bloqueado
- Merge: bloqueado
- Import real: bloqueado
- Escrituras reales: bloqueadas
- Proveedores reales: bloqueados

## 2. Consistency check

Comando:

`node tools/migration/tya-local-readiness-consistency-check.mjs`

Resultado:

- Ejecutado: SI/NO
- Exit code: PENDIENTE
- Estado: PENDIENTE
- Issues: PENDIENTE
- Warnings: PENDIENTE
- Decision: continuar / detener / revisar

## 3. Preflight

Comando:

`node tools/migration/tya-local-readiness-preflight.mjs`

Resultado:

- Ejecutado: SI/NO
- Exit code: PENDIENTE
- Estado: PENDIENTE
- Branch detectada: PENDIENTE
- Faltantes: PENDIENTE
- Decision: continuar / detener / revisar

## 4. Runbook preview

Comando:

`node tools/migration/tya-phase-a-local-readiness-runbook.mjs`

Resultado:

- Ejecutado: SI/NO
- Exit code: PENDIENTE
- Estado: PENDIENTE
- Carpeta de salida: PENDIENTE
- Indice generado: PENDIENTE
- Decision: continuar / detener / revisar

## 5. Salidas esperadas

- 00 index: SI/NO
- 01 runner: SI/NO
- 02 readiness map: SI/NO
- 03 snapshot input: SI/NO
- 04 snapshot report: SI/NO
- 05 sanitized report: SI/NO
- 05b sanitized summary: SI/NO
- 06 matrix: SI/NO
- 06b matrix json: SI/NO

## 6. Redaccion segura

Pegar solo resumen seguro. No pegar credenciales, payloads, bancos, HR cruda ni diagnosticos sin revisar.

## 7. Decision final local

Seleccionar una:

- `local_review_required`
- `local_preview_ready`
- `local_blocked_missing_files`
- `local_blocked_unexpected_branch`
- `local_blocked_contract_issue`
- `local_blocked_sensitive_output`

Justificacion:

PENDIENTE

## 8. Siguiente accion

PENDIENTE
