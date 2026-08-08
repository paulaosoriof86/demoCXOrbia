# ACADEMIA — Impacto Corte 4 VIS-02 deploy 1

**Fecha:** 2026-07-29

## Patrón reusable
Un backend conectado pero vacío es un estado válido de producto y debe representarse antes de montar vistas que dependan de proyecto/período.

## Lección de calidad de despliegue
Con Firebase Hosting y un rewrite global `** → index-backend-dev.html`, una referencia JavaScript inexistente puede responder `200` con HTML. El navegador la intenta interpretar como JS y genera `Unexpected token '<'` en vez de un 404 evidente.

Regla reusable incorporada: cada entrypoint debe pasar un gate que compruebe que todo `<script src>` relativo existe realmente, exceptuando solo assets generados explícitamente por el build.

## Ruta por rol
La prueba mínima del shell vacío debe incluir transición de roles, no solo primera carga:
`Admin vacío → logout → Shopper vacío → logout → Admin vacío`.

## Sin cambio de contenidos
No cambia cursos/manuales/rutas funcionales todavía; solo se incorpora el patrón técnico a la documentación académica de arquitectura, QA y fail-closed.
