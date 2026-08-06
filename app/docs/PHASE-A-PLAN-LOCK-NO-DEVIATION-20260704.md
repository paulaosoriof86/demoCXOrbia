# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_LIVE_HR_V3_REQUEST_EMITTED__NO_CHECKPOINT_OBSERVED__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Objetivo operativo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar Phase A a producción sin reabrir módulos preservados, sin candidata paralela y sin sustituir HR viva por snapshots, registries estáticos o datos fijados.

## 2. Bloques preservados

- frontend acumulativo y navegación multirol;
- Dashboard, Histórico, Visitas, Postulaciones y Reservas;
- Finanzas, Liquidaciones, Beneficios y movimientos;
- Portal Cliente, Portal Shopper y reportes;
- `CX.data`, Firebase DEV, Auth/RBAC y contratos;
- multi-tenant, multi-proyecto y Cinépolis configurable;
- Academia, manuales y rutas por rol;
- composición canónica única y PR #7.

## 3. Identidades Shopper

```text
profiles=340
crosswalk=101/8 PASS
reference/planner=65/65 exact match
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

Los 13 perfiles residuales permanecen omitidos del repair Auth, conservando historia.

## 4. Autoridad HR viva — contrato prevalente

- Metadata provider descubre dinámicamente tabs y periodos.
- El periodo operativo se deriva del calendario y de pestañas vivas.
- Firestore es materialización/índice; no autoridad HR.
- Registry, snapshots y archivos estáticos son cache/last-known-good fail-closed.
- Una modificación actual o histórica debe cambiar `sourceRevision` y propagarse transversalmente.
- Cambios solo de timestamp no deben alterar la revisión.
- No se permiten meses, conteos, estados o totales HR fijados en código.

## 5. Root fixes aplicados

- autoridad HR viva dinámica;
- planner sin conteos fijos;
- país/pestaña sobre una revisión;
- journal v3 con checkpoints antes, durante y después de provider;
- artifact y status sanitizados previstos.

## 6. Antecedente v2 congelado

```text
requestCommit=4e404f2db48ff8b07430d7ac7505eff6c040458a
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
```

## 7. Request v3 ejecutado hasta emisión

```text
sourceCommit=18ea2e6ab9b15480c851c7ba34cae8e8fbcae026
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
authorizationId=chat-20260806-live-hr-authority-current-period-v3-02
```

No apareció ningún checkpoint observable:

```text
WORKFLOW_STARTED_PROVIDER_READS_0=NO
PROVIDER_READ_BOUNDARY_ENTERED_MAX1=NO
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1=NO
FINAL=NO
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

## 8. Cadena única restante

### Bloque A — Diagnóstico control-plane read-only

1. Localizar run/check suite del request exacto.
2. Determinar si la ejecución quedó antes de provider boundary.
3. No tocar el request ni HR.
4. No emitir segundo trigger.
5. Documentar checkpoint reproducible.

### Bloque B — HR viva actual

Solo con autorización fresca posterior y evidencia de que el intento previo no alcanzó provider boundary:

1. confirmar metadata/autodiscovery;
2. confirmar `2026-08` y tabs GT/HN;
3. reconstruir periodos desde HR viva;
4. validar cambio histórico y `sourceRevision`;
5. confirmar revisión común en módulos;
6. reconciliar materialización por `visitId/hrRowId`.

### Bloque C — Auth y validación acumulativa

1. Materializar plan Auth con overlay SKIP13 y `HOLD=0`.
2. Ejecutar solo con autorización separada, snapshot, idempotencia, readback y rollback.
3. Verificar que los 13 omitidos no reciban acceso efectivo.
4. Smoke Admin/Operaciones, Shopper y Cliente.
5. Tres recargas, nueva pestaña y estabilidad.

### Bloque D — Cutover

1. Source lock final.
2. Rollback probado.
3. Smoke integral.
4. Autorización específica de producción.
5. Único cutover y verificación postproducción.

## 9. Circuit breakers

- No reabrir los 13 perfiles.
- No reinterpretar v2 o v3 como providerReads=0.
- No tocar el request actual.
- No emitir segundo trigger.
- No reauditar 65/65.
- No pedir otra candidata.
- No ejecutar Auth sin autorización separada.
- No hardcodear periodos o conteos HR.
- No repetir import histórico por conteo.

## 10. Estado seguro

```text
request v3 emitido=1
segundo trigger=0
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```
