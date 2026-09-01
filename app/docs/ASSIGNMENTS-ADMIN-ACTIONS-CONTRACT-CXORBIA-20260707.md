# Assignments admin actions contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de asignaciones desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-assignments-admin-actions-contract.mjs`

## Necesidad cubierta

El modulo de Asignaciones debe permitir resolver casos operativos sin depender de correcciones externas ni de sincronizacion automatica perfecta.

Debe permitir:

- buscar asignaciones por proyecto, visita, shopper, estado y fuente;
- asignar shopper desde plataforma con razon;
- liberar asignacion con razon;
- mover asignacion a revision;
- resolver duplicados entre fuente plataforma y fuente externa;
- marcar sincronizacion pendiente cuando la fuente externa aun no refleja el cambio.

## Acciones permitidas

- `search_assignments`
- `assign_shopper`
- `release_assignment`
- `move_to_review`
- `resolve_source_duplicate`
- `mark_sync_pending`

## Estados requeridos

- `available`
- `assigned`
- `released`
- `review_required`
- `sync_pending`
- `sync_conflict`
- `cancelled`

## Fuentes requeridas

- `platform`
- `external_source`
- `admin_manual`
- `sync_reflection`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto, visita y shopper cuando aplique.
- No se permiten acciones globales sobre todas las visitas o todos los shoppers.
- Toda asignacion manual requiere razon y auditoria.
- Liberar asignacion requiere razon y auditoria.
- Duplicados entre plataforma y fuente externa no deben resolverse por coincidencia visual.
- Conflictos deben ir a revision humana.
- Cambios reales a fuente externa quedan apagados hasta gate.

## Pendiente para Claude

Claude debe incorporar en Asignaciones:

- buscador por visita, shopper, estado y fuente;
- vista de conflictos de sincronizacion;
- accion puntual para asignar shopper;
- accion puntual para liberar asignacion;
- accion para mover a revision;
- accion para resolver duplicados con evidencia;
- razon obligatoria;
- historial/auditoria visible;
- copy claro para sync pendiente, conflicto y reflejo externo.

## Relacion con Phase A

Este bloque refuerza la sincronizacion plataforma / fuente externa:

- plataforma a fuente externa;
- fuente externa a plataforma;
- salida de visitas disponibles cuando ya hay asignacion;
- no duplicar cuando el cambio se refleja por otra via;
- no sobrescribir conflictos silenciosamente.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes con asignaciones por visita y fuentes externas.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Asignaciones, Visitas disponibles, Shopper y Admin.

### Academia

Sin impacto directo, salvo manuales operativos de admin y shopper.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin sincronizacion real y sin datos sensibles.
