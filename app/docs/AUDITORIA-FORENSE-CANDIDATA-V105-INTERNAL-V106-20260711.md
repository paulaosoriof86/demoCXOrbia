# Auditoría forense — paquete V105 / build interno V106

Fecha: 2026-07-11

## Identidad

- Archivo: `Prototype development request CXOrbia V105.zip`.
- SHA-256: `582a8c98cdac7b46028bb720d1304657c6d678e99e4bc23a49e80ab440bc8206`.
- El ZIP se llama V105, pero `build-lock.js`, manifest activo, verificador y smoke declaran V106.
- Identidad técnica adoptada para continuidad: **V106**.

## Decisión actualizada

Por autorización expresa de Paula y conforme al addendum maestro de última versión, V106 queda como **baseline auditada de continuidad empalmada**, no source lock final.

No presenta bloqueo estructural: raíz `app/`, namespace CXOrbia, sin Orbit/R5/backend dentro del frontend, 0 errores de sintaxis, scripts completos, UTF-8 correcto y módulos sin duplicados. Los P0 funcionales siguen documentados y no se consideran resueltos.

## Delta V104 → V106

- 7 archivos agregados;
- 8 modificados;
- 0 eliminados;
- avances preservados: Histórico excluye activo; `pending_backend` no habilita certificación; práctica no emite evento; Dashboard elimina dos KPIs fabricadas; permisos geo fallan cerrado; archivo de visita; historial de estados; copy puntual WhatsApp; smoke dirigido.

## Pendientes netos

1. Manifest interno inválido e identidad V105/V106 inconsistente.
2. Portal Cliente sigue sintetizando responsable, NPS, histórico, secciones y fechas fuera de demo.
3. Purga demo borra namespaces completos y puede eliminar datos reales.
4. Pago confirmado/lotes aún admiten evidencia insuficiente.
5. Beneficios puede exponer liquidaciones de otros shoppers.
6. Call-sites de permisos no pasan siempre tenant/proyecto/país/entidad reales.
7. Certificación requiere segundo actor autenticado y lifecycle completo.
8. Finanzas conserva estimaciones 15%/85%, presupuestos/series sintéticas.
9. Copy residual Make/WhatsApp/correo/Gemini/manuales.
10. Smoke source-safe, Cliente, Academia, scopes y móvil 360/390/412.
11. Academia requiere scope, entidades administrables, workflow humano, rutas/progreso, notificaciones y backfill por módulo.

## Estado seguro

Sin deploy, merge, import real, Firebase/HR writes, Make/Gemini, pagos ni producción.
