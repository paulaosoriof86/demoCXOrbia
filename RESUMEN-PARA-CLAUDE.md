# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-READY-20260810.md`;
4. `app/docs/evidence/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-SOURCE-SAFE-20260810.json`;
5. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth, target lineage `ac93...`;
- freeze Auth v4 y Auth DEV 228;
- PREWRITE/Activation/smoke históricos;
- D `ae2f...` ya `REPAIR_PLAN_READY`;
- `fd891...` cerrado sin acceso TyA efectivo.

## 3. Estado backend

```text
AuthUsersAfter=228
A=BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED / role=super
B=BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED / role=admin
C=BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED / role=ops
A credential=reuse canonical super only if independent owner binding matches, else new ephemeral
B credential=new ephemeral
C credential=new ephemeral
D=REPAIR_PLAN_READY_PRESERVED
ProviderReadsCurrentBlock=0
RepairExecuted=false
Production=false
```

El input humano pendiente quedó reducido a seis respuestas comprensibles: titular + alcance para Superadministración, Administración y Operaciones. Backend convierte esas respuestas a anchors/digests source-safe y no persiste la referencia humana cruda.

## 4. Claude/prototipo

No hacer selector de duplicados, fallback legacy, copy técnico visible, pantalla adicional ni relajación de RBAC. No exponer fingerprints, claims, owner anchors, credenciales o preguntas técnicas. No asumir Cinépolis ni copiar scope histórico. Este flujo es exclusivamente backend.

## 5. Siguiente bloque backend

Después de recibir las seis respuestas empresariales mínimas:

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Cerrar owner anchors, exact entitlement, target claims y expected-claims digests. Sin frontend changes.
