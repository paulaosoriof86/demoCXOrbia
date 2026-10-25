# CAMBIOS-BACKEND addendum — Auth preactivación por permisos

Fecha: 2026-07-10

## Bloque completado

`Auth/Firestore DEV limpio — preactivación focalizada por permisos`.

## Archivos creados

- `backend/contracts/phase-a-auth-preactivation-route-action-v1.json`;
- `backend/config/phase-a-auth-preactivation-identity.source-safe.json`;
- `tools/release/tya-auth-preactivation-route-action-validate.mjs`;
- `.github/workflows/cxorbia-auth-preactivation-route-action.yml`;
- `app/docs/AUTH-FIRESTORE-DEV-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- `app/docs/CAMBIOS-AUTH-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- `app/docs/RESUMEN-CLAUDE-AUTH-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- `app/docs/ACADEMIA-IMPACT-AUTH-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-AUTH-PREACTIVACION-20260710.md`;
- `app/docs/CI-VALIDATION-AUTH-PREACTIVACION-PERMISOS-TYA-20260710.md`;
- este addendum;
- addenda de resumen Claude y pendientes prototipo del mismo bloque.

## Archivos modificados

- `tools/release/tya-auth-preactivation-route-action-validate.mjs`: se corrigió la ruta del workflow DEV vigente.
- `tools/release/tya-rc-phase-a-drift-gate.mjs`: se añadieron exactamente el nuevo workflow y el nuevo validador a la allowlist.

## Resultado

- matriz ruta/acción preparada;
- scopes de coordinador, aliado y custom resueltos por contratos vigentes;
- templates opacos para once personas Phase A;
- clientAdmin/clientViewer incorporados al plan nuevo;
- custom fail-closed;
- 0 hard fails;
- 0 warnings;
- 6 activation blockers explícitos;
- todos los gates del head técnico terminaron en success.

## Commits

- `2b3e7250904ca87e012664582bec55abe19156c3` — bloque inicial;
- `3a243962bdd1946f7e5bebc08d494561e94f6a88` — corrección de ruta del workflow vigente;
- `1d5b7d3003bedcfc3d3355a0b6fc7d723d53e811` — allowlist drift explícita.

## Impacto Phase A TyA

Se evita que un rol técnico amplio otorgue acceso excesivo cuando se conecten HR, shoppers, certificaciones, liquidaciones y cliente multi-proyecto. Cinépolis continúa como proyecto configurable, no como lógica global.

## Clasificación

- **Reusable CXOrbia:** rol + persona + scope + bundles + permissionsVersion.
- **Exclusivo cliente:** asignaciones TyA reales quedan fuera del repo.
- **Claude/prototipo:** UX de `Admin del Proyecto`, acceso denegado y cliente admin/viewer.
- **Academia:** manuales por persona/scope y ruta/acción.
- **Sin impacto Claude:** CI, run IDs, digest y allowlist interna.

## Estado seguro

Sin cambios en módulos/core, sin provider calls, sin Auth, usuarios, claims, Firestore, rules deploy, imports, deploy o producción.
