# Certification admin actions contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de certificaciones desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-certification-admin-actions-contract.mjs`

## Necesidad cubierta

La plataforma debe permitir administrar certificaciones sin depender de correcciones externas cuando algo no se refleje automaticamente.

Debe permitir:

- buscar shoppers certificados;
- buscar shoppers no certificados o pendientes;
- autorizar excepcion para una certificacion especifica, no para todas;
- solicitar una certificacion especifica a un shopper especifico;
- resolver casos donde una certificacion presentada no se reflejo correctamente.

## Acciones permitidas

- `search_status`
- `grant_single_waiver`
- `revoke_single_waiver`
- `request_single_certification`
- `resolve_missing_reflection`

## Estados consultables

- `not_required`
- `required_pending`
- `in_progress`
- `passed`
- `failed`
- `expired`
- `manual_review`
- `carryover_accepted`
- `single_waiver_authorized`

## Roles autorizados

- `superadmin`
- `admin`
- `academy_admin`

## Reglas clave

- Toda accion debe estar limitada por `tenantId`, `projectId`, `shopperId` y `certificationId` cuando sea accion individual.
- No se permiten excepciones globales para todas las certificaciones.
- No se permiten acciones globales sobre todos los shoppers.
- Toda excepcion individual requiere razon y referencia de auditoria.
- Toda solicitud individual requiere razon y referencia de auditoria.
- Resolver una certificacion no reflejada requiere verificacion administrativa.

## Pendiente para Claude

Claude debe incorporar en el modulo de certificaciones:

- buscador por certificacion, proyecto, shopper y estado;
- filtros para certificados, pendientes, vencidos, en revision y autorizados por excepcion;
- accion para autorizar excepcion individual por certificacion especifica;
- accion para revocar excepcion individual;
- accion para solicitar certificacion especifica a un shopper especifico;
- accion para resolver certificacion presentada que no se reflejo;
- historial/auditoria visible para admins;
- mensajes claros para shopper y admin.

## Relacion con Academia

Academia debe respetar estas decisiones:

- si existe excepcion individual, no debe bloquear al shopper por esa certificacion especifica;
- si se solicita una certificacion puntual, debe mostrar ruta o contenido requerido;
- si una certificacion no se reflejo, debe permitir revision y correccion administrativa;
- las excepciones no deben aplicar a cursos o certificaciones distintas.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes con certificaciones por proyecto.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo. Claude debe implementar administracion total de certificaciones desde UI.

### Academia

Impacto directo en rutas, cursos, notificaciones y bloqueos por certificacion.

### Sin impacto Claude

No aplica: este bloque si genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin notificaciones reales y sin datos sensibles.
