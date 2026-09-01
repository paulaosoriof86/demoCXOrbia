# Pendientes prototipo addendum generico full backend flujos academia

Fecha: 2026-07-09

## Pendientes P0 genericos

1. Separar tenant, proyecto y periodo en estado global configurable.
2. Selector de proyecto solo muestra proyectos.
3. Selector de periodo solo muestra periodos del proyecto.
4. Sidebar y dashboard comparten el mismo periodo.
5. KPIs y listas filtran por periodo.
6. Acumulado historico solo por seleccion explicita.
7. Fuente viva/source se configura por proyecto y se muestra masked/reference.
8. Nuevos tenants y proyectos pueden crearse manualmente con la misma estructura.
9. Branding alimenta login, topbar, sidebar, portal cliente, exports, favicon y PWA.
10. Manifest e iconos PWA derivan de brand config con fallback.
11. Instalacion PWA detecta dispositivo/navegador.
12. Paises, banderas y monedas salen de configuracion.
13. Shoppers completos solo con Auth/roles.
14. Preview publico solo source-safe.
15. Integraciones, pagos, IA e imports visibles como gate-off cuando no estan activos.
16. ReviewQueue y auditEvents visibles como conceptos operativos.
17. Academia actualizada por rol con manuales, checklists y glosario.

## No debe resolver con parches

- No esconder problemas de modelo en copy o CSS.
- No hardcodear nombres, logos, paises, periodos o fuentes.
- No mezclar periodo en nombre de proyecto.
- No mostrar datos sensibles para simular avance.
- No prometer backend real si el gate esta apagado.