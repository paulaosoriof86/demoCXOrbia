# RIESGOS-ASINCRONIA-CXDATA.md

## Objetivo

Registrar riesgos de asincronía al reemplazar datos mock/localStorage por Firestore manteniendo la misma interfaz de `CX.data`.

Este archivo no cambia código.

## Contexto

El prototipo actual define datos de demo de forma inmediata dentro de `app/core/data.js`. Firestore, en cambio, carga datos de forma asincrónica.

Por eso, aunque la interfaz pública siga siendo `CX.data`, los módulos pueden necesitar escuchar eventos de actualización para re-renderizar.

## Riesgos

### R1 — Render inicial antes de datos reales

Un módulo puede renderizar con datos mock antes de que Firestore termine de cargar.

Mitigación actual:

```text
CX.backend emite backend-ready
CX.backend emite project
CX.backend emite shoppers
CX.backend emite visit-flow
```

Pendiente: comprobar si los módulos principales escuchan esos eventos.

### R2 — KPIs calculados antes de reemplazar datos

`CX.data.kpis()` usa `visitas()` y `posts()`. Si se llama antes de `applyData`, mostrará mock.

Mitigación: activar adapter solo en DEV/preview y revisar dashboard después de `backend-ready`.

### R3 — Postulaciones dependen de `_posts`

Si `_posts` no se carga o se carga después del render, postulaciones puede mostrar vacío.

Mitigación: adapter ya lee `postulations`, pero falta prueba real.

### R4 — Finanzas no cubiertas completamente

`payVisits()` puede generar egresos en `CX.finStore`. El adapter actual persiste visitas, pero no movimientos financieros.

Mitigación: documentar adapter financiero como fase posterior; no parchar UI.

### R5 — Métodos opcionales

El adapter intenta envolver `addShopper` y `updateShopper` solo si existen.

Mitigación: no falla si esos métodos no están definidos en `data.js`.

## Módulos a revisar cuando se active DEV

```text
dashboard
visitas
postulaciones
shoppers
misvisitas
beneficios
finanzas
configuracion
```

## Regla de actuación

Si algo falla por asincronía:

```text
1. No modificar /app/modules dentro del PR backend.
2. Documentar el módulo afectado en PENDIENTES-PROTOTIPO.md.
3. Registrar el comportamiento en RESUMEN-PARA-CLAUDE.md.
4. Mantener CX.BACKEND.enabled=false hasta corregir en frontend.
```

## Estado

```text
Riesgo documentado: sí
Adapter activo: no
Prueba real: pendiente
```
