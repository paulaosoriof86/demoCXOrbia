# CAMBIOS-BACKEND.md

## 2026-07-30 — Corte 6 Auth/RBAC + Rules + Hosting DEV: PASS técnico, pendiente visual humana autenticada

Estado: `CORTE6_AUTH_RBAC_RULES_PASS__HOSTING_DEV_REDEPLOY1OF1_VERIFIED_DIRECT_ENTRYPOINT__WAITING_HUMAN_AUTH_VISUAL__NO_PRODUCTION`.

### Resultado proveedor
- Auth custom claims: **5/5** updates autorizados sobre cuentas existentes: 2 cliente +3 shopper con vínculo exacto.
- Scope stale `tya`/`tya-piloto` normalizado a `cinepolis`; demás claims preservados.
- Cuarto shopper sin vínculo exacto: no tocado.
- Usuarios nuevos/password changes/deletes: 0/0/0.
- Readback: operador ready7, cliente ready2, shopper ready3; familias requeridas PASS.
- Firestore **data** writes en Corte6: 0.

### Firestore Rules
- Regla canónica `status='disponible'` + compatibilidad `estado` legacy desplegada.
- Firebase CLI falló por la dependencia `firebaserules.rulesets.test`; permisos efectivos de Rules create/release sí estaban presentes.
- Se usó API oficial Firebase Rules sin ampliar IAM.
- Ruleset/release/readback SHA exacto: PASS.

### Hosting DEV existente
- Mismo Firebase/Hosting `cxorbia-backend-dev`, target `cxorbia-dev`; nuevo Firebase/Hosting: 0/0.
- El único redeploy previamente autorizado fue consumido: **1/1**.
- Firebase CLI Hosting quedó bloqueado por API Keys Viewer (`apikeys.keys.*`), no por Hosting core IAM.
- Sin modificar IAM, el mismo one-shot se ejecutó por API oficial Firebase Hosting.
- Release: `sites/cxorbia-backend-dev/releases/1785431702100000`.
- Version: `sites/cxorbia-backend-dev/versions/b00728c729452665`, FINALIZED.
- Remote proof/config/browser Auth/entrypoint explícito: PASS.
- Root `/` sirve `app/index.html` por precedencia de contenido estático exacto antes de rewrite. Es no bloqueante; no se autoriza segundo deploy.

URL DEV canónico:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

### Archivos principales creados/tocados
- `app/core/backend-browser-auth.js`;
- `app/index-backend-dev.html`;
- `app/core/backend-config-preview-dev.js`;
- `app/core/backend-firebase.js`;
- `firestore.rules`;
- `tools/release/cxorbia-corte6-auth-claims-normalize.mjs`;
- `tools/release/cxorbia-corte6-firestore-rules-deploy.mjs`;
- `tools/release/cxorbia-existing-hosting-dev-corte6-prepare.mjs`;
- `tools/release/cxorbia-existing-hosting-dev-direct-deploy.mjs`;
- `tools/qa/cxorbia-auth-rbac-readonly-reconcile.mjs`;
- `tools/qa/cxorbia-corte6-rules-iam-diagnostic.mjs`;
- `tools/qa/cxorbia-corte6-hosting-iam-diagnostic.mjs`;
- requests/workflows/evidencias source-safe de Corte6;
- índice/checkpoint/Claude/PENDIENTES/tracker/Academia/PR #7.

### Claude/prototipo
No nueva candidata. No se tocó `app/modules/*` desde backend. Solo abrir tarea focalizada si la visual autenticada demuestra P0 reproducible. P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

### Academia
Registrar Auth real vs selector local, scopes tenant/proyecto, `shopperId` exacto, mínimo privilegio, Rules/Hosting CLI vs API oficial y precedencia exact-static vs rewrite.

### Siguiente bloque exacto
`VISUAL AUTENTICADA ADMIN/OPS/CLIENTE/SHOPPER → si PASS, FREEZE CORTE6 → REFRESH/RESOLVER AGOSTO → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.

### Clasificación
- **Reusable CXOrbia:** browser Auth, principal-scoped reads, claims fail-closed, Rules canónicas, deploy/diagnóstico API oficial.
- **Exclusivo cliente:** tenant `tya`, proyecto `cinepolis`, scopes stale y Agosto HN HOLD.
- **Claude/prototipo:** sin nueva candidata; observar smoke.
- **Academia:** Auth/RBAC, mínimo privilegio y gates de proveedor.
- **Sin impacto Claude:** runners, requests, IDs release/version y evidencia source-safe.

### Estado seguro
R17N histórico: 1,406 data writes cerrado. Corte6: Auth claim writes5; Firestore data writes0; Rules release1 verificada; Hosting DEV1/1; usuarios nuevos/password/deletes0; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false; PII/secrets crudos0.

---

## Histórico protegido
Los bloques previos permanecen en Git y en `app/docs/`. No reabrir Corte 3, no repetir R17N y no crear nueva candidata/base/Hosting/rama/PR por rutina.
