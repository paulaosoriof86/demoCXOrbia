# CAMBIOS BACKEND — ADDENDUM C6 AUTH FINDINGS ADJUDICATION STOP_RETRY

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_FINDINGS_ADJUDICATION_STOP_ONE_AMBIGUOUS_DUPLICATE__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_READ__NO_PRODUCTION`

## Archivos creados

- `tools/qa/cxorbia-c6-auth-smoke-findings-adjudication-readonly-v1.mjs`: adjudicador source-safe focal; una sola llamada `listUsers(1000)`, fail-close ante segunda página, fingerprints sin PII y cero writes.
- `backend/config/c6-auth-smoke-findings-adjudication-readonly-request-v1.json`: request one-shot; terminó consumido/deshabilitado.
- `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md`.
- `app/docs/evidence/C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.json`.
- este addendum y los addenda de Claude, pendientes, Academia y tracker.

## Archivos temporales creados y retirados

- `.github/workflows/cxorbia-c6-auth-smoke-findings-adjudication-source-gate-v1.yml` — retirado tras terminal.
- `.github/workflows/cxorbia-c6-auth-smoke-findings-adjudication-readonly-v1-once.yml` — retirado tras terminal.

## Gates y ejecución

```text
sourceGateCommit=2fcc0cc79ecf4cf77a32f45245020dc4e2b8cef0
sourceGateRunId=31432971654
sourceGate=PASS_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION_SOURCE_ZERO_WRITES_ONE_READ_NO_PII
requestCommit=ed081e79b3207692cb8b90b22c08feb3a241ba7b
providerRunId=31433085997
providerJobId=93600894310
artifactId=9079893971
artifactDigest=sha256:1e300e105f29fa1d85385d495ad794633a0628127366221c6597e3ff97e454d0
providerReads=1
secondProviderRead=false
```

## Resultado

- 5 grupos provider-email duplicado fueron adjudicados por fingerprints.
- 4 grupos tienen dos principals habilitados con claims/scope habilitantes para la superficie correspondiente: `DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS` a nivel de seguridad/claims; no se hizo sign-in probe.
- 1 grupo quedó ambiguo: dos principals habilitados, pero ninguno con acceso TyA efectivo; uno está fuera del contrato de roles y otro pertenece a tenant/proyecto no objetivo.
- 4 roles fuera de contrato: todos `SIN_ACCESO_EFECTIVO_ROLE_NOT_ALLOWED`; uno solapa con el grupo ambiguo.
- 1 Admin/Operaciones fuera del tenant TyA: `EXPECTED_CROSS_TENANT_NO_TYA_EFFECTIVE_ACCESS`; solapa con el grupo ambiguo.
- 1 Shopper sin target scope/shopperId: `SIN_ACCESO_EFECTIVO_SHOPPER_ID_MISSING`; no tiene relación con el plan v4.
- Solapamientos: duplicate↔unknownRole=1; duplicate↔adminTenant=1; demás=0.

Terminal:

```text
decision=STOP_RETRY_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION
errorCode=AMBIGUOUS_ADJUDICATION_1
ambiguousCases=1
repairRequiredCases=4
AuthUsers=228
AuthWrites=0
IAMWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
deploys=0
merge=false
production=false
```

## Fail-close

Request consumido/deshabilitado con `allowedExecutions=0`; workflows one-shot/source-gate retirados; no existe provider execution latente.

## Clasificación

- **Reusable CXOrbia:** adjudicación focal por fingerprints, overlaps y alcance efectivo antes de cualquier repair.
- **Exclusivo cliente:** cinco grupos/outliers Auth DEV TyA.
- **Claude/prototipo:** sin cambios frontend; no parchear UI.
- **Academia:** distinguir principal habilitado, claims habilitantes y acceso por login canónico.
- **Sin impacto Claude:** infraestructura temporal, evidencia source-safe y fail-close.

## Siguiente bloque exacto

`C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL` sobre los diez candidate fingerprints ya identificados. Sin repair, smoke, writes ni reconstrucción del universo de 340.
