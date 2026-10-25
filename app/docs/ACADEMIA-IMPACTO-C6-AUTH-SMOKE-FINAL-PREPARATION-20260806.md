# ACADEMIA — Impacto C6 preparación final Auth y smoke

**Fecha:** 2026-08-06

## Patrón reusable

Un plan de identidad puede estar completo por conteo y aun así no estar autorizado para escritura. Antes de ejecutar debe quedar ligado a:

- digest inmutable y lineage verificable;
- clave de idempotencia y marcador de ejecución;
- snapshot cifrado fuera del repositorio;
- rollback por tipo de operación;
- circuit breakers para colisiones y contraseñas;
- smoke multirol posterior.

## Caso CXOrbia TyA

El plan de 340 filas obtuvo freeze e idempotencia PASS, pero el gate general quedó HOLD porque una identidad omitida conserva dos candidatos Auth habilitados y verificados. Esto demuestra que `HOLD=0` en el plan no sustituye la validación de acceso efectivo.

## Manuales y cursos

Agregar una lección sobre:

1. diferencia entre preparación estructural y autorización operacional;
2. rollback de Auth y memberships;
3. tratamiento fail-closed de identidades omitidas;
4. smoke Admin/Operaciones, Shopper y Cliente.

No hay cambios en rutas por rol, notificaciones o interfaz de Academia.
