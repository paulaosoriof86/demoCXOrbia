# SOURCE LOCK — C6 HR LIVE DIRECT READ PASS

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `PASS_C6_HR_LIVE_DIRECT_READ_CURRENT_SOURCE__AUGUST_34_GT_10_HN_44_TOTAL__NO_REMAP__NO_WRITES__NO_PRODUCTION`

## 1. Corrección de clasificación

La HR de TyA **no estaba pendiente de mapeo ni de conexión viva**. El rótulo `M6 HR final production evidence = PENDING` provenía de un arrastre documental del antiguo bloque de observabilidad del workflow HR, donde no podía demostrarse si una ejecución había alcanzado la frontera provider.

Ese problema era de **telemetría/control-plane**, no de disponibilidad, mapeo o autoridad de la HR. No debe volver a usarse para reabrir el trabajo de HR ya realizado.

## 2. Lectura directa actual

En esta sesión se leyó directamente la fuente Google Sheets compartida previamente, sin pedir nuevamente enlace ni datos a Paula.

Evidencia source-safe:

```text
sourceTitle=HR Guatemala - Sincronizacion Google Sheets
sourceIdSha256=796d2ae2b7d3f948efce7d799ddb7c81684b94e274116c24322d5f742136b90e
sourceModifiedAt=2026-08-10T17:42:27.338Z
timeZone=America/Guatemala
currentPeriod=2026-08
GT rows=34
HN rows=10
total rows=44
GT country validation=PASS_GUATEMALA
HN country validation=PASS_HONDURAS
```

La fuente contiene los tabs corrientes de agosto 2026 para GT y HN y conserva el histórico mensual anterior. Los rangos corrientes se leyeron en vivo. No se copian filas, nombres, teléfonos, correos ni URL/ID crudos al repo.

## 3. Decisión

```text
HR_SOURCE_MAPPED=true
HR_SOURCE_LIVE=true
CURRENT_PERIOD_READABLE=true
CURRENT_GT_HN_SPLIT=true
CURRENT_VISITS=44
HR_REMAP_REQUIRED=false
NEW_HR_PROVIDER_WORKFLOW_REQUIRED=false
M6=COMPLETE
```

La HR sigue siendo autoridad operacional viva. No se debe crear otra metodología, reconstruir inventarios mensuales ni solicitar una nueva exportación para demostrar lo ya probado.

## 4. Qué sí queda pendiente

El único control posterior relacionado con HR pertenece al **smoke acumulativo final M7**: demostrar que el build/cutover final, con Auth/RBAC y adapters definitivos, consume la misma fuente viva y mantiene el scope por rol. Eso es verificación runtime de la composición final, no un nuevo mapeo HR.

## 5. Evidencia

`app/docs/evidence/C6-HR-LIVE-DIRECT-READ-LATEST.json`

## 6. Progreso

M6 aporta sus 5 puntos completos. La métrica pasa de 73% a **78%**, con **22% restante**.

## 7. Seguridad

```text
metadata/current-range provider reads only
providerWrites=0
HRWrites=0
FirestoreWrites=0
AuthWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
rawRowsStored=false
rawPIIStored=false
```

## 8. Anti-bucle

- HR mapping/readiness queda cerrado.
- El source lock de observabilidad del 2026-08-06 queda histórico para explicar el control-plane, no como blocker vigente.
- No repetir lectura HR para satisfacer otra vez M6 salvo P0 reproducible de pérdida de acceso o cambio de fuente.
- La siguiente cadena vuelve a M4/M5 y luego M7.
