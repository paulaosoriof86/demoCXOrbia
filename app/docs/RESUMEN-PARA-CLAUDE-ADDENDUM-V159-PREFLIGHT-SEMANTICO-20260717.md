# RESUMEN PARA CLAUDE — V159 CORTE 0

Fecha inicial: 2026-07-17  
Actualización: 2026-07-18

## Estado vigente

V159 está auditada y empalmada en `docs-tya-v6-v71-audit`.

- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Preflight estructural: PASS.
- Preflight semántico estático: PASS.
- P0 demostrado: no.
- Estado: `EMPALMED_PENDING_POST_GATES` / `TECHNICAL_PASS_PENDING_VISUAL`.
- No solicitar V160, no reauditar V159 y no generar paquete general.

## Qué se preservó

- frontend V159 completo;
- proyecto y periodo como identidades separadas;
- 14 periodos y 616 visitas source-safe esperadas;
- Dashboard, Proyectos, Periodos, Histórico, Visitas y Shoppers sin reapertura desde cero;
- estados honestos de fuentes, integraciones, certificaciones, liquidaciones y pagos;
- `CX.dataSource.sourceContract()` en Importador;
- backend, overlays, contratos, adapters, tools, reviewQueue, rollback y documentos vivos;
- Academia profunda, manuales, rutas por rol y notificaciones como parte de la validación del build.

## Diagnóstico post-empalme relevante

El intento anterior de Hosting DEV no llegó a desplegar. Los gates locales detectaron que un builder temporal R18A asignaba la llave del periodo a `currentProjectId`, colapsando proyecto y periodo.

La causa no estaba en los módulos frontend. El builder canónico R15G ya contiene la separación correcta:

- `currentProjectId = cinepolis`;
- `currentPeriodId = latest.id`.

También se comprobó una deriva source-safe de 215 shoppers frente a la referencia 216. Esta diferencia queda visible para revisión humana R11D; no se completa, elimina ni inventa ninguna identidad para forzar el conteo.

## Fixes locales/backend reutilizables aplicados

No requieren que Claude modifique el frontend:

1. Gate shopper: deriva de conteo como warning auditable; inconsistencia o identidad inventada sigue bloqueando.
2. Build-lock: ruta del manifest V159 corregida.
3. Registry: V131 queda como rollback visual congelado y V159 como runtime empalmado pendiente de post-gates/freeze.
4. Validadores: transición empalme→gates→visual→freeze sin declarar V159 activa antes de tiempo.
5. Checkpoint histórico V113/V114: marcado como superado.
6. Contrato Phase A: actualizado a `CORTE_0_V159_POST_EMPALME`.

Estos cambios son patrones generales de CXOrbia y no lógica exclusiva de Cinépolis.

## Estado del rerun

El commit `6e36f2f2f9621d90390e9215d2f3bfa0efdceb15` reactivó los gates canónicos R15G.

Solo se aceptará evidencia sanitizada con `ok:true` en:

- source semantics;
- smoke Admin, Shopper y Cliente;
- proyecto, periodo, KPI e histórico.

No se afirma PASS antes de esa evidencia.

## Qué debe replicar Claude solamente si aparece un hallazgo visual

Claude interviene únicamente si la validación del build exacto V159 demuestra un P0 frontend reproducible. En ese caso el pendiente debe indicar:

- archivo y módulo exactos;
- acción realizada;
- resultado esperado y observado;
- rol afectado;
- impacto reusable CXOrbia;
- impacto en Academia/manuales/notificaciones;
- validación esperada.

P1/P2 se documentan y no bloquean el freeze.

## Academia

No hubo cambio de contenido ni UX en este saneamiento. En el smoke y revisión visual del mismo build V159 se debe comprobar:

- acceso por rol;
- listado, búsqueda, deep links y rutas;
- manuales y cursos asociados;
- certificaciones presentadas;
- edición, versionado y archivo/restauración;
- notificaciones;
- estados honestos de fuentes y proveedores apagados;
- diferencia entre snapshot source-safe de build y sincronización HR runtime real.

## Siguiente validación

1. Confirmar gates post-empalme.
2. Ejecutar Hosting DEV exacto mediante R15G.
3. Ejecutar smoke remoto.
4. Realizar revisión visual de Paula.
5. Congelar V159 como `ACTIVE_BASELINE` si no existe P0.

No existe tarea frontend nueva confirmada en este momento.
