# Cambios RC Phase A drift gate y cutover options

Fecha: 2026-07-06

Bloque completado:

- Se agrego drift gate para proteger la decision de RC Phase A.
- Se documento paquete de opciones de cutover para Paula.

Archivos creados:

- `tools/release/tya-rc-phase-a-drift-gate.mjs`
- `.github/workflows/cxorbia-rc-phase-a-drift-gate.yml`
- `app/docs/RC-PHASE-A-DRIFT-GATE-20260706.md`
- `app/docs/RC-PHASE-A-CUTOVER-OPTIONS-FOR-PAULA-20260706.md`
- `app/docs/CAMBIOS-RC-PHASEA-DRIFT-GATE-CUTOVER-OPTIONS-20260706.md`

Decision:

- Si despues del SHA validado `a7fb4f00cf1adf1e6e92ee7b1de897cfdbacd374` aparecen cambios runtime, no se debe avanzar sin repetir smoke.
- Si solo hay documentos/release, se conserva la decision RC Phase A controlada.

Claude:

- No hay paquete nuevo importante para Claude en este bloque.
- Avisar solo si aparece regresion visual real, incoherencia importante de Academia, ruptura del guard o pantalla critica rota.

Siguiente paso recomendado:

- Opcion 1: preview/staging controlado con integraciones apagadas.

Estado seguro: sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.
