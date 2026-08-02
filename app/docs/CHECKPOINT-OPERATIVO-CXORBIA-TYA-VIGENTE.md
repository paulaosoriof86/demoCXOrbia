# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `C6_DEV_HOSTING_RELEASED__REMOTE_PARITY_HR_STAFF_CLIENT_PASS__SHOPPER_NEW_TAB_P0_FIXED_IN_SOURCE_NOT_DEPLOYED__FRESH_DEPLOY_AUTH_REQUIRED__NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- HR viva observada: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers.
- Agosto 2026 todavía no existe en HR.
- Producción intacta.

## 2. Baseline acumulativa preservada

- HR viva dinámica y read model canónico.
- Staff humano autenticado.
- Shopper humano autenticado con identidad exacta en baseline previa.
- Cliente humano autenticado con alcance exclusivo `cinepolis`.
- Dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas en baseline local/read-only.
- Credencial Cliente idempotente, readback PASS y rollback exacto.

## 3. Release Hosting DEV publicada

El request `c6-hosting-dev-deploy-remote-gates-20260802-04` ejecutó un único deploy exitoso:

- `firebase.deploy.json` raíz usada;
- 2,293 archivos publicados;
- release Hosting finalizada;
- URL DEV: `https://cxorbia-backend-dev.web.app`;
- Cloud Run y demás provider writes: 0.

Las continuaciones posteriores no desplegaron otra release.

## 4. Gates remotos comprobados

PASS:

- paridad exacta de 16 assets críticos;
- endpoint HR remoto;
- 14 periodos, 616 visitas y 208 shoppers;
- Staff remoto;
- Cliente remoto.

Pendiente:

- Shopper en nueva pestaña con overlay protegido aplicado;
- cierre semántico de Finanzas/portales/Reservas después del P0 Shopper.

## 5. P0 reproducible

Dos ejecuciones reprodujeron:

`SHOPPER NEW TAB → AUTH RESTORED → BASE HR READY → PROTECTED AUTHORITY NOT APPLIED`.

Se observaron rol/namespace/tenant/proyecto correctos, app activa y 14/616/208 visibles, pero:

- `authorityApplied=false`;
- autoridad protegida con 0 periodos/0 visitas/0 shoppers;
- `ownVisits=0`.

Causa raíz:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

## 6. Root fix listo en fuente

`app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` incorpora ahora:

- reintento HR vivo acotado;
- reconciliación de arranque de sesión restaurada;
- disparadores Auth/backend/DOM/foco/visibilidad/refresh;
- guardas de Firestore y dependencias canónicas;
- idempotencia;
- cero writes.

Evidencia:

`CORTE6-SHOPPER-NEW-TAB-AUTHORITY-ROOT-FIX-LATEST.json`.

El fix no ha sido desplegado. No se afirma PASS remoto.

## 7. Configuración financiera preservada

Cinépolis:

- delegado por `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso delegado;
- margen solo con fuente exacta.

## 8. Siguiente bloque exacto

Requiere autorización fresca:

`SOURCE LOCK NUEVO → STATIC CUMULATIVE + NEW-TAB ROOT-FIX GATE → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF → SHOPPER 3 RELOADS + NEW TAB + OWN VISITS → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA`.

## 9. Estado seguro

Hosting releases acumuladas en la autorización ejecutada: 1. Hosting deploys posteriores al root fix: 0. Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0. Password changes/resets: 0. Credenciales/tokens expuestos: 0. Merge=false. Producción=false.
