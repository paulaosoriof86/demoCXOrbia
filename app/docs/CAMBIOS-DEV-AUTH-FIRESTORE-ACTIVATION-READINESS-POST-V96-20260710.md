# Cambios backend — DEV Auth/Firestore activation readiness post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Archivos creados

- `backend/contracts/phase-a-dev-auth-firestore-activation-readiness-post-v96-v1.json`
  - Orquesta readiness desde el source lock post-V96.
  - Conserva todos los gates apagados.
  - Incluye roles/scopes, TyA/Cinépolis configurable, protected domains, certification carryover, junio pagos, reviewQueue y auditEvents.

- `backend/config/phase-a-dev-auth-firestore-activation-readiness-post-v96.source-safe.json`
  - Configuración source-safe sin `projectId` Firebase, authDomain, bucket, secretos, emails ni datos personales.
  - Referencia artifacts ya preparados y enumera activaciones bloqueadas.

- `tools/release/tya-dev-auth-firestore-activation-readiness-post-v96-validate.mjs`
  - Validador local/CI safe-only.
  - No llama Firebase/Auth/Firestore ni proveedores.
  - No escribe salvo reporte local opcional con `--out`.

- `app/docs/PHASE-A-DEV-AUTH-FIRESTORE-ACTIVATION-READINESS-POST-V96-20260710.md`
- `app/docs/CAMBIOS-DEV-AUTH-FIRESTORE-ACTIVATION-READINESS-POST-V96-20260710.md`
- `app/docs/RESUMEN-ADDENDUM-DEV-AUTH-FIRESTORE-ACTIVATION-READINESS-POST-V96-20260710.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-DEV-AUTH-FIRESTORE-ACTIVATION-READINESS-POST-V96-20260710.md`
- `app/docs/ACADEMIA-IMPACT-DEV-AUTH-FIRESTORE-ACTIVATION-READINESS-POST-V96-20260710.md`
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-DEV-AUTH-FIRESTORE-POST-V96-20260710.md`

## Archivos alineados

- `backend/contracts/auth-rbac-phase-a-v1.json`
  - Claim shape v2: `tenantId`, `userId`, `role`, `personaType`, `scope`, `permissionsVersion`.
  - Agrega `clientAdmin` y activa `clientViewer` para Phase A del portal cliente.
  - Deniega roles/personas/scopes/rutas/módulos desconocidos.
  - Mantiene claims, protected reads, staging y producción bloqueados.

- `backend/contracts/phase-a-role-taxonomy-org-scope-v1.json`
  - Corrige `countryRepresentative` a `projectAdmin` limitado por país/proyecto.
  - Agrega política fail-closed explícita.
  - Evita que representación de país herede administrabilidad de tenant.

- `backend/config/phase-a-role-taxonomy-personas.source-safe.json`
  - Alinea plantilla de `countryRepresentative` con `projectAdmin` y `projectIds/countryIds`.
  - Eleva `permissionsVersion` a la taxonomía v2.

- `tools/release/tya-auth-rbac-contract-validate.mjs`
  - Exige claim shape v2, roles cliente Phase A, persona-role mapping coherente, gates bloqueados y políticas fail-closed.

## Motivo

Resolver una inconsistencia backend antes de cualquier Auth DEV: las fuentes de claims v2 usaban mínimo privilegio para `countryRepresentative`, mientras la taxonomía anterior todavía lo elevaba a `tenantAdmin`; además el contrato RBAC base no representaba completamente cliente multi-proyecto post-V96.

## Impacto frontend

Ningún archivo de `/app/modules` o `/app/core` fue modificado. Los P1 frontend permanecen documentados para Claude.

## Pendiente/riesgo

- El validador debe ejecutarse sobre la rama/CI o clon local completo antes de solicitar activación DEV.
- Falta smoke visual por roles.
- Falta autorización futura para crear/configurar una base Firebase DEV nueva y vacía.
- Ningún resultado de validator equivale a Auth/Firestore activo.

## Estado seguro

Sin runtime, sin provider, sin deploy, sin import, sin writes, sin producción y sin datos sensibles.
