# Checklist salidas locales readiness - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Definir como revisar salidas locales de consistency check, preflight y runbook antes de compartirlas o usarlas en documentacion.

## Comandos origen

1. `node tools/migration/tya-local-readiness-consistency-check.mjs`
2. `node tools/migration/tya-local-readiness-preflight.mjs`
3. `node tools/migration/tya-phase-a-local-readiness-runbook.mjs`

## 1. Inventario

Confirmar que existan:

- reporte consistency;
- reporte preflight;
- indice runbook;
- salidas 01 a 06b;
- reporte sanitizado;
- resumen sanitizado;
- matriz controlada.

Si falta algo clave: `review_required`.

## 2. Estado por comando

Registrar:

- ejecutado: si/no;
- exit code;
- estado reportado;
- warnings;
- issues;
- decision.

Si hay error no explicado: `review_required`.

## 3. Revision antes de compartir

Confirmar que las salidas no incluyan informacion que no deba compartirse. Si hay duda, no compartir y pedir revision.

Decision:

- sin problemas: continuar;
- duda: `review_required`;
- no seguro: `do_not_share`.

## 4. Estados que requieren cuidado

No interpretar automaticamente como exito:

- `review_required`;
- exit code 2;
- warnings de branch;
- warnings de faltantes;
- blockers P0;
- manual review.

## 5. Resumen permitido

Se puede resumir:

- estado general;
- comandos ejecutados;
- exit codes;
- nombres de salidas;
- blockers sin detalle sensible;
- siguiente accion.

## 6. Decision final

Seleccionar una:

- `safe_to_summarize`
- `review_required`
- `do_not_share`
- `rerun_required`

## 7. Siguiente accion

- `safe_to_summarize`: llenar template local readiness.
- `review_required`: revisar antes de compartir.
- `do_not_share`: sanitizar primero.
- `rerun_required`: repetir desde el comando que fallo.

## Regla final

Este checklist no autoriza source lock, produccion, deploy, merge, import real ni escrituras reales.
