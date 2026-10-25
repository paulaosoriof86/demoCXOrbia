# ACADEMIA — Addendum C6 SKIP13 provider read-only V2 HOLD

## Aprendizaje reusable

Una clasificación de migración como `PRESERVE_NO_AUTH` no debe usarse como prueba de inexistencia de acceso efectivo. El acceso debe verificarse contra estado Auth, provider de login, claims de tenant/proyecto/rol y el identificador técnico del perfil.

En esta adjudicación:

```text
13/13 perfiles resueltos
8 perfiles con acceso efectivo
9 candidatos Auth efectivos
0 writes
```

El caso bloqueante muestra además por qué un perfil histórico puede tener más de un principal Auth efectivo y exige adjudicación antes de una migración masiva.

## Clasificación

```text
READ_ONLY=true
RAW_PII_EXPORTED=false
IAM_OR_PROVIDER_WRITE=false
DECISION=HOLD_C6_SKIP13_V2_UNPLANNED_EFFECTIVE_ACCESS_FOUND
```
