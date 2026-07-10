# Academia impact generico HR viva configurabilidad PWA

Fecha: 2026-07-09

## Proposito

Actualizar Academia con conceptos genericos reutilizables para cualquier tenant/proyecto, sin sesgo a un cliente especifico.

## Temas obligatorios

1. Diferencia entre tenant, proyecto y periodo.
2. Como crear un proyecto desde plataforma.
3. Como configurar una fuente viva del proyecto.
4. Por que la fuente viva se muestra masked/reference.
5. Como se detectan periodos desde una fuente multihoja.
6. Como se filtran KPIs por periodo.
7. Como elegir acumulado historico explicitamente.
8. Como paises configurados generan banderas y monedas.
9. Como branding configura login, topbar, sidebar, favicon y PWA.
10. Como funciona instalacion PWA por navegador/dispositivo.
11. Diferencia entre preview source-safe y backend protegido con Auth/roles.
12. Por que perfil completo de shopper requiere Auth/roles.
13. Que significa gate apagado para pagos, integraciones, IA y writeback.

## Por rol

### Admin SaaS

Configura tenants, marca, paises, modulos y proyectos.

### Admin de tenant

Configura proyectos, fuentes vivas, reglas, cuestionarios, certificaciones y pagos.

### Coordinador operativo

Valida periodos, KPIs, visitas, postulaciones y liquidaciones por periodo.

### Shopper

Accede a su informacion protegida solo con rol/autenticacion.

### Cliente

Consulta resultados por proyecto/periodo sin datos sensibles.

## Criterio Academia GO

Academia es GO solo si explica la logica generica y no usa un cliente real como plantilla fija.