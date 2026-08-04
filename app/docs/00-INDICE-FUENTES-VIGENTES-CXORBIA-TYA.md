# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V6_EMPALMED__SOURCE_STATIC_PASS_WITH_WARNINGS__VISUAL_HOLD__CLOUD_V7_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock prevalente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- baseline acumulativa única;
- producción `tya-plataforma` intacta.

Codex únicamente empalma deltas exactos aprobados. ChatGPT audita, corrige gates, despliega DEV, ejecuta runtime/laboratorio y decide cutover.

## 1. Fuentes activas — orden obligatorio

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-CLOUD-V6-SOURCE-STATIC-PASS-20260804.md`;
3. `CAMBIOS-BACKEND-ADDENDUM-CLOUD-V6-GATE-REBASE-AND-VISUAL-HOLD-20260804.md`;
4. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
5. `PROMPT-CLOUD-V7-CORRECCION-VISUAL-LOGIN-ORBIT-20260804.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-FORENSIC-CONTROL-PLANE-STABILIZATION-20260804.md`;
7. `backend/contracts/cxorbia-active-runtime-control-plane-v1.json`;
8. `backend/contracts/tya-phase-a-core-operations-shopper-release-slice-v1.json`;
9. `METODOLOGIA-PRUEBAS-EN-PLATAFORMA-REUTILIZABLE-DESDE-FINANZAS-20260804.md`;
10. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
11. `RESUMEN-PARA-CLAUDE.md`;
12. `PENDIENTES-PROTOTIPO.md`;
13. manifest base y reglas/addenda vigentes;
14. PR #7 y HEAD vivo.

## 2. V6 empalmada

- HEAD previo: `a2ccfb0c3709cad6f5e6a9c16dcb7f9293532d6e`;
- commit funcional: `f961253f18c388ae04619bb5175269015c8349c3`;
- candidata SHA-256: `0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`;
- deploy: 0.

La V6 queda acumulada, pero su Login continúa en `HOLD_FRONTEND_VISUAL`.

## 3. Gate source/static — PASS comprobado

Reejecución controlada:

- request: `cloud-v6-source-static-marker-fix-20260804-02`;
- target HEAD: `b9050ad4c46b0356095e670ba677c47b214b287d`;
- request commit: `c10e112d4fea4d05bed9873abcefee7f3d4a1c60`;
- run: `30955339976`;
- artifact: `8910775999`;
- status: success.

Decisiones:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
```

Comprobado:

- 53/53 blobs base;
- 4/4 adicionales V6;
- 5 overrides V6 exactos;
- assets faltantes 0;
- scripts duplicados 0;
- secretos 0;
- módulos, navegación, ReportKit, pins y laboratorio source contract PASS;
- repositorio sin delta después del gate.

Advertencias no bloqueantes:

- P1 overlay A+B superseded;
- P1 PDF sin gráficas en algunos caminos;
- P2 formato Excel básico.

Este PASS corresponde al HEAD V6 técnico previo a Cloud V7. Después del empalme visual V7 debe actualizarse el overlay y repetirse el source/static sobre el HEAD final.

## 4. Cloud V7

Pendiente un delta exclusivamente visual sobre V6:

- autoridad visual: Emergent;
- estilo orbital: Orbit 360;
- archivos principales: `app/app.js` y `app/styles/layout.css`;
- sin backend ni otros módulos;
- no deploy hasta auditoría y aprobación visual.

## 5. Trabajo paralelo autorizado

Mientras Cloud termina V7, ChatGPT continúa con:

- contrato del runner real de escenarios;
- matriz UI Admin/Operaciones + Shopper;
- fingerprint antes/después;
- cleanup exacto;
- schema de evidencia y capturas;
- gate de ingestión del laboratorio.

No se ejecutarán escenarios ni provider writes antes del único deploy DEV de la candidata visual final.

## 6. Primer corte operativo

`ADMIN/OPERACIONES + SHOPPER`.

Portal Cliente continúa en carril paralelo y no bloquea el primer cutover.

## 7. Siguiente secuencia

```text
PREPARAR RUNNER/LAB SOURCE-ONLY EN PARALELO
+ CLOUD V7 VISUAL DELTA
→ AUDITORÍA VISUAL CHATGPT
→ CODEX SOLO EMPALME DEL DELTA APROBADO
→ ACTUALIZAR OVERLAY
→ SOURCE/STATIC PASS FINAL
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL ADMIN/OPERACIONES + SHOPPER
→ CLEANUP EXACTO
→ VISUAL HUMANA
→ CUTOVER AUTORIZADO
```

## 8. Estado seguro

- Hosting/Cloud Run: 0;
- producción/merge: 0;
- Firestore/Auth/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- producción intacta.
