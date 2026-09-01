# CAMBIOS BACKEND — C6 FINANCE ROOT FIX SOURCE-ONLY

**Fecha:** 2026-08-02  
**Estado:** `PASS_SOURCE_ONLY__NO_DEPLOY__NO_PRODUCTION`

## 1. Bloque autorizado

Se ejecutó un único bloque source-only para corregir:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

No se autorizó ni ejecutó deploy, write de proveedor, merge o producción.

## 2. Archivos creados y modificados

### Backend/runtime

- `app/adapters/tya-project-financial-model-contract-v1.js`
  - incorpora registro de configuración por llave técnica `tenantId::projectId`;
  - resuelve proyecto por `parentProjectId`, `program`, `baseProjectId`, `clientProjectId` o `canonicalProjectId`;
  - materializa la configuración antes de `normalizeAll()`;
  - no usa nombre visual, similitud ni fallback inventado;
  - materializa Cinépolis con llave `tya::cinepolis` como delegado, regalía 0 y Q60/L200;
  - aplica el orden correcto en script load, actualización HR, autoridad protegida, backend-ready y cambio de proyecto;
  - preserva contrato directo/delegado/regional y fail-closed.

### QA

- `tools/qa/tya-c6-finance-root-fix-gate.mjs`
  - gate estático y smoke runtime local read-only;
  - verifica precedencia materialización → normalización;
  - verifica llave técnica exacta;
  - rechaza clasificación por nombre visual;
  - simula dos periodos heredados como directo/regalía 10;
  - demuestra salida única delegado/regalía 0 en script load, evento HR y evento de autoridad protegida;
  - compara `period()`, `project()` y salida financiera.

### Evidencia

- `app/docs/evidence/CORTE6-FINANCE-ROOT-FIX-SOURCE-ONLY-LATEST.json`.

### Documentación

- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- `ACADEMIA-IMPACTO-C6-RECUPERACION-RUNTIME-ACUMULATIVO-20260801.md`;
- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- PR #7.

## 3. Gates ejecutados

PASS:

- sintaxis del contrato financiero modificado;
- sintaxis del gate nuevo;
- precedencia `materializeAll()` antes de `normalizeAll()`;
- registro técnico exacto;
- ausencia de clasificación por nombre;
- contrato Cinépolis delegado;
- cero provider writes;
- smoke script load;
- smoke `cx:live-source-updated`;
- smoke `cx:protected-auth-hr-authority-ready`;
- coherencia `period/project/finance`;
- diagnóstico del materializador;
- contrato del normalizador.

Decisión:

`PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE`.

## 4. Resultado funcional

Dos periodos simulados con estado heredado:

`directo / local_invoicing / regalía 10`

se transformaron, antes de normalizar, en:

`delegado / delegated_coordination / regalía 0`

con:

- `financialConfigurationKey=tya::cinepolis`;
- `financialConfigurationMaterialized=true`;
- Q60 GT y L200 HN;
- comisión/reparto configurables;
- valores no inventados.

## 5. Clasificación

- **Reusable CXOrbia:** registro multi-tenant por llave técnica y precedencia materialización-normalización.
- **Exclusivo TyA:** configuración `tya::cinepolis`, Q60/L200 y regalía 0.
- **Claude/prototipo:** no tocar UI ni duplicar esta lógica en módulos.
- **Academia:** enseñar configuración → materialización → normalización → consumo → gate.
- **Sin impacto Claude:** no se modificaron módulos visuales.

## 6. Estado seguro

- Hosting deploys: 0.
- Cloud Run deploys: 0.
- Firestore/Auth/Rules/Storage/HR writes: 0.
- Make/Gemini/pagos: 0.
- Merge: false.
- Producción: false.

## 7. Siguiente bloque exacto

Solo con autorización fresca:

`SOURCE LOCK NUEVO → GATE FINANCE ROOT FIX → GATE ACUMULATIVO → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD → HR → STAFF → SHOPPER → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA`.
