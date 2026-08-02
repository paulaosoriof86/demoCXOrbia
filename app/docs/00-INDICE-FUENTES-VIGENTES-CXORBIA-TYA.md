# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_FRAGMENTED_HUMAN_RUNTIME_PROVEN__UNIFIED_CUMULATIVE_ROOT_FIX_CODE_APPLIED__PENDING_READONLY_RUNTIME_GATES__NO_DEPLOY_NO_PRODUCTION`

## 1. Repositorio y destinos

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama viva `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes obligatorias vigentes

1. reglas maestras y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-RECUPERACION-BASELINE-ACUMULATIVA-UNICA-20260801.md`;
7. evidencias aprobadas de login, R20 full-history y auditoría C6 live domain/finance/shopper;
8. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR #7 y HEAD vivo.

## 3. Regla prevalente de fuente

La HR viva es autoridad para **todos los periodos detectados**, no únicamente el mes actual y no números congelados de cortes anteriores.

Estado de fuente verificado:

- 14 periodos desde junio 2025 hasta julio 2026;
- 616 visitas históricas en el corte actual;
- 208 shoppers;
- no existe agosto 2026 en HR;
- agosto no puede aparecer ni heredarse de julio hasta que Paula agregue la fuente.

Cuando la HR cambia, KPIs, fases, detalle, histórico, comparativo, Portal Cliente, Portal Shopper y Finanzas deben recomponerse desde la misma revisión.

## 4. P0 humano vigente

El build publicado abrió un carril reducido que:

- deshabilitó el login real en la entrada humana;
- permitió Shopper sin identidad;
- dejó inactivos los adapters canónicos salvo token oculto;
- fragmentó KPIs, fases, comparativo, perfil, certificación, Cliente y Finanzas.

El PASS técnico anterior queda supersedido como release PASS. Corte 6 no está congelado.

## 5. Root fix de código

El HEAD vivo recupera una sola entrada `authenticated-human-canonical`:

- login visible Usuario + Contraseña;
- Auth/claims para principal y alcance;
- HR viva como autoridad operacional;
- Firestore protegido como overlay exacto;
- dominio, Shopper y Finanzas canónicos;
- comparativo de todos los periodos HR;
- honorario contractual Q60 GT / L200 HN;
- sin módulos paralelos ni shell reducido.

No se tocaron `app/modules/*`. No hubo deploy ni writes.

## 6. Gate vivo

`STATIC ROOT CONTRACT → READ-ONLY AUTH STAFF/CLIENT/SHOPPER → HR ALL PERIODS → KPI=PHASE=DRILL → HISTORICAL ALL PERIODS → PROFILE/CERT/HISTORY → CLIENT → FINANCE CONFIG → 3 RELOADS → EVIDENCE`.

## 7. Después del PASS

Solo después del PASS local/read-only:

1. solicitar autorización fresca de un único deploy DEV;
2. ejecutar paridad y gate remoto idéntico;
3. validación humana acumulativa;
4. `APROBADO C6 → FREEZE`;
5. Paula agrega agosto a HR;
6. reconciliación agosto → disponibles → postulaciones → gate multirol → cutover autorizado.

## 8. Estado seguro

Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes 0; Hosting deploy 0 en este bloque; merge false; producción false.
