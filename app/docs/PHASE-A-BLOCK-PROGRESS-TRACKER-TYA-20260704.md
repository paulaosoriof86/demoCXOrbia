# PHASE A — Tracker TyA

**Actualización:** 2026-08-17 17:45 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_1_TO_8_PASS__I3_9_PROVIDER_PRECONDITIONS_PASS__MEMBERSHIP_LOADER_SOURCE_FIX_NOT_DEPLOYED__I3_10_11_PENDING__I4_PENDING__I5_PENDING__GO_LIVE_35`

## Progreso formal

- I1: `15/15 PASS`.
- I2: `20/20 PASS`.
- I3: `0/25` hasta I3.11 integral.
- I4: `0/25`.
- I5: `0/15`.

**GO-LIVE: 35% completado / 65% pendiente.**

## I3 operativo

PASS/frozen: **I3.1→I3.8**.

I3.8 run `32080412142`, job `95542161943`:
- Auth create `1`;
- claims `1`;
- membership/profile/crosswalk Firestore `3`;
- identity link `platform_created`, period-independent;
- provider ACK/readback PASS;
- request consumed/no rerun.

I3.9: exact provider user/claims/membership/profile/crosswalk PASS; canonical visible browser login todavía no certificado. Último read-only diagnostic run `32081426357`, job `95545032005`: visible login surface PASS, Firebase Hosting project exact PASS, 0 provider admin writes/password changes/resets/Historical access, pero custom-token harness terminó en timeout técnico.

Source root cause: reusable Shopper membership wiring existed but was not loaded by protected DEV entrypoint. Fix source applied `c796597effac6d77422df888b63933ab865ab198`; not deployed.

## Next

Combined exact gate needed: max 1 Hosting DEV deploy + max 1 password change of the synthetic I3.8 Shopper only → visible product login I3.9 → dynamic I3.10 → same-build I3.11. If all PASS, **60% formal**. No Historical Shopper, no new user/claims/Firestore/HR/Finance/Rules/Storage/Make/Gemini/payment writes, no merge/production.
