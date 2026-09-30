# REPORTE DE CORRECCIÓN — V120 (Importador: OLA2, backlog ítem 3)

Baseline: `Prototype development request CXOrbia V119.zip`.

## OLA 2 — Importador: dry-run con accepted/duplicates/conflicts/discarded

**Análisis IA (tab principal):** cada entidad detectada ahora declara
`counts:{accepted, duplicates, conflicts, discarded}` (antes solo
`buenos`/`malos` agregados sin desglose por categoría). Se renderiza como
badges por tarjeta de entidad y viaja al `reviewQueue` al confirmar
(`commitEntity`), reflejado también en el toast de confirmación.

**HR clásica (dry-run real contra el proyecto):** `core/importador.js
diff()` antes trataba CUALQUIER coincidencia de llave natural
(sucursal+ciudad+escenario+quincena) como "duplicado" y la omitía en
silencio — incluyendo el caso real de **conflicto** (misma sucursal+fecha,
pero shopper u honorario distinto entre la HR entrante y la visita ya
existente en la plataforma), que se descartaba igual que un duplicado
exacto sin que nadie lo viera. Ahora `diff()` devuelve 4 categorías:
`nuevos`, `dups` (duplicado exacto, se omite), `conflicts` (retenido,
requiere revisión humana, muestra HR vs. existente lado a lado) y
`discarded` (fila sin sucursal/fecha válida, dato insuficiente para dedupe
real). La vista de confirmación muestra las 4 categorías con badges y una
tabla de detalle de conflictos (HR vs. existente).

**Probado en runtime con fixture real:** 4 filas de prueba → 1 nuevo, 1
duplicado exacto, 1 conflicto (detectado correctamente: HR trae "Otro
Shopper"/$300, la plataforma ya tenía "María García"/$250 en esa
sucursal+fecha), 1 descartado (fila vacía). 48/48 módulos × 3 roles sin
error.

## Resto de OLA2 (visitas/postulaciones/certificaciones/liquidaciones ya
verificados como resueltos en sesiones previas; CRM/documentos/configuración
tenant siguen NO_ATENDIDO) y OLA3 completo: sigue pendiente.

## Gate técnico
- Sintaxis: PASS (2 archivos). Smoke 48×3: sin error. Manifest V120
  regenerado, 0 diffs.
