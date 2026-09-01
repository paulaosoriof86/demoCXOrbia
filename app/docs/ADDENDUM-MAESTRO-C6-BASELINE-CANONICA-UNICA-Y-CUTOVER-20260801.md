# ADDENDUM MAESTRO — C6 baseline canónica única y carril de cutover

**Fecha:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_FINANCE_ROOT_FIX_SOURCE_ONLY_PASS__REMOTE_REVALIDATION_PENDING__NO_PRODUCTION`

## 1. Baseline única

Solo existe una baseline acumulativa sobre `docs-tya-v6-v71-audit`. Queda prohibida cualquier candidata, shell reducido, rama, PR, Firebase, Hosting o workflow paralelo.

## 2. PASS remoto preservado

- HR viva y paridad remota;
- Staff con tres recargas y nueva pestaña;
- Shopper con identidad exacta, `ownVisits=1`, tres recargas y nueva pestaña;
- Cliente con scope exclusivo `cinepolis`, tres recargas y nueva pestaña.

El P0 Shopper restaurado queda cerrado remotamente.

## 3. Contrato financiero canónico

La configuración financiera se identifica por llave técnica `tenantId::projectId` y debe materializarse en todos los periodos canónicos antes de `normalizeAll()`.

Cinépolis:

- llave `tya::cinepolis`;
- modelo delegado;
- coordinación delegada;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- comisión y reparto configurables;
- valores no inventados.

## 4. Root fix source-only

Causa corregida:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

Archivos:

- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `tools/qa/tya-c6-finance-root-fix-gate.mjs`;
- evidencia `CORTE6-FINANCE-ROOT-FIX-SOURCE-ONLY-LATEST.json`.

Decisión:

`PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE`.

## 5. Operaciones prohibidas

- no desplegar sin autorización fresca;
- no clasificar por nombre visual;
- no mover precedencia financiera a módulos UI;
- no omitir el gate financiero predeploy;
- no Firestore/Auth/HR/Rules/Storage writes;
- no Make/Gemini/pagos;
- no merge ni producción antes del PASS acumulativo.

## 6. Gate restante

`SOURCE LOCK NUEVO → FINANCE ROOT-FIX GATE → GATE ACUMULATIVO → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD → HR → STAFF → SHOPPER → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA → FREEZE`.

## 7. Estado seguro

El bloque financiero fue source-only: Hosting deploys 0, provider writes 0, merge false y producción false.
