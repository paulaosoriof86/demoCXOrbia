# PENDIENTES PROTOTIPO — Addendum C6 SKIP 13 perfiles Auth

**Fecha:** 2026-08-06

## Cerrado

- Los 13 perfiles HOLD ya no bloquean el plan Auth.
- Disposición aplicada: `PRESERVE_NO_AUTH` con preservación histórica.
- Plan source-safe: 340 filas únicas, `HOLD=0`.

## Pendiente backend prioritario

1. Corregir metadata provider/autodiscovery de HR viva.
2. Confirmar `AGOSTO 26` y `AGOSTO 26 HN` desde la fuente viva.
3. Reconstruir todos los periodos e histórico con una revisión vigente.
4. Validar cambio histórico y `sourceRevision` común en Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper.
5. Preparar ejecución Auth con autorización separada, snapshot, idempotencia, readback y rollback.
6. Antes del cutover, comprobar que los 13 perfiles omitidos no reciban acceso efectivo por cuentas Auth preexistentes.

## No pendiente

No recuperar nombres, apellidos ni actividad de los 13 perfiles en este momento. Paula podrá crear o reincorporar manualmente un shopper después si lo necesita.
