# ACADEMIA — IMPACTO DE LA RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA

**Fecha:** 2026-08-02  
**Estado:** `DOCUMENTED_NON_BLOCKING_PRIORITY_PHASE_A__FAMILIES_A_B_ACTIVE`

## 1. Regla

Academia debe quedar alineada con la versión realmente seleccionada de cada módulo, pero no bloqueará CRM Ops Leads/Phase A salvo P0 demostrado.

No se actualizan cursos o manuales a partir de PASS técnicos solamente. Deben corresponder al build visualmente aprobado por Paula.

## 2. Familia A — impacto documentado

Los contenidos futuros deben explicar una sola versión de:

- acceso humano y Auth protegida;
- sesión y nueva pestaña;
- tenant, proyecto y periodo;
- fuente HR viva;
- `CX.data` como interfaz estable;
- roles, permisos y scopes;
- diferencia entre marca visual y llave técnica;
- estados canónicos;
- modo read-only y acciones bloqueadas;
- troubleshooting de caché/build.

No deben enseñar:

- un segundo login técnico;
- `tenant-demo` como autoridad;
- Proyecto y Periodo mezclados;
- localStorage como permiso;
- un bridge DOM como flujo funcional oficial.

## 3. Familia B — impacto documentado

### Dashboard

- lectura de KPIs y drilldowns desde la misma fuente;
- diferencia entre dato exacto, pendiente de fuente y no disponible;
- comparativo histórico real;
- cero métricas fabricadas.

### CRM Ops Leads

- pipeline, leads, cuentas, contactos, actividades y ficha 360;
- estado vacío/pending-source cuando no exista backend CRM;
- diferencia entre modo demo y datos reales;
- gates de edición y trazabilidad.

### Clientes

- relación Cliente→Proyecto;
- contactos reales vs información no disponible;
- no enseñar prospectos o correos de fixture como datos operativos.

### Comercial

- calculadora por configuración de proyecto;
- honorario vs ingreso;
- regalías solo cuando apliquen;
- delegado/localBilling false para Cinépolis;
- propuestas y plantillas con gates.

### Marketing

- calendario y estados;
- métricas solo con fuente;
- Gemini/Make como integraciones futuras y gateadas, no activas por defecto.

### Hojas de Ruta

- HR como autoridad;
- proyecto/periodo;
- lectura, importación y sincronización;
- qué acciones están habilitadas y cuáles requieren gate.

## 4. Requisito por módulo seleccionado

- manual separado del curso;
- audiencia/rol correcto;
- ruta y botones reales;
- fuente y estado de datos;
- pasos concretos;
- checklist;
- errores frecuentes;
- troubleshooting;
- notificaciones relacionadas;
- evidencia del build visualmente aprobado.

## 5. Estado actual

- no se modifica todavía `app/modules/academia.js`;
- no se declara Academia acumulativa cerrada;
- se preserva el contenido existente;
- los cambios se aplicarán después de la validación visual de cada checkpoint;
- Academia no bloquea el ensamblaje A+B salvo P0 real.

## 6. Próximo impacto

Después del Checkpoint Visual 1 se compararán los cursos/manuales existentes contra:

- shell y acceso aprobado;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing.

## 7. Clasificación

- **Reusable CXOrbia:** Academia vinculada a build, fuente y contrato real.
- **Exclusivo cliente:** reglas TyA/Cinépolis.
- **Claude/prototipo:** contenido, interacción y UX de cursos/manuales.
- **Academia:** impacto directo.
- **Sin impacto Claude:** hashes, manifests y gates.

## 8. Estado seguro

Sin cambios UI, deploy, proveedores, writes, merge o producción.
