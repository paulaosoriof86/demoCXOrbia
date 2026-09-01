# ACADEMIA — Addendum C6 IAM post-creation readback

## Aprendizaje reusable

Una lectura que devuelve un array vacío después de un `PERMISSION_DENIED` no demuestra ausencia. La validación correcta debe separar:

```text
value=0 with readable source
```

de:

```text
value=0 placeholder with unreadable source
```

En este bloque la identidad sí fue comprobada, pero llaves y bindings no pudieron verificarse terminalmente.

```text
identityDescribe=PASS
keysRead=DENIED
serviceAccountPolicyRead=DENIED
projectPolicyRead=DENIED
decision=STOP_RETRY_READBACK_INCOMPLETE
```
