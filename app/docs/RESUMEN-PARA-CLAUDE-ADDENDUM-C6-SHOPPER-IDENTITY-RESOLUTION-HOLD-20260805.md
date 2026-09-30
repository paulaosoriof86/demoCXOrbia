# RESUMEN PARA CLAUDE — C6 Shopper Identity Resolution HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo · Sin cambio visual

## Contrato frontend que debe preservarse

```text
Usuario Shopper: nombre.apellido
Contraseña: Nombre123*
Formulario único: #loginForm + #lgUser + #lgPass + #lgSubmit
Membership Shopper: no requerido
```

No agregar formularios alternos, correos Firebase visibles, excepciones de usuario ni fusiones Staff/Shopper por nombre.

## Resultado backend

El source/static del resolver pasó. La revisión read-only revisó 340 perfiles y produjo una fila primaria por perfil, pero el resolver generó 109 falsos holds porque no utilizó el nombre completo o login técnico del perfil exacto después de enlazarlo por `shopperId`.

```text
CODE=RESOLVER_CANONICAL_NAME_BASIS_TOO_RESTRICTIVE
FRONTEND_CHANGE_REQUIRED=false
PRODUCT_MODULE_CHANGE_REQUIRED=false
```

## Para Claude

- no modificar `app/modules/*`;
- no alterar diseño, navegación ni `CX.data`;
- no convertir los holds técnicos en mensajes visibles;
- no resolver colisiones agregando números o sufijos al usuario;
- no deduplicar perfiles por nombre;
- preservar el formulario único ya corregido source-only.

## Pendiente backend

Corregir el resolver, recalcular colisiones reales y resolver las dos candidatas Shopper de Paula por actividad y claves técnicas. No existe nueva release DEV ni deploy en este bloque.
