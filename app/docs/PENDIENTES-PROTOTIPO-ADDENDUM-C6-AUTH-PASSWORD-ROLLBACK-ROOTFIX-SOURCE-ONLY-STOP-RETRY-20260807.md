# PENDIENTES PROTOTIPO — ADDENDUM C6 PASSWORD ROLLBACK ROOT FIX

**Fecha:** 2026-08-07

## Pendiente vivo único de este bloque

El profile fingerprint `ac93d90d9e41512acdcd` sigue bloqueando la activación Auth porque el estado password previo exacto no puede reconstruirse con las fuentes source-only autorizadas.

No es un bug frontend y no debe resolverse con UI, reset silencioso ni compensación implícita.

### Alternativa mínima

Requiere autorización separada para un único provider/Auth read-only focal que determine, sin writes:

1. si el `passwordHash` actual puede exportarse;
2. si `passwordSalt` está legítimamente vacío/nulo o simplemente no fue expuesto;
3. qué algoritmo/configuración permite restaurar el hash exacto;
4. si puede generarse un snapshot cifrado completo antes de cualquier write posterior.

Si el hash actual continúa inaccesible, se necesitará una decisión expresa separada del tenant para relajar el requisito de rollback exacto solo para ese target.

## Preservado

Plan final 340/340 HOLD=0, SKIP13 cerrado, adjudicación multi-Auth cerrada, frontend, CX.data, HR, visitas, certificaciones, liquidaciones/pagos y producción sin cambios.
