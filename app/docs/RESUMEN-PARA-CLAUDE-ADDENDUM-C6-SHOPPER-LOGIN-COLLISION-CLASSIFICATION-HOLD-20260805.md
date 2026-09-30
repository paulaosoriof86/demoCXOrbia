# RESUMEN PARA CLAUDE — C6 Shopper Login Collision Classification HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo · Sin cambio visual

## Contrato preservado

```text
Usuario Shopper: nombre.apellido
Contraseña: Nombre123*
Formulario único: #loginForm + #lgUser + #lgPass + #lgSubmit
Membership Shopper: no requerido
```

## Resultado backend

El clasificador técnico revisó los 109 grupos candidatos de login:

- 39 grupos: un perfil activo canónico y perfiles históricos preservados;
- 64 grupos: más de una identidad activa técnicamente distinta comparte el mismo `nombre.apellido`;
- 141 identidades activas afectadas;
- 83 perfiles activos sin apellido técnico verificado bajo la regla estricta;
- un perfil con dos candidatos Auth continúa sin resolución única.

No se aplicó sufijo, alias ni cambio de contrato.

## Instrucción para frontend

No modificar:

- `app/modules/*`;
- estilos o diseño;
- `CX.data`;
- textos del Login;
- Portal Shopper;
- Academia;
- rutas por rol.

No crear campos visibles para resolver colisiones hasta que exista decisión expresa del tenant. El backend no debe inventar una excepción visual.

## Estado

Cero Auth/password/membership writes y cero deploy. La corrección del formulario humano único sigue source-only y no fue desplegada en este bloque.
