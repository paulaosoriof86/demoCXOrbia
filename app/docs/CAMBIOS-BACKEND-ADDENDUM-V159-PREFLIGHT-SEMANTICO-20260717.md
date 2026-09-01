# CAMBIOS BACKEND — V159 PREFLIGHT SEMÁNTICO Y CORTE 0

Fecha inicial: 2026-07-17  
Actualización: 2026-07-18

## Resultado previo preservado

- Corte trabajado: V159 post-empalme + contexto/HR/histórico.
- Empalme V159: cerrado en commit `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Preflight estructural: PASS.
- Preflight semántico estático: PASS.
- P0 demostrado: no.
- Estado máximo actual: `TECHNICAL_PASS_PENDING_VISUAL`.

## Evidencia previa que no se reabre

- 67 JS/MJS, 0 errores.
- 64 scripts locales, 0 faltantes.
- 0 archivos BOM.
- 17 archivos de delta runtime identificados.
- Dashboard, Proyectos, Periodos, Histórico, Visitas, Shoppers, `app.js` e `index.html` sin delta V156→V159.
- Build lock V159, overlays TyA y gate proyecto/periodo/KPI/histórico preservados.

Fuente detallada:

`app/docs/PHASE-A-V159-POST-EMPALME-SEMANTIC-PREFLIGHT-20260717.md`

## Restauración técnica anterior

Se restauraron al checkpoint previo `d5fb26dab1610a400514430d6ad731f75234a092`:

- `.github/workflows/cxorbia-phase-a-r15g-dev-root-deploy.yml` — commit `e59dd6b4dd2f7f8289285ffe839d3d5d03969924`.
- `tools/qa/tya-source-semantics-r15g-gate.mjs` — commit `19b2fb6a085acd9e1f21c63f457e4e5eff6e180f`.
- `.github/workflows/cxorbia-phase-a-r18d-visible-overlays-smoke.yml` — commit `1419b11e8d1e87dbe6856fe50c9be86ca9f99120`.

La comparación `d5fb26d...1419b11` dio cero archivos modificados. No hubo segundo empalme, nueva candidata, merge ni deploy.

## Diagnóstico focalizado del intento anterior de Hosting DEV

Se leyó la evidencia sanitizada del workflow exacto V159. El flujo pasó catorce pasos y se detuvo antes del deploy en los gates locales.

La fuente observada contenía:

- `tenantId: tya`;
- `projectId: cinepolis`;
- 14 periodos;
- 616 visitas;
- 215 shoppers en el snapshot actual;
- 44 visitas en el periodo activo;
- cero fechas numéricas crudas;
- cero submitidos tratados como liquidación/pago;
- cero errores de página o consola.

Bloqueos reproducibles del intento:

- `currentProjectId` recibió la llave del periodo `cinepolis-2026-07`;
- proyecto y periodo quedaron colapsados;
- `project()` y `ctx()` heredaron esa identidad incorrecta.

La causa no estaba en los módulos frontend. El builder temporal R18A usado en ese intento generaba el adapter con `currentProjectId = latest.id`. El builder canónico R15G ya generaba la separación correcta: proyecto `cinepolis` y periodo `latest.id`.

## Archivos modificados en el saneamiento del Corte 0

### `tools/qa/tya-source-semantics-r15g-gate.mjs`

- Deriva shopper 215/216 convertida en warning auditable bajo R11D.
- Se mantienen como blockers: conteo vacío o inválido, desajuste array/conteo, identidades inventadas, fechas crudas y contexto incoherente.
- Se registra explícitamente que el gate no materializa, completa ni elimina shoppers.
- Commits: `3132d9280d57895a93d11fe168d5ebe63471937a` y `6e36f2f2f9621d90390e9215d2f3bfa0efdceb15`.

### `app/core/build-lock.js`

- Ruta de manifest corregida de `docs/...` a `app/docs/MANIFEST-V159-EMPALME-DIRECTO-20260717.json`.
- No cambia el aggregate SHA del runtime V159.
- Commit: `28132969a6c317976ac2d109afafdb4d44f3f9cb`.

### `backend/contracts/prototype-baseline-registry-v1.json`

- Registry actualizado a transición real:
  - V131 = última baseline visual congelada y referencia de rollback;
  - V159 = runtime/candidata físicamente empalmada, pendiente de post-gates y freeze.
- Se prohíbe declarar V159 activa antes de validación visual.
- Commit: `d042245bcb7de507b27b1be0c8f78f64a9cd3ef2`.

### `tools/qa/verify-prototype-baseline-atomicity.mjs`

- Valida manifest, build-lock, registry y estado transicional V159.
- Commit: `1392e88fa76f02745ace3cd46e4bdaf5fe726192`.

### `tools/qa/verify-fast-lane-promotion-policy.mjs`

- Valida árbol runtime completo, overlays explícitos y ausencia de exclusiones silenciosas.
- Commit: `037e79d192774c45abf04c78441297053a967128`.

### `app/docs/PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md`

- Marcado como histórico superado para impedir que V113/V114 vuelva a gobernar el trabajo actual.
- Commit: `d50f87de964eda1ea2455869e0dffc370a6088d6`.

### `backend/contracts/phase-a-live-execution-checkpoint-v1.json`

- Contrato actualizado a versión 3.0.0 y al bloque `CORTE_0_V159_POST_EMPALME`.
- Gates de Hosting DEV, browser y visual pendientes; writes/proveedores/producción siguen HOLD.
- Commit: `a86126144359dbf8ba7168f62774d0a817354ad8`.

### `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`

- Eliminó dependencias de marcadores V113/V114 y ahora valida índice, plan y checkpoint canónicos.
- Commit: `39dc2fbb69323702ab0535f990eda983ee129c1f`.

### `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

- Estado actualizado a `CORTE_0_POST_GATES_RERUN_PENDING_EVIDENCE`.
- Commit: `6932a5f537f3d89f6c23d88522e511997f480483`.

## Gate reejecutado

El commit `6e36f2f2f9621d90390e9215d2f3bfa0efdceb15` volvió a activar el workflow canónico:

`.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml`

Se aceptará solo cuando los tres reportes sanitizados indiquen `ok:true` y cero blockers. No se afirma PASS mientras la evidencia no esté disponible.

## Impacto Phase A

- Se preservó todo el avance funcional y técnico de V159.
- Se eliminó una causa raíz de gates inconsistentes: múltiples estados históricos compitiendo con el runtime empalmado.
- Se mantuvo el principio de no inventar shoppers para forzar un conteo.
- Corte 0 avanzó desde “workflow restaurado” a “gobierno y gates reconciliados, rerun en validación”.
- Hosting DEV y revisión visual siguen siendo el siguiente paso; no se abrió otro corte.

## Claude/prototipo

- No se modificó frontend.
- No hay paquete nuevo para Claude.
- No solicitar V160.
- Claude solo recibe una corrección si el runtime V159 demuestra P0 frontend reproducible con archivo/módulo identificado.
- Los fixes de este bloque son gate/backend/documentación reusable, no cambios de UI que Claude deba copiar.

## Academia

- Sin cambio de contenido ni UX en este bloque.
- Debe validarse en el mismo build V159 por rol, con proyecto y periodo separados, certificaciones presentadas, manuales, notificaciones y estados honestos.
- No presentar como runtime live la lectura HR que aún sea snapshot de build DEV.

## Clasificación

- Reusable CXOrbia: transición empalme→post-gates→freeze, registry único, conteos con revisión humana y validadores canónicos.
- Exclusivo TyA/Cinépolis: conteos 14/616/44 y revisión R11D 215/216.
- Claude/prototipo: sin tarea nueva; pendiente solo ante P0 visual/frontend probado.
- Academia: validación por rol y explicación de estados source-safe/runtime.
- Sin impacto Claude: build-lock, registry, validadores, checkpoints y workflows técnicos.

## Siguiente acción

1. Recibir evidencia sanitizada del rerun y aceptar únicamente `ok:true`.
2. Ejecutar el workflow manual Hosting DEV R15G con `DEPLOY_DEV_ROOT_R15G`.
3. Ejecutar smoke remoto sobre el mismo build.
4. Entregar URL y checklist a Paula.
5. Congelar V159 como `ACTIVE_BASELINE` solo después de validación visual sin P0.

## Estado seguro

Sin deploy ejecutado en este bloque, sin merge, producción, importaciones, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
