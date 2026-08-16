# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT`

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
16. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md` — lock de decisión interina.
17. **`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md` — source lock técnico prevalente de I3 legal.**
18. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md` — counsel diferido y no bloqueante.
19. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md` — candidata interina vigente.
20. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md` — counsel post-go-live abierto.
21. `PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md` — preguntas GT/HN/X conservadas.
22. `MATRIZ-PRE-REVISION-JURIDICA-TYA-V0.3-FUENTES-PRIMARIAS-20260816.md` — soporte primario.
23. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — perfil legal mutable no-code.
24. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json` — snapshot público inmutable.
25. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json` — receipt humano durable.
26. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json` — presupuesto exacto del bootstrap DEV.
27. `backend/runtime/cxorbia-legal-publication-provider-v1.mjs` — provider de materialización source-only.
28. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
29. `CAMBIOS-BACKEND.md`.
30. `RESUMEN-PARA-CLAUDE.md`.
31. `PENDIENTES-PROTOTIPO.md`.
32. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`.
33. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider write requiere el gate exacto indicado abajo. Request08 consumido/no rerun. No nueva candidata/rama/PR/workflow.

## I3 histórico preservado

Run `31906391682`: Shopper histórico exacto PASS y congelado. Reset histórico único consumido. Toda continuación `passwordResets=0`; sin credential access/reconcile/recovery.

## Legal interina + materialización SOURCE PASS

Counsel GT/HN queda `deferred_post_golive`; no puede presentarse como completado. V0.4 está preparada como candidata interina.

Provider source-only preparado para cuatro documentos create-only en `cxorbia-backend-dev`: perfil legal, Provider Registry core, legalContent y versión inmutable. Rechaza placeholders, falso counsel, domicilio restringido, aceptación automática, overwrite y budget drift.

`legal.acceptance.record` cruza el command boundary como self-scoped human-confirmed command para cualquier rol autenticado; provider deriva UID exacto del ID token y los permisos operativos ordinarios no se relajaron.

## Evidencia canónica

- técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: run `31959900456`, job `95196342385`, SUCCESS;
- documental `7862a4f67fe5ce526d5e4b465e9e19bff65a28d8`: run `31960246332`, job `95197007415`, SUCCESS;
- **checkpoint final `d50fbbd07bedca89b03c667e97ab76a830d644bc`: run `31960342757`, job `95197241342`, SUCCESS.**

Todos incluyen `Verify I3 V0.4 interim materialization provider source contract` PASS.

## Patrón no-code/rebrand-safe

`tenantLegalProfile mutable provider-authoritative → snapshot inmutable → render UTF-8/LF → SHA-256 post-render → receipt humano por legalVersion/contentDigest`.

Los datos concretos TyA se materializan como configuración viva/no-code y no como constantes runtime. Rebranding no reescribe aceptaciones históricas.

## Efectos reales

Provider credentials/reads/writes `0/0/0`; Firestore/Auth/legalContent/legalAcceptance writes `0`; passwordResets `0`; histórico access/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false; aceptación automática=false.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Siguiente acción exacta

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Objetivo: autorizar bootstrap DEV exacto de cuatro writes, resolver/renderizar V0.4 desde valores públicos TyA, activar read model/runtime DEV y permitir aceptación exclusivamente humana. Después: continuación I3 nueva Admin/new Shopper, sin request08 ni acceso histórico.
