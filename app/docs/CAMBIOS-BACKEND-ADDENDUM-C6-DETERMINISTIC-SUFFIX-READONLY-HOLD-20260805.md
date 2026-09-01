# CAMBIOS BACKEND — C6 Deterministic Technical Suffix Read-only HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Exclusivo TyA · Sin impacto visual Claude

## Alcance ejecutado

Se consumió exactamente una autorización provider read-only para adoptar `DETERMINISTIC_TECHNICAL_SUFFIX` como excepción mínima al login Shopper `nombre.apellido`.

Se prepararon y gatearon:

- contrato reusable de sufijo técnico determinístico;
- planner source-safe de 340 filas;
- regla 4/6/8 derivada de `sha256(tenantId + NUL + shopperId)`;
- preservación del login sin sufijo cuando existe un titular técnico inequívoco;
- completado de apellido mediante fuentes explícitas, login técnico y consenso multi-fuente;
- scoring multi-Auth con claims, shopperId, credenciales, compatibilidad de contraseña y metadata provider;
- workflow config-only con una sola lectura provider y STOP_RETRY.

## Archivos creados

- `backend/contracts/c6-shopper-deterministic-suffix-v1.json`;
- `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
- `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml`;
- `app/docs/SOURCE-LOCK-C6-DETERMINISTIC-SUFFIX-READONLY-20260805.md`;
- `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`;
- `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-READONLY-HOLD-LATEST.json`.

## Source/static

```text
PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
PASS_NODE_SYNTAX
PASS_DETERMINISTIC_SUFFIX_4
PASS_SUFFIX_EXPANSION_6_8
PASS_MULTI_SOURCE_SURNAME_CONSENSUS
PASS_NO_PII_SUFFIX_CONTRACT
PASS_ONE_PRIMARY_OPERATION_SCHEMA
```

## Ejecución provider read-only

```text
run=31064458045
job=92499147712
artifact=8953330337
digest=sha256:dc98e359ec09ee04cf0b9ba49acb4062a789707fe4e34cfadbf977dce10e2c39
HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY
```

El workflow no falló por credenciales, checkout, sintaxis o infraestructura. El `HOLD` fue contractual por residuos técnicos reales.

## Resultado de apellidos

```text
baseline previo sin apellido técnico activo=83
completados por consenso multi-fuente=71
pendientes activos=12
```

El completado source-safe reveló una colisión activa adicional:

```text
baseline anterior=64 grupos / 141 identidades
baseline regenerado=65 grupos / 142 identidades
```

No fue una regresión ni una colisión creada por el sufijo; fue una identidad real que antes permanecía oculta por apellido incompleto.

## Resultado del sufijo

```text
grupos con titular inequívoco y login sin sufijo=52
grupos donde todas las identidades reciben sufijo=13
identidades con sufijo de 4 caracteres=90
sufijo de 6 caracteres=0
sufijo de 8 caracteres=0
colisiones de sufijo=0
colisiones de target login=0
```

## Multi-Auth

El único perfil multi-Auth continuó empatado después de aplicar todas las señales autorizadas. Se mantuvo `HOLD`; no se eligió un candidato arbitrariamente.

## Plan no superpuesto

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
TOTAL=340
email=39
password=14
claims=38
planDigest=831c9602aa5686aea22694970aa1beb9557f4bb7b966d4233e028e63fb456d01
```

Los 13 HOLD corresponden a 12 apellidos activos no resueltos y un empate multi-Auth. El plan es no ejecutable.

## Estado seguro

```text
provider executions=1
provider second attempt=0
Auth/password/membership/Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/pagos=0
merge=false
production=false
repository runtime delta=0
```

## Phase A

Se preservaron frontend canónico, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas y sincronización HR/plataforma.

## Siguiente bloque exacto

Bloque source-only de causa raíz para diseñar evidencia técnica adicional para los 12 apellidos activos y el empate multi-Auth, sin provider retry. Solo después de source/static PASS podrá solicitarse una nueva autorización read-only puntual.
