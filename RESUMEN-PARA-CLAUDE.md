# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `C6_HR_LIVE_DIRECT_READ_PASS__LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_REPAIR__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md`;
4. `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-CONTRACT-SOURCE-ONLY-20260811.md`;
5. `backend/contracts/c6-live-user-admin-v1.json`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data` en general;
- SKIP13, multi-Auth, target lineage, HashConfig y direct runner;
- freeze Auth v4 y Auth DEV 228;
- PREWRITE/Activation históricos;
- D repair-ready;
- **mapeo/conexión de HR viva**.

## 3. HR viva — cerrada

Se leyó directamente la fuente compartida previamente el 2026-08-11:

```text
currentPeriod=2026-08
GT=34
HN=10
total=44
country split=PASS
M6=COMPLETE
```

La fuente es Google Sheets live y fue modificada el 2026-08-10. No solicitar otra exportación ni nuevo enlace y no crear otro flujo para re-mapearla. El antiguo lock de observabilidad HR del 2026-08-06 queda histórico: era un problema de telemetría del workflow, no de autoridad de datos.

M7 sí debe verificar que el build final consume esta misma fuente viva, pero eso es smoke runtime, no mapeo HR.

## 4. Estado backend de usuarios

Las referencias empresariales A/B/C y un acceso adicional de Operaciones fueron recibidas. No volver a pedir nombres ni correos. Pendiente inmediato: scope exacto de proyecto para los cuatro accesos (`TYA_COMPLETE` o `SPECIFIC_PROJECTS`).

## 5. Hallazgo frontend/backend localizado

`app/modules/configuracion.js` ya contiene la UI aprobada **Usuarios & Permisos** y no debe rediseñarse. El gap es exclusivamente de persistencia/ejecución:

- `_uSave()` guarda usuarios y roles en `localStorage`;
- `cx_perm` también es localStorage;
- alta muestra invitación en vista previa;
- `app/core/backend-firebase.js` no expone create/update/disable de Firebase Auth ni claims/scope.

El contrato backend source-only ya está cerrado PASS en `backend/contracts/c6-live-user-admin-v1.json`.

### Tarea Claude/prototipo localizada

Cuando backend entregue el adapter vivo, sustituir únicamente la autoridad localStorage del módulo `usuarios` por el adapter autorizado, conservando diseño, flujos y controles. Debe quedar alta, edición, cambio de rol/scope, deshabilitación y reactivación. No hardcodear personas, correos, roles ni projectIds.

## 6. Métrica de cierre

**Avance certificado vigente: 78%. Restante: 22%.** M6 HR live = COMPLETE. El denominador no cambia.

## 7. Siguiente bloque backend

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND EXECUTABLE SOURCE-ONLY`.

Cerrar scopes exactos; después backend/admin adapter, repair focal y smoke final M7 usando la HR viva ya cerrada.