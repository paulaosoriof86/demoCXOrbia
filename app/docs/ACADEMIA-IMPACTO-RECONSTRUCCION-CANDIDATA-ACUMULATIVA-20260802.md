# ACADEMIA — IMPACTO DE LA RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA

**Fecha:** 2026-08-02  
**Estado:** `DOCUMENTED_NON_BLOCKING__A_PLUS_B_SOURCE_ASSEMBLED__VISUAL_PENDING`

## 1. Regla

Academia se alinea al build realmente aprobado por Paula. El unit/source precheck no autoriza actualizar cursos ni presentar A+B como aprobado visualmente.

Academia no bloquea CRM Ops Leads/Phase A salvo P0 demostrado.

## 2. Estado A+B que debe preservarse

La composición ya:

- mantiene módulos frontend sin reescritura;
- preserva HR viva y la interfaz `CX.data`;
- oculta fixtures CRM/Marketing en conectado;
- retira prospectos/contactos placeholder;
- preserva registros creados por usuario con proveniencia;
- mantiene `tya/cinepolis`, proyecto/periodo y modelo delegado.

Fuentes:

- `MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`;
- `EVIDENCE-A-B-CUMULATIVE-SOURCE-PRECHECK-20260802.json`;
- `CAMBIOS-BACKEND-ADDENDUM-A-B-COMPOSICION-MANIFEST-GATES-20260802.md`.

## 3. Impacto futuro después del Checkpoint Visual 1

### Familia A

Actualizar manuales/troubleshooting de:

- entrada humana autenticada;
- sesión y nueva pestaña;
- tenant, proyecto y periodo;
- fuente HR viva;
- roles, permisos y scopes;
- estados canónicos;
- modo read-only;
- caché/build exacto.

### Dashboard

- KPI, fase, comparativo y drilldown desde la misma fuente;
- histórico real;
- pending-source vs dato exacto;
- cero métricas fabricadas.

### CRM Ops Leads

- pipeline, leads, cuentas, contactos, actividades, ficha 360, metas y reportes;
- modo conectado sin backend CRM;
- estado vacío/pending-source;
- alta local con proveniencia `platform_user`;
- diferencia entre demo y fuente real.

### Clientes

- Cliente→Proyecto por IDs;
- datos reales vs sin dato;
- no enseñar prospectos/contactos placeholder como operación.

### Comercial

- herramienta de planificación vs contrato operativo;
- modelo financiero por proyecto;
- honorario vs ingreso;
- delegado/localBilling false/regalía 0;
- propuestas e integraciones gateadas.

### Marketing

- calendario y estados;
- métricas solo con fuente;
- periodo activo;
- registros con proveniencia;
- Gemini/Make no activos por defecto.

### Hojas de Ruta

- HR como autoridad;
- proyecto/periodo;
- lectura vs importación/sincronización;
- acciones habilitadas vs gateadas.

## 4. Scope lock

Durante A+B no se modifica `app/modules/academia.js` ni se reestructura contenido de:

- Operación/Shopper;
- Portal Cliente/reportes/Insights;
- Finanzas completa;
- integraciones.

Estos impactos quedan para sus checkpoints.

## 5. Criterio de actualización

Por módulo, después de aprobación visual:

- build/manifest exacto;
- audiencia correcta;
- ruta y botones reales;
- fuente/estado de datos;
- pasos y checklist;
- errores frecuentes;
- troubleshooting;
- notificaciones relacionadas;
- manual separado del curso.

## 6. Estado actual

- `app/modules/academia.js`: sin cambios;
- contenido existente: preservado;
- Checkpoint Visual 1: pendiente;
- actualización de Academia: diferida hasta aprobación visual.

## 7. Clasificación

- **Reusable CXOrbia:** contenidos vinculados a fuente, provenance y build.
- **Exclusivo cliente:** TyA/Cinépolis y reglas HR/financieras.
- **Claude/prototipo:** UX y contenido de cursos/manuales después del PASS visual.
- **Academia:** impacto documentado, no aplicado todavía.
- **Sin impacto Claude:** manifest, gates, blobs y evidence.

## 8. Estado seguro

Sin cambios UI, deploy, proveedores, writes, merge o producción.
