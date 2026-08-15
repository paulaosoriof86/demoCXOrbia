# ACADEMIA — IMPACTO I3 LEGAL PROVIDER WIRING SOURCE-ONLY · 2026-08-15

## Estado

El bloque source-only de aceptación legal durable quedó validado en source final `0602d6ca0f64280222a4b1522b36f3be77c65c87`, gate `31913700755` / job `95082399402` SUCCESS. No hubo provider IO ni aceptación real.

## Qué podrá documentar Academia cuando el provider sea activado

La aceptación NDA/confidencialidad productiva será una acción humana del usuario autenticado, ligada a identidad exacta, tenant/scope/rol y versión legal. La plataforma conservará un receipt provider-authoritative con timestamp de servidor y podrá volver a solicitar aceptación cuando cambie la versión legal.

## Qué NO debe enseñar o simular

- QA/GitHub/automatizaciones no aceptan ni firman por el usuario.
- `#bnOk` no es consentimiento legal.
- localStorage o una marca local del navegador no es autoridad de aceptación.
- un receipt de otro usuario/rol/proyecto/versión no satisface el gate.
- el texto demo/local actual no debe publicarse como acuerdo TyA definitivo sin revisión humana.

## Impacto en rutas/cursos/manuales

Mantener el paso legal como gate humano previo al workspace cuando aplique. En manuales por rol, explicar que una nueva versión del acuerdo puede requerir nueva aceptación y que la evidencia anterior se conserva. No incluir credenciales, hashes internos, rutas privadas, IDs de QA ni detalles del runner.

Academia/Certificación del Shopper histórico permanecen diferidas y no se declaran PASS por este bloque.

## Sin impacto todavía

No se cambia contenido de cursos, manuales visibles ni rutas de usuario en este source-only block. La actualización editorial debe hacerse después de activar y validar el provider legal real.
