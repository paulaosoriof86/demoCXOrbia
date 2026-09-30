# RESUMEN PARA CLAUDE — RESIDUAL V120 → V121

Fecha: 2026-07-14

## Baseline de trabajo Claude

El ZIP recibido está nombrado V115, pero su identidad interna y manifest son V120. La siguiente candidata debe llamarse V121 y construirse sobre este contenido, sin volver a V114/V115.

## No reprocesar

- proyecto/periodo y setters;
- Mi Día;
- ranking/scoring;
- manifest dinámico;
- CRM fixtures solo en demo;
- `CX.data.ctx()`;
- `CX.dataSource.sourceContract()`;
- `CX.data.visitContract(v)`;
- importador accepted/duplicates/conflicts/discarded;
- conflicto HR vs existente;
- CRUD de Academia ya presente.

## Pendiente residual

- corregir texto puntual falso de Academia;
- hacer que módulos consuman `ctx()`, `sourceContract()` y `visitContract()`;
- dry-run separado pagos/certificaciones/documentos;
- cierre comprobable CRM/documentos/configuración tenant;
- cobertura transversal Academia por módulo/rol/notificación;
- identidad de ZIP/source lock V121 coherente;
- smoke y manifest final.

Fuente completa: `PAQUETE-CLAUDE-CXORBIA-V120-A-V121-RESIDUAL-COMPLETO-20260714.zip`.

No tocar backend, providers, Firebase, workflows, datos TyA ni producción.
