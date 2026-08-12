# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 15:05 -06:00  
**Estado:** `C6_LIVE_USER_ADMIN_RUNTIME_SCOPE_CORRECTED__PROOF_PENDING__PHASE_A_88__HOSTING_0_OF_1__NO_PRODUCTION`

## Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Provider target: `cxorbia-backend-dev`.
- Exact Write V2: cerrado y no repetible.
- Producción: intacta.

## Estado C6 Staff

`PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK` permanece válido.

- Auth writes consumidos previamente por Exact Write V2: 14.
- Firestore writes consumidos previamente por Exact Write V2: 16.
- Deletes: 0.
- A/B/C/D/R4 canonical readback: PASS.
- Ocho históricos deshabilitados con readback.
- Rollback: no requerido.
- No reabrir provider snapshot, private handoff, D rebase, Auth340, SKIP13, MultiAuth, HR o M4 sin drift reproducible.

## C6 live user/admin wiring — SOURCE IMPLEMENTADO

El recorrido humano DEV ya contiene el wiring fail-closed `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` para Staff. No se modificó `app/modules`.

## Corrección de causa raíz del proof — STAFF/ADMIN ONLY

Se corrigió exclusivamente la orquestación del action:

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`

La causa raíz era doble: el selector privado intentaba resolver Staff + Shopper y el runtime wrapper exigía Staff + Shopper + Client, aunque este proof autorizado corresponde únicamente a Staff/admin. El Shopper quedaba en `HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`, por lo que corregir solo una capa habría trasladado el bloqueo a la siguiente.

Corrección aplicada:

- `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`: deriva el action exacto desde la autorización y, solo para ese action, selecciona/valida exclusivamente Staff; no ejecuta selector Client ni exige Shopper/Client.
- `tools/qa/cxorbia-phase-a-existing-users-e2e-credentials-dynamic.mjs`: para el action exacto genera un bundle privado Staff-only y corta antes de cualquier selección Shopper. Fuera del action conserva la selección dinámica Staff+Shopper.
- `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`: para el action exacto ejecuta únicamente paridad de raíz + autenticación humana Staff/admin + estabilidad reload/new-tab; omite Shopper/Client/domain/finance/reservations. Fuera del action conserva el runtime acumulativo original.

No se modificó frontend ni la lógica genérica Shopper/Client fuera del action exacto.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12%. Delta certificado de esta iteración: +0%.**

Sí hubo avance técnico: se eliminó la causa raíz de selección/orquestación que impedía llegar al proof Staff. El porcentaje no sube hasta ejecutar y certificar el runtime remoto.

## Siguiente bloque exacto

Rearmar de forma idempotente el request de una sola ejecución contra el HEAD corregido y ejecutar el **mismo único Hosting DEV ya autorizado** para:

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

El proof debe demostrar para Staff canónico:

`Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend`.

## Clasificación

- **Reusable CXOrbia:** scope de persona por action exacto, fail-closed, preservando el comportamiento genérico fuera del action.
- **Exclusivo cliente:** proof TyA Staff/admin sobre `cxorbia-backend-dev`.
- **Claude/prototipo:** cero frontend modificado en esta corrección.
- **Academia:** sin cambio de contenido; la actualización de rutas/manuales depende del proof real.
- **Sin impacto Claude:** selector privado, orquestación workflow y runtime QA.

## Estado seguro

En esta corrección: Hosting DEV consumido `0/1`; nuevos Firestore/Auth/HR/Rules/Storage/Make/Gemini/pagos writes `0`; segundo Exact Write `0`; merge `false`; producción `false`.
