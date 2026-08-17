# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 15:28 -06:00  
**Estado:** `I3_5B_CONSUMED_SAFE_HOLD_ZERO_WRITES__I3_6_HARNESS_SOURCE_FIXED__NO_REPROCESS`

## 2026-08-17 — I3.5B provider-backed exact crosswalk validation

### Gate

Se ejecutó una sola vez `I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET` sobre product target HEAD `aeea1e77e74bbfa179a6a6f326b0a5f53bdcf24e`.

Se reutilizó el workflow existente `.github/workflows/cxorbia-phase-a-firestore-materialization-executor.yml`; no se creó workflow/rama/PR/candidata nueva.

Archivos de tooling/gate añadidos:

- `tools/migration/tya-i3-5b-provider-exact-crosswalk-one-target.mjs`;
- `tools/migration/tya-i3-5b-provider-exact-crosswalk-request-control.mjs`;
- `backend/requests/i3-5b-provider-exact-crosswalk-one-target.json`.

Workflow trigger commit: `0fba7b6daabd5ad3b44e549753a659dd0644d989`.
Run `32070767910`; job `95513264398`.

### Resultado

Evidencia: `app/docs/evidence/ITERATION3-I3-5B-PROVIDER-EXACT-CROSSWALK-LATEST.json`.

Decisión: `HOLD_I3_5B_NO_INDEPENDENT_PROVIDER_AUTHORITY` / `SAFE_HOLD_ZERO_WRITES`.

Provider read observó:

- tenant collection metadata: 22;
- canonical profile candidate paths: 5;
- existing `shopperIdentityLinks`: 0;
- visit documents: 616;
- period documents: 14;
- exact independent authority records for August target: 0;
- conflicting authority records: 0.

La capa provider protegida sigue en 616/14 mientras HR live está frozen en 660/15. El provider no contiene el puente técnico exacto de agosto necesario para autorizar un mapping automático.

### Safety

Firestore writes `0`; shopperIdentityLink writes `0`; Historical Shopper access/login/recovery/reset `0`; Auth reads/writes `0`; user creates/updates `0`; password changes/resets `0`; HR/Finance/Rules/Storage/Make/Gemini/payment/deploy writes `0`; merge=false; production=false.

El request quedó consumed=true, noAutomaticRetry=true. I3.5B no se rerun.

### Source lock

`SOURCE-LOCK-I3-5B-PROVIDER-VALIDATION-SAFE-HOLD-ZERO-WRITES-20260817.md`.

### Próxima frontera

`I3.5C_AUTHORITATIVE_TENANT_ADJUDICATION_REQUIRED__STOP_AUTOMATIC_MAPPING`.

Solo una fuente técnica exacta independiente o una adjudicación humana explícita del tenant puede crear la autoridad faltante. No se inventa mapping por nombre/email/phone/WhatsApp/username/shopperCode/hash.

## Frozen/no reprocess

I1/I2/I3.1/.2/.3/.4/.7 PASS; Historical Shopper `31906391682`; TARGET_B Admin `32049054855`; request08; HR 15/660; Finance V2/historical; canonical V2/exact identity; durable legal receipt. I3.6 product/evidence PASS + harness source fixed `84d26871c6f0cff96eaa84a8789d78b462e190ee`.

## Progreso

Formal sigue **35%/65%** por scoring integral de I3. Operativamente I3.5A + I3.5B ya están agotados; el blocker es ausencia real de autoridad exacta.

## Clasificación

Reusable CXOrbia: exact-identity fail-closed/provider-first validation. Exclusivo cliente: August target TyA. Claude/prototipo: no UI patch. Academia: source-safe vs provider authority vs tenant adjudication. Sin impacto Claude: executor/request/evidence/source lock.
