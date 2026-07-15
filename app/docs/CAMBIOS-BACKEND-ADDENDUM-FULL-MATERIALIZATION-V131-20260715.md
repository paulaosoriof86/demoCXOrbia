# CAMBIOS BACKEND — MATERIALIZACIÓN COMPLETA V131

Fecha: 2026-07-15

- Se amplía el workflow de materialización para procesar la fuente canónica completa TyA, además de conservar el fixture de regresión.
- Entradas: HR histórica source-safe, control financiero source-safe y carryover de certificaciones source-safe.
- Salida: plan Firestore completo y verificación reproducible como artefacto de GitHub Actions.
- No se modifica frontend, `CX.data`, módulos, runtime V131 ni proveedores.

## Clasificación

- Reusable CXOrbia: patrón de materialización completa source-safe y fail-closed.
- Exclusivo cliente: conteos y fuentes TyA/Cinépolis.
- Claude/prototipo: sin impacto.
- Academia: registrar que la materialización sigue siendo dry-run y requiere revisión humana antes de cualquier write.
- Sin impacto Claude: cambio de backend/CI.

Sin writes, deploy, producción, Make, Gemini ni pagos.
