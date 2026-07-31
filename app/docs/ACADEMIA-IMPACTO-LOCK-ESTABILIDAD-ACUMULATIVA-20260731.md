# Academia — impacto del lock de estabilidad acumulativa

**Fecha:** 2026-07-31  
**Estado:** documental; sin deploy ni providers.

## Objetivo
Incorporar a Academia y manuales una regla transversal: una actualización de fuente, etapa o módulo no puede hacer desaparecer ni reinterpretar funcionalidades previamente aprobadas.

## Contenido a reflejar
- ownership de datos por fuente: HR viva, perfil protegido, finanzas/pagos, Auth/RBAC y plataforma-origin;
- diferencia entre fuente, overlay y read model;
- composer idempotente: aplicar la misma capa dos veces no cambia conteos ni duplica registros;
- actualización HR en background sin recargar ni mover la posición del usuario;
- identidad Shopper resuelta por llaves técnicas/crosswalk, no por similitud de nombre;
- conflicto de identidad pasa a revisión humana;
- regression gate acumulativo antes de cada release;
- estados de cuestionario y submitido permanecen separados y no se reinterpretan por pantalla.

## Rutas por rol
- Admin/Coordinación: cómo reconocer fuente vigente, refresh, conflicto y estado de revisión.
- Shopper: la actualización de datos no debe cambiar de pantalla ni perder contexto.
- Superadmin: cómo leer el regression gate antes de aprobar un cambio.

## Checklist de manuales/cursos
Cada cambio futuro debe responder:
1. qué añade;
2. qué datos previos preserva;
3. qué fuente manda en cada dato;
4. qué comportamiento visual no puede cambiar;
5. qué regression tests pasaron;
6. qué conflicto queda en HOLD.

## Estado seguro
No cambia UI, no publica contenidos, no ejecuta Gemini/Make, no escribe proveedores y no entra a producción.
