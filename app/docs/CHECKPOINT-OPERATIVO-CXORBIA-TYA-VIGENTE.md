# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-REQUIRED-20260810.md`;
- evidencia vigente: `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.json`;
- reporte vigente: `app/docs/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.md`;
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

## 3. Resolución A–C

```text
A 1acd... / super
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED
credential path canónico super existe, pero no puede vincularse por rol único

B 2c4d... / admin
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED
+ CREDENTIAL_INPUT_REQUIRED

C 542... / ops
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED
+ CREDENTIAL_INPUT_REQUIRED
```

Ningún target quedó resuelto, por lo que no se generó expected-claims digest.

No se usó role uniqueness, antigüedad, orden, raw name/email/UID, scope legacy ni keeper legacy. No se asumió `cinepolis` como scope staff.

## 4. D preservado

`ae2f920fe6d9ce1fdd82` no se reabrió. Permanece `REPAIR_PLAN_READY` con el Cliente canónico externo ya validado y retiro futuro de históricos `DISABLE_ONLY_NO_DELETE`.

## 5. Hallazgo de credenciales

La fuente cifrada histórica contiene cuatro records staff (`superadmin=1`, `coordinador=2`, `demo=1`); el import canónico materializó `super=1` y `coordinador=2`, y cero `admin`/`ops`.

Por eso:

- A puede reutilizar el credential path `super` únicamente si una futura owner anchor independiente prueba la asociación exacta;
- B/C necesitan credencial nueva efímera en ejecución autorizada;
- Firebase Auth no aporta plaintext password recuperable para crear replacements nuevos.

## 6. Seguridad

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
repair=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIExported=false
```

Solo hubo commits documentales source-safe.

## 7. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Debe convertir los faltantes A–C en inputs mínimos de negocio source-safe, sin pedir selección de fingerprints legacy: owner reference estable, entitlement exacto y estrategia de credencial. Después se podrán cerrar target claims digests y preparar el repair focal.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados.

## 9. Cierre obligatorio

- **Qué se hizo:** reconciliación source-safe exhaustiva de inputs A–C.
- **Avance Phase A:** la brecha quedó reducida a inputs empresariales exactos; no hay nueva incertidumbre de Auth runtime.
- **Qué se preservó:** Auth 228, digest v4, D repair-ready, frontend y producción.
- **Claude/prototipo:** sin cambios frontend ni relajación RBAC.
- **Academia:** patrón de least privilege documentado.
- **Pendiente real:** owner/scope A–C y credencial nueva B/C; A credential condicionado a owner proof.
- **Estado seguro:** cero provider reads y cero data/provider writes.
