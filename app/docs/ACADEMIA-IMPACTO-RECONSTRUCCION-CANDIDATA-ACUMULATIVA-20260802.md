# ACADEMIA — IMPACTO DE LA RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA

**Fecha:** 2026-08-02  
**Estado:** `DOCUMENTED_NON_BLOCKING__A_PLUS_B_VISIBLE_IN_DEV__VISUAL_APPROVAL_PENDING`

## 1. Regla

Academia debe reflejar únicamente el build aprobado visualmente por Paula. La publicación en DEV y los PASS técnicos no autorizan todavía a cambiar cursos, manuales ni `app/modules/academia.js`.

Academia no bloquea CRM Ops Leads/Phase A salvo P0 demostrado.

## 2. Build de referencia para revisión

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Estado:

- candidata única y acumulativa visible;
- un deploy DEV;
- paridad remota confirmada;
- revisión visual pendiente;
- producción no activada.

## 3. Contenido que deberá actualizarse después del PASS visual

### Acceso y contexto

- login humano único;
- tenant, proyecto y periodo;
- fuente HR viva;
- roles y navegación;
- sesión, recarga y nueva pestaña;
- lectura vs acciones bloqueadas.

### Dashboard

- tiles, fases, comparativos y drilldowns;
- misma fuente y semántica;
- histórico real;
- cero métricas fabricadas.

### CRM Ops Leads

- pipeline, leads, cuentas, contactos, actividades y ficha 360;
- estado vacío/pending-source sin backend CRM;
- altas con proveniencia `platform_user`;
- diferencia entre fixture y dato operativo.

### Clientes

- Cliente→Proyecto por IDs;
- ausencia de prospectos/contactos placeholder;
- tratamiento honesto de campos sin fuente.

### Comercial

- planificación/propuesta vs valor contractual;
- modelo financiero por proyecto;
- Cinépolis delegado, localBilling false y regalía 0;
- integraciones gateadas.

### Marketing

- periodo activo;
- contenido y métricas solo con fuente;
- Make/Gemini inactivos por defecto.

### Hojas de Ruta

- HR como autoridad;
- proyecto/periodo;
- acciones habilitadas vs bloqueadas.

## 4. Incidencia del gate semántico

El último cierre STOP_RETRY fue provocado por una inconsistencia del gate entre `financiero` y `finanzas`, no por una decisión pedagógica ni por un cambio en Academia.

El root fix QA no altera rutas, cursos, manuales o contenidos de usuarios.

## 5. Scope diferido

No actualizar todavía contenido de:

- Operación/Shopper;
- certificaciones;
- Finanzas completa;
- Portal Cliente/reportes/Insights;
- integraciones.

## 6. Criterio de actualización

Después del PASS visual, cada curso/manual debe contener:

- build exacto;
- audiencia y rol;
- rutas/botones reales;
- fuente y estado del dato;
- checklist;
- errores frecuentes;
- troubleshooting;
- notificaciones relacionadas;
- evidencia visual aprobada.

## 7. Estado actual

- `app/modules/academia.js`: sin cambios;
- Academia: preservada;
- impacto: documentado;
- actualización: pendiente del Checkpoint Visual 1.

## 8. Clasificación

- **Reusable CXOrbia:** formación vinculada al build real.
- **Exclusivo cliente:** TyA/Cinépolis y HR.
- **Claude/prototipo:** actualización de contenido posterior al PASS visual.
- **Academia:** impacto directo, todavía no aplicado.
- **Sin impacto Claude:** QA, hashes y evidencia.
