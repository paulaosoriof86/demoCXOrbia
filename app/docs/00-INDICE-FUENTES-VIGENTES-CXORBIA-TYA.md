# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__SECOND_HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__EXECUTION_PATH_FIXED__FRESH_AUTH_REQUIRED__NO_PRODUCTION`

## 1. Repositorio y destinos

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama viva `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Servicio HR vivo existente `cxorbia-live-hr-dev`, región `us-central1`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes obligatorias vigentes

1. reglas maestras y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-CREDENCIAL-CLIENTE-MATERIALIZADA-20260802.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-DEPLOY-DEV-INTENTO-FALLIDO-Y-CAUSA-RAIZ-20260802.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-SEGUNDO-INTENTO-DEPLOY-DEV-Y-FIX-EJECUTABLE-20260802.md`;
9. evidencia `CORTE6-CLIENT-AUTH-MATERIALIZATION-LATEST.json`;
10. evidencia `CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`;
11. evidencia `CORTE6-HOSTING-DEV-DEPLOY-REMOTE-GATES-FAILURE-LATEST.json`;
12. evidencia `CORTE6-HOSTING-DEV-DEPLOY-ROOT-CAUSE-FIX-LATEST.json`;
13. `.github/workflows/cxorbia-c6-live-domain-readonly-audit.yml`;
14. `firebase.json`, `firebase.deploy.json`, `.firebaserc`;
15. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## 3. Baseline funcional preservada

PASS acumulativo:

- HR viva dinámica;
- 14 periodos desde junio 2025 hasta julio 2026;
- 616 visitas;
- 208 shoppers;
- Auth humana Staff, Shopper y Cliente;
- Auth técnica Staff/Shopper aislada;
- Cliente con alcance exclusivo `cinepolis`;
- tres recargas y nueva pestaña;
- dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas;
- idempotencia, readback y rollback exacto de la credencial Cliente.

Decisión funcional:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

Agosto 2026 todavía no existe en HR y no puede aparecer por reloj o copia de julio.

## 4. Modelo financiero prevalente

Cinépolis continúa configurado como proyecto delegado:

- Q60 GT / L200 HN al shopper;
- facturación local: no;
- regalías: 0;
- comisión de coordinación y reparto configurables;
- honorario Shopper nunca usado como ingreso delegado;
- margen solo con comisión y distribución exactas.

## 5. Segundo intento autorizado de Hosting DEV

El request `c6-hosting-dev-deploy-remote-gates-20260802-03` pasó source lock, gate estático, credenciales read-only y destino DEV. El comando fue iniciado una vez y falló antes de crear una release:

- etapa: `deploy_hosting_once`;
- comando intentado: 1;
- deploy exitoso: 0;
- releases Hosting creadas: 0;
- gates remotos ejecutados: 0;
- Cloud Run deploys: 0.

Decisión:

`FAIL_C6_PREDEPLOY_OR_HOSTING_DEPLOY`.

La autorización quedó consumida. Se respetó la prohibición de un segundo deploy automático.

## 6. Causa raíz metodológica comprobada

`RUNNER_AUTHORIZED_ROOT_CONFIG_NOT_APPLIED`.

La autorización exigía `firebase.deploy.json` en la raíz, pero el workflow todavía generaba una copia en `.tmp/c6-hosting-dev-deploy` y ejecutaba `--config $OUT/firebase.deploy.json`. El fix documentado no estaba conectado al paso ejecutable.

El runner anterior no persistió el stderr exacto del CLI. Por tanto, no se atribuye el fallo a IAM, proveedor, aplicación, HR, Auth o Cloud Run sin evidencia.

## 7. Correctivo aplicado sin deploy

El workflow existente ahora:

- valida la configuración raíz autorizada;
- exige `deployConfigPath=firebase.deploy.json`;
- exige `noAutomaticSecondDeploy=true`;
- valida target, public y orden de rewrites;
- ejecutará `--config firebase.deploy.json`;
- registrará la versión de Firebase CLI;
- persistirá tails sanitizados de los logs ante cualquier fallo.

No se creó workflow nuevo y no se ejecutó otro deploy.

## 8. Gate vivo restante

Requiere autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → ROOT CONFIG firebase.deploy.json → CREDENCIALES READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA`.

Hasta entonces:

- no otro deploy;
- no agosto ni postulaciones;
- no merge;
- no producción.

## 9. Estado seguro

Credencial Cliente vigente: 1. Auth writes autorizados previos: 2. Password changes/resets: 0. Hosting releases nuevas: 0. Cloud Run/Firestore/Rules/Storage/HR/Make/Gemini/pagos: 0. Credenciales/tokens expuestos: 0. Merge false. Producción false.
