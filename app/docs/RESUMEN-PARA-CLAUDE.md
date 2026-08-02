# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_DEV_HOSTING_RELEASED__REMOTE_PARITY_HR_STAFF_CLIENT_PASS__SHOPPER_NEW_TAB_ROOT_FIX_PENDING_DEPLOY`

## 1. Baseline única

Continuar únicamente sobre el HEAD vivo de `docs-tya-v6-v71-audit`. No crear versión paralela, shell reducido, nueva rama, PR, Firebase, Hosting o workflow.

La HR viva observada contiene 14 periodos desde junio 2025 hasta julio 2026, 616 visitas y 208 shoppers. Agosto todavía no existe. Son conteos observados, no invariantes permanentes.

## 2. Release DEV y gates alcanzados

El request `c6-hosting-dev-deploy-remote-gates-20260802-04` publicó correctamente una release en `cxorbia-backend-dev` usando `firebase.deploy.json` raíz.

PASS remoto demostrado:

- paridad exacta de 16 assets críticos;
- endpoint HR vivo;
- Staff;
- Cliente;
- 14 periodos, 616 visitas y 208 shoppers.

No hubo Cloud Run, Firestore, Auth, HR, Rules, Storage, Make, Gemini, pagos, merge ni producción.

## 3. P0 Shopper nueva pestaña

Dos ejecuciones reprodujeron:

- principal Shopper restaurado;
- tenant `tya` y proyecto `cinepolis` correctos;
- app y HR base listas;
- autoridad protegida no aplicada;
- visitas propias 0.

Causa:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

No confundir datos HR visibles con overlay protegido aplicado.

## 4. Root fix backend protegido

`app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` ahora:

- reintenta HR viva de forma acotada ante 429/5xx/red;
- reconcilia sesiones restauradas en reload/nueva pestaña;
- escucha Auth/backend/DOM/foco/visibilidad/refresh;
- espera principal, Firestore y dependencias canónicas;
- mantiene una conciliación y un timer;
- permanece fail-closed y read-only.

Gate:

`tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`.

El fix está en fuente, no desplegado. No afirmar PASS remoto hasta el siguiente deploy autorizado.

## 5. Regresiones que no se pueden repetir

- entrada sin autenticación real;
- Shopper protegido usando selección DEV directa;
- sesión restaurada con HR base pero sin overlay exacto;
- nueva pestaña con `ownVisits=0` por autoridad no aplicada;
- KPI y fases divergentes;
- histórico incompleto;
- regalías globales;
- clasificación por nombre;
- honorario Shopper usado como ingreso delegado;
- lógica Auth/reconciliación dentro de módulos UI.

## 6. Modelo financiero por proyecto

Cinépolis:

- delegado desde `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca es ingreso delegado;
- margen solo con comisión y distribución exactas.

El gate semántico remoto final quedó después del P0 Shopper; no presentar Finanzas remotas como cerradas todavía.

## 7. Ajustes frontend exactos para Claude

### `app/modules/proyecto-wizard.js`

- conservar directo/delegado;
- agregar `Regional`;
- mostrar regalías solo para directo.

### `app/modules/finanzas.js`

- corregir texto delegado;
- describir comisión de coordinación y distribución configurable;
- mostrar revisión cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada;
- no usar selección Shopper DEV en rutas protegidas;
- no mover autenticación o reconciliación protegida a módulos UI.

## 8. Gate pendiente

Requiere autorización fresca:

`SOURCE LOCK NUEVO → STATIC CUMULATIVE + NEW-TAB ROOT-FIX GATE → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → STAFF → SHOPPER 3 RELOADS + NEW TAB + OWN VISITS → CLIENTE → HR/DOMINIO/FINANZAS/PORTALES/RESERVAS → VALIDACIÓN HUMANA → FREEZE`.

No merge ni producción.
