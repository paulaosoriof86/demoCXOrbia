# PENDIENTES PROTOTIPO — Addendum G2-B provider reconciliation

Fecha: 2026-08-20
Estado: `G2B_RECOVERY_REARM_AUTH_REQUIRED`

## Pendiente vivo único de Phase A

La reconciliación read-only de proveedor cerró la ambigüedad del intento G2-B original:

`A_NO_G2B_PROVIDER_DEPLOY_OBSERVED`

No hubo nueva revisión Cloud Run ni nuevo release Hosting después del execute original. Por tanto, la corrección backend G2-B aún no está materializada y no corresponde iniciar stage/test.

## Secuencia restante obligatoria

1. Obtener autorización expresa para `PAULA_I5_G2B_P0_WRITEPATH_RECOVERY_REARM`.
2. Armar el recovery request ya preparado, conservando máximo 1 Cloud Build + 1 Cloud Run + 1 Hosting y todos los business/data writes en 0.
3. Crear el recovery execute one-shot y dejar que el workflow existente ejecute el recovery con pre-readback y post-readback.
4. Exigir `RECOVERY_PASS_FULL`; cualquier estado parcial/no-side-effect consume el intento y vuelve a gate explícito, sin retry automático.
5. Solo después del PASS ejecutar `G2B_STAGE_AND_TEST_SYNTHETIC_ONLY` con datos `CXORBIA_E2E_SYNTH_*` y los presupuestos previamente autorizados.
6. Dejar el escenario sintético visible para Paula antes de cleanup.
7. Recoger observaciones, hacer cleanup sintético y post-clean readback.
8. Si todo pasa, documentar/freeze `PRODUCTION_FROZEN_PASS_100`.

## No pendientes / no reabrir

- G1: PASS/FROZEN.
- G2-A: PASS/FROZEN.
- No crear G3.
- No crear otra candidata.
- No nueva rama/PR/workflow.
- No repetir c746 ni el one-shot original.
- No modificar frontend para resolver este P0 backend.
- No HR externa, datos/credenciales reales, pagos, Make o Gemini.

## Avance

Phase A continúa 98/100. El 2% restante corresponde únicamente al recovery verificado + aceptación sintética visible + cleanup/readback final.
