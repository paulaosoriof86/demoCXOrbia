# Tracker Phase A — Firebase read-only + HR viva source-safe

Fecha: 2026-07-10

## Bloque completado

- Firebase DEV consultado read-only con autorización.
- Resultado: no limpio, revisión requerida.
- HR viva TyA consultada y sanitizada.
- Fila resumen HN excluida mediante ID Cinema obligatorio.
- Conteos finales: 14 periodos, 28 tabs, 616 visitas, 213 shoppers protegidos.
- Auditoría semántica del runtime realizada.

## Impacto real Phase A

Se probó la fuente HR viva que alimentará la visualización y se bloqueó correctamente la conexión a un backend DEV con residuos. El avance deja de depender de data demo como evidencia, pero la UI aún requiere bindings focalizados antes de la revisión visual humana.

## Hecho

- real-data proof de HR viva;
- conteos GT/HN y periodos;
- referencias shopper opacas;
- estados HR y montos source-safe;
- clean-state Firebase real;
- no-deletion y fail-closed;
- hallazgos Claude/Academia documentados.

## Preview/preparado

- payload browser source-safe;
- bridge `CX.data` preservado como referencia;
- Hosting DEV como superficie visual aislada;
- paquetes de Claude para binding crítico.

## Bloqueado

- uso de `cxorbia-backend-dev` para Auth/Firestore;
- deploy visual antes del binding focalizado;
- Auth/claims/rules/import/writes;
- HR writeback y providers;
- producción.

## Siguiente bloque exacto

`Corrección focalizada Claude → reauditoría/source lock → build preview HR source-safe → autorización deploy Hosting DEV → revisión visual Paula`.

No se debe iniciar limpieza del Firebase actual ni volver a pedir HR, shoppers, certificaciones, reglas o liquidaciones.

## Clasificación

- Reusable CXOrbia: clean-state, source-safe, no-deletion, llaves válidas de filas.
- Exclusivo cliente: TyA/Cinépolis, GT/HN, 616 visitas y reglas de junio.
- Claude/prototipo: binding y eliminación de demo operativo.
- Academia: rutas, manuales, checklists y estados honestos.
- Sin impacto Claude: runs/digests internos.
