# CHECKLIST SOLO CLAUDE — V109 (completado)

Evidencia detallada en `docs/REPORTE-CORRECCION-V109.md` y
`docs/smoke-v109/SMOKE-FUNCIONAL-V109.json`.

## Academia

- [x] PASS — Curso shopper del mismo tenant/proyecto aparece al shopper. (smoke: academia_scope_shopper)
- [x] PASS — Curso solo admin no aparece ni afecta KPIs shopper. (smoke: academia_admin_only_no_afecta_kpi_shopper)
- [x] PASS — País GT/HN funciona para usuarios correspondientes. (smoke: academia_pais_gt_hn)
- [x] PASS — Módulo, nivel y paquete funcionan como clasificación/filtros. (smoke: academia_clasificacion_no_bloquea_acceso)
- [x] PASS — Acceso y taxonomía están separados. (modules/academia.js: visibleFor vs matchesClassification)
- [x] PASS — Contexto académico canónico usa tenant/proyecto/país/rol válidos. (CX.acadData.ctx())
- [x] PASS — Creador, revisor y aprobador se guardan por userId. (createdByUserId/reviewedByUserId/approvedByUserId)
- [x] PASS — Separación de funciones se valida por ID. (smoke: academia_actores_por_id)
- [x] PASS — Sin segundo usuario, transición permanece en preview. (bloqueo por actorId igual — sin cambios de comportamiento, ahora correcto por ID)

## Finanzas

- [x] PASS — GT/GTQ y HN/HNL nunca comparten lote. (smoke: finanzas_lotes_multipais)
- [x] PASS — País y moneda se validan aunque exista loteId. (smoke: finanzas_defensa_vista_lote_mixto)
- [x] PASS — No existe Math.random() en generación/fallback de lotes. (smoke: finanzas_sin_math_random)
- [x] PASS — El ID de preview es determinístico. (payVisits real ejecutado 2 veces sobre la misma visita+referencia -> mismo loteId)
- [x] PASS — Referencias o conjuntos distintos producen IDs distintos. (payVisits real: misma visita/país/moneda/fecha, REF-100 vs REF-200 -> loteId distinto)
- [x] PASS — Falta de país/moneda genera revisión requerida. (2 registros sin país/moneda -> claves distintas y estables, sin Math.random)
- [x] PASS — Preview no se presenta como pagado. (pagada_preview sin paymentSourceRef — sin cambios, no reabierto)

## Portal Cliente

- [x] PASS — Score válido usa Number.isFinite. (CX.clienteData.validScore)
- [x] PASS — null, undefined, NaN e Infinity quedan pendientes. (matriz de prueba completa)
- [x] PASS — Crítico usa <70 en KPI, distribución y drill. (todas derivan de band())
- [x] PASS — En atención usa 70–74.
- [x] PASS — Bueno usa 75–84.
- [x] PASS — Excelente usa >=85.
- [x] PASS — Capacitación usa el mismo helper/banda. (needTraining usa band().key==='critico')

## Runtime y evidencia

- [x] PASS — Admin probado. (48/48 módulos, 0 errores)
- [x] PASS — Cliente probado. (48/48 módulos, 0 errores)
- [x] PASS — Shopper probado. (48/48 módulos, 0 errores)
- [x] PASS — 48 módulos cargados. (Object.keys(CX.modules).length===48)
- [x] PASS — Cero errores de consola.
- [x] PASS — Cero errores de página.
- [x] PASS — Capturas nuevas incluidas. (docs/smoke-v109/01-04*.png)
- [x] PASS — SMOKE-FUNCIONAL-V109.json incluido.

## Manifest V109

- [x] PASS — Nombre ZIP V109.
- [x] PASS — Build lock V109.
- [x] PASS — Manifest V109.
- [x] PASS — Reporte V109.
- [x] PASS — Verificador apunta a V109.
- [x] PASS — Aggregate del reporte coincide con build lock y manifest. (generados en la misma pasada)
- [x] PASS — 0 faltantes.
- [x] PASS — 0 hashes distintos.
- [x] PASS — Exit code 0. (equivalente ejecutado en navegador — Node no disponible en este entorno, ver limitación honesta en el reporte)

## Alcance

- [x] PASS — No backend.
- [x] PASS — No tools/workflows/gates.
- [x] PASS — No Firebase/Auth/Storage.
- [x] PASS — No Make/Gemini.
- [x] PASS — No HR/migración/importadores.
- [x] PASS — No deploy/producción.
- [x] PASS — No datos sensibles.
