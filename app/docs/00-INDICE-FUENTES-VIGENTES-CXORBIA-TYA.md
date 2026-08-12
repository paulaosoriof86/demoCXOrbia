# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado vivo:** `PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF_SOURCE_ONLY__ABC_ENCRYPTED_EXACT__D_DETERMINISTIC__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

Prevalencia: checkpoint -> `SOURCE-LOCK-C6-STAFF-PRIVATE-EXECUTION-HANDOFF-PASS-20260811.md` -> handoff evidence/contract/encrypted envelope/runtime helper -> D rebase PASS -> previous private recovery -> previous exact-write STOP -> provider snapshot PASS31518927950 -> live-user-admin static PASS -> HR live PASS -> Auth freezes -> CAMBIOS/RESUMEN/PENDIENTES/plan/tracker/Academia -> PR#7/HEAD.

Estado rector: Auth baseline228; M4=5/5; M5=4/8; M6=5/5; provider snapshot PASS31518927950; budget Auth14/Firestore16/deletes0; A/B/C exact references now have encrypted-at-rest, memory-only runtime handoff; D is deterministic from rebase PASS; raw protected values are not emitted or persisted; provider/Auth/Firestore/HR/Rules/Storage writes0; production=false.

El boundary de transporte privado previo al exact-write queda resuelto source-only. El runtime v2 deberá descifrar A/B/C en memoria y volver a validar sus digests/bindings antes del primer write; D se regenera y valida determinísticamente. No se requiere nuevo GitHub secret ni nueva decisión de negocio.

**Phase A84%; restante16%.**

Siguiente gate: `C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2 AUTHORIZATION`.

Anti-bucle: no repetir handoff, D rebase, private recovery, snapshot/provider/static/HR/owners/scopes/Auth340; no reusar exact-write request consumido; no nueva candidata/rama/PR/workflow; no writes hasta autorización v2; no deletes/deploy/merge/producción.
