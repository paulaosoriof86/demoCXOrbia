# VALIDACIÓN VISUAL V174 — APROBADA CON PENDIENTES P1/P2

**Fecha:** 2026-07-23  
**Entorno:** Hosting DEV  
**Build:** V174 / R20 / M1 / Corte 2A  
**Decisión de Paula:** aprobar la validación visual, documentar los hallazgos no bloqueantes y avanzar al siguiente bloque de Phase A.

## Evidencia observada

La captura móvil confirma que la aplicación inicia, muestra navegación, rol TyA, ficha de visita, ubicación, estado, proyecto, quincena, franja, canal, escenario, fecha disponible y acción de detalle.

## Hallazgos aceptados como no bloqueantes

1. **P1 — Responsividad parcial:** algunas tablas y fichas conservan ancho rígido o aprovechan mal el viewport móvil. En la evidencia, la tarjeta queda concentrada a la izquierda y deja una zona amplia sin uso.
2. **P1 — Exportación PDF incompleta:** los reportes PDF no incluyen las gráficas visibles en pantalla.
3. **P2 — Presentación Excel:** la exportación Excel entrega datos sin formato visual suficiente.

Estos hallazgos no impiden la operación validada, no reabren V174, no requieren nueva candidata ni bloquean el freeze de Corte 2A. Deben resolverse como mejoras localizadas del prototipo comercializable y verificarse en un corte posterior de UX/exportaciones.

## Freeze

Se aprueba congelar V174 como baseline visual vigente para M1/Corte 1 y Corte 2A.

- Source lock: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Aggregate: `ab11bc47dfd096cbe6a110db250c46e656c2dc9760ad832c07958b6c9a886818`.
- Hosting DEV: desplegado.
- Producción: no autorizada.
- Merge: no autorizado.
- Writes reales: 0.

## Siguiente bloque exacto

`CORTE 3 — FINANZAS`: honorarios, boleto, combo/reembolso, total, moneda, liquidaciones y pagos con fuente financiera; nunca inferir pago desde HR, realizada, cuestionario o submitido.
