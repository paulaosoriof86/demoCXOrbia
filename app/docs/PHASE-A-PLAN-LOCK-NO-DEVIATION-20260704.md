# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-11  
**Estado:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## Objetivo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar Phase A a producción sin reabrir módulos preservados, crear carriles paralelos ni sustituir datos vivos por hardcode.

## Protegido

```text
AuthUsersFrozenBaseline=228
Activation/Readback/Rollback=PASS
SKIP13=13/13 closed
MultiAuth=closed
HashConfig=PASS
DirectRunnerDEV=PASS
M4=COMPLETE
M6 HR live=COMPLETE
LiveUserAdminStaticGate=PASS
ProviderSnapshot=PASS run 31518927950
FrozenAuthBudget=14
FrozenFirestoreBudget=16
```

## Exact write — STOP seguro

Request `c6-staff-repair-bootstrap-exact-write-20260811-01`, run `31534505451`, se detuvo antes del primer provider write:

```text
blocker=PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B
credentialPrivacyPass=true
identityResolutionPass=false
AuthWrites=0
FirestoreWrites=0
Deletes=0
```

Causa raíz: el target login se preservó como digest SHA-256 source-safe, pero el write necesita el `visibleLogin` exacto y las fuentes privadas disponibles no reprodujeron B. No se permite inferir ni reemplazar identidad.

## M5 y métrica

```text
M5a contract source-only                    = 1/8 COMPLETE
M5b executable backend source materialized = 1/8 COMPLETE
M5c static terminal gate                    = 1/8 COMPLETE
M5d provider snapshot + exact prewrite      = 1/8 COMPLETE
M5 exact write                              = STOP / NOT CREDITED
M5 total                                    = 4/8 COMPLETE
```

**Phase A: 84% certificado; 16% restante.**

## Cadena única restante

```text
C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY
-> recovery exact A-D PASS
-> nueva autorización focal de exact write
-> repair/bootstrap create-before-retire + readback/rollback
-> wiring localizado Usuarios & Permisos
-> M7 final multirole smoke contra HR viva
-> M8 human validation + rollback ready
-> M9 explicit cutover + one production promotion
-> M10 post-cutover smoke + freeze
```

## Circuit breakers

- no reejecutar request consumido;
- no repetir provider snapshot/static/HR/owners/scopes;
- no reabrir M1-M4, M6, Auth 340, SKIP13 o MultiAuth;
- no inferir B ni crear login sustituto;
- no hardcode/wildcard;
- no nueva candidata/rama/PR/workflow;
- no Auth/Firestore writes hasta recovery PASS + nueva autorización;
- no deletes/deploy/merge/producción.

## Estado seguro

La ejecución exact-write consumida dejó cero provider writes. Producción, R4, A, los ocho históricos y toda la baseline siguen intactos.
