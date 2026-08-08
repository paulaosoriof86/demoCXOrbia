# ACADEMIA — IMPACTO V174 Y CORTE 3 FINANZAS

**Fecha:** 2026-07-23

## Contenidos que deben incorporarse

- identidad estable de una visita y diferencia frente a campos operativos mutables;
- uso de `hrRowId`/sourceRow como identidad protegida;
- diferencia entre enlace financiero, liquidación y pago confirmado;
- estados: realizada, cuestionario, submitido, lista para liquidar, liquidada, pago pendiente, pago confirmado y conflicto;
- review queue y revisión humana obligatoria;
- pago confirmado solo con fuente, fecha, lote, confirmación y referencia de auditoría;
- responsive real en fichas/tablas;
- calidad de exportaciones PDF y Excel.

## Rutas por rol

- **Admin/Operativo:** revisar conciliación, liquidaciones, lotes, conflictos y evidencias de pago.
- **Shopper:** consultar Beneficios y pagos sin promesas ni inferencias.
- **Cliente:** revisar resultados y exportaciones coherentes con proyecto, periodo y fuente.

## Casos de aprendizaje

- Una corrección de shopping, cinema, quincena o franja no debe cambiar la identidad de la visita.
- Un enlace exacto entre fila financiera y visita no prueba que el shopper haya recibido el pago.
- Una fila ambigua permanece en revisión y nunca se resuelve solo por nombre.
- Junio corresponde a liquidaciones/pagos pendientes de fuente, no a visitas pendientes de ejecución.

## Estado

La conciliación financiera backend tiene PASS técnico revisado. El contenido visible de Academia se sincronizará cuando el snapshot financiero canónico y su adapter hayan sido validados visualmente.
