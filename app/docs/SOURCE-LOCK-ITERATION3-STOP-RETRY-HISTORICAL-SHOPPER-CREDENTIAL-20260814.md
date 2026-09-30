# SOURCE LOCK — ITERATION 3 STOP_RETRY HISTORICAL SHOPPER CREDENTIAL — 2026-08-14

**Estado:** `STOP_RETRY__I3_PROVIDER_READ_REACHED__WRITES_0__HISTORICAL_CREDENTIAL_H0_S0__PAULA_REVIEW_REQUIRED`

## Repo / candidata / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata canónica única: `docs-tya-v6-v71-audit`
- PR: `#7` draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`
- Source target autorizado I3: `15adac75ef3764b7da1f45c31fed289af64e2223`
- Request commit que consumió la autorización hasta provider-read: `b7be75b49b06d8159155ef0b46122d04fd603ebc`
- Workflow run: `31826443230`
- Job: `94851603411`

No se abre otra candidata, rama, PR ni arquitectura. Todo el source preparado de I3 queda preservado sobre la misma candidata.

## Decisión

`STOP_RETRY_I3_HISTORICAL_SHOPPER_CREDENTIAL_UNAVAILABLE_H0_S0`.

La ejecución obedeció el contrato de Paula: al aparecer drift/bloqueo reproducible antes de writes se detuvo y no se ejecutó un segundo intento automático.

## Evidencia exacta del blocker

El selector provider-read-only terminó con:

`HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`

Interpretación source-safe:

- `R109`: 109 referencias de credenciales Shopper evaluadas.
- `U104`: 104 referencias resolvieron a un usuario Auth exacto.
- `V1`: existe exactamente un candidato Shopper con claims exactos y vínculo a historia protegida.
- `D1`: ese candidato exacto tiene perfil Shopper.
- `H0`: ninguno de los candidatos de contraseña reconstruibles desde las fuentes aprobadas coincide con el hash histórico autorizado.
- `S0`: por ello no hubo login histórico Shopper exitoso.
- `M616`: 616 visitas HR/protegidas se relacionaron por llaves exactas.
- `L208`: 208 relaciones exactas live Shopper -> protected Shopper.
- `P194`: 194 Shoppers protegidos tienen historia.

No hubo matching por nombre, email, teléfono, WhatsApp ni similitud.

## Causa técnica localizada

La importación histórica de Auth creó usuarios mediante `firebase-admin.auth().importUsers()` usando el `passwordHashHex` SHA256 aprobado, sin conservar el password en texto plano en repo/evidencia. El selector de E2E solo puede reconstruir una credencial cuando existe en el perfil protegido como `pass/password` o cuando coincide con el patrón inicial exacto `FirstName123*`. Para el único Shopper histórico exacto con historia, ninguna de esas fuentes reconstruibles coincidió con el hash (`H0`).

Esto no demuestra pérdida de identidad: la identidad exacta, claims, perfil e historia existen. Demuestra que la credencial de password necesaria para certificar un login humano real no es reconstruible desde las fuentes source-safe aprobadas actuales.

## Seguridad / writes ejecutados

Antes del bloqueo sí se alcanzaron provider reads necesarios para identificar el estado exacto. La ejecución se detuvo en selección de credenciales, antes de reconciliación o comandos de escritura.

- Auth writes I3: `0`
- Firestore writes I3: `0`
- Auth deletes: `0`
- password changes: `0`
- password resets: `0`
- Shopper histórico modificado: `NO`
- Shopper nuevo creado: `NO`
- HR writes: `0`
- Rules writes: `0`
- Storage writes: `0`
- Make/Gemini/payments writes: `0`
- deploy: `0`
- merge: `false`
- production: `false`

## Source preparado I3 — PRESERVAR / NO REHACER

Permanece preparado y no debe reconstruirse:

- `app/adapters/cxorbia-command-http-transport-v1.js`
- `app/adapters/cxorbia-shopper-membership-wiring-v1.js`
- `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`
- `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`
- `tools/qa/cxorbia-i3-source-patcher.mjs`
- integración ACK-aware preparada para `app/modules/shoppers.js` y entrypoint canónico mediante el patcher.

El harness ejecutable quedó PARKED, no eliminado: el source autorizado se conserva en el historial de la misma rama y no se vuelve a ejecutar sin gate nuevo.

## Readiness

I3 **NO** está en PASS y no suma sus 25 puntos.

**GO-LIVE se mantiene en 35% completado / 65% pendiente.**

## Gate siguiente

`PAULA_REVIEW_REQUIRED_FOR_I3_HISTORICAL_SHOPPER_CREDENTIAL_RECOVERY`

Para continuar I3 se necesita una autorización nueva y focalizada que resuelva únicamente la credencial del único Shopper histórico exacto. La ruta durable preferente es un único credential recovery/reset exacto de ese principal, sin reconstruir Auth, sin fuzzy matching y sin tocar otras identidades; luego reanudar el mismo I3 desde el checkpoint, no desde cero.
