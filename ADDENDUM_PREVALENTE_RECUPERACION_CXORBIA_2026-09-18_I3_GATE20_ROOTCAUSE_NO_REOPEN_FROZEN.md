# CXORBIA RECOVERY — I3 GATE20 ROOT CAUSE / NO-REOPEN FREEZE — 2026-09-18

## Authority
This freeze is additive to the Recovery Addendum and the 2026-09-18 cumulative module-integrity freezes.
It governs the current I3 certification lane and prevents reopening already-passing product domains without new reproducible drift.

## Proven product source under certification
- source: `829afe0c98da6d44b10a8dfa92be233dbedebb6b`
- tree: `84a364832844e9058cae31ce28c83bb340359609`

## Structural composition protection already PASS
- 124 active internal scripts
- 124 covered by MODULE_TRUTH_MATRIX
- 0 active internal scripts outside matrix
- 0 duplicate script src
- 0 unknown active overlays
- KEEP owners protected by exact Git blob equality and load-order checks before build

A KEEP owner MUST NOT be modified or reopened unless reproducible drift is shown against this matrix.

## Run 215 evidence
Run: `35394966419`

The following gates passed on the same exact artifact before Gate20:
- single certification source/control-only successor
- exhaustive 124/124 module integrity
- atomic P0 source contracts
- runtime tests/dependencies
- Firebase DEV auth and gcloud setup
- exact source preparation
- one build
- exact DEV runtime deploy
- same exact Hosting DEV source deploy
- Hosting identity readback
- exact HR alias adjudication
- fresh authoritative HR source
- durable shopper credential normalization
- shopper credential contract
- historical Client membership exact readback
- real human-lane HR authority release
- focal Shopper/Finance persistence
- synthetic cleanup
- historical Gate20 baseline lock

The only failing step was Gate20 visual harness.

## Root cause
The product-owned v2 HR bridge wraps backend refresh and schedules canonical reconciliation asynchronously.
Gate20 was calling a backend refresh and then attempting another explicit reconcile before the first reconcile completed.
The observed failure was:
`reconcile_in_progress`

This is a QA harness race. It is not evidence of regression in HR, Client, credentials, persistence, finance, or module composition.

## Canonical Gate20 sequence
Gate20 MUST mirror the human lane that already passes on the same artifact:
1. establish Firebase session;
2. call canonical `CX.backendAuth.ensureAuthenticated()`;
3. passively wait for product-owned canonical HR authority to become applied/ready;
4. assert source/scope/authority invariants;
5. perform visual and semantic route checks.

Gate20 MUST NOT start an extra backend refresh or a second explicit HR reconcile.

## Anti-loop rule
If source guard, exhaustive module matrix, P0 contracts, fresh HR, Client, human lane and persistence are PASS on the same artifact, a Gate20 harness-only FAIL does not authorize reopening those product owners.

Future FAILs must identify one allowed Recovery classification and the exact owner. No general HR rework, no reimport, no new overlay, no alternate candidate, no parallel workflow.

## Production
DO_NOT_TOUCH until I3 GO and explicit I4 authorization.
