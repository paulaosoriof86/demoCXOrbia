# CAMBIOS BACKEND — materialización Firestore R6

## Archivos creados

- `backend/contracts/phase-a-firestore-materialization-plan-v1.json`;
- `backend/config/phase-a-firestore-collection-map-v1.json`;
- `backend/config/phase-a-firestore-materialization-r5-summary.source-safe.json`;
- `tools/migration/tya-phase-a-build-firestore-materialization-plan.mjs`;
- `tools/migration/tya-phase-a-firestore-materialization-plan-validate.mjs`;
- `tools/migration/tya-phase-a-firestore-materialization-fixture-validate.mjs`;
- tres fixtures pequeños source-safe;
- workflow CI de validación;
- documentación de Phase A, Claude, prototipo, Academia y tracker.

## Cambio funcional

Se genera un plan Firestore real y determinístico desde R5, con operaciones, rutas, precondiciones y partición por lotes. El plan completo permanece como artefacto local; en GitHub solo se guarda código, fixture y resumen sin filas TyA.

## No reabierto

- HR multi-tab;
- periodos;
- shoppers;
- liquidación/pago;
- carryover;
- importadores R4;
- bridge `CX.data` disabled;
- frontend V104.

## Estado seguro

Sin escritura Firestore, Auth, Storage, HR writeback, deploy, merge, Make, Gemini, pagos o producción.
