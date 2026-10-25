# PHASE A TRACKER — Corte 4 read-only — 2026-07-29

## Cerrado

- M1: FROZEN/APROBADO.
- Corte 1: FROZEN/APROBADO.
- Corte 2A: FROZEN/APROBADO.
- Corte 3: FROZEN/ACTIVE_BASELINE.

## Corte 3 baseline

- ID: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Aprobación Paula: `Procede`.
- Baseline head: `1b34c3998625a3f2402ceeada283ab57b56ffbf6`.
- Finanzas, pagos mayo/junio y Hosting DEV: PASS.

## Corte 4 — avance

Estado: `READONLY_HARDENED_PROVIDER_IDENTITY_PENDING`.

### Completado

- Contrato read-only.
- Backend desactivado por defecto.
- Preview DEV read-only.
- Guard CX.data fail-closed.
- Bloqueo de persistencia y acciones operativas públicas.
- Backend vacío sin fallback a mock/localStorage.
- Rules candidate read-only preparado y no desplegado.
- Gate estático creado.
- Documentación Claude/Academia/pendientes actualizada.

### Pendiente vivo

1. Verificar identidad del proyecto Firebase.
2. Verificar que sea nuevo y vacío.
3. Verificar config DEV sin secretos.
4. Validar/autorizar Rules candidate.
5. Ejecutar gate.
6. Activar solo lectura DEV.
7. Smoke remoto CX.data vacío/source-safe.

## Cortes siguientes

- Corte 5: materialización dry-run/idempotencia.
- Corte 6: Auth/RBAC.
- Corte 7: HR sync/evidencias/Make/Gemini gates.
- Corte 8: preproducción/producción.

## Estado seguro

PR #7 draft/open/no merge; sin provider activation, deploy de Rules, producción ni writes.
