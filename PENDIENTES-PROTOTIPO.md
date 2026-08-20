# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado
**98% / 2% pendiente.** G1 PASS/FROZEN. G2-A PASS/FROZEN. G2-B tiene un **P0 reproducible de ruta de persistencia canónica**, ya autorizado para corrección y deploy estrecho.

## P0 G2-B en remediación
Causa demostrada antes de cualquier fixture: `enableCommandWrites` no estaba habilitado para G2-B, el transporte HTTP no estaba activo y Cloud Run no tenía endpoint lifecycle canónico. Corrección permitida únicamente para datos `CXORBIA_E2E_SYNTH_*`; producción normal debe seguir cerrada a writes.

Autorización de Paula vigente para esta remediación: un solo deploy de la corrección en `cxorbia-backend-dev`, sin merge, HR externa, datos/credenciales reales, pagos, Make ni Gemini. Request: `backend/config/cxorbia-g2b-p0-writepath-deploy-request.json`.

## Pendiente exacto
1. ejecutar el execute one-shot del P0 y comprobar Cloud Run + Hosting + API fail-closed con **0 business/Auth writes durante deploy**;
2. si PASS, ejecutar G2-B `STAGE_AND_TEST` con datos exclusivamente sintéticos;
3. dejar escenario visible en `https://cxorbia-backend-dev.web.app` y capturar observaciones reales de Paula;
4. cleanup sintético completo;
5. post-clean readback con cero residuales `CXORBIA_E2E_SYNTH_*`;
6. congelar G2/RC12 y 100% solo si no queda P0 reproducible.

## No reabrir
I1–I4, R1–R4, G1 y G2-A. No crear G3, otra candidata, rama, PR, workflow o PREPROD. El workflow existente de deploy puede recibir solo la extensión narrow ya autorizada. No tocar datos reales.

## Frontend/Academia
No hay P0 visual demostrado. La corrección usa backend/adapters y no rediseña `/app/modules`. Academia solo cambia si las pruebas visibles posteriores demuestran una diferencia funcional real.
