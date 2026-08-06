# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_13_HOLD_DISPOSITION_AND_LIVE_HR_AUGUST_ROOT_FIX_PENDING__NO_PRODUCTION`

## 1. Objetivo operativo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar a producción Phase A sin reabrir módulos ya preservados, sin otra candidata paralela y sin sustituir la HR viva por snapshots o datos fijados.

El estado V7.2 y cualquier carril anterior quedan como historia, no como estado vivo.

## 2. Bloques preservados que no se reabren sin regresión reproducible

- frontend acumulativo y navegación multirol;
- Dashboard, Histórico, Visitas, Postulaciones, Reservas y experiencia Shopper;
- Finanzas, Liquidaciones, Beneficios y movimientos;
- Portal Cliente, Portal Shopper y reportes;
- `CX.data`, Firebase DEV, Auth/RBAC y contratos;
- multi-tenant, multi-proyecto y Cinépolis configurable;
- Academia, manuales y rutas por rol;
- composición canónica única y PR #7.

## 3. Estado C6 de identidades

La reconciliación estructural está cerrada:

```text
profiles=340
crosswalk=101/8 PASS
metric=83=71+12 PASS
reference/planner=65/65 exact match
suffix allocation holds=0
target login collisions=0
```

Quedan 13 decisiones humanas:

- 12 perfiles sin apellido autoritativo;
- 1 perfil con empate multi-Auth;
- nombres aún pendientes de recuperación privada;
- repair Auth no ejecutable mientras las filas permanezcan HOLD.

## 4. Regla de disposición para perfiles antiguos

Paula puede excluir un perfil antiguo del repair Auth sin borrar la persona ni su historia:

```text
ARCHIVE_LEGACY_NO_AUTH
EXCLUDE_FROM_AUTH_REPAIR
PRESERVE_HISTORY=true
LOGIN_ENABLED=false
```

La disposición debe conservar visitas, certificaciones, liquidaciones, comunicaciones y auditoría. No se permite hard delete ni fusión por nombre.

## 5. Autoridad HR viva — regla prevalente

Toda información de HR, incluida la historia, debe provenir de una lectura viva y versionada del proveedor.

- No fijar periodos, conteos, estados o filas históricas como verdad en código.
- Firestore es materialización/índice, no autoridad de HR.
- Archivos estáticos son bootstrap o last-known-good, no fuente vigente.
- Cada cambio en una fila actual o histórica debe producir nueva `sourceRevision` y reflejarse en todos los módulos.
- El mes activo se descubre desde metadata provider y se elige por mes calendario disponible; nunca se hardcodea.

## 6. P0 agosto

La evidencia previa prueba que el builder detectó 30 tabs, 15 periodos y 684 visitas, incluyendo `AGOSTO 26` y `AGOSTO 26 HN`; después, un registry desactualizado las rechazó y redujo la salida a 28 tabs, 14 periodos y 616 visitas.

Producción no puede avanzar mientras:

- metadata provider no responda;
- `autoDiscovery` siga false;
- agosto GT/HN no aparezca en la lectura viva;
- la plataforma dependa de `latestPeriod=2026-07` proveniente de un snapshot materializado.

## 7. Cadena única de salida

### Bloque A — Identidades HOLD

1. Recuperar nombres y actividad sin inferencia.
2. Paula decide `KEEP_FOR_AUTH` o `ARCHIVE_LEGACY_NO_AUTH`.
3. Regenerar plan de 340 filas.
4. Exigir cero HOLD operativo, cero colisiones y plan no superpuesto.

### Bloque B — HR viva agosto

1. Corregir acceso a metadata provider/autodiscovery.
2. Confirmar `AGOSTO 26` y `AGOSTO 26 HN`.
3. Reconstruir todos los periodos desde HR viva.
4. Confirmar `latestPeriodKey=2026-08`.
5. Probar una modificación histórica controlada mediante revisión viva, sin snapshot fijo.
6. Confirmar una sola `sourceRevision` en Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper.

### Bloque C — Auth y validación acumulativa

1. Ejecutar repair Auth solo con autorización expresa y plan final sin HOLD.
2. Snapshot, idempotencia, readback y rollback.
3. Smoke Admin/Operaciones, Shopper y Cliente.
4. Tres recargas, nueva pestaña y estabilidad sin reload agresivo.
5. Validación humana sobre una única URL/build.

### Bloque D — Cutover

1. Source lock final.
2. Rollback probado.
3. Smoke integral.
4. Autorización específica de producción.
5. Único cutover y verificación postproducción.

## 8. Circuit breakers

- No segundo provider read del probe fallido sin autorización nueva.
- No reauditar el universo 65/65.
- No pedir otra candidata.
- No aplicar parcialmente el plan Auth.
- No hardcodear agosto ni añadirlo manualmente al registry como sustituto de metadata viva.
- No tratar 616 visitas o 14 periodos como constantes.
- No reabrir módulos protegidos salvo regresión reproducible.

## 9. Estado seguro

```text
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```
