# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__PROJECT_ENTITLEMENTS_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth, target lineage, HashConfig y direct runner;
- freeze Auth v4 y Auth DEV 228;
- PREWRITE/Activation/smoke históricos;
- D repair-ready.

## 3. Estado backend

Las referencias empresariales A/B/C y un acceso adicional de Operaciones fueron recibidas en conversación. No volver a pedir nombres ni correos. No persistir referencias humanas, correos o credenciales como constantes o configuración técnica.

Pendiente únicamente el scope exacto de proyecto para los cuatro accesos iniciales: `TYA_COMPLETE` o `SPECIFIC_PROJECTS`.

## 4. Regla frontend/autoadministrabilidad

No hardcodear usuarios, nombres, correos, roles o proyectos en UI. Los usuarios staff iniciales son bootstrap de datos vivos. La plataforma debe permitir, bajo RBAC, administrar usuarios y asignaciones de rol/scope. La deshabilitación debe preservar auditoría; no introducir delete irreversible por defecto.

No crear selector técnico, fallback legacy, copy con fingerprints/claims, pantalla adicional ni relajación de RBAC.

## 5. Métrica de cierre

Avance certificado vigente: **72%**. Restante: **28%**. La escala estable está documentada en el checkpoint vivo y no se recalcula por sesión.

## 6. Siguiente bloque backend

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — COMPLETE PROJECT ENTITLEMENTS, SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Sin frontend changes hasta verificar si la superficie de administración existente ya cubre CRUD/disable/role/scope; cualquier faltante real se documenta por archivo/módulo y no se parchea desde backend.
