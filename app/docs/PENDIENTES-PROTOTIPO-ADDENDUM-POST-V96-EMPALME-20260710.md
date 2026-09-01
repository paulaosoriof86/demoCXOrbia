# Pendientes prototipo — Addendum post-V96 empalme

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`

## Decisión

La candidata post-V96 queda empalmada como source lock operativo actualizado. No es producción ni GO real.

## P1 para Claude si queda capacidad

1. Categorizar módulos `cli_*` en `CX.MOD_CAT` o crear categoría/allowlist cliente explícita:
   - `cli_dashboard`
   - `cli_sucursales`
   - `cli_acciones`
   - `cli_insights`
   - `cli_capacitacion`
   - `cli_reportes`
   - `cli_programa`
   - `cli_market`

2. Cambiar fallback de módulo desconocido a fail-closed absoluto:
   - hoy `CX.MOD_CAT[id] || 'cfg'` es más seguro que `true`, pero un rol con `cfg` podría acceder a un módulo futuro sin categoría;
   - preferible `if(!CX.MOD_CAT[id]) return false` salvo allowlist explícita.

3. Barrido menor de copy:
   - `modules/soporte.js`: `Responder WA` y `Respondiendo por WhatsApp (Make)…` deben decir borrador manual / Make pendiente backend;
   - `modules/misvisitas.js`: `Enviar evidencias (WhatsApp)` debe decir WhatsApp Web / borrador manual;
   - `modules/hr-source.js`: evaluar label `Conectado por backend`.

## No pedir a Claude rehacer

- Permisos fail-closed ya corregidos para módulos admin actuales.
- Scope cliente multi-proyecto.
- HR Source candidates.
- Academia profunda acumulada.
- PWA/branding.
- Persistencia de proyectos/usuarios.
- Copy honesto ya corregido en Topbar, Dashboard, Cliente, Correo, CRM, Postulaciones y Automatizaciones.

## Impacto Academia

Academia debe reflejar permisos fail-closed, cliente multi-proyecto y diferencia entre WhatsApp Web manual, in-app y Make real.

## Estado seguro

Pendientes de prototipo solamente. No backend real, no Auth real, no Firestore write, no import real, no producción, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.