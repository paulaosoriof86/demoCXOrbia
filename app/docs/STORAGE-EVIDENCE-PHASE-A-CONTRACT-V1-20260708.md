# Storage Evidence Phase A Contract v1

Fecha: 2026-07-08  
Bloque: Storage/evidencias/documentos sensibles/NDA  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Avanzar el backend real de Phase A definiendo como se manejaran evidencias, documentos de shopper, NDA, import HR, soportes de liquidaciones y assets de Academia sin activar Storage real todavia.

El bloque respeta la regla de oro: no toca modulos UI, no conecta frontend y no sube archivos reales.

## 2. Archivos creados

- `backend/contracts/storage-evidence-phase-a-v1.json`
- `backend/adapters/firebase-storage-evidence-adapter.preview.mjs`
- `tools/contracts/tya-storage-evidence-contract-validate.mjs`
- `app/docs/STORAGE-EVIDENCE-PHASE-A-CONTRACT-V1-20260708.md`

## 3. Alcance definido

Bucket scopes Phase A:

- visitEvidence;
- shopperDocuments;
- hrImports;
- liquidationSupports;
- academyAssets.

## 4. Politica de sensibilidad

Niveles definidos:

- publicProduct;
- internalRestricted;
- operationalRestricted;
- sensitiveRestricted;
- financialRestricted.

## 5. Datos prohibidos en repo

No deben subirse ni documentarse como payload real:

- rawDpi;
- rawPassport;
- rawBankAccount;
- signedNdaFile;
- privateStorageUrl;
- signedUrl;
- providerToken;
- serviceAccountJson;
- rawEvidenceBinary;
- base64Evidence.

## 6. Politica de filenames

Los archivos deben usar `documentId.safeExtension`.

No se permite nombre de shopper, DPI, banco, NDA firmado, telefono, correo, datos personales o identificadores sensibles en el nombre del archivo.

## 7. Adapter preview

`backend/adapters/firebase-storage-evidence-adapter.preview.mjs` queda como blueprint no conectado.

Bloquea por defecto:

- uploads;
- downloads;
- signed URLs;
- metadata writes.

Solo prepara rutas y contratos cuando en el futuro existan gates activos.

## 8. Gates

- devStorageConfig: pendiente.
- devUploads: bloqueado.
- stagingEvidenceImport: bloqueado.
- productionEvidenceCutover: bloqueado.

## 9. Impacto Phase A

Este bloque permite que la plataforma soporte operacion real controlada sin exponer documentos sensibles:

- evidencias de visita;
- soportes de cuestionario;
- NDA/documentos shopper;
- respaldos HR sanitizados;
- soportes de liquidacion/pagos;
- assets y adjuntos de Academia.

## 10. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron base de Storage/evidencias multi-tenant reusable.
- Exclusivo cliente: parcial. Phase A TyA prioriza HR, visitas, liquidaciones, NDA y Academia.
- Claude/prototipo: si. Claude debe mantener textos honestos: evidencia preparada/subida pendiente hasta gate real.
- Academia: si. `academyAssets` cubre cursos, manuales, bancos de preguntas y revision humana.
- Sin impacto Claude: no. Hay impacto de producto y copy honesto futuro.

## 11. Estado final del bloque

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin Storage real.
- Sin uploads reales.
- Sin downloads reales.
- Sin signed URLs reales.
- Sin documentos sensibles.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
