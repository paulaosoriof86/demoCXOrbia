# ACADEMIA — ADDENDUM C6 AUTH PLAN V4 PREWRITE HASH-CONFIG STOP

**Fecha:** 2026-08-07

## Registro técnico para materiales

El bloque demuestra un patrón reutilizable de migración Auth: un plan de identidad puede estar cerrado y aun así un gate de infraestructura administrativa debe detener la activación si no puede demostrarse rollback exacto.

Secuencia documentable:

1. consumir un freeze inmutable y digest exacto;
2. validar universo CREATE/UPDATE y unicidad antes de material sensible;
3. limitar hash/salt solo a usuarios con password change real;
4. exigir configuración de hash legible y snapshot cifrado roundtrip antes de writes;
5. aplicar STOP_RETRY si un gate administrativo falla;
6. no confundir fallo de transporte/API con reapertura de identidad;
7. usar verificación estructural de PII, no regex de nombres de campos.

El caso terminó en `HASH_CONFIG_HTTP_400` antes de Auth writes. La causa source-only apunta a forma incorrecta del GET de configuración (`mask=hashConfig` no corresponde al método GET documentado). No hubo re-test provider en el mismo bloque.

## Impacto en cursos/manuales/rutas por rol/notificaciones

- Cursos técnicos: incorporar el patrón fail-close y distinción `getConfig` vs `updateConfig`.
- Manual de operación: sin cambio para Admin, Operaciones, Shopper o Cliente.
- Rutas por rol: sin cambio.
- Notificaciones: sin cambio.
- Academia interactiva: preservar el freeze v4 como ejemplo de source lock y no reabrir decisiones cerradas por un error de API.
