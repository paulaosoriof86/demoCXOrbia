# ADDENDUM MAESTRO — FAST-LANE DE EMPALME ATÓMICO Y COHERENCIA TYA

Fecha: 2026-07-16  
Proyecto: CXOrbia TyA — Phase A

## 1. Incidente que corrige

Se detectó que una promoción de candidata podía aplicar parte del árbol nuevo y conservar silenciosamente archivos runtime de la baseline anterior mediante exclusiones. Eso crea una versión híbrida aunque se la describa como baseline única.

Desde ahora queda prohibido promover una candidata con exclusiones silenciosas sobre `app/index.html`, `app/app.js`, `app/core/**`, `app/modules/**`, `app/styles/**` o `app/sw.js`.

## 2. Regla atómica obligatoria

Una candidata solo queda aceptada cuando, dentro del mismo bloque reproducible:

1. se identifica ZIP, versión interna y SHA-256;
2. se materializa completo el árbol runtime de la candidata;
3. se reaplican overlays backend indispensables como deltas explícitos sobre la candidata;
4. se valida que cada overlay tenga motivo, archivo, semántica protegida y prueba;
5. se genera un único manifest del árbol final;
6. `build-lock.js`, registro de baseline, manifest y commit identifican exactamente el mismo árbol;
7. pasan los gates técnicos, semánticos TyA y smoke por roles;
8. solo entonces se mueve la rama de integración.

No existe el estado «candidata aceptada pero no empalmada». La candidata anterior queda únicamente como rollback inmutable.

## 3. Fast-lane para cada próxima candidata

El proceso normal no debe durar horas ni abrir rutas paralelas:

### Fase 1 — Auditoría delta automatizada

- hash y manifest;
- delta contra baseline activa;
- sintaxis JavaScript;
- scripts de `index.html`;
- archivos agregados/eliminados;
- copy técnico y promesas de integraciones;
- impacto Academia;
- detección de contaminación o datos sensibles.

### Fase 2 — Gate semántico TyA obligatorio

Antes de revisión visual deben probarse automáticamente:

- `projectId` y `periodId` son identidades distintas;
- el proyecto Cinépolis agrupa 14 periodos, no 14 proyectos duplicados;
- cada periodo tiene ID único y 44 visitas;
- cambiar periodo cambia el conjunto de visitas y el contexto histórico;
- MAY/JUN/JUL no producen el mismo snapshot operativo;
- junio tiene cero visitas pendientes de realizar y conserva pendientes de liquidación/pago;
- los KPI se recalculan desde el periodo activo y no mezclan todos los periodos;
- país y moneda se derivan del proyecto/visita;
- la hoja de ruta y módulos consumidores reciben el mismo `{tenantId, projectId, periodId}`;
- shoppers y certificaciones preservadas no se regeneran ni se pierden;
- no aparece data demo como fuente final TyA.

### Fase 3 — Smoke por roles

Admin, Shopper y Cliente deben recorrer rutas críticas con la misma fuente TyA source-safe, sin errores de consola y con capturas/reportes sanitizados.

### Fase 4 — Promoción

Un solo commit final, un solo manifest, un solo source lock y una sola baseline activa.

## 4. Propiedad de archivos

- `Claude/prototipo`: árbol runtime visual entregado por la candidata.
- `Backend reusable`: `backend/**`, `tools/**`, contratos, importadores, workflows y reglas.
- `Overlay de conexión`: únicamente archivos explícitamente registrados que conectan la candidata con contratos/backend sin reescribir UI.
- `Documentación`: `app/docs/**`, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.

Un archivo runtime no puede preservarse por pertenecer «al backend» sin que exista overlay explícito y prueba de compatibilidad sobre la candidata completa.

## 5. Hallazgo raíz de coherencia TyA

La fuente HR source-safe declara `projectId: cinepolis` para el proyecto padre y `periodKey` para cada mes. El bridge runtime no debe convertir los 14 periodos en 14 entradas con el mismo ID `cinepolis`, ni asignar todas las visitas al mismo periodo.

Contrato correcto:

- `currentProjectId = cinepolis`;
- cada periodo tiene un ID estable y único derivado de `projectId + periodKey`;
- `currentPeriodId` apunta al periodo activo;
- cada visita conserva el proyecto padre y se vincula además al ID del periodo;
- `CX.data.project()` y `CX.data.period()` devuelven identidades distintas;
- `CX.data.visitas()` filtra por el periodo activo;
- cambiar periodo recalcula Dashboard, KPIs, Finanzas, Histórico, Hoja de ruta, Visitas, Postulaciones y Liquidaciones.

## 6. Gates de salida

No se autoriza Hosting DEV ni revisión visual si falla cualquiera de estos gates:

- atomicidad de baseline;
- integridad proyecto/periodo;
- integridad histórica HR;
- KPI por periodo;
- junio ejecutado/pagos pendientes;
- rutas por roles;
- source-safe/no demo;
- sintaxis/scripts/manifest.

Una falla visual posterior solo genera una correctiva focalizada sobre la baseline ya activa; no reabre backend, HR, mapeos ni bloques cerrados que hayan pasado sus gates.

## 7. Clasificación

- **Reusable CXOrbia:** pipeline fast-lane, atomicidad, propiedad de archivos, gates de contexto proyecto/periodo y promoción única.
- **Exclusivo cliente:** cifras y reglas TyA/Cinépolis, 14 periodos, 44 visitas por periodo y tratamiento de junio.
- **Claude/prototipo:** correcciones visuales futuras deben partir de la baseline activa y no tocar backend/tools.
- **Academia:** documentar proyecto vs periodo, selección de contexto, lectura histórica, KPI y estados de producción.
- **Sin impacto Claude:** validadores, workflows, manifests, source locks y controles de promoción.

## 8. Estado seguro

Este addendum no ejecuta deploy, producción, imports, writes, Make, Gemini ni pagos. La promoción V156 debe realizarse en rama aislada y solo avanzar tras PASS completo.