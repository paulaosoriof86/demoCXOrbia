# ADDENDUM MAESTRO — C6 baseline canónica única y carril de cutover

**Fecha:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__ROOT_CAUSE_FIXED__FRESH_AUTH_REQUIRED__NO_PRODUCTION`

## 1. Propósito

Este addendum impide que CXOrbia/TyA vuelva a fragmentarse por módulo, etapa, fuente, carril de login o conversación. Solo puede existir una baseline acumulativa construida sobre el HEAD vivo de `docs-tya-v6-v71-audit`.

## 2. Baseline acumulativa comprobada

PASS local/read-only:

- frontend aprobado vigente;
- entrada humana única `authenticated-human-canonical`;
- Firebase Auth/claims para Staff, Cliente y Shopper;
- HR viva como autoridad operacional dinámica;
- Firestore protegido como overlay exacto;
- read model y máquina de estados canónicos;
- Dashboard, fases, detalle, histórico y comparativo;
- Portal Shopper con identidad exacta;
- Portal Cliente con principal y alcance exactos;
- Finanzas y Reservas canónicas;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- materialización, idempotencia, readback y rollback Cliente.

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
- margen solo con comisión/distribución exactas.

## 5. Credencial Cliente materializada

Existe una única credencial Cliente DEV con:

- `role=cliente`;
- `authNamespace=staff`;
- `tenantId=tya`;
- alcance exclusivo `cinepolis`.

La creación y claims consumieron 2 Auth writes autorizados. La segunda aplicación fue idempotente con 0 writes. Password changes/resets y secretos expuestos: 0.

## 6. Resultado del intento de deploy DEV

El predeploy pasó source lock, gate estático y credenciales read-only.

El comando del deploy autorizado fue iniciado una vez y terminó antes de crear una release:

- `deployAttempted=true`;
- `deploySucceeded=false`;
- Hosting releases nuevas: 0;
- Cloud Run deploys: 0;
- gates remotos: no ejecutados.

La autorización anterior queda consumida. No existe reintento automático.

## 7. Causa raíz y corrección de Hosting

Causa reproducible:

`FIREBASE_CLI_ALTERNATE_CONFIG_PATH_RESOLUTION`.

El runner escribía la configuración alternativa únicamente dentro de `.tmp`. Firebase CLI resuelve el basename indicado por `--config` dentro de la raíz del proyecto. Como `firebase.deploy.json` no existía allí, el comando terminó antes de publicar.

Corrección aplicada sin otro deploy:

- `firebase.json` conserva el rewrite HR vivo canónico;
- `firebase.deploy.json` existe en la raíz;
- target `cxorbia-dev`;
- public `app`;
- `/api/tya/cinepolis/hr-live` apunta al servicio existente `cxorbia-live-hr-dev` en `us-central1`;
- el wildcard SPA permanece después del endpoint dinámico;
- no se despliega Cloud Run;
- no se modificaron módulos UI/core por este fix.

## 8. Operaciones prohibidas

Queda prohibido:

- crear otra plataforma, candidata, rama, PR, Firebase o Hosting;
- reintentar el deploy sin autorización fresca;
- ejecutar más de un deploy por autorización;
- omitir el rewrite HR vivo;
- desplegar Cloud Run junto con Hosting;
- permitir `pickShopperDev()` en ruta protegida;
- mover Auth a módulos UI;
- deduplicar por nombre/correo/teléfono;
- aplicar regalías globales;
- abrir agosto/postulaciones, merge o producción sin gates específicos.

## 9. Gate restante de Corte 6

Solo con autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → CREDENCIALES READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → AUTH STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

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
- `CORTE6-CLIENT-AUTH-MATERIALIZATION-LATEST.json`;
- `CORTE6-HOSTING-DEV-DEPLOY-REMOTE-GATES-FAILURE-LATEST.json`;
- `CORTE6-HOSTING-DEV-DEPLOY-ROOT-CAUSE-FIX-LATEST.json`;
- índice, checkpoint, Phase A, resumen Claude, pendientes, Academia y PR #7.

## 12. Clasificación

- **Reusable CXOrbia:** baseline acumulativa, source lock, configuración Hosting raíz y distinción intento/release/paridad.
- **Exclusivo TyA:** tenant `tya`, proyecto `cinepolis`, endpoint HR y site DEV actuales.
- **Claude/prototipo:** sin cambios frontend por el incidente Hosting.
- **Academia:** intento de comando no equivale a release ni aprobación.
- **Sin impacto proveedor después del fix:** cero nuevo deploy y cero writes.

## 13. Estado seguro

Credencial Cliente vigente: 1. Auth writes autorizados previos: 2. Password changes/resets: 0. Hosting releases nuevas: 0. Cloud Run/Firestore/Rules/Storage/HR/Make/Gemini/pagos: 0. Nuevos proyectos/sites: 0. Merge=false. Producción=false.
