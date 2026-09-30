# Resumen futuro para Claude — post empalme incremental local

## No reabrir

- arquitectura modular, navegación y branding;
- proyectos/periodos, persistencia y scopes;
- permisos por ruta fail-closed;
- semántica IA `preferred/available/ready` y fallbacks locales;
- máquina base de modo de datos;
- permisos por acción como capa inicial;
- Academia profunda, estados y soft-delete;
- PWA network-first y caché solo de respuestas exitosas;
- correcciones incrementales post-V99;
- adapter TyA source-safe, IDs únicos por periodo y normalización de fechas: backend-only.

## Pendientes netos del prototipo

1. Punto 57: unificar en el prototipo genérico `CX.dataSource` con `CX_BACKEND_DEV`/`cx_imported` en `core/router.js`. El adapter TyA ya alinea valores, pero la duplicidad de UI/código permanece.
2. Aislar fixtures demo por modo en Certificaciones, Finanzas, Correo, Soporte, dashboards y portales.
3. Retirar el input de webhook por automatización y no fabricar referencias locales como conexión real.
4. Integraciones: solo un `connectionRef` backend puede marcar `configured:true`.
5. Permisos por acción tenant-aware, project-aware y scope-aware.
6. Crear interfaz real de administración de permisos o corregir el copy que afirma que existe.
7. Academia: `auditRef` por evento; separar `contentVersion` del workflow; gates completos para crear/editar/revisar/aprobar/publicar/restaurar lección.
8. Certificación heurística: siempre borrador/revisión; nunca publicación real o disponibilidad para shoppers sin confirmación.
9. Corregir manuales residuales sobre API keys, webhooks, `firebaseConfig` y secretos locales.
10. Derivar el copy de estados estructurados: `prepared`, `pending_backend`, `pending_source`, `pending_gate`, `pending_review`, `blocked`, `confirmed`, `failed`.
11. Derivar `BUILD_ID` del source lock.
12. Ejecutar smoke visual reproducible por perfiles y viewports con artefactos.

## Backend-only — no tocar desde Claude

- snapshot/adapter TyA;
- Firebase nuevo y vacío;
- Auth/claims/reglas/Storage/Functions;
- import y writeback reales;
- Make/Gemini/correo/pagos reales;
- workflows, gates y herramientas de migración.