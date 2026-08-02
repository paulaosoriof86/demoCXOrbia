# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `C6_AUTH_ALL_ROLES_PASS__SECOND_HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__EXECUTION_PATH_FIXED__FRESH_AUTH_REQUIRED__NO_PRODUCTION`

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

## 4. Segundo intento autorizado de deploy DEV

El request `c6-hosting-dev-deploy-remote-gates-20260802-03` comprobó source lock, gate estático, credenciales read-only y destino DEV. El comando fue iniciado una vez y falló antes de crear una release.

Evidencia:

- `failedStage=deploy_hosting_once`;
- `deployAttempted=true`;
- `deploySucceeded=false`;
- Hosting releases creadas: 0;
- Cloud Run deploys: 0;
- gates remotos: no ejecutados.

La autorización quedó consumida. Se respetó `noAutomaticSecondDeploy=true`.

## 5. Causa raíz metodológica comprobada

`RUNNER_AUTHORIZED_ROOT_CONFIG_NOT_APPLIED`.

La autorización exigía la configuración raíz `firebase.deploy.json`, pero el workflow aún generaba una copia en `.tmp` y ejecutaba `--config $OUT/firebase.deploy.json`. El fix documentado no estaba conectado al paso ejecutable.

El runner no persistió el stderr exacto del CLI. No se demostró fallo de source lock, aplicación, HR, Auth, IAM, Cloud Run o producción.

## 6. Corrección aplicada sin nuevo deploy

El workflow existente ahora:

- exige la configuración raíz autorizada;
- valida target `cxorbia-dev`, public `app` y orden de rewrites;
- ejecutará `--config firebase.deploy.json`;
- valida la prohibición de segundo deploy automático;
- registra versión de Firebase CLI;
- preserva tails sanitizados de logs ante fallo.

No se creó otro workflow. No se ejecutó un nuevo deploy después del correctivo.

Evidencia:

`CORTE6-HOSTING-DEV-DEPLOY-ROOT-CAUSE-FIX-LATEST.json`.

## 7. Siguiente bloque exacto

Requiere autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → ROOT CONFIG firebase.deploy.json → CREDENCIALES READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA`.

## 8. Estado seguro

Credencial Cliente vigente: 1. Auth writes autorizados previos: 2. Password changes/resets: 0. Hosting releases nuevas: 0. Cloud Run/Firestore/Rules/Storage/HR/Make/Gemini/pagos: 0. Credenciales/tokens expuestos: 0. Merge=false. Producción=false.
