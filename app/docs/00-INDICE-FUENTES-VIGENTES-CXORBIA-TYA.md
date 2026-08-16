# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT`

## Fuentes vigentes

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
8. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
9. `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
10. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
11. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — histórico PASS congelado.
12. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — request08 consumido.
13. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md` — acceptance durable source-only.
14. `SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md` — antecedente V0.3.
15. `SOURCE-LOCK-ITERATION3-LEGAL-V0.3-PRECOUNSEL-PRIMARY-SOURCE-VERIFICATION-PASS-20260816.md` — pre-verificación primaria.
16. **`DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md` — decisión humana prevalente: counsel diferido y no bloqueante para go-live interino.**
17. **`CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md` — candidata interina vigente para preparación de publicación; sin marcadores internos de counsel en el texto visible.**
18. **`PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md` — registro jurídico post-go-live; no marcar como cerrado.**
19. `PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md` — preguntas GT/HN/X conservadas para counsel posterior.
20. `MATRIZ-PRE-REVISION-JURIDICA-TYA-V0.3-FUENTES-PRIMARIAS-20260816.md` — soporte primario.
21. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — perfil legal mutable no-code.
22. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json` — snapshot público inmutable.
23. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json` — receipt humano durable.
24. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
25. `CAMBIOS-BACKEND.md`.
26. `RESUMEN-PARA-CLAUDE.md`.
27. `PENDIENTES-PROTOTIPO.md`.
28. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`.
29. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider write requiere gate técnico exacto. Request08 consumido/no rerun. No nueva candidata/rama/PR/workflow.

## I3 histórico preservado

Run `31906391682`: Shopper histórico exacto PASS y congelado. Reset histórico único consumido. Toda continuación `passwordResets=0`; sin credential access/reconcile/recovery.

## Decisión legal operativa 2026-08-16

Paula decidió no detener el go-live por ausencia temporal de abogado. La revisión profesional GT/HN queda diferida post-go-live y **no puede presentarse como completada**.

Esto elimina exclusivamente el bloqueo `COUNSEL_REQUIRED_BEFORE_PROVIDER`; no elimina la aceptación humana, versionado, digest, provider ACK, seguridad ni los gates técnicos.

V0.4 aplica lenguaje conservador y conserva como pendiente separado todos los códigos GT/HN/X.

## Patrón no-code/rebrand-safe

`tenantLegalProfile mutable no-code`
→ `snapshot de publicación con solo valores públicos aprobados`
→ `render canónico UTF-8/LF`
→ `SHA-256 post-render`
→ `receipt humano por legalVersion/contentDigest`.

Los datos concretos TyA deben quedar en autoridad viva provider/no-code, no como constantes de producto. El rebranding no reescribe aceptaciones históricas.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Siguiente acción exacta

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Objetivo: preparar/materializar la versión V0.4 y perfil/snapshot legal en `cxorbia-backend-dev`, habilitar el read model durable y dejar que la persona autenticada acepte exclusivamente desde UI humana. Después, continuar con Admin/new Shopper mediante una nueva continuación I3 sin tocar la identidad histórica.

No aceptación automática. No reutilizar request08. No password reset histórico. Provider/Auth/Firestore/deploy/producción solo dentro de sus gates explícitos.
