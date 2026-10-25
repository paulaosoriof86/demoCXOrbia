# CHECKLIST CLAUDE V110 — COMPLETADO

## Academia

- [x] PASS — Shopper GT ve GT y no HN. (ctx real: `gtSeesGT:true`, `gtSeesHN:false`)
- [x] PASS — Shopper HN ve HN y no GT. (`hnSeesHN:true`, `hnSeesGT:false`)
- [x] PASS — Shopper sin país no ve contenido restringido. (`ctx().paises=[]` fail-closed → `noPaisSeesGT:false`)
- [x] PASS — Contenido global sigue visible. (`noPaisSeesGlobal:true`, `gtSeesGlobal:true`)
- [x] PASS — Contenido oculto no afecta KPIs. (mismo mecanismo de V109: `visibleCourses` alimenta KPIs/lecciones/avance/certificados; no se tocó ese cableado en esta ronda)
- [x] PASS — Admin autorizado ve catálogo completo. (`canManageTop` usa `courses` sin filtrar por `ctx()`, sin cambios)
- [x] PASS — No se usa `project.countries` como fallback shopper. (revisado en código: la rama `rol==='shopper'` ya no tiene ese fallback)
- [x] PASS — Cero errores de consola. (smoke 48 módulos × 3 roles, 0 errores)

## Finanzas

- [x] PASS — Falta país → revisión, sin cambio de estado. (`vNoPais.estado` quedó `'cuestionario'`, no `loteId`)
- [x] PASS — Falta moneda → revisión, sin cambio de estado. (`vNoMon.estado='cuestionario'`)
- [x] PASS — Faltan ambos → revisión. (`vNoBoth.estado='cuestionario'`)
- [x] PASS — Monto NaN → revisión. (corregido el bug `NaN||0`→`0`; re-probado: `vNaN` va a `reviewRequired`, estado sin cambiar)
- [x] PASS — Monto negativo → revisión. (`vNeg.estado='cuestionario'`)
- [x] PASS — Falta ID → revisión. (`id:null` y `id:''` ambos capturados)
- [x] PASS — Selección mixta procesa solo válidos. (batch de 10 ids: `pagadas:2`, `reviewRequired.length:8`)
- [x] PASS — Inválidos no reciben lote/fecha. (verificado `loteId`/`fechaPago` ausentes en los 6 inválidos con datos)
- [x] PASS — Inválidos no crean movimientos. (`movDelta:2`, ninguno atribuible a un inválido)
- [x] PASS — GT/GTQ y HN/HNL completos siguen separados. (`sameLoteMixed:false`, sin cambios respecto a V109)
- [x] PASS — IDs determinísticos preservados. (mismo par re-pagado tras reset → mismo `loteId`)
- [x] PASS — UI no presenta revisión como pagado. (toast con segmento `reviewRequired` explícito, tono `warn`, en los 2 sitios de `modules/finanzas.js`)

## Runtime

- [x] PASS — Admin probado. (`CX.app.selectRole('admin')` + nav 48 módulos, 0 errores)
- [x] PASS — Shopper probado. (`CX.app.selectRole('shopper', shopperGT.id)` + nav 48 módulos, 0 errores)
- [x] PASS — Finanzas probada. (módulo `financiero`/`lotes`/`movimientos` navegados sin error + `payVisits()` ejecutado en runtime real, no mock)
- [x] PASS — 48 módulos cargados. (`Object.keys(CX.modules).length === 48`)
- [x] PASS — Cero errores de consola.
- [x] PASS — Cero errores de página. (`get_webview_logs` sin entradas tras carga)

## Manifest V110

- [x] PASS — ZIP V110.
- [x] PASS — Build lock V110. (`core/build-lock.js` regenerado con aggregate/fileCount de esta entrega)
- [x] PASS — Manifest V110. (`docs/MANIFEST-V110.json`)
- [x] PASS — Reporte V110. (`docs/REPORTE-CORRECCION-V110.md`)
- [x] PASS — Smoke críticos V110. (`docs/smoke-v110/SMOKE-CRITICOS-V110.json`)
- [x] PASS — 0 faltantes.
- [x] PASS — 0 hashes distintos.
- [x] PASS — Exit code 0. (equivalente ejecutado en navegador — Node no disponible en este entorno; ver limitación honesta en el reporte)

## Alcance

- [x] PASS — No backend.
- [x] PASS — No tools/workflows.
- [x] PASS — No Firebase/Auth/Storage real.
- [x] PASS — No HR/migración/importadores.
- [x] PASS — No Make/Gemini.
- [x] PASS — No deploy/producción.
- [x] PASS — No datos sensibles.
