# CAMBIOS-BACKEND — addendum R17 NO-GO semántico

Fecha: 2026-07-13

## Decisión

- Se retira el PASS visual/semántico previo de R17.
- Estado vigente: `NO_GO_VISIBLE_TYA_R17_SEMANTIC_DATA_MAPPING`.
- El deploy Hosting DEV fue exitoso técnicamente, pero no valida operación TyA ni HR correcta.

## Archivos creados

- `app/docs/AUDITORIA-FORENSE-R17-REVISION-HUMANA-TYA-20260713.md`.
- `tools/qa/tya-r17-human-findings-semantic-gate.mjs`.
- `.github/workflows/cxorbia-r17-human-findings-semantic-gate.yml`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-R17-NO-GO-SEMANTICO-20260713.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-R17-NO-GO-SEMANTICO-20260713.md`.
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-R17-NO-GO-SEMANTICO-20260713.md`.
- `app/docs/ACADEMIA-ADDENDUM-R17-VALIDACION-SEMANTICA-20260713.md`.

## Archivo actualizado

- `tools/release/tya-rc-phase-a-drift-gate.mjs`: permite el nuevo validador/workflow de auditoría semántica sin abrir cambios de runtime V110.

## Hallazgos técnicos

- Sidebar modifica el periodo canónico; selector interno de Dashboard es cosmético.
- Mi Día conserva mes propio hardcodeado y no sigue el periodo.
- HR se lee en build/deploy y se sirve como snapshot estático, no runtime live.
- Submitido se transforma incorrectamente en `liquidada`.
- Parser XLSX no convierte seriales de fecha.
- Login duplica nombre del tenant sin logo.
- Países GT/HN están fijados en adapter, no demostrados por selección/alcance activo.
- Shoppers usa rating uniforme `4.3` y proyección no operacional.
- Smoke anterior no tenía aserciones semánticas para estos defectos.

## Clasificación

- **Reusable CXOrbia:** normalización de fechas, ciclo de estados separado, periodo canónico y gate semántico.
- **Exclusivo cliente:** reglas HR/Q1/Q2 TyA, Cinépolis, GT/HN, junio y shoppers históricos.
- **Claude/prototipo:** selectors, Mi Día, login, banderas y representación shopper.
- **Academia:** proyecto/periodo, snapshot/runtime y estados separados.
- **Sin impacto Claude:** workflow, hashes, CI y evidencia read-only.

## Estado seguro

Sin cambios en `/app/modules` ni `/app/core`; sin writes, imports, rules, Functions, deploy, producción, Make, Gemini ni pagos.
