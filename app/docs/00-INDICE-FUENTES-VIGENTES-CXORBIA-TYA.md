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
7. Manifest V164 y gates Corte 1.
8. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia, tracker y PR #7.

## Estado vigente

- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21 hasta aprobación visual.
- Corte 0B: congelado.
- V164: integrada técnicamente.
- Estado: `CORTE_1_V164_TECHNICAL_PASS_PENDING_HOSTING_DEV_VISUAL`.

## Empalme y evidencia

- `HEAD_BEFORE`: `c2ad722ddf7574ba51cc26369c9f532324610646`.
- Commit V164: `f708515a637a3998eefdbe39ef66d37a3f130fb6`.
- Commit técnico: `cf0dbf735522f5ae2ed67d865dfb97d1a37335f2`.
- Run `29768206645`: SUCCESS.
- Artifact `8471655866`.
- Digest `sha256:37d3a6cc41fcd431ec54ca2cea2d306528e29459ddc48e47a5805ab477e600ac`.
- Manifest: `MANIFEST-V164-CORTE1-REPORTES-EMPALME-DIRECTO-20260720.json`.
- Verificador: `tools/qa/verify-v164-corte1-reportes-lock.mjs`.

## Resultado Corte 1

- 14 periodos y 616 visitas.
- 28 filas periodo/país y 308 filas por sucursal.
- 611 asignadas, 5 sin asignar, 592 realizadas, 590 cuestionarios y 527 submitidas.
- 0 pagos confirmados.
- 4 reportes disponibles y 3 pendientes de fuente.
- JSON, CSV, PDF, XLSX y PPTX listos técnicamente.
- Gate frontend estático y runtime: PASS.
- Gate navegador: PASS, sin blockers, warnings ni errores.
- Warning no bloqueante: shopper `209/216`.

## Claude, certificaciones y recursos

- No se requiere otra candidata de Claude para Corte 1.
- Certificaciones: Corte 2 funcional; Corte 6 permisos; Corte 7 sincronización.
- Recursos: contexto Corte 1; entrega Corte 2; permisos Corte 6; almacenamiento/versionado Corte 7.

## Siguiente acción exacta

`AUTORIZACION HOSTING DEV -> BUILD EXACTO -> SMOKE REMOTO -> REVISION VISUAL PAULA -> APROBADO -> FREEZE CORTE 1`

Corte 2 no comienza antes del freeze.
