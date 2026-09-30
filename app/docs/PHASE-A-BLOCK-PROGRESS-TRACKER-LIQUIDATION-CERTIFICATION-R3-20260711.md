# TRACKER PHASE A — liquidaciones/pagos/certificaciones R3

## Completado

- Baseline V103 empalmada.
- HR source-safe: 14 periodos, 616 visitas, 213 shoppers.
- Periodos/histórico: 13 cerrados + 1 activo.
- Ledger operativo de 572 liquidaciones hasta junio.
- Separación estricta liquidación/pago.
- Corte junio: 44 registros, país y quincena controlados.
- Gate de pago source-safe bloqueado.
- Carryover de 213 shoppers preparado sin elegibilidad inventada.
- ReviewQueue en memoria con 1,357 candidatos.
- Validadores de casos reales y negativos.

## En progreso

- Match con fuente financiera sanitizada.
- Match con certificaciones presentadas sanitizadas.
- Smoke visual source-safe por rol.

## Pendiente backend

1. Ingerir movimientos/pagos sanitizados por fuente separada.
2. Ingerir certificaciones sanitizadas por fuente separada.
3. Resolver reviewQueue con actor autenticado y auditEvents.
4. Materializar en backend nuevo limpio después del gate.
5. Conectar `CX.data` en punto único.

## Pendiente Claude

- Estados y acciones honestas en Finanzas/Beneficios/Certificación.
- P0 acumulados V103.
- Academia y manuales.

## Siguiente bloque exacto

Preparar importadores source-safe de movimientos/pagos y certificaciones con esquema de entrada, dedupe, conflictos y dry-run, sin escribir todavía.

## Gate

Predeploy HOLD.
