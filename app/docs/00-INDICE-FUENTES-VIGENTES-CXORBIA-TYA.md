# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__LAB_SOURCE_ONLY_PREPARED__CLOUD_V7_1_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- baseline acumulativa única;
- producción `tya-plataforma` intacta.

No existe empalme V6 aprobado/completado. Codex solo puede empalmar un delta exacto después de GO sin P0.

## 1. Fuentes activas — orden obligatorio

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `AUDITORIA-REAL-CANDIDATA-CLOUD-V7-1-20260804-HOLD.md`;
3. `CAMBIOS-BACKEND-ADDENDUM-V7-1-AUDIT-HOLD-20260804.md`;
4. `CAMBIOS-BACKEND-ADDENDUM-LABORATORIO-SOURCE-ONLY-PREPARATION-20260804.md`;
5. `backend/contracts/tya-dev-scenario-lab-runner-v1.json`;
6. `backend/contracts/tya-dev-scenario-lab-evidence-schema-v1.json`;
7. `MATRIZ-EJECUCION-LABORATORIO-ADMIN-SHOPPER-20260804.md`;
8. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
9. `RESUMEN-PARA-CLAUDE.md`;
10. `PENDIENTES-PROTOTIPO.md`;
11. contratos y addenda activos;
12. PR #7 y HEAD vivo.

## 2. Trabajo source-only adelantado

Quedaron preparados sin ejecución runtime:

- contrato del runner del Laboratorio;
- schema de evidencia;
- gate source-only;
- matriz Admin/Operaciones + Shopper;
- fingerprints y cleanup exacto;
- clasificación P0 ante fallo de limpieza.

No se usaron credenciales, navegador, provider reads/writes, datos `AUDIT-*` ni deploy.

## 3. Auditoría Cloud V7.1

Paquete:

- `Prototype development request V 7.1.zip`;
- SHA-256 `649b9d50ae8f80cf4e0b4fcb303e60b35e8fda1b7de1215ae716b7be6f4355ca`;
- cinco entradas;
- delta funcional limitado a `app/app.js` y `app/styles/layout.css`.

Decisión:

```text
HOLD_NO_SEND_TO_EMPALME
```

PASS parciales:

- paquete estrecho;
- sintaxis, UTF-8 y secret scan PASS;
- escritorio correcto;
- países 1/2/8/12 visibles y ordenados;
- doce países accesibles en `1440×900`.

P0 reproducible:

- la regla legacy de `#login` conserva `display:flex`, centrado y `padding:24px`;
- bajo 900 px la composición continúa centrada como flex item de ~552 px;
- en 390/412 px aparecen coordenadas negativas, clipping lateral, franja superior fuera de pantalla y controles por debajo del scrollHeight real.

Evidencia candidata inválida/incompleta:

- la captura rotulada `1440×900` mide realmente `924×540` y es JPEG;
- faltan cuatro viewports, comparación y escenarios visuales 1/2/8/12.

## 4. Carril

```text
V7_1_GO = false
SEND_TO_EMPALME = false
EXECUTION_LANE_READY_FOR_APPLY = false
```

El checkout local autenticado continúa bloqueado por DNS. Esto no impide declarar HOLD con evidencia reproducible, pero prohíbe aplicar cualquier delta.

## 5. Siguiente secuencia

```text
CLOUD ENTREGA V7.2 FRONTEND
→ CORRIGE #login FLEX/PADDING BAJO 900PX
→ ENTREGA EVIDENCIAS REALES
→ EXECUTION_LANE_READY
→ AUDITORÍA FINAL
→ GO SIN P0
→ CODEX SOLO EMPALME
→ SOURCE/STATIC FINAL + GATE LAB
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
```

## 6. Estado seguro

- V7.1 aplicada: no;
- empalme: 0;
- datos `AUDIT-*`: 0;
- Hosting/Cloud Run: 0;
- provider writes: 0;
- Firestore/Auth/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
