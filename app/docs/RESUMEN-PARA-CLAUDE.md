# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__SECOND_HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__EXECUTION_PATH_FIXED__FRESH_AUTH_REQUIRED`

## 1. Baseline única

Continuar únicamente sobre el HEAD vivo de `docs-tya-v6-v71-audit`. No crear una versión paralela, shell reducido, nueva rama o nuevo PR.

La HR viva observada contiene 14 periodos desde junio 2025 hasta julio 2026, 616 visitas y 208 shoppers. Agosto todavía no existe. Estos conteos son una fotografía y no un contrato permanente.

## 2. Contrato acumulativo comprobado

PASS:

- entrada humana canónica;
- acceso validado para Staff, Cliente y Shopper;
- HR viva dinámica;
- identidad y certificación por vínculo exacto;
- dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- materialización Cliente idempotente, readback y rollback exacto.

Decisión funcional:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 3. Segundo intento autorizado de deploy

El request `c6-hosting-dev-deploy-remote-gates-20260802-03` pasó source lock, gate estático, acceso read-only y destino DEV.

El comando fue iniciado una vez y falló antes de crear una release:

- deploy attempted: 1;
- deploy succeeded: 0;
- Hosting releases: 0;
- gates remotos: no ejecutados.

La autorización quedó consumida y no hubo segundo deploy automático.

## 4. Causa raíz metodológica comprobada

`RUNNER_AUTHORIZED_ROOT_CONFIG_NOT_APPLIED`.

La autorización exigía `firebase.deploy.json` en la raíz. El workflow todavía generaba una copia bajo `.tmp/c6-hosting-dev-deploy` y ejecutaba el comando con esa ruta temporal.

El fix documentado no estaba conectado al paso ejecutable. El runner tampoco preservó el error exacto del CLI, por lo que no se atribuye el fallo a IAM, proveedor, aplicación, HR, Auth, Finanzas o UI sin evidencia.

## 5. Correctivo protegido

El workflow existente ahora:

- valida la configuración raíz autorizada;
- exige `deployConfigPath=firebase.deploy.json`;
- exige `noAutomaticSecondDeploy=true`;
- valida target, public y orden de rewrites;
- ejecutará `--config firebase.deploy.json`;
- registra la versión de Firebase CLI;
- persiste logs sanitizados ante cualquier fallo.

No se creó otro workflow ni se ejecutó otro deploy.

## 6. Regresiones que no se pueden repetir

- entrada humana sin autenticación real;
- Shopper protegido usando selección DEV directa;
- autenticación Cliente sin completar la entrada a la app;
- KPI y fases divergentes;
- histórico incompleto;
- regalías globales;
- clasificación por nombre;
- honorario Shopper usado como ingreso delegado;
- fix documentado pero no conectado al runner;
- deploy que no use la configuración raíz autorizada;
- deploy que omita el rewrite HR vivo.

## 7. Modelo financiero por proyecto

Cinépolis:

- delegado desde `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca es ingreso delegado;
- margen solo con comisión y distribución exactas.

## 8. Ajustes frontend exactos para Claude

### `app/modules/proyecto-wizard.js`

- conservar directo/delegado;
- agregar `Regional`;
- mostrar regalías solo para directo.

### `app/modules/finanzas.js`

- corregir el texto delegado;
- describir comisión de coordinación y distribución configurable;
- mostrar revisión cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada;
- no usar selección Shopper DEV en rutas protegidas;
- no mover autenticación a módulos UI.

## 9. Gate pendiente

Requiere autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → ROOT CONFIG firebase.deploy.json → ACCESO READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → STAFF/CLIENTE/SHOPPER → HR/DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → VALIDACIÓN HUMANA → FREEZE`.

No nueva candidata, rama, PR, Firebase, Hosting, merge ni producción.
