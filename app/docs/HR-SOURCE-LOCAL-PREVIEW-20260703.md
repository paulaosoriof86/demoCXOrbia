# HR Source local preview

Fecha: 2026-07-03

Archivos agregados:

- `tools/dev/cxorbia-static-preview-server.mjs`
- `tools/hr-source/run-tya-hr-source-open-preview.ps1`

Objetivo:

- Servir el preview backend local por HTTP.
- Levantar el endpoint HR Source DEV local.
- Abrir el preview backend con HR Source local activo.
- Evitar pasos manuales separados.

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Sin credenciales en repo.

Cierre de prueba:

- Cerrar las ventanas PowerShell abiertas por el runner.
