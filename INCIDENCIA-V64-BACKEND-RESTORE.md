# INCIDENCIA-V64-BACKEND-RESTORE.md

Fecha: 2026-07-01 18:54:39

## Incidencia

Durante la aplicacion local del ZIP V64, el bloque fast-track preservo los archivos backend principales, pero la lista protegida no incluyo todos los archivos pp/core/backend*.js.

El reporte local mostro eliminados:

- app/core/backend-active-project.js
- app/core/backend-ai.js
- app/core/backend-resources.js

## Correccion

Se restauraron los tres archivos desde el commit sano anterior:

4f5efed3dfa38a16090ad506b2c77b23fc86a9c1

## Validaciones

- Archivos restaurados existen.
- 
ode --check OK en backend restaurado.
- Sprint 3 sigue presente en ackend-operational-actions.js.
- Reglas Sprint 3 siguen presentes en irestore.rules.
- No se hizo deploy.
- No se publico Hosting.
- No se toco produccion.
- No se mezclo Orbit ni Orbia.

## Aprendizaje metodologico

En futuros fast-track de ZIPs de Claude, la proteccion no debe usar una lista cerrada parcial. Debe proteger por patron:

- pp/core/backend*.js
- pp/index-backend-dev.html
- irestore.rules
- irebase/*
- documentos backend protegidos

Si un ZIP no trae un archivo backend, no debe eliminarse del repo.
