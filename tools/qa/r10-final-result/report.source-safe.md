# CXOrbia TyA Phase A — source-safe operational visual smoke

Generated: 2026-07-12T21:22:24.244Z
Decision: PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE
Tenant/project: tya / cinepolis
Counts: 14 periods / 616 visits / 210 shoppers
Roles tested: 3
Module routes tested: 13
Blockers: 0
Warnings: 1

## Blockers
- none

## Warnings
- shopper_count_drift_review:210/213

## Roles
- admin: pass; source-safe=true; project=cinepolis; routes=7
- cliente: pass; source-safe=true; project=cinepolis; routes=2
- shopper: pass; source-safe=true; project=cinepolis; routes=4

## Safe state
- Source-safe data only
- No raw PII output
- No provider writes
- No Firestore/Auth/Storage/HR writes
- No import, payment, deploy or production
