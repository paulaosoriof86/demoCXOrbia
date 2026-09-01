# REPORTE DE CORRECCIÓN — V127 (más consumidores reales de contratos, priorizados por el gate V121)

Baseline: `Prototype development request CXOrbia V126.zip`.

## Corrección de autoevaluación previa
Al revisar el paquete V120→V121 de nuevo, se confirmó que la lista completa
de módulos priorizados para `ctx()`/`sourceContract()`/`visitContract()`
NO estaba migrada — solo 1-2 consumidores por contrato. Esta ronda agrega:

- `ctx()`: **Dashboard** (badge tenant/rol/modo bajo el encabezado).
- `sourceContract()`: **Configuración** (tarjeta "Fuente de datos (contrato)"
  en el Centro de autoadministración: modo, sync activo, advertencias,
  bloqueos).
- `visitContract()`: **Visitas** (badge de estado de pago en el modal de
  detalle de visita, junto al badge de estado existente).

Probado en runtime: los 3 consumidores nuevos renderizan valores reales.
48/48 módulos × 3 roles sin error.

## Pendiente real, no resuelto en esta ronda
Router/topbar, Mi Día, Histórico, Finanzas, Cliente, Shoppers, Importador
(para `ctx()`); HR Source ya migrado (V121), falta Integraciones/Importador/
Diagnóstico (para `sourceContract()`); Mi Día, Histórico, Finanzas,
Beneficios, Cliente, reportes/KPIs, conflictos (para `visitContract()`).
Se prioriza avanzar de forma verificable módulo por módulo en vez de
declarar la migración completa sin evidencia.

## Gate técnico
- Sintaxis: PASS (3 archivos). Smoke 48×3: sin error. Manifest V127
  regenerado, 0 diffs.
