# RESUMEN PARA CLAUDE — ADDENDUM V103

Fecha: 2026-07-11

## Baseline y decisión

- V103 es una candidata válida de CXOrbia, sin contaminación Orbit.
- V103 queda en `HOLD`: no empalmar, no source lock, no deploy.
- Baseline del prototipo para la siguiente corrección: V103.
- Baseline operativa protegida: runtime Phase A empalmado con snapshot/adapters TyA.
- No sustituir el runtime con el ZIP genérico.

## No reabrir

Preservar:

- 106 archivos idénticos V101→V103;
- copy mejorado de Integraciones/Marketing;
- `connectionRef()` como señal de conexión;
- ausencia de llamadas directas a proveedores;
- `CX.permissions.ctx(extra)` como base;
- gates ya conectados en Automatizaciones/Integraciones/Diagnóstico;
- ciclo de vida, versiones, auditRef y soft-delete de Academia;
- guard de Certificación sin banco fuera de demo;
- lotes demo protegidos por modo;
- PWA network-first.

## Correcciones netas para Claude

1. Manifest/source lock reproducible y evidencia smoke realmente incluida.
2. Portal Cliente sin nombres, RNG, NPS, fechas o desglose inventado fuera de demo.
3. Separar `liquidada` de `pagada`; no usar fecha de visita como fecha de pago.
4. Dashboard desde periodos reales o `pending_source`.
5. Certificación preview/práctica separada de habilitación operativa.
6. Contexto de permisos por entidad/país real; no usar `countries[0]`.
7. Academia: visibilidad y handlers con acciones/contexto completos.
8. Copy/manuales/topbar sin API keys, promesas de Make/Gemini ni correos demo fuera de demo.
9. Sustituir hard-delete de visita por cancelación/archivo auditado y revisión HR.
10. Smoke de seis perfiles, desktop, móvil y consola reproducible.

## No tocar desde Claude

- snapshot HR;
- adapters/reconciliador TyA;
- entrada Phase A;
- Firebase/Auth/Storage/rules;
- imports y writeback;
- Make/Gemini/correo/pagos reales;
- `backend/`, `tools/`, workflows y secretos.

## Criterio de aceptación

Una siguiente candidata solo puede empalmarse mediante comparación contra V103 y empalme de tres vías con el runtime Phase A. Deben conservarse 14 periodos, 616 visitas, 213 shoppers protegidos y cero mezcla demo/source-safe.