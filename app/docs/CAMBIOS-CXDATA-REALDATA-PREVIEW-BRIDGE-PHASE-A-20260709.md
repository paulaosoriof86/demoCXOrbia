# Cambios - CX.data real-data preview bridge Phase A

Fecha: 2026-07-09  
Bloque: puente source-safe real-data preview -> CX.data  
Estado: documentado y seguro.

## Archivos creados

1. `backend/contracts/cxdata-realdata-preview-bridge-phase-a-v1.json`
   - Contrato del puente entre staging/manifest source-safe y forma compatible con `CX.data`.
   - Define proyectos, visitas, shoppers, certificaciones y liquidaciones.
   - Mantiene Cinépolis como proyecto normal configurable.

2. `backend/adapters/cxdata-realdata-preview-bridge.preview.mjs`
   - Adapter preview no conectado.
   - Construye forma compatible con `CX.data` desde manifest/source-safe inputs.
   - Bloquea claves sensibles.
   - No puede patch runtime ni escribir.

3. `tools/contracts/tya-cxdata-realdata-preview-bridge-validate.mjs`
   - Validador seguro.
   - Confirma que el bridge no esta conectado a frontend.
   - Detecta que `app/core/data.js` sigue demo/generico como warning.

4. `app/docs/CXDATA-REALDATA-PREVIEW-BRIDGE-PHASE-A-20260709.md`
   - Documentacion funcional del bloque.

5. `app/docs/CAMBIOS-CXDATA-REALDATA-PREVIEW-BRIDGE-PHASE-A-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Define el paso entre datos reales/sanitizados y visualizacion futura en plataforma, sin tocar modulos UI.

Este bloque no pone datos reales en pantalla todavia, pero deja preparado el unico puente que debe reemplazar la data demo cuando existan gates, input sanitizado y rollback.

## Trabajo previo recuperado

- HR viva Google Sheets.
- Staging canonico HR source-safe.
- Proyecto Cinépolis normal configurable.
- Reglas HR/Q1/Q2.
- Certificaciones preservadas.
- Liquidaciones junio.
- Legacy util como trazabilidad, no arquitectura.

## Claude/prototipo

Pendientes derivados:

- UI debe mostrar fuente HR configurable.
- UI debe distinguir demo, real-data preview, staging, importado y produccion.
- Cinépolis no debe hardcodearse.
- Copy honesto: bridge creado no significa datos reales visibles.
- Academia debe explicar manifest/preview/staging/produccion.

## Bloqueos

- Runtime no conectado.
- Demo data sigue en `app/core/data.js` hasta gate.
- Falta input sanitizado de filas/visitas para poblar visitas reales.
- Falta resolver issues: DPI, questionnaire_marks duplicado, shopper canonical mismatch, JUNIO 26 HN, liquidaciones con Excel externo.

## Siguiente bloque recomendado

Crear plan/validador para `runtime switch gate`: cuando exista input sanitizado, permitir conectar el bridge en un unico punto, con rollback y smoke, sin tocar modulos UI.

## Estado seguro

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
