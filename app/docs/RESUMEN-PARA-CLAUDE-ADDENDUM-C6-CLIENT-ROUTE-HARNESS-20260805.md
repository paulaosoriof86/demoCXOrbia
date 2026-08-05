# RESUMEN PARA CLAUDE — Addendum C6 client route harness

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo · Sin cambio frontend solicitado

## Estado comprobado

El Portal Cliente no presentó una regresión funcional en el diagnóstico focal:

```text
session.view=cli_dashboard
#view existe=true
#view .ph existe=true
contenido renderizado=690 caracteres
renderException=null
```

La condición que falló pertenece al harness remoto:

```text
#nav-cli_dashboard existe=false
#nav-cli_dashboard.active=false
```

El gate asumía que el nodo de navegación debía existir y quedar activo después de invocar directamente `CX.router.nav('cli_dashboard')`. Esa suposición no es requisito de producto cuando la ruta, el encabezado y el contenido ya están renderizados.

## Para Claude

- No modificar `app/modules/cliente.js`.
- No modificar `app/core/router.js` por este hallazgo.
- No agregar nodos invisibles ni parches UI para satisfacer el gate.
- No reabrir el P0 de Login.
- Mantener el Portal Cliente acumulativo vigente.

## Ajuste pendiente fuera del frontend

El equipo backend/QA debe corregir exclusivamente el predicado del harness para observar:

```text
session.view === 'cli_dashboard'
#view existe
#view .ph existe
#view contiene texto
renderException === null
```

La presencia de `#nav-cli_dashboard.active` no debe bloquear el PASS cuando la navegación directa no construye ese elemento.

## Impacto frontend

Ninguno demostrado. No existe delta frontend autorizado ni requerido en este bloque.
