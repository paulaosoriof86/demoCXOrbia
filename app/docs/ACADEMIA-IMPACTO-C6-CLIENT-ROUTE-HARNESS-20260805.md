# ACADEMIA — Impacto C6 client route harness

**Fecha:** 2026-08-05  
**Clasificación:** Academia · Sin impacto funcional

## Resultado

El diagnóstico `client_route_wait` clasificó el timeout como una condición incorrecta del harness, no como una falla del producto.

No se modificaron:

- módulos de Academia;
- rutas por rol;
- cursos;
- manuales;
- certificaciones;
- notificaciones;
- datos de aprendizaje;
- navegación del Portal Cliente.

## Evidencia relevante

El Portal Cliente aceptó `cli_dashboard`, presentó encabezado y contenido y no produjo excepción de render. La única condición ausente fue el nodo `#nav-cli_dashboard`, requerido incorrectamente por el gate.

## Acción documental futura

Después de que el harness corregido obtenga PASS y Paula valide visualmente, los manuales podrán mantener la ruta Cliente vigente sin cambio de capturas ni instrucciones por este incidente.

## Seguridad

Cero deploy, writes, merge o producción en este bloque.
