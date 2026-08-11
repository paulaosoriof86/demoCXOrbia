# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Estado:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

Baseline cerrado: Auth228, Activation/readback/rollback, SKIP13/MultiAuth/HashConfig/direct runner, M4, HR M6, static live-user-admin, provider snapshot PASS31518927950.

Exact-write: source self-test PASS31534430007; request consumido `c6-staff-repair-bootstrap-exact-write-20260811-01`, run31534505451/job93922274430; blocker `PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B`; privacy PASS; identityResolution=false; providerState=false.

Writes reales: Auth0, Firestore0, deletes0, HR/Rules/Storage/Make/Gemini/Payments0, deploy0, merge=false, production=false. A/R4/ocho históricos intactos; sin PII/credencial cruda persistida/exportada.

Causa raíz: B solo disponible como SHA-256 source-safe y no recuperable exactamente desde fuentes privadas accesibles; write requiere visibleLogin exacto; no inferir identidad.

**Phase A84%; restante16%; M5=4/8.**

Siguiente: `C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`; no reejecutar request/provider snapshot; nueva autorización exact-write solo con recovery PASS.
