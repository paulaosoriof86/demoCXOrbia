# PHASE A TRACKER — ADDENDUM LEGACY REFRESH / R17N

Fecha: 2026-07-29

| Bloque | Estado | Evidencia | Siguiente |
|---|---|---|---|
| Corte 3 / V182 | FROZEN | baseline vigente | preservar |
| R16E provider compare | PASS read-only | run 29282169628 | cerrado |
| Legacy shoppers/certs refresh | PASS read-only | `LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST` | cerrado |
| Stable profile diff | PASS read-only | 22 linked; fill-missing detectado; no overwrite | integrar plan final |
| R17N post-legacy | PASS no-execute | 120 profile creates / 22 existing / 7 hold; 77 cert candidates / 1 hold | resolver HR refs |
| Offline idempotence | PASS | hash `979d45fa...e2e8e` | repetir tras crosswalk final |
| HR protected refs | HOLD focal | 210/210 unmapped por ID/code; nombre prohibido | visit-identity crosswalk read-only |
| Provider writes | NOT AUTHORIZED | 0 writes | autorización exacta posterior |
| CX.data canonical smoke | PENDING | depende write/read-path | después de write gate |
| Producción/cutover | BLOCKED | Hosting final `tya-plataforma` preservado | Cortes 6–8 + gate final |

## Avance Phase A
Se recuperó y clasificó la información útil que faltaba del legacy sin tocar producción ni reabrir frontend: shoppers actuales y certificaciones presentadas. La brecha ya no es “falta de export”; es un único problema de identidad entre referencias HR y perfiles existentes.

## No reproceso
- No nueva base Firebase.
- No nueva candidata Claude.
- No reauditoría V182.
- No PowerShell de Paula.
- No legacy visits import.
- No name-based dedupe.
