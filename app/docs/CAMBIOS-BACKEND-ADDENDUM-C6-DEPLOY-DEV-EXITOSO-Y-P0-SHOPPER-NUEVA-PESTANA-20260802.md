# CAMBIOS BACKEND — C6 DEPLOY DEV EXITOSO Y P0 SHOPPER EN NUEVA PESTAÑA

**Fecha:** 2026-08-02  
**Estado:** `DEV_HOSTING_RELEASED__REMOTE_PARITY_PASS__SHOPPER_NEW_TAB_AUTHORITY_ROOT_FIX_READY_NOT_DEPLOYED`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Deploy DEV autorizado

El request `c6-hosting-dev-deploy-remote-gates-20260802-04` ejecutó correctamente un único deploy del Hosting DEV existente:

- proyecto/site: `cxorbia-backend-dev`;
- target: `cxorbia-dev`;
- configuración usada: `firebase.deploy.json` en la raíz;
- archivos publicados: 2,293;
- release Hosting finalizada y publicada: sí;
- URL: `https://cxorbia-backend-dev.web.app`;
- Cloud Run deploys: 0;
- Firestore/Auth/HR/Rules/Storage/Make/Gemini/pagos/merge/producción: 0.

La publicación ocurrió una sola vez. No se ejecutó otro deploy en las continuaciones read-only.

## 2. Primer fallo posterior al deploy

El deploy quedó exitoso, pero el primer gate remoto se detuvo antes de comprobar paridad por una ambigüedad sintáctica del script inline bajo Node 24 (`ERR_AMBIGUOUS_MODULE_SYNTAX`).

No fue un fallo de Hosting, IAM, aplicación, HR o Auth. Se sustituyó el inline por `tools/qa/tya-c6-remote-parity-gate.mjs`, sin redeploy.

## 3. Paridad remota comprobada

La continuación read-only demostró:

- los 16 assets críticos del runtime remoto coinciden exactamente por SHA-256 con el source lock desplegado;
- endpoint HR remoto: PASS;
- 14 periodos, 616 visitas y 208 shoppers preservados;
- Staff remoto: PASS;
- Cliente remoto: PASS;
- tres recargas: PASS en los escenarios completados.

## 4. P0 reproducible detectado

El gate Shopper falló dos veces en el mismo escenario:

`SHOPPER NEW TAB → AUTH RESTORED → BASE HR READY → PROTECTED AUTHORITY NOT APPLIED`.

Estado observado:

- rol `shopper` y namespace `shopper` correctos;
- tenant `tya` y proyecto `cinepolis` correctos;
- 14 periodos, 616 visitas y 208 shoppers visibles;
- app activa y carril `authenticated-human-canonical`;
- `CX_PROTECTED_AUTH_HR_AUTHORITY.applied=false`;
- overlay protegido: 0 periodos/0 visitas/0 shoppers;
- visitas propias: 0.

Esto prueba que la nueva pestaña restauraba el principal y la HR base, pero no garantizaba la composición de identidad exacta protegida.

## 5. Causa raíz

Clasificación:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

El bridge dependía de una conciliación puntual por `backend-ready` o refresh. No existía un reconciliador de arranque independiente para una sesión ya restaurada en una pestaña nueva. Además, su lectura HR no tenía reintento acotado para fallos transitorios 429/5xx/red.

No se atribuye este P0 a módulos UI, credenciales, HR histórica o pérdida de datos.

## 6. Root fix aplicado en fuente

Se actualizó `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`:

- reintento fail-closed de HR viva: 6 intentos acotados;
- scheduler de reconciliación de arranque: hasta 180 verificaciones acotadas;
- disparadores:
  - `backend-auth-ready`;
  - `backend-ready`;
  - DOM/script ready;
  - foco de ventana;
  - retorno de visibilidad;
  - refresh backend;
- guardas:
  - principal autenticado con tenant/proyecto;
  - estado Firestore protegido listo;
  - aplicador HR listo;
  - composer canónico listo;
  - una conciliación y un timer como máximo;
- metadata durable de recuperación de sesión restaurada;
- cero provider writes.

Se creó el gate estático:

`tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`.

## 7. Estado de ejecución del fix

El root fix está en la rama viva, pero no se ha desplegado. Por tanto:

- no se afirma PASS remoto de nueva pestaña Shopper;
- no se afirma PASS semántico de Finanzas/portales/Reservas posterior;
- se requiere autorización fresca para un único deploy DEV del nuevo runtime;
- no existe autorización de redeploy automático.

## 8. Archivos creados o modificados

- `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`.
- `tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`.
- `tools/qa/tya-c6-remote-parity-gate.mjs`.
- `tools/qa/tya-c6-remote-finance-model-diagnostic.mjs`.
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials-v6.mjs`.
- `.github/workflows/cxorbia-c6-live-domain-readonly-audit.yml`.
- `app/docs/evidence/CORTE6-SHOPPER-NEW-TAB-AUTHORITY-ROOT-FIX-LATEST.json`.
- documentación maestra, Claude, pendientes, Academia y PR #7.

## 9. Clasificación

- **Reusable CXOrbia:** recuperación de autoridad protegida tras restaurar sesión en reload/nueva pestaña.
- **Exclusivo TyA:** tenant `tya`, proyecto `cinepolis`, endpoint HR y Hosting DEV actuales.
- **Claude/prototipo:** no modificar módulos UI; preservar la entrada autenticada y el overlay exacto.
- **Academia:** una sesión restaurada y una pantalla con datos base no prueban que el overlay protegido haya sido aplicado.
- **Sin impacto proveedor después del fix:** cero deploy y cero writes.

## 10. Siguiente bloque exacto

Con autorización fresca:

`SOURCE LOCK NUEVO → GATE ESTÁTICO ACUMULATIVO + GATE NEW-TAB → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF → SHOPPER 3 RELOADS + NEW TAB + OWN VISITS → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA`.

## 11. Estado seguro

Hosting releases acumuladas en esta autorización: 1. Hosting deploys posteriores al root fix: 0. Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0. Credenciales/tokens expuestos: 0. Merge=false. Producción=false.
