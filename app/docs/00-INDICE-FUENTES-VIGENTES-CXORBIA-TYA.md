# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_FINANCE_ROOT_FIX_SOURCE_ONLY_PASS__FRESH_REMOTE_REVALIDATION_REQUIRED__NO_PRODUCTION`

## 1. Repositorio y destinos

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Hosting DEV existente: `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes maestras obligatorias

1. reglas maestras y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-CANONICAL-HEAD-DEPLOY-SHOPPER-PASS-FINANCE-STOP-RETRY-20260802.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-FINANCE-ROOT-FIX-SOURCE-ONLY-20260802.md`;
7. `RESUMEN-PARA-CLAUDE.md`;
8. `PENDIENTES-PROTOTIPO.md`;
9. Academia vigente;
10. PR #7 y HEAD vivo.

## 3. Fuentes técnicas vigentes

- `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`;
- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`;
- `tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`;
- `tools/qa/tya-c6-finance-root-fix-gate.mjs`;
- `tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`;
- `firebase.json`, `firebase.deploy.json`, `.firebaserc`.

## 4. Evidencia vigente

- `CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`;
- `CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`;
- `CORTE6-SHOPPER-NEW-TAB-AUTHORITY-ROOT-FIX-LATEST.json`;
- `CORTE6-FINANCE-ROOT-FIX-SOURCE-ONLY-LATEST.json`.

## 5. Baseline preservada

- HR viva: 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- agosto 2026 ausente;
- Staff remoto PASS;
- Shopper remoto PASS con identidad exacta, `ownVisits=1`, tres recargas y nueva pestaña;
- Cliente remoto PASS con scope exclusivo `cinepolis`;
- producción intacta.

## 6. Modelo financiero prevalente

Llave técnica `tya::cinepolis`:

- modelo delegado;
- `delegated_coordination`;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- comisión y reparto configurables;
- valores no inventados;
- honorario Shopper no usado como ingreso.

La configuración se materializa antes de `normalizeAll()`.

## 7. Gate source-only vigente

Decisión:

`PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE`.

Comprobó:

- resolución por llaves técnicas;
- ausencia de clasificación por nombre;
- materialización antes de normalización;
- consistencia de `period()`, `project()` y Finanzas;
- script load, actualización HR y autoridad protegida;
- cero provider writes.

## 8. Gate restante

Solo con autorización fresca:

`SOURCE LOCK NUEVO → FINANCE ROOT-FIX GATE → GATE ACUMULATIVO → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD → HR → STAFF → SHOPPER → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA`.

Hasta entonces:

- no nuevo deploy;
- no freeze;
- no agosto/postulaciones;
- no merge;
- no producción.
