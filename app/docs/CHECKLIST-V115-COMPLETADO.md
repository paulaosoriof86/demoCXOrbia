# CHECKLIST V115 — MATRIZ POR OLA

## OLA 0 — Integridad y aceptación
- [x] PASS_COMPROBADO — finanzas.js: filtro currentProjectId residual corregido a currentPeriodId.
- [x] PASS_COMPROBADO — academia.js: texto falso señalado no existe en el archivo actual.
- [x] PASS_COMPROBADO — verify-manifest.mjs dinámico (ya hecho en V114, confirmado).
- [x] PASS_COMPROBADO — MANIFEST-V115.json + build-lock.js regenerados.
- [x] PASS_COMPROBADO — documento de estado parcial eliminado.
- [x] PASS_COMPROBADO — sintaxis (equivalente node --check), index.html sin duplicados/huérfanos, smoke 48×3 roles sin error.

## OLA 1 — Estados honestos y contrato de datos
- [x] PASS_ESTRUCTURAL — auditoría de copy: sin afirmaciones falsas nuevas encontradas.
- [ ] NO_ATENDIDO — objeto de contexto único (tenantId/projectId/periodId/countryScope/role/dataMode).
- [ ] PARCIAL — contrato de Fuente unificado con nombres de campo exactos.
- [ ] NO_ATENDIDO — "no fixtures fuera de demo" auditado transversalmente (no revisado en esta ronda).

## OLA 2 — Operación comercializable
- [ ] NO_ATENDIDO — todo el backlog (A–12 del documento 01) queda pendiente para la siguiente candidata.

## OLA 3 — Academia transversal
- [ ] NO_ATENDIDO — CRUD completo, cobertura por módulo, rutas por rol, notificaciones.

## Nota de continuidad
Esta candidata (V115) no se declara "completa comercializable" — solo cierra
el bloqueante de aceptación (OLA 0). El backlog de OLA 1 (resto)/2/3 debe
continuarse en la siguiente candidata incremental, construida sobre V115 sin
retroceder.
