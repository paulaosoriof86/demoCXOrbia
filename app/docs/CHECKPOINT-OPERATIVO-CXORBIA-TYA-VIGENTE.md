# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_LIVE_HR_CONTROL_PLANE_OBSERVABILITY_ROOT_FIX_PASS__PREVIOUS_V2_READ_UNKNOWN__NO_NEW_PROVIDER_READ__IDENTITY_HOLD_0__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- request v2 antecedente: `4e404f2db48ff8b07430d7ac7505eff6c040458a`;
- consumo v2: `UNKNOWN_NO_EXECUTION_EVIDENCE`.

## 2. Identidades Shopper cerradas

```text
profiles=340
crosswalk=101/8 parity=true
reference/planner=65/65 exact match
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

Los 13 perfiles residuales permanecen omitidos del repair Auth y preservados históricamente. No se reabre su conciliación.

## 3. Root fix HR viva materializado

Se mantiene corregido en source:

1. metadata provider como autoridad de tabs;
2. periodo calendario derivado dinámicamente;
3. registry estático solo como last-known-good fail-closed;
4. país/pestaña desde la misma revisión;
5. `sourceRevision` estable sin timestamps volátiles;
6. cambio histórico real debe modificar la revisión;
7. planner sin conteos HR fijos;
8. reconciliación provider/Firestore por identidad estable y revisión.

## 4. Diagnóstico control-plane anterior

El conector disponible no permitió enumerar ejecuciones `push`; el request v2 no produjo evidencia recuperable en rama, status o artifact. Por tanto:

```text
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
retryExecuted=false
```

No se declara cero ni consumo confirmado.

## 5. Root fix de observabilidad aplicado

Commits:

```text
dcbfe1ce4b5a98df9f2cc650dc344f983ed7118f
c46e81bba4fd7424e6076e336bcaf86e82564c14
```

El workflow corregido ahora registra:

```text
WORKFLOW_STARTED_PROVIDER_READS_0
PROVIDER_READ_BOUNDARY_ENTERED_MAX1
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1
FINAL_<JOB_STATUS>_<CONSUMPTION>
```

Además:

- genera journal JSON sin PII;
- publica status `cxorbia/live-hr-control-plane`;
- sube artifact sanitizado por siete días;
- exige request v3 y contrato de control-plane;
- rechaza fail-closed el request v2 anterior.

## 6. Validación source-only

```text
journal node --check=PASS
journal transitions=PASS
workflow generic YAML parse=PASS
GitHub runtime execution=NO EJECUTADA
```

No se modificó el request y no se realizó nueva lectura HR.

## 7. Agosto y autoridad histórica

Sigue pendiente evidencia viva nueva para confirmar:

- tabs actuales GT/HN;
- periodo calendario `2026-08`;
- conteos vivos actuales;
- mutación histórica propagada;
- una sola `sourceRevision` transversal.

No se permiten meses, datos o conteos HR hardcodeados.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 9. Documentación vigente

- `app/docs/SOURCE-LOCK-C6-LIVE-HR-CONTROL-PLANE-OBSERVABILITY-20260806.md`;
- `app/docs/evidence/LIVE-HR-CONTROL-PLANE-OBSERVABILITY-ROOT-FIX-LATEST.json`;
- addenda CAMBIOS, Claude, Pendientes, Academia y tracker;
- índice, checkpoint, plan y PR #7 reconciliados.

## 10. Estado seguro

```text
nuevo provider read=0
provider writes=0
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 11. Siguiente bloque exacto

```text
AUTORIZACIÓN FRESCA REQUEST V3
→ reconocer consumo v2 desconocido
→ autorizar una sola ejecución lógica provider read-only adicional
→ observar journal/status/artifact
→ confirmar HR viva 2026-08 GT/HN + mutación histórica + sourceRevision
→ continuar a precheck Auth con HOLD=0
```
