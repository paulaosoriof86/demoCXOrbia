# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-15 17:03 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP_SAFE__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; Firebase DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS 15/15. I2 PASS 20/20. Shopper histórico I3 PASS congelado en run `31906391682`; un único reset histórico ya consumido. Prohibido repetir reset/recovery/reconcile o acceder a esa credencial. Toda continuación: `passwordResets=0`.

## Request08

Run `31909354336`, job `95071998299`: STOP seguro `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Request consumido. No hubo `shopper.create`, update, readback ni login de Shopper nuevo; Auth/Firestore writes nuevos `0/0`; aceptación legal automática `0`.

## Bloque source-only legal durable

Source final `0602d6ca0f64280222a4b1522b36f3be77c65c87`.

Gate push `31913700755` / job `95082399402`: `SUCCESS`. Gate PR `31913704247` / job `95082407608`: `SUCCESS`.

Preparado y verificado:
- contrato durable account-scoped/versionado;
- provider runtime `legal.acceptance.record` con gate previo a IO;
- actor derivado del Firebase ID token verificado;
- `acceptedAt` server-side;
- receipt determinista create-only e idempotente;
- read model provider-authoritative, memory-only, fail-closed;
- browser bridge source-only, todavía no activado en product entrypoint;
- no fuzzy matching, no automaticAcceptance, no `#bnOk` como aceptación.

Efectos reales del bloque: provider credentials/reads/writes `0/0/0`; Auth/Firestore/legal writes `0/0/0`; historical access/reset/reconcile `0/0/0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false.

## Límite legal

El texto demo/local de NDA que hoy existe en el prototipo no fue aprobado, versionado ni materializado como autoridad provider por este bloque. No se puede producir una aceptación durable válida hasta que el contenido exacto, versión y digest sean revisados humanamente y exista autoridad provider correspondiente.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 sigue sin puntaje hasta PASS integral.

## Siguiente bloque bloqueado por gate humano

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

Requiere revisión/confirmación humana del contenido legal TyA exacto, versión/digest y autorización de materialización si falta. Luego, y solo luego, una aceptación humana real provider-ACK y la reanudación Admin → un único Shopper nuevo. No iniciar request09 ni provider writes sin ese gate.
