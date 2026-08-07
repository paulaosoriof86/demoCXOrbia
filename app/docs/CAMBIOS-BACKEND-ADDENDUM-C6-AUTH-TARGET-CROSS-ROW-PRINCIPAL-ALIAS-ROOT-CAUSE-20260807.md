# CAMBIOS BACKEND — ADDENDUM C6 AUTH TARGET CROSS-ROW PRINCIPAL ALIAS ROOT CAUSE

Fecha: 2026-08-07

## Cambios

- `backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json`: agregó circuit breaker de causa raíz, selección Auth target-specific, prohibición del baseLogin compartido como selector suficiente y congeló el hallazgo terminal.
- `tools/qa/cxorbia-c6-auth-target-adaptive-lineage-password-snapshot-readonly.mjs`: nuevo reader read-only adaptativo; reconstruye lineage target-linked, cruza credentials después de propagar llaves técnicas y exige principal Auth único sin asociación a otro row.
- `.github/workflows/cxorbia-c6-auth-target-adaptive-lineage-password-snapshot-readonly.yml`: workflow one-shot creado, corregido por falso positivo estático y luego eliminado tras consumir el bloque.
- `backend/config/c6-auth-target-adaptive-lineage-password-snapshot-readonly-request-v1.json`: consumido tras falso positivo estático, providerReads=0.
- `backend/config/c6-auth-target-adaptive-lineage-password-snapshot-readonly-request-v2.json`: único provider attempt, consumido tras STOP_RETRY.
- Evidencia y source lock terminales creados.

## Resultado

La lineage exacta del target pasó con bases `profile + visit`; después, el resolver target-specific obtuvo `candidateCount=0`. La comparación con el PREWRITE antiguo demuestra un defecto de selección cross-row: el mismo principal Auth podía ser reutilizado por perfiles distintos mediante el `baseLogin` compartido porque no existía invariant global de principal único por row.

El antiguo blocker de password para `ac93...` se reclasifica como síntoma downstream del plan, no causa raíz del target.

## Estado seguro

Cero writes, deploy, merge o producción. Auth no ejecutado. El plan 340 previo se conserva pero queda no ejecutable hasta root fix source-only de principal uniqueness.

## Clasificación

- Reusable CXOrbia: invariant global de principal Auth único por identidad y separación entre shared-login collision signal y target selector.
- Exclusivo cliente: fingerprints TyA/Cinépolis del caso.
- Claude/prototipo: sin cambio frontend.
- Academia: sin cambio funcional visible; documentar que la seguridad de login se resuelve por identidad técnica, no por coincidencia de nombre/login compartido.
- Sin impacto Claude: implementación/gates backend.
