# RESUMEN PARA CLAUDE — ADDENDUM C6 AUTH FINDINGS ADJUDICATION

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_FINDINGS_ADJUDICATION_STOP_ONE_AMBIGUOUS_DUPLICATE__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_READ__NO_PRODUCTION`

## Frontend

No se modificó `/app/modules/*`, `/app/core/*`, `CX.data`, login ni composición Phase A. No crear candidata, shell paralelo ni workaround visual.

## Backend/Auth ya preservado

```text
AuthUsers=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
PREWRITE repeated=false
Activation repeated=false
```

## Hallazgo focal actual

Una única lectura Auth read-only adjudicó los outliers del smoke previo. Cuatro grupos de provider email duplicado contienen dos principals habilitados con claims/scope habilitantes; uno de esos grupos es Cliente y tres Admin/Operaciones. Esta clasificación es de seguridad/claims, no prueba que ambas cuentas entren por el login canónico.

Un quinto grupo tiene dos principals habilitados pero ninguno con acceso TyA efectivo: un principal está fuera del contrato de roles y el otro está scopeado a otro tenant/proyecto. Ese único grupo quedó ambiguo respecto de keeper/histórico/técnico y produjo `STOP_RETRY`.

Los cuatro usuarios habilitados con rol fuera de contrato no tienen acceso efectivo por `ROLE_NOT_ALLOWED`. El único Admin/Operaciones fuera de TyA es cross-tenant y no tiene acceso TyA. El Shopper outlier carece de shopperId y target project, por lo que no tiene acceso efectivo; tampoco tiene relación con el plan v4.

## No hacer en frontend

- no compensar duplicados desde UI;
- no relajar `ROLE_NOT_ALLOWED`, `TENANT_NOT_ALLOWED`, `SHOPPER_SCOPE_REQUIRED` ni aislamiento por proyecto;
- no reintroducir email técnico visible;
- no tocar módulos Phase A por estos hallazgos Auth.

## Pendiente para Claude

Solo preservar el contrato actual. Si el backend posterior cambia una cuenta/claims mediante repair autorizado, Claude no debe crear lógica especial por fingerprint ni por TyA/Cinépolis.

## Siguiente bloque backend

`C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL`, limitado a los diez principals ya identificados, sin repair, smoke ni writes.
