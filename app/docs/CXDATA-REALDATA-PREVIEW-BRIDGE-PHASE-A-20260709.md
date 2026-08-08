# CX.data real-data preview bridge Phase A

Fecha: 2026-07-09  
Bloque: puente source-safe real-data preview -> CX.data  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Acercar la plataforma a produccion real Phase A conectando conceptualmente el manifest/staging source-safe de TyA/Cinepolis con la forma que hoy consume `CX.data`, sin tocar modulos UI y sin reemplazar runtime todavia.

Este bloque existe porque `app/core/data.js` todavia se declara como mock generico/demo. El puente define el unico punto futuro para que los datos reales/sanitizados puedan alimentar la plataforma sin reescribir cada modulo.

## 2. Archivos creados

- `backend/contracts/cxdata-realdata-preview-bridge-phase-a-v1.json`
- `backend/adapters/cxdata-realdata-preview-bridge.preview.mjs`
- `tools/contracts/tya-cxdata-realdata-preview-bridge-validate.mjs`
- `app/docs/CXDATA-REALDATA-PREVIEW-BRIDGE-PHASE-A-20260709.md`

## 3. Que hace el contrato

Define como traducir fuentes reales/sanitizadas a la forma actual de `CX.data`:

- projects;
- visits;
- shoppers;
- certifications;
- liquidations.

Sin cambiar la interfaz que usan los modulos.

## 4. Que hace el adapter preview

`backend/adapters/cxdata-realdata-preview-bridge.preview.mjs` puede construir una estructura compatible con `CX.data` desde:

- manifest HR source-safe;
- visitas sanitizadas opcionales;
- shoppers sanitizados opcionales;
- certificaciones preservadas opcionales;
- liquidaciones candidatas opcionales.

Queda bloqueado por defecto y no se importa desde `app/index.html`.

## 5. Protecciones

El adapter bloquea claves sensibles como:

- rawHrWorkbook;
- rawCsv;
- rawDpi;
- rawBankAccount;
- rawPhone;
- rawEmail;
- signedNdaFile;
- privateHrUrl;
- spreadsheetFileId;
- serviceAccountJson;
- rawShopperName;
- rawEvidence.

## 6. Cinépolis como proyecto normal

El bridge crea la representacion `Cinepolis` como proyecto normal configurable:

- tenant TyA;
- projectId cinepolis;
- HR privada Google Sheets;
- cuestionario configurable;
- pagos/liquidaciones segun submitido y cruce financiero externo;
- sin hardcode global.

## 7. Estado frente al runtime actual

Este bloque no modifica `app/core/data.js`.

Motivo: la regla de oro exige no tocar el punto runtime hasta tener gate explicito, input sanitizado y rollback.

El estado correcto despues de este bloque es:

- puente creado;
- runtime aun no conectado;
- produccion bloqueada hasta reemplazar demo por real-data preview/staging validado.

## 8. Gates

- devManifestOnly: permitido.
- devPreviewReadOnly: bloqueado hasta input sanitizado.
- devRuntimeBridge: bloqueado hasta GO, single connection point, smoke y rollback.
- productionCutover: bloqueado hasta realDataProven, URL verificada, smokeGO y no demo final source.

## 9. Impacto Phase A

Avanza directamente produccion real porque define el paso que faltaba entre:

HR real/sanitizada -> staging source-safe -> forma compatible con CX.data -> visualizacion futura en plataforma.

No resuelve aun la visualizacion, pero deja el puente preparado y validable.

## 10. Trabajo previo recuperado

Recupera:

- HR viva Google Sheets;
- manifest source-safe;
- Cinépolis como proyecto normal;
- periodos/paises/tabs;
- reglas HR/Q1/Q2;
- certificaciones preservadas;
- liquidaciones junio;
- legacy util solo como trazabilidad, no como base a copiar.

## 11. Claude/prototipo

Pendientes derivados:

- UI debe mostrar fuente de HR configurable por proyecto.
- UI debe diferenciar demo vs real-data preview vs staging/importado.
- Cinépolis no debe estar hardcodeado.
- Si el bridge no esta conectado, no se debe decir que los datos reales estan visibles.
- Academia debe explicar la diferencia entre manifest, preview, staging y produccion.

## 12. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin runtime patch.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
