# Impacto Academia — Firebase read-only y HR viva source-safe TyA

Fecha: 2026-07-10

## Contenido obligatorio

Academia debe explicar por rol:

- diferencia entre HR viva source-safe, preview, importado, conectado y producción;
- que `source-safe` protege PII y no equivale a Auth/Firestore activo;
- cómo interpretar un entorno Firebase `NONEMPTY_REVIEW_REQUIRED`;
- por qué un estado inconcluso nunca se declara limpio;
- política de no borrar ni sobrescribir recursos detectados sin revisión;
- 14 periodos y GT/HN como configuración de proyecto, no hardcode global;
- ausencia histórica de `Disponible desde` como dato no disponible, sin inventarlo;
- certificación carryover: no repetir lo ya aprobado y usar revisión humana ante ambigüedad;
- liquidación/pago como control administrativo; lote preparado no es pago ejecutado;
- indicadores visibles `no importado`, `backend no conectado` y `provider bloqueado`.

## Rutas por rol

- Admin/Coordinación: validar fuente, conteos, conflictos y warnings.
- Shopper: distinguir certificación aceptada, pendiente o en revisión; ver visitas source-safe sin PII de terceros.
- Cliente: visualizar resultados por proyecto/periodo sin acceso a datos protegidos.
- Aliado/Franquiciado: comprender scope país/proyecto y límites del entorno preview.
- Superadmin: resolver clean-state, gates y revisión de recursos antes de activar backend.

## Elementos interactivos pendientes

- checklist de validación del snapshot;
- glosario source-safe/importado/conectado;
- caso práctico de fila resumen descartada por falta de ID Cinema;
- guía de respuesta ante `NONEMPTY_REVIEW_REQUIRED`;
- notificación de cambio de fuente o versión del snapshot.
