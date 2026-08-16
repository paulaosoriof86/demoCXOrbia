# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-16 12:18 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS; subgates parciales no inflan el porcentaje.

| Iteración | Peso | Estado | Evidencia vigente |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | Gate vigente conservado |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md` |
| I3 — Shopper persistence + real Auth continuity | 25 | 0/25, EN CURSO | Histórico PASS congelado; V0.4 materialización PASS; runtime + Hosting DEV deploy PASS; aceptación humana + Admin/new Shopper pendientes |
| I4 — Phase A operational flows | 25 | 0/25, NO INICIAR | Solo después de I3 PASS |
| I5 — final go-live validation | 15 | 0/15, NO INICIAR | Solo después de I4 PASS |

**35% completado / 65% pendiente.**

## I3 — no repetir

Historical Shopper run `31906391682` PASS congelado; reset histórico consumido; `passwordResets=0`; cero credential access/reconcile/recovery. Request08 `31909354336` / `95071998299` consumido/no rerun. Bootstrap V0.4 `i3-legal-v04-dev-20260816-01` consumido/no retry. Deploy request `i3-legal-v04-runtime-dev-20260816-01` consumido/no retry.

## Materialización V0.4 DEV — PASS

Run `31961266066`; job `95199496314`; validación `95199496265`; `PASS_COMMITTED_READBACK`. Firestore `4` create-only = legalProfile `1` + Provider Registry `1` + legalContent/version `2`; legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`.

## Runtime + Hosting DEV — PASS

Source lock actual:
`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md`.

Gate ejecutado: `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Run `31963932862`; job `95206055703`; `SUCCESS`.

- Cloud Run deploy `1`;
- Hosting deploy `1`;
- revision `cxorbia-live-hr-dev-00010-n78`;
- DEV root `https://cxorbia-backend-dev.web.app`;
- legalAcceptance writes durante deploy `0`;
- acceptance count `0 → 0`;
- Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- merge=false;
- producción=false.

Hallazgo previo corregido: el Dockerfile no empaquetaba `legal-runtime.mjs` ni su provider aunque `server.mjs` lo importaba. Se corrigió antes de construir la imagen; no hubo deploy defectuoso previo por esta causa.

## Counsel / no-code

Counsel GT/HN permanece `deferred_post_golive`, no aprobado. Perfil mutable provider-authoritative → snapshot inmutable → render/digest → receipt humano. Rebranding no reescribe aceptación histórica.

## Pendiente ruta crítica I3

1. `HUMAN_PAULA_LEGAL_ACCEPTANCE_UI_CLICK` en el DEV protegido;
2. provider ACK + readback del receipt exact identity/version/digest;
3. reload/new-tab confirmando persistencia;
4. nueva continuación I3 Admin/new Shopper, sin request08;
5. Auth + claims + membership + profile/shopper + crosswalk exactos del Shopper nuevo;
6. login/reload/new-tab/segundo contexto del Shopper nuevo.

Counsel GT/HN/X queda post-go-live.

Hasta cierre integral, I3 permanece `0/25` y GO-LIVE **35% completado / 65% pendiente**.

## Acción actual

`HUMAN_PAULA_LEGAL_ACCEPTANCE_UI_CLICK`.

No aceptación automática, no rerun de bootstrap/deploy/request08, sin merge/producción.
