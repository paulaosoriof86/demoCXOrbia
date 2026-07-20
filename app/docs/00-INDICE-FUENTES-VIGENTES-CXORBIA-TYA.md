# 00 - INDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-20
Estado: ACTIVO Y OBLIGATORIO

## Lectura obligatoria

1. Reglas maestras y continuidad.
2. Addendum de empalme directo y carril file-aware.
3. Addenda de Academia, patrones reutilizables y antidesvío.
4. Plan Phase A sin desviación.
5. `REGLA-PREVALENTE-VALIDACION-VISUAL-DESPUES-DE-CADA-CORTE-20260720.md`.
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. Contratos, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, tracker, Academia y PR #7.
8. `PHASE-A-CORTE1-INICIO-CONTEXTO-HR-HISTORICO-REPORTES-20260720.md`.
9. `PAQUETE-CLAUDE-CORTE1-REPORTES-EXPORTACIONES-20260720.md`.
10. `CLAUDE-PATRONES-REUTILIZABLES-ADDENDUM-CORTE0B-CORTE1-20260720.md`.

## Estado vigente

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21.
- Corte 0B: congelado y aprobado visualmente.
- Estado: `CORTE_1_CLAUDE_REQUIRED_LOCALIZED_DELTA_READY`.

## Corte 1 — evidencia vigente

- Contrato fuente/reportes schema 1.1.0.
- Contrato frontend localizado.
- Proyección: `window.CX_TYA_CORTE1_REPORTS`.
- Run `29727050055`: SUCCESS.
- Artifact `8454684849`.
- Digest `sha256:da068c013b3911f062ac5d7154580224b5fa68f5df91a6bfd68c0c7e6ec5aabf`.
- 14 periodos, 616 visitas.
- 28 filas periodo/país.
- 308 filas periodo/país/sucursal.
- 611 asignadas, 5 sin asignar, 592 realizadas, 590 cuestionarios y 527 submitidas.
- 0 pagos confirmados o inferidos.
- 0 blockers, 0 errores de página y 0 errores de consola.

## Matriz de reportes

Disponibles:

- resumen ejecutivo operativo;
- estado operativo por sucursal;
- cobertura por país;
- tendencia operativa por periodo.

Pendientes de fuente:

- scorecard validado;
- planes de acción;
- brechas y capacitación.

## Claude

Claude se requiere ahora únicamente para `app/modules/cliente-extra.js`, módulo `cli_reportes`.

Paquete exacto:

`PAQUETE-CLAUDE-CORTE1-REPORTES-EXPORTACIONES-20260720.md`

No se solicita candidata general ni reauditoría completa.

## Certificaciones y recursos

- Certificaciones: Corte 2 funcional; Corte 6 permisos; Corte 7 sincronización/preservación.
- Recursos: contexto Corte 1; entrega Corte 2; permisos Corte 6; almacenamiento/versionado Corte 7.

## Regla visual prevalente

Después de cada corte Paula revisa visualmente el build exacto antes del freeze y antes de iniciar el siguiente.

## Siguiente bloque exacto

`CLAUDE DELTA LOCALIZADO CORTE 1.2 -> AUDITORÍA DELTA -> APPLY_DELTA_DIRECTLY SI GO -> GATES -> HOSTING DEV AUTORIZADO -> REVISIÓN VISUAL -> FREEZE CORTE 1`

Corte 2 no comienza antes del freeze de Corte 1.
