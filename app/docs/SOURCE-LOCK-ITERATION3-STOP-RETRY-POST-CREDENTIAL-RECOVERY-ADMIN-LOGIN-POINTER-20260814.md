# SOURCE LOCK — ITERATION 3 STOP_RETRY POST CREDENTIAL RECOVERY / ADMIN LOGIN POINTER — 2026-08-14

**Estado:** `STOP_RETRY__HISTORICAL_CREDENTIAL_RECOVERY_PASS__ADMIN_LOGIN_POINTER_BLOCKED__GO_LIVE_35__PAULA_REVIEW_REQUIRED`

## Repo / candidata / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata única: `docs-tya-v6-v71-audit`
- PR: #7 draft/open/no merge
- Run: `31833696707`
- Job: `94875097700`
- Request ejecutado: `cxorbia-i3-shopper-persistence-20260814-02`
- Request parked commit: `2250774adff48bac87da2cc6ba2663b1dbf0e472`

## Lo que sí pasó

1. Gate exacto de Paula PASS.
2. Source preflight y patch same-candidate PASS.
3. Service account DEV cargada en boundary privado.
4. Único Shopper histórico exacto resuelto sin fuzzy matching.
5. Único credential recovery/reset autorizado ejecutado PASS.
6. UID, claims, shopperId, profile e historia fueron verificados como preservados; ninguna otra identidad fue modificada.
7. Reconciliación exacta de membership/crosswalk completó PASS.
8. Provider y proxy local arrancaron PASS.

## Nuevo blocker reproducible

El E2E Admin falló antes de crear el Shopper nuevo porque `#cxBackendPreviewStatus` interceptó los eventos de puntero sobre `#lgSubmit`:

`locator.click: Timeout 30000ms exceeded` / `cxBackendPreviewStatus intercepts pointer events`.

La causa quedó localizada en `app/core/backend-preview-status.js`: el panel diagnóstico DEV era `position:fixed`, `z-index:99999` y no tenía `pointer-events:none`.

Corrección source-only aplicada sobre la misma candidata: el overlay ahora es no interactivo (`pointer-events:none`, `aria-hidden=true`) y el E2E verifica explícitamente que el overlay no pueda bloquear el login. No se hizo retry provider.

## Estado de la credencial recuperada

La contraseña temporal generada durante el recovery existió únicamente en archivo privado temporal del runner. La limpieza posterior eliminó ese material y no se registró en repo/logs/evidencia. Por seguridad no puede recuperarse desde GitHub.

Por tanto, aunque el reset exacto PASS, el login histórico posterior fue SKIPPED por el fallo Admin y esa contraseña ya no está disponible para un nuevo run. No afirmar login histórico PASS.

Una futura continuación que necesite certificar password login deberá tener autorización expresa nueva para establecer una nueva credencial conocida solo dentro de ese run. El siguiente harness debe ejecutar y persistir evidencia sanitizada del login histórico inmediatamente después del recovery, antes del flujo Admin, para no repetir este patrón.

## Writes y seguridad de este run

- credential recovery/reset del Shopper histórico exacto: `1` Auth password update ejecutado;
- otras identidades modificadas: `0`;
- reconciliación membership/crosswalk: PASS; el conteo exacto de Firestore writes no quedó persistido en evidencia final porque el run falló después; el código permite 0–2 dentro del presupuesto autorizado;
- Shopper nuevo: `NO`, el fallo ocurrió en login Admin antes de alta;
- HR/Rules/Storage/Make/Gemini/pagos writes: `0`;
- deploy: `0`;
- merge: `false`;
- producción: `false`;
- segundo intento automático: `NO`.

## Porcentaje

I3 sigue sin cerrar su gate completo, por lo tanto **GO-LIVE permanece 35% completado / 65% pendiente**.

## Preservar / no reprocesar

- I1 e I2 PASS;
- Firebase Auth owner / exact identity;
- source I3 preparado;
- recovery exacto ya ejecutado como evidencia histórica de esta continuación;
- fix source-only del overlay DEV;
- no nueva candidata/branch/PR/Auth rebuild.

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_POST_RECOVERY_LOGIN_AND_ADMIN_NEW_SHOPPER_RESUME`

Antes de un nuevo provider run, el harness debe quedar preparado para: 1) no ocultar bugs con `force click`; 2) certificar login histórico inmediatamente después de una nueva credencial autorizada; 3) conservar evidencia sanitizada si luego falla el flujo Admin; 4) continuar después con Admin create/update, nuevo Shopper login, reload/new-tab/segundo contexto; 5) fail-closed sin retry.
