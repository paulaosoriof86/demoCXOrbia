# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-23  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_CORTE3_CANONICAL_FINANCE_SOURCE_SAFE_ADAPTER_APPLIED_PENDING_REMOTE_UI_GATES_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- `main`, nueva rama/PR y force push: prohibidos.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. Lectura obligatoria

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`.
3. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
4. Addenda vigentes de Academia, patrones reutilizables y antidesvío.
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md` para el árbol de Phase A.
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` para el estado puntual.
7. `app/docs/VALIDACION-VISUAL-V174-APROBADA-CON-PENDIENTES-P1-P2-20260723.md`.
8. `app/docs/PHASE-A-CORTE3-INICIO-FINANZAS-20260723.md`.
9. `app/docs/CORTE3-FINANCIAL-SOURCE-INVENTORY-GAP-MATRIX-20260723.md`.
10. `app/docs/CORTE3-FINANCIAL-RECONCILIATION-R20-TECHNICAL-PASS-20260723.md`.
11. `app/docs/CORTE3-CANONICAL-FINANCE-SNAPSHOT-ADAPTER-R23-20260723.md`.
12. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE3-CANONICAL-FINANCE-R23-20260723.md`.
13. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE3-CANONICAL-FINANCE-R23-20260723.md`.
14. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE3-CANONICAL-FINANCE-R23-20260723.md`.
15. Manifest/source lock más reciente, PR #7 y HEAD vivo.

## 3. Baseline activa preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Hosting DEV: 14 periodos, 616 visitas y 34 GT/10 HN por periodo.
- Lectura HR viva, módulos V174, adapters y `CX.data`: preservados.

## 4. Corte 3 — verdad financiera canónica

Conciliación revisada:

- 616 visitas HR;
- 247 filas financieras;
- 209 vínculos exactos;
- 38 filas sin vínculo exacto;
- 79 entradas en review queue;
- 37 evidencias candidatas de ledger;
- cero pagos y lotes confirmados.

Snapshot/adapter R23:

- 207 montos canónicos listos;
- 2 vínculos exactos en revisión de consistencia de monto;
- Finanzas y Beneficios consumen la misma verdad en el carril DEV;
- pago siempre `pending_source_confirmation` hasta evidencia completa.

## 5. Pendientes no bloqueantes preservados

- responsive parcial;
- PDF sin gráficas;
- Excel sin formato operativo suficiente;
- etiqueta técnica `sourceAccessMode`.

## 6. Prevalencia temporal

- El plan lock conserva el árbol y orden de Phase A.
- El checkpoint vigente manda sobre estados puntuales antiguos del plan.
- El addendum de runners manda sobre métodos de aplicación y gates.
- No reabrir V174, Corte 1 o Corte 2A.

## 7. Siguiente bloque exacto

`GATE REMOTO DEL MISMO HEAD → VALIDAR FINANZAS Y BENEFICIOS EN UI → GATE PDF/EXCEL → HOSTING DEV CON AUTORIZACIÓN ESPECÍFICA → VALIDACIÓN VISUAL DE PAULA → FREEZE CORTE 3`.

## 8. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, lotes ni pagos.
