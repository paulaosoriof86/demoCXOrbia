# TRACKER PHASE A — bloque periodo/histórico V103

## Completado

- Empalme V103.
- HR source-safe 14 periodos / 616 visitas / 213 shoppers.
- Integridad operacional de periodos e histórico con fail-closed.
- 13 periodos históricos cerrados + julio 2026 activo.
- 44 visitas activas y 572 históricas, sin cruces entre periodos.
- Contrato, snapshot sanitizado, validador reproducible y workflow CI.

## En progreso

- Estado de pago separado de liquidación.
- Carryover de certificaciones.

## Pendiente backend

- Mapear movimientos/pagos reales sanitizados al corte junio.
- Materializar carryover revisado por shopper/proyecto.
- Preparar base nueva limpia y adapters persistentes después del gate.
- Ejecutar smoke visual sobre la entrada TyA source-safe y no sobre demo.

## Pendiente Claude

- Filtro inicial de Histórico.
- Copy de acciones de periodo.
- P0 acumulados V103.

## Gate

Predeploy HOLD.

## Siguiente bloque exacto

Adapter source-safe de liquidación/pago de junio y carryover de certificación, usando llaves estables y revisión humana.
