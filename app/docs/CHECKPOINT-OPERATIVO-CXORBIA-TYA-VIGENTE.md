# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_HUMAN_OWNERSHIP_DECISION_CAPTURE_READY__PAULA_DECISION_REQUIRED__ZERO_PROVIDER_READS__ZERO_REPAIR__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-PENDING-PAULA-20260810.md`;
- matriz humana: `app/docs/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.md`;
- evidencia de matriz: `app/docs/evidence/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.json`;
- source lock anterior: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-HUMAN-DECISION-REQUIRED-20260810.md`;
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

## 3. Universo de decisión humana

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
```

`fd891812eca020d27ee3` permanece cerrado como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS` y no se reabrió.

## 4. Matriz humana construida

Opciones formalizadas:

- `KEEP_ONE_MEMBER`;
- `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS`;
- `PRESERVE_BOTH_PENDING_OWNER_MAPPING`;
- para Cliente: `CANONICAL_EXTERNAL_KEEP_HISTORICAL_PAIR_NONCANONICAL_PENDING_RETIRE`.

### A–C · staff histórico

En `1acd...`, `2c4d...` y `542...`, ambos members de cada par son legacy/pre-import namespace `NONE`, equivalentes bajo los discriminadores permitidos y ninguno coincide con la clase staff canónica importada.

La evidencia source-safe no puede seleccionar un member. Por tanto:

- `KEEP_ONE_MEMBER` exige que Paula indique exactamente cuál fingerprint;
- `PRESERVE_BOTH_PENDING_OWNER_MAPPING` puede aprobarse sin distinguir members;
- `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` exige que Paula confirme que existe un principal canónico externo correcto para el owner/grupo.

### D · Cliente

En `ae2f...`, ambos members son históricos. Existe un Cliente canónico externo al par ya validado, con fingerprint source-safe:

```text
6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c
```

Tiene namespace `staff`, scope `tya/cinepolis`, sign-in/readback/idempotencia y membresía PASS. La matriz permite que Paula apruebe mantener este principal como único canónico y clasificar ambos históricos como no canónicos pendientes de repair posterior.

## 5. Decisión terminal del bloque

```text
decision=PAULA_MINIMUM_OWNERSHIP_DECISION_REQUIRED
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

No se creó request provider ni workflow provider. No se infirió keeper.

## 6. Entrada humana mínima requerida

Paula debe responder una sola disposición por grupo. Si elige `KEEP_ONE_MEMBER`, debe indicar el fingerprint exacto del member. Si elige `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` para A–C, debe confirmar además el principal canónico externo correspondiente.

## 7. Después de la decisión

No ejecutar repair dentro de esta autorización. Si la decisión humana produce una disposición Auth inequívoca, el siguiente bloque será un repair focal separado con snapshot, idempotencia, readback y rollback dry-run, sujeto a autorización expresa.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados.

## 9. Cierre obligatorio

- **Qué se hizo:** matriz humana mínima de ownership/disposition.
- **Avance Phase A:** el bloqueo quedó reducido a cuatro decisiones humanas, sin más diagnóstico técnico repetible.
- **Qué se preservó:** Auth 228, digest v4, frontend, Phase A y producción.
- **Claude/prototipo:** sin cambio frontend ni relajación RBAC.
- **Academia:** patrón de gobierno de identidad canónica/histórica documentado.
- **Pendiente real:** respuesta humana de Paula para A–D.
- **Estado seguro:** cero provider reads y cero repair/writes.
- **Siguiente cambio técnico:** solo tras decisión humana y autorización separada.
