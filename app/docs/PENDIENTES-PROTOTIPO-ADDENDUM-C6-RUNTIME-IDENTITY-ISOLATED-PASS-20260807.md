# PENDIENTES PROTOTIPO — Addendum C6 runtime identity isolated PASS

## Pendiente inmediato

Retirar manualmente el rol temporal:

```text
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
role=roles/iam.securityReviewer
```

y ejecutar readback read-only que confirme su ausencia.

## Después

```text
1. nuevo deploy DEV del direct trusted runner
2. SKIP13 read-only final
3. ejecución Auth sobre plan congelado de 340 filas
4. smoke acumulativo Admin/Operaciones, Shopper y Cliente
5. validación humana
6. cutover/promoción autorizada
```

No reutilizar el request `c6-iam-runtime-isolation-readonly-final-20260807-01`, workflow V2, run `31180615131` ni job `92872746963`.
