# ESTADO PARCIAL — V113 → V114 (GAP1 + GAP2 CERRADOS, GAP3 PENDIENTE)

Actualización: GAP1 y GAP2 completos, con pruebas runtime ejecutadas y en
PASS (ver abajo). GAP3 (manifest/build-lock/verificador dinámico) sigue sin
tocar — este ZIP NO es un V114 aceptado, es GAP1+GAP2 cerrados sobre V113.


Este ZIP se entrega a pedido explícito del usuario ANTES de completar el gate
V114. No reemplaza al V113 como baseline aceptada — es un corte intermedio
con avances reales ya aplicados sobre V113, para no perder trabajo.

## Completado en esta ronda (GAP1 + parte de GAP2)

- `app/core/router.js`: las 5 ramas de scope (shopper/cliente/coordinador)
  que escribían `currentPeriodId` directamente ahora llaman a
  `CX.data.setProject(periodId)` — el único mutador real, que sincroniza
  `currentPeriodId` Y `currentProjectId` (recalculado vía programKey) y
  emite los eventos correspondientes.
- `app/core/store.js`: restauración de periodo desde `localStorage` migrada
  a `setProject()`.
- `app/modules/cliente.js`: selector `cliProjSel` migrado a `setProject()`.
- `app/core/data.js`: `setCurrentProject()` ahora co-emite
  `cx:period-changed` con el periodo resultante cuando el cambio de
  proyecto arrastra un cambio de periodo (antes solo emitía
  `cx:project-changed`, y ningún listener de periodo se enteraba).
- Verificado con grep: **0 asignaciones directas** a
  `currentProjectId`/`currentPeriodId` fuera de `core/data.js` en todo `app/`.
- `app/core/shoppers-store.js`: `visitsForShopper` filtraba por
  `this.currentProjectId` (id de proyecto/programa) cuando
  `v.projectId` siempre almacena el id del PERIODO — vaciaba el histórico.
  Corregido a `this.currentPeriodId`.
- `app/modules/academia.js` y `app/core/permissions.js`: guardas
  `CX.data&&CX.data.project&&CX.data.period()` corregidas a
  `CX.data&&CX.data.period&&CX.data.period()` (comprobaban el método
  equivocado antes de invocar `period()`).

## Cierre de GAP1 y GAP2 — pruebas runtime ejecutadas (PASS)

- `project().activePeriodId === period().id` consistente tras `CX.router.mount()`
  en shopper, cliente y admin (sin estados cruzados). PASS.
- Histórico de un shopper del periodo activo (`CX.data.visitsForShopper(id,true)`)
  devuelve registros reales (3), ya no vacío. PASS.
- Módulo Finanzas renderiza correctamente tras el fix de `serieMensual`/guards. PASS.
- Texto de `academia.js`: revisado — NO contiene ninguna afirmación falsa de
  que `currentProjectId`/`currentPeriodId` sean "el mismo valor"; no requería
  edición.

## Pendiente — NO declarado como PASS, no verificado en esta ronda

- `docs/verify-manifest.mjs` NO fue reescrito todavía para leer el manifest
  vigente desde `core/build-lock.js` dinámicamente — sigue apuntando a una
  versión fija. **No se regeneró `MANIFEST-V114.json` ni se actualizó
  `build-lock.js`** — el manifest/build-lock vigente en este ZIP sigue
  siendo el de V113.
- No se corrió el smoke completo (48 módulos × 3 roles) sobre este corte
  específico después de los cambios de GAP1/GAP2 de esta ronda.
- No hay checklist de aceptación V114 — el gate `01-CHECKLIST-ACEPTACION.md`
  de V113→V114 NO está satisfecho todavía.

## Qué decirle a quien reciba este ZIP

Esto es un snapshot de trabajo en curso, útil para revisar el avance real de
código, pero **no debe tratarse como "V114 aceptado"** ni usarse para
verificar el gate de la auditoría — falta cerrar GAP3 completo y repetir el
smoke antes de eso.
