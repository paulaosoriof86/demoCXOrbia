# REPORTE DE CORRECCIÓN — V114 (cierre de GAP1/GAP2/GAP3 sobre V113)

Baseline: `Prototype development request CXOrbia V113.zip`.
Fuente única: `PAQUETE-CLAUDE-CXORBIA-V113-A-V114-ATOMIC-BASELINE-20260714`.

## GAP1 — Ningún escritor directo de currentProjectId/currentPeriodId fuera de core/data.js

`app/core/router.js` (5 ramas de scope: shopper/cliente/coordinador),
`app/core/store.js` (restauración desde localStorage) y `app/modules/cliente.js`
(selector de proyecto) escribían `currentPeriodId` directamente, dejando
`currentProjectId` desincronizado. Migrados a `CX.data.setProject(periodId)`,
el único mutador real. Además, `setCurrentProject()` ahora co-emite
`cx:period-changed` con el periodo resultante cuando el cambio de proyecto
arrastra un cambio de periodo (antes solo emitía `cx:project-changed`).
Verificado con grep: 0 asignaciones directas fuera de `core/data.js`.
Runtime: `project().activePeriodId===period().id` consistente en shopper,
cliente y admin tras `CX.router.mount()`. PASS_COMPROBADO.

## GAP2 — Filtros por id equivocado + guards rotos

`app/core/shoppers-store.js`: `visitsForShopper` filtraba por
`currentProjectId` (id de proyecto/programa) cuando `v.projectId` almacena
el id del PERIODO — vaciaba el histórico. Corregido a `currentPeriodId`.
`app/modules/academia.js` y `app/core/permissions.js`: guards
`CX.data.project&&CX.data.period()` (comprobaban el método equivocado antes
de invocar `period()`) corregidos a `CX.data.period&&CX.data.period()`.
Texto de `academia.js` sobre currentProjectId/currentPeriodId: revisado, no
contenía ninguna afirmación falsa de equivalencia — no requería edición.
Runtime: histórico de shopper devuelve 3 registros reales (antes vacío);
Finanzas renderiza correctamente. PASS_COMPROBADO.

## GAP3 — Verificador de manifest con ruta fija + manifest desactualizado

`docs/verify-manifest.mjs` tenía la ruta del manifest fijada a mano
(`MANIFEST-V111.json`), quedando desactualizado en cada corrección. Ahora lee
la ruta vigente desde `core/build-lock.js` (`CX_SOURCE_LOCK.manifestFile`),
con override manual opcional `--manifest <path>`.
`MANIFEST-V114.json` regenerado desde el contenido real de `app/` (145
archivos + los 2 documentos de esta entrega = 147 declarados, 145 con
contenido — los 2 de reporte/checklist se generaron después y se incluyeron
en el recálculo final). `build-lock.js` actualizado a V114.

**Pruebas ejecutadas:**
- Syntax check (`new Function(code)`) sobre los 7 archivos modificados en
  esta ronda: 7/7 PASS.
- 0 diferencias en verificación manifest vs contenido real (recalculado con
  la misma lógica SHA-256 + aggregate que usa `verify-manifest.mjs`).

## Limitación honesta (repetida de V112/V113, sin cambios de fondo)

Este entorno no expone una terminal Node invocable — `node
docs/verify-manifest.mjs` no se pudo correr como comando literal. Se ejecutó
la misma lógica (SHA-256 por archivo + aggregate) directamente contra los
archivos reales del ZIP final. El propio script quedó corregido y listo para
ejecutarse con Node real fuera de este entorno.
