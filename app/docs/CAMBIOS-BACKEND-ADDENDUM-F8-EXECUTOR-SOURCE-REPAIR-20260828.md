# CAMBIOS-BACKEND — Addendum F8 executor source repair

Fecha: 2026-08-28
Fase: `F8_CUTOVER`
Rama: `docs-tya-v6-v71-audit`

## Qué se hizo

Se retomó el estado canónico `F8_AUTHORIZED_BACKUP_RESTORE_CUTOVER_TRANSPORT_STOP` sin reabrir F7, IAM, usuarios ni auditorías generales.

Durante la lectura directa del ejecutor preparado `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` se demostraron dos defectos de mecanismo previos a ejecución:

1. el ejecutor exigía `auth.authorizedExecutionParentHead`, campo que no existe en la evidencia canónica de autorización, por lo que una ejecución futura válida habría fallado antes de cualquier mutación con `F8_EXECUTION_COMMIT_LINEAGE_MISMATCH`;
2. el ejecutor marcaba `authorizationConsumed=true` durante los rechecks previos a mutación, antes del primer provider write, lo que podía consumir incorrectamente la autorización single-use ante un fallo pre-mutation.

Se corrigió únicamente el ejecutor backend/tool en commit `e95d23a91f26f42e1adf3ac167ccd2f0093dd31a`:

- se fija el blob exacto de la evidencia de autorización `1f6659a4cdf421a38489c94b174f28ceb5506f54`;
- se fija el blob exacto del manifest congelado `732dbfd48912b3550c6fb20bc592bd118647263a`;
- el commit de autorización se resuelve desde la historia Git y debe ser ancestro del HEAD de ejecución;
- se conserva el gate de `GITHUB_SHA` contra HEAD;
- la autorización solo pasa a consumida al entrar en `BACKUP_EXPORT`, inmediatamente antes de la primera mutación provider;
- la validación sintáctica del archivo reparado pasó.

Evidencia: `app/docs/evidence/RC15-F8-EXECUTOR-SOURCE-REPAIR-LATEST.json`.

## Seguridad y autorización

Esta reparación no ejecutó Google Cloud, Firestore export/import, creación/borrado de base temporal, deploy, rebuild, reimport, Auth, HR, Storage, Rules, pagos, Make ni Gemini.

- provider writes: `0`
- deploys: `0`
- backup/export: `0`
- restore: `0`
- cutover: `0`
- autorización F8 consumida: `false`

La autorización `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` sigue vigente bajo su alcance original; no se amplió ni se creó otra autorización.

## Impacto Phase A / producción

- Phase A permanece `100/100`.
- Production Real Readiness permanece `95/100`.
- El release congelado se preserva sin cambios.
- Se eliminó un defecto source-only que habría bloqueado el ejecutor cuando aparezca un canal provider autenticado.
- El bloqueo externo de transporte sigue vigente: esta reparación no crea ni autoriza un canal GCP.

## Clasificación obligatoria

- **Reusable CXOrbia:** consumo single-use ligado al inicio real de provider mutation; lineage gate basado en evidencia immutable + ancestry, no en un campo inexistente o HEAD estático.
- **Exclusivo cliente:** IDs de proyecto/release/autorización TyA usados por F8.
- **Claude/prototipo:** sin cambios de frontend, UX, `/app/modules` ni `/app/core`.
- **Academia:** sin cambio funcional ni contenido requerido por este repair.
- **Sin impacto Claude:** sí; reparación de mecanismo backend/tool y evidencia.

## Pendiente real y siguiente bloque

Permanece exclusivamente el carril seguro provider autenticado. No se autoriza inventar workflow, credencial, IAM, rama, PR ni revivir mecanismos históricos.

`F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`
