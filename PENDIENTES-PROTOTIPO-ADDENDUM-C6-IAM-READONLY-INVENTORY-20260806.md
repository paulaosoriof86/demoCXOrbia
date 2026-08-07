# PENDIENTES PROTOTIPO — C6 IAM read-only inventory

```text
decision=ADMIN_IDENTITY_CREATION_REQUIRED
requiredIdentity=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

No reutilizar Default Compute ni Firebase Admin SDK. La identidad runtime debe crearse administrativamente, sin roles de proyecto, provider, Firebase, Auth, Firestore, Storage, HR, Cloud Build ni privilegios administrativos.

No reutilizar request, workflow, run `31133025584` ni job `92726136842`.
