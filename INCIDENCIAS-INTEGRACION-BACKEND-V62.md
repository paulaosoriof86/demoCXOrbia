# INCIDENCIAS-INTEGRACION-BACKEND-V62.md

Fecha: 2026-07-01 13:30:03
Alcance: pendientes de backend/integracion que NO deben cargarse a Claude como P0 de prototipo.

## Pendientes backend confirmados

1. Reemplazar capa mock/localStorage por Firestore conservando interfaz CX.data.
2. Persistir importacion TyA real con validacion, deduplicacion, preview, errores por fila y escritura Firestore.
3. Implementar Make/WhatsApp/correo real desde backend o capa segura.
4. Mover API keys y llamadas IA a backend seguro.
5. Conectar HR real/piloto a Firestore.
6. Conectar acciones operativas a write path controlado y responsibilityLog.
7. Conectar Storage para evidencias.
8. Completar Auth/roles y reglas finas por tenant/projectId.
9. Ejecutar smoke integral DEV antes de cualquier preparacion productiva.
10. Mantener app/index-backend-dev.html y app/core/backend*.js como archivos ChatGPT/backend, fuera del ZIP de Claude.

## Siguiente gate backend

Preview backend V62 con servidor Node, badge Firestore DEV, Auth/tenant/projectId/conteos Firestore y validacion de que no se esta mostrando localStorage/demo como backend real.