# CAMBIOS-BACKEND — ADDENDUM PHASE A AUTHORITY ROOT CAUSE

**Fecha:** 2026-08-17 12:55 -06:00  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Bloque:** `PHASE_A_CANONICAL_AUTHORITY_REGRESSION_ROOT_CAUSE_SOURCE_ONLY`

## Objetivo

Detener regresiones sin reprocesar módulos ni datos ya resueltos. Confirmar si la candidata viva conserva la mejor línea canónica y corregir únicamente incompatibilidades de autoridad/composición demostradas por las pruebas humanas y la lectura directa de HR.

## Evidencia revisada

- HR Google Sheets viva: 15 periodos, rango 2025-06 → 2026-08, 660 visitas.
- Agosto 2026: 44 visitas = GT 34 + HN 10; 32 asignadas; 12 sin asignar; 25 agendadas; 7 sin agendar; 18 realizadas; 26 pendientes de realizar.
- Runtime visual: HR 660, protected/project state 616, posts persistidos proyecto 0, UI presentando postulaciones derivadas.
- Historial GitHub de adapters canónicos: Shopper portal V2, cumulative read model V2 y Finance V2 tienen fixes funcionales vigentes hasta 14-ago; no se encontró una candidata posterior “mejor” que deba sustituirlos.

## Archivos creados

### `app/adapters/tya-phase-a-authority-compat-v1.js`
Commit `8a0fa58105644b81e3e27f59a98774b025fded1f`.

- separa asignaciones HR de postulaciones reales;
- retira solo `hr-post-*` sintéticos de `CX.data._posts`;
- conserva asignaciones como `__hrAssignmentProjection` read-only;
- interpreta membership `projectIds` como scope exacto de proyecto raíz/programa o periodo;
- conserva scope por país;
- no modifica `app/modules` ni `app/core`;
- provider/Auth/Firestore/HR/payment writes = 0.

### `app/docs/SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md`
Commit `0379a25c548fdb3207d3287bdfa697819ebcbc9f`.

Congela la causa raíz, el no-reproceso y el siguiente bloque exacto.

### `app/docs/CAMBIOS-BACKEND-ADDENDUM-PHASE-A-AUTHORITY-ROOT-CAUSE-20260817.md`
Este archivo.

## Archivos tocados

### `app/index-backend-dev.html`
Commit `6594ef961177ede87dfabb0945f8dcc39c8920c8`.

Único delta: cargar `tya-phase-a-authority-compat-v1.js` después de membership wiring y antes de protected HR composition. No se modificaron módulos/core/UI.

### `app/docs/RESUMEN-PARA-CLAUDE.md`
Commit `7abe0a29a448bb64a86b6daa22f356cd376c0a0a`.

Actualiza continuidad: candidata vigente, Admin/historical Shopper congelados, root cause de composición, no reconstrucción de Shopper/Finance/HR.

### `app/docs/PENDIENTES-PROTOTIPO.md`
Commit `903ee4478d7fb9c7c3cbc9caa3a0d6e2e4cd90ad`.

Elimina pendientes obsoletos de credential handoff y fija la ruta real de validación runtime.

## Hallazgos que NO son reproceso

### Shopper

El portal canónico V2 y el exact identity contract siguen presentes. El mensaje “identidad no vinculada al read model canónico” es un fail-closed real del crosswalk, no una señal de que el módulo Shopper haya vuelto a una versión vieja. Se preserva el histórico PASS; solo se inspeccionan aliases exactos faltantes de las 44 visitas nuevas.

### Finanzas

Finance V2 y el source-safe financial adapter siguen presentes. Agosto sin match exacto cae correctamente a revisión financiera. Antes de agregar cualquier fuente se debe comprobar mayo/junio/histórico existente una vez recuperada la navegación por periodos.

### KPI

Los KPI estructurales de agosto coinciden con HR. Los derivados (`cuestPend`, `sinSubmitir`, `fueraRango`) continúan pendientes únicamente de validación contra state semantics V2 + HR, no de reescritura del Dashboard.

### Postulaciones

Se encontró fuente de falsos positivos: `mapPosts(visits)` de la HR generaba registros `hr-post-*`. El fix separa assignment/postulation sin alterar el flujo operativo real de asignaciones.

## Gates / seguridad

Este bloque fue source-only.

- Auth writes: 0
- password resets/changes: 0
- Firestore writes: 0
- HR writes/imports: 0
- Rules/Storage/Make/Gemini: 0
- pagos/lotes: 0
- deploy: 0
- merge: false
- producción: false

Combined status observado en `6594ef...`: `cxorbia/c6-skip13-auth-access-adjudication/overall = success`.

## Impacto Academia

Patrón reusable a documentar: una misma entidad puede tener scope de proyecto raíz y filas de periodo; nunca se deben mezclar IDs de distinto nivel. También: una asignación de una fuente operacional no se convierte semánticamente en postulación de plataforma. Sin cambio de contenido de cursos en este bloque.

## Siguiente bloque exacto

`PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_NO_REPROCESS`:

- validar source/runtime sobre el mismo HEAD;
- DEV deploy solo bajo gate;
- proyecto + 15 periodos;
- postulations persistidas vs assignments HR;
- identityReviewQueue/crosswalk exacto de agosto sin histórico/password reset;
- Mi Perfil/Histórico;
- Finanzas ya existentes;
- KPI derivados;
- luego Phase A E2E.
