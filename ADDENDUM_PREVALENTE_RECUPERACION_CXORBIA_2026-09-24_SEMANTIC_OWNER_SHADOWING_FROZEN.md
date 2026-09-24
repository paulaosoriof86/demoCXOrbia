# ADDENDUM PREVALENTE — SEMANTIC OWNER SHADOWING
## CXORBIA RECOVERY — GO-LIVE
## 2026-09-24

**ID:** `CXORBIA-I3-SEMANTIC-OWNER-SHADOWING-20260924`  
**Estado:** `FROZEN_PREVALENT`  
**Iteración:** `I3 / PRE-I4`  
**Complementa:** `CXORBIA-I3-CANONICAL-MONOTONIC-COMPOSITION-ROOTCAUSE-20260924`

## Hallazgo nuevo — RC-MONO-06

La candidata funcional `d8aad982...` contiene dos semánticas activas para el mismo contrato de histórico/KPI shopper:

- `app/modules/shoppers.js` define `kpiVisitsForActiveProject()` y excluye explícitamente `__pendingPlatformAssignmentOverlay===true` antes de calcular total/realizadas/liquidadas/enCurso.
- `app/adapters/tya-c6-domain-consistency-bridge.js` instala después un facade global `visitsForShopper()/shopperStats()` que cuenta todas las visitas canónicas asignadas al shopper, sin excluir ese overlay pendiente.
- `app/adapters/tya-canonical-shopper-portal-v2.js` consume `data.shopperStats()`.
- el focal semántico también consume `d.shopperStats()`.
- Run342 expuso el efecto: José Sarat tiene HR esperada 5/5, pero el facade devuelve total 6 / realizadas 5 y una postulación.

Esto demuestra un segundo mecanismo de regresión: **SEMANTIC OWNER SHADOWING**. No basta con que la mejor versión del módulo exista y esté cargada; un adapter/facade posterior puede redefinir la misma función de negocio y convertir otra implementación en autoridad efectiva.

## Regla definitiva adicional

1. Cada contrato de negocio crítico tendrá un solo `semanticOwner` efectivo.
2. Otros módulos sólo pueden delegar en ese owner; no pueden redefinir la fórmula.
3. MODULE_TRUTH debe registrar no sólo archivos/load-order sino también `exports/overrides` críticos: identidad, shopperStats/history, visitFacets, period/project context, finance, certifications, resources y postulations.
4. Un override posterior no registrado produce `RELEASE_COMPOSITION_FAILURE`.
5. La aceptación terminal debe comprobar que la función efectiva en runtime pertenece al owner adjudicado.
6. Para histórico/KPI shopper, un assignment/postulation pendiente de confirmación HR no puede inflar el histórico HR confirmado; debe presentarse en su carril de postulación/pendiente según contrato.
7. La corrección debe ser general y por owner, nunca específica a José Sarat ni a otro shopper.

## Finding asociado

Se crea `VRM-042 — RELEASE_COMPOSITION_FAILURE — SHOPPER_KPI_SEMANTIC_OWNER_SHADOWING`.

Estado inicial: `P0_PROVEN_OWNER_SHADOWING / DYNAMIC_ROW_PROOF_PENDING`.

## Producción

`tya-plataforma.web.app` continúa `DO_NOT_TOUCH`.

## Mutabilidad

FROZEN. No editar; superseder sólo con evidencia posterior explícita.
