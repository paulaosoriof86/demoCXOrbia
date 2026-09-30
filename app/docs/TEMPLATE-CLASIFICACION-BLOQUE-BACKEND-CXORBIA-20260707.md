# Template - clasificacion de bloque backend CXOrbia

Fecha: 2026-07-07

## Objetivo

Estandarizar el cierre de cada bloque backend para no perder patrones reutilizables, impactos Claude/prototipo ni efectos en Academia.

## Template obligatorio de cierre

Usar esta estructura al cerrar cada bloque:

```md
## Clasificacion del bloque

### Reusable CXOrbia

- Arquitectura, contrato, patron o regla aplicable a futuros clientes.
- Indicar si debe quedar configurable por tenant/proyecto.

### Exclusivo cliente

- Logica, dato, texto, regla o flujo que pertenece solo al cliente actual.
- Indicar que no debe convertirse en hardcode del producto.

### Claude/prototipo

- Ajuste visual, UX, copy, componente, pantalla o estado que Claude debe incorporar.
- Indicar archivo/modulo cuando se conozca.

### Academia

- Impacto en manuales, cursos, certificaciones, rutas por rol, notificaciones o estados pendientes.
- Si no hay impacto, escribir: Sin impacto nuevo en Academia.

### Sin impacto Claude

- Usar solo cuando el cambio sea gate, doc, seguridad o backend interno y no requiera ajuste visible.
```

## Criterio de uso

No basta con decir que no hay pendiente para Claude.

Debe explicarse si el cambio es:

- reusable como producto;
- exclusivo del cliente;
- pendiente visual/UX;
- impacto Academia;
- o sin impacto visible.

## Estado seguro

Este template no ejecuta deploy, no cambia UI, no activa backend real y no agrega datos sensibles.
