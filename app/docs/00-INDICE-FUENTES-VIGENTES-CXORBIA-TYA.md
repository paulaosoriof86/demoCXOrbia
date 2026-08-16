# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_INTERIM__MATERIALIZATION_PROVIDER_SOURCE_PASS__COUNSEL_DEFERRED__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT`

## Autoridad vigente
Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

Prevalecen las reglas maestras/addenda activos, `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` y **`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`**.

V0.4 interina: `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`. Counsel GT/HN queda post-go-live y no se presenta como aprobado.

## Congelado
Historical Shopper run `31906391682` PASS; reset único consumido; `passwordResets=0`; cero access/reconcile/recovery. Request08 consumido/no rerun.

## Materialización preparada
Provider source-only + contrato exacto + verifier PASS. Futuro bootstrap DEV: Firestore `4` create-only = legalProfile `1` + core Provider Registry `1` + legalContent/version `2`; legalAcceptance/Auth/reset/historical/HR/Rules/Storage/Make/Gemini/payment `0`; automaticAcceptance=false; humanAcceptanceRequired=true.

`legal.acceptance.record` es self-scoped/human-confirmed; provider deriva UID exacto del ID token y no amplía permisos operativos.

## Evidencia
HEAD funcional/documental canónico verificado `feb6cb776b6b8f69dfae90cba2f8864f148c9ab0`: run `31960476112`, job `95197565971`, **SUCCESS**, incluyendo V0.4 materialization provider source contract. Los commits de documentación posteriores no ejecutan provider IO.

## Progreso
**35% completado / 65% pendiente. I3 0/25.**

## Único gate siguiente
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Autoriza bootstrap DEV exacto de 4 writes + wiring/runtime DEV. La aceptación sigue siendo exclusivamente humana. Después: continuación I3 nueva Admin/new Shopper, sin request08 ni identidad histórica.
