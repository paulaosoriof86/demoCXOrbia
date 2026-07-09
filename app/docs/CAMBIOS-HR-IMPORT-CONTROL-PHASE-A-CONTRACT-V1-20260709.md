# Cambios - HR Import Control Phase A Contract v1

Fecha: 2026-07-09  
Bloque: HR import/control historico Phase A  
Estado: documentado y seguro.

## Archivos creados

1. `backend/contracts/hr-import-control-phase-a-v1.json`
   - Contrato de HR source, import runs, staging sanitizado, mapas source y conflictos.
   - Protege reglas Phase A: HR fuente, shoppers historicos, certificaciones ya presentadas, junio pagos y multiproyecto.

2. `backend/adapters/hr-import-control-adapter.preview.mjs`
   - Adapter preview no conectado.
   - Prepara import runs, filas sanitizadas y conflictos.
   - No conecta base vieja, no escribe Firestore y no guarda payload HR crudo.

3. `tools/contracts/tya-hr-import-control-contract-validate.mjs`
   - Validador seguro.
   - No llama base vieja, no escribe datos, no conecta frontend.

4. `app/docs/HR-IMPORT-CONTROL-PHASE-A-CONTRACT-V1-20260709.md`
   - Documentacion funcional del bloque.

5. `app/docs/CAMBIOS-HR-IMPORT-CONTROL-PHASE-A-CONTRACT-V1-20260709.md`
   - Bitacora puntual.

## Impacto

Avanza Phase A en import historico y control HR sin copiar base vieja, sin datos crudos y sin import real.

## Pendiente Claude/prototipo acumulado

- UI debe diferenciar dry-run, staging sanitizado y promocion revisada.
- No prometer import real si solo existe preview.
- Mostrar conflictos cuando no haya llaves estables.
- Conservar certificaciones ya presentadas.
- No tratar junio como visitas pendientes si corresponde a pagos/liquidaciones.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin base vieja conectada.
- Sin import real.
- Sin staging write real.
- Sin HR writes.
- Sin datos sensibles.
- Sin Firestore/Auth/Storage real.
- Sin Make/Gemini real.
