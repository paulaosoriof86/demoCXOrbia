# PHASE A TRACKER — C6 CANONICAL REPLACEMENT RESOLUTION

**Fecha:** 2026-08-10

## Avance

El bloqueo de duplicados Auth se redujo de decisión humana por fingerprint a un contrato técnico de canonicalización:

- A `1acd...`: `CREATE_CANONICAL_REPLACEMENT_REQUIRED`;
- B `2c4d...`: `CREATE_CANONICAL_REPLACEMENT_REQUIRED`;
- C `542...`: `CREATE_CANONICAL_REPLACEMENT_REQUIRED`;
- D `ae2f...`: `KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL`.

No se requiere que Paula elija principals legacy. El siguiente paso es preparar el repair plan source-only; ninguna mutación está autorizada todavía.

## Phase A preservada

Auth DEV 228, frontend, Login, CX.data, HR, histórico, shoppers, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen intactos.

## Seguridad

Provider reads 0; Auth/IAM/Firestore/HR/Rules/Storage writes 0; deploy 0; merge false; producción false.
