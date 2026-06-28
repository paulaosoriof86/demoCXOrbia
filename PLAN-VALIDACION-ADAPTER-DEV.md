# PLAN-VALIDACION-ADAPTER-DEV.md

## Objetivo

Definir cómo validar el adapter Firestore en DEV sin tocar producción ni romper el prototipo.

## Estado actual

```text
CX.BACKEND.enabled = false
Adapter creado: app/core/backend-firebase.js
Config creada: app/core/backend-config.js
Punto de carga: app/index.html
Firestore real: no conectado por la app
Datos reales: no cargados
```

## Precondiciones

No activar adapter hasta cumplir:

1. `main` confirmado como base aprobada o PR #1 estabilizado.
2. Reglas Firestore validadas.
3. Seed ficticio cargado en DEV con autorización.
4. Usuarios DEV o claims de prueba definidos.
5. Firebase SDK cargado de forma controlada en DEV.
6. No usar producción.
7. No usar datos reales.

## Validación técnica

Al activar en DEV, revisar:

```text
CX.BACKEND.enabled
CX.backend.start()
CX.data.projects
CX.data.shoppers
CX.data._visitas
CX.data._posts
CX.data.currentProjectId
CX.bus.emit('project')
CX.bus.emit('backend-ready')
```

## Módulos a revisar visualmente

```text
dashboard
visitas
shoppers
postulaciones
mis visitas
beneficios / liquidaciones
configuración
```

## Reglas de actuación

Si un módulo no renderiza por asincronía o por asumir datos inmediatos:

1. No editar `/app/modules` dentro del PR backend.
2. Documentar el caso en `PENDIENTES-PROTOTIPO.md`.
3. Mantener adapter desactivado hasta corregir el prototipo.
4. Entregar resumen para Claude.

## Resultado esperado

La plataforma debe seguir llamando a `CX.data` de la misma forma. El frontend no debe conocer Firestore directamente.

## Criterio de avance

Solo pasar a migración real cuando:

```text
adapter probado con seed ficticio
módulos principales renderizan
reglas bloquean roles correctamente
no hay datos reales en DEV
Paula autoriza pedir/cargar base buena
```
