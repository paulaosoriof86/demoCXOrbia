# PHASE A — INICIO CORTE 3 FINANZAS

**Fecha:** 2026-07-23  
**Estado:** INICIADO · READ-ONLY · SIN PRODUCCIÓN NI WRITES

## Objetivo

Cerrar la verdad financiera operativa de TyA/Cinépolis sin confundir ejecución, cuestionario, submitido, liquidación y pago.

## Fuente y estado recuperado

- El envelope source-safe mantiene `sourceStatus=pending_financial_source`.
- La afirmación operativa vigente es: pagado hasta mayo 2026, todavía pendiente de cruce con fuente; junio requiere match por ítem.
- No existen pagos ni lotes importados en el envelope actual.
- La reconciliación R14C registró 247 filas financieras, 196 enlaces operativos exactos aceptados, 51 filas para revisión y 92 entradas en review queue.
- Junio tiene 17 filas financieras GT y 10 HN, pero cero enlaces exactos aceptados en el reporte R14C; no se puede marcar pagado por inferencia.

## Reglas duras

1. `liquidada` no equivale a `paid`.
2. Fecha realizada no puede usarse como `paidAt`.
3. `paid` exige fuente, fecha, lote, confirmación y referencia de auditoría.
4. No deduplicar ni cruzar solo por nombre.
5. Conflictos pasan a revisión humana.
6. Referencias bancarias deben ser opacas; no subir datos bancarios crudos.
7. Hasta mayo solo puede mostrarse como pagado cuando la fuente financiera lo confirme por llave estable.
8. Junio corresponde a liquidaciones/pagos pendientes; no a visitas pendientes de ejecución.

## Alcance del bloque

- honorario base;
- boleto;
- combo o reembolso;
- total y moneda;
- estado de liquidación separado del pago;
- lotes y movimientos;
- Beneficios del shopper coherente;
- configuración multi-tenant y multi-proyecto.

## Llaves obligatorias

`tenantId`, `projectId`, `periodKey`, `visitId`/`hrRowId`, `shopperId`, `liquidationId` y `paymentBatchId`.

## Primera secuencia

1. inventariar fuentes financieras vigentes y su cobertura;
2. reconciliar por llaves estables contra la HR R20 actual;
3. separar exactos, faltantes, ambiguos y conflictos;
4. producir matriz de gaps y review queue sanitizada;
5. validar que Finanzas, Beneficios, lotes y exportaciones consuman la misma verdad;
6. abrir Hosting DEV solo después de gates y autorización específica.

## Estado seguro

Cero import real, pagos, Firestore/Auth/Storage/HR writes, Make/Gemini, merge o producción.
