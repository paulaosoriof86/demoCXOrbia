# CAMBIOS BACKEND — C6 SEGUNDO INTENTO DE DEPLOY DEV Y FIX EJECUTABLE

**Fecha:** 2026-08-02  
**Estado:** `DEPLOY_COMMAND_FAILED_BEFORE_RELEASE__RUNNER_ROOT_CONFIG_NOT_APPLIED__FIXED_WITHOUT_REDEPLOY`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Autorización ejecutada

Paula autorizó un nuevo y único intento de Hosting DEV en:

- proyecto `cxorbia-backend-dev`;
- target `cxorbia-dev`;
- configuración raíz `firebase.deploy.json`;
- source lock del HEAD vivo;
- cero Firestore/Auth/HR/Rules/Storage/Cloud Run/Make/Gemini/pagos/merge/producción;
- sin segundo deploy automático ante fallo.

Request ejecutado: `c6-hosting-dev-deploy-remote-gates-20260802-03`.

## 2. Resultado real

El runner comprobó antes del deploy:

- source lock exacto;
- árbol `app` sin deriva;
- gate estático acumulativo;
- acceso Staff, Shopper y Cliente en modo read-only;
- destino DEV correcto.

El comando de deploy fue iniciado una vez y falló en `deploy_hosting_once` antes de producir una release.

Resultado:

- `deployAttempted=true`;
- `deploySucceeded=false`;
- Hosting releases nuevas: 0;
- Cloud Run deploys: 0;
- gates remotos: no ejecutados;
- producción: intacta.

La autorización quedó consumida. No se ejecutó un segundo intento.

## 3. Causa raíz metodológica comprobada

La autorización exigía usar `firebase.deploy.json` en la raíz. Sin embargo, el workflow todavía:

1. generaba `.tmp/c6-hosting-dev-deploy/firebase.deploy.json`;
2. ejecutaba Firebase CLI con `--config $OUT/firebase.deploy.json`.

El fix previamente documentado existía en el repositorio, pero no estaba conectado al paso ejecutable. El segundo intento repitió el mismo carril defectuoso.

Clasificación:

`RUNNER_AUTHORIZED_ROOT_CONFIG_NOT_APPLIED`.

El runner anterior no preservó el stderr exacto del CLI. Por ello no se atribuye el fallo a IAM, proveedor, aplicación, HR, Auth o Cloud Run sin prueba.

## 4. Correctivo aplicado sin deploy

Se modificó únicamente el workflow existente `.github/workflows/cxorbia-c6-live-domain-readonly-audit.yml`:

- ahora valida `authorization.rootResolvedConfigRequired=true`;
- exige `deployConfigPath=firebase.deploy.json`;
- exige `noAutomaticSecondDeploy=true`;
- valida que el archivo raíz exista;
- valida target `cxorbia-dev`, public `app` y site `cxorbia-backend-dev`;
- valida el rewrite HR vivo antes del wildcard SPA;
- ejecutará exactamente `--config firebase.deploy.json`;
- registrará la versión de Firebase CLI;
- persistirá un tail sanitizado de `firebase-deploy.log` y `firebase-debug.log` ante cualquier fallo.

No se creó un workflow nuevo. La modificación del workflow no dispara deploy porque el trigger sigue limitado al archivo de request.

## 5. Archivos creados o modificados

- `.github/workflows/cxorbia-c6-live-domain-readonly-audit.yml`.
- `app/docs/evidence/CORTE6-HOSTING-DEV-DEPLOY-ROOT-CAUSE-FIX-LATEST.json`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-SEGUNDO-INTENTO-DEPLOY-DEV-Y-FIX-EJECUTABLE-20260802.md`.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
- `app/docs/ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`.
- `app/docs/RESUMEN-PARA-CLAUDE.md`.
- `app/docs/PENDIENTES-PROTOTIPO.md`.
- `app/docs/ACADEMIA-IMPACTO-C6-RECUPERACION-RUNTIME-ACUMULATIVO-20260801.md`.
- PR #7.

## 6. Baseline preservada

Continúa vigente:

- `PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`;
- HR viva: 14 periodos, 616 visitas y 208 shoppers en la fotografía observada;
- Staff/Cliente/Shopper autenticados;
- Cliente con alcance exclusivo `cinepolis`;
- tres recargas y nueva pestaña;
- dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas;
- Cinépolis delegado, Q60 GT/L200 HN y regalías 0;
- agosto ausente.

## 7. Siguiente bloque exacto

Requiere autorización fresca porque la anterior quedó consumida:

`SOURCE LOCK ACTUAL → STATIC GATE → ROOT CONFIG firebase.deploy.json → ACCESO READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA`.

Ante cualquier fallo no existe segundo deploy automático.

## 8. Clasificación

- **Reusable CXOrbia:** validación de ruta autorizada y evidencia exacta de errores sanitizados.
- **Exclusivo TyA:** destino `cxorbia-backend-dev`, target `cxorbia-dev` y proyecto `cinepolis`.
- **Claude/prototipo:** sin cambios en módulos UI/core.
- **Academia:** diferencia entre fix documentado y fix conectado al carril ejecutable.
- **Sin impacto proveedor:** el correctivo posterior al fallo no ejecutó deploy ni writes.

## 9. Estado seguro

Hosting releases nuevas 0; Cloud Run 0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes 0; password changes/resets 0; credenciales/tokens expuestos 0; merge=false; producción=false.
