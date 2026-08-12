# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 16:41 -06:00  
**Estado:** `C6_STAFF_ACTION_METADATA_SUFFIX_ROOTCAUSE_PROVEN__STOP_RETRY__PHASE_A_88`

## Pendiente vivo único de continuidad

```text
C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Ya implementado y no reabrir

- Wiring Staff fail-closed contra `tenants/tya/users/{uid}`.
- Formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Repair QA Staff `5c9663dd6b1174cf8d59186484eb09e83316e862`.
- Exact Write V2/canonical readback.
- D technical-login rebase/private handoff.
- Auth340, SKIP13, MultiAuth, HR y M4/static.
- Heredoc shell blocker y exclusión `gha-creds-*.json`.

No reabrir sin drift reproducible.

## Resultado one-shot 05

Run `31647758560`:

- checkout/autorización/GCP/tooling: PASS;
- selector privado: FAIL antes de Staff-only;
- Hosting intentado=false;
- Hosting de este one-shot=`0/1`;
- runtime=null;
- nuevos provider/data writes=0;
- production=false.

Artifact `9161420264`, digest `sha256:38136897ad4a6c973577bbf4f608afa4ee03466370d7feb2183570c1cc908594`.

`STOP_RETRY` aplicado; no hubo segundo intento.

## Causa raíz nueva

`REQUEST_ACTION_METADATA_SUFFIX_DRIFT`.

El workflow resuelve Staff-only solo cuando `authorizationSource` termina exactamente en `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. El request 05 añadió `_single_visible_login_form` después de ese token; la action quedó vacía y el workflow cayó a la rama genérica Staff+Shopper, cuyo stage se detuvo en el HOLD Shopper histórico.

El repair Staff QA no falló porque no fue alcanzado. No hay nuevo fallo provider/Auth/membership/datos demostrado.

## Pendiente inmediato

Nuevo one-shot Staff, bound al HEAD vivo, con `authorizationSource` terminando exactamente en la action Staff, sin sufijos, y verificación de la action resuelta antes del selector/deploy.

Aunque Hosting quedó físicamente `0/1`, `STOP_RETRY` cerró la autorización 05; requiere nueva autorización explícita. No rerunear `31647758560` ni reutilizar request 05.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloquea este proof C6.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante | delta certificado +0%.**

## Claude / Academia

Cero cambio frontend por este fallo. No pedir candidata. Academia se actualiza únicamente después del runtime Staff PASS.
