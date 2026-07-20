# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_IN_PROGRESS_CONTEXT_HISTORY_REPORT_PROJECTION_READY`

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

Primer bloque ejecutado:

- Contrato: `backend/contracts/phase-a-corte1-context-history-reports-v1.json`.
- Gate de fuente/proyección: `tools/qa/tya-corte1-context-history-reports-gate.mjs`.
- Builder de proyección: `tools/release/tya-corte1-report-projection-build.mjs`.
- Gate navegador: `tools/qa/tya-corte1-report-projection-browser-gate.mjs`.
- Carril canónico R18A/R21 actualizado sin deploy ni cambio de producción.

## 4. Primera evidencia Corte 1

Workflow `29725084348`: SUCCESS.

Artifact `8453902137`.
Digest: `sha256:01d28de1db01ea587ca06612f926dbbc5c80baed906b993a203ccaea2d8c3bad`.

Decisión: `PASS_WITH_REVIEW_CORTE1_CONTEXT_HISTORY_REPORTS`.

Resultado:

- 14 periodos.
- 616 visitas.
- 28 filas de reporte por periodo/país.
- 13 periodos históricos por defecto, excluyendo julio activo.
- 611 asignadas y 5 sin asignar en el alcance completo.
- 592 realizadas.
- 590 con cuestionario.
- 527 submitidas.
- 0 pagos confirmados o inferidos.
- 0 blockers.
- Única advertencia: botones PDF/Excel/PPT de `app/modules/cliente-extra.js` todavía son demo y requieren consumidor frontend localizado.

Junio 2026 queda correctamente representado como ejecutado:

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

## 6. Observaciones trasladadas

- Corte 2: reservas elegibles, postulaciones, asignaciones y shopper por llave estable.
- Corte 3: honorarios, modelo local/delegado/regional, regalías, cruce financiero y lotes.
- Cortes 4/6: datos shopper mediante backend protegido + Auth/RBAC.
- Claude/Academia futuro: manual profundo, reportes UI, copy sin `Q1/Q2` y perfil protegido humano.

## 7. Siguiente bloque exacto

```text
CORTE 1.2 — CONSUMIDOR DE REPORTES Y CAMBIO DE CONTEXTO
-> confirmar gate navegador de la proyección source-safe
-> documentar contrato frontend localizado para Reportes
-> conectar PDF/Excel/PPT al mismo scope tenant/proyecto/periodo/país
-> validar cambio de periodo en KPI, filas, detalle y exportación
-> construir build exacto DEV
-> revisión visual de Paula
-> corrección focalizada si aplica
-> aprobación explícita
-> freeze Corte 1
```

Corte 2 no comienza antes de la revisión visual y freeze de Corte 1.

Estado seguro: sin deploy nuevo, merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
