# Pendientes prototipo — addendum R15C a R15F

Fecha: 2026-07-13

## P0

No se detectó P0 frontend nuevo.

V110 renderiza correctamente con el binding source-safe de build:

- 13/13 rutas;
- 0 errores de página;
- 0 errores de consola;
- 0 blockers.

No pedir nueva candidata Claude por este bloque.

## P1 acumulado

1. Revisar los 40 hallazgos del scanner de copy cuando se prepare el siguiente paquete Claude; son revisión de texto acumulada, no activación real ni bloqueo del runtime.
2. Mantener estados visibles distintos para:
   - fuente HR source-safe;
   - Firebase read-only;
   - pendiente materialización;
   - reviewQueue;
   - pago confirmado.
3. No mostrar Firestore como fuente canónica hasta que exista materialización reconciliada.
4. Mantener visible y honesto el gap shopper 210/213.
5. Mantener liquidaciones R14C como 196 enlaces exactos y 51 filas en revisión; no convertir control administrativo en pago.
6. No mostrar certificaciones carryover como importadas mientras la fuente materializable siga pendiente.

## No tocar desde prototipo

- `backend/`;
- `tools/`;
- `.github/workflows/`;
- `app/docs/MANIFEST-V110-UNION-EMPALME-R1.json`;
- adapters y gates R15C–R15F;
- secretos, rules, imports o proveedores.

## Clasificación

- Reusable CXOrbia: estados de fuente y materialización.
- Exclusivo TyA: conteos y colas actuales.
- Claude/prototipo: P1 de copy/estados honestos.
- Academia: actualizar conceptos cuando haya próximo paquete.
- Sin impacto Claude: CI, hashes y lecturas proveedor.
