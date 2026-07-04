# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales, smoke tests, Hosting, Make real, correo real, WhatsApp real, Gemini backend ni Storage real.

## Addendum V77 - paquete forense Claude

- Usar el paquete `PAQUETE_CLAUDE_CXORBIA_V77_AUDITORIA_FORENSE_20260704.zip` como fuente de pendientes frontend mas reciente.
- La numeracion V77 es consecutiva del registro de Paula y no debe tratarse como error por si sola.
- Claude debe corregir los pendientes visuales/UX/documentales del prototipo sin tocar backend.
- Mantener separados los avances backend de readiness V5, autorizacion DEV controlada, runner disabled, reglas, rollback y contrato de datos.
- No modificar `tools/migration` ni convertir runners backend en flujos activos.

## Addendum RC V75 - base visual actual

Ver documentos especificos:

- `app/docs/AUDITORIA-RC-V75-CLOUD-FRONTEND-20260703.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V75-20260703.md`
- `app/docs/EMPALME-RC-V75-BACKEND-20260703.md`
- `app/docs/RESUMEN-PARA-CLAUDE-ACUMULADO-RC-V75-20260703.md`

Resumen vigente RC V75:

- V75 resuelve los avisos visuales de Make/IA como pendientes backend/server-side.
- V75 corrige Finanzas para no mostrar `En vivo` en movimientos/liquidaciones.
- V75 agrega flujo visible para `sourceRef` opaco en HR Source.
- Sigue pendiente versionado coherente porque el ZIP aun arrastra referencias a V72.
- Sigue pendiente profundizar SaaS multi-tenant, releases, feature flags, permisos, targeting y rollback.
- Sigue pendiente convertir propuestas comerciales en wizard completo.
- Sigue pendiente CRM Reuniones como backend/calendario real.
- Sigue pendiente limpiar o mantener fuera de carga `app/modules/rutas.js` para evitar duplicidad.

## Addendum RC V74 - Cloud frontend

Ver documento especifico:

- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V74-20260703.md`

Resumen vigente RC V74:

- Conservar HR Source V74: `canImport=false`, sin derivar `sourceRef` desde URL, gates visuales y contrato DEV informativo.
- Corregir versionado interno: el ZIP se recibio como V74, pero docs y releases visibles aun dicen V72.
- Corregir estados honestos en Finanzas: no usar `En vivo` si no hay backend/cruce real.
- Corregir Make/automatizaciones: no aparentar POST real; sigue pendiente backend por tenant.
- Corregir IA: para produccion debe ser server-side, no API key en localStorage.
- Profundizar SaaS: tenants, planes, proyectos, permisos, feature flags, releases, targeting, confirmacion y rollback.
- Profundizar propuestas: wizard comercial, plantillas requeridas, estados completos y conversion a proyecto.
- Mantener el ZIP como RC incremental; no reemplazar backend ni documentacion del PR #7.

## Mejoras desde backend para implementar en Claude

Ver documento especifico:

- `app/docs/MEJORAS-PARA-CLAUDE-DESDE-BACKEND-20260703.md`

## Addendum V70 - HR Source

- Mantener el modulo HR Source visual aprobado.
- No volver a guardar enlaces completos de HR en almacenamiento del navegador.
- En produccion, la referencia de fuente debe ser opaca y entregada por backend.
- La UI debe poder mostrar conteos/tabs devueltos por backend sin asumir que todo viene de datos demo o staging local.
- El flujo de sincronizacion debe mantenerse como solicitud bloqueada hasta autorizacion backend; no mostrarlo como importacion ejecutada.
- Mostrar estados honestos de contrato/preview/importacion: bloqueado, warning, pendiente backend o preview; nunca importado si `canImport=false`.

## Vigente desde V64

La lista vigente actualizada esta en:

- `PENDIENTES-PROTOTIPO-V64.md`
- `AUDITORIA-PROTOTIPO-V64.md`

## Control de desactualizacion

La auditoria V64 encontro que muchos pendientes acumulados en documentos V62/V63 ya fueron declarados resueltos por la nueva version del prototipo. Por lo tanto:

- No se deben reprocesar como pendientes abiertos los items que V64 marca como resueltos.
- Si un item resuelto por V64 falla en validacion visual posterior, se documentara como regresion nueva.
- El backlog vivo debe partir de V64, no de V62 ni de versiones anteriores.

## Pendientes vigentes principales

1. Versionado visual coherente V75 o superior.
2. Submodulo Periodos completo: crear, cerrar, archivar, duplicar y comparar periodos.
3. Vista de Historico consultable sin mezclarse con operacion activa.
4. Deteccion de periodo en importador HR con panel de confirmacion.
5. Centro de Actualizaciones/Novedades SaaS multi-tenant.
6. Sincronia de filtros proyecto/periodo/pais entre todos los modulos.
7. Estados honestos para correo, automatizaciones, integraciones e IA.
8. Fichas ampliadas de periodo, visita y sucursal.
9. Profundidad adicional en Academia, Finanzas y Portal Cliente.
10. SaaS Console con permisos, releases, feature flags, targeting, confirmacion y rollback.
11. Wizard de propuestas comerciales completo.

## Separacion corregida

Los pendientes de backend/integracion permanecen separados. ChatGPT/backend continua con Sprint 3 sobre Firestore DEV, acciones operativas controladas y `responsibilityLog` sin tocar `app/modules` para resolver backend.

Claude debe trabajar sobre V77 o sobre el prototipo mas reciente empalmado por Paula/ChatGPT, sin usar versiones viejas y sin revertir avances backend.
