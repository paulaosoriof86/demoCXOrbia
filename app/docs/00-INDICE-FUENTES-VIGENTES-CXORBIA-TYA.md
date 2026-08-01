# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__DOMAIN_FINANCE_SHOPPER_FIX_PASS__RESERVATIONS_FAIL_CLOSED_PASS__LIVE_HR_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Backend/Hosting DEV `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocar sin gate explícito.

## 2. Lectura obligatoria vigente
- maestros y addenda activos;
- `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- addenda C6 de P0/domain, Finanzas/Liquidaciones, Portal Shopper y Reservas;
- Academia de dominio/estados accionables;
- `evidence/CORTE6-HUMAN-CUMULATIVE-VISUAL-P0-LATEST.json`;
- `evidence/CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json` v6;
- adapters v2 de composer, semántica, watcher, consistencia, finanzas, portal Shopper y guard de Reservas;
- gates de dominio, finanzas, portal Shopper y Reservas;
- `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR#7 y HEAD vivo.

Los PASS técnicos anteriores al FAIL humano son evidencia histórica, no estado de release.

## 3. Baseline protegida
Corte3 FROZEN; R17N1,406/1,406; Corte5 14/616 PASS; Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido120/329 PASS; finanzas/pagos canónicos preservados.

## 4. P0 humano probado
El Hosting actual conserva KPIs/fases contradictorios, comparativo vacío, refresh con salto, shoppers210/219, identidad/perfil/histórico/certificación divididos, portal Shopper incompleto, periodo financiero incoherente y33 submitidas omitidas de Liquidaciones.

Corte6 no está congelado y agosto no inicia.

## 5. Root fix preparado — no desplegado
- HR como autoridad y una faceta canónica para todas las superficies;
- unmatched profiles a review queue, sin dedupe visual;
- perfil completo por campos reales;
- portal Shopper por identidad exacta e histórico completo;
-40 realizadas presentes en Liquidaciones, incluidas33 submitidas;
- fuente/pago exactos preservados y ausencia de fuente bloqueada;
- mismo contenido HR sin rerender;
- periodo/proyecto/vista/scroll preservados desde el modelo;
- Reservas ya no usa localStorage/fixtures como fuente conectada: queda read-only y fail-closed hasta conectar proveedor canónico.

No se modificó `/app/modules/*` ni `/app/core/*`.

## 6. Gates v6 — PASS
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_CANONICAL_SHOPPER_PORTAL_CONTRACT`;
- `PASS_C6_CANONICAL_RESERVATIONS_SOURCE_GUARD`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR:14 periodos/616 visitas/208 shoppers; JUL44=GT34+HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia histórica7; duplicados0.

## 7. Límites honestos
WhatsApp solo aparece si existe en HR/perfil protegido. Persistir/complementar datos o Auth requiere write plan y autorización específica.

Reportes ya consume `visitFacets/visitBucketFns` en código, pero requiere validación humana. Reservas está protegida contra datos falsos, no conectada operativamente: conectar su fuente es un bloque posterior indispensable si se exige para producción.

## 8. Gate vivo
Código en GitHub, no en Hosting DEV; autorización anterior consumida.

`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO INTEGRAL → HUMAN VISUAL ACUMULATIVA → FREEZE C6 → CONEXIÓN REAL DE RESERVAS/AGOSTO SEGÚN PRIORIDAD`.

No Cloud Run ni data/provider writes previstos para publicar este código.

## 9. Estado seguro
Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos/reservas writes0; merge=false; producción=false.
