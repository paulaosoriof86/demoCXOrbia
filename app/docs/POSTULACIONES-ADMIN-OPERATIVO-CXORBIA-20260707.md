# Postulaciones admin operativo - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se documento requerimiento operativo administrable para Postulaciones.

## Objetivo

El modulo de Postulaciones debe permitir que administracion vea y gestione casos por estado sin depender de correcciones externas ni del dashboard.

## Necesidad operativa

Debe permitir:

- ver todas las postulaciones, no solo pendientes;
- filtrar por proyecto, visita, shopper, pais y estado;
- aprobar postulacion puntual;
- marcar postulacion como no aprobada con razon;
- mover postulacion a revision;
- reabrir postulacion puntual si hubo error administrativo;
- conservar historial de cambios.

## Estados requeridos

- `draft`
- `submitted`
- `pending_review`
- `approved`
- `not_approved`
- `reopened`
- `cancelled_by_admin`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto, visita, shopper y postulacion.
- No se permiten acciones masivas sin revision.
- Toda accion administrativa requiere razon.
- Los conflictos deben ir a revision humana.
- El dashboard solo debe llevar al modulo; no debe hacer cambios directos.
- Las notificaciones reales quedan apagadas hasta gate.

## Pendiente para Claude

Claude debe incorporar en Postulaciones:

- vista de todas las postulaciones;
- filtros por estado;
- buscador por shopper y visita;
- acciones administrativas puntuales;
- razon obligatoria;
- historial visible;
- mensajes claros de preview o accion real segun gate.

## Relacion con Phase A

Este bloque evita que aprobaciones o correcciones de postulacion dependan de manipulacion manual externa.

Tambien ayuda a que la plataforma pueda resolver postulaciones historicas, actuales y casos en revision.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes con postulaciones por proyecto y visita.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Postulaciones.

### Academia

Sin impacto directo, salvo que una postulacion aprobada o en revision habilite rutas o contenidos posteriores.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin notificaciones reales y sin datos sensibles.
