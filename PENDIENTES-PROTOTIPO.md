# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-READY-20260810.md`;
4. `app/docs/evidence/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-SOURCE-SAFE-20260810.json`;
5. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 y Auth DEV 228;
- Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, `ac93...`, HashConfig y lifecycle de credencial;
- ownership por fingerprints no se traslada a Paula;
- repair gates/write budget ya definidos;
- D `ae2f...` preservado `REPAIR_PLAN_READY`;
- investigación técnica A–C source-safe agotada;
- contrato mínimo de input empresarial A–C creado.

## 3. Pendiente vivo

Solo seis respuestas empresariales:

```text
A / Superadministración = titular + TyA completo o proyectos específicos
B / Administración      = titular + TyA completo o proyectos específicos
C / Operaciones          = titular + TyA completo o proyectos específicos
```

No se requiere que Paula identifique cuentas técnicas. Backend convierte esas respuestas a `ownerIdentityAnchor`, `ownerRoleBindingDigest`, entitlement exacto, target claims y `expectedClaimsDigest` sin persistir PII cruda.

## 4. Credenciales

- A: reutilizar `super` canónico existente solo si un owner binding independiente prueba asociación exacta; si no, credencial nueva efímera.
- B/C: credencial nueva efímera obligatoria durante futura ejecución separadamente autorizada.
- Nunca persistir secretos en repo/artifact/log.

## 5. No hacer

- no pedir fingerprints/UIDs/emails técnicos a Paula;
- no promover principals legacy por rol;
- no inferir owner por unicidad, orden o antigüedad;
- no copiar scope legacy ni asumir Cinépolis;
- no wildcard silencioso para TyA completo;
- no provider read;
- no PREWRITE/Activation/smoke/repair;
- no frontend workaround ni relajación RBAC;
- no deletes; retiro futuro `DISABLE_ONLY_NO_DELETE`;
- no deploy, merge ni producción.

## 6. Ruta corta

Después de las seis respuestas, ejecutar únicamente:

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Cerrar A–C source-safe y luego pedir autorización separada para repair focal reversible.

## 7. Seguridad

Provider reads 0; Auth/IAM/Firestore/HR/Rules/Storage writes 0; repair=false; deploy0; merge=false; production=false.
