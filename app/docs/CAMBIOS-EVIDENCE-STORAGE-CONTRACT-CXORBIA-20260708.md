# Cambios - Evidence storage contract CXOrbia

Fecha: 2026-07-08

## Archivos creados

- `tools/contracts/cxorbia-evidence-storage-contract.mjs`
- `app/docs/EVIDENCE-STORAGE-CONTRACT-CXORBIA-20260708.md`

## Motivo

Avanzar Phase A backend seguro con contrato preview-only para evidencias de campo y Storage futuro.

## Alcance

Backend contract + documentacion.

No se modifican:

- `app/core`;
- `app/modules`;
- runtime app;
- Firebase/Storage real;
- HR real;
- Make;
- Gemini;
- imports;
- secrets;
- datos reales;
- archivos reales.

## Impacto Claude

Claude debe incorporar en prototipo comercializable:

- estado de evidencia requerida/pendiente/revision/aceptada;
- copy honesto sin prometer carga real;
- formatos por proyecto;
- rechazo/reemplazo con razon;
- proteccion de datos sensibles;
- no URLs reales ni archivos reales en demo.

## Impacto Academia

Academia debe explicar tipos de evidencia, preview vs carga real, politica de retencion, errores frecuentes y manejo seguro de evidencia.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin Storage real, sin proveedores reales, sin HR writes, sin base real, sin imports reales, sin archivos reales y sin datos sensibles.
