# CAMBIOS BACKEND — C6 SKIP13 namespace mismatch STOP_RETRY

Run `31188368926` / job `92898589212` consumió una única adjudicación SKIP13 read-only y terminó `HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR` por `all_skip13_profile_ids_resolved:0`.

Se leyó únicamente el índice de 340 shopper document IDs (`profileIdIndexQueries=1`); Auth, claims y memberships no fueron leídos. Writes/deploy/merge/producción: 0.

Causa raíz: los SKIP13 `profileFp` usan namespace `deterministic-suffix-plan-profile`; el adjudicador usó erróneamente `shopper-collision-member-v1`.

Request consumido/deshabilitado en `3966dac8a42404f35245c474f975f696c9cb9f0e`. No segundo provider attempt.
