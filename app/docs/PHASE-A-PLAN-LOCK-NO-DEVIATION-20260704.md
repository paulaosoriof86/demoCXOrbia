# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_LIVE_HR_CONTROL_PLANE_OBSERVABILITY_PASS__PREVIOUS_V2_READ_UNKNOWN__NO_NEW_PROVIDER_READ__IDENTITY_HOLD_0__NO_PRODUCTION`

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

Los 13 perfiles residuales permanecen omitidos del repair Auth, conservando historia. No bloquean y no se reabre su conciliación.

## 4. Autoridad HR viva — contrato prevalente

- Metadata provider descubre dinámicamente tabs y periodos.
- El periodo operativo se deriva del calendario y de las pestañas vivas del país.
- Firestore es materialización/índice; no autoridad HR.
- Registry, snapshots y archivos estáticos son cache/last-known-good fail-closed.
- Una modificación actual o histórica debe cambiar `sourceRevision` y propagarse transversalmente.
- Cambios solo de timestamp no deben alterar la revisión.
- No se permiten meses, conteos, estados o totales HR fijados en código.

## 5. Root fix HR viva aplicado

Quedaron preparados los gates de metadata viva, periodo calendario, país/pestaña, mutación histórica, revisión estable y comparación provider/Firestore read-only. El carril activo ya no usa agosto, `34/10`, `616`, `684` o `1406` como constantes.

## 6. Antecedente provider v2 congelado

```text
requestCommit=4e404f2db48ff8b07430d7ac7505eff6c040458a
sourceCommit=31f4af0f7501b23b4e72b1a5f8457669a5f91c77
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
retryExecuted=false
```

No se declara cero ni consumo confirmado.

## 7. Root fix control-plane aplicado

Commits:

```text
dcbfe1ce4b5a98df9f2cc650dc344f983ed7118f
c46e81bba4fd7424e6076e336bcaf86e82564c14
```

El siguiente request debe ser v3 y producir:

```text
WORKFLOW_STARTED_PROVIDER_READS_0
PROVIDER_READ_BOUNDARY_ENTERED_MAX1
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1
FINAL_<JOB_STATUS>_<CONSUMPTION>
```

También debe generar journal y artifact sanitizados. El request v2 queda fail-closed bajo el workflow vigente.

## 8. Cadena única restante

### Bloque A — Autorización y ejecución v3

1. Autorización fresca y explícita que reconozca el consumo v2 desconocido.
2. Autorizar exactamente una ejecución lógica provider read-only adicional.
3. Crear un único request v3 ligado al HEAD source exacto.
4. Observar status/journal/artifact antes de interpretar consumo.
5. Cero writes, deploy, merge o producción.

### Bloque B — HR viva actual

Únicamente dentro de la ejecución v3 autorizada:

1. confirmar metadata/autodiscovery provider;
2. confirmar periodo calendario `2026-08` y tabs GT/HN;
3. reconstruir todos los periodos desde HR viva;
4. validar cambio histórico y `sourceRevision`;
5. confirmar la misma revisión en Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper;
6. reconciliar materialización por `visitId/hrRowId` y revisión, no por recarga ciega.

### Bloque C — Auth y validación acumulativa

1. Materializar plan Auth con overlay SKIP13 y `HOLD=0`.
2. Ejecutar solo con autorización expresa, snapshot, idempotencia, readback y rollback.
3. Verificar que los 13 omitidos no reciban acceso efectivo.
4. Smoke Admin/Operaciones, Shopper y Cliente.
5. Tres recargas, nueva pestaña y estabilidad.
6. Validación humana sobre una sola URL/build.

### Bloque D — Cutover

1. Source lock final.
2. Rollback probado.
3. Smoke integral.
4. Autorización específica de producción.
5. Único cutover y verificación postproducción.

## 9. Circuit breakers

- No reabrir los 13 perfiles.
- No reinterpretar el request v2 como cero.
- No tocar el request actual sin autorización fresca.
- No ejecutar un request que no sea v3 con journal.
- No reauditar 65/65.
- No pedir otra candidata.
- No ejecutar Auth sin autorización separada.
- No hardcodear periodos o conteos HR.
- No repetir import histórico por conteo.
- No reabrir módulos protegidos salvo regresión reproducible.

## 10. Estado seguro

```text
nuevo provider read=0
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```
