# ACADEMIA — IMPACTO I3 LEGAL PROVIDER WIRING SOURCE-ONLY · 2026-08-15

## Estado

El bloque source-only de aceptación legal durable quedó validado en source final `0602d6ca0f64280222a4b1522b36f3be77c65c87`, gate `31913700755` / job `95082399402` SUCCESS. No hubo provider IO ni aceptación real.

Con autorización de Paula también se preparó `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`. Está marcado `NOT_APPROVED`; no es contenido provider-authoritative y no cambia todavía cursos/manuales visibles.

## Qué podrá documentar Academia cuando el provider sea activado

La aceptación NDA/confidencialidad productiva será una acción humana del usuario autenticado, ligada a identidad exacta, tenant/scope/rol y versión legal. La plataforma conservará un receipt provider-authoritative con timestamp de servidor y podrá volver a solicitar aceptación cuando cambie la versión legal.

El draft V0.1 agrega temas que deberán reflejarse por rol cuando el texto final sea aprobado:
- confidencialidad y reserva de proyectos;
- protección de credenciales y mínimo privilegio;
- uso legítimo de evidencias;
- prohibición de publicar o reutilizar evidencias;
- privacidad y minimización de datos;
- manejo reforzado de documentos, datos bancarios y evidencia privada;
- reporte de incidentes;
- propiedad intelectual y software;
- obligaciones especiales de Shopper, staff/admin y Cliente;
- reaceptación por cambio material del contenido legal.

## Qué NO debe enseñar o simular

- QA/GitHub/automatizaciones no aceptan ni firman por el usuario.
- `#bnOk` no es consentimiento legal.
- localStorage o una marca local del navegador no es autoridad de aceptación.
- un receipt de otro usuario/rol/proyecto/versión no satisface el gate.
- el texto demo/local actual no debe publicarse como acuerdo TyA definitivo.
- el draft V0.1 tampoco debe publicarse como definitivo antes de completar datos, revisión humana y versión/digest final.
- consentimientos opcionales no deben presentarse como obligatorios ni premarcados.

## Impacto en rutas/cursos/manuales

Mantener el paso legal como gate humano previo al workspace cuando aplique. En manuales por rol, explicar que una nueva versión del acuerdo puede requerir nueva aceptación y que la evidencia anterior se conserva.

Para Shopper: confidencialidad de escenarios, evidencias, autenticidad de visitas, no compartir cuenta y no reutilizar material.

Para Admin/Operaciones: mínimo privilegio, no exportar datos sensibles sin necesidad, no resolver conflictos por fuzzy matching y no sobrescribir silenciosamente HR/plataforma.

Para Cliente: confidencialidad recíproca, uso limitado de resultados, protección de identidad Shopper y prohibición de represalias/contacto fuera del flujo acordado.

No incluir credenciales, hashes internos, rutas privadas, IDs de QA ni detalles del runner en Academia.

Academia/Certificación del Shopper histórico permanecen diferidas y no se declaran PASS por este bloque.

## Sin impacto runtime todavía

No se cambia contenido de cursos, manuales visibles ni rutas de usuario en este bloque. La actualización editorial debe hacerse después de aprobar el contenido legal final, activar y validar el provider legal real.
