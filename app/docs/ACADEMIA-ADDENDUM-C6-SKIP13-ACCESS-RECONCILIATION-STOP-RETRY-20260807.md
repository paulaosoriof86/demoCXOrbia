# ACADEMIA — Addendum C6 SKIP13 access reconciliation

## Aprendizaje reusable

El bloque demuestra que `HOLD=0` en un plan lógico no equivale a ausencia de acceso proveedor preexistente. Antes de ejecutar una migración Auth deben reconciliarse las identidades omitidas contra el estado efectivo de autorización.

Patrón documentado:

1. preservar el freeze original;
2. aplicar un overlay source-safe por fingerprint;
3. clasificar candidatos solo con evidencia técnica autorizada;
4. comprobar una operación primaria por perfil y conteo total;
5. detener la ejecución si un perfil tiene múltiples Auth efectivos y no existe discriminador seguro;
6. prohibir selección por antigüedad, orden de retorno o señales débiles.

Resultado TyA: siete perfiles se reconciliaron como Auth canónico vigente; un perfil conserva dos candidatos efectivos sin keeper demostrable. El plan provisional queda 340/340 único pero `HOLD=1`, por lo que el sistema aplica STOP_RETRY.

No hubo datos personales exportados, writes ni producción.
