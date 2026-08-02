# ACADEMIA — IMPACTO DE LA RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA

**Fecha:** 2026-08-02  
**Estado:** `DOCUMENTED_NON_BLOCKING_PRIORITY_PHASE_A`

## 1. Regla

Academia debe quedar alineada con la versión realmente seleccionada de cada módulo, pero no bloqueará la prioridad operativa CRM Ops Leads/Phase A salvo que exista un P0 demostrado.

## 2. Problema que se corrige

Cuando diferentes módulos provienen de candidatas o fixes distintos, cursos, manuales, rutas por rol y troubleshooting pueden describir botones, estados o flujos que ya no corresponden al runtime visible.

La reconstrucción por módulo permite vincular:

- versión funcional seleccionada;
- rol que la usa;
- ruta y pantalla real;
- reglas y estados vigentes;
- manual relacionado;
- curso/lección relacionada;
- errores frecuentes y solución;
- notificaciones asociadas.

## 3. Requisito por familia

### Familia A

Actualizar después de cerrar:

- acceso y sesión;
- entrada humana vs Auth técnica;
- selección de tenant/proyecto/periodo;
- fuente de datos;
- roles, permisos y navegación;
- troubleshooting de sesión, scopes y nueva pestaña.

### Familia B

Actualizar:

- CRM Ops Leads;
- Dashboard;
- hoja de ruta;
- lectura de indicadores;
- drilldowns;
- diferencia entre dato exacto, pendiente de fuente y métrica no disponible.

### Familia C

Actualizar:

- HR;
- histórico;
- visitas;
- postulaciones;
- reservas;
- shoppers;
- conflictos y revisión humana.

### Familia D

Actualizar:

- Mi Día;
- visitas disponibles;
- Mis Visitas;
- cuestionario;
- Beneficios;
- Certificaciones;
- rutas y acciones Shopper.

### Familia E

Actualizar:

- modelo financiero por proyecto;
- honorario vs ingreso;
- liquidación vs pago;
- revisión financiera;
- monedas y países;
- lotes y confirmaciones.

### Familia F

Actualizar:

- portales;
- reportes;
- alcance de filas;
- periodo y fuente;
- PDF/XLSX/PPTX;
- interpretación de gráficas.

### Familia G

Reconciliar el propio módulo Academia, manuales, cursos, certificaciones, administrabilidad, soporte e integraciones.

## 4. Criterio de cierre de Academia

Por cada módulo seleccionado debe existir:

- manual separado del curso;
- audiencia/rol correcto;
- pasos concretos;
- botones y rutas reales;
- estados y gates honestos;
- checklist;
- errores frecuentes;
- troubleshooting;
- impacto comercial o de valor cuando aplique;
- actualización de notificaciones y certificaciones relacionadas.

## 5. Estado actual

- No se modifica todavía `app/modules/academia.js`.
- No se declara Academia acumulativa cerrada.
- Se conserva todo el contenido existente hasta completar la matriz.
- Los cambios requeridos se documentarán por módulo y se aplicarán en la composición final o quedarán como tarea focalizada de Claude, según corresponda.

## 6. Clasificación

- **Reusable CXOrbia:** Academia vinculada a versión y contrato de cada módulo.
- **Exclusivo cliente:** reglas operativas TyA/Cinépolis.
- **Claude/prototipo:** contenido, interacción y UX de cursos/manuales.
- **Academia:** impacto directo.
- **Sin impacto Claude:** hashes y manifest de proveniencia.

## 7. Estado seguro

Sin cambios UI, deploy, proveedores, writes, merge o producción.
