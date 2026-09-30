# ADDENDUM PRE-I4 — HUMAN VISUAL REVIEW FINDINGS — 2026-09-21

Project: CXORBIA RECOVERY — GO-LIVE
Phase: PRE-I4 HUMAN VISUAL ACCEPTANCE
Status: HOLD_VISUAL_REVIEW
I3 technical state: GO remains frozen
Production: DO_NOT_TOUCH

## 1. Human visual evidence

Paula reviewed the Recovery DEV entrypoint on mobile and supplied screenshots.

Observed physical defects:
1. Tenant logo is not rendered. The login shows a text/initials placeholder "T&A" instead of the tenant's official logo.
2. Technical/debug/audit UI is exposed to the human reviewer, including raw scenario-lab statuses such as BLOCKED_* / PASS_* / no_session / no_claims / no_route and scenario-runner state.
3. A blocking modal appeared in Paula's session:
   "Fuente de datos no disponible"
   "Modo activo: Conectado · Bloqueado"
   "No hay un adapter backend autorizado conectado — connected no se activa desde este paquete."
4. Pre-auth status panel exposes technical implementation details:
   Backend DEV, source authority string, tenant id, auth pending, project/period/data counts.
5. Pre-auth visible context is stale/noncanonical:
   project shown as "proyecto retail"
   active period shown as "retail"
   visits shown as 108
   shoppers shown as 18
   postulations shown as 48
6. Login artwork visibly references Gravicentra CX while this review lane is still the CXOrbia Recovery candidate; branding must follow the frozen Recovery branding decision before promotion.
7. Human visual acceptance is therefore NOT granted.

Fresh clean-browser reproduction:
- Role-card clicks for Shopper and Admin did not reproduce the blocking modal in a clean browser session.
- However the same clean session DID reproduce the missing tenant logo, visible technical status panel, and stale pre-auth retail/108/18 context.
- Therefore the blocking modal may be session/state dependent, but the composition/branding/data-context defects are independently reproducible.

## 2. Authoritative HR readback at review time

Endpoint:
Recovery DEV authoritative HR source for tenant tya / project cinepolis.

Snapshot generatedAt:
2026-09-21T15:26:09.690Z

Source revision:
9c95332fdc959dece180ac45b1083bf8e3002ae653b2dfef8121d4595aa4f307

Current calendar period:
2026-09 / SEP 2026

Current required tabs:
- SEPTIEMBRE 26
- SEPTIEMBRE 26 HN
requiredCurrentPeriodTabsPresent=true

Current HR period total:
44 visits
- GT: 34
- HN: 10

GT current-period state:
- total=34
- available/unassigned=6
- assigned=28
- scheduled=21
- realized=16
- submitted=9
- outOfRange=2
- reviewRequired=0
- unique assigned shopper identities in current period=21

HN current-period state:
- total=10
- available/unassigned=3
- assigned=7
- scheduled=7
- realized=6
- submitted=6
- outOfRange=1
- reviewRequired=1
- unique assigned shopper identities in current period=7

The pre-auth UI values retail / 108 visits / 18 shoppers are not accepted as authoritative current-period HR values.

## 3. Classification

Primary: RELEASE_COMPOSITION_FAILURE
Secondary: VISUAL_DEFECT
Blocking modal/session state: ENVIRONMENT_FAILURE candidate until exact reproducible owner is isolated.

This does NOT reopen all of I3.
It blocks only PRE-I4 human visual acceptance and production promotion.

## 4. Required repair before Paula continues visual review

The next candidate entrypoint must:
- render the official tenant logo from the tenant branding source; do not recreate the logo;
- hide technical/debug/scenario-lab output from normal human login/review;
- not expose stale demo project/period/counts before authentication;
- bind authenticated project context to tya/cinepolis and current HR revision;
- never fall back visibly to retail/demo as if it were the connected operational context;
- avoid the connected-mode blocked modal under a clean and refreshed normal login flow;
- preserve all already-certified functional behavior and the exact HR authority contract.

After the focal repair:
- repeat only affected visual/login/context gate plus same-artifact integrity as required;
- provide a clean DEV human-review URL;
- Paula resumes fast visual review;
- production remains untouched until explicit visual acceptance and later explicit I4 authorization.
