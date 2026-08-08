# Resumen para Claude — R15C a R15F

Fecha: 2026-07-13

## Estado que Claude debe tomar como base

- V110 permanece empalmada y bloqueada por manifest unión.
- No crear otro Firebase.
- `cxorbia-backend-dev` es el entorno DEV existente confirmado de CXOrbia.
- Firestore fue validado read-only, pero todavía no es la fuente canónica TyA.
- Fuente canónica actual: HR viva multi-tab source-safe + control financiero R14C.
- El binding real-data se hace en build mediante `tya-source-safe-binding-build-r15f.mjs` y el bridge existente `core/tya-phase-a-source-safe-preview.js`.
- No corresponde tocar `app/index.html` ni reescribir módulos para conectar datos.

## Resultado funcional visible

Smoke R15F:

- 14 periodos;
- 616 visitas;
- 210 shoppers live source-safe;
- 13/13 rutas Admin/Cliente/Shopper;
- 0 errores de consola o página;
- junio 44/44 ejecutadas;
- única advertencia operativa: 210/213 shoppers.

## Qué NO debe hacer Claude

- No crear un adapter nuevo.
- No conectar proveedores desde módulos UI.
- No hardcodear Cinépolis como producto global.
- No reemplazar la fuente HR source-safe por los conteos Firestore actuales.
- No marcar 255 liquidaciones Firestore como fuente financiera final; R14C tiene 247 filas y 51 en revisión.
- No fabricar certificaciones: Firestore tiene 0 materializadas y 213 shoppers permanecen pendientes de fuente carryover.
- No modificar workflows, tools, adapters, manifests, rules, secrets ni reportes R15C–R15F.

## Pendientes Claude

No surge P0 frontend nuevo.

P1 acumulado:

- conservar copy honesto en los 40 hallazgos del scanner ya conocidos;
- distinguir visualmente `source-safe`, `read-only`, `pendiente materialización`, `en revisión` y `pagado confirmado`;
- no presentar Firestore read-only como producción o migración completada.

## Impacto Academia

Actualizar, cuando corresponda el siguiente paquete frontend, las explicaciones de:

- Firebase DEV existente vs proyecto nuevo;
- fuente canónica vs copia materializada;
- read-only vs write/import/deploy;
- gap shopper 210/213;
- R14C 196/247 y 51 filas en revisión;
- certificaciones carryover pendientes de fuente.

## Estado seguro

Sin tarea inmediata para Claude. No se genera paquete crítico ni se solicita nueva candidata.
