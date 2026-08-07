# PENDIENTES PROTOTIPO — C6 SKIP13 namespace mismatch

## Cerrado

- Direct trusted runner DEV: PASS.
- Identidad runtime aislada: PASS.
- Reviewer temporal: revocado PASS.

## Pendiente vivo

1. Corregir source-only el namespace de `profileFp` del adjudicador SKIP13 a `deterministic-suffix-plan-profile`.
2. Declarar explícitamente en contrato:
   - `profileFingerprintNamespace=deterministic-suffix-plan-profile`;
   - `authCandidateFingerprintNamespace=shopper-auth-candidate-v1`;
   - prohibición de usar `shopper-collision-member-v1` como profile fingerprint SKIP13.
3. Agregar self-test cross-namespace.
4. Solo con PASS, ejecutar una nueva adjudicación SKIP13 read-only con nueva autorización.
5. Luego Auth 340, smoke multirrol, validación humana y cutover.

## No reusar

- request `c6-skip13-auth-access-adjudication-20260807-06`;
- run `31188368926`;
- job `92898589212`.

No se autoriza segundo provider attempt con el request consumido.
