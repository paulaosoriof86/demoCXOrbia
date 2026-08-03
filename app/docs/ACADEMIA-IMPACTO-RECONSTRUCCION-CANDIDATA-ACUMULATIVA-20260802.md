# ACADEMIA — IMPACTO DE LA RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA

**Fecha:** 2026-08-02  
**Estado:** `DOCUMENTED_NON_BLOCKING__A_PLUS_B_SCOPE_LOCKED`

## 1. Regla

Academia debe alinearse al build realmente aprobado, pero no bloqueará CRM Ops Leads/Phase A salvo P0 demostrado.

No se actualizan cursos/manuales por PASS técnicos ni durante el inventario A+B.

## 2. Impacto Familia A

Después del Checkpoint Visual 1 se documentarán:

- acceso humano y Auth protegida;
- sesión y nueva pestaña;
- tenant, proyecto y periodo;
- fuente HR viva;
- roles, permisos y scopes;
- diferencia entre marca visual y llave técnica;
- estados canónicos;
- modo read-only;
- troubleshooting de build/caché.

## 3. Impacto Familia B

### Dashboard

- KPI y drilldown desde la misma fuente;
- comparativo histórico real;
- pending-source vs dato exacto;
- cero métricas fabricadas.

### CRM Ops Leads

- pipeline, leads, cuentas, contactos, actividades y ficha 360;
- modo conectado sin backend CRM;
- diferencia entre demo y fuente real;
- gates y trazabilidad.

### Clientes

- Cliente→Proyecto;
- contactos reales vs sin dato;
- no enseñar semillas como datos operativos.

### Comercial

- modelo por proyecto;
- honorario vs ingreso;
- regalías solo cuando apliquen;
- delegado/localBilling false para Cinépolis;
- propuestas y gates.

### Marketing

- calendario y estados;
- métricas solo con fuente;
- Gemini/Make no activos por defecto.

### Hojas de Ruta

- HR como autoridad;
- proyecto/periodo;
- lectura, importación y sincronización;
- acciones habilitadas vs gateadas.

## 4. Scope lock

Durante A+B no se modifica ni reestructura Academia por contenidos de:

- Shopper/Mi Perfil;
- Portal Cliente;
- reportes/exportaciones;
- Insights/benchmark;
- Finanzas completa;
- integraciones.

Estos impactos quedan diferidos a los checkpoints correspondientes.

## 5. Criterio futuro por módulo

- manual separado del curso;
- audiencia correcta;
- rutas y botones reales;
- fuente y estado de datos;
- checklist;
- errores frecuentes;
- troubleshooting;
- notificaciones;
- evidencia del build aprobado visualmente.

## 6. Estado actual

- no se modifica `app/modules/academia.js`;
- no se declara Academia cerrada;
- se preserva el contenido existente;
- cambios posteriores se basarán en la validación visual de cada checkpoint.

## 7. Clasificación

- **Reusable CXOrbia:** Academia vinculada a build/fuente real.
- **Exclusivo cliente:** reglas TyA/Cinépolis.
- **Claude/prototipo:** contenido y UX de cursos/manuales.
- **Academia:** impacto directo diferido.
- **Sin impacto Claude:** SHAs/manifests/gates.

## 8. Estado seguro

Sin cambios UI, deploy, proveedores, writes, merge o producción.
