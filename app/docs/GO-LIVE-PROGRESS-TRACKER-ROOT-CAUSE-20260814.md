# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-15 20:05 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS; subgates parciales no inflan el porcentaje.

| Iteración | Peso | Estado | Evidencia vigente |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | Gate vigente conservado |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md` |
| I3 — Shopper persistence + real Auth continuity | 25 | 0/25, EN CURSO | Histórico PASS congelado; legal durable source PASS; V0.3 counsel package + immutable publication snapshot source PASS; revisión/aprobación/materialización/aceptación + Admin/new Shopper pendientes |
| I4 — Phase A operational flows | 25 | 0/25, NO INICIAR | Solo después de I3 PASS |
| I5 — final go-live validation | 15 | 0/15, NO INICIAR | Solo después de I4 PASS |

**35% completado / 65% pendiente.**

## I3 — evidencia acumulativa que NO se repite

Historical exact Shopper PASS: run `31906391682`. Reset histórico consumido; toda continuación `passwordResets=0`, sin credential access/reconcile/recovery histórico.

Request08: run `31909354336`, job `95071998299`, STOP `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Consumido, no rerun.

## I3 — autoridad legal durable

Source `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Receipt exact-identity/versioned/human-only/provider-ACK y read model fail-closed preparados; provider IO real 0.

## I3 — legal no-code V0.3 source-only PASS

Bloque vigente:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — perfil mutable no-code;
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json` — publicación inmutable;
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json` — receipt por versión/digest;
- `CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`;
- `PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`;
- source lock `SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md`.

Regla cerrada:
`perfil mutable → snapshot público inmutable → render UTF-8/LF → SHA-256 post-render → aceptación humana ligada a legalVersion/contentDigest`.

Esto preserva no-code y rebranding sin reescribir aceptaciones históricas. Placeholders no pueden publicarse; domicilio restringido no se autopublica; provider disabled no figura como receptor actual.

Gate source: HEAD `768a1b43c10a054a254cfc2bd295aacdeae64c92`; workflow `31921002582`; job `95100754570`; SUCCESS, incluido `Verify I3 immutable no-code legal publication snapshot source contract`.

V0.3 sigue `NOT_APPROVED / NOT_PUBLISHED`. Este PASS **no suma puntos** I3.

## Pendiente humano antes de provider write

1. abogado GT resuelve `GT-01..GT-08`;
2. revisión HN resuelve `HN-01..HN-06`;
3. revisión transversal resuelve `X-01..X-06`;
4. incorporar cambios y eliminar `LEGAL_REVIEW_REQUIRED`;
5. definir dirección pública/licenciante/arbitraje/privacidad-retención/evidencias/proveedores;
6. generar versión publicable;
7. aprobación humana expresa de Paula;
8. luego, bajo gate separado, snapshot/provider materialization y SHA-256 final;
9. aceptación exclusivamente humana con provider ACK;
10. Admin crea/edita un único Shopper nuevo;
11. Auth + claims + membership + profile/shopper + crosswalk exactos;
12. provider readback + login/reload/new-tab/segundo contexto.

Hasta cierre integral, I3 permanece `0/25` y GO-LIVE **35/65**.

## Gate actual

`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`

Gate posterior, todavía no abierto:
`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`
