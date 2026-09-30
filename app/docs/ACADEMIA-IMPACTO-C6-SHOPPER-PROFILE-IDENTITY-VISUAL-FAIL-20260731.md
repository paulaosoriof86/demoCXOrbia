# Academia — Corte 6 shopper identity/profile visual FAIL

**Fecha:** 2026-07-31  
**Estado:** `P0_DOCUMENTED__NO_PRODUCTION`

## Patrón reusable

La validación de una interfaz source-safe no sustituye la validación de una consola autenticada cuando el flujo requiere identidad personal, historial propio o datos operativos protegidos.

Tres capas deben distinguirse:

1. **preview público/source-safe:** demuestra estructura, nombres enmascarados o datos mínimos y ausencia de secretos;
2. **consola autenticada de operación:** entrega al rol autorizado la información necesaria para operar;
3. **portal de persona:** resuelve una identidad única y limita la vista a su propio scope.

Un PASS técnico del preview no cierra un flujo de identidad si el usuario entra con `shopperId=null`.

## Login shopper

Regla reusable:

`CREDENCIAL → AUTH → CLAIMS/SCOPE → SHOPPER ID ESTABLE → PERFIL/ASIGNACIONES PROPIAS`.

Nunca:

`BOTÓN SHOPPER → ID DEMO/FALLBACK → PERFIL APARENTE`.

Si la identidad no se resuelve, fail-closed es correcto; lo incorrecto es declarar el flujo listo.

## Credenciales

Username visible y contraseña son conceptos distintos:

- el username puede formar parte del perfil operativo;
- una contraseña vigente no debe persistirse de forma recuperable solo para poder mostrarla;
- un patrón de contraseña inicial/temporal puede formar parte del onboarding;
- recuperación/reset debe quedar auditado y separado de lectura de perfil.

## Perfil completo

Superadmin necesita una vista consolidada de los campos reales que la operación requiere. La protección se implementa por autenticación/rol, no eliminando los datos de la consola autorizada.

Shopper ve solo su propio perfil. Cliente/marca no hereda PII de shoppers.

## Historial y KPI

Los KPI deben derivarse de estados/facetas canónicas y permitir drill a la evidencia que los compone. Un KPI sin detalle trazable no debe usarse para operación.

El histórico debe enlazarse por identificador estable, nunca solo por nombre visual.

## Migración legacy

Una plataforma anterior puede aportar datos útiles completados por usuarios, pero debe tratarse como fuente de migración:

`EXPORT → PARSER POR CONTRATO → NORMALIZACIÓN → MATCH ESTABLE → CONFLICT REVIEW → DELTA → WRITE GATED`.

No conectar la base vieja ni convertirla en dependencia de runtime.

## Impacto en manuales/cursos

Actualizar contenidos sobre:
- login y recuperación de identidad;
- credencial inicial vs credencial vigente;
- permisos Superadmin/Admin/Shopper/Cliente;
- perfil consolidado;
- historial y drill de KPI;
- source-safe vs consola autenticada;
- migración de perfiles y resolución de conflictos.

## Seguridad

Documentación únicamente. Sin provider writes, deploy, merge ni producción.
