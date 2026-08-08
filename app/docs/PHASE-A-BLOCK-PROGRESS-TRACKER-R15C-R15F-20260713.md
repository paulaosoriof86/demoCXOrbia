# Tracker Phase A — R15C a R15F

Fecha: 2026-07-13

## Bloques completados

| Bloque | Estado | Resultado |
|---|---|---|
| V110 empalme | COMPLETED_VERIFIED | source lock unión 1,426/1,426 |
| R10/R15F visual | PASS_WITH_REVIEW | 616 visitas, 210 shoppers, 13/13 rutas |
| R14C finanzas | PASS_WITH_REVIEW | 196/247 exactos, 51 review |
| R15C Firebase provenance | PASS_WITH_REVIEW | DEV existente confirmado CXOrbia |
| R15D CX.data read-only | PASS_WITH_REVIEW | facade 19/19, writes bloqueados |
| R15E drift canónico | HOLD_FIRESTORE_CANONICAL | HR/R14C continúan fuente canónica |
| R15F binding build | PASS | conexión source-safe determinística en copia de build |
| Source lock gate | PASS | 0 faltantes/diferencias/inesperados |
| Drift gate | PASS | V110 manifest manda |
| Predeploy | GO_WITH_WARNINGS | no autoriza deploy |
| RC smoke | GO_WITH_WARNINGS | 99 JS, 49 módulos únicos |

## Pendientes operativos reales

| Carril | Pendiente | Estado |
|---|---|---|
| Shoppers | 210/213; gap 3 | REVIEW_QUEUE |
| Finanzas | 51 de 247 filas | REVIEW_QUEUE |
| Junio | 17 filas GT faltantes | HOLD_FINANCIAL_CLOSURE |
| Certificaciones | 213 carryover sin fuente materializable | HOLD_SOURCE |
| Firestore | proyecto `cinepolis` y fuente canónica no materializados | HOLD_WRITE |
| Auth | claims nuevos/normalización | HOLD_WRITE |
| Deploy | Hosting DEV R15F | NOT_AUTHORIZED |
| Producción | cutover | HOLD |

## Qué no se reabre

- creación de nuevo Firebase;
- auditoría V110;
- source lock V110;
- R10 visual;
- adapter `CX.data` desde cero;
- conexión por parche en módulos;
- Level 0/1;
- visitas de junio como pendientes.

## Siguiente bloque exacto

`R16 — CANONICAL MATERIALIZATION PLAN DRY-RUN`

Objetivo:

- comparar HR/R14C/carryover contra Firestore existente;
- generar create/update/noop/review sin ejecutar writes;
- usar `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `paymentItemId`;
- mantener gap shopper, 51 filas financieras y certificaciones sin fuente en review;
- definir lotes, rollback y auditoría;
- preparar smoke autenticado posterior.

## Clasificación

- **Reusable CXOrbia:** plan de materialización canónica y gates separados de lectura/escritura.
- **Exclusivo cliente:** conteos y colas TyA/Cinépolis.
- **Claude/prototipo:** sin P0 nuevo; 40 hallazgos P1 acumulados.
- **Academia:** backfill sobre fuente canónica, read-only, materialización y deploy.
- **Sin impacto Claude:** CI, hashes, artifacts y service-account sanity.

## Estado seguro

Sin writes, import, deploy, producción, proveedores, pagos ni PII.
