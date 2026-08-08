# AUDITORÍA V153 — DOS P0 REALES RESTANTES

Fecha: 2026-07-16

## Candidata

- Archivo externo: `Prototype development request (4).zip`.
- Identidad interna: V153.
- ZIP SHA-256: `bb5727668dc6356358b09867df7415b12c318b8bcf2e08e909d728644032d377`.
- Manifest: `docs/MANIFEST-V153.json`.
- File count: 202.
- Aggregate: `ea2543b1726e4fc32fb4e2b5e95a58e5e057f499c812e2d905e07bbd91ccb1dd`.
- Manifest verificado: 0 diferencias.
- JavaScript: 0 fallos de sintaxis.
- Delta contra V151: 18 archivos modificados, 4 agregados y 0 eliminados.

## Avances preservados

- Finanzas conserva `data.project()` y el adapter local `project()/period()/visitas()`.
- PWA conserva un único propietario de `beforeinstallprompt`.
- Se eliminó `(prueba)` de los nombres visibles de roles.
- Se agregó migración de residuos conocidos.
- Se reescribió parte del lenguaje técnico.

## P0-1 — migración de proyectos insegura y no repetible

Prueba aislada reproducida:

- la migración elimina `Proyecto A/B` y fixtures sin comprobar tenant;
- un proyecto de otro tenant llamado `Proyecto A` fue eliminado;
- un fixture de otro tenant fue eliminado;
- si ya existe `cx_projects_migration_v151_commercial_cleanup_1`, nuevos residuos de prueba permanecen visibles.

Debe separar limpieza legacy única, limitada al tenant demo, de sanitización repetible de fixtures explícitos del tenant actual.

## P0-2 — gate comercial transversal no aprobado

Hallazgos:

1. El curso técnico real usa `id:'a_backend'`, pero V153 filtra `a_sistema central`; por tanto continúa visible.
2. `?internal=1` concede `hasTechAccess()` al admin comercial, porque el login admin usa internamente rol `super`. Un parámetro público no es protección.
3. Persisten textos visibles como `backend`, `pending_backend`, `reviewQueue`, `source-safe`, `dry-run`, `connectionRef` y rutas internas en módulos y manuales comerciales.
4. El propio reporte V153 reconoce que no completó el recorrido exhaustivo de toda la superficie admin.

## Decisión

`HOLD_TWO_REAL_P0_REMAINING`

No empalmar todavía. La siguiente candidata debe derivarse únicamente de V153 y corregir estos dos P0.

## Paquete Claude

`PAQUETE-EXCLUSIVO-CLAUDE-V153-DOS-P0-REALES-RESTANTES-20260716.zip`

SHA-256: `dafb1f2c2fbc32027d79a3b344ae8da78250d63c4f737e2a1b50e218f632d86c`.

## Clasificación

- `Reusable CXOrbia`: migración tenant-safe, limpieza repetible de fixtures y copy comercial transversal.
- `Exclusivo cliente`: sin cambio TyA/Cinépolis.
- `Claude/prototipo`: dos P0 finales.
- `Academia`: curso técnico y manuales deben estar realmente fuera de audiencias comerciales.
- `Sin impacto Claude`: backend TyA, Firebase, R11D/R14C y datos reales.

Sin empalme, deploy, producción, imports ni writes.