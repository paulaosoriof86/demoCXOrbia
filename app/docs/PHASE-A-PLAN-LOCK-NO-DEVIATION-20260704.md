# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_SKIP13_AUTH_DISPOSITION_PASS__LIVE_HR_AUGUST_ROOT_FIX_PENDING__NO_PRODUCTION`

## 1. Objetivo operativo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar Phase A a producción sin reabrir módulos preservados, sin candidata paralela y sin sustituir la HR viva por snapshots o datos fijados.

## 2. Bloques preservados

- frontend acumulativo y navegación multirol;
- Dashboard, Histórico, Visitas, Postulaciones, Reservas y experiencia Shopper;
- Finanzas, Liquidaciones, Beneficios y movimientos;
- Portal Cliente, Portal Shopper y reportes;
- `CX.data`, Firebase DEV, Auth/RBAC y contratos;
- multi-tenant, multi-proyecto y Cinépolis configurable;
- Academia, manuales y rutas por rol;
- composición canónica única y PR #7.

## 3. Estado C6 de identidades

La conciliación estructural está cerrada:

```text
profiles=340
crosswalk=101/8 PASS
metric=83=71+12 PASS
reference/planner=65/65 exact match
suffix allocation holds=0
target login collisions=0
```

Paula autorizó omitir del repair Auth los 13 perfiles residuales. La disposición source-only exacta produjo:

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
rows=340 unique
```

Los 13 perfiles ya no bloquean el avance.

## 4. Regla de disposición

```text
SKIP_AUTH_REPAIR_PRESERVE_HISTORY
skipFromAuthRepair=true
doNotCreateAuth=true
doNotUpdateAuth=true
preserveHistoricalProfile=true
preserveVisits=true
preserveCertifications=true
preserveLiquidations=true
futureManualReactivationAllowed=true
```

No se permite hard delete ni fusión por nombre. Las cuentas Auth preexistentes no se modificaron en este bloque; el pre-cutover debe verificar que las identidades omitidas no obtengan acceso efectivo.

## 5. Autoridad HR viva — regla prevalente

Toda información de HR, incluida la historia, debe provenir de una lectura viva y versionada del proveedor.

- No fijar periodos, conteos, estados o filas históricas como verdad en código.
- Firestore es materialización/índice, no autoridad de HR.
- Archivos estáticos son bootstrap o last-known-good, no fuente vigente.
- Cada cambio en una fila actual o histórica debe producir nueva `sourceRevision` y reflejarse en todos los módulos.
- El mes activo se descubre desde metadata provider y se elige por mes calendario disponible; nunca se hardcodea.

## 6. P0 agosto

La evidencia prueba que el builder detectó 30 tabs, 15 periodos y 684 visitas, incluyendo `AGOSTO 26` y `AGOSTO 26 HN`; después, un registry desactualizado las rechazó y redujo la salida a 28 tabs, 14 periodos y 616 visitas.

Producción no puede avanzar mientras:

- metadata provider no responda;
- `autoDiscovery` siga false;
- agosto GT/HN no aparezca en lectura viva;
- la plataforma dependa de `latestPeriod=2026-07` materializado;
- no exista una prueba de cambio histórico desde la HR viva.

## 7. Cadena única de salida

### Bloque A — HR viva agosto

1. Corregir acceso a metadata provider/autodiscovery.
2. Confirmar `AGOSTO 26` y `AGOSTO 26 HN`.
3. Reconstruir todos los periodos desde HR viva.
4. Confirmar `latestPeriodKey=2026-08`.
5. Probar una modificación histórica controlada mediante revisión viva.
6. Confirmar una sola `sourceRevision` en Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper.

### Bloque B — Auth y validación acumulativa

1. Materializar el plan de 340 filas con overlay SKIP13 y `HOLD=0`.
2. Ejecutar repair Auth solo con autorización expresa, snapshot, idempotencia, readback y rollback.
3. Verificar que los 13 perfiles omitidos no reciban acceso efectivo.
4. Smoke Admin/Operaciones, Shopper y Cliente.
5. Tres recargas, nueva pestaña y estabilidad sin reload agresivo.
6. Validación humana sobre una única URL/build.

### Bloque C — Cutover

1. Source lock final.
2. Rollback probado.
3. Smoke integral.
4. Autorización específica de producción.
5. Único cutover y verificación postproducción.

## 8. Circuit breakers

- No reabrir la conciliación de los 13 perfiles.
- No segundo provider read del probe fallido.
- No reauditar el universo 65/65.
- No pedir otra candidata.
- No ejecutar Auth sin autorización separada.
- No hardcodear agosto ni añadirlo manualmente al registry como sustituto de metadata viva.
- No tratar 616 visitas o 14 periodos como constantes.
- No reabrir módulos protegidos salvo regresión reproducible.

## 9. Estado seguro

```text
provider/Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```
