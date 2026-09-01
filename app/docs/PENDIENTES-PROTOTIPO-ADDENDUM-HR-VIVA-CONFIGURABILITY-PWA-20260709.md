# Pendientes prototipo addendum HR viva configurabilidad PWA TyA

Fecha: 2026-07-09

## Pendiente P0 principal

La HR viva multihoja ya lee en DEV, pero el prototipo/UI no esta listo para Phase A operativa porque mezcla configuracion, proyecto y periodo.

## Pendientes P0

1. Separar tenant, proyecto y periodo en estado global.
2. Project selector debe listar proyectos; no periodos.
3. Period selector debe listar periodos derivados del proyecto seleccionado.
4. Sidebar period y dashboard period deben usar el mismo estado.
5. KPIs/listas deben filtrarse por periodo seleccionado.
6. Opcion `Todos los periodos` solo debe acumular cuando el usuario la elige explicitamente.
7. Configuracion del proyecto debe mostrar HR source como dato masked/editable con gate.
8. Crear/editar proyecto desde plataforma debe permitir configurar HR viva multihoja.
9. La misma configuracion debe servir para nuevos proyectos TyA y nuevos tenants.
10. Logo/brand del tenant debe propagarse a login, topbar, sidebar, portal cliente y exports.
11. Favicon debe ser del cliente/tenant cuando exista.
12. Manifest PWA e iconos deben usar brand config del tenant/cliente con fallback CXOrbia.
13. Instalacion PWA debe detectar dispositivo/navegador y mostrar CTA correcta.
14. Login debe tener un solo titulo y logo/brand configurado.
15. Banderas deben derivarse de paises configurados, no estar hardcodeadas.
16. Shoppers completos deben quedar para Auth/roles; preview publico debe mantener referencias protegidas.
17. Academia debe explicar tenant/proyecto/periodo, HR source, PWA/branding, Auth/roles y KPIs por periodo.
18. Copy debe decir DEV/source-safe/backend pendiente cuando aplique.

## Pendientes no autorizados para resolver con parches

- No resolver renombrando periodos como proyectos.
- No ocultar selector defectuoso sin corregir estado.
- No pegar logo fijo en HTML si no viene de configuracion.
- No hardcodear GT/HN como banderas permanentes.
- No colocar datos reales de shoppers en JS publico.
- No usar produccion como validacion.

## Validacion esperada post-Claude

- Login muestra TyA con un solo titulo y logo correcto.
- Favicon/PWA icon usan logo cliente/tenant.
- Proyecto muestra Cinépolis una sola vez.
- Periodo permite elegir meses historicos.
- KPIs cambian al cambiar periodo.
- Dashboard y sidebar no se desincronizan.
- Configuracion de proyecto muestra HR source masked.
- Academia refleja cambios.
- No hay promesas de integracion real sin gate.
