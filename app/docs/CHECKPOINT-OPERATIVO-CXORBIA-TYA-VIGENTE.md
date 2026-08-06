# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC_PASS__PROVIDER_REVALIDATION_NOT_AUTHORIZED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source commit del root fix: `6160ef89b75bcdf9068c210810c528d3c6d13db1`;
- producción: intacta;
- provider reads de este bloque: `0`;
- provider writes: `0`;
- Hosting/Cloud Run deploys: `0`.

## 2. Contrato Shopper preservado

```text
Login normal: nombre.apellido
Excepción solo ante colisión activa: nombre.apellido.<sufijo técnico no PII>
Sufijo: sha256(tenantId + NUL + shopperId), 4/6/8
Contraseña: Nombre123*
Namespace: shopper
Membership requerido: no
Autoridad: Firebase Auth + claims exactos + shopperId canónico
```

La política fue aprobada y permanece sin materializar.

## 3. Causa raíz corregida

El planner determinístico perdía 13 anclajes porque `link()` guardaba las fuentes HR, visita, certificación o liquidación en `linkedByProfile`, pero no propagaba sus `TECH_KEYS` hacia `relationIndex`.

El source vigente ahora:

- preserva el objeto fuente y su `basis`;
- ejecuta `propagateLinkedSourceTechKeys(relationIndex, source, shopperId)`;
- indexa cada llave técnica no vacía de la fuente enlazada;
- calcula `credentialsMapped`, `credentialsUnmapped` y `credentialCrosswalkParity`;
- congela `101 mapped / 8 unmapped` como referencia esperada del próximo provider gate;
- bloquea `readyForAuthRepair` si falta paridad;
- genera `credential_crosswalk_drift:mapped/unmapped` ante cualquier diferencia.

## 4. Source/static — PASS

```text
workflowRunId=31066003792
workflowJobId=92503740935
requestCommit=8b1ee44906f6c46a751d97548cbc2542a3935ca2
sourceCommit=6160ef89b75bcdf9068c210810c528d3c6d13db1
sourceSha256=3200b8833b3af10a27e0493df992836f99d3e78668f2265269d2bd0c74640568
PASS_C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC
PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
```

Gates superados:

```text
PASS_NODE_SYNTAX
PASS_LINKED_SOURCE_TECH_KEYS_PROPAGATED
PASS_LINKED_SOURCE_BASIS_PRESERVED
PASS_CREDENTIAL_CROSSWALK_FIXTURE
PASS_STABLE_CREDENTIAL_REFERENCE_101_8
PASS_CREDENTIAL_DRIFT_HARD_STOP
PASS_READY_REQUIRES_CROSSWALK_PARITY
PASS_PLAN_340_SCHEMA_PRESERVED
PASS_SUFFIX_POLICY_4_6_8_PRESERVED
PASS_PROVIDER_READS_ZERO
```

## 5. Incidencia transitoria cerrada

El primer intento source-only `31065882519 / 92503388270` aplicó y verificó el patch en el runner, pero no pudo ejecutar el self-test del target porque faltaba la dependencia transitoria `firebase-admin`. No creó commit, no consumió el request y no realizó provider read.

Se corrigió el workflow para instalar la dependencia y publicar el estado real. El segundo intento del mismo bloque terminó PASS y consumió el request.

## 6. Estado del request

```text
enabled=false
consumed=true
status=consumed_source_static_pass_no_provider_read
providerReads=0
providerWrites=0
nextGate=NEW_EXPLICIT_PROVIDER_READONLY_AUTHORIZATION_REQUIRED
```

## 7. Resultados provider aún provisionales

La ejecución provider anterior se hizo antes de este root fix y tuvo crosswalk incompleto. Por tanto continúan sin valor de baseline final:

```text
65 collision groups observed
142 active identities observed
12 active surname holds observed
1 multi-Auth tie observed
340 diagnostic plan rows observed
```

La referencia 101/8 quedó protegida en source, pero no se afirma todavía que el provider corregido la alcance. Tampoco se afirma que 64/141 o 65/142 sean el resultado definitivo.

## 8. Phase A preservada

Se preservaron:

- frontend canónico, módulos y `CX.data`;
- HR e histórico completo;
- shoppers, postulaciones y certificaciones;
- visitas, liquidaciones y pagos;
- multi-tenant y multi-proyecto;
- sincronización HR/plataforma;
- Finanzas, Portal Cliente, Portal Shopper y Reservas;
- Academia y manuales sin cifras provisionales.

## 9. Estado seguro

```text
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE_WRITES=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
HOSTING_DEPLOYS=0
CLOUD_RUN_DEPLOYS=0
MAKE_CALLS=0
GEMINI_CALLS=0
PAYMENT_WRITES=0
MERGE=false
PRODUCTION=false
```

## 10. Documentación vigente

- evidencia source/static PASS;
- source lock del root fix;
- cambios backend;
- resumen para Claude;
- pendientes del prototipo;
- impacto Academia;
- tracker Phase A;
- índice vigente;
- PR #7.

## 11. Siguiente bloque exacto

```text
NUEVA AUTORIZACIÓN PROVIDER READ-ONLY ONE-SHOT
→ comprobar paridad real 101 mapped / 8 unmapped
→ recalcular apellidos activos pendientes
→ recalcular grupos de colisión e identidades activas
→ resolver o mantener HOLD del perfil multi-Auth
→ regenerar plan no superpuesto de 340 filas
→ STOP_RETRY ante cualquier residual
→ detenerse antes de Auth/password/membership/Firestore/Rules/Storage/HR write o deploy
```

No existe autorización residual para provider read, Auth repair, deploy, merge o producción.
