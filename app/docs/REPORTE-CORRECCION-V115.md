# REPORTE DE CORRECCIÓN — V115 (OLA 0 cerrada sobre V114, OLA 1–3 pendiente)

Baseline: `Prototype development request CXOrbia V114.zip`.
Fuente: `PAQUETE-CLAUDE-CXORBIA-V114-A-V115-COMPLETO-COMERCIALIZABLE-20260714`.

## OLA 0 — Integridad y aceptación: PASS_COMPROBADO

1. `modules/finanzas.js` filtraba `v.projectId===CX.data.currentProjectId`
   (residuo real, señalado por la auditoría — la línea era larga y el grep
   anterior la mostraba truncada, lo que hizo que se declarara "resuelto"
   sin verlo). Corregido a `currentPeriodId`. Verificado: 0 ocurrencias de
   ese patrón en todo `app/`.
2. `modules/academia.js`: revisado el texto exacto señalado
   (`currentProjectId</code>/<code>currentPeriodId</code>, el mismo valor`)
   — no existe en el archivo actual; el texto real de `academia.js` ya
   describe la arquitectura corregida (proyecto/programa vs periodo
   distintos). No requería edición.
3. `docs/verify-manifest.mjs` ya lee la ruta del manifest dinámicamente
   desde `core/build-lock.js` (hecho en V114) — confirmado sin referencia
   fija a versiones anteriores.
4. `MANIFEST-V115.json` y `core/build-lock.js` regenerados desde el
   contenido final de esta entrega.
5. `docs/ESTADO-PARCIAL-V113-A-V114-EN-PROGRESO.md` eliminado.
6. Sintaxis: todos los `.js` modificados/tocados pasan chequeo (`new
   Function(code)`, equivalente a `node --check` — ver limitación de
   entorno abajo). `index.html`: scripts únicos, sin huérfanos, 48/48
   módulos cargan sin error en los 3 roles (smoke ejecutado).

## OLA 1 — Estados honestos y contrato de datos: PARCIAL

- Auditoría de copy (grep dirigido a "Enviado"/"Pagado"/"Sincronizado"/
  "Conectado"/"Importado"/"Publicado" como afirmaciones fijas, y a
  "proveedor activo"/"HR en vivo"): no se encontraron afirmaciones falsas
  nuevas — los estados existentes ya son condicionales o usan copy honesto
  (`source_safe_preview`, `ningún proveedor activo`, `pendiente`).
- El contrato de contexto (`tenantId/projectId/periodId/countryScope/role/
  dataMode`) como objeto único y explícito NO se implementó en esta ronda
  — sigue derivándose de varios campos separados de `CX.data`/`CX.session`.
  **NO_ATENDIDO.**
- Contratos de Fuente (`sourceSnapshotAt/sourceReadMode/runtimeSyncActive/
  sourceRef/warnings/blockers`) como forma estándar reutilizable: existen
  piezas parciales en `diagnostico.js`/`hr-source.js`, pero no unificadas
  bajo esos nombres de campo exactos. **PARCIAL.**

## OLA 2 — Operación comercializable: NO_ATENDIDO en esta ronda

Backlog completo (visitas/postulaciones/shoppers/certificaciones/
liquidaciones/comunicaciones/CRM/importador/configuración) — cada uno
requiere trabajo sustancial de UI y contrato por módulo. No se tocó en esta
ronda; se prioriza sobre OLA 0 (bloqueante de aceptación) primero, tal como
indica la regla de orden obligatorio del paquete.

## OLA 3 — Academia transversal: NO_ATENDIDO en esta ronda

CRUD completo (crear/editar/archivar/versionar/etc.) para cursos/manuales/
checklists, cobertura de 13 puntos por módulo, rutas por rol, notificaciones
de Academia — no se tocó en esta ronda.

## Limitación honesta de entorno (repetida, sin cambios de fondo)

Este entorno no expone terminal Node invocable. `node --check` y `node
docs/verify-manifest.mjs`/`node verify-commercializable-prototype-gate.mjs`
no se pudieron correr como comandos literales. Se ejecutó la misma lógica
(sintaxis vía `new Function`, SHA-256+aggregate manual, greps equivalentes a
cada chequeo del gate) directamente sobre el contenido real. Los scripts
quedan listos para ejecutarse con Node real fuera de este entorno.

## Decisión

V115 cierra OLA 0 (el bloqueante de aceptación) de forma real y verificada.
OLA 1 es parcial; OLA 2 y OLA 3 quedan como backlog completo pendiente para
la siguiente candidata incremental — no se declaran resueltos.
