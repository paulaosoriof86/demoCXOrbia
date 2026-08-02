# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `C6_SHOPPER_REMOTE_PASS__FINANCE_ROOT_FIX_SOURCE_ONLY_PASS__FRESH_DEV_DEPLOY_REQUIRED__NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Producción `tya-plataforma` intacta.
- Agosto 2026 todavía no existe en HR.
- HR observada: 14 periodos, junio 2025–julio 2026, 616 visitas.

## 2. PASS remoto preservado

- paridad remota y endpoint HR;
- Staff con tres recargas y nueva pestaña;
- Shopper con identidad exacta, 208 shoppers, `ownVisits=1`, tres recargas y nueva pestaña;
- Cliente existente con scope exclusivo `cinepolis`, tres recargas y nueva pestaña.

El P0 Shopper de sesión restaurada queda cerrado remotamente.

## 3. Fallo financiero previo

El deploy canónico anterior detectó:

- objetos canónicos: directo/local/regalía 10;
- configuración vigente: delegado/coordinación/regalía 0.

Causa:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

## 4. Root fix source-only aplicado

Archivo:

`app/adapters/tya-project-financial-model-contract-v1.js`.

Correctivo:

- registro exacto por llave técnica `tenantId::projectId`;
- resolución sin nombre visual;
- materialización en todos los periodos canónicos antes de `normalizeAll()`;
- eventos de script load, HR viva, autoridad protegida, backend-ready y proyecto;
- Cinépolis `tya::cinepolis` delegado, regalía 0, Q60 GT/L200 HN;
- comisión/reparto configurables y valores no inventados.

## 5. Gate predeploy nuevo

`tools/qa/tya-c6-finance-root-fix-gate.mjs`.

Resultado ejecutado local/read-only:

`PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE`.

El smoke transformó dos periodos heredados como directo/regalía 10 a delegado/regalía 0 y comprobó una sola verdad para `period()`, `project()` y salida financiera en:

- script load;
- `cx:live-source-updated`;
- `cx:protected-auth-hr-authority-ready`.

Evidencia:

`app/docs/evidence/CORTE6-FINANCE-ROOT-FIX-SOURCE-ONLY-LATEST.json`.

## 6. Estado de Corte 6

El correctivo está en fuente y pasó gate local. Todavía no se afirma PASS remoto financiero porque no hubo deploy bajo este bloque.

Portales y Reservas permanecen pendientes del siguiente gate remoto acumulativo.

## 7. Siguiente bloque exacto

Requiere autorización fresca:

`SOURCE LOCK NUEVO → FINANCE ROOT-FIX GATE → GATE ACUMULATIVO → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD → HR → STAFF → SHOPPER → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA`.

## 8. Estado seguro

- Deploys en este bloque source-only: 0.
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0.
- Credenciales/tokens expuestos: 0.
- Merge: false.
- Producción: false.
