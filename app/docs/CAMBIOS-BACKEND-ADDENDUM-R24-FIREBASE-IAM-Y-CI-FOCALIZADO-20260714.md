# CAMBIOS BACKEND — R24 FIREBASE IAM Y CI FOCALIZADO

Fecha: 2026-07-14

## Resultado R24

- Workflow GitHub: success.
- Proveedor: `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`.
- Target: `cxorbia-tya-dev-260714-r24`.
- Proyecto creado: no.
- Firebase agregado: no.
- Base existente reutilizada: no.
- Writes/import/deploy/producción: no.

## Diagnóstico de GitHub

El retraso no provenía de un bloqueo general de GitHub. PR #7 es un PR acumulado muy grande y los filtros `pull_request.paths` se evalúan contra el conjunto completo de archivos cambiados del PR, por lo que un commit puntual puede volver a disparar numerosos workflows históricos.

También existía un falso rojo: el validador del checkpoint seguía hardcodeado en R18A mientras el contrato ya había avanzado a R24.

## Correcciones aplicadas

- Rama focalizada `phase-a/r24-firebase-dev-20260714`.
- Workflow R24 con filtros, `concurrency` y cancelación de runs anteriores.
- Bloqueo de proveedor separado de fallo GitHub.
- Checkpoint y contrato actualizados a R24.
- Validador convertido a dinámico por bloque, sin hardcode R18A.
- Rama viva de integración creada: `phase-a/integration-live-20260714`.

## Regla operativa siguiente

PR #7 queda como integración histórica. Las iteraciones se ejecutan en ramas focalizadas y se integran en un solo fast-forward después de una decisión. No se usa PR #7 como rama de prueba continua.

## Única acción externa indispensable

Conceder permiso de creación de proyectos a una identidad dedicada o crear una vez el proyecto vacío `cxorbia-tya-dev-260714-r24`, sin Analytics, billing, Auth, Firestore, Storage, Hosting, apps ni datos.

## Clasificación

- Reusable CXOrbia: CI focalizado y clasificación GitHub/proveedor.
- Exclusivo TyA: target DEV y configuración del primer tenant.
- Claude/prototipo: sin impacto; V111 sigue focalizada.
- Academia: explicar gates de infraestructura y diferencia entre fallo CI y bloqueo proveedor.
- Sin impacto Claude: IAM, workflow R24 y validador checkpoint.
