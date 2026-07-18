# PHASE A — CHECKPOINT HISTÓRICO SUPERADO

Fecha de reemplazo: 2026-07-18  
Estado: `SUPERADO_NO_USAR_COMO_ESTADO_OPERATIVO`

Este archivo conserva únicamente su nombre histórico para evitar enlaces rotos. Ya no define baseline, candidata, plan, gates ni siguiente acción.

Fuentes canónicas vigentes:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `backend/contracts/prototype-baseline-registry-v1.json`;
5. `app/core/build-lock.js`.

Estado resumido al reemplazar este histórico:

- V159 está físicamente empalmada en `docs-tya-v6-v71-audit`;
- commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`;
- estado: `EMPALMED_PENDING_POST_GATES` / `TECHNICAL_PASS_PENDING_VISUAL`;
- V159 no es todavía `ACTIVE_BASELINE`;
- la última baseline visual congelada permanece como referencia de rollback hasta que V159 pase gates de runtime, Hosting DEV y revisión visual;
- no se debe pedir otra candidata ni reabrir el empalme.

Secuencia vigente:

`V159 EMPALMADA → GATES POST-EMPALME → HOSTING DEV EXACTO → SMOKE REMOTO → VALIDACIÓN VISUAL → ACTIVE_BASELINE`

Estado seguro: sin merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
