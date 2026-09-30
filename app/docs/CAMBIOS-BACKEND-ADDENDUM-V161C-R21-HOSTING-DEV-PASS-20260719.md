# CAMBIOS BACKEND — V161C R21 HOSTING DEV PASS

Fecha: 2026-07-19
Estado: `HOSTING_DEV_REMOTE_SMOKE_PASS_PENDING_VISUAL`

## Ejecutado

- Autorización única de Paula registrada y consumida.
- Build canónico V161C/R21 reproducido desde `docs-tya-v6-v71-audit`.
- Publicación limitada a Firebase Hosting DEV, sin producción ni escrituras de datos.
- Propagación remota comprobada y smoke ejecutado sobre el mismo build.
- Workflow de deploy desactivado después del PASS.

## Evidencia

- Build: `v161c-r21-source-safe-20260719-dev`.
- Commit desplegado: `8950ef47a8dd0e6f86ad368ffb68b2be638accb6`.
- Run: `29716601804` — `SUCCESS`.
- Artifact: `8450820491`.
- Digest: `sha256:f207df387fe0449fc8382093097cb9c316746b60fdc42d8feaa67abe098dc96f`.
- Decisión: `PASS_R21_HOSTING_DEV_AND_REMOTE_SMOKE`.
- Semántica remota: `PASS_WITH_WARNING_R21_TYA_SOURCE_SEMANTICS`.
- Smoke visual automatizado: `PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE`.

## Resultado

- 14 periodos, 28 pestañas y 616 visitas.
- GT 476; HN 140.
- Julio: 44 visitas; 39 asignadas; 5 sin asignar; 4 disponibles; 1 bloqueada.
- Admin, Cliente y Shopper renderizaron sin blockers ni errores.
- Academia fue comprobada automáticamente para Admin y Shopper.
- 0 identidades shopper inventadas y 0 pagos confirmados o inferidos.
- Advertencia no bloqueante: 209 referencias shopper frente a referencia 216.

## Preservado

- V161C, `CX.data`, backend, contratos, overlays y source-safe.
- V131 continúa como `ACTIVE_BASELINE` de rollback hasta el freeze visual.
- Sin merge, producción, imports, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.

## Clasificación

- Reusable CXOrbia: autorización única, proof de build, propagación y smoke remoto.
- Exclusivo TyA: inventario GT/HN y reglas Cinépolis R21.
- Claude/prototipo: no pedir nueva candidata sin diferencia visual reproducible.
- Academia: Admin/Shopper aprobados automáticamente; Cliente Academia y Operativo en checklist humano.
- Sin impacto Claude: ejecución y evidencia DEV.

## Pendiente

Validación visual de Paula, incluyendo Operativo y Academia Cliente. Si no hay diferencias reproducibles, corresponde `APROBADO` y freeze de V161C. No iniciar Corte 1 antes del freeze.
