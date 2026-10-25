# Resumen addendum P0 configurability HR viva TyA

Fecha: 2026-07-09

Se agregó paquete P0 para Claude y contrato/config backend source-safe tras validación visual de Paula.

## Estado

HR viva multihoja se lee en DEV, pero la integración visual/configurable queda NO GO.

## Archivos relevantes

- `backend/contracts/phase-a-tenant-project-config-from-platform-v1.json`
- `backend/config/tya-phase-a-platform-project-config.source-safe.json`
- `app/docs/P0-VISUAL-CONFIGURABILITY-NO-GO-TYA-20260709.md`
- `app/docs/CLAUDE-P0-PACKAGE-TYA-CONFIGURABILITY-HR-VIVA-20260709.md`

## Instrucción para Claude

Corregir sin rediseñar desde cero:

- TyA como tenant;
- Cinépolis como proyecto;
- periodos derivados de HR viva;
- proyecto y periodo separados;
- KPIs filtrados por periodo;
- HR source visible como configuración protegida/masked del proyecto;
- logo/brand del tenant en login/topbar/sidebar;
- login sin doble título;
- banderas derivadas de países configurados;
- shoppers completos solo con Auth/roles.

## Estado seguro

No producción, no merge final, no Firestore/Auth/Storage real, no HR writeback, no pagos, no Make/Gemini live, no datos sensibles en repo.
