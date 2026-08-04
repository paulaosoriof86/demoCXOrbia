# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V6_EMPALMED__SOURCE_GATE_ROOT_FIX_MATERIALIZED__VISUAL_HOLD__CLOUD_V7_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock prevalente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- baseline acumulativa única;
- producción `tya-plataforma` intacta.

Codex únicamente empalma deltas exactos aprobados. ChatGPT audita, corrige gates, despliega DEV, ejecuta runtime/laboratorio y decide cutover.

## 1. Fuentes activas — orden obligatorio

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-CLOUD-V6-GATE-REBASE-AND-VISUAL-HOLD-20260804.md`;
3. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
4. `PROMPT-CLOUD-V7-CORRECCION-VISUAL-LOGIN-ORBIT-20260804.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-FORENSIC-CONTROL-PLANE-STABILIZATION-20260804.md`;
6. `backend/contracts/cxorbia-active-runtime-control-plane-v1.json`;
7. `backend/contracts/tya-phase-a-core-operations-shopper-release-slice-v1.json`;
8. `METODOLOGIA-PRUEBAS-EN-PLATAFORMA-REUTILIZABLE-DESDE-FINANZAS-20260804.md`;
9. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
10. `RESUMEN-PARA-CLAUDE.md`;
11. `PENDIENTES-PROTOTIPO.md`;
12. manifest base y reglas/addenda vigentes;
13. PR #7 y HEAD vivo.

## 2. V6 empalmada

- HEAD previo: `a2ccfb0c3709cad6f5e6a9c16dcb7f9293532d6e`;
- commit funcional: `f961253f18c388ae04619bb5175269015c8349c3`;
- candidata SHA-256: `0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`;
- deploy: 0.

La V6 queda acumulada, pero su Login está en `HOLD_FRONTEND_VISUAL`.

## 3. Gate source/static

El FAIL posterior al empalme mezclaba:

- cinco blobs históricos legítimamente modificados;
- un asset local faltante;
- un falso positivo de secreto en un archivo scanner.

Correctivos materializados:

- overlay V6 sobre manifest base;
- placeholder Auth local fail-closed sin secretos;
- scanner con tratamiento separado para definiciones de patrones;
- Laboratorio visible corregido para no declarar escenarios o cleanup que no ejecutó.

El gate rebasado aún requiere ejecución comprobada. No se declara PASS.

## 4. Cloud V7

Pendiente un delta exclusivamente visual sobre V6:

- autoridad visual: Emergent;
- estilo orbital: Orbit 360;
- archivos principales: `app/app.js` y `app/styles/layout.css`;
- sin backend ni otros módulos;
- no deploy hasta aprobación visual.

## 5. Primer corte operativo

`ADMIN/OPERACIONES + SHOPPER`.

Portal Cliente continúa en carril paralelo y no bloquea el primer cutover.

## 6. Siguiente secuencia

```text
CLOUD V7 VISUAL DELTA
→ AUDITORÍA VISUAL CHATGPT
→ CODEX SOLO EMPALME DEL DELTA APROBADO
→ ACTUALIZAR OVERLAY
→ SOURCE/STATIC PASS COMPROBADO
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL ADMIN/OPERACIONES + SHOPPER
→ CLEANUP EXACTO
→ VISUAL HUMANA
→ CUTOVER AUTORIZADO
```

## 7. Estado seguro

- Hosting/Cloud Run: 0;
- producción/merge: 0;
- Firestore/Auth/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- producción intacta.
