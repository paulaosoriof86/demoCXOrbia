# PENDIENTES-PROTOTIPO.md

Lista viva de pendientes detectados durante backend/migración. No modificar UI aquí; solo documentar para corrección posterior.

## 2026-06-27

### P0 — Separar prototipo comercializable y tenant T&A

- Estado: definido.
- Detalle: `demoCXOrbia` es el repo del prototipo modular aprobado y seguirá como plataforma comercializable. T&A será el primer tenant real.

### P0 — Confirmar base `main` antes de sincronizar PR #1

- Estado: dictamen técnico emitido; plan de sync preparado; pendiente confirmación visual/funcional.
- Acción sugerida: usar `PLAN-SINCRONIZACION-MAIN-PR1.md` y `CHECKLIST-POST-SYNC-PR1.md` solo después de confirmar la base.

### P1 — Storage pendiente por Blaze

- Estado: pendiente.
- Acción sugerida: no conectar Storage viejo como backend vivo.

### P1 — Validación de reglas Firebase

- Estado: paquete de emulador creado; ejecución real pendiente fuera de ChatGPT.
- Acción sugerida: ejecutar emulador localmente o con Codex antes de publicar reglas.

### P1 — Auth DEV, claims y seed ficticio

- Estado: admin tools dry-checks creados; no ejecutados.
- Detalle: `firebase/admin-tools/` contiene validadores locales para seed ficticio y claims DEV sin escribir Firebase. También existen `BLOQUE-POWERSHELL-DRY-CHECKS-ADMIN.md` y `PROMPT-CODEX-DRY-CHECKS-ADMIN.md`.
- Acción sugerida: ejecutar dry checks localmente o con Codex después/em paralelo al emulador, sin credenciales ni escritura.

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
