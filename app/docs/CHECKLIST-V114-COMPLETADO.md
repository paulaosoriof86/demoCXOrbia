# CHECKLIST DE ACEPTACIÓN V114 — COMPLETADO

- [x] 0 asignaciones directas a currentProjectId/currentPeriodId fuera de
      core/data.js (router.js, store.js, cliente.js migrados a setProject()).
- [x] setCurrentProject() co-emite cx:period-changed cuando el cambio de
      proyecto arrastra cambio de periodo.
- [x] shoppers-store.js: visitsForShopper filtra por currentPeriodId (no
      currentProjectId) — histórico ya no vacío (3 registros probados).
- [x] Guards academia.js/permissions.js corregidos (CX.data.period, no
      CX.data.project, antes de invocar period()).
- [x] Texto academia.js revisado — sin afirmación falsa de equivalencia.
- [x] verify-manifest.mjs lee la ruta del manifest dinámicamente desde
      core/build-lock.js (override opcional --manifest).
- [x] MANIFEST-V114.json regenerado desde contenido real.
- [x] build-lock.js actualizado a V114.
- [x] Syntax check 7/7 archivos modificados: PASS.
- [x] 0 diferencias en verificación manifest vs contenido real.
- [x] Smoke 48 módulos × 3 roles sin error runtime.
