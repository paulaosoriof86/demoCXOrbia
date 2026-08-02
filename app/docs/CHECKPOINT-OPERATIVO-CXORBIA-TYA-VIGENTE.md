# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `C6_UNIFIED_CUMULATIVE_RUNTIME_ROOT_FIX_CODE_APPLIED_PENDING_READONLY_RUNTIME_GATES__NO_DEPLOY_NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- HR viva: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers.
- Agosto 2026 todavía no existe en la HR.
- Producción intacta.

## 2. Corrección de criterio

Queda prohibido usar números de cortes anteriores como verdad operacional. Los periodos históricos permanecen, pero sus indicadores se leen de la HR viva y de su revisión vigente.

Las evidencias anteriores válidas se usan para recuperar contratos, no para congelar datos:

- single-login aprobado;
- R20 full-history;
- dominio/Finanzas/Shopper canónicos;
- configuración del proyecto.

## 3. P0 demostrado

La visual humana publicada no consumía la baseline acumulativa:

- rol directo sin Auth real;
- Shopper sin identidad;
- julio mezclado con agosto por reloj;
- fases distintas a KPIs;
- comparativo sin todos los periodos;
- perfiles/certificaciones sin overlay;
- duplicación de identidades;
- Cliente y Finanzas degradados.

Causa: separación artificial entre carril humano source-safe y carril protegido, más adapters funcionales condicionados por token oculto.

## 4. Root fix aplicado al código

- Entrada humana única `authenticated-human-canonical`.
- Login real integrado del producto.
- HR live authority + Firestore exact overlay.
- Override directo de rol eliminado del índice.
- Bridge visual oculto eliminado del índice.
- Dominio/Shopper/Finanzas canónicos activos en la URL normal.
- Adapter unificado agrega:
  - login Cliente;
  - honorario Q60/L200 desde configuración;
  - comparativo con los 14 periodos HR;
  - reaplicación después de Auth/refresh.

No se tocaron módulos UI.

## 5. Gates ya comprobados sin proveedor

- Sintaxis del bootstrap: PASS.
- Sintaxis del adapter unificado: PASS.
- Ausencia de scripts de carril reducido en el índice: PASS.
- Presencia de Auth/HR/domain/shopper/finance canónicos: PASS.
- Cero deploys y provider writes: PASS por alcance del bloque.

Esto no equivale todavía a runtime/browser PASS.

## 6. Gate inmediato

1. gate estático acumulativo;
2. runtime local/read-only;
3. login real staff, cliente y shopper;
4. revisión viva de todos los periodos;
5. igualdad KPI/fases/drill;
6. comparativo de 14 periodos;
7. identidad, WA, credenciales, certificación e histórico;
8. Portal Cliente completo;
9. Finanzas con configuración contractual y fuente canónica;
10. tres recargas y nueva pestaña;
11. evidencia PASS/FAIL.

## 7. Restricciones

No deploy, Auth/Firestore/Rules/HR writes, merge, agosto ni producción hasta PASS y autorización fresca específica.
