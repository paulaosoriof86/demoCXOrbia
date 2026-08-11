# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Estado:** `PASS_C6_STAFF_D_TECHNICAL_LOGIN_REBASE_SOURCE_ONLY__ZERO_SOURCE_COLLISION__PRIVATE_EXECUTION_HANDOFF_PENDING__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

Baseline cerrado: Auth228, Activation/readback/rollback, SKIP13/MultiAuth/HashConfig/direct runner, M4, HR M6, static live-user-admin y provider snapshot PASS31518927950.

Bloque ejecutado: D historical visible-login declarado no recuperable; creado `backend/contracts/c6-staff-d-technical-login-rebase-v1.json`; actualizado únicamente el binding técnico D en `backend/config/c6-staff-provider-collision-targets-v1.json` y recalculado mecánicamente su fingerprint provider derivado; creado `backend/contracts/c6-staff-d-rebase-prewrite-v1.json`, source gate y evidencia; source lock `SOURCE-LOCK-C6-STAFF-D-TECHNICAL-LOGIN-REBASE-PASS-20260811.md`.

Preservado sin cambios: ownerIdentityAnchor, ownerRoleBindingDigest, role, entitlementMode, projectIds, expectedClaimsDigest, A/B/C y R4 canónico.

Validación source-safe: cero colisiones del nuevo D technical digest, provider collision fingerprint y owner technical binding contra A/B/C y D superseded. Provider reads0; provider/Auth/Firestore/HR/Rules/Storage writes0; Make/Gemini/Payments0; deletes0; deploy0; merge=false; production=false. No raw login/email/UID/password/password-hash/nombre persistido.

Causa D cerrada: D ya es regenerable determinísticamente sin referencia histórica.

Boundary restante detectado antes de write: A/B/C exact visible-login fueron recuperados transient y deliberadamente no persistidos; el carril GitHub no tiene aún un canal privado autorizado para entregarlos al runtime sin repo/artifact/log. Esto es transporte privado, no nueva decisión de identidad.

**Phase A84%; restante16%; M5=4/8.** No se acredita peso adicional hasta write/readback.

Siguiente gate: `C6 STAFF PRIVATE EXECUTION HANDOFF SOURCE-ONLY`. No repetir D rebase, snapshot ni request exact-write consumido.
