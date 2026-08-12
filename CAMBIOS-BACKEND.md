# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Estado:** `PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF_SOURCE_ONLY__ABC_ENCRYPTED_EXACT__D_DETERMINISTIC__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

Baseline cerrado: Auth228, Activation/readback/rollback, SKIP13/MultiAuth/HashConfig/direct runner, M4, HR M6, static live-user-admin, provider snapshot PASS31518927950 y D technical rebase PASS.

Bloque ejecutado: `C6 STAFF PRIVATE EXECUTION HANDOFF SOURCE-ONLY`. Se reutilizó el keypair cifrado ya existente y probado; se añadió el AAD focal de staff, se materializó `backend/private-inbox/c6-staff-private-execution-handoff.enc.json` con ciphertext únicamente, contrato `backend/contracts/c6-staff-private-execution-handoff-v1.json`, runtime helper memory-only y source/runtime gates. A/B/C fueron revalidados transient contra digests y owner-bindings congelados antes del cifrado; D se mantiene exclusivamente determinístico desde su rebase PASS.

Privacidad: raw login/email/UID/password/password-hash/nombre no emitido ni persistido; ciphertext cifrado sí queda persistido como transporte recuperable. No se creó GitHub secret, rama, PR o workflow nuevo.

Writes/efectos: provider reads0; provider/Auth/Firestore/HR/Rules/Storage writes0; Make/Gemini/Payments0; deletes0; deploy0; merge=false; production=false. Snapshot31518927950 no se repitió, exact-write request consumido no se reutilizó y no se reabrieron Auth340/SKIP13/MultiAuth/HR/M4/static.

Causa de transporte cerrada: el futuro runtime puede obtener A/B/C exclusivamente por decrypt in-memory con el keypair existente y volver a validar digests/bindings; D se regenera determinísticamente. La evidencia previa `CORTE6-CREDENTIAL-HANDOFF-DRYRUN-LATEST.json` conserva la prueba histórica del mismo key fingerprint/decrypt path.

Archivos creados/tocados en este bloque: public key usage domain, encrypted handoff envelope, handoff contract, runtime helper, source gate, runtime gate, evidence `C6-STAFF-PRIVATE-EXECUTION-HANDOFF-LATEST.json`, source lock `SOURCE-LOCK-C6-STAFF-PRIVATE-EXECUTION-HANDOFF-PASS-20260811.md` y documentación viva.

**Phase A84%; restante16%; M5=4/8.** No se acredita peso adicional hasta write/readback real.

Siguiente gate: `C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2 AUTHORIZATION`.

Clasificación: Reusable CXOrbia=encrypted-at-rest/memory-only handoff; Exclusivo TyA=targets/budgets focales; Claude=sin cambios UI; Academia=separación identidad/digest/transporte cifrado; Sin impacto Claude=runtime helper/gates/evidence.
