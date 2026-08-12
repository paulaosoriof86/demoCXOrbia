# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 13:42 -06:00  
**Estado:** `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_SOURCE_IMPLEMENTED__RUNTIME_PROOF_PENDING__PHASE_A_88__NO_DEPLOY__NO_PRODUCTION`

## Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Provider target: `cxorbia-backend-dev`.
- Exact Write V2: cerrado y no repetible.
- Producción: intacta.

## Estado C6 Staff

`PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK` permanece válido.

- Auth writes consumidos: 14.
- Firestore writes consumidos: 16.
- Deletes: 0.
- A/B/C/D/R4 canonical readback: PASS.
- Ocho históricos deshabilitados con readback.
- Rollback: no requerido.
- No reabrir provider snapshot, private handoff, D rebase, Auth340, SKIP13, MultiAuth, HR o M4 sin drift reproducible.

## C6 live user/admin wiring — SOURCE IMPLEMENTADO

### Causa raíz localizada

El recorrido humano DEV validaba Firebase Auth y custom claims, pero pasaba ese contexto directamente a `backend-firebase.js`; no consumía la membresía canónica `tenants/tya/users/{uid}` creada/readback por Exact Write V2. Por tanto, la materialización PASS no certificaba todavía toda la cadena `Auth → membership → RBAC → frontend`.

### Corrección localizada

- Nuevo: `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js`.
- Modificado: `app/index-backend-dev.html`, una carga adicional entre `backend-browser-auth.js` y `backend-firebase.js`.
- No se modificó `app/modules`.

Para Staff, antes del backend se verifica fail-closed:

1. principal Firebase real;
2. claims tenant/namespace/role/project scope;
3. self-read de `tenants/tya/users/{uid}`;
4. `active=true`;
5. tenant/namespace/role exactos;
6. `entitlementMode=TYA_COMPLETE`;
7. projectIds exactos;
8. claimsDigest exacto;
9. providerUidFingerprint exacto;
10. publicación sanitizada del scope en `CX.session` para RBAC.

No se expone visibleLogin, UID ni secreto. Mismatch ⇒ limpiar sesión + signOut + bloqueo.

## Gates automáticos observados sobre el commit de source

PASS relevantes: Visual Smoke, Operational Readiness R9, Auth Pre-activation Route Action Gate, DEV Auth Firestore Readiness, Firebase DEV Clean-State Read-Only Gate, READONLY_POST_GATES_RUNNER, Live Execution Checkpoint, Source Safe Runtime Guard y Period History Integrity.

R18A continúa con un HOLD heredado por `app/modules/cliente-extra.js`: faltan flujos PDF/XLSX/PPTX. Está separado del wiring C6 y corresponde a Claude/prototipo.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12%.**

**Delta certificado de esta iteración: +0%.** Hubo avance source real, pero no se contabiliza hasta certificar el runtime del mismo build.

## Siguiente bloque exacto

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

Debe demostrar en DEV, para Staff canónico, la cadena completa:

`Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend`.

El source ya está en la rama, pero aún no se ha desplegado este build. Se requiere autorización específica de Hosting DEV para ejecutar el proof remoto. No se autoriza ningún Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos write, segundo exact-write, merge o producción.

Después: `M7 → M8 → M9 → M10`.

## Clasificación

- **Reusable CXOrbia:** membership reconciliation fail-closed entre Auth y RBAC.
- **Exclusivo cliente:** TyA/Cinépolis, entitlement `TYA_COMPLETE`, Staff A-D.
- **Claude/prototipo:** cero UI tocada; exports Cliente heredados siguen pendientes.
- **Academia:** impacto pendiente de runtime proof; luego revisar acceso/roles/manuales.
- **Sin impacto Claude:** digest/fingerprint/membership read-only gate.

## Estado seguro

Nuevos provider/Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes: 0. Deploy/merge/producción: 0/false/false.