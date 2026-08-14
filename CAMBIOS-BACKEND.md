# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-14 10:08 -06:00  
**Estado:** `FORENSIC_ROOT_CAUSE_LOCKED__DURABLE_GO_LIVE_PLAN_DOCUMENTED__ITERATION_1_NEXT__NO_PRODUCTION`

## Bloque documental ejecutado

Se convirtió la auditoría forense integral del 14-ago en un plan rector durable de corrección/go-live, sin crear candidata, rama ni PR nuevos y sin ejecutar provider writes/deploy/producción.

Documento creado:

- `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`

Documentos vivos actualizados:

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- `app/docs/RESUMEN-PARA-CLAUDE.md`;
- `CAMBIOS-BACKEND.md`.

## Commits de este corte

- addendum plan: `9b143f184b48c276b832a7f2853449058d5d391f`;
- índice activo: `c87272846e6f64c23af3f86defaa31cd7d836973`;
- checkpoint: `15a1a895d801315bf61e247b30ee874650dc079f`;
- pendientes: `5297be0d618568b7c2f1163de22bd74f9ba8b80a`;
- Claude/prototipo: `015c7b7e075bb0cb8a7a36dccb0619a06f2ba3ed`.

## Corrección metodológica

El porcentaje técnico M1–M10 anterior se conserva como evidencia histórica, pero no equivale a readiness productivo. El único cierre productivo válido exige mismo SHA/source-lock/build remoto + E2E real + persistencia + reload/new-tab + roles/scopes + HR/Finanzas.

No se reabre Auth desde cero. Se preservan Firebase Auth bridge, principal Admin/Exact Write V2, membership/RBAC Staff, exact identity contract, HR live authority, cumulative read model, portal Shopper canónico, source repair ya PASS y gates/rollback/source locks sin drift.

## Plan de ejecución fijado

Cinco iteraciones base:

1. source-only root-cause consolidation;
2. canonical persistence + transversal regression;
3. DEV Auth/Firestore Shopper persistence;
4. HR bidirectional + Phase A E2E + Finance;
5. exact build + preproduction + go-live.

Una sexta iteración solo se justifica por P0 nuevo reproducible o bloqueo externo comprobado. Un gate fallido produce corrección focalizada, no reinicio del plan.

## Reusable CXOrbia

El plan obliga a conservar la interfaz exacta `CX.data` y mover persistencia detrás de command adapters con tenant/project scope, RBAC, idempotencia, expectedVersion, audit y ACK. Cinépolis queda como proyecto configurable; HR/proveedores/cuestionario/pagos/evidencias deben ser adapters configurables para futuros proyectos/tenants/no-code.

## Exclusivo cliente

TyA/Cinépolis aporta la configuración y los datos operativos reales/sanitizados de Phase A. No se transforma en lógica global del producto.

## Claude/prototipo

Se documentaron dos P0 quirúrgicos sobre la misma candidata, sin rediseño:

- `app/app.js`: excluir `pickShopperDev()` de la ruta humana protegida y dejar un owner Auth único;
- `app/modules/misvisitas.js`: listas completas + facets canónicas, no `find()`/estados literales.

## Academia

Cada activación real debe actualizar login/errores, ciclo Mis Visitas, creación Shopper persistente, sync HR real y semántica financiera, manteniendo contenido por rol y estados honestos.

## Seguridad

En este corte: Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; cambios/reset de contraseña=0; deploy=0; merge=false; producción=false.

## Siguiente acción exacta

`ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION`.
