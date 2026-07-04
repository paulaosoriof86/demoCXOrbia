# Assignments and postulations sync module review Phase A TyA

Fecha: 2026-07-04

## Objetivo

Iniciar la revision backend modulo por modulo sobre V82 con un bloque Phase A critico: postulaciones, asignaciones y sincronizacion HR/plataforma.

Este bloque no modifica frontend y no activa runtime. Define contrato, validador y pendientes para empalme seguro.

## Modulos involucrados

- `app/modules/postulaciones.js`
- `app/modules/misvisitas.js`
- `app/modules/visitas.js`
- `app/modules/dashboard.js`
- `app/modules/hr-source.js`
- `app/core/data.js`
- `app/core/hr.js`
- `app/core/automations.js`

## Estado V82

V82 queda como baseline viva. El flujo visual de postulaciones/asignaciones existe, pero las integraciones reales con HR y Make siguen apagadas.

Pendiente visual heredado de V82:

- algunos textos siguen diciendo `HR sincronizada` o que sincronizan hoja de ruta;
- deben cambiar a estado honesto: `se reflejara en HR cuando el sync este activo (pendiente backend)`.

## Contrato creado

- `app/contracts/assignment-sync-phase-a.tya.contract.json`

El contrato define:

- colecciones futuras;
- llaves estables;
- fuentes de asignacion;
- estados canonicos de sincronizacion;
- acciones posibles;
- reglas anti-duplicacion;
- manejo de conflictos;
- impacto Academia.

## Validador creado

- `tools/migration/tya-assignment-sync-contract-validator.mjs`

El validador revisa:

- gates apagados;
- llaves estables;
- estados canonicos;
- acciones deshabilitadas;
- reglas de no sobreescritura;
- regla de no deduplicar visualmente;
- impacto Academia.

## Llaves estables obligatorias

- `tenantId`
- `projectId`
- `visitId`
- `hrRowId`
- `shopperId`
- `assignmentId`
- `postulationId`
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt`

## Estados canonicos de sync

- `not_synced`
- `pending_make_sync`
- `synced_from_platform`
- `synced_from_hr`
- `sync_disabled_preview_only`
- `conflict_review_required`
- `manual_review_required`
- `cancelled`

## Reglas Phase A

1. Si admin aprueba una postulacion, la visita debe salir de disponibles en la plataforma.
2. Si luego HR refleja la misma asignacion, no debe duplicarse.
3. Si HR asigna directamente, la plataforma debe detectar esa asignacion y sacar la visita de disponibles.
4. Si plataforma y HR tienen datos incompatibles, no se sobreescribe: pasa a conflicto.
5. No deduplicar por nombre visible, sucursal, fecha o coincidencia visual simple.
6. Make sigue como gate apagado hasta autorizacion.
7. No escribir Firestore ni HR desde este bloque.

## Riesgos detectados

- Si el prototipo promete `HR sincronizada`, se genera expectativa falsa porque Make/HR real no esta activo.
- Si se deduplica visualmente, una visita puede quedar duplicada o asignada a shopper incorrecto.
- Si no se separa origen de asignacion, no se puede auditar si vino de plataforma o HR.
- Si no se documenta Academia, un operativo nuevo no sabra como aprobar, asignar, resolver conflictos ni escalar.

## Pendientes backend

- Crear validador de preview HR/plataforma usando datos mock o staging seguro.
- Mapear metodos `CX.data` actuales a acciones canonicas.
- Preparar conflict preview sin escritura real.
- Preparar Make payload futuro, todavia deshabilitado.

## Pendientes prototipo

- Cambiar textos `HR sincronizada` por estados honestos.
- Mostrar estados de sync como preparado/pendiente/conflicto cuando aplique.
- Mostrar conflicto HR/plataforma como revision, no como sobrescritura.
- Mantener instrucciones para Claude si vuelve a tener capacidad.

## Impacto Academia

Academia debe actualizar o crear contenido para:

### Operativo / coordinador

- Como revisar postulaciones.
- Como aprobar una postulacion.
- Como asignar manualmente.
- Que significa `pending_make_sync`.
- Que hacer si aparece conflicto HR/plataforma.
- Como notificar al shopper.

### Admin

- Como supervisar postulaciones y asignaciones.
- Como auditar origen de asignacion.
- Como revisar conflictos.
- Como validar que una visita salio de disponibles.

### Shopper

- Como postularse.
- Que pasa cuando lo aprueban.
- Como ver visitas asignadas.
- Que notificaciones recibira.

### Cliente

- Como interpretar estados de cobertura sin ver datos operativos sensibles.

### Consultora / representante / franquiciado / aliado / socio

- Como este flujo reduce duplicidad y mejora control operativo.
- Que valor comercial tiene la sincronizacion HR/plataforma.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin HR writes.
- Sin Make real.
- Sin deploy.
- Sin produccion.
