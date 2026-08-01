# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__CANONICAL_DOMAIN_AND_FINANCE_FIX_CODE_PASS__LIVE_HR_ROW_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- Backend DEV `cxorbia-backend-dev`; Hosting DEV site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. maestro de reglas/contexto/continuidad vigente;
3. addendum vigente de empalme directo/carril file-aware;
4. addendum maestro de Academia profunda/interactiva;
5. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`;
6. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`;
7. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
8. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
9. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
10. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-P0-CANONICAL-DOMAIN-ROOT-FIX-20260731.md`;
11. `CAMBIOS-BACKEND-ADDENDUM-C6-FINANZAS-LIQUIDACIONES-CANONICAS-20260731.md`;
12. `ACADEMIA-IMPACTO-C6-DOMINIO-CANONICO-Y-ESTADOS-ACCIONABLES-20260731.md`;
13. `evidence/CORTE6-HUMAN-CUMULATIVE-VISUAL-P0-LATEST.json`;
14. `evidence/CORTE6-CANONICAL-DOMAIN-CONSISTENCY-GATE-LATEST.json`;
15. `evidence/CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`;
16. `app/adapters/tya-cumulative-read-model-v2.js`;
17. `app/adapters/tya-canonical-state-semantics-v2.js`;
18. `app/adapters/tya-live-source-refresh-watch-v2.js`;
19. `app/adapters/tya-c6-domain-consistency-bridge.js`;
20. `app/adapters/tya-canonical-finance-read-model-v2.js`;
21. `tools/qa/tya-c6-domain-consistency-regression-gate.mjs`;
22. `tools/qa/tya-c6-canonical-finance-read-model-gate.mjs`;
23. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker, PR#7 y HEAD vivo.

Los documentos del stable composer/Hosting remote PASS anterior permanecen como evidencia histórica. No prevalecen sobre el FAIL humano ni sobre este índice/checkpoint.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 4. Estado real de Corte6
El Hosting anterior pasó un smoke técnico de assets/idempotencia, pero la validación humana posterior demostró P0 semánticos transversales:
- KPIs y flujo por fases con estados distintos;
- comparativo histórico vacío;
- refresh moviendo contenido/sidebar;
- identidades Shopper divididas y conteos 210/219;
- perfiles falsamente completos, sin credenciales/WA/histórico/certificación;
- portal Shopper e información financiera incoherentes;
- periodo visual y periodo de contenido desincronizados;
-33 visitas submitidas omitidas de Liquidaciones por un switch literal antiguo.

Corte6 no está congelado y agosto no inicia.

## 5. Causa raíz vigente
- múltiples máquinas de estado literales fuera de `canonicalFacets`;
- perfiles protegidos sin crosswalk exacto anexados al listado operacional;
- watcher con firma/timestamps, scroll y select DOM no canónicos;
- completitud por flag heredado;
- portal Shopper limitado a una visita por estado;
- identidad, periodo y finanzas proyectados de forma parcial;
- `CX.liq.estadoFromVisita` no reconocía `submitida` y omitía la mayoría del ciclo financiero.

## 6. Root fix en rama viva
El runtime DEV preparado:
- usa HR como autoridad de visitas/periodos/estado;
- alimenta todos los consumidores con una faceta canónica;
- conserva evidencia histórica separada de estado accionable;
- excluye de operación perfiles sin vínculo técnico y los envía a revisión;
- calcula completitud real;
- proyecta certificación, histórico Shopper y finanzas por identidad/periodo canónicos;
- incluye las40 visitas realizadas de julio en Liquidaciones, sin omitir las33 submitidas;
- conserva autoridad de cruce/pago exacto y bloquea lote/pago si falta fuente financiera;
- evita rerender si el contenido no cambió;
- preserva scroll de `.content` y `#rail` sin restaurar selects DOM aparte del modelo.

No se modificó `/app/modules/*` ni `/app/core/*`.

## 7. Gates actuales — PASS
La evidencia v4 registra simultáneamente:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR viva:
-14 periodos/616 visitas/208 shoppers HR;
-JUL44 = GT34 + HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-liquidationCandidates33;
-fuera de rango accionable1;
-evidencia histórica fuera de rango7;
-duplicate visit/shopper IDs0.

## 8. Identidad y datos
No fusionar por nombre/teléfono/email. El patrón de credenciales puede derivarse en lectura solo para identidad exacta; no materializa Auth/Firestore. WhatsApp debe existir en fuente real. Conflictos siguen en revisión.

## 9. Gate vivo
El nuevo root fix está en GitHub y **no está desplegado**. La autorización Hosting anterior fue consumida.

Secuencia exacta:
`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO → HUMAN VISUAL ACUMULATIVA → FREEZE C6 → AGOSTO`.

No Cloud Run ni provider/data writes previstos para publicar este código.

## 10. Estado seguro
Bloque correctivo actual: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
