# RESUMEN PARA CLAUDE — C6 Shopper Canonical Census HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo · Sin modificación visual

## Contrato que no debe cambiar

Para TyA:

```text
Usuario Shopper: nombre.apellido
Contraseña: Nombre123*
Formulario único: #loginForm + #lgUser + #lgPass + #lgSubmit
Membership Shopper: no requerido
```

No crear un segundo formulario, no mostrar correos Firebase internos y no fusionar identidades Staff/Shopper de una misma persona.

## Resultado backend

El pin del auditor se reconcilió y source/static pasó. El censo read-only clasificó los 340 perfiles:

- 105 activos elegibles;
- 189 históricos;
- 46 activos en hold;
- 12 colisiones técnicas;
- 23 nombres canónicos incompletos;
- 23 perfiles retenidos por colisión de login;
- Paula: 1 candidata Staff y 2 candidatas Shopper aún no resueltas.

## Impacto para frontend

Ninguno autorizado ni demostrado. No modificar:

- `app/modules/*`;
- diseño o estilos;
- navegación por rol;
- `CX.data`;
- textos de Academia;
- rutas de Portal Shopper.

El doble formulario ya tiene corrección source-only pendiente de despliegue futuro, pero este bloque no desplegó nada.

## Pendiente backend

Resolver en source-safe las colisiones e identidades, producir un plan Auth no superpuesto y volver a gate antes de cualquier write. Claude no debe crear excepciones visuales para los casos retenidos.
