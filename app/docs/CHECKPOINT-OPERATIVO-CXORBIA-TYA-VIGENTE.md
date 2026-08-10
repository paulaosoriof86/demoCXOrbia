# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_OWNERSHIP_RECONCILIATION_HUMAN_DECISION_REQUIRED_4__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__ZERO_DATA_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-HUMAN-DECISION-REQUIRED-20260810.md`;
- evidencia vigente: `app/docs/evidence/C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-RECONCILIATION-20260810.json`;
- source lock inmediato anterior: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md`;
- request provider anterior: `backend/config/c6-auth-duplicate-keeper-targetscope-one-read-request-v2.json` consumido/deshabilitado;
- freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`;
- digest rector: `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
- producción: intacta.

## 2. Baseline Auth protegido

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PREWRITE repeated=false
Activation repeated=false
SKIP13=closed 13/13
MultiAuth=closed
targetLineage(ac93)=closed
HashConfig=closed PASS
SmokeCredentialLifecycle=closed PASS
```

No reconstruir las 340 identidades ni repetir PREWRITE/Activation.

## 3. Provider anterior cerrado

La única lectura focal del bloque anterior sigue siendo la última observación provider autorizada:

```text
runId=31441779926
jobId=93627815703
artifactId=9083100724
artifactDigest=sha256:8c3a2026027e678deb1aa0dfc828c45cdf1a251b9cee1617eaa9feb10c82eba2
providerReads=1
secondProviderRead=false
AuthPopulation=228
```

Ese bloque dejó cuatro grupos sin keeper técnico único y cerró `fd891...` como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`.

## 4. Bloque vigente — reconciliación source-safe sin provider

Universo autorizado y congelado:

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
```

Se reconciliaron exclusivamente repo/artifacts/requests/imports/readbacks/memberships/lineage source-safe ya existentes. No hubo provider reads.

## 5. Resultado terminal

```text
decision=HUMAN_OWNERSHIP_DECISION_REQUIRED_4
uniqueKeeperAnchorsFound=0
humanDecisionRequiredGroups=4
```

### A–C · Admin/Operaciones

Los seis candidates de `1acd...`, `2c4d...` y `542...` pertenecen a la clase legacy/pre-import namespace `NONE` y ninguno coincide con los principals staff canónicos importados, cuyo contrato es namespace `staff` + identificador interno namespaced.

La evidencia existente distingue **legacy vs canónico importado**, pero no distingue un member del otro dentro de cada par. Resultado:

```text
1acdcb3782b7cf351056 = HUMAN_OWNERSHIP_DECISION_REQUIRED
2c4d19f2b066835473d3 = HUMAN_OWNERSHIP_DECISION_REQUIRED
54225792eeb65f6739c0 = HUMAN_OWNERSHIP_DECISION_REQUIRED
```

### D · Cliente

Los dos candidates de `ae2f...` coinciden con lineage histórica Cliente y ninguno con la lineage canónica actual.

Existe un principal Cliente canónico separado, ya materializado y validado, con namespace `staff`, scope `tya/cinepolis`, sign-in/readback/idempotencia PASS y membresía exacta. Su fingerprint source-safe es:

```text
6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c
```

Ese principal está fuera del par congelado. No existe evidencia source-safe para elegir exactamente uno de los dos históricos como keeper:

```text
ae2f920fe6d9ce1fdd82 = HUMAN_OWNERSHIP_DECISION_REQUIRED
```

## 6. Causa raíz restante

El bloqueo restante es de **ownership/governance**, no de Auth runtime, credenciales, source gate ni falta de otra lectura provider. Repetir provider con los mismos campos no agrega una ancla member-level.

No se usaron antigüedad, orden, nombres, email/UID/shopperId crudos, `creationTime`, `lastSignInTime` ni inferencia visual.

## 7. Seguridad

```text
providerReadsCurrentBlock=0
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIExported=false
credentialsExported=false
```

No se creó request provider ni workflow provider.

## 8. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE — NO PROVIDER / NO REPAIR`

Capturar una decisión humana mínima y source-safe para ownership/disposition de los cuatro grupos. No ejecutar repair en el mismo bloque. Si no se puede definir un keeper inequívoco o si un par solo debe quedar histórico porque existe identidad canónica externa, conservar HOLD y preparar únicamente el contrato de disposición.

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados.

## 10. Cierre obligatorio

- **Qué se hizo:** reconciliación source-safe de ownership sin provider.
- **Avance Phase A:** cuatro conflictos quedaron correctamente clasificados como decisión humana; no queda diagnóstico técnico repetible pendiente para esos pares.
- **Qué se preservó:** Auth 228, digest v4, frontend, operación Phase A y producción.
- **Claude/prototipo:** sin cambio frontend ni relajación RBAC.
- **Academia:** patrón de revisión humana de ownership documentado.
- **Pendiente real:** decisión humana de ownership/disposition A–D.
- **Estado seguro:** cero provider reads y cero data/Auth writes en este bloque.
- **Bloqueo comprobado:** ausencia de ancla member-level única en evidencia source-safe existente.
