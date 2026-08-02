# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_DEV_HOSTING_RELEASED__REMOTE_PARITY_HR_STAFF_CLIENT_PASS__SHOPPER_NEW_TAB_AUTHORITY_ROOT_FIX_READY_NOT_DEPLOYED__FRESH_DEPLOY_AUTH_REQUIRED__NO_PRODUCTION`

## 1. Repositorio y destinos

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama viva `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Servicio HR vivo `cxorbia-live-hr-dev`, región `us-central1`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes obligatorias vigentes

1. reglas maestras y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-DEPLOY-DEV-EXITOSO-Y-P0-SHOPPER-NUEVA-PESTANA-20260802.md`;
7. evidencia `CORTE6-HOSTING-DEV-DEPLOY-REMOTE-GATES-FAILURE-LATEST.json`;
8. evidencia `CORTE6-HOSTING-DEV-REMOTE-GATES-CONTINUATION-FAILURE-LATEST.json`;
9. evidencia `CORTE6-SHOPPER-NEW-TAB-AUTHORITY-ROOT-FIX-LATEST.json`;
10. `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`;
11. `tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`;
12. `firebase.json`, `firebase.deploy.json`, `.firebaserc`;
13. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## 3. Baseline funcional preservada

PASS acumulativo previo y remoto parcial:

- HR viva dinámica: 14 periodos, junio 2025–julio 2026;
- 616 visitas y 208 shoppers en la fotografía observada;
- Auth humana Staff, Shopper y Cliente;
- Cliente con alcance exclusivo `cinepolis`;
- dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas en baseline local/read-only;
- credencial Cliente idempotente, readback y rollback exacto;
- una release Hosting DEV publicada desde la configuración raíz autorizada;
- paridad remota exacta de 16 assets críticos;
- endpoint HR remoto PASS;
- Staff remoto PASS;
- Cliente remoto PASS.

Agosto 2026 no existe en HR y no puede aparecer por reloj o copia de julio.

## 4. Modelo financiero prevalente

Cinépolis continúa configurado como proyecto delegado:

- Q60 GT / L200 HN al shopper;
- facturación local: no;
- regalías: 0;
- comisión de coordinación y reparto configurables;
- honorario Shopper nunca usado como ingreso delegado;
- margen solo con comisión y distribución exactas.

## 5. Deploy DEV ejecutado

Request:

`c6-hosting-dev-deploy-remote-gates-20260802-04`.

Resultado:

- configuración raíz `firebase.deploy.json`: usada;
- 2,293 archivos publicados;
- release Hosting finalizada: sí;
- Hosting deploys: 1;
- Cloud Run deploys: 0;
- demás provider writes: 0;
- producción: intacta.

El fallo inmediatamente posterior fue del runner QA inline bajo Node 24, no del deploy. Las continuaciones posteriores fueron estrictamente read-only y no desplegaron otra release.

## 6. P0 vigente reproducible

El gate Shopper falló dos veces en nueva pestaña:

- principal Shopper restaurado correctamente;
- 14 periodos, 616 visitas y 208 shoppers visibles;
- aplicación y carril canónico activos;
- autoridad protegida no aplicada;
- overlay exacto sin componer;
- visitas propias: 0.

Clasificación:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

## 7. Root fix en fuente, todavía no desplegado

`tya-protected-auth-hr-authority-bridge-v2.js` ahora incorpora:

- reintento HR vivo acotado y fail-closed;
- reconciliación de arranque para sesión restaurada;
- eventos Auth/backend, DOM, foco, visibilidad y refresh;
- guardas de principal, Firestore y dependencias canónicas;
- idempotencia de conciliación/timer;
- cero writes.

Gate estático dedicado:

`tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`.

No se afirma PASS remoto del fix porque todavía no fue desplegado.

## 8. Gate vivo restante

Requiere autorización fresca:

`SOURCE LOCK NUEVO → STATIC CUMULATIVE + NEW-TAB ROOT-FIX GATE → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF → SHOPPER 3 RELOADS + NEW TAB + OWN VISITS → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA`.

Hasta entonces:

- no otro deploy;
- no freeze;
- no agosto ni postulaciones;
- no merge;
- no producción.

## 9. Estado seguro

Hosting releases acumuladas en la autorización ejecutada: 1. Hosting deploys posteriores al root fix: 0. Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0. Credenciales/tokens expuestos: 0. Merge=false. Producción=false.
