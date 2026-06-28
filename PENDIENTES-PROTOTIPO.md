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

- Estado: completado en Firebase DEV.
- Detalle: `RESULTADO-PUBLICACION-REGLAS-DEV.md` documenta salida visible con `Deploy complete!` para `firebase.cmd deploy --only firestore:rules --project cxorbia-backend-dev`.
- Restricciones vigentes: no se creó Auth, no se asignaron claims, no se cargó seed, no se activó adapter, no se publicó Hosting y no se tocó producción.
- Acción sugerida: preparar el gate de usuarios DEV ficticios y claims, pero no ejecutarlo sin autorización separada de Paula.

### P1 — Advertencia reglas Firestore DEV

- Estado: detectada, no bloqueante.
- Detalle: Firebase reportó `[W] 51:14 - Unused function: canAccessProject.` durante la compilación de `firestore.rules`.
- Acción sugerida: revisar en fase de limpieza de reglas sin modificar permisos funcionales todavía.

### P1 — Archivos locales generados por emulador/validación

- Estado: pendiente de limpieza local.
- Detalle: PowerShell mostró `?? firebase/emulator-rules/node_modules/` y `?? firebase/emulator-rules/package-lock.json` después del deploy.
- Acción sugerida: no commitear esos archivos; limpiarlos o excluirlos localmente antes de nuevos commits desde PowerShell.

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
