# PENDIENTES PROTOTIPO — ADDENDUM I3 REQUEST08 LEGAL GATE — 2026-08-15

Addendum vigente de `PENDIENTES-PROTOTIPO.md` para el delta request08.

## P0/P1 vivo localizado

### Aceptación legal no certificable cross-context

**Hallazgo:** request08 llegó a `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. El gate se comportó correctamente y bloqueó el flujo antes de Alta.

La fuente actual distingue el NDA/aceptaciones del prototipo como demo/local y el estado productivo como firmado/auditado. No está demostrado todavía un registro durable account-scoped que permita a un navegador/runner limpio saber que la persona ya aceptó una versión legal.

**Impacto:** I3 Admin/new Shopper no puede certificarse todavía sin resolver primero la persistencia legal durable. No corresponde pedir a Paula aceptar localmente el NDA como workaround de CI.

**Corrección esperada:** contrato backend reusable y read model durable; aceptación iniciada por persona; provider ACK; versionado y auditoría; estado ambiguo fail-closed.

**No hacer:** autoaceptar, force-click, esconder el modal, deshabilitar `.cx-ov`, tratar NDA como `#bnOk`, copiar aceptación entre identidades, deducir aceptación por nombre/email visual o guardar como simple localStorage productivo.

## P2/consistencia de prototipo

Existe además una superficie simple de configuración de NDA que muta `CX.BRAND.nda` en frontend, mientras Administración describe un modelo versionado/auditado. Claude deberá reconciliar la UX una vez que el backend durable esté definido, sin crear otra fuente de verdad paralela.

## Academia/manuales

Pendiente incorporar:
- primer acceso y consentimiento humano;
- versión legal vigente;
- cambio de versión y necesidad de nueva aceptación según contrato;
- fallo de ACK/persistencia;
- separación NDA vs novedades/banner;
- no confundir aceptación legal con certificación o curso.

## Prioridad y estado

Prioridad: **bloqueante para cerrar I3, no producción autorizada**.

GO-LIVE `35% / 65%`; I3 `0/25`.

Siguiente bloque: `I3_LEGAL_ACCEPTANCE_DURABLE_ACCOUNT_SCOPED_CONTRACT_AND_PRODUCTION_WIRING_SOURCE_ONLY`.
