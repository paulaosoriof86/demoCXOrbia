# Cambios P0 visual configurability NO GO TyA

Fecha: 2026-07-09

## Archivos agregados

- `backend/contracts/phase-a-tenant-project-config-from-platform-v1.json`
- `backend/config/tya-phase-a-platform-project-config.source-safe.json`
- `app/docs/P0-VISUAL-CONFIGURABILITY-NO-GO-TYA-20260709.md`
- `app/docs/CLAUDE-P0-PACKAGE-TYA-CONFIGURABILITY-HR-VIVA-20260709.md`

## Motivo

Paula validó la URL DEV y detectó NO GO visual/configurable:

- proyecto y periodo mezclados;
- KPIs acumulados aunque se selecciona periodo;
- sidebar y dashboard con estado de periodo desincronizado;
- HR source no visible como dato de proyecto configurado;
- marca/logo no propagado;
- login con doble título;
- banderas deben depender de países configurados;
- shoppers protegidos requieren Auth/roles para ficha completa.

## Corrección realizada

No se parchó UI. Se agregó contrato y configuración source-safe para que TyA/Cinépolis quede modelado como si se hubiera configurado manualmente desde plataforma.

## Pendiente Claude/prototipo

Claude debe corregir la integración UI usando la configuración:

- project selector solo proyectos;
- period selector solo periodos;
- KPIs filtrados por periodo;
- HR source visible/masked en configuración;
- brand propagado a login/topbar/sidebar;
- flags desde countries;
- shopper full profile solo con Auth/roles.

## Estado seguro

Sin producción, sin merge final, sin writes, sin HR writeback, sin pagos, sin Make/Gemini live y sin datos sensibles en repo.
