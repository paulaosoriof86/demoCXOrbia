# RESUMEN PARA CLAUDE — C6 Shopper Identity Source/Static HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo + Sin cambio visual aplicado

## Contrato frontend que debe preservarse

Para el tenant TyA, el acceso Shopper queda definido por:

```text
Usuario: nombre.apellido
Contraseña: Nombre123*
Formulario único: #loginForm + #lgUser + #lgPass + #lgSubmit
```

No agregar un segundo formulario, overlay o acceso técnico. No mostrar correos Firebase internos ni exigir membership como condición visual.

## Cambios backend/source preparados

- contrato canónico de identidad Shopper;
- planificador para clasificar los 340 perfiles;
- auditor corregido sin requisito de membership;
- Paula Staff y Paula Shopper tratados como principals separados por namespace.

No se modificaron `app/modules`, diseño, navegación, `CX.data` ni la composición visual.

## Gate y bloqueo

El laboratorio source-only pasó. El gate acumulativo se detuvo exclusivamente porque el manifiesto activo continúa fijando el blob anterior del auditor:

```text
V6_ADDITIONAL_CRITICAL_BLOB_MISMATCH
expected=8fe4b0c5050d9fe9ba6c3120ef81a75b00bb8535
actual=80622606ce3635f0d53997a41932b6ced5dc25d4
```

No es un pendiente de interfaz para Claude. Debe preservarse el frontend actual y no crear una nueva candidata.

## Impacto pendiente para una candidata futura

Solo documentar y conservar:

- selector de rol Shopper antes del submit;
- formulario único visible;
- mensajes de error de usuario/contraseña sin datos técnicos;
- sesión separada Staff/Shopper aunque pertenezca a la misma persona;
- no forzar cambio de contraseña para el contrato TyA vigente.

## Estado

No hubo censo provider, Auth writes, cambio de contraseña, deploy, merge ni producción.
