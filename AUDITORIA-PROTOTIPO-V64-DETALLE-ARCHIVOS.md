# AUDITORIA-PROTOTIPO-V64-DETALLE-ARCHIVOS.md

Fecha: 2026-07-01
ZIP auditado: Prototype development request CXOrbia V64.zip

## Estructura

El ZIP contiene 85 archivos, todos bajo `app/`.

### Raiz app

- app/.gitignore
- app/README.md
- app/app.js
- app/index.html
- app/manifest.webmanifest
- app/sw.js

### Core

- app/core/automations.js
- app/core/cliente-data.js
- app/core/config.js
- app/core/costos.js
- app/core/data.js
- app/core/dedupe.js
- app/core/finanzas-core.js
- app/core/geo.js
- app/core/hr.js
- app/core/importador.js
- app/core/liquidacion.js
- app/core/manuales-data.js
- app/core/notif.js
- app/core/programa.js
- app/core/pwa.js
- app/core/router.js
- app/core/shoppers-store.js
- app/core/store.js
- app/core/topbar.js
- app/core/ui.js

### Modules

- app/modules/academia.js
- app/modules/automatizaciones.js
- app/modules/beneficios.js
- app/modules/cert.js
- app/modules/cliente-extra.js
- app/modules/cliente.js
- app/modules/clientes.js
- app/modules/comercial.js
- app/modules/configuracion.js
- app/modules/correo.js
- app/modules/crm.js
- app/modules/cuestionario-shopper.js
- app/modules/dashboard.js
- app/modules/documentos.js
- app/modules/finanzas.js
- app/modules/importador.js
- app/modules/integraciones.js
- app/modules/marca.js
- app/modules/marketing.js
- app/modules/midia.js
- app/modules/misvisitas.js
- app/modules/operacion-extra.js
- app/modules/postulaciones.js
- app/modules/proyecto-wizard.js
- app/modules/proyectos.js
- app/modules/reservas.js
- app/modules/rutas.js
- app/modules/shoppers.js
- app/modules/soporte.js
- app/modules/tablon.js
- app/modules/visita-detalle.js
- app/modules/visitas.js

### Styles

- app/styles/layout.css
- app/styles/theme.css

### Docs

- app/docs/ARCHITECTURE.md
- app/docs/AUDITORIA-Y-CONFIG-TENANT-V58.md
- app/docs/CAMBIOS-PROTOTIPO.md
- app/docs/CAPACITACION-TECNICA-INTERNA.md
- app/docs/CHECKLIST-VALIDACION-PROTOTIPO.md
- app/docs/DATA-MODEL.md
- app/docs/ECOSISTEMA.md
- app/docs/GUION-DEMO-Y-VENTAJAS.md
- app/docs/GUION-HEYGEN-POR-MODULO.md
- app/docs/HANDOFF-DESARROLLO.md
- app/docs/INSTRUCCIONES-FIJAS-PROYECTO.md
- app/docs/INSTRUCCIONES-MIGRACION-TYA.md
- app/docs/INTEGRACIONES.md
- app/docs/LOGICA-NEGOCIO.md
- app/docs/MIGRACION.md
- app/docs/MODULES.md
- app/docs/PENDIENTES-PROTOTIPO.md
- app/docs/PLAN-DE-TRABAJO.md
- app/docs/PROMPT-HEYGEN.md
- app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md
- app/docs/ROADMAP.md
- app/docs/SECURITY.md
- app/docs/SINCRONIA.md
- app/docs/migration/sample-fields.js

### Demo

- app/demo/index.html

## Validaciones tecnicas

- UTF-8: OK.
- Mojibake: no se detectaron patrones `Ã`, `Â`, `â€`, `�` ni caracteres de control sospechosos en archivos de texto auditados.
- JS: 55 archivos `.js` validaron OK con `node --check`.
- `app/index.html`: no carga `modules/rutas.js`.
- `modules/aprendizaje.js`: no existe en el ZIP.

## Backend protegido detectado en ZIP

El unico archivo protegido presente en el ZIP es:

- app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md

Dictamen: no sobrescribirlo.
