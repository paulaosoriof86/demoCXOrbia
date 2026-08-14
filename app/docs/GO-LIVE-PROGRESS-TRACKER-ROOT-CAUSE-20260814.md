# GO-LIVE PROGRESS TRACKER — ROOT-CAUSE PLAN CXORBIA TyA

**Fecha:** 2026-08-14 12:04 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_STOP_RETRY_HISTORICAL_CREDENTIAL_H0_S0__35_PERCENT__PAULA_REVIEW_REQUIRED`

## Regla de medición

Este tracker reemplaza cualquier uso de M1–M10 como readiness productivo. El porcentaje solo avanza cuando una iteración cierra su gate real; preparación source, provider-read incompleto o STOP_RETRY no reciben puntos parciales.

## Pesos

- Iteración 1 — source-only root-cause consolidation: **15%**.
- Iteración 2 — canonical persistence + transversal regression: **20%**. Acumulado **35%**.
- Iteración 3 — DEV Auth/Firestore Shopper persistence: **25%**. Acumulado objetivo **60%**.
- Iteración 4 — HR bidirectional + Phase A E2E + Finance: **25%**. Acumulado **85%**.
- Iteración 5 — exact build + preprod + go-live: **15%**. Acumulado **100%**.

## Estado actual

**35% completado / 65% pendiente para producción.**

### I1 — PASS 15/15

`PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`. No reprocesar.

### I2 — PASS 20/20

`PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE` / `SOURCE_READY_FOR_DEV_WRITE_GATES`. No reprocesar.

### I3 — STOP_RETRY 0/25 todavía

Autorización real alcanzó provider-read en run `31826443230`, job `94851603411` y se detuvo antes de cualquier write con:

`HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`.

Confirmado:

- una identidad Shopper histórica exacta con claims, perfil e historia;
- 616 relaciones de visita exactas y 208 relaciones exactas Shopper;
- cero fuzzy matching;
- cero password reconstruible desde las fuentes aprobadas para ese principal (`H0`);
- cero sign-in histórico exitoso (`S0`);
- Auth writes `0`;
- Firestore writes `0`;
- password changes/resets `0`;
- Shopper nuevo creado `NO`;
- no HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción.

La importación histórica Auth preservó `passwordHashHex` SHA256 mediante `importUsers()`, pero no plaintext. La selección E2E no puede certificar login humano sin una credencial exacta recuperable.

Source lock vigente: `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-HISTORICAL-SHOPPER-CREDENTIAL-20260814.md`.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_HISTORICAL_SHOPPER_CREDENTIAL_RECOVERY`.

I3 se reanuda, no se reinicia, únicamente con autorización nueva focalizada para resolver la credencial del principal histórico exacto. El provider lane está PARKED y no existe segundo intento automático.
