# CAMBIOS-BACKEND-MIGRACION-TYA.md

## 2026-06-30 — Preparación paquete de datos TyA

Motivo:

- Paula pidió avanzar más rápido y señaló que aún no se había solicitado la base buena de migración.
- Se prepara el paquete de datos requerido, pero la carga final seguirá bloqueada hasta cerrar el gate Auth + Firestore + tenant TyA visible en preview.

Archivos creados:

- `MIGRACION-TYA-PAQUETE-DATOS.md`
- `firebase/schema/migration-tya-package-v1.json`
- `firebase/client-write-tools/validate-migration-tya-package.mjs`
- `firebase/client-write-tools/migration-tya-manifest.example.json`

Qué queda preparado:

- Lista exacta de archivos esperados para migración.
- Campos mínimos por entidad.
- Validaciones previas.
- Manifest ejemplo.
- Validador local de manifest.

Impacto:

- No se cargaron datos reales.
- No se conectó base vieja.
- No se publicó Hosting.
- No se hizo merge.
- No se tocó producción.
- No se modificó `/app/modules`.

Siguiente gate:

1. Validar preview backend con Auth OK y fuente Firestore.
2. Confirmar tenant `tya` y conteos reales.
3. Recibir paquete limpio TyA.
4. Ejecutar dry-run de migración.
5. Solo después cargar en Firestore DEV por lotes.
