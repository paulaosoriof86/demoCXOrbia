# Addendum maestro - patrones reutilizables CXOrbia

Fecha: 2026-07-07

## Por que se agrega este addendum

El trabajo backend de TyA esta generando patrones reutilizables para el producto CXOrbia.

Si esos patrones quedan solo como implementacion backend de TyA, el prototipo comercializable puede perder aprendizajes importantes para futuros clientes.

Este addendum complementa el documento maestro para que, en adelante, todo bloque backend distinga:

1. Lo exclusivo del cliente actual.
2. Lo reutilizable para CXOrbia como producto.
3. Lo que Claude debe incorporar al prototipo comercializable.
4. Lo que afecta Academia, manuales, cursos, certificaciones, rutas por rol o notificaciones.

## Regla nueva de continuidad

Cada bloque backend debe cerrar con una clasificacion:

- `Reusable CXOrbia`: arquitectura, contrato, patron o regla aplicable a otros clientes.
- `Exclusivo cliente`: logica, dato, texto, regla o flujo que pertenece solo al cliente actual.
- `Claude/prototipo`: ajuste visual, UX, copy, componente, pantalla o estado que Claude debe incorporar.
- `Academia`: impacto sobre aprendizaje, manuales, certificaciones, cursos, rutas por rol o notificaciones.
- `Sin impacto Claude`: cuando el cambio sea solo gate, doc, seguridad o backend interno.

## Reglas de producto reutilizables

### Multi-tenant primero

Nada reusable debe asumir un unico cliente, pais, moneda, cuestionario, HR, flujo de pagos o integracion.

### Backend por contrato

Los modulos UI no deben llamar proveedores reales directamente.

Todo proveedor debe pasar por contrato/adaptador/gate.

### Estados honestos

Toda accion no real debe mostrarse como preview, simulado, bloqueado, pendiente o listo para gate.

### Seguridad por defecto

Secrets, webhooks, tokens y API keys nunca quedan en repo.

El backend real debe estar apagado por defecto hasta autorizacion y gate.

### Revision humana

Los conflictos no se resuelven por sobrescritura silenciosa.

Todo conflicto debe ir a revision humana con trazabilidad.

### Fuente externa configurable

HR TyA es un caso, no la arquitectura completa.

Para otros clientes, la fuente puede ser HR, Google Sheets, CRM, archivo importado, API externa o plataforma propia.

### Academia transversal

Academia debe poder reflejar reglas configurables por cliente/proyecto/rol.

No debe quedar desconectada de cambios importantes en certificacion, agendamiento, evidencias, pagos, integraciones o flujo operativo.

## Paquete Claude obligatorio cuando se acumulen patrones reutilizables

Cuando aparezcan patrones reutilizables, se debe actualizar un documento para Claude con:

- que debe cambiar en prototipo;
- que NO debe hardcodearse;
- que estados/copys deben ser genericos;
- que configuraciones deben quedar por tenant/proyecto;
- que impacto tiene en Academia;
- que queda exclusivo del cliente actual.

## Aplicacion inmediata

Se creo el documento:

- `app/docs/CLAUDE-PATRONES-REUTILIZABLES-BACKEND-PRODUCTO-CXORBIA-20260707.md`

Ese documento debe incluirse en el proximo paquete para Claude.

## Estado seguro

Este addendum no ejecuta deploy, no cambia UI, no activa backend real y no agrega datos sensibles.
