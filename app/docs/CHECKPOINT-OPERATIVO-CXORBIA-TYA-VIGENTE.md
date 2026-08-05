# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `HUMAN_LOGIN_SINGLE_FORM_SOURCE_FIX_PASS__SHOPPER_IDENTITY_AUDIT_PASS_WITH_FINDINGS__NO_DEPLOY__IDENTITY_REPAIR_REQUIRED__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV acumulado: `3`;
- Hosting DEV de este bloque: `0`;
- deploy adicional autorizado: `0`.

## 2. P0 humano demostrado

La validación humana mostró dos pares de campos de acceso:

1. `#loginForm`, `#lgUser` y `#lgPass` visibles desde el inicio, pero con submit inerte;
2. un segundo bloque `#cxIntegratedAuthStep` agregado después de seleccionar el rol.

```text
P0_PROVEN=true
CODE=HUMAN_LOGIN_SINGLE_FORM_CONTRACT_BROKEN
```

Los gates anteriores autenticaban una identidad técnica elegida desde un paquete privado y no comprobaron el flujo humano completo ni toda la población Shopper.

## 3. Corrección source-only aplicada

`app/core/backend-browser-auth.js` ahora:

- reutiliza exclusivamente `#loginForm`, `#lgUser`, `#lgPass` y `#lgSubmit`;
- exige seleccionar el perfil antes de autenticar;
- valida que el rol real corresponda al perfil elegido;
- elimina cualquier overlay legado `#cxIntegratedAuthStep` si aparece;
- instala un guard final después de los wrappers acumulativos;
- no guarda contraseñas, tokens, correos internos ni UID.

No se modificaron módulos, diseño, lógica de negocio ni `CX.data`. No hubo deploy.

## 4. Source/static — PASS

```text
workflowRunId=31041288528
workflowJobId=92425994929
artifactId=8944661204
artifactDigest=sha256:2eaade7708636d49e44eafb32416b9f54f66e496cf95ae4830dbd2c2a42c92b9
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY
```

## 5. Auditoría completa de identidad Shopper — PASS con hallazgos

```text
workflowRunId=31041406837
workflowJobId=92426382117
artifactId=8944714638
artifactDigest=sha256:6c9451c7ef698e23e054dd9653db433472ff5c6ffa0a1c7f0b70758baad2abaf
PASS_C6_HUMAN_LOGIN_SHOPPER_IDENTITY_AUDIT_WITH_FINDINGS
```

Resultados source-safe:

| Control | Resultado |
|---|---:|
| Perfiles Shopper en Firestore | 340 |
| Registros Shopper con credencial heredada | 109 |
| Logins únicos | 109 |
| Usuarios Auth encontrados | 88 |
| Claims válidos | 88 |
| Scope Cinépolis válido | 88 |
| Perfiles enlazados por `shopperId` | 88 |
| Perfiles sin mapeo de credencial | 252 |
| Patrón `nombre.apellido` | 79 |
| Hash compatible con `Nombre123*` | 81 |
| Sign-in compatible | 85 |
| Excepciones con contraseña exacta compatible | 4 |
| Identidades Auth faltantes | 21 |
| Memberships Shopper en `tenants/tya/users` | 0 de 109 |

Conclusión: el patrón `nombre.apellido` / `Nombre123*` no es universal y no debe comunicarse todavía como regla para todos los shoppers.

## 6. Identidad de Paula

La auditoría encontró dos candidatas source-safe asociadas a Paula: una Staff y una Shopper.

```text
candidates=2
staffCandidates=1
shopperCandidates=1
authUsers=1
claimsValid=1
membershipsValid=0
passwordPatternCompatible=0
passwordSignInCompatible=0
fullReady=0
ambiguous=true
```

No se expusieron nombres de usuario, contraseñas, correos internos, UID ni tokens.

## 7. Estado seguro

```text
HOSTING_DEPLOYS_THIS_BLOCK=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_WRITES=0
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
MAKE_CALLS=0
GEMINI_CALLS=0
PAYMENTS_WRITES=0
CREDENTIALS_EXPOSED=false
MERGE=false
PRODUCTION=false
```

## 8. Phase A preservada

Se preservaron HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 9. Siguiente bloque exacto

Antes de cualquier write debe definirse el contrato objetivo:

1. confirmar si cada Shopper requiere membership en `tenants/tya/users` o si claims + perfil constituyen el contrato canónico;
2. resolver la identidad dual de Paula;
3. preparar un plan idempotente por población para 21 Auth faltantes, 24 credenciales incompatibles, 30 excepciones de login y 252 perfiles sin mapeo;
4. ejecutar primero dry-run completo y conteos esperados;
5. solicitar autorización expresa antes de cualquier creación de usuario, cambio de contraseña o membership write.

No hay deploy autorizado ni requerido en este punto.
