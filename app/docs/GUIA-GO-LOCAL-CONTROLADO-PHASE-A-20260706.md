# Guia GO local controlado Phase A - CXOrbia TyA

Fecha: 2026-07-06

## Objetivo

Dejar una guia futura para ejecutar auditoria local controlada sin ambiguedad cuando Paula lo autorice.

## Estado actual

No ejecutar ahora. Esta guia no activa GO.

## Condiciones previas

1. Paula debe autorizar GO explicito.
2. Repo local debe estar confirmado.
3. Rama local debe estar confirmada.
4. No debe haber deploy pendiente.
5. No debe haber import real.
6. No deben activarse proveedores reales.

## Frase obligatoria

Solo ejecutar cuando el mensaje incluya exactamente:

`Paula, ahora si ejecuta este bloque`

Si esa frase no aparece, no ejecutar comandos.

## Orden futuro

1. Confirmar carpeta del repo.
2. Confirmar rama.
3. Confirmar estado git.
4. Definir variable GO.
5. Ejecutar orquestador local.
6. Revisar salidas.
7. Documentar resultado.

## Comandos futuros

No ejecutar ahora.

```powershell
pwd
git branch --show-current
git status --short
$env:CXORBIA_LOCAL_GO="YES"
node tools/quality/tya-safe-audit-local-orchestrator.mjs
```

## Salidas esperadas

- `_diagnosticos/tya-safe-audit-local-orchestrator/local-orchestrator-report.json`
- `_diagnosticos/tya-safe-audit-local-orchestrator/local-orchestrator-report.md`
- `_diagnosticos/tya-local-output-package/package-manifest.json`
- `_diagnosticos/tya-local-output-package/package-summary.md`

## Interpretacion

- `ok_to_review_outputs`: revisar salidas y documentar.
- `review_required`: revisar hallazgos antes de avanzar.
- `blocked_missing_go`: no se autorizo ejecucion.

## No autoriza

- Source lock.
- Produccion.
- Deploy.
- Merge.
- Import real.
- Providers reales.
