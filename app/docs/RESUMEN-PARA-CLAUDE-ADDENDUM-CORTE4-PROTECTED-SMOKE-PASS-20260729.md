# RESUMEN PARA CLAUDE — ADDENDUM CORTE 4 PROTECTED SMOKE PASS

**Fecha:** 2026-07-29

## Estado que Claude debe tomar como vigente

`CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_PROTECTED_CXDATA_SMOKE_PASS__HOSTING_DEV_AUTH_PENDING`

Corte 3 continúa congelado en `CXORBIA-TYA-CORTE3-V182-20260729`.

Corte 4 ya comprobó sobre Firebase nuevo:

- Web App DEV lista;
- Firestore `(default)` listo en `us-central1` y vacío;
- Rules read-only desplegadas y verificadas;
- Authentication inicializado;
- smoke protegido `CX.data` con `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true`;
- operador temporal eliminado;
- Auth users final=`0`;
- Email/Password final=deshabilitado;
- Firestore document writes=`0`.

## Qué NO debe hacer Claude

- no generar nueva candidata por este bloque;
- no tocar `/app/modules` ni `/app/core` por el smoke;
- no cambiar backend/contracts/adapters;
- no interpretar el status agregado `error` del commit `b698a925f5f6a7c8405afb7fb54a9f4c551e8498` como regresión del prototipo: fue un falso negativo del publicador, no del executor ni del cleanup;
- no reabrir Corte 3;
- no mezclar Auth temporal de Corte 4 con Auth/RBAC completo de Corte 6.

## Evidencia relevante

- smoke válido: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`;
- `c4smoke-error-NONE`;
- `c4smoke-srcfirestore-etrue-fbfalse-rotrue`;
- `c4cleanup-u0-emailfalse`;
- corrección del criterio de publicación sin rerun: `9967146e112322efcd043155ae05351bbbbd4e8a`.

## Pendiente de Claude

Ninguno en este bloque. Solo abrir corrección frontend si la validación visual posterior demuestra un P0 reproducible y localizado.

## Siguiente gate fuera de Claude

Autorización separada de Hosting DEV → validación visual → freeze Corte 4.
