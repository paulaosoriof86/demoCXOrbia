# ACADEMIA — Addendum C6 IAM ADMIN credential not available

## Aprendizaje reusable

Una autorización válida no implica que el carril tenga una identidad administrativa disponible. El preflight debe distinguir:

```text
autorización=PASS
source lock=PASS
claim único=PASS
credencial administrativa=NO DISPONIBLE
ejecución GCP=NO INICIADA
```

Este orden evita intentar autenticación o escrituras con una cuenta inadecuada y preserva least privilege.

## Clasificación

```text
ADMIN_CREDENTIAL_NOT_AVAILABLE=true
GCP_AUTHENTICATION=false
IAM_WRITE=false
PROVIDER_DATA_READ=false
DEPLOY=false
STOP_RETRY=true
```
