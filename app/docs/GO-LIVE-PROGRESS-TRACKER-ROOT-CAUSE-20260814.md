# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-16 11:12 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS; subgates parciales no inflan el porcentaje.

| Iteración | Peso | Estado | Evidencia vigente |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | Gate vigente conservado |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md` |
| I3 — Shopper persistence + real Auth continuity | 25 | 0/25, EN CURSO | Histórico PASS congelado; V0.4 materialización REAL DEV PASS 4/4; runtime source wired; deploy DEV + aceptación humana + Admin/new Shopper pendientes |
| I4 — Phase A operational flows | 25 | 0/25, NO INICIAR | Solo después de I3 PASS |
| I5 — final go-live validation | 15 | 0/15, NO INICIAR | Solo después de I4 PASS |

**35% completado / 65% pendiente.**

## I3 — no repetir

Historical exact Shopper PASS run `31906391682`; reset histórico consumido; `passwordResets=0`, cero credential access/reconcile/recovery. Request08 run `31909354336` / job `95071998299` consumido/no rerun.

Request V0.4 `i3-legal-v04-dev-20260816-01` también consumido/no rerun/no automatic retry.

## I3 — materialización REAL DEV

Source lock prevalente:
`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`.

Gate autorizado: `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Run `31961266066`; job `95199496314`; validación `95199496265`; `PASS_COMMITTED_READBACK`.

- Firestore writes `4` exactos create-only;
- legalProfile `1`;
- Provider Registry `1`;
- legalContent/version `2`;
- digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`;
- legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- deploy `0`, merge=false, producción=false.

Evidencia: `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.

## I3 — runtime source

Proveedor legal/read model + UI humana quedaron wired en fuente al DEV protegido, reutilizando servicio/rewrite existentes. Production entrypoint no conectado. No `/app/modules` ni `/app/core` changes por este bloque.

La aceptación requiere texto completo + dos casillas no premarcadas + clic explícito; no hay aceptación automática. El write del receipt permanece deshabilitado hasta gate de deploy DEV separado.

## Gate canónico post-wiring

HEAD `c6e1e55d581f3eb15fc5bf430de4adb2de4e51ca`, run push `31961999583`: gates técnicos I1/I2/frozen I3/durable legal/publication/V0.4 PASS; único fallo documental `DURABLE_PLAN_NOT_INDEXED` en current checkpoint. El índice fue reconciliado restaurando `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`; no se repite materialización.

## Counsel / no-code

Counsel GT/HN permanece `deferred_post_golive`, no aprobado, y no bloquea la ruta interina. Perfil mutable provider-authoritative → snapshot inmutable → render/digest → receipt humano. Rebranding no reescribe aceptación histórica.

## Pendiente ruta crítica I3

1. gate `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`;
2. deploy/update únicamente DEV del servicio/Hosting existente;
3. readback de current legal desde browser DEV autenticado;
4. Paula realiza aceptación humana;
5. exactamente un receipt legalAcceptance ligado a identidad/version/digest + provider ACK;
6. reload/new-tab/readback de aceptación;
7. nueva continuación I3 Admin/new Shopper sin request08;
8. Auth + claims + membership + profile/shopper + crosswalk exactos del Shopper nuevo;
9. login/reload/new-tab/segundo contexto del Shopper nuevo.

Counsel GT/HN/X queda post-go-live.

Hasta cierre integral, I3 permanece `0/25` y GO-LIVE **35% completado / 65% pendiente**.

## Gate actual

`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

No autoriza aceptación automática ni bootstrap V0.4 otra vez. Sin merge/producción.
