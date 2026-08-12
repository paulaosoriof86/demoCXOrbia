# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 17:05 -06:00  
**Estado vivo:** `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT__PHASE_A_88__C6_LANE_READY_100__NO_PROVIDER__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia vigente: `app/docs/evidence/c6-staff-lane-source-preflight-31649467657.json`.
4. Run `31649467657`, job `94290390013`, artifact `9162011590`, digest `sha256:50b1b0be7d47594456e4b131099107ba7716906ca06655ce2ebf861d1979c9b1`.
5. C6 Staff Exact Write V2 y canonical readback PASS, cerrados/no repetibles.
6. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz.
7. Plan/tracker/Academia.
8. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Phase A: **88% certificado / 12% restante**.
- C6 Staff execution-lane source readiness: **100% PASS**.
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT_RUN` demostrado en GitHub Actions.
- Action Staff ya es campo explícito/fail-closed; eliminado `authorizationSource.endsWith(...)`.
- Ruta Staff no puede caer accidentalmente en selector Shopper.
- Selector Staff dedicado sin dependencia HR/Firestore/Shopper.
- Smoke Staff dedicado usa `#loginForm/#lgUser/#lgPass/#lgSubmit` y ya no depende de transformación textual del smoke genérico.
- Preflight se ejecuta antes del provider.
- Run 06 source-only: Google Cloud Auth/selector privado/Hosting/runtime skipped; provider=0; Hosting=0; writes=0; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado último run=+0%.**

## Siguiente acción exacta

No reabrir gates anteriores. Solicitar una nueva autorización explícita para un único request `HOSTING_RUNTIME_ONCE` bound al HEAD vivo, con `action: C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. El preflight PASS corre primero; solo después puede autenticarse provider y ejecutarse máximo un Hosting DEV Staff-only. Con PASS: cerrar M7 y continuar M8 → M9 → M10.
