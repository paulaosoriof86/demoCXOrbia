# Pendientes Claude V79 Phase A

Fecha: 2026-07-04

## P0 - corregir antes de aprobar candidata

1. Unificar enum de origen de cuestionario entre `proyecto-wizard.js`, `proyectos.js`, `cuestionario-shopper.js` y consumidores.
2. Hacer que cuestionario externo general y link por visita desde HR funcionen realmente y no caigan en formulario interno.
3. Agregar revision como etapa funcional real: estado, accion admin, fecha, resultado y siguiente paso.
4. Configurar por proyecto quien revisa, quien submitira/cerrara, si submitido viene desde HR y que habilita liquidacion.
5. Llevar configuracion Phase A al wizard de creacion o exigir setup completo antes de activar proyecto.
6. Corregir textos que prometen HR/Make/WhatsApp/Gemini real si solo es demo/preparado.
7. Corregir bug `nvBanner`.
8. Corregir version default de nuevo tenant en SaaS Console.

## P1 - necesario para Phase A controlada

9. Modelar HR source con origen, URL/sourceRef seguro, mapa de columnas, campo link cuestionario, campo revision y campo submitido.
10. Modelar contactos por gestion con nombre, WhatsApp, enabled, plantilla y fallback.
11. Agregar indicador visual de integracion preparada/backend pendiente/activo por proyecto.
12. Revisar PWA install-aware.

## P2 - mejora posterior

13. Modal posterior a visita realizada debe poder mostrar contacto de cuestionario ademas de evidencias.
14. Agregar plantillas WhatsApp Web por evento: evidencias, recordatorio cuestionario, reprogramacion, cancelacion, pago.

## Decision

Enviar a Claude ahora. V79 resolvio parte visual importante, pero mantiene P0 funcionales.
