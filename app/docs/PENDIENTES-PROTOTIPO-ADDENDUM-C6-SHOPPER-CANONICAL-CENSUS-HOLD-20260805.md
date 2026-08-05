# PENDIENTES PROTOTIPO — C6 Shopper Canonical Census HOLD

**Fecha:** 2026-08-05

## P0/P1 activos antes de Auth repair

1. Resolver 12 colisiones:
   - 1 colisión de identidad Auth;
   - 11 colisiones de `nombre.apellido`.

2. Resolver 46 perfiles activos en hold:
   - 23 con nombre canónico incompleto;
   - 23 retenidos por colisión de login.

3. Resolver identidad de Paula:
   - 1 candidata Staff;
   - 2 candidatas Shopper;
   - ninguna cuenta Shopper Auth materializada en el censo;
   - separación técnica aún no cerrada.

4. Reconciliar el baseline:
   - anterior: `21` Auth faltantes, `30` excepciones de login y `28` de contraseña;
   - censo vigente sobre mapeo actual: `0`, `9` y `7`;
   - no asumir que el drift representa reparación.

5. Convertir las acciones superpuestas en un plan de una sola fila idempotente por identidad:
   - create Auth `25`;
   - update email `1`;
   - update password `8`;
   - update claims `80`;
   - no-op `0`.

## Reglas cerradas

- `nombre.apellido / Nombre123*` es obligatorio para TyA;
- membership no es requisito Shopper;
- histórico no se elimina;
- no deduplicar por nombre;
- conflictos pasan a revisión;
- cero writes antes del siguiente gate.

## Bloques no autorizados

No ejecutar Auth/password/membership/Firestore/Rules/Storage/HR writes, deploy, Cloud Run, Make, Gemini, pagos, merge ni producción.
