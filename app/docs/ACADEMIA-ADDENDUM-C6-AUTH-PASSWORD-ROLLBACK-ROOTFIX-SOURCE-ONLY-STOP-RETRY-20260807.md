# ACADEMIA — ADDENDUM C6 PASSWORD ROLLBACK ROOT FIX SOURCE-ONLY

**Fecha:** 2026-08-07

## Impacto documentable

Este bloque aporta un caso de control de reversibilidad en migraciones de identidad:

- un hash legacy globalmente válido no equivale a demostrar el estado password actual de una identidad específica;
- `salt` vacío puede ser parte legítima de un contrato de importación SHA256/1 y debe distinguirse de un valor no disponible;
- una migración segura debe fallar cerrada cuando no puede reconstruir exactamente el estado previo exigido por el rollback;
- el self-test hermético puede validar criptografía y contratos sin sustituir la evidencia target-específica.

Resultado del caso:

```text
PASS_HERMETIC_SELFTEST
exactRollbackReconstructible=false
contractMutationAllowed=false
providerReads=0
providerWrites=0
AuthWrites=0
```

## Clasificación

- Academia: sí, patrón reusable de gobernanza de migración y rollback.
- Claude/prototipo: sin impacto visual.
- Operación Phase A: preservada; la activación Auth continúa bloqueada hasta resolver el snapshot exacto del único target pendiente.
