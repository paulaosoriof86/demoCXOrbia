# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 13:37 -06:00  
**Estado:** `I3_2_DEV_DEPLOY_PARITY_PASS__STAFF_RUNTIME_FOCAL_FAIL__GRANULAR_DIAGNOSTICS_SOURCE_PASS__NO_REPROCESS`

## 2026-08-17 — I3.2 exact DEV deploy + runtime focal diagnostics

### Ejecución autorizada

Se reutilizó el workflow existente `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`. No se creó rama, PR ni workflow nuevo.

Request one-shot:
`backend/config/corte6-dev-root-entrypoint-hosting-execute.json` → `i3-2-authority-compat-dev-deploy-20260817-01`.

Target source HEAD: `245614e34bba033078342a43cecf489cbbaf7608`.
Request commit: `ecafe08e48ab29b632e83f14fc51045a3977c3f9`.

Run `32058831910`; job `95475132736`; artifact `9297383869`; digest `sha256:621ed03757b029e48e803858e85895f1c8548618ff4353e44a85552aea80180c`.

### PASS reales

- source/request preflight;
- Firebase Hosting DEV deploy exacto `1`;
- root/direct remote parity `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`;
- remote hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`;
- Staff canonical credential selection sin writes.

Esto cierra para ese intento el riesgo de visualizar un build viejo distinto al source desplegado.

### FAIL focal

Authenticated Staff runtime falló con `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`. El readiness previo ya había observado Auth Staff, membership verificada, protected HR authority aplicada, `projects/visits` dinámicos no vacíos, currentProjectId/currentPeriodId y app visible/login hidden.

La aserción que falló agrupaba cinco causas distintas. No se modificó producto por intuición.

### Cambio tooling source-only

Archivo tocado:
`tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs`.

Commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`.

Se añadió:
- error separado para empty shell/backend empty/no project/no period/source block;
- router/shell mounted;
- selectores Proyecto/Periodo;
- estado legal sanitizado;
- último snapshot en evidencia de fallo.

No se autoacepta legal ni se toca `/app/modules` o `/app/core`.

Source-only preflight request `i3-2-runtime-granular-diagnostics-source-preflight-20260817-01`: run `32060010492`, job `95478920028`, PASS. Provider calls 0; deploys 0; Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes 0. Request consumido/disabled.

El primer one-shot DEV también quedó consumido/disabled; no rerun automático.

### Documentación

Nuevo source lock:
`SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`.

Academia:
`ACADEMIA-ADDENDUM-I3-2-RUNTIME-GATE-GRANULAR-DIAGNOSTICS-20260817.md`.

Índice/checkpoint/tracker/Claude/PENDIENTES/PR sincronizados al cierre del bloque.

### Progreso

I1 `15/15`; I2 `20/20`; I3 formal `0/25` hasta cierre integral. I3.1 PASS. I3.2 deploy/paridad PASS, runtime abierto. **GO-LIVE formal 35%/65%.** Al cerrar I3 se moverá a 60%, I4 a 85%, I5 a 100%.

### Clasificación

- Reusable CXOrbia: exact-build parity, granular runtime harness, STOP_RETRY.
- Exclusivo cliente: TyA DEV y legal receipt pendiente.
- Claude/prototipo: no cambio módulos/core; no rediseño.
- Academia: patrón de readiness efectivo.
- Sin impacto Claude: tooling/gates/documentación.

## 2026-08-17 — Unificación del plan Phase A y sincronización anti-desvío

Se creó `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md` como fuente prevalente de secuencia. Integra Cortes 0B→8, S1→S6 e I1→I5 sin crear plan nuevo; enumera I3.1→I3.11, I4.1→I4.12 e I5.1→I5.8 y preserva todo el alcance Phase A.

Dos pendientes históricos quedaron explícitos para evitar omisión: I3.7 legal receipt durable readback e I3.8/I3.9 alta provider-backed + E2E de un Shopper nuevo, distintos del Admin existente y Shopper histórico PASS.

## 2026-08-17 — I3 Admin TARGET_B credential recovery

Run `32049054855`, job `95443726801`: TARGET_B Admin password sign-in real PASS. Auth/password changes/resets/Firestore/Shopper/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción `0/false`. Paula logró ingresar; no crear/rotar/reemplazar Admin.

## Histórico preservado

Historical Shopper run `31906391682` PASS congelado. Reset único consumido; futuras continuaciones `passwordResets=0`. HR viva 15/660 y Finance source-safe/histórico se preservan; no reprocesar.
