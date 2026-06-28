# PENDIENTES-PROTOTIPO.md

Lista viva de pendientes detectados durante backend/migración. No modificar UI aquí; solo documentar para corrección posterior.

## 2026-06-27

### P0 — Separar prototipo comercializable y tenant T&A

- Estado: definido.
- Detalle: `demoCXOrbia` es el repo del prototipo modular aprobado y seguirá como plataforma comercializable. T&A será el primer tenant real.

### P0 — Confirmar base `main` antes de sincronizar PR #1

- Estado: dictamen técnico emitido; plan de sync preparado; pendiente confirmación visual/funcional.
- Acción sugerida: usar `PLAN-SINCRONIZACION-MAIN-PR1.md` y `CHECKLIST-POST-SYNC-PR1.md` solo después de confirmar la base.

### P1 — Validaciones locales combinadas

- Estado: resultado local recibido por captura; sin fallo visible.
- Detalle: `RESULTADO-VALIDACIONES-LOCALES-PAULA-20260628.md` documenta la salida visible: dry checks finalizados y validaciones locales finalizadas.
- Acción sugerida: conservar bloqueo de acciones reales hasta autorización del gate siguiente.

### P1 — Publicación reglas Firestore DEV

- Estado: gate preparado, no ejecutado.
- Detalle: `PLAN-PUBLICACION-REGLAS-DEV.md`, `AUTORIZACION-PUBLICACION-REGLAS-DEV.md` y `BLOQUE-POWERSHELL-PUBLICAR-REGLAS-DEV.md` preparan publicación solo de reglas en DEV.
- Acción sugerida: no publicar hasta autorización expresa de Paula.

### P1 — Storage pendiente por Blaze

- Estado: pendiente.
- Acción sugerida: no conectar Storage viejo como backend vivo.

### P1 — Adapter Firestore para `CX.data`

- Estado: scaffold creado, desactivado.
- Detalle: `CX.BACKEND.enabled` sigue en `false`.
- Acción sugerida: activar solo en DEV/preview controlado después de reglas, seed y autorización.

### P1 — Riesgos de asincronía `CX.data`

- Estado: documentado.
- Acción sugerida: revisar módulos después del evento `backend-ready` cuando se active DEV.

### P1 — Persistencia financiera DEV

- Estado: documentado, no implementado.
- Acción sugerida: no crear adapter financiero hasta validar reglas, seed, adapter base y comportamiento de `CX.finStore`.

### P2 — Datos reales T&A

- Estado: bloqueado.
- Acción sugerida: pedir/cargar export limpio solo cuando se cumpla `MIGRACION-BASE-BUENA-TYA.md`.
