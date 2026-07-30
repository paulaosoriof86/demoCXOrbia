# CAMBIOS-BACKEND.md

> Registro principal de cambios backend. Para detalle vigente consultar el índice y los addenda fechados.

## Estado vigente 2026-07-30

Estado: `CORTE6_AUTH_RBAC_RULES_PASS__HOSTING_DEV_REDEPLOY1OF1_VERIFIED_DIRECT_ENTRYPOINT__WAITING_HUMAN_AUTH_VISUAL__NO_PRODUCTION`.

Fuentes principales:
- `CORTE6-AUTH-RBAC-HOSTING-DEV-PASS-PENDING-HUMAN-VISUAL-20260730.md`;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `evidence/CORTE6-AUTH-CLAIMS-NORMALIZATION-LATEST.json`;
- `evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json`;
- `evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`;
- `evidence/CORTE6-HOSTING-IAM-DIAGNOSTIC-LATEST.json`;
- `evidence/CORTE6-HOSTING-DEV-DEPLOY-LATEST.json`.

### Corte 6 ejecutado
- Auth custom claims: 5/5 updates autorizados sobre usuarios existentes (2 cliente +3 shopper exactos).
- Usuario nuevo/password/delete: 0/0/0.
- Post-readback: operador ready7, cliente ready2, shopper ready3.
- Firestore data writes Corte6: 0.
- Firestore Rules desplegada y verificada por API oficial; Firebase CLI había quedado bloqueado solo por `firebaserules.rulesets.test`.
- Hosting DEV existente: 1/1 deploy consumido, sin crear Firebase/Hosting nuevo.
- Firebase CLI Hosting quedó bloqueado por API Keys Viewer; Hosting core IAM sí estaba disponible. Se ejecutó el mismo one-shot por API oficial Hosting, sin ampliar IAM.
- Release `sites/cxorbia-backend-dev/releases/1785431702100000` / version `sites/cxorbia-backend-dev/versions/b00728c729452665` FINALIZED.
- Remote proof, backend config, Firebase browser Auth y `/index-backend-dev.html`: PASS.
- Root `/` sigue resolviendo `app/index.html` por precedencia de contenido estático exacto; no bloquea y no justifica redeploy.

### URL DEV canónico
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

No compartir credenciales/tokens por conversación.

### Gate siguiente
`HUMAN_AUTHENTICATED_VISUAL_VALIDATION_ADMIN_OPS_CLIENT_SHOPPER`.

Si PASS: `FREEZE CORTE6 → refresh HR → resolver HOLD Agosto HN → materializar SOLO delta agosto → preprod/cutover`.

### Estado seguro
Histórico R17N 1,406 data writes cerrado. Corte6: Auth claim writes5; Firestore data writes0; Rules release1 verificada; Hosting deploy1/1; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false; PII/secrets crudos0.

Los registros históricos completos previos permanecen en Git y addenda; no reabrir ni repetir materialización.
