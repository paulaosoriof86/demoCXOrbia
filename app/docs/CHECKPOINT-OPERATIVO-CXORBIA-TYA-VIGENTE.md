# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-23  
**Estado:** `V174_R20_M1_CORTE2A_ACTIVE_BASELINE_VISUAL_APPROVED_P1_P2_DOCUMENTED_CORTE3_FINANZAS_ACTIVE_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- No nueva rama, PR, `main` ni force push.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. V174 congelada como baseline activa

- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Corrección focalizada V174: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- Source-lock final: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Aggregate: `ab11bc47dfd096cbe6a110db250c46e656c2dc9760ad832c07958b6c9a886818`.
- Backend, adapters live, contratos operativos, overlays y `CX.data`: preservados.

## 3. Cierre M1/Corte 1/Corte 2A

PASS técnico:

- builder y variantes R20;
- inventario source-safe;
- HR live in-place;
- contexto, histórico y reportes;
- proyecto, periodo y KPI R20;
- Corte 2A canonical;
- M1 regression lock;
- verificador V174.

Validación visual de Paula: **APROBADA**.

## 4. Hallazgos P1/P2 aceptados

- P1: algunas tablas y fichas no aprovechan correctamente el viewport móvil.
- P1: PDF no incorpora las gráficas.
- P2: Excel exporta sin formato operativo suficiente.
- P2: `sourceAccessMode` conserva una etiqueta técnica anterior.

No bloquean la baseline ni reabren V174. Quedan documentados para delta incremental posterior de UX/exportaciones.

## 5. Hosting DEV vigente

- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1`.
- Run: `30027204176`.
- Job: `89274577170`.
- Artifact: `8571796399`.
- Digest: `sha256:50ef940bb7ab52f0fac318cd23f6c4e233f4581fee0a1035c8d936abb7e42a9e`.
- Firebase Hosting DEV: SUCCESS.
- Cloud Run redeploy: no.
- HR viva: 14 periodos, 616 visitas y split 34 GT/10 HN por periodo.

## 6. Corte 3 Finanzas iniciado

Fuentes recuperadas:

- `app/data/tya-financial-control-source-safe.js`;
- `backend/contracts/phase-a-liquidation-payment-control-v1.json`;
- `backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json`.

Estado:

- fuente financiera todavía pendiente de cruce;
- pagos y lotes importados: 0;
- pagado hasta mayo: afirmación documentada pendiente de source match;
- junio: requiere match por ítem;
- reconciliación R14C: 247 filas, 196 enlaces exactos, 51 filas a revisión y 92 entradas en review queue;
- junio: cero enlaces exactos aceptados; no se marca pago.

## 7. Reglas activas

- `liquidada` no equivale a `paid`.
- realizada, cuestionario o submitido no prueban pago.
- pago exige lote, fecha, fuente, confirmación y referencia de auditoría.
- cruces por llaves estables; nunca solo por nombre.
- conflictos a revisión humana.
- datos bancarios crudos fuera del repo.

## 8. Siguiente bloque exacto

`INVENTARIO DE FUENTES FINANCIERAS → RECONCILIACIÓN CONTRA HR R20 ACTUAL → MATRIZ EXACTOS/FALTANTES/AMBIGUOS/CONFLICTOS → REVIEW QUEUE SANITIZADA → GATES`.

## 9. Clasificación

- **Reusable CXOrbia:** separación liquidación/pago, llaves estables, review queue y backlog responsive/exportaciones.
- **Exclusivo cliente:** estado financiero TyA/Cinépolis y cortes mayo-junio.
- **Claude/prototipo:** responsive, PDF con gráficas y formato Excel quedan localizados; no nueva candidata ahora.
- **Academia:** responsive/exportaciones y diferencia entre visita, liquidación y pago.
- **Sin impacto Claude:** freeze, índice, checkpoint, tracker y PR.

## 10. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
