# CAMBIOS BACKEND — Reservas con fuente canónica y fail-closed Corte 6

**Fecha:** 2026-07-31  
**Estado:** CODE PASS / PENDIENTE EVIDENCIA FINAL / PENDIENTE HOSTING DEV

## 1. Auditoría
El código de `app/modules/reservas.js` todavía usaba:
- `localStorage` como fuente de reservas;
- semillas `Evaluador 01/02` cuando el gate de fixtures lo permitía;
- el mes del reloj mediante `new Date()` como periodo de reservas;
- mutaciones locales y cruce con write-back desde el navegador.

Eso no puede presentarse como dato conectado de backend ni como operación real Phase A.

## 2. Solución DEV segura
Nuevo `app/adapters/tya-canonical-reservations-guard-v2.js`:
- periodo/proyecto tomados del modelo canónico;
- fuente únicamente `CX.data.__protectedReservations` cuando exista, o lista vacía honesta;
- localStorage deja de ser fuente en DEV conectado;
- fixtures deshabilitados;
- reservar/cambiar estado/eliminar/cruzar bloqueados hasta conectar fuente canónica;
- banner visible de fuente pendiente;
- cero `fetch`, Firebase, HR write-back o provider writes.

No se afirma que la operación de Reservas ya esté conectada. Se evita que datos locales o demo se confundan con datos reales.

## 3. Gate
`tools/qa/tya-c6-reservations-source-guard-gate.mjs` verifica:
- periodo canónico;
- localStorage no usado como fuente;
- fixtures deshabilitados;
- mutaciones fail-closed;
- fuente protegida o vacía;
- ausencia de providers/writes;
- copy honesto.

## 4. Próximo bloque real de Reservas
Para habilitar operación se requiere posteriormente:
`CONTRATO DE RESERVAS POR TENANT/PROYECTO → FUENTE BACKEND → RULES/SCOPE → WRITE PLAN → AUTORIZACIÓN → READBACK/SMOKE`.

No se mezcla con el redeploy Hosting de visualización read-only.

## 5. Claude/prototipo
Claude debe retirar localStorage como fuente conectada y mantener:
- source adapter configurable;
- periodo canónico;
- identidad Shopper exacta;
- dedupe por IDs de reserva/sucursal/periodo/shopper;
- estados trazables;
- fail-closed si no hay proveedor;
- copy honesto.

## 6. Estado seguro
Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos/reservas writes0; merge=false; producción=false.
