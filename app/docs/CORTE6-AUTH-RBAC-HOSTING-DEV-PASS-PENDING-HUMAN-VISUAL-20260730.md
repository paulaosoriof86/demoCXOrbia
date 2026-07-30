# Corte 6 — Auth/RBAC + Firestore Rules + Hosting DEV PASS técnico, pendiente visual humana autenticada

**Fecha:** 2026-07-30  
**Estado:** `CORTE6_AUTH_RBAC_RULES_PASS__HOSTING_DEV_REDEPLOY1OF1_VERIFIED_DIRECT_ENTRYPOINT__WAITING_HUMAN_AUTH_VISUAL__NO_PRODUCTION`

## 1. Baseline preservada
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL DEV permanece cerrado: 1,406/1,406 Firestore data writes + 1,406/1,406 readback, mismatch 0.
- Corte 5 `CX.data`: proyecto padre `cinepolis`, 14 periodos, 616 visitas, `currentPeriodId=2026-07`, source=firestore, fallback=false.
- No se repitió materialización histórica.

## 2. Corte 6 Auth/RBAC — autorización consumida y PASS
Autorización vigente recibida en conversación actual:
`Autorizo Corte 6: máximo 5 claims Auth + deploy exclusivo de Firestore Rules.`

Resultado exacto:
- 5/5 actualizaciones de custom claims sobre cuentas existentes;
- 2 cuentas cliente + 3 cuentas shopper con `shopperId`/perfil Firestore exacto;
- scope de proyecto stale `tya`/`tya-piloto` normalizado a `projectId='cinepolis'` y `projectIds=['cinepolis']`;
- restantes claims preservados;
- usuarios nuevos: 0;
- cambios de contraseña: 0;
- deletes: 0;
- cuarto shopper sin vínculo exacto: NO TOCADO.

Readback Auth/RBAC:
- Auth users: 17;
- password activos: 17;
- operadores ready: 7;
- clientes ready: 2;
- shoppers ready: 3;
- familias de rol requeridas con al menos un principal válido: PASS.

Evidencia:
- `evidence/CORTE6-AUTH-CLAIMS-NORMALIZATION-LATEST.json`;
- `evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json` + `.md`.

## 3. Firestore Rules — PASS verificado
El intento inicial con Firebase CLI quedó bloqueado por una dependencia del propio CLI: faltaba `firebaserules.rulesets.test`. La cuenta sí tenía permisos para crear ruleset y actualizar/readback de release.

Se usó el API oficial de Firebase Rules, sin ampliar IAM:
- ruleset creado;
- release `cloud.firestore` actualizado;
- readback exacto por SHA-256;
- decisión: `PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED`.

Regla desplegada:
- lectura shopper de visitas disponibles reconoce el campo canónico `status`;
- conserva compatibilidad con `estado` legacy;
- Firestore **data** writes en Corte 6: 0.

Evidencia: `evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`.

## 4. Hosting DEV existente — único redeploy consumido 1/1
Se reutilizó el MISMO Hosting DEV ya autorizado:
- Firebase/Hosting project: `cxorbia-backend-dev`;
- site: `cxorbia-backend-dev`;
- target: `cxorbia-dev`;
- nuevo Firebase: 0;
- nuevo Hosting: 0;
- deploy executions: **1/1**;
- autorización Hosting: **consumida**.

Firebase CLI no pudo completar el deploy porque la cuenta de servicio no tiene permisos API Keys Viewer (`apikeys.keys.*`) que el CLI intenta consultar. El diagnóstico read-only probó al mismo tiempo que los permisos Hosting core sí estaban presentes. No se modificó IAM.

El único redeploy autorizado se ejecutó mediante el API oficial de Firebase Hosting y quedó publicado:
- release: `sites/cxorbia-backend-dev/releases/1785431702100000`;
- releaseTime: `2026-07-30T17:15:02.100Z`;
- version: `sites/cxorbia-backend-dev/versions/b00728c729452665`;
- status: `FINALIZED`;
- files: 2161;
- bytes: 4,592,047.

## 5. Verificación remota
PASS en el entrypoint backend DEV explícito:
- `corte6-hosting-proof.json`: HTTP 200 y prueba Corte 6 válida;
- `core/backend-config.js`: HTTP 200, proyecto `cxorbia-backend-dev`, API key inyectada, `defaultProjectId='cinepolis'`;
- `core/backend-browser-auth.js`: HTTP 200, `signInWithEmailAndPassword` y persistencia SESSION presentes;
- `/index-backend-dev.html`: HTTP 200, título Preview Backend DEV y Auth real cargado.

El root `/` continúa resolviendo `app/index.html`. Esto es **no bloqueante**: Firebase Hosting prioriza contenido estático exacto antes de rewrites. Por tanto el URL canónico de validación DEV es el entrypoint explícito y no se autoriza un segundo deploy solo para cambiar el alias raíz.

URL canónico DEV:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

No incluir credenciales en URL, repo, logs o conversación.

Evidencia:
- `evidence/CORTE6-HOSTING-IAM-DIAGNOSTIC-LATEST.json`;
- `evidence/CORTE6-HOSTING-DEV-DEPLOY-LATEST.json`;
- `backend/config/phase-a-hosting-dev-execution-request-v1.json`.

## 6. Gate vivo único
`HUMAN_AUTHENTICATED_VISUAL_VALIDATION_ADMIN_OPS_CLIENT_SHOPPER`.

Validar con cuentas DEV existentes directamente en el navegador:
1. Admin/Operativo: proyecto `cinepolis`, periodos/histórico y navegación operativa correctos.
2. Cliente: solo proyecto autorizado.
3. Shopper con vínculo exacto: identidad real, historial propio y visitas disponibles autorizadas.
4. Shopper no vinculado: no recibe ampliación de acceso por inferencia.
5. Sin regresión visible en Academia/manuales, postulaciones, visitas, certificaciones, finanzas y navegación.
6. No exponer copy técnico de claims/provider/source-safe en UI normal.

No compartir email/password/token en chat.

## 7. Después del PASS visual
`FREEZE CORTE6 → refresh HR → resolver HOLD Agosto HN por fuente → materializar SOLO delta agosto → preprod/cutover controlado`.

No repetir los 1,406 writes históricos.

## 8. Clasificación
- **Reusable CXOrbia:** Firebase Auth interactivo; claims como autoridad; queries por principal; rules canónicas; fail-closed; diagnóstico CLI vs API oficial; verificación de Hosting por release/version/entrypoint.
- **Exclusivo cliente:** tenant `tya`, proyecto `cinepolis`, scopes stale `tya`/`tya-piloto`, Agosto HN HOLD.
- **Claude/prototipo:** no nueva candidata; solo corrección focal si la validación visual demuestra P0 reproducible.
- **Academia:** autenticación vs selector de rol; tenant/proyecto; `shopperId`; permisos mínimos; exact static content vs rewrite; diagnóstico de integración sin ampliar IAM.
- **Sin impacto Claude:** runners, requests, evidencias source-safe, IDs de release/version y mecánica de deploy.

## 9. Estado seguro
- Auth claim writes autorizados/ejecutados: 5/5 sobre usuarios existentes.
- Firestore data writes Corte 6: 0.
- Firestore Rules: 1 release actualizada y verificada.
- Hosting DEV: 1/1 deploy consumido.
- Storage/HR/legacy writes: 0.
- Usuarios nuevos/password changes/deletes: 0/0/0.
- Pagos/Make/Gemini: 0.
- Merge: false.
- Producción: false.
- PII/secrets crudos en repo/artifacts: 0.
