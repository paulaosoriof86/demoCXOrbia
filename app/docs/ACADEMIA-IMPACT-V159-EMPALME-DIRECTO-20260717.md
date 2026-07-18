# ACADEMIA IMPACT — V159 EMPALME DIRECTO Y PLAN REVALIDADO

Fecha: 2026-07-17

## Impacto inmediato

V159 queda aplicada para validar Academia dentro de los post-gates por rol.

Validar:

- listado, búsqueda, recomendaciones y categorías;
- deep links;
- edición, versionado y archivo/restauración;
- acceso técnico protegido;
- rutas por rol;
- manuales, certificaciones y notificaciones.

## Impacto del plan ajustado

Academia debe acompañar la secuencia real de Phase A:

1. build V159 y baseline activa;
2. contexto, HR e histórico;
3. ciclo shopper y operación de campo;
4. finanzas, liquidaciones, pagos y certificaciones;
5. backend nuevo y limpio con `CX.data` read-only;
6. materialización DEV;
7. Auth/RBAC y permisos;
8. HR sync, evidencias y producción controlada.

No debe explicar como activo algo que siga en preview, dry-run, HOLD o pendiente de autorización.

## Reconciliación del intento fallido

La restauración de workflows/gate no cambia contenido, UX ni rutas de Academia. No crea una tarea nueva para Claude.

En la siguiente validación visual debe comprobarse Academia sobre el mismo build V159 desplegado en Hosting DEV, incluyendo:

- acceso por rol;
- manuales y cursos asociados a proyecto/periodo;
- certificaciones presentadas;
- notificaciones y estados honestos;
- ausencia de promesas de proveedores o sincronizaciones todavía apagadas.

## Contenido obligatorio

- proyecto vs periodo;
- fuente source-safe vs runtime real;
- revisión humana y reviewQueue;
- import, materialización y rollback;
- certificaciones presentadas y estados pendientes;
- liquidación vs pago confirmado;
- sincronización en ambos sentidos;
- datos sensibles y referencias opacas;
- roles Admin, Operativo, Coordinador, Cliente y Shopper;
- notificaciones y estado real de proveedores.

## Estado seguro

Sin proveedores live, writes, pagos ni promesas de integraciones reales.
