# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__SECOND_HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__EXECUTION_PATH_FIXED__FRESH_AUTH_REQUIRED__NO_PRODUCTION`

## 1. Objetivo y arquitectura

TyA/Cinépolis es el primer tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev` es DEV canónico y `tya-plataforma` el Hosting final.

La baseline funcional es única y acumulativa sobre `docs-tya-v6-v71-audit`. No crear plataforma, candidata, rama, PR, Firebase o Hosting alternos.

## 2. Secuencia obligatoria

`FUENTE VIVA → IDENTIDAD → READ MODEL → GATE SEMÁNTICO → SOURCE LOCK → AUTORIZACIÓN → WRITE/DEPLOY EXACTO → READBACK/PARIDAD → GATE REMOTO → VALIDACIÓN HUMANA → CUTOVER`.

Debe distinguirse siempre:

- autorización concedida;
- comando de deploy intentado;
- release Hosting creada;
- paridad remota;
- aprobación humana.

Ninguno sustituye al siguiente.

## 3. Baseline acumulativa PASS

- HR viva: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers en la fotografía observada.
- Agosto ausente.
- Staff, Cliente y Shopper autenticados.
- Cliente con alcance exclusivo `cinepolis`.
- Tres recargas y nueva pestaña.
- Dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas.
- Credencial Cliente idempotente, readback PASS y rollback exacto.

Decisión funcional:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 4. Ownership canónico

1. HR viva: operación e historia.
2. Firestore protegido: identidad/perfil/certificación por crosswalk exacto.
3. Finanzas/pagos: liquidaciones, movimientos y pagos confirmados.
4. ProjectConfig: países, monedas, honorarios, modelo, comisión y regalías.
5. Auth/RBAC: acceso y alcance.
6. Platform-origin: delta reconciliado.

## 5. Modelo financiero

Cinépolis:

- delegado desde `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso delegado;
- margen únicamente con fuentes exactas.

## 6. Segundo intento autorizado de Hosting DEV

El request `c6-hosting-dev-deploy-remote-gates-20260802-03` pasó:

- source lock exacto;
- árbol `app` sin deriva;
- gate estático;
- credenciales Staff/Shopper/Cliente read-only;
- destino DEV correcto.

El comando fue iniciado una vez y falló en `deploy_hosting_once` antes de crear una release:

- deploy attempted: true;
- deploy succeeded: false;
- Hosting releases nuevas: 0;
- gates remotos: 0;
- Cloud Run deploys: 0.

La autorización quedó consumida. Se respetó la prohibición de un segundo deploy automático.

## 7. Causa raíz metodológica comprobada

Clasificación:

`RUNNER_AUTHORIZED_ROOT_CONFIG_NOT_APPLIED`.

La autorización exigía `firebase.deploy.json` en la raíz, pero el workflow todavía:

1. generaba una copia dentro de `.tmp/c6-hosting-dev-deploy`;
2. invocaba Firebase CLI con `--config $OUT/firebase.deploy.json`.

El fix documentado existía en el repositorio, pero no estaba conectado al paso ejecutable. El stderr exacto del CLI no fue persistido por ese runner; por tanto no se atribuye el fallo a IAM, proveedor, aplicación, HR, Auth o Cloud Run sin evidencia.

## 8. Correctivo aplicado sin deploy

Se corrigió el workflow existente, sin crear otro:

- valida `rootResolvedConfigRequired=true`;
- exige `deployConfigPath=firebase.deploy.json`;
- exige `noAutomaticSecondDeploy=true`;
- valida el archivo raíz, target, public y rewrites;
- ejecutará `--config firebase.deploy.json`;
- registrará la versión de Firebase CLI;
- persistirá tails sanitizados de `firebase-deploy.log` y `firebase-debug.log` ante fallo.

La modificación del workflow no dispara deploy porque el trigger permanece limitado al archivo de request.

## 9. Gate restante de Corte 6

Requiere autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → ROOT CONFIG firebase.deploy.json → CREDENCIALES READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA`.

Ante cualquier fallo:

- no segundo deploy automático;
- evidencia durable con error sanitizado;
- diagnóstico de raíz;
- autorización fresca para cualquier intento posterior.

## 10. Freeze, agosto y producción

Solo después del PASS remoto y aprobación visual humana:

1. `APROBADO C6 → FREEZE`;
2. Paula agrega agosto a HR;
3. reconciliación agosto;
4. disponibles y postulaciones;
5. gate multirol;
6. autorización de cutover.

No merge ni producción antes de esos gates.

## 11. Claude/prototipo

Pendientes frontend:

- `app/modules/proyecto-wizard.js`: opción Regional;
- `app/modules/finanzas.js`: copy delegado y fuente exacta.

No mover Auth, Finanzas o configuración Hosting a módulos UI.

## 12. Academia

Enseñar la diferencia entre fix documentado y fix conectado al carril ejecutable, además de intento de comando, release creada, paridad remota y aprobación humana.

## 13. Estado seguro

Credencial Cliente vigente: 1. Auth writes autorizados previos: 2. Password changes/resets: 0. Hosting releases nuevas: 0. Cloud Run/Firestore/Rules/Storage/HR/Make/Gemini/pagos: 0. Merge=false. Producción=false.
