# CAMBIOS BACKEND — Corte 4 provider IAM — 2026-07-29

## Resultado

`READONLY_STATIC_PASS_PROVIDER_IAM_BLOCKED`

## Cambios funcionales/backend

- `tools/release/cxorbia-probe-firebase-project-identity-corte4.mjs`: probe OAuth nativo, read-only y acotado.
- `tools/release/cxorbia-verify-new-empty-firebase-dev-corte4.mjs`: OAuth nativo RS256, sin dependencia npm, provider reads acotadas.
- `tools/release/tya-create-new-empty-firebase-dev-r15b.mjs`: creación atómica nativa y acotada; solo project create + addFirebase.
- workflows/provider requests de Corte 4: selección de la primera credencial estructuralmente válida, estados observables y evidencia source-safe.

## Evidencia

- Preflight: ruta válida `existing_dev_service_account`.
- Probe: `TARGET_PROJECT_PERMISSION_DENIED_C4`.
- Creación: `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`.
- Proyecto creado=false.
- Firebase agregado=false.
- Base existente reutilizada=false.
- Firestore/Auth/Storage/Rules/Hosting writes=0.

## Causa raíz

La única service account válida disponible no tiene permisos IAM para crear o verificar el proyecto nuevo. El bloqueo no está en GitHub, el prototipo, `CX.data` ni el gate read-only.

## Clasificación

- **Reusable CXOrbia:** preflight estructural, OAuth nativo, atomic-create no-reuse, IAM fail-closed.
- **Exclusivo TyA:** ID candidato `cxorbia-tya-dev-260729-c4`.
- **Claude/prototipo:** sin cambio UI; preservar estados honestos de proveedor bloqueado.
- **Academia:** separar credencial, IAM, proyecto, Firebase, Rules, lectura y escritura.
- **Sin impacto Claude:** workflows, probes y evidencia provider.

## Estado seguro

Sin producción, merge, provider activation, Rules deploy, imports ni writes de datos.
