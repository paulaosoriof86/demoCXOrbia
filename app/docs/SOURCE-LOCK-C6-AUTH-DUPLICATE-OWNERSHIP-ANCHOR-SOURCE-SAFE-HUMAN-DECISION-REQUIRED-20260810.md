# SOURCE LOCK — C6 AUTH DUPLICATE OWNERSHIP ANCHOR · SOURCE-SAFE RECONCILIATION

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_AUTH_DUPLICATE_OWNERSHIP_RECONCILIATION_HUMAN_DECISION_REQUIRED_4__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__ZERO_DATA_WRITES__NO_PRODUCTION`

## 1. Alcance autorizado

Este bloque reconcilió exclusivamente evidencia source-safe existente. No ejecutó provider, no reconstruyó las 340 identidades y no amplió el universo.

Universo congelado:

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
```

`fd891812eca020d27ee3` permanece fuera de este bloque porque ya quedó cerrado como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`.

## 2. Baseline protegido

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
providerReadsCurrentBlock=0
reconstructUniverse340=false
```

## 3. Evidencia reconciliada

Se contrastaron únicamente fuentes ya versionadas/source-safe: adjudicación one-read previa y su artifact, inventario/RBAC pre-import, inventario e import de credenciales, continuidad post-import, E2E real staff, claims históricos Cliente, materialización/readback/idempotencia Cliente, prueba de membresía Cliente y precedente de lineage source-only.

No se usaron nombres, email crudo, UID crudo, shopperId, antigüedad, orden de resultados, `creationTime`, `lastSignInTime` ni inferencia visual.

## 4. Resultado A–C: ownership no demostrable

Los tres pares Admin/Operaciones siguen sin una ancla member-level única.

La evidencia pre-import demuestra que existía población staff legacy con namespace ausente. El import canónico posterior creó tres principals staff distintos bajo namespace `staff` e identificador técnico namespaced. La lectura focal previa demostró que los seis candidates A–C tienen namespace `NONE` y `canonicalImportedStaffClass=false`.

Por tanto:

```text
1acdcb3782b7cf351056 = HUMAN_OWNERSHIP_DECISION_REQUIRED
2c4d19f2b066835473d3 = HUMAN_OWNERSHIP_DECISION_REQUIRED
54225792eeb65f6739c0 = HUMAN_OWNERSHIP_DECISION_REQUIRED
```

La evidencia permite afirmar que ninguno de esos seis candidates es uno de los principals staff canónicos importados, pero no permite elegir entre los dos miembros de cada par.

## 5. Resultado D: dos históricos, canónico separado

Para `ae2f920fe6d9ce1fdd82`, ambos members coinciden con lineage histórica Cliente y ninguno coincide con la lineage Cliente canónica.

La evidencia ya versionada demuestra además que el Cliente canónico actual fue materializado posteriormente como un principal distinto, con namespace `staff`, scope `tya/cinepolis`, sign-in PASS, readback/idempotencia PASS y membresía validada. Su fingerprint source-safe es:

```text
6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c
```

Ese principal canónico está fuera del par congelado. Por tanto la evidencia existente no identifica exactamente uno de los dos históricos como keeper:

```text
ae2f920fe6d9ce1fdd82 = HUMAN_OWNERSHIP_DECISION_REQUIRED
```

No se infiere keeper ni se redefine uno de los históricos como canónico.

## 6. Decisión terminal

```text
decision=HUMAN_OWNERSHIP_DECISION_REQUIRED_4
uniqueKeeperAnchorsFound=0
humanDecisionRequiredGroups=4
providerReads=0
providerWrites=0
AuthWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
production=false
```

La causa raíz restante es de **gobernanza/ownership**, no de Auth runtime, credenciales, source gate ni falta de otra lectura provider. Repetir la lectura provider de los mismos campos no agrega una ancla de propiedad.

## 7. Fail-close

No se creó request provider ni workflow provider. No hubo repair, PREWRITE, Activation, nuevo smoke, IAM/Rules/Storage writes, Make, Gemini, pagos, deploy, merge o producción.

## 8. Siguiente bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE — NO PROVIDER / NO REPAIR`

Debe capturar una decisión humana mínima de ownership/disposition para A–D sin publicar PII en repo. No debe ejecutar repair en el mismo bloque. Si la decisión humana no permite un keeper inequívoco o determina que el par no necesita keeper porque existe una identidad canónica externa, conservar HOLD y preparar únicamente el contrato de disposición.

## 9. Clasificación

- **Reusable CXOrbia:** cuando la evidencia técnica colapsa, ownership pasa a revisión humana; nunca desempatar por antigüedad u orden.
- **Exclusivo cliente:** cuatro grupos Auth históricos TyA pendientes de decisión de ownership/disposition.
- **Claude/prototipo:** sin cambios frontend ni relajación RBAC.
- **Academia:** incorporar diferencia entre identidad canónica, duplicado histórico y decisión humana de ownership.
- **Sin impacto Claude:** reconciliación source-safe y documentación interna.

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados. Producción sigue intacta.
