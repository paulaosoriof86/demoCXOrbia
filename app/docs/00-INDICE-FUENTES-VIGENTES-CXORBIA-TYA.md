# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_CANONICAL_ROOT_FIX_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Backend/Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocar sin gate explícito.

## 2. Lectura obligatoria vigente
1. maestros y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. addenda C6 de P0/domain, Finanzas/Liquidaciones, Portal Shopper y Reservas;
6. `evidence/CORTE6-HUMAN-CUMULATIVE-VISUAL-P0-LATEST.json` como evidencia histórica del P0;
7. `evidence/CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json` v6;
8. `evidence/CORTE6-CANONICAL-ROOT-FIX-HOSTING-LATEST.json` como evidencia remota vigente;
9. adapters v2 y gates canónicos;
10. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR#7 y HEAD vivo.

Los PASS técnicos previos al P0 son evidencia histórica, no estado de release. El PASS remoto actual tampoco sustituye la validación humana requerida para freeze.

## 3. Baseline protegida
Corte3 FROZEN; R17N1,406/1,406; Corte5 14/616 PASS; Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido120/329 PASS; finanzas/pagos canónicos preservados.

## 4. Root fix canónico publicado
Hosting DEV ejecutado una sola vez sobre el proyecto y site existentes.

Decisión:
`PASS_C6_CANONICAL_ROOT_FIX_EXISTING_HOSTING_DEV_REMOTE_SMOKE`.

Paridad remota exacta confirmada para:
- composer/semántica/watcher v2;
- bridge transversal;
- finance/liquidation read model;
- portal Shopper canónico;
- guard de Reservas fail-closed;
- `index-backend-dev.html`.

HR remota conserva14 periodos/616 visitas/208 shoppers; julio44=GT34+HN10, realizadas40, cuestionario38, submitidas33, fuera de rango accionable1 y duplicados técnicos0.

## 5. Contratos vigentes
- HR es autoridad operativa.
- Una sola faceta alimenta todas las superficies.
- Identidad por evidencia técnica exacta; no dedupe por nombre/teléfono/email.
- Perfil completo por campos reales.
-40 realizadas y33 submitidas deben aparecer en Liquidaciones sin inferir pagos.
- Refresh idempotente y estable.
- Reservas no presenta localStorage/fixtures como backend; permanece read-only/fail-closed hasta fuente real.
- `/app/modules/*` y `/app/core/*` no fueron modificados por el root fix.

## 6. Gate vivo
`HUMAN VISUAL ACUMULATIVA DEL BUILD PUBLICADO → APROBADO → FREEZE C6`.

La revisión debe cubrir Dashboard/fases, comparativo, tres refresh, Shoppers, portal Shopper, Finanzas/Movimientos/Liquidaciones/Beneficios, Reportes y Reservas.

No solicitar otro deploy mientras este build no haya sido revisado visualmente.

## 7. Después del freeze
Conexión exacta de agosto y/o Reservas real según prioridad, cada bloque con contrato, evidencia, autorización y gate propios. No copiar julio ni inventar datos.

## 8. Seguridad
Deploy Hosting DEV1; Cloud Run deploys0; Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos/reservas writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
