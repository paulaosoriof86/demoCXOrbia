# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-16 10:38 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__COUNSEL_DEFERRED_NONBLOCKING__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

Shopper histórico I3 PASS congelado run `31906391682`; no repetir reset/recovery/reconcile ni acceder a credencial histórica; continuaciones `passwordResets=0`.

Request08 `31909354336` / `95071998299`: STOP antes de Alta por `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; consumido/no rerun.

## Backend legal preparado

Vigentes:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — perfil mutable/no-code;
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json` — snapshot público inmutable;
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json` — receipt humano durable;
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json` — bootstrap DEV exacto;
- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs` — materialización create-only/readback;
- `app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js`;
- `app/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js` — aún no product-wired.

Regla reusable:
`perfil editable provider-authoritative → snapshot público inmutable → render canónico → SHA-256 post-render → aceptación humana por legalVersion/contentDigest`.

## Counsel y V0.4

Counsel GT/HN queda **diferido post-go-live**, no cancelado ni marcado como aprobado. V0.4 es la candidata interina vigente:
`app/docs/CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.

Registro posterior:
`app/docs/PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.

Source lock técnico actual:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.

No presentar V0.4 como revisada por abogado.

## Materialización provider — SOURCE PASS

Preparado un bootstrap DEV de exactamente cuatro documentos:
1. legal profile current;
2. Provider Registry `firebase-google-core`;
3. legalContent current;
4. versión legal inmutable V0.4.

Writes futuros máximos: Firestore `4`; legalAcceptance/Auth/passwordResets/historical `0`.

El provider rechaza placeholders, falso counsel, domicilio restringido público, overwrite/collision y budget drift. Readback provider preparado.

CI canónico del HEAD técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: run `31959900456`, job `95196342385`, `SUCCESS`, incluido V0.4 materialization provider source.

## Command boundary corregido

`app/adapters/cxorbia-command-adapter-v1.js` ahora permite `legal.acceptance.record` como comando **self-scoped** para cualquier rol autenticado únicamente si existe confirmación humana explícita y prohibición de aceptación automática. No se ampliaron otros writes de Shopper/Cliente. El provider sigue derivando UID desde el ID token verificado.

## Rebranding y no-code

No usar `CXOrbia` ni `Gravicentra` como nombre contractual rígido. `platform.displayName` es dinámico; marca visible, registro marcario y titular/licenciante son objetos distintos.

Todos los valores TyA pertenecen solo a ese tenant y deben venir de provider authority, no de runtime constants: operador, identificación tributaria, contacto, dirección pública, países, retención, controversias, providers, branding/licenciante y evidencias por proyecto.

## Ajustes frontend futuros por archivo/módulo — NO parchear desde backend

1. `app/modules/configuracion.js`: Legal y cumplimiento no-code; perfil mutable vs versiones publicadas; cero localStorage como autoridad.
2. `app/modules/administrabilidad.js`: auditoría y retiro de semántica demo/local solo tras provider real.
3. proyecto/wizard: Evidencias y privacidad configurable.
4. integraciones: Provider Registry.
5. marca: displayName/estado registral/licenciante separados.
6. gate legal: contenido completo/versionado, casillas no premarcadas, botón tras acción humana; nunca `#bnOk` como aceptación.

Mantener interfaz pública `CX.data`, login canónico y arquitectura modular aprobada.

## Academia / manuales

Después de provider real: configuración editable vs versión publicada inmutable; aceptación humana; reaceptación material; evidencias por proyecto; providers reales; rebranding; datos restringidos; `counsel pendiente` ≠ `aprobado`.

## Pendiente real

1. bajo gate exacto, resolver/renderizar snapshot público V0.4;
2. materializar cuatro documentos en `cxorbia-backend-dev`;
3. provider readback/digest;
4. wiring/read model runtime DEV sin localStorage authority;
5. persona autenticada acepta humanamente;
6. nueva continuación I3 Admin/new Shopper, sin request08;
7. login/reload/new-tab/segundo contexto;
8. counsel GT/HN posterior.

Gate actual:
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

PR #7 permanece draft/open/no merge. Sin provider write/deploy/producción todavía.
