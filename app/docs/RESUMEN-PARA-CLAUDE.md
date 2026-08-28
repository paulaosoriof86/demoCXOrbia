# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-28  
**Estado:** `PHASE_A_100__F8_AUTHORIZED_UNCONSUMED__TRANSPORT_STOP__PROD_READINESS_95__NO_UI_REBUILD`

## Estado canónico

- PHASE_A `100/100`.
- PRODUCTION_REAL_READINESS `95/100`.
- F5/F6 terminales; F7 `GO_WITH_WARNINGS`, P0=0.
- `F7-P1-003` bounded load/failure está `CLOSED/PASS`.
- Release congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` intacto.
- F8 backup/restore/cutover tiene autorización explícita single-use vigente, pero **no consumida**.
- No inició provider mutation por ausencia de un canal autenticado GCP/provider utilizable desde la sesión actual.
- Clasificación: `EXTERNAL_TRANSPORT_OUTAGE_NO_SAFE_PROVIDER_EXECUTOR_IN_CURRENT_SESSION`.

## Frontend / prototipo

No tocar `/app/modules` ni `/app/core` desde backend. No nueva candidata ni reauditoría frontend por este bloque. No trasladar backup/restore, IAM o cutover a UI. Claude no decide ni ejecuta la frontera provider.

## F8 preparado

Existe `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs`, acotado y fail-closed, para export, restore temporal aislado, verificación, cleanup y reconciliación del release exacto sin redeploy cuando no existe drift. No usarlo fuera de la autorización registrada ni crear un transportador paralelo.

## Academia

Sin cambio funcional. La profundización P2 continúa no bloqueante.

## Siguiente frontera

`F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
