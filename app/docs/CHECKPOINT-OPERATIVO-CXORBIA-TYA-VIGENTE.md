# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-15 17:31 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP_SAFE__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__LEGAL_DRAFT_V0_1_PREPARED__GO_LIVE_35__NO_PRODUCTION`

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

## Contenido legal — draft V0.1 preparado

Con autorización expresa de Paula se creó únicamente para revisión humana:
`app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`.

Versión draft: `tya-legal-bundle-v0.1-draft-20260815`.
Incluye acuerdo marco de uso/confidencialidad/datos/PI, anexos Shopper, staff/admin, Cliente y roles transversales, anexos Guatemala/Honduras, aviso resumido, copy de aceptación humana y matriz reusable de `legalContentId`/scope/audiencia.

El draft está marcado `NOT_APPROVED`; su hash identifica solo el texto de revisión y **no es** el `contentDigest` productivo. No se materializó `legalContents`, no se registró aceptación y no hubo provider IO ni cambios de runtime.

## Datos humanos que todavía faltan antes de aprobación

- identidad contractual exacta del Operador TyA en Guatemala;
- estructura/entidad contratante para Honduras;
- correos legal, privacidad e incidentes;
- tabla de retención;
- proveedores que estarán realmente activos en go-live;
- foro/resolución de controversias por país y tipo de relación;
- titular/licenciante contractual del software CXOrbia;
- política real de datos bancarios/documentos;
- reglas reales de grabaciones/geolocalización.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 sigue sin puntaje hasta PASS integral.

## Siguiente bloque

Revisión humana/completado del draft legal V0.1. Después de aprobar texto exacto, versión final y digest final, podrá solicitarse autorización específica para materialización provider-authoritative, una aceptación humana real y la reanudación Admin → un único Shopper nuevo bajo el gate `PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.

No iniciar request09, provider writes, deploy, merge ni producción antes de ese gate.
