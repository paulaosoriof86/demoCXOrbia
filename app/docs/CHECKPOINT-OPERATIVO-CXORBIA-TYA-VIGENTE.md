# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `DETERMINISTIC_SUFFIX_SOURCE_STATIC_PASS__PROVIDER_HOLD_CREDENTIAL_CROSSWALK_DRIFT_13__RESULTS_PROVISIONAL__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Hosting DEV de este bloque: `0`;
- ejecuciones provider de este bloque: `1`;
- segundo intento provider: `0`.

## 2. Contrato preservado

```text
Login normal Shopper: nombre.apellido
Excepción autorizada: nombre.apellido.<sufijo técnico no PII>
Sufijo: sha256(tenantId + NUL + shopperId), 4/6/8
Contraseña: Nombre123*
Namespace: shopper
Membership requerido: no
Autoridad: Firebase Auth + claims exactos + shopperId canónico
```

La política determinística pasó source/static. No fue materializada.

## 3. Ejecución provider read-only

```text
workflowRunId=31064458045
workflowJobId=92499147712
artifactId=8953330337
artifactDigest=sha256:dc98e359ec09ee04cf0b9ba49acb4062a789707fe4e34cfadbf977dce10e2c39
sourceStatic=PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
provider=HOLD_C6_DETERMINISTIC_SUFFIX_CREDENTIAL_CROSSWALK_STOP_RETRY
```

Checkout, autorización, credencial DEV, source/static, lectura provider y carga del artifact completaron. El HOLD es contractual y metodológico, no de infraestructura.

## 4. Causa raíz demostrada

La ejecución leyó 109 credenciales, pero el crosswalk produjo:

```text
referencia estable anterior=101 mapped / 8 unmapped
planner determinístico=88 mapped / 21 unmapped
drift=13
```

Causa exacta:

- el clasificador estable incorpora a `relationIndex` cada `TECH_KEY` de las fuentes HR, visitas, certificaciones y liquidaciones enlazadas;
- el planner determinístico solo guarda esas fuentes en `linkedByProfile`;
- el mapeo de credenciales posterior consulta `relationIndex`;
- 13 credenciales perdieron así su anclaje técnico antes de completar apellido y puntuar Auth.

La evidencia de source está registrada en `DIAGNOSTICO-RAIZ-C6-DETERMINISTIC-SUFFIX-CREDENTIAL-CROSSWALK-HOLD-20260805.md`.

## 5. Resultados observados, provisionales

```text
profiles=340
authUsers=110
credentials=109
surname consensus completions observed=71
remaining active surnames observed=12
collision groups observed=65
active identities observed=142
unique unsuffixed keeper groups observed=52
all-suffixed groups observed=13
suffix4 observed=90
suffix6 observed=0
suffix8 observed=0
suffix collisions observed=0
target login collisions observed=0
multi-Auth unresolved observed=1
```

Estas cifras no sustituyen el baseline estable anterior porque fueron calculadas con 13 anclajes de credencial faltantes. En especial, 65/142 no queda congelado como baseline final.

## 6. Plan observado, diagnóstico no ejecutable

| Operación primaria observada | Total |
|---|---:|
| CREATE_AUTH | 81 |
| UPDATE_AUTH | 46 |
| NO_OP | 73 |
| HOLD | 13 |
| PRESERVE_NO_AUTH | 127 |
| **Total** | **340** |

```text
planDigestObserved=831c9602aa5686aea22694970aa1beb9557f4bb7b966d4233e028e63fb456d01
credentialCrosswalkParity=false
readyForAuthRepair=false
```

No se autoriza ejecutar las filas sin HOLD ni utilizar esta distribución como plan de repair.

## 7. STOP_RETRY y estado seguro

```text
REQUEST_CONSUMED=true
AUTOMATIC_RETRY=false
PROVIDER_SECOND_ATTEMPT=false
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE_WRITES=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
HOSTING_DEPLOYS_THIS_BLOCK=0
CLOUD_RUN_DEPLOYS=0
MAKE_CALLS=0
GEMINI_CALLS=0
PAYMENT_WRITES=0
RAW_NAMES/LOGINS/EMAILS/PASSWORDS/UIDS_EXPORTED=false
MERGE=false
PRODUCTION=false
```

El runner terminó con delta limpio: tracked `0`, untracked `0`.

## 8. Phase A preservada

Se preservaron frontend canónico, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 9. Documentación prevalente

- diagnóstico de causa raíz;
- evidencia v2 del HOLD;
- request consumido y deshabilitado;
- cambios backend de corrección;
- resumen Claude de corrección;
- pendientes de corrección;
- impacto Academia;
- tracker de corrección;
- índice activo y PR #7.

Los documentos iniciales del bloque que presentaron 65/142 como baseline definitivo quedan supersedidos por este checkpoint.

## 10. Siguiente bloque exacto

```text
SOURCE-ONLY CROSSWALK ROOT FIX
→ propagar TECH_KEYS de fuentes enlazadas a relationIndex
→ preservar basis de linaje
→ fixture y gate 101 mapped / 8 unmapped
→ hard stop ante credential drift
→ validar política 4/6/8 y plan 340 estático
→ STOP sin provider reads
```

Solo después de source/static PASS podrá solicitarse una nueva autorización provider read-only. No existe autorización residual para retry, Auth repair, contraseña, deploy, merge o producción.
