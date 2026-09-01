# Cambios RC Phase A predeploy gate

Fecha: 2026-07-06

Bloque completado:

- Se agrego predeploy gate seguro para validar configuracion antes de preview/staging o produccion controlada.

Archivos creados:

- `tools/release/tya-rc-phase-a-predeploy-gate.mjs`
- `.github/workflows/cxorbia-rc-phase-a-predeploy-gate.yml`
- `app/docs/RC-PHASE-A-PREDEPLOY-GATE-20260706.md`
- `app/docs/CAMBIOS-RC-PHASEA-PREDEPLOY-GATE-20260706.md`

Validaciones principales:

- Firebase Hosting public app.
- Target dev cxorbia-dev.
- .firebaserc dev.
- Headers UTF-8.
- Guard de copy cargado en orden correcto.
- Herramientas de smoke/drift presentes.
- Escaneo basico de secretos/patrones sensibles.

Decision:

- Este gate prepara la ruta recomendada de preview/staging controlado.
- No ejecuta deploy.
- No autoriza reglas, Firestore, Auth, Storage, HR writes, Make, Gemini, imports ni pagos reales.

Claude:

- No hay pendientes nuevos importantes para Claude en este bloque.

Estado seguro: sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.
