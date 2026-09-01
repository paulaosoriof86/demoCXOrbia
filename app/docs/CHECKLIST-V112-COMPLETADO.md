# CHECKLIST DE ACEPTACIÓN V112 — COMPLETADO

## No reprocesar
- [x] Login/título V111 preservado (sin cambios en app.js).
- [x] País shopper V111 preservado (sin cambios en router.js relativos a esto).
- [x] `monthSel` cosmético sigue retirado (dashboard.js no lo reintrodujo).
- [x] Fechas literales de Mi Día siguen eliminadas (sin cambios a ese fix).
- [x] Modal reducido de referencia protegida preservado (shoppers.js, ruta sin tocar).
- [x] Academia V111 preservada (academia.js no tocado en V112).

## Proyecto/periodo (GAP1)
- [x] PASS_COMPROBADO — `currentProjectId` y `currentPeriodId` son campos reales distintos
      (uno es storage real + el otro es accessor get/set derivado, con comportamiento
      propio — no un espejo).
- [x] PASS_COMPROBADO — `project()` devuelve el periodo activo (con su config heredada del
      programa); `period()` es su alias explícito.
- [x] PASS_COMPROBADO — Setter de proyecto (`setCurrentProject`/`setProgram`) y setter de
      periodo (`setCurrentPeriod`) son funciones distintas con validación distinta.
- [x] PASS_COMPROBADO — Un periodo de otro proyecto se rechaza (`setCurrentPeriod` devuelve
      `false`, no muta estado) — probado en runtime con fixtures A/B.
- [x] PASS_ESTRUCTURAL — Sidebar y Dashboard sincronizan proyecto y periodo (mecanismo de
      eventos `project`/`cx:period-changed`/`cx:project-changed` sin cambios de V111, ahora
      sobre campos reales en vez de un alias).
- [x] PASS_COMPROBADO — Caso A1=3, A2=7, B1=5 probado en runtime real (ver
      REPORTE-CORRECCION-V112.md).

## Mi Día (GAP2)
- [x] PASS_COMPROBADO — Por defecto usa `data.visitas()` (solo el periodo activo), no
      `data._visitas`.
- [x] PASS_COMPROBADO — No inicia en "Todos" (`_cgProj` default `''` = periodo activo).
- [x] PASS_COMPROBADO — Vista agregada (`ALL`) es explícita, con etiqueta visible de "vista
      agregada" en el encabezado.
- [x] PASS_ESTRUCTURAL — KPIs/calendario/tareas/modales comparten alcance (KPIs ya usaban
      `data.visitas()`/`data.kpis()`; ahora el calendario también, sin divergencia).
- [x] PASS_COMPROBADO — Periodo vacío no reutiliza eventos (`data.visitas()` devuelve `[]`
      honesto, verificado en el mismo runtime test de GAP1).

## Shoppers (GAP3)
- [x] PASS_COMPROBADO — Referencia protegida excluida del ranking (`rankableShoppers`).
- [x] PASS_COMPROBADO — Perfil sin rating excluido del ranking (mismo helper,
      `Number.isFinite`).
- [x] PASS_COMPROBADO — Completitud no cuenta referencias protegidas (KPI y drill de
      shoppers.js excluyen `protected_reference` explícitamente).
- [x] PASS_ESTRUCTURAL — Preferentes no usa fallback (ya no lo usaba en V111; confirmado sin
      regresión).
- [x] PASS_COMPROBADO — Scoring solo aparece con rating numérico real (`Number.isFinite`
      gate en el modal de shoppers.js).
- [x] PASS_COMPROBADO — No se usa `rating||0` para clasificar ranking (dashboard.js
      migrado a `rankableShoppers`).
- [x] PASS_COMPROBADO — Modal protegido permanece sin PII (ruta sin cambios, no regresionada).

## Verificación
- [x] PASS_ESTRUCTURAL — Chequeo de sintaxis de los 18 JS modificados vía `new Function(code)`
      (equivalente funcional; `node --check` literal no invocable en este entorno — ver
      limitación honesta en el reporte).
- [x] PASS_ESTRUCTURAL — Lógica de `verify-manifest.mjs` (SHA-256 + aggregate) ejecutada
      directamente sobre los archivos reales — 0 diferencias, aggregate coincide. La
      invocación `node docs/verify-manifest.mjs` literal no se pudo correr (sin terminal Node).
- [x] Exit code 0 (equivalente: 0 excepciones, 0 diferencias en la verificación anterior).
- [x] 0 diferencias.
- [x] Aggregate coincidente (ver MANIFEST-V112.json).
- [x] PASS_COMPROBADO — Cero errores de consola: 48/48 módulos navegados en admin/cliente/
      shopper con `window.onerror` instrumentado, 0 errores nuevos.
