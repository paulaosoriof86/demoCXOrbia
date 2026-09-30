# ADDENDUM PREVALENTE — PRE-I4 HUMAN VISUAL CANDIDATE LOCK — 2026-09-21

Project: CXORBIA RECOVERY — GO-LIVE  
Iteration: PRE-I4 HUMAN VISUAL ACCEPTANCE  
Technical state: **GO FOR HUMAN VISUAL REVIEW**  
Promotion state: **HOLD**  
Production: **DO_NOT_TOUCH**

## 1. Authority

This lock freezes the exact DEV candidate that Paula must visually review. It does not reopen I3 and does not supersede the technical evidence of Run 299 except for the focal visual-entrypoint successor proven below.

I3 baseline remains:
- Run 299 / 35556165139
- product source 77bf74f807d254637f0b2cde4b1d1668017a0c8a
- technical I3 state GO

Focal PRE-I4 successor:
- source SHA: 83429d21ee9f6d9dc5cd46fcbb9a3b598e07dcc4
- source tree: 4f7bf2c6cd7d79bc8aaab119f7970fd6f29220f9
- frozen static app artifact SHA256: 0174cd95e8b7e4d92f39843b65bdcc78929101a3e8108784211a0673ff7638fc
- build count: 0

## 2. DEV materialization

Run 303 / 35673312222:
- exactly one Firebase Hosting DEV deploy
- production=false
- source gate PASS
- frozen artifact created before deploy
- served critical files exact byte parity PASS
- wildcard/deep route resolves to canonical human entrypoint
- fresh HR contrast PASS
- browser harness initially stopped on a transient Firebase browser-context race after deploy
- classification: ENVIRONMENT_FAILURE in test harness, not product failure
- no automatic redeploy was performed

Deploy evidence artifact:
- ID 10672072559
- digest sha256:7523ff268f9172080a358c42a0126678da96cb312c4a1a7fc9965d8d7d593388

## 3. Postdeploy read-only proof

Run 304 / 35673599693:
- conclusion SUCCESS
- hosting deploys this run: 0
- exact prior frozen artifact rebound
- deterministic artifact SHA matched
- remote critical-file byte parity PASS
- deep-route canonical entrypoint PASS
- fresh HR authority PASS
- focal browser E2E PASS
- final decision PASS_PRE_I4_POSTDEPLOY_READBACK

Readback artifact:
- ID 10672225569
- digest sha256:b8769df7d13d3afb95b464de7e06eaffe4aaf3fb3408ff91041c3fdad3e544b3

## 4. Human entrypoint proof

Locked URL:
https://cxorbia-backend-dev.web.app/

Observed and asserted:
- lane=authenticated-human-canonical
- tenant id=tya
- tenant name=T&A Consultores
- official tenant logo loaded=true
- debug panel=false
- scenario laboratory=false
- data-source blocked=false
- stale retail / 108 / 18 / 48 context=false
- premature Gravicentra CX label=false
- browser-local data mode does not override canonical human source authority

Admin focal E2E:
- authenticated authorized Admin
- route dashboard PASS
- project=cinepolis
- period=cinepolis-2026-09
- same live HR revision
- refresh preserved=true

Shopper focal E2E:
- paula.osorio
- route miperfil PASS
- project=cinepolis
- period=cinepolis-2026-09
- history total=7
- same live HR revision
- refresh preserved=true

Mobile focal:
- viewport width=390
- document scroll width=390
- tenant logo visible=true
- debug/lab/blocking/stale retail all false

## 5. Fresh HR contrast

HR generatedAt: 2026-09-22T00:01:10.499Z  
HR source revision: 5112cb66a3f7f9afcb5e5845ce298c99e3c04dd890817dce8f019659b91c04ce  
Current period: SEP 2026 / cinepolis-2026-09  
Tabs: SEPTIEMBRE 26 / SEPTIEMBRE 26 HN

GT:
- total 34
- available/unassigned 6
- assigned 28
- scheduled 21
- realized 16
- submitted 9
- outOfRange 2
- reviewRequired 0
- unique assigned shoppers 21

HN:
- total 10
- available/unassigned 3
- assigned 7
- scheduled 7
- realized 6
- submitted 6
- outOfRange 1
- reviewRequired 1
- unique assigned shoppers 7

## 6. Frozen invariants

1. Do not rebuild, redeploy, recompose or replace this focal successor before Paula's human visual review.
2. Do not touch https://tya-plataforma.web.app/.
3. Human rejection only permits an exact-owner focal correction in this PRE-I4 lane; it does not reopen global I3.
4. Human acceptance must be explicit.
5. After human acceptance, I4 still requires a fresh explicit production authorization.
6. The artifact promoted later must equal the human-accepted artifact, unless a formally superseding focal artifact is created and separately locked.

## 7. Next exact action

Paula performs the short human visual review on the locked DEV URL.

No further technical change is authorized or required before that review.
