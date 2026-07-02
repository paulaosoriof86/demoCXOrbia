# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales, smoke tests, Hosting, Make real, correo real, WhatsApp real, Gemini backend ni Storage real.

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

1. Submodulo Periodos completo: crear, cerrar, archivar, duplicar y comparar periodos.
2. Vista de Historico consultable sin mezclarse con operacion activa.
3. Deteccion de periodo en importador HR con panel de confirmacion.
4. Centro de Actualizaciones/Novedades SaaS multi-tenant.
5. Sincronia de filtros proyecto/periodo/pais entre todos los modulos.
6. Estados honestos para correo, automatizaciones, integraciones e IA.
7. Fichas ampliadas de periodo, visita y sucursal.
8. Profundidad adicional en Academia, Finanzas y Portal Cliente.

## Separacion corregida

Los pendientes de backend/integracion permanecen separados. ChatGPT/backend continua con Sprint 3 sobre Firestore DEV, acciones operativas controladas y `responsibilityLog` sin tocar `app/modules` para resolver backend.

Claude debe trabajar sobre V64 o sobre el prototipo mas reciente entregado por Paula, sin usar versiones viejas y sin revertir avances backend.
