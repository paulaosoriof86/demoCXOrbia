# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_FINANCE_ROOT_FIX_SOURCE_ONLY_PASS__REMOTE_REVALIDATION_PENDING__NO_PRODUCTION`

## 1. Objetivo y arquitectura

TyA/Cinépolis es el primer tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev` es DEV canónico y `tya-plataforma` el Hosting final.

La baseline es única y acumulativa sobre `docs-tya-v6-v71-audit`. No crear plataforma, candidata, rama, PR, Firebase, Hosting o workflow alternos.

## 2. Secuencia obligatoria

`FUENTE VIVA → IDENTIDAD → READ MODEL → CONFIGURACIÓN FINANCIERA → MATERIALIZACIÓN → NORMALIZACIÓN → GATE SEMÁNTICO → SOURCE LOCK → AUTORIZACIÓN → DEPLOY EXACTO → PARIDAD → GATE REMOTO → VALIDACIÓN HUMANA → FREEZE/CUTOVER`.

Debe distinguirse siempre:

- correctivo aplicado en fuente;
- gate local PASS;
- release publicada;
- paridad remota;
- gate remoto acumulativo;
- aprobación humana.

## 3. Baseline funcional preservada

- HR viva: 14 periodos, junio 2025–julio 2026, 616 visitas.
- Agosto ausente.
- Staff remoto PASS.
- Shopper remoto PASS con identidad exacta, 208 shoppers, `ownVisits=1`, tres recargas y nueva pestaña.
- Cliente remoto PASS con alcance exclusivo `cinepolis`, tres recargas y nueva pestaña.
- Producción intacta.

## 4. Ownership canónico

1. HR viva: operación e historia.
2. Firestore protegido: identidad/perfil/certificación por crosswalk exacto.
3. ProjectConfig: modelo financiero por llave técnica `tenantId::projectId`.
4. Objetos canónicos: materializan projectConfig antes de normalizar.
5. Finanzas/pagos: consumen únicamente el objeto canónico coherente.

## 5. Root fix financiero vigente

Causa corregida en fuente:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

El contrato financiero ahora:

- resuelve por llaves técnicas, nunca por nombre;
- materializa antes de `normalizeAll()`;
- conserva directo/delegado/regional;
- mantiene fail-closed cuando falta configuración;
- materializa `tya::cinepolis` como delegado, regalía 0, Q60 GT/L200 HN;
- no inventa comisión ni reparto.

Gate:

`PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE`.

## 6. Siguiente bloque exacto

Solo con autorización fresca:

1. source lock nuevo;
2. gate finance root fix;
3. gate acumulativo;
4. un único deploy Hosting DEV;
5. paridad y HR;
6. Staff, Shopper y Cliente;
7. dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas;
8. evidencia;
9. validación humana;
10. freeze C6.

## 7. Prohibiciones

- no segunda candidata, rama, PR, Firebase, Hosting o workflow;
- no clasificación por nombre visual;
- no parche UI;
- no writes Firestore/Auth/HR/Rules/Storage;
- no Make/Gemini/pagos;
- no merge ni producción antes del PASS acumulativo.

## 8. Estado seguro

El bloque C6-FINANCE-ROOT-FIX fue source-only: cero deploys, cero provider writes, merge false y producción false.
