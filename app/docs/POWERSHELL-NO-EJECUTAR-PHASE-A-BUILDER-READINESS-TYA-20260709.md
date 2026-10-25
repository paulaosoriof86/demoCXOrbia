# PowerShell NO EJECUTAR TODAVIA - Phase A builder/readiness TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Estado

**NO EJECUTAR TODAVIA.**

Este documento deja preparado el formato futuro del bloque PowerShell para cuando realmente se necesite computador y existan inputs source-safe locales. No debe usarse como GO runtime, GO import ni GO produccion.

## Uso futuro esperado

Solo cuando el asistente lo indique explicitamente y Paula tenga computador.

El bloque futuro debera:

- validar repo/rama;
- validar contratos;
- escribir solo reportes `.tmp`;
- no commitear `.tmp`;
- no pedir datos privados por chat;
- no activar runtime/import/write/deploy.

## Template conceptual futuro

```powershell
# NO EJECUTAR TODAVIA - TEMPLATE CONCEPTUAL
$ErrorActionPreference = "Stop"

# 1) Definir ruta repo solo cuando corresponda
# $RepoPath = "C:\\ruta\\local\\demoCXOrbia"
# Set-Location $RepoPath

# 2) Confirmar rama
# $branch = git rev-parse --abbrev-ref HEAD
# if ($branch -ne "docs-tya-v6-v71-audit") { throw "Rama incorrecta: $branch" }

# 3) Crear salidas .tmp
# New-Item -ItemType Directory -Force .tmp | Out-Null

# 4) Validar sintaxis de validadores
# node --check tools/contracts/tya-phase-a-source-safe-input-builder-contract-validate.mjs
# node --check tools/contracts/tya-phase-a-local-builder-execution-control-validate.mjs
# node --check tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs

# 5) Validar contratos
# node tools/contracts/tya-phase-a-source-safe-input-builder-contract-validate.mjs --out .tmp/tya-phase-a-source-safe-input-builder-contract
# node tools/contracts/tya-phase-a-local-builder-execution-control-validate.mjs --out .tmp/tya-phase-a-local-builder-execution-control
# node tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs --out .tmp/tya-phase-a-realdata-domain-readiness-pack

# 6) Si existe input local source-safe, validar con --input
# $InputPath = ".tmp/source-safe/tya-phase-a-domains.source-safe.local.json"
# if (Test-Path $InputPath) {
#   node tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs --input $InputPath --out .tmp/tya-phase-a-realdata-domain-readiness-pack
# }

# 7) Nunca git add .tmp
# git status --short
```

## Prohibido

- Ejecutar ahora.
- Pegar datos privados en chat.
- Usar HR cruda.
- Usar base vieja.
- Usar fixture como real.
- Usar `.tmp` como fuente original.
- Hacer `git add .tmp`.
- Hacer commit de reportes locales.
- Activar adapter.
- Activar runtime.
- Importar.
- Escribir Firestore/HR.
- Deploy.
- Make/Gemini.
- Pagos.

## Estado seguro

Documento preparado solamente. Sin ejecucion.