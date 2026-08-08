# REPORTE — V150 (paquete "V149 FIX REAL · DOS P0", 20260716)

Baseline: `Prototype development request CXOrbia V149.zip` (reempaque idéntico confirmado por el paquete, 0 diffs contra V149).

## P0-1 — Aislamiento de proyectos y limpieza de fixtures

`core/data.js`:
- **Dedupe en creación:** `addProject()` ahora busca primero un proyecto existente con mismo
  `tenantId` + nombre normalizado (trim + lowercase + espacios colapsados). Si existe, devuelve
  ESE proyecto en vez de crear un duplicado con id distinto. Verificado: crear "Test Dedupe
  Unico" y luego "test dedupe unico" devuelve el mismo id ambas veces (`sameProject:true`).
- **Migración idempotente y versionada** (`cx_projects_migration_v149_fix_1`): al restaurar
  `cx_custom_projects`, colapsa duplicados por tenant+nombre normalizado, quedándose con el más
  antiguo, y remapea cualquier `projectId` de `cx_extra_visitas` que apuntara al duplicado
  descartado. Se ejecuta una sola vez (bandera persistida); nunca borra proyectos reales, solo
  colapsa los que comparten tenant+nombre. Verificado unitariamente: 3 entradas ("Proyecto A" /
  "proyecto a" / "Proyecto B") → 2 finales, con `remap: {projA2: projA1}` correcto.
- **Source-safe/Conectado:** ya bloqueados por `CX.app.renderDataSourceBlock()` cuando
  `dataSource.mode!=='demo'` — los 3 seeds y cualquier custom project nunca se muestran fuera
  de modo demo (confirmado en `app.js:292`, sin cambios necesarios).

Nota de honestidad: el reload real de un módulo IIFE no fue reproducible de forma determinista
dentro de este entorno de vista previa (el iframe de verificación no siempre re-ejecuta los
`<script>` en un ciclo de prueba dentro de la misma sesión) — el algoritmo de deduplicación se
verificó de forma aislada y unitaria con los mismos datos y misma lógica exacta que corre en
`_restoreCustomProjects`, más la ruta de creación (`addProject`) verificada en vivo contra
`CX.data.projects` real.

## P0-2 — Ningún contenido técnico para usuarios

- **Diagnóstico & Readiness:** removido de la navegación de TODOS los roles (ya no aparece en
  `NAV.admin` ni en ningún otro grupo). El módulo se marca `superOnly:true` en `CX.MODULES` y
  `CX.router.nav()` bloquea la navegación a menos que `CX.session.effectiveRole()==='super'`
  — el único rol que hoy usa ese identificador es el superadmin invitado (`rol:'super'`, sin
  `testRole`), consistente con `canSeeProtectedData()` que ya usaba ese mismo criterio. Sin
  entrada de menú: acceso posible únicamente a quien conoce el id de módulo y tiene sesión
  superadmin — ruta no comercial, tal como exige el gate.
- **Infraestructura (`docs/**`, `demo/**`, `README.md`):** este proyecto frontend no contiene
  configuración de build/hosting (no hay `firebase.json`/`hosting` en `app/`) — excluir esas
  rutas del deploy es una decisión de infraestructura fuera del alcance de este prototipo
  frontend; no se fabricó configuración de despliegue inexistente. Se deja explícito para que
  el proceso de empalme aplique la exclusión en su propio pipeline de Hosting.
- El resto del lenguaje técnico visible (SaaS Console, notas de "backend pendiente") ya estaba
  acotado a rol admin/super (categoría `cfg`), no a shopper/cliente — no se tocó por estar fuera
  del alcance declarado de "dos P0" de este paquete específico.

## Gate técnico
- Sintaxis: `core/data.js`, `core/config.js`, `core/router.js` — PASS.
- Runtime: 0 errores en consola tras los cambios.
- No se tocó: `data/store.js` (no existe en este frontend; N/A), `core/auth.js` (N/A, no hay
  módulo con ese nombre en este prototipo), `core/importador.js`, Firebase, HR, adapters,
  R11D/R14C, pagos, certificaciones — sin cambios.
- Manifest V150 regenerado.

## Pendiente explícito
- Reproducir el gate de "cinco copias Proyecto A/B en localStorage + recarga real de navegador"
  en un entorno con recarga dura verdadera (fuera de este entorno de vista previa) para
  confirmar el flujo end-to-end completo, aunque la lógica ya está verificada unitariamente.
