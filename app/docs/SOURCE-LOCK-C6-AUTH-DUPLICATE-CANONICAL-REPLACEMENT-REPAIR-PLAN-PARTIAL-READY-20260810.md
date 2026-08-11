# SOURCE LOCK — C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD al inicio:** `b40e2e241bba41d1569560a40af0c8412f2e20cb`  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY__ABC_CANONICAL_TARGET_INPUT_REQUIRED__D_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Alcance

Se preparó exclusivamente el plan source-only/no-execute solicitado para los cuatro grupos congelados. No hubo provider read ni repair.

## 2. Resultado A–C

Los contratos técnicos pueden definirse parcialmente, pero no existe en la evidencia source-safe vigente una ancla owner-level que permita construir sin inferencia el target canónico exacto de `1acd...`, `2c4d...` o `542...`.

Los tres quedan:

```text
classification=CANONICAL_TARGET_INPUT_REQUIRED
role=known
authNamespace=staff
tenantId=tya
projectIds=OWNER_ENTITLEMENT_REQUIRED
ownerAnchor=required
credentialInput=ephemeral-required-at-execution
repairExecutable=false
```

No se seleccionó ningún legacy como keeper y no se asumió que `cinepolis` sea el scope de esos owners.

## 3. Resultado D

El Cliente canónico externo sigue demostrado y se preservará sin mutación:

```text
canonicalFp=6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c
role=cliente
authNamespace=staff
tenantId=tya
projectIds=[cinepolis]
signIn/readback/idempotency/membership=PASS
```

D queda `REPAIR_PLAN_READY` únicamente para `DISABLE_ONLY_NO_DELETE` de ambos históricos, sujeto a snapshot y readback futuros.

## 4. Gates preparados

Quedan congelados:

- snapshot source-safe pre-write;
- collision proof del identificador técnico A–C;
- idempotency key por grupo;
- readback exacto por grupo;
- rollback dry-run con inversa unívoca y sin deletes;
- secuencia obligatoria `CANONICAL_VALIDATED → DISABLE_BOTH_LEGACY`.

## 5. Write budget futuro

Si A–C resuelven sus inputs y todos los gates PASS:

```text
A auth writes=4
B auth writes=4
C auth writes=4
D auth writes=2
TOTAL AUTH WRITES HARD CAP=14
Auth deletes=0
Firestore/IAM/HR/Rules/Storage writes=0
Make/Gemini/payments/deploy=0
```

## 6. Seguridad actual

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

## 7. Siguiente bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Debe intentar resolver únicamente para A–C las anclas owner-level, project entitlements y contrato de input de credencial desde fuentes source-safe ya existentes. Si una de esas piezas no existe, declarar el faltante puntual sin inferir ni pedir selección de fingerprints legacy. D no se reabre.

## 8. Clasificación

- **Reusable CXOrbia:** canonical create-before-retire, deterministic identity, write budget duro y retiro reversible.
- **Exclusivo cliente:** A–D Auth TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** principio de canonicalización segura; sin cambio de flujo visible.
- **Sin impacto Claude:** snapshot/idempotency/readback/rollback contracts.
