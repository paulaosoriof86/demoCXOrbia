# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 16:15 -06:00  
**Estado vigente:** `PHASE_A_GO_LIVE_35__I3_5C_1_PERIOD_INDEPENDENT_IDENTITY_ROLL_FORWARD_SOURCE_PASS__CURRENT_TARGET_MATERIALIZATION_PENDING__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

PASS/frozen y prohibido reprocesar: Historical Shopper `31906391682`, TARGET_B Admin `32049054855`, request08, HR 15/660, Finance V2/historical, I3.1/.2/.3/.4/.6/.7 y legal durable V0.4.

Source lock actual:
`app/docs/SOURCE-LOCK-I3-5C-1-PERIOD-INDEPENDENT-IDENTITY-ROLL-FORWARD-SOURCE-PASS-20260817.md`.

## Identidad — causa sistémica corregida en source

El problema ya no se aborda por mes ni por shopper histórico.

Se implementó un patrón reusable CXOrbia:

- `app/adapters/cxorbia-identity-roll-forward-v1.js`;
- `backend/contracts/cxorbia-identity-roll-forward-v1.json`;
- `tools/qa/cxorbia-identity-roll-forward-gate.mjs`;
- loader protegido en `app/core/backend-config-preview-dev.js`.

Regla canónica: un vínculo autoritativo vive en `tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}` y **no contiene el período como scope de identidad**.

Una vez materializado con autoridad válida, el mismo vínculo resuelve agosto, septiembre y cualquier período posterior sin nueva adjudicación ni nueva Auth.

El resolver es multi-tenant y multi-proyecto:

- aísla por tenant;
- distingue sourceSystem;
- admite vínculo project-specific o tenant-wide `*` según la naturaleza de la fuente;
- no permite fuga entre tenants ni proyectos;
- conflicto o ausencia = fail-closed/review.

No existe hardcode reusable de TyA, Cinépolis, agosto o septiembre.

Gate source local: `PASS_CXORBIA_IDENTITY_ROLL_FORWARD_PERIOD_INDEPENDENT` con agosto, septiembre, 2027, aislamiento tenant y project scope.

## Qué sigue pendiente

I3.5B ya demostró que el target actual no tiene autoridad provider exacta ni `shopperIdentityLinks` materializados. El gate está consumido y no se repite.

El mecanismo anti-recurrencia ya está implementado, pero falta resolver **una sola vez** el vínculo actual:

`I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION`.

Ese bloque requiere gate provider separado, máximo un upsert idempotente, provider ACK/readback y prueba del mismo vínculo en agosto + fixture septiembre sin crear un segundo link.

## Alta de Shopper desde Administración

El contrato reusable exige que un Shopper nuevo cierre:

`Auth → claims → membership → profile/shopper → identity link authorityType=platform_created → provider ACK/readback`.

Ese identity link es period-independent. No se vuelve a crear al cambiar de mes.

## Qué NO debe tocar Claude ahora

- no rediseñar `/app/modules` ni `/app/core`;
- no crear lógica específica por mes/tenant/proyecto;
- no fusionar identidad por nombre, email, teléfono, WhatsApp, username o shopperCode;
- no volver a pedir login/reset/recovery del Historical Shopper;
- no crear una candidata nueva;
- no convertir `periodKey` en parte de la identidad canónica;
- no duplicar `shopperIdentityLinks` por cada período;
- no representar Cinépolis como lógica global; es proyecto configurable normal.

## Impacto frontend futuro

Solo si se expone revisión de identidad en UI:

- mostrar tenant/proyecto/sourceSystem y estado de autoridad;
- una adjudicación debe ser reutilizable entre períodos;
- una review no debe duplicarse mes a mes;
- conflicto debe quedar visible y fail-closed;
- nunca mostrar PII como criterio automático de matching.

## Progreso / siguiente bloque

Formal: **35% / 65%**. El score no sube hasta I3.11.

Operativamente I3.5C-1 quedó PASS. Falta I3.5C-2; después, si PASS, continuar directamente I3.8→I3.11 bajo sus gates propios.

PR #7 permanece draft/open/no merge. Sin deploy, merge ni producción por este bloque source-only.
