# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `PASS_C6_M4_STAFF_TYA_COMPLETE_TARGET_DIGESTS__LIVE_USER_ADMIN_EXECUTABLE_SOURCE_PREPARED__STATIC_GATE_EXECUTION_PENDING__NO_PROVIDER__NO_RUNTIME_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-STAFF-TYA-COMPLETE-AND-LIVE-USER-ADMIN-SOURCE-20260811.md`;
4. `backend/contracts/c6-live-user-admin-v1.json`;
5. `backend/config/c6-staff-bootstrap-targets-v1.json`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y módulos Phase A;
- Auth 228, Activation/readback/rollback, SKIP13, multi-Auth, HashConfig y direct runner;
- HR viva M6;
- owners iniciales;
- scope inicial de A/B/C/D: **TYA_COMPLETE para los cuatro**.

## 3. Backend ya preparado

Existe source executable para administración viva de usuarios:

```text
backend/runtime/hr-live-service/user-admin.mjs
```

Y source de routing/packaging preparado en:

```text
backend/runtime/hr-live-service/server.mjs
backend/runtime/hr-live-service/package.json
backend/runtime/hr-live-service/Dockerfile
firebase.json
```

Backend resuelve proyectos desde inventario vivo, valida caller `super`, tenant + authNamespace, actualiza claims y documento de usuario, audita, hace readback y conserva rollback/compensación. No está desplegado por este bloque.

## 4. Tarea Claude/prototipo localizada — Usuarios & Permisos

**No crear pantalla nueva y no rediseñar.** Trabajar únicamente sobre la superficie existente `app/modules/configuracion.js#usuarios` cuando backend quede autorizado/deployado.

Cambios funcionales requeridos:

1. Sustituir `localStorage` como autoridad de usuarios por el adapter vivo autorizado.
2. En **crear/invitar usuario**, hacer obligatorio el campo visible `Alcance de proyectos` con dos opciones:
   - `TyA completo`;
   - `Proyectos específicos`.
3. Si elige `Proyectos específicos`, mostrar multiselección basada en la lista viva de proyectos del tenant.
4. En **editar usuario**, permitir cambiar el mismo alcance y el rol; guardar mediante la operación backend de scope.
5. Mostrar de forma humana el alcance efectivo; no mostrar claims, fingerprints, provider email ni UIDs técnicos.
6. Si backend devuelve `scopeReviewRequired=true`, mostrar aviso accionable de revisión porque el inventario de proyectos cambió desde la última confirmación.
7. Mantener alta, edición de perfil, deshabilitación y reactivación; no hard delete por defecto.
8. Después de guardar, refrescar/readback para mostrar el estado confirmado; no fingir éxito local.

`TYA_COMPLETE` nunca es wildcard silencioso. El backend expande a projectIds exactos. En el inventario canónico actual existe un proyecto (`cinepolis`), pero **no hardcodear ese ID en la UI**.

## 5. HR

M6 permanece COMPLETE: HR viva ya cerrada. M7 solo validará consumo runtime final; no remapear ni pedir enlace.

## 6. Métrica

**Avance certificado: 82%. Restante: 18%.**

```text
M4=5/5 COMPLETE
M5=2/8 COMPLETE
M6=5/5 COMPLETE
```

M5 no recibe el punto del gate estático hasta demostrar su ejecución terminal.

## 7. Siguiente bloque backend

`C6 LIVE USER ADMIN STATIC SOURCE GATE -> STAFF REPAIR/BOOTSTRAP PREWRITE`.

Claude no debe adelantarse a runtime no desplegado ni crear fallback paralelo. El wiring se aplica únicamente cuando el backend tenga gate/autorización correspondiente.