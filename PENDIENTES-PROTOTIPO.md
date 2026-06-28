# PENDIENTES-PROTOTIPO.md

Lista viva de pendientes detectados durante backend/migración. No modificar UI aquí; solo documentar para corrección posterior.

## 2026-06-27

### P0 — Separar prototipo comercializable y tenant T&A

- Estado: definido.
- Detalle: `paulaosoriof86/demoCXOrbia` es el repo del prototipo modular aprobado y seguirá como plataforma comercializable. T&A Consultores será el primer cliente/tenant real migrado a CXOrbia.
- Acción sugerida para Claude/Paula: mantener CXOrbia genérico y multi-tenant; no hardcodear T&A, Cinépolis, shoppers reales ni URLs productivas dentro de módulos o core UI.

### P0 — Confirmar base `main` antes de sincronizar PR #1

- Estado: dictamen técnico emitido; plan de sync preparado; pendiente confirmación visual/funcional.
- Detalle: PR #1 está detrás de `main` por 1 commit. Ese commit trae cambios amplios de prototipo frontend, core, estilos y módulos.
- Acción sugerida: usar `PLAN-SINCRONIZACION-MAIN-PR1.md` y `CHECKLIST-POST-SYNC-PR1.md` solo después de confirmar la base.

### P0 — Confirmar repo definitivo de producción

- Estado: pendiente administrativo.
- Detalle: `demoCXOrbia` fue confirmado por Paula como repo del prototipo modular aprobado para esta fase.
- Acción sugerida: definir más adelante si se mantiene como prototipo comercial o si se replica al repo privado definitivo de T&A.

### P1 — Storage pendiente por Blaze

- Estado: pendiente.
- Detalle: Storage no fue activado porque requiere plan Blaze.
- Acción sugerida: no conectar Storage viejo como backend vivo.

### P1 — Validación de reglas Firebase

- Estado: validación estática realizada; pendiente validación real en DEV.
- Detalle: reglas ajustadas para lectura controlada de visitas disponibles por shopper del proyecto.
- Acción sugerida: probar escenarios por rol con `CASOS-PRUEBA-FIRESTORE.md`.

### P1 — Auth DEV y claims

- Estado: documentado, no ejecutado.
- Detalle: `PLAN-AUTH-CLAIMS-DEV.md` y `CHECKLIST-AUTH-DEV-SIN-USUARIOS.md` preparan roles y claims sin crear usuarios.
- Acción sugerida: no crear usuarios ni asignar claims hasta autorización expresa y validación de reglas.

### P1 — Seed ficticio T&A

- Estado: dry-run documental aprobado; no ejecutado en Firebase.
- Detalle: seed validado sin credenciales, sin conectar Firebase y sin escribir datos.
- Acción sugerida: no ejecutar escritura real sin autorización expresa.

### P1 — Adapter Firestore para `CX.data`

- Estado: scaffold creado, desactivado.
- Detalle: `CX.BACKEND.enabled` sigue en `false`.
- Acción sugerida: activar solo en DEV/preview controlado después de reglas, seed y autorización.

### P1 — Riesgos de asincronía `CX.data`

- Estado: documentado.
- Detalle: `MAPEO-CXDATA-FIRESTORE.md` y `RIESGOS-ASINCRONIA-CXDATA.md` documentan riesgos al reemplazar datos inmediatos por Firestore asincrónico.
- Acción sugerida: revisar módulos después del evento `backend-ready` cuando se active DEV.

### P1 — Persistencia financiera DEV

- Estado: documentado, no implementado.
- Detalle: `MAPEO-FINSTORE-FIRESTORE.md` y `PLAN-PERSISTENCIA-FINANCIERA-DEV.md` documentan la fase futura.
- Acción sugerida: no crear adapter financiero hasta validar reglas, seed, adapter base y comportamiento de `CX.finStore`.

### P2 — Datos reales T&A

- Estado: bloqueado.
- Detalle: no se ha migrado ningún dato real.
- Acción sugerida: pedir/cargar export limpio solo cuando se cumpla `MIGRACION-BASE-BUENA-TYA.md`.
