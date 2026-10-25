# TyA production gates matrix

Fecha: 2026-07-03

Archivo agregado:

- `tools/migration/tya-production-gates-matrix.mjs`

Objetivo:

- Separar gates de DEV preview, DEV import, staging y produccion.
- Evitar saltos directos desde preview a produccion.
- Mantener bloqueada cualquier escritura hasta autorizacion y validaciones.
- Documentar mejoras que Claude debe reflejar en UI.

Fases cubiertas:

1. DEV preview.
2. DEV import.
3. Staging.
4. Produccion.

Salidas locales:

- `tmp/tya-production-gates-matrix/tyaProductionGatesMatrix.md`
- `tmp/tya-production-gates-matrix/tyaProductionGatesMatrix.json`

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.

Gates clave:

- HR Source viva validada sin guardar URL completa.
- Contrato DEV bloqueado generado.
- Validador confirma que no hay escritura accidental.
- Resolucion de issues criticos de migracion.
- Politica PII shoppers.
- Cruce financiero de liquidaciones.
- Runner DEV de escritura separado y reversible.
- Rollback probado.
- Reglas Firestore/Auth/Storage validadas.
- Claude incorpora estados honestos en UI.
- Base nueva limpia confirmada.
- Deploy autorizado por Paula.
- Smoke final multi-tenant.

Mejoras para Claude:

- Mostrar estados honestos: preview, warning, bloqueado, pendiente backend e importacion no autorizada.
- No mostrar datos como importados si `canImport=false`.
- No guardar enlaces completos en el navegador.
- Mostrar referencias enmascaradas o `sourceRef` opaco.
