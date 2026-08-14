# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 18:42 -06:00
**Estado:** `SHOPPER_P0_SOURCE_FIX_DEPLOYED_DEV_PASS__HUMAN_RETEST_PENDING`

## P0 vigente

La causa source-level del bloqueo Shopper quedó corregida y protegida por gate. El portal usa `CX.backendAuth.context()`, espera la autoridad HR y vuelve a renderizar después del handoff final. El diagnóstico DEV distingue el proyecto operativo de los periodos HR y marca Firestore como slice transitorio.

Gate source `31749008509`: SUCCESS, `hardFails=0`, identidad exacta PASS y handoff Auth/HR PASS.

El fix ya está desplegado en Hosting DEV. Workflow `CXOrbia C6 DEV Root Entrypoint Hosting` run `31758046539`, job `94638091029`: SUCCESS. Exactamente 1 deploy a `cxorbia-backend-dev`; paridad remota PASS; runtime Staff/Admin read-only PASS con 15 periodos, 660 visitas y agosto 2026 vigente. Artifact `9203525557`, digest `sha256:e17b2b6060e32a9d5d464ad42729421df1d43a44ef718f6a73faae52f3c2959a`.

## Pendiente real inmediato

Repetir la prueba humana con el mismo Shopper sobre el build recién desplegado. La aceptación debe exigir:
- identidad y país correctos;
- histórico real;
- Visitas Disponibles según semántica canónica;
- Reservas & Asignación;
- Mis Visitas;
- Academia/Certificación;
- Mis Beneficios según alcance real;
- panel DEV mostrando fuente final HR viva + overlay protegido, no el slice Firestore transitorio.

Después se ejecuta regresión humana dirigida Admin/Operaciones, Cliente y Academia sobre el mismo build.

## No reabrir

No rehacer identidades, no deduplicar por nombre, no reimportar HR, no crear candidata, rama o PR nuevos y no rediseñar módulos sin nueva evidencia reproducible. Producción, merge y dominio oficial siguen bloqueados.