# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_READONLY_HARDENED_PROVIDER_IDENTITY_PENDING_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos ejecutados y Firestore/Auth/Storage/HR writes: 0.

## 2. Corte 3 — FROZEN / ACTIVE_BASELINE

Paula autorizó el cierre con `Procede` en la conversación vigente.

- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Baseline head antes de documentos de freeze: `1b34c3998625a3f2402ceeada283ab57b56ffbf6`.
- Manifest: `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`.
- Decisión: `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`.
- V182 empalmada sobre V174.
- Commit funcional V182: `e3cfe464fd80e5bd4ce273556cfd0021e22c0810`.
- R26–R32: 135/135 PASS.
- R24: `PASS_CORTE3_V174_RUNTIME_PRESERVATION_R24`.
- Gate pagos: `PASS_TYA_PAYMENT_HISTORY_SOURCE_SAFE_GATE`.
- HR remota: `PASS_REMOTE_LIVE_HR_ENDPOINT`.
- Smoke remoto: `PASS_TYA_CORTE3_REMOTE_LIVE_PAYMENT_HISTORY_SMOKE_R25`.
- Run `30416875149`, job `90468374816`: SUCCESS.
- Artifact `8710831009`, digest `sha256:091f605b3cf8426262bb9fe4dd36f930a0f1e87fad8113287e905375b7126d76`.

### Verdad congelada

- HR: 14 periodos / 616 visitas.
- Mayo 2026: 44 pagadas / 0 pendientes / 42 exactas / 2 reviews / CxP Q0-L0.
- Junio 2026: 2 pagadas / 42 pendientes / IDs `JUNIO 26!2` y `JUNIO 26!6` / Q451-L0.
- Pagos y lotes ejecutados por CXOrbia: 0.

### Backlog no bloqueante

- PDF sin gráfica visible al imprimir.
- Excel con formato básico.
- Mejora transversal de `reportKit`.
- Refinamiento de copy genérico “Pendiente de fuente”.
- Reconciliación del registry/gate histórico R20 antes de producción.

Corte 3 no se reabre por P1/P2. Solo un P0 reproducible puede modificar el baseline.

## 3. Corte 4 — iniciado

Objetivo: `CX.data READ-ONLY → Firebase nuevo y vacío → misma interfaz → cero writes`.

### Hardening aplicado

- `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`.
- `app/core/backend-config.js`:
  - `enabled=false` por defecto;
  - `readOnly=true`;
  - `writeMode=disabled`;
  - cero data/operational writes;
  - backend vacío permitido;
  - error de lectura fail-closed;
  - identidad y vacío del proyecto todavía no verificados.
- `app/core/backend-config-preview-dev.js`: preview autorizado permanece estrictamente read-only.
- `app/core/backend-cxdata-readonly-corte4.js`:
  - conserva los métodos públicos de `CX.data`;
  - bloquea persistencia directa;
  - bloquea acciones operativas públicas;
  - un backend vacío se representa como vacío, sin volver al mock/localStorage;
  - un error de lectura falla cerrado.
- `app/index-backend-dev.html`: carga el guard después de acciones operativas y antes del bridge UI.
- `tools/qa/cxdata-firestore-readonly-corte4-gate.mjs`: gate estático creado; no activa proveedor ni despliega.

### Hallazgo de causa raíz prevenido

El adapter Firebase existente envolvía métodos `CX.data` con persistencia Firestore y, ante backend vacío/error, podía conservar el mock/localStorage visible. Corte 4 ahora bloquea esas dos rutas antes de conectar el proveedor.

## 4. Gate actual

Estado: `READONLY_HARDENED_PROVIDER_IDENTITY_PENDING`.

Todavía NO se activa Firebase porque faltan:

1. verificar que `cxorbia-backend-dev` sea efectivamente la base nueva y limpia autorizada;
2. verificar proyecto vacío y Rules read-only;
3. completar config DEV sin secretos en repo;
4. ejecutar el gate Corte 4;
5. obtener autorización para activar lectura DEV.

No se crearán ni conectarán bases preexistentes o legacy.

## 5. Claude/prototipo y Academia

- Claude: Corte 3 congelado; no V183/R33; no tocar módulos UI desde backend. Cualquier P1/P2 se documenta por archivo/módulo.
- Academia: Corte 3 ya puede documentarse como baseline; Corte 4 debe explicar backend vacío fail-closed, interfaz estable y separación lectura/escritura.

## 6. Siguiente bloque exacto

`VERIFICAR IDENTIDAD FIREBASE NUEVA/LIMPIA → VERIFICAR VACÍO Y RULES READ-ONLY → EJECUTAR GATE CORTE 4 → ACTIVAR SOLO LECTURA DEV → SMOKE CX.data VACÍO/SOURCE-SAFE`.

## 7. Estado seguro

Sin producción, merge, provider activation, Firestore/Auth/Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live.
