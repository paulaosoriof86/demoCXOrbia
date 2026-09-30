# PENDIENTES PROTOTIPO — Addendum C6 fast-track de producción source-only

**Fecha:** 2026-08-06

## P0 vigentes

1. Reconciliar evidencia terminal del request HR `ac2032ec224e6d56bf087788b949691b6690c437`.
2. Confirmar HR viva `2026-08`, GT/HN, mutación histórica y `sourceRevision` transversal.
3. Ejecutar Auth Shopper con gate separado y `HOLD=0`.
4. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Materializar un target de producción distinto del DEV versionado.
6. Completar validación humana, rollback y autorización específica de cutover.

## Hallazgo nuevo

`.firebaserc` y `firebase.json` solo contienen el proyecto/target/servicio DEV. No existe carril de producción versionado. Esto es un P0 de cutover, no un problema de frontend.

## No hacer

- no desplegar el target DEV como si fuera producción;
- no apuntar el backend nuevo a la base legacy;
- no emitir segundo request HR;
- no ejecutar Auth o deploy sin gate separado;
- no modificar UI para ocultar estos bloqueos.
