# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `C6_AUTH_ALL_ROLES_PASS__HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__ROOT_CAUSE_FIXED__FRESH_AUTH_REQUIRED__NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- HR viva observada: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers.
- Agosto 2026 todavía no existe en HR.
- Producción intacta.

## 2. Baseline acumulativa PASS

- HR viva dinámica y read model canónico.
- Staff humano autenticado.
- Shopper humano autenticado con identidad exacta.
- Cliente humano autenticado con alcance exclusivo `cinepolis`.
- Carril técnico Staff/Shopper aislado.
- Dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas.
- Tres recargas y nueva pestaña.
- Credencial Cliente idempotente, readback PASS y rollback exacto probado.

Decisión funcional:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 3. Configuración financiera preservada

Cinépolis:

- modelo delegado por `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso delegado;
- margen solo con fuente exacta.

## 4. Resultado del intento de deploy DEV

La ejecución autorizada comprobó source lock, gate estático y credenciales read-only. El comando de deploy fue iniciado una vez y falló antes de crear una release.

Evidencia:

- `failedStage=deploy_hosting_once`;
- `deployAttempted=true`;
- `deploySucceeded=false`;
- Hosting releases creadas: 0;
- Cloud Run deploys: 0;
- gates remotos: no ejecutados.

La autorización queda consumida. No existe reintento automático.

## 5. Causa raíz reproducible

`FIREBASE_CLI_ALTERNATE_CONFIG_PATH_RESOLUTION`.

El runner guardaba la configuración alternativa únicamente dentro de `.tmp`. Firebase CLI resuelve el basename del archivo indicado por `--config` dentro de la raíz detectada del proyecto. Como `firebase.deploy.json` no existía en la raíz, el comando terminó antes de publicar.

No se demostró fallo de source lock, aplicación, HR, Auth, IAM, Cloud Run o producción.

## 6. Corrección aplicada sin nuevo deploy

- `firebase.json` incorpora de forma canónica el rewrite HR vivo.
- `firebase.deploy.json` existe ahora en la raíz resoluble por Firebase CLI.
- target `cxorbia-dev` y public `app` preservados.
- `/api/tya/cinepolis/hr-live` mantiene el servicio existente `cxorbia-live-hr-dev` en `us-central1`.
- wildcard SPA permanece después del endpoint HR.
- cero cambios de módulos UI/core por este bloque.
- cero writes o deploys posteriores al fix.

Evidencia:

`CORTE6-HOSTING-DEV-DEPLOY-ROOT-CAUSE-FIX-LATEST.json`.

## 7. Siguiente bloque exacto

Requiere autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → CREDENCIALES READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA`.

## 8. Estado seguro

Credencial Cliente vigente: 1. Auth writes autorizados previos: 2. Password changes/resets: 0. Hosting releases nuevas: 0. Cloud Run/Firestore/Rules/Storage/HR/Make/Gemini/pagos: 0. Credenciales/tokens expuestos: 0. Merge=false. Producción=false.
