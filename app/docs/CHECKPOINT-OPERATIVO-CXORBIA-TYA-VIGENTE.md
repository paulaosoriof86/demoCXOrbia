# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_CONSUMED__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT__NO_PRODUCTION_YET`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; Firebase DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS 15/15. I2 PASS 20/20. Shopper histórico I3 PASS congelado run `31906391682`; reset histórico único consumido. Prohibido repetir reset/recovery/reconcile o acceder a credencial histórica. Toda continuación `passwordResets=0`.

Request08 run `31909354336`, job `95071998299`: STOP seguro `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Consumido/no rerun. Sin Shopper nuevo/Auth/Firestore writes ni aceptación automática.

## Autoridad legal durable source-only

Source durable `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Exact identity, human-only, versioned receipt, server timestamp, provider ACK, idempotencia y fail-closed preparados; bridge todavía no activado en producto.

## Decisión operativa legal 2026-08-16

Paula decidió continuar hacia producción sin detener el go-live por disponibilidad temporal de abogado. La revisión profesional GT/HN queda diferida post-go-live y **no se declara completada**.

Vigentes:
- `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`;
- `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`;
- `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.

## Materialización V0.4 — SOURCE PASS

Source lock prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.

Preparado:
- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`;
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`;
- `tools/qa/verify-i3-legal-v04-materialization-source-only.mjs`.

Presupuesto del futuro bootstrap DEV: exactamente `4` Firestore writes create-only — perfil legal `1`, Provider Registry core `1`, legalContent + version `2`; legalAcceptance/Auth/passwordResets/historical writes `0`.

El provider fuente rechaza placeholders, falso counsel, domicilio restringido público, colisión/overwrite y cualquier presupuesto fuera de gate. El provider readback queda preparado. La autoridad posterior al ACK será Firestore/provider, no el request/bootstrap.

Se corrigió además `app/adapters/cxorbia-command-adapter-v1.js`: `legal.acceptance.record` puede llegar al provider para cualquier rol autenticado únicamente como self-scoped human-confirmed command. No se ampliaron permisos operativos Shopper/Cliente.

## Evidencia canónica

HEAD técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9` pasó `CXOrbia Phase A Live Execution Checkpoint`:
- run `31959900456`;
- job `95196342385`;
- conclusión `SUCCESS`;
- nuevo paso V0.4 materialization provider source: `SUCCESS`.

## Patrón no-code / rebrand-safe

`perfil legal mutable provider-authoritative`
→ `snapshot público inmutable`
→ `render canónico UTF-8/LF`
→ `SHA-256 post-render`
→ `receipt humano por legalVersion/contentDigest`.

Los valores TyA serán configuración viva y editable, no constantes runtime. Rebranding o cambios posteriores no reescriben versiones históricas.

## Seguridad / efectos reales hasta este checkpoint

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; historical access/reset/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; product entrypoint activation `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 no suma hasta PASS integral.

## Gate siguiente

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

El próximo bloque autorizado debe:
1. resolver/renderizar snapshot público V0.4 con valores iniciales TyA;
2. ejecutar una sola materialización DEV con presupuesto exacto 4 writes;
3. validar provider readback/digest;
4. habilitar read model/runtime DEV sin localStorage como autoridad;
5. mostrar la versión publicada y permitir **solo aceptación humana**;
6. después crear una continuación I3 nueva para Admin/new Shopper, sin request08 ni tocar identidad histórica.
