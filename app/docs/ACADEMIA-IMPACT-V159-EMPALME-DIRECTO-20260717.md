# ACADEMIA IMPACT — V159 EMPALME DIRECTO Y CORTE 0

Fecha inicial: 2026-07-17  
Actualización: 2026-07-18

## Estado

V159 está empalmada y Academia debe validarse dentro de los post-gates por rol sobre el mismo build exacto que se publique en Hosting DEV.

Estado actual: `TECHNICAL_PASS_PENDING_VISUAL`.

No se cambió contenido, UX ni rutas de Academia durante el saneamiento técnico del Corte 0. No se crea una tarea frontend nueva para Claude.

## Validación obligatoria de Academia en Corte 0

Comprobar:

- acceso por rol;
- listado, búsqueda, recomendaciones y categorías;
- deep links;
- edición, versionado y archivo/restauración;
- acceso técnico protegido;
- rutas por rol;
- manuales y cursos relacionados con módulos;
- certificaciones presentadas y estados pendientes;
- notificaciones;
- ausencia de promesas de proveedores o sincronizaciones todavía apagadas.

## Reglas que Academia debe reflejar

### Proyecto y periodo

- Cinépolis es un proyecto configurable, no una lógica global.
- El proyecto mantiene identidad `cinepolis`.
- Cada periodo tiene una llave propia.
- Nunca se debe enseñar que proyecto y periodo son el mismo identificador.

### Fuente y runtime

- Un snapshot source-safe fresco de build DEV no equivale a sincronización HR runtime live.
- La UI y los manuales deben mostrar estados honestos: preview, snapshot, revisión requerida, HOLD o activo.
- No explicar como publicado, sincronizado o enviado lo que sigue apagado.

### Shoppers y revisión humana

- La referencia histórica auditada y el snapshot actual pueden diferir.
- Una deriva 215/216 se revisa mediante R11D.
- No se inventan, completan ni eliminan identidades para forzar conteos.
- Los conflictos y datos insuficientes pasan a revisión humana.

### Finanzas y certificaciones

- Certificación presentada se conserva cuando la fuente la confirma.
- Submitido no significa liquidado.
- Liquidación no significa pago confirmado.
- Junio debe mostrarse según su estado real de liquidación/pago, no como visitas pendientes.

### Gobierno del producto

- V159 está empalmada, pero no se enseña como `ACTIVE_BASELINE` hasta pasar gates y validación visual.
- La última baseline visual congelada es referencia de rollback, no el runtime operativo actual.
- Los documentos históricos no sustituyen índice, plan y checkpoint canónicos.

## Impacto del plan Phase A

Academia debe acompañar cada corte vertical:

1. V159 post-empalme, Hosting DEV y freeze visual.
2. Contexto, HR e histórico.
3. Ciclo shopper y operación de campo.
4. Finanzas, liquidaciones, pagos y certificaciones.
5. Backend nuevo y limpio con `CX.data` read-only.
6. Materialización DEV.
7. Auth/RBAC y permisos.
8. HR sync, evidencias y producción controlada.

Cada cambio relevante debe actualizar manual, curso, checklist, errores frecuentes, glosario, ruta por rol y notificación cuando corresponda.

## Claude/prototipo

Claude solo interviene si el smoke o la revisión visual identifica un P0 frontend reproducible. La tarea debe incluir archivo/módulo, rol, flujo, esperado/observado, corrección reusable y contenido de Academia afectado.

No pedir V160 ni generar un paquete general por los fixes de registry, build-lock, gate o checkpoint.

## Próximo paso

1. Confirmar gates post-empalme R15G.
2. Desplegar el mismo build V159 en Hosting DEV.
3. Ejecutar smoke remoto, incluyendo Academia.
4. Realizar revisión visual por rol.
5. Documentar cualquier diferencia focalizada y actualizar contenido solo si el comportamiento real cambió.

## Estado seguro

Sin proveedores live, writes, pagos, producción ni promesas de integraciones reales.
