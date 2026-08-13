# PHASE A — Tracker TyA

**Actualización:** 2026-08-12 19:26 -06:00  
**Estado:** `C6_RUNTIME_11_STOP_RETRY_POST_ENTER_SESSION_MEMBERSHIP_LOSS__ROOTCAUSE_REPAIRED__SOURCE_PREFLIGHT_PASS__PHASE_A_88`

M1=35 COMPLETE; M2=20 COMPLETE; M3=15 COMPLETE; M4=5 COMPLETE; M5=8/8 COMPLETE; M6=5 COMPLETE; M7=0/5; M8=0/3; M9=0/3; M10=0/1. **88% certificado; 12% restante.**

## Hitos cerrados

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2`: PASS único y consumido. Auth writes=14; Firestore writes=16; deletes=0. Canonical readback A/B/C/D/R4 PASS; ocho históricos deshabilitados con readback; rollback no requerido.

`C6 STAFF RUNTIME SELECTOR CANONICALIZATION`: cerrado source-only. El carril Staff ya no usa bundle/password guessing legacy; selecciona exclusivamente `B=admin` con private handoff y derivación Exact Write V2. Runtime 11 certificó `canonicalTargetAlias=B`, `staffRole=admin`, `exactWriteCanonical=true`, `legacyCredentialBundleUsed=false`.

`RUNTIME 11`: run `31657144378`, artifact `9164843371`. PASS hasta Hosting, remote parity, Auth B/admin, membership/frontend handoff `entered`, HR authority 15 periodos/660 visitas/211 shoppers, stale empty limpiado y shell visible. FAIL únicamente porque `CX.app.enter()` fue interceptado por backend-browser-auth, que reaplicó `CX.session` desde claims y eliminó metadata `membershipVerified/membershipSource` después del PASS canónico. STOP_RETRY respetado; Hosting 1/1; writes=0.

`C6 POST-ENTER SESSION MEMBERSHIP REPAIR`: source-only aplicado en adapter, sin tocar `/app/core` ni `/app/modules`. Después de `CX.app.enter()`, republica la membership ya verificada mediante cache y falla cerrado si no persiste. Preflight reforzado exige ese orden.

`POST-REPAIR SOURCE PREFLIGHT`: run `31657552661`, artifact `9164940552`, **PASS**. Provider/Google Auth/Hosting/runtime skipped; provider calls=0, Hosting=0, writes=0.

## Por qué Phase A sigue en 88%

M7 permanece atómico: solo suma sus 5 puntos cuando la misma ejecución real completa primera carga + membership persistida en `CX.session/RBAC` + HR authority + frontend + **3 reloads + new-tab**. Runtime 11 no llegó a reloads/new-tab porque el smoke detuvo correctamente el primer wait ante la pérdida post-enter de metadata.

## Siguiente bloque exacto

`NUEVO HOSTING_RUNTIME_ONCE Staff B=admin sobre HEAD vivo reparado → M7 PASS esperado → Phase A 93% → M8 → M9 → M10`.

No reabrir Exact Write V2, handoff, provider snapshot, Auth340, SKIP13, MultiAuth, HR ni M4 sin drift nuevo reproducible. No nueva auditoría general.
