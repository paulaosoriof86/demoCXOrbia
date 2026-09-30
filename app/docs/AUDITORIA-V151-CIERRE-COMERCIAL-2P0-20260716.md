# AUDITORÍA V151 — CIERRE COMERCIAL · DOS P0

Fecha: 2026-07-16

## Identidad

- Archivo externo: `Prototype development request (3).zip`.
- Identidad interna: V151.
- SHA-256 ZIP: `5d364e22371d2d97bed45745cdcd986e38e814b0a2c87d7529f6b31e48b620f9`.
- Manifest: `docs/MANIFEST-V151.json`.
- File count manifest: 200.
- Aggregate: `ef55c21d16e0cb2d6c62a145266b3bfd17274c4b1ffd2bfe2e33f69f5cd7dc51`.
- Manifest: 0 diferencias.
- JavaScript: 0 fallos de sintaxis.

## Delta frente a V149

- Agregados: 4 documentos V150/V151.
- Modificados: `core/build-lock.js`, `core/config.js`, `core/data.js`, `core/router.js`, `modules/cliente.js`, `modules/reservas.js`.
- Eliminados: 0.

## Corrección de alcance

Claude mantiene el prototipo comercializable y genérico. No configura TyA ni Cinépolis como tenant/proyecto real. Los tres proyectos demo curados — Retail, Banca y Restaurantes — son válidos en el prototipo comercial.

La integración TyA, el aislamiento source-safe real y la exclusión de documentación del Hosting pertenecen al empalme/backend, no al paquete Claude.

## Qué atendió V151

- Dedupe por tenant + nombre normalizado al crear/restaurar proyectos.
- Diagnóstico removido de navegación comercial y restringido a `super`.
- Eliminación de tenant/contrato crudo en Portal Cliente.
- Simplificación de un toast de Reservas.
- Manifest íntegro y sintaxis válida.

## Dos P0 restantes

### P0-1 — residuos de prueba visibles

La validación visual muestra `Proyecto A`, `Test Dedupe Unico` y `Equipo Operativo (prueba)`. La migración V150 colapsa duplicados, pero no elimina fixtures conocidos ni limpia la prueba de dedupe al finalizar.

Debe conservarse el catálogo demo curado y eliminarse solo el residuo test del tenant demo mediante migración idempotente y pruebas con cleanup.

### P0-2 — lenguaje técnico todavía visible a usuarios comerciales

V151 interpreta que la jerga técnica es aceptable para `admin`. Esa interpretación no es válida: admin, ops, coordinador y aliado también son usuarios comerciales.

Solo `super` interno puede ver diagnóstico técnico. En las demás audiencias deben desaparecer términos como backend, runtime, source-safe, pending_backend, reviewQueue, auditEvents, sourceRef, manifest, source lock, BUILD_ID y rutas `app/docs`.

## Decisión

`HOLD_TWO_COMMERCIAL_P0_ONLY`

No empalmar todavía. La próxima candidata debe derivarse exclusivamente de V151 y corregir solo estos dos P0. No reabrir R19, KPI, periodos, Finanzas, PWA, HR, pagos o certificaciones.

## Paquete Claude

`PAQUETE-EXCLUSIVO-CLAUDE-V151-CIERRE-COMERCIAL-2P0-20260716.zip`

SHA-256: `670d2dd9c6133a2c1e753c2e63f1642e36ec4a382af30beb2868cf462dcec50b`.

## Clasificación

- `Reusable CXOrbia`: catálogo demo limpio, fixtures test con cleanup y copy comercial por audiencia.
- `Exclusivo cliente`: sin cambio TyA/Cinépolis.
- `Claude/prototipo`: los dos P0 anteriores.
- `Academia`: contenido técnico interno solo para super; cursos comerciales en lenguaje funcional.
- `Sin impacto Claude`: aislamiento TyA source-safe, Hosting y exclusión de documentación pública se resuelven en empalme/backend.
