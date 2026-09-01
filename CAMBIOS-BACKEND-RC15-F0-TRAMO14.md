# CAMBIOS-BACKEND — RC15 F0 TRAMO 14 · EXECUTE MARKERS + CP117/M9

**Fecha:** 2026-08-23  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Contrato del bloque

- objetivo: continuar F0 exclusivamente en lectura y reducir la superficie pendiente de `backend/config`, especialmente execute markers, CP117 y aliases;
- entrada: HEAD `c6b41dbe44fba5755d0535b41c85f6bcc2c63ae3`;
- plan congelado y `providerMutationAuthorizedNow=false`;
- mutaciones permitidas: únicamente evidencia/documentación Git de esta auditoría;
- prohibido: provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos, Cloud Build/Run/Hosting, G2-B, merge y cambios funcionales frontend.

## Resultado medible

- hallazgos clasificados: **138 → 142**;
- HOLD/P0 acumulados: **31 → 32**;
- contenidos: CP093 + CP119 = **2**;
- residuales: **29 → 30**;
- exhaustividad: **2/4**;
- execute markers I3/G2-B reconciliados contra el workflow compartido actual;
- cinco execute markers Corte6 terminales comprobados `enabled=false` + `consumed=true`;
- M8/M10 comprobados como read-only sin presupuesto de provider mutation;
- un nuevo HOLD concreto aislado: **CP142 / M9**, autorización histórica de promoción/rollback todavía `enabled=true`, `consumed=false`.

No hubo provider write, data write, deploy, recovery, synthetic stage, merge ni cambio frontend.

## CP139 — workflow compartido I3/G2-B fail-closed

El workflow vivo `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml` observa tres paths históricos:

1. `i3-legal-v04-runtime-deploy-dev-execute.json`;
2. `cxorbia-g2b-p0-writepath-deploy-execute.json`;
3. `cxorbia-g2b-p0-writepath-deploy-recovery-execute.json`.

Sin embargo, el job actual exige que el commit cambie **exactamente un archivo y que ese archivo sea el recovery execute**, y luego valida request/recovery exactos, `enabled=true`, `consumed=false`, lineage y presupuesto antes de autenticarse con Google Cloud.

El request recovery actual está terminal `enabled=false`, `consumed=true`, `RECOVERY_NO_PROVIDER_SIDE_EFFECT`. Por tanto:

- cambiar el marker I3 histórico no puede cruzar la autorización;
- cambiar el marker G2-B original tampoco;
- cambiar el recovery execute actual tampoco puede cruzar mientras el request siga consumido.

Clasificación: `PASS_CURRENT_SHARED_RUNTIME_DEPLOY_WORKFLOW_FAILS_CLOSED_FOR_HISTORICAL_I3_AND_ORIGINAL_G2B_MARKERS`.

F1/F2 deberá normalizar esos event artifacts para que sus campos históricos `enabled/consumed` no parezcan autoridad actual, pero **no existe autorización de ejecución vigente**.

## CP140 — execute markers Corte6 terminales

Se comprobaron directamente:

- `corte6-cumulative-human-visual-hosting-execute.json`;
- `corte6-dev-root-entrypoint-hosting-execute.json`;
- `corte6-human-full-visual-execute.json`;
- `corte6-profile-full-firestore-write-execute-v2.json`;
- `corte6-protected-session-continuity-hosting-execute.json`.

Los cinco están `enabled=false` y `consumed=true`, con estado terminal. Algunos registran writes/deploys históricos ya ejecutados, pero no conservan autorización actual.

Clasificación: `PASS_SAMPLED_CORTE6_EXECUTE_MARKERS_TERMINAL_DISABLED_AND_CONSUMED`.

## CP141 — M8/M10 read-only

`m8-human-validation-readonly-execute.json` y `m10-final-readonly-smoke-execute.json` conservan estado histórico habilitado/no consumido, pero sus contratos declaran operación read-only y presupuestos de provider/data/deploy writes en cero.

Clasificación: `PASS_HISTORICAL_READONLY_M8_M10_MARKERS_HAVE_ZERO_PROVIDER_MUTATION_BUDGET`.

F2 debe hacer inequívoca la diferencia entre evento histórico y autoridad vigente, pero estos dos artefactos no agregan superficie write-capable.

## CP142 — HOLD nuevo · M9 no está terminalizado

`backend/config/m9-provider-precutover-readonly-execute.json` es más riesgoso de lo que su nombre sugiere. Su contenido declara:

- `enabled=true`;
- `consumed=false`;
- `mode=ONE_RETRY_PROMOTION_REAL_ROOT_SMOKE_CONDITIONAL_ROLLBACK`;
- `maxProductionPromotions=1`;
- `maxConditionalRollbacks=1`;
- una autorización histórica de Paula del 13 de agosto.

Aunque en este tramo no se ejecutó nada ni se demostró un provider route actual que lo consuma, **la autorización histórica no debe sobrevivir como potencial autoridad del control-plane**.

Clasificación: `HOLD_HISTORICAL_M9_PRODUCTION_PROMOTION_AND_CONDITIONAL_ROLLBACK_AUTHORIZATION_NOT_TERMINALIZED`.

Tratamiento: F1 debe terminalizar/inertizar esta autoridad histórica preservando evidencia y F2 debe garantizar que ningún caller, workflow o primitive pueda tratarla como autorización actual.

Este hallazgo es un miembro concreto del problema CP117 y demuestra por qué `historicalGlobalExhaustive=false` todavía no puede cambiar a true.

## CP117 / CP118

- **CP117 sigue abierto.** El consumed ledger actual protege los one-shots conocidos, pero todavía no representa exhaustivamente toda autoridad histórica. CP142/M9 es evidencia concreta adicional.
- **CP118 se revalida sin doble conteo.** `cxorbia-evidence-aliases.json` es no ejecutable y contiene políticas correctas de no-rerun, pero continúa en epoch 47 mientras el continuity lock está en epoch 50. Su normalización corresponde a F2.

## Persistencia del mecanismo

Este tramo confirma el patrón que debe preservar las mejoras:

1. plan maestro congelado;
2. continuity lock como autoridad;
3. terminal receipt sobre event artifact histórico;
4. consumed ledger para impedir replay;
5. workflow fail-closed antes de provider access;
6. F1 elimina autoridad histórica residual;
7. F2 deja una sola autoridad canónica.

Por eso una conversación vieja, un execute marker antiguo o un nombre de evidencia no puede autorizar por sí solo una repetición.

## Seguridad

En Tramo 14:
- provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos = **0**;
- Cloud Build/Run/Hosting = **0**;
- G2-B = **0**;
- merge = **false**;
- `/app/modules` y `/app/core` = sin cambios;
- frontend funcional = **0**.

## Clasificación obligatoria

- **Reusable CXOrbia:** terminal receipt > event artifact; authorization current/request-bound; stale enabled markers never become execution authority; fail-closed before provider auth.
- **Exclusivo cliente:** artifacts históricos TyA/Corte6/M8-M10 y targets `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambios; no solicitar candidata ni tocar UI.
- **Academia:** sin impacto funcional; no actualizar cursos/manuales.
- **Sin impacto Claude:** evidence y documentación RC15 F0.

## Pendiente real

Los dos flags globales siguen abiertos:
- `allRequestsClassified=false`;
- `allProviderWriteEntrypointsClassified=false`.

Siguiente exacto: continuar el resto de autoridad/request artifacts de `backend/config` y agotar provider-capable entrypoints restantes de `tools/qa` y `tools/release`. F1 no inicia hasta 4/4. G2-B no se toca.
