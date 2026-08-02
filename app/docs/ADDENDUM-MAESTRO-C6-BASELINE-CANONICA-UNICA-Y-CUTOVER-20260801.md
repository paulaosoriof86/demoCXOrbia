# ADDENDUM MAESTRO — C6 baseline canónica única y carril de cutover

**Fecha:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__SECOND_HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__EXECUTION_PATH_FIXED__FRESH_AUTH_REQUIRED__NO_PRODUCTION`

## 1. Propósito

Este addendum impide que CXOrbia/TyA vuelva a fragmentarse por módulo, etapa, fuente, carril de acceso o conversación. Solo puede existir una baseline acumulativa construida sobre el HEAD vivo de `docs-tya-v6-v71-audit`.

## 2. Baseline acumulativa comprobada

PASS:

- frontend aprobado vigente;
- entrada humana única;
- acceso validado para Staff, Cliente y Shopper;
- HR viva como autoridad operacional dinámica;
- Firestore protegido como overlay exacto;
- read model y máquina de estados canónicos;
- Dashboard, fases, detalle, histórico y comparativo;
- Portal Shopper con identidad exacta;
- Portal Cliente con alcance exclusivo;
- Finanzas y Reservas canónicas;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- materialización Cliente idempotente, readback y rollback exacto.

Decisión funcional:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

Corte 6 aún no está congelado porque falta un deploy DEV exitoso, gate remoto idéntico y validación humana.

## 3. Fuente viva observada

- 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- 208 shoppers;
- agosto 2026 ausente.

Julio observado:

- 44 total;
- 43 realizadas;
- 41 cuestionarios;
- 37 submitidas;
- 1 fuera de rango;
- GT 34 / HN 10.

Son valores de la revisión viva, no invariantes permanentes.

## 4. Modelo financiero por proyecto

Cinépolis:

- modelo delegado desde `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso;
- margen solo con comisión y distribución exactas.

## 5. Segundo intento autorizado de Hosting DEV

El request `c6-hosting-dev-deploy-remote-gates-20260802-03` comprobó source lock, gate estático, acceso read-only y destino DEV.

El comando fue iniciado una vez y terminó antes de crear una release:

- `deployAttempted=true`;
- `deploySucceeded=false`;
- Hosting releases nuevas: 0;
- Cloud Run deploys: 0;
- gates remotos: no ejecutados.

La autorización quedó consumida. Se respetó la prohibición de un segundo deploy automático.

## 6. Causa raíz metodológica comprobada

`RUNNER_AUTHORIZED_ROOT_CONFIG_NOT_APPLIED`.

La autorización exigía `firebase.deploy.json` en la raíz. El workflow todavía generaba una copia dentro de `.tmp/c6-hosting-dev-deploy` y ejecutaba Firebase CLI con esa ruta temporal.

El fix documentado existía, pero no estaba conectado al paso ejecutable. El runner tampoco preservó el error exacto del CLI. No se atribuye el fallo a IAM, proveedor, aplicación, HR, Auth, Cloud Run o producción sin evidencia.

## 7. Correctivo aplicado sin otro deploy

Se actualizó el workflow existente:

- valida `rootResolvedConfigRequired=true`;
- exige `deployConfigPath=firebase.deploy.json`;
- exige `noAutomaticSecondDeploy=true`;
- valida el archivo raíz, target, public y orden de rewrites;
- ejecutará `--config firebase.deploy.json`;
- registra la versión de Firebase CLI;
- persiste tails sanitizados de logs ante fallo.

No se creó otro workflow y no se ejecutó otro deploy.

## 8. Operaciones prohibidas

Queda prohibido:

- crear otra plataforma, candidata, rama, PR, Firebase o Hosting;
- reintentar el deploy sin autorización fresca;
- ejecutar más de un deploy por autorización;
- usar una configuración distinta de la raíz autorizada;
- omitir el rewrite HR vivo;
- desplegar Cloud Run junto con Hosting;
- permitir selección Shopper DEV en ruta protegida;
- mover autenticación a módulos UI;
- deduplicar por nombre/correo/teléfono;
- aplicar regalías globales;
- abrir agosto/postulaciones, merge o producción sin gates específicos.

## 9. Gate restante de Corte 6

Solo con autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → ROOT CONFIG firebase.deploy.json → ACCESO READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

Ante cualquier fallo no existe segundo deploy automático.

## 10. Agosto y postulaciones

Después del freeze:

1. Paula agrega agosto a HR;
2. el runtime lo detecta;
3. se reconcilia platform-origin;
4. se habilitan disponibles y postulaciones;
5. gate multirol;
6. write plan y autorización;
7. readback y cutover.

## 11. Documentación prevalente

- `CAMBIOS-BACKEND-ADDENDUM-C6-CREDENCIAL-CLIENTE-MATERIALIZADA-20260802.md`;
- `CAMBIOS-BACKEND-ADDENDUM-C6-DEPLOY-DEV-INTENTO-FALLIDO-Y-CAUSA-RAIZ-20260802.md`;
- `CAMBIOS-BACKEND-ADDENDUM-C6-SEGUNDO-INTENTO-DEPLOY-DEV-Y-FIX-EJECUTABLE-20260802.md`;
- `CORTE6-CLIENT-AUTH-MATERIALIZATION-LATEST.json`;
- `CORTE6-HOSTING-DEV-DEPLOY-REMOTE-GATES-FAILURE-LATEST.json`;
- `CORTE6-HOSTING-DEV-DEPLOY-ROOT-CAUSE-FIX-LATEST.json`;
- índice, checkpoint, Phase A, resumen Claude, pendientes, Academia y PR #7.

## 12. Clasificación

- **Reusable CXOrbia:** baseline acumulativa, source lock, configuración raíz y evidencia exacta de errores.
- **Exclusivo TyA:** tenant `tya`, proyecto `cinepolis`, endpoint HR y site DEV actuales.
- **Claude/prototipo:** sin cambios frontend por el incidente Hosting.
- **Academia:** fix documentado no equivale a fix conectado al runner.
- **Sin impacto proveedor después del fix:** cero nuevo deploy y cero writes.

## 13. Estado seguro

Credencial Cliente vigente: 1. Auth writes autorizados previos: 2. Password changes/resets: 0. Hosting releases nuevas: 0. Cloud Run/Firestore/Rules/Storage/HR/Make/Gemini/pagos: 0. Nuevos proyectos/sites: 0. Merge=false. Producción=false.
