# Pendientes prototipo generico HR viva configurabilidad PWA

Fecha: 2026-07-09

## Proposito

Registrar pendientes genericos para el prototipo CXOrbia sin contaminarlo con tenant, cliente o proyecto especifico.

## Pendientes P0

1. Separar modelo tenant/proyecto/periodo en estado compartido.
2. Project selector solo debe listar proyectos.
3. Period selector solo debe listar periodos del proyecto elegido.
4. Sidebar period y dashboard period deben estar sincronizados.
5. KPIs y listas deben filtrar por periodo seleccionado.
6. Acumulado historico debe requerir opcion explicita.
7. Fuente viva debe ser dato configurable del proyecto.
8. Fuente viva debe mostrarse como masked/reference.
9. Paises, banderas y monedas deben salir de configuracion.
10. Branding debe alimentar login, topbar, sidebar, portal cliente, exports, favicon y PWA.
11. Manifest PWA debe usar brand config con fallback CXOrbia.
12. Instalacion PWA debe detectar dispositivo/navegador.
13. Login no debe duplicar titulo.
14. Preview publico no debe exponer datos sensibles.
15. Perfil completo de shopper requiere Auth/roles.

## No incluir

- Nombres de tenant reales.
- Nombres de proyectos reales.
- URLs privadas completas.
- IDs de documentos privados.
- Shoppers reales.
- Telefonos, correos, DPI, banco o direccion.

## Replicable

Estos pendientes aplican a cualquier nuevo tenant, nuevo proyecto, nuevo pais, nueva moneda, nueva HR multihoja, nuevo cuestionario y nueva certificacion.