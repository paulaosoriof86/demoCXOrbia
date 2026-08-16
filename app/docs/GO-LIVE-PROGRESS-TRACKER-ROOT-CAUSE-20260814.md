# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-16 10:38 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS; subgates parciales no inflan el porcentaje.

| Iteración | Peso | Estado | Evidencia vigente |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | Gate vigente conservado |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md` |
| I3 — Shopper persistence + real Auth continuity | 25 | 0/25, EN CURSO | Histórico PASS congelado; durable legal PASS; V0.4 interim + **materialization provider SOURCE PASS**; counsel diferido; ejecución provider + aceptación humana + Admin/new Shopper pendientes |
| I4 — Phase A operational flows | 25 | 0/25, NO INICIAR | Solo después de I3 PASS |
| I5 — final go-live validation | 15 | 0/15, NO INICIAR | Solo después de I4 PASS |

**35% completado / 65% pendiente.**

## I3 — no repetir

Historical exact Shopper PASS run `31906391682`; reset histórico consumido; `passwordResets=0`, cero credential access/reconcile/recovery. Request08 run `31909354336` / job `95071998299` consumido/no rerun.

## I3 — legal durable + V0.4

Durable acceptance source `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS.

Counsel GT/HN diferido post-go-live, no aprobado. V0.4 interina vigente con registro jurídico posterior.

## I3 — materialization provider SOURCE PASS

Source lock:
`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.

Preparados:
- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`;
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`;
- `tools/qa/verify-i3-legal-v04-materialization-source-only.mjs`.

Bootstrap futuro exacto en `cxorbia-backend-dev`: Firestore `4` create-only = legalProfile `1` + Provider Registry `1` + legalContent/version `2`; legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/payment `0`.

El verifier bloquea placeholders, falso counsel, domicilio restringido público, collision/overwrite y budget drift. Readback provider preparado.

`app/adapters/cxorbia-command-adapter-v1.js` corrigió el paso del comando self-scoped `legal.acceptance.record` para roles autenticados, sin abrir otros writes de Shopper/Cliente.

CI canónico HEAD técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: run `31959900456`, job `95196342385`, SUCCESS.

## No-code/rebranding

`perfil mutable provider-authoritative → snapshot público inmutable → render UTF-8/LF → SHA-256 → aceptación humana por version/digest`.

Valores TyA no hardcodeados. Rebranding/config posterior no reescribe acuerdos históricos.

## Pendiente ruta crítica I3

1. gate exacto `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`;
2. render/snapshot V0.4 con valores públicos TyA y digest final;
3. reutilizar/extender carril existente para ejecución DEV, sin workflow nuevo;
4. materializar 4 docs + readback;
5. wiring/read model DEV durable;
6. aceptación exclusivamente humana + provider ACK;
7. nueva continuación I3 Admin/new Shopper, sin request08;
8. Auth + claims + membership + profile/shopper + crosswalk exactos;
9. login/reload/new-tab/segundo contexto.

Counsel GT/HN/X queda post-go-live y no bloquea esta ruta interina.

Hasta cierre integral, I3 permanece `0/25` y GO-LIVE **35/65**.

## Gate actual

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`

No autoriza aceptación automática; el humano autenticado acepta desde UI.
