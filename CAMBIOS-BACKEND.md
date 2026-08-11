# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-10  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

El detalle del bloque está en:

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-20260810.md`;
- `app/docs/SOURCE-LOCK-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-READY-20260810.md`;
- `app/docs/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-20260810.md`;
- `app/docs/evidence/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-SOURCE-SAFE-20260810.json`;
- `backend/config/c6-auth-canonical-staff-minimum-owner-input-contract-v1.json`.

## Resumen vigente

Auth DEV permanece en 228 con Activation/readback/rollback dry-run PASS. A–C ya no requieren otra investigación técnica ni selección de principals legacy. El input humano se redujo a seis respuestas empresariales: titular + alcance para Superadministración, Administración y Operaciones.

La conversión source-safe quedó definida: designación humana transitoria -> `ownerIdentityAnchor`/`ownerRoleBindingDigest`; alcance `TYA_COMPLETE` o `SPECIFIC_PROJECTS` -> `projectIds` exactos, ordenados y sin duplicados; claims canónicos -> `expectedClaimsDigest` determinístico. No se persiste PII cruda.

A conserva como primera opción la reutilización del `super` canónico existente únicamente si un owner binding independiente demuestra asociación exacta. B/C quedan con credencial nueva efímera obligatoria durante una futura ejecución autorizada. D permanece `REPAIR_PLAN_READY` y no se reabrió.

Provider reads=0; Auth/IAM/Firestore/HR/Rules/Storage writes=0; PREWRITE/Activation/smoke/repair=false; deploy0; merge=false; production=false.

## Siguiente acción exacta

Después de recibir las seis respuestas empresariales mínimas:

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Convertir inmediatamente las respuestas a owner anchors, entitlement exacto, target claims y expected-claims digests. No ejecutar provider ni repair.
