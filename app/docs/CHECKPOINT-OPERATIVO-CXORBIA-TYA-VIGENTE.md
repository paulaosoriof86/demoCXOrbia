# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY__ABC_CANONICAL_TARGET_INPUT_REQUIRED__D_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
- plan vigente: `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
- evidencia vigente: `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.json`;
- source lock anterior: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
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

## 3. Universo focal

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
```

`fd891812eca020d27ee3` permanece cerrado como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`.

## 4. Repair plan A–C

El contrato canónico técnico ya está definido parcialmente:

```text
A role=super / authNamespace=staff / tenantId=tya
B role=admin / authNamespace=staff / tenantId=tya
C role=ops / authNamespace=staff / tenantId=tya
projectIds=OWNER_ENTITLEMENT_REQUIRED
retirement=DISABLE_ONLY_NO_DELETE
```

Sin embargo, la evidencia source-safe vigente no contiene para ninguno de los tres grupos una ancla owner-level suficiente ni el entitlement de proyectos exacto. El input de credencial debe ser efímero y tampoco se materializa en repo.

```text
1acd... = CANONICAL_TARGET_INPUT_REQUIRED
2c4d... = CANONICAL_TARGET_INPUT_REQUIRED
542...  = CANONICAL_TARGET_INPUT_REQUIRED
```

No se infirió owner, login, project scope ni keeper legacy.

## 5. Repair plan D · Cliente

El Cliente canónico externo permanece validado:

```text
canonicalFp=6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c
role=cliente
authNamespace=staff
tenantId=tya
projectIds=[cinepolis]
signIn/readback/idempotency/membership=PASS
```

```text
ae2f... = REPAIR_PLAN_READY
futureDisposition=KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
```

## 6. Gates congelados

- snapshot source-safe pre-write;
- collision proof para los targets A–C;
- idempotency key por grupo;
- readback exacto;
- rollback dry-run con inversa unívoca;
- secuencia obligatoria `CANONICAL_VALIDATED -> DISABLE_BOTH_LEGACY`;
- cero deletes.

## 7. Hard cap futuro

Solo si A–C resuelven antes todos sus inputs:

```text
A Auth writes=4
B Auth writes=4
C Auth writes=4
D Auth writes=2
TOTAL AUTH WRITES HARD CAP=14
Auth deletes=0
Firestore/IAM/HR/Rules/Storage writes=0
```

Ese budget no autoriza ejecución.

## 8. Seguridad del bloque actual

```text
providerReads=0
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
repair=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIExported=false
```

## 9. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Resolver únicamente para A–C owner anchor, project entitlement y contrato de input de credencial desde fuentes source-safe existentes. Si algún input no existe, declarar únicamente ese faltante sin inferir y sin pedir selección de principals legacy. D no se reabre.

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados.

## 11. Cierre obligatorio

- **Qué se hizo:** repair plan exacto/no-execute con gates y budgets.
- **Avance Phase A:** D está listo para repair; A–C quedaron reducidos a inputs canónicos concretos, no a nueva investigación de duplicados.
- **Qué se preservó:** Auth 228, digest v4, frontend, operación y producción.
- **Claude/prototipo:** sin cambios frontend ni relajación RBAC.
- **Academia:** principio de canonicalización segura documentado.
- **Pendiente real:** inputs owner-level A–C.
- **Estado seguro:** cero provider reads y cero writes.
