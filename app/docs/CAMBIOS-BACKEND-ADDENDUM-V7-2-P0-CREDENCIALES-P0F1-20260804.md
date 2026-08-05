# CAMBIOS BACKEND — V7.2 P0 credenciales y correctivo P0F1

**Fecha:** 2026-08-04  
**Estado:** `V7_2_P0_PROVEN__P0F1_PREPARED__PENDING_FOCUSED_REAUDIT__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## Qué se hizo

- Se recibió evidencia Codex de `EXECUTION_LANE_READY` y auditoría focalizada V7.2.
- Se registró `P0_PROVEN` por exposición visible de contraseñas en `app/app.js`.
- No se aplicó V7.2 y el worktree quedó limpio.
- Se generó una revisión corregida de la misma candidata: `V7.2-P0F1`.
- Se preservó íntegramente el correctivo responsive de `app/styles/layout.css`.
- Se restauraron los textos seguros del HEAD vivo en los tres puntos afectados de `app/app.js`.
- Se preparó un paquete y prompt de continuidad para el mismo workspace Codex.

## Evidencia

- HEAD auditado: `da42e818c626e8bba56407869f5f3b32b61f49eb`.
- ZIP V7.2: `d3b7551b3b0b30e1b071dfc74beb20009c9c523c2955cce760148da6b8727686`.
- ZIP V7.2-P0F1: `09606d1cc133a1e1e138be76bd8c6aadeb1f70d7967d506aae3f81bf5e9c6fce`.
- Paquete Codex P0F1: `db19a06ae487577abe17ba317c9828593448a47344978c734f49cb230850d308`.
- `node --check` P0F1: PASS.
- UTF-8 sin BOM: PASS.
- Patrones sensibles ausentes: `CX.CREDS.passExample()`, `CX.CREDS.pass(f,l)`, `${s.pass}`.

## Clasificación

- **Reusable CXOrbia:** patrón de preservación de secretos/credenciales frente a regresiones de candidata.
- **Exclusivo TyA:** textos y flujo de registro Shopper del tenant.
- **Claude/prototipo:** correctivo focalizado en `app/app.js`; `layout.css` responsive preservado.
- **Academia:** sin cambio funcional de contenidos; registrar que las credenciales no deben mostrarse en manuales o rutas formativas.
- **Sin impacto Claude:** backend, adapters, contratos, tools y datos no fueron modificados.

## Estado Phase A

- Avance: carril Codex funcional y P0 detectado antes del empalme.
- Preservado: composición canónica source-only y todos los bloques protegidos.
- Pendiente real: reauditoría focalizada P0F1; si GO, empalme atómico y post-gates.

## Estado seguro

- código en rama viva modificado por la candidata: no;
- empalme: 0;
- deploy: 0;
- provider/data writes: 0;
- merge/producción: 0.
