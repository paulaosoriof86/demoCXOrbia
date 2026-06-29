# ESTADO-AUDITORIA-PROTOTIPO-V52-20260629

## Respuesta corta

No está completa la revisión de todas las lógicas, flujos y sincronizaciones del prototipo V52.

Sí se revisaron los flujos críticos para la migración backend inicial:

- HR;
- importador;
- deduplicación asociada al importador/HR;
- liquidación derivada de visitas;
- beneficios shopper;
- creación de proyectos;
- persistencia básica del adapter Firebase;
- reglas Firestore actuales.

## Archivos revisados directamente

- `app/core/hr.js`
- `app/core/importador.js`
- `app/core/liquidacion.js`
- `app/core/data.js`
- `app/modules/proyecto-wizard.js`
- `app/modules/beneficios.js`
- `app/core/backend-firebase.js`
- `firestore.rules`
- `MAPEO-FINSTORE-FIRESTORE.md`

## Alcance aún pendiente

Falta revisar de forma completa el resto del prototipo:

### Core pendiente

- `app/core/automations.js`
- `app/core/cliente-data.js`
- `app/core/config.js`
- `app/core/costos.js`
- `app/core/dedupe.js`
- `app/core/finanzas-core.js`
- `app/core/notif.js`
- `app/core/programa.js`
- `app/core/pwa.js`
- `app/core/router.js`
- `app/core/shoppers-store.js`
- `app/core/store.js`
- `app/core/topbar.js`
- `app/core/ui.js`

### Modules pendiente

- academia;
- aprendizaje;
- automatizaciones;
- certificaciones;
- clientes;
- comercial;
- configuración;
- correo;
- CRM;
- cuestionario shopper;
- dashboard;
- documentos;
- finanzas;
- importador módulo;
- integraciones;
- marca;
- marketing;
- midia;
- mis visitas;
- operación extra;
- postulaciones;
- proyectos;
- reservas;
- rutas;
- shoppers;
- soporte;
- tablón;
- visita detalle;
- visitas.

## Prioridad de revisión siguiente

1. `app/core/dedupe.js` porque sostiene HR, importador y normalización.
2. `app/core/finanzas-core.js` y `app/modules/finanzas.js` porque conectan movimientos, pagos y conciliación.
3. `app/modules/misvisitas.js`, `app/modules/visitas.js`, `app/modules/visita-detalle.js`, `app/modules/postulaciones.js` porque contienen flujo shopper/operación.
4. `app/modules/configuracion.js` y `app/modules/proyectos.js` porque deben absorber configuración por proyecto.
5. `app/core/automations.js`, `app/modules/automatizaciones.js`, `app/modules/integraciones.js` porque sostienen Make, Sheets/Excel y notificaciones.
6. Documentación interna `app/docs/*` para cruzar lógica pretendida vs código real.

## Restricciones conservadas

- No se modificó `/app/modules`.
- No se modificó `/app/core`.
- No se escribió Firestore.
- No se importó Excel/Sheets.
- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
