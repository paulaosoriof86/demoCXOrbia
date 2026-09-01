# RESUMEN PARA CLAUDE — R18D HOTFIX PASS

Fecha: 2026-07-15

## Estado

- Baseline activa: V131.
- Candidata de transporte recibida: versión interna V132.
- El P0 `TypeError: data.period is not a function` quedó cerrado.
- Workflow R18D: `29437465036` — `PASS_R18D_VISIBLE_OVERLAYS`.
- No se requiere otra candidata ni otro paquete para este P0.

## Reconciliación aplicada

La candidata contenía el fix requerido dentro de `app/core/finanzas-core.js`, pero su archivo completo también regresaba `porPais()` de `data.project()` a `data.period()` respecto de la baseline empalmada.

Se promovió únicamente la combinación correcta:

- `porPais()` conserva `data.project()`.
- El adapter local de `serieMensual()` expone `project()`, `period()` y `visitas()`.

No se importaron el `build-lock` ni el manifest V132 del paquete porque describían el árbol prototipo, no la unión runtime V131 activa.

## Validación

- Finanzas renderiza.
- Shoppers renderiza con 216 referencias.
- Certificación renderiza en HOLD/pendiente de fuente.
- 14 periodos, 616 visitas, 44 visitas del periodo activo.
- 196 controles financieros exactos y 92 revisiones financieras.
- 0 errores de consola o página.
- 0 pagos, lotes o certificaciones confirmadas.
- 0 writes, imports, deploy o producción.

## Instrucciones de continuidad para Claude

- No reabrir este P0.
- No volver a cambiar `porPais()` a `data.period()`.
- No generar otra candidata por este hallazgo.
- No modificar R11D, R14C, HR, histórico, shoppers ni carryover de certificaciones.
- Mantener estados honestos de pago/certificación y separación proyecto/periodo.

## Clasificación

- `Reusable CXOrbia`: todo adapter local debe satisfacer el contrato completo requerido por sus consumidores.
- `Exclusivo cliente`: conteos y overlays TyA/Cinépolis.
- `Claude/prototipo`: P0 cerrado; sin tarea nueva inmediata.
- `Academia`: sin cambio de curso; mantener explicación de proyecto, periodo y estados financieros honestos.
- `Sin impacto Claude`: source lock, manifest heredado, registry y workflow.
