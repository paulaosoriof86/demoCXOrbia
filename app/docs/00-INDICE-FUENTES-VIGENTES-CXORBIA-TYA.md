# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `RECONSTRUCTION_ACTIVE_SOURCE_ONLY__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock nuevo de continuidad

La prioridad vigente es reconstruir una única candidata acumulativa con la mejor versión demostrable de cada módulo.

Fuente operativa principal nueva:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`.

Hasta cerrar la matriz quedan suspendidos nuevos diagnósticos C6 aislados, deploys, shells reducidos, candidatas paralelas y correcciones de síntomas que no pertenezcan a la composición acumulativa.

## 1. Repositorio y destinos

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- HEAD de arranque de reconstrucción: `c646af04b8fba0ca8685fa4d6ce0a46e62221276`.
- Primer commit documental de la matriz: `cbf777bbbd9d3172323db18d5b6f854c3e5ab8ff`.
- Hosting DEV existente: `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes maestras obligatorias

1. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
2. reglas maestras y addenda activos;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md` como historial técnico a preservar, subordinado al lock de reconstrucción;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-CANONICAL-HEAD-DEPLOY-SHOPPER-PASS-FINANCE-STOP-RETRY-20260802.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-FINANCE-ROOT-FIX-SOURCE-ONLY-20260802.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-FINANCE-REMOTE-PASS-SEMANTIC-STOP-RETRY-20260802.md`;
9. `RESUMEN-PARA-CLAUDE.md`;
10. `PENDIENTES-PROTOTIPO.md`;
11. Academia vigente;
12. PR #7 y HEAD vivo.

## 3. Fuentes técnicas preservadas

- `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`;
- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`;
- `tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`;
- `tools/qa/tya-c6-finance-root-fix-gate.mjs`;
- `tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`;
- `tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs`;
- `firebase.json`, `firebase.deploy.json`, `.firebaserc`.

Estas fuentes conservan fixes demostrados, pero no sustituyen la matriz módulo por módulo.

## 4. Evidencia C6 preservada

- `CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`;
- `CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`;
- `CORTE6-SHOPPER-NEW-TAB-AUTHORITY-ROOT-FIX-LATEST.json`;
- `CORTE6-FINANCE-ROOT-FIX-SOURCE-ONLY-LATEST.json`.

## 5. PASS remoto que no debe perderse

- HR viva: 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- agosto 2026 ausente;
- Staff remoto PASS con tres recargas y nueva pestaña;
- Shopper remoto PASS con identidad exacta, 208 shoppers, `ownVisits=1`, tres recargas y nueva pestaña;
- Cliente remoto PASS con scope exclusivo `cinepolis`, tres recargas y nueva pestaña;
- producción intacta.

## 6. Modelo financiero remoto prevalente

Llave técnica `tya::cinepolis`:

- modelo delegado;
- `delegated_coordination`;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- comisión y reparto configurables;
- valores no inventados;
- honorario Shopper no usado como ingreso.

Diagnóstico remoto:

- 14 delegados;
- 0 directos;
- 0 sin configurar;
- 0 violaciones de regalías.

La causa de precedencia financiera queda cerrada remotamente y debe preservarse durante la reconstrucción.

## 7. Hallazgo de reconstrucción inicial

- `app/index.html` carga el conjunto actual completo, pero presencia no equivale a aprobación.
- `app/core/build-lock.js` todavía declara V174/R20 y está obsoleto como identidad de la composición actual.
- El paquete V182 es incremental de cinco archivos.
- `app/app.js`, `app/modules/beneficios.js` y `app/styles/layout.css` coinciden exactamente con V182.
- `app/core/finanzas-core.js` y `app/modules/finanzas.js` contienen cambios posteriores y requieren reconciliación, no restauración ciega.

## 8. Secuencia vigente

`INVENTARIO COMPLETO → PROVENIENCIA/APROBACIÓN POR MÓDULO → CLASIFICACIÓN → COMPOSICIÓN OBJETIVO → DELTA COMPLETO CONTRA HEAD → APLICACIÓN ATÓMICA → MANIFEST/BUILD-LOCK/VERIFICADOR → GATES ACUMULATIVOS → ÚNICO DEV → VALIDACIÓN HUMANA → FREEZE → CUTOVER`.

## 9. Gate inmediato

Source-only, sin deploy:

`CERRAR FAMILIA A: SHELL/LOGIN/TENANT/NAVEGACIÓN/CX.DATA/HR/ADAPTERS/AUTH/PROYECTO-PERIODO → TRAZAR APROBACIONES Y COMMITS → CLASIFICAR PRESERVAR/RESTAURAR/RECONCILIAR`.

Después: Familia B, empezando por CRM Ops Leads, Dashboard y hoja de ruta.

## 10. Estado seguro

- cambios funcionales: 0;
- Hosting DEV durante reconstrucción: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0;
- credenciales/tokens expuestos: 0;
- merge: false;
- producción: false.
