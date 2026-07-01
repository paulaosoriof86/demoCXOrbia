# CXOrbia - Auditoria Prototipo V60

Fecha: 2026-07-01 04:43:49
ZIP: $zipPath

## Resultado de auditoria

- Archivos en app: 86
- Archivos texto auditados: 85
- ZIP contiene pp/index-backend-dev.html: False
- Hits Python/http.server: 0
- Hits caracteres sospechosos UTF-8: 1
- Hits Banca: 13
- Hits Restaurantes: 10
- Hits localStorage: 28
- Hits terminos tecnicos visibles potenciales: 59

## Dictamen

V60 queda aplicada como prototipo mas reciente, preservando backend protegido.

No se considera que todos los pendientes esten cerrados. Persisten hallazgos que Claude debe revisar y corregir o aislar.

## Archivos con caracteres sospechosos

- modules\aprendizaje.js

## Archivos con Banca

- core\config.js
- core\data.js
- core\manuales-data.js
- core\shoppers-store.js
- demo\index.html
- docs\AUDITORIA-Y-CONFIG-TENANT-V58.md
- docs\PLAN-DE-TRABAJO.md
- modules\academia.js
- modules\configuracion.js
- modules\crm.js
- modules\integraciones.js
- modules\proyecto-wizard.js
- modules\proyectos.js

## Archivos con Restaurantes

- core\config.js
- core\data.js
- demo\index.html
- docs\AUDITORIA-Y-CONFIG-TENANT-V58.md
- docs\PLAN-DE-TRABAJO.md
- modules\academia.js
- modules\configuracion.js
- modules\crm.js
- modules\proyecto-wizard.js
- modules\proyectos.js

## Archivos con localStorage

- app.js
- core\automations.js
- core\cliente-data.js
- core\config.js
- core\manuales-data.js
- core\programa.js
- core\pwa.js
- core\router.js
- core\shoppers-store.js
- core\store.js
- core\topbar.js
- demo\index.html
- docs\ARCHITECTURE.md
- docs\CAMBIOS-PROTOTIPO.md
- docs\HANDOFF-DESARROLLO.md
- docs\INSTRUCCIONES-FIJAS-PROYECTO.md
- docs\RESUMEN-PARA-CHATGPT-BACKEND.md
- modules\academia.js
- modules\cert.js
- modules\clientes.js
- modules\comercial.js
- modules\configuracion.js
- modules\correo.js
- modules\crm.js
- modules\integraciones.js
- modules\marca.js
- modules\operacion-extra.js
- modules\reservas.js

## Restricciones respetadas

- No se toco produccion.
- No se publico Hosting.
- No se toco Orbit.
- No se cargaron datos reales.
- Se preservo backend protegido.