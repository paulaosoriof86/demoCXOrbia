# Cambios — Firebase DEV clean-state read-only gate

Fecha: 2026-07-10

## Archivos creados

- `backend/contracts/phase-a-firebase-dev-clean-state-read-only-gate-v1.json`;
- `backend/config/phase-a-firebase-dev-clean-state-read-only.source-safe.json`;
- `tools/release/tya-firebase-dev-clean-state-read-only.mjs`;
- `tools/release/tya-firebase-dev-clean-state-read-only-gate-validate.mjs`;
- `.github/workflows/cxorbia-firebase-dev-clean-state-read-only-run.yml`;
- `.github/workflows/cxorbia-firebase-dev-clean-state-read-only-gate.yml`;
- documentación de cambios, Claude, pendientes, Academia y tracker.

## Qué se preparó

- verificación read-only de identidad del proyecto;
- conteo sanitizado de usuarios Auth;
- booleanos de configuración Auth;
- detección de contenido Firestore sin leer campos;
- detección de objetos Storage sin mostrar nombres;
- detección de Functions sin mostrar nombres/configuración;
- conteo de releases de reglas sin leer contenido;
- decisiones clean/nonempty/inconclusive/target-mismatch;
- manual workflow con confirmación explícita;
- static gate automático sin credenciales ni provider calls.

## Controles

- el workflow proveedor es `workflow_dispatch` únicamente;
- exige `VERIFY_FIREBASE_DEV_READ_ONLY`;
- usa secret fuera del repo;
- elimina la credencial temporal en `always()`;
- sube solo el reporte sanitizado;
- no contiene métodos de escritura, deploy, import o producción;
- cualquier recurso detectado exige revisión humana, nunca borrado automático.

## Estado

Gate preparado, no ejecutado.

- provider calls: 0;
- Auth users/claims: 0 cambios;
- Firestore/Storage/Functions: 0 reads reales en este bloque y 0 writes;
- rules/Hosting deploy: 0;
- import/producción: 0.

## Impacto Phase A

Cierra la preparación para confirmar que Firebase DEV no contiene residuos antes de conectar HR, shoppers, certificaciones, liquidaciones, reviewQueue o `CX.data`.

## Clasificación

- **Reusable CXOrbia:** patrón read-only sanitizado y no-deletion.
- **Exclusivo cliente:** ninguno; no se leen datos TyA.
- **Claude/prototipo:** estados honestos de verificación.
- **Academia:** interpretación y escalamiento.
- **Sin impacto Claude:** APIs, secret temporal y artifacts.
