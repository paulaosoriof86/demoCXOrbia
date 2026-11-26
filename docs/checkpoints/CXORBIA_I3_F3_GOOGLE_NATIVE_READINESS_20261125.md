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

Run the existing `i3-b14-qa-provider-proof` job via `cxorbia-i3-finance-google-transport.sh` on the published current control package and the same served DEV, after resolving the observed Make capacity requirement below. Native F3 uses `FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY` for three new disposable QA identities and does not require `iam.serviceAccounts.signBlob`. The original custom-token path alone checks its existing signing permission. The forwarded request for a two-hour signing window remains a request, not a grant. Do not repeat the already completed recovery of native attempt `1795653493842440`.

For a successful endpoint chain, independently inspect all Make executions in the response-loss/replay interval, verify the exact owned datastore keys, restore the baseline and read cleanup absence. Only those observations can settle remote physical write count and cleanup. HR durable recovery, provider-response loss, human concurrent editing, external-origin echo and the remaining business clauses retain their existing residuals; they are not credited by this transport change.

No production mutation, new candidate, workflow, product build, real-data import or broader gate reopening is included.

## Same-attempt preparation: remove the temporary-signing dependency

At approximately 18:27 Guatemala, native `testIamPermissions` returned HTTP 200 with an empty permission list for `signBlob`. A negative sign-in against the existing Firebase password provider then returned `INVALID_LOGIN_CREDENTIALS` for a new random nonexistent QA email; no account or fixture was created. This confirms the previous signing-window blocker without treating the forwarded renewal request as authorization.

The native F3 branch now uses `FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY`: the same three new disposable Auth principals, same UID/claims/memberships, and random passwords held only in memory. It uses Firebase's existing password sign-in and verifies the resulting token and exact claims. It creates no IAM grant, changes no existing user's credential and does not enable any authentication provider. A denied Auth administration operation remains a real blocker; public registration is not a fallback.

The original Actions custom-token path stays available. Native password QA keeps `ordinaryPasswordProven:false` and `ordinaryPasswordAuthenticationProven:false` for operational users. Its scoped evidence cannot close A08. Tests verify that password QA never invokes custom-token signing, rejects credentials for another actor and keeps passwords out of all published state.

Validation of this incremental authentication change: `CXORBIA_I3_F3_PASSWORD_QA_TESTS_20261125.tap`, **221 tests, 221 PASS, zero failure/skip**. It includes the previous 219 checks and two behavioral checks of isolated credential generation, provider selection, zero custom-token signing and credential exclusion from published evidence.

## Verified outcome and exact resumption — 25 November, Guatemala

I3 remains HOLD. The product remains the paired DEV above; no approved product delta is waiting for deployment. No production replacement or Phase A certificate is asserted.

The first native attempt `1795653493842440` authenticated its synthetic Admin and completed the initial durable reconciliation. Its field write did not receive a valid remote ACK. The complete Make window contains one physical PATCH attempt returning HTTP 404, plus two inspect-only executions. The original FAIL and its immutable Google provenance are incorporated in descriptor and pointer by `86e612e14c3e54eef7882fbe1d9a2cd030145daf`.

The exact provider owner was scenario `10199316`, module `17`, generating PATCH/readback worksheet URLs from an encoded worksheet ID. The verified metadata/name route had succeeded. The provider change replaces only the two URL expressions with the already verified worksheet name, preserving the exact ID/name and scope guards. Sixteen before/after and negative-scope cases passed. Provider configuration and evidence are recorded in `e30b20c484ac7812469b671a16f3ce446ced5d92`; a successful live write after that change is still pending.

The F3 role runner independently had a reproducible null-context dereference during asynchronous authentication restoration. `a5cf321a8830e099dc079cc4390d32d595785cd5` fixes that wait and retains safe failure stages. Its 27 tests passed. The original run did not retain its exception stage, so the exact original role exception is not retrospectively claimed. No product owner, ordinary-user credential, IAM permission or PASS contract was changed.

### Recovery completed

Fresh GT/HN executions `5d6d0a57f244472c9f9a298132dbf2a5` and `ad571a10f3264506b715d09141bd4223` independently read the original eight values. Both returned two matching HTTP-200 arrays. Their projection was verified with the served source's own reader functions and then compared against the original native `raw.remoteBaseline`.

The exact owned cleanup finished at 19:45:39 Guatemala. It removed 26 synthetic documents plus the temporary scope-lock document (27 Firestore deletions), restored the original absent lock baseline, and removed all three exact QA Auth accounts. Readback verified absence; evidence was sealed in the existing native GCS prefix before deletion and after verification. The original FAIL was unchanged.

At 19:50:09 Guatemala the Make connector verified deletion of exactly the failed attempt's event and head keys; only sentinel `757bfe4bd75b` remained. The whole provider window still contained the same three terminal executions. The complete recovery and native cleanup receipt are published in `2071dccf52f65b704de421c377d9504a9f95ba01`:

- `CXORBIA_I3_F3_NATIVE_1795653493842440_OWNED_CLEANUP_20261125.json`
- `CXORBIA_I3_F3_NATIVE_1795653493842440_COMPLETE_QA_RECOVERY_20261125.json`

### Capacity and access required for the next full execution

Make organization `4090072` (AyS - TyA), Core, had 1,040 available credits, with automatic purchases disabled. The full current F3 route is estimated at 1,184 credits before variable UI/inventory/retry costs. This is a projection from code and observed unit costs, not an observed new quota failure. A new full F3 execution has not been started after recovery; do not spend the restoration budget on an incomplete run.

The minimal proposed capacity addition is a one-time purchase of 1,000 credits. No purchase, subscription change or automatic-purchase activation has occurred. Actual checkout price remains unverified: Make's UI requires email/password sign-in; Google sign-in reported that this account uses email and password. The connector does not expose billing or purchase operations. The proposed purchase needs its merchant/item/spending limit authorized before payment.

Evidence: `CXORBIA_I3_F3_MAKE_CAPACITY_ESTIMATE_20261125.json` and `CXORBIA_I3_F3_MAKE_CAPACITY_PREPARATION_20261125.json`.

Next: finish the Make billing sign-in; inspect and authorize the minimum exact one-time purchase, read back capacity; run the existing native F3 job using the same fixture contract and served DEV with the published corrected runner. Audit the complete Make window for original/replay writes, restore all eight values, verify exact cleanup, and incorporate the native result through the existing atomic consumer. Credit only proven clauses.

### Other Phase A residuals remain explicit

Preserve accepted Finance/Admin-Academia scopes and the six MATCH domains. Remaining work includes Academia Shopper/Client sessions, authenticated persistent E10 import, ordinary access exceptions and role denials, postulation/assignment and remaining cross-module clauses, Finance/KPI residuals and E08 provider ACK. Gate20/Gate21 and the immutable I4 artifact remain pending. Their authoritative detailed scope is the current cumulative matrix/ledger and execution pointer; this checkpoint introduces no additional gate or candidate.
