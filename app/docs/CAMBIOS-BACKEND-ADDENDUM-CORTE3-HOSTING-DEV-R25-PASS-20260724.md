# CAMBIOS BACKEND — Addendum Corte 3 Hosting DEV R25 PASS

**Fecha:** 2026-07-24  
**Estado:** `HOSTING_DEV_REMOTE_LIVE_SMOKE_PASS_PENDING_PAULA_VISUAL`

## Archivos creados

- `tools/release/tya-corte3-hosting-dev-build-r24.mjs`  
  Overlay efímero de deploy que agrega snapshot y adapter financiero canónico al build live HR sin modificar módulos/core en Git.

- `tools/qa/tya-corte3-v174-runtime-preservation-r24-gate.mjs`  
  Gate que preserva hashes funcionales V174 y separa documentación mutable/entry DEV autorizado.

- `tools/qa/tya-corte3-remote-live-finance-smoke-r25-gate.mjs`  
  Gate remoto live para 42 filas exactas + 2 revisiones fail-closed, Finanzas, Beneficios y export spec.

- `app/docs/CORTE3-HOSTING-DEV-AUTORIZACION-Y-PREFLIGHT-20260724.md`.
- `app/docs/CORTE3-HOSTING-DEV-PREFLIGHT-HOLD-ROOT-CAUSE-20260724.md`.
- `app/docs/CORTE3-HOSTING-DEV-REMOTE-SMOKE-HOLD-ROOT-CAUSE-20260724.md`.
- `app/docs/CORTE3-HOSTING-DEV-REMOTE-LIVE-SMOKE-R25-PASS-20260724.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE3-HOSTING-DEV-R25-PASS-20260724.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE3-HOSTING-DEV-R25-PASS-20260724.md`.
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE3-HOSTING-DEV-R25-PASS-20260724.md`.
- `app/docs/ACADEMIA-IMPACTO-CORTE3-HOSTING-DEV-R25-20260724.md`.

## Archivos modificados

- `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`  
  Integra gate R24, overlay R24, smoke live R25 y modo `remote_smoke_only`. Reutiliza el workflow existente; no crea carril paralelo.

- `backend/config/phase-a-live-hr-runtime-deploy-request-v1.json`  
  Solicitudes one-time aisladas, autorización explícita, source head exacto, evidencia de deploy y smoke; termina consumida con visual pendiente.

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`.
- PR #7: título y cuerpo actualizados; permanece draft/open/no merge.

## Archivos no modificados

- `app/modules/**`.
- `app/core/**`.
- `app/index.html` en Git.
- Firestore rules/indexes.
- Storage rules.
- Cloud Run.
- Base de datos o HR.

`app/index.html` y `firebase.json` fueron modificados únicamente dentro del checkout efímero del workflow para publicar Hosting DEV; esos cambios no se commitearon.

## Gates y evidencia

### Gate técnico previo

- run `30074835544`;
- artifact `8589444193`;
- digest `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`;
- PASS.

### Deploy Hosting DEV

- run `30098823043`;
- job `89499452079`;
- artifact `8598747476`;
- digest `sha256:88d201f834ce1237384de5c916f8cce65442e4255a710e58a9ade64e3707b016`;
- deploy success;
- smoke R23 HOLD por expectativa snapshot/live.

### Smoke remoto final

- run `30099476156`;
- job `89501621499`;
- artifact `8598990578`;
- digest `sha256:09c69c975a0933368b346d27218386b28421616adc039f3a37caf16ca8bbba12`;
- `PASS_CORTE3_HOSTING_DEV_AND_REMOTE_LIVE_SMOKE`;
- no redeploy.

## Seguridad

- producción: no;
- merge: no;
- Cloud Run deploy: no;
- Firestore/Auth/Storage/HR writes: 0;
- imports: 0;
- pagos/lotes: 0;
- Make/Gemini: no.

## Siguiente bloque

Validación visual de Paula en Hosting DEV, PDF/Excel reales y freeze de Corte 3 si no aparece diferencia reproducible.
