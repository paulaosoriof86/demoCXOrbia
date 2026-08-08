# ACADEMIA — Addendum C6 reviewer revoked PASS

Caso reusable de least privilege temporal:

1. Se otorgó una capacidad de lectura IAM únicamente para producir evidencia verificable.
2. La identidad runtime permaneció sin roles, bindings directos ni llaves administradas por usuario.
3. Tras completar la verificación, el permiso temporal se retiró.
4. El readback posterior confirmó que las capacidades sensibles IAM dejaron de ser efectivas.

```text
PASS_ISOLATED_RUNTIME_IDENTITY
PASS_TEMP_SECURITY_REVIEWER_EFFECTIVELY_REVOKED
```

Esto separa correctamente control-plane, runtime y privilegios temporales de auditoría.
