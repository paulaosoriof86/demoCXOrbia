# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_FINANCE_ROOT_FIX_SOURCE_ONLY_PASS__NO_DEPLOY__NO_PRODUCTION`

## 1. Baseline única

Continuar exclusivamente sobre `docs-tya-v6-v71-audit`. No crear candidata, shell reducido, nueva rama, PR, Firebase, Hosting o workflow paralelo.

HR observada: 14 periodos, junio 2025–julio 2026, 616 visitas. Agosto 2026 no existe todavía en HR.

## 2. PASS remoto preservado

- Staff estable en tres recargas y nueva pestaña;
- Shopper con identidad exacta, 208 shoppers, `ownVisits=1`, tres recargas y nueva pestaña;
- Cliente existente con scope exclusivo `cinepolis`, tres recargas y nueva pestaña;
- paridad remota y endpoint HR.

No reabrir login o Shopper sin regresión reproducible.

## 3. Root fix financiero source-only

Causa corregida:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

Archivo modificado:

`app/adapters/tya-project-financial-model-contract-v1.js`.

Ahora:

- registra projectConfig por llave técnica `tenantId::projectId`;
- resuelve por `parentProjectId`, `program`, `baseProjectId`, `clientProjectId` o `canonicalProjectId`;
- no usa nombre visual ni similitud;
- materializa la configuración antes de `normalizeAll()`;
- aplica el orden en script load, HR viva, autoridad protegida, backend-ready y cambio de proyecto;
- conserva directo/delegado/regional y fail-closed.

Configuración `tya::cinepolis`:

- delegado;
- `delegated_coordination`;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- comisión/reparto configurables;
- valores no inventados.

## 4. Gate nuevo

`tools/qa/tya-c6-finance-root-fix-gate.mjs`.

Decisión ejecutada:

`PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE`.

El smoke local read-only comprobó una sola verdad en objetos canónicos, `period()`, `project()` y salida financiera para script load, actualización HR y autoridad protegida.

## 5. Instrucción para Claude/prototipo

No tocar UI para resolver este punto. No duplicar el registro ni la precedencia financiera en módulos. No hardcodear por nombre visual.

Pendientes frontend posteriores:

- `app/modules/proyecto-wizard.js`: agregar Regional y limitar regalías a facturación local;
- `app/modules/finanzas.js`: copy de comisión/reparto configurable y estado de revisión;
- `app/app.js`: preservar entrada humana única y Auth protegida.

## 6. Estado no cerrado

El root fix pasó solo en fuente/local. No afirmar todavía PASS remoto de Finanzas, Portal Cliente, Portal Shopper o Reservas.

## 7. Siguiente bloque

Solo con autorización fresca:

`SOURCE LOCK → FINANCE ROOT-FIX GATE → GATE ACUMULATIVO → UN DEPLOY HOSTING DEV → PARIDAD/HR/STAFF/SHOPPER/CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA`.

Cero merge o producción antes del PASS acumulativo.
