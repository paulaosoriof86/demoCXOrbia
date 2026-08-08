# Drift Gate - Smoke Gate V91 Allowlist

Fecha: 2026-07-08  
Bloque: permitir `tya-phase-a-rc-smoke-gate.mjs` como cambio seguro post runtime validado  
Estado: seguro, sin deploy, sin produccion.

## 1. Contexto

Tras ampliar el smoke gate para cubrir V91 Academia/Diagnostico/Administrabilidad, el head `9128f01ca02f219e087e95c90b69de8be99c004b` reporto:

- RC Smoke Gate: success;
- Predeploy Gate: success;
- Visual Smoke: success;
- Drift Gate: failure.

La causa raiz no fue un cambio runtime de `/app`. El diff contra el runtime validado incluia `tools/migration/tya-phase-a-rc-smoke-gate.mjs`, que antes no estaba permitido por el drift gate aunque es un validador seguro.

## 2. Archivo actualizado

- `tools/release/tya-rc-phase-a-drift-gate.mjs`

## 3. Cambio aplicado

Se agrego a `allowedExact`:

`tools/migration/tya-phase-a-rc-smoke-gate.mjs`

Tambien se documento en la politica del reporte:

`smokeGateValidators: true`

## 4. Decision tecnica

No se relajo la regla para runtime de app. No se permitieron cambios generales en `/app`. No se desactivo drift.

Solo se permitio el archivo especifico del smoke gate porque:

- no ejecuta providers;
- no hace deploy;
- no escribe en base;
- no importa datos reales;
- valida carga de scripts, sintaxis, documentos, guard, Academia, Diagnostico, Administrabilidad y Service Worker;
- es parte de la puerta segura hacia RC Phase A.

## 5. Impacto Phase A

Permite seguir avanzando sin que el drift bloquee mejoras al propio smoke gate, manteniendo bloqueados los cambios runtime no validados.

## 6. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
