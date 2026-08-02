# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_DEV_HOSTING_RELEASED__REMOTE_PARITY_HR_STAFF_CLIENT_PASS__SHOPPER_NEW_TAB_ROOT_FIX_PENDING_DEPLOY`

## 1. P0 bloqueante actual

P0 único:

`SHOPPER NEW TAB RESTORES AUTH AND HR BASE BUT DOES NOT APPLY PROTECTED AUTHORITY`.

Dos gates remotos reprodujeron:

- rol/namespace/tenant/proyecto correctos;
- 14 periodos, 616 visitas y 208 shoppers visibles;
- app activa;
- autoridad protegida no aplicada;
- visitas propias 0.

El root fix está aplicado en fuente, pero todavía no fue desplegado.

## 2. Deploy DEV y gates cerrados

PASS:

- una release Hosting DEV publicada desde `firebase.deploy.json` raíz;
- 2,293 archivos publicados;
- paridad remota exacta de 16 assets;
- endpoint HR remoto;
- Staff remoto;
- Cliente remoto;
- credencial Cliente idempotente, readback y rollback;
- Cinépolis delegado, regalías 0 y Q60/L200.

No cerrado:

- Shopper nueva pestaña con overlay exacto y visitas propias;
- gate semántico remoto de Finanzas/portales/Reservas posterior al P0;
- validación humana acumulativa;
- freeze C6.

## 3. Causa raíz

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

El bridge dependía de una conciliación puntual. No tenía recuperación independiente para una sesión ya restaurada ni reintento HR acotado.

## 4. Root fix listo

`app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` incorpora:

- seis reintentos HR vivos para fallos transitorios;
- scheduler de sesión restaurada;
- eventos Auth/backend/DOM/foco/visibilidad/refresh;
- guardas de principal, Firestore y dependencias canónicas;
- idempotencia;
- cero writes.

Gate estático:

`tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`.

## 5. Siguiente bloque técnico

Con autorización fresca:

1. source lock nuevo;
2. gate estático acumulativo;
3. gate estático new-tab;
4. un único deploy del Hosting DEV existente;
5. paridad remota;
6. HR viva;
7. Staff;
8. Shopper: tres recargas, nueva pestaña, autoridad aplicada y visitas propias;
9. Cliente;
10. dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas;
11. evidencia PASS/FAIL;
12. validación humana;
13. `APROBADO C6 → FREEZE`.

Ante fallo no existe segundo deploy automático.

## 6. Pendientes Claude/prototipo

### `app/modules/proyecto-wizard.js`

- agregar opción `Regional`;
- conservar directo/delegado;
- ocultar regalías para delegado/regional.

### `app/modules/finanzas.js`

- corregir texto delegado;
- explicar comisión de coordinación y distribución configurable;
- mostrar revisión cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada;
- no usar `pickShopperDev()` en rutas protegidas;
- no implementar reconciliación protegida en UI.

## 7. No reabrir

- no nueva candidata, rama, PR, Firebase, Hosting o workflow;
- no bypass de Auth;
- no aceptar HR base como prueba del overlay protegido;
- no dedupe por nombre/teléfono;
- no regalías globales;
- no honorario Shopper como ingreso delegado;
- no PowerShell para Paula;
- no deploy por ensayo.

## 8. P1/P2 después del freeze

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto;
- optimización de carga;
- review queue y certificaciones.

## 9. Agosto

Paula agregará agosto solo después del freeze de Corte 6. El sistema debe detectarlo desde HR y nunca crearlo por fecha del sistema.
