# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-15 20:05 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP_SAFE__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_3_COUNSEL_SNAPSHOT_SOURCE_PASS__GO_LIVE_35__HUMAN_COUNSEL_REVIEW_NEXT__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; Firebase DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS 15/15. I2 PASS 20/20. Shopper histórico I3 PASS congelado run `31906391682`; reset histórico único consumido. Prohibido repetir reset/recovery/reconcile o acceder a credencial histórica. Toda continuación `passwordResets=0`.

Request08 run `31909354336`, job `95071998299`: STOP seguro `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Consumido/no rerun. Sin `shopper.create`, update, readback, login nuevo, Auth/Firestore writes o aceptación automática.

## Autoridad legal durable source-only

Source técnico durable final `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Exact identity, human-only, versioned receipt, server timestamp, provider ACK, idempotencia y fail-closed preparados; bridge no activado.

## Legal V0.3 no-code / rebrand-safe — source-only PASS

Nuevo patrón:

`perfil legal mutable no-code`
→ `snapshot de publicación inmutable con solo valores públicos aprobados`
→ `render canónico UTF-8/LF`
→ `SHA-256 después del render`
→ `receipt humano por legalVersion/contentDigest`.

Archivos vigentes:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`;
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`;
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`;
- `app/docs/CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`;
- `app/docs/PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`;
- `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md`.

V0.3 consolida V0.1+V0.2 para revisión profesional, pero está `NOT_APPROVED / NOT_PUBLISHED`. Los valores TyA siguen fuera de constantes runtime. El domicilio residencial registrado completo permanece restringido. El nombre de rebranding es dinámico y cada publicación futura congela el nombre visible de esa versión sin reescribir la historia.

## Evidencia técnica

HEAD fuente `768a1b43c10a054a254cfc2bd295aacdeae64c92` pasó `CXOrbia Phase A Live Execution Checkpoint`:
- run `31921002582`;
- job `95100754570`;
- conclusión `SUCCESS`;
- nuevo paso `Verify I3 immutable no-code legal publication snapshot source contract`: SUCCESS.

Decisión: `PASS_I3_LEGAL_PUBLICATION_SNAPSHOT_NOCODE_IMMUTABLE_SOURCE_ONLY`.

## Seguridad / efectos reales

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; historical access/reset/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; `/app/modules` cambios `0`; `/app/core` cambios `0`; product entrypoint activation `0`; deploy `0`; merge=false; producción=false.

## Revisión jurídica pendiente

El paquete profesional concentra únicamente decisiones todavía humanas:
- GT `GT-01..GT-08`;
- HN `HN-01..HN-06`;
- transversales `X-01..X-06`.

Debe cerrar identidad contractual, nivel de dirección pública, Shopper/no laboralidad, aceptación electrónica, privacidad, evidencias, retención, arbitraje, operación transfronteriza HN, licenciante/IP, proveedores/transferencias, banco y DPA/roles Cliente-TyA.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 no suma hasta PASS integral.

## Siguiente gate

`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`

Cuando el abogado cierre marcadores y Paula apruebe texto final, se generará versión publicable/snapshot/digest bajo autorización. Solo después podrá abrirse:
`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.

No iniciar request09, provider writes, aceptación, deploy, merge ni producción antes de esos gates.
