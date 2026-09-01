# PENDIENTES PROTOTIPO — C6 AUTH UPDATE-UNIVERSE BATCH PLAN V4 PASS

## Cerrado

- ya no existe pendiente de resolver UPDATE_AUTH fila por fila;
- las 45 filas UPDATE v3 fueron clasificadas en un único universo;
- 36 -> `CREATE_AUTH`;
- 9 -> principal target-specific único;
- `candidateCount>1=0`;
- `unresolved=0`;
- `crossRow=0`;
- plan v4 queda `HOLD=0`.

## Pendiente real

1. preparar PREWRITE sobre plan v4 digest `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
2. validar 118 CREATE y 9 UPDATE contra provider actual;
3. inspeccionar rollback password únicamente para los 8 UPDATE existentes que conservan password change;
4. generar snapshot cifrado antes del write boundary;
5. solo con PASS y autorización separada ejecutar Auth DEV;
6. después ejecutar readback/smoke acumulativo por roles.

## No reabrir

SKIP13, multi-Auth, lineage `ac93...`, el antiguo grupo 81/46 ni los 45 UPDATE del plan v3. El plan rector es v4.

## Frontend

Sin cambio pendiente derivado de este bloque. No parchar Login/UI para compensar Auth todavía no ejecutado.
