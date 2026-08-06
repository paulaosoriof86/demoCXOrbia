# ACADEMIA — Impacto C6 perfiles HOLD y autoridad HR viva

**Fecha:** 2026-08-06

## Contenido que debe actualizarse

### Administradores y Operaciones

- Diferencia entre HR viva, materialización Firestore y fallback temporal.
- Cómo verificar `sourceRevision`, última lectura y periodo activo.
- Qué significa `ARCHIVE_LEGACY_NO_AUTH` y por qué no elimina historia.
- Cómo decidir si un perfil histórico necesita credencial vigente.
- Qué hacer ante empate multi-Auth: revisión humana, nunca selección automática.

### Shopper

- Un perfil archivado conserva histórico, pero no tiene acceso activo.
- La actividad visible depende de la identidad exacta y de la revisión viva de HR.

### Soporte técnico

Checklist obligatorio:

1. metadata provider responde;
2. pestañas mensuales se autodetectan;
3. mes actual se activa solo cuando existe;
4. cambios históricos se reflejan tras nueva revisión;
5. todos los módulos comparten `sourceRevision`;
6. fallback no se presenta como dato vivo.

## Academia interactiva

Agregar un caso práctico de rollover mensual y otro de corrección histórica en HR, con estado esperado antes/después y errores frecuentes.

## Estado

Documentación preparada; no se modificó frontend, no se publicó contenido y no se activó Gemini.
