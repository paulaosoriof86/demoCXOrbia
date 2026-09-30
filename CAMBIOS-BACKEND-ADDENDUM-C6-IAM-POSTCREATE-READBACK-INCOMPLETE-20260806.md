# CAMBIOS BACKEND — C6 IAM post-creation readback

La identidad runtime fue confirmada existente y habilitada:

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
uniqueId=112507526829412676643
```

La lectura de llaves, bindings directos y roles de proyecto fue denegada por permisos insuficientes.

```text
decision=STOP_RETRY_READBACK_INCOMPLETE
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
fingerprintStatus=PROVISIONAL_INCOMPLETE_READBACK
```

No hubo IAM writes, deploy, provider reads, SKIP13, merge ni producción.
