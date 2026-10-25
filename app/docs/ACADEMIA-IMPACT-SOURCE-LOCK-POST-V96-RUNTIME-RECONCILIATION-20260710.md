# Impacto Academia — Reconciliación source lock post-V96

Fecha: 2026-07-10

## Impacto general

Este bloque no cambia contenido visible de Academia, pero identifica que el runtime de la rama no coincide íntegramente con el source lock post-V96. Por ello, cualquier manual o curso que describa el comportamiento final debe considerarse pendiente de verificación hasta después del empalme controlado.

## Módulos con impacto formativo

La lista de hashes diferentes incluye:

- Academia;
- Administrabilidad;
- Diagnóstico;
- HR Source;
- Proyectos;
- Configuración;
- Shoppers;
- Postulaciones;
- Visitas;
- Finanzas;
- Soporte;
- Mis Visitas;
- Dashboard;
- portal Cliente.

Por tanto, no debe publicarse como definitiva una ruta de aprendizaje basada únicamente en la rama actual o únicamente en el ZIP sin validar el empalme resultante.

## Contenido que debe actualizarse después del empalme

### Ruta superadmin/admin

- diferencia entre source lock, runtime empalmado, preview, DEV y producción;
- lectura del Diagnóstico/Readiness;
- permisos fail-closed y revisión de roles;
- HR Source configurada vs conectada por backend;
- reviewQueue y conflictos;
- liquidaciones/pagos como control administrativo.

### Ruta coordinador/aliado/custom

- módulos permitidos por scope;
- ausencia de módulos administrativos fuera de scope;
- proyecto/país asignado;
- estados honestos de sincronización y outbox.

### Ruta cliente

- selector de proyecto cuando existe más de uno;
- conservación de proyecto activo;
- alcance de reportes/portal;
- diferencia entre datos demo, source-safe y datos conectados.

### Ruta shopper

- visitas, postulaciones y certificación carryover;
- Mis Visitas y Soporte;
- WhatsApp manual/fallback;
- beneficios, honorario, reembolso y estado de pago.

## Elementos interactivos requeridos

Después del empalme se debe revisar o crear:

- checklist de validación por rol;
- lección sobre gates y estados honestos;
- guía de lectura de Diagnóstico;
- FAQ de “preparado no significa conectado”;
- checklist de HR Source;
- glosario: source lock, runtime, preview, dry-run, gate, DEV, producción, reviewQueue;
- notificación de manual actualizado cuando el runtime sea aceptado.

## Patches de Academia

La rama contiene archivos adicionales de Academia que no están en el paquete post-V96:

- `app/modules/academia-admin-actions.js`;
- `app/modules/academia-create-ai-stable.js`.

No deben borrarse automáticamente. Durante el empalme se debe decidir si:

- se preservan como patches;
- se integran de manera mantenible en `academia.js`;
- o se sustituyen por una implementación equivalente del source lock.

Siempre debe mantenerse:

- IA en preview/revisión humana mientras Gemini esté apagado;
- contenido administrable;
- estados draft/in_review/published honestos;
- rutas por rol y profundidad operativa.

## Estado seguro

Documento solamente. No publica cursos, no modifica Academia, no activa Gemini, no envía notificaciones y no cambia runtime.
