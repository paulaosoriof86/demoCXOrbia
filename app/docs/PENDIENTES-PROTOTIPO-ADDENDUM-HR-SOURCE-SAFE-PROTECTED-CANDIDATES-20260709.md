# Pendientes prototipo - HR source-safe protected candidates

Fecha: 2026-07-09

## Para Claude/prototipo

Representar de forma generica el flujo:

1. Fuente viva/source genera payload source-safe.
2. Payload source-safe genera candidatos.
3. Candidatos entran a revision o quedan preparados.
4. Nada se escribe como import real sin GO.
5. Datos completos requieren Auth/roles.

## UI esperada

- Estado `dry-run`.
- Estado `source-safe`.
- Estado `pendiente review`.
- Estado `no escrito`.
- Boton o mensaje `requiere acceso` para perfil protegido.
- ReviewQueue visible como flujo generico.
- Certificaciones preservadas como candidate/carryover.
- Liquidaciones como preview/review, no pago real.

## Prohibido

- Presentar candidatos como datos importados reales.
- Mezclar preview source-safe con perfil completo.
- Prometer pago real.
- Prometer writeback real.
- Hardcodear tenant, proyecto o fuente.
