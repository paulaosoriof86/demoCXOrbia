# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_SKIP13_AUTH_DISPOSITION_SOURCE_ONLY_PASS__IDENTITY_HOLD_0__LIVE_HR_AUGUST_P0_REMAINS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- provider v2.2 run: `31104541809`;
- artifact: `8968941587`;
- provider v2.2 reads/writes: `1/0`;
- segundo provider attempt: `0`;
- producción: intacta.

## 2. Conciliación estructural cerrada

```text
profiles=340
crosswalk=101/8 parity=true
metric=83=71+12 valid=true
referenceGroups=65
plannerGroups=65
added=0
removed=0
exactMatch=true
suffixAllocationHolds=0
targetCollisionHolds=0
```

## 3. Decisión de Paula aplicada

Paula autorizó omitir del repair Auth los 13 perfiles que permanecían HOLD y reincorporarlos manualmente en el futuro solo si resultan necesarios.

Disposición:

```text
SKIP_AUTH_REPAIR_PRESERVE_HISTORY
HOLD -> PRESERVE_NO_AUTH
skipFromAuthRepair=true
doNotCreateAuth=true
doNotUpdateAuth=true
futureManualReactivationAllowed=true
```

No se borró historia ni se ejecutaron cambios proveedor.

## 4. Plan Auth después de disposición

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
rows=340 unique
identityHoldsRemaining=0
readyForAuthRepairByIdentity=true
executable=false
executionRequiresSeparateAuthorization=true
```

Digests:

```text
before=acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92
after=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

## 5. Preservación y gate de seguridad

Los 13 perfiles quedan fuera de creación o actualización Auth. Se preservan perfiles históricos, visitas, certificaciones y liquidaciones. Las cuentas Auth preexistentes no fueron modificadas en este bloque; antes del cutover se debe comprobar que ninguna identidad omitida reciba acceso efectivo.

## 6. P0 vigente: autoridad HR viva y agosto

La evidencia existente muestra:

```text
builder bruto=30 tabs / 15 periodos / 684 visitas
registry aceptado=28 tabs / 14 periodos / 616 visitas
rechazadas=AGOSTO 26, AGOSTO 26 HN
provider metadata=403
autoDiscovery=false
```

Agosto fue detectado por el builder y luego descartado por un registry desactualizado. Este es el bloqueo principal actual.

## 7. Regla operativa prevalente

- HR viva es autoridad para periodo actual y todo el histórico.
- Una corrección histórica debe producir nueva `sourceRevision` y reflejarse transversalmente.
- Firestore, snapshots y archivos estáticos solo son materialización/cache/last-known-good.
- No se permiten meses, conteos o estados HR hardcodeados.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, shoppers conciliados, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 9. Archivos y evidencia del bloque

- `backend/config/corte6-shopper-auth-skip13-disposition-v1.json`;
- `tools/qa/cxorbia-c6-shopper-auth-skip-disposition-source-only.mjs`;
- `app/docs/evidence/CORTE6-SHOPPER-AUTH-SKIP13-SOURCE-ONLY-PASS-LATEST.json`;
- `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`.

## 10. Estado seguro

```text
provider/Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 11. Siguiente bloque exacto

```text
LIVE HR PROVIDER METADATA/AUTODISCOVERY ROOT FIX
→ AUGUST GT/HN LIVE PASS
→ HISTORICAL MUTATION PASS
→ SOURCE REVISION PARITY
→ AUTH EXECUTION PRECHECK WITH HOLD=0
→ SEPARATE AUTHORIZATION FOR WRITES/DEPLOY/CUTOVER
```
