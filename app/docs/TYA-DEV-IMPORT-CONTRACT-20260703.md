# TyA DEV import contract

Fecha: 2026-07-03

Archivo agregado:

- `tools/migration/tya-dev-import-contract.mjs`

Objetivo:

- Convertir el staging preview en un contrato formal de importacion DEV.
- Definir colecciones destino propuestas.
- Definir gates obligatorios antes de cualquier escritura futura.
- Mantener el contrato en modo plan bloqueado.

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canWriteToFirestore: false.
- executeAllowed: false.

Salidas locales:

- `tmp/tya-dev-import-contract/tyaDevImportContract.md`
- `tmp/tya-dev-import-contract/tyaDevImportContract.json`

Gates antes de cualquier escritura futura:

- preview limpio sin criticos.
- politica PII shoppers.
- resolucion duplicados cuestionario.
- resolucion o exclusion encoding RTDB.
- resolucion destinatarios notificaciones.
- revision fila adicional JUNIO 26 HN.
- cruce financiero liquidaciones.
- rollback revisado.
- runner DEV de escritura creado por separado.

Estado actual esperado:

- blocked o review_required.
- Nunca ejecuta escritura.
