# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_RESOLVED__ABC_CREATE_CANONICAL_REPLACEMENT_REQUIRED__D_KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
- evidencia vigente: `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.json`;
- source lock anterior: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-PENDING-PAULA-20260810.md`;
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

## 3. Universo focal preservado

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
```

`fd891812eca020d27ee3` permanece cerrado como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`.

## 4. Evidencia source-safe nueva

El inventario de credenciales contiene cuatro registros staff source-side (`superadmin=1`, `coordinador=2`, `demo=1`). El import canónico posterior creó exactamente tres principals staff: `super=1` y `coordinador=2`, todos `namespace=staff`; no creó `admin` ni `ops`.

La continuidad posterior confirma que Auth pasó de 17 a 108 usuarios y que `admin=3` y `ops=2` permanecieron en la población pre-import/namespace-none. El import usa identificador Firebase interno namespaced y `FAIL_CLOSED_NO_OVERWRITE`.

## 5. Resolución final A–C

### A · `1acd...` / super

Existe un `super` canónico importado, pero no existe en la evidencia source-safe una asociación owner-level reproducible entre ese principal y el owner representado por el par. La unicidad del rol no demuestra identidad.

```text
classification=LEGACY_NONCANONICAL_PENDING_CANONICAL_REPLACEMENT
disposition=CREATE_CANONICAL_REPLACEMENT_REQUIRED
```

### B · `2c4d...` / admin

El import canónico creó cero principals `admin`; los existentes son pre-import. No se promueve ninguno por inferencia.

```text
classification=LEGACY_NONCANONICAL_PENDING_CANONICAL_REPLACEMENT
disposition=CREATE_CANONICAL_REPLACEMENT_REQUIRED
```

### C · `542...` / ops

El import canónico creó cero principals `ops`; los existentes son pre-import. No se promueve ninguno por inferencia.

```text
classification=LEGACY_NONCANONICAL_PENDING_CANONICAL_REPLACEMENT
disposition=CREATE_CANONICAL_REPLACEMENT_REQUIRED
```

## 6. Resolución D · Cliente

El principal Cliente canónico externo ya validado permanece como referencia única:

```text
canonicalFp=6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c
namespace=staff
scope=tya/cinepolis
signIn/readback/idempotency/membership=PASS
disposition=KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
```

## 7. Contrato futuro de repair

No se ejecutó repair. Para A–C debe existir primero un principal canónico limpio e inequívoco por owner y validarse login/rol/tenant/project scope. Solo después podrán retirarse ambos legacy. Para D se preserva el principal canónico validado y se retiran ambos históricos.

Todo retiro futuro:

```text
DISABLE_ONLY_NO_DELETE
SNAPSHOT required
IDEMPOTENCY required
READBACK required
ROLLBACK_DRY_RUN required
```

## 8. Seguridad

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
```

No se creó request provider ni workflow provider.

## 9. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN — SOURCE-ONLY / NO EXECUTE`.

Preparar targets y gates exactos para A–D, sin provider ni writes. No ejecutar reparación en ese bloque.

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados.

## 11. Cierre obligatorio

- **Qué se hizo:** resolución source-safe de canonical replacement.
- **Avance Phase A:** se eliminó la necesidad de que Paula escoja fingerprints legacy; A–C requieren replacement canónico y D ya tiene canónico validado.
- **Qué se preservó:** Auth 228, digest v4, frontend y producción.
- **Claude/prototipo:** sin cambio frontend ni relajación RBAC.
- **Academia:** patrón de canonicalización y retiro reversible documentado.
- **Pendiente real:** preparar plan de repair; ninguna mutación autorizada.
- **Estado seguro:** cero provider reads y cero writes.
