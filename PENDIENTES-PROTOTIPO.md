# PENDIENTES-PROTOTIPO.md

Lista viva de pendientes detectados durante backend/migración. No modificar UI aquí; solo documentar para corrección posterior.

## 2026-06-27

### P0 — Separar prototipo comercializable y tenant T&A

- Estado: definido.
- Detalle: `paulaosoriof86/demoCXOrbia` es el repo del prototipo modular aprobado y seguirá como plataforma comercializable. T&A Consultores será el primer cliente/tenant real migrado a CXOrbia.
- Acción sugerida para Claude/Paula: mantener CXOrbia genérico y multi-tenant; no hardcodear T&A, Cinépolis, shoppers reales ni URLs productivas dentro de módulos o core UI.

### P0 — Confirmar base `main` antes de sincronizar PR #1

- Estado: dictamen técnico emitido; plan de sync preparado; pendiente confirmación visual/funcional.
- Detalle: PR #1 está detrás de `main` por 1 commit. Ese commit trae cambios amplios de prototipo frontend, core, estilos y módulos. `DICTAMEN-MAIN-BASE-PR1.md` recomienda no sincronizar automáticamente hasta confirmar que `main` es base aprobada.
- Acción sugerida: usar `PLAN-SINCRONIZACION-MAIN-PR1.md` y `CHECKLIST-POST-SYNC-PR1.md` solo después de confirmar la base. Si se sincroniza, conservar scripts backend en `app/index.html` después de `core/notif.js` y antes de `core/topbar.js`.

### P0 — Confirmar repo definitivo de producción

- Estado: pendiente administrativo.
- Detalle: `paulaosoriof86/demoCXOrbia` fue confirmado por Paula como repo del prototipo modular aprobado para esta fase. `paulaosoriof86/cxorbia-tya-plataforma` no mostró claramente `/app` modular aprobado desde GitHub durante la revisión.
- Acción sugerida para Claude/Paula: definir más adelante si `demoCXOrbia` será renombrado/promovido, si se mantendrá como prototipo comercial, o si los cambios se replicarán al repo privado definitivo de T&A.

### P1 — Storage pendiente por Blaze

- Estado: pendiente.
- Detalle: Storage no fue activado porque requiere plan Blaze.
- Acción sugerida: decidir si se activa Blaze en `cxorbia-backend-dev` o si Storage se deja para una fase posterior. No conectar Storage viejo como backend vivo.

### P1 — Validación de reglas Firebase

- Estado: validación estática realizada; pendiente validación real en DEV.
- Detalle: `VALIDACION-ESTATICA-REGLAS-ADAPTER.md` detectó que shoppers necesitaban leer visitas disponibles para poder postular. Se ajustó `firestore.rules` para permitir lectura controlada de visitas con `estado == disponible` solo dentro de proyectos asignados.
- Acción sugerida: probar escenarios por rol con `CASOS-PRUEBA-FIRESTORE.md` antes de publicar reglas o activar adapter.

### P1 — Seed ficticio T&A

- Estado: dry-run documental aprobado; no ejecutado en Firebase.
- Detalle: `RESULTADO-DRY-RUN-SEED-TYA.md` validó estructura y conteos del seed sin usar credenciales, sin conectar Firebase y sin escribir datos.
- Acción sugerida: no ejecutar escritura real sin autorización explícita de Paula, reglas validadas y credencial local segura.

### P1 — Adapter Firestore para `CX.data`

- Estado: scaffold creado, desactivado.
- Detalle: existen `app/core/backend-config.js` y `app/core/backend-firebase.js`. `CX.BACKEND.enabled` sigue en `false`. Falta cargar Firebase SDK compat en entorno controlado cuando se autorice activar.
- Acción sugerida: activar solo en DEV/preview controlado después de reglas, seed y autorización. Si algún módulo falla por asincronía, documentarlo aquí y no parchar `/app/modules` dentro del PR backend.

### P2 — Datos reales T&A

- Estado: bloqueado.
- Detalle: no se ha migrado ningún dato real. T&A debe entrar como tenant `tya`, no como lógica fija del prototipo.
- Acción sugerida: pedir/cargar export limpio solo cuando se cumpla `MIGRACION-BASE-BUENA-TYA.md`.
