# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado vivo:** `STOP_C6_STAFF_TARGET_PRIVATE_IDENTITY_RECOVERY__ABC_EXACT__D_VISIBLE_LOGIN_UNRESOLVED__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

Prevalencia: checkpoint -> `SOURCE-LOCK-C6-STAFF-TARGET-PRIVATE-IDENTITY-RECOVERY-STOP-D-20260811.md` -> recovery evidence -> previous exact-write STOP source lock/evidence/request -> provider snapshot PASS31518927950 -> live-user-admin static PASS -> HR live PASS -> Auth freezes -> CAMBIOS/RESUMEN/PENDIENTES/plan/tracker/Academia -> PR#7/HEAD.

Estado rector: Auth baseline228; M4=5/5; M5=4/8; M6=5/5; provider snapshot PASS31518927950; budget Auth14/Firestore16; exact-write consumed with zero provider writes; private recovery source-only resolved A/B/C exactly; D exact visible-login unresolved; provider reads/writes0; Auth/Firestore/HR/Rules/Storage writes0; deletes0; production=false.

Causa residual: D conserva owner anchor y owner-role binding exactos, pero ninguna referencia privada disponible reproduce el digest técnico congelado. No inferir ni sustituir identidad.

**Phase A84%; restante16%.**

Siguiente gate: `HUMAN PRIVATE D VISIBLE-LOGIN REFERENCE` únicamente. No pedir owner/rol/scope/projectIds/password/UID/HR/snapshot.

Anti-bucle: no reabrir A/B/C; no reusar exact-write request; no repetir snapshot/provider/static/HR/owners/scopes/Auth340; no generar variantes de D; no nueva candidata/rama/PR/workflow; no provider/Auth/Firestore writes hasta recovery completo PASS + nueva autorización; no deletes/deploy/merge/producción.
