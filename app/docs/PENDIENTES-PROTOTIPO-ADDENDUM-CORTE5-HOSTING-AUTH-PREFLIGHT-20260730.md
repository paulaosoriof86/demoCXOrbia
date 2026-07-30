# PENDIENTES PROTOTIPO — addendum Corte 5 Hosting DEV / Auth

Fecha: 2026-07-30

## P0/P1 vivo
No hay nuevo P0 de datos ni de `CX.data`. El bloqueo actual es una dependencia de seguridad previa a la visualización con PII real:

`SECURE_FIREBASE_AUTH_PREREQUISITE_FOR_REAL_DATA_VISUAL`.

## Pendiente antes de producción
- integrar login Firebase real con sesión CXOrbia por rol/persona/scope;
- fail-closed si no existe principal autenticado o claims válidos;
- Admin/Operativo ve identidad real conforme RBAC;
- Shopper ve solo su perfil/visitas/certificaciones;
- Cliente ve solo alcance aprobado;
- el selector de roles/demo no puede conceder acceso provider;
- no exponer passwords/tokens/service account en Hosting.

## No reabrir
- R17N materialización;
- P0 de periodos corregido;
- Corte 3 V182;
- creación de Firebase/Hosting nuevo;
- migración de datos ya realizada.

## Backlog P1/P2 sigue no bloqueante
PDF/gráficas, Excel/formato, reportKit/copy y otros pendientes visuales acumulados.

## Estado seguro
Redeploy autorizado del Hosting existente: 0/1 y no consumido. Data/Auth/Storage/HR/legacy writes=0; producción=0.
