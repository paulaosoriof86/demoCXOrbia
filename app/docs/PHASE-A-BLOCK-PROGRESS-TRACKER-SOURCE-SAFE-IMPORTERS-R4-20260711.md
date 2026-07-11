# TRACKER PHASE A — importadores source-safe R4

## Completado

- V103 R3 empalmada.
- 14 periodos / 616 visitas / 213 shoppers.
- Periodos históricos separados.
- Liquidación separada de pago.
- Carryover sin inferencia.
- Importador para JSON/CSV/XLSX/XLSM.
- Pagos cruzados por llaves estables.
- Certificaciones cruzadas por shopperId/shopperCode.
- Dedupe exacto, conflictos, reviewQueue y auditEvents.
- Exclusión de campos protegidos.
- Validación JSON y XLSX: PASS.
- Dry-run sintético contra índice HR real: PASS.
- Búsqueda de fuentes limpias en repo/Fuentes documentada; no se encontró archivo utilizable todavía y la búsqueda adicional en File Library falló por error técnico.

## En progreso

- Recuperar el export limpio de pagos/movimientos ya trabajado.
- Recuperar el export limpio de certificaciones presentadas.
- Smoke visual source-safe R4.

## Pendiente backend

- Ejecutar dry-run real cuando las dos fuentes estén disponibles.
- Revisión humana de candidatos reales.
- Materialización en Firebase nueva y limpia.
- Switch único de `CX.data`.
- Auth/roles y persistencia.

## Pendiente Claude

- UI de dry-run/reviewQueue.
- Estados honestos.
- P0 acumulados V103.

## Gate

Predeploy HOLD. Import real HOLD. Materialización HOLD.

## Siguiente bloque exacto

1. Preparar el smoke visual source-safe R4 por rol y módulo mientras se recuperan los archivos limpios.
2. Ejecutar los importadores en dry-run al recibir únicamente los dos archivos puntuales faltantes.
3. No pedir nuevamente lógica HR, Q1/Q2, shoppers, montos o carryover.
4. Después del smoke y dry-run real, preparar materialización en base nueva limpia.
