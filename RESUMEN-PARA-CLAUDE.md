# RESUMEN-PARA-CLAUDE.md — MIRROR DE CONTINUIDAD

**Última actualización:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`  
**Estado:** `PHASE_A_100__APPROVED_MODULES_EXACT__F10_SOURCE_REPAIRED_PREDEPLOY`  
**NEXT:** `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`

Este archivo raíz no es una autoridad frontend paralela. Usar como handoff vigente:

`app/docs/RESUMEN-PARA-CLAUDE-F10-OP-EVIDENCE-20260829.md`

HARD PRESERVE:

- no restore V182;
- no reconstrucción/reemplazo de módulos aprobados;
- la matriz exacta posterior al fix tiene `0` mismatches;
- Dashboard blob `e879fc3f1dd5a7486762b197346cadd086e1d99d`;
- Visitas `d7c65650e4972d438f2641cbcaaff25486fb7f01`;
- Postulaciones `f38593885c245841710934971dd335ee5eddf1da`;
- Shoppers `92f834bb2b7fcf5d8674acb717ce6b4e920c5766`;
- Mis Visitas `19feb19b96c7d2f69c3cfed785fdbfcaabd96e2d`;
- Finanzas `623fab9ba1e06c39f83beda610bb771e23910a07`;
- Cliente `4e5981081bdd01de368c4f412ed476244426634e`;
- Reservas `ddc54bad9dfc7b242b06d39daf872c9f9b327c80`;
- Academia `0b42dd790d946d327eb1110b78878e302d51aa6e`;
- entrypoint `7a5f169dd0e239d46fa4af09cf67f2eb4329a477`;
- app.js `2043d33dee611adacebc947c8423ed1739c1a8da`.

La causa F10 fue reparada en `app/adapters/tya-canonical-state-semantics-v2.js`, commit `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`, sin tocar los blobs anteriores. El adapter separa lifecycle histórico de evidencia operacional directa HR.

Único ajuste frontend potencial posterior: exponer **Candidatas a liquidación** separado de **Liquidadas**; nunca cambiar el significado de Liquidadas. Cliente/Cliente 360 permanece como HOLD separado.

El patch F10 aún no está desplegado; no afirmar que ya se ve en Hosting.
