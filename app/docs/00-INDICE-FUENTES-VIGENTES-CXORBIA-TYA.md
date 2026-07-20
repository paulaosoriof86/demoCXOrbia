# 00 - INDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-20
Estado: ACTIVO Y OBLIGATORIO

## Lectura obligatoria

1. Reglas maestras y continuidad.
2. Addendum de empalme directo y carril file-aware.
3. Addenda de Academia, patrones reutilizables y antidesvío.
4. Plan Phase A sin desviación.
5. `REGLA-PREVALENTE-VALIDACION-VISUAL-DESPUES-DE-CADA-CORTE-20260720.md`.
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. Contratos, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, tracker, Academia y PR #7.
8. `PHASE-A-CORTE1-INICIO-CONTEXTO-HR-HISTORICO-REPORTES-20260720.md`.

## Estado vigente

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21.
- Corte 0B: congelado y aprobado visualmente.
- Estado: `CORTE_1_BACKEND_REPORT_PROJECTION_PASS_FRONTEND_CONSUMER_PENDING`.
- Commit de empalme: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- ZIP SHA-256: `7504b80eed202fff801b1ce39f1028c91dc8446e56670c932042a4fb4a4e74e8`.
- Manifest: `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Aggregate: `7075f70822e3fed8442d62b56e1467fa643facd756aa88258ae2d6d6bdc95cdf`.

## Corte 1 — evidencia vigente

- Contrato: `backend/contracts/phase-a-corte1-context-history-reports-v1.json`.
- Gate fuente: `tools/qa/tya-corte1-context-history-reports-gate.mjs`.
- Builder: `tools/release/tya-corte1-report-projection-build.mjs`.
- Gate navegador: `tools/qa/tya-corte1-report-projection-browser-gate.mjs`.
- Proyección de build: `CX_TYA_CORTE1_REPORTS`.
- Run fuente: `29725084348` — SUCCESS.
- Artifact: `8453902137`.
- Run builder/navegador: `29725365613` — SUCCESS.
- Artifact: `8454013971`.
- 14 periodos, 616 visitas y 28 filas periodo/país.
- 13 periodos históricos por defecto.
- 611 asignadas, 5 sin asignar, 592 realizadas, 590 cuestionarios y 527 submitidas.
- 0 pagos confirmados o inferidos.
- 0 blockers, 0 errores de página y 0 errores de consola.
- Pendiente: consumidor frontend PDF/XLSX/PPTX en `app/modules/cliente-extra.js`.

## Certificaciones y recursos

- Certificaciones: Corte 2 funcional; Corte 6 permisos; Corte 7 sincronización/preservación.
- Recursos: catálogo/contexto Corte 1; entrega contextual Corte 2; permisos Corte 6; Storage/versionado/evidencias Corte 7.
- Ambos son transversales y requieren revisión visual cada vez que cambien.

## Observaciones trasladadas

- Corte 2: reservas elegibles y ciclo shopper por llave estable.
- Corte 3: honorarios, modelo local/delegado/regional, regalías, cruce financiero y lotes.
- Cortes 4/6: datos shopper mediante backend protegido + Auth/RBAC.
- Claude/Academia futuro: manual profundo, reportes UI, copy sin `Q1/Q2` y perfil protegido humano.

## Regla visual prevalente

Después de cada corte Paula revisa visualmente el build exacto antes del freeze y antes de iniciar el siguiente. Gates, smoke y validaciones automáticas no sustituyen esta revisión.

## Fuentes vigentes principales

- `FREEZE-CORTE-0B-ACTIVE-BASELINE-V161C-20260720.md`.
- `REGLA-PREVALENTE-VALIDACION-VISUAL-DESPUES-DE-CADA-CORTE-20260720.md`.
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `PHASE-A-CORTE1-INICIO-CONTEXTO-HR-HISTORICO-REPORTES-20260720.md`.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-FREEZE-CORTE-0B-V161C-20260720.md`.

## Siguiente bloque exacto

`CORTE 1.2 — CONSUMIDOR FRONTEND LOCALIZADO -> BUILD DEV -> REVISIÓN VISUAL PAULA -> FREEZE CORTE 1`

Corte 2 no comienza antes de la revisión visual y freeze de Corte 1.
