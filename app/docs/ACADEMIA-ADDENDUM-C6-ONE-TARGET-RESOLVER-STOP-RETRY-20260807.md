# ACADEMIA — ADDENDUM C6 ONE-TARGET RESOLVER STOP_RETRY — 2026-08-07

## Patrón reutilizable documentado

Este bloque aporta un patrón de migración segura de identidad:

1. separar resolución de identidad de inspección de credenciales;
2. exigir ancla técnica exacta antes de tocar hash/salt;
3. usar fingerprints source-safe en evidencia;
4. detenerse si las anclas mínimas no alcanzan;
5. distinguir fallos source/integration de provider attempts reales;
6. mantener fail-close y one-shot request;
7. no degradar rollback verificable para acelerar producción.

## Caso CXOrbia TyA

El profile `ac93d90d9e41512acdcd` fue resuelto en la población shopper, pero sus technical/legacy keys allowlisted no enlazaron un credential login del bundle cifrado. El flujo se detuvo antes de Auth/hash/salt.

## Resultado cuantitativo

```text
shopper index query=1
shopper docs=340
Auth directory pages=0
hash config reads=0
writes=0
```

## Impacto en materiales

Actualizar cuando corresponda:

- manual técnico de migración;
- curso de seguridad/identidad;
- gate de producción;
- explicación de rollback exacto;
- ejemplo de STOP_RETRY sin pérdida operacional.

Sin cambios en rutas por rol, contenido visual de Academia ni frontend.
