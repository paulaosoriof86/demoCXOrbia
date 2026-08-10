# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-10  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_AUTH_FINDINGS_ADJUDICATION_STOP_ONE_AMBIGUOUS_DUPLICATE__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_READ__NO_PRODUCTION`

El detalle acumulativo del bloque actual está en:

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-FINDINGS-ADJUDICATION-STOP-20260810.md`;
- `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md`;
- `app/docs/evidence/C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.json`.

## Resumen vigente

Auth DEV permanece materializado con 228 usuarios, readback PASS y rollback dry-run PASS. La adjudicación read-only actual consumió exactamente una lectura provider y clasificó cuatro grupos duplicados con dos principals habilitados y claims/scope habilitantes, más un único grupo ambiguo sin acceso TyA efectivo. Cero Auth/IAM/Firestore/HR/Rules/Storage writes, cero PREWRITE/Activation/smoke adicional, cero deploy, merge o producción.

## Siguiente bloque exacto

`C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL`.

No ejecutar repair ni nuevo smoke sin autorización separada.
