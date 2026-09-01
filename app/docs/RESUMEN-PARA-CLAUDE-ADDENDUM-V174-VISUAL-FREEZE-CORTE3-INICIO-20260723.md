# RESUMEN PARA CLAUDE — V174 BASELINE Y CORTE 3 FINANZAS

**Fecha:** 2026-07-23

## Estado aprobado y preservado

V174 fue validada visualmente por Paula y continúa como baseline activa. No generar nueva candidata ni reabrir M1/Corte 1/Corte 2A.

## Verdad backend nueva que debe respetarse

### Identidad estable de visita

Versión: `tya-stable-visit-id-r20-row-identity-v1`.

Una visita se identifica únicamente por:

`tenantId + projectId + periodKey + country + sourceRow`.

No usar cinemaId, shopping, quincena, franja, shopper, fechas ni montos para construir `visitId`.

### Finanzas

La conciliación técnica vigente tiene:

- 247 filas financieras;
- 209 enlaces exactos;
- 38 filas en revisión;
- 79 entradas en review queue.

Esto no equivale a 209 pagos. Un enlace exacto solo une una fila financiera con una visita. `paid` exige fuente, fecha, lote, confirmación y referencia de auditoría.

## Próximo trabajo frontend localizado

Cuando llegue el corte visual de Finanzas, la candidata incremental debe:

1. consumir un adapter financiero canónico único;
2. hacer que Finanzas y Beneficios usen la misma verdad;
3. separar claramente:
   - realizada;
   - cuestionario;
   - submitido;
   - lista para liquidar;
   - liquidada;
   - pago pendiente de fuente;
   - pago confirmado;
   - conflicto/revisión;
4. mostrar honorario, boleto, combo/reembolso, total y moneda sin inventar valores;
5. no habilitar acciones de pago real sin gate backend;
6. conservar rutas por rol y multi-tenant/multi-proyecto.

No aplicar este frontend todavía ni mezclarlo con cambios generales del prototipo.

## Pendientes no bloqueantes ya localizados

- P1: responsive de tablas y fichas;
- P1: PDF debe incluir gráficas;
- P2: formato operativo de Excel;
- P2: etiqueta técnica `sourceAccessMode`.

## Preservar

- módulos V174;
- interfaz exacta de `CX.data`;
- lectura HR viva;
- stable visit identity;
- source locks y gates;
- multi-tenant/multi-proyecto;
- Academia y notificaciones.
