# Auditoría de la devolución Claude — fix parcial post-V156

Fecha: 2026-07-17

## Resultado

`HOLD_DEVOLUCION_PARCIAL_NO_CIERRA_PAQUETE_ACUMULADO`

## Evidencia objetiva

- Fuente original: `Prototype development request CXOrbia V156.zip`.
- SHA original: `d25a9de150d0f3e8e3b83916e98196ff71bf1346aab8a2a986a66e107ca056de`.
- Devolución: `Prototype development request fix.zip`.
- SHA devolución: `e7f7962fb37253d305018b653e1436893260a1c57f2d289c1e814c6cd914d9d2`.
- Ambos ZIP contienen 256 archivos.
- Delta: 1 archivo modificado, 0 agregados y 0 eliminados.
- Único archivo modificado: `app/modules/configuracion.js`.

## Cambio válido preservable

Se mapeó `source_safe_preview` a `Vista previa` y se cambió `sync activo` por `sincronización activa`.

## Problemas abiertos

- El fallback `|| sc.sourceReadMode` puede volver a mostrar un valor interno desconocido.
- Sigue visible el rótulo técnico `Fuente de datos (contrato)`.
- No se revisó ni corrigió el resto de módulos acumulados.
- `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md` siguen en V82.
- Build-lock y reporte siguen identificando V156.

## Manifest

La devolución conserva `MANIFEST-V156.json` sin regenerar:

- hash y tamaño de `modules/configuracion.js` no coinciden;
- aggregate esperado: `0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305`;
- aggregate recalculado: `4347cd72ded7a43270e24e815dad94efbef8d07c9bd88846bdd1ad6d897e851c`;
- resultado: 3 diferencias.

## Archivos adicionales que requieren revisión frontend

`core/topbar.js`, `core/automations.js`, `core/manuales-data.js`, `modules/hr-source.js`, `modules/administrabilidad.js`, `modules/cert.js`, `modules/crm.js`, `modules/importador.js`, `modules/postulaciones.js`, `modules/academia.js` y los demás módulos incluidos en la matriz acumulada.

## Decisión

No empalmar esta devolución. Preservarla como nueva fuente de trabajo porque contiene un cambio válido y entregar a Claude el paquete V2, que exige cerrar toda la matriz frontend y Academia sin detenerse tras el primer hallazgo.

Estado seguro: sin empalme, merge, deploy, producción, imports, writes, proveedores live ni pagos.