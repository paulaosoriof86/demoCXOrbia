# Cambios — Auth preactivación ruta/acción Phase A

Fecha: 2026-07-10

## Archivos creados

- `backend/contracts/phase-a-auth-preactivation-route-action-v1.json`;
- `backend/config/phase-a-auth-preactivation-identity.source-safe.json`;
- `tools/release/tya-auth-preactivation-route-action-validate.mjs`;
- `.github/workflows/cxorbia-auth-preactivation-route-action.yml`;
- `app/docs/AUTH-FIRESTORE-DEV-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- `app/docs/CAMBIOS-AUTH-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- `app/docs/RESUMEN-CLAUDE-AUTH-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- `app/docs/ACADEMIA-IMPACT-AUTH-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-AUTH-PREACTIVACION-20260710.md`.

## Qué se hizo

- Se comparó la matriz real post-V96 de `config.js`, `router.js` y `data.js` con RBAC/taxonomía backend.
- Se formalizó autorización por rol + persona + scope + bundles + versión de permisos.
- Se documentó que `Admin del Proyecto` es scope de proyecto/país, no tenant global.
- Se dejó `custom` fail-closed sin template de claims.
- Se agregaron templates source-safe para cliente admin/viewer.
- Se documentó la restricción especial de `franchiseOwner` aunque use `tenantAdmin`.
- Se agregó validator CI sin proveedor, Auth, Firestore, import, deploy ni producción.

## Hallazgos

- `projectAdmin` está demasiado amplio en el contrato RBAC v1 para `finanzas`, `automatizaciones` y `diagnostico` frente al comportamiento post-V96.
- El seed v1 no cubre completamente `clientAdmin` y `clientViewer`.
- La limpieza externa de Firebase DEV todavía no está verificada; no se afirmó lo contrario.

## Impacto Phase A

Evita privilegios excesivos al conectar HR, shoppers, certificaciones y liquidaciones reales. Mantiene Cinépolis como proyecto configurable y los alcances por país/proyecto.

## Estado

Preparación completada, activación bloqueada.

- Sin usuarios Auth.
- Sin claims.
- Sin lecturas/escrituras Firestore.
- Sin reglas desplegadas.
- Sin provider calls.
- Sin import/deploy/producción.

## Clasificación

- **Reusable CXOrbia:** matriz ruta/acción por persona/scope/bundles.
- **Exclusivo cliente:** scopes reales TyA se cargarán fuera del repo.
- **Claude/prototipo:** copy/UX de permisos y acceso denegado.
- **Academia:** formación por rol/persona/scope.
- **Sin impacto Claude:** validator y workflow provider-off.
