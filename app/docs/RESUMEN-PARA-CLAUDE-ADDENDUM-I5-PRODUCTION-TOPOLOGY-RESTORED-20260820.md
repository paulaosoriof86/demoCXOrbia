# RESUMEN PARA CLAUDE — ADDENDUM I5 PRODUCTION TOPOLOGY RESTORED

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-EXISTING-CLEAN-PROJECT-PROMOTION-RESTORED-42`

## Estado que Claude debe respetar

- I1–I4 `PASS/FROZEN`.
- Source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- Score formal: `85/100`.
- No hay nuevo proyecto PREPROD pendiente.
- La estrategia productiva vigente es promover el proyecto limpio existente `cxorbia-backend-dev`.

## Topología canónica

- canonical/migration target: `cxorbia-backend-dev`;
- Hosting target: `cxorbia-dev`;
- Hosting site: `cxorbia-backend-dev`;
- URL actual aceptada como producción futura: `https://cxorbia-backend-dev.web.app`;
- sandbox Corte 4: `cxorbia-tya-dev-260729-c4`;
- legacy: `tya-plataforma`, intacto hasta cutover explícito.

El contrato autoritativo es `backend/config/cxorbia-production-promotion-contract.json`; su source lock es `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`.

## Evidencia preservada

La build exacta ya está en el Hosting existente con paridad remota PASS: run `32328316954`, artifact `9392151808`.

## Qué NO debe hacer Claude

- no tocar `/app/modules` ni `/app/core` por I5;
- no crear nueva candidata;
- no crear proyecto Firebase PREPROD;
- no reconstruir Auth/Shopper/Finanzas;
- no tratar `cxorbia-tya-dev-260729-c4` como destino productivo;
- no modificar referencias al legacy por inferencia antes del cutover.

## Próxima transición

`I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`.

Es una reconciliación de gates/evidencia, no una tarea frontend.

## Impacto frontend / Claude

Ninguno en este bloque.
