# PENDIENTES PROTOTIPO — Corte 4 read-only — 2026-07-29

## Estado

Corte 3 está congelado. Corte 4 no tiene P0 funcional abierto, pero la activación del proveedor permanece bloqueada por gates reales.

## Bloqueantes para activar lectura DEV

1. Confirmar que `cxorbia-backend-dev` sea el proyecto Firebase nuevo y limpio autorizado.
2. Verificar que Firestore esté vacío para el tenant/proyecto inicial.
3. Verificar credenciales/config DEV sin secretos en repo.
4. Validar y autorizar el candidato `backend/rules/firestore.corte4-readonly.rules`.
5. Desplegar Rules read-only solo con autorización expresa.
6. Ejecutar `cxdata-firestore-readonly-corte4-gate.mjs`.
7. Smoke de backend vacío:
   - source=firestore;
   - empty=true;
   - fallbackUsed=false;
   - writes=0;
   - interfaz CX.data preservada.

## Hallazgo vigente

`firestore.rules` actual permite create/update/delete por rol. No puede usarse para la activación read-only de Corte 4.

## No bloqueantes heredados

- PDF sin gráfica visible.
- Excel con formato básico.
- reportKit transversal.
- copy de fuentes.
- registry/gate R20 antes de producción.

## Prohibiciones

- No activar base preexistente/legacy.
- No copiar la base vieja.
- No deploy de Rules sin gate/autorización.
- No writes/imports/pagos/lotes/Make/Gemini.
- No reabrir Corte 3 por P1/P2.
