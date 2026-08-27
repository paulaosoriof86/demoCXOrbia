# AUDITORIA-BLOQUE-2-DEDUPE-FINANZAS-OPERACION-CONFIG-20260629

## Alcance

Segunda pasada de auditoría del prototipo V52 enfocada en flujos que pueden impactar la migración backend:

- deduplicación;
- finanzas core;
- módulo financiero;
- mis visitas shopper;
- visitas admin/shopper;
- postulaciones;
- configuración;
- proyectos.

No se modificó código del prototipo.

## Archivos revisados

- `app/core/dedupe.js`
- `app/core/finanzas-core.js`
- `app/modules/finanzas.js`
- `app/modules/misvisitas.js`
- `app/modules/visitas.js`
- `app/modules/postulaciones.js`
- `app/modules/configuracion.js`
- `app/modules/proyectos.js`

## Dedupe

El prototipo define `CX.dedupe` con llave natural estable. La lógica evita usar campos mutables como fecha, estado o shopper.

Identidad propuesta de visita:

- `extId` o `ref` si existe;
- si no existe, sucursal + ciudad + escenario + quincena.

### Conclusión backend

Esta lógica debe respetarse en el backend. Para HR real debe persistirse:

- `extId`;
- `sourceRowRef`;
- `naturalKey`;
- `sourceFingerprint`;
- `importBatchId`;
- `lastSeenAt`.

### Riesgo

La llave natural actual no incluye país ni projectId dentro de `natKey`. Se compensa porque el índice se filtra por proyecto, pero para backend multi-país y multi-hoja conviene guardar naturalKey con país y projectId explícitos para evitar colisiones.

## Finanzas core

`CX.finStore` es un almacén demo en memoria con:

- movimientos por proyecto;
- presupuesto mensual;
- movimientos globales;
- CxP/CxC;
- lote en construcción;
- financiamientos;
- remesas;
- eventos `fin` y `lote`.

`CX.fin` calcula por país:

- ingreso;
- honorarios pagados;
- reembolsos;
- ISR/regalías cuando aplica;
- margen;
- CxP;
- CxC.

### Conclusión backend

La persistencia real debe separar:

- movimientos reales;
- presupuestos por periodo;
- CxP/CxC;
- financiamientos;
- paymentLots;
- reconciliations.

### Riesgo

Algunos análisis intermensuales/interanuales se generan con series derivadas/demostrativas. En producción deben venir de movimientos reales e históricos importados.

## Finanzas módulo

El dashboard financiero separa por país y moneda. También reconoce que el reembolso es flujo de caja, no utilidad.

El módulo movimientos maneja:

- ingresos;
- egresos;
- CxC;
- CxP;
- financiamientos;
- remesas;
- presupuesto mensual;
- importación histórica como botón todavía no conectado a importador real.

### Pendiente para Claude/frontend

- El botón `Importar histórico` debe conectarse al importador real con preview/dry-run.
- La conciliación de reembolsos no debe usar valores simulados.
- El comparativo histórico debe provenir de `financialMovements`, no de series derivadas.
- Las monedas no deben sumarse entre países.

## Mis visitas shopper

El flujo shopper contiene:

- instructivo;
- certificación;
- agendar;
- reprogramar;
- marcar realizada;
- cuestionario;
- submit/liquidación.

Cada acción llama eventos o sincronizaciones:

- `data.setVisitState`;
- `CX.hr.writeBack` indirecto desde data;
- `CX.automations.fire`;
- `CX.bus.emit('visit-flow')`.

### Riesgo P0

La selección inicial de visitas usa `base.find(...) || base[n]` y puede tomar visitas del proyecto activo que no necesariamente son del shopper autenticado.

Aunque existe `mine`, las tarjetas activas usan `asignada`, `agendada`, `realizada` tomadas desde `base`, no desde `mine`.

Esto debe corregirse en frontend para evitar que un shopper vea o actúe sobre visitas que no le corresponden.

## Visitas admin/shopper

Para shopper, el módulo muestra marketplace de visitas disponibles de todos los proyectos.

Para admin, muestra tabla operativa con filtros y acciones.

### Hallazgos

- El marketplace shopper muestra todas las visitas `disponible` de todos los proyectos.
- Falta validar país/perfil/certificación antes de mostrar o permitir postulación.
- El botón `Importar HR` visible en admin aún no está conectado a flujo real.
- El editor de visita muestra modal, pero el guardar solo hace toast; no persiste cambios reales en el objeto.

### Pendiente para Claude/frontend

- Conectar editor de visita a `CX.data` real o adapter.
- Conectar `Importar HR` al flujo de importador/preview.
- Filtrar disponibilidad por reglas de shopper, país, certificación y proyecto.
- Evitar acciones no persistentes que solo muestren toast.

## Postulaciones

El módulo muestra gestión completa:

- pendientes;
- aprobadas;
- standby;
- reprogramaciones;
- agendamientos;
- aprobar/rechazar;
- editar asignación;
- reasignar;
- cancelar;
- asignar manualmente;
- pedir al shopper;
- sincronizar HR.

### Hallazgos

- `posts` usa `data._posts.slice()` y por eso carga todas las postulaciones, no solo las del proyecto activo. Visualmente tiene filtro por proyecto.
- Las acciones mutan objetos en memoria, pero no todas pasan por métodos centralizados persistibles.
- Reprogramación autorizada modifica `v.agendada`, pero no siempre llama `data.setVisitState`.
- Algunas acciones llaman `CX.hr.writeBack`, otras solo `CX.bus.emit`.

### Conclusión backend

Se requiere centralizar acciones operativas en una capa de backend/adapter:

- aprobar postulación;
- rechazar;
- standby;
- reprogramar;
- autorizar nueva fecha;
- reasignar;
- cancelar;
- asignación manual;
- sincronización HR.

Cada acción debe generar auditoría, persistencia e idempotencia.

## Configuración

El módulo configuración permite:

- marca;
- plan/módulos;
- países;
- NDA.

### Hallazgos

- Configuración todavía está orientada a demo/local.
- Marca y NDA se guardan en objetos globales/memoria/localStorage, no en tenant/project config persistente.
- Países se modifican directamente sobre `p.countries`, sin wrapper backend.

### Pendiente

Llevar configuración a:

- tenant branding;
- tenant NDA;
- project countries/currency;
- module entitlements;
- audit logs.

## Proyectos

El módulo proyectos permite seleccionar proyectos, abrir configuración, cambiar países, escenarios, quincenas y periodicidad. También abre accesos a rutas/HR, cuestionarios e importador.

### Hallazgos

- La UI ya entiende que cada proyecto reconfigura dashboard, KPIs, reglas y cuestionarios.
- El guardado muta `pr` directamente y emite `visit-flow`, pero no pasa por método persistible.
- Falta configuración HR avanzada y financiera avanzada dentro de proyecto.

### Pendiente

Agregar configuración de proyecto persistente para:

- `hrConfig`;
- `financeConfig`;
- `collaborators`;
- reglas de sync;
- reglas de importación;
- permisos por país;
- auditoría.

## Hallazgos P0

1. Shopper puede ver/actuar potencialmente sobre visitas que no son suyas en `misvisitas` por uso de `base` en lugar de `mine`.
2. `beneficios` debe filtrar por shopper autenticado y alias históricos.
3. Acciones operativas críticas deben pasar por métodos centralizados persistibles, no mutaciones directas.
4. Beneficio calculado no debe confundirse con pago real.

## Hallazgos P1

1. Conectar botones de importación HR/histórico a dry-run real.
2. Reemplazar series financieras demo por movimientos reales históricos.
3. Persistir configuración de marca, NDA, países, escenarios, quincenas y periodicidad.
4. Agregar `project.hrConfig`, `financeConfig` y colaboradores.
5. Agregar auditoría por acción operativa.

## Clasificación doble documentación

### TyA específico

- Validar honorarios GT/HN desde configuración del proyecto Cinépolis.
- HR GT/HN y hojas Liquidación deben mapearse con reglas TyA.
- Mayo/junio requieren cruce con pagos pendientes reales.

### CXOrbia generalizable

- Dedupe estable por fuente externa y llave natural.
- Importación con dry-run y auditoría.
- Acciones operativas centralizadas e idempotentes.
- Finanzas separadas por país/moneda.
- Configuración por proyecto y no por código.
- Seguridad por rol para shopper/admin/ops/finanzas.

## Restricciones conservadas

- No se modificó `/app/modules`.
- No se modificó `/app/core`.
- No se escribió Firestore.
- No se importó Excel/Sheets.
- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
