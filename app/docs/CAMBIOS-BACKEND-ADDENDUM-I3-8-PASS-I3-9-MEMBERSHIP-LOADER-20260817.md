# CAMBIOS BACKEND — ADDENDUM I3.8 PASS / I3.9 SHOPPER MEMBERSHIP LOADER

**Fecha:** 2026-08-17 17:45 -06:00  
**Estado:** `I3_8_PROVIDER_PASS__I3_9_PROVIDER_STATE_PASS__SOURCE_FIX_NOT_DEPLOYED`

## Provider change already authorized/consumed — I3.8

Run `32080412142`, job `95542161943`:
- Auth create `1`;
- claims write `1`;
- Firestore membership/profile/crosswalk `3`;
- new synthetic Shopper `TYA_GT_393371F88D10F7A8`;
- identity link `irl_fd0e52a9792ef088aa275fa90e27c77d`;
- authority `platform_created`;
- provider ACK/readback exact PASS.

No rerun I3.8.

## Source files created/touched for I3.8/I3.9

Created:
- `tools/migration/cxorbia-i3-8-new-shopper-provider-backed.mjs`;
- `tools/migration/cxorbia-i3-8-request-control.mjs`;
- `tools/qa/cxorbia-i3-9-new-shopper-e2e.mjs`;
- `backend/requests/i3-8-new-shopper-provider-backed.json`;
- `tools/qa/cxorbia-i3-9-created-shopper-custom-token-e2e.mjs`;
- `tools/qa/cxorbia-i3-9-created-shopper-request-control.mjs`;
- `backend/requests/i3-9-created-shopper-readonly-e2e.json`;
- `app/docs/evidence/ITERATION3-I3-8-PASS-I3-9-DIAGNOSTIC-LATEST.json`;
- current source lock.

Touched/reused:
- `.github/workflows/cxorbia-phase-a-firestore-materialization-executor.yml` — existing workflow only;
- `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml` — existing read-only workflow only;
- `app/index-backend-dev.html` — adds missing reusable Shopper membership wiring loader;
- current index/checkpoint/plan/tracker/Claude/Pendientes docs.

No new branch/PR/workflow.

## Root cause source fix

`app/adapters/cxorbia-shopper-membership-wiring-v1.js` already implemented the reusable chain:

`Firebase principal + exact claims → tenants/{tenantId}/users/{uid} → verified Shopper membership/session`.

The protected DEV entrypoint did not load it. Source fix commit:
`c796597effac6d77422df888b63933ab865ab198`.

This is not a UI redesign and does not modify `/app/modules` or the `CX.data` interface.

## I3.9 diagnostics

- I3.8 original job: Playwright dependency removed before I3.9; I3.9 did not execute.
- Read-only attempts confirmed exact provider user/claims/membership/profile/crosswalk repeatedly.
- Latest diagnostic run `32081426357`, job `95545032005`: visible login surface and Firebase project exact PASS; custom-token path timed out before CX context certification. No provider writes/password changes/Historical access.

Custom-token diagnostics are not accepted as replacement for canonical visible password login.

## Pending provider/deploy gate

No deploy was performed and no password was changed after I3.8.

Required next scope: max one Hosting DEV deploy + max one password change of the synthetic I3.8 Shopper, then canonical visible E2E, dynamic I3.10 and same-build I3.11. This scope is not yet authorized.

## Safety

Historical Shopper access/login/recovery/reset `0`; post-I3.8 user/claim/Firestore writes `0`; password changes/resets `0`; HR/Finance/Rules/Storage/Make/Gemini/payment writes `0`; deploy `0`; merge=false; production=false.

## Clasificación

- **Reusable CXOrbia:** Shopper membership wiring and exact protected runtime integration.
- **Exclusivo cliente:** synthetic DEV Shopper and provider project scope data.
- **Claude/prototipo:** preserve visible single login; no UI redesign.
- **Academia:** Auth identity vs membership integration distinction.
- **Sin impacto Claude:** harnesses/evidence/source locks/provider fingerprints.
