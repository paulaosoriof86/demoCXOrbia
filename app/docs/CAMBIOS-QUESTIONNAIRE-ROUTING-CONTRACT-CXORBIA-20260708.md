# Cambios - Questionnaire routing contract CXOrbia

Fecha: 2026-07-08

## Archivos creados

- `tools/contracts/cxorbia-questionnaire-routing-contract.mjs`
- `app/docs/QUESTIONNAIRE-ROUTING-CONTRACT-CXORBIA-20260708.md`

## Motivo

Avanzar Phase A backend seguro con un contrato preview-only para ruteo configurable de cuestionarios por tenant, proyecto y visita.

## Alcance

Backend contract + documentacion.

No se modifican:

- `app/core`;
- `app/modules`;
- runtime app;
- Firebase;
- Make;
- Gemini;
- imports;
- secrets;
- datos reales.

## Impacto Claude

Claude debe incorporar en prototipo comercializable:

- configuracion de cuestionario por proyecto;
- override por visita;
- badges de fuente;
- estados pendiente gate/revision;
- copy honesto para cuestionario preparado/completado/submitido.

## Impacto Academia

Academia debe explicar rutas de cuestionario, default por proyecto, override por visita y diferencia entre completado/submitted/sync.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin proveedores reales, sin base real, sin imports reales y sin datos sensibles.
