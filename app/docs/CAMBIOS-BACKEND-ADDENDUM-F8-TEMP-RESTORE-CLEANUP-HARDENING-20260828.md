# CAMBIOS BACKEND — ADDENDUM F8 TEMP RESTORE / CLEANUP HARDENING

Fecha: 2026-08-28  
Fase: F8_CUTOVER  
Phase A: 100/100  
Production Real Readiness: 95/100

## Trabajo realizado

Se continuó únicamente F8 desde `F8_AUTHORIZED_EXECUTOR_ENTRYPOINT_ANTI_REPLAY_REPAIRED_TRANSPORT_STOP`. HEAD previo verificado: `7e084182b2be24cb36a811b5269baee22153a909`.

La revisión focalizada del one-shot encontró tres defectos/riesgos pre-ejecución adicionales: la base temporal se nominaba antes de completar el export y el `finally` podía intentar borrar un nombre que esta ejecución nunca creó; el ID temporal solo tenía precisión al minuto y podía colisionar entre workspaces; y un DELETE normal fallido/indeterminado podía caer al `finally` y provocar un segundo DELETE automático.

El commit `183d56ed5cd70683c6dff1506c46e1beebed8281` actualizó `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` a schema de ejecución v4. La base temporal ahora se genera únicamente después de que el backup/export termine, incorpora un sufijo aleatorio no secreto de 4 bytes y solo queda elegible para cleanup cuando la solicitud de creación fue aceptada. Tanto el DELETE normal como el cleanup del `finally` desarman la elegibilidad antes de emitir su única solicitud, evitando reintentos automáticos de DELETE.

Blob remoto: `1d4b01bf3df3ec59ba84194a3b0d77f5c5425630`. El contenido exacto fue reproducido localmente: `git hash-object` coincide con ese blob; SHA-256 local `c6ddc2c25cb6f1242f89d5144b4e136ce1aa7a3c8b98a0ae049a90d165495a37`; `node --check` PASS.

Evidencia: `app/docs/evidence/RC15-F8-TEMP-RESTORE-CLEANUP-HARDENING-LATEST.json`.

## Seguridad y alcance

No hubo llamada provider. Provider writes=0; backup/export=0; restore=0; cutover=0; deploy/rebuild/reimport/merge=0. La autorización `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` continúa `AUTHORIZED_NOT_YET_CONSUMED` y no se amplió. El release F6 no cambió.

No se creó workflow, IAM, credencial, rama, PR, service account ni transporte alternativo.

## Clasificación

Reusable CXOrbia: identidad temporal collision-resistant, cleanup condicionado a creación aceptada y DELETE single-attempt fail-closed.  
Exclusivo TyA: IDs del proyecto/release F8.  
Claude/prototipo: sin cambios de UI, `/app/modules` o `/app/core`.  
Academia: sin cambio funcional.  
Sin impacto Claude: sí.

## Pendiente real

Persiste un único bloqueo externo: esta sesión no dispone de un canal GCP/provider autenticado permitido para entregar autenticación efímera al entrypoint existente. No corresponde sustituirlo con mecanismos nuevos o históricos.

**Siguiente bloque exacto:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
