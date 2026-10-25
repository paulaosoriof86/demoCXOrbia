# Pendientes prototipo — después de Firebase read-only y HR viva TyA

Fecha: 2026-07-10

## P0 antes de revisión visual humana

- Cargar payload HR source-safe y adapter en el runtime antes de `app.js`.
- Mantener ID de proyecto estable y IDs de periodo únicos.
- Sustituir datos demo operativos de `modules/cert.js` por carryover source-safe o estado pendiente honesto.
- Sustituir lotes/evaluadores demo de `modules/finanzas.js` por control source-safe de liquidaciones/pagos.
- Impedir que correo, notificaciones y soporte demo se presenten como hechos TyA reales.
- Mostrar indicador `DEV TyA · HR viva source-safe · no importado`.

## P1 posterior al GO visual

- Consolidar detalle de certificaciones históricas por shopper/proyecto mediante referencias opacas y revisión humana.
- Consolidar movimientos de pago hasta mayo y pendientes de junio sin datos bancarios crudos.
- Revisar warnings históricos de `Disponible desde` ausente entre junio 2025 y febrero 2026.
- Preparar un Firebase backend nuevo y vacío; no reutilizar el actual no limpio.

## Bloqueado

- Auth users/claims;
- reglas y protected reads;
- Firestore imports/writes;
- HR writeback;
- Make/Gemini/Storage;
- pago real;
- producción.
