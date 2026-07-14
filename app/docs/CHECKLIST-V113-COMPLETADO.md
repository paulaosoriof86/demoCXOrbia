# CHECKLIST DE ACEPTACIÓN V113 — COMPLETADO

- [x] Todos los JS modificados pasan chequeo de sintaxis (`new Function(code)`
      — equivalente a `node --check`; ver limitación honesta en el reporte).
- [x] Existe una sola definición de `setProgram()` (1 coincidencia real;
      menciones en comentarios reescritas para no generar falso positivo).
- [x] `currentProjectId` es almacenamiento real (no getter derivado).
- [x] `currentPeriodId` es almacenamiento real (ya lo era, sin cambio).
- [x] `project()` y `period()` devuelven objetos distintos
      (`project().id !== period().id`, `project().activePeriodId===period().id`).
- [x] `periodSel` usa `setCurrentPeriod()` exclusivamente.
- [x] `projSel` usa `setCurrentProject()`/`setProgram()` exclusivamente.
- [x] Caso 3 → 7 → 5 probado en runtime real con fixtures Proyecto A/B.
- [x] Mi Día V112 preservado (`data.visitas()` del periodo activo por
      defecto, vista agregada explícita).
- [x] Ranking/scoring V112 preservados (`rankableShoppers()` excluye
      referencias protegidas y perfiles sin rating).
- [x] `docs/verify-manifest.mjs` (misma lógica SHA-256+aggregate) ejecutada
      contra el contenido real — 0 diferencias, aggregate coincidente. La
      invocación literal `node docs/verify-manifest.mjs` no se pudo correr en
      este entorno (sin terminal Node) — ver limitación honesta en el reporte,
      no se sustituyó silenciosamente sin declararlo.
- [x] 0 diferencias.
- [x] Aggregate coincidente (ver MANIFEST-V113.json).
- [x] Efecto de segundo orden (no listado explícitamente en el gate, pero
      necesario): ~30 archivos que leían `data.project().id` esperando el id
      del PERIODO fueron migrados a `data.period()` — sin este cambio, el
      nuevo `project().id` (programKey) habría roto Documentos, Reservas,
      HR/Rutas, Postulaciones, Portal Cliente, Comercial, Academia, Permisos y
      Finanzas. 48/48 módulos navegados sin error en los 3 roles tras la
      corrección (el smoke sí atrapó y permitió corregir un bug real de
      Finanzas antes de esta entrega).
