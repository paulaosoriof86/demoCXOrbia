# I3 — F3 native Google execution and result consumption

## Scope and disposition

HOLD. This change enables the existing isolated F3 endpoint QA job on the native Google execution path already used for Finance and Academia. It does not certify a provider write, change the product, create a deployment, or close B14.

Control parent: `1d86b1b1ce275be4aca56c883a32038458824f8a`.
Served source: `d727f3be67a4430f08216dbb37cccba790f934f5`.
Paired DEV execution: `5670f782-19af-47aa-bdda-47cf94c689f2`.
Runtime: `cxorbia-live-hr-dev-00393-p54`.
Digest: `sha256:5fa6ff90745230ca31b33f529be385570182cd527684745d3dfb86cc1834b2d8`.
Hosting: `sites/cxorbia-backend-dev/versions/607182bc22875d48`.

## Proven execution gap and correction

The F3 runner previously required GitHub Actions identity and an ADC service-account principal. The existing Google QA helper and transport accepted Finance and Academia only. Therefore Cloud Shell could not execute and consume the authorized F3 endpoint test through that path.

The same helper now verifies F3 start-object generation, producer/source/tree/transport, and exact runner/config/fixture blobs. The runner accepts only its verified, frozen native context; it never assigns a Google generation to a GitHub Actions ID. It retains the exact fixture, remote baseline, command/journal/ACK assertions, response-loss replay and cleanup ownership guards.

The existing transport dispatches F3, verifies its config against the paired receipt and controls, and archives the raw receipt and synthetic role captures even on a runner HOLD. The generation-bound ZIP and result object are independently verified by the existing result-summary owner. The new consumer entry records the scoped F3 result with `GOOGLE_CLOUD_SHELL/<startGeneration>`, preserves release and automation seals, and invokes the existing atomic finalizer/CAS/readback. It creates no domain PASS or owner receipt.

## Validation

`CXORBIA_I3_F3_GOOGLE_NATIVE_TESTS_20261125.tap`: **219 tests, 219 PASS, zero failure/skip**. Includes native identity rejection, changed bytes/fixture/live pins, unsupported ACK and missing role captures, complete control-package dry run, real in-memory Git CAS/readback, replay no-op and concurrent-writer rejection. Existing F3, shopper, Finance/Google and scoped-projection tests remain passing. Shell and Node syntax checks and compact current authority guard passed.

## Exact next action

Run the existing `i3-b14-qa-provider-proof` job via `cxorbia-i3-finance-google-transport.sh` on this published control package and the same served DEV. The runner verifies `iam.serviceAccounts.signBlob` for the existing DEV signer before fixture creation; it creates no IAM grant. A missing permission produces a durable `AUTH_FAILURE` receipt before a fixture is created. Paula supplied Work's report that its prior temporary signing window expired and Work requested a new two-hour window. That forwarded request is not recorded here as a grant.

For a successful endpoint chain, independently inspect all Make executions in the response-loss/replay interval, verify the exact owned datastore keys, restore the baseline and read cleanup absence. Only those observations can settle remote physical write count and cleanup. HR durable recovery, provider-response loss, human concurrent editing, external-origin echo and the remaining business clauses retain their existing residuals; they are not credited by this transport change.

No production mutation, new candidate, workflow, product build, real-data import or broader gate reopening is included.

## Same-attempt preparation: remove the temporary-signing dependency

At approximately 18:27 Guatemala, native `testIamPermissions` returned HTTP 200 with an empty permission list for `signBlob`. A negative sign-in against the existing Firebase password provider then returned `INVALID_LOGIN_CREDENTIALS` for a new random nonexistent QA email; no account or fixture was created. This confirms the previous signing-window blocker without treating the forwarded renewal request as authorization.

The native F3 branch now uses `FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY`: the same three new disposable Auth principals, same UID/claims/memberships, and random passwords held only in memory. It uses Firebase's existing password sign-in and verifies the resulting token and exact claims. It creates no IAM grant, changes no existing user's credential and does not enable any authentication provider. A denied Auth administration operation remains a real blocker; public registration is not a fallback.

The original Actions custom-token path stays available. Native password QA keeps `ordinaryPasswordProven:false` and `ordinaryPasswordAuthenticationProven:false` for operational users. Its scoped evidence cannot close A08. Tests verify that password QA never invokes custom-token signing, rejects credentials for another actor and keeps passwords out of all published state.

Validation of this incremental authentication change: `CXORBIA_I3_F3_PASSWORD_QA_TESTS_20261125.tap`, **221 tests, 221 PASS, zero failure/skip**. It includes the previous 219 checks and two behavioral checks of isolated credential generation, provider selection, zero custom-token signing and credential exclusion from published evidence.
