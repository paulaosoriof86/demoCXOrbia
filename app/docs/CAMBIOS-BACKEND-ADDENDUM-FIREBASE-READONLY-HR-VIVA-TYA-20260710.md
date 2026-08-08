# Cambios backend — Firebase read-only y HR viva source-safe TyA

Fecha: 2026-07-10

## Archivos y ejecuciones

- Se ejecutó la verificación Firebase DEV read-only autorizada.
- Resultado: `NONEMPTY_REVIEW_REQUIRED` por 17 usuarios Auth y una colección raíz Firestore con documento.
- No hubo writes, deletes, imports, deploy ni PII.
- Se ejecutó lectura HR viva multi-tab source-safe.
- Resultado corregido: 14 periodos, 28 tabs, 616 visitas, 213 shoppers protegidos, GT 476, HN 140.
- Se corrigió `tools/hr-source/tya-build-live-hr-source-safe-static.mjs` para exigir `ID CINEMA` y excluir filas resumen.
- Commit final: `47a7c539944bfd1f19c785183e9ae567eb28dcc9`.
- Se realizó auditoría semántica del runtime post-V96: el index no carga aún el payload/bridge y Certificaciones/Finanzas conservan datos demo operativos.

## Decisiones

- El Firebase `cxorbia-backend-dev` no se usará para Auth/Firestore Phase A porque no está limpio.
- No se borrarán automáticamente los recursos detectados.
- Se puede seguir con Hosting DEV como preview source-safe aislado, sin conectar los servicios backend no limpios.
- Antes de deploy visual se requiere binding focalizado por Claude en `CX.data`, Certificaciones y Finanzas/Liquidaciones.

## Seguridad

Sin cambios en `/app/modules` ni `/app/core` desde backend. Sin deploy, producción, imports, Firestore writes, HR writes, Make, Gemini o pagos reales.
