# Today production cutover reality TyA

Fecha: 2026-07-04

## Decision

La salida de hoy debe concentrarse en estabilizar y publicar lo que ya existe y ya fue trabajado, no en rediseñar backend completo.

## Base real de avance

- Hay plataforma operando.
- Hay HR completa con informacion ejecutada hasta junio.
- Hay paquetes de migracion V6/V7.1.
- Hay reglas HR y deduplicacion ya trabajadas.
- Hay proyecto Cinépolis ya creado desde la logica de plataforma.
- Julio aun no agrega carga historica nueva significativa.

## Corte operativo recomendado para hoy

### Mantener activo

- Flujo HR completo.
- Lectura y control de visitas reales.
- Asignaciones segun HR/plataforma.
- Shoppers existentes.
- Certificaciones ya presentadas como historico valido.
- Creacion/configuracion de nuevo proyecto desde plataforma si el flujo ya existe.

### Validar antes de publicar

- Que visitas disponibles no incluyan asignadas.
- Que asignacion desde HR se refleje en plataforma.
- Que asignacion desde plataforma no duplique cuando aparezca en HR.
- Que shopper certificado no sea obligado a repetir prueba.
- Que pagos pendientes de junio queden separados de pagados hasta mayo.

### Dejar para posterior inmediato

- Hardening completo.
- Storage robusto de evidencias.
- Automatizaciones no criticas.
- Reporteria avanzada.
- Comercial multi-tenant completo.

## Make

No pedir accesos Make todavia.

Pedirlos cuando se llegue al bloque de integracion real HR/plataforma.

## Nueva informacion a pedir ahora

Solo pedir informacion que no exista en repo, paquetes o documentos disponibles.

## Estado

- Plan de corte documentado.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore en este bloque.
