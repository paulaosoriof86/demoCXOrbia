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

## En progreso

- Ubicar las fuentes limpias de pagos y certificaciones previamente trabajadas.
- Ejecutar dry-run real cuando estén disponibles.
- Smoke visual source-safe R4.

## Pendiente backend

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

1. Buscar y recuperar las fuentes limpias ya trabajadas de pagos y certificaciones presentadas.
2. Ejecutar los importadores en dry-run sin pedir nuevamente la lógica.
3. Si las fuentes no están en repo/Fuentes, pedir únicamente los archivos puntuales faltantes.
4. Paralelamente preparar smoke visual source-safe R4.
