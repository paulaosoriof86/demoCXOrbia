# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__DOMAIN_FINANCE_SHOPPER_PORTAL_FIX_PASS__LIVE_HR_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- Backend DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocar sin gate explícito.

## 2. Lectura obligatoria vigente
1. este índice;
2. maestros y addenda activos declarados previamente;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-P0-CANONICAL-DOMAIN-ROOT-FIX-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-FINANZAS-LIQUIDACIONES-CANONICAS-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-SHOPPER-PORTAL-CANONICO-20260731.md`;
8. `ACADEMIA-IMPACTO-C6-DOMINIO-CANONICO-Y-ESTADOS-ACCIONABLES-20260731.md`;
9. `evidence/CORTE6-HUMAN-CUMULATIVE-VISUAL-P0-LATEST.json`;
10. `evidence/CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`;
11. `app/adapters/tya-cumulative-read-model-v2.js`;
12. `app/adapters/tya-canonical-state-semantics-v2.js`;
13. `app/adapters/tya-live-source-refresh-watch-v2.js`;
14. `app/adapters/tya-c6-domain-consistency-bridge.js`;
15. `app/adapters/tya-canonical-finance-read-model-v2.js`;
16. `app/adapters/tya-canonical-shopper-portal-v2.js`;
17. gates de dominio, finanzas y portal Shopper;
18. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR#7 y HEAD vivo.

Los PASS técnicos anteriores al FAIL humano son evidencia histórica, no estado de release.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones.
- Corte5:14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 4. P0 humano probado
El Hosting DEV actual conserva regresiones:
- KPIs y fases contradictorios;
- comparativo histórico vacío;
- refresh con salto de contenido/sidebar;
- identidades Shopper divididas y conteos210/219;
- perfiles falsamente completos, sin datos mínimos/certificación/histórico;
- portal Shopper Activas1/Historial0/Beneficios vacío;
- periodo visual y contenido financiero desincronizados;
-33 submitidas omitidas de Liquidaciones.

Corte6 no está congelado y agosto no inicia.

## 5. Root fix preparado en rama viva
- una máquina canónica de estados/facetas;
- HR como autoridad operativa;
- perfiles sin crosswalk exacto fuera del listado y en review queue;
- no dedupe por nombre/teléfono/email;
- perfil completo calculado por datos reales;
- portal Shopper por identidad exacta e histórico completo;
- certificación y credenciales visibles cuando existen/son derivables con vínculo exacto;
- toda visita realizada entra a Liquidaciones, incluidas33 submitidas;
- fuente exacta de cruce/pago conserva autoridad; sin fuente se bloquea lote/pago;
- misma información HR = cero rerender;
- cambio real =1 apply+1 compose+1 render;
- periodo/proyecto/vista/scroll preservados desde el modelo.

No se modificó `/app/modules/*` ni `/app/core/*`.

## 6. Gates actuales — PASS
Evidencia v5:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_CANONICAL_SHOPPER_PORTAL_CONTRACT`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR viva:
-14 periodos/616 visitas/208 shoppers;
-JUL44=GT34+HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-liquidationCandidates33;
-fuera de rango accionable1;
-evidencia histórica fuera de rango7;
-duplicados de llaves0.

## 7. Límites honestos
El código nuevo está en GitHub, no desplegado. WhatsApp solo aparece si existe en HR/perfil protegido; no se fabrica. Persistir/complementar datos, crear Auth o escribir Firestore requiere write plan y autorización futura específica.

Reportes, Reservas y demás módulos no presentan evidencia de regresión específica en estas capturas, pero deben incluirse obligatoriamente en el próximo remote/human smoke acumulativo.

## 8. Gate vivo
La autorización Hosting anterior está consumida.

Secuencia exacta:
`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO INTEGRAL → HUMAN VISUAL ACUMULATIVA → FREEZE C6 → AGOSTO`.

No Cloud Run ni provider/data writes previstos.

## 9. Estado seguro
Bloque correctivo: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
