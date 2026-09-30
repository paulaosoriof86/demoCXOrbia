# CAMBIOS-BACKEND — ADDENDUM C6 SMOKE READ-ONLY IDENTITY/SCOPE STOP

**Fecha:** 2026-08-10  
**Estado:** `C6_SMOKE_READONLY_STOP_IDENTITY_SCOPE_FINDINGS__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_SMOKE__NO_PRODUCTION`

## Archivos creados

- `tools/qa/cxorbia-c6-accumulative-multirole-smoke-readonly-v1.mjs`: smoke runtime read-only source-safe; una sola lectura `listUsers`, validación de roles/scopes y superficies Phase A.
- `backend/config/c6-accumulative-multirole-smoke-readonly-request-v1.json`: request one-shot; terminalmente consumido/deshabilitado.
- `app/docs/SOURCE-LOCK-C6-ACCUMULATIVE-MULTIROLE-SMOKE-READONLY-IDENTITY-SCOPE-STOP-RETRY-20260810.md`.
- `app/docs/evidence/C6-ACCUMULATIVE-MULTIROLE-SMOKE-READONLY-IDENTITY-SCOPE-STOP-RETRY-20260810.json`.
- addenda de Claude, pendientes, Academia y tracker Phase A de este mismo bloque.

## Archivos temporales creados y retirados

- `.github/workflows/cxorbia-c6-smoke-readonly-source-gate-v1.yml` — retirado tras consumo.
- `.github/workflows/cxorbia-c6-accumulative-multirole-smoke-readonly-v1-once.yml` — retirado tras único provider smoke.

## Gates y ejecución

- source gate: `PASS_C6_SMOKE_READONLY_CREDENTIAL_LIFECYCLE_SOURCE_ZERO_WRITES_NO_PII`, run `31424489260`.
- provider smoke único: run `31424532292`, job `93572980396`, artifact `9076650610`.
- lifecycle anterior `ENOENT` quedó corregido: credencial DEV efímera nueva se cargó y hubo exactamente una lectura Auth.
- terminal: `STOP_RETRY_C6_ACCUMULATIVE_MULTIROLE_SMOKE_READONLY / DUPLICATE_PROVIDER_EMAILS`.

## Hallazgos source-safe

- población Auth: 228; habilitados 227; deshabilitado 1.
- 5 grupos de provider email duplicado.
- 4 usuarios habilitados con rol fuera de la familia permitida.
- Admin/Operaciones: 11 habilitados; 10 con tenant permitido.
- Shopper: 209 habilitados; 208 target-scoped y 208 con shopper scope presente.
- Cliente: 3 habilitados; 3 tenant/project scoped.
- superficies Phase A source-side: 20/20.

## Seguridad

```text
providerReads=1
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
rawPIIExported=false
secondSmokeProviderAttempt=false
```

## Bloqueados/protegidos

- no repetir PREWRITE/Activation Auth DEV;
- no reconstruir 340 perfiles;
- no corregir aún los outliers sin adjudicación read-only;
- no nuevo smoke dentro de esta autorización.

## Clasificación

- **Reusable CXOrbia:** lifecycle de credencial independiente para smoke read-only y output source-safe.
- **Exclusivo cliente:** outliers Auth TyA/Cinépolis.
- **Claude/prototipo:** 20/20 superficies fuente presentes; sin cambios frontend.
- **Academia:** documentar transición de fallo de harness a hallazgo runtime real.
- **Sin impacto Claude:** cero deploy y cero writes.
