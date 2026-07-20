# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_BACKEND_REPORT_PROJECTION_PASS_FRONTEND_CONSUMER_PENDING`

## 1. Repositorio y baseline

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21.
- Corte 0B: congelado con aprobación visual de Paula.
- Commit de empalme: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- Manifest: `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Aggregate: `7075f70822e3fed8442d62b56e1467fa643facd756aa88258ae2d6d6bdc95cdf`.
- Freeze Corte 0B: `app/docs/FREEZE-CORTE-0B-ACTIVE-BASELINE-V161C-20260720.md`.

## 2. Regla visual obligatoria

Después de cada corte Paula revisa visualmente el build exacto antes del freeze y antes de iniciar el corte siguiente. Ningún PASS técnico, gate, smoke automático o agente sustituye esa revisión.

Regla: `app/docs/REGLA-PREVALENTE-VALIDACION-VISUAL-DESPUES-DE-CADA-CORTE-20260720.md`.

## 3. Corte 1 iniciado

Objetivo: contexto, HR, histórico, reportes y exportaciones por tenant, proyecto, periodo y país.

Componentes creados:

- Contrato: `backend/contracts/phase-a-corte1-context-history-reports-v1.json`.
- Gate de fuente/proyección: `tools/qa/tya-corte1-context-history-reports-gate.mjs`.
- Builder de proyección: `tools/release/tya-corte1-report-projection-build.mjs`.
- Gate navegador: `tools/qa/tya-corte1-report-projection-browser-gate.mjs`.
- Proyección generada en build: `CX_TYA_CORTE1_REPORTS`.
- Carril canónico R18A/R21 actualizado sin deploy ni cambio de producción.

## 4. Evidencia Corte 1

### Gate fuente y reporte

- Workflow `29725084348`: SUCCESS.
- Artifact `8453902137`.
- Digest `sha256:01d28de1db01ea587ca06612f926dbbc5c80baed906b993a203ccaea2d8c3bad`.
- Decisión: `PASS_WITH_REVIEW_CORTE1_CONTEXT_HISTORY_REPORTS`.

### Builder y gate navegador

- Workflow `29725365613`: SUCCESS.
- Commit técnico: `082a077b9e7bdc10f337d916274c43c6ed5e240e`.
- Artifact `8454013971`.
- Digest `sha256:408123e54d604fad24302a5afe79abd7aee36daa398cdf078ffe805ec63c3af6`.
- Decisión: `PASS_WITH_REVIEW_CORTE1_REPORT_PROJECTION_BROWSER`.
- 0 blockers, 0 errores de página y 0 errores de consola.
- Advertencia única: formatos frontend PDF/XLSX/PPTX pendientes.

Resultado canónico:

- 14 periodos.
- 616 visitas.
- 28 filas por periodo/país.
- 13 periodos históricos por defecto, excluyendo julio activo.
- 611 asignadas y 5 sin asignar.
- 592 realizadas.
- 590 con cuestionario.
- 527 submitidas.
- 0 pagos confirmados o inferidos.
- JSON/CSV source-safe filtrables por periodo y país.
- Sin campos PII.

Junio 2026:

- GT: 34/34 realizadas, cuestionario y submitido.
- HN: 10/10 realizadas, cuestionario y submitido.
- Pago confirmado: 0.

## 5. Certificaciones y recursos del proyecto

### Certificaciones

- Corte 2: cierre funcional principal — búsqueda certificados/no certificados, certificaciones ya presentadas, banco por proyecto, solicitud puntual, excepción autorizada, re-certificación, intentos, elegibilidad y vínculo con visitas.
- Corte 6: Auth/RBAC y permisos por rol/scope.
- Corte 7: sincronización y preservación completa HR/plataforma.

### Recursos del proyecto

- Corte 1: catálogo, contexto, origen y vínculo con tenant/proyecto/periodo.
- Corte 2: entrega contextual al shopper por visita, escenario y certificación.
- Corte 6: permisos por rol.
- Corte 7: carga protegida, Storage, versionado, evidencias y sincronización.

Certificaciones y recursos son transversales y se revisan visualmente cada vez que cambian.

## 6. Pendiente real de Corte 1

El módulo `app/modules/cliente-extra.js` todavía muestra toast demo en PDF/Excel/PPT. Backend no parchea UI; el consumidor frontend debe usar exclusivamente la proyección aprobada y respetar tenant, proyecto, periodo, país y rol.

También debe verificarse visualmente que cambiar periodo actualiza KPI, filas, detalle, histórico y exportación.

## 7. Siguiente bloque exacto

```text
CORTE 1.2 — CONSUMIDOR FRONTEND LOCALIZADO
-> documentar ajuste por archivo/módulo para Claude
-> conectar PDF/Excel/PPT a la proyección aprobada
-> impedir fixtures, scores y pagos inventados
-> validar cambio proyecto/periodo en reportes e histórico
-> construir build exacto DEV
-> revisión visual de Paula
-> corrección focalizada si aplica
-> aprobación explícita
-> freeze Corte 1
```

Corte 2 no comienza antes de la revisión visual y freeze de Corte 1.

Estado seguro: sin deploy nuevo, merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
