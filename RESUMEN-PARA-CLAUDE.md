# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__PROJECT_ENTITLEMENTS_PENDING__LIVE_USER_ADMIN_BACKEND_GAP_PROVEN__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. PR #7 y HEAD vivo.

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

### Tarea Claude/prototipo localizada

No crear pantalla nueva. Cuando backend entregue el contrato vivo de administración de usuarios, sustituir únicamente el almacenamiento preview del módulo `usuarios` por el adapter autorizado, conservando el diseño, flujos y controles existentes. Debe quedar capacidad de alta, edición, cambio de rol/scope y deshabilitación. No hardcodear personas, correos, roles ni projectIds.

No hacer fallback legacy, selector técnico, copy con fingerprints/claims ni relajación RBAC.

## 5. Métrica de cierre

**Avance certificado vigente: 72%. Restante: 28%.** El gap de administración viva forma parte de M5 y no crea una fase adicional.

## 6. Siguiente bloque backend

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND CONTRACT — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Primero cerrar scopes exactos; después preparar contrato/admin adapter backend con RBAC, snapshot, idempotencia, readback y rollback. Sin provider ni repair en ese bloque.
