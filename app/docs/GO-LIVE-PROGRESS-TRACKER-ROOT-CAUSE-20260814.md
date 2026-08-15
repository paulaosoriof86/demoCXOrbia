# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-15 17:31 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS; subgates parciales no inflan el porcentaje.

| Iteración | Peso | Estado | Evidencia vigente |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | Gate vigente conservado |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md` |
| I3 — Shopper persistence + real Auth continuity | 25 | 0/25, EN CURSO | Histórico PASS congelado; provider legal source-only PASS; draft legal V0.1 preparado; aprobación/materialización/aceptación + Admin/new Shopper pendientes |
| I4 — Phase A operational flows | 25 | 0/25, NO INICIAR | Solo después de I3 PASS |
| I5 — final go-live validation | 15 | 0/15, NO INICIAR | Solo después de I4 PASS |

**35% completado / 65% pendiente.**

## I3 — evidencia acumulativa que NO se repite

Historical exact Shopper PASS: run `31906391682`. UID/claims/profile/membership/crosswalk/history y login real preservados. Credential reset histórico ya consumido; `passwordResets=0` en toda continuación. No historical credential access/reconcile/recovery.

Request08: run `31909354336`, job `95071998299`, STOP fail-closed `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Request consumido, no rerun.

## I3 — avance source-only durable legal

Contratos y provider wiring source-only finalizados en source final `0602d6ca0f64280222a4b1522b36f3be77c65c87`.

Gate canónico push `31913700755` / job `95082399402`: SUCCESS. Gate PR `31913704247` / `95082407608`: SUCCESS.

Este PASS no suma puntos I3 porque no representa todavía aceptación humana real, provider materialization ni el E2E Admin/new Shopper. Sí elimina la deuda estructural source-only: ya existe contrato de receipt durable exact-identity/versionado/human-only/provider-ACK y read model fail-closed preparado.

Provider credentials/reads/writes reales en ese bloque: `0/0/0`. Auth/Firestore/legal writes: `0/0/0`. Product entrypoint activation: `false`. Deploy/merge/production: `0/false/false`.

## I3 — contenido legal draft preparado

Con autorización explícita de Paula se creó `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md` en commit `7f67ee59bdf0d6de26b44a539f3f456a5a4e0445`.

Version draft: `tya-legal-bundle-v0.1-draft-20260815`. Incluye acuerdo marco, privacidad, confidencialidad, PI, anexos por rol y país y copy de aceptación humana. El draft está `NOT_APPROVED`; no existe materialización provider ni aceptación. Este avance documental **no suma puntos** I3.

## Próximo criterio de cierre I3

Debe ocurrir, bajo autorización explícita y sin tocar histórico:

1. completar y aprobar humanamente el contenido legal TyA exacto;
2. asignar versión final inmutable y digest SHA-256 final;
3. materialización provider-authoritative solo si está autorizada y todavía falta;
4. aceptación legal exclusivamente humana, con provider ACK durable;
5. Admin crea y edita un único Shopper nuevo;
6. Auth + claims + membership + profile/shopper + crosswalk exactos;
7. provider readback;
8. login Shopper nuevo + reload + new-tab + segundo contexto;
9. cero fuzzy matching, otros usuarios, password reset histórico o providers prohibidos.

Hasta que todo lo anterior pase integralmente, I3 permanece `0/25` y el go-live formal permanece **35% completado / 65% pendiente**.

## Datos humanos pendientes del draft

Identidad contractual TyA por país, canales legales/privacidad/incidentes, retención, proveedores activos, foro, titular/licenciante CXOrbia, política de datos bancarios/documentos y reglas de grabaciones/geolocalización.

## Gate de write siguiente

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

No abrirlo hasta que el contenido exacto haya sido aprobado humanamente y tenga versión/digest final.
