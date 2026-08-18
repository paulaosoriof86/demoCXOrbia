# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 14:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-R3B-HOLD-DEV-HOSTING-PARITY-05`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__R3B_HOLD__CORRECTED_SOURCE_PENDING_DEV_HOSTING_MATERIALIZATION__GO_LIVE_35__NO_PRODUCTION`

## Orden de lectura obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
6. evidencia activa indicada por `CXORBIA-EXECUTION-STATE.json`
7. PR #7 vivo

Permanecen vigentes como marco maestro las reglas maestras, Academia, patrones reutilizables, antidesvío y ejecución directa/empalmes declarados activos por este proyecto. Los documentos históricos no sustituyen esta capa canónica.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15` = **35% completado / 65% pendiente**. I3 integral PASS → **60%**.

## R3-B ejecutado — HOLD consumido

Run `32181137350`, job `95854174365`, artifact `9340865585`, digest `sha256:4485e03cb17d4dcb82915049fe8d2895ba099baff62d08b5fc2ac89cf1dd1ab3`.

Antes del navegador pasó el gate estático `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`: el source corregido acepta `materialized`, `tenant_adjudication`, authorityRef y mantiene exact technical identity/no fuzzy matching. Las Rules I3.11C se reutilizaron; deploys de Rules en esta ejecución `0`.

El Staff/Admin DEV sí se ejecutó una vez y quedó HOLD por `AUTH_RUNTIME_TIMEOUT`, con runtime operacional montado. El lastState es concluyente para el pendiente de identidad:
- provider runtime links `1`;
- target links `0`;
- `targetCanonicalActual = null`;
- agosto canonical `0`;
- agosto residual live `2`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`.

El mismo lastState demuestra que no hay nueva regresión de postulación/legal: postulation authority ready, `8` platform posts, `15` HR assignments, no HR-as-postulation, legal provider authority cargada y receipt `accepted/human_ui`. Los FAIL secundarios I3.4/I3.7 del resumen son consecuencia de que el runner no compuso esos subresultados después del timeout base.

## Causa reducida después de R3-B

`I3_11C_CORRECTED_SOURCE_NOT_EFFECTIVE_IN_REMOTE_DEV__HOSTING_MATERIALIZATION_REQUIRED`.

Está probado que:
- R3-A corrigió el source reusable y R3-B lo valida estáticamente;
- R3-A hizo `0` Hosting deploys;
- R3-B hizo `0` Hosting deploys y probó `https://cxorbia-backend-dev.web.app`;
- el runtime remoto sigue mostrando la conducta pre-corrección: un link aplicable y cero target;
- el provider focal ya probó el target link intacto/aplicable, por lo que no se repara provider state.

No se capturó aún el hash exacto del asset remoto; por ello el siguiente paso es materializar el source corregido en Hosting DEV y verificar paridad remota, no volver a cambiar el contrato ni repetir Staff automáticamente.

## Frozen / no reprocesar

I1/I2; I3.1→I3.10; Historical Shopper `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read `32171812808`; R3-B run `32181137350`; HR 15/660; Finance V2/historical; legal V0.4.

R3-B quedó consumido. No rerun automático.

## Siguiente frontera exacta

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES`

Alcance permitido únicamente con nueva autorización expresa:
- máximo `1` deploy de Firebase Hosting DEV en `cxorbia-backend-dev`;
- materializar el source ya corregido desde la rama viva;
- verificar fingerprint/hash o semántica remota del adapter servido;
- provider identity writes, Firestore data writes, Auth writes, Rules deploy, HR/Storage/Make/Gemini/pagos, Historical Shopper, Cloud Run, merge y producción = `0`;
- no ejecutar Staff runtime otra vez dentro del mismo gate.

Después de Hosting PASS se requerirá una autorización separada para el cierre Staff read-only final de I3.

## Anti-loop

Mismatch documental → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Gate ejecutado sin sincronizar → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones sin reducción causal → `FORENSIC_STOP`. Verificador: `tools/verify-cxorbia-source-truth-sync.mjs`.

## Camino restante

Hosting DEV parity → Staff read-only final → I3 PASS/60% → I4 visible → I5 producción. TyA sigue siendo primer tenant y Cinépolis proyecto normal configurable, nunca lógica global.
