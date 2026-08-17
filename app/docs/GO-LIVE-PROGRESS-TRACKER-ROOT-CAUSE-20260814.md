# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha:** 2026-08-17 15:08 -06:00

| Iteración | Peso | Estado formal | Estado operativo |
|---|---:|---|---|
| I1 | 15 | PASS 15/15 | frozen |
| I2 | 20 | PASS 20/20 | frozen |
| I3 | 25 | 0/25 hasta I3.11 | I3.1/.2/.3/.4/.7 PASS; I3.6 product PASS+harness source fixed; I3.5 provider crosswalk required |
| I4 | 25 | 0/25 | pendiente después de I3 |
| I5 | 15 | 0/15 | producción exacta después de I4 |

**GO-LIVE formal: 35% / 65%.** I3 integral →60%; I4 →85%; I5 →100%.

## Por qué el porcentaje parece detenido

El tracker pondera I3 como un bloque integral de 25 puntos: no entrega puntos parciales aunque varios subgates se cierren. Por eso el 35% no equivale a cero avance técnico.

## I3 actual

- I3.1 PASS.
- I3.2 PASS.
- I3.3 PASS.
- I3.4 PASS: postulations/HR assignments separados, 0 synthetic HR posts.
- I3.5: runtime `no_exact_hr_crosswalk`; source hunt completado; no independent materialized repo authority; estado `I3_5_PROVIDER_BACKED_CROSSWALK_MATERIALIZATION_REQUIRED`.
- I3.6: historical Shopper product/evidence frozen PASS; harness shallow checkout fixed source-only commit `84d26871c6f0cff96eaa84a8789d78b462e190ee`; no Shopper reprocess.
- I3.7 PASS: durable legal V0.4 provider receipt exact/human/persistent.
- I3.8/I3.9 pending new Shopper provider-backed flow.
- I3.10 pending KPI semantics.
- I3.11 pending integral same-build closure.

## Exact identity rule

The live `shp-*` id derives from HR Shopper text and cannot serve as independent canonical authority. Existing source-safe candidate contract leaves `shopperIdentityLinkCandidates` as `not_written`. No fuzzy/name/email/phone/username/hash shortcut.

## Frozen

Historical Shopper `31906391682`; Admin `32049054855`; request08; HR 15/660; Finance V2/historical; I1/I2 and PASS I3 gates; legal receipt.

## Next

`I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET` under a narrow explicit provider-write gate. If exact independent authority is not demonstrated, STOP with zero writes.
