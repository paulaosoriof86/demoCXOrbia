# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__OWNER_REFERENCES_RECEIVED__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-CONTRACT-SOURCE-ONLY-20260811.md`;
4. `backend/contracts/c6-live-user-admin-v1.json`;
5. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data` en general;
- SKIP13, multi-Auth, target lineage, HashConfig y direct runner;
- freeze Auth v4 y Auth DEV 228;
- PREWRITE/Activation/smoke históricos;
- D repair-ready.

## 3. Estado backend

Las referencias empresariales A/B/C y un acceso adicional de Operaciones fueron recibidas en conversación. No volver a pedir nombres ni correos. No persistir referencias humanas, correos o credenciales como constantes o configuración técnica.

Pendiente inmediato: scope exacto de proyecto para los cuatro accesos iniciales (`TYA_COMPLETE` o `SPECIFIC_PROJECTS`).

## 4. Hallazgo frontend/backend localizado

`app/modules/configuracion.js` ya contiene la UI aprobada **Usuarios & Permisos** y no debe rediseñarse. El gap reproducible es exclusivamente de persistencia/ejecución:

- hoy `_uSave()` guarda usuarios y roles en `localStorage`;
- `cx_perm` también es localStorage;
- alta muestra `Invitación preparada (vista previa)`;
- `app/core/backend-firebase.js` no expone create/update/disable de Firebase Auth ni claims/scope de usuarios.

El contrato backend source-only ya está cerrado PASS en `backend/contracts/c6-live-user-admin-v1.json`.

### Tarea Claude/prototipo localizada

No crear pantalla nueva. Cuando backend entregue el adapter vivo, sustituir únicamente la autoridad localStorage del módulo `usuarios` por el adapter autorizado, conservando diseño, flujos y controles. Debe quedar capacidad de alta, edición, cambio de rol/scope, deshabilitación y reactivación. No hardcodear personas, correos, roles ni projectIds.

No hacer fallback legacy, selector técnico, copy con fingerprints/claims ni relajación RBAC.

## 5. Métrica de cierre

**Avance certificado vigente: 73%. Restante: 27%.** M5a contrato live-user-admin source-only = PASS. El denominador no cambia.

## 6. Siguiente bloque backend

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND EXECUTABLE SOURCE-ONLY`.

Primero cerrar scopes exactos; después preparar backend/admin adapter con RBAC, snapshot, idempotencia, readback y rollback. Sin provider ni repair en ese bloque.
