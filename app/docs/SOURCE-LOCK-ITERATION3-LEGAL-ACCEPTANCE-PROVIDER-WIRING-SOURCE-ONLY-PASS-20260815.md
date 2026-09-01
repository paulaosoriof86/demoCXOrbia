# SOURCE LOCK — ITERATION 3 · LEGAL ACCEPTANCE PROVIDER WIRING SOURCE-ONLY PASS · 2026-08-15

**Estado:** `PASS_I3_LEGAL_ACCEPTANCE_PROVIDER_WIRING_SOURCE_ONLY__NO_PROVIDER_IO__NO_PRODUCT_WIRING__GO_LIVE_35`

## Autoridad y carril

Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

Este lock sucede a `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` y conserva íntegro el checkpoint histórico I3 de run `31906391682`.

## Causa raíz de entrada

Request08 alcanzó el Admin canónico y se detuvo fail-closed antes de Alta por:

`I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`

Request08 está consumido y no se reejecuta. No hubo Shopper nuevo ni writes Auth/Firestore en request08.

## Delta source-only aplicado

Cadena fuente:

- `c3f8fc362a4b2dddb0a19fa3327170f87b5f9eed` — contrato durable account-scoped de aceptación legal.
- `09092fec7e95d6ccc33aefb780bffdc0b81ff1a0` — provider runtime gated + browser bridge source-only + pruebas de provider fake/in-memory.
- `0602d6ca0f64280222a4b1522b36f3be77c65c87` — corrección focal del reporte del gate para exponer explícitamente `firestoreWrites=0`.

Archivos fuente del bloque:

- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`
- `backend/runtime/cxorbia-legal-acceptance-provider-v1.mjs`
- `app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js`
- `app/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js`
- `tools/qa/verify-i3-legal-acceptance-durable-source-only.mjs`

No se modificó `/app/modules`, `/app/core` ni el entrypoint productivo para activar este provider.

## Contrato durable congelado

- Firebase Auth verificado es autoridad de actor; UID cliente no es autoridad.
- Identidad exacta únicamente; fuzzy matching=false.
- Aceptación únicamente humana: `acceptanceMethod=human_ui`; automaticAcceptance=false.
- `acceptedAt` solo puede venir de server timestamp del provider.
- Receipt determinista por tenant/scope/project/namespace/actor/role/legalContent/version.
- Receipt create-only; una repetición exacta es idempotente y no agrega un segundo write.
- Cambio de versión legal genera receipt distinto y preserva el anterior.
- Read model provider-authoritative, memory-only en navegador y fail-closed ante ausencia, mismatch o ambigüedad.
- `#bnOk` es informativo y nunca constituye aceptación legal.
- Gate de write debe validarse antes de token verification o Firestore IO.
- Presupuesto futuro del comando `legal.acceptance.record`: máximo 1 receipt/1 Firestore write, Auth writes=0, passwordResets=0, histórico=0 y providers prohibidos=0.

## Contenido legal — límite explícito

Este bloque **no** aprobó ni materializó el texto legal TyA. La cadena demo/local vigente en `app/modules/configuracion.js` no se convierte silenciosamente en autoridad legal. Antes de cualquier materialización o aceptación real debe existir revisión humana del contenido legal exacto, versión y digest.

## Gate CI

El primer run del nuevo source (`31913585259`) falló únicamente porque el JSON del verificador no exponía la llave de reporte `firestoreWrites`, aunque la prueba source había finalizado y mostraba provider writes reales 0. No se repitió ningún provider execution.

Corrección focal: commit `0602d6ca0f64280222a4b1522b36f3be77c65c87`.

Gate canónico push:
- workflow run `31913700755`
- job `95082399402`
- conclusión `SUCCESS`
- todas las etapas I1/I2/frozen I3/overlay-aware/legal durable/current checkpoint: PASS.

Gate PR equivalente:
- workflow run `31913704247`
- job `95082407608`
- conclusión `SUCCESS`.

## Efectos reales del bloque

Provider credentials cargadas: `0`; provider reads reales: `0`; provider writes reales: `0`; Auth writes: `0`; Firestore writes: `0`; legal acceptance writes: `0`; password resets: `0`; historical credential access: `0`; historical reconciliation writes: `0`; otras identidades: `0`; HR/Rules/Storage/Make/Gemini/pagos: `0`; deploy: `0`; merge=false; producción=false.

## Histórico preservado

Run `31906391682` permanece congelado. Prohibido repetir reset/recovery/reconcile o acceder a su credencial. Toda continuación usa `passwordResets=0`.

## Avance

I1 PASS 15/15; I2 PASS 20/20; I3 sigue 0/25 hasta cierre integral.

**GO-LIVE: 35% completado / 65% pendiente.**

## Próximo gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

Precondición humana: revisar/confirmar el contenido legal TyA exacto, versión y digest y autorizar su materialización si todavía no existe provider-authoritative. Solo después puede existir un único write humano de aceptación y reanudarse Admin → creación/edición/readback/login del Shopper nuevo. Ninguna de esas acciones está autorizada por este source lock.
