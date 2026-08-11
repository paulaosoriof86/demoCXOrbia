# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-READY-20260810.md`;
- evidencia vigente: `app/docs/evidence/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-SOURCE-SAFE-20260810.json`;
- reporte vigente: `app/docs/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-20260810.md`;
- contrato ejecutable-no-write: `backend/config/c6-auth-canonical-staff-minimum-owner-input-contract-v1.json`;
- source lock anterior preservado: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-REQUIRED-20260810.md`;
- repair plan anterior preservado: `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
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
SKIP13=closed 13/13
MultiAuth=closed
targetLineage(ac93)=closed
HashConfig=closed PASS
```

No reconstruir las 340 identidades ni repetir PREWRITE/Activation/smoke.

## 3. Contrato mínimo A–C listo

La brecha ya no es una decisión técnica de duplicados. Paula no debe escoger fingerprints, UIDs, emails técnicos ni keepers legacy.

El único input pendiente es:

```text
A / Superadministración = quién es el titular + TyA completo o proyectos específicos
B / Administración      = quién es el titular + TyA completo o proyectos específicos
C / Operaciones          = quién es el titular + TyA completo o proyectos específicos
```

Son seis respuestas de negocio.

## 4. Conversión source-safe

La designación humana se usa transitoriamente y se convierte a:

```text
ownerIdentityAnchor
ownerRoleBindingDigest
```

La referencia humana cruda no se persiste.

El alcance se convierte así:

```text
TYA_COMPLETE -> enumerar projectIds canónicos TyA exactos source-safe; no wildcard
SPECIFIC_PROJECTS -> resolver 1:1 cada proyecto a projectId canónico
```

No copiar scope legacy, no asumir Cinépolis y no inferir por rol.

Claims objetivo:

```text
authNamespace=staff
tenantId=tya
A role=super
B role=admin
C role=ops
projectIds=exact sorted unique entitlement
shopperId=absent
```

`expectedClaimsDigest` se genera únicamente después de resolver owner + entitlement exactos, usando serialización canónica con orden `authNamespace,projectIds,role,tenantId`.

## 5. Credenciales

A:

```text
reuse existing canonical super only if independent owner binding matches
else new ephemeral credential
```

No se permite reutilización por unicidad de rol.

B/C:

```text
new ephemeral credential at separately authorized execution
```

No se persiste login/secret crudo.

## 6. D preservado

`ae2f920fe6d9ce1fdd82` no se reabrió. Permanece `REPAIR_PLAN_READY` con Cliente canónico externo validado y retiro futuro `DISABLE_ONLY_NO_DELETE`.

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

Solo hubo commits documentales/contractuales source-safe.

## 8. Próximo bloque exacto

Después de recibir las seis respuestas empresariales mínimas:

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Debe convertir inmediatamente las respuestas a owner anchors, exact entitlement, target claims y expected-claims digests. A evalúa reutilización del `super` canónico solo por owner binding independiente. No ejecutar repair.

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados.

## 10. Cierre obligatorio

- **Qué se hizo:** contrato mínimo de input empresarial A–C y conversión source-safe completa.
- **Avance Phase A:** el bloqueo quedó reducido a seis decisiones de negocio comprensibles; no falta investigación técnica adicional para formularlas.
- **Qué se preservó:** Auth 228, digest v4, D repair-ready, frontend y producción.
- **Claude/prototipo:** sin cambios frontend ni relajación RBAC.
- **Academia:** patrón de identidad/rol/scope y least privilege documentado.
- **Pendiente real:** titular + alcance A/B/C.
- **Estado seguro:** cero provider reads y cero Auth/data/provider writes.
