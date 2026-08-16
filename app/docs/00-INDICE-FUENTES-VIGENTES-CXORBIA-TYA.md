# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-15 17:59 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__TYA_LEGAL_V0_2_NOCODE_DRAFT__GO_LIVE_35__HUMAN_LEGAL_REVIEW_NEXT`

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
12. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — causa raíz request08 preservada.
13. **`SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md` — lock I3 técnico vigente y prevalente.**
14. `DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md` — base legal inicial, no aprobada.
15. **`DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md` — draft legal vigente para revisión humana.**
16. **`DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md` — decisiones humanas congeladas sin hardcodear tenant.**
17. **`backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — contrato reusable no-code/legal/rebrand-safe.**
18. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
19. `CAMBIOS-BACKEND.md`
20. `RESUMEN-PARA-CLAUDE.md`
21. `PENDIENTES-PROTOTIPO.md`
22. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`
23. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider write NO. Request08 está consumido; no rerun. Cualquier materialización del perfil legal, contenido legal o receipt sigue requiriendo gate humano explícito. Prohibido nueva candidata/rama/PR/Auth rebuild/reauditoría general.

## I3 histórico preservado

Run `31906391682`: Shopper histórico exacto PASS y congelado. No repetir reset, recovery, reconciliación ni acceso a credencial histórica. Toda continuación futura lleva `passwordResets=0`.

## Request08 — STOP seguro

Run `31909354336`, job `95071998299`: `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Fail-closed antes de Alta; sin `shopper.create`, sin aceptación automática, nuevos Auth/Firestore writes `0/0`. Request08 consumido; no rerun.

## Autoridad legal durable — source-only PASS

Gate canónico `31913700755` / job `95082399402`: SUCCESS. Gate PR `31913704247`: SUCCESS. Contrato/read model/provider runtime/browser bridge preparados para aceptación durable exact-identity, versionada, human-only, provider-ACK y fail-closed. Bridge no activado en product entrypoint. Provider/Auth/Firestore/legal writes reales `0`.

## TyA legal V0.2 — decisiones resueltas

El tenant TyA queda diseñado como configuración **no-code**: operador, países, contactos, retención, proveedores, controversias, branding/licenciante y evidencias se resuelven desde `tenantLegalProfile`/project policy provider-authoritative y no desde constantes de código.

Decisiones humanas congeladas: empresa mercantil individual establecida en Guatemala; operación Honduras administrada desde Guatemala por el mismo operador; contacto inicial legal/privacidad/incidentes editable; evidencia cruda mínimo deseado 60 días con default recomendado 90; arbitraje preferido con tratamiento diferenciado B2B/individual; rebranding previsto; titular/licenciante separado de la marca; cuenta bancaria completa permitida bajo controles reforzados; documentos mínimos; foto/video/audio/geolocalización configurables por proyecto; revisión jurídica final sí.

Los valores exactos específicos del tenant no se copian a runtime code. No se materializó ningún dato provider.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Siguiente acción exacta

Cerrar únicamente los pendientes legales restantes: domicilio comercial/legal público adecuado, nombre visible temporal/final de plataforma si el rebranding aún no está definido, revisión jurídica Guatemala/Honduras y consolidación V0.1+V0.2 en texto único. Después: versión final + SHA-256 final + aprobación humana. Solo entonces puede abrirse `PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.
