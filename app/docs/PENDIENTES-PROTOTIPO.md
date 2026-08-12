# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 17:05 -06:00  
**Estado:** `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT__PHASE_A_88__C6_LANE_READY_100`

## Pendiente vivo único de continuidad

```text
HOSTING_RUNTIME_ONCE Staff
→ C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Ya implementado y no reabrir

- Wiring Staff fail-closed contra `tenants/tya/users/{uid}`.
- Formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Exact Write V2/canonical readback.
- D technical-login rebase/private handoff.
- Auth340, SKIP13, MultiAuth, HR y M4/static.
- Causa raíz `REQUEST_ACTION_METADATA_SUFFIX_DRIFT` corregida estructuralmente.
- Action explícita/fail-closed.
- Selector Staff dedicado sin Shopper/HR/Firestore.
- Smoke Staff dedicado sin transformaciones textuales.
- Preflight Staff antes de provider.

No reabrir sin drift reproducible.

## Gate source-only cerrado

Run `31649467657`:
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT_RUN`;
- job `94290390013`;
- artifact `9162011590`;
- digest `sha256:50b1b0be7d47594456e4b131099107ba7716906ca06655ce2ebf861d1979c9b1`;
- provider=0;
- Hosting=0;
- Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos=0;
- merge=false;
- producción=false.

Google Cloud Auth, selector privado y Hosting/runtime fueron skipped por diseño. El carril C6 Staff quedó source-ready al **100%**.

## Pendiente inmediato

Nueva autorización explícita para un único `HOSTING_RUNTIME_ONCE` Staff, bound al HEAD vivo, con action exacta `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. El preflight debe PASS antes de provider; luego máximo un Hosting DEV y runtime canónico con reload/new-tab. Ante fallo post-provider: `STOP_RETRY`.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloquea este proof C6.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante | delta certificado +0% | readiness C6 source-only 100%.**

## Claude / Academia

Cero cambio frontend en este bloque. No pedir candidata. Academia se actualiza únicamente después del runtime Staff PASS.
