# RESUMEN PARA CLAUDE — Addendum C6 fast-track de producción source-only

**Fecha:** 2026-08-06

No modificar `/app/modules/*`, `/app/core/*` ni `CX.data`.

## Preservado

Frontend acumulativo, Login, Finanzas, Histórico, Visitas, Portales, Reservas, multi-tenant, multi-proyecto, SKIP13 y plan Shopper `HOLD=0`.

## Hallazgo backend/configuración

La configuración versionada sigue siendo solo DEV:

```text
default/dev project=cxorbia-backend-dev
hosting target=cxorbia-dev
Cloud Run service=cxorbia-live-hr-dev
production target=false
```

No mostrar este estado técnico en la UI. No parchar frontend para simular producción.

## Pendiente real

- evidencia terminal del request HR `ac2032ec...`;
- HR viva `2026-08`, GT/HN, historia y `sourceRevision`;
- Auth con gate separado;
- smoke multirol;
- target de producción materializado y validado;
- autorización específica de cutover.

## Sin impacto Claude

Este bloque fue exclusivamente source/config/docs. No requiere cambios visuales ni funcionales en el prototipo.
