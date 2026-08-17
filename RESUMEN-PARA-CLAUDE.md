# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 16:31 -06:00  
**Estado vigente:** `PHASE_A_GO_LIVE_35__I3_1_TO_7_PASS__I3_8_NEXT__PERIOD_INDEPENDENT_IDENTITY_PROVIDER_BACKED__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

PASS/frozen y prohibido reprocesar: Historical Shopper `31906391682`, TARGET_B Admin `32049054855`, request08, HR 15/660, Finance V2/historical, I3.1→I3.7 y legal durable V0.4.

Source lock actual:
`app/docs/SOURCE-LOCK-I3-5C2-PERIOD-INDEPENDENT-LINK-PASS-I3-5-I3-6-CLOSED-20260817.md`.

## Identidad — I3.5 cerrado

I3.5C-2 terminó PASS provider-backed:

- run `32076682895`;
- job `95531280631`;
- `shopperIdentityLinks` `0→1`;
- identityLinkId `irl_3ed1b9a65d36c5873c1306bae1621e9d`;
- authority `tenant_adjudication`;
- provider ACK/readback PASS;
- agosto PASS;
- septiembre PASS;
- mismo canonical PASS;
- mismo link PASS;
- segundo link `false`.

La identidad ya no es mensual. El scope `cinepolis` está almacenado como dato provider del vínculo actual, no como lógica reusable. El contrato general sigue multi-tenant/multi-project y permite scope project-specific o tenant-wide según la fuente.

I3.5 = **PASS/CLOSED**. I3.6 = **CLOSED/FROZEN PASS**. No rerun de I3.5B/I3.5C-2 ni Historical Shopper.

## Qué NO debe tocar Claude

- no rediseñar `/app/modules` ni `/app/core`;
- no crear reglas por mes, tenant o nombre de proyecto;
- no duplicar crosswalks por período;
- no inferir identidad por nombre/email/teléfono/WhatsApp/username/shopperCode;
- no volver a pedir credencial/reset/recovery del Historical Shopper;
- no tratar Cinépolis como lógica global;
- no cambiar `CX.data` como interfaz.

## Siguiente bloque

I3.8: `ADMIN_CREATE_UPDATE_ONE_NEW_SHOPPER_PROVIDER_BACKED_PERIOD_INDEPENDENT_IDENTITY`.

Contrato requerido:
`Admin create/update → exact validation → Auth → claims → membership → profile/shopper → identity link authorityType=platform_created → provider ACK/readback`.

El identity link del Shopper nuevo también debe ser period-independent y respetar tenant/project scope. I3.8 requiere gate provider separado.

Después: I3.9 real E2E → I3.10 KPI/state semantics → I3.11 same-build integral close. Si I3 integral pasa, el formal sube a 60%.

PR #7 permanece draft/open/no merge. Producción intacta.
