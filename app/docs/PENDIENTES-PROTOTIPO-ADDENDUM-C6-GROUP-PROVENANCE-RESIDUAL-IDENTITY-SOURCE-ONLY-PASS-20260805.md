# PENDIENTES PROTOTIPO — C6 group provenance source-only PASS

## Pendientes reales

1. Integrar el vector de procedencia por miembro en una futura lectura provider autorizada para el grupo `ebbcc231fcf415cbaf77`.
2. Construir referencia y planner con el mismo universo de actividad, completitud y linking.
3. Obtener evidencia autorizada de apellido para 12 perfiles.
4. Generar fingerprints estables de los dos candidatos multi-Auth y realizar adjudicación explícita sin seleccionar automáticamente.

## Evidencia mínima de apellido

Aceptable únicamente:

- apellido explícito ligado por shopperId exacto o ancla técnica fuerte;
- credential login exacto y mapeado;
- dos fuentes independientes de nombre completo que coincidan;
- adjudicación tenant registrada contra fingerprint source-safe.

No aceptar inferencia por posición ni deduplicación por nombre.

## Multi-Auth

Debe existir un discriminador único: claims exactos, ancla de credencial/correo, compatibilidad de contraseña o adjudicación explícita contra candidate fingerprint.

Quedan prohibidos creationTime, orden, first returned, enabled o emailVerified como criterio único.

## No autorizado

Nueva lectura provider, Auth repair, aplicación parcial del plan 340, writes, deploy, Make, Gemini, pagos, merge o producción.
