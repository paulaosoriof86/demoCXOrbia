# PHASE A TRACKER — C6 AUTH TARGET ANCHOR LINEAGE SOURCE-ONLY

Fecha: 2026-08-07

## Bloque completado
C6 AUTH TARGET ANCHOR LINEAGE ROOT FIX source-only.

## Resultado
`STOP_RETRY_C6_AUTH_TARGET_ANCHOR_LINEAGE_ROOT_FIX_SOURCE_ONLY_EXACT_CONSENSUS_BASES_NOT_VERSIONED`

## Avance Phase A
- Plan Auth final preservado: 340/340, HOLD=0.
- SKIP13 cerrado 13/13.
- Multi-Auth adjudicado y cerrado.
- Lineage estructural del único target password rollback demostrada.
- Bloqueo reducido a reconstruir el set exacto de dos-o-más bases corroborantes y, solo después, resolver un Auth candidate único.

## Siguiente bloque seguro
Provider read-only focal adaptativo, bajo autorización separada, usando `backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json`. Primero linked-source lineage sin Auth; Auth máximo una página solo tras fingerprints PASS; hash/salt/hashConfig solo después de candidateCount=1.

## Estado seguro
Provider/Auth/Firestore/HR reads y writes de este bloque: 0. AuthExecuted=false. Merge=false. Production=false.
