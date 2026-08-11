# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_HR_LIVE_DIRECT_READ_PASS__LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_REPAIR__NO_PRODUCTION`

## Avance del bloque 2026-08-11 — staff administrable

- referencias empresariales A/Superadministración, B/Administración, C/Operaciones y acceso adicional de Operaciones recibidas transitoriamente;
- no se vuelven a solicitar esas referencias;
- usuarios iniciales = bootstrap de datos vivos, no constantes;
- contrato `backend/contracts/c6-live-user-admin-v1.json` cerrado PASS source-only;
- UI existente Usuarios & Permisos preservada; backend executable/admin adapter todavía pendiente.

## Corrección de causa raíz — HR no estaba pendiente

Se comprobó que la etiqueta anterior `M6 HR final production evidence = PENDING` era un arrastre documental de `SOURCE-LOCK-C6-LIVE-HR-CONTROL-PLANE-OBSERVABILITY-20260806.md`.

Ese source lock registraba una incapacidad de observar si un workflow había alcanzado la frontera provider; **no demostraba que la HR estuviera sin mapear o desconectada**.

Para cerrar la ambigüedad sin repetir workflows ni pedir nuevamente datos a Paula, se hizo lectura directa de la fuente Google Sheets compartida previamente.

Resultado actual source-safe:

```text
sourceTitle=HR Guatemala - Sincronizacion Google Sheets
sourceModifiedAt=2026-08-10T17:42:27.338Z
currentPeriod=2026-08
GT visitRows=34
HN visitRows=10
totalVisitRows=44
GT country validation=PASS
HN country validation=PASS
HR_SOURCE_MAPPED=true
HR_SOURCE_LIVE=true
M6=COMPLETE
```

Archivos creados:

```text
app/docs/evidence/C6-HR-LIVE-DIRECT-READ-LATEST.json
app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md
```

No se guardaron filas, nombres, teléfonos, correos, URL ni ID crudo de la fuente. No hubo writes.

### Decisión anti-bucle

No volver a mapear HR, pedir el enlace, reconstruir inventario ni crear otro workflow para satisfacer M6. La siguiente comprobación HR se limita a M7: verificar que el build final consume la misma fuente viva bajo los roles finales.

## Gap reproducible — administración de usuarios

`app/modules/configuracion.js` ya tiene la superficie aprobada **Usuarios & Permisos**, pero la persistencia usa `localStorage` (`cx_users`, `cx_custom_roles`, `cx_perm`) y la invitación es vista previa.

`app/core/backend-firebase.js` persiste proyectos, shoppers y visitas, pero no expone create/update/disable de Firebase Auth ni actualización de claims/scope.

```text
LIVE_USER_ADMIN_UI_EXISTS=true
LIVE_USER_ADMIN_BACKEND=false
LOCALSTORAGE_PREVIEW_ONLY=true
PRODUCTION_BLOCKER=true
```

## Métrica estable de cierre

```text
M1 Baseline/Phase A preservada                     35 = COMPLETE
M2 Auth V4 activation/readback/rollback            20 = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner       15 = COMPLETE
M4 Owners + exact project entitlements              5 = 2/5 COMPLETE
M5 Staff repair/bootstrap + live admin + rollback   8 = 1/8 COMPLETE
M6 HR live current production evidence              5 = COMPLETE
M7 Final accumulative multirole smoke               5 = PENDING
M8 Human validation + rollback ready                3 = PENDING
M9 Explicit cutover + one production promotion      3 = PENDING
M10 Post-cutover smoke + freeze                      1 = PENDING
```

**Avance certificado: 78%. Restante: 22%.** El denominador permanece congelado.

## Siguiente acción exacta

Cerrar los cuatro scopes empresariales y ejecutar:

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND EXECUTABLE SOURCE-ONLY`.

Después M5 repair/readback/rollback → M7 smoke final con HR viva ya cerrada → M8 → M9 → M10.

Sin Auth/Firestore/HR writes, deploy, merge ni producción en el bloque actual.