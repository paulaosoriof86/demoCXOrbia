# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-16 10:38 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS; subgates parciales no inflan el porcentaje.

| Iteración | Peso | Estado | Evidencia vigente |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | Gate vigente conservado |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md` |
| I3 — Shopper persistence + real Auth continuity | 25 | 0/25, EN CURSO | Histórico PASS congelado; legal durable source PASS; V0.4 interina creada; counsel diferido no bloqueante; provider materialization + aceptación humana + Admin/new Shopper pendientes |
| I4 — Phase A operational flows | 25 | 0/25, NO INICIAR | Solo después de I3 PASS |
| I5 — final go-live validation | 15 | 0/15, NO INICIAR | Solo después de I4 PASS |

**35% completado / 65% pendiente.**

## I3 — evidencia acumulativa que NO se repite

Historical exact Shopper PASS: run `31906391682`. Reset histórico consumido; toda continuación `passwordResets=0`, sin credential access/reconcile/recovery histórico.

Request08: run `31909354336`, job `95071998299`, STOP `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Consumido, no rerun.

## I3 — autoridad legal durable

Source `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Receipt exact-identity/versioned/human-only/provider-ACK y read model fail-closed preparados; provider IO real 0.

## I3 — decisión V0.4 interina 2026-08-16

Paula decidió no detener el go-live por indisponibilidad temporal de counsel. La revisión profesional GT/HN se conserva como pendiente post-go-live y **no se declara aprobada**.

Vigentes:
- `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`;
- `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`;
- `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.

La V0.4 usa lenguaje conservador, no muestra marcadores de revisión al usuario y conserva todos los asuntos GT/HN/X en un registro separado. Counsel puede producir una versión posterior; un cambio material debe evaluarse para reaceptación.

## No-code/rebranding

`perfil mutable provider-authoritative → snapshot público inmutable → render UTF-8/LF → SHA-256 post-render → aceptación humana por legalVersion/contentDigest`.

Los valores concretos TyA no se hardcodean. Rebranding, contacto u otra edición posterior no reescriben un acuerdo histórico.

## Pendiente ruta crítica I3

1. resolver snapshot V0.4 con valores públicos vivos del tenant;
2. materializar legalContent/version y perfil legal en `cxorbia-backend-dev` bajo un gate exacto;
3. habilitar read model durable en runtime;
4. aceptación exclusivamente humana con actor autenticado + provider ACK;
5. crear nueva continuación I3, no rerun request08;
6. Admin crea/edita un único Shopper nuevo;
7. Auth + claims + membership + profile/shopper + crosswalk exactos;
8. provider readback + login/reload/new-tab/segundo contexto;
9. cero fuzzy, otras identidades, resets históricos, HR/Rules/Storage/Make/Gemini/pagos fuera de gate.

Counsel GT/HN/X queda post-go-live y no bloquea esta ruta interina.

Hasta cierre integral, I3 permanece `0/25` y GO-LIVE **35/65**.

## Gate actual

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`

Este gate no autoriza aceptación automática. La persona autenticada debe aceptar la versión publicada desde UI humana.
