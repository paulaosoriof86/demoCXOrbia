# ACADEMIA — C6 SKIP13 namespace mismatch

Hallazgo reutilizable: un fingerprint criptográficamente correcto no es interoperable si cambia su namespace semántico.

Caso C6:

```text
plan profile = deterministic-suffix-plan-profile
multi-auth profile = multi-auth-profile-v1
collision member = shopper-collision-member-v1
auth candidate = shopper-auth-candidate-v1
```

El adjudicador mezcló el namespace de collision member con el profile fingerprint del plan. El fail-close evitó escanear Auth/claims/memberships después de detectar 0/13 resoluciones sobre un baseline de 340 IDs.

Principio académico/documental: todo identificador pseudónimo debe declarar `namespace + algorithmVersion + sourceEntity` y los consumidores deben validar la equivalencia antes de usarlo como join key.
