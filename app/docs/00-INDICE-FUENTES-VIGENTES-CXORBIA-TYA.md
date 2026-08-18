# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 12:37 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-FOCAL-ADJUDICATION-02`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_11C_PROVIDER_LINK_INTACT__RUNTIME_OBSERVATION_DIVERGENCE_FORENSIC__GO_LIVE_35__NO_PRODUCTION`

## Orden de lectura obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
6. evidencia activa indicada por `CXORBIA-EXECUTION-STATE.json`
7. PR #7 vivo

Permanecen vigentes como marco maestro las reglas maestras, Academia, patrones reutilizables, antidesvío y ejecución directa/empalmes declarados activos por este proyecto. Los source locks/addenda fechados son historia salvo activación expresa desde este índice.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15` = **35% completado / 65% pendiente**. I3 integral PASS → **60%**.

## Resultado nuevo — focal provider identity-link read

Run `32171812808`, job `95824491418`, artifact `9337537655`, digest `sha256:4f19be2f3d8ecaa05287cdba914b51608db78c7bbb79f7341182b0d176dac394`.

`PASS_I3_FOCAL_PROVIDER_IDENTITY_LINK_ADJUDICATION_READONLY`:
- `irl_3ed1b9a65d36c5873c1306bae1621e9d` existe;
- conserva `tya / cinepolis / hr / shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- status `materialized`, authority `tenant_adjudication`, period-independent;
- normaliza como applicable/trusted;
- field diff `[]`;
- colección actual: `2` documentos, `2` trusted normalized links, `0` rejected;
- provider reads `2`; provider writes `0`.

Por tanto se descartan como causa persistente actual: deleted, deactivated, re-scoped, mutated y structurally non-applicable. **No se autoriza ni se justifica reparar ese link.**

La contradicción viva es temporal/runtime: el Staff runtime anterior vio `1` link y `0` target links; el provider focal actual ve `2` trusted links y el target intacto.

El primer intento de harness run `32171482856` quedó HOLD antes de provider access por shallow Git history; provider reads/writes `0/0`. No consumió el gate. El push corregido consumió la única lectura provider autorizada.

## Frozen / no reprocesar

I1/I2; I3.1→I3.8; I3.9/I3.10; Historical Shopper `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read run `32171812808`; HR 15/660; Finance V2/historical; legal V0.4.

## Siguiente frontera exacta

`I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS`

Objetivo: usar únicamente GitHub/source/evidence para establecer si hubo algún write del identity-link entre el Staff run previo y la lectura focal, y revisar refresh/event-order/filtering del runtime. Provider reads `0`, provider writes `0`, Auth/Firestore-data/Rules/HR/Storage/Make/Gemini/payments/deploy/merge/production `0`.

## Anti-loop / source truth

Si HEAD/evidence contradicen la capa canónica: `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Gate ejecutado pero no sincronizado: `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones sin reducción causal: `FORENSIC_STOP`. Verificador: `tools/verify-cxorbia-source-truth-sync.mjs`.

## Camino restante

Tras cerrar I3: I4 en capacidades visibles (documentos/certificación/disponibles/postulación/asignación; agenda/ejecución/cuestionario/revisión; HR bidireccional; finanzas/liquidaciones/pagos; multi-proyecto/no-code; roles/notificaciones/integraciones/Academia). I5: freeze/build-lock/preprod/rollback/same-build E2E/autorización producción/cutover/smoke/baseline.

TyA sigue siendo el primer tenant y Cinépolis el primer proyecto normal configurable, nunca lógica global. Fuentes objetivo: Sheets/Excel/CSV/API/plataforma/import/link externo. Alta objetivo: `configurar → mapear → dry-run → validar → activar`.
