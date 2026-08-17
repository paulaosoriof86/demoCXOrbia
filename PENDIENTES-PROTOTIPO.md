# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-17 16:15 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_5C_1_PERIOD_INDEPENDENT_IDENTITY_ROLL_FORWARD_SOURCE_PASS__I3_5C_2_PENDING__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR/workflow. I1/I2 cerradas. I3 continúa con una única frontera real de identidad: materializar una sola autoridad durable para el target actual; el mecanismo para que no se repita por período ya quedó implementado en source.

Tracker: `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`.  
Source lock: `app/docs/SOURCE-LOCK-I3-5C-1-PERIOD-INDEPENDENT-IDENTITY-ROLL-FORWARD-SOURCE-PASS-20260817.md`.  
Evidencia: `app/docs/evidence/ITERATION3-I3-5C-IDENTITY-ROLL-FORWARD-SOURCE-LATEST.json`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

- I1/I2.
- Historical Shopper run `31906391682`; reset único consumido; no credential access/reconcile/recovery.
- TARGET_B Admin `32049054855`.
- Request08.
- HR 15/660; no reimport.
- Finance V2/historical; no rebuild.
- I3.5B run `32070767910` / job `95513264398`; consumido/no rerun.
- Legal durable V0.4; no autoaccept.

## Ya resuelto en source

- Identidad exacta no depende del período.
- Contrato reusable multi-tenant/multi-project.
- Link path: `tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}`.
- `periodKey` prohibido como scope de identidad.
- Project-specific scope y tenant-wide scope diferenciados.
- Ausencia/conflicto = fail-closed/review.
- Nombre/email/teléfono/WhatsApp/username/shopperCode no son autoridad única.
- Alta desde plataforma exige identity link `platform_created` + provider ACK.
- Protected DEV queda preparado para leer vínculos autorizados y alimentar el composer exacto.
- Gate source PASS para agosto, septiembre y 2027; tenant isolation y project isolation PASS.

## Pendiente ruta crítica I3

1. `I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION`;
2. usar solo el target actual;
3. autoridad = tenant adjudication explícita o nueva fuente provider exacta independiente;
4. máximo un upsert idempotente;
5. provider ACK/readback obligatorio;
6. probar agosto y fixture septiembre con el mismo link, sin segundo vínculo;
7. cerrar I3.5;
8. I3.8 Admin create/update un Shopper nuevo: Auth + claims + membership + profile + period-independent identity link + ACK;
9. I3.9 login/reload/new-tab/segundo contexto del Shopper nuevo;
10. I3.10 KPI/state semantics;
11. I3.11 integral same-build close → 60% formal.

## Multi-proyecto / multi-tenant

Cinépolis es un proyecto configurable normal del tenant actual. No debe existir lógica reusable basada en nombre de tenant, nombre de proyecto, país, mes o período. El identity link solo usa scope técnico tenant/project/sourceSystem.

## Claude / prototipo

No parchear UI desde backend. Futuro review UI, si existe, debe deduplicar por identidad/source scope y no por período. Debe mostrar conflicto de forma fail-closed y no inferir por PII.

## Acción siguiente

`I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION` bajo gate provider separado.

Sin autorización vigente para ese write. Sin merge/producción.
