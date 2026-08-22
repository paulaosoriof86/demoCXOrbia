# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Avance F0

119 hallazgos clasificados; 26 HOLD/P0 acumulados; CP093 contenido; 25 residuales. Exhaustividad 2/4.

Cerrado:
- workflows HEAD/base 105/105;
- `.github/cxorbia-firebase-requests` 33/33;
- `backend/requests` 6/6.

Pendiente global:
- `allRequestsClassified=false`: terminar `backend/config`, execute markers, ledgers, aliases y autorizaciones dispersas;
- `allProviderWriteEntrypointsClassified=false`: runtime/provider tools/endpoints restantes.

## P0 CP119 — pendiente de contención autorizada

La revisión Cloud Run vigente `cxorbia-live-hr-dev-00010-n78` conserva el gate I3 de aceptación legal humana provider-backed desplegado históricamente. El request está consumido, pero el runtime puede aceptar `POST /api/tenants/tya/legal/commands` con identidad real + confirmación humana si el env gate sigue activo; la misma revisión vigente es la que fue desplegada con ese gate habilitado.

El execute marker I3 permanece `enabled=true/consumed=false`, aunque el workflow actual ya bloquea un replay I3 antes de provider access. El riesgo es el endpoint ya desplegado, no un redeploy automático.

No hay autorización vigente para Cloud Run mutation. Requiere autorización explícita separada para deshabilitar el env gate y hacer readback, sin otras mutaciones.

## Otros pendientes F2 ya demostrados

- consumed one-shot ledger no cubre exhaustivamente autorizaciones C6/Corte6/I3 históricas;
- evidence aliases está en epoch 47 mientras continuity lock está en epoch 50;
- request/execute/runtime/ledger deben quedar bajo una única autoridad canónica.

## Regla

Mientras CP119 no esté contenido: no usar la aceptación legal humana del runtime como prueba ni producir el write; F0 puede continuar solo read-only. No iniciar F1 ni G2-B.

## Siguiente exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE` sobre el resto de `backend/config` y provider-write entrypoints, mientras se espera autorización separada para la contención mínima de CP119.
