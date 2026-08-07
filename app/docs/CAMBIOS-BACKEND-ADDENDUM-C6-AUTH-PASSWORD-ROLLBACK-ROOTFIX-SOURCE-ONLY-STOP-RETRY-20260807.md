# CAMBIOS BACKEND — ADDENDUM C6 AUTH PASSWORD ROLLBACK ROOT FIX SOURCE-ONLY

**Fecha:** 2026-08-07  
**Resultado:** `STOP_RETRY_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_TARGET_PRIOR_PASSWORD_NOT_PROVEN`

## Archivos creados/tocados

- `tools/qa/cxorbia-c6-auth-password-rollback-rootfix-source-only.mjs`: gate hermético source-only; valida lineage, SHA256/1 saltless, AES-GCM y suficiencia de reversibilidad target-específica.
- `.github/workflows/cxorbia-c6-auth-password-rollback-rootfix-source-only.yml`: workflow one-shot temporal; ejecutado y eliminado en `8adb6837efc18af6ab7564d75e222e0d66d2a5b7`.
- `backend/config/c6-auth-password-rollback-rootfix-source-only-request-v1.json`: primer request, consumido tras error de referencia sin provider.
- `backend/config/c6-auth-password-rollback-rootfix-source-only-request-v2.json`: request terminal, consumido STOP_RETRY.
- `app/docs/evidence/C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.json`: evidencia terminal sanitizada.
- `app/docs/SOURCE-LOCK-C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.md`: source lock vigente.
- índice/checkpoint/PR #7: actualizar al cierre del bloque.

## Resultado técnico

Se confirmó que el bundle legacy usa `SHA256`, `rounds=1` y no define `passwordSalt` por usuario. Un salt vacío puede ser válido para ese lineage. Sin embargo, las fuentes source-only no demuestran que el estado password actual del target `ac93d90d9e41512acdcd` corresponda a un hash legacy exacto recuperable. No se modificó `backend/contracts/c6-auth-activation-dev-v1.json`.

## Seguridad

Provider/Auth/Firestore/HR reads=0; provider/Auth/Firestore/HR writes=0; Rules/Storage/Hosting/Cloud Run/Cloud Build/Make/Gemini/pagos=0; merge=false; production=false.

## Clasificación

- Reusable CXOrbia: sí, patrón de reversibilidad exacta y salt nullable.
- Exclusivo cliente: fingerprint/lineage TyA.
- Claude/prototipo: sin cambios.
- Academia: evidencia de fail-close.
- Sin impacto Claude: sí.
