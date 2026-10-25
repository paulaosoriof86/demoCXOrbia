# CXOrbia - Observaciones V58 Julio Paula

Fecha: 2026-07-01

## Estado observado

V58 ya muestra TyA Cinepolis GT/HN, pero aun conserva elementos de demo y flujos incompletos. El sistema sigue sin estar listo para abrir postulaciones reales masivas de julio hasta cerrar los puntos P0.

## P0 para Claude

1. Confidencialidad por rol: el ingreso sigue mostrando texto corto. Se requiere documento completo por rol, versionado y auditable.
2. Proyectos: en tenant TyA no deben aparecer proyectos demo como banca o restaurantes.
3. Periodos: selector debe leer periodos vivos y detectar nuevos meses/HR por pais.
4. Dashboard: KPIs, avance mensual y comparativos deben calcularse desde HR/base viva, no datos demo.
5. Estado operativo: cada registro debe ser clicable, abrir ficha amplia, ser colapsable por bloque y permitir seleccionar a quienes enviar recordatorio.
6. Visitas disponibles: la lupa no abre detalle. Cada visita debe mostrar disponible desde, franja, escenario, pais, sucursal, honorario, reembolso y restricciones.
7. Postulaciones: vista por sucursal y por shopper, filtros funcionales, ficha amplia y acciones completas.
8. Perfil shopper: boton perfil no funciona. Debe abrir puntaje, historial, estadisticas y alertas operativas.
9. Aprobacion de postulaciones: debe poder aprobar con misma fecha, pedir nueva fecha con motivo, poner en espera y retomar.
10. Buscadores: todos los desplegables grandes deben tener buscador.
11. Responsables: cada visita/postulacion debe mostrar responsable y ultimo gestor.
12. Notificaciones: equipo, shoppers y clientes deben recibir avisos por movimientos operativos.
13. Proyectos nuevos: modulo Proyectos debe permitir crear proyectos autoadministrables con restricciones, paises, moneda, periodos, HR, escenarios, honorarios, recursos y notificaciones.
14. HR viva: Cinepolis debe leer HR en linea/importada y sincronizar estados con plataforma.
15. Lenguaje operativo: comunicaciones al shopper deben ser suaves, claras y motivadoras.

## P0 backend relacionado

- Mantener backend V57 separado.
- No cargar base TyA completa hasta cerrar gate.
- Preparar extraccion limpia desde plataforma actual: solo datos buenos y flujos vigentes, omitiendo errores historicos.
