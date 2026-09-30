# CODEX EXECUTION TASK — I3 VRM-081 AUTH POPULATION CLOSURE

**Date:** 2026-09-27  
**Iteration:** I3 FUNCTIONAL CLOSURE  
**State:** P0_PROVEN_FOCAL_CODEX_ONLY  
**Repository:** paulaosoriof86/demoCXOrbia  
**Branch:** recovery/cxorbia-phase-a-20260831  
**Control HEAD at handoff:** 28b21ab83b68e8ea5b5c7d0eefa1b9b0ff6714b0  
**Certified product source before this fix:** 77b29e303c825be586a97e159d4d65bfae7e66c8  
**Certified product tree before this fix:** 279f33d6ad734ac7da9e5764dd05c91cab8882aa

## 1. Authority and purpose

Read and obey, in order:

1. 00_START_HERE_CXORBIA_RECOVERY.md
2. ADDENDUM_PREVALENTE_RECUPERACION_CXORBIA.md and later frozen Recovery addenda
3. PLAN_RECTOR_RECUPERACION_CXORBIA.md
4. CONTRATOS_FUNCIONALES_CXORBIA_RECOVERY.md
5. current canonical candidate descriptor and cumulative findings ledger
6. this task

This is not a new audit, branch, candidate, workflow methodology, or product. I3 permits Codex only for a proven focal P0. VRM-081 is that P0.

Goal: close VRM-081 without weakening identity authority, without fuzzy matching, without merging people by name, and without production changes.

## 2. Frozen evidence

Recovery Run 532:
- run ID: 36352872025
- conclusion: success
- job: I3 VRM-081 — population credential diagnostic read-only
- artifact ID: 10943305504
- artifact digest: sha256:a37db670a4785218ce5333a31ab5df910cd93cc25993e7b592b545d95fabcd5e
- HR revision: 7509374c11643838f40f61434e2d076126f466e9c0953cbc2300febaf91919c8
- source HR shoppers: 221
- identity-link conflicts: 0
- review queue: 105
- exact alias migration queue: 30

Observed queue:
- SHOPPER_VISIBLE_LOGIN_COLLISION: 95
- SHOPPER_CREDENTIAL_NAME_INCOMPLETE: 9
- SHOPPER_AUTH_EMAIL_CONFLICT: 1

Diagnostic classification:
- 94 historical Auth-email occupants eligible for mechanical exact review
- 2 current/current visible-login collision rows
- 8 source-name-incomplete rows that already have one active membership and one enabled Auth principal with exact canonical claims
- 1 source-name-incomplete non-login-bearing row
- 30 exact alias migrations with exactIdentityAlreadyProven=true and requiresHumanAdjudication=false
- 0 unsafe exact alias migrations

The approved collision policy already exists in repository evidence:
DETERMINISTIC_TECHNICAL_SUFFIX, SHA-256(tenantId + NUL + shopperId), suffix lengths 4/6/8, preserving the unique unsuffixed technical holder when one exists.

## 3. Proven root cause

Primary owner:
- backend/runtime/cxorbia-shopper-command-provider-v1.mjs

Current code has three focal defects:

A. durableUpsert computes shopperCredentialRule before it can preserve/reuse an already exact existing membership + Auth principal. Therefore an incomplete historical HR name can quarantine an identity that is already exactly bound.

B. a real current/current base-login collision throws SHOPPER_VISIBLE_LOGIN_COLLISION instead of applying the already approved deterministic suffix exception to distinct proven canonical shoppers.

C. a proven exact alias with a legacy self-mapped crosswalk throws SHOPPER_EXACT_ALIAS_SELF_CROSSWALK_MIGRATION_REQUIRED and is only queued, even when exact identity authority already proves the canonical target and human adjudication is false.

## 4. Allowed files

Product owner:
- backend/runtime/cxorbia-shopper-command-provider-v1.mjs

Tests:
- backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs

Do not modify any other product file unless a failing test proves an unavoidable direct dependency. If that occurs, STOP and report the exact dependency; do not broaden scope.

Do not modify app UI, shopper credential base rule, HR source, Firestore Rules, Storage Rules, project wizard, deployment workflow, or production configuration in this task.

## 5. Required behavior

### 5.1 Exact existing principal preservation

When all of the following are true:
- exactly one active shopper membership resolves to the canonical shopper;
- exactly one enabled Auth principal matches tenantId + shopperId + role=shopper + authNamespace=shopper + projectId;
- there is no identity-link conflict;
- there is no duplicate membership/principal ambiguity;

then an incomplete current HR display name must not invalidate that exact identity.

Requirements:
- do not create a second Auth user;
- do not rewrite password from an incomplete/technical source name;
- do not fabricate surname or login;
- preserve exact claims, UID and canonical shopper ownership;
- merge only safe HR-managed fields that are actually present;
- if an exact durable visibleLogin already exists, preserve it;
- if no exact visible login can be proven, leave credential materialization fail-closed and return a specific residual reason; do not guess.

The non-login-bearing incomplete-name case must remain quarantined unless exact evidence becomes sufficient.

### 5.2 Current/current collision exception

For distinct exact canonical shoppers that resolve to the same base visible login:
- never merge identities by name;
- preserve the unique existing unsuffixed technical holder when exactly one exists;
- for the other exact canonical shoppers allocate baseLogin + "." + deterministic suffix;
- suffix = sha256(tenantId + NUL + shopperId), trying 4, then 6, then 8 chars;
- ensure target visible login and internal Auth email are unique before write;
- persist the chosen visibleLogin durably in profile + membership;
- remain idempotent on replay;
- if keeper is ambiguous or a target still collides after 8 chars, fail closed and report an identity-review residual.

This is an exception only for proven collisions. The normal credential rule remains firstName.firstSurname.

### 5.3 Exact alias migration

When:
- trusted exact identity link maps sourceShopperId -> canonicalShopperId;
- sourceShopperId != canonicalShopperId;
- existing source crosswalk is a legacy self-map;
- exactIdentityAlreadyProven is true;
- no conflicting identity link exists;

then migrate the crosswalk idempotently to the canonical shopper instead of queuing migration debt.

Requirements:
- preserve sourceShopperId in canonical sourceShopperIds/exactAliases;
- reuse canonical Auth principal when present;
- do not create a duplicate Auth principal;
- do not fuzzy-match;
- do not delete historical evidence;
- do not write HR/external source;
- repeat execution must be a no-op/idempotent replay.

## 6. Mandatory tests

Update/add tests in the allowed test file for at least:

1. exact existing membership + exact Auth + incomplete HR name => principal preserved, no new Auth, no fabricated login/password;
2. incomplete HR name with no exact principal/login evidence => remains fail-closed;
3. 3 distinct canonical shoppers sharing one base login, with one unique existing base holder => keeper stays base, other two receive deterministic suffixes;
4. suffix replay => same logins, no extra Auth users;
5. suffix collision escalation 4 -> 6 -> 8;
6. ambiguous keeper => HOLD/review, no identity merge;
7. exact alias self-crosswalk + trusted identity link => crosswalk migrates to canonical;
8. alias migration replay => idempotent/no duplicate Auth;
9. conflicting identity link => hard fail;
10. unrelated shopper reconciliation remains unchanged;
11. provider writes remain tenant/project scoped;
12. HR/external writes remain zero.

Preserve and update prior tests that currently assert quarantine if behavior is intentionally superseded by this proven fix. Do not simply delete coverage.

## 7. Gates before any DEV materialization

Run at minimum:
- node --check backend/runtime/cxorbia-shopper-command-provider-v1.mjs
- node --test backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs
- any existing focused shopper provider / HR runtime test suite required by the repository
- git diff --check
- verify changed product paths are only the allowed owner/test paths

Required source outcome:
VRM081_SOURCE_FIX_PASS

If any test proves a different root cause, STOP and classify only with the Recovery failure taxonomy. Do not open a new methodology.

## 8. DEV proof after source PASS

Do not touch production.

Use the existing Recovery DEV lane only. No new workflow, branch, Firebase product, provider, or candidate.

Required proof:
- same 221-source-shopper population, or a newer HR revision explicitly reported;
- zero identity-link conflicts;
- no duplicate canonical Auth principals;
- no fuzzy matching;
- exact alias migrations no longer remain as migration debt when safe;
- current/current collision rows are resolved only by the approved deterministic suffix exception;
- incomplete-name exact principals are preserved without fabricated credentials;
- remaining identity review contains only truly unresolved identities;
- shopper login smoke for representative base-login and suffixed-login principals;
- Admin identity/history/KPI visibility unchanged;
- HR writes = 0;
- external writes = 0;
- production = false.

## 9. Stop conditions

STOP, do not improvise, if:
- exact principal ownership is ambiguous;
- the fix requires changing the base shopper credential rule globally;
- a person merge would rely on name similarity;
- a password would need to be guessed or reconstructed;
- source/identity authority conflicts;
- another product file is required without a failing test proving it;
- production access/deploy would be required.

## 10. Required Codex output

Report:
- HEAD_BEFORE / HEAD_AFTER;
- exact diff paths;
- tests and results;
- whether all three root-cause branches were fixed;
- residual unresolved identity count and reasons;
- whether a DEV runtime deploy is required;
- exact next gate;
- 0 production changes.

Do not declare I3 GO. Return control to Recovery for DEV population reproof and terminal certification.
