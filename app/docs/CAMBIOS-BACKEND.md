# CAMBIOS-BACKEND.md

> Registro principal de cambios backend. Para detalle vigente consultar el índice y los addenda fechados.

## Estado vigente 2026-07-30

Estado: `P0_PROVEN_C6_CREDENTIAL_CONTINUITY_GAP__AUTH_RULES_HOSTING_TECH_PASS__NO_PRODUCTION`.

Fuentes principales:
- `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`;
- `evidence/CORTE6-AUTH-CLAIMS-NORMALIZATION-LATEST.json`;
- `evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`;
- `evidence/CORTE6-HOSTING-DEV-DEPLOY-LATEST.json`.

### Corte 6 técnico cerrado
- Auth custom claims: 5/5 updates autorizados sobre usuarios existentes (2 cliente +3 shopper exactos).
- Usuario nuevo/password/delete: 0/0/0.
- Post-readback: operador ready7, cliente ready2, shopper ready3.
- Firestore data writes Corte6: 0.
- Firestore Rules desplegada y verificada por API oficial.
- Hosting DEV existente: 1/1 deploy consumido, sin crear Firebase/Hosting nuevo.
- Release `sites/cxorbia-backend-dev/releases/1785431702100000` / version `sites/cxorbia-backend-dev/versions/b00728c729452665` FINALIZED.
- Remote proof/config/browser Auth/entrypoint explícito: PASS.

### Hallazgo nuevo — continuidad de credenciales
Se comprobó que el nuevo formulario `Correo + Contraseña` del entrypoint DEV es un mecanismo técnico de Firebase Auth y no puede tomarse como contrato final del producto.

Inventario read-only agregado en `cxorbia-backend-dev`:
- `tenants/tya/shoppers`: 340 docs; `user/username/login`=0; `pass/password`=0;
- `tenants/tya/users`: 0 docs;
- tenant profile: 0 claves de login;
- Firebase Auth: 17 users, todos password provider y todos con identificador email.

Conclusión: la fuente legacy de credenciales no fue materializada en el backend canónico. No crear cuenta Gmail nueva ni pedir a Paula credenciales DEV ficticias.

### Archivos creados/tocados en este bloque
- `tools/qa/cxorbia-corte6-credential-continuity-readonly.mjs`: inventario source-safe de presencia de campos de credenciales; no exporta valores.
- `backend/config/corte6-credential-continuity-readonly-request.json`: request read-only consumido.
- `.github/workflows/cxorbia-corte6-credential-continuity-readonly.yml`: ejecución read-only con evidencia sanitizada.
- `app/docs/evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`: evidencia de conteos/presencia sin PII/credenciales.
- `app/docs/CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`: decisión de raíz y contrato de migración.
- índice/checkpoint/Claude/PENDIENTES/tracker/Academia/PR: reconciliación del source lock.

### Decisión de raíz
- Firebase Auth/claims se preserva.
- Login visible objetivo: `Usuario + Contraseña`, no correo obligatorio.
- Adapter interno resuelve identidad Firebase.
- Fuente legacy de credenciales solo por export/import controlado; nunca runtime contra la base vieja.
- Credenciales/hashes fuera de repo, logs, artifacts y conversación.

### Gate siguiente
`EXPORT CREDENCIALES LEGACY CONTROLADO → INVENTARIO/HASH-TYPE → PLAN AUTH IMPORT IDEMPOTENTE → AUTORIZACIÓN ÚNICA PROVIDER → IMPORT/READBACK → LOGIN USUARIO+CONTRASEÑA → SMOKE → FREEZE CORTE6 → AGOSTO`.

### Estado seguro
Histórico R17N 1,406 data writes cerrado. Corte6: Auth claim writes5 ya autorizados; usuarios nuevos0; password changes0; Firestore data writes0; Rules release1; Hosting deploy1/1; inventario adicional provider writes0; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false; credenciales crudas0.

Los registros históricos completos previos permanecen en Git y addenda; no reabrir ni repetir materialización.
