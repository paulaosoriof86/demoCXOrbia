# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-READY-20260810.md`;
3. `app/docs/evidence/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-SOURCE-SAFE-20260810.json`;
4. `app/docs/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-20260810.md`;
5. `backend/config/c6-auth-canonical-staff-minimum-owner-input-contract-v1.json`;
6. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-REQUIRED-20260810.md`;
7. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.json`;
8. `app/docs/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.md`;
9. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
10. `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
11. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze Auth rector;
12. source locks históricos de Activation, HashConfig, update-universe, SKIP13, multi-Auth y direct runner;
13. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. addenda maestras vigentes, documentación Claude/Academia/tracker y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthPlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthExecuted=true
AuthUsersAfter=228
Readback=PASS
RollbackDryRun=PASS
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
targetLineage(ac93)=closed
HashConfig=closed PASS
PhaseASourceSurfaces=20/20
CurrentBlockProviderReads=0
A=BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED / role=super / credential=reuse canonical super only if owner binding matches else new ephemeral
B=BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED / role=admin / credential=new ephemeral
C=BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED / role=ops / credential=new ephemeral
D=REPAIR_PLAN_READY_PRESERVED
RepairExecuted=false
CurrentBlock=CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY
```

## 3. Auth baseline protegido

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
expectedAuthUsersAfter=228
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

No repetir PREWRITE, Activation, smoke ni reconstrucción completa de identidad.

## 4. Contrato mínimo vigente A–C

El pendiente humano quedó reducido a seis respuestas empresariales:

```text
A Superadministración = titular + TyA completo/proyectos específicos
B Administración      = titular + TyA completo/proyectos específicos
C Operaciones          = titular + TyA completo/proyectos específicos
```

No se pide fingerprint, UID, email técnico, keeper ni cuenta legacy. La respuesta de titular se convierte de forma transitoria a `ownerIdentityAnchor` y `ownerRoleBindingDigest`; la referencia humana cruda no se persiste.

`TYA_COMPLETE` no genera wildcard: antes de cerrar el target debe expandirse a los `projectIds` canónicos source-safe exactos. `SPECIFIC_PROJECTS` exige mapeo 1:1 a IDs canónicos. No se copia scope legacy ni se asume Cinépolis.

Claims A–C: `authNamespace=staff`, `tenantId=tya`, rol exacto, `projectIds` exactos y sin `shopperId`. `expectedClaimsDigest` se genera solo después de owner + entitlement exactos mediante serialización canónica determinística.

A puede reutilizar el `super` canónico existente solo si un owner binding independiente prueba asociación exacta; de lo contrario usa credencial nueva efímera. B/C usarán credencial nueva efímera. D `ae2f...` permanece `REPAIR_PLAN_READY` sin reabrirse.

## 5. Seguridad del bloque vigente

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
smoke=false
repair=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIStored=false
credentialsStored=false
```

## 6. Siguiente acción exacta

Después de recibir las seis respuestas empresariales mínimas:

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Convertir inmediatamente las respuestas a owner anchors, entitlement exacto, target claims y expected-claims digests; A evalúa reutilización del `super` canónico únicamente por owner binding independiente. No ejecutar repair.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
