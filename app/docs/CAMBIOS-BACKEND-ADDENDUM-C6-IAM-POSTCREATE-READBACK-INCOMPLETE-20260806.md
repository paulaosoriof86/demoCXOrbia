# CAMBIOS BACKEND — Addendum C6 IAM post-creation readback

## Archivos creados

- `.github/workflows/cxorbia-c6-iam-runtime-identity-postcreate-readonly-once-v1.yml` — temporal y retirado;
- `backend/config/c6-iam-runtime-identity-postcreate-readonly-request-v1.json` — consumido y deshabilitado;
- `backend/contracts/c6-runtime-identity-postcreate-verification-v1.json`;
- `app/docs/SOURCE-LOCK-C6-IAM-POSTCREATE-READBACK-INCOMPLETE-STOP-RETRY-20260806.md`.

## Resultado

```text
exists=true
enabled=true
uniqueId=112507526829412676643
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
fingerprintStatus=PROVISIONAL_INCOMPLETE_READBACK
decision=STOP_RETRY_READBACK_INCOMPLETE
```

Las verificaciones de llaves, bindings directos y roles de proyecto fueron denegadas por falta de permisos read-only. No hubo IAM writes, deploy ni provider reads.

## Clasificación

- Reusable CXOrbia: readback fail-close y fingerprint provisional.
- Exclusivo TyA: identidad runtime pendiente de cierre.
- Claude/prototipo: sin cambios frontend.
- Academia: distinción entre lectura denegada y valor cero.
- Sin impacto Claude: operación funcional preservada.
