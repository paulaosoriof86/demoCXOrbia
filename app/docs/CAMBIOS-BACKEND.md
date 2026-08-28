# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-28  
**Estado:** `F8_AUTHORIZED_UNCONSUMED__EXTERNAL_TRANSPORT_OUTAGE__PHASE_A_100__PROD_READINESS_95`

## 2026-08-28 — F8 · autorización explícita recibida, ejecutor preparado y STOP antes de provider mutation

Paula autorizó en la conversación actual una única ejecución F8 sobre `cxorbia-backend-dev` para el mínimo backup/export, restore controlado verificable y únicamente las mutaciones de proveedor estrictamente necesarias para reconciliar el release congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`, con recheck dinámico previo y reconciliación read-only posterior. Quedaron expresamente fuera de alcance rebuild/reimport, legacy DB, Make, Gemini, pagos, nuevas ramas/PR, IAM/credenciales nuevas y payloads de secretos.

La autorización quedó registrada como single-use y **NO CONSUMIDA**, porque ninguna mutación de proveedor llegó a iniciarse.

Se preparó `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` como ejecutor acotado/fail-closed. Exige linaje exacto, release manifest congelado, revision/hash provider exactos, capabilities previas, export a bucket existente, restore en base temporal aislada, verificación de colecciones, limpieza y reconciliación final sin redeploy cuando el release exacto ya opera.

### STOP causal

En la sesión actual no existe un canal autenticado GCP/provider que pueda invocar de forma segura el ejecutor. No existe workflow F8 activo ya autorizado para backup/restore; revivir workflows históricos/consumidos o crear un workflow nuevo como transporte está prohibido por los locks vigentes y fuera de la autorización actual.

Clasificación: `EXTERNAL_TRANSPORT_OUTAGE_NO_SAFE_PROVIDER_EXECUTOR_IN_CURRENT_SESSION`. No es P0 de producto. No se solicitó ni creó IAM, WIF, service account, credencial, rama o PR.

### Estado seguro

PHASE_A=`100/100`; PRODUCTION_REAL_READINESS=`95/100`; release F6 exacto e inmutable; autorización F8=`AUTHORIZED_NOT_YET_CONSUMED`; provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; backup/export attempt=`0`; restore attempt=`0`; cutover attempt=`0`; deploy/rebuild/reimport/merge=`0`.

Evidencia: `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-AUTHORIZATION-LATEST.json` y `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-AUTHORIZATION-AND-TRANSPORT-STOP-LATEST.json`.

### Clasificación obligatoria

- **Reusable CXOrbia:** autorización single-use separada del transporte; executor fail-closed; restore aislado; no consumir autorización antes de primera mutación provider.
- **Exclusivo cliente:** `cxorbia-backend-dev` y release congelado exacto.
- **Claude/prototipo:** sin cambio UI/candidata.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** preparación/control-plane F8.

## Siguiente bloque exacto

`F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.

No volver a F7, no redeployar el release por rutina y no repetir investigación de IAM/Owner. La autorización actual se conserva sin consumir hasta que un canal provider seguro pueda iniciar la ejecución exacta.

## Antecedente inmediato

`F7-P1-003` quedó `CLOSED/PASS` con run `33131739261`: 24/24 GET, concurrencia 4, HTTP 5xx=0, fallos de contrato=0, p95=181.87 ms, una revisión, períodos=15 y visitas=660. El run `33131536618` fue falso negativo del harness, no P0. `F7-P1-004` backup/export + restore verificable era el pendiente actual de F8.
