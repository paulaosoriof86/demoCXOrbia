# GO-LIVE PROGRESS TRACKER — ROOT-CAUSE PLAN CXORBIA TyA

**Fecha:** 2026-08-14 14:00 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RESET2_CONSUMED__HISTORICAL_AUTH_REACHED__LEGAL_GATE_AWARE_HARNESS_PASS__35_PERCENT__PROVIDER_GATE_REQUIRED`

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

## Regla de medición

El porcentaje solo avanza cuando una iteración cierra su gate completo. PASS internos de I3 no suman puntos parciales.

## Pesos

- I1 source-only root-cause consolidation: 15%.
- I2 canonical persistence + regression: 20%. Acumulado 35%.
- I3 DEV Auth/Firestore Shopper persistence: 25%. Acumulado objetivo 60%.
- I4 HR bidirectional + Phase A E2E + Finance: 25%. Acumulado objetivo 85%.
- I5 exact build + preprod + go-live: 15%. Acumulado objetivo 100%.

## Estado actual

**35% completado / 65% pendiente para producción.**

### I1 — PASS 15/15

No reprocesar.

### I2 — PASS 20/20

No reprocesar.

### I3 — 0/25 todavía, con avance interno real

Último provider run: `31835742956`, job `94881540163`.

PASS alcanzado dentro de I3:

- mismo Shopper histórico exacto;
- un nuevo reset exacto autorizado;
- UID/claims/shopperId/profile/history preservados;
- other identities modified `0`;
- exact membership/crosswalk reconciliation;
- contexto Auth Shopper exacto alcanzado;
- `CX_PROTECTED_AUTH_HR_AUTHORITY.applied===true` alcanzado.

STOP_RETRY: timeout esperando `#nav-aprendizaje`. Admin/new Shopper quedó SKIPPED y el checkpoint histórico no llegó a persistirse.

## Root correction source-only — PASS

Se probó un conflicto de contrato entre producto y harness: `CX.app.enter()` puede diferir el montaje del router mientras `CX.confidencialidad.pending(...)` esté activo, pero el E2E exigía Academia/Certificación incondicionalmente antes de cerrar identidad/HR/historia.

El harness histórico ahora:

- valida primero Auth exacto + identity + HR + historia;
- reconoce el gate legal canónico sin aceptarlo automáticamente;
- si el NDA está pendiente, exige el diálogo visible y difiere rutas;
- si no está pendiente, mantiene Academia/Certificación obligatorias;
- conserva cero fuzzy, zero write APIs y click real.

Source lock: `app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md`.

## Lo que falta para I3 PASS / +25 puntos

1. Gate expreso para un único reset adicional del mismo principal histórico, porque la credencial temporal del run consumido fue destruida en cleanup y no existe checkpoint sanitizado.
2. Auth/identity/HR/history histórica real PASS y checkpoint sanitizado inmediato, legal-gate-aware.
3. Admin create/update Shopper nuevo con provider ACK/readback.
4. Shopper nuevo login + reload/new-tab/segundo contexto.
5. Cero fuzzy, false success, otras identidades, proveedores prohibidos y aceptación legal automatizada.

Al cerrar todo: **60% completado / 40% pendiente**.

## Seguridad actual

Request `...-03` consumido/parked, no retry automático. Después del run: source/docs only, cero nuevos provider writes/deploy/merge/producción.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_LEGAL_GATE_AWARE_HISTORICAL_CHECKPOINT_AND_ADMIN_NEW_SHOPPER_RESUME`.
