# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_CONSUMED__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__DOCS_RECONCILED__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT__NO_PRODUCTION_YET`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; Firebase DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS 15/15. I2 PASS 20/20. Shopper histórico I3 PASS congelado run `31906391682`; reset histórico único consumido. Prohibido repetir reset/recovery/reconcile o acceder a credencial histórica. Toda continuación `passwordResets=0`.

Request08 run `31909354336`, job `95071998299`: STOP seguro `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Consumido/no rerun. Sin Shopper nuevo/Auth/Firestore writes ni aceptación automática.

## Autoridad legal durable source-only

Source durable `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Exact identity, human-only, versioned receipt, server timestamp, provider ACK, idempotencia y fail-closed preparados; bridge todavía no activado en producto.

## Decisión operativa legal 2026-08-16

Counsel GT/HN queda diferido post-go-live y **no se declara completado**. V0.4 es la candidata interina vigente, con registro jurídico posterior preservado.

## Materialización V0.4 — SOURCE PASS

Source lock prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.

Preparado:
- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`;
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`;
- `tools/qa/verify-i3-legal-v04-materialization-source-only.mjs`;
- command boundary self-scoped para `legal.acceptance.record` en `app/adapters/cxorbia-command-adapter-v1.js`.

Futuro bootstrap DEV: exactamente `4` Firestore create-only — legalProfile `1`, Provider Registry core `1`, legalContent/version `2`; legalAcceptance/Auth/passwordResets/historical `0`.

Provider rechaza placeholders, falso counsel, domicilio restringido público, colisión/overwrite y budget drift. Readback preparado. Después del ACK la autoridad será provider/Firestore, no el request ni código runtime.

## Evidencia canónica técnica

HEAD técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: workflow `31959900456`, job `95196342385`, `SUCCESS`, incluido `Verify I3 V0.4 interim materialization provider source contract`.

## Reconciliación documental posterior

- source lock materialization: `86b8073e2349edff91d4e6401f93ce9981d2497c`;
- índice vivo: `d5e6c328e38020e10f09a987e9383077544b9c86`;
- checkpoint materialization: `b345b9a58fb419203972a53e208044e176fca8af`;
- CAMBIOS: `fbbfefbcd02ff6b24656c047d0f7c6589452a912`;
- RESUMEN-PARA-CLAUDE: `cf0df531669ad8d4222d8cf9d7a2e898247e562f`;
- PENDIENTES-PROTOTIPO: `48752d130f5ae9d734c38c82ceadfeff3d1f14b6`;
- tracker: `5e00697049a8759930fb8bc7996b56f19823a49e`;
- Academia: `10207d5d950c984e127046f6e8496c42e602b37e`.

## Infraestructura de ejecución existente

`CXOrbia Phase A Firestore Materialization Executor` fue inspeccionado: hoy su `execute` real está limitado a `emulator`. No se declarará DEV materializado usando esa ruta sin gate/extension exactos. Se reutilizará un carril existente; no se creará workflow nuevo.

## Patrón no-code / rebrand-safe

`perfil legal mutable provider-authoritative → snapshot público inmutable → render UTF-8/LF → SHA-256 post-render → receipt humano por legalVersion/contentDigest`.

Los valores TyA serán configuración viva/editable y no constantes runtime. Rebranding/config posterior no reescriben versiones históricas.

## Seguridad / efectos reales hasta este checkpoint

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; historical access/reset/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; product entrypoint activation `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 no suma hasta PASS integral.

## Gate siguiente

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

El siguiente bloque debe resolver/renderizar V0.4, ejecutar un único bootstrap DEV de cuatro writes, validar readback/digest, habilitar runtime/read model DEV y dejar la aceptación exclusivamente a la persona autenticada. Después: continuación I3 nueva para Admin/new Shopper, sin request08 ni identidad histórica.
