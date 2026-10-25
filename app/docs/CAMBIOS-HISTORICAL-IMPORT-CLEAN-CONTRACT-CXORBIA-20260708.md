# Cambios - Historical import clean contract CXOrbia

Fecha: 2026-07-08

## Archivos creados

- `tools/contracts/cxorbia-historical-import-clean-contract.mjs`
- `app/docs/HISTORICAL-IMPORT-CLEAN-CONTRACT-CXORBIA-20260708.md`

## Motivo

Avanzar Phase A backend seguro con contrato preview-only para manifiesto de import historico limpio.

## Alcance

Backend contract + documentacion.

No se modifican:

- `app/core`;
- `app/modules`;
- runtime app;
- Firebase real;
- HR real;
- Make;
- Gemini;
- imports reales;
- secrets;
- datos reales;
- base vieja.

## Impacto Claude

Claude debe incorporar en prototipo comercializable:

- estado de import preview;
- conteos limpios/rechazados/conflictos;
- sourceType visible;
- cola de revision humana;
- copy honesto sin decir importado si no existe import real;
- explicacion de por que no se copia base vieja.

## Impacto Academia

Academia debe explicar export limpio, import preview, import real, llaves estables, datos sensibles excluidos y revision humana de conflictos.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin base real, sin HR writes, sin import real, sin conexion a base vieja y sin datos sensibles.
