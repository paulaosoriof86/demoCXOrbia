# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_13_HOLD_PROFILES_FINGERPRINTED__NAMES_PENDING_PRIVATE_RECOVERY__LIVE_HR_AUGUST_AUTHORITY_P0__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- provider v2.2 run: `31104541809`;
- provider v2.2 job: `92626188022`;
- artifact: `8968941587`;
- provider v2.2 reads/writes: `1/0`;
- second attempt: `0`;
- producción: intacta.

## 2. Conciliación estructural cerrada

```text
profiles=340
crosswalk=101/8 parity=true
preConsensus=83
completedByConsensus=71
remainingSurname=12
metric 83=71+12 valid=true
referenceGroups=65
plannerGroups=65
added=0
removed=0
exactMatch=true
```

El antiguo `+1/-0` quedó cerrado como defecto de comparación entre universos diferentes, no como defecto de sufijos.

## 3. Perfiles que requieren decisión

### 12 apellidos sin evidencia autoritativa

```text
cc941934f90032aa48e8
9ed0cdabf3794b7ccf21
3451d618b5d6307b87da
80d716626b85e14778ea
8aea97650e97902f7616
32e2de62067ab6ecfb7b
b31bdc0c7514acbe25ba
4a59de15805804cbe398
cfbd0c519e59f40c6239
540c9e6b71440b393365
c01e0f344901f03e78d2
729eb0480d5ec2266a20
```

### 1 empate multi-Auth

```text
planProfileFingerprint=7cc28c78de9bfda01d14
multiAuthProfileFingerprint=d15356ed735e87a33e69
candidateA=9b2b7ca1bd72c1301d29
candidateB=4e6d26551d11db444bd0
score=5016/5016
margin=0
```

Los artifacts vigentes son source-safe y no contienen nombres. El probe focal destinado a recuperar nombres terminó `error` durante el empaquetado. Como pudo haber iniciado el read antes del fallo, quedó consumido y congelado; no habrá rerun sin autorización nueva.

## 4. Disposición acelerada autorizable por Paula

Para perfiles antiguos que no justifiquen repair Auth:

```text
ARCHIVE_LEGACY_NO_AUTH
EXCLUDE_FROM_AUTH_REPAIR
PRESERVE_HISTORY=true
PRESERVE_VISITS=true
PRESERVE_CERTIFICATIONS=true
PRESERVE_LIQUIDATIONS=true
LOGIN_ENABLED=false
```

No borrar ni eliminar su historial. El perfil multi-Auth requiere identificar persona/actividad antes de decidir.

## 5. Plan Auth actual

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
rows=340 unique
readyForAuthRepair=false
partialExecutionAllowed=false
```

La decisión de archivar perfiles antiguos debe producir un plan nuevo donde esas filas dejen de ser HOLD y pasen a preservación histórica sin Auth.

## 6. P0 de autoridad HR viva y agosto

La evidencia existente muestra:

```text
builder bruto=30 tabs / 15 periodos / 684 visitas
registry aceptado=28 tabs / 14 periodos / 616 visitas
rechazadas=AGOSTO 26, AGOSTO 26 HN
provider metadata=403
autoDiscovery=false
```

Esto confirma que agosto fue visto por el builder y posteriormente descartado por un registry desactualizado. El `latestPeriod=2026-07` del snapshot provider no puede considerarse HR actual.

## 7. Regla operativa prevalente

- HR viva es autoridad para el periodo actual y todo el histórico.
- Una corrección histórica en HR debe cambiar la siguiente `sourceRevision` y reflejarse transversalmente.
- Firestore, snapshots y archivos estáticos solo son materialización, cache o last-known-good temporal.
- No se permiten conteos o meses HR hardcodeados.
- Producción queda bloqueada hasta que el endpoint vivo confirme agosto GT/HN y una prueba de mutación histórica.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados. El bloqueo actual es focal: decisión de 13 identidades y autoridad HR viva.

## 9. Estado seguro

```text
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 10. Siguiente bloque exacto

```text
PRIVATE NAME RECOVERY WITHOUT INFERENCE
→ PAULA DISPOSITION: KEEP FOR AUTH OR ARCHIVE_LEGACY_NO_AUTH
→ LIVE PROVIDER METADATA ROOT FIX
→ AUGUST GT/HN + HISTORICAL MUTATION GATE
→ REGENERATE 340-ROW PLAN WITHOUT OPERATIONAL HOLD
→ CUMULATIVE VISUAL VALIDATION
→ AUTHORIZED CUTOVER
```
