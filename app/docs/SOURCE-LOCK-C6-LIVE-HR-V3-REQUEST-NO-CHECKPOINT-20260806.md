# SOURCE LOCK — C6 request v3 HR viva sin checkpoint observable

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_LIVE_HR_V3_REQUEST_EMITTED__NO_CHECKPOINT_OBSERVED__STOP_RETRY__IDENTITY_HOLD_0__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Autorización consumida

Paula autorizó un único request v3 de lectura HR viva read-only, reconociendo que el consumo del request v2 permanece desconocido y autorizando exactamente una ejecución lógica provider adicional.

```text
sourceCommit=18ea2e6ab9b15480c851c7ba34cae8e8fbcae026
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
authorizationId=chat-20260806-live-hr-authority-current-period-v3-02
schemaVersion=cxorbia.live-hr-current-reconcile.request.v3
controlPlaneContract=cxorbia.live-hr-control-plane-journal.v1
providerReads=1
providerWrites=0
```

## 2. Resultado observable

Después de verificaciones repetidas sobre el commit exacto:

```text
commit statuses=0
WORKFLOW_STARTED_PROVIDER_READS_0=NO OBSERVADO
PROVIDER_READ_BOUNDARY_ENTERED_MAX1=NO OBSERVADO
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1=NO OBSERVADO
FINAL_<JOB_STATUS>_<CONSUMPTION>=NO OBSERVADO
evidence commit=NO OBSERVADO
branch advance generado por workflow=NO OBSERVADO
```

No existe evidencia suficiente para afirmar si la ejecución provider comenzó o si la lectura autorizada se consumió.

```text
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
STOP_RETRY=true
retryExecuted=false
```

## 3. Decisión fail-closed

Se detiene el bloque sin segundo intento. No se declara:

- `providerReads=0`;
- provider read consumido;
- periodo `2026-08` PASS o FAIL;
- tabs GT/HN confirmadas;
- mutación histórica confirmada;
- paridad transversal de `sourceRevision` confirmada.

## 4. Qué se preserva

- Root fix HR viva y observabilidad v3.
- Identidades Shopper: `HOLD=0`; 13 perfiles fuera de repair Auth con historia preservada.
- Frontend acumulativo, Login, `CX.data`, Finanzas, Portales, Reservas y Academia.
- PR #7 draft/open/no merge y producción intacta.

## 5. Clasificación

- **Reusable CXOrbia:** fail-closed ante ausencia de checkpoint y trazabilidad por commit exacto.
- **Exclusivo TyA:** lectura del spreadsheet HR y validación de tabs GT/HN.
- **Claude/prototipo:** sin cambios UI; no declarar periodo ni revisión sin evidencia viva.
- **Academia:** incorporar caso de ausencia total de checkpoint en troubleshooting de integraciones.
- **Sin impacto Claude:** Auth, SKIP13, Finanzas, Portales, Reservas y composición frontend preservados.

## 6. Estado seguro

```text
request commits=1
segundo trigger=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 7. Siguiente acción exacta

Diagnóstico read-only de GitHub Actions/control-plane para determinar por qué el request v3 no publicó siquiera `WORKFLOW_STARTED_PROVIDER_READS_0`. No tocar el request ni volver a consultar HR. Solo con evidencia reproducible de que la ejecución no alcanzó la frontera provider podrá solicitarse autorización fresca para otro intento.
