# ADDENDUM RESUMEN-PARA-CLAUDE — C6 Runtime 11

Fecha: 2026-08-12

## Conectado y comprobado

- Login visible canónico `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Principal Staff canónico Exact Write V2 `B=admin` seleccionado sin bundle legacy.
- Firebase Auth y claims reales DEV.
- Membership canónica `tenants/tya/users/{uid}` alcanzada dentro del handoff.
- HR authority viva: 15 periodos, 660 visitas, 211 shoppers; 2025-06 → 2026-08; duplicados=0.
- Hosting DEV y remote parity exacta.
- Frontend llegó a shell visible (`appOn=true`, login oculto, stale empty limpiado).

## Pendiente backend, no Claude

M7 todavía necesita una nueva ejecución one-shot para demostrar que la metadata canónica de membership permanece en `CX.session/RBAC` después de `CX.app.enter()`, y luego 3 reloads + new-tab.

La causa de runtime 11 fue backend/session wiring, no UI: el wrapper de Auth reconstruyó `CX.session.user` desde claims y eliminó metadata de membership. Se corrigió en el adapter C6 sin tocar frontend/core.

## Ajustes frontend para Claude

**Ninguno nuevo derivado de runtime 11.** No modificar `app/app.js`, `app/core/backend-browser-auth.js` ni módulos para este incidente. La reparación está encapsulada en backend adapter.

## Academia

Sin cambio de contenido en este bloque. Cuando M7 quede PASS, validar que manuales/rutas de Admin y Operativo describan login real, alcance por tenant/proyecto y sesión autorizada sin mencionar superficies técnicas DEV.

## Estado seguro

No merge, no producción, no Make/Gemini/pagos, no nuevos Auth/Firestore/HR writes posteriores al Exact Write V2 cerrado.
