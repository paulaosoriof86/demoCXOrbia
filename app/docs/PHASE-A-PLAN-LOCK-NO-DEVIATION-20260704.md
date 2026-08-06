# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_LIVE_HR_AUTHORITY_SOURCE_FIX_APPLIED__PROVIDER_EXECUTION_UNRESOLVED__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

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

Los 13 perfiles residuales fueron omitidos del repair Auth por decisión expresa de Paula, conservando historia. No bloquean producción y no se reabre su conciliación.

## 4. Autoridad HR viva — contrato prevalente

- Metadata provider descubre dinámicamente tabs y periodos.
- El periodo operativo se deriva del calendario y de la existencia viva de las pestañas del país.
- Firestore es materialización/índice; no autoridad de HR.
- Registry, snapshots y archivos estáticos son cache/last-known-good fail-closed.
- Una modificación actual o histórica debe cambiar `sourceRevision` y reflejarse transversalmente.
- Cambios solo de timestamp no deben cambiar la revisión.
- No se permiten meses, conteos, estados o totales HR fijados en código.

## 5. Root fix aplicado

El bloque eliminó del carril activo:

- agosto como mes contractual fijo;
- `GT=34`, `HN=10`, `616`, `684` y `1406` como expectativas permanentes;
- country gate con segunda lectura distinta;
- registry estático como autoridad primaria;
- delta histórico entendido únicamente como inserts nuevos.

Quedaron preparados los gates de metadata viva, periodo calendario, país/pestaña, mutación histórica, revisión estable y comparación provider/Firestore read-only.

## 6. HOLD actual: control-plane provider

Request:

```text
authorizationId=chat-20260806-live-hr-authority-current-period-01
sourceCommit=31f4af0f7501b23b4e72b1a5f8457669a5f91c77
requestCommit=4e404f2db48ff8b07430d7ac7505eff6c040458a
```

Al finalizar el timeout de 20 minutos no existía run/status/evidence observable. No puede determinarse si la lectura provider se consumió.

```text
STOP_RETRY=true
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
```

No se dispara otra lectura por rutina.

## 7. Cadena única restante

### Bloque A — Diagnóstico control-plane read-only

1. Localizar el run del request exacto sin leer HR nuevamente.
2. Si existe, recuperar run/job/log/artifact y su checkpoint.
3. Si no existe, demostrar `providerReads=0`.
4. No alterar fuente, datos, Auth, deploy o producción.

### Bloque B — HR viva actual

Solo con autorización fresca y prueba de que no se consumió el read, o recuperando el run existente:

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

## 8. Circuit breakers

- No reabrir los 13 perfiles.
- No segundo provider read sin conocer consumo del primero.
- No reauditar 65/65.
- No pedir otra candidata.
- No ejecutar Auth sin autorización separada.
- No hardcodear periodos o conteos HR.
- No repetir import histórico por conteo.
- No reabrir módulos protegidos salvo regresión reproducible.

## 9. Estado seguro

```text
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```
