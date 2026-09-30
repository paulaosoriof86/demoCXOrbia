# Cambios - Visit lifecycle contract CXOrbia

Fecha: 2026-07-08

## Archivos creados

- `tools/contracts/cxorbia-visit-lifecycle-contract.mjs`
- `app/docs/VISIT-LIFECYCLE-CONTRACT-CXORBIA-20260708.md`

## Motivo

Avanzar Phase A backend seguro con contrato preview-only para ciclo de vida de visita.

## Alcance

Backend contract + documentacion.

No se modifican:

- `app/core`;
- `app/modules`;
- runtime app;
- Firebase;
- HR real;
- Make;
- Gemini;
- imports;
- secrets;
- datos reales.

## Impacto Claude

Claude debe incorporar en prototipo comercializable:

- estados de visita sin prometer sync real;
- reservas/agendamiento/reprogramacion/cancelacion;
- franja/quincena configurables;
- diferencia entre realizada, cuestionario completado y submitido;
- copy honesto sin usar enviado cuando no aplica.

## Impacto Academia

Academia debe explicar ciclo completo de visita, reglas de franja/quincena, diferencias realizadas/completadas/submitidas y errores frecuentes.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin proveedores reales, sin HR writes, sin base real, sin imports reales y sin datos sensibles.
