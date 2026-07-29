# ACADEMIA — Impacto corrección arquitectura backend TyA

**Fecha:** 2026-07-29

## Patrón reusable
1. Diferenciar siempre **sistema legacy/origen de migración**, **backend canónico del producto**, **sandbox de prueba** y **Hosting público**.
2. “Backend poblado” no equivale a “legacy contaminado”; primero se inventaría y se clasifica el origen de esos datos.
3. Un sandbox puede servir para descubrir P0 sin convertirse en destino de producción.
4. Migración incremental: reutilizar lo ya materializado y cargar solo delta/faltantes.
5. Cutover: preservar URL pública cuando el negocio lo requiere, con smoke y rollback.

## Caso TyA
- legacy TyA: origen de shoppers/certificaciones útiles, sistema a retirar;
- HR: fuente principal de visitas/operación;
- `cxorbia-backend-dev`: backend DEV canónico del primer tenant TyA;
- sandbox Corte 4: evidencia técnica, no backend destino;
- Hosting público actual: URL a conservar en producción.

## Rutas/manuales
Agregar este patrón a arquitectura, migración, QA y troubleshooting. No cambia cursos operativos de shopper por sí solo.

## Clasificación
- Reusable CXOrbia: sí.
- Exclusivo TyA: identidades concretas de proyectos/Hosting.
- Claude/prototipo: sin cambio inmediato.
